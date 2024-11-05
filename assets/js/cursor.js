document.addEventListener('DOMContentLoaded', () => {
  // Remove any existing elements
  document.querySelectorAll('.following-duck, .trail-container').forEach(el => el.remove());
  
  // Create duck and trail container
  const duck = document.createElement('div');
  duck.classList.add('following-duck');
  duck.innerHTML = '🦆';
  
  const trailContainer = document.createElement('div');
  trailContainer.classList.add('trail-container');
  
  document.body.appendChild(duck);
  document.body.appendChild(trailContainer);
  
  // Fun constants
  const SPARKLES = ['✨', '⭐', '💫', '🌟', '🎇', '🌠', '💖', '🦄', '🌈'];
  const DUCK_EMOJIS = ['🦆', '🦢', '🐤', '🐥', '🐣'];
  const MAX_TRAILS = 25;
  const TRAIL_LIFETIME = 1000;
  
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let duckX = mouseX;
  let duckY = mouseY;
  let isHyper = false;
  let duckMood = 0; // 0-100, affects behavior
  
  // Click counter for easter egg
  let clickCount = 0;
  
  // Handle clicks
  document.addEventListener('click', () => {
    clickCount++;
    duckMood += 10;
    
    // Create burst effect
    createBurst(mouseX, mouseY);
    
    // Easter egg: After 5 clicks, duck goes hyper
    if (clickCount > 5) {
      isHyper = true;
      duck.classList.add('hyper');
      setTimeout(() => {
        isHyper = false;
        duck.classList.remove('hyper');
        clickCount = 0;
        duckMood = Math.max(0, duckMood - 50);
      }, 5000);
    }
  });
  
  // Update mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Create more trails when hyper
    const sparkleChance = isHyper ? 0.8 : 0.3;
    if (Math.random() < sparkleChance) {
      createSparkle(duckX, duckY);
    }
  });
  
  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle-trail');
    
    // Random sparkle and color
    const emoji = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
    const hue = Math.random() * 360;
    const size = Math.random() * 20 + 10;
    
    sparkle.innerHTML = emoji;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.fontSize = `${size}px`;
    sparkle.style.filter = `hue-rotate(${hue}deg)`;
    
    trailContainer.appendChild(sparkle);
    
    // Random rotation and movement
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    sparkle.style.setProperty('--dx', dx);
    sparkle.style.setProperty('--dy', dy);
    
    setTimeout(() => sparkle.remove(), TRAIL_LIFETIME);
  }
  
  function createBurst(x, y) {
    const BURST_COUNT = isHyper ? 20 : 12;
    for (let i = 0; i < BURST_COUNT; i++) {
      setTimeout(() => {
        const angle = (i / BURST_COUNT) * Math.PI * 2;
        createSparkle(
          x + Math.cos(angle) * 50,
          y + Math.sin(angle) * 50
        );
      }, i * 50);
    }
  }
  
  // Animate duck following cursor
  function updateDuck() {
    const dx = mouseX - duckX;
    const dy = mouseY - duckY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Speed varies with mood and hyper state
    const baseSpeed = 0.08;
    const moodBonus = (duckMood / 100) * 0.1;
    const hyperBonus = isHyper ? 0.2 : 0;
    const speed = baseSpeed + moodBonus + hyperBonus;
    
    // Update position with some chaos when hyper
    duckX += dx * speed + (isHyper ? (Math.random() - 0.5) * 10 : 0);
    duckY += dy * speed + (isHyper ? (Math.random() - 0.5) * 10 : 0);
    
    // Update duck element
    duck.style.left = `${duckX}px`;
    duck.style.top = `${duckY}px`;
    
    // Flip and rotate based on movement
    const rotation = isHyper ? Math.sin(Date.now() / 100) * 30 : 0;
    duck.style.transform = `translate(-50%, -50%) 
                           scaleX(${dx > 0 ? 1 : -1}) 
                           rotate(${rotation}deg)`;
    
    // Change duck emoji based on mood and state
    if (isHyper) {
      duck.innerHTML = DUCK_EMOJIS[Math.floor(Math.random() * DUCK_EMOJIS.length)];
    }
    
    // Add running animation when moving
    if (distance > 5) {
      duck.classList.add('running');
    } else {
      duck.classList.remove('running');
      duckMood = Math.max(0, duckMood - 0.1); // Calm down when still
    }
    
    requestAnimationFrame(updateDuck);
  }
  
  updateDuck();
  
  // Easter egg: Konami code
  let konamiCode = [];
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    if (konamiCode.length > KONAMI.length) {
      konamiCode.shift();
    }
    
    if (konamiCode.join(',') === KONAMI.join(',')) {
      // Super hyper mode!
      isHyper = true;
      duckMood = 100;
      duck.classList.add('hyper', 'rainbow');
      document.body.classList.add('rainbow-mode');
      
      // Create massive burst
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          createBurst(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight
          );
        }, i * 100);
      }
      
      setTimeout(() => {
        isHyper = false;
        duckMood = 0;
        duck.classList.remove('hyper', 'rainbow');
        document.body.classList.remove('rainbow-mode');
      }, 10000);
      
      konamiCode = [];
    }
  });
}); 