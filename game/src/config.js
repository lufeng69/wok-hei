// WOK HEI — config: every tunable number and every piece of data the
// kitchen runs on. Nothing here is copied from any other game: the dishes,
// the ingredients and the numbers are this game's own.

export const VIEW = { width: 1280, height: 720 };

// The eight ingredients on the counter, in bin order (keys 1-8).
export const INGREDIENTS = [
  { id: 'rice', name: 'Rice', cn: '米饭', key: '1', cookSecs: 5.0, color: '#f5f0dc' },
  { id: 'noodles', name: 'Noodles', cn: '面条', key: '2', cookSecs: 5.5, color: '#f2c14e' },
  { id: 'chicken', name: 'Chicken', cn: '鸡丁', key: '3', cookSecs: 6.5, color: '#f2a65e' },
  { id: 'beef', name: 'Beef', cn: '牛肉', key: '4', cookSecs: 7.0, color: '#a5503c' },
  { id: 'shrimp', name: 'Shrimp', cn: '虾球', key: '5', cookSecs: 5.0, color: '#f08a5c' },
  { id: 'egg', name: 'Egg', cn: '鸡蛋', key: '6', cookSecs: 4.0, color: '#ffd94d' },
  { id: 'pepper', name: 'Pepper', cn: '青椒', key: '7', cookSecs: 4.5, color: '#4caf50' },
  { id: 'onion', name: 'Onion', cn: '洋葱', key: '8', cookSecs: 4.5, color: '#e8e0f0' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// The menu. Each dish is a set of ingredients; the plate must hold exactly
// that set (in any order) to match an order ticket.
export const DISHES = [
  { id: 'egg-rice', name: 'Golden Egg Fried Rice', cn: '金蛋炒饭', ingredients: ['rice', 'egg', 'onion'], reward: 60, minDay: 1 },
  { id: 'pepper-chicken', name: 'Pepper Chicken', cn: '椒香鸡丁', ingredients: ['chicken', 'pepper', 'onion'], reward: 70, minDay: 1 },
  { id: 'beef-noodle', name: 'Beef Chow Mein', cn: '香牛炒面', ingredients: ['noodles', 'beef', 'pepper'], reward: 80, minDay: 1 },
  { id: 'garlic-shrimp', name: 'Garlic Shrimp', cn: '蒜香虾球', ingredients: ['shrimp', 'pepper', 'egg'], reward: 80, minDay: 1 },
  { id: 'onion-beef', name: 'Onion Beef Sizzle', cn: '葱爆牛肉', ingredients: ['beef', 'onion', 'egg'], reward: 70, minDay: 1 },
  { id: 'wok-special', name: 'Wok Hei Special', cn: '镬气招牌', ingredients: ['rice', 'chicken', 'egg', 'pepper'], reward: 120, minDay: 2 },
];

// A wok item is perfectly cooked while its cookT sits in this window.
export const PERFECT_MIN = 0.55;
export const PERFECT_MAX = 0.9;

// Heat levels: how fast the wok cooks. LOW is patient, HIGH is a gamble.
export const HEATS = [
  { id: 'low', name: 'LOW', rate: 0.75 },
  { id: 'med', name: 'MED', rate: 1.0 },
  { id: 'high', name: 'HIGH', rate: 1.5 },
];

export const WOK_CAPACITY = 4;
export const PLATE_CAPACITY = 4;
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;

// Per-day pressure. Orders arrive faster and run out of patience sooner.
export function dayTuning(day) {
  return {
    spawnEvery: day <= 1 ? 13 : day === 2 ? 11 : 9,
    maxOrders: day <= 1 ? 3 : 4,
    patience: day <= 1 ? 50 : day === 2 ? 45 : 40,
  };
}

// Layout rectangles, in view coordinates. render.js and input.js share these.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 58 },
  board: { x: 24, y: 70, w: 1232, h: 108 },
  bins: { x: 24, y: 196, w: 300, h: 420 },
  wok: { cx: 560, cy: 420, r: 132 },
  flame: { x: 470, y: 566, w: 180, h: 44 },
  plate: { cx: 1010, cy: 400, r: 118 },
  bell: { x: 950, y: 540, w: 120, h: 64 },
  trash: { x: 1120, y: 540, w: 76, h: 64 },
  hintBar: { x: 0, y: 668, w: 1280, h: 52 },
};

// Bin grid inside LAYOUT.bins: 2 columns x 4 rows.
export function binRect(index) {
  const { x, y, w, h } = LAYOUT.bins;
  const col = index % 2;
  const row = Math.floor(index / 2);
  const bw = w / 2 - 8;
  const bh = h / 4 - 8;
  return { x: x + col * (bw + 8), y: y + row * (bh + 8), w: bw, h: bh };
}
