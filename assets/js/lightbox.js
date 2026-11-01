// Simple no-dependency lightbox: click img to open, click background or Esc to close.
(function(){
  function createOverlay(){
    const o = document.createElement('div');
    o.className = 'lb-overlay';
    o.setAttribute('role','dialog');
    o.setAttribute('aria-hidden','true');
    o.innerHTML = '<div style="text-align:center">' +
      '<img class="lb-img" alt="">' +
      '<div class="lb-caption" aria-hidden="true"></div>' +
      '</div>';
    // Close when clicking anywhere inside the overlay (including the image)
    o.addEventListener('click', function(e){
      // If click originates from a focusable control in the overlay in future, consider
      // checking e.target to avoid accidental closes. For now close on any click.
      closeLightbox();
    });
    document.body.appendChild(o);
    return o;
  }

  let overlay = null;
  function openLightbox(img){
    if(!overlay) overlay = createOverlay();
    const big = overlay.querySelector('.lb-img');
    const cap = overlay.querySelector('.lb-caption');

    const src = img.getAttribute('data-large') || img.currentSrc || img.src;
    big.src = src;
    big.alt = img.alt || '';
    cap.textContent = img.getAttribute('data-caption') || img.alt || '';

    // Make overlay visible and prevent page scroll while open.
    overlay.style.display = 'flex';
    // Allow paint then add class to trigger CSS transition
    requestAnimationFrame(() => {
      overlay.classList.add('lb-open');
      overlay.setAttribute('aria-hidden','false');
      document.documentElement.style.overflow = 'hidden';
    });
  }

  function closeLightbox(){
    if(!overlay) return;
    // remove open class to trigger fade-out
    overlay.classList.remove('lb-open');
    overlay.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
    // After transition, hide overlay from layout and clear image src to free memory
    setTimeout(()=> {
      overlay.style.display = 'none';
      const big = overlay.querySelector('.lb-img');
      if(big) big.src = '';
    }, 240);
  }

  function enableZoom(selector){
    document.addEventListener('click', function(e){
      const img = e.target.closest && e.target.closest(selector);
      if(img && img.tagName === 'IMG'){
        e.preventDefault();
        openLightbox(img);
        return;
      }
      if(overlay && e.target === overlay) closeLightbox();
    }, false);

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeLightbox();
    }, false);
  }

  // Default: enable only on images with the click-to-zoom class to avoid affecting small icons etc.
  // To change the selector, call SimpleLightbox.enable('.post-content img') or SimpleLightbox.enable('img')
  enableZoom('img.click-to-zoom');

  window.SimpleLightbox = {
    open: openLightbox,
    close: closeLightbox,
    enable: enableZoom
  };
})();
