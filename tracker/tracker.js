(function () {
  // Configurable backend URL. Checks:
  // 1. window.CF_API_URL
  // 2. Data attribute on script tag: <script src="tracker.js" data-api-url="..."></script>
  // 3. Fallback to http://localhost:5500
  let apiBaseUrl = 'http://localhost:5500';

  // Attempt to find configuration from script tag
  const currentScript = document.currentScript;
  if (currentScript && currentScript.getAttribute('data-api-url')) {
    apiBaseUrl = currentScript.getAttribute('data-api-url');
  } else if (window.CF_API_URL) {
    apiBaseUrl = window.CF_API_URL;
  }

  const EVENTS_API = `${apiBaseUrl.replace(/\/$/, '')}/api/events`;

  // Session ID Storage Key
  const SESSION_KEY = 'cf_session_id';

  // UUID generator (RFC4122 version 4 compliant)
  function generateUUID() {
    // Check if crypto.randomUUID is available (modern browsers)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    // Fallback generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Get or create session ID
  function getSessionId() {
    try {
      let sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem(SESSION_KEY, sessionId);
      }
      return sessionId;
    } catch (e) {
      // In case localStorage is blocked (e.g. incognito settings)
      console.warn('CausalFunnel Tracker: localStorage access denied. Generating transient session ID.');
      if (!window._cfTransientSessionId) {
        window._cfTransientSessionId = generateUUID();
      }
      return window._cfTransientSessionId;
    }
  }

  // Send event to backend safely
  function sendEvent(payload) {
    // Fail-safe fetch call
    fetch(EVENTS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // helps send the request even if the tab is closing/navigating away
    })
      .then((response) => {
        if (!response.ok) {
          console.warn('CausalFunnel Tracker failed to record event. Status:', response.status);
        }
      })
      .catch((error) => {
        // Fail gracefully to prevent any webpage breakage
        console.warn('CausalFunnel Tracker network error:', error.message);
      });
  }

  // Track page view event
  function trackPageView() {
    const payload = {
      sessionId: getSessionId(),
      eventType: 'page_view',
      pageUrl: window.location.pathname + window.location.search + window.location.hash,
      timestamp: new Date().toISOString(),
    };
    sendEvent(payload);
  }

  // Track click event
  function trackClick(e) {
    // Capture click coordinates relative to the page (absolute document coords)
    // pageX / pageY accounts for page scroll.
    const payload = {
      sessionId: getSessionId(),
      eventType: 'click',
      pageUrl: window.location.pathname + window.location.search + window.location.hash,
      timestamp: new Date().toISOString(),
      x: Math.round(e.pageX),
      y: Math.round(e.pageY),
    };
    sendEvent(payload);
  }

  // Initialize tracking
  function init() {
    // 1. Track initial page load page_view
    if (document.readyState === 'complete') {
      trackPageView();
    } else {
      window.addEventListener('load', trackPageView);
    }

    // 2. Track clicks globally
    document.addEventListener('click', trackClick, true);
    
    console.log('CausalFunnel Tracker initialized successfully.');
  }

  // Run initialization
  try {
    init();
  } catch (error) {
    console.error('Failed to initialize CausalFunnel Tracker:', error);
  }
})();
