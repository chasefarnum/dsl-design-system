/* DSL Design System — Sidebar + Header injector */

(function () {
  var base = window.DS_BASE || './';

  var nav = [
    {
      label: 'Foundations',
      items: [
        { name: 'Colors',      href: base + 'foundations/colors/index.html' },
        { name: 'Typography',  href: base + 'foundations/typography/index.html' },
        { name: 'Spacing',     href: base + 'foundations/spacing/index.html' },
        { name: 'Shadows',     href: base + 'foundations/shadows/index.html' }
      ]
    },
    {
      label: 'Components',
      items: [
        { name: 'Accordion',   href: base + 'components/accordion/index.html' },
        { name: 'Avatar',      href: base + 'components/avatar/index.html' },
        { name: 'Badge',       href: base + 'components/badge/index.html' },
        { name: 'Button',      href: base + 'components/button/index.html' },
        { name: 'Calendar',    href: base + 'components/calendar/index.html' },
        { name: 'Card',        href: base + 'components/card/index.html' },
        { name: 'Dialog',      href: base + 'components/dialog/index.html' },
        { name: 'Forms',       href: base + 'components/forms/index.html' },
        { name: 'Icons',       href: base + 'components/icons/index.html' },
        { name: 'Inputs',      href: base + 'components/inputs/index.html' },
        { name: 'Menu',        href: base + 'components/menu/index.html' },
        { name: 'Navigation',  href: base + 'components/navigation/index.html' },
        { name: 'Notification',href: base + 'components/notification/index.html' },
        { name: 'Pagination',  href: base + 'components/pagination/index.html' },
        { name: 'Sections',    href: base + 'components/sections/index.html' },
        { name: 'Tabs',        href: base + 'components/tabs/index.html' },
        { name: 'Text',        href: base + 'components/text/index.html' },
        { name: 'Tooltip',     href: base + 'components/tooltip/index.html' }
      ]
    }
  ];

  function normalizePath(href) {
    // Strip query/hash, resolve to lowercase for comparison
    return href.split('?')[0].split('#')[0].replace(/\\/g, '/');
  }

  function currentPath() {
    return normalizePath(window.location.href);
  }

  function isActive(href) {
    var cp = currentPath();
    var lp = normalizePath(window.location.origin + '/' + href).replace(/\/+/g, '/');
    // Also handle file:// - just compare the tail
    return cp.endsWith(normalizePath(href)) || cp.indexOf(normalizePath(href)) !== -1;
  }

  function buildSidebar() {
    var html = '';
    nav.forEach(function (group) {
      html += '<div class="ds-nav__group">';
      html += '<p class="ds-nav__group-label">' + group.label + '</p>';
      html += '<ul class="ds-nav__list">';
      group.items.forEach(function (item) {
        var active = isActive(item.href) ? ' is-active' : '';
        html += '<li><a class="ds-nav__link' + active + '" href="' + item.href + '">' + item.name + '</a></li>';
      });
      html += '</ul></div>';
    });
    return html;
  }

  function buildHeader() {
    return '<a class="ds-header__logo" href="' + base + 'index.html">DSL</a>' +
      '<div class="ds-header__actions">' +
        '<button class="ds-mobile-menu-btn" id="ds-mobile-toggle" aria-label="Toggle navigation">' +
          '<svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>' +
        '</button>' +
        '<button class="ds-theme-btn" id="ds-theme-toggle" aria-label="Toggle theme">' +
          '<svg id="ds-icon-sun" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>' +
          '<svg id="ds-icon-moon" viewBox="0 0 20 20" fill="currentColor" style="display:none"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>' +
        '</button>' +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var headerEl = document.getElementById('header');
    var sidebarEl = document.getElementById('sidebar');

    if (headerEl) headerEl.innerHTML = buildHeader();
    if (sidebarEl) sidebarEl.innerHTML = buildSidebar();

    // Mobile toggle
    var mobileBtn = document.getElementById('ds-mobile-toggle');
    if (mobileBtn && sidebarEl) {
      mobileBtn.addEventListener('click', function () {
        sidebarEl.classList.toggle('is-open');
      });
      // Close sidebar on nav link click (mobile)
      sidebarEl.addEventListener('click', function (e) {
        if (e.target.classList.contains('ds-nav__link')) {
          sidebarEl.classList.remove('is-open');
        }
      });
    }
  });
})();
