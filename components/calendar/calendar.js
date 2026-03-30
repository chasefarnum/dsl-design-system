/* DSL Calendar — month view with date selection */

(function () {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();
  let selectedDate = null;

  // Dates to disable: everything before today as an example
  function isDisabled(date) {
    return date < today;
  }

  function isSameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function render() {
    const titleEl = document.getElementById('cal-title');
    const grid = document.getElementById('cal-grid');
    if (!titleEl || !grid) return;

    titleEl.textContent = MONTHS[currentMonth] + ' ' + currentYear;
    grid.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

    // Leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, daysInPrev - i);
      grid.appendChild(makeDay(d, true));
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      grid.appendChild(makeDay(date, false));
    }

    // Trailing days
    const total = firstDay + daysInMonth;
    const trailing = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let d = 1; d <= trailing; d++) {
      const date = new Date(currentYear, currentMonth + 1, d);
      grid.appendChild(makeDay(date, true));
    }
  }

  function makeDay(date, outside) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dsl-calendar__day';
    btn.textContent = date.getDate();
    btn.setAttribute('data-date', date.toISOString().split('T')[0]);
    btn.setAttribute('aria-label', date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    if (outside) btn.classList.add('dsl-calendar__day--outside');
    if (isSameDay(date, today)) btn.classList.add('dsl-calendar__day--today');
    if (isSameDay(date, selectedDate)) {
      btn.classList.add('dsl-calendar__day--selected');
      btn.setAttribute('aria-pressed', 'true');
    }
    if (isDisabled(date)) {
      btn.disabled = true;
      btn.classList.add('dsl-calendar__day--disabled');
    }

    return btn;
  }

  document.getElementById('cal-prev').addEventListener('click', function () {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    render();
  });

  document.getElementById('cal-next').addEventListener('click', function () {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    render();
  });

  document.getElementById('cal-grid').addEventListener('click', function (e) {
    const btn = e.target.closest('.dsl-calendar__day');
    if (!btn || btn.disabled) return;
    const dateStr = btn.dataset.date;
    selectedDate = new Date(dateStr + 'T00:00:00');
    const label = document.getElementById('selected-date');
    if (label) label.textContent = 'Selected: ' + selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    render();
  });

  // Arrow key navigation
  document.getElementById('cal-grid').addEventListener('keydown', function (e) {
    const focused = document.activeElement;
    if (!focused || !focused.classList.contains('dsl-calendar__day')) return;
    const dateStr = focused.dataset.date;
    const current = new Date(dateStr + 'T00:00:00');
    let target;
    if (e.key === 'ArrowRight') target = new Date(current.getTime() + 86400000);
    else if (e.key === 'ArrowLeft') target = new Date(current.getTime() - 86400000);
    else if (e.key === 'ArrowDown') target = new Date(current.getTime() + 7 * 86400000);
    else if (e.key === 'ArrowUp') target = new Date(current.getTime() - 7 * 86400000);
    else return;
    e.preventDefault();
    const targetStr = target.toISOString().split('T')[0];
    // Navigate month if needed
    if (target.getMonth() !== currentMonth || target.getFullYear() !== currentYear) {
      currentMonth = target.getMonth();
      currentYear = target.getFullYear();
      render();
    }
    const targetBtn = document.querySelector('[data-date="' + targetStr + '"]');
    if (targetBtn) targetBtn.focus();
  });

  render();
})();
