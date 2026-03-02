(function () {
  var KEY = 'dash_auth_token';
  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var isReload = nav ? nav.type === 'reload' : (performance.navigation && performance.navigation.type === 1);
    if (isReload) {
      try { localStorage.removeItem(KEY); } catch (e) {}
      window.location.replace('0_login.html');
      return;
    }
  } catch (e) {}
  try {
    if (localStorage.getItem(KEY) !== 'logged_in') {
      window.location.replace('0_login.html');
    }
  } catch (e) {
    window.location.replace('0_login.html');
  }
})();
