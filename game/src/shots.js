// WOK HEI — the ?shot= scenes. Each one drives the real kitchen forward
// from a fresh seeded world with a scripted player (add, wait, plate, serve),
// so every frame is the game itself playing, and the same seed always gives
// the same frame. No compositing, no borrowed pixels.

import { PERFECT_MIN } from './config.js';
import { Kitchen } from './kitchen.js';

const STEP = 1 / 60;
const SHOT_SEED = 20261125;

// Step the kitchen forward, stopping early when `until` turns true.
function stepUntil(game, seconds, until) {
  const steps = Math.ceil(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    game.kitchen.update(STEP);
    game.time = game.kitchen.time;
    if (until && until()) return true;
  }
  return false;
}

// Toss one ingredient in, wait for its perfect window, plate it.
function cookAndPlate(game, id, timeout = 30) {
  if (!game.kitchen.addIngredient(id)) return false;
  const ready = stepUntil(game, timeout, () => {
    const item = game.kitchen.wok.find((w) => w.id === id);
    return !item || (item.cookT >= PERFECT_MIN && item.cookT <= 0.9);
  });
  if (!ready) return false;
  const index = game.kitchen.wok.findIndex((w) => w.id === id);
  if (index < 0) return false;
  return game.kitchen.clickWokItem(index) === 'plated';
}

// Fill the plate for the first order on the board, but do not serve it.
function completePlate(game) {
  if (!stepUntil(game, 25, () => game.kitchen.orders.length > 0)) return false;
  const order = game.kitchen.orders[0];
  // The staged order is fresh: it cannot walk out mid-scene.
  order.patience = order.maxPatience;
  for (const id of order.dish.ingredients) {
    if (game.kitchen.plate.some((p) => p.id === id)) continue;
    if (!cookAndPlate(game, id)) return false;
  }
  return game.kitchen.matchingOrderIndex() === 0;
}

// Cook and serve the first order on the board, start to finish.
function serveFirstOrder(game) {
  if (!completePlate(game)) return false;
  return game.kitchen.serveOrder(0);
}

// Keep every ticket comfortably away from expiring so the bars read well.
function steadyPatience(game) {
  game.kitchen.orders.forEach((order, i) => {
    if (order.patience < 18) order.patience = 22 + i * 8;
  });
}

export function stageShot(name, game) {
  game.kitchen = new Kitchen(SHOT_SEED);
  game.screen = 'play';
  game.time = 0;

  if (name === 'start') {
    stepUntil(game, 5);
    game.screen = 'title';
    return;
  }

  if (name === 'serve') {
    completePlate(game);
    // One more ingredient sizzling in the wok for depth.
    if (game.kitchen.orders.length > 1) {
      const extra = game.kitchen.orders[1].dish.ingredients[0];
      game.kitchen.addIngredient(extra);
      stepUntil(game, 3);
    }
    steadyPatience(game);
    game.screen = 'play';
    return;
  }

  if (name === 'end') {
    for (let i = 0; i < 3; i += 1) {
      if (!serveFirstOrder(game)) break;
    }
    game.kitchen.shiftTimeLeft = 0.5;
    stepUntil(game, 2);
    game.screen = 'results';
    return;
  }

  // Default: 'cooking' — a dish mid-assembly, one item in its perfect
  // window in the wok, another still raw, orders waiting, timer running.
  stepUntil(game, 25, () => game.kitchen.orders.length >= 2);
  const order = game.kitchen.orders[0];
  const [first, second, third] = order.dish.ingredients;
  cookAndPlate(game, first);
  cookAndPlate(game, second);
  game.kitchen.addIngredient(third);
  stepUntil(game, 12, () => {
    const item = game.kitchen.wok.find((w) => w.id === third);
    return !item || item.cookT >= 0.62;
  });
  if (game.kitchen.orders.length > 1) {
    game.kitchen.addIngredient(game.kitchen.orders[1].dish.ingredients[0]);
    stepUntil(game, 1);
  }
  steadyPatience(game);
  game.screen = 'play';
}
