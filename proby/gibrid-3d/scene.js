// 3D-сцена: строительная площадка в дымке, контейнер-бытовка «ОПОРА», башенный кран, каркасы в тумане.
// Камера целиком управляется прогрессом прокрутки p (0…1): облёт → двери открываются → пролёт сквозь контейнер.
import * as THREE from './vendor/three/three.module.js';

const POR = '#F0EEE6', GR = '#2B2F2C', GN = '#416B53', OR = '#E78636';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const eo = p => { p = clamp(p); return 1 - Math.pow(1 - p, 3); };

// балки между двумя точками одним InstancedMesh
function beams(list, thick, mat) {
  const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, list.length);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion(), M = new THREE.Matrix4(), s = new THREE.Vector3();
  list.forEach((e, i) => {
    a.set(e[0], e[1], e[2]); b.set(e[3], e[4], e[5]); d.subVectors(b, a);
    const len = d.length(); q.setFromUnitVectors(up, d.normalize()); s.set(thick, len, thick);
    M.compose(a.clone().add(b).multiplyScalar(.5), q, s); m.setMatrixAt(i, M);
  });
  m.castShadow = true; m.receiveShadow = true; return m;
}
function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const HEAVY = '800 {s}px Futura,"Avenir Next","Arial Black",sans-serif';
const MONO = '700 {s}px "PT Mono",Menlo,Consolas,monospace';
const f = (tpl, s) => tpl.replace('{s}', s);

