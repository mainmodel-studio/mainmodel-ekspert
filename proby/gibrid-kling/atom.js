// Атом 703 №155 (gdgtify, «доказательство как механизм»), пересаженный на тему «квартира изнутри».
// Рисуется на ПРОЗРАЧНОМ холсте прямо поверх видео Kling, в координатах кадра видео (1920×1068).
// Чистая функция времени: drawAtom(ctx, t, vis), t ∈ [0 … T_END] — время задаёт прокрутка.
// vis — видимая часть кадра в координатах видео (object-fit: cover обрезает края).
const POR = '#F0EEE6', GR = '#222522', GN = '#416B53', OR = '#E78636';
const PLATE = 'rgba(240,238,230,.88)';           // фарфоровая плашка с лёгкой прозрачностью
const HEAVY = s => `800 ${s}px Futura,"Avenir Next","Arial Black",sans-serif`;
const MONO = s => `700 ${s}px "PT Mono",Menlo,Consolas,monospace`;
const SERIF = s => `italic 400 ${s}px "PT Serif",Georgia,serif`;
export const W = 1920, H = 1068, T_END = 9;

// спокойные зоны финального кадра (доли кадра) — правятся по глазу
export const Z = {
  head:  { x0: .12, y0: .025 },                // потолок x .12–.85: заголовок-лента
  cnt:   { cx: .446, y0: .235 },               // стена x .40–.49, y .23–.47: счётчик
  list:  { x0: .735, y0: .20, y1: .66 },       // правая стена (спокойна .20–.37, ниже солнце — плашки плотные)
  floor: { x0: .172, x1: .883, y: .86 },       // пол y .70–1: размерная линия от стены до стены
};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const P = (t, a, d) => sm((t - a) / d);
const L = (a, b, k) => a + (b - a) * k;
const eo = p => { p = clamp(p); return 1 - Math.pow(1 - p, 3); };
const eb = p => { p = clamp(p); const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }; // лёгкий перелёт

let g; // контекст текущего кадра
function txt(s, x, y, font, col, a = 1, al = 'left', base = 'alphabetic') {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = font; g.fillStyle = col; g.textAlign = al; g.textBaseline = base; g.fillText(s, x, y); g.restore();
}
function plate(x, y, w, h, a = 1, fill = PLATE) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  g.shadowColor = 'rgba(20,22,20,.28)'; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.fillStyle = fill; g.fillRect(x, y, w, h); g.restore();
}

// ── заголовок на потолке: каждая строка — лента-плашка, строки поднимаются из маски ──
const HD = [
  [0.0, ['ВЫ УЖЕ', 'ВНУТРИ.']],
  [1.9, ['ПЛОЩАДЬ:', '64 М² С БАЛКОНОМ.']],
  [4.0, ['ПЯТЬ ЗОН —', 'ВСЕ ГОТОВЫ.']],
  [6.0, ['ГОСТИНАЯ', 'ШИРИНОЙ 8,4 М.']],
  [7.6, ['ЗАЕЗЖАЙТЕ', 'В ДЕНЬ СДЕЛКИ.']],
];
const FS = 54, LH = 70;
function heading(t, vis) {
  const HX = Math.max(vis.x0 + 70, W * Z.head.x0), HY = H * Z.head.y0 + Math.max(0, vis.y0);
  HD.forEach(([s, lines], k) => {
    const next = HD[k + 1] ? HD[k + 1][0] : 1e9;
    lines.forEach((ln, j) => {
      const a = eo((t - s - j * .08) / .45), e = eo((t - next + .42 - j * .05) / .3);
      if (a <= 0 || e >= 1) return;
      const top = HY + j * (LH + 6), dy = (1 - a) * (LH + 4) - e * (LH + 20);
      g.font = HEAVY(FS); const w = g.measureText(ln).width + 40;
      g.save(); g.beginPath(); g.rect(HX - 4, top, 1400, LH); g.clip(); // маска ровно по ленте — без волоска сверху/снизу
      g.translate(0, dy);
      g.fillStyle = j === 1 ? OR : PLATE; g.fillRect(HX, top, w, LH);
      g.fillStyle = j === 1 ? POR : GR; g.textBaseline = 'alphabetic'; g.fillText(ln, HX + 20, top + 54);
      g.restore();
    });
  });
}

