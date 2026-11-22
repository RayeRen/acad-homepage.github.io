(() => {
  const celebration = document.querySelector('.eartymp-celebration');
  if (!celebration) return;

  const button = celebration.querySelector('button');
  const image = document.getElementById(button.getAttribute('aria-controls'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'eartymp-confetti';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  document.body.appendChild(canvas);
  const context = canvas.getContext('2d');
  let hideTimer;
  let animationFrame;

  function stopConfetti() {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.hidden = true;
  }

  function launchConfetti() {
    stopConfetti();
    if (!context || reducedMotion.matches) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * scale;
    canvas.height = height * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    canvas.hidden = false;

    const news = celebration.closest('li');
    const firstLine = news.querySelector('strong').getClientRects()[0];
    const titleLines = news.querySelector('.eartymp-title').getClientRects();
    const lastLine = titleLines[titleLines.length - 1];
    const colors = ['#f15b67', '#f5bd32', '#47b98a', '#48a9e0', '#a87ee4'];
    const particles = Array.from({ length: 120 }, (_, index) => {
      const fromLeft = index % 2 === 0;
      const angle = -(0.35 + Math.random() * 0.8);
      const speed = 130 + Math.random() * 180;
      return {
        x: fromLeft ? firstLine.left - 6 : lastLine.right + 6,
        y: fromLeft ? firstLine.bottom : lastLine.bottom,
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        delay: Math.floor(index / 2) % 2 * 0.18,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 12,
        color: colors[index % colors.length],
        size: 5 + Math.random() * 5
      };
    });
    const started = performance.now();

    function draw(now) {
      const seconds = (now - started) / 1000;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = Math.min(1, Math.max(0, (2 - seconds) / 0.5));
      for (const particle of particles) {
        const age = seconds - particle.delay;
        if (age < 0) continue;
        context.save();
        context.translate(particle.x + particle.vx * age * 0.65,
          particle.y + particle.vy * age + 110 * age * age);
        context.rotate(particle.rotation + particle.spin * age);
        context.fillStyle = particle.color;
        context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        context.restore();
      }
      if (seconds < 2) animationFrame = requestAnimationFrame(draw);
      else stopConfetti();
    }
    animationFrame = requestAnimationFrame(draw);
  }

  function setExpanded(expanded) {
    clearTimeout(hideTimer);
    button.setAttribute('aria-expanded', String(expanded));
    image.hidden = !expanded;
    if (expanded) {
      launchConfetti();
      hideTimer = setTimeout(() => setExpanded(false), 2000);
    } else {
      stopConfetti();
    }
  }

  button.addEventListener('click', () => {
    if (image.hidden) setExpanded(true);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setExpanded(false);
  });

  document.addEventListener('click', (event) => {
    if (!image.hidden && !celebration.contains(event.target)) setExpanded(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!image.hidden && event.key === 'Escape') {
      setExpanded(false);
      button.focus();
    }
  });
})();
