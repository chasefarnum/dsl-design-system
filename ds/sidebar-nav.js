/* DSL Design System — Sidebar injector */

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
        { name: 'Accordion',    href: base + 'components/accordion/index.html' },
        { name: 'Avatar',       href: base + 'components/avatar/index.html' },
        { name: 'Badge',        href: base + 'components/badge/index.html' },
        { name: 'Button',       href: base + 'components/button/index.html' },
        { name: 'Calendar',     href: base + 'components/calendar/index.html' },
        { name: 'Card',         href: base + 'components/card/index.html' },
        { name: 'Dialog',       href: base + 'components/dialog/index.html' },
        { name: 'Forms',        href: base + 'components/forms/index.html' },
        { name: 'Icons',        href: base + 'components/icons/index.html' },
        { name: 'Inputs',       href: base + 'components/inputs/index.html' },
        { name: 'Menu',         href: base + 'components/menu/index.html' },
        { name: 'Navigation',   href: base + 'components/navigation/index.html' },
        { name: 'Notification', href: base + 'components/notification/index.html' },
        { name: 'Pagination',   href: base + 'components/pagination/index.html' },
        { name: 'Sections',     href: base + 'components/sections/index.html' },
        { name: 'Tabs',         href: base + 'components/tabs/index.html' },
        { name: 'Text',         href: base + 'components/text/index.html' },
        { name: 'Tooltip',      href: base + 'components/tooltip/index.html' }
      ]
    }
  ];

  function normalizePath(href) {
    return href.split('?')[0].split('#')[0].replace(/\\/g, '/');
  }

  function isActive(href) {
    var cp = normalizePath(window.location.href);
    return cp.endsWith(normalizePath(href)) || cp.indexOf(normalizePath(href)) !== -1;
  }

  function buildSidebar() {
    var html = '';

    // Logo at top
    html += '<div class="ds-nav__header">' +
      '<a class="ds-nav__logo" href="' + base + 'index.html">DSL</a>' +
    '</div>';

    // Nav groups
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

  document.addEventListener('DOMContentLoaded', function () {
    var sidebarEl = document.getElementById('sidebar');
    if (sidebarEl) {
      sidebarEl.innerHTML = buildSidebar();
      // Re-apply theme icons after injection
      if (window.DSTheme && window.DSTheme.sync) window.DSTheme.sync();
    }
  });
})();
