// ===================== painted spheres: Pluto, Charon, planets, kid-stars; relief faces =====================
'use strict';
const TEXW = 1024, TEXH = 512;
const TEX = {};
// procedural equirectangular textures, painterly + pastel. lon in [0,2pi), lat in [-pi/2, pi/2] (negative = top of screen)
function buildTex(kind) {
  if (TEX[kind]) return TEX[kind];
  const d = new Uint8ClampedArray(TEXW * TEXH * 3);
  const rnd = mulberry(kind.length * 97 + kind.charCodeAt(0));
  const craters = []; for (let i = 0; i < 46; i++) craters.push({ lon: rnd() * 6.283, lat: (rnd() - .5) * 2.6, r: .03 + Math.pow(rnd(), 2) * .11 });
  for (let j = 0; j < TEXH; j++) {
    const lat = (j / TEXH - .5) * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
    for (let i = 0; i < TEXW; i++) {
      const lon = i / TEXW * 2 * Math.PI, X = Math.cos(lon) * cl, Y = sl, Z = Math.sin(lon) * cl;
      let c;
      if (kind === 'pluto') {
        const a = fbm3(X * 2.2 + 3, Y * 2.2, Z * 2.2, 5), b = fbm3(X * 6 + 9, Y * 6, Z * 6, 4);
        c = mixc([248, 228, 204], [232, 168, 128], clamp((a - .36) * 2.4));
        c = mixc(c, [214, 150, 120], clamp((fbm3(X * 9 + 4, Y * 9, Z * 9, 3) - .55) * 3) * .35);
        c = mixc(c, [214, 196, 226], clamp((b - .55) * 3) * .35);            // lavender frost
        // dark rusty band ("whale") on the left/back, kept away from the face (lon ~ 0)
        let dl = Math.atan2(Math.sin(lon - .3), Math.cos(lon - .3));
        const band = clamp(1 - Math.abs(dl) / .8) * clamp(1 - Math.abs(lat - .12 + .18 * Math.sin(lon * 2)) / .32) * clamp((a + .25) * 1.4);
        c = mixc(c, [172, 94, 74], clamp(band * 1.7) * .9);
        // bright icy plain on the upper right (kept as a soft blob, not a heart)
        let dp = Math.atan2(Math.sin(lon - 2.5), Math.cos(lon - 2.5));
        const plain = clamp(1 - Math.hypot(dp / .7, (lat + .15) / .55)) * clamp(b * 1.6);
        c = mixc(c, [255, 244, 230], plain * .55);
      } else if (kind === 'charon') {
        const a = fbm3(X * 2.5 + 1, Y * 2.5, Z * 2.5, 5);
        c = mixc([196, 192, 196], [160, 154, 160], clamp((a - .35) * 2));
        c = mixc(c, [168, 92, 78], clamp((-lat - .95) * 2.2 + (a - .5)) * .9);      // the red cap
      } else if (kind === 'mercury') {
        const a = fbm3(X * 3 + 4, Y * 3, Z * 3, 5); c = mixc([196, 186, 178], [140, 132, 128], clamp((a - .35) * 2));
      } else if (kind === 'venus') {
        const a = fbm3(X * 2 + Y * 1.5, Y * 5, Z * 2, 5); c = mixc([250, 228, 170], [226, 182, 112], clamp((a - .35) * 2));
      } else if (kind === 'earth') {
        const a = fbm3(X * 2 + 7, Y * 2, Z * 2, 5), cl2 = fbm3(X * 3 + 20, Y * 6, Z * 3, 5);
        c = a > .52 ? mixc([118, 176, 96], [196, 170, 110], clamp((a - .6) * 4)) : mixc([70, 130, 214], [56, 104, 186], clamp((.52 - a) * 3));
        if (Math.abs(lat) > 1.2) c = [245, 248, 255];
        c = mixc(c, [255, 255, 255], clamp((cl2 - .55) * 3.5) * .85);
      } else if (kind === 'mars') {
        const a = fbm3(X * 2.5 + 2, Y * 2.5, Z * 2.5, 5); c = mixc([226, 128, 82], [168, 80, 56], clamp((a - .4) * 2.5));
        if (Math.abs(lat) > 1.25) c = mixc(c, [255, 245, 240], .9);
      } else if (kind === 'jupiter') {
        const tb = fbm3(X * 3, Y * 1.2, Z * 3, 4); const s = Math.sin(lat * 11 + tb * 3.2);
        c = mixc([246, 224, 190], [200, 140, 92], clamp(s * .5 + .5));
        c = mixc(c, [168, 106, 74], clamp(Math.sin(lat * 23 + tb * 6) - .55) * .7);
        const dl = Math.atan2(Math.sin(lon - 1.0), Math.cos(lon - 1.0)); const spot = clamp(1 - Math.hypot(dl / .32, (lat - .38) / .12));
        c = mixc(c, [210, 104, 80], spot * .9);
      } else if (kind === 'saturn') {
        const tb = fbm3(X * 3, Y * 1.2, Z * 3, 4); const s = Math.sin(lat * 9 + tb * 2);
        c = mixc([250, 232, 182], [222, 190, 128], clamp(s * .5 + .5));
      } else if (kind === 'uranus') {
        const tb = fbm3(X * 2, Y * 1.5, Z * 2, 4); c = mixc([182, 232, 236], [150, 210, 222], clamp(Math.sin(lat * 6 + tb * 2) * .5 + .5));
      } else if (kind === 'neptune') {
        const tb = fbm3(X * 2, Y * 1.4, Z * 2, 4); c = mixc([92, 128, 224], [66, 94, 196], clamp(Math.sin(lat * 7 + tb * 3) * .5 + .5));
        c = mixc(c, [190, 210, 255], clamp(Math.sin(lat * 15 + tb * 7) - .75) * .8);
      } else if (kind === 'star') {      // kid-stars (little glowing suns)
        const a = fbm3(X * 3, Y * 3, Z * 3, 4); c = mixc([255, 236, 170], [255, 196, 110], clamp((a - .4) * 2));
      } else { c = [200, 200, 200]; }
      // soft craters on rocky bodies (away from Pluto's face area)
      if (kind === 'pluto' || kind === 'charon' || kind === 'mercury') {
        for (const k of craters) {
          let dl = Math.atan2(Math.sin(lon - k.lon), Math.cos(lon - k.lon)) * cl, dd = Math.hypot(dl, lat - k.lat) / k.r;
          if (dd > 1.4) continue;
          if (kind === 'pluto') { const fl = Math.atan2(Math.sin(k.lon - Math.PI / 2), Math.cos(k.lon - Math.PI / 2)); if (Math.abs(fl) < .75 && Math.abs(k.lat) < .65) continue; }
          const sh = dd < 1 ? -.10 * (1 - dd * dd) : 0, rim = .09 * Math.exp(-Math.pow((dd - 1.05) / .14, 2));
          c = [c[0] * (1 + sh + rim), c[1] * (1 + sh + rim), c[2] * (1 + sh + rim)];
        }
      }
      const k = (j * TEXW + i) * 3; d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2];
    }
  }
  return (TEX[kind] = d);
}

