document.addEventListener('DOMContentLoaded', () => {
  // Check if device is touch-only or small screen
  const isTouchDevice = ('ontouchstart' in window) || 
    (navigator.maxTouchPoints > 0) || 
    (navigator.msMaxTouchPoints > 0);
  
  const isSmallScreen = window.innerWidth < 768;
  
  // Only proceed if it's not a touch device and screen is large enough
  if (!isTouchDevice && !isSmallScreen) {
    // Create container for effects
    const effectsContainer = document.createElement('div');
    effectsContainer.classList.add('effects-container');
    document.body.appendChild(effectsContainer);
    
    // Fun constants
    const SPARKLES = ['✨', '⭐', '💫', '🌟', '🎇', '🌠', '💖', '🦄', '🌈'];
    const MAX_PARTICLES = 30;
    const BURST_LIFETIME = 1000;
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Handle clicks
    document.addEventListener('click', (e) => {
      createBurst(e.clientX, e.clientY);
    });
    
    function createParticle(x, y) {
      const particle = document.createElement('div');
      particle.classList.add('click-particle');
      
      // Random sparkle and properties
      const emoji = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      const hue = Math.random() * 360;
      const size = Math.random() * 20 + 10;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 100 + 50;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      
      particle.innerHTML = emoji;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.fontSize = `${size}px`;
      particle.style.filter = `hue-rotate(${hue}deg)`;
      particle.style.setProperty('--dx', dx);
      particle.style.setProperty('--dy', dy);
      
      effectsContainer.appendChild(particle);
      
      setTimeout(() => particle.remove(), BURST_LIFETIME);
    }
    
    function createBurst(x, y) {
      const BURST_COUNT = 12;
      for (let i = 0; i < BURST_COUNT; i++) {
        setTimeout(() => {
          createParticle(x, y);
        }, i * 50);
      }
    }
  }
}); 