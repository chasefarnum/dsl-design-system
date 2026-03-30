/* DSL Navigation — hamburger toggle, submenu, scroll shadow */

(function () {
  const nav = document.getElementById('main-nav');
  const hamburger = document.getElementById('nav-hamburger');

  // Hamburger toggle
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      const isOpen = nav.hasAttribute('data-mobile-open');
      if (isOpen) {
        nav.removeAttribute('data-mobile-open');
        hamburger.setAttribute('aria-expanded', 'false');
      } else {
        nav.setAttribute('data-mobile-open', '');
        hamburger.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Submenu toggle
  document.querySelectorAll('.dsl-nav__link[aria-haspopup]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.dsl-nav__item');
      const isOpen = item.hasAttribute('data-submenu-open');
      // Close others
      document.querySelectorAll('.dsl-nav__item[data-submenu-open]').forEach(function (el) {
        if (el !== item) {
          el.removeAttribute('data-submenu-open');
          el.querySelector('[aria-haspopup]').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.removeAttribute('data-submenu-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.setAttribute('data-submenu-open', '');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Close submenus on outside click
  document.addEventListener('click', function (e) {
    if (nav && !nav.contains(e.target)) {
      document.querySelectorAll('.dsl-nav__item[data-submenu-open]').forEach(function (item) {
        item.removeAttribute('data-submenu-open');
        const btn = item.querySelector('[aria-haspopup]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Scroll shadow
  window.addEventListener('scroll', function () {
    if (!nav) return;
    if (window.scrollY > 0) {
      nav.classList.add('dsl-nav--scrolled');
    } else {
      nav.classList.remove('dsl-nav--scrolled');
    }
  });
})();
