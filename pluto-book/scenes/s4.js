// ===================== s4: SINE AERE - sadness (n 25.00 .. 36.30) =====================
// "ופלוטו, שככה פתאום ביטלו אותו, / נשאר לרגע בלי חמצן. איך הפך מכוכב לליצן? / הוא לא נרגע, כולו כואב, וסביב עצמו הוא מסתובב."
// Cold, grey, lonely. A wide plate: Pluto small and far away, the Sun only a bright engraved star ("SOL") with a dimension
// line drawn out to him ("5 900 000 000 km"); he drifts away from it, still wearing page 3's red "מבוטל" ink on his brow and
// the "מתחזה" tag pinned at his upper right (same placement as page 3). The camera closes in on "נשאר לרגע".
// "בלי חמצן": his thin layered blue haze (New Horizons saw ~20 layers) FREEZES - the rings bead into ice crystals that peel
// off his rim and fall as fine glittering snow; he gasps, then sinks. "איך הפך מכוכב לליצן": Charon glides in, tumbles his
// red pole toward us and parks on his face - a red clown nose ("nasus ridiculus"). A burning meteor streaks under him like a
// travelling footlight: its warm light rakes up across his relief and for a moment the face reads as an embarrassed
// half-smile, then sinks back. "לא נרגע, כולו כואב": he shivers; hairline ice cracks run over him. "וסביב עצמו הוא מסתובב":
// he spins - face, ink and tag whirl around the sphere, Charon is flung off into orbit, the sky turns into long-exposure
// star trails around him.
(() => {
  const S0 = 25.0;
  // ---- word times (lines.json) ----
  const W_CANCEL = 27.14, W_REMAIN = 28.44, W_NO = 29.12, W_OXY = 29.34, W_HOW = 30.64, W_STAR = 31.30, W_CLOWN = 31.82,
    W_HE = 33.08, W_CALM = 33.38, W_HURT = 34.38, W_AROUND = 35.02, W_SPINS = 35.90;
  const ICE = [214, 232, 255], CREAM = [236, 226, 204];

  // ---------------- camera: Pluto's plate position (x,y) and radius R ----------------
  const lr = (a, b, t) => a * Math.pow(b / a, t);                         // zoom interpolation (log space)
  function cam(n) {
    const w = n - S0;
    let x = 548 - 7.5 * w, y = 455 + 3 * Math.sin(w * .55), R = 64 + 2.4 * w;  // wide: small, drifting away from the Sun
    const k1 = ease((n - 27.85) / (29.3 - 27.85));                         // push in on "נשאר לרגע"
    x = lerp(x, 720, k1); y = lerp(y, 392, k1); R = lr(R, 172 + 5 * clamp((n - 29.3) / 1.3), k1);
    const k2 = ease((n - 30.55) / (31.75 - 30.55));                        // closer for the clown nose
    x = lerp(x, 712, k2); y = lerp(y, 398, k2); R = lr(R, 214 + 4 * clamp((n - 31.75) / 3), k2);
    const k3 = ease((n - 34.95) / (36.3 - 34.95));                         // a slight pull back while he spins
    R = lr(R, 196, k3); x = lerp(x, 720, k3); y = lerp(y, 402, k3);
    return { x, y, R };
  }
  // shiver: "הוא לא נרגע, כולו כואב"
  const shK = n => win(n, W_HE + .1, W_CALM + .3) * (.55 + .45 * pulse(n, W_HURT - .1, W_HURT + .1, 34.7, 35.15)) * (1 - win(n, 34.95, 35.35));
  const shiver = n => { const k = shK(n); return [k * (1.7 * Math.sin(n * 63) + 1.1 * Math.sin(n * 97 + 1.3)), k * (1.2 * Math.sin(n * 71 + 2) + .8 * Math.sin(n * 113))]; };

  // ---------------- the spin ----------------
  // one accelerating turn: the face slides off to the left, the back of him goes by, and on the page turn it comes round again
  const SPK = 2.754;
  const spinAng = n => { const u = Math.max(0, n - (W_AROUND - .05)); return SPK * Math.pow(u, 2.6); };
  const spinRate = n => { const u = Math.max(0, n - (W_AROUND - .05)); return SPK * 2.6 * Math.pow(u, 1.6); };

  // ---------------- face (relief only) ----------------
  const FK = [
    [25.0, { smile: -.55, sad: .66, brow: .42, open: .86, O: 0 }],
    [26.9, { smile: -.55, sad: .66, brow: .42, open: .86, O: 0 }],
    [27.6, { smile: -.66, sad: .8, brow: .5, open: .8, O: 0 }],           // "ביטלו אותו" - he sinks
    [29.0, { smile: -.66, sad: .8, brow: .55, open: .82, O: 0 }],
    [29.3, { smile: -.45, sad: .5, brow: .78, open: 1, O: .2 }],           // "בלי" - he feels it
    [29.55, { smile: -.3, sad: .4, brow: .82, open: 1, O: .88 }],          // "חמצן" - gasp
    [30.05, { smile: -.3, sad: .42, brow: .8, open: 1, O: .82 }],
    [30.55, { smile: -.78, sad: .92, brow: .72, open: .78, O: 0 }],        // ...and sinks
    [31.0, { smile: .35, sad: .15, brow: .2, open: 1, O: 0 }],             // a warm light approaches: he brightens, smiles
    [31.62, { smile: .5, sad: .08, brow: .15, open: 1, O: 0 }],
    [31.82, { smile: -.1, sad: .45, brow: .9, open: 1, O: .55 }],          // THUD - a red rock lands right on his face
    [32.15, { smile: -.72, sad: .92, brow: .78, open: .85, O: 0 }],        // ...and the smile is gone: a clown
    [32.72, { smile: -.74, sad: .94, brow: .78, open: .82, O: 0 }],
    [33.3, { smile: -.72, sad: .92, brow: .75, open: .8, O: 0 }],          // sinks back ("לא נרגע")
    [34.3, { smile: -.76, sad: .96, brow: .85, open: .76, O: 0 }],
    [34.52, { smile: -.86, sad: 1, brow: .95, open: .45, O: 0 }],          // "כואב" - a wince
    [34.95, { smile: -.82, sad: 1, brow: .92, open: .55, O: 0 }],
    [35.4, { smile: -.45, sad: .62, brow: .8, open: .7, O: .4 }],          // dizzy
    [36.4, { smile: -.45, sad: .62, brow: .8, open: .7, O: .4 }],
  ];
  function faceAt(n) {
    let i = 0; while (i < FK.length - 2 && n > FK[i + 1][0]) i++;
    const [t0, a] = FK[i], [t1, b] = FK[i + 1], k = ease((n - t0) / (t1 - t0)), f = {};
    for (const key in a) f[key] = lerp(a[key], b[key], k);
    // gaze: down and away from the Sun; follows Charon in; looks down at the new nose; dizzy pits whirl while spinning
    let lx = -.35, ly = .45;
    const fol = pulse(n, 30.75, 31.1, 31.55, 31.8); lx = lerp(lx, .85, fol); ly = lerp(ly, -.1, fol);
    const nose = pulse(n, 31.7, 31.9, 33.0, 33.4); lx = lerp(lx, 0, nose); ly = lerp(ly, .95, nose);
    const shy = pulse(n, 32.2, 32.4, 32.75, 33.0); lx = lerp(lx, -.7, shy); ly = lerp(ly, .7, shy);
    const hit = pulse(n, 31.0, 31.3, 31.7, 31.85); lx = lerp(lx, .8, hit); ly = lerp(ly, -.6, hit);
    const dz = win(n, 35.15, 35.6), da = spinAng(n) * 1.3;
    lx = lerp(lx, .9 * Math.cos(da), dz); ly = lerp(ly, .8 * Math.sin(da), dz);
    f.look = [lx, ly];
    return f;
  }

  // ---------------- the meteor (a travelling footlight) ----------------
  const M0 = 30.95, M1 = W_CLOWN;
  function meteorAt(n, c) {
    const u = (n - M0) / (M1 - M0); if (u < -.02 || u > 1) return null;
    const ax = c.x + 3.6 * c.R, ay = c.y - 2.3 * c.R, bx = c.x + NOSE[0] * c.R, by = c.y + NOSE[1] * c.R;
    const uu = clamp(u), hx = lerp(ax, bx, uu), hy = lerp(ay, by, uu);
    const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
    const burn = clamp(u / .08);                                           // flares up and burns all the way in
    return { hx, hy, ux, uy, u, a: burn, trav: uu * L, ax, ay, L };
  }
  // its light on a body at (x,y), radius r
  function meteorLight(n, c, x, y, r) {
    const m = meteorAt(n, c); if (!m || m.a <= 0) return null;
    const dx = (m.hx - x) / r, dy = (m.hy - y) / r, dz = 1.0, dl = Math.hypot(dx, dy, dz);
    const d = Math.hypot(dx, dy);
    const k = 1.35 * m.a / (1 + Math.pow(d / 2.3, 2));
    return { dir: [dx / dl, dy / dl], col: [255, 172, 98], k };
  }
  function drawMeteor(g, n, c) {
    const m = meteorAt(n, c); if (!m || m.u > 1) return;
    const a = m.a * (.88 + .12 * Math.sin(n * 83)); if (a <= 0) return;
    const { hx, hy, ux, uy } = m, px = -uy, py = ux, L = Math.min(m.trav, 3.0 * c.R);
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    // engraved tail: fine hairlines converging on the head
    for (let k = -3; k <= 3; k++) {
      const ak = Math.abs(k), len = L * (1 - .13 * ak), sp = k * 2.4 * (c.R / 214);
      const tx = hx - ux * len + px * sp, ty = hy - uy * len + py * sp;
      const gr = g.createLinearGradient(hx, hy, tx, ty);
      const a0 = a * (k === 0 ? .95 : .5 / (1 + ak * .4));
      gr.addColorStop(0, rgba([255, 236, 200], a0)); gr.addColorStop(.18, rgba([255, 190, 120], a0 * .6));
      gr.addColorStop(.55, rgba([236, 130, 80], a0 * .22)); gr.addColorStop(1, rgba([200, 100, 70], 0));
      g.strokeStyle = gr; g.lineWidth = k === 0 ? 1.7 : .75; g.beginPath(); g.moveTo(hx + px * sp * .1, hy + py * sp * .1); g.lineTo(tx, ty); g.stroke();
    }
    // sparks shed along the way, drifting and dimming
    for (let i = 0; i < 16; i++) {
      const ts = M0 + Math.pow(hash2(i, 7), .8) * (M1 - M0) * .95; if (n < ts) continue;
      const life = .25 + hash2(i, 13) * .35, age = n - ts; if (age > life) continue;
      const s0 = clamp((ts - M0) / (M1 - M0)) * m.L, sx = m.ax + ux * s0, sy = m.ay + uy * s0;
      const vx = (hash2(i, 3) - .5) * 60 + ux * 90, vy = (hash2(i, 5) - .3) * 70;
      const x = sx + vx * age, y = sy + vy * age + 40 * age * age;
      g.fillStyle = rgba([255, 200, 140], a * .85 * (1 - age / life)); g.beginPath(); g.arc(x, y, .7 + hash2(i, 11) * .7, 0, 7); g.fill();
    }
    // the head: a tiny white-hot core, a tight warm halo
    const hg = g.createRadialGradient(hx, hy, 0, hx, hy, 11); hg.addColorStop(0, rgba([255, 250, 232], a)); hg.addColorStop(.25, rgba([255, 214, 150], .55 * a)); hg.addColorStop(1, rgba([255, 160, 90], 0));
    g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, 11, 0, 7); g.fill();
    glint(g, hx, hy, 7 + 2 * Math.sin(n * 51), .7 * a, [255, 236, 200]);
    g.restore();
  }

  // ---------------- body-surface decals (they turn with him: projected from body lon/lat) ----------------
  // body point (alpha = lon from face centre, lat) -> screen offset in R units + depth
  const proj = (al, la, sp) => { const th = al - sp, cl = Math.cos(la); return [cl * Math.sin(th), Math.sin(la), cl * Math.cos(th)]; };
  // the "מבוטל" ink, exactly where page 3's stamp left it (centred on his brow, MK = {y:-.645, s:.27, rot:-.13}, flattened .86):
  // the flat mark is re-projected once into a lon/lat patch, then wrapped back onto the sphere cell by cell every frame,
  // so at rest it matches page 3 and when he spins it turns with him.
  const IA0 = -1.12, IA = 2.24, IL0 = -1.3, IL = 1.0;                      // patch: lon -1.12 .. 1.12, lat -1.3 .. -.3
  let INKP = null; const PW = 448, PH = 200;
  function inkPatch() {
    if (INKP) return INKP;
    const RF = 220, F = canvas(2 * RF, 2 * RF), fx = F.getContext('2d');
    fx.translate(RF, RF - .645 * RF); fx.scale(1, .86); drawStampMark(fx, 0, 0, .27 * RF / 212, -.13, .96);
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
  const DEC = canvas(700, 700), DG = DEC.getContext('2d');
  function inkInto(g2, cx, cy, r, sp, alpha) {
    const P = inkPatch(), NX = 40, NY = 12;
    for (let i = 0; i < NX; i++) {
      let tm = (IA0 + (i + .5) / NX * IA - sp + Math.PI) % (2 * Math.PI); if (tm < 0) tm += 2 * Math.PI; tm -= Math.PI;   // wrapped
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
  // hairline ice cracks (grown on "כואב"): random walks with branches, in body lon/lat
  const CRACKS = (() => {
    const r = mulberry(8128), out = [];
    const walk = (al, la, dir, nseg, t0, depth) => {
      const pts = [[al, la]]; let a = al, l = la, d = dir;
      for (let i = 0; i < nseg; i++) {
        d += r() < .3 ? (r() - .5) * 1.7 : (r() - .5) * .22; const st = .026 + r() * .034; a += Math.cos(d) * st; l += Math.sin(d) * st; pts.push([a, l]);
        if (depth < 2 && r() < .16) walk(a, l, d + (r() < .5 ? 1 : -1) * (.6 + r() * .6), 3 + (r() * 5 | 0), t0 + i * .022, depth + 1);
      }
      out.push({ pts, t0, dur: nseg * .022 + .05 });
    };
    walk(-.62, -.46, 2.2, 13, 0, 0); walk(-.6, -.42, -.4, 7, .04, 1);       // upper left
    walk(-.5, .3, 2.0, 11, .09, 0); walk(-.48, .28, .9, 7, .12, 1);          // left cheek
    walk(-.2, .66, 2.6, 10, .15, 0); walk(-.14, .64, .5, 7, .18, 1);         // chin
    walk(.22, .72, .3, 8, .2, 1);                                            // lower right
    return out;
  })();
  function cracksInto(g2, cx, cy, r, sp, n, mode) {
    return;                                                                // cracks removed (client)
    const T0 = W_HURT - .06; if (n < T0) return;
    const lw = Math.max(.6, r / 240);
    for (const c of CRACKS) {
      const k = clamp((n - T0 - c.t0) / c.dur); if (k <= 0) continue;
      const N = c.pts.length - 1, upto = k * N;
      g2.beginPath(); let pen = false;
      for (let i = 0; i <= Math.ceil(upto); i++) {
        let [al, la] = c.pts[Math.min(i, N)];
        if (i > upto) { const f = upto - (i - 1), [a0, l0] = c.pts[i - 1]; al = lerp(a0, al, f); la = lerp(l0, la, f); }
        const [x, y, z] = proj(al, la, sp); if (z < .08) { pen = false; continue; }
        const X = cx + x * r + (mode ? -lw * .9 : 0), Y = cy + y * r + (mode ? lw * .9 : 0);
        pen ? g2.lineTo(X, Y) : g2.moveTo(X, Y); pen = true;
      }
      if (mode) { g2.strokeStyle = 'rgba(236,244,255,.34)'; g2.lineWidth = lw * .65; }
      else { g2.strokeStyle = 'rgba(34,36,70,.72)'; g2.lineWidth = lw * 1.1; }
      g2.stroke();
    }
  }
  function plutoDecal(n, sp) {
    return (g2, cx, cy, r) => {
      // ink + dark crack lines are MULTIPLIED onto the lit surface (so they live in his light and shadow)
      const S = Math.ceil(2 * r + 8); if (DEC.width < S) { DEC.width = DEC.height = S; }
      DG.setTransform(1, 0, 0, 1, 0, 0); DG.clearRect(0, 0, DEC.width, DEC.height); DG.globalCompositeOperation = 'source-over';
      inkInto(DG, cx, cy, r, sp, .9);
      DG.lineCap = 'round'; DG.lineJoin = 'round'; cracksInto(DG, cx, cy, r, sp, n, 0);
      g2.save(); g2.beginPath(); g2.arc(cx, cy, r - .5, 0, 7); g2.clip();
      g2.globalCompositeOperation = 'multiply'; g2.drawImage(DEC, 0, 0);
      g2.globalCompositeOperation = 'source-over'; g2.lineCap = 'round'; g2.lineJoin = 'round'; cracksInto(g2, cx, cy, r, sp, n, 1);
      g2.restore();
    };
  }

  // ---------------- Pluto's look & light ----------------
  function plutoOpts(n, c) {
    const fz = win(n, 29.35, 30.4);                                         // atmosphere frozen
    const ml = meteorLight(n, c, c.x, c.y, c.R);
    const sp = spinAng(n) + .06 * Math.sin(n * .45);
    const gasp = pulse(n, 29.3, 29.55, 30.05, 30.5), bonk = Math.exp(-Math.max(0, n - W_CLOWN) * 9) * (n > W_CLOWN ? 1 : 0);
    return {
      spin: sp, face: faceAt(n),
      light: [.64, -.5], lightCol: [.86, .9, 1.03], amb: lerp(.5, .44, win(n, 33, 34.5)) + .04 * gasp,
      light2: ml || undefined, gray: lerp(.12, .3, fz), atm: 1 - fz, rim: lerp(.35, .16, fz), glow: 0,
      squash: [1 - .02 * gasp + .025 * bonk * Math.cos((n - W_CLOWN) * 40), 1 + .03 * gasp - .025 * bonk * Math.cos((n - W_CLOWN) * 40)],
      decal: plutoDecal(n, sp),
    };
  }

  // ---------------- the layered blue haze, and its freezing into snow ----------------
  const RINGS = [1.03, 1.055, 1.085, 1.12], RA = [.26, .18, .12, .075];
  const FLAKES = (() => {
    const r = mulberry(2902), out = [];
    for (let i = 0; i < 380; i++) {
      const ring = Math.min(3, (Math.pow(r(), 1.4) * 4) | 0), th = r() * Math.PI * 2;
      const top = (1 - Math.sin(th)) / 2;                                   // 1 at the top (screen y up), 0 at the bottom
      const tr = 29.42 + .5 * (1 - top) + .85 * Math.pow(r(), 1.3);        // the freeze runs from his crown down both sides
      out.push({ ring, th, rho: RINGS[ring] + (r() - .5) * .012, tc: Math.max(29.24 + .1 * r(), tr - .2 - .3 * r()), tr, life: 1.1 + r() * 1.7,
        ph: r() * 6.28, sz: .55 + Math.pow(r(), 2) * 1.3, glint: r() < .14, out: .015 + r() * .1, g: .3 + Math.pow(r(), .8) * 1.4 });
    }
    return out;
  })();
  function drawHaze(g, n, c, sp) {
    const melt = 1 - win(n, 29.3, 29.8); if (melt <= 0) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    RINGS.forEach((k, i) => {
      g.strokeStyle = rgba([150, 196, 250], RA[i] * melt * (.9 + .1 * Math.sin(n * 1.3 + i)));
      g.lineWidth = Math.max(.6, c.R / 150); g.beginPath(); g.arc(c.x, c.y, c.R * k, 0, 7); g.stroke();
    });
    g.restore();
  }
  function drawSnow(g, n, c) {
    if (n < 29.1 || n > 33.4) return;
    g.save(); g.globalCompositeOperation = 'lighter';
    const R = c.R, sc = Math.sqrt(R / 176);
    for (const f of FLAKES) {
      if (n < f.tc) continue;
      const age = n - f.tr; if (age > f.life) continue;
      let x = Math.cos(f.th) * f.rho, y = Math.sin(f.th) * f.rho, a;
      if (age < 0) {                                                        // crystallising on the ring: a bead of ice
        const b = clamp((n - f.tc) / .14); a = .55 * b + .45 * Math.exp(-Math.pow((n - f.tc - .12) / .07, 2));
      } else {                                                              // peeled off: falls away, flutters, dims
        const fl = Math.min(age, 1);
        x += Math.cos(f.th) * f.out * age + .035 * Math.sin(age * 2.4 + f.ph) * fl;
        y += Math.sin(f.th) * f.out * age + .5 * f.g * .9 * age * age;
        a = 1 - Math.pow(age / f.life, 1.6);
        const d = Math.hypot(x, y); if (d < .97) a *= clamp((d - .55) / .42);    // settling onto him as frost
      }
      if (a <= .01) continue;
      const X = c.x + x * R, Y = c.y + y * R, tw = .7 + .3 * Math.sin(n * 9 + f.ph * 3);
      if (f.glint && age > -.05) glint(g, X, Y, (2.4 + f.sz * 2) * sc * tw, .85 * a, ICE);
      else { g.fillStyle = rgba(ICE, .9 * a * tw); g.beginPath(); g.arc(X, Y, f.sz * sc * .8, 0, 7); g.fill(); }
    }
    g.restore();
  }

  // ---------------- Charon: glides in, turns his red pole to us, parks as the nose; flung into orbit by the spin ----------------
  const NOSE = [.0, .085], NR = .135;                                     // nose position (R units from centre) and Charon's radius
  function charonAt(n, c) {
    if (n < W_CLOWN) return null;
    const R = c.R, nx = c.x + NOSE[0] * R, ny = c.y + NOSE[1] * R;
    let x, y, z = 1, tumble, r = NR * R, trail = 0;
    const u = clamp((n - 30.55) / (W_CLOWN - 30.55));
    if (n < W_CLOWN) {                                                     // the glide: in from the right, over, and down onto the face
      const e = 1 - Math.pow(1 - ease(u * .7 + .3 * u * u), 1.3);
      const p0 = [c.x + 3.1 * R, c.y - 2.25 * R], p1 = [c.x + .95 * R, c.y - 1.8 * R], p2 = [nx, ny];
      x = (1 - e) * (1 - e) * p0[0] + 2 * (1 - e) * e * p1[0] + e * e * p2[0];
      y = (1 - e) * (1 - e) * p0[1] + 2 * (1 - e) * e * p1[1] + e * e * p2[1];
      r *= 1 + .12 * (1 - e);
      tumble = win(n, W_CLOWN - .24, W_CLOWN + .04);
    } else {
      const st = n - W_CLOWN;                                              // a tiny settling bounce ("boop")
      x = nx; y = ny - 5 * (R / 214) * Math.exp(-st * 7) * Math.sin(st * 26) * (st < 1.2 ? 1 : 0);
      tumble = 1;
      if (n > W_AROUND - .05) {                                            // carried round by the face, then flung off into orbit
        const T1 = 35.34, e = easeOut((n - T1) / .7), fl = win(n, T1, T1 + .45);
        const psi = -(spinAng(Math.min(n, T1)) + .3 * Math.max(0, spinAng(n) - spinAng(T1)) + .55 * Math.max(0, n - T1));
        const rho = lerp(1.0, 1.82, e), tilt = .5 * e;
        x = c.x + rho * Math.sin(psi) * R; y = c.y + NOSE[1] * R * (1 - e) + rho * tilt * Math.cos(psi) * R;
        z = Math.cos(psi);
        return { x, y, r: r * (1 + .12 * z * e), z, tumble: 1 - fl, trail: e, psi, rho, tilt, ny: c.y + NOSE[1] * R * (1 - e) };
      }
    }
    return { x, y, r, z, tumble, trail: 0 };
  }
  // his red pole (in reality "Mordor Macula") turned toward us: painted as a glossy red ball, lit like everything else
  const charonDecal = (tumble, l2) => (g2, cx, cy, r) => {
    if (tumble <= .01) return;
    const ph = tumble * Math.PI / 2, ey = -Math.cos(ph) * r * .72, ry = r * (.2 + .78 * Math.sin(ph)), rx = r * .98;
    g2.save(); g2.beginPath(); g2.arc(cx, cy, r - .2, 0, 7); g2.clip(); g2.globalCompositeOperation = 'source-atop';
    g2.save(); g2.translate(cx, cy + ey); g2.scale(1, ry / rx); g2.filter = `blur(${(.6 + r * .14 * Math.sin(Math.PI * tumble)).toFixed(2)}px)`;
    const gr = g2.createRadialGradient(rx * .32, -rx * .38, 0, rx * .1, -rx * .1, rx * 1.25);
    gr.addColorStop(0, 'rgb(246,128,112)'); gr.addColorStop(.32, 'rgb(212,58,56)'); gr.addColorStop(.75, 'rgb(146,30,40)'); gr.addColorStop(1, 'rgb(96,22,34)');
    g2.globalAlpha = .55 + .4 * tumble; g2.fillStyle = gr; g2.beginPath(); g2.arc(0, 0, rx, 0, 7); g2.fill();
    g2.restore();
    if (l2 && l2.k > .02) {                                                // the meteor's warm light catches the nose too
      const lx = cx + l2.dir[0] * r * .9, ly = cy + l2.dir[1] * r * .9, lg = g2.createRadialGradient(lx, ly, 0, lx, ly, r * 1.3);
      lg.addColorStop(0, `rgba(255,170,100,${.55 * Math.min(1, l2.k)})`); lg.addColorStop(1, 'rgba(255,150,90,0)');
      g2.globalCompositeOperation = 'lighter'; g2.fillStyle = lg; g2.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    g2.globalCompositeOperation = 'source-over';                           // a small, crisp gloss from the far Sun
    g2.fillStyle = `rgba(255,236,226,${.55 * tumble})`; g2.beginPath(); g2.ellipse(cx + r * .36, cy - r * .4, r * .13, r * .08, -.7, 0, 7); g2.fill();
    g2.restore();
  };
  function drawCharonAt(g, n, c, ch) {                                    // the red rock "nose" + its impact dust
    drawBody(g, ch.x, ch.y, ch.r, { kind: 'mars', spin: 1.2, light: [.64, -.5], lightCol: [1.08, .82, .78], amb: .85, rim: .15 });
    const st = n - W_CLOWN;
    if (st > 0 && st < 1.4) {
      g.save();
      for (let i = 0; i < 34; i++) {
        const an = hash2(i, 3) * 6.283, sp = (.6 + 1.4 * hash2(i, 5)) * c.R * .55, life = .7 + .6 * hash2(i, 9); if (st > life) continue;
        const k = st / life, d = sp * (1 - Math.pow(1 - k, 2.2)), x = ch.x + Math.cos(an) * d, y = ch.y + Math.sin(an) * d * .75 + 18 * k * k;
        const a = (1 - k) * .55, rr = (1.2 + 3.5 * hash2(i, 7)) * (1 + 1.5 * k) * (c.R / 214);
        g.fillStyle = rgba(hash2(i, 11) < .5 ? [196, 160, 140] : [150, 110, 100], a); g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
      }
      const rk = clamp(st / .5); g.strokeStyle = `rgba(230,210,200,${.35 * (1 - rk)})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(ch.x, ch.y, ch.r * (1.2 + 2.4 * rk), ch.r * (1 + 1.8 * rk), 0, 0, 7); g.stroke();
      g.restore();
    }
  }
  function charonTrail(g, n, c, ch, front) {                             // a faint long-exposure arc of his orbit
    if (!ch.trail || ch.trail < .02) return;
    const R = c.R; g.save(); g.lineCap = 'round';
    const N = 30, span = 1.6 * ch.trail;
    const P = p => [c.x + ch.rho * Math.sin(p) * R, ch.ny + ch.rho * ch.tilt * Math.cos(p) * R];
    for (let i = 0; i < N; i++) {
      const p0 = ch.psi + span * i / N, p1 = ch.psi + span * (i + 1) / N, zm = Math.cos((p0 + p1) / 2);
      if ((zm > 0) !== front) continue;
      const a = .3 * ch.trail * Math.pow(1 - i / N, 1.3);
      const [x0, y0] = P(p0), [x1, y1] = P(p1);
      if (Math.hypot((x0 + x1) / 2 - c.x, (y0 + y1) / 2 - c.y) < R * 1.04) continue;     // never drawn across his face
      g.strokeStyle = rgba([214, 208, 220], a); g.lineWidth = Math.max(.7, ch.r * .1) * (1 - i / N * .7);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.restore();
  }

  // ---------------- the "מתחזה" tag: pinned at his upper right exactly as page 3 left it; whirled out by the spin ----------------
  const TAG_AL = 1.165, TAG_LA = -.39, TAG_LEN = .396, TAG_S = .7 / 212;    // page 3: pin at angle -.42, .93 r; string 84 px; scale .7 at r 212
  function tagAt(n, c, sp, sh) {
    const R = c.R, [x, y, z] = proj(TAG_AL, TAG_LA, sp);
    const ax = c.x + x * R + sh[0], ay = c.y + y * R + sh[1];
    const w = spinRate(n), out = Math.atan(w * w * .012);                   // centrifugal swing-out
    const len = TAG_LEN * R, th = TAG_AL - sp;
    const sway = .07 * Math.sin(n * 1.05 + .4) + .035 * Math.sin(n * 2.3 + 1) - .5 * (sh[0] / Math.max(1, R)) ;
    // dangling: hangs down, swaying (screen); flung: points out from the axis (3D, projected)
    const hx = Math.sin(sway) * len, hy = Math.cos(sway) * len;
    const fx = Math.sin(out) * len * Math.sin(th), fy = Math.cos(out) * len;
    const k = clamp(out / .35);
    const tx = ax + lerp(hx, fx, k), ty = ay + lerp(hy, fy, k);
    const tz = lerp(z + .2, Math.cos(th), k);
    return { ax, ay, tx, ty, z: Math.min(z, tz) > -.02 ? 1 : -1, az: z, s: R * TAG_S, rot: -Math.atan2(tx - ax, ty - ay) * .8 };
  }
  function tagBody(g, s) {                                                 // (the same card as page 3)
    g.scale(s, s);
    g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.fillStyle = '#efe4cc';
    g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(130, 38); g.lineTo(130, 150); g.lineTo(-130, 150); g.lineTo(-130, 38); g.closePath(); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = 'rgba(120,90,60,.5)'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#1c1830'; g.beginPath(); g.arc(0, 20, 8, 0, 7); g.fill();
    g.strokeStyle = rgba(GOLD, .9); g.lineWidth = 2; g.beginPath(); g.arc(0, 20, 11, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(214,40,52,.9)'; g.lineWidth = 3; g.strokeRect(-110, 52, 220, 84);
    g.fillStyle = 'rgb(196,48,56)'; g.font = '800 60px Frank'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText('מתחזה', 0, 90);
    g.font = '600 15px Cinzel'; g.letterSpacing = '4px'; g.direction = 'ltr'; g.fillStyle = 'rgba(120,90,60,.9)'; g.fillText('IMPOSTOR', 0, 124); g.letterSpacing = '0px';
  }
  function drawTagAt(g, T, light) {
    g.save();
    g.strokeStyle = 'rgba(236,226,206,.95)'; g.lineWidth = Math.max(1, 2 * T.s / .7);
    const mx = (T.ax + T.tx) / 2 + 8 * T.s, my = (T.ay + T.ty) / 2;
    g.beginPath(); g.moveTo(T.ax, T.ay); g.quadraticCurveTo(mx, my, T.tx, T.ty + 14 * T.s); g.stroke();
    g.save(); g.translate(T.tx, T.ty); g.rotate(T.rot); tagBody(g, T.s);
    if (light > .02) {                                                    // the meteor's warm glow on the card
      g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.lineTo(130, 38); g.lineTo(130, 150); g.lineTo(-130, 150); g.lineTo(-130, 38); g.closePath();
      g.fillStyle = `rgba(255,160,90,${.3 * Math.min(1, light)})`; g.fill();
    }
    g.restore();
    if (T.az > .05) {                                                     // the pin that fixes it to him
      const pr = Math.max(1.6, 4.2 * T.s / .7);
      g.fillStyle = rgba(GOLD_L); g.beginPath(); g.arc(T.ax, T.ay, pr, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,20,.8)'; g.lineWidth = 1; g.stroke();
      glint(g, T.ax - 1, T.ay - 1, pr * 1.2, .6, [255, 244, 220]);
    }
    g.restore();
  }

  // ---------------- the far Sun (only a bright star from out here) and his orbit ----------------
  function farSun(g, n, c) {
    const Z = c.R / 64, f = 1 + (Z - 1) * .32;
    const sx = c.x + (1240 - 548) * f, sy = c.y + (148 - 455) * f; if (sx > PAGE.IW + 60 || sy < -60) return [sx, sy, 0];
    const a = 1 - win(n, 28.0, 28.8);
    g.save();
    // a dimension line from the Sun out to him (how far, and how alone): drawn out from the Sun, then labelled
    const dl = Math.hypot(c.x - sx, c.y - sy), ux = (c.x - sx) / dl, uy = (c.y - sy) / dl, nx = -uy, ny = ux;
    const d0 = 40, d1 = dl - c.R * 1.45, grow = easeOut((n - 25.35) / 1.5), dd = lerp(d0, d1, grow), off = 0;
    if (grow > 0 && a > 0) {
      g.strokeStyle = rgba(GOLD_L, .42 * a); g.lineWidth = .9; g.setLineDash([5, 6]);
      g.beginPath(); g.moveTo(sx + ux * d0 + nx * off, sy + uy * d0 + ny * off); g.lineTo(sx + ux * dd + nx * off, sy + uy * dd + ny * off); g.stroke(); g.setLineDash([]);
      for (const [d, on] of [[d0, 1], [dd, grow > .98 ? 1 : 0]]) if (on) { g.beginPath(); g.moveTo(sx + ux * d - nx * 7, sy + uy * d - ny * 7); g.lineTo(sx + ux * d + nx * 7, sy + uy * d + ny * 7); g.stroke(); }
      const la = a * win(n, 26.3, 26.9), mx = sx + ux * (d0 + d1) / 2 + nx * 16, my = sy + uy * (d0 + d1) / 2 + ny * 16;
      if (la > 0) {
        g.save(); g.translate(mx, my); g.rotate(Math.atan2(uy, ux) + Math.PI); g.fillStyle = rgba(CREAM, .62 * la); g.font = 'italic 500 21px Cormorant';
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr'; g.fillText('5 900 000 000 km', 0, 0); g.restore();
      }
    }
    // the sun: a small engraved star
    g.globalCompositeOperation = 'lighter';
    const hg = g.createRadialGradient(sx, sy, 0, sx, sy, 16); hg.addColorStop(0, `rgba(255,246,222,${.9 * a})`); hg.addColorStop(.3, `rgba(255,220,160,${.25 * a})`); hg.addColorStop(1, 'rgba(255,200,140,0)');
    g.fillStyle = hg; g.beginPath(); g.arc(sx, sy, 16, 0, 7); g.fill();
    g.strokeStyle = `rgba(255,232,190,${.55 * a})`; g.lineWidth = .8;
    for (let i = 0; i < 16; i++) { const an = i / 16 * 6.283 + .1, L = i % 2 ? 13 : 24 + 3 * Math.sin(n * 1.7 + i); g.beginPath(); g.moveTo(sx + Math.cos(an) * 4, sy + Math.sin(an) * 4); g.lineTo(sx + Math.cos(an) * L, sy + Math.sin(an) * L); g.stroke(); }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = rgba(CREAM, .6 * a); g.font = '500 13px Cinzel'; g.letterSpacing = '5px'; g.textAlign = 'center'; g.direction = 'ltr'; g.textBaseline = 'middle';
    g.fillText('SOL', sx + 3, sy + 40); g.letterSpacing = '0px';
    g.restore();
    return [sx, sy, a];
  }

  // ---------------- atlas annotations (Cormorant italic, a fine leader drawn out to the subject) ----------------
  function note(g, text, tx, ty, px, py, a, align, grow) {
    if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    g.font = 'italic 500 25px Cormorant'; g.direction = 'ltr'; g.textBaseline = 'middle'; g.textAlign = align;
    const w = g.measureText(text).width, lx = align === 'right' ? tx + 8 : tx - 8;
    const ex = lerp(lx, px, grow), ey = lerp(ty, py, grow);
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(16,14,30,.42)'; g.lineWidth = 2.6; g.beginPath(); g.moveTo(lx, ty); g.lineTo(ex, ey); g.stroke();   // keeps it legible on the bright ice
    g.strokeStyle = rgba(CREAM, .7); g.lineWidth = .9; g.beginPath(); g.moveTo(lx, ty); g.lineTo(ex, ey); g.stroke();
    if (grow > .98) { g.fillStyle = 'rgba(16,14,30,.45)'; g.beginPath(); g.arc(px, py, 3.4, 0, 7); g.fill(); g.fillStyle = rgba(CREAM, .85); g.beginPath(); g.arc(px, py, 2, 0, 7); g.fill(); }
    g.fillStyle = rgba(CREAM, .8); g.fillText(text, tx, ty);
    g.restore();
  }

  // ---------------- the sky ----------------
  function sky(g, n, c) {
    const sp = spinAng(n), rate = spinRate(n), Z = c.R / 64;
    const su = clamp((n - 34.97) / 1.33), sk = Math.pow(su, 1.6), rot = .8 * Math.pow(su, 2.3);
    const trail = .04 + 1.05 * Math.pow(clamp((n - 35.1) / 1.2), 1.4), tk = win(n, 35.12, 35.5);
    const swc = [(c.x - 720) / 810, (c.y - 405) / 810];
    const mw = (() => { const m = meteorAt(n, c); return m ? m.a * bump(n, M0, M1 - M0 + .1) : 0; })();
    SPACE.draw(g, { t: n, cam: [.32 - .2 * (c.x - 548) / 810, .06 - .08 * (c.y - 455) / 810], zoom: 1 + (Z - 1) * .045, neb: .34, galx: .18, gpos: [-.62, -.32],
      cold: .78, gray: .3, bright: .8 + .08 * mw, warm: .16 * mw, swirl: .32 * sk, swc });
    const scam = [.5 - .3 * (c.x - 548) / 810, .1 - .12 * (c.y - 455) / 810], sz = 1 + (Z - 1) * .1;
    g.save(); g.translate(c.x, c.y); g.rotate(rot); g.translate(-c.x, -c.y);
    if (tk < 1) STARS.draw(g, { t: n, cam: scam, zoom: sz, dim: .78, alpha: 1 - tk });
    if (tk > 0) STARS.draw(g, { t: n, cam: scam, zoom: sz, dim: .95, alpha: tk, trail: Math.max(.02, trail), swc });
    g.restore();
    DUST.draw(g, { t: n, alpha: .35 * (1 - tk), vx: .006, vy: .004, cam: scam });
  }

  SCENE({ id: 's4', start: 25.0, trans: 'turn', tdur: .9, folio: 4,
    plate: { lat: 'TABVLA IV · SINE AERE', he: 'בלי חמצן' },
    ill(g, n) {
      const ik = n > W_CLOWN ? Math.exp(-(n - W_CLOWN) * 7) : 0; g.translate(9 * ik * Math.sin((n - W_CLOWN) * 70), 6 * ik * Math.sin((n - W_CLOWN) * 53 + 1));
      const c0 = cam(n), sh = shiver(n), c = { x: c0.x + sh[0], y: c0.y + sh[1], R: c0.R };
      sky(g, n, c0);
      farSun(g, n, c0);
      const P = plutoOpts(n, c), sp = P.spin;
      const ch = charonAt(n, c), T = tagAt(n, c0, sp, sh);
      if (ch) charonTrail(g, n, c, ch, false);
      if (ch && ch.z < 0) drawCharonAt(g, n, c, ch);
      const tl = (() => { const m = meteorLight(n, c0, T.tx, T.ty + 50 * T.s, c0.R * .5); return m ? m.k : 0; })();
      if (T.z < 0) drawTagAt(g, T, tl);
      drawPluto(g, c.x, c.y, c.R, P);
      drawHaze(g, n, c, sp);
      if (T.z > 0) drawTagAt(g, T, tl);
      drawSnow(g, n, c0);
      if (ch) charonTrail(g, n, c, ch, true);
      if (ch && ch.z >= 0) drawCharonAt(g, n, c, ch);
      drawMeteor(g, n, c0);
      // annotations
      const a1 = pulse(n, 29.6, 29.9, 30.75, 31.1), g1 = win(n, 29.6, 30.0), an1 = -2.45;
      note(g, 'atmosphaera congelata', c0.x - 1.62 * c0.R, c0.y - 1.02 * c0.R, c0.x + Math.cos(an1) * 1.07 * c0.R, c0.y + Math.sin(an1) * 1.07 * c0.R, a1, 'right', g1);
      const a2 = pulse(n, 32.0, 32.3, 34.45, 34.85), g2 = win(n, 32.0, 32.45);
      note(g, 'nasus ridiculus', c0.x - 1.3 * c0.R, c0.y + NOSE[1] * c0.R, c0.x + (NOSE[0] - NR - .02) * c0.R, c0.y + NOSE[1] * c0.R, a2, 'right', g2);
    },
  });
})();
