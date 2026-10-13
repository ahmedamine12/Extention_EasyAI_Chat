(function initPageDetectionHelpers(globalScope) {
  if (globalScope.EASYAI_PAGE_HELPERS) return;

  const LOGIN_DOMAINS = [
    'login.microsoftonline.com',
    'auth0.com',
    'okta.com',
    'onelogin.com',
    'oauth.com',
    'oauth2.com'
  ];

  // Whole path segments only: "/login" matches, "/author/jane" or "/connect-the-dots" do not.
  const LOGIN_SEGMENTS = new Set([
    'signin', 'sign-in', 'login', 'log-in', 'logon', 'auth', 'oauth', 'oauth2', 'authorize',
    'authenticate', 'signup', 'sign-up', 'register', 'password', 'reset', 'reset-password',
    'forgot', 'forgot-password', 'sso', 'connexion', 'connect', 'chooser', 'accountchooser'
  ]);

  const LOGIN_TITLE_RE = /\b(sign[ -]?in|log[ -]?in|log into|sign[ -]?up|connexion|se connecter|s'identifier|authentification)\b/;

  const AUTH_FORM_SELECTORS = [
    'form[action*="login"]', 'form[action*="signin"]', 'form[action*="auth"]',
    '.login-form', '.signin-form', '.auth-form', '#login', '#signin', '#auth'
  ];

  function isLoginOrAuthPage() {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const segments = pathname.split('/').filter(Boolean);

    if (LOGIN_DOMAINS.some((domain) => hostname === domain || hostname.endsWith('.' + domain))) {
      return true;
    }

    const pathLooksLikeAuth = segments.some((seg) => LOGIN_SEGMENTS.has(seg));

    if (hostname === 'accounts.google.com' || hostname.endsWith('.accounts.google.com')) {
      // Every Google account page is an auth surface except the account home itself.
      return pathLooksLikeAuth || /oauth|authorize|signin/.test(pathname + window.location.search.toLowerCase());
    }

    if (pathLooksLikeAuth) return true;

    // Softer signals (page title, form markers) only count when a password field is present,
    // so a blog post titled "How to log in to X" keeps its chat bubble.
    if (!document.querySelector('input[type="password"]')) return false;
    const title = String(document.title || '').toLowerCase();
    return LOGIN_TITLE_RE.test(title) || AUTH_FORM_SELECTORS.some((selector) => document.querySelector(selector));
  }

  globalScope.EASYAI_PAGE_HELPERS = {
    isLoginOrAuthPage
  };
})(globalThis);
