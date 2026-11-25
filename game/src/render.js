// WOK HEI — everything you see, drawn in code. No images, no fonts from
// the network: canvas shapes, gradients and system fonts only. The hit-test
// positions here are the same ones input.js uses, exported from this file.

import { INGREDIENTS, ING_BY_ID, LAYOUT, PERFECT_MAX, PERFECT_MIN, VIEW, binRect } from './config.js';

export function wokSlotPos(index) {
  const offsets = [[-46, -28], [46, -28], [-46, 34], [46, 34]];
  const [dx, dy] = offsets[index % 4];
  return { x: LAYOUT.wok.cx + dx, y: LAYOUT.wok.cy + dy };
}

export function plateSlotPos(index) {
  const offsets = [[-38, -24], [38, -24], [-38, 28], [38, 28]];
  const [dx, dy] = offsets[index % 4];
  return { x: LAYOUT.plate.cx + dx, y: LAYOUT.plate.cy + dy };
}

export function ticketRect(index) {
  const w = 292;
  const gap = 16;
  return { x: LAYOUT.board.x + 8 + index * (w + gap), y: LAYOUT.board.y + 8, w, h: 92 };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One ingredient, drawn at (x, y) with radius r. Every food in the game is
// one of these eight drawings.
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  const s = r / 26;
  ctx.lineWidth = 2 * s;
  if (id === 'rice') {
    ctx.fillStyle = '#fdfbf3';
    ctx.beginPath();
    ctx.ellipse(0, 4 * s, 20 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e0c8';
    for (const [dx, dy] of [[-10, -2], [0, -6], [10, -1], [-4, 2], [6, 4]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, 2.4 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'noodles') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 4.5 * s;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-16 * s, i * 8 * s);
      ctx.bezierCurveTo(-8 * s, (i * 8 - 7) * s, 0, (i * 8 + 7) * s, 8 * s, i * 8 * s);
      ctx.bezierCurveTo(12 * s, (i * 8 - 4) * s, 14 * s, (i * 8 + 4) * s, 16 * s, i * 8 * s);
      ctx.stroke();
    }
  } else if (id === 'chicken') {
    ctx.fillStyle = '#f2a65e';
    ctx.strokeStyle = '#d97b2e';
    for (const [dx, dy, rot] of [[-7, -4, -0.3], [7, 3, 0.4]]) {
      ctx.save();
      ctx.translate(dx * s, dy * s);
      ctx.rotate(rot);
      roundRect(ctx, -9 * s, -9 * s, 18 * s, 18 * s, 4 * s);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else if (id === 'beef') {
    ctx.fillStyle = '#a5503c';
    ctx.strokeStyle = '#7e3a2a';
    for (const [dx, dy, rot] of [[-6, -5, 0.5], [6, 4, -0.4]]) {
      ctx.save();
      ctx.translate(dx * s, dy * s);
      ctx.rotate(rot);
      roundRect(ctx, -12 * s, -5 * s, 24 * s, 10 * s, 5 * s);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = '#d98a76';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(-12 * s, -3 * s);
    ctx.lineTo(10 * s, -6 * s);
    ctx.moveTo(-10 * s, 6 * s);
    ctx.lineTo(12 * s, 3 * s);
    ctx.stroke();
  } else if (id === 'shrimp') {
    ctx.strokeStyle = '#f08a5c';
    ctx.lineWidth = 7 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 13 * s, Math.PI * 0.15, Math.PI * 1.35);
    ctx.stroke();
    ctx.strokeStyle = '#d96a3c';
    ctx.lineWidth = 2 * s;
    for (const a of [0.5, 0.9, 1.3]) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 8 * s, Math.sin(a) * 8 * s);
      ctx.lineTo(Math.cos(a) * 17 * s, Math.sin(a) * 17 * s);
      ctx.stroke();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8ea';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20 * s, 14 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(2 * s, -1 * s, 8 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath();
    ctx.arc(0, -3 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'pepper') {
    ctx.strokeStyle = '#43a047';
    ctx.lineWidth = 8 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-14 * s, -8 * s);
    ctx.quadraticCurveTo(2 * s, 12 * s, 14 * s, -10 * s);
    ctx.stroke();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(14 * s, -10 * s);
    ctx.lineTo(18 * s, -16 * s);
    ctx.stroke();
  } else if (id === 'onion') {
    ctx.fillStyle = '#f3edf7';
    ctx.strokeStyle = '#b39ddb';
    ctx.lineWidth = 2 * s;
    for (const rad of [16, 11, 6]) {
      ctx.beginPath();
      ctx.arc(0, 0, rad * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawWall(ctx, time) {
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Brick courses.
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let y = 60; y < VIEW.height; y += 46) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.width, y);
    ctx.stroke();
    const off = (y / 46) % 2 === 0 ? 0 : 60;
    for (let x = off; x < VIEW.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 46);
      ctx.stroke();
    }
  }
  // Shelf with jars.
  ctx.fillStyle = '#5d3f24';
  ctx.fillRect(60, 196, 220, 14);
  const jarColors = ['#c96f4a', '#7fae6e', '#d9b45b', '#8a6fb8'];
  jarColors.forEach((color, i) => {
    const x = 78 + i * 50;
    ctx.fillStyle = color;
    roundRect(ctx, x, 158, 34, 38, 6);
    ctx.fill();
    ctx.fillStyle = '#3d2b1a';
    ctx.fillRect(x + 8, 150, 18, 9);
  });
  // Hanging lamps, swaying almost imperceptibly.
  for (const lx of [440, 840, 1180]) {
    const sway = Math.sin(time * 0.6 + lx) * 3;
    ctx.strokeStyle = '#2b1a12';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx + sway, 52);
    ctx.stroke();
    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.moveTo(lx + sway - 22, 52);
    ctx.lineTo(lx + sway + 22, 52);
    ctx.lineTo(lx + sway + 10, 74);
    ctx.lineTo(lx + sway - 10, 74);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,202,40,0.16)';
    ctx.beginPath();
    ctx.arc(lx + sway, 78, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  // Counter top.
  const counter = ctx.createLinearGradient(0, 610, 0, 668);
  counter.addColorStop(0, '#8b5a2b');
  counter.addColorStop(1, '#6f4520');
  ctx.fillStyle = counter;
  ctx.fillRect(0, 610, VIEW.width, 58);
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(0, 610, VIEW.width, 5);
}

function drawTopBar(ctx, game) {
  const k = game.kitchen;
  ctx.fillStyle = '#241610';
  ctx.fillRect(0, 0, VIEW.width, 58);
  ctx.fillStyle = '#ff7043';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WOK HEI', 24, 30);
  text(ctx, '镬气大排档', 150, 31, 15, '#ffb74d');
  text(ctx, `Day ${k.day}`, 300, 30, 18, '#fff3e0');
  text(ctx, `🪙 ${k.coins}`, 400, 30, 18, '#ffd94d');
  text(ctx, `Score ${k.score}`, 520, 30, 18, '#ffffff');
  if (k.combo >= 2) {
    text(ctx, `🔥 Combo x${k.combo}`, 660, 30, 18, '#ff8a65');
  }
  // Hearts.
  for (let i = 0; i < 3; i += 1) {
    text(ctx, i < k.hearts ? '❤' : '🖤', 830 + i * 30, 30, 18, '#ef5350');
  }
  // Shift timer.
  const frac = k.shiftTimeLeft / 150;
  ctx.fillStyle = '#3e2723';
  roundRect(ctx, 940, 20, 200, 18, 9);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#66bb6a' : frac > 0.25 ? '#ffa726' : '#ef5350';
  if (frac > 0) {
    roundRect(ctx, 940, 20, 200 * frac, 18, 9);
    ctx.fill();
  }
  text(ctx, `${Math.ceil(k.shiftTimeLeft)}s`, 1150, 30, 15, '#ffffff');
  // Mute button.
  ctx.fillStyle = '#4e342e';
  roundRect(ctx, 1210, 14, 46, 30, 8);
  ctx.fill();
  text(ctx, game.muted ? '✕' : '♪', 1233, 30, 18, '#ffffff', 'bold', 'center');
}

function drawOrderBoard(ctx, game) {
  const k = game.kitchen;
  const board = LAYOUT.board;
  ctx.fillStyle = '#6d4c2f';
  roundRect(ctx, board.x, board.y, board.w, board.h, 10);
  ctx.fill();
  ctx.fillStyle = '#5d3f24';
  ctx.fillRect(board.x, board.y, board.w, 26);
  text(ctx, 'ORDER BOARD  订单板', board.x + 12, board.y + 13, 14, '#ffcc80');
  if (k.orders.length === 0) {
    text(ctx, 'Waiting for customers…', board.x + 260, board.y + 66, 16, '#d7ccc8');
    return;
  }
  const match = k.matchingOrderIndex();
  k.orders.forEach((order, i) => {
    const r = ticketRect(i);
    const isMatch = i === match;
    ctx.save();
    if (isMatch) {
      ctx.shadowColor = '#ffd94d';
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = isMatch ? '#fff3c4' : '#fff8e7';
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = isMatch ? '#f2b705' : '#d7ccc8';
    ctx.lineWidth = isMatch ? 3 : 1.5;
    roundRect(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();
    text(ctx, order.dish.name, r.x + 10, r.y + 18, 15, '#3e2723');
    text(ctx, order.dish.cn, r.x + 10, r.y + 40, 13, '#8d6e63');
    order.dish.ingredients.forEach((id, j) => {
      drawIngredient(ctx, id, r.x + 24 + j * 40, r.y + 66, 13);
    });
    text(ctx, `🪙${order.reward}`, r.x + r.w - 58, r.y + 66, 14, '#b8860b');
    // Patience bar.
    const frac = Math.max(0, order.patience / order.maxPatience);
    ctx.fillStyle = '#e0d6c8';
    roundRect(ctx, r.x + 10, r.y + 82, r.w - 20, 6, 3);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#66bb6a' : frac > 0.25 ? '#ffa726' : '#ef5350';
    if (frac > 0) {
      roundRect(ctx, r.x + 10, r.y + 82, (r.w - 20) * frac, 6, 3);
      ctx.fill();
    }
    if (isMatch) text(ctx, 'SERVE! ▶', r.x + r.w - 78, r.y + 18, 13, '#c17900');
  });
}

function drawBins(ctx, game) {
  const k = game.kitchen;
  text(ctx, 'INGREDIENTS  食材', LAYOUT.bins.x + 4, LAYOUT.bins.y - 12, 14, '#ffcc80');
  INGREDIENTS.forEach((ing, i) => {
    const r = binRect(i);
    ctx.fillStyle = '#5d4037';
    roundRect(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.fillStyle = '#4e342e';
    roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 8);
    ctx.fill();
    drawIngredient(ctx, ing.id, r.x + r.w / 2, r.y + 34, 24);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 66, 13, '#ffffff', 'bold', 'center');
    text(ctx, ing.cn, r.x + r.w / 2, r.y + 84, 12, '#bcaaa4', 'normal', 'center');
    // Key cap.
    ctx.fillStyle = '#ff7043';
    roundRect(ctx, r.x + 6, r.y + 6, 22, 20, 5);
    ctx.fill();
    text(ctx, ing.key, r.x + 17, r.y + 17, 13, '#ffffff', 'bold', 'center');
    if (k.wok.length >= 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      roundRect(ctx, r.x, r.y, r.w, r.h, 10);
      ctx.fill();
    }
  });
}

function drawFlame(ctx, game) {
  const k = game.kitchen;
  const f = LAYOUT.flame;
  const heat = ['low', 'med', 'high'][k.heatIndex];
  const flick = Math.sin(game.time * 9) * 3 + Math.sin(game.time * 23) * 2;
  // Flame tongues under the wok.
  const flames = [
    { x: 500, h: 26 }, { x: 530, h: 34 }, { x: 560, h: 30 }, { x: 590, h: 36 }, { x: 620, h: 26 },
  ];
  flames.forEach((fl, i) => {
    const h = fl.h + flick * (i % 2 === 0 ? 1 : -1) * (k.heatIndex === 2 ? 1.6 : k.heatIndex === 0 ? 0.6 : 1);
    ctx.fillStyle = i % 2 === 0 ? '#ff9800' : '#ff5722';
    ctx.beginPath();
    ctx.moveTo(fl.x - 11, 566);
    ctx.quadraticCurveTo(fl.x, 566 - h - 12, fl.x + 11, 566);
    ctx.closePath();
    ctx.fill();
  });
  ctx.fillStyle = '#ffcc80';
  ctx.beginPath();
  ctx.arc(560, 566, 5, 0, Math.PI * 2);
  ctx.fill();
  // Heat button.
  ctx.fillStyle = '#4e342e';
  roundRect(ctx, f.x, f.y, f.w, f.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#ff7043';
  ctx.lineWidth = 2;
  roundRect(ctx, f.x, f.y, f.w, f.h, 10);
  ctx.stroke();
  text(ctx, `HEAT: ${heat.toUpperCase()}  (H)`, f.x + f.w / 2, f.y + f.h / 2, 16, '#ffcc80', 'bold', 'center');
}

function drawWok(ctx, game) {
  const k = game.kitchen;
  const { cx, cy, r } = LAYOUT.wok;
  // Wok body.
  const grad = ctx.createRadialGradient(cx - 30, cy - 40, 20, cx, cy, r);
  grad.addColorStop(0, '#546e7a');
  grad.addColorStop(1, '#263238');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78909c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  // Inner sheen.
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 16, Math.PI * 1.15, Math.PI * 1.6);
  ctx.stroke();
  // Items cooking inside.
  k.wok.forEach((item, i) => {
    const pos = wokSlotPos(i);
    const shakeX = item.shake > 0 ? Math.sin(game.time * 40) * 4 : 0;
    const px = pos.x + shakeX;
    const py = pos.y;
    if (item.burnt) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 26, 0, Math.PI * 2);
      ctx.fill();
      drawIngredient(ctx, item.id, px, py, 20);
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px - 14, py - 14);
      ctx.lineTo(px + 14, py + 14);
      ctx.moveTo(px + 14, py - 14);
      ctx.lineTo(px - 14, py + 14);
      ctx.stroke();
      text(ctx, 'BURNT', px, py - 34, 11, '#ff8a65', 'bold', 'center');
      return;
    }
    // Perfect-zone arc, faint green, then the progress arc.
    ctx.strokeStyle = 'rgba(102,187,106,0.35)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px, py, 30, -Math.PI / 2 + PERFECT_MIN * Math.PI * 2, -Math.PI / 2 + PERFECT_MAX * Math.PI * 2);
    ctx.stroke();
    const inZone = item.cookT >= PERFECT_MIN && item.cookT <= PERFECT_MAX;
    ctx.strokeStyle = inZone ? '#66bb6a' : '#90a4ae';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px, py, 30, -Math.PI / 2, -Math.PI / 2 + Math.min(1, item.cookT) * Math.PI * 2);
    ctx.stroke();
    if (inZone) {
      ctx.fillStyle = `rgba(102,187,106,${0.25 + 0.2 * Math.sin(game.time * 6)})`;
      ctx.beginPath();
      ctx.arc(px, py, 34, 0, Math.PI * 2);
      ctx.fill();
    }
    drawIngredient(ctx, item.id, px, py, 20);
    if (item.cookT < PERFECT_MIN) {
      text(ctx, `${Math.ceil((PERFECT_MIN - item.cookT) * ING_BY_ID[item.id].cookSecs)}s`, px, py + 40, 11, '#eceff1', 'bold', 'center');
    } else {
      text(ctx, 'READY!', px, py - 38, 11, '#a5d6a7', 'bold', 'center');
    }
  });
  if (k.wok.length === 0) {
    text(ctx, 'Click ingredients to toss them in', cx, cy, 14, '#b0bec5', 'normal', 'center');
  }
  drawFlame(ctx, game);
}

