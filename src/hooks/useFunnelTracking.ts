// Funnel tracking hook for customer journey analytics

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('funnelSessionId');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('funnelSessionId', sessionId);
  }
  return sessionId;
};

export const trackFunnel = (step: string, productId?: string, source?: string): void => {
  const sessionId = getSessionId();
  
  fetch('https://wuoxjuirisedgpioqmmv.supabase.co/functions/v1/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      step: step,
      session_id: sessionId,
      product_id: productId || null,
      source: source || null
    })
  }).catch(err => console.error('Funnel tracking error:', err));
};

export const useFunnelTracking = (step: string, productId?: string) => {
  const source = new URLSearchParams(window.location.search).get('utm_source') || 
                 localStorage.getItem('utm_source') || 
                 null;
  
  // Track on mount
  if (typeof window !== 'undefined') {
    trackFunnel(step, productId, source || undefined);
  }
};
