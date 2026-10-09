// ===================== core: noise, paper, frame mask, text, scene registry =====================
'use strict';
const W = 1920, H = 1080;
const PAGE = { IX: 240, IY: 74, IW: 1440, IH: 810 };    // the illustrated plate on the page
const TXT_Y = 962;                                       // centre line of the narration text
const INK = [60, 40, 25];                                // dark brown book ink
const GOLD = [176, 132, 58], GOLD_L = [226, 194, 122], SEPIA = [138, 106, 69], STAMP_RED = [196, 48, 56];

// ---------- deterministic helpers (never use Math.random: two render workers must match) ----------
function mulberry(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hash2(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function hash3(x, y, z) { let h = (x * 374761393 + y * 668265263 + z * 1440662683) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise2(x, y) { const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy; }
function vnoise3(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z); let fx = x - xi, fy = y - yi, fz = z - zi;
  fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
  const l = (a, b, t) => a + (b - a) * t;
  const c000 = hash3(xi, yi, zi), c100 = hash3(xi + 1, yi, zi), c010 = hash3(xi, yi + 1, zi), c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1), c101 = hash3(xi + 1, yi, zi + 1), c011 = hash3(xi, yi + 1, zi + 1), c111 = hash3(xi + 1, yi + 1, zi + 1);
  return l(l(l(c000, c100, fx), l(c010, c110, fx), fy), l(l(c001, c101, fx), l(c011, c111, fx), fy), fz); }
function fbm2(x, y, oct = 5) { let v = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { v += a * vnoise2(x * f, y * f); f *= 2.03; a *= .5; } return v; }
function fbm3(x, y, z, oct = 5) { let v = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { v += a * vnoise3(x * f, y * f, z * f); f *= 2.03; a *= .5; } return v; }

// ---------- easing / timing ----------
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const easeOut = v => { v = clamp(v); return 1 - Math.pow(1 - v, 3); };
const easeIn = v => { v = clamp(v); return v * v * v; };
const easeBack = v => { v = clamp(v); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); };
const elastic = v => { v = clamp(v); if (v === 0 || v === 1) return v; return Math.pow(2, -10 * v) * Math.sin((v * 10 - .75) * (2 * Math.PI / 3)) + 1; };
const win = (n, a, b) => ease((n - a) / (b - a));            // 0 -> 1 between narration times a..b, smooth
const pulse = (n, a, b, c, d) => win(n, a, b) * (1 - win(n, c, d)); // rise a..b, fall c..d
const bump = (n, t0, dur) => { const u = (n - t0) / dur; return u < 0 || u > 1 ? 0 : Math.sin(u * Math.PI); };
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------- paper ----------
let PAPER = null, GRAIN = null;
function buildPaper() {
  const c = canvas(W, H), x = c.getContext('2d');
  x.fillStyle = 'rgb(247,236,214)'; x.fillRect(0, 0, W, H);
  // low-frequency fibre clouds
  const lo = canvas(240, 135), lx = lo.getContext('2d'), id = lx.createImageData(240, 135);
  for (let j = 0; j < 135; j++) for (let i = 0; i < 240; i++) { const v = fbm2(i * .05, j * .05, 4) - .5; const k = (j * 240 + i) * 4; id.data[k] = id.data[k + 1] = id.data[k + 2] = 128 + v * 90; id.data[k + 3] = 255; }
  lx.putImageData(id, 0, 0);
  x.globalAlpha = .13; x.globalCompositeOperation = 'overlay'; x.imageSmoothingQuality = 'high'; x.drawImage(lo, 0, 0, W, H);
  // fine grain
  GRAIN = canvas(W, H); const gx = GRAIN.getContext('2d'), gd = gx.createImageData(W, H), rnd = mulberry(11);
  for (let k = 0; k < W * H; k++) { const v = 128 + (rnd() - .5) * 60; gd.data[k * 4] = gd.data[k * 4 + 1] = gd.data[k * 4 + 2] = v; gd.data[k * 4 + 3] = 255; }
  gx.putImageData(gd, 0, 0);
  x.globalAlpha = .10; x.drawImage(GRAIN, 0, 0);
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  // vignette + spine shadow on the right (Hebrew book)
  let g = x.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .62);
  g.addColorStop(0, 'rgba(120,80,40,0)'); g.addColorStop(1, 'rgba(120,80,40,.20)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createLinearGradient(W - 90, 0, W, 0); g.addColorStop(0, 'rgba(90,60,30,0)'); g.addColorStop(1, 'rgba(90,60,30,.28)'); x.fillStyle = g; x.fillRect(W - 90, 0, 90, H);
  g = x.createLinearGradient(0, 0, 40, 0); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 40, H);
  PAPER = c;
}

// ---------- watercolor-edged illustration mask ----------
let MASK = null, EDGE = null;
function buildMask() {
  const sw = PAGE.IW / 2 | 0, sh = PAGE.IH / 2 | 0;
  const m = canvas(sw, sh), mx = m.getContext('2d'), md = mx.createImageData(sw, sh);
  const e = canvas(sw, sh), ex = e.getContext('2d'), ed = ex.createImageData(sw, sh);
  for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
    const d = Math.min(i, j, sw - 1 - i, sh - 1 - j);                 // distance to edge (half-res px)
    const nz = (fbm2(i * .045, j * .045, 4) - .5) * 26 + (fbm2(i * .25 + 9, j * .25, 2) - .5) * 6;
    const v = d + nz - 12;
    const a = clamp(v / 7);                                           // soft but irregular edge
    const k = (j * sw + i) * 4;
    md.data[k] = md.data[k + 1] = md.data[k + 2] = 255; md.data[k + 3] = a * 255;
    const ring = Math.exp(-Math.pow((v - 5) / 5, 2)) * .9 + clamp(1 - v / 40) * .25;   // pigment pooling at the edge
    ed.data[k] = 60; ed.data[k + 1] = 40; ed.data[k + 2] = 80; ed.data[k + 3] = clamp(ring) * a * 255;
  }
  mx.putImageData(md, 0, 0); ex.putImageData(ed, 0, 0);
  MASK = canvas(PAGE.IW, PAGE.IH); MASK.getContext('2d').drawImage(m, 0, 0, PAGE.IW, PAGE.IH);
  EDGE = canvas(PAGE.IW, PAGE.IH); EDGE.getContext('2d').drawImage(e, 0, 0, PAGE.IW, PAGE.IH);
}

