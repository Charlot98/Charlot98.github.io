(function () {
  function $(id) { return document.getElementById(id); }
  function setError(msg) { $('error').textContent = msg || ''; }

  function go(url) {
    window.location.replace(url);
  }

  async function boot() {
    try {
      var result = await DashAuth0.handleRedirectIfPresent();
      if (result) {
        var target = (result.appState && result.appState.returnTo) || DashAuth0.rootPath('index.html');
        go(target);
        return;
      }

      if (await DashAuth0.isAuthenticated()) {
        go(DashAuth0.rootPath('index.html'));
        return;
      }

      await DashAuth0.login({ returnTo: DashAuth0.rootPath('index.html') });
      return;
    } catch (err) {
      setError(err && err.message ? err.message : 'Auth0 初始化失败');
    }

    document.querySelector('.login-card').hidden = false;
    $('login-btn').disabled = false;
  }

  $('login-btn').addEventListener('click', async function () {
    setError('');
    $('login-btn').disabled = true;
    try {
      await DashAuth0.login({ returnTo: DashAuth0.rootPath('index.html') });
    } catch (err) {
      $('login-btn').disabled = false;
      setError(err && err.message ? err.message : '无法跳转到 Auth0 登录');
    }
  });

  boot();
})();
