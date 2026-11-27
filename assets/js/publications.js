(() => {
  const filters = document.getElementById('publication-filters');
  const topic = document.getElementById('topic');
  const year = document.getElementById('year');
  const count = document.getElementById('publication-count');
  const papers = Array.from(document.querySelectorAll('[data-publication]'));

  function update() {
    let visible = 0;
    for (const paper of papers) {
      const matchesTopic = !topic.value || paper.dataset.topics.split(' ').includes(topic.value);
      const matchesYear = !year.value || paper.dataset.years.split(' ').includes(year.value);
      paper.hidden = !(matchesTopic && matchesYear);
      if (!paper.hidden) visible++;
    }
    count.textContent = visible ? `${visible} of ${papers.length} publications` : 'No publications match these filters.';
  }

  function readUrl() {
    const params = new URLSearchParams(location.search);
    for (const select of [topic, year]) {
      const value = params.get(select.id);
      select.value = Array.from(select.options).some(option => option.value === value) ? value : '';
    }
    update();
  }

  function writeUrl() {
    const url = new URL(location.href);
    for (const select of [topic, year]) {
      if (select.value) url.searchParams.set(select.id, select.value);
      else url.searchParams.delete(select.id);
    }
    const linkedPaper = papers.find(paper => '#' + paper.id === url.hash);
    update();
    if (linkedPaper?.hidden) url.hash = '';
    history.replaceState(null, '', url);
  }

  filters.hidden = false;
  filters.addEventListener('change', writeUrl);
  document.getElementById('reset-filters').addEventListener('click', () => {
    topic.value = '';
    year.value = '';
    writeUrl();
    topic.focus();
  });
  window.addEventListener('popstate', readUrl);
  readUrl();
})();
