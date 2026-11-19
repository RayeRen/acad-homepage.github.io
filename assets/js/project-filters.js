/*
 * Search + filter for the Projects page.
 * Scoped to `.cw-toolbar` + `.cw-project-list` so the EN and ZH pages
 * (which each render their own copy of this markup) both work independently.
 */
(function () {
  function setup(toolbar) {
    var container = toolbar.closest('.cw-project-section') || document;
    var searchInput = toolbar.querySelector('.cw-search');
    var chips = Array.prototype.slice.call(toolbar.querySelectorAll('.cw-chip'));
    var cards = Array.prototype.slice.call(container.querySelectorAll('.project-card'));
    var emptyState = container.querySelector('.cw-empty-state');
    var resultCount = container.querySelector('.cw-result-count');
    var countTemplate = resultCount ? resultCount.getAttribute('data-template') : null;
    var totalCount = cards.length;
    var activeTag = 'all';

    function updateResultCount(visibleCount) {
      if (!resultCount || !countTemplate) return;
      resultCount.textContent = countTemplate
        .replace('{n}', visibleCount)
        .replace('{total}', totalCount);
    }

    function applyFilters() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').toLowerCase();
        var matchesTag = activeTag === 'all' || tags.indexOf(activeTag) !== -1;
        var matchesQuery = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
        var visible = matchesTag && matchesQuery;

        card.classList.toggle('is-filtered-out', !visible);

        // If a card is hidden while its details panel is open, collapse it
        // too, so it doesn't silently linger open when the filter changes.
        if (!visible) {
          var details = document.getElementById(card.getAttribute('data-details-id'));
          if (details) {
            details.style.display = 'none';
          }
        }

        if (visible) visibleCount++;
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
      updateResultCount(visibleCount);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        activeTag = chip.getAttribute('data-tag') || 'all';
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    updateResultCount(totalCount);
  }

  /*
   * Deep-link support: the About page links out to specific projects
   * (e.g. #card-project_fx). On arrival here we scroll to that card,
   * open its details panel, and pulse it briefly so it's obvious which
   * one the link meant — rather than leaving the visitor to scan the
   * whole list for it.
   */
  function focusLinkedCard() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('#card-') !== 0) return;

    var card = document.getElementById(hash.slice(1));
    if (!card) return;

    var detailsId = card.getAttribute('data-details-id');
    var details = detailsId ? document.getElementById(detailsId) : null;
    if (details && (details.style.display === '' || details.style.display === 'none')) {
      details.style.display = 'block';
      details.style.opacity = 1;
    }

    // Let layout settle (details panel opening can shift page height)
    // before scrolling, so the card actually lands in view.
    setTimeout(function () {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);

    card.classList.add('is-highlighted');
    setTimeout(function () {
      card.classList.remove('is-highlighted');
    }, 3300);
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice
      .call(document.querySelectorAll('.cw-toolbar[data-role="project-filter"]'))
      .forEach(setup);

    focusLinkedCard();
  });
})();
