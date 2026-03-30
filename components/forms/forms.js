/* DSL Forms — toggle aria-checked for switch inputs */

document.querySelectorAll('.dsl-form-toggle__input[role="switch"]').forEach(function (input) {
  input.addEventListener('change', function () {
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
  });
});
