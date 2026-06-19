// matrix-bg.js
function initMatrix() {
  // Remove any old one
  if (document.getElementById('matrix-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '-5',           // Very deep background
    opacity: '0.12',
    pointerEvents: 'none',
    mixBlendMode: 'screen'
  });
  document.body.prepend(canvas);   // Add at the very beginning

  const ctx = canvas.getContext('2d', { alpha: true });
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  const chars = "01アイウエオ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\";
  const fontSize = 14;
  let columns = Math.floor(w / fontSize);
  let drops = new Array(columns).fill(1);

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    columns = Math.floor(w / fontSize);
    drops = new Array(columns).fill(1);
  });

  function draw() {
    ctx.fillStyle = 'rgba(27, 36, 64, 0.07)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#a0d2eb';
    ctx.font = `${fontSize}px JetBrains Mono, monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  setInterval(draw, 35);

  // Dynamic opacity
  const obs = new MutationObserver(() => {
    canvas.style.opacity = document.body.classList.contains('hero-active') ? '0.16' : '0.09';
  });
  obs.observe(document.body, { attributes: true });
}

window.addEventListener('load', initMatrix);