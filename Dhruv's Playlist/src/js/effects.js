/**
 * Visual Effects Engine
 * Renders multiple ambient visual effects on HTML5 Canvas.
 */

export class VisualEffects {
  constructor(canvasElement, toggleButton) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.btn = toggleButton;
    this.animId = null;

    // Modes: 0=Off, 1=Rain, 2=Dust, 3=Snow
    this.modeNames = ['Off', 'Rain', 'Dust', 'Snow'];
    this.modeIcons = [
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>', // Off
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M16 14v6"></path><path d="M8 14v6"></path><path d="M12 16v6"></path></svg>', // Rain
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76l-.71-.71"></path><path d="M14 3h-4"></path><path d="M7.76 7.76l.71-.71"></path><path d="M3 14v-4"></path><path d="M7.76 16.24l.71.71"></path><path d="M14 21h-4"></path><path d="M16.24 16.24l-.71.71"></path><path d="M21 14v-4"></path></svg>', // Dust
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M12 2v20"></path><path d="M4.93 4.93l14.14 14.14"></path><path d="M4.93 19.07L19.07 4.93"></path></svg>'  // Snow
    ];

    this.mode = 0;
    this.particles = [];
    this.condense = [];
    this.drips = [];

    this._init();
  }

  _init() {
    this._resize();
    window.addEventListener('resize', () => this._resize());

    const savedMode = parseInt(localStorage.getItem('visual_effect_mode'), 10);
    if (!isNaN(savedMode) && savedMode >= 0 && savedMode < this.modeNames.length) {
      this.mode = savedMode;
    }

    if (this.btn) {
      this.btn.addEventListener('click', () => this.toggle());
    }

    this._updateUI();
    this._populate();
    
    if (this.mode !== 0) {
      this.start();
    }
  }

  _resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this._populate();
  }

  _populate() {
    this.particles = [];
    this.condense = [];
    this.drips = [];

    if (this.mode === 1) {
      // Rain
      const streakCount = Math.floor((this.width * this.height) / 8000);
      for (let i = 0; i < streakCount; i++) {
        this.particles.push({
          x: Math.random() * (this.width + 100) - 50,
          y: Math.random() * this.height,
          length: Math.random() * 25 + 15,
          speed: Math.random() * 14 + 10,
          opacity: Math.random() * 0.4 + 0.15,
          thickness: Math.random() * 1.5 + 0.8,
        });
      }
      const glassDropCount = Math.floor((this.width * this.height) / 12000);
      for (let i = 0; i < glassDropCount; i++) {
        this.condense.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          r: Math.random() * 3 + 1.2,
          alpha: Math.random() * 0.6 + 0.3,
        });
      }
      const dripCount = Math.floor(this.width / 180);
      for (let i = 0; i < dripCount; i++) {
        this.drips.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          r: Math.random() * 3.5 + 2.2,
          speed: Math.random() * 0.8 + 0.2,
        });
      }
    } else if (this.mode === 2) {
      // Dust / Bokeh
      const dustCount = Math.floor((this.width * this.height) / 30000); // 50% less particles
      for (let i = 0; i < dustCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          r: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5 - 0.2,
          opacity: Math.random() * 0.5 + 0.1,
          pulse: Math.random() * 0.02,
          pulseDir: Math.random() > 0.5 ? 1 : -1
        });
      }
    } else if (this.mode === 3) {
      // Snow
      const snowCount = Math.floor((this.width * this.height) / 9000);
      for (let i = 0; i < snowCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          r: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 1,
          speedY: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          swing: Math.random() * Math.PI * 2,
          swingSpeed: Math.random() * 0.05
        });
      }
    }
  }

  toggle() {
    this.mode = (this.mode + 1) % this.modeNames.length;
    localStorage.setItem('visual_effect_mode', this.mode.toString());
    this._updateUI();
    this._populate();
    
    if (this.mode === 0) {
      this.stop();
    } else if (!this.animId) {
      this.start();
    }
  }

  _updateUI() {
    if (this.btn) {
      if (this.mode !== 0) {
        this.btn.classList.add('is-active');
      } else {
        this.btn.classList.remove('is-active');
      }
      const iconSpan = this.btn.querySelector('span');
      if (iconSpan) iconSpan.textContent = this.modeNames[this.mode];
      
      const svg = this.modeIcons[this.mode];
      const currentSvg = this.btn.querySelector('svg');
      if (currentSvg) {
        currentSvg.outerHTML = svg;
      }
    }
    
    if (this.mode !== 0) {
      this.canvas.classList.add('is-active');
    } else {
      this.canvas.classList.remove('is-active');
    }
  }

  start() {
    if (!this.animId) {
      this._loop();
    }
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  _loop() {
    if (this.mode === 0) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.mode === 1) {
      this._renderRain();
    } else if (this.mode === 2) {
      this._renderDust();
    } else if (this.mode === 3) {
      this._renderSnow();
    }

    this.animId = requestAnimationFrame(() => this._loop());
  }

  _renderRain() {
    this.ctx.lineWidth = 1.2;
    for (let i = 0; i < this.particles.length; i++) {
      const d = this.particles[i];
      d.y += d.speed;
      d.x -= d.speed * 0.12; 

      if (d.y > this.height) {
        d.y = -d.length;
        d.x = Math.random() * (this.width + 100) - 50;
      }

      const grad = this.ctx.createLinearGradient(d.x, d.y, d.x - d.length * 0.12, d.y + d.length);
      grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
      grad.addColorStop(1, `rgba(220, 235, 255, ${d.opacity})`);

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = d.thickness;
      this.ctx.beginPath();
      this.ctx.moveTo(d.x, d.y);
      this.ctx.lineTo(d.x - d.length * 0.12, d.y + d.length);
      this.ctx.stroke();
    }

    for (let i = 0; i < this.condense.length; i++) {
      const c = this.condense[i];
      this._drawWaterDrop(c.x, c.y, c.r, c.alpha);
    }

    for (let i = 0; i < this.drips.length; i++) {
      const dr = this.drips[i];
      dr.y += dr.speed;
      dr.x += (Math.random() - 0.5) * 0.2; 

      if (dr.y > this.height + 20) {
        dr.y = -10;
        dr.x = Math.random() * this.width;
      }
      this._drawWaterDrop(dr.x, dr.y, dr.r, 0.75);
    }
  }

  _drawWaterDrop(x, y, r, alpha) {
    this.ctx.beginPath();
    this.ctx.arc(x + r * 0.25, y + r * 0.25, r, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.35})`;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    const dropGrad = this.ctx.createRadialGradient(
      x - r * 0.3, y - r * 0.3, r * 0.1,
      x, y, r
    );
    dropGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
    dropGrad.addColorStop(0.5, `rgba(180, 210, 245, ${alpha * 0.4})`);
    dropGrad.addColorStop(1, `rgba(40, 60, 90, ${alpha * 0.6})`);

    this.ctx.fillStyle = dropGrad;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
    this.ctx.fill();
  }

  _renderDust() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      
      p.opacity += p.pulse * p.pulseDir;
      if (p.opacity > 0.8) { p.pulseDir = -1; }
      else if (p.opacity < 0.1) { p.pulseDir = 1; }

      if (p.y < -10) p.y = this.height + 10;
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity})`;
      this.ctx.fill();
    }
  }

  _renderSnow() {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.swing += p.swingSpeed;
      p.x += p.speedX + Math.sin(p.swing) * 0.5;
      p.y += p.speedY;

      if (p.y > this.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.fill();
    }
  }
}
