/**
 * LOTUS BOTANICAL ROMANCE - Floating Petal & Pollen Particle System
 * Creates a soft, romantic atmosphere of drifting lotus petals and golden specks.
 */
class LotusPetalEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.maxPetals = 28;
    this.isRunning = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.colors = [
      { fill: '#F5C1D2', shadow: '#E994B8', alpha: 0.65 },
      { fill: '#E994B8', shadow: '#D67F9F', alpha: 0.55 },
      { fill: '#FDF6F8', shadow: '#F5C1D2', alpha: 0.75 },
      { fill: '#C8B98E', shadow: '#D6C79C', alpha: 0.45, isPollen: true } // Golden ambient dust
    ];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }

    this.start();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createPetal(initial = false) {
    const isPollen = Math.random() < 0.25;
    const color = isPollen ? this.colors[3] : this.colors[Math.floor(Math.random() * 3)];
    
    return {
      x: Math.random() * this.width,
      y: initial ? Math.random() * this.height : -30,
      size: isPollen ? Math.random() * 2.5 + 1 : Math.random() * 14 + 10,
      speedY: isPollen ? Math.random() * 0.4 + 0.2 : Math.random() * 0.9 + 0.6,
      speedX: Math.random() * 0.6 - 0.3,
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      swingPhase: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.015 + 0.008,
      swingAmplitude: Math.random() * 1.8 + 0.8,
      color: color,
      isPollen: isPollen,
      opacity: color.alpha * (Math.random() * 0.4 + 0.7)
    };
  }

  drawPetal(p) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.opacity;

    if (p.isPollen) {
      // Golden luminous shimmer dot
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      grad.addColorStop(0, 'rgba(255, 245, 210, 0.9)');
      grad.addColorStop(0.5, p.color.fill);
      grad.addColorStop(1, 'rgba(200, 185, 142, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Delicate curved lotus petal
      ctx.fillStyle = p.color.fill;
      ctx.shadowColor = p.color.shadow;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.7, p.size * 0.6, 0, p.size);
      ctx.bezierCurveTo(-p.size * 0.7, p.size * 0.6, -p.size * 0.7, -p.size * 0.5, 0, -p.size);
      ctx.closePath();
      ctx.fill();

      // Soft center vein
      ctx.strokeStyle = 'rgba(233, 148, 184, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.8);
      ctx.lineTo(0, p.size * 0.7);
      ctx.stroke();
    }

    ctx.restore();
  }

  update() {
    for (let i = 0; i < this.petals.length; i++) {
      const p = this.petals[i];
      p.swingPhase += p.swingSpeed;
      p.x += Math.sin(p.swingPhase) * p.swingAmplitude + p.speedX;
      p.y += p.speedY;
      p.angle += p.angularSpeed;

      // Wrap around when falling past bottom or side
      if (p.y > this.height + 30) {
        this.petals[i] = this.createPetal(false);
      }
      if (p.x < -40) p.x = this.width + 30;
      if (p.x > this.width + 40) p.x = -30;
    }
  }

  render() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.petals.length; i++) {
      this.drawPetal(this.petals[i]);
    }

    this.update();
    requestAnimationFrame(() => this.render());
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.render();
    }
  }

  stop() {
    this.isRunning = false;
  }
}

// Automatically mount when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.lotusPetalEngine = new LotusPetalEngine('petalCanvas');
});

