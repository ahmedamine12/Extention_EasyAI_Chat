(function initPageDetectionHelpers(globalScope) {
  if (globalScope.EASYAI_PAGE_HELPERS) return;

  function isLoginOrAuthPage() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    const loginDomains = [
      'login.microsoftonline.com',
      'auth0.com',
      'okta.com',
      'onelogin.com',
      'sso.company.com',
      'login.company.com',
      'auth.company.com',
      'oauth.com',
      'oauth2.com'
    ];

    if (hostname.includes('accounts.google.com')) {
      const googleLoginPaths = [
        '/signin', '/signin/', '/login', '/login/', '/oauth', '/oauth/', '/oauth2', '/oauth2/',
        '/authorize', '/authorize/', '/connect', '/connect/', '/authenticate', '/authenticate/',
        '/signup', '/signup/', '/register', '/register/', '/password', '/password/', '/reset',
        '/reset/', '/forgot', '/forgot/', '/chooser', '/chooser/', '/accountchooser', '/accountchooser/'
      ];

      if (googleLoginPaths.some((path) => pathname.includes(path))) {
        return true;
      }

      if (url.includes('oauth') || url.includes('authorize') || url.includes('signin')) {
        return true;
      }

      return false;
    }

    const loginPaths = [
      '/signin', '/signin/', '/login', '/login/', '/auth', '/auth/', '/oauth', '/oauth/', '/oauth2',
      '/oauth2/', '/authorize', '/authorize/', '/connect', '/connect/', '/authenticate', '/authenticate/',
      '/signup', '/signup/', '/register', '/register/', '/password', '/password/', '/reset', '/reset/',
      '/forgot', '/forgot/'
    ];

    const loginKeywords = [
      'signin', 'login', 'auth', 'oauth', 'authorize', 'connect', 'authenticate', 'signup', 'register',
      'password', 'reset', 'forgot', 'connexion', 'se connecter', 's\'identifier', 'authentification'
    ];

    if (loginDomains.some((domain) => hostname.includes(domain))) {
      return true;
    }

    if (loginPaths.some((path) => pathname.includes(path))) {
      return true;
    }

    if (loginKeywords.some((keyword) => url.includes(keyword))) {
      if (hostname.includes('google.com') && !pathname.includes('/signin') && !pathname.includes('/oauth')) {
        return false;
      }
      return true;
    }

    const title = document.title.toLowerCase();
    if (loginKeywords.some((keyword) => title.includes(keyword))) {
      if (hostname.includes('google.com') && !pathname.includes('/signin') && !pathname.includes('/oauth')) {
        return false;
      }
      return true;
    }

    const loginFormSelectors = [
      'input[type="password"]',
      'form[action*="login"]',
      'form[action*="signin"]',
      'form[action*="auth"]',
      '.login-form',
      '.signin-form',
      '.auth-form',
      '#login',
      '#signin',
      '#auth'
    ];

    if (loginFormSelectors.some((selector) => document.querySelector(selector))) {
      if (hostname.includes('google.com') && !pathname.includes('/signin') && !pathname.includes('/oauth')) {
        return false;
      }
      return true;
    }

    return false;
  }

  globalScope.EASYAI_PAGE_HELPERS = {
    isLoginOrAuthPage
  };
})(globalThis);
