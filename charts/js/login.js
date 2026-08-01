(function () {
  function $(id) { return document.getElementById(id); }
  function setError(message) { $('error').textContent = message || ''; }
  function go(url) { window.location.replace(url); }

  async function boot() {
    try {
      if (await DashAuth.isAuthenticated()) {
        go(DashAuth.rootPath('index.html'));
        return;
      }
    } catch (error) {
      setError(error && error.message ? error.message : 'Supabase初始化失败');
    }
    document.querySelector('.login-card').hidden = false;
    $('login-btn').disabled = false;
  }

  $('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    setError('');
    $('login-btn').disabled = true;
    try {
      await DashAuth.login($('username').value, $('password').value);
      go(DashAuth.rootPath('index.html'));
    } catch (error) {
      $('login-btn').disabled = false;
      setError(error && error.message ? error.message : '登录失败');
    }
  });
  boot();
})();