// ---------- the sphere painter ----------
// o: {kind, spin, light:[lx,ly] (direction the light COMES FROM, screen space), gray, gold, glow, atm, rim, alpha,
//     squash:[sx,sy], rot, face:{...relief params} or null, ring:{tilt, inner, outer, sq, col}, decal(g,cx,cy,r), albedo:[r,g,b] tint}
const _scr = canvas(8, 8), _sx = _scr.getContext('2d');
function drawBody(g, x, y, r, o = {}) {
  const kind = o.kind || 'pluto'; const tex = buildTex(kind);
  const R = Math.max(2, Math.ceil(r)), S = 2 * R + 6;
  if (_scr.width < S || _scr.height < S) { _scr.width = Math.max(S, _scr.width); _scr.height = Math.max(S, _scr.height); }
  _sx.setTransform(1, 0, 0, 1, 0, 0); _sx.clearRect(0, 0, _scr.width, _scr.height);
  const img = _sx.createImageData(S, S), D = img.data;
  const spin = o.spin || 0, gray = o.gray || 0, gold = o.gold || 0, glow = o.glow || 0, rimA = o.rim === undefined ? .35 : o.rim;
  let lx = o.light ? o.light[0] : -.62, ly = o.light ? o.light[1] : -.55; const lz0 = Math.sqrt(Math.max(.04, 1 - lx * lx - ly * ly)); const ll = Math.hypot(lx, ly, lz0); lx /= ll; ly /= ll; const LZ = lz0 / ll;
  const cx = R + 3, cy = R + 3, ir = 1 / r;
  const shadowCol = o.shadow || [70, 62, 118];
  const LC = o.lightCol || [1, 1, 1], AMB = o.amb === undefined ? 1 : o.amb;
  let l2 = null; if (o.light2 && o.light2.k > 0) { let [ax, ay] = o.light2.dir; const az = Math.sqrt(Math.max(.02, 1 - ax * ax - ay * ay)); const al = Math.hypot(ax, ay, az); l2 = [ax / al, ay / al, az / al, o.light2.col || [255, 160, 90], o.light2.k]; }
  const F = o.face, cs = Math.cos(spin), sn = Math.sin(spin);
  let K = 0, fy0 = 0, fsz = 1;
  if (F && r > 6) { FACE.height(F); K = .052 * (F.relief === undefined ? 1 : F.relief); fy0 = F.y === undefined ? .02 : F.y; fsz = 1; }
  for (let py = 0; py < S; py++) {
    const dy = (py + .5 - cy) * ir; if (Math.abs(dy) > 1.02) continue;
    for (let px = 0; px < S; px++) {
      const dx = (px + .5 - cx) * ir, d2 = dx * dx + dy * dy; if (d2 > 1.03) continue;
      const dd = Math.sqrt(d2), aa = clamp((1 - dd) * r + .5); if (aa <= 0) continue;
      const nz = Math.sqrt(Math.max(0, 1 - d2));
      let lon = Math.atan2(dx, nz) + spin + Math.PI / 2, lat = Math.asin(clamp(dy, -1, 1));
      let u = (lon / (2 * Math.PI)) % 1; if (u < 0) u += 1; let v = (lat / Math.PI + .5);
      const fx = u * TEXW - .5, fy = clamp(v * TEXH - .5, 0, TEXH - 1.001), ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      const i0 = ((ix % TEXW) + TEXW) % TEXW, i1 = (i0 + 1) % TEXW, j1 = Math.min(iy + 1, TEXH - 1);
      const a0 = (iy * TEXW + i0) * 3, a1 = (iy * TEXW + i1) * 3, b0 = (j1 * TEXW + i0) * 3, b1 = (j1 * TEXW + i1) * 3;
      let cr = (tex[a0] * (1 - tx) + tex[a1] * tx) * (1 - ty) + (tex[b0] * (1 - tx) + tex[b1] * tx) * ty;
      let cg = (tex[a0 + 1] * (1 - tx) + tex[a1 + 1] * tx) * (1 - ty) + (tex[b0 + 1] * (1 - tx) + tex[b1 + 1] * tx) * ty;
      let cb = (tex[a0 + 2] * (1 - tx) + tex[a1 + 2] * tx) * (1 - ty) + (tex[b0 + 2] * (1 - tx) + tex[b1 + 2] * tx) * ty;
      // normal (perturbed by the face relief)
      let Nx = dx, Ny = dy, Nz = nz;
      if (K) {
        const bx = dx * cs + nz * sn, bz = -dx * sn + nz * cs;          // body (face) frame
        if (bz > .15) {
          const s = FACE.sample(bx, dy - fy0);
          if (s[3] > 0) {
            const wgt = s[3] * clamp((bz - .15) / .25);
            let qx = bx - K * s[1] * wgt, qy = dy - K * s[2] * wgt, qz = bz; const ql = Math.hypot(qx, qy, qz); qx /= ql; qy /= ql; qz /= ql;
            Nx = qx * cs - qz * sn; Ny = qy; Nz = qx * sn + qz * cs;
            const hgt = s[0] * wgt, ao = 1 + .30 * Math.min(0, hgt) + .06 * Math.max(0, hgt);
            cr *= ao; cg *= ao; cb *= ao;
          }
        }
      }
      // soft painterly light: wrapped diffuse, cool violet shadows, faint rim from the nebula
      const ndl = Nx * lx + Ny * ly + Nz * LZ, wrap = clamp((ndl + .30) / 1.30);
            const shadowMix = (1 - wrap) * .30;
      const t0 = cr, t1 = cg, t2 = cb;
      const shA = AMB * (.30 * (1 - Math.pow(wrap, .5)) ) + .74 * Math.pow(wrap, 1.15);
      cr = t0 * (AMB * .30 + .74 * Math.pow(wrap, 1.15) * LC[0]) * (1 - shadowMix) + shadowCol[0] * shadowMix * AMB;
      cg = t1 * (AMB * .30 + .74 * Math.pow(wrap, 1.15) * LC[1]) * (1 - shadowMix) + shadowCol[1] * shadowMix * AMB;
      cb = t2 * (AMB * .30 + .74 * Math.pow(wrap, 1.15) * LC[2]) * (1 - shadowMix) + shadowCol[2] * shadowMix * AMB;
      if (l2) { const d2l = Nx * l2[0] + Ny * l2[1] + Nz * l2[2], w2 = Math.pow(clamp(d2l), 1.4) * l2[4]; cr += t0 / 255 * l2[3][0] * w2; cg += t1 / 255 * l2[3][1] * w2; cb += t2 / 255 * l2[3][2] * w2; }
      const rim = Math.pow(1 - nz, 2.6) * rimA * clamp(.3 - (dx * lx + dy * ly + nz * LZ) * 1.2);
      cr += 120 * rim; cg += 185 * rim; cb += 215 * rim;
      const spec = Math.pow(clamp(ndl), 22) * .10; cr += 255 * spec; cg += 248 * spec; cb += 235 * spec;
      if (glow > 0) { const k = glow * Math.pow(nz, 1.5) * .18; cr += 255 * k; cg += 165 * k; cb += 95 * k; }
      if (gold > 0) { const l = (cr * .3 + cg * .55 + cb * .15) / 255; const gl = .30 + l * .95;
        cr = lerp(cr, 250 * Math.min(1.15, gl) + 30 * Math.pow(nz, 3), gold); cg = lerp(cg, 190 * gl + 20 * Math.pow(nz, 3), gold); cb = lerp(cb, 78 * gl, gold); }
      if (gray > 0) { const l = cr * .3 + cg * .55 + cb * .15; cr = lerp(cr, l * .92, gray); cg = lerp(cg, l * .96, gray); cb = lerp(cb, l * 1.08, gray); }
      const k = (py * S + px) * 4; D[k] = cr; D[k + 1] = cg; D[k + 2] = cb; D[k + 3] = 255 * aa;
    }
  }
  _sx.putImageData(img, 0, 0);
  if (o.decal) o.decal(_sx, cx, cy, r);                 // scene hook: draw on the body surface (stamp ink, cracks ...)
  const sq = o.squash || [1, 1];
  g.save(); g.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(sq[0], sq[1]);
  if (o.ring) drawRing(g, r, o.ring, 'back');
  g.drawImage(_scr, 0, 0, S, S, -cx, -cy, S, S);
  if (o.ring) drawRing(g, r, o.ring, 'front');
  g.restore();
  // thin atmosphere (Pluto's real hazy blue layer) + inner warmth / gold halo - outside the disc only
  if (o.atm || glow || gold) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(sq[0], sq[1]);
    if (o.atm) { const a = o.atm, RR = r * 1.16; const gr = g.createRadialGradient(0, 0, 0, 0, 0, RR); gr.addColorStop(0, 'rgba(120,170,240,0)'); gr.addColorStop(.83, 'rgba(120,170,240,0)'); gr.addColorStop(.87, `rgba(150,195,250,${.20 * a})`); gr.addColorStop(.92, `rgba(120,170,240,${.06 * a})`); gr.addColorStop(1, 'rgba(120,170,240,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, RR, 0, 7); g.fill(); }
    const ga = glow * .25 + gold * .5; if (ga > 0) { const RR = r * (1.5 + gold * .6); const gr = g.createRadialGradient(0, 0, 0, 0, 0, RR); gr.addColorStop(0, 'rgba(255,200,120,0)'); gr.addColorStop(r / RR * .97, 'rgba(255,200,120,0)'); gr.addColorStop(r / RR * 1.01, `rgba(255,${196 + 30 * gold | 0},${120 - 40 * gold | 0},${.38 * ga})`); gr.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, RR, 0, 7); g.fill(); }
    g.restore();
  }
}
function drawRing(g, r, o, part) {
  const tilt = o.tilt || -.25, w1 = o.inner || 1.35, w2 = o.outer || 2.2, sq = o.sq || .28, col = o.col || [236, 214, 170];
  g.save(); g.rotate(tilt);
  g.beginPath();
  if (part === 'back') { g.ellipse(0, 0, r * w2, r * w2 * sq, 0, Math.PI, 2 * Math.PI); g.ellipse(0, 0, r * w1, r * w1 * sq, 0, 2 * Math.PI, Math.PI, true); }
  else { g.ellipse(0, 0, r * w2, r * w2 * sq, 0, 0, Math.PI); g.ellipse(0, 0, r * w1, r * w1 * sq, 0, Math.PI, 0, true); }
  g.closePath();
  const gr = g.createRadialGradient(0, 0, r * w1, 0, 0, r * w2); gr.addColorStop(0, rgba(col, .55)); gr.addColorStop(.45, rgba(col, .9)); gr.addColorStop(.6, rgba(mixc(col, [120, 100, 80], .4), .6)); gr.addColorStop(1, rgba(col, .35));
  g.save(); g.scale(1, 1); g.fillStyle = gr; g.fill(); g.restore();
  g.restore();
}

