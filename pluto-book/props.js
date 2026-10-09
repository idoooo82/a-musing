// ===================== characters & props: astronomer, telescope, stamp, tag, plaques, bubbles =====================
'use strict';
const FONT_TITLE = 'Frank', FONT_HAND = 'Gveret', FONT_TEXT = 'Frank', FONT_LAT = 'Cinzel';

// ---------- the astronomer: a tiny, pompous man - drawn as an ink illustration in the book's margin ----------
// (x,y) = between his feet. s = full height in px. o: {pose:'stand'|'scope'|'stamp'|'point'|'talk', face:1|-1 (facing right/left),
//  blink (0..1), talk (0..1), arm (0..1 raise amount for stamp/point), stampScale, onDark (cream lines for dark backgrounds), bob}
function drawAstronomer(g, x, y, s, o = {}) {
  const u = s / 100, f = o.face === undefined ? 1 : o.face, pose = o.pose || 'stand', arm = o.arm === undefined ? 1 : o.arm;
  const dark = !!o.onDark, LINE = dark ? 'rgba(244,232,206,.95)' : 'rgba(58,38,24,.95)';
  const wash = (c, a) => dark ? `rgba(${c[0]},${c[1]},${c[2]},${a * .8})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const lw = Math.max(1, 1.3 * u * .9);
  g.save(); g.translate(x, y + (o.bob || 0) * u); g.scale(f, 1); g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = lw; g.strokeStyle = LINE;
  const shape = (fill, fn) => { g.beginPath(); fn(); if (fill) { g.fillStyle = fill; g.fill(); } g.stroke(); };
  // ground hatch
  g.save(); g.lineWidth = lw * .7; g.globalAlpha = .6; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo((i * 6 - 3) * u, 1 * u); g.lineTo((i * 6 + 3) * u, 1 * u); g.stroke(); } g.restore();
  // legs + shoes
  shape(wash([60, 50, 70], .5), () => { g.rect(-8 * u, -17 * u, 5.5 * u, 15 * u); g.rect(2.5 * u, -17 * u, 5.5 * u, 15 * u); });
  shape(wash([40, 30, 40], .75), () => { g.ellipse(-6 * u, -1.5 * u, 7.5 * u, 2.8 * u, 0, 0, 7); }); shape(wash([40, 30, 40], .75), () => { g.ellipse(7 * u, -1.5 * u, 7.5 * u, 2.8 * u, 0, 0, 7); });
  // long coat, a little too big for him
  shape(wash([62, 82, 128], .55), () => { g.moveTo(-12 * u, -64 * u); g.quadraticCurveTo(-21 * u, -40 * u, -20 * u, -14 * u); g.quadraticCurveTo(0, -10 * u, 20 * u, -14 * u); g.quadraticCurveTo(21 * u, -40 * u, 12 * u, -64 * u); g.closePath(); });
  g.save(); g.lineWidth = lw * .55; g.globalAlpha = .7; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo((12 + i * 1.2) * u, (-56 + i * 6) * u); g.lineTo((16 + i * .6) * u, (-50 + i * 6) * u); g.stroke(); } g.restore();  // shade hatching
  g.beginPath(); g.moveTo(0, -60 * u); g.lineTo(0, -14 * u); g.stroke();
  for (const by of [-50, -40, -30]) { g.beginPath(); g.arc(2.5 * u, by * u, 1.1 * u, 0, 7); g.stroke(); }
  shape(null, () => { g.moveTo(-8 * u, -64 * u); g.lineTo(0, -52 * u); g.lineTo(8 * u, -64 * u); });
  shape(wash([190, 50, 55], .8), () => { g.moveTo(0, -63 * u); g.lineTo(-5.5 * u, -66 * u); g.lineTo(-5.5 * u, -60 * u); g.closePath(); g.moveTo(0, -63 * u); g.lineTo(5.5 * u, -66 * u); g.lineTo(5.5 * u, -60 * u); g.closePath(); });
  // arms
  const drawArm = (sx, sy, ex, ey) => { g.save(); g.lineWidth = 6 * u; g.strokeStyle = wash([62, 82, 128], .9); g.beginPath(); g.moveTo(sx * u, sy * u); g.quadraticCurveTo(((sx + ex) / 2 + 2) * u, ((sy + ey) / 2 + 4) * u, ex * u, ey * u); g.stroke(); g.restore();
    g.beginPath(); g.moveTo(sx * u, sy * u); g.quadraticCurveTo(((sx + ex) / 2 + 2) * u, ((sy + ey) / 2 + 4) * u, ex * u, ey * u); g.stroke();
    shape(wash([240, 205, 175], .9), () => g.arc(ex * u, ey * u, 3.2 * u, 0, 7)); };
  if (pose === 'stamp') { const ay = lerp(-40, -112, arm), ax = lerp(16, 6, arm); drawArm(-11, -58, -15, -34); drawArm(11, -58, ax, ay); drawStampTool(g, ax * u, (ay - 4) * u, (o.stampScale || 1) * u * .55, -.1); }
  else if (pose === 'point') { const ey = lerp(-40, -92, arm); drawArm(-11, -58, -15, -34); drawArm(11, -58, 20, ey); g.beginPath(); g.moveTo(20 * u, ey * u); g.lineTo(21 * u, (ey - 7) * u); g.stroke(); }
  else if (pose === 'scope') { drawArm(-11, -58, 14, -70); drawArm(11, -58, 22, -66); }
  else { drawArm(-11, -58, -15, -34); drawArm(11, -58, 15, -34); }
  // head: bald dome, white side tufts, round glasses, a grand moustache
  const hy = -78 * u;
  shape(wash([242, 210, 180], .85), () => g.arc(0, hy, 14 * u, 0, 7));
  g.save(); g.lineWidth = lw * .6; for (const sx of [-1, 1]) { for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(sx * 12 * u, hy - (4 - i * 2) * u); g.quadraticCurveTo(sx * 17 * u, hy - (2 - i * 2) * u, sx * 15 * u, hy + (2 + i * 2) * u); g.stroke(); } } g.restore();
  g.beginPath(); g.moveTo(-2 * u, hy - 14 * u); g.quadraticCurveTo(-1 * u, hy - 19 * u, 3 * u, hy - 18 * u); g.stroke();       // the one stubborn hair
  shape(wash([230, 150, 130], .7), () => g.ellipse(5 * u, hy + 3 * u, 3.6 * u, 3 * u, 0, 0, 7));                                // nose
  shape(wash([250, 248, 240], .9), () => { g.moveTo(-8 * u, hy + 9 * u); g.quadraticCurveTo(-2 * u, hy + 4 * u, 4 * u, hy + 7 * u); g.quadraticCurveTo(10 * u, hy + 4 * u, 15 * u, hy + 8 * u); g.quadraticCurveTo(6 * u, hy + 12 * u, 4 * u, hy + 9 * u); g.quadraticCurveTo(-2 * u, hy + 13 * u, -8 * u, hy + 9 * u); });
  if (o.talk) shape(wash([90, 30, 40], .9), () => g.ellipse(3 * u, hy + 12 * u, 2.6 * u, 2 * u * o.talk + .3 * u, 0, 0, 7));
  for (const ex of [-3, 8]) shape(wash([215, 235, 250], .5), () => g.arc(ex * u, hy - 3 * u, 4.6 * u, 0, 7));
  g.beginPath(); g.moveTo(1.6 * u, hy - 3 * u); g.lineTo(3.4 * u, hy - 3 * u); g.stroke();
  const bl = clamp(o.blink || 0); g.fillStyle = LINE; for (const ex of [-3, 8]) { g.beginPath(); g.ellipse((ex + 1) * u, hy - 3 * u, 1.1 * u, 1.3 * u * (1 - bl) + .2 * u, 0, 0, 7); g.fill(); }
  g.save(); g.lineWidth = lw * 1.3; g.beginPath(); g.moveTo(-7 * u, hy - 10 * u); g.lineTo(-1 * u, hy - 8.6 * u); g.moveTo(5 * u, hy - 8.6 * u); g.lineTo(12 * u, hy - 10 * u); g.stroke(); g.restore();   // stern brows
  g.restore();
}

// a brass telescope on a tripod. (x,y) = tripod feet centre, len = tube length px, ang = elevation angle (rad, 0 = horizontal right)
function drawTelescope(g, x, y, len, ang = -.35, o = {}) {
  const u = len / 100;
  g.save(); g.translate(x, y); g.lineCap = 'round';
  g.strokeStyle = '#5b4632'; g.lineWidth = 2.6 * u;
  const hx = 0, hy = -38 * u;
  for (const fx of [-18, 0, 18]) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(fx * u, 0); g.stroke(); }
  g.translate(hx, hy); g.rotate(ang);
  const gr = g.createLinearGradient(0, -8 * u, 0, 8 * u); gr.addColorStop(0, '#f7d98b'); gr.addColorStop(.5, '#c9953f'); gr.addColorStop(1, '#8a5f22');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(-40 * u, -4.5 * u); g.lineTo(60 * u, -8 * u); g.lineTo(60 * u, 8 * u); g.lineTo(-40 * u, 4.5 * u); g.closePath(); g.fill(); g.strokeStyle = o.onDark ? 'rgba(244,232,206,.9)' : 'rgba(58,38,24,.9)'; g.lineWidth = Math.max(1, 1.1 * u); g.stroke();
  g.fillStyle = '#7a5420'; for (const rx of [-28, 5, 40]) g.fillRect(rx * u, -7.5 * u, 3 * u, 15 * u);
  g.fillStyle = '#1d2a4a'; g.beginPath(); g.ellipse(60 * u, 0, 2.5 * u, 8 * u, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(170,230,255,.7)'; g.beginPath(); g.ellipse(60.5 * u, -2 * u, 1.2 * u, 4 * u, 0, 0, 7); g.fill();
  g.fillStyle = '#4a3420'; g.fillRect(-46 * u, -3 * u, 7 * u, 6 * u);   // eyepiece
  g.restore();
}

// ---------- the rubber stamp ----------
let _STAMP = {};
function stampTex(text = 'מבוטל') {
  if (_STAMP[text]) return _STAMP[text];
  const c = canvas(980, 380), x = c.getContext('2d'); x.direction = 'rtl';
  x.strokeStyle = 'rgb(214,40,52)'; x.fillStyle = 'rgb(214,40,52)'; x.lineWidth = 18; x.beginPath(); x.roundRect(22, 22, 936, 336, 34); x.stroke();
  x.lineWidth = 5; x.beginPath(); x.roundRect(52, 52, 876, 276, 22); x.stroke();
  x.font = `900 228px ${FONT_TITLE}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 490, 196);
  x.globalCompositeOperation = 'destination-out'; const r = mulberry(7);
  for (let i = 0; i < 1600; i++) { x.globalAlpha = .25 + r() * .75; x.beginPath(); x.arc(r() * 980, r() * 380, r() * 3.4, 0, 7); x.fill(); }
  for (let i = 0; i < 26; i++) { x.globalAlpha = .2 + r() * .4; x.lineWidth = 1 + r() * 3; x.beginPath(); const y0 = r() * 380; x.moveTo(r() * 980, y0); x.lineTo(r() * 980, y0 + (r() - .5) * 40); x.stroke(); }
  x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  return (_STAMP[text] = c);
}
// ink mark. (x,y) centre, scale 1 = 980px wide. o: {text, glow}
function drawStampMark(g, x, y, scale, rot = -.16, alpha = 1, o = {}) {
  if (alpha <= 0) return; const T = stampTex(o.text);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(scale, scale); g.globalAlpha *= alpha;
  if (o.glow) { g.shadowColor = 'rgba(255,40,55,.7)'; g.shadowBlur = 30 * o.glow; }
  g.drawImage(T, -490, -190); g.restore();
}
// the stamp object (wooden handle + red rubber). (x,y) = centre of the rubber face. s: 1 => ~ 200px wide
function drawStampTool(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 6, 108, 12, 0, 0, 7); g.fill();
  g.fillStyle = '#c9333f'; g.beginPath(); g.roundRect(-100, -8, 200, 16, 5); g.fill();                 // rubber
  let gr = g.createLinearGradient(0, -48, 0, -8); gr.addColorStop(0, '#d9a066'); gr.addColorStop(1, '#9b6534'); g.fillStyle = gr;
  g.beginPath(); g.roundRect(-92, -46, 184, 40, 8); g.fill();                                            // wooden block
  g.fillStyle = '#7a4c27'; g.fillRect(-14, -96, 28, 52);                                                  // neck
  gr = g.createRadialGradient(-12, -120, 4, 0, -112, 34); gr.addColorStop(0, '#f0c48a'); gr.addColorStop(1, '#8e5a2c'); g.fillStyle = gr;
  g.beginPath(); g.arc(0, -112, 30, 0, 7); g.fill();                                                      // knob
  g.restore();
}

