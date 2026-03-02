(function () {
  var KEY = 'dash_auth_token';
  var btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      window.location.replace('login.html');
    });
  }
})();
