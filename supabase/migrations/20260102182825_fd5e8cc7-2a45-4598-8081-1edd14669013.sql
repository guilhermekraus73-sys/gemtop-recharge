-- Create table to track payment attempts for rate limiting
CREATE TABLE public.payment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  email TEXT,
  card_last4 TEXT,
  attempt_type TEXT NOT NULL DEFAULT 'payment', -- 'payment', 'blocked'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups by IP and time
CREATE INDEX idx_payment_attempts_ip_time ON public.payment_attempts (ip_address, created_at DESC);

-- Create index for email lookups
CREATE INDEX idx_payment_attempts_email_time ON public.payment_attempts (email, created_at DESC) WHERE email IS NOT NULL;

-- Create index for card last4 lookups
CREATE INDEX idx_payment_attempts_card_time ON public.payment_attempts (card_last4, created_at DESC) WHERE card_last4 IS NOT NULL;

-- Enable RLS (but allow public inserts from edge function with service role)
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

-- No public policies - only accessible via service role in edge functions

-- Function to clean old attempts (older than 1 hour)
CREATE OR REPLACE FUNCTION public.clean_old_payment_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM public.payment_attempts WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create a scheduled job to clean old attempts every hour (using pg_cron if available)
-- Note: This is optional and can be triggered manually or via a cron edge function