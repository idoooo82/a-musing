// ===================== marginalia: doodles left in the book by earlier young readers =====================
// Pencil, ballpoint, red pencil and wax crayon - aliens, saucers, rockets, meteors, ringed planets, an astronaut,
// a sleepy moon, constellations and a few handwritten notes. Quiet (low contrast, multiplied into the paper), different
// on every page, never on the plate or over the story's own margin figures. Deterministic per page.
'use strict';
const DOODLE = (() => {
  // ---------- hands (drawing instruments) ----------
  const HANDS = {
    hb: { col: [74, 74, 86], a: .46, w: 1.4, grain: .5 },
    soft: { col: [50, 50, 58], a: .5, w: 2.6, grain: .62, smudge: .4 },
    hard: { col: [112, 112, 124], a: .34, w: .9, grain: .4 },
    ballpoint: { col: [36, 56, 140], a: .56, w: 1.1, grain: .1, blob: 1 },
    felt: { col: [32, 30, 38], a: .5, w: 2.4, grain: .06 },
    red: { col: [176, 58, 58], a: .42, w: 1.6, grain: .45 },
    gel: { col: [120, 70, 160], a: .48, w: 1.5, grain: .1, blob: 1 },
    crayon: { col: [214, 120, 40], a: .4, w: 4.4, grain: .75 },
    green: { col: [70, 140, 84], a: .38, w: 4.0, grain: .75 },
  };
  // ---------- the person holding it: every doodle gets its own hand ----------
  //  kid      - wonky proportions, heavy uneven pressure, sometimes coloured in past the lines
  //  shaky    - a slow trembling line
  //  sketchy  - several light searching passes
  //  quick    - one fast pass, overshooting ends, a line that runs out early
  //  careful  - slow and fairly clean (still a hand)
  const STYLES = {
    kid: { wonk: 6, trem: .7, tf: .09, press: .9, passes: 1, jit: .6, over: 2, drop: .1 },
    shaky: { wonk: 1.5, trem: 1.9, tf: .22, press: .5, passes: 1, jit: .4, over: 1, drop: .05 },
    sketchy: { wonk: 2, trem: .5, tf: .1, press: .6, passes: 3, jit: 2.2, over: 4, drop: .05 },
    quick: { wonk: 2.5, trem: .3, tf: .05, press: .7, passes: 1, jit: .5, over: 7, drop: .25 },
    careful: { wonk: .8, trem: .35, tf: .12, press: .35, passes: 1, jit: .3, over: 1, drop: 0 },
  };
  let P = null;                                            // the current doodle's personality
  function resample(q, step) {
    const o = [q[0]];
    for (let i = 1; i < q.length; i++) {
      const [ax, ay] = q[i - 1], [bx, by] = q[i], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / step));
      for (let k = 1; k <= n; k++) o.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]);
    }
    return o;
  }
  function stroke(g, pts, h, r, closed = false) {
    if (P.limit !== undefined && P.n >= P.limit) return;      // unfinished: the reader stopped here
    P.n++;
    let q = pts.map(p => p.slice()); if (closed) q.push([pts[0][0] + (r() - .5) * 5, pts[0][1] + (r() - .5) * 5]);
    if (P.wonk) {                                            // each part drawn a little off, a little the wrong size
      let cx = 0, cy = 0; for (const p of q) { cx += p[0]; cy += p[1]; } cx /= q.length; cy /= q.length;
      const s = 1 + (r() - .5) * P.wonk * .05, ox = (r() - .5) * P.wonk, oy = (r() - .5) * P.wonk, rot = (r() - .5) * P.wonk * .02, c = Math.cos(rot), sn = Math.sin(rot);
      q = q.map(([x, y]) => { const dx = (x - cx) * s, dy = (y - cy) * s; return [cx + dx * c - dy * sn + ox, cy + dx * sn + dy * c + oy]; });
    }
    if (q.length > 1 && P.over) {                            // ends run past the corner, or stop short
      const e = q.length - 1, [ax, ay] = q[e - 1], [bx, by] = q[e], L = Math.hypot(bx - ax, by - ay) || 1, k = (r() - .3) * P.over;
      q[e] = [bx + (bx - ax) / L * k, by + (by - ay) / L * k];
    }
    let R = resample(q, 2.2);
    const cut = (P.limit !== undefined && P.n === P.limit) ? .35 + r() * .4 : (r() < P.drop ? .55 + r() * .35 : 1);
    if (cut < 1) R = R.slice(0, Math.max(2, Math.floor(R.length * cut)));
    const N = R.length;
    for (let pass = 0; pass < P.passes; pass++) {
      const s1 = r() * 100, s2 = r() * 100, s3 = r() * 100, jx = (r() - .5) * P.jit * (pass ? 2 : 1), jy = (r() - .5) * P.jit * (pass ? 2 : 1);
      const A = h.a * (pass ? .5 : 1) * (.8 + .4 * r());
      let px = null, py = null;
      for (let i = 0; i < N; i++) {
        const x = R[i][0] + jx + P.trem * 2 * (vnoise2(i * P.tf, s1) - .5), y = R[i][1] + jy + P.trem * 2 * (vnoise2(i * P.tf, s2) - .5);
        if (px !== null) {
          const pr = 1 + P.press * (vnoise2(i * .045, s3) - .5) * 1.6, tp = .45 + .55 * Math.min(1, i / 5, (N - i) / 5);
          g.lineWidth = Math.max(.35, h.w * pr * tp); g.globalAlpha = Math.min(1, A * (.75 + .5 * pr * tp));
          g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke();
        } else if (h.blob && r() < .5) { g.globalAlpha = A; g.fillStyle = g.strokeStyle; g.beginPath(); g.arc(x, y, h.w * .9, 0, 7); g.fill(); }
        px = x; py = y;
      }
    }
    g.globalAlpha = 1;
  }
  const circ = (cx, cy, rx, ry = rx, a0 = 0, a1 = 6.283, n = 28) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  function hatch(g, h, r, clipFn, x0, y0, x1, y1, step = 6, ang = .9) {
    g.save(); g.beginPath(); clipFn(); g.clip();
    const L = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, c = Math.cos(ang), s = Math.sin(ang), lim = P.limit; P.limit = undefined;
    for (let t = -L / 2; t < L / 2; t += step * (.8 + r() * .6)) if (r() < .85) stroke(g, [[cx + c * t - s * L / 2, cy + s * t + c * L / 2], [cx + c * t + s * L / 2, cy + s * t - c * L / 2]], Object.assign({}, h, { a: h.a * .5, w: h.w * .7 }), r);
    P.limit = lim; g.restore();
  }
  // messy colouring-in: a back-and-forth zigzag over an area, spilling past the outline
  function scribble(g, h, r, cx, cy, rx, ry) {
    const pts = [], n = 9 + (r() * 6 | 0), ang = (r() - .5) * 1.2, c = Math.cos(ang), s = Math.sin(ang);
    for (let i = 0; i <= n; i++) {
      const v = -1 + 2 * i / n, half = Math.sqrt(Math.max(0, 1 - v * v)) * 1.12;
      for (const side of (i % 2 ? [1, -1] : [-1, 1])) { const x = side * half * rx * (.85 + r() * .25), y = v * ry; pts.push([cx + x * c - y * s, cy + x * s + y * c]); }
    }
    const keep = P.limit; P.limit = undefined;
    stroke(g, r() < .4 ? pts.slice(0, Math.floor(pts.length * (.5 + r() * .4))) : pts, Object.assign({}, h, { a: h.a * .55 }), r);
    P.limit = keep;
  }
  const FILL = { ringed: [0, 0, 28, 28], meteor: [0, 0, 16, 15], ufo: [0, -4, 44, 14], alien: [0, -20, 24, 22], heart: [0, -2, 14, 11], moon: [-8, 0, 20, 30], rocket: [0, -16, 13, 36], sputnik: [0, 0, 11, 11] };
  // ---------- the doodles (local coords, ~100 px tall) ----------
  const D = {
    rocket(g, h, r) {
      stroke(g, [[0, -60], [14, -36], [16, 20], [-16, 20], [-14, -36], [0, -60]], h, r);
      stroke(g, circ(0, -18, 7), h, r);
      stroke(g, [[-16, 4], [-30, 28], [-14, 20]], h, r); stroke(g, [[16, 4], [30, 28], [14, 20]], h, r);
      stroke(g, [[-9, 22], [-6, 40], [0, 30], [5, 44], [9, 22]], h, r);
      for (let i = 0; i < 3; i++) stroke(g, [[-40 - i * 8, 40 + i * 12], [-52 - i * 8, 56 + i * 12]], h, r);
    },
    ufo(g, h, r) {
      stroke(g, circ(0, 0, 50, 13), h, r, true); stroke(g, circ(0, -6, 22, 22, Math.PI, 2 * Math.PI, 14), h, r);
      for (let i = -2; i <= 2; i++) stroke(g, circ(i * 18, 3, 3), h, r);
      stroke(g, [[-16, 14], [-34, 70]], h, r); stroke(g, [[16, 14], [34, 70]], h, r);
      stroke(g, [[-3, -14], [-1, -12]], h, r); stroke(g, [[5, -14], [7, -12]], h, r);   // a tiny pilot peeking
    },
    alien(g, h, r) {
      stroke(g, circ(0, -20, 26, 24), h, r, true); stroke(g, [[-10, -42], [-18, -66]], h, r); stroke(g, [[10, -42], [18, -66]], h, r);
      stroke(g, circ(-18, -68, 4), h, r); stroke(g, circ(18, -68, 4), h, r);
      stroke(g, circ(-9, -24, 7, 9), h, r); stroke(g, circ(9, -24, 7, 9), h, r); stroke(g, circ(-8, -22, 2), h, r); stroke(g, circ(10, -22, 2), h, r);
      stroke(g, circ(0, -10, 8, 4, .2, 2.9, 8), h, r);
      stroke(g, [[-14, 2], [-16, 40], [16, 40], [14, 2]], h, r);
      stroke(g, [[14, 10], [34, -6], [38, -16]], h, r); stroke(g, [[34, -16], [38, -24]], h, r); stroke(g, [[38, -16], [44, -20]], h, r);   // waving
      stroke(g, [[-14, 12], [-30, 26]], h, r); stroke(g, [[-8, 40], [-10, 56]], h, r); stroke(g, [[8, 40], [10, 56]], h, r);
    },
    meteor(g, h, r) {
      stroke(g, circ(0, 0, 16, 15), h, r, true); stroke(g, circ(-4, -4, 4), h, r); stroke(g, circ(6, 4, 3), h, r);
      for (let i = 0; i < 4; i++) stroke(g, [[12 + i * 2, -12 + i * 7], [62 + i * 6, -44 + i * 8]], h, r);
    },
    ringed(g, h, r) {
      stroke(g, circ(0, 0, 28), h, r, true);
      hatch(g, h, r, () => g.arc(4, 3, 28, -.6, 2.4), -30, -30, 30, 30, 5, -.8);
      stroke(g, circ(0, 2, 58, 13, -.25, Math.PI + .25, 20), h, r); stroke(g, circ(0, 2, 58, 13, Math.PI + .5, 2 * Math.PI - .5, 16), h, r);
    },
    astronaut(g, h, r) {
      stroke(g, circ(0, -36, 18), h, r, true); stroke(g, circ(0, -36, 11, 8), h, r, true);
      stroke(g, [[-16, -22], [-20, 18], [20, 18], [16, -22]], h, r);
      stroke(g, [[-18, -14], [-36, -2], [-40, -14]], h, r); stroke(g, [[18, -14], [34, -32]], h, r);
      stroke(g, [[-12, 18], [-16, 46]], h, r); stroke(g, [[12, 18], [18, 44]], h, r);
      stroke(g, [[34, -32], [34, -70]], h, r); stroke(g, [[34, -70], [60, -62], [34, -54]], h, r);     // planting a little flag
    },
    moon(g, h, r) {
      stroke(g, [...circ(0, 0, 34, 34, Math.PI * .38, Math.PI * 1.62, 20), ...circ(15, -2, 27, 29, Math.PI * 1.5, Math.PI * .5, 18)], h, r);
      stroke(g, [[-24, -6], [-17, -4]], h, r); stroke(g, circ(-19, 8, 5, 3, .3, 2.8, 6), h, r);
      stroke(g, [[22, -30], [32, -30], [22, -40], [32, -40]], h, r);                                        // z z
    },
    stars(g, h, r) {
      for (let i = 0; i < 4; i++) { const x = (r() - .5) * 90, y = (r() - .5) * 80, s = 6 + r() * 9; const p = []; for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? s * .45 : s; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } stroke(g, p, h, r); }
    },
    constell(g, h, r) {
      const P = [[-50, 10], [-24, -14], [2, -8], [26, -30], [48, -12], [30, 18]];
      for (const [x, y] of P) { g.fillStyle = rgba(h.col, h.a); g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
      for (let i = 0; i < P.length - 1; i++) stroke(g, [P[i], P[i + 1]], Object.assign({}, h, { a: h.a * .7 }), r);
    },
    spiral(g, h, r) { const p = []; for (let i = 0; i < 60; i++) { const a = i * .3, rr = 2 + i * .75; p.push([Math.cos(a) * rr, Math.sin(a) * rr * .6]); } stroke(g, p, h, r); },
    heart(g, h, r) { stroke(g, [[0, 14], [-18, -2], [-14, -14], [-4, -14], [0, -6], [4, -14], [14, -14], [18, -2], [0, 14]], h, r); },
    sputnik(g, h, r) { stroke(g, circ(0, 0, 12), h, r, true); for (const a of [2.4, 2.8, 3.4]) stroke(g, [[Math.cos(a) * 12, Math.sin(a) * 12], [Math.cos(a) * 52, Math.sin(a) * 52]], h, r); },
  };
  const NOTES = ['פלוטו אתה כוכב!', 'גם אני קטן', 'היה פה נועם', '9 כוכבי לכת!', 'פלוטו + שרון', 'חייזר = חבר', 'למה?!', 'הכי חמוד'];
  function note(g, h, r, text) {
    const size = 28 + r() * 14 | 0; g.save(); g.fillStyle = rgba(h.col, Math.min(1, h.a * 1.3)); g.font = `${size}px Gveret`; g.direction = 'rtl'; g.textBaseline = 'middle';
    const ch = [...text], ws = ch.map(c => g.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0);
    let x = tot / 2, drift = 0;                                       // right to left, each letter its own size and tilt
    ch.forEach((c, i) => { drift += (r() - .5) * 1.6; g.save(); g.translate(x - ws[i] / 2, drift + (r() - .5) * 2.5); g.rotate((r() - .5) * .14); const s = .9 + r() * .22; g.scale(s, s);
      g.globalAlpha = .75 + r() * .25; g.textAlign = 'center'; g.fillText(c, 0, 0); g.restore(); x -= ws[i] * (.95 + r() * .12); });
    g.restore();
    if (r() < .45) stroke(g, [[-tot / 2 - 6, size * .62], [0, size * .6 + (r() - .5) * 4], [tot / 2 + 4, size * .58]], Object.assign({}, h, { a: h.a * .6 }), r);
  }
  // grain: pencil and crayon break up on the paper's tooth
  let GR = null;
  function grain(lay, k) {
    if (k <= 0) return;
    if (!GR) { GR = canvas(512, 512); const x = GR.getContext('2d'), id = x.createImageData(512, 512), r = mulberry(55); for (let i = 0; i < id.data.length; i += 4) { id.data[i + 3] = r() < .5 ? 255 * r() : 0; } x.putImageData(id, 0, 0); }
    const x = lay.getContext('2d'); x.save(); x.globalCompositeOperation = 'destination-out'; x.globalAlpha = k; x.fillStyle = x.createPattern(GR, 'repeat'); x.fillRect(0, 0, lay.width, lay.height); x.restore();
  }
  // ---------- layouts: slots that stay clear of each page's plate, captions, text and margin figures ----------
  // left page (page units): left margin top half, right margin, bottom-right corner, top-left corner
  const LEFT_SLOTS = [[120, 190], [120, 400], [1800, 210], [1800, 470], [1800, 700], [1560, 1010], [1250, 1040], [80, 70], [130, 600]];
  // facing page (screen units at z = 0): its visible strip
  const RIGHT_SLOTS = [[1770, 230], [1720, 410], [1790, 560], [1740, 730], [1800, 880]];
  const BUSY = { s1: 1, s3: 1, s7: 1 };                       // pages whose lower-left margin carries the story's own figures
  const KINDS = Object.keys(D);
  const cache = {};
  function drawOne(kind, hd, r, isNote, noteText) {
    const S = 360, c = canvas(S, S), g = c.getContext('2d');
    g.translate(S / 2, S / 2); g.strokeStyle = rgba(hd.col, 1); g.fillStyle = rgba(hd.col, 1); g.lineCap = 'round'; g.lineJoin = 'round';
    if (isNote) note(g, hd, r, noteText); else D[kind](g, hd, r);
    return c;
  }
  function layer(key, w, h, slots, seed, count, notes) {
    if (cache[key]) return cache[key];
    const out = canvas(w, h), og = out.getContext('2d'), r = mulberry(seed);
    const order = slots.map((s, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]).slice(0, count);
    const hands = Object.keys(HANDS), styles = Object.keys(STYLES), used = new Set(), usedH = new Set();
    order.forEach((si, k) => {
      let hn = hands[(r() * hands.length) | 0]; for (let t = 0; t < 4 && usedH.has(hn); t++) hn = hands[(r() * hands.length) | 0]; usedH.add(hn);
      const hd = HANDS[hn], st = styles[(r() * styles.length) | 0];
      P = Object.assign({ n: 0 }, STYLES[st]);
      if (r() < .3) P.limit = 3 + (r() * 5 | 0);                              // left unfinished
      const isNote = notes && k === 1;
      let ki = (seed * 5 + k * 3 + (r() * 3 | 0)) % KINDS.length; while (used.has(ki)) ki = (ki + 1) % KINDS.length; used.add(ki);
      const kind = KINDS[ki];
      let c = drawOne(kind, hd, r, isNote, NOTES[(seed * 7 + k) % NOTES.length]);
      const cg = c.getContext('2d');
      // coloured in (mostly kids, crayon or felt over the outline)
      if (!isNote && FILL[kind] && P.limit === undefined && (st === 'kid' ? r() < .7 : r() < .2)) {
        const fh = HANDS[['crayon', 'green', 'red', 'gel'][(r() * 4) | 0]], keep = P; P = Object.assign({ n: 0 }, STYLES.kid);
        cg.save(); cg.translate(180, 180); cg.strokeStyle = rgba(fh.col, 1); cg.lineCap = 'round'; cg.lineJoin = 'round';
        const [fx, fy, rx, ry] = FILL[kind]; scribble(cg, fh, r, fx, fy, rx, ry); cg.restore(); P = keep;
      }
      grain(c, hd.grain * (.8 + r() * .4));
      const sc = (isNote ? 1 : .7 + r() * .65), rot = (r() - .5) * .6, [x, y] = slots[si], X = x + (r() - .5) * 34, Y = y + (r() - .5) * 26;
      og.save(); og.translate(X, Y); og.rotate(rot); og.scale(sc, sc);
      if (hd.grain > .3 && r() < .3) {                                       // an earlier attempt, rubbed out: a grey ghost and eraser smudge
        og.save(); og.globalAlpha = .16; og.filter = 'blur(1.6px)'; og.translate(10 + r() * 14, -8 - r() * 10); og.rotate((r() - .5) * .3); og.drawImage(c, -180, -180); og.restore();
        og.save(); og.globalAlpha = .07; og.fillStyle = 'rgb(120,110,100)'; og.filter = 'blur(10px)'; og.beginPath(); og.ellipse(16, -10, 70, 40, r(), 0, 7); og.fill(); og.restore();
      }
      if (hd.smudge) { og.save(); og.globalAlpha = hd.smudge * .35; og.filter = 'blur(2.5px)'; og.drawImage(c, -178, -177); og.restore(); }   // soft graphite smears a little
      og.drawImage(c, -180, -180);
      og.restore();
    });
    return (cache[key] = out);
  }
  // draw on the reading page (page units), under the story's own margin drawings
  function page(p, sid, k, z) {
    if (z > .995) return;
    const slots = BUSY[sid] ? LEFT_SLOTS.filter(s => !(s[0] < 400 && s[1] > 300)) : LEFT_SLOTS;
    const L = layer('L' + sid, W, H, slots, 11 + k * 17, 5, false);
    p.save(); p.globalCompositeOperation = 'multiply'; p.globalAlpha = .9; p.drawImage(L, 0, 0); p.restore();
  }
  // draw on the facing page (screen units at z = 0)
  function facing(p, sid, k) {
    const L = layer('R' + sid, W, H, RIGHT_SLOTS, 29 + k * 23, 5, true);
    p.save(); p.beginPath(); p.rect(BOOK.X0 + BOOK.PW + 6, BOOK.Y0, W, BOOK.PH); p.clip();
    p.globalCompositeOperation = 'multiply'; p.globalAlpha = .9; p.drawImage(L, 0, 0); p.restore();
  }
  return { page, facing };
})();