// ---------- relief face: the face IS the landscape - two broken-rimmed craters and a curved valley,
// revealed only by light and shadow (raking light shows it, flat light hides it). No drawn eyes.
// params: {smile -1..1, open 0..1 (crater depth/height; 0 = closed creases), sad 0..1 (eyes droop, inner brow ridges rise),
//          brow -1..1 (-1 determined/frown ridges, +1 worried), O 0..1 (valley becomes a round gasping crater),
//          look:[x,y] (deeper pit inside each crater shifts), relief (strength, default 1), y (face centre offset), size}
const FACE = (() => {
  const G = 220, X0 = -.7, X1 = .7, Y0 = -.62, Y1 = .7, DX = (X1 - X0) / (G - 1), DY = (Y1 - Y0) / (G - 1);
  let ST = null, WX, WY; const RIM = [new Float32Array(96), new Float32Array(96)], MS = new Float32Array(160), MW = new Float32Array(160), MR = new Float32Array(160);
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  function init() {
    ST = new Float32Array(G * G); WX = new Float32Array(G * G); WY = new Float32Array(G * G);
    const rnd = mulberry(303), cr = []; for (let i = 0; i < 14; i++) cr.push([X0 + rnd() * (X1 - X0), Y0 + rnd() * (Y1 - Y0), .025 + Math.pow(rnd(), 2) * .07]);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const x = X0 + i * DX, y = Y0 + j * DY, k = j * G + i;
      WX[k] = (fbm2(x * 14 + 1, y * 14, 3) - .5) * .05; WY[k] = (fbm2(x * 14 + 9, y * 14, 3) - .5) * .05;
      let h = .13 * fbm2(x * 18, y * 18, 4) + .05 * fbm2(x * 42 + 5, y * 42, 3);
      const away = sm(.42, .66, Math.hypot(x * .9, y - .06));
      for (const [cx, cy, r] of cr) { const d = Math.hypot(x - cx, y - cy) / r; if (d > 1.6) continue; h += away * (-.45 * (1 - sm(0, 1, d)) + .2 * Math.exp(-Math.pow((d - 1.05) / .2, 2))); }
      ST[k] = h;
    }
    for (let e = 0; e < 2; e++) for (let a = 0; a < 96; a++) { const an = a / 96 * 2 * Math.PI; RIM[e][a] = .5 + .8 * fbm2(Math.cos(an) * 2.5 + e * 5, Math.sin(an) * 2.5, 3); }
    for (let m = 0; m < 160; m++) { const mx = -.4 + m / 159 * .8; MS[m] = .35 + .65 * sm(.3, .6, fbm2(mx * 9, 1.3, 3)); MW[m] = .026 + .016 * fbm2(mx * 11, 2, 3); MR[m] = fbm2(mx * 20, 3.3, 3); }
  }
  const tab = (T, mx) => { const f = clamp((mx + .4) / .8) * 159, i = Math.floor(f), t = f - i; return T[i] * (1 - t) + T[Math.min(159, i + 1)] * t; };
  let lastKey = '', H = null, GX = null, GY = null;
  function height(p) {
    if (!ST) init();
    const key = JSON.stringify([p.smile, p.open, p.sad, p.brow, p.O, p.look, p.size]);
    if (key === lastKey) return; lastKey = key;
    const smile = p.smile === undefined ? .5 : p.smile, open = p.open === undefined ? 1 : p.open, sad = p.sad || 0, brow = p.brow || 0, O = p.O || 0, look = p.look || [0, 0], size = p.size || 1;
    H = H || new Float32Array(G * G); GX = GX || new Float32Array(G * G); GY = GY || new Float32Array(G * G);
    const eyes = [[-.265, -.12, .105, .125, 0], [.28, -.105, .115, .12, 1]];
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
      const k = j * G + i; const x = (X0 + i * DX) / size, y = (Y0 + j * DY) / size, fx = x + WX[k], fy = y + WY[k];
      let h = ST[k];
      for (const [sx, sy, rx, ry, e] of eyes) {
        const side = e ? 1 : -1;
        let ex = (fx - sx) / rx, ey = (fy - (sy + .03 * sad)) / (ry * (.28 + .72 * open));
        ey -= sad * .55 * (side * -ex) * -1;                      // outer side droops
        const d = Math.hypot(ex, ey); if (d > 2.6) continue;
        const ai = ((Math.round(Math.atan2(ey, ex) / (2 * Math.PI) * 96) % 96) + 96) % 96, rim = RIM[e][ai];
        h -= (.32 + .52 * open) * (1 - sm(.15, 1, d));
        h += .30 * rim * Math.exp(-Math.pow((d - 1.05) / .22, 2)) * (.6 + .4 * open);
        // inner pit (gives the crater a gaze through shadow only)
        const pd = Math.hypot(fx - sx - look[0] * .035, fy - sy - .01 - look[1] * .03) / .045;
        h -= .34 * open * (1 - sm(.2, 1, pd));
        // brow ridge above the crater: inner end rises when sad/worried, drops when determined
        const amt = clamp(sad + Math.abs(brow)) ; if (amt > .01) {
          const tilt = (sad + brow) * .9 * side;                  // slope of the ridge line
          const bx = (fx - sx) / (rx * 1.35), by = fy - (sy - ry - .075 + tilt * (fx - sx));
          h += .26 * amt * Math.exp(-bx * bx * 1.6) * Math.exp(-Math.pow(by / .028, 2));
        }
      }
      // mouth valley (curves into a smile or a frown), broken into uneven segments + pits; becomes a round crater when gasping
      const mx = fx; const my = .17 + .02 * sad + smile * (.07 - 1.6 * mx * mx);
      const tp = 1 - sm(.2, .35, Math.abs(mx));
      if (O < .99 && tp > 0) {
        const md = Math.abs(fy - my) / tab(MW, mx);
        h -= .65 * Math.exp(-md * md * .7) * tp * tab(MS, mx) * (1 - O);
        h += .18 * Math.exp(-Math.pow((md - 2) / .9, 2)) * tp * tab(MR, mx) * (1 - O);
        for (let q = 0; q < 3; q++) { const px = -.2 + .2 * q + .03 * (q * q - 1); const dq = Math.hypot(fx - px, fy - (.17 + smile * (.07 - 1.6 * px * px))) / .028; h -= .3 * (1 - sm(.2, 1, dq)) * (1 - O); }
      }
      if (O > .01) { const d = Math.hypot((fx) / (.06 + .04 * O), (fy - .2) / (.05 + .06 * O)); h -= .75 * O * (1 - sm(.2, 1, d)); h += .25 * O * Math.exp(-Math.pow((d - 1.1) / .25, 2)); }
      H[k] = h;
    }
    for (let j = 1; j < G - 1; j++) for (let i = 1; i < G - 1; i++) { const k = j * G + i; GX[k] = (H[k + 1] - H[k - 1]) / (2 * DX); GY[k] = (H[k + G] - H[k - G]) / (2 * DY); }
  }
  // returns [h, gx, gy, w] at face-frame point (x,y); w = window weight
  const out = [0, 0, 0, 0];
  function sample(x, y) {
    const fi = (x - X0) / DX, fj = (y - Y0) / DY;
    if (fi < 1 || fj < 1 || fi >= G - 2 || fj >= G - 2) { out[3] = 0; return out; }
    const i = Math.floor(fi), j = Math.floor(fj), tx = fi - i, ty = fj - j, k = j * G + i;
    const b = (A) => (A[k] * (1 - tx) + A[k + 1] * tx) * (1 - ty) + (A[k + G] * (1 - tx) + A[k + G + 1] * tx) * ty;
    out[0] = b(H); out[1] = b(GX); out[2] = b(GY);
    out[3] = sm(0, .12, Math.min(x - X0, X1 - x, y - Y0, Y1 - y));
    return out;
  }
  return { height, sample };
})();

