/* DSL Menu / Dropdown — toggle, outside click, keyboard navigation */

document.querySelectorAll('.dsl-menu').forEach(function (menu) {
  const trigger = menu.querySelector('[aria-haspopup]');
  const panel = menu.querySelector('.dsl-menu__panel');
  if (!trigger || !panel) return;

  function open() {
    menu.setAttribute('data-open', '');
    trigger.setAttribute('aria-expanded', 'true');
    const first = panel.querySelector('.dsl-menu__item');
    if (first) first.focus();
  }

  function close() {
    menu.removeAttribute('data-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function isOpen() {
    return menu.hasAttribute('data-open');
  }

  trigger.addEventListener('click', function () {
    isOpen() ? close() : open();
  });

  // Close on item select
  panel.addEventListener('click', function (e) {
    if (e.target.closest('.dsl-menu__item')) {
      close();
      trigger.focus();
    }
  });

  // Keyboard navigation
  panel.addEventListener('keydown', function (e) {
    const items = Array.from(panel.querySelectorAll('.dsl-menu__item:not([disabled])'));
    const idx = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(idx + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
      trigger.focus();
    } else if (e.key === 'Tab') {
      close();
    }
  });
});

// Close on outside click
document.addEventListener('click', function (e) {
  document.querySelectorAll('.dsl-menu[data-open]').forEach(function (menu) {
    if (!menu.contains(e.target)) {
      menu.removeAttribute('data-open');
      const trigger = menu.querySelector('[aria-haspopup]');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  });
});