// ---------- luggage tag "מתחזה" hanging on a string ----------
// (ax,ay) anchor (where the string is tied), len string length, swing angle rad, s scale (1 = 260px wide)
function drawTag(g, ax, ay, len, swing = 0, s = 1, text = 'מתחזה', alpha = 1) {
  const tx = ax + Math.sin(swing) * len, ty = ay + Math.cos(swing) * len;
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = 'rgba(240,230,210,.95)'; g.lineWidth = 2.5 * s; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + tx) / 2 + 14 * s, (ay + ty) / 2, tx, ty); g.stroke();
  g.translate(tx, ty); g.rotate(-swing * .8); g.scale(s, s);
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.fillStyle = '#f1e6cf';
  g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(130, 38); g.lineTo(130, 150); g.lineTo(-130, 150); g.lineTo(-130, 38); g.closePath(); g.fill(); g.shadowBlur = 0;
  g.fillStyle = '#1c1830'; g.beginPath(); g.arc(0, 20, 8, 0, 7); g.fill();
  g.strokeStyle = 'rgba(214,40,52,.9)'; g.lineWidth = 3; g.strokeRect(-110, 52, 220, 84);
  g.fillStyle = 'rgb(196,48,56)'; g.font = `800 60px ${FONT_TITLE}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText(text, 0, 90);
  g.font = `600 15px ${FONT_LAT}`; g.letterSpacing = '4px'; g.direction = 'ltr'; g.fillStyle = 'rgba(120,90,60,.9)'; g.fillText('IMPOSTOR', 0, 124); g.letterSpacing = '0px';
  g.restore();
}

// ---------- "walk of fame" star plaque ----------
// (x,y) centre, w width px. o: {persp (y squash, default .42), gold (0..1 golden glow), crossed (0..1), cracked (0..1), alpha, glow, ink(0..1 red stamp)}
function star5(g, x, y, R, r0, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? r0 : R; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
function drawPlaque(g, x, y, w, name, o = {}) {
  const ps = o.persp === undefined ? .42 : o.persp, gold = o.gold || 0;
  const lat = typeof name === 'string' ? name : name.lat, he = typeof name === 'string' ? '' : name.he;
  g.save(); g.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha); g.translate(x, y); g.scale(1, ps);
  const h = w;
  let gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, '#1f2b52'); gr.addColorStop(1, '#141c3a'); g.fillStyle = gr;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .04); g.fill();
  g.strokeStyle = rgba(mixc(GOLD, [255, 214, 120], gold), .9); g.lineWidth = Math.max(1, w * .012); g.stroke();
  g.beginPath(); g.roundRect(-w / 2 + w * .04, -h / 2 + w * .04, w - w * .08, h - w * .08, w * .025); g.lineWidth = Math.max(.6, w * .005); g.stroke();
  // engraved star (outline + fine inner line), fills with light when golden
  if (gold > 0) { star5(g, 0, -h * .1, w * .34, w * .14); const fg = g.createRadialGradient(0, -h * .1, 0, 0, -h * .1, w * .34); fg.addColorStop(0, rgba([255, 236, 170], gold)); fg.addColorStop(1, rgba([214, 150, 50], gold)); g.fillStyle = fg; g.fill(); }
  star5(g, 0, -h * .1, w * .34, w * .14); g.strokeStyle = rgba(mixc(GOLD_L, [255, 228, 150], gold)); g.lineWidth = Math.max(1, w * .016); g.stroke();
  star5(g, 0, -h * .1, w * .27, w * .11); g.lineWidth = Math.max(.5, w * .005); g.stroke();
  if (o.glow || gold) { g.save(); g.globalCompositeOperation = 'lighter'; const gg = g.createRadialGradient(0, 0, 0, 0, 0, w * .7); gg.addColorStop(0, `rgba(255,210,130,${.22 * Math.max(o.glow || 0, gold)})`); gg.addColorStop(1, 'rgba(255,210,130,0)'); g.fillStyle = gg; g.beginPath(); g.arc(0, 0, w * .7, 0, 7); g.fill(); g.restore(); }
  // names
  g.fillStyle = rgba(mixc(GOLD_L, [255, 230, 140], gold)); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `600 ${Math.round(w * .135)}px ${FONT_LAT}`; g.letterSpacing = `${Math.round(w * .02)}px`; g.direction = 'ltr'; g.fillText(lat, 0, h * .3); g.letterSpacing = '0px';
  if (he) { g.font = `500 ${Math.round(w * .095)}px ${FONT_TITLE}`; g.direction = 'rtl'; g.globalAlpha *= .8; g.fillText(he, 0, h * .42); }
  if (o.cracked) { g.strokeStyle = `rgba(5,8,20,${.85 * o.cracked})`; g.lineWidth = Math.max(1, w * .01); g.beginPath(); g.moveTo(-w * .05, -h * .5); g.lineTo(w * .04, -h * .2); g.lineTo(-w * .08, h * .05); g.lineTo(w * .1, h * .3); g.lineTo(w * .02, h * .5); g.stroke(); }
  if (o.crossed) { const c = o.crossed; g.strokeStyle = 'rgba(196,48,56,.95)'; g.lineWidth = w * .035; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * .36, h * .3); g.lineTo(w * .36 - w * .72 * c, h * .3 - h * .02 * c); g.stroke(); }
  g.restore();
}

// ---------- paper speech bubble with handwritten text ----------
function drawBubble(g, x, y, w, h, tx, ty, text, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); const s = o.scale || 1; g.scale(s, s);
  g.shadowColor = 'rgba(20,10,40,.35)'; g.shadowBlur = 16; g.fillStyle = '#fbf3e3';
  g.beginPath(); g.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-w * .08, h * .3); g.quadraticCurveTo((tx - x) / s * .5, (ty - y) / s * .6, (tx - x) / s, (ty - y) / s); g.quadraticCurveTo((tx - x) / s * .4, (ty - y) / s * .4, w * .08, h * .32); g.fill();
  g.shadowBlur = 0; g.fillStyle = o.color || '#3a2418'; g.font = `${o.size || Math.round(h * .42)}px ${o.font || FONT_HAND}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  g.fillText(text, 0, h * .03); g.restore();
}
// handwritten label (pencil-like), e.g. for measurements
function drawLabel(g, x, y, text, size = 48, col = [60, 40, 30], o = {}) {
  g.save(); g.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.sx) g.scale(o.sx, o.sy || 1);
  g.font = `${o.weight || ''} ${size}px ${o.font || FONT_HAND}`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.direction = 'rtl';
  if (o.glow) { g.shadowColor = o.glowCol || 'rgba(255,220,140,.9)'; g.shadowBlur = o.glow; }
  if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.strokeCol || 'rgba(255,248,235,.9)'; g.strokeText(text, 0, 0); }
  g.fillStyle = Array.isArray(col) ? rgba(col) : col; g.fillText(text, 0, 0); g.restore();
}
