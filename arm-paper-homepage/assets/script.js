// Minimal client-side helpers (copy BibTeX, set year)
(function () {
  const copyBtn = document.querySelector('[data-copy-bibtex]');
  const bibtexEl = document.querySelector('#bibtex');

  if (copyBtn && bibtexEl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bibtexEl.innerText.trim());
        const old = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = old), 1200);
      } catch (e) {
        // Fallback (older browsers)
        const range = document.createRange();
        range.selectNodeContents(bibtexEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('copy');
        sel.removeAllRanges();
        const old = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = old), 1200);
      }
    });
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
