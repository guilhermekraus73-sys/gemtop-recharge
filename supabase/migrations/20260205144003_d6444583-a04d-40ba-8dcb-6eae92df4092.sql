-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles de usuário
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: usuários podem ver seus próprios roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Tabela de eventos do funil (para tracking em tempo real)
CREATE TABLE public.funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    step TEXT NOT NULL,
    page_url TEXT,
    country_code TEXT,
    city TEXT,
    device_type TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Policy: apenas admins podem ver eventos
CREATE POLICY "Admins can view funnel events"
ON public.funnel_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: qualquer um pode inserir eventos (tracking)
CREATE POLICY "Anyone can insert funnel events"
ON public.funnel_events
FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_funnel_events_created_at ON public.funnel_events(created_at DESC);
CREATE INDEX idx_funnel_events_step ON public.funnel_events(step);
CREATE INDEX idx_funnel_events_session ON public.funnel_events(session_id);

-- Tabela de vendas (preenchida pelo webhook do Stripe)
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_payment_intent_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    email TEXT,
    customer_name TEXT,
    amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    product_name TEXT,
    country_code TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    session_id TEXT,
    status TEXT NOT NULL DEFAULT 'succeeded',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Policy: apenas admins podem ver vendas
CREATE POLICY "Admins can view sales"
ON public.sales
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: serviço pode inserir vendas (webhook)
CREATE POLICY "Service can insert sales"
ON public.sales
FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX idx_sales_country ON public.sales(country_code);

-- Habilitar realtime para ambas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.funnel_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;