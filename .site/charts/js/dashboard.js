(function () {
  var button = document.getElementById('logout-btn');
  if (!button) return;

  // 游客用的是共享只读账号，按钮改为「登录」，点击后退出并回到登录页。
  (async function () {
    try {
      await window.DashBootstrap;
      if (await DashAuth.isGuest()) button.textContent = '登录';
    } catch (error) {
      console.error(error);
    }
  })();

  button.addEventListener('click', async function () {
    button.disabled = true;
    try {
      if (window.DashData && typeof DashData.clearCache === 'function') DashData.clearCache();
      await DashAuth.logout();
    } catch (error) {
      console.error(error);
      window.location.replace('login.html');
    }
  });
})();