function drawPlateArea(ctx, game) {
  const k = game.kitchen;
  const { cx, cy, r } = LAYOUT.plate;
  text(ctx, 'PLATE  摆盘', cx - 60, cy - r - 14, 14, '#ffcc80');
  // Plate.
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0bec5';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.78, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fafafa';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r - 18, r * 0.78 - 14, 0, 0, Math.PI * 2);
  ctx.fill();
  k.plate.forEach((item, i) => {
    const pos = plateSlotPos(i);
    drawIngredient(ctx, item.id, pos.x, pos.y, 20);
  });
  if (k.plate.length === 0) {
    text(ctx, 'Empty plate', cx, cy, 14, '#90a4ae', 'normal', 'center');
  }
  // Serve bell: pulses gold when a ticket matches the plate.
  const match = k.matchingOrderIndex() >= 0;
  const bell = LAYOUT.bell;
  const pulse = match ? 1 + 0.08 * Math.sin(game.time * 8) : 1;
  ctx.save();
  ctx.translate(bell.x + bell.w / 2, bell.y + bell.h / 2);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = match ? '#ffd94d' : '#8d6e63';
  ctx.beginPath();
  ctx.arc(0, 4, 26, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-30, 4, 60, 6);
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(-4, -26, 8, 8);
  ctx.restore();
  text(ctx, 'SERVE', bell.x + bell.w / 2, bell.y + bell.h - 6, 12, match ? '#ffd94d' : '#bcaaa4', 'bold', 'center');
  // Trash can.
  const trash = LAYOUT.trash;
  ctx.fillStyle = '#546e7a';
  roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 8);
  ctx.fill();
  ctx.fillStyle = '#37474f';
  ctx.fillRect(trash.x - 4, trash.y - 6, trash.w + 8, 10);
  text(ctx, '🗑', trash.x + trash.w / 2, trash.y + 26, 22, '#ffffff', 'normal', 'center');
  text(ctx, 'TRASH (T)', trash.x + trash.w / 2, trash.y + trash.h - 6, 10, '#cfd8dc', 'bold', 'center');
}

