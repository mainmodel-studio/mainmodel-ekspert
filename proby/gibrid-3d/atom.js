// Атом 703 №155 (gdgtify, «доказательство как механизм»), пересаженный на тему «как мы держим срок».
// Раскладка 1920×1080. Чистая функция времени: drawAtom(ctx, t), t ∈ [0 … 9.5] — время задаёт прокрутка.
const POR = '#F0EEE6', GR = '#222522', GN = '#416B53', OR = '#E78636';
const HEAVY = s => `800 ${s}px Futura,"Avenir Next","Arial Black",sans-serif`;
const MONO = s => `700 ${s}px "PT Mono",Menlo,Consolas,monospace`;
const SERIF = s => `italic 400 ${s}px "PT Serif",Georgia,serif`;
export const W = 1920, H = 1080, T_END = 9.5;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const P = (t, a, d) => sm((t - a) / d);
const L = (a, b, k) => a + (b - a) * k;
const eo = p => { p = clamp(p); return 1 - Math.pow(1 - p, 3); };

let g; // контекст текущего кадра
function txt(s, x, y, font, col, a = 1, al = 'left', base = 'alphabetic') {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = font; g.fillStyle = col; g.textAlign = al; g.textBaseline = base; g.fillText(s, x, y); g.restore();
}
function hatch(x, y, w, h, col) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.strokeStyle = col; g.lineWidth = 3;
  for (let k = -h; k < w + h; k += 16) { g.beginPath(); g.moveTo(x + k, y + h); g.lineTo(x + k + h, y); g.stroke(); }
  g.restore(); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(x, y, w, h);
}

// ── заголовок: строки поднимаются из маски, одна строка оранжевая ──
const HD = [
  [0.0, ['ШЕСТЬ ЭТАПОВ.', 'ОДИН ГРАФИК.'], 1],
  [1.7, ['ЗАПУСКАЕМ', 'ВСЕ ЭТАПЫ.'], 1],
  [3.6, ['ЗАПАС:', '+14 ДНЕЙ.'], 1],
  [4.9, ['ПРИЁМКА:', 'ВСЕ ЭТАПЫ ОК.'], 1],
  [6.9, ['23 ИЗ 23', 'СДАНЫ В СРОК.'], 0],
  [8.4, ['СРОК —', 'ЭТО СИСТЕМА.'], 1],
];
const HX = 96, HY = 118, LH = 100, FS = 92, HMAX = 1100;
function heading(t) {
  HD.forEach(([s, lines, acc], k) => {
    const next = HD[k + 1] ? HD[k + 1][0] : 1e9;
    lines.forEach((ln, j) => {
      const a = eo((t - s - j * .08) / .45), e = eo((t - next + .42 - j * .05) / .3); // старый уходит целиком до прихода нового
      if (a <= 0 || e >= 1) return;
      const top = HY + j * LH, dy = (1 - a) * LH - e * (LH + 30); // уходит с запасом — без огрызков букв у края маски
      g.save(); g.beginPath(); g.rect(HX - 10, top, HMAX + 40, LH); g.clip();
      g.font = HEAVY(FS); const w = g.measureText(ln).width, sx = Math.min(1, HMAX / w);
      g.translate(HX, top + 82 + dy); g.scale(sx, 1);
      g.fillStyle = j === acc ? OR : GR; g.textBaseline = 'alphabetic'; g.fillText(ln, 0, 0);
      g.restore();
    });
  });
}

