document.addEventListener('DOMContentLoaded', () => {
  const duck = document.createElement('div');
  duck.className = 'duck';
  document.body.appendChild(duck);

  let mouseX = 0, mouseY = 0;
  let duckX = 0, duckY = 0;
  let isAngry = false;
  let clickCount = 0;

  // Make duck angry when clicked
  duck.addEventListener('click', () => {
    clickCount++;
    if (clickCount > 5) {
      isAngry = true;
      duck.classList.add('angry');
      
      // Make duck chase cursor aggressively
      const chaseInterval = setInterval(() => {
        const dx = mouseX - duckX;
        const dy = mouseY - duckY;
        duckX += dx * 0.2;
        duckY += dy * 0.2;
        duck.style.transform = `translate(${duckX}px, ${duckY}px) scaleX(${mouseX < duckX ? -1 : 1})`;
      }, 16);

      // Reset after 5 seconds
      setTimeout(() => {
        isAngry = false;
        clickCount = 0;
        duck.classList.remove('angry');
        clearInterval(chaseInterval);
      }, 5000);
    }
  });

  // Add matrix rain effect
  createMatrixRain();
});

// Create matrix rain effect
function createMatrixRain() {
  const canvas = document.createElement('canvas');
  canvas.className = 'matrix-rain';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
  const drops = [];
  const fontSize = 14;
  const columns = canvas.width / fontSize;

  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 33);
} 