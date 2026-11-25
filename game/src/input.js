// WOK HEI — mouse and keyboard. Clicks are mapped from the page's CSS
// pixels back into the 1280x720 view; the hit areas are the same rectangles
// render.js draws, so what you see is what you can click.

import { INGREDIENTS, LAYOUT, binRect } from './config.js';
import { plateSlotPos, ticketRect, wokSlotPos } from './render.js';

function inside(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

function near(x, y, pos, radius) {
  const dx = x - pos.x;
  const dy = y - pos.y;
  return dx * dx + dy * dy <= radius * radius;
}

export function attachInput(canvas, game) {
  function toView(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  function clickAt(x, y) {
    const k = game.kitchen;
    if (game.screen === 'title') {
      game.start();
      return;
    }
    if (game.screen === 'results') return;
    if (game.screen === 'paused') {
      game.togglePause();
      return;
    }
    // Mute button, top right.
    if (inside(x, y, { x: 1210, y: 14, w: 46, h: 30 })) {
      game.toggleMute();
      return;
    }
    // Ingredient bins.
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (inside(x, y, binRect(i))) {
        k.addIngredient(INGREDIENTS[i].id);
        return;
      }
    }
    // Items cooking in the wok.
    for (let i = 0; i < k.wok.length; i += 1) {
      if (near(x, y, wokSlotPos(i), 34)) {
        k.clickWokItem(i);
        return;
      }
    }
    // Heat button under the wok.
    if (inside(x, y, LAYOUT.flame)) {
      k.cycleHeat();
      return;
    }
    // Serve bell.
    if (inside(x, y, LAYOUT.bell)) {
      game.tryServe(k.matchingOrderIndex());
      return;
    }
    // Trash can clears the plate.
    if (inside(x, y, LAYOUT.trash)) {
      k.clearPlate();
      return;
    }
    // Order tickets: serve the one you tapped, if the plate matches it.
    for (let i = 0; i < k.orders.length; i += 1) {
      if (inside(x, y, ticketRect(i))) {
        game.tryServe(i);
        return;
      }
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    game.audio.ensure();
    clickAt(toView(event).x, toView(event).y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const k = game.kitchen;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      game.toggleMute();
      return;
    }
    if (game.screen === 'title') {
      if (key === 'enter' || key === ' ') {
        event.preventDefault();
        game.audio.ensure();
        game.start();
      }
      return;
    }
    if (game.screen === 'results') {
      if (key === 'enter') game.nextDay();
      if (key === 'r') game.restart();
      return;
    }
    if (key === 'p' || key === 'escape') {
      game.togglePause();
      return;
    }
    if (game.screen === 'paused') return;
    game.audio.ensure();
    if (key >= '1' && key <= '8') {
      k.addIngredient(INGREDIENTS[Number(key) - 1].id);
    } else if (key === ' ') {
      event.preventDefault();
      k.plateAllDone();
    } else if (key === 'enter') {
      game.tryServe(k.matchingOrderIndex());
    } else if (key === 'h') {
      k.cycleHeat();
    } else if (key === 't') {
      k.clearPlate();
    }
  });
}