// ---------- narration text (word by word, RTL, karaoke-style pop) ----------
const TEXT = { font: 'Frank', weight: 500, size: 54, faint: .20 };
const EMPH_COL = { gold: [170, 118, 30], warm: [160, 60, 50] };
function lineAt(n) {
  const L = window.LINES; let cur = -1;
  for (let i = 1; i < L.length; i++) if (L[i].s - .25 <= n) cur = i;   // line 0 is the cover title (shown by the cover)
  if (cur < 0) return null;
  const l = L[cur], next = L[cur + 1];
  const end = next ? Math.min(next.s - .25, l.e + 1.6) : l.e + 2.2;
  if (n > end) return null;
  const fade = Math.min(1, (n - (l.s - .25)) / .25) * Math.min(1, (end - n) / .3);
  return { l, fade: clamp(fade) };
}
function drawTextLine(p, n, opt = {}) {
  const r = lineAt(n); if (!r) return;
  const { l, fade } = r; const y = opt.y || TXT_Y;
  let size = opt.size || TEXT.size; p.save(); p.direction = 'rtl'; p.textBaseline = 'middle';
  const setF = s => p.font = `${TEXT.weight} ${s}px ${TEXT.font}`;
  setF(size); let widths = l.words.map(w => p.measureText(w.w).width), sp = p.measureText(' ').width * 1.05;
  let total = widths.reduce((a, b) => a + b, 0) + sp * (l.words.length - 1);
  if (total > 1500) { size = Math.floor(size * 1500 / total); setF(size); widths = l.words.map(w => p.measureText(w.w).width); sp = p.measureText(' ').width * 1.05; total = widths.reduce((a, b) => a + b, 0) + sp * (l.words.length - 1); }
  let xr = W / 2 + total / 2; p.textAlign = 'right';
  l.words.forEach((w, i) => {
    const on = ease((n - (w.s - .08)) / .28);                 // ink settles in as the word is spoken
    const col = w.c ? EMPH_COL[w.c] : INK;
    p.globalAlpha = fade * (TEXT.faint + (1 - TEXT.faint) * on);
    p.fillStyle = rgba(mixc([150, 128, 104], col, on)); p.fillText(w.w, xr, y + 3 * (1 - on));
    xr -= widths[i] + sp;
  });
  p.restore();
}
// ---------- scene registry ----------
// SCENE({id, start, trans:'turn'|'cut'|'fade', tdur, layout:'frame'|'full', text:true,
//        ill(g, n, lt), over(p, n, lt), page(p, n, lt)})
const SCENES = [];
function SCENE(s) { s.trans = s.trans || 'turn'; s.tdur = s.tdur || .9; s.layout = s.layout || 'frame'; if (s.text === undefined) s.text = true; SCENES.push(s); SCENES.sort((a, b) => a.start - b.start); }
const ILL = canvas(PAGE.IW, PAGE.IH), IG = ILL.getContext('2d');
const TMP = canvas(PAGE.IW, PAGE.IH), TG = TMP.getContext('2d');
function sceneById(id) { return SCENES.find(s => s.id === id); }
// draw a scene's illustration (without page) into a fresh canvas - for custom transitions between pages
function renderIll(id, n) {
  const s = sceneById(id); const c = canvas(PAGE.IW, PAGE.IH), g = c.getContext('2d');
  g.save(); s.ill(g, n, n - s.start); g.restore(); return c;
}
function plateFrame(p, s) {
  const { IX, IY, IW, IH } = PAGE;
  p.save();
  p.strokeStyle = rgba(GOLD, .9); p.lineWidth = 1.2; p.strokeRect(IX - 6.5, IY - 6.5, IW + 13, IH + 13);
  p.strokeStyle = rgba(INK, .85); p.lineWidth = 2; p.strokeRect(IX - 13, IY - 13, IW + 26, IH + 26);
  for (const [cx, cy] of [[IX - 13, IY - 13], [IX + IW + 13, IY - 13], [IX - 13, IY + IH + 13], [IX + IW + 13, IY + IH + 13]]) { p.fillStyle = rgba(INK, .85); p.beginPath(); p.arc(cx, cy, 3.2, 0, 7); p.fill(); }
  // caption under the plate: Latin small caps + Hebrew
  if (s.plate) {
    p.textBaseline = 'middle'; p.fillStyle = rgba(SEPIA);
    p.font = `500 17px Cinzel`; p.letterSpacing = '5px'; p.textAlign = 'left'; p.direction = 'ltr'; p.fillText(s.plate.lat || '', IX - 13, IY + IH + 34);
    p.letterSpacing = '0px'; p.font = `italic 500 22px Cormorant`; p.textAlign = 'right'; p.direction = 'rtl'; p.fillText(s.plate.he || '', IX + IW + 13, IY + IH + 34);
  }
  // running header + folio
  p.fillStyle = rgba(SEPIA, .9); p.textBaseline = 'middle';
  p.font = `500 21px Frank`; p.direction = 'rtl'; p.textAlign = 'right'; p.fillText('פלוטו · הכוכב שביטלו אותו', IX + IW + 13, 34);
  p.font = `500 14px Cinzel`; p.letterSpacing = '6px'; p.direction = 'ltr'; p.textAlign = 'left'; p.fillText('FABVLA DE PLVTONE', IX - 13, 35); p.letterSpacing = '0px';
  if (s.folio) { p.font = `italic 500 24px Cormorant`; p.textAlign = 'center'; p.direction = 'ltr'; p.fillText(`— ${s.folio} —`, W / 2, 1046); }
  p.restore();
}
function composeFrame(p, s, n) {
  IG.setTransform(1, 0, 0, 1, 0, 0); IG.globalAlpha = 1; IG.globalCompositeOperation = 'source-over'; IG.clearRect(0, 0, PAGE.IW, PAGE.IH);
  IG.save(); s.ill(IG, n, n - s.start); IG.restore();
  p.drawImage(ILL, PAGE.IX, PAGE.IY);
  // printed-on-paper feel: grain + a whisper of inner shadow
  p.save(); p.globalCompositeOperation = 'soft-light'; p.globalAlpha = .45; p.drawImage(GRAIN, PAGE.IX, PAGE.IY, PAGE.IW, PAGE.IH, PAGE.IX, PAGE.IY, PAGE.IW, PAGE.IH); p.restore();
  p.save(); p.beginPath(); p.rect(PAGE.IX, PAGE.IY, PAGE.IW, PAGE.IH); p.clip();
  p.shadowColor = 'rgba(0,0,0,.55)'; p.shadowBlur = 26; p.strokeStyle = 'rgba(0,0,0,.6)'; p.lineWidth = 10; p.strokeRect(PAGE.IX - 5, PAGE.IY - 5, PAGE.IW + 10, PAGE.IH + 10); p.restore();
  plateFrame(p, s);
}
const MAIN = document.getElementById('c'), P = MAIN.getContext('2d');
window.renderPage = function (k, n) {
  const s = SCENES[k]; P.setTransform(1, 0, 0, 1, 0, 0); P.globalAlpha = 1; P.globalCompositeOperation = 'source-over';
  P.filter = 'none';
  if (s.layout === 'full') { s.page(P, n, n - s.start); }
  else {
    P.drawImage(PAPER, 0, 0);
    composeFrame(P, s, n);
    if (s.text) drawTextLine(P, n, s.textOpt || {});
    if (s.over) { P.save(); s.over(P, n, n - s.start); P.restore(); }
  }
  return true;
};
window.renderBlank = function () { P.setTransform(1, 0, 0, 1, 0, 0); P.drawImage(PAPER, 0, 0); return true; };
window.timeline = () => SCENES.map(s => ({ id: s.id, start: s.start, trans: s.trans, tdur: s.tdur }));
window.sceneIndex = id => SCENES.findIndex(s => s.id === id);