// ── колёса этапов, ремень, стоп «дата в договоре» ──
const WY = 540, WR = 62, WX = i => 150 + i * 170;
const STAGES = ['КОТЛОВАН', 'КАРКАС', 'КРОВЛЯ', 'ФАСАД', 'ОТДЕЛКА', 'СДАЧА'];
function wheel(cx, cy, r, label, rot, a) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(cx, cy);
  g.fillStyle = POR; g.strokeStyle = GR; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r - 12, 0, 7); g.stroke();
  g.save(); g.rotate(rot); for (let k = 0; k < 24; k++) { g.rotate(Math.PI / 12); g.beginPath(); g.moveTo(r - 12, 0); g.lineTo(r - (k % 2 ? 18 : 24), 0); g.stroke(); } g.restore();
  g.font = HEAVY(34); g.fillStyle = GR; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 0, 2);
  g.restore();
}
function rack(t) {
  const run = Math.max(0, t - 1.7);
  // ремень
  const bA = P(t, 1.2, .5);
  if (bA > 0) {
    const x0 = WX(0), x1 = WX(5), top = WY - WR - 7, bot = WY + WR + 7, R = WR + 7;
    g.save(); g.globalAlpha *= bA; g.strokeStyle = GN; g.lineWidth = 6; g.setLineDash([22, 12]); g.lineDashOffset = -run * 260;
    g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.arc(x1, WY, R, -Math.PI / 2, Math.PI / 2); g.lineTo(x0, bot); g.arc(x0, WY, R, Math.PI / 2, Math.PI * 1.5); g.stroke();
    g.restore();
  }
  // колёса падают по очереди
  for (let i = 0; i < 6; i++) {
    const k = eo((t - .25 - i * .14) / .5), y = WY - (1 - k) * 90;
    wheel(WX(i), y, WR, String(i + 1).padStart(2, '0'), run * 2.2, k);
    txt(STAGES[i], WX(i), WY + WR + 52, MONO(20), GR, k, 'center');
  }
  // карточки задач едут по ремню
  if (t > 1.7) {
    for (let n = 0; n < 9; n++) {
      const x = WX(0) - 40 + ((run * 260 + n * 118) % 1060);
      const fade = clamp((WX(5) + 30 - x) / 60) * clamp((x - WX(0) + 60) / 50) * P(t, 1.7, .4);
      g.save(); g.globalAlpha *= fade; g.fillStyle = OR; g.fillRect(x - 18, WY - WR - 34, 36, 22); g.restore();
    }
  }
  // стоп «дата в договоре» и зазор +14 дней
  const sA = P(t, 1.0, .4), SX = 1196;
  if (sA > 0) {
    g.save(); g.globalAlpha *= sA; hatch(SX, WY - 95, 44, 190, GR); g.restore();
    txt('ДАТА В', SX + 22, WY - 136, MONO(18), GR, sA, 'center');
    txt('ДОГОВОРЕ', SX + 22, WY - 112, MONO(18), GR, sA, 'center');
  }
  const gA = P(t, 3.6, .35);
  if (gA > 0) {
    const x0 = WX(5) + WR + 18, x1 = L(x0, SX - 8, eo((t - 3.6) / .5)), y = WY + WR + 16;
    g.save(); g.globalAlpha *= gA; g.strokeStyle = OR; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x0, y - 14); g.lineTo(x0, y); g.lineTo(x1, y); g.lineTo(x1, y - 14); g.stroke(); g.restore();
    txt('+14 ДН.', (x0 + SX - 8) / 2, y + 30, HEAVY(22), OR, gA, 'center');
  }
}

// ── барабанный счётчик «день сдачи» ──
const CX0 = 1300, CW = 150, CHh = 190, CY = 520;
function digitWin(i, v) {
  const x = CX0 + i * (CW + 12), y = CY - CHh / 2, place = Math.pow(10, 2 - i);
  const d = v / place, cur = Math.floor(d) % 10;
  const lower = v % place, frac = place === 1 ? d - Math.floor(d) : clamp(lower - (place - 1));
  g.fillStyle = '#E4E1D6'; g.fillRect(x, y, CW, CHh);
  g.save(); g.beginPath(); g.rect(x, y, CW, CHh); g.clip();
  g.font = HEAVY(150); g.fillStyle = GR; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(cur), x + CW / 2, CY + 8 - frac * CHh); g.fillText(String((cur + 1) % 10), x + CW / 2, CY + 8 + (1 - frac) * CHh);
  g.restore();
  g.strokeStyle = GR; g.lineWidth = 4; g.strokeRect(x, y, CW, CHh);
  g.lineWidth = 2; g.beginPath(); g.moveTo(x, CY); g.lineTo(x + 10, CY); g.moveTo(x + CW - 10, CY); g.lineTo(x + CW, CY); g.stroke();
}
function counter(t) {
  const a = P(t, .5, .5); if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  txt('ДЕНЬ СДАЧИ ОБЪЕКТА № 23', CX0, CY - CHh / 2 - 22, MONO(20), GR);
  const v = 412 * eo((t - 1.7) / 1.8);
  for (let i = 0; i < 3; i++) digitWin(i, v);
  txt('ПО ДОГОВОРУ — ДЕНЬ 426', CX0, CY + CHh / 2 + 36, MONO(20), GR, P(t, 3.0, .4));
  g.restore();
  // оранжевая карточка «+14 дней запаса» со вспышкой
  const k = eo((t - 3.6) / .45);
  if (k > 0) {
    const x = L(CX0 + 90, CX0, k), y = CY + CHh / 2 + 56;
    g.save(); g.globalAlpha *= k; g.fillStyle = OR; g.fillRect(x, y, 474, 62);
    txt('+14 ДНЕЙ ЗАПАСА', x + 237, y + 44, HEAVY(34), POR, 1, 'center'); g.restore();
    const fl = clamp(1 - Math.abs(t - 4.05) / .25) * .55;
    if (fl > 0) { g.save(); g.globalAlpha = fl; g.fillStyle = OR; g.fillRect(CX0 - 14, CY - CHh / 2 - 14, 3 * CW + 24 + 28, CHh + 28); g.restore(); }
  }
}

