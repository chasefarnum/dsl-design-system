/* DSL Accordion — expand/collapse behavior */

document.querySelectorAll('.dsl-accordion').forEach(function (accordion) {
  const mode = accordion.dataset.mode || 'multi';

  accordion.addEventListener('click', function (e) {
    const trigger = e.target.closest('.dsl-accordion__trigger');
    if (!trigger) return;

    const item = trigger.closest('.dsl-accordion__item');
    const isOpen = item.hasAttribute('data-open');

    if (mode === 'single') {
      accordion.querySelectorAll('.dsl-accordion__item[data-open]').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.removeAttribute('data-open');
          openItem.querySelector('.dsl-accordion__trigger').setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (isOpen) {
      item.removeAttribute('data-open');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      item.setAttribute('data-open', '');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });

  // Keyboard: open first item on Enter/Space (handled natively by button)
  // Arrow key navigation between triggers
  accordion.addEventListener('keydown', function (e) {
    const triggers = Array.from(accordion.querySelectorAll('.dsl-accordion__trigger'));
    const idx = triggers.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      triggers[(idx + 1) % triggers.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      triggers[(idx - 1 + triggers.length) % triggers.length].focus();
    }
  });
});
