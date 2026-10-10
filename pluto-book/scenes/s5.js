// ===================== s5: COR INTIMVM - calm, inner strength, he becomes a comet (n 36.30 .. 46.25) =====================
// "טוב, בסדר, בסוף הוא נרגע, / כי עמוק בפנים הוא כבר ידע / שאף אחד עליו לא קובע, ובטח שלא מחליט. / הוא לא סתם כוכב, הוא כוכב שביט!"
// Continuity from page 4: he is still spinning inside long-exposure star trails, cold and grey, the red "מבוטל" ink on his
// brow, the "מתחזה" tag pinned at his upper right, page 4's hairline ice cracks on him, Charon flung out on a wide orbit.
// - "טוב, בסדר, בסוף הוא נרגע": the spin runs down; the star trails shorten back into still stars (space calms with him);
//   his face comes round to the front and settles; Charon glides into a calm orbit; eyes close, one deep breath. Light warms.
// - "כי עמוק בפנים": the camera pushes in; the outer sky dims. From inside, slow heartbeats of gold light: page 4's cracks of
//   pain fill with gold (kintsugi) and a few finer golden hairlines seep out; his inner light rises over his relief from
//   below - the face reads calm, and on "ידע" a small knowing smile, eyes still closed.  (annotation: "aurum intus")
// - "שאף אחד עליו לא קובע": eyes open, determined. He shakes his head - no - and on "קובע" a heartbeat of gold runs up the
//   string and it snaps: the tag tumbles away out of the frame. "ובטח שלא מחליט": a gold crack runs into the ink, which
//   crazes along golden seams, chips off and drifts away as red dust.
// - "הוא לא סתם כוכב": his frozen haze (page 4) thaws back into its fine blue layers; warmed from inside, the layers are drawn
//   back into hoods and a blue ion tail, and his gold streams out as a curved dust tail of fine striae. A warm light finds
//   him from the left. "הוא כוכב שביט!": he takes off right-to-left, pure joy, and on "שביט" breaks out of the plate: on the
//   cream paper his tail is printed as gold-leaf and blue-ink engraving. He leaves the page just before it ends.
(() => {
  const S0 = 36.3;
  // ---- word times (lines.json) ----
  const W_DECIDES = 42.38, W_RULES = 43.62, W_COMET = 45.82;
  const CREAM = [236, 226, 204], HOT = [255, 236, 190], AMBER = [255, 170, 80], ION = [150, 198, 255];
  const lr = (a, b, t) => a * Math.pow(b / a, t);

  // ---------------- the spin runs down (continues page 4's: angle 5.78, 11 rad/s at 36.3) ----------------
  const SP0 = 5.781, SPE = 4 * Math.PI, SPT = 2.45;
  const baseSpin = n => { const u = clamp((n - S0) / SPT); return SPE - (SPE - SP0) * Math.pow(1 - u, 4); };
  const shakeEnv = n => pulse(n, 42.0, 42.14, 42.6, 42.9);
  const shake = n => .19 * shakeEnv(n) * Math.sin((n - 42.05) * 2 * Math.PI * 2.4);      // "לא קובע": no.
  const spin = n => baseSpin(n) + shake(n);
  const spinRate = n => (spin(n + .01) - spin(n - .01)) / .02;
  const baseRate = n => (baseSpin(n + .01) - baseSpin(n - .01)) / .02;

  // ---------------- the orbit: we are at his side while he still whirls, and swing round to his face as he calms ----------------
  const yawAt = n => { const u = clamp((n - 36.5) / (39.0 - 36.5)), e = u * u * u * (u * (u * 6 - 15) + 10); return lerp(-1.35, 0, e); };
  const pitchAt = n => lerp(-.22, 0, ease(clamp((n - 36.5) / 2.5)));
  const distAt = n => { let d = 140; d = lerp(d, 46, ease((n - 39.32) / (41.2 - 39.32))); d = lerp(d, 170, ease((n - 44.18) / (44.95 - 44.18))); return d; };
  const orbAt = n => ({ yaw: yawAt(n), pitch: pitchAt(n), dist: distAt(n) });

  // ---------------- camera / his place on the plate (x, y, R) ----------------
  const LAUNCH = 45.0, LX = 560, LY = 448;
  function cam(n) {
    let x = 720, y = 402, R = 196;
    const k0 = win(n, 37.3, 39.3); x = lerp(x, 712, k0); y = lerp(y, 414, k0); R = lr(R, 208, k0);
    const k1 = ease((n - 39.32) / (40.95 - 39.32)); x = lerp(x, 700, k1); y = lerp(y, 452, k1); R = lr(R, 392, k1);   // "עמוק בפנים"
    R *= 1 + .02 * win(n, 40.95, 44.2);
    const k2 = ease((n - 44.18) / (44.95 - 44.18)); x = lerp(x, LX, k2); y = lerp(y, LY, k2); R = lr(R, 160, k2);       // pull back
    R = lr(R, 176, win(n, 45.2, 46.1));
    const t = Math.max(0, n - LAUNCH);                                    // take-off: accelerating right -> left, rising
    x -= 800 * Math.pow(t, 1.8);
    y -= 150 * Math.pow(t / .82, 2);
    return { x, y, R };
  }
  const velAt = n => { const a = cam(n - .02), b = cam(n + .02); return [(b.x - a.x) / .04, (b.y - a.y) / .04]; };

  // ---------------- face (relief only) ----------------
  const FK = [
    [36.3, { smile: -.45, sad: .62, brow: .8, open: .7, O: .4 }],
    [37.25, { smile: -.4, sad: .55, brow: .72, open: .78, O: .28 }],
    [37.9, { smile: -.28, sad: .42, brow: .52, open: .88, O: .06 }],
    [38.45, { smile: -.12, sad: .26, brow: .3, open: .82, O: 0 }],
    [39.1, { smile: .02, sad: .1, brow: .08, open: 0, O: 0 }],            // "נרגע": eyes close
    [39.9, { smile: .06, sad: .04, brow: 0, open: 0, O: 0 }],
    [40.6, { smile: .1, sad: 0, brow: -.04, open: 0, O: 0 }],
    [41.15, { smile: .36, sad: 0, brow: -.1, open: 0, O: 0 }],            // "ידע": a small knowing smile
    [41.55, { smile: .36, sad: 0, brow: -.12, open: 0, O: 0 }],
    [41.95, { smile: .35, sad: 0, brow: -.6, open: 1, O: 0 }],            // eyes open: determined
    [43.9, { smile: .42, sad: 0, brow: -.62, open: 1, O: 0 }],
    [44.55, { smile: .62, sad: 0, brow: -.3, open: 1, O: 0 }],
    [45.25, { smile: .9, sad: 0, brow: 0, open: 1, O: 0 }],               // pure joy
    [46.4, { smile: .9, sad: 0, brow: 0, open: 1, O: 0 }],
  ];
  function faceAt(n) {
    let i = 0; while (i < FK.length - 2 && n > FK[i + 1][0]) i++;
    const [t0, a] = FK[i], [t1, b] = FK[i + 1], k = ease((n - t0) / (t1 - t0)), f = {};
    for (const key in a) f[key] = lerp(a[key], b[key], k);
    const dz = 1 - win(n, 36.9, 38.2), da = spin(n) * 1.3;              // still dizzy, the pits whirl, then settle
    let lx = lerp(0, .9 * Math.cos(da), dz), ly = lerp(.12, .8 * Math.sin(da), dz);
    const fw = win(n, 41.6, 41.9); lx = lerp(lx, 0, fw); ly = lerp(ly, -.05, fw);
    const go = win(n, 44.5, 45.0); lx = lerp(lx, -.85, go); ly = lerp(ly, -.25, go);
    f.look = [lx, ly];
    return f;
  }

  // ---------------- heartbeat of gold (lub-dub) ----------------
  const BEATS = [[39.9, .5], [40.72, .65], [41.54, .8], [42.38, 1.25], [43.0, .7], [43.62, 1.3], [44.36, .45]];
  const pk = x => x <= 0 ? 0 : (x / .075) * Math.exp(1 - x / .075);
  const heart = n => { let h = 0; for (const [b, a] of BEATS) h += a * (pk(n - b + .03) + .5 * pk(n - b - .19)); return h; };
  const innerA = n => .72 * win(n, 39.45, 40.9) + .28 * win(n, 41.3, 42.5);  // how much gold has risen inside him
  const goldA = n => clamp(innerA(n) * (.55 + .45 * Math.min(1.4, heart(n)))) * (1 - .62 * win(n, 44.4, 45.3));

  // ---------------- decals: ink, cracks (page 4), golden seams ----------------
  const proj = (al, la, sp) => { const th = al - sp, cl = Math.cos(la); return [cl * Math.sin(th), Math.sin(la), cl * Math.cos(th)]; };
  const IA0 = -1.12, IA = 2.24, IL0 = -1.3, IL = 1.0;
  let INKP = null; const PW = 448, PH = 200;
  function inkPatch() {                                                  // identical to page 4 (same mark, same place)
    if (INKP) return INKP;
    const RF = 220, F = canvas(2 * RF, 2 * RF), fx = F.getContext('2d');
    fx.translate(RF, RF - .62 * RF); fx.scale(1, .86); drawStampMark(fx, 0, 0, .33 * RF / 212, -.13, .96);
    const src = fx.getImageData(0, 0, 2 * RF, 2 * RF).data;
    INKP = canvas(PW, PH); const x = INKP.getContext('2d'), id = x.createImageData(PW, PH), d = id.data;
    for (let j = 0; j < PH; j++) for (let i = 0; i < PW; i++) {
      const al = IA0 + (i + .5) / PW * IA, la = IL0 + (j + .5) / PH * IL;
      const X = Math.round(RF + Math.cos(la) * Math.sin(al) * RF), Y = Math.round(RF + Math.sin(la) * RF);
      if (X < 0 || Y < 0 || X >= 2 * RF || Y >= 2 * RF) continue;
      const k = (Y * 2 * RF + X) * 4, o = (j * PW + i) * 4;
      d[o] = src[k]; d[o + 1] = src[k + 1]; d[o + 2] = src[k + 2]; d[o + 3] = src[k + 3];
    }
    x.putImageData(id, 0, 0);
    return INKP;
  }
  function inkInto(g2, cx, cy, r, sp, alpha) {
    const P = inkPatch(), NX = 40, NY = 12;
    for (let i = 0; i < NX; i++) {
      let tm = (IA0 + (i + .5) / NX * IA - sp + Math.PI) % (2 * Math.PI); if (tm < 0) tm += 2 * Math.PI; tm -= Math.PI;
      const t0 = tm - IA / NX / 2, t1 = tm + IA / NX / 2, zc = Math.cos(tm);
      if (zc < .03 || Math.abs(t0) > 1.5707 || Math.abs(t1) > 1.5707) continue;
      for (let j = 0; j < NY; j++) {
        const l0 = IL0 + j / NY * IL, l1 = IL0 + (j + 1) / NY * IL, cl = Math.cos((l0 + l1) / 2);
        const X0 = Math.round(cx + cl * Math.sin(t0) * r), X1 = Math.round(cx + cl * Math.sin(t1) * r);
        const Y0 = Math.round(cy + Math.sin(l0) * r), Y1 = Math.round(cy + Math.sin(l1) * r);
        if (X1 - X0 < 1 || Y1 - Y0 < 1) continue;
        g2.globalAlpha = alpha * clamp(zc * 3.5);
        g2.drawImage(P, i / NX * PW, j / NY * PH, PW / NX, PH / NY, X0, Y0, X1 - X0, Y1 - Y0);
      }
    }
    g2.globalAlpha = 1;
  }
  // page 4's hairline cracks (same generator, same seed -> the very same cracks), all fully grown by now
  function walks(seed, defs, stepK = 1) {
    const r = mulberry(seed), out = [];
    const walk = (al, la, dir, nseg, t0, depth) => {
      const pts = [[al, la]]; let a = al, l = la, d = dir;
      for (let i = 0; i < nseg; i++) {
        d += r() < .3 ? (r() - .5) * 1.7 : (r() - .5) * .22; const st = (.026 + r() * .034) * stepK; a += Math.cos(d) * st; l += Math.sin(d) * st; pts.push([a, l]);
        if (depth < 2 && r() < .16) walk(a, l, d + (r() < .5 ? 1 : -1) * (.6 + r() * .6), 3 + (r() * 5 | 0), t0 + i * .022, depth + 1);
      }
      out.push({ pts, t0, dur: nseg * .022 + .05 });
    };
    for (const a of defs) walk(...a);
    return out;
  }
  const CRACKS = walks(8128, [[-.62, -.46, 2.2, 13, 0, 0], [-.6, -.42, -.4, 7, .04, 1], [-.5, .3, 2.0, 11, .09, 0], [-.48, .28, .9, 7, .12, 1],
    [-.2, .66, 2.6, 10, .15, 0], [-.14, .64, .5, 7, .18, 1], [.22, .72, .3, 8, .2, 1]]);
  // a few finer golden hairlines that the inner light finds on its way out ("עמוק בפנים")
  const SEEPS = walks(5150, [[.66, .42, 2.4, 9, 0, 2], [.75, -.1, 2.0, 7, .35, 2], [-.85, .05, -.2, 7, .2, 2], [.42, .62, 1.6, 6, .5, 2]], .85)
    .map(c => Object.assign(c, { t0: c.t0 * 1.6 }));
  // the crack that runs from the upper-left gold seam into the ink ("ובטח שלא מחליט")
  const RUN = walks(4417, [[-.66, -.5, -.18, 26, 0, 2]], .95)[0];
  function crackPath(g2, c, upto, cx, cy, r, sp, dx = 0, dy = 0) {
    const N = c.pts.length - 1; let pen = false; g2.beginPath();
    for (let i = 0; i <= Math.ceil(upto); i++) {
      let [al, la] = c.pts[Math.min(i, N)];
      if (i > upto) { const f = upto - (i - 1), [a0, l0] = c.pts[i - 1]; al = lerp(a0, al, f); la = lerp(l0, la, f); }
      const [x, y, z] = proj(al, la, sp); if (z < .08) { pen = false; continue; }
      const X = cx + x * r + dx, Y = cy + y * r + dy;
      pen ? g2.lineTo(X, Y) : g2.moveTo(X, Y); pen = true;
    }
  }
  const seepK = (n, c) => clamp((n - 39.7 - c.t0) / (c.dur * 2.2));

  // ---- craquelure over the ink: irregular chips with shared, jagged edges (seamless at rest) ----
  const SX0 = -.8, SX1 = .8, SY0 = -1.0, SY1 = -.26, SNX = 12, SNY = 5;
  const VX = [];
  for (let j = 0; j <= SNY; j++) for (let i = 0; i <= SNX; i++) {
    const jx = i > 0 && i < SNX ? (hash2(i, j + 40) - .5) * .8 : 0, jy = j > 0 && j < SNY ? (hash2(i + 70, j) - .5) * .8 : 0;
    VX.push([SX0 + (i + jx) / SNX * (SX1 - SX0), SY0 + (j + jy) / SNY * (SY1 - SY0)]);
  }
  const vid = (i, j) => j * (SNX + 1) + i;
  const EDGES = new Map();                                                // jagged polyline per edge (canonical direction)
  function edge(a, b) {
    const key = a < b ? a + '_' + b : b + '_' + a;
    if (!EDGES.has(key)) {
      const A = VX[Math.min(a, b)], B = VX[Math.max(a, b)], pts = [A], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
      for (let q = 1; q < 4; q++) { const h = hash2(Math.min(a, b) * 7 + q, Math.max(a, b) * 3 + q) - .5; pts.push([A[0] + dx * q / 4 - dy / L * h * L * .32, A[1] + dy * q / 4 + dx / L * h * L * .32]); }
      pts.push(B); EDGES.set(key, pts);
    }
    const pts = EDGES.get(key); return a < b ? pts : pts.slice().reverse();
  }
  let SHARDS = null;
  function shards() {
    if (SHARDS) return SHARDS;
    const P = inkPatch(), pd = P.getContext('2d').getImageData(0, 0, PW, PH).data;
    const alphaAt = (x, y) => {                                           // ink alpha at a screen point (R units, at rest)
      if (Math.abs(y) >= .999) return 0; const la = Math.asin(y), cl = Math.cos(la); if (Math.abs(x) >= cl) return 0;
      const al = Math.asin(x / cl), i = Math.floor((al - IA0) / IA * PW), j = Math.floor((la - IL0) / IL * PH);
      if (i < 0 || j < 0 || i >= PW || j >= PH) return 0; return pd[(j * PW + i) * 4 + 3];
    };
    SHARDS = [];
    for (let j = 0; j < SNY; j++) for (let i = 0; i < SNX; i++) {
      const c4 = [vid(i, j), vid(i + 1, j), vid(i + 1, j + 1), vid(i, j + 1)], edges = [], poly = [];
      for (let e = 0; e < 4; e++) { const pts = edge(c4[e], c4[(e + 1) % 4]); edges.push(pts); for (let q = 0; q < pts.length - 1; q++) poly.push(pts[q]); }
      let hx = 0, hy = 0; for (const [x, y] of poly) { hx += x; hy += y; } hx /= poly.length; hy /= poly.length;
      let ink = 0; for (const [x, y] of poly) ink = Math.max(ink, alphaAt(lerp(x, hx, .3), lerp(y, hy, .3))); ink = Math.max(ink, alphaAt(hx, hy));
      if (ink < 20) continue;
      const h1 = hash2(i + 3, j + 11), h2 = hash2(i + 17, j + 5), h3 = hash2(i + 29, j + 23);
      const tr = W_RULES + .02 + .42 * (hx - SX0) / (SX1 - SX0) + .08 * h1;      // the crack runs in from the left
      let ox = hx * .8, oy = hy + .1; const ol = Math.hypot(ox, oy) || 1; ox /= ol; oy /= ol;
      const sp = .3 + .45 * h2;
      SHARDS.push({ i, j, poly, edges, hx, hy, tr, vx: ox * sp + (h3 - .5) * .25, vy: oy * sp * .6 - .3 - .2 * h1, rot: (h3 - .5) * 5, flip: 2.5 + 4 * h2,
        life: .62 + .38 * h3, ph: h1 * 6.28 });
    }
    return SHARDS;
  }
  const INKS = canvas(720, 720), IKG = INKS.getContext('2d');
  const DEC = canvas(720, 720), DG = DEC.getContext('2d');
  function renderInk(n, r, sp) {
    const S = 2 * Math.ceil(r) + 8; if (INKS.width < S) { INKS.width = INKS.height = S; }
    IKG.setTransform(1, 0, 0, 1, 0, 0); IKG.clearRect(0, 0, INKS.width, INKS.height);
    if (n < W_RULES + 1.7) inkInto(IKG, Math.ceil(r) + 3, Math.ceil(r) + 3, r, sp, .9);
  }
  function goldStroke(g2, lw, gA, draw) {                                // a warm bed, a gold line, a hot hairline core
    for (const [w, col, a] of [[5.5 * lw, [255, 140, 50], .1], [2.2 * lw, [255, 178, 84], .42], [.8 * lw, [255, 214, 140], .85]]) {
      g2.lineWidth = w; g2.strokeStyle = rgba(col, a * gA); draw();
    }
  }
  function plutoDecal(n, sp, gA) {
    return (g2, cx, cy, r) => {
      const S = Math.ceil(2 * r + 8); if (DEC.width < S) { DEC.width = DEC.height = S; }
      DG.setTransform(1, 0, 0, 1, 0, 0); DG.globalCompositeOperation = 'source-over'; DG.clearRect(0, 0, DEC.width, DEC.height);
      DG.drawImage(INKS, 0, 0);
      if (n > W_RULES) {                                                  // chips already lifted off leave clean ice
        DG.globalCompositeOperation = 'destination-out'; DG.fillStyle = '#000';
        for (const s of shards()) if (n > s.tr) { DG.beginPath(); for (const [x, y] of s.poly) DG.lineTo(cx + x * r, cy + y * r); DG.closePath(); DG.fill(); }
        DG.globalCompositeOperation = 'source-over';
      }
      const lw = Math.max(.6, r / 240);
      DG.lineCap = 'round'; DG.lineJoin = 'round'; DG.strokeStyle = 'rgba(34,36,70,.6)'; DG.lineWidth = lw * 1.05;
      // cracks removed (client)
      g2.save(); g2.beginPath(); g2.arc(cx, cy, r - .5, 0, 7); g2.clip();
      g2.globalCompositeOperation = 'multiply'; g2.drawImage(DEC, 0, 0);
      g2.globalCompositeOperation = 'source-over'; g2.globalAlpha = .62; g2.drawImage(DEC, 0, 0); g2.globalAlpha = 1;   // opaque coat: ink ON him
      g2.lineCap = 'round'; g2.lineJoin = 'round';
      const iceA = .34 * (1 - clamp(gA * 2));                             // page 4's icy light edge, fading as the gold takes over
      if (false && iceA > .01) { g2.strokeStyle = `rgba(236,244,255,${iceA})`; g2.lineWidth = lw * .65; for (const c of CRACKS) { crackPath(g2, c, c.pts.length - 1, cx, cy, r, sp, -lw * .9, lw * .9); g2.stroke(); } }
      // gold light seeping out through the cracks (kintsugi)
      if (false && gA > .005) {                                            // golden seams removed (read as a glitch)
        g2.globalCompositeOperation = 'lighter';
        goldStroke(g2, lw, gA, () => {
          for (const c of CRACKS) { crackPath(g2, c, c.pts.length - 1, cx, cy, r, sp); g2.stroke(); }
          for (const c of SEEPS) { const k = seepK(n, c); if (k > 0) { crackPath(g2, c, k * (c.pts.length - 1), cx, cy, r, sp); g2.stroke(); } }
        });
        // "ובטח שלא מחליט": a gold crack runs into the ink, then the ink crazes along golden seams just ahead of each chip letting go
        if (n > 43.25 && n < W_RULES + 1.2) {
          const rk = clamp((n - 43.25) / .4), fade = 1 - win(n, 44.0, 44.5);
          goldStroke(g2, lw, fade, () => { crackPath(g2, RUN, rk * (RUN.pts.length - 1), cx, cy, r, sp); g2.stroke(); });
          const SH = shards();
          goldStroke(g2, lw * .6, .8, () => {
            for (const s of SH) {
              const a = .75 * clamp((n - (s.tr - .09)) / .05) * (1 - clamp((n - s.tr) / .04)); if (a <= .01) continue;
              g2.globalAlpha = a; g2.beginPath();
              for (const pts of s.edges) { g2.moveTo(cx + pts[0][0] * r, cy + pts[0][1] * r); for (let q = 1; q < pts.length; q++) g2.lineTo(cx + pts[q][0] * r, cy + pts[q][1] * r); }
              g2.stroke();
            }
            g2.globalAlpha = 1;
          });
        }
      }
      g2.restore();
    };
  }
  // the chips: lifted off, tumbling, shrinking into red dust
  function drawFlakes(g, n, c) {
    if (n < W_RULES) return;
    const R = c.R, C = Math.ceil(R) + 3;
    for (const s of shards()) {
      const age = n - s.tr; if (age <= 0 || age > s.life + .4) continue;
      const u = age / s.life;
      const dx = (s.vx * age + .04 * Math.sin(age * 3 + s.ph) * age) * R, dy = (s.vy * age - .06 * age * age) * R;
      const X = c.x + s.hx * R + dx, Y = c.y + s.hy * R + dy;
      if (u < 1) {
        const sc = 1 - .7 * Math.pow(u, 1.3), fl = Math.cos(age * s.flip), a = 1 - Math.pow(u, 2.4);
        g.save(); g.globalAlpha = a; g.translate(X, Y); g.rotate(s.rot * age); g.scale(sc, sc * (.2 + .8 * Math.abs(fl)));
        g.beginPath(); for (const [x, y] of s.poly) g.lineTo((x - s.hx) * R, (y - s.hy) * R); g.closePath(); g.clip();
        g.drawImage(INKS, -(s.hx * R + C), -(s.hy * R + C));
        g.restore();
      }
      if (u > .5) {                                                       // red dust
        const t = age - s.life * .5, da = clamp(t / .15) * (1 - clamp(t / (s.life * .5 + .3)));
        for (let q = 0; q < 3; q++) {
          const h = hash2(s.i * 7 + q, s.j * 13 + 3), h2 = hash2(s.i * 5 + q, s.j * 3 + 9), k = R / 312;
          const x = X + (h - .5) * 22 * k + (h - .5) * 50 * k * t, y = Y + (h2 - .5) * 16 * k - (14 + 30 * h2) * k * t;
          g.fillStyle = rgba([206, 70, 64], .7 * da); g.beginPath(); g.arc(x, y, .6 + h2 * .8, 0, 7); g.fill();
        }
      }
    }
  }

  // ---------------- the "מתחזה" tag (pinned exactly as page 4 left it); snaps on "קובע" and tumbles away ----------------
  const TAG_AL = 1.165, TAG_LA = -.39, TAG_LEN = .396, TAG_S = .7 / 212;
  function tagAt(n, c) {
    const R = c.R, sp = spin(n) + yawAt(n), [x, y, z] = proj(TAG_AL, TAG_LA, sp);
    const ax = c.x + x * R, ay = c.y + y * R;
    const w = spinRate(n), out = Math.atan(w * w * .012);
    const len = TAG_LEN * R, th = TAG_AL - sp;
    const sway = .07 * Math.sin(n * 1.05 + .4) + .035 * Math.sin(n * 2.3 + 1) - 1.6 * shake(n - .06);
    const hx = Math.sin(sway) * len, hy = Math.cos(sway) * len;
    const fx = Math.sin(out) * len * Math.sin(th), fy = Math.cos(out) * len;
    const k = clamp(out / .35);
    const tx = ax + lerp(hx, fx, k), ty = ay + lerp(hy, fy, k);
    const tz = lerp(z + .2, Math.cos(th), k);
    return { ax, ay, tx, ty, z: Math.min(z, tz) > -.02 ? 1 : -1, az: z, s: R * TAG_S, rot: -Math.atan2(tx - ax, ty - ay) * .8 };
  }
  const TAGPATH = g => { g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(130, 38); g.lineTo(130, 150); g.lineTo(-130, 150); g.lineTo(-130, 38); g.closePath(); };
  function tagBody(g, s, back) {
    g.scale(s, s);
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.fillStyle = back ? '#e0d2b4' : '#efe4cc';
    TAGPATH(g); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(120,90,60,.5)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#1c1830'; g.beginPath(); g.arc(0, 20, 8, 0, 7); g.fill();
    g.strokeStyle = rgba(GOLD, .9); g.lineWidth = 2; g.beginPath(); g.arc(0, 20, 11, 0, 7); g.stroke();
    if (back) return;
    g.strokeStyle = 'rgba(214,40,52,.9)'; g.lineWidth = 3; g.strokeRect(-110, 52, 220, 84);
    g.fillStyle = 'rgb(196,48,56)'; g.font = '800 60px Frank'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('מתחזה', 0, 90);
    g.font = '600 15px Cinzel'; g.letterSpacing = '4px'; g.direction = 'ltr'; g.fillStyle = 'rgba(120,90,60,.9)'; g.fillText('IMPOSTOR', 0, 124); g.letterSpacing = '0px';
  }
  function drawPin(g, x, y, s, a = 1) {
    if (a <= .01) return;
    const pr = Math.max(1.6, 4.2 * s / .7);
    g.save(); g.globalAlpha *= a; g.fillStyle = rgba(GOLD_L); g.beginPath(); g.arc(x, y, pr, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,20,.8)'; g.lineWidth = 1; g.stroke();
    glint(g, x - 1, y - 1, pr * 1.2, .6, [255, 244, 220]); g.restore();
  }
  function drawTagAt(g, n, T, warm) {
    g.save();
    const burn = pulse(n, 42.1, 42.33, 42.37, 42.42);                     // the heartbeat runs up the string
    const mx = (T.ax + T.tx) / 2 + 8 * T.s, my = (T.ay + T.ty) / 2;
    g.strokeStyle = 'rgba(236,226,206,.95)'; g.lineWidth = Math.max(1, 2 * T.s / .7);
    g.beginPath(); g.moveTo(T.ax, T.ay); g.quadraticCurveTo(mx, my, T.tx, T.ty + 14 * T.s); g.stroke();
    if (burn > .02) {                                                     // gold climbing the string from the pin
      const up = clamp((n - 42.1) / .26);
      g.save(); g.lineCap = 'round';
      g.beginPath(); g.moveTo(T.ax, T.ay);                                // gold climbs from the pin (his side) down the string
      for (let q = 1; q <= 12; q++) { const s = q / 12; if (s > up) break; const u = s; g.lineTo((1 - u) * (1 - u) * T.ax + 2 * (1 - u) * u * mx + u * u * T.tx, (1 - u) * (1 - u) * T.ay + 2 * (1 - u) * u * my + u * u * (T.ty + 14 * T.s)); }
      g.strokeStyle = rgba([236, 168, 64], .95 * burn); g.lineWidth = Math.max(1.4, 2.4 * T.s / .7); g.stroke();
      g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba([255, 190, 100], .35 * burn); g.lineWidth = Math.max(3, 7 * T.s / .7); g.stroke();
      g.restore();
    }
    g.save(); g.translate(T.tx, T.ty); g.rotate(T.rot); tagBody(g, T.s);
    const dimK = win(n, 39.4, 40.9) * (1 - .5 * win(n, 41.5, 42.2));
    if (warm > .02 || dimK > .01) { TAGPATH(g); g.fillStyle = `rgba(10,12,32,${.42 * dimK})`; g.fill(); g.fillStyle = `rgba(255,170,90,${.2 * Math.min(1, warm)})`; g.fill(); }
    g.restore();
    g.restore();
  }
  // free flight after the snap
  const SNAP = W_DECIDES + .01;
  function drawFreeTag(g, n, c0) {
    const age = n - SNAP; if (age < 0 || age > 2.0) return;
    const T = tagAt(SNAP, c0);
    const k = c0.R / 312, vx = 430 * k, vy = -210 * k;
    const x = T.tx + vx * age + 80 * k * age * age, y = T.ty + vy * age + 30 * k * age * age + 8 * k * Math.sin(age * 6);
    const rot = T.rot - .45 * Math.sin(Math.min(age, .3) / .3 * Math.PI / 2) + 1.5 * age;
    const flip = Math.cos(age * 2.7), sc = T.s * (1 - .2 * age);
    // the snapped end of the string, trailing and fluttering
    const L = TAG_LEN * c0.R * .8, ang = Math.atan2(-vy, -vx) + .5 * Math.sin(age * 4);
    g.save(); g.strokeStyle = 'rgba(236,226,206,.9)'; g.lineWidth = Math.max(1, 2 * sc / .7); g.lineCap = 'round';
    const hx = x + Math.sin(rot) * 20 * sc, hy = y - Math.cos(rot) * 20 * sc;
    g.beginPath(); g.moveTo(hx, hy);
    for (let i = 1; i <= 10; i++) { const s = i / 10, w = Math.sin(s * 7 - age * 14) * 8 * k * s; g.lineTo(hx + Math.cos(ang) * L * s - Math.sin(ang) * w, hy + Math.sin(ang) * L * s + Math.cos(ang) * w); }
    g.stroke(); g.restore();
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(Math.max(.05, Math.abs(flip)), 1); tagBody(g, sc, flip < 0); g.restore();
    if (age < .25) glint(g, T.ax, T.ay, 10 * (1 - age / .25) * Math.max(.6, k), .9 * (1 - age / .25), HOT);   // the snap
  }

  // ---------------- Charon: from page 4's wide flung orbit into a calm one; tucks in behind him before the take-off ----------------
  function charonAt(n, c) {
    const P0 = -2.407, PA = -7.554, TA = 3.0;
    let psi = n < S0 + TA ? PA + (P0 - PA) * Math.pow(1 - clamp((n - S0) / TA), 2.3) : PA - .15 * (n - S0 - TA);
    psi -= 1.15 * ease((n - 44.2) / .7);
    const rho = lerp(lerp(1.82, 1.62, win(n, 36.3, 39.3)), .95, win(n, 44.2, 44.9)), tilt = lerp(.5, .4, win(n, 36.3, 39.3));
    const x = c.x + rho * Math.sin(psi) * c.R, y = c.y + rho * tilt * Math.cos(psi) * c.R, z = Math.cos(psi);
    return { x, y, z, r: .135 * c.R * (1 + .12 * z) };
  }
  function drawCharonAt(g, n, c, ch, gA) {
    const dx = c.x - ch.x, dy = c.y - ch.y, d = Math.hypot(dx, dy) || 1;
    const l2 = gA > .02 ? { dir: [dx / d * .8, dy / d * .8], col: [255, 186, 110], k: .55 * gA } : undefined;
    const calm = win(n, 37.3, 39.3);
    drawCharon(g, ch.x, ch.y, ch.r, { spin: n * .5, light: [.64, -.5], lightCol: mixc([.9, .93, 1.04], [.96, .95, .94], calm), amb: lerp(.78, .62, win(n, 39.4, 40.9)), light2: l2, gray: .1 });
  }

  // ---------------- Pluto's look & light ----------------
  function plutoOpts(n, c) {
    const sp = spin(n) + yawAt(n), gA = goldA(n), hb = heart(n);
    const calm = win(n, 37.3, 39.3), inner = win(n, 39.4, 40.9), det = win(n, 41.5, 42.4), com = win(n, 44.2, 45.0);
    let lc = mixc([.86, .9, 1.03], [1, .98, .95], calm);
    lc = mixc(lc, [.8, .82, .9], inner * (1 - det * .5));                 // the outside world dims: the light now comes from inside
    lc = mixc(lc, [1.08, .99, .88], com);
    const amb = lerp(lerp(lerp(.44, .5, calm), .36, inner), .48, Math.max(det * .4, com));
    const breath = bump(n, 38.6, 1.6);                                   // one deep breath (in ... out)
    const sw = 1 + .01 * Math.min(1.3, hb) * innerA(n);                   // the heartbeat swells him a hair
    const crouch = bump(n, 44.82, .3), v = velAt(n), spd = clamp(Math.hypot(v[0], v[1]) / 1400);
    renderInk(n, c.R, sp);
    return {
      spin: sp, face: faceAt(n), light: orbitLight([lerp(.64, -.6, com), lerp(-.5, -.42, com) - .3 * Math.sin(Math.PI * com)], yawAt(n)), lightCol: lc, amb,
      light2: { dir: [lerp(.05, .35, com), lerp(.82, .5, com)], col: [255, 176, 90], k: lerp(1.1, .6, com) * gA },
      glow: .5 * gA + .2 * com, gold: .14 * com, gray: lerp(lerp(.3, .14, calm), .22, inner) * (1 - .6 * com), atm: 1.1 * win(n, 44.36, 44.75), rim: lerp(.16, .32, Math.max(calm, com)),
      squash: [sw * (1 - .016 * breath + .03 * crouch + .1 * spd), sw * (1 + .038 * breath - .03 * crouch - .06 * spd)],
      decal: plutoDecal(n, sp, gA),
    };
  }

  // ---------------- the comet ----------------
  const RINGS = [1.03, 1.055, 1.085, 1.12, 1.16], RA = [.3, .22, .16, .11, .07];
  // the warm light he flies toward is on the left: both tails point away from it (to the right), the dust lags along his path
  const BDIR = (() => { const l = Math.hypot(.995, .1); return [.995 / l, .1 / l]; })(), BPERP = [-BDIR[1], BDIR[0]];
  function cometAt(n, c) {
    const ring = win(n, 44.36, 44.75); if (ring <= 0) return null;
    const v = velAt(n), sv = Math.hypot(v[0], v[1]);
    const k = win(n, 44.5, 45.3), fl = win(n, 45.1, 46.0);
    return { H: [c.x, c.y], R: c.R, b: BDIR, p: BPERP, ring, st: k, k, Li: c.R * (k * 4.4 + fl * 4.5), v: sv };
  }
  const rot2 = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  // a stroke with a faint wide bed and a fine bright core: luminous, but still drawn line by line
  function lumStroke(g, ink, w, gradFn) {
    if (!ink) { g.lineWidth = w * 5; g.strokeStyle = gradFn(.17); g.stroke(); }
    g.lineWidth = w; g.strokeStyle = gradFn(ink ? 1 : 1.25); g.stroke();
  }
  // mode 'light' (in the plate: luminous) or 'ink' (on the paper: gold-leaf & blue-ink engraving)
  function drawComet(g, n, C, mode) {
    const ink = mode === 'ink', { H, R, b, p } = C;
    g.save(); g.globalCompositeOperation = ink ? 'source-over' : 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
    const at = (u, v) => [H[0] + b[0] * u + p[0] * v, H[1] + b[1] * u + p[1] * v];
    const IONC = ink ? [52, 80, 140] : ION, inkK = ink ? 1.9 : 1;
    // 1. the thawed haze layers (page 4's frozen atmosphere), drawn back into hoods
    for (let i = 0; i < RINGS.length; i++) {
      const rho = RINGS[i] * R, E = C.st * (2.0 + 1.1 * i) + C.v / 1100 * (1.5 + .5 * i), a = RA[i] * 1.3 * C.ring * inkK;
      const g0 = at(-rho, 0), g1 = at(rho * (1 + E), 0), s0 = clamp(1.6 / (2 + E));
      g.beginPath();
      for (let q = 0; q <= 48; q++) { const th = Math.PI / 2 + q / 48 * Math.PI, [x, y] = at(rho * Math.cos(th), rho * Math.sin(th)); q ? g.lineTo(x, y) : g.moveTo(x, y); }
      for (let q = 0; q <= 48; q++) { const th = -Math.PI / 2 + q / 48 * Math.PI, [x, y] = at(rho * (1 + E) * Math.cos(th), rho * Math.sin(th)); g.lineTo(x, y); }
      g.closePath();
      lumStroke(g, ink, Math.max(.8, R / 140), m => { const gr = g.createLinearGradient(g0[0], g0[1], g1[0], g1[1]);
        gr.addColorStop(0, rgba(IONC, a * m)); gr.addColorStop(s0, rgba(IONC, a * m)); gr.addColorStop(s0 + (1 - s0) * .55, rgba(IONC, 0)); gr.addColorStop(1, rgba(IONC, 0)); return gr; });
    }
    if (C.k <= 0) { g.restore(); return; }
    // 2. ion tail: a narrow bundle of straight blue streamers pointing straight away from the light; kinks travel outwards
    const grow = Math.min(1, C.k * 1.5);
    for (let j = 0; j < 26; j++) {
      const f = j / 25 - .5, h = hash2(j, 91), v0 = f * .85 * R - .12 * R, L = C.Li * (.5 + .5 * hash2(j, 92)) * grow;
      const core = Math.pow(1 - Math.abs(f) * 2, 1.1), a = (.14 + .5 * core) * (.5 + .5 * h) * inkK;
      g.beginPath();
      for (let q = 0; q <= 20; q++) {
        const s = q / 20, vv = v0 * (1 - .6 * s) + Math.sin(s * 8 - n * 6 + j * 1.7) * s * R * .03;
        const x = H[0] + b[0] * s * L + p[0] * vv, y = H[1] + b[1] * s * L + p[1] * vv; q ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      const e = [H[0] + b[0] * L, H[1] + b[1] * L];
      lumStroke(g, ink, ink ? .7 + .5 * core : .5 + .9 * core * (.4 + .6 * h), m => { const gr = g.createLinearGradient(H[0], H[1], e[0], e[1]);
        gr.addColorStop(0, rgba(IONC, a * m)); gr.addColorStop(.15, rgba(IONC, a * m)); gr.addColorStop(.55, rgba(IONC, a * .4 * m)); gr.addColorStop(1, rgba(IONC, 0)); return gr; });
    }
    if (!ink) for (let m = 0; m < 5; m++) {                              // knots of ionised gas drifting out along the bundle
      const s = (hash2(m, 41) + n * .55) % 1, f = (hash2(m, 42) - .5) * .5, L = C.Li * .8 * grow;
      const x = H[0] + b[0] * s * L + p[0] * (f * R * (1 - .6 * s) - .12 * R), y = H[1] + b[1] * s * L + p[1] * (f * R * (1 - .6 * s) - .12 * R);
      glint(g, x, y, 3 + 3 * (1 - s), .75 * (1 - s) * C.k, [205, 228, 255]);
    }
    g.restore();
  }
  // 3. dust tail: grains shed from his sunlit gold stay where they were shed and drift slowly away from the light, so the
  //    golden striae trace the path he flew - and linger on the plate (and the paper) after he has gone.
  const DUST_T0 = 44.5, ND = 52;
  function dustPt(n, j, tau) {
    const c = cam(n - tau), f = j / (ND - 1), h = hash2(j, 32);
    const along = c.R * .55 + 340 * tau * (.7 + .6 * h), off = (f - .38) * c.R * (1.05 + 1.5 * tau) + 150 * tau * tau * (.25 + f);
    return [c.x + BDIR[0] * along + BPERP[0] * off, c.y + BDIR[1] * along + BPERP[1] * off];
  }
  function drawDust(g, n, mode) {
    const age = n - DUST_T0; if (age <= 0) return;
    const ink = mode === 'ink', inkK = ink ? 1.8 : 1, k = win(n, 44.5, 45.2);
    const DUSTC = ink ? [168, 120, 44] : [255, 202, 124], DUST0 = ink ? [140, 96, 34] : HOT;
    g.save(); g.globalCompositeOperation = ink ? 'source-over' : 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let j = 0; j < ND; j++) {
      const f = j / (ND - 1), h = hash2(j, 31), TM = Math.min(age, 1.45 * (.65 + .35 * hash2(j, 33)));
      const a = (.16 + .5 * h * h) * (1 - .6 * Math.abs(f - .38)) * inkK * k;
      g.beginPath(); const Q = 16; let P0, P1;
      for (let q = 0; q <= Q; q++) { const P = dustPt(n, j, q / Q * TM); q ? g.lineTo(P[0], P[1]) : g.moveTo(P[0], P[1]); if (!q) P0 = P; P1 = P; }
      lumStroke(g, ink, ink ? .7 + .6 * h : .5 + 1.1 * h * h, m => { const gr = g.createLinearGradient(P0[0], P0[1], P1[0], P1[1]);
        gr.addColorStop(0, rgba(DUST0, a * m)); gr.addColorStop(.12, rgba(DUSTC, a * .9 * m)); gr.addColorStop(.6, rgba(DUSTC, a * .3 * m)); gr.addColorStop(1, rgba(DUSTC, 0)); return gr; });
    }
    for (let m = 0; m < 130; m++) {                                      // single grains catching the light
      const j = m % ND, TM = Math.min(age, 1.45), tau = ((hash2(m, 7) * 1.45 + n * (.5 + .3 * hash2(m, 8))) % 1.45); if (tau > TM) continue;
      const [x, y] = dustPt(n, j, tau), a = (ink ? .8 : .95) * Math.pow(1 - tau / 1.45, 1.4) * k;
      if (!ink && hash2(m, 10) > .93) glint(g, x, y, 2.5 + 3 * hash2(m, 11), a, HOT);
      else { g.fillStyle = rgba(ink ? [150, 104, 36] : HOT, a); g.beginPath(); g.arc(x, y, (ink ? .7 : .5) + hash2(m, 9) * .9, 0, 7); g.fill(); }
    }
    g.restore();
  }

  // ---------------- atlas annotation ----------------
  function note(g, text, tx, ty, px, py, a, align, grow, col = CREAM) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    g.font = 'italic 500 25px Cormorant'; g.direction = 'ltr'; g.textBaseline = 'middle'; g.textAlign = align;
    const lx = align === 'right' ? tx + 8 : tx - 8, ex = lerp(lx, px, grow), ey = lerp(ty, py, grow);
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(16,14,30,.42)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(lx, ty); g.lineTo(ex, ey); g.stroke();
    g.strokeStyle = rgba(col, .7); g.lineWidth = .9; g.beginPath(); g.moveTo(lx, ty); g.lineTo(ex, ey); g.stroke();
    if (grow > .98) { g.fillStyle = 'rgba(16,14,30,.45)'; g.beginPath(); g.arc(px, py, 3.4, 0, 7); g.fill(); g.fillStyle = rgba(col, .9); g.beginPath(); g.arc(px, py, 2, 0, 7); g.fill(); }
    g.fillStyle = rgba(col, .85); g.fillText(text, tx, ty);
    g.restore();
  }

  // ---------------- the sky ----------------
  function sky(g, n, c) {
    const rn = clamp(Math.abs(baseRate(n)) / 11.1);
    const trail = 1.09 * Math.pow(rn, .85), tk = clamp((trail - .02) / .22);
    const calm = win(n, 37.0, 39.4), inner = win(n, 39.4, 41.0), det = win(n, 41.5, 43.4), com = win(n, 44.2, 45.2);
    const Z = c.R / 64, swc = [0, -.004];
    SPACE.draw(g, { t: n, cam: [.2775 + .05 * com, .0652 - .02 * com], zoom: 1 + (Z - 1) * .045, neb: lerp(.34, .5, com), galx: .18 + .15 * com, gpos: [-.62, -.32],
      cold: .78 * (1 - .5 * calm) * (1 - .45 * inner) * (1 - .9 * com), gray: .3 * (1 - .65 * calm) * (1 - com),
      bright: lerp(lerp(lerp(.8, .86, calm), .7, inner), .84, Math.max(det * .6, com)) + .06 * com,
      warm: .08 * calm + .12 * inner + .12 * det + .3 * com, gold: .18 * com, swirl: .32 * rn, swc, orbit: orbAt(n), orbitPrev: orbAt(n - .05) });
    // a warm light finds him from the left: the way he will go
    if (com > 0) {
      const gr = g.createLinearGradient(0, 0, 760, 0); gr.addColorStop(0, `rgba(255,190,120,${.13 * com})`); gr.addColorStop(1, 'rgba(255,190,120,0)');
      g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(0, 0, 760, PAGE.IH); g.restore();
    }
    const scam = [.436 - .9 * yawAt(n), .108 + .5 * pitchAt(n)], sz = 1 + (Z - 1) * .1, rot = .8 + .14 * (baseSpin(n) - SP0);
    g.save(); g.translate(720, 402); g.rotate(rot); g.translate(-720, -402);
    const dim = lerp(lerp(.78, .95, calm), .62, inner * (1 - det)) + .15 * com;
    if (tk < 1) STARS.draw(g, { t: n, cam: scam, zoom: sz, dim, alpha: 1 - tk });
    if (tk > 0) STARS.draw(g, { t: n, cam: scam, zoom: sz, dim: .95, alpha: tk, trail: Math.max(.02, trail), swc });
    g.restore();
    DUST.draw(g, { t: n, alpha: .35 * (1 - tk) * (1 - .5 * inner), vx: .006, vy: .004, cam: scam });
    // "עמוק בפנים": the edges of the plate fall away into darkness, the light gathers on him
    const iris = inner * (1 - .6 * det) * (1 - com);
    if (iris > .01) {
      const gr = g.createRadialGradient(c.x, c.y, c.R * 1.05, c.x, c.y, c.R * 2.6);
      gr.addColorStop(0, 'rgba(4,6,16,0)'); gr.addColorStop(1, `rgba(4,6,16,${.45 * iris})`);
      g.fillStyle = gr; g.fillRect(0, 0, PAGE.IW, PAGE.IH);
    }
  }

  const OFF = canvas(700, 700), OG = OFF.getContext('2d');
  // where the red stamp once marked him, he now marks the book: little gold stars printed on the margin in his wake
  const PSTARS = [[45.83, 1.18, 17], [45.88, -1.22, 13], [45.94, 1.3, 12], [46.0, -1.1, 16], [46.06, 1.2, 11]];
  function paperStars(p, n) {
    for (const [t0, side, sz] of PSTARS) {
      if (n < t0) continue;
      const c = cam(t0), v = velAt(t0), vl = Math.hypot(v[0], v[1]) || 1, px = -v[1] / vl, py = v[0] / vl;
      const x = PAGE.IX + c.x + px * side * c.R + v[0] / vl * c.R * .25, y = PAGE.IY + c.y + py * side * c.R + v[1] / vl * c.R * .25;
      if (x > PAGE.IX - 18 || x < 8 || y < 70 || y > 890) continue;
      const k = easeBack(clamp((n - t0) / .16)), R = sz * k;
      p.save(); p.translate(x, y); p.rotate(.2 * side);
      star5(p, 0, 0, R, R * .45); const gr = p.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, rgba(GOLD_L)); gr.addColorStop(1, rgba(GOLD));
      p.fillStyle = gr; p.fill(); p.strokeStyle = rgba(INK, .55); p.lineWidth = .8; p.stroke();
      p.restore();
    }
  }
  const ON_PAPER = 45.45;                                                 // from here he is drawn over the whole page (he breaks out)
  SCENE({ id: 's5', start: 36.3, trans: 'turn', tdur: .9, folio: 5,
    plate: { lat: 'TABVLA V · COR INTIMVM', he: 'עמוק בפנים' },
    ill(g, n) {
      const c = cam(n);
      sky(g, n, c);
      const P = plutoOpts(n, c), ch = charonAt(n, c), T = n < SNAP ? tagAt(n, c) : null, gA = goldA(n);
      const C = cometAt(n, c);
      if (ch.z < 0 && n < 45.0) drawCharonAt(g, n, c, ch, gA);
      if (T && T.z < 0) drawTagAt(g, n, T, gA);
      drawDust(g, n, 'light');
      if (C) drawComet(g, n, C, 'light');
      if (n < ON_PAPER) drawPluto(g, c.x, c.y, c.R, P);
      if (T && T.z > 0) drawTagAt(g, n, T, gA);
      if (n < W_RULES + .1) { const T2 = tagAt(Math.min(n, SNAP), c); if (T2.az > .05) drawPin(g, T2.ax, T2.ay, T2.s); }
      else if (n < W_RULES + .8) {                                       // the pin pops off with the ink
        const T2 = tagAt(SNAP, c), age = n - W_RULES - .1, k = c.R / 312;
        drawPin(g, T2.ax + 160 * k * age, T2.ay - 240 * k * age + 160 * k * age * age, T2.s * (1 - .6 * age), 1 - age / .7);
      }
      drawFreeTag(g, n, c);
      drawFlakes(g, n, c);
      if (ch.z >= 0 && n < 45.0) drawCharonAt(g, n, c, ch, gA);
      // annotation: the gold within
      const a1 = pulse(n, 40.25, 40.7, 41.45, 41.85), g1 = win(n, 40.25, 40.75);
      const pa = proj(-.5, .3, spin(n) + yawAt(n));
      note(g, 'aurum intus', c.x - 1.5 * c.R, c.y + .66 * c.R, c.x + pa[0] * c.R, c.y + pa[1] * c.R, a1, 'right', g1, [240, 214, 160]);
    },
    overRaw: n => n >= ON_PAPER,                                        // (no-book mode) Pluto himself is drawn here: keep his colours
    over(p, n) {
      if (n < ON_PAPER) return;
      const c = cam(n), C = cometAt(n, c), X = PAGE.IX + c.x, Y = PAGE.IY + c.y;
      // outside the plate (the left margin he breaks out into) the comet is printed on the paper: gold leaf and blue ink
      if (!NOBOOK) {                                                     // (no-book mode: no paper to print on)
      p.save(); p.beginPath(); p.rect(0, 58, PAGE.IX, 847); p.clip();
      p.translate(PAGE.IX, PAGE.IY);
      drawDust(p, n, 'ink');
      if (C) drawComet(p, n, C, 'ink');
      p.translate(-PAGE.IX, -PAGE.IY);
      paperStars(p, n);
      if (X + c.R * 1.3 > 0 && X - c.R * 1.3 < PAGE.IX) {                // his soft shadow on the page
        p.filter = `blur(${(c.R * .12).toFixed(1)}px)`; p.fillStyle = 'rgba(70,46,24,.15)';
        p.beginPath(); p.ellipse(X + c.R * .16, Y + c.R * .22, c.R * .98, c.R * .94, 0, 0, 7); p.fill(); p.filter = 'none';
      }
      p.restore();
      }
      if (X + c.R * 1.25 <= 0) return;
      // he is painted once; inside the plate with his haze, on the paper only his disc (no light halo on paper)
      const P = plutoOpts(n, c), S = Math.ceil(c.R * 3.6), sq = P.squash;
      if (OFF.width < S) { OFF.width = OFF.height = S; }
      OG.setTransform(1, 0, 0, 1, 0, 0); OG.globalCompositeOperation = 'source-over'; OG.globalAlpha = 1; OG.clearRect(0, 0, OFF.width, OFF.height);
      drawPluto(OG, S / 2, S / 2, c.R, P);
      p.save(); p.beginPath(); p.rect(PAGE.IX, PAGE.IY, PAGE.IW, PAGE.IH); p.clip(); p.drawImage(OFF, 0, 0, S, S, X - S / 2, Y - S / 2, S, S); p.restore();
      p.save(); p.beginPath(); p.rect(0, 0, W, H); p.rect(PAGE.IX, PAGE.IY, PAGE.IW, PAGE.IH); p.clip('evenodd');
      p.beginPath(); p.ellipse(X, Y, c.R * sq[0] + .5, c.R * sq[1] + .5, 0, 0, 7); p.clip();
      p.drawImage(OFF, 0, 0, S, S, X - S / 2, Y - S / 2, S, S); p.restore();
    },
  });
})();
