(function () {
  function init() {
    var sections = window.NAV_SECTIONS;
    var container = document.querySelector('.nav-sidebar-more[data-nav-auto]');
    if (!sections || !container) return;

    var activePath = new URL(location.href).pathname.replace(/\/+$/, '').toLowerCase();

    function isActiveItem(href) {
      var itemPath = new URL(href, document.baseURI).pathname.replace(/\/+$/, '').toLowerCase();
      if (itemPath === activePath) return true;
      // 个人查询结果页归入实验入口
      if (
        /\/personal\.html$/.test(itemPath) &&
        /\/personal-result\.html$/.test(activePath)
      ) {
        return true;
      }
      return false;
    }

    function buildLink(item) {
      var active = isActiveItem(item.href);
      var link = document.createElement('a');
      link.href = item.href;
      link.className = 'nav-sidebar-link' + (active ? ' active' : '');
      link.title = item.cat + ' · ' + item.text;
      link.setAttribute('aria-label', item.cat + ' ' + item.text);
      if (active) link.setAttribute('aria-current', 'page');

      var text = document.createElement('span');
      text.className = 'nav-sidebar-text';
      text.textContent = item.text;
      link.appendChild(text);
      return link;
    }

    var inner = container.closest('.nav-sidebar-inner');
    var home = inner && inner.querySelector(':scope > a:first-child');
    if (home) {
      home.className = 'nav-sidebar-home';
      home.textContent = '统计看板';
      home.title = '返回统计看板';
    }

    sections.forEach(function (section) {
      var details = document.createElement('details');
      details.className = 'nav-sidebar-section';
      var hasActive = section.items.some(function (item) {
        return isActiveItem(item.href);
      });
      if (hasActive) {
        details.open = true;
        details.classList.add('nav-sidebar-section-active');
      }

      var summary = document.createElement('summary');
      summary.className = 'nav-sidebar-label';
      var title = document.createElement('span');
      title.className = 'nav-sidebar-title';
      title.textContent = section.title;
      summary.appendChild(title);

      var group = document.createElement('div');
      group.className = 'nav-sidebar-group';
      section.items.forEach(function (item) {
        group.appendChild(buildLink(item));
      });

      details.appendChild(summary);
      details.appendChild(group);

      details.addEventListener('mouseenter', function () {
        details.open = true;
      });
      details.addEventListener('mouseleave', function () {
        if (!hasActive) details.open = false;
      });
      summary.addEventListener('click', function (event) {
        // 含当前页的分组始终展开，禁止点收起
        if (hasActive) {
          event.preventDefault();
          details.open = true;
        }
      });

      container.appendChild(details);
    });

    var guide = document.createElement('a');
    guide.href = 'pages/ultrasound/guide.html';
    guide.className = 'nav-sidebar-guide' + (isActiveItem(guide.href) ? ' active' : '');
    guide.textContent = '使用指南';
    container.appendChild(guide);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
