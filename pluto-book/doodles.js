// ===================== marginalia: doodles left in the book by earlier young readers =====================
// Pencil, ballpoint, red pencil and wax crayon - aliens, saucers, rockets, meteors, ringed planets, an astronaut,
// a sleepy moon, constellations and a few handwritten notes. Quiet (low contrast, multiplied into the paper), different
// on every page, never on the plate or over the story's own margin figures. Deterministic per page.
'use strict';
const DOODLE = (() => {
  // ---------- hands (drawing instruments) ----------
  const HANDS = {
    pencil: { col: [70, 70, 82], a: .42, w: 1.5, jit: 1.1, passes: 2, grain: .55 },
    pen: { col: [38, 58, 140], a: .5, w: 1.25, jit: .6, passes: 1, grain: .12 },
    red: { col: [176, 58, 58], a: .4, w: 1.7, jit: 1.0, passes: 2, grain: .45 },
    crayon: { col: [214, 120, 40], a: .38, w: 3.6, jit: 1.6, passes: 2, grain: .7 },
  };
  // a sketchy polyline: each pass wobbles a little differently; ends overshoot like a real hand
  function stroke(g, pts, h, r, closed = false) {
    for (let p = 0; p < h.passes; p++) {
      const j = h.jit * (p ? 1.6 : 1), q = pts.map(([x, y]) => [x + (r() - .5) * j * 2, y + (r() - .5) * j * 2]);
      if (closed) q.push([q[0][0] + (r() - .5) * 4, q[0][1] + (r() - .5) * 4]);
      g.lineWidth = h.w * (.75 + r() * .5); g.globalAlpha = h.a * (p ? .55 : 1);
      g.beginPath(); g.moveTo(q[0][0], q[0][1]);
      for (let i = 1; i < q.length - 1; i++) g.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + q[i + 1][0]) / 2, (q[i][1] + q[i + 1][1]) / 2);
      g.lineTo(q[q.length - 1][0], q[q.length - 1][1]); g.stroke();
    }
    g.globalAlpha = 1;
  }
  const circ = (cx, cy, rx, ry = rx, a0 = 0, a1 = 6.283, n = 28) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  function hatch(g, h, r, clipFn, x0, y0, x1, y1, step = 6, ang = .9) {
    g.save(); g.beginPath(); clipFn(); g.clip();
    const L = Math.hypot(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, c = Math.cos(ang), s = Math.sin(ang);
    for (let t = -L / 2; t < L / 2; t += step * (.8 + r() * .5)) stroke(g, [[cx + c * t - s * L / 2, cy + s * t + c * L / 2], [cx + c * t + s * L / 2, cy + s * t - c * L / 2]], Object.assign({}, h, { a: h.a * .5, passes: 1, w: h.w * .7 }), r);
    g.restore();
  }
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
      stroke(g, [...circ(0, 0, 34, 34, -1.9, 1.9, 18), ...circ(14, 0, 26, 30, 1.6, -1.6, 18).reverse()], h, r);
      stroke(g, [[-14, -8], [-6, -6]], h, r); stroke(g, circ(-6, 10, 6, 3, .3, 2.8, 6), h, r);
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
    g.save(); g.fillStyle = rgba(h.col, h.a * 1.25); g.font = `${30 + r() * 10 | 0}px Gveret`; g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 0, 0); g.restore();
    if (r() < .5) stroke(g, [[-70, 22], [70, 20]], Object.assign({}, h, { a: h.a * .6 }), r);   // a wobbly underline
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
  function layer(key, w, h, slots, seed, count, notes) {
    if (cache[key]) return cache[key];
    const out = canvas(w, h), og = out.getContext('2d'), r = mulberry(seed);
    const order = slots.map((s, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(a => a[1]).slice(0, count);
    const hands = Object.keys(HANDS);
    const per = {}; for (const hn of hands) { per[hn] = canvas(w, h); }
    const used = new Set();
    order.forEach((si, k) => {
      const [x, y] = slots[si], hn = hands[(seed + k * 3 + (r() * 4 | 0)) % hands.length], hd = HANDS[hn], g = per[hn].getContext('2d');
      g.save(); g.translate(x + (r() - .5) * 30, y + (r() - .5) * 24); g.rotate((r() - .5) * .5); const sc = .85 + r() * .45; g.scale(sc, sc);
      g.strokeStyle = rgba(hd.col, 1); g.lineCap = 'round'; g.lineJoin = 'round';
      if (notes && k === 1) note(g, hd, r, NOTES[(seed * 7 + k) % NOTES.length]);
      else { let ki = (seed * 5 + k * 3 + (r() * 3 | 0)) % KINDS.length; while (used.has(ki)) ki = (ki + 1) % KINDS.length; used.add(ki); D[KINDS[ki]](g, hd, r); }
      g.restore();
    });
    for (const hn of hands) { grain(per[hn], HANDS[hn].grain); og.drawImage(per[hn], 0, 0); }
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
