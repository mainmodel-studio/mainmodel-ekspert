// Атом 703 №155 (gdgtify, «доказательство как механизм»), пересаженный на тему «квартира изнутри».
// Рисуется на ПРОЗРАЧНОМ холсте прямо поверх видео Kling, в координатах кадра видео.
// Две раскладки: компьютер — кадр 1920×1068; телефон — вертикальная вырезка 640×1072 (setMobile()).
// Чистая функция времени: drawAtom(ctx, t, vis), t ∈ [0 … T_END] — время задаёт прокрутка.
// vis — видимая часть кадра в координатах видео (object-fit: cover обрезает края).
const POR = '#F0EEE6', GR = '#222522', GN = '#416B53', OR = '#E78636';
const PLATE = 'rgba(240,238,230,.88)';           // фарфоровая плашка с лёгкой прозрачностью
const HEAVY = s => `800 ${s}px Futura,"Avenir Next","Arial Black",sans-serif`;
const MONO = s => `700 ${s}px "PT Mono",Menlo,Consolas,monospace`;
const SERIF = s => `italic 400 ${s}px "PT Serif",Georgia,serif`;
export let W = 1920, H = 1068;
export const T_END = 9;
let MOB = false;

// спокойные зоны финального кадра (доли кадра) — правятся по глазу
export let Z = {
  head:  { x0: .12, y0: .025 },                // потолок x .12–.85: заголовок-лента
  cnt:   { cx: .446, y0: .235 },               // стена x .40–.49, y .23–.47: счётчик
  list:  { x0: .735, y0: .20, y1: .66 },       // правая стена (спокойна .20–.37, ниже солнце — плашки плотные)
  floor: { x0: .172, x1: .883, y: .86 },       // пол y .70–1: размерная линия от стены до стены
};
// телефон: вертикальная вырезка 640×1072 из центра кадра (камера летит в x ≈ 960–990 из 1920)
// зоны по глазу Opus (последний кадр вырезки): потолок y 0–.21, пустая стена x .18–.48 / y .22–.53,
// картина x .485–.91 / y .275–.53 (второстепенна — под список), диван+ваза+стол y .535–.825 — не закрывать, пол чист с y .83
const ZM = {
  head:  { y0: .04 },
  cnt:   { x0: .19, y0: .27 },
  list:  { x0: .47, y0: .215, y1: .50 },        // низ выше спинки дивана (.535) на ~35 px
  floor: { y: .87 },
};
export function setMobile() { MOB = true; W = 640; H = 1072; Z = ZM; }

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const P = (t, a, d) => sm((t - a) / d);
const eo = p => { p = clamp(p); return 1 - Math.pow(1 - p, 3); };
const eb = p => { p = clamp(p); const c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }; // лёгкий перелёт

let g; // контекст текущего кадра
function txt(s, x, y, font, col, a = 1, al = 'left', base = 'alphabetic') {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.font = font; g.fillStyle = col; g.textAlign = al; g.textBaseline = base; g.fillText(s, x, y); g.restore();
}
function plate(x, y, w, h, a = 1, fill = PLATE) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  if (!MOB) { g.shadowColor = 'rgba(20,22,20,.28)'; g.shadowBlur = 24; g.shadowOffsetY = 8; } // телефон: размытая тень в Safari дорогая — без неё
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
// размер шрифта ленты: на компьютере 54, на телефоне — самая длинная строка влезает в видимую ширину
function headFS(vis) {
  if (!MOB) return 54;
  g.font = HEAVY(100); const widest = Math.max(...HD.flatMap(([, ls]) => ls.map(l => g.measureText(l).width)));
  return Math.min(46, Math.floor(100 * (vis.x1 - vis.x0 - 48 - 40) / widest));
}
function heading(t, vis) {
  const FS = headFS(vis), LH = Math.round(FS * 1.3), BASE = FS; // компьютер: 54 / 70 / база 54, как было
  const HX = MOB ? vis.x0 + 24 : Math.max(vis.x0 + 70, W * Z.head.x0), HY = H * Z.head.y0 + Math.max(0, vis.y0);
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
      g.fillStyle = j === 1 ? POR : GR; g.textBaseline = 'alphabetic'; g.fillText(ln, HX + 20, top + BASE);
      g.restore();
    });
  });
}