// convenience wrappers so every page draws the characters the same way
const PLUTO_DEF = { kind: 'pluto', atm: 1, rim: .35 };
function drawPluto(g, x, y, r, o = {}) { const v = Object.assign({}, PLUTO_DEF, o); if (v.face === undefined) v.face = { smile: .5 }; drawBody(g, x, y, r, v); }
function drawCharon(g, x, y, r, o = {}) { const v = Object.assign({ kind: 'charon', rim: .45 }, o); if (v.face === undefined) v.face = null; drawBody(g, x, y, r, v); }
function drawPlanet(g, kind, x, y, r, o = {}) {
  const v = Object.assign({ kind, rim: .3, face: null }, o);
  if (kind === 'saturn' && !v.ring) v.ring = { tilt: -.32, inner: 1.3, outer: 2.25, sq: .3, col: [236, 214, 170] };
  if (kind === 'uranus' && !v.ring) v.ring = { tilt: -1.25, inner: 1.5, outer: 1.75, sq: .22, col: [200, 235, 240] };
  drawBody(g, x, y, r, v);
}
// a soft painted sun (no texture)
function drawSun(g, x, y, r, a = 1, t = 0) {
  g.save(); g.globalCompositeOperation = 'lighter';
  let gr = g.createRadialGradient(x, y, r * .9, x, y, r * 2.6); gr.addColorStop(0, `rgba(255,214,150,${.35 * a})`); gr.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.6, 0, 7); g.fill();
  g.strokeStyle = `rgba(255,222,160,${.45 * a})`; g.lineWidth = Math.max(1, r * .012);
  for (let i = 0; i < 48; i++) { const an = i / 48 * 6.283 + t * .02, L = r * (1.25 + (i % 2 ? .18 : .4) + .05 * Math.sin(t * 1.2 + i)); g.beginPath(); g.moveTo(x + Math.cos(an) * r * 1.08, y + Math.sin(an) * r * 1.08); g.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L); g.stroke(); }
  g.restore();
  gr = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr.addColorStop(0, `rgba(255,248,222,${a})`); gr.addColorStop(.7, `rgba(250,206,120,${a})`); gr.addColorStop(1, `rgba(232,150,80,${a})`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.strokeStyle = `rgba(150,90,40,${.5 * a})`; g.lineWidth = Math.max(1, r * .01); g.stroke();
}
