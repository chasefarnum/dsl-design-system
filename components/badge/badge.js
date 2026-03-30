/* DSL Badge — dismiss behavior */

document.addEventListener('click', function (e) {
  const btn = e.target.closest('.dsl-badge__dismiss');
  if (!btn) return;
  const badge = btn.closest('.dsl-badge');
  if (badge) badge.hidden = true;
});
