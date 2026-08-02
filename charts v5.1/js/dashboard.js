(function () {
  var button = document.getElementById('logout-btn');
  if (!button) return;
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
