(function () {
  var rootUrl = document.querySelector('base') ? document.baseURI : new URL('./', window.location.href).href;
  var authReady = false;

  function rootPath(path) { return new URL(path, rootUrl).href; }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { reject(new Error('脚本加载失败: ' + src)); };
      document.head.appendChild(script);
    });
  }
  async function ensureSupabase() {
    if (!window.DashAuth) {
      await loadScript(rootPath('js/supabase-config.js'));
      await loadScript(rootPath('js/supabase-client.js'));
    }
    if (!window.DashData) await loadScript(rootPath('js/data-source.js?v=20260802-2'));
  }
  async function guard() {
    try {
      await ensureSupabase();
      if (!await DashAuth.isAuthenticated()) {
        window.location.replace(DashAuth.loginPageUrl());
        return;
      }
      authReady = true;
    } catch (error) {
      console.error(error);
      window.location.replace(rootPath('login.html'));
    }
  }
  document.addEventListener('click', function (event) {
    if (authReady) return;
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (anchor) event.preventDefault();
  }, true);
  window.DashBootstrap = guard();
})();
