class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.hue = 240; // Start with blue
    this.connections = [];
    
    this.resize();
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
  }
  
  resize() {
    this.canvas.width = this.canvas.parentElement.offsetWidth;
    this.canvas.height = this.canvas.parentElement.offsetHeight;
  }
  
  init() {
    this.particles = [];
    const numberOfParticles = Math.floor((this.canvas.width * this.canvas.height) / 10000);
    
    for (let i = 0; i < numberOfParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        initialRadius: Math.random() * 2 + 0.5,
        color: `hsla(${Math.random() * 60 + this.hue}, 100%, 70%, 0.8)`,
        phase: Math.random() * Math.PI * 2,
        energy: Math.random()
      });
    }
  }
  
  drawConnections() {
    this.connections = [];
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          this.connections.push({
            start: this.particles[i],
            end: this.particles[j],
            opacity: 1 - (distance / 100)
          });
        }
      }
    }
    
    this.connections.forEach(connection => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${connection.opacity * 0.2})`;
      this.ctx.lineWidth = 0.5;
      this.ctx.moveTo(connection.start.x, connection.start.y);
      this.ctx.lineTo(connection.end.x, connection.end.y);
      this.ctx.stroke();
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.hue = (this.hue + 0.1) % 360;
    
    this.drawConnections();
    
    this.particles.forEach(p => {
      // Update position with fluid motion
      p.energy += 0.01;
      p.x += p.vx + Math.sin(p.phase + p.energy) * 0.2;
      p.y += p.vy + Math.cos(p.phase + p.energy) * 0.2;
      
      // Wrap around screen
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      
      // React to mouse
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;
      
      if (dist < maxDist) {
        const force = (maxDist - dist) / maxDist;
        const angle = Math.atan2(dy, dx);
        p.vx = p.vx * 0.9 - Math.cos(angle) * force * 0.8;
        p.vy = p.vy * 0.9 - Math.sin(angle) * force * 0.8;
        p.radius = p.initialRadius * (1 + force);
      } else {
        p.vx = p.vx * 0.99;
        p.vy = p.vy * 0.99;
        p.radius = p.initialRadius;
      }
      
      // Draw particle with enhanced glow
      this.ctx.beginPath();
      const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
      gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 70%, 0.2)`);
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      this.ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize particle systems for all cards
document.querySelectorAll('.particles').forEach(canvas => {
  new ParticleSystem(canvas);
}); 