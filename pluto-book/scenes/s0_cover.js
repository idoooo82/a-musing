// ===================== s0: the front cover (n -2.0 .. 3.75) =====================
'use strict';
let _CLOTH = null;
function clothTex() {
  if (typeof NOBOOK !== 'undefined' && NOBOOK) return (_CLOTH = _CLOTH || canvas(W, H));
  if (_CLOTH) return _CLOTH;
  const c = canvas(W, H), x = c.getContext('2d'); x.fillStyle = 'rgb(26,31,78)'; x.fillRect(0, 0, W, H);
  const id = x.getImageData(0, 0, W, H), d = id.data, r = mulberry(21);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = (j * W + i) * 4, weave = ((i % 4 < 2) ^ (j % 4 < 2)) ? 5 : -5, n = (r() - .5) * 14 + (fbm2(i * .006, j * .006, 3) - .5) * 30;
    d[k] += weave + n * .6; d[k + 1] += weave + n * .6; d[k + 2] += weave * 1.3 + n;
  }
  x.putImageData(id, 0, 0);
  let g = x.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .7); g.addColorStop(0, 'rgba(60,70,160,.12)'); g.addColorStop(1, 'rgba(0,0,10,.55)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  g = x.createLinearGradient(W - 70, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = g; x.fillRect(W - 70, 0, 70, H);
  return (_CLOTH = c);
}
function goldGrad(g, y0, y1) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#fff1b8'); gr.addColorStop(.35, '#f1c55a'); gr.addColorStop(.55, '#c88a24'); gr.addColorStop(.8, '#f6d37a'); gr.addColorStop(1, '#a8701c'); return gr; }
// gold-foil text with an optional moving sheen (sheen in 0..1 across the text width) and glow
function foilText(p, text, x, y, size, o = {}) {
  p.save(); p.font = `${o.weight || 800} ${size}px ${o.font || FONT_TITLE}`; p.textAlign = 'center'; p.textBaseline = 'middle'; p.direction = 'rtl';
  const w = p.measureText(text).width;
  p.fillStyle = 'rgba(0,0,10,.5)'; p.fillText(text, x + size * .02, y + size * .035);                     // debossed shadow
  if (o.glow) { p.shadowColor = `rgba(255,205,110,${o.glow})`; p.shadowBlur = size * .35 * o.glow; }
  p.fillStyle = o.fill || goldGrad(p, y - size / 2, y + size / 2); p.fillText(text, x, y); p.shadowBlur = 0;
  if (o.sheen !== undefined && o.sheen > -0.3 && o.sheen < 1.3) {
    const cw = Math.ceil(w + size), ch = Math.ceil(size * 1.6), c = canvas(cw, ch), q = c.getContext('2d');
    q.font = p.font; q.letterSpacing = p.letterSpacing; q.textAlign = 'center'; q.textBaseline = 'middle'; q.direction = 'rtl'; q.fillStyle = '#fff'; q.fillText(text, cw / 2, ch / 2);
    const sx = cw / 2 + w / 2 - o.sheen * (w + size);
    const gr = q.createLinearGradient(sx - size * .3, 0, sx + size * .3, ch); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,250,230,.42)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    q.globalCompositeOperation = 'source-in'; q.fillStyle = gr; q.fillRect(0, 0, cw, ch);
    p.globalCompositeOperation = 'lighter'; p.drawImage(c, x - cw / 2, y - ch / 2);
  }
  p.restore();
  return w;
}
function coverFrame(p, t, glow = 0) {
  if (typeof NOBOOK !== 'undefined' && NOBOOK) return;
  p.save(); p.strokeStyle = goldGrad(p, 60, H - 60); p.lineWidth = 6; p.beginPath(); p.roundRect(70, 60, W - 140, H - 120, 26); p.stroke();
  p.lineWidth = 2; p.beginPath(); p.roundRect(92, 82, W - 184, H - 164, 18); p.stroke();
  const corners = [[92, 82], [W - 92, 82], [92, H - 82], [W - 92, H - 82]];
  p.fillStyle = goldGrad(p, 40, H - 40);
  for (const [cx, cy] of corners) { star5(p, cx, cy, 26, 11); p.fill(); }
  p.restore();
  // little embossed foil stars that twinkle
  const r = mulberry(4);
  for (let i = 0; i < 38; i++) {
    const x = 130 + r() * (W - 260), y = 120 + r() * (H - 240), s = 4 + r() * 9, ph = r() * 6.28;
    if (Math.hypot(x - 960, y - 430) < 340 || (y > 700 && x > 420 && x < 1500)) continue;
    p.fillStyle = 'rgba(240,200,110,.85)'; star5(p, x, y, s, s * .42); p.fill();
    sparkle(p, x, y, s * 2.4 * (.3 + .7 * Math.max(0, Math.sin(t * 1.4 + ph))), .5 * Math.max(0, Math.sin(t * 1.4 + ph)) + glow * .2);
  }
}
// porthole with the living sky and a character inside. draw(g, size) draws inside a size x size square
const _PORT = canvas(640, 640), _PG = _PORT.getContext('2d');
const port = {};
function ringText(p, text, cx, cy, rad, rot) {
  p.save(); p.font = '600 22px Cinzel'; p.fillStyle = goldGrad(p, cy - rad, cy + rad); p.textAlign = 'center'; p.textBaseline = 'middle'; p.direction = 'ltr';
  const chars = [...text]; const step = 2 * Math.PI / chars.length;
  chars.forEach((ch, i) => { const a = -Math.PI / 2 + rot + i * step; p.save(); p.translate(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad); p.rotate(a + Math.PI / 2); p.fillText(ch, 0, 0); p.restore(); });
  p.restore();
}
function porthole(p, cx, cy, R, t, inner) {
  _PG.setTransform(1, 0, 0, 1, 0, 0); _PG.clearRect(0, 0, 640, 640);
  SPACE.draw(_PG, { t, neb: .7, galx: .9, gpos: [-.3, .28] }, -160, 0, 960, 640);
  STARS.draw(_PG, { t, zoom: 1.2 }, 640, 640); DUST.draw(_PG, { t, alpha: .8 }, 640, 640);
  inner(_PG, 640);
  _PG.globalCompositeOperation = 'destination-in'; _PG.beginPath(); _PG.arc(320, 320, 318, 0, 7); _PG.fill(); _PG.globalCompositeOperation = 'source-over';
  p.save(); p.drawImage(_PORT, cx - R, cy - R, 2 * R, 2 * R);
  const sh = p.createRadialGradient(cx, cy, R * .82, cx, cy, R); sh.addColorStop(0, 'rgba(0,0,20,0)'); sh.addColorStop(1, 'rgba(0,0,20,.55)'); p.fillStyle = sh; p.beginPath(); p.arc(cx, cy, R, 0, 7); p.fill();
  p.strokeStyle = goldGrad(p, cy - R, cy + R); p.lineWidth = 5; p.beginPath(); p.arc(cx, cy, R + 4, 0, 7); p.stroke();
  p.lineWidth = 1.5; p.beginPath(); p.arc(cx, cy, R + 14, 0, 7); p.stroke(); p.beginPath(); p.arc(cx, cy, R + 56, 0, 7); p.stroke();
  p.lineWidth = 3; p.beginPath(); p.arc(cx, cy, R + 62, 0, 7); p.stroke();
  for (let i = 0; i < 120; i++) { const a = i / 120 * 6.283, L = i % 10 ? 6 : 12; p.lineWidth = i % 10 ? 1 : 2; p.beginPath(); p.moveTo(cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14)); p.lineTo(cx + Math.cos(a) * (R + 14 + L), cy + Math.sin(a) * (R + 14 + L)); p.stroke(); }
  if (port.ring) ringText(p, port.ring, cx, cy, R + 40, port.ringRot || 0);
  p.restore();
}
SCENE({
  id: 's0', start: -2.0, trans: 'cut', layout: 'full', text: false,
  page(p, n, lt) {
    const t = n;
    const push = 1 + .035 * ease((n + 2) / 5.8), lift = win(n, 3.2, 3.75);
    p.save(); p.translate(W / 2, H / 2); p.scale(push, push); p.translate(-W / 2, -H / 2);
    p.drawImage(clothTex(), 0, 0);
    coverFrame(p, t, win(n, .4, 1.4));
    // the medallion: Pluto wakes up in his window
    port.ring = 'PLVTO · PLANETA NONA · INVENTVS ANNO MCMXXX · '; port.ringRot = n * .03;
    porthole(p, 960, 452, 228, t, (g, S) => {
      const wake = win(n, -.8, .3);
      const worry = pulse(n, 2.45, 2.95, 3.5, 3.9);
      const ca = t * .55 + 2.2; const chx = 320 + Math.cos(ca) * 238, chy = 335 + Math.sin(ca) * 196;
      if (Math.sin(ca) < 0) drawCharon(g, chx, chy, 30, { spin: t * .3, light: [-.6, -.5] });
      drawPluto(g, 320, 330 + 5 * Math.sin(t * 1.1), 172, { spin: .05 * Math.sin(t * .6), light: [-.72, -.48], glow: .18 + .12 * Math.sin(t * 2.4),
        face: { smile: lerp(.1, .65, wake) - .9 * worry, open: lerp(0, 1, wake), sad: .7 * worry, look: [lerp(0, -.8, worry), 0] } });
      if (Math.sin(ca) >= 0) drawCharon(g, chx, chy, 30, { spin: t * .3, light: [-.6, -.5] });
    });
    if (!NOBOOK) { p.save(); p.font = '600 15px Cinzel'; p.letterSpacing = '7px'; p.fillStyle = rgba(GOLD_L, .9); p.textAlign = 'center'; p.textBaseline = 'middle'; p.direction = 'ltr';
    p.fillText('ATLAS COELESTIS PVERORVM  ·  VOLVMEN IX', 960, 96); p.letterSpacing = '0px';
    p.font = '500 22px Frank'; p.direction = 'rtl'; p.fillStyle = rgba([226, 210, 180], .85); p.fillText('אטלס השמיים לילדים · כרך ט׳', 960, 124); p.restore(); }
    const said = w => win(n, w - .1, w + .35);
    foilText(p, 'פלוטו', 960, 822, 150, { weight: 900, glow: .15 + .5 * said(.5) * (1 - win(n, 2.4, 3.6) * .4), sheen: (n - .45) / 1.0 });
    const words = ['הכוכב', 'שביטלו', 'אותו'], ts = [1.88, 2.38, 2.98];
    p.save(); p.font = `500 64px ${FONT_TITLE}`; p.direction = 'rtl'; const ws = words.map(w => p.measureText(w).width), sp = p.measureText(' ').width * 1.1, tot = ws.reduce((a, b) => a + b) + sp * 2; p.restore();
    let xr = 960 + tot / 2;
    words.forEach((w, i) => { const s = said(ts[i]); const cx = xr - ws[i] / 2;
      foilText(p, w, cx, 930, 64, { weight: 500, fill: rgba(mixc([150, 140, 150], [244, 226, 196], s)), glow: s * .25 });
      xr -= ws[i] + sp; });
    p.save(); p.strokeStyle = rgba(GOLD_L, .7); p.lineWidth = 1.2; p.beginPath(); p.moveTo(760, 990); p.lineTo(1160, 990); p.stroke(); star5(p, 960, 990, 7, 3); p.fillStyle = rgba(GOLD_L); p.fill(); p.restore();
    DUST.draw(p, { t, alpha: .45 }, W, H);
    p.restore();
    // the cover starts to lift (page turn follows in the renderer)
    if (lift > 0 && !NOBOOK) { p.fillStyle = `rgba(255,240,200,${.06 * lift})`; p.fillRect(0, 0, W, H); }
  }
});

// ===================== s8: the back cover (book closes) =====================
