(function (global) {
  var SPA_JS_CDN = 'https://cdn.jsdelivr.net/npm/@auth0/auth0-spa-js@2.24.1/dist/auth0-spa-js.production.js';
  var clientPromise = null;

  function rootUrl() {
    return document.querySelector('base')
      ? document.baseURI
      : new URL('./', window.location.href).href;
  }

  function rootPath(path) {
    return new URL(path, rootUrl()).href;
  }

  function loginPageUrl() {
    return rootPath('login.html');
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[data-auth0-spa-js]')) {
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.auth0SpaJs = '1';
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('无法加载 Auth0 SDK：' + src)); };
      document.head.appendChild(script);
    });
  }

  function getCreateAuth0Client() {
    if (typeof global.createAuth0Client === 'function') return global.createAuth0Client;
    if (global.auth0 && typeof global.auth0.createAuth0Client === 'function') {
      return global.auth0.createAuth0Client;
    }
    return null;
  }

  function assertConfig() {
    var cfg = global.AUTH0_CONFIG || {};
    if (!cfg.domain || cfg.domain.indexOf('YOUR_TENANT') === 0) {
      throw new Error('请先在 js/auth0-config.js 填写 Auth0 domain');
    }
    if (!cfg.clientId || cfg.clientId.indexOf('YOUR_CLIENT_ID') === 0) {
      throw new Error('请先在 js/auth0-config.js 填写 Auth0 clientId');
    }
    return cfg;
  }

  function getAuth0Client() {
    if (clientPromise) return clientPromise;
    clientPromise = (async function () {
      var cfg = assertConfig();
      if (!getCreateAuth0Client()) {
        await loadScript(SPA_JS_CDN);
      }
      var create = getCreateAuth0Client();
      if (!create) throw new Error('Auth0 SPA SDK 未正确加载');
      return create({
        domain: cfg.domain.replace(/^https?:\/\//, ''),
        clientId: cfg.clientId,
        cacheLocation: cfg.cacheLocation || 'localstorage',
        useRefreshTokens: cfg.useRefreshTokens !== false,
        authorizationParams: {
          redirect_uri: loginPageUrl(),
          scope: 'openid profile email offline_access'
        }
      });
    })();
    return clientPromise;
  }

  global.DashAuth0 = {
    rootPath: rootPath,
    loginPageUrl: loginPageUrl,
    getClient: getAuth0Client,
    async isAuthenticated() {
      var client = await getAuth0Client();
      return client.isAuthenticated();
    },
    async login(appState) {
      var client = await getAuth0Client();
      await client.loginWithRedirect({
        appState: appState || { returnTo: rootPath('index.html') }
      });
    },
    async logout() {
      var client = await getAuth0Client();
      client.logout({
        logoutParams: {
          returnTo: loginPageUrl()
        }
      });
    },
    async handleRedirectIfPresent() {
      var query = new URLSearchParams(window.location.search);
      if (!(query.has('code') || query.has('error')) || !query.has('state')) {
        return null;
      }
      var client = await getAuth0Client();
      var result = await client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      return result;
    }
  };
})(window);
