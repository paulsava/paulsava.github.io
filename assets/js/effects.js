// Add sparkles that follow the cursor
document.addEventListener('mousemove', (e) => {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  sparkle.style.left = e.pageX + 'px';
  sparkle.style.top = e.pageY + 'px';
  document.body.appendChild(sparkle);
  
  setTimeout(() => sparkle.remove(), 1000);
});

// Add this to your CSS
.sparkle {
  position: fixed;
  pointer-events: none;
  width: 5px;
  height: 5px;
  background: $neon-pink;
  border-radius: 50%;
  animation: sparkleOut 1s ease-out forwards;
}

@keyframes sparkleOut {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
} 