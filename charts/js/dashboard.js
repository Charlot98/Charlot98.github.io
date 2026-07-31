(function () {
  var btn = document.getElementById('logout-btn');
  if (!btn) return;

  btn.addEventListener('click', async function () {
    btn.disabled = true;
    try {
      if (!window.DashAuth0) {
        await new Promise(function (resolve, reject) {
          var s1 = document.createElement('script');
          s1.src = 'js/auth0-config.js';
          s1.onload = function () {
            var s2 = document.createElement('script');
            s2.src = 'js/auth0-client.js';
            s2.onload = resolve;
            s2.onerror = reject;
            document.head.appendChild(s2);
          };
          s1.onerror = reject;
          document.head.appendChild(s1);
        });
      }
      await DashAuth0.logout();
    } catch (err) {
      console.error(err);
      window.location.replace('login.html');
    }
  });
})();
