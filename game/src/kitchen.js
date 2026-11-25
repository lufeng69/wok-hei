// WOK HEI — the kitchen itself: orders, the wok, the plate, the shift.
// Everything the player can do goes through here, and every rule lives here
// so the renderer only draws and the input only points.

import { DISHES, HEATS, ING_BY_ID, MAX_HEARTS, PERFECT_MAX, PERFECT_MIN, PLATE_CAPACITY, SHIFT_SECONDS, WOK_CAPACITY, dayTuning } from './config.js';
import { mulberry32, pick } from './rng.js';

let orderUid = 0;

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const rest = [...b];
  for (const item of a) {
    const at = rest.indexOf(item);
    if (at < 0) return false;
    rest.splice(at, 1);
  }
  return true;
}

export class Kitchen {
  constructor(seed) {
    this.rng = mulberry32(seed >>> 0 || 1);
    this.events = [];
    this.reset(1);
  }

  reset(day) {
    this.day = day;
    this.tuning = dayTuning(day);
    this.orders = [];
    this.wok = [];
    this.plate = [];
    this.coins = 0;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.hearts = MAX_HEARTS;
    this.served = 0;
    this.missed = 0;
    this.burntCount = 0;
    this.shiftTimeLeft = SHIFT_SECONDS;
    this.shiftOver = false;
    this.heatIndex = 1;
    this.spawnTimer = 2.5;
    this.popups = [];
    this.particles = [];
    this.time = 0;
    this.spawnOrder();
  }

  emit(type, data) {
    this.events.push({ type, data });
  }

  drainEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }

  popup(text, x, y, color) {
    this.popups.push({ text, x, y, color: color || '#ffffff', life: 1.4 });
  }

  spawnOrder() {
    const menu = DISHES.filter((dish) => dish.minDay <= this.day);
    const dish = pick(this.rng, menu);
    const order = {
      uid: orderUid += 1,
      dish,
      patience: this.tuning.patience,
      maxPatience: this.tuning.patience,
      reward: dish.reward,
    };
    this.orders.push(order);
    this.emit('bell');
  }

  update(dt) {
    this.time += dt;
    if (this.shiftOver) return;

    // Shift clock.
    this.shiftTimeLeft -= dt;
    if (this.shiftTimeLeft <= 0) {
      this.shiftTimeLeft = 0;
      this.shiftOver = true;
      return;
    }

    // New orders on a schedule.
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.tuning.spawnEvery * (0.9 + this.rng() * 0.2);
      if (this.orders.length < this.tuning.maxOrders) this.spawnOrder();
    }

    // Patience runs out: the customer walks.
    for (let i = this.orders.length - 1; i >= 0; i -= 1) {
      const order = this.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        this.orders.splice(i, 1);
        this.hearts -= 1;
        this.missed += 1;
        this.combo = 0;
        this.emit('miss');
        this.popup('Walked out!', 640, 130, '#ff7a6b');
        if (this.hearts <= 0) this.shiftOver = true;
      }
    }

    // The wok cooks. Heat sets the pace; every ingredient has its own time.
    const rate = HEATS[this.heatIndex].rate;
    for (let i = this.wok.length - 1; i >= 0; i -= 1) {
      const item = this.wok[i];
      if (item.burnt) continue;
      const wasInZone = item.cookT >= PERFECT_MIN && item.cookT <= PERFECT_MAX;
      item.cookT += (dt * rate) / ING_BY_ID[item.id].cookSecs;
      const nowInZone = item.cookT >= PERFECT_MIN && item.cookT <= PERFECT_MAX;
      if (!wasInZone && nowInZone) item.glow = 1;
      if (item.cookT >= 1) {
        item.burnt = true;
        item.cookT = 1;
        this.burntCount += 1;
        this.emit('burnt');
        this.popup('Burnt!', 560, 330, '#ff9a3d');
      }
      if (item.shake > 0) item.shake -= dt;
      if (item.glow > 0) item.glow -= dt * 0.8;
    }

    // Steam wisps over anything cooking.
    if (this.wok.length > 0 && this.rng() < dt * 14) {
      this.particles.push({
        x: 500 + this.rng() * 120, y: 340, vx: (this.rng() - 0.5) * 12,
        vy: -34 - this.rng() * 22, life: 1.1, maxLife: 1.1, size: 5 + this.rng() * 7,
      });
    }

    // Popups float up and fade; particles drift and fade.
    for (let i = this.popups.length - 1; i >= 0; i -= 1) {
      const popup = this.popups[i];
      popup.life -= dt;
      popup.y -= 26 * dt;
      if (popup.life <= 0) this.popups.splice(i, 1);
    }
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  addIngredient(id) {
    if (this.shiftOver || this.wok.length >= WOK_CAPACITY) return false;
    this.wok.push({ id, cookT: 0, burnt: false, shake: 0, glow: 0 });
    this.emit('pop');
    return true;
  }

  wokItemDone(item) {
    return !item.burnt && item.cookT >= PERFECT_MIN && item.cookT <= PERFECT_MAX;
  }

  wokItemRaw(item) {
    return !item.burnt && item.cookT < PERFECT_MIN;
  }

  // Click an item in the wok: done ones go to the plate, burnt ones to the
  // trash, raw ones just shake — they need more time.
  clickWokItem(index) {
    const item = this.wok[index];
    if (!item) return 'none';
    if (item.burnt) {
      this.wok.splice(index, 1);
      this.emit('trash');
      return 'trashed';
    }
    if (this.wokItemDone(item)) {
      if (this.plate.length >= PLATE_CAPACITY) return 'plate-full';
      this.plate.push({ id: item.id });
      this.wok.splice(index, 1);
      this.emit('ding');
      return 'plated';
    }
    item.shake = 0.35;
    this.emit('raw');
    return 'raw';
  }

  // Plate every item that is sitting in its perfect window.
  plateAllDone() {
    let count = 0;
    for (let i = this.wok.length - 1; i >= 0; i -= 1) {
      if (this.plate.length >= PLATE_CAPACITY) break;
      if (this.wokItemDone(this.wok[i])) {
        this.plate.push({ id: this.wok[i].id });
        this.wok.splice(i, 1);
        count += 1;
      }
    }
    if (count > 0) this.emit('ding');
    return count;
  }

  clearPlate() {
    if (this.plate.length === 0) return false;
    this.plate = [];
    this.emit('trash');
    this.popup('Plate cleared', 1010, 330, '#cfd8dc');
    return true;
  }

  plateMatches(order) {
    return sameSet(this.plate.map((item) => item.id), order.dish.ingredients);
  }

  matchingOrderIndex() {
    for (let i = 0; i < this.orders.length; i += 1) {
      if (this.plateMatches(this.orders[i])) return i;
    }
    return -1;
  }

  // Serve the ticket. Only an exact match leaves the kitchen.
  serveOrder(index) {
    const order = this.orders[index];
    if (!order || !this.plateMatches(order)) return false;
    const bonus = 5 * this.combo;
    const earned = order.reward + bonus;
    this.coins += earned;
    this.score += 100 + 25 * this.combo;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.served += 1;
    this.orders.splice(index, 1);
    this.plate = [];
    this.emit('coin');
    this.popup(`+${earned} coins`, 1010, 300, '#ffd94d');
    return true;
  }

  cycleHeat() {
    this.heatIndex = (this.heatIndex + 1) % HEATS.length;
    this.emit('heat');
    return HEATS[this.heatIndex];
  }

  // Rating for the results screen, 0-3 stars.
  stars() {
    if (this.served >= 10) return 3;
    if (this.served >= 6) return 2;
    if (this.served >= 3) return 1;
    return 0;
  }
}
