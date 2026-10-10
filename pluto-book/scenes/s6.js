// ===================== PAGE 6 — "you are stars": the constellations of children =====================
// Beats (narration time):
//  46.25-46.95  the comet (Pluto) spirals in; its swirling tail wipes page 5 away and he lands, normal size again
//  46.42-48.10  "כי מה שפלוטו יודע" — he turns to face the reader (side-lit smile) and gives a small bow
//  48.12-49.92  "וכדאי גם לכם, ילדים" — a planisphere chart is drawn round him; star points appear and fine gold
//               lines join them into CHILDREN (engraved atlas figures with Latin labels), right to left
//  50.18-52.20  "שאתם כוכבים רק בזכותכם" — each child's stars ignite from WITHIN (heart star first, light runs out
//               along the lines), one per word; on "בזכותכם" all of them swell together. Their light falls on Pluto.
//  52.40-54.45  "ומי שכוכב, לנצח יזרח" — dawn: an engraved sun rises at the foot of the plate, the sky warms,
//               the light from below makes Pluto's smile glow, the constellations shimmer gold.
(() => {
  const TAU = Math.PI * 2;
  const PCX = 720, PCY = 452, PR = 158;                     // Pluto at rest
  const T0 = 46.25, T1 = 46.95;                             // comet spiral-in
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  // ---------------------------------------------------------------- shape primitives (figure-local units)
  function path3(c, p) {                                     // smooth open path through all points
    c.beginPath(); c.moveTo(p[0][0], p[0][1]);
    if (p.length === 2) { c.lineTo(p[1][0], p[1][1]); return; }
    if (p.length === 3) { c.quadraticCurveTo(2 * p[1][0] - (p[0][0] + p[2][0]) / 2, 2 * p[1][1] - (p[0][1] + p[2][1]) / 2, p[2][0], p[2][1]); return; }
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
  }
  function closed(c, p, ten = 1) {                           // smooth closed shape through points
    const N = p.length; c.beginPath(); c.moveTo(p[0][0], p[0][1]);
    for (let i = 0; i < N; i++) {
      const p0 = p[(i - 1 + N) % N], p1 = p[i], p2 = p[(i + 1) % N], p3 = p[(i + 2) % N];
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6 * ten, p1[1] + (p2[1] - p0[1]) / 6 * ten, p2[0] - (p3[0] - p1[0]) / 6 * ten, p2[1] - (p3[1] - p1[1]) / 6 * ten, p2[0], p2[1]);
    }
    c.closePath();
  }
  // k = outline growth (local units): the engraved contour is (silhouette grown by k) minus (silhouette)
  const limb = (c, k, w, ...p) => { c.lineWidth = w + 2 * k; path3(c, p); c.stroke(); };
  const blob = (c, k, ten, ...p) => { closed(c, p, ten); c.fill(); if (k > 0) { c.lineWidth = 2 * k; c.stroke(); } };
  const disc = (c, k, x, y, r) => { c.beginPath(); c.arc(x, y, r + k, 0, TAU); c.fill(); };
  const oval = (c, k, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx + k, ry + k, rot, 0, TAU); c.fill(); };
  const line = (c, ...p) => { path3(c, p); c.stroke(); };

  // ---------------------------------------------------------------- the four children (atlas constellations)
  // units: ~1 unit = sc px. stars [x, y, magnitude 1..5]; heart = the α star the light is born in.
  const FIGS = [
    { // a boy leaping — arms and legs flung wide: he IS a five-pointed star
      id: 'A', lat: 'PVER SALTANS', ax: 1088, ay: 226, sc: 2.35, rot: .06, tDraw: 48.12, tIgn: 50.18, look: [.75, -.55],
      box: [-44, -78, 44, 40], lab: [1088, 334],
      stars: [[0, -50, 2], [0, -29, 1], [-33, -63, 2], [33, -63, 2], [-19, -45, 4], [19, -45, 4], [0, -8, 3], [-14, 10, 4], [15, 9, 4], [-25, 27, 2], [27, 25, 3]],
      heart: 1, lines: [[0, 1], [1, 4], [4, 2], [1, 5], [5, 3], [1, 6], [6, 7], [7, 9], [6, 8], [8, 10]],
      sil(c, k) {
        disc(c, k, 0, -50, 9.5);
        blob(c, k, .9, [-9.5, -52], [-10, -58], [-7, -63], [-3, -66.5], [1, -63.5], [4, -68], [8, -64], [10, -57], [9.5, -51], [4, -56], [-3, -57]);   // hair, lifted by the leap
        limb(c, k, 4, [0, -42], [0, -36]);
        blob(c, k, .5, [-9.5, -38], [9.5, -38], [8, -15], [-8, -15]);                                           // shirt
        blob(c, k, .4, [-9, -16], [9, -16], [11.5, -2], [1.5, -3], [0, -7], [-1.5, -3], [-11.5, -2]);          // shorts
        limb(c, k, 5.2, [-7.5, -35], [-19, -45], [-31, -61]); disc(c, k, -33, -63, 3.6);
        limb(c, k, 5.2, [7.5, -35], [19, -45], [31, -61]); disc(c, k, 33, -63, 3.6);
        limb(c, k, 6.2, [-6, -5], [-14, 10], [-23, 24]); oval(c, k, -26, 27, 5.5, 3, -.5);
        limb(c, k, 6.2, [6, -5], [15, 9], [25, 22]); oval(c, k, 28, 25, 5.5, 3, .45);
      },
      detail(c) { line(c, [-9, -15], [9, -15]); line(c, [-4, -38], [0, -34], [4, -38]); line(c, [-3, -47.5], [0, -45.5], [3, -47.5]); },
      hop: n => -(13 * bump(n, 50.2, .4) + 11 * bump(n, 51.3, .4) + 11 * bump(n, 53.62, .42)),             // little leaps on the words
    },
    { // a girl flying a kite — the kite is a little constellation of its own
      id: 'B', lat: 'PVELLA CVM MILVO', ax: 1186, ay: 722, sc: 2.32, rot: 0, tDraw: 48.42, tIgn: 50.50, look: [.85, .45],
      box: [-30, -205, 92, 6], lab: [1186, 756],
      stars: [[2, -84, 2], [1, -62, 1], [25, -95, 2], [16, -80, 4], [-11, -47, 3], [-15, -37, 3], [15, -37, 3], [-6, -1, 3], [9, -1, 4],
        [70, -190, 3], [57, -170, 3], [84, -167, 2], [71, -146, 3], [58, -133, 5], [49, -124, 5], [38, -121, 5]],
      heart: 1, lines: [[0, 1], [1, 3], [3, 2], [1, 4], [1, 5], [1, 6], [5, 6], [5, 7], [6, 8], [9, 10], [10, 12], [12, 11], [11, 9], [9, 12], [10, 11], [12, 13], [13, 14], [14, 15]],
      bridge: [2, 12],                                                                                         // the kite string (dashed thread)
      sil(c, k) {
        disc(c, k, 2, -84, 9);
        blob(c, k, .8, [-8, -90], [-2, -95], [8, -93], [11, -86], [-4, -84], [-9, -80]);                     // hair cap
        blob(c, k, .7, [-8, -89], [-17, -88], [-27, -82], [-21, -84], [-14, -82]);                           // ponytail in the wind
        limb(c, k, 3.6, [2, -76], [2, -71]);
        blob(c, k, .55, [-6, -72], [8, -72], [10, -60], [16, -37], [4, -35], [-6, -36], [-17, -38], [-9, -58]);   // dress, hem lifted by the wind
        limb(c, k, 4.4, [7, -69], [16, -80], [24, -92]); disc(c, k, 25, -95, 3.1);
        limb(c, k, 4.4, [-5, -69], [-12, -58], [-11, -48]); disc(c, k, -11, -46, 3.1);
        limb(c, k, 4.6, [-4, -36], [-5, -18], [-6, -3]); oval(c, k, -8, -1, 5, 2.6);
        limb(c, k, 4.6, [4, -36], [7, -18], [9, -3]); oval(c, k, 11, -1, 5, 2.6);
      },
      detail(c) { line(c, [-3, -66], [2, -63], [7, -66]); },
      parts: [{                                                                                                // the kite, swaying on its bridle
        pivot: [71, -146], box: [30, -198, 92, -110], stars: [9, 10, 11, 12, 13, 14, 15],
        ang: n => .075 * Math.sin(n * 1.25 + .6) + .03 * Math.sin(n * 2.7 + 1.1),
        sil(c, k) { blob(c, k, 0, [70, -190], [84, -167], [71, -146], [57, -170]); },
        detail(c) { line(c, [70, -190], [71, -146]); line(c, [57, -170], [84, -167]);
          line(c, [71, -146], [60, -137], [58, -133], [53, -127], [49, -124], [43, -121], [38, -121]);
          for (const [x, y] of [[58, -133], [49, -124], [38, -121]]) { line(c, [x - 2.5, y - 2.5], [x + 2.5, y + 2.5]); line(c, [x - 2.5, y + 2.5], [x + 2.5, y - 2.5]); } },
      }],
    },
    { // a boy waving hello (to Pluto, to you)
      id: 'C', lat: 'PVER SALVTANS', ax: 322, ay: 346, sc: 2.35, rot: -.03, tDraw: 48.74, tIgn: 50.92, look: [-.8, -.55],
      box: [-24, -112, 40, 6], lab: [322, 378],
      stars: [[0, -84, 2], [0, -62, 1], [24, -98, 2], [18, -75, 4], [-12, -47, 3], [0, -45, 4], [-5, -22, 5], [-7, -2, 3], [6, -22, 5], [9, -2, 3]],
      heart: 1, lines: [[0, 1], [1, 3], [3, 2], [1, 4], [1, 5], [5, 6], [6, 7], [5, 8], [8, 9]],
      sil(c, k) {
        disc(c, k, 0, -84, 9.5);
        blob(c, k, .9, [-10, -85], [-10.5, -91], [-6, -95.5], [0, -96.5], [6, -95], [10, -90.5], [10.5, -85], [7, -89], [2, -90.5], [-3, -88.5], [-7, -89.5]);   // fringe
        blob(c, k, .8, [-2, -95], [1, -101], [5, -102.5], [3, -98], [3, -95]);                                 // cowlick
        limb(c, k, 4, [0, -76], [0, -71]);
        blob(c, k, .55, [-9, -73], [9, -73], [11, -50], [10, -45], [-10, -45], [-11, -50]);                   // jumper
        blob(c, k, .4, [-9.5, -46], [9.5, -46], [10, -24], [1.5, -24], [0, -40], [-1.5, -24], [-10, -24]);    // short trousers
        limb(c, k, 4.6, [-5.5, -26], [-5.5, -14], [-6, -3]); oval(c, k, -8, -1, 5.5, 2.8);
        limb(c, k, 4.6, [5.5, -26], [7, -14], [8, -3]); oval(c, k, 11, -1, 5.5, 2.8);
        limb(c, k, 4.6, [7, -70], [12.5, -73.2], [18, -75]);
        limb(c, k, 4.6, [-7, -70], [-12, -58], [-12, -49]); disc(c, k, -12, -47, 3.2);
      },
      detail(c) { line(c, [-4, -73], [0, -69.5], [4, -73]); line(c, [-10.5, -49], [10.5, -49]); },
      parts: [{                                                                                                // the waving forearm
        pivot: [18, -75], box: [8, -116, 42, -66], stars: [2],
        ang: n => .26 * Math.sin((n - 50.9) * TAU * 1.5) * (pulse(n, 50.95, 51.2, 52.15, 52.5) + .8 * pulse(n, 53.3, 53.6, 54.3, 55)),
        sil(c, k) { limb(c, k, 4.6, [18, -75], [21.5, -86], [23, -94]); oval(c, k, 24, -98, 3.4, 4.2, .2); },
        detail(c) { c.beginPath(); c.arc(24, -98, 9, -1.15, -.25); c.stroke(); c.beginPath(); c.arc(24, -98, 13, -1.05, -.35); c.stroke(); },
      }],
    },
    { // a girl reading, sitting with her knees up
      id: 'D', lat: 'PVELLA LEGENS', ax: 270, ay: 712, sc: 2.45, rot: 0, tDraw: 49.00, tIgn: 51.18, look: [-.85, .45],
      box: [-34, -82, 36, 6], lab: [270, 746],
      stars: [[-7, -60, 2], [-11, -38, 1], [5, -50, 3], [15, -39, 2], [26, -51, 3], [15, -27, 3], [25, -2, 3], [-16, -4, 4]],
      heart: 1, lines: [[0, 1], [1, 3], [3, 2], [3, 4], [1, 7], [7, 5], [5, 6]],
      sil(c, k) {
        oval(c, k, -7, -60, 9, 9.6, .3);
        blob(c, k, .8, [-15, -64], [-12, -70], [-4, -71], [2, -66], [-1, -63], [-8, -63], [-13, -58]);        // bob
        disc(c, k, -16, -67, 4.6);                                                                               // bun
        blob(c, k, .6, [-17, -50], [-6, -51], [-3, -36], [-4, -12], [-12, -3], [-22, -3], [-23, -22], [-21, -42]);   // back + body
        limb(c, k, 8, [-8, -8], [5, -17], [15, -27]);                                                           // thigh
        limb(c, k, 6.5, [15, -27], [20, -14], [24, -4]); oval(c, k, 27, -1.5, 5.6, 2.8);                       // shin + shoe
        limb(c, k, 4.4, [-11, -47], [-1, -37], [12, -40]);                                                      // arm to the book
        blob(c, k, 0, [15, -39], [5, -50], [7, -52], [15, -42.5], [24, -53.5], [26, -51]);                      // open book
      },
      detail(c) { line(c, [15, -39], [15, -42.5]); line(c, [8, -48], [14, -42]); line(c, [16, -42], [23, -50]); },
    },
  ];
  // BFS depth from the heart (drawing and ignition both travel outward along the lines)
  for (const f of FIGS) {
    const N = f.stars.length, dep = new Array(N).fill(99); dep[f.heart] = 0; let ch = true;
    while (ch) { ch = false; for (const [a, b] of f.lines) { if (dep[a] + 1 < dep[b]) { dep[b] = dep[a] + 1; ch = true; } if (dep[b] + 1 < dep[a]) { dep[a] = dep[b] + 1; ch = true; } } }
    f.dep = dep; f.maxDep = Math.max(...dep);
    const rnd = mulberry(f.id.charCodeAt(0) * 31); f.ph = f.stars.map(() => rnd());
  }
  // a star's local position this frame (parts rotate round their pivot) -> plate px (with the figure's hop)
  function starLocal(f, i, n) {
    let [x, y] = f.stars[i];
    if (f.parts) for (const pt of f.parts) if (pt.stars.includes(i)) { const a = pt.ang(n), c = Math.cos(a), s = Math.sin(a), dx = x - pt.pivot[0], dy = y - pt.pivot[1]; x = pt.pivot[0] + dx * c - dy * s; y = pt.pivot[1] + dx * s + dy * c; }
    return [x, y];
  }
  const hopOf = (f, n) => f.hop ? f.hop(n) : 0;
  const toPlate = (f, x, y, hop = 0) => { const c = Math.cos(f.rot), s = Math.sin(f.rot); return [f.ax + (x * c - y * s) * f.sc, f.ay + hop + (x * s + y * c) * f.sc]; };

  // engraved images (contour + hatch + solid), built once per figure and per moving part
  const IMG = {};
  function buildImg(key, f, box, sil, detail) {
    if (IMG[key]) return IMG[key];
    const pad = 6, [x0, y0, x1, y1] = box, w = Math.ceil((x1 - x0) * f.sc + 2 * pad), h = Math.ceil((y1 - y0) * f.sc + 2 * pad);
    const ox = x0 * f.sc - pad, oy = y0 * f.sc - pad;
    const mk = () => { const cv = canvas(w, h), c = cv.getContext('2d'); c.translate(-ox, -oy); c.scale(f.sc, f.sc); c.lineCap = 'round'; c.lineJoin = 'round'; c.fillStyle = c.strokeStyle = '#fff'; return [cv, c]; };
    const [outer, oc] = mk(), [inner, ic] = mk();
    sil(oc, 1.25 / f.sc); sil(ic, 0);
    const tint = (cv, col) => { const t = canvas(w, h), c = t.getContext('2d'); c.drawImage(cv, 0, 0); c.globalCompositeOperation = 'source-in'; c.fillStyle = col; c.fillRect(0, 0, w, h); return t; };
    // contour ring = outer - inner, plus interior detail strokes
    const ring = canvas(w, h), rc = ring.getContext('2d'); rc.drawImage(outer, 0, 0); rc.globalCompositeOperation = 'destination-out'; rc.drawImage(inner, 0, 0);
    rc.globalCompositeOperation = 'source-over'; rc.setTransform(1, 0, 0, 1, -ox, -oy); rc.scale(f.sc, f.sc); rc.lineCap = 'round'; rc.lineJoin = 'round'; rc.strokeStyle = '#fff'; rc.lineWidth = .95 / f.sc; detail(rc);
    // hatch: fine diagonal engraving lines inside the silhouette (a second, sparser set on the far side)
    const hat = canvas(w, h), hc = hat.getContext('2d'); hc.strokeStyle = '#fff'; hc.lineWidth = .8;
    for (let d = -h; d < w + h; d += 3.6) { hc.beginPath(); hc.moveTo(d, 0); hc.lineTo(d - h, h); hc.stroke(); }
    hc.globalAlpha = .55; for (let d = -h; d < w + h; d += 3.6) { hc.beginPath(); hc.moveTo(d + 1.8 + w * .45, 0); hc.lineTo(d + 1.8 + w * .45 + h * .25, h); hc.stroke(); }
    hc.globalAlpha = 1; hc.globalCompositeOperation = 'destination-in'; hc.drawImage(inner, 0, 0);
    const hx = f.stars[f.heart][0] * f.sc - ox, hy = f.stars[f.heart][1] * f.sc - oy;
    const rmax = Math.max(Math.hypot(hx - w, hy - h), Math.hypot(hx, hy), Math.hypot(hx - w, hy), Math.hypot(hx, hy - h));
    return (IMG[key] = { w, h, ox, oy, hx, hy, rmax, solid: inner, contour: tint(ring, 'rgb(236,214,168)'), warm: tint(ring, 'rgb(255,214,140)'), hatch: tint(hat, 'rgb(226,200,150)') });
  }
  const figImg = f => buildImg(f.id, f, f.box, f.sil, f.detail);
  const FT = canvas(420, 520), FX = FT.getContext('2d');
  // placement transform of a figure (and of one of its parts) on the plate
  const placeFn = (f, hop, pt, n) => g => {
    g.translate(f.ax, f.ay + hop); g.rotate(f.rot);
    if (pt) { const px = pt.pivot[0] * f.sc, py = pt.pivot[1] * f.sc; g.translate(px, py); g.rotate(pt.ang(n)); g.translate(-px, -py); }
  };
  // draw an image through a radial reveal centred on the heart star (R in the figure's px; rmaxRef = the whole figure's reach)
  function revealed(g, xf, I, src, alpha, R, rmaxRef, comp) {
    if (alpha <= .003 || R <= 0) return;
    FX.setTransform(1, 0, 0, 1, 0, 0); FX.globalCompositeOperation = 'source-over'; FX.globalAlpha = 1; FX.clearRect(0, 0, I.w, I.h);
    FX.drawImage(src, 0, 0);
    if (R < rmaxRef) { FX.globalCompositeOperation = 'destination-in'; const gr = FX.createRadialGradient(I.hx, I.hy, 0, I.hx, I.hy, R); gr.addColorStop(0, '#fff'); gr.addColorStop(.5, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); FX.fillStyle = gr; FX.fillRect(0, 0, I.w, I.h); }
    g.save(); xf(g); g.globalAlpha = alpha; if (comp) g.globalCompositeOperation = comp; g.drawImage(FT, 0, 0, I.w, I.h, I.ox, I.oy, I.w, I.h); g.restore();
  }

  // light from within: the silhouette glows like a paper lantern, brightest at the heart star
  function lantern(g, xf, I, alpha, R) {
    if (alpha <= .003 || R <= 1) return;
    FX.setTransform(1, 0, 0, 1, 0, 0); FX.globalCompositeOperation = 'source-over'; FX.globalAlpha = 1; FX.clearRect(0, 0, I.w, I.h);
    FX.drawImage(I.solid, 0, 0); FX.globalCompositeOperation = 'source-in';
    const gr = FX.createRadialGradient(I.hx, I.hy, 0, I.hx, I.hy, R); gr.addColorStop(0, 'rgba(255,228,160,1)'); gr.addColorStop(.3, 'rgba(255,200,118,.5)'); gr.addColorStop(1, 'rgba(255,180,100,0)');
    FX.fillStyle = gr; FX.fillRect(0, 0, I.w, I.h);
    g.save(); xf(g); g.globalAlpha = alpha; g.globalCompositeOperation = 'lighter'; g.drawImage(FT, 0, 0, I.w, I.h, I.ox, I.oy, I.w, I.h); g.restore();
  }

  // ---------------------------------------------------------------- timing helpers for one figure
  const RAD = [0, 4.4, 3.6, 3.0, 2.45, 2.0];
  const starIn = (f, i, n) => clamp((n - (f.tDraw + .04 + f.ph[i] * .26)) / .2);
  const lineT = (f, d) => f.tDraw + .22 + d * .13;               // drawing: line from depth d starts
  const ignT = (f, d) => f.tIgn + d * .085;                       // ignition: light reaches depth d
  const swell = n => pulse(n, 51.28, 51.62, 51.95, 52.7);         // "בזכותכם": all of them together

  function drawFig(g, f, n, E) {
    const d = n - f.tDraw; if (d <= 0) return;
    const I = figImg(f), dawn = E.dawn, sw = swell(n), hop = hopOf(f, n);
    const ig = clamp((n - f.tIgn) / .55);                         // ignition progress (whole figure)
    // 1) the engraved child (appears from its heart outward once the lines are drawn)
    const rev = easeOut((d - .4) / 1.0) * I.rmax * 1.25;
    const fa = .36 + .2 * ease(ig) + .16 * dawn, hA = .2 + .1 * ease(ig) + .1 * dawn;
    const warmA = (.42 + .3 * sw + .22 * dawn) * (1 - .4 * ease((n - f.tIgn - .6) / .8)), warmR = easeOut((n - f.tIgn) / .7) * I.rmax * 1.3;
    const layers = [[figImg(f), placeFn(f, hop, null, n)]];
    if (f.parts) f.parts.forEach((pt, k) => layers.push([buildImg(f.id + k, f, pt.box, pt.sil, pt.detail), placeFn(f, hop, pt, n)]));
    for (const [J, xf] of layers) {
      revealed(g, xf, J, J.hatch, hA, rev, I.rmax);
      revealed(g, xf, J, J.contour, fa, rev, I.rmax);
      if (n > f.tIgn) revealed(g, xf, J, J.warm, warmA, warmR, I.rmax, 'lighter');
    }
    // their own light, rising from the heart
    if (n > f.tIgn) lantern(g, layers[0][1], I, .34 + .18 * sw + .1 * dawn + .3 * bump(n, f.tIgn, .7), easeOut((n - f.tIgn) / .8) * I.rmax * (.42 + .08 * sw));
    // 2) lines (traced outward from the heart; then lit outward from the heart)
    const P = f.stars.map((s, i) => { const [x, y] = starLocal(f, i, n); return toPlate(f, x, y, hop); });
    g.save(); g.lineCap = 'round';
    const gold = mixc([224, 196, 140], [250, 206, 112], dawn);
    for (const [a0, b0] of f.lines) {
      let a = a0, b = b0; if (f.dep[b] < f.dep[a]) { a = b0; b = a0; }
      const q = clamp((n - lineT(f, f.dep[a])) / .16); if (q <= 0) continue;
      const [ax, ay] = P[a], [bx, by] = P[b], L = Math.hypot(bx - ax, by - ay); if (L < 1) continue;
      const ux = (bx - ax) / L, uy = (by - ay) / L, ga = RAD[f.stars[a][2]] + 4, gb = RAD[f.stars[b][2]] + 4;
      const sx = ax + ux * ga, sy = ay + uy * ga, ex = bx - ux * gb, ey = by - uy * gb, LL = Math.max(0, L - ga - gb);
      const qx = sx + (ex - sx) * q, qy = sy + (ey - sy) * q;
      g.strokeStyle = rgba(gold, .62); g.lineWidth = 1.15; g.beginPath(); g.moveTo(sx, sy); g.lineTo(qx, qy); g.stroke();
      if (q < 1) { g.fillStyle = 'rgba(255,240,205,.9)'; g.beginPath(); g.arc(qx, qy, 1.5, 0, TAU); g.fill(); }   // the pen point
      const lq = clamp((n - ignT(f, f.dep[a])) / (ignT(f, f.dep[b]) - ignT(f, f.dep[a]))) * q;
      if (lq > 0) {
        const kx = sx + (ex - sx) * lq, ky = sy + (ey - sy) * lq;
        g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba([255, 222, 150], .55 + .3 * sw + .2 * dawn); g.lineWidth = 1.3 + .5 * sw;
        g.beginPath(); g.moveTo(sx, sy); g.lineTo(kx, ky); g.stroke();
        if (lq < 1) { g.fillStyle = 'rgba(255,246,220,.95)'; g.beginPath(); g.arc(kx, ky, 2, 0, TAU); g.fill(); }
        g.restore();
      }
    }
    // the kite string — a fine dashed thread
    if (f.bridge) {
      const q = clamp((n - (f.tDraw + .6)) / .45);
      if (q > 0) {
        const [ax, ay] = P[f.bridge[0]], [bx, by] = P[f.bridge[1]], cx = (ax + bx) / 2 + 26, cy = (ay + by) / 2 + 22;
        g.save(); g.setLineDash([3, 4]); g.strokeStyle = rgba(gold, .45 + .2 * ease(ig)); g.lineWidth = .9; g.beginPath(); g.moveTo(ax, ay);
        for (let i = 1; i <= 24 * q; i++) { const t = i / 24; g.lineTo((1 - t) * (1 - t) * ax + 2 * t * (1 - t) * cx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * t * (1 - t) * cy + t * t * by); }
        g.stroke(); g.restore();
      }
    }
    g.restore();
    // 3) stars: chart rings first (unlit), then each kindles its own light
    f.stars.forEach((s, i) => {
      const ap = starIn(f, i, n); if (ap <= 0) return;
      const [x, y] = P[i], r = RAD[s[2]];
      const lit = clamp((n - ignT(f, f.dep[i])) / .22);
      g.strokeStyle = rgba(mixc(GOLD_L, [255, 226, 150], dawn), .85 * ap); g.lineWidth = 1.05;
      g.beginPath(); g.arc(x, y, (r + 1.2) * easeBack(ap), 0, TAU); g.stroke();
      if (lit <= 0) { g.fillStyle = rgba([240, 228, 200], .5 * ap); g.beginPath(); g.arc(x, y, .9, 0, TAU); g.fill(); return; }
      const front = dawn > 0 ? Math.exp(-Math.pow((y - E.front) / 70, 2)) : 0;     // the rising light passes over each star
      const tw = .82 + .18 * Math.sin(n * (2.2 + f.ph[i] * 2) + f.ph[i] * 9) + .2 * dawn * Math.max(0, Math.sin(n * 3.1 - y * .012 + f.ph[i] * 2)) + 1.1 * front;
      const kick = bump(n, ignT(f, f.dep[i]), .5);                // kindling overshoot
      g.fillStyle = rgba([255, 248, 226], lit); g.beginPath(); g.arc(x, y, r * .85 * ease(lit), 0, TAU); g.fill();
      glint(g, x, y, (2.6 + 1.75 * (6 - s[2])) * (lit * tw + .5 * kick + .28 * sw), .95 * lit, [255, 236, 196]);
    });
    // α beside the heart star (Bayer letter, like a real atlas)
    const ha = starIn(f, f.heart, n - .25);
    if (ha > 0) { const [x, y] = P[f.heart]; g.save(); g.font = 'italic 500 17px Cormorant'; g.fillStyle = rgba(GOLD_L, .75 * ha); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('α', x + 8, y - 9); g.restore(); }
    // 4) the Latin name, set letter by letter
    const la = clamp((d - .7) / .6);
    if (la > 0) {
      g.save(); g.font = '600 13px Cinzel'; g.letterSpacing = '4px'; g.direction = 'ltr'; g.textBaseline = 'middle'; g.textAlign = 'left';
      const full = f.lat, wd = g.measureText(full).width - 4, k = Math.ceil(full.length * la);
      g.fillStyle = rgba(mixc(GOLD_L, [255, 222, 150], dawn), .82); g.fillText(full.slice(0, k), f.lab[0] - wd / 2, f.lab[1]);
      g.strokeStyle = rgba(GOLD_L, .35 * la); g.lineWidth = .8; const rw = (wd / 2 + 10) * easeOut(la);
      g.beginPath(); g.moveTo(f.lab[0] - rw, f.lab[1] - 13); g.lineTo(f.lab[0] + rw, f.lab[1] - 13); g.stroke();
      g.restore();
    }
  }

  // ---------------------------------------------------------------- planisphere graticule round Pluto
  function graticule(g, n, a) {
    if (a <= 0) return;
    g.save(); g.strokeStyle = rgba(GOLD_L, .14 * a); g.lineWidth = .9; g.setLineDash([2, 6]);
    [250, 392, 545, 720].forEach((R, i) => { const q = easeOut((n - 47.85 - i * .12) / .7); if (q <= 0) return; g.beginPath(); g.arc(PCX, PCY, R, -Math.PI / 2, -Math.PI / 2 - TAU * q, true); g.stroke(); });
    g.setLineDash([]); g.strokeStyle = rgba(GOLD_L, .06 * a);
    for (let i = 0; i < 12; i++) { const q = easeOut((n - 48.0 - i * .04) / .6); if (q <= 0) continue; const an = -Math.PI / 2 - i * TAU / 12, r0 = 205, r1 = r0 + 700 * q;
      g.beginPath(); g.moveTo(PCX + Math.cos(an) * r0, PCY + Math.sin(an) * r0); g.lineTo(PCX + Math.cos(an) * r1, PCY + Math.sin(an) * r1); g.stroke(); }
    g.restore();
  }

  // ---------------------------------------------------------------- the dawn: an engraved sun rising at the foot of the plate
  function dawnLayer(g, n, dawn) {
    if (dawn <= 0) return;
    const W2 = PAGE.IW, H2 = PAGE.IH;
    const top = H2 - (240 + 560 * ease(dawn));
    let gr = g.createLinearGradient(0, H2, 0, top); gr.addColorStop(0, `rgba(232,170,96,${.52 * dawn})`); gr.addColorStop(.3, `rgba(200,146,108,${.26 * dawn})`); gr.addColorStop(.65, `rgba(120,110,130,${.1 * dawn})`); gr.addColorStop(1, 'rgba(90,90,140,0)');
    g.fillStyle = gr; g.fillRect(0, top, W2, H2 - top);
    g.save(); g.globalCompositeOperation = 'lighter';
    gr = g.createLinearGradient(0, H2, 0, H2 - 360); gr.addColorStop(0, `rgba(255,190,110,${.3 * dawn})`); gr.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = gr; g.fillRect(0, H2 - 360, W2, 360);
    // the rising sun (only its upper limb clears the edge of the plate)
    const sun = win(n, 53.05, 53.65), rise = win(n, 53.2, 54.45), R = 620, cy = H2 + R - 16 - 78 * rise, cx = PCX;
    const ra = win(n, 53.35, 54.4);
    if (ra > 0) {                                                  // short engraved rays round the limb
      for (let i = 0; i < 56; i++) {
        const an = -Math.PI / 2 + (i - 27.5) * .0185, long = i % 2 ? .45 : 1, L = (30 + 120 * long * (.7 + .3 * Math.sin(i * 2.7))) * ease(ra);
        const x0 = cx + Math.cos(an) * (R + 12), y0 = cy + Math.sin(an) * (R + 12), x1 = cx + Math.cos(an) * (R + 12 + L), y1 = cy + Math.sin(an) * (R + 12 + L);
        const lg = g.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, `rgba(255,220,150,${.26 * ra})`); lg.addColorStop(1, 'rgba(255,214,140,0)');
        g.strokeStyle = lg; g.lineWidth = long > .9 ? 1 : .7; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
    }
    g.restore();
    if (sun > 0) {
      g.save(); g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.clip();
      gr = g.createRadialGradient(cx, cy - R, 10, cx, cy - R * .6, R * .9); gr.addColorStop(0, `rgba(255,246,214,${sun})`); gr.addColorStop(.5, `rgba(252,214,140,${sun})`); gr.addColorStop(1, `rgba(236,160,80,${sun})`);
      g.fillStyle = gr; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      g.strokeStyle = `rgba(190,120,50,${.35 * sun})`; g.lineWidth = .8;                       // engraved horizontal hatching
      for (let y = cy - R + 8; y < H2; y += 5) { g.beginPath(); g.moveTo(cx - R, y); g.lineTo(cx + R, y); g.stroke(); }
      g.restore();
      g.strokeStyle = `rgba(170,110,40,${.8 * sun})`; g.lineWidth = 1.4; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
      g.strokeStyle = rgba(GOLD_L, .7 * sun); g.lineWidth = .8; g.beginPath(); g.arc(cx, cy, R + 6, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
    }
  }

  // ---------------------------------------------------------------- the comet spiral-in (transition from page 5)
  const TW = 1.1, FE = .35, F0 = .45, AF = TAU + TW * 1.36 + FE + F0, EX = 820, EY = 470;
  const vAt = n => { const u = clamp((n - T0) / (T1 - T0)); return 1 - Math.pow(1 - u, 1.4); };
  const rhoH = v => 1.08 * Math.pow(Math.max(0, 1 - v), 1.25);
  const headXY = v => { const A = AF * v, r = rhoH(v); return [PCX + EX * r * Math.cos(A), PCY - EY * r * Math.sin(A)]; };
  const headR = v => 26 + (PR - 26) * Math.pow(v, 2.2);
  const MW = 360, MH = 203, MC = canvas(MW, MH), MX = MC.getContext('2d'), MD = MX.createImageData(MW, MH);
  const TMP6 = canvas(PAGE.IW, PAGE.IH), T6 = TMP6.getContext('2d');
  function wipeMask(v) {
    const A = AF * v, rh = rhoH(v), D = MD.data;
    for (let j = 0; j < MH; j++) {
      const dy = -((j + .5) * PAGE.IH / MH - PCY) / EY;
      for (let i = 0; i < MW; i++) {
        const dx = ((i + .5) * PAGE.IW / MW - PCX) / EX, rho = Math.hypot(dx, dy);
        let a = Math.atan2(dy, dx); if (a < 0) a += TAU;
        const Ae = A - TW * Math.abs(rho - rh);
        const al = Math.max(clamp((Ae - a) / FE) * sstep(0, F0, a), clamp((Ae - TAU - a) / FE));
        const k = (j * MW + i) * 4; D[k] = D[k + 1] = D[k + 2] = 255; D[k + 3] = al * 255;
      }
    }
    MX.putImageData(MD, 0, 0);
  }
  function cometTail(g, v, fade) {
    if (fade <= 0) return;
    const v0 = Math.max(0, v - .3), N = 40, pts = [];
    for (let i = 0; i <= N; i++) { const vv = v0 + (v - v0) * i / N; pts.push([...headXY(vv), headR(vv)]); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    // engraved striae (golden dust + a few blue ion streamers, as on page 5), fading toward the far end
    const [ex, ey] = pts[0], [hx, hy] = pts[N];
    for (let s = -5; s <= 5; s++) {
      const ion = s === -4 || s === 3 || s === 5, h = hash2(s + 9, 41);
      g.beginPath();
      for (let i = 0; i <= N; i++) { const t = i / N, [x, y, r] = pts[i], [xa, ya] = pts[Math.max(0, i - 1)], [xb, yb] = pts[Math.min(N, i + 1)];
        let nx = -(yb - ya), ny = xb - xa; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl; const off = s * r * .17 * Math.pow(t, .7) * (ion ? 1.25 : 1);
        if (i === 0) g.moveTo(x + nx * off, y + ny * off); else g.lineTo(x + nx * off, y + ny * off); }
      const gr = g.createLinearGradient(hx, hy, ex, ey), a = (.5 - Math.abs(s) * .055) * (.7 + .3 * h) * fade, col = ion ? [150, 198, 255] : [255, 214, 150];
      gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.6, rgba(col, a * .5)); gr.addColorStop(1, rgba(col, 0));
      g.strokeStyle = gr; g.lineWidth = s === 0 ? 1.5 : .6 + .5 * h; g.stroke();
    }
    g.restore();
  }
  function wipeEdge(g, v, a) {                                       // a fine gold line along the advancing edge of the light
    if (a <= 0) return;
    const A = AF * v, rh = rhoH(v);
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const side of [-1, 1]) {
      let px = null, py = null;
      for (let i = 0; i <= 50; i++) {
        const rho = rh + side * i * .03; if (rho < 0) break;
        const an = A - TW * Math.abs(rho - rh); if (an < 0 || an > TAU) { px = null; continue; }
        const x = PCX + EX * rho * Math.cos(an), y = PCY - EY * rho * Math.sin(an);
        if (px !== null) { g.strokeStyle = `rgba(255,226,170,${.55 * a * Math.exp(-i * .07)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(px, py); g.lineTo(x, y); g.stroke(); }
        px = x; py = y;
      }
    }
    g.restore();
  }

  // ---------------------------------------------------------------- Pluto
  function drawHero(g, n, E) {
    const v = vAt(n), landed = n >= T1;
    let x = PCX, y = PCY, r = PR;
    if (!landed) { [x, y] = headXY(v); r = headR(v); }
    const settle = win(n, T1, T1 + .5);
    y += 3.5 * Math.sin((n - T1) * 1.25) * settle;
    // turns to face the reader, then a small bow on "יודע"
    const spin = 3.0 * (1 - ease((n - T0) / 1.3));
    const bow = bump(n, 47.6, .66);
    y += 12 * bow;
    // gaze: to each constellation as it is drawn / lit, back to the reader on "ילדים"
    let lk = [0, .9 * bow];
    const lookTo = (t, f, w) => { const k = pulse(n, t, t + .25, t + w, t + w + .3); lk = [lerp(lk[0], f.look[0], k), lerp(lk[1], f.look[1], k)]; };
    lookTo(48.15, FIGS[0], .2); lookTo(48.45, FIGS[1], .2); lookTo(48.77, FIGS[2], .15);
    lookTo(50.2, FIGS[0], .12); lookTo(50.52, FIGS[1], .22); lookTo(50.94, FIGS[2], .08); lookTo(51.2, FIGS[3], .25);
    const smile = .55 + .12 * win(n, 47.6, 48.1) + .1 * win(n, 49.0, 49.6) + .1 * win(n, 50.2, 51.4) + .08 * E.dawn;
    // light: a warm key from the upper left; the children's own light flickers on him as each one ignites; then the dawn from below
    let l2 = null, kk = 0, dir = [0, 0];
    for (const f of FIGS) { const b = bump(n, f.tIgn, .9); if (b > kk) { kk = b; const dx = f.ax - PCX, dy = f.ay - 60 - PCY, dl = Math.hypot(dx, dy); dir = [dx / dl * .85, dy / dl * .85]; } }
    kk = Math.max(kk * .62, swell(n) * .3);
    if (kk > .01) l2 = { dir, col: [255, 222, 170], k: kk };
    if (E.dawn > .01) l2 = { dir: [0, .9], col: [255, 186, 110], k: 1.05 * E.dawn };
    const flight = 1 - win(n, T0 + .35, T1 + .25);
    drawPluto(g, x, y, r, {
      spin, light: [-.62, -.44], lightCol: [1, .95, .86], amb: .88 - .1 * E.dawn,
      light2: l2, glow: .22 + .6 * flight + .25 * E.dawn, gold: .14 * flight + .1 * E.dawn, atm: 1,
      face: { smile, open: 1 - .3 * bow - .38 * win(n, 53.55, 54.15), sad: 0, brow: 0, look: lk, y: .02 + .15 * bow },   // a happy squint in the sunrise
    });
  }

  // ---------------------------------------------------------------- margin note (ink on the paper): stars shine by their own light
  function marginNote(p, n) {
    const a = win(n, 50.3, 50.9); if (a <= 0) return;
    const x = 120, y = 806, lit = win(n, 51.2, 51.6);
    p.save(); p.globalAlpha = a;
    p.strokeStyle = 'rgba(58,38,24,.85)'; p.lineWidth = 1.1; p.beginPath(); p.arc(x, y, 6.5, 0, TAU); p.stroke();
    if (lit > 0) { p.fillStyle = rgba(GOLD, .9 * lit); p.beginPath(); p.arc(x, y, 5, 0, TAU); p.fill();
      p.strokeStyle = rgba(GOLD, .9 * lit); p.lineWidth = 1; for (let i = 0; i < 8; i++) { const an = i * TAU / 8, l0 = 9, l1 = 9 + (i % 2 ? 4 : 8) * lit; p.beginPath(); p.moveTo(x + Math.cos(an) * l0, y + Math.sin(an) * l0); p.lineTo(x + Math.cos(an) * l1, y + Math.sin(an) * l1); p.stroke(); } }
    p.fillStyle = 'rgba(70,48,30,.9)'; p.textAlign = 'center'; p.textBaseline = 'middle'; p.direction = 'ltr';
    p.font = 'italic 500 19px Cormorant'; p.fillText('stella', x, y + 30); p.fillText('sua luce lucet.', x, y + 52);
    p.font = 'italic 500 15px Cormorant'; p.fillStyle = 'rgba(110,80,50,.85)'; p.fillText('fig. VI.', x, y + 78);
    p.restore();
  }
  function caption(p, s, a) {
    if (!s || a <= 0) return; const { IX, IY, IW, IH } = PAGE;
    p.save(); p.globalAlpha = a; p.textBaseline = 'middle'; p.fillStyle = rgba(SEPIA);
    if (s.plate) {
      p.font = '500 17px Cinzel'; p.letterSpacing = '5px'; p.textAlign = 'left'; p.direction = 'ltr'; p.fillText(s.plate.lat || '', IX - 13, IY + IH + 34);
      p.letterSpacing = '0px'; p.font = 'italic 500 22px Cormorant'; p.textAlign = 'right'; p.direction = 'rtl'; p.fillText(s.plate.he || '', IX + IW + 13, IY + IH + 34);
    }
    p.fillStyle = rgba(SEPIA, .9);
    if (s.folio) { p.font = 'italic 500 24px Cormorant'; p.textAlign = 'center'; p.direction = 'ltr'; p.fillText(`— ${s.folio} —`, W / 2, 1046); }
    p.restore();
  }
  const OV = canvas(W, H), OG = OV.getContext('2d');

  // ---------------------------------------------------------------- the page
  SCENE({
    id: 's6', start: 46.25, trans: 'cut', tdur: .5, folio: 6,
    plate: { lat: 'TABVLA VI · STELLAE VOS ESTIS', he: 'אתם כוכבים' },
    ill(g, n, lt) {
      const dawn = win(n, 52.45, 54.35), E = { dawn, front: PAGE.IH + 80 - 1000 * win(n, 52.5, 54.4) };
      SPACE.draw(g, { t: n, cam: [.8, -.3], neb: .5, galx: .3, gpos: [.1, -.37], warm: .18 * dawn, gold: .3 * dawn, bright: 1 + .05 * dawn });
      STARS.draw(g, { t: n, cam: [.02, 0], dim: .6 - .25 * dawn });
      DUST.draw(g, { t: n, alpha: .5 + .3 * dawn, vy: -.006 - .01 * dawn });
      graticule(g, n, 1 - .7 * dawn);
      dawnLayer(g, n, dawn);
      for (const f of FIGS) drawFig(g, f, n, E);
      // the old page, wiped away by the comet's swirling tail
      if (n < T1) {
        const v = vAt(n), s5 = sceneById('s5');
        if (s5 && v < 1) {
          const old = renderIll('s5', n); wipeMask(v);
          T6.setTransform(1, 0, 0, 1, 0, 0); T6.globalCompositeOperation = 'source-over'; T6.globalAlpha = 1; T6.clearRect(0, 0, PAGE.IW, PAGE.IH);
          T6.drawImage(old, 0, 0); T6.globalCompositeOperation = 'destination-out'; T6.imageSmoothingQuality = 'high'; T6.drawImage(MC, 0, 0, PAGE.IW, PAGE.IH);
          g.drawImage(TMP6, 0, 0);
        }
        wipeEdge(g, v, 1 - win(n, T1 - .15, T1));
      }
      cometTail(g, vAt(n), 1 - win(n, T1 - .05, T1 + .5));
      drawHero(g, n, E);
    },
    over(p, n, lt) {
      // page 5's margin drawings and caption fade out under the cut; ours fade in
      const u = clamp((n - 46.25) / .6);
      if (u < 1) {
        const s5 = sceneById('s5');
        if (s5 && s5.over) {
          try { OG.setTransform(1, 0, 0, 1, 0, 0); OG.globalAlpha = 1; OG.clearRect(0, 0, W, H); OG.save(); s5.over(OG, n, n - s5.start); OG.restore();
            const { IX, IY, IW, IH } = PAGE;
            p.save(); p.globalAlpha = 1 - win(u, 0, .8); p.beginPath(); p.rect(0, 0, W, H); p.rect(IX, IY, IW, IH); p.clip('evenodd'); p.drawImage(OV, 0, 0); p.restore();
          } catch (e) { }
        }
        if (!NOBOOK) {
        const { IX, IY, IW, IH } = PAGE, cy = IY + IH + 34;
        p.save(); p.beginPath(); p.rect(IX - 20, cy - 15, IW + 40, 30); p.rect(W / 2 - 80, 1030, 160, 32); p.clip();
        p.drawImage(PAPER, 0, 0); drawTextLine(p, n); p.restore();
        caption(p, sceneById('s5'), 1 - win(u, 0, .45)); caption(p, this, win(u, .45, .95));
        }
      }
      marginNote(p, n);
    },
  });
})();
