/* DSL Notification — dismiss behavior + toast system */

// Dismiss inline alerts
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.dsl-alert__dismiss');
  if (!btn) return;
  const alert = btn.closest('.dsl-alert');
  if (alert) {
    alert.classList.add('dsl-alert--dismissing');
    setTimeout(function () { alert.hidden = true; }, 300);
  }
});

// Toast system
const toastMessages = {
  info:    { title: 'Information', body: 'Your tour request has been received.' },
  success: { title: 'Success!', body: 'You have been added to our mailing list.' },
  warning: { title: 'Heads Up', body: 'Your session will expire in 5 minutes.' },
  error:   { title: 'Something went wrong', body: 'Please try again or call us directly.' }
};

const toastIcons = {
  info:    '<i class="ph-bold ph-info" aria-hidden="true"></i>',
  success: '<i class="ph-bold ph-check-circle" aria-hidden="true"></i>',
  warning: '<i class="ph-bold ph-warning" aria-hidden="true"></i>',
  error:   '<i class="ph-bold ph-x-circle" aria-hidden="true"></i>'
};

function showToast(intent) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const msg = toastMessages[intent] || toastMessages.info;
  const toast = document.createElement('div');
  toast.className = 'dsl-alert dsl-alert--' + intent + ' dsl-alert--toast';
  toast.setAttribute('role', intent === 'error' ? 'alert' : 'status');
  toast.innerHTML =
    '<span class="dsl-alert__icon">' + (toastIcons[intent] || '') + '</span>' +
    '<div class="dsl-alert__content">' +
      '<p class="dsl-alert__title">' + msg.title + '</p>' +
      '<p class="dsl-alert__body">' + msg.body + '</p>' +
    '</div>' +
    '<button class="dsl-alert__dismiss" aria-label="Dismiss" type="button"><i class="ph-bold ph-x" aria-hidden="true"></i></button>';

  container.appendChild(toast);

  // Auto-dismiss after 4s
  setTimeout(function () { dismissToast(toast); }, 4000);
}

function dismissToast(toast) {
  toast.classList.add('dsl-alert--dismissing');
  setTimeout(function () { toast.remove(); }, 300);
}

document.querySelectorAll('[data-toast]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    showToast(btn.dataset.toast);
  });
});

// Delegate dismiss clicks for dynamically created toasts
document.getElementById('toast-container') && document.getElementById('toast-container').addEventListener('click', function (e) {
  const btn = e.target.closest('.dsl-alert__dismiss');
  if (btn) dismissToast(btn.closest('.dsl-alert'));
});
