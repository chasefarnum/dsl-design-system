/* DSL Dialog — open/close, focus trap, ESC, backdrop click */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function openDialog(dialogId) {
  const backdrop = document.getElementById('backdrop-' + dialogId);
  const dialog = document.getElementById(dialogId);
  if (!backdrop || !dialog) return;

  backdrop.setAttribute('data-open', '');
  dialog.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';

  // Focus first focusable element
  requestAnimationFrame(function () {
    const first = dialog.querySelector(FOCUSABLE);
    if (first) first.focus();
  });

  backdrop._triggerEl = document.activeElement;
}

function closeDialog(backdrop) {
  backdrop.removeAttribute('data-open');
  document.body.style.overflow = '';
  if (backdrop._triggerEl) {
    backdrop._triggerEl.focus();
    backdrop._triggerEl = null;
  }
}

// Open triggers
document.addEventListener('click', function (e) {
  const trigger = e.target.closest('[data-dialog-open]');
  if (trigger) {
    openDialog(trigger.dataset.dialogOpen);
    return;
  }
  const closeBtn = e.target.closest('[data-dialog-close]');
  if (closeBtn) {
    const backdrop = closeBtn.closest('.dsl-dialog-backdrop');
    if (backdrop) closeDialog(backdrop);
  }
});

// Backdrop click to close
document.querySelectorAll('.dsl-dialog-backdrop').forEach(function (backdrop) {
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeDialog(backdrop);
  });
});

// ESC key + focus trap
document.addEventListener('keydown', function (e) {
  const backdrop = document.querySelector('.dsl-dialog-backdrop[data-open]');
  if (!backdrop) return;
  const dialog = backdrop.querySelector('[role="dialog"]');

  if (e.key === 'Escape') {
    e.preventDefault();
    closeDialog(backdrop);
    return;
  }

  if (e.key === 'Tab') {
    const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
});
