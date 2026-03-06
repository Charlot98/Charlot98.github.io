(function () {
  var KEY = 'dash_auth_token';
  try {
    if (localStorage.getItem(KEY) !== 'logged_in') {
      window.location.replace('login.html');
    }
  } catch (e) {
    window.location.replace('login.html');
  }
})();
