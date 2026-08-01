(function (global) {
  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  var clientPromise = null;

  function rootUrl() {
    return document.querySelector('base') ? document.baseURI : new URL('./', window.location.href).href;
  }

  function rootPath(path) { return new URL(path, rootUrl()).href; }
  function loginPageUrl() { return rootPath('login.html'); }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-supabase-sdk]');
      if (existing) {
        if (global.supabase) resolve();
        else existing.addEventListener('load', resolve, { once: true });
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.supabaseSdk = '1';
      script.onload = resolve;
      script.onerror = function () { reject(new Error('无法加载 Supabase SDK')); };
      document.head.appendChild(script);
    });
  }

  function assertConfig() {
    var cfg = global.SUPABASE_CONFIG || {};
    if (!cfg.url || cfg.url.indexOf('YOUR_PROJECT') >= 0) throw new Error('请填写 Supabase Project URL');
    if (!cfg.publishableKey || cfg.publishableKey.indexOf('YOUR_PUBLISHABLE_KEY') >= 0) {
      throw new Error('请填写 Supabase publishable key');
    }
    return cfg;
  }

  function usernameToEmail(username) {
    var cfg = assertConfig();
    var normalized = String(username || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{2,31}$/.test(normalized)) {
      throw new Error('账户名须为3至32位，只能包含英文字母、数字、下划线或连字符');
    }
    if (!cfg.usernameDomain) throw new Error('请配置账户邮箱尾号');
    return normalized + '@' + String(cfg.usernameDomain).replace(/^@/, '').toLowerCase();
  }

  function getClient() {
    if (clientPromise) return clientPromise;
    clientPromise = (async function () {
      if (!global.supabase || !global.supabase.createClient) await loadScript(SDK_URL);
      var cfg = assertConfig();
      return global.supabase.createClient(cfg.url, cfg.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    })();
    return clientPromise;
  }

  global.DashAuth = {
    rootPath: rootPath,
    loginPageUrl: loginPageUrl,
    getClient: getClient,
    async isAuthenticated() {
      var client = await getClient();
      var result = await client.auth.getSession();
      return !!(result.data && result.data.session);
    },
    async login(username, password) {
      var client = await getClient();
      var result = await client.auth.signInWithPassword({ email: usernameToEmail(username), password: password });
      if (result.error) throw result.error;
      return result.data;
    },
    async logout() {
      if (global.DashData && typeof global.DashData.clearCache === 'function') global.DashData.clearCache();
      var client = await getClient();
      await client.auth.signOut();
      window.location.replace(loginPageUrl());
    }
  };
})(window);
