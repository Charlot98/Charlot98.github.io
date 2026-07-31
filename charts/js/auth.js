(function () {
  var rootUrl = document.querySelector('base')
    ? document.baseURI
    : new URL('./', window.location.href).href;

  function rootPath(path) {
    return new URL(path, rootUrl).href;
  }

  var authReady = false;

  function shouldHandleLink(anchor, event) {
    if (!anchor) return false;
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;
    var href = anchor.getAttribute('href');
    if (!href || href.indexOf('javascript:') === 0) return false;
    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (e) {
      return false;
    }
    if (url.origin !== window.location.origin) return false;
    return true;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('脚本加载失败: ' + src)); };
      document.head.appendChild(script);
    });
  }

  async function ensureDashAuth0() {
    if (window.DashAuth0) return;
    var base = rootPath('js/');
    await loadScript(base + 'auth0-config.js');
    await loadScript(base + 'auth0-client.js');
  }

  async function guard() {
    try {
      await ensureDashAuth0();
      var ok = await DashAuth0.isAuthenticated();
      if (!ok) {
        window.location.replace(DashAuth0.loginPageUrl());
        return;
      }
      authReady = true;
    } catch (err) {
      console.error(err);
      window.location.replace(rootPath('login.html'));
    }
  }

  // 鉴权完成前阻止站内跳转，避免未登录闪一下内容
  document.addEventListener('click', function (event) {
    var anchor = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!shouldHandleLink(anchor, event)) return;
    if (!authReady) event.preventDefault();
  }, true);

  guard();
})();
