// Funnel tracking hook for customer journey analytics

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('fid');
  if (!sessionId) {
    sessionId = 's_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('fid', sessionId);
  }
  return sessionId;
};

export const track = (step: string, productId?: string | null, source?: string | null): void => {
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
    track(step, prod, src);
  }
};

// Legacy alias for backwards compatibility
export const trackFunnel = track;