// ── метки рамки по видимой части кадра ──
function marks(t, vis) {
  const a = P(t, 0, .5); if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.strokeStyle = POR; g.lineWidth = 3; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6;
  const m = 36, l = 28;
  const lowA = 1 - P(t, 7.6, .3); // нижние метки уступают место финальной полосе
  for (const [x, y, sx, sy] of [[vis.x0 + m, vis.y0 + m, 1, 1], [vis.x1 - m, vis.y0 + m, -1, 1], [vis.x0 + m, vis.y1 - m, 1, -1], [vis.x1 - m, vis.y1 - m, -1, -1]]) {
    g.globalAlpha = a * (sy < 0 ? lowA : 1); g.beginPath(); g.moveTo(x, y + sy * l); g.lineTo(x, y); g.lineTo(x + sx * l, y); g.stroke();
  }
  g.restore();
  const lbl = 'КВАРТИРА 9.04 · СХЕМА 01 / 01';
  g.font = MONO(18); const w = g.measureText(lbl).width + 28, x = vis.x1 - 70 - w, y = vis.y0 + 52;
  plate(x, y, w, 34, a, 'rgba(34,37,34,.78)'); txt(lbl, x + 14, y + 23, MONO(18), POR, a);
}

// ── барабанный счётчик площади 000 → 064 м² ──
const DW = 42, DH = 68, DG = 5, PAD = 14;
function digitWin(x, y, i, v) {
  const place = Math.pow(10, 2 - i), d = v / place, cur = Math.floor(d) % 10;
  const lower = v % place, frac = place === 1 ? d - Math.floor(d) : clamp(lower - (place - 1));
  g.fillStyle = '#E4E1D6'; g.fillRect(x, y, DW, DH);
  g.save(); g.beginPath(); g.rect(x, y, DW, DH); g.clip();
  g.font = HEAVY(56); g.fillStyle = GR; g.textAlign = 'center'; g.textBaseline = 'middle';
  const cy = y + DH / 2 + 5;
  g.fillText(String(cur), x + DW / 2, cy - frac * DH); g.fillText(String((cur + 1) % 10), x + DW / 2, cy + (1 - frac) * DH);
  g.restore();
  g.strokeStyle = GR; g.lineWidth = 3; g.strokeRect(x, y, DW, DH);
  g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + DH / 2); g.lineTo(x + 8, y + DH / 2); g.moveTo(x + DW - 8, y + DH / 2); g.lineTo(x + DW, y + DH / 2); g.stroke();
}
function counter(t) {
  const k = eb((t - 1.6) / .5); if (k <= 0) return;
  const out = 1 - P(t, 7.4, .3); if (out <= 0) return;
  const pw = 3 * DW + 2 * DG + 2 * PAD, ph = DH + 110, x = W * Z.cnt.cx - pw / 2, y = H * Z.cnt.y0 + (1 - k) * 30;
  const a = clamp(k) * out;
  plate(x, y, pw, ph, a);
  g.save(); g.globalAlpha *= a;
  txt('ПЛОЩАДЬ', x + PAD, y + 28, MONO(14), GR);
  const v = 64 * eo((t - 1.9) / 1.7);
  for (let i = 0; i < 3; i++) digitWin(x + PAD + i * (DW + DG), y + 40, i, v);
  txt('М²', x + PAD, y + DH + 78, HEAVY(28), OR);
  txt('С БАЛКОНОМ', x + PAD, y + DH + 100, MONO(12), GR, P(t, 3.4, .4));
  // вспышка, когда барабан встал
  const fl = clamp(1 - Math.abs(t - 3.65) / .22) * .5;
  if (fl > 0) { g.globalAlpha = fl * a; g.fillStyle = OR; g.fillRect(x - 8, y - 8, pw + 16, ph + 16); }
  g.restore();
}