// ── метки рамки по видимой части кадра ──
function marks(t, vis) {
  const a = P(t, 0, .5); if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.strokeStyle = POR; g.lineWidth = 3; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6;
  const m = MOB ? 18 : 36, l = MOB ? 22 : 28;
  const lowA = 1 - P(t, 7.6, .3); // нижние метки уступают место финальной полосе
  for (const [x, y, sx, sy] of [[vis.x0 + m, vis.y0 + m, 1, 1], [vis.x1 - m, vis.y0 + m, -1, 1], [vis.x0 + m, vis.y1 - m, 1, -1], [vis.x1 - m, vis.y1 - m, -1, -1]]) {
    g.globalAlpha = a * (sy < 0 ? lowA : 1); g.beginPath(); g.moveTo(x, y + sy * l); g.lineTo(x, y); g.lineTo(x + sx * l, y); g.stroke();
  }
  g.restore();
  const lbl = 'КВАРТИРА 9.04 · СХЕМА 01 / 01';
  if (MOB) { // телефон: метка под заголовком, на потолке
    const FS = headFS(vis), LH = Math.round(FS * 1.3);
    g.font = MONO(14); const w = g.measureText(lbl).width + 22, x = vis.x0 + 24, y = H * Z.head.y0 + Math.max(0, vis.y0) + 2 * (LH + 6) + 10;
    plate(x, y, w, 28, a, 'rgba(34,37,34,.78)'); txt(lbl, x + 11, y + 19, MONO(14), POR, a);
    return;
  }
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
function counter(t, vis) {
  const k = eb((t - 1.6) / .5); if (k <= 0) return;
  const out = 1 - P(t, 7.4, .3); if (out <= 0) return;
  const pw = 3 * DW + 2 * DG + 2 * PAD, ph = DH + 110;
  const x = MOB ? Math.max(vis.x0 + 24, W * Z.cnt.x0) : W * Z.cnt.cx - pw / 2, y = H * Z.cnt.y0 + (1 - k) * 30;
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
function gates(t, vis) {
  const out = 1 - P(t, 7.4, .3); if (out <= 0) return;
  const pw = MOB ? vis.x1 - 22 - W * Z.list.x0 : 296;
  const x = W * Z.list.x0, y0 = H * Z.list.y0, hh = H * (Z.list.y1 - Z.list.y0);
  const hA = P(t, 3.9, .35) * out, HH = MOB ? 38 : 44, f = MOB ? .8 : 1;
  if (hA > 0) { plate(x, y0, pw, HH, hA, 'rgba(34,37,34,.82)'); txt('ГОТОВНОСТЬ ЗОН', x + (MOB ? 14 : 18), y0 + (MOB ? 25 : 29), MONO(MOB ? 15 : 17), POR, hA); }
  const gap = MOB ? 6 : 8, rh = (hh - HH - 12) / 5 - gap;
  ROOMS.forEach(([name, area], i) => {
    const a = eo((t - 4.0 - i * .09) / .4) * out; if (a <= 0) return;
    const ry = y0 + HH + 12 + i * (rh + gap), rx = x + (1 - a) * 40;
    plate(rx, ry, pw, rh, a);
    g.save(); g.globalAlpha *= a;
    g.fillStyle = GN; g.fillRect(rx, ry, MOB ? 6 : 8, rh);
    txt(name, rx + 22 * f + 4, ry + rh / 2 - (MOB ? 2 : 4), HEAVY(Math.round(24 * f)), GR);
    txt(area + ' М²', rx + 22 * f + 4, ry + rh / 2 + (MOB ? 17 : 24), MONO(Math.round(16 * f)), GR);
    const ww = MOB ? 62 : 96, wh = rh - (MOB ? 14 : 26), wx = rx + pw - ww - (MOB ? 10 : 14), wy = ry + (rh - wh) / 2, r = eo((t - 4.35 - i * .28) / .3);
    g.fillStyle = '#E4E1D6'; g.fillRect(wx, wy, ww, wh);
    g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
    txt('···', wx + ww / 2, wy + wh / 2 - r * wh + 4, HEAVY(Math.round(Math.min(38 * f, wh * 1.05))), GR, 1, 'center', 'middle');
    g.fillStyle = OR; g.fillRect(wx, wy + (1 - r) * wh, ww, wh);
    txt('✓', wx + ww / 2, wy + wh / 2 + (1 - r) * wh + 2, HEAVY(Math.round(Math.min(40 * f, wh * 1.1))), POR, 1, 'center', 'middle');
    g.restore(); g.strokeStyle = GR; g.lineWidth = 2; g.strokeRect(wx, wy, ww, wh);
    g.restore();
  });
}

// ── размерная линия по полу: растёт от центра, засечки, плашка «8,4 м» ──
function dimLine(t, vis) {
  const k = eo((t - 6.0) / .7), out = 1 - P(t, 7.5, .3); if (k <= 0 || out <= 0) return;
  // телефон: стен в узком кадре не видно — линия по видимому полу, края уходят за кадр (без засечек)
  const x0 = MOB ? vis.x0 - 20 : W * Z.floor.x0, x1 = MOB ? vis.x1 + 20 : W * Z.floor.x1, y = H * Z.floor.y, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2 * k;
  g.save(); g.globalAlpha *= out; g.strokeStyle = POR; g.lineWidth = 4; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 8;
  g.beginPath(); g.moveTo(cx - hw, y); g.lineTo(cx + hw, y); g.stroke();
  const tk = P(t, 6.55, .2) * 22;
  if (tk > 0 && !MOB) {
    g.beginPath(); g.moveTo(x0, y - tk); g.lineTo(x0, y + tk); g.moveTo(x1, y - tk); g.lineTo(x1, y + tk);
    // засечки-стрелки под 45°, как на чертеже
    g.moveTo(x0 - 10, y + 10); g.lineTo(x0 + 10, y - 10); g.moveTo(x1 - 10, y + 10); g.lineTo(x1 + 10, y - 10); g.stroke();
  }
  if (tk > 0 && MOB) { // стрелки «шире кадра» у краёв видимой части
    const ax0 = vis.x0 + 14, ax1 = vis.x1 - 14, s = tk / 22 * 12;
    g.beginPath(); g.moveTo(ax0 + s, y - s); g.lineTo(ax0, y); g.lineTo(ax0 + s, y + s);
    g.moveTo(ax1 - s, y - s); g.lineTo(ax1, y); g.lineTo(ax1 - s, y + s); g.stroke();
  }
  g.restore();
  const cA = eb((t - 6.5) / .4) * out;
  if (cA > 0) {
    const w = MOB ? 150 : 170, h = MOB ? 52 : 58, s = clamp(cA, 0, 1.2);
    g.save(); g.translate(cx, y); g.scale(s, s); g.translate(-cx, -y);
    plate(cx - w / 2, y - h / 2, w, h, clamp(cA), OR);
    txt('8,4 М', cx, y + 2, HEAVY(MOB ? 30 : 34), POR, clamp(cA), 'center', 'middle');
    g.restore();
  }
}

// ── финал: графитовая полоса с формулой; кнопка — DOM (ctaRect) ──
// компьютер: верх полосы ниже ножек стола (≥ .83 высоты кадра), кнопка справа в полосе;
// телефон: полоса выше и в две строки, кнопка во всю ширину под текстом
export function finaleRect(vis) {
  if (MOB) { const x = vis.x0 + 16, w = vis.x1 - vis.x0 - 32, h = 190, y = Math.min(H, vis.y1) - 40 - h; return { x, y, w, h }; } // верх ≈ .785: диван и стол открыты; низ выше панели Safari
  const x = vis.x0 + 70, w = vis.x1 - vis.x0 - 140, h = 128, y = Math.min(H, vis.y1) - 40 - h; return { x, y, w, h };
}
export function ctaRect(vis) {
  const r = finaleRect(vis);
  if (MOB) return { x: r.x + 20, y: r.y + 108, w: r.w - 40, h: 60, fs: 20 };
  return { x: r.x + r.w - 420 - 32, y: r.y + (r.h - 76) / 2, w: 420, h: 76, fs: 20 };
}
function finale(t, vis) {
  const k = eo((t - 7.7) / .55); if (k <= 0) return;
  const { x, y, w, h } = finaleRect(vis);
  plate(x, y, w * k, h, 1, 'rgba(34,37,34,.9)');
  g.save(); g.beginPath(); g.rect(x, y, w * k, h); g.clip();
  if (MOB) {
    txt('64 м² · пять зон ·', x + 20, y + 38, SERIF(30), POR);
    txt('ключи в день сделки', x + 20, y + 70, SERIF(30), POR);
    txt('ЖК ЛИНИЯ · 9 ЭТАЖ · ПРОБА, ДАННЫЕ ВЫДУМАНЫ', x + 21, y + 95, MONO(14), '#D6D9D3');
  } else {
    txt('64 м² · пять зон · ключи в день сделки', x + 44, y + 68, SERIF(48), POR);
    txt('ЖК ЛИНИЯ · 9 ЭТАЖ · ПРОБА, ДАННЫЕ ВЫДУМАНЫ', x + 46, y + 104, MONO(17), '#BFC3BD');
  }
  g.restore();
}

export function drawAtom(ctx, t, vis) {
  g = ctx; t = clamp(t, 0, T_END);
  marks(t, vis); heading(t, vis); counter(t, vis); gates(t, vis); dimLine(t, vis); finale(t, vis);
}
