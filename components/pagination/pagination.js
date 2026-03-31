/* DSL Pagination */

function renderPagination(el) {
  const total = parseInt(el.dataset.total, 10) || 1;
  let current = parseInt(el.dataset.current, 10) || 1;

  function getPages() {
    if (total <= 12) return Array.from({length: total}, function (_, i) { return i + 1; });
    // Always returns exactly 9 items — no layout shift when clicking pages
    if (current <= 5) return [1, 2, 3, 4, 5, 6, 7, '…', total];
    if (current >= total - 4) return [1, '…', total-6, total-5, total-4, total-3, total-2, total-1, total];
    return [1, '…', current-2, current-1, current, current+1, current+2, '…', total];
  }

  var mq = window.matchMedia('(max-width: 768px)');

  function renderMobile() {
    el.innerHTML = '';

    // Prev
    var prevLi = document.createElement('li');
    prevLi.className = 'dsl-pagination__item';
    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'dsl-pagination__btn';
    prevBtn.setAttribute('aria-label', 'Previous page');
    prevBtn.innerHTML = '&#8592;';
    if (current === 1) prevBtn.disabled = true;
    prevBtn.addEventListener('click', function () { if (current > 1) { current--; el.dataset.current = current; render(); } });
    prevLi.appendChild(prevBtn);
    el.appendChild(prevLi);

    // Page X of Y indicator
    var indicatorLi = document.createElement('li');
    indicatorLi.className = 'dsl-pagination__item';
    var indicator = document.createElement('span');
    indicator.className = 'dsl-pagination__mobile-indicator';
    indicator.setAttribute('aria-live', 'polite');
    indicator.textContent = 'Page ' + current + ' of ' + total;
    indicatorLi.appendChild(indicator);
    el.appendChild(indicatorLi);

    // Next
    var nextLi = document.createElement('li');
    nextLi.className = 'dsl-pagination__item';
    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'dsl-pagination__btn';
    nextBtn.setAttribute('aria-label', 'Next page');
    nextBtn.innerHTML = '&#8594;';
    if (current === total) nextBtn.disabled = true;
    nextBtn.addEventListener('click', function () { if (current < total) { current++; el.dataset.current = current; render(); } });
    nextLi.appendChild(nextBtn);
    el.appendChild(nextLi);
  }

  function render() {
    if (mq.matches) { renderMobile(); return; }

    el.innerHTML = '';

    // Prev
    const prevLi = document.createElement('li');
    prevLi.className = 'dsl-pagination__item';
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'dsl-pagination__btn';
    prevBtn.setAttribute('aria-label', 'Previous page');
    prevBtn.innerHTML = '&#8592;';
    if (current === 1) prevBtn.disabled = true;
    prevBtn.addEventListener('click', function () { if (current > 1) { current--; el.dataset.current = current; render(); } });
    prevLi.appendChild(prevBtn);
    el.appendChild(prevLi);

    getPages().forEach(function (page) {
      const li = document.createElement('li');
      li.className = 'dsl-pagination__item';
      if (page === '…') {
        const span = document.createElement('span');
        span.className = 'dsl-pagination__ellipsis';
        span.textContent = '…';
        span.setAttribute('aria-hidden', 'true');
        li.appendChild(span);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dsl-pagination__btn';
        btn.textContent = page;
        btn.setAttribute('aria-label', 'Page ' + page);
        if (page === current) btn.setAttribute('aria-current', 'page');
        btn.addEventListener('click', function () { current = page; el.dataset.current = current; render(); });
        li.appendChild(btn);
      }
      el.appendChild(li);
    });

    // Next
    const nextLi = document.createElement('li');
    nextLi.className = 'dsl-pagination__item';
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'dsl-pagination__btn';
    nextBtn.setAttribute('aria-label', 'Next page');
    nextBtn.innerHTML = '&#8594;';
    if (current === total) nextBtn.disabled = true;
    nextBtn.addEventListener('click', function () { if (current < total) { current++; el.dataset.current = current; render(); } });
    nextLi.appendChild(nextBtn);
    el.appendChild(nextLi);
  }

  mq.addEventListener('change', render);
  render();
}

document.querySelectorAll('.dsl-pagination').forEach(renderPagination);
