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

  // Inject fixed toggle button into the page
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.id = 'ds-theme-toggle';
    btn.className = 'ds-theme-btn ds-theme-btn--fixed';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.innerHTML =
      '<svg id="ds-icon-sun" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>' +
      '<svg id="ds-icon-moon" viewBox="0 0 20 20" fill="currentColor" style="display:none"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>';
    btn.addEventListener('click', toggleTheme);
    document.body.appendChild(btn);
    applyTheme(getTheme());
  });

  // Expose sync + toggle for sidebar-nav.js and other callers
  window.DSTheme = {
    sync: function () { applyTheme(getTheme()); },
    toggle: toggleTheme
  };
})();
