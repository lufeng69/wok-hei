// WOK HEI — the entry point. Owns the loop, the screens, the sound wiring
// and the ?shot= staging hook. The rules live in kitchen.js, the pictures
// in render.js, the clicks in input.js.

import { SoundBank } from './audio.js';
import { attachInput } from './input.js';
import { Kitchen } from './kitchen.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';
import { ticketRect } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  kitchen: new Kitchen((Date.now() % 2147483647) >>> 0),
  screen: 'title',
  bestScore: 0,
  muted: false,
  time: 0,
  audio: new SoundBank(),

  start() {
    this.audio.ensure();
    this.audio.startMusic();
    this.audio.startSizzle();
    this.screen = 'play';
  },

  togglePause() {
    if (this.screen === 'play') this.screen = 'paused';
    else if (this.screen === 'paused') this.screen = 'play';
  },

  toggleMute() {
    this.muted = !this.muted;
    this.audio.setMuted(this.muted);
  },

  nextDay() {
    this.kitchen.reset(this.kitchen.day + 1);
    this.screen = 'play';
  },

  restart() {
    this.kitchen.reset(1);
    this.screen = 'play';
  },

  tryServe(index) {
    const k = this.kitchen;
    if (index < 0) {
      if (k.plate.length > 0) k.popup('No ticket matches this plate', 640, 240, '#ffcc80');
      return;
    }
    if (!k.serveOrder(index)) {
      const r = ticketRect(index);
      k.popup('Wrong ingredients for this ticket', r.x + r.w / 2, r.y - 14, '#ff8a65');
    }
  },
};

function playSounds(events) {
  for (const event of events) {
    if (event.type === 'pop') game.audio.pop();
    else if (event.type === 'ding') game.audio.ding();
    else if (event.type === 'coin') game.audio.coin();
    else if (event.type === 'burnt' || event.type === 'miss') game.audio.buzz();
    else if (event.type === 'bell') game.audio.bell();
    else if (event.type === 'trash') game.audio.noise(0.12, 0.14, 900);
    else if (event.type === 'raw') game.audio.tone(280, 0.06, 'triangle', 0.1);
    else if (event.type === 'heat') game.audio.tone(440, 0.08, 'triangle', 0.14);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - frame.last) / 1000 || 0.016);
  frame.last = now;
  game.time += dt;
  if (game.screen === 'play') {
    game.kitchen.update(dt);
    playSounds(game.kitchen.drainEvents());
    game.audio.setSizzleLevel(game.kitchen.wok.length);
    if (game.kitchen.shiftOver) {
      game.screen = 'results';
      game.bestScore = Math.max(game.bestScore, game.kitchen.score);
      game.audio.setSizzleLevel(0);
    }
  }
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}
frame.last = 0;

// Test and screenshot hooks: the real state, and a flag the screenshot
// script waits on before it takes the frame.
window.__wok = game;
window.__shotReady = false;

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  // A staged scene: one deterministic frame, no live loop.
  game.audio = new SoundBank();
  stageShot(shot, game);
  drawGame(ctx, game);
  window.__shotReady = true;
} else {
  attachInput(canvas, game);
  requestAnimationFrame(frame);
  window.__shotReady = true;
}
