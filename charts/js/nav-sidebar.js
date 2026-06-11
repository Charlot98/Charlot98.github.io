(function () {
  function init() {
  var sections = window.NAV_SECTIONS;
  var container = document.querySelector('.nav-sidebar-more[data-nav-auto]');
  if (!sections || !container) return;

  var activeHref = (location.pathname.split('/').pop() || '').toLowerCase();
  if (activeHref === '') activeHref = 'index.html';

  var allSections = [];
  var activeSection = null;

  function collapseToActiveOnly() {
    allSections.forEach(function (details) {
      details.open = details === activeSection;
    });
  }

  function buildLink(item) {
    var isActive = item.href.toLowerCase() === activeHref;
    var a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-sidebar-link' + (isActive ? ' active' : '');
    var cat = document.createElement('span');
    cat.className = 'nav-sidebar-cat';
    cat.textContent = item.cat;
    var text = document.createElement('span');
    text.className = 'nav-sidebar-text';
    text.textContent = item.text;
    a.appendChild(cat);
    a.appendChild(text);
    return a;
  }

  sections.forEach(function (section) {
    var details = document.createElement('details');
    details.className = 'nav-sidebar-section';
    var hasActive = section.items.some(function (item) {
      return item.href.toLowerCase() === activeHref;
    });
    if (hasActive) {
      details.open = true;
      details.classList.add('nav-sidebar-section-active');
      activeSection = details;
    }

    var summary = document.createElement('summary');
    summary.className = 'nav-sidebar-label';
    summary.textContent = section.title;
    summary.addEventListener('click', function (e) {
      e.preventDefault();
    });

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
    allSections.push(details);
    container.appendChild(details);
  });

  var sidebar = container.closest('.nav-sidebar');
  if (sidebar) {
    sidebar.addEventListener('mouseleave', collapseToActiveOnly);
  }

  var guide = document.createElement('a');
  guide.href = 'guide.html';
  guide.className = 'nav-sidebar-guide' + (activeHref === 'guide.html' ? ' active' : '');
  guide.textContent = '使用指南';
  container.appendChild(guide);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