export function createScene(canvas) {
  const R = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.NoToneMapping; // фон и туман совпадают цветом с фарфором страницы
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;

  const S = new THREE.Scene();
  S.background = new THREE.Color(POR);
  S.fog = new THREE.Fog(POR, 26, 92);
  const cam = new THREE.PerspectiveCamera(38, 1, 0.05, 300);

  S.add(new THREE.HemisphereLight('#ffffff', '#cdc6b6', 2.1));
  const sun = new THREE.DirectionalLight('#fff4e6', 2.4);
  sun.position.set(16, 24, 12); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 80 });
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  S.add(sun);

  // материалы
  const mGround = new THREE.MeshStandardMaterial({ color: '#E7E3D8', roughness: 1 });
  const mSlab = new THREE.MeshStandardMaterial({ color: '#D6D1C5', roughness: .95 });
  const mOut = new THREE.MeshStandardMaterial({ color: GR, roughness: .55, metalness: .25 });
  const mIn = new THREE.MeshStandardMaterial({ color: GN, roughness: .7, metalness: .1 });
  const mInDark = new THREE.MeshStandardMaterial({ color: '#2F5140', roughness: .8 });
  const mFloor = new THREE.MeshStandardMaterial({ color: '#4A564E', roughness: .9 });
  const mOr = new THREE.MeshStandardMaterial({ color: OR, roughness: .5, metalness: .2 });
  const mGlow = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
  const mStrip = new THREE.MeshBasicMaterial({ color: '#FFF8EC' });
  const mConc = new THREE.MeshStandardMaterial({ color: '#CFCAC0', roughness: .95 });
  const mSteel = new THREE.MeshStandardMaterial({ color: '#3A3E3B', roughness: .5, metalness: .4 });
  const mWood = new THREE.MeshStandardMaterial({ color: '#B48D5E', roughness: .9 });
  const mWhite = new THREE.MeshStandardMaterial({ color: '#F4F2EC', roughness: .7 });

  // земля и плита
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), mGround);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
  S.add(box(18, .3, 7, mSlab, 0, .15, 0));

  // ── контейнер: длина по z, двери на +z ──
  const L = 12, W = 2.44, H = 2.6, T = .08, Y0 = .3;
  const C = new THREE.Group(); C.position.y = Y0; S.add(C);
  C.add(box(W, .12, L, mFloor, 0, .06, 0));
  const roof = box(W, .1, L, [mOut, mOut, mOut, mInDark, mOut, mOut], 0, H - .05, 0); C.add(roof);
  C.add(box(T, H, L, [mOut, mIn, mOut, mOut, mOut, mOut], W / 2 - T / 2, H / 2, 0));
  C.add(box(T, H, L, [mIn, mOut, mOut, mOut, mOut, mOut], -W / 2 + T / 2, H / 2, 0));
  C.add(box(W, H, T, [mOut, mOut, mOut, mOut, mGlow, mOut], 0, H / 2, -L / 2 + T / 2)); // «свет в конце»
  // гофра снаружи и внутри
  const ribsOut = [], ribsIn = [];
  for (let z = -L / 2 + .25; z <= L / 2 - .25; z += .32) {
    for (const sgn of [1, -1]) {
      ribsOut.push([sgn * (W / 2 + .03), .12, z, sgn * (W / 2 + .03), H - .12, z]);
      ribsIn.push([sgn * (W / 2 - T - .03), .14, z, sgn * (W / 2 - T - .03), H - .14, z]);
    }
  }
  C.add(beams(ribsOut, .07, mOut));
  C.add(beams(ribsIn, .06, mInDark));
  for (let z = -L / 2 + 1; z < L / 2 - .5; z += 1.9) C.add(box(W - .7, .03, .16, mStrip, 0, H - .13, z));
  // оранжевые угловые стойки и рамка торца
  for (const sx of [1, -1]) for (const sz of [1, -1]) C.add(box(.16, H, .16, mOr, sx * (W / 2 - .02), H / 2, sz * (L / 2 - .02)));
  C.add(box(W + .04, .18, .18, mOr, 0, H - .05, L / 2));
  C.add(box(W + .04, .14, .18, mOr, 0, .07, L / 2));
  // надпись на борту
  const side = canvasTex(2048, 512, (g, w, h) => {
    g.fillStyle = '#F0EEE6'; g.font = f(HEAVY, 300); g.textBaseline = 'alphabetic'; g.fillText('ОПОРА', 40, 330);
    g.fillStyle = OR; g.fillRect(44, 380, 230, 18);
    g.fillStyle = '#F0EEE6'; g.font = f(MONO, 64); g.fillText('СТРОИТЕЛЬНАЯ ГРУППА', 300, 404);
  });
  const sidePlane = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.8), new THREE.MeshStandardMaterial({ map: side, transparent: true, roughness: .6 }));
  sidePlane.rotation.y = Math.PI / 2; sidePlane.position.set(W / 2 + .075, H / 2 + .1, 0); C.add(sidePlane);

  // двери на петлях
  const doorTex = (left) => canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = GR; g.fillRect(0, 0, w, h);
    for (let xx = 0; xx < w; xx += 42) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(xx, 0, 18, h); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(xx + 18, 0, 4, h); }
    for (const rx of [.3, .7]) {
      g.fillStyle = OR; g.fillRect(rx * w - 9, 30, 18, h - 60);
      g.fillRect(rx * w - 22, 470, 44, 90); g.fillRect(rx * w - 26, 40, 52, 22); g.fillRect(rx * w - 26, h - 62, 52, 22);
    }
    if (left) {
      g.fillStyle = OR; g.fillRect(w * .5 - 150, 180, 300, 150);
      g.fillStyle = '#F0EEE6'; g.font = f(HEAVY, 78); g.textAlign = 'center'; g.fillText('ОПОРА', w * .5, 285);
    } else {
      g.fillStyle = '#F0EEE6'; g.font = f(MONO, 34); g.textAlign = 'center';
      g.fillText('ОБЪЕКТ № 23', w * .5, 230); g.fillText('СРОК: ДЕНЬ 426', w * .5, 280);
    }
  });
  const doors = [];
  for (const [sgn, left] of [[-1, true], [1, false]]) {
    const pivot = new THREE.Group(); pivot.position.set(sgn * W / 2, H / 2, L / 2 + .05);
    const mats = [mOut, mOut, mOut, mOut, new THREE.MeshStandardMaterial({ map: doorTex(left), roughness: .55, metalness: .2 }), mInDark];
    const d = box(W / 2 - .02, H - .2, .06, mats, -sgn * (W / 4), 0, 0); pivot.add(d); C.add(pivot);
    doors.push({ pivot, sgn });
  }

  // ── башенный кран ──
  const crane = new THREE.Group(); crane.position.set(-11, 0, -6); S.add(crane);
  crane.add(box(4.2, 1, 4.2, mConc, 0, .5, 0));
  const MH = 22, ms = .6, lat = [];
  for (const [cx, cz] of [[ms, ms], [-ms, ms], [-ms, -ms], [ms, -ms]]) lat.push([cx, 1, cz, cx, MH, cz]);
  for (let y = 1; y < MH - .1; y += 1.2) {
    const y2 = Math.min(MH, y + 1.2);
    lat.push([ms, y, ms, -ms, y2, ms], [-ms, y, -ms, ms, y2, -ms], [ms, y, -ms, ms, y2, ms], [-ms, y, ms, -ms, y2, -ms]);
    lat.push([ms, y, ms, -ms, y, ms], [ms, y, -ms, -ms, y, -ms], [ms, y, ms, ms, y, -ms], [-ms, y, ms, -ms, y, -ms]);
  }
  crane.add(beams(lat, .09, mOr));
  const top = new THREE.Group(); top.position.y = MH; crane.add(top);
  const jb = [], J0 = -7, J1 = 21, JY = .4, jw = .45, jh = 1.3;
  jb.push([J0, JY, jw, J1, JY, jw], [J0, JY, -jw, J1, JY, -jw], [J0, JY + jh, 0, J1 - 1, JY + .3, 0]);
  for (let xx = J0; xx < J1 - 1.3; xx += 1.3) {
    const k = (xx - J0) / (J1 - 1 - J0), yt = JY + jh + (.3 - jh) * k, yt2 = JY + jh + (.3 - jh) * ((xx + 1.3 - J0) / (J1 - 1 - J0));
    jb.push([xx, JY, jw, xx + 1.3, yt2, 0], [xx, JY, -jw, xx + 1.3, yt2, 0], [xx, JY, jw, xx, JY, -jw], [xx, JY, jw, xx, yt, 0], [xx, JY, -jw, xx, yt, 0]);
  }
  jb.push([0, JY, 0, 0, 5.2, 0], [0, 5.2, 0, J1 - 1, JY + .3, 0], [0, 5.2, 0, J0, JY + jh, 0]); // оголовок и тяги
  top.add(beams(jb, .08, mOr));
  top.add(box(2.4, 1.6, 2.2, mSteel, J0 + 1.4, -.5, 0)); // противовес
  top.add(box(1.6, 1.4, 1.4, mWhite, 1.4, -.4, 1.2));    // кабина
  const trolley = box(.8, .3, 1.1, mSteel, 14, JY - .2, 0); top.add(trolley);
  const cable = box(.04, 1, .04, mSteel); top.add(cable);
  const hook = new THREE.Group(); top.add(hook);
  hook.add(box(.5, .6, .4, mOr, 0, 0, 0));
  const ib = new THREE.Group(); ib.position.y = -2.2; hook.add(ib); // двутавр на стропах
  ib.add(box(6, .08, .5, mSteel, 0, .3, 0), box(6, .08, .5, mSteel, 0, -.3, 0), box(6, .6, .07, mSteel, 0, 0, 0));
  ib.add(beams([[0, 2.2, 0, -2.4, .34, 0], [0, 2.2, 0, 2.4, .34, 0]], .03, mSteel));

  // ── каркасы домов в дымке ──
  function skeleton(x0, z0, nx, nz, fl, step, fh) {
    const g = new THREE.Group(); g.position.set(x0, 0, z0);
    const cols = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) cols.push([i * step, 0, j * step, i * step, fl * fh, j * step]);
    g.add(beams(cols, .35, mConc));
    for (let k = 1; k <= fl; k++) g.add(box((nx - 1) * step + .8, .25, (nz - 1) * step + .8, mConc, (nx - 1) * step / 2, k * fh, (nz - 1) * step / 2));
    S.add(g); return g;
  }
  skeleton(9, -22, 4, 3, 7, 4, 3.2);
  skeleton(-36, -34, 5, 3, 10, 4, 3.2);
  skeleton(26, -46, 3, 3, 12, 4, 3.2);
  const crane2 = crane.clone(); crane2.position.set(34, 0, -60); crane2.rotation.y = 2.2; crane2.scale.setScalar(1.15); S.add(crane2);

  // ── мелочь площадки ──
  for (let i = 0; i < 3; i++) S.add(box(1.2, .14, 1, mWood, -4.2, .37 + i * .16, 5.4 + i * .02));
  for (let i = 0; i < 4; i++) S.add(box(5.5, .14, .2, mSteel, -4.6, .07 + (i >> 1) * .15, 1.2 + (i & 1) * .35));
  for (let i = 0; i < 5; i++) { const o = i % 2 ? mWhite : mConc; S.add(box(1.4, .8, .45, o, 3.4 + i * 1.45, .4, 8.6)); }

  // ── путь камеры ──
  const KP = [
    [0.00, [15.5, 5.4, 19.0], [-5.5, 4.4, -1], 38], // взгляд левее и выше → контейнер справа внизу, слева сверху место под заголовок
    [0.11, [10.0, 3.8, 17.0], [-4.5, 3.8, 1], 38],
    [0.22, [2.4, 2.1, 14.6], [0, 2.1, 6], 38],
    [0.32, [0.0, 1.62, 10.6], [0, 1.85, 4], 40],
    [0.42, [0.0, 1.42, 7.2], [0, 1.45, -6], 44],
    [0.50, [0.0, 1.38, 2.0], [0, 1.4, -10], 48],
    [0.60, [0.0, 1.36, -4.7], [0, 1.4, -14], 54],
  ];
  const curve = new THREE.CatmullRomCurve3(KP.map(k => new THREE.Vector3(...k[1])), false, 'centripetal');
  const tgt = new THREE.Vector3(), tA = new THREE.Vector3(), tB = new THREE.Vector3();
  function camAt(p) {
    p = clamp(p, 0, KP[KP.length - 1][0]);
    let i = 0; while (i < KP.length - 2 && p > KP[i + 1][0]) i++;
    const k = (p - KP[i][0]) / (KP[i + 1][0] - KP[i][0]);
    cam.position.copy(curve.getPoint((i + k) / (KP.length - 1)));
    const ks = sm(k);
    tA.set(...KP[i][2]); tB.set(...KP[i + 1][2]); tgt.lerpVectors(tA, tB, ks);
    cam.lookAt(tgt);
    cam.userData.fov = KP[i][3] + (KP[i + 1][3] - KP[i][3]) * ks;
  }

  let aspect = 1;
  function resize(w, h) { R.setSize(w, h, false); aspect = w / h; cam.aspect = aspect; }
  function update(p) {
    camAt(p);
    cam.fov = cam.userData.fov * (aspect < 1 ? Math.pow(1 / aspect, .55) : 1);
    cam.updateProjectionMatrix();
    const th = 1.8 * eo((p - .2) / .14);
    doors.forEach(d => { d.pivot.rotation.y = d.sgn * th; }); // левая −θ, правая +θ: обе створки распахиваются наружу (+z)
    // кран: поворот стрелы, тележка едет, двутавр поднимается
    crane.rotation.y = -0.35 - 0.5 * p;
    const tx = 15 - 6 * sm(p / .4);
    trolley.position.x = tx; hook.position.set(tx, -4 - 7 * (1 - sm(p / .45)) + 0, 0);
    const len = (JY - .2) - (hook.position.y + .3);
    cable.scale.y = Math.max(.01, len); cable.position.set(tx, hook.position.y + .3 + len / 2, 0);
    ib.rotation.y = .6 + p * 1.4;
    R.render(S, cam);
  }
  return { resize, update };
}