// ── шлюзы приёмки: 6 актов, окно прокатывается до ✓ ──
const GY = 780, GW = 270, GH = 140, GX = i => 96 + i * 292;
function gates(t) {
  const out = 1 - P(t, 6.5, .3); if (out <= 0) return;
  for (let i = 0; i < 6; i++) {
    const a = eo((t - 4.9 - i * .07) / .4) * out; if (a <= 0) continue;
    const x = GX(i), y = GY + (1 - a) * 30;
    g.save(); g.globalAlpha *= a;
    g.fillStyle = POR; g.fillRect(x, y, GW, GH); g.strokeStyle = GR; g.lineWidth = 3; g.strokeRect(x, y, GW, GH);
    g.fillStyle = GN; g.fillRect(x + 14, y + 14, 92, GH - 28);
    txt('АКТ', x + 60, y + 60, MONO(18), POR, 1, 'center'); txt(String(i + 1).padStart(2, '0'), x + 60, y + 108, HEAVY(42), POR, 1, 'center');
    txt(STAGES[i], x + 120, y + 40, MONO(17), GR);
    const wx = x + 122, wy = y + 54, ww = 132, wh = 70, r = eo((t - 5.2 - i * .24) / .3);
    g.fillStyle = '#E4E1D6'; g.fillRect(wx, wy, ww, wh);
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    txt('···', wx + ww / 2, wy + wh / 2 - r * wh + 4, HEAVY(46), GR, 1, 'center', 'middle');
    g.fillStyle = OR; g.fillRect(wx, wy + (1 - r) * wh, ww, wh);
    txt('✓ OK', wx + ww / 2, wy + wh / 2 + (1 - r) * wh + 2, HEAVY(40), POR, 1, 'center', 'middle');
    g.restore(); g.strokeStyle = GR; g.lineWidth = 3; g.strokeRect(wx, wy, ww, wh);
    g.restore();
  }
}

// ── открытый ящик: 23 объекта из 23 ──
function box(t) {
  const a = P(t, 6.9, .35) * (1 - P(t, 8.4, .25)); if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  const x = 96, y = 780, w = 1728, h = 150;
  g.strokeStyle = GR; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y); g.stroke();
  const n = Math.floor(23 * clamp((t - 7.05) / 1.0) + 1e-6);
  txt(String(Math.max(n, 0)).padStart(2, '0'), x + 40, y + 126, HEAVY(124), OR);
  txt('ИЗ 23 ОБЪЕКТОВ', x + 250, y + 72, HEAVY(40), GR);
  txt('СДАНЫ В СРОК ИЛИ РАНЬШЕ · 2011 — 2026', x + 252, y + 114, MONO(20), GR);
  for (let k = 0; k < 23; k++) {
    const cx = x + 1010 + (k % 12) * 58, cy = y + 22 + Math.floor(k / 12) * 60;
    g.lineWidth = 3; g.strokeStyle = GR; g.strokeRect(cx, cy, 44, 44);
    if (k < n) { g.fillStyle = OR; g.fillRect(cx + 6, cy + 6, 32, 32); }
  }
  g.restore();
}

// ── финал: формула ──
function finale(t) {
  const k = eo((t - 8.6) / .55); if (k <= 0) return;
  const y = 780, h = 150;
  g.save(); g.beginPath(); g.rect(96, y, 1728 * k, h); g.clip();
  g.fillStyle = GR; g.fillRect(96, y, 1728, h);
  txt('Срок = график + 14 дней запаса', 140, y + 80, SERIF(60), POR);
  txt('ДОГОВОР ФИКСИРУЕТ ДАТУ СДАЧИ · КАЖДЫЙ ЭТАП — АКТ ПРИЁМКИ', 142, y + 122, MONO(20), '#BFC3BD');
  g.restore();
}

function marks() {
  g.strokeStyle = GR; g.lineWidth = 3; const m = 40, l = 28;
  for (const [x, y, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + sy * l); g.lineTo(x, y); g.lineTo(x + sx * l, y); g.stroke();
  }
  txt('ОПОРА · КАК МЫ ДЕРЖИМ СРОК', 96, 82, MONO(22), GR);
  txt('СХЕМА 01 / 01', W - 96, 82, MONO(22), GR, 1, 'right');
}

export function drawAtom(ctx, t) {
  g = ctx; t = clamp(t, 0, T_END);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.fillStyle = POR; g.fillRect(0, 0, W, H);
  marks(); heading(t); rack(t); counter(t); gates(t); box(t); finale(t);
}
