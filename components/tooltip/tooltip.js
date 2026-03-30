/* DSL Tooltip — hover + focus show/hide with delay */

let showTimer = null;

document.querySelectorAll('.dsl-tooltip-wrapper').forEach(function (wrapper) {
  const tooltip = wrapper.querySelector('.dsl-tooltip');
  if (!tooltip) return;

  function show() {
    clearTimeout(showTimer);
    showTimer = setTimeout(function () {
      tooltip.setAttribute('data-visible', '');
    }, 120);
  }

  function hide() {
    clearTimeout(showTimer);
    tooltip.removeAttribute('data-visible');
  }

  wrapper.addEventListener('mouseenter', show);
  wrapper.addEventListener('mouseleave', hide);
  wrapper.addEventListener('focusin', show);
  wrapper.addEventListener('focusout', hide);
});
