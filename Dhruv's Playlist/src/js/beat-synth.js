/**
 * Beat Synth Particle Effect
 * Generates an anti-gravity field of particles that pulse to a simulated BPM.
 */

const COLORS = ["#e8a33d", "#8fc9e8", "#f5efe0"];
const NUM_PARTICLES = 25;
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let canvas, ctx;
let width, height;
let particles = [];

let isPlaying = false;
let currentBpm = 100;
let lastTime = 0;
let lastBeatTime = 0;
let globalOpacity = 0; // smoothly fades in/out
let rafId = null;

class Particle {
  constructor() {
    this.reset(true);
    // Randomize initial Y so they don't all start at the bottom
    this.y = Math.random() * height;
  }

  reset(isInit = false) {
    this.x = Math.random() * width;
    this.y = isInit ? (Math.random() * height) : (height + 20);
    this.baseRadius = Math.random() * 3 + 2;
    this.baseSpeedY = -(Math.random() * 20 + 15); // drift up 15-35 px/sec
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.swayPhase = Math.random() * Math.PI * 2;
    this.swaySpeed = Math.random() * 0.5 + 0.5;
    this.swayAmp = Math.random() * 30 + 10;
    
    this.kickScale = 1.0;
    this.kickVelocity = 0;
  }

  kick() {
    // Pulse the size and slightly boost upward speed temporarily
    this.kickScale = 2.2;
    this.kickVelocity = -40;
  }

  update(dt, time) {
    // Decay the kick effects smoothly
    this.kickScale += (1.0 - this.kickScale) * 5 * dt;
    this.kickVelocity += (0 - this.kickVelocity) * 3 * dt;

    // Movement
    this.y += (this.baseSpeedY + this.kickVelocity) * dt;
    
    // Sway
    const sway = Math.sin(time * this.swaySpeed + this.swayPhase) * this.swayAmp;
    
    // Recycle
    if (this.y < -50) {
      this.reset();
    }

    return { x: this.x + sway, y: this.y };
  }

  draw(ctx, pos, alphaMultiplier) {
    // Edge fading (fade out near top and bottom edges)
    let edgeAlpha = 1;
    const edgeDist = 150;
    if (this.y > height - edgeDist) {
      edgeAlpha = (height - this.y) / edgeDist;
    } else if (this.y < edgeDist) {
      edgeAlpha = this.y / edgeDist;
    }
    edgeAlpha = Math.max(0, Math.min(1, edgeAlpha));

    const alpha = 0.6 * edgeAlpha * alphaMultiplier;
    const r = this.baseRadius * this.kickScale;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fill();

    // Glow
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15 * this.kickScale;
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }
}

function init() {
  if (REDUCED_MOTION) return;

  canvas = document.getElementById("beat-synth");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", handleVisibility);

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle());
  }
}

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

function handleVisibility() {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  } else {
    if (globalOpacity > 0 || isPlaying) {
      lastTime = performance.now();
      loop(lastTime);
    }
  }
}

function triggerBeat() {
  particles.forEach(p => p.kick());
}

function loop(time) {
  if (document.hidden) return;

  const dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt at 100ms
  lastTime = time;

  // Global fade in/out based on playing state
  const targetOpacity = isPlaying ? 1 : 0;
  globalOpacity += (targetOpacity - globalOpacity) * 2 * dt;

  if (globalOpacity < 0.01 && !isPlaying) {
    // Fully faded out and paused, stop loop to save CPU
    globalOpacity = 0;
    ctx.clearRect(0, 0, width, height);
    rafId = null;
    return;
  }

  // Handle Beat Clock
  if (isPlaying && currentBpm > 0) {
    const beatInterval = 60000 / currentBpm;
    if (time - lastBeatTime >= beatInterval) {
      triggerBeat();
      lastBeatTime = time;
    }
  }

  // Draw
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    const pos = p.update(dt, time / 1000);
    p.draw(ctx, pos, globalOpacity);
  });

  rafId = requestAnimationFrame(loop);
}

export function setBeatSynthPlaying(playing, bpm = 100) {
  if (REDUCED_MOTION || !canvas) return;
  
  isPlaying = playing;
  currentBpm = bpm;

  if (isPlaying && !rafId) {
    lastTime = performance.now();
    lastBeatTime = lastTime; // reset beat sync
    rafId = requestAnimationFrame(loop);
  }
}

// Auto-initialize when module loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