function drawHintBar(ctx) {
  const bar = LAYOUT.hintBar;
  ctx.fillStyle = '#241610';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  text(ctx, '1–8 ingredients   •   Click wok items to plate   •   Space: plate all ready   •   Enter: serve   •   H: heat   •   P: pause   •   M: mute', 640, bar.y + 26, 14, '#d7ccc8', 'normal', 'center');
}

function drawParticles(ctx, game) {
  const k = game.kitchen;
  for (const p of k.particles) {
    ctx.fillStyle = `rgba(255,255,255,${0.35 * (p.life / p.maxLife)})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (1.6 - p.life / p.maxLife * 0.6), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPopups(ctx, game) {
  for (const popup of game.kitchen.popups) {
    ctx.globalAlpha = Math.min(1, popup.life);
    text(ctx, popup.text, popup.x, popup.y, 20, popup.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  }
}

function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(20,10,5,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'WOK HEI', 640, 190, 84, '#ff7043', 'bold', 'center');
  text(ctx, '镬气大排档', 640, 260, 34, '#ffd94d', 'bold', 'center');
  text(ctx, 'A wok-station cooking game — take orders, mind the wok, serve before the timer runs out.', 640, 310, 18, '#fff3e0', 'normal', 'center');
  ctx.fillStyle = 'rgba(255,248,231,0.92)';
  roundRect(ctx, 340, 350, 600, 150, 12);
  ctx.fill();
  text(ctx, 'HOW TO PLAY', 640, 378, 18, '#bf360c', 'bold', 'center');
  text(ctx, '1. Click an ingredient (or press 1–8) to toss it in the wok.', 640, 410, 16, '#3e2723', 'normal', 'center');
  text(ctx, '2. Watch the ring: plate it while it is green — too long and it burns.', 640, 436, 16, '#3e2723', 'normal', 'center');
  text(ctx, '3. Match a ticket on the order board, then ring the bell to serve.', 640, 462, 16, '#3e2723', 'normal', 'center');
  const blink = Math.sin(game.time * 4) > 0;
  if (blink) text(ctx, 'Click or press Enter to start  •  Day 1: 150 seconds', 640, 560, 20, '#ffffff', 'bold', 'center');
  if (game.bestScore > 0) text(ctx, `Best score: ${game.bestScore}`, 640, 600, 16, '#ffcc80', 'normal', 'center');
}

function drawResults(ctx, game) {
  const k = game.kitchen;
  ctx.fillStyle = 'rgba(20,10,5,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff8e7';
  roundRect(ctx, 390, 140, 500, 400, 16);
  ctx.fill();
  text(ctx, `Day ${k.day} — Shift Over`, 640, 185, 30, '#3e2723', 'bold', 'center');
  // Stars.
  let stars = '';
  for (let i = 0; i < 3; i += 1) stars += i < k.stars() ? '★' : '☆';
  text(ctx, stars, 640, 235, 40, '#f2b705', 'bold', 'center');
  const rows = [
    [`Dishes served`, `${k.served}`],
    [`Coins earned`, `${k.coins}`],
    [`Best combo`, `x${k.bestCombo}`],
    [`Orders walked out`, `${k.missed}`],
    [`Burnt items`, `${k.burntCount}`],
    [`Score`, `${k.score}`],
  ];
  rows.forEach(([label, value], i) => {
    const y = 285 + i * 34;
    text(ctx, label, 450, y, 18, '#6d4c41');
    text(ctx, value, 830, y, 18, '#3e2723', 'bold', 'right');
  });
  const blink = Math.sin(game.time * 4) > 0;
  if (blink) text(ctx, 'Press Enter for the next day  •  R to restart', 640, 505, 18, '#bf360c', 'bold', 'center');
}

export function drawGame(ctx, game) {
  const k = game.kitchen;
  drawWall(ctx, game.time);
  if (game.screen === 'title') {
    drawTopBar(ctx, game);
    drawOrderBoard(ctx, game);
    drawBins(ctx, game);
    drawWok(ctx, game);
    drawPlateArea(ctx, game);
    drawHintBar(ctx);
    drawTitle(ctx, game);
    return;
  }
  drawTopBar(ctx, game);
  drawOrderBoard(ctx, game);
  drawBins(ctx, game);
  drawWok(ctx, game);
  drawPlateArea(ctx, game);
  drawParticles(ctx, game);
  drawPopups(ctx, game);
  drawHintBar(ctx);
  if (game.screen === 'results') drawResults(ctx, game);
  if (game.screen === 'paused') {
    ctx.fillStyle = 'rgba(20,10,5,0.6)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text(ctx, 'PAUSED', 640, 330, 48, '#ffffff', 'bold', 'center');
    text(ctx, 'Press P to resume', 640, 390, 20, '#ffcc80', 'normal', 'center');
  }
  void k;
}