// ── шлюзы-чеклист комнат: окно прокатывается до ✓ ──
const ROOMS = [['ГОСТИНАЯ', '22,4'], ['КУХНЯ', '11,8'], ['СПАЛЬНЯ', '14,6'], ['САНУЗЕЛ', '5,2'], ['БАЛКОН', '4,2']];
function gates(t) {
  const out = 1 - P(t, 7.4, .3); if (out <= 0) return;
  const x = W * Z.list.x0, y0 = H * Z.list.y0, hh = H * (Z.list.y1 - Z.list.y0), pw = 296;
  const hA = P(t, 3.9, .35) * out;
  if (hA > 0) { plate(x, y0, pw, 44, hA, 'rgba(34,37,34,.82)'); txt('ГОТОВНОСТЬ ЗОН', x + 18, y0 + 29, MONO(17), POR, hA); }
  const rh = (hh - 56) / 5 - 8;
  ROOMS.forEach(([name, area], i) => {
    const a = eo((t - 4.0 - i * .09) / .4) * out; if (a <= 0) return;
    const ry = y0 + 56 + i * (rh + 8), rx = x + (1 - a) * 40;
    plate(rx, ry, pw, rh, a);
    g.save(); g.globalAlpha *= a;
    g.fillStyle = GN; g.fillRect(rx, ry, 8, rh);
    txt(name, rx + 26, ry + rh / 2 - 4, HEAVY(24), GR);
    txt(area + ' М²', rx + 26, ry + rh / 2 + 24, MONO(16), GR);
    const ww = 96, wh = rh - 26, wx = rx + pw - ww - 14, wy = ry + 13, r = eo((t - 4.35 - i * .28) / .3);
    g.fillStyle = '#E4E1D6'; g.fillRect(wx, wy, ww, wh);
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    txt('···', wx + ww / 2, wy + wh / 2 - r * wh + 4, HEAVY(38), GR, 1, 'center', 'middle');
    g.fillStyle = OR; g.fillRect(wx, wy + (1 - r) * wh, ww, wh);
    txt('✓', wx + ww / 2, wy + wh / 2 + (1 - r) * wh + 2, HEAVY(40), POR, 1, 'center', 'middle');
    g.restore(); g.strokeStyle = GR; g.lineWidth = 2; g.strokeRect(wx, wy, ww, wh);
    g.restore();
  });
}

// ── размерная линия по полу: растёт от центра, засечки, плашка «8,4 м» ──
function dimLine(t) {
  const k = eo((t - 6.0) / .7), out = 1 - P(t, 7.5, .3); if (k <= 0 || out <= 0) return;
  const x0 = W * Z.floor.x0, x1 = W * Z.floor.x1, y = H * Z.floor.y, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2 * k;
  g.save(); g.globalAlpha *= out; g.strokeStyle = POR; g.lineWidth = 4; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 8;
  g.beginPath(); g.moveTo(cx - hw, y); g.lineTo(cx + hw, y); g.stroke();
  const tk = P(t, 6.55, .2) * 22;
  if (tk > 0) {
    g.beginPath(); g.moveTo(x0, y - tk); g.lineTo(x0, y + tk); g.moveTo(x1, y - tk); g.lineTo(x1, y + tk);
    // засечки-стрелки под 45°, как на чертеже
    g.moveTo(x0 - 10, y + 10); g.lineTo(x0 + 10, y - 10); g.moveTo(x1 - 10, y + 10); g.lineTo(x1 + 10, y - 10); g.stroke();
  }
  g.restore();
  const cA = eb((t - 6.5) / .4) * out;
  if (cA > 0) {
    const w = 170, h = 58, s = clamp(cA, 0, 1.2);
    g.save(); g.translate(cx, y); g.scale(s, s); g.translate(-cx, -y);
    plate(cx - w / 2, y - h / 2, w, h, clamp(cA), OR);
    txt('8,4 М', cx, y + 2, HEAVY(34), POR, clamp(cA), 'center', 'middle');
    g.restore();
  }
}

// ── финал: графитовая полоса с формулой (кнопка — DOM, в правой части полосы) ──
// верх полосы ниже ножек стола (≥ .83 высоты кадра)
export function finaleRect(vis) { const x = vis.x0 + 70, w = vis.x1 - vis.x0 - 140, h = 128, y = Math.min(H, vis.y1) - 40 - h; return { x, y, w, h }; }
function finale(t, vis) {
  const k = eo((t - 7.7) / .55); if (k <= 0) return;
  const { x, y, w, h } = finaleRect(vis);
  plate(x, y, w * k, h, 1, 'rgba(34,37,34,.9)');
  g.save(); g.beginPath(); g.rect(x, y, w * k, h); g.clip();
  txt('64 м² · пять зон · ключи в день сделки', x + 44, y + 68, SERIF(48), POR);
  txt('ЖК ЛИНИЯ · 9 ЭТАЖ · ПРОБА, ДАННЫЕ ВЫДУМАНЫ', x + 46, y + 104, MONO(17), '#BFC3BD');
  g.restore();
}

export function drawAtom(ctx, t, vis) {
  g = ctx; t = clamp(t, 0, T_END);
  marks(t, vis); heading(t, vis); counter(t); gates(t); dimLine(t); finale(t, vis);
}
