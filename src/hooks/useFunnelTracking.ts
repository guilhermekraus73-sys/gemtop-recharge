// Funnel tracking hook for customer journey analytics

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('funnel_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('funnel_session', sessionId);
  }
  return sessionId;
};

interface TrackOptions {
  productId?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown>;
}

export const trackFunnel = async (step: string, options: TrackOptions = {}): Promise<void> => {
  const sessionId = getSessionId();
  const params = new URLSearchParams(window.location.search);
  
  try {
    await fetch('https://wzalbseskuzaieeogomm.supabase.co/functions/v1/track-funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        step: step,
        page_url: window.location.href,
        utm_source: options.source || params.get('utm_source') || null,
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
      })
    });
    console.log('[FUNNEL] Evento rastreado:', step);
  } catch (error) {
    console.error('[FUNNEL] Erro ao rastrear:', error);
  }
};

// Legacy alias for backwards compatibility
export const track = (step: string, productId?: string | null, source?: string | null): void => {
  trackFunnel(step, { productId, source });
};

// Auto-detect step from URL and track automatically
export const autoTrack = (productId?: string): void => {
  const url = window.location.href;
  const params = new URLSearchParams(window.location.search);
  
  // Detect step from URL
  let step: string | null = null;
  if (url.includes('checkout')) step = 'checkout';
  else if (url.includes('dados')) step = 'dados';
  else if (url.includes('pagamento')) step = 'pagamento';
  else if (url.includes('obrigado') || url.includes('sucesso')) step = 'comprou';
  
  // Get product from URL or use provided
  const prod = productId || params.get('produto') || null;
  
  // Get source from URL or referrer
  const src = params.get('utm_source') || 
              localStorage.getItem('utm_source') || 
              document.referrer || 
              null;
  
  if (step) {
    trackFunnel(step, { productId: prod, source: src });
  }
};
