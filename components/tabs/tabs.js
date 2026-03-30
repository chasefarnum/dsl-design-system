/* DSL Tabs — panel switching + keyboard navigation */

document.querySelectorAll('.dsl-tabs').forEach(function (tabs) {
  const list = tabs.querySelector('[role="tablist"]');
  if (!list) return;

  function getTabButtons() {
    return Array.from(list.querySelectorAll('[role="tab"]:not([aria-disabled="true"])'));
  }

  function activateTab(tab) {
    const allTabs = Array.from(list.querySelectorAll('[role="tab"]'));
    allTabs.forEach(function (t) {
      t.setAttribute('aria-selected', 'false');
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
    tab.setAttribute('aria-selected', 'true');
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (panel) panel.hidden = false;
    tab.focus();
  }

  list.addEventListener('click', function (e) {
    const tab = e.target.closest('[role="tab"]');
    if (tab && tab.getAttribute('aria-disabled') !== 'true') {
      activateTab(tab);
    }
  });

  list.addEventListener('keydown', function (e) {
    const buttons = getTabButtons();
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      activateTab(buttons[(idx + 1) % buttons.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      activateTab(buttons[(idx - 1 + buttons.length) % buttons.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      activateTab(buttons[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      activateTab(buttons[buttons.length - 1]);
    }
  });
});
