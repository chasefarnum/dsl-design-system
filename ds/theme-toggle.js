/* DSL Design System — Dark / Light Theme Toggle */

(function () {
  var STORAGE_KEY = 'dsl-theme';
  var DEFAULT_THEME = 'light';

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var sun = document.getElementById('ds-icon-sun');
    var moon = document.getElementById('ds-icon-moon');
    if (sun && moon) {
      sun.style.display = theme === 'light' ? '' : 'none';
      moon.style.display = theme === 'dark' ? '' : 'none';
    }
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Apply saved theme immediately to avoid flash
  applyTheme(getTheme());

  // Use event delegation so click works regardless of injection order
  document.addEventListener('click', function (e) {
    if (e.target.closest('#ds-theme-toggle')) {
      toggleTheme();
    }
  });

  // Re-sync icons after sidebar-nav has injected them
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getTheme());
  });
})();
