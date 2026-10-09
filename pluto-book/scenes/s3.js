// ===================== s3: DECRETVM - the verdict (n 15.52 .. 25.00) =====================
// "ומהיום, מכובדי, פלוטו לא כוכב, מספיק ודי. / הוא לא בגודל המתאים, / הוא לא כבד מספיק, וקצת רזה, / וזה סופי, פלוטו הוא מתחזה."
// A portrait plate: Pluto above his walk-of-fame plaque, warm in the sun. In the margin the astronomer now sits as a
// tiny CENSOR behind his bench, his stamp raised. Everything that judges Pluto comes from the paper world, from the left:
// - "ומהיום": a giant ink-drawn stamp (his stamp, enlarged) hangs over the frame, its shadow on Pluto's brow; it slams
//   down with the censor's own little stamp. The plate jolts, frost puffs. The red flash flattens Pluto's face (shock);
//   as the stamp lifts away to the left its red light rakes across him and reveals the new face: sad. Ink: "מבוטל".
// - "מכובדי": the censor raises a finger. "פלוטו לא כוכב": a red ink X over the STAR on his plaque. "ודי": bang on the
//   bench - the plaque cracks.
// - three brass instruments, one at a time, each enters and leaves: a vernier caliper (he stands tall, the jaw snaps:
//   PARVVS), a balance (a single feather outweighs him - he floats up), a tailor's tape (cinched thinner).
// - "וזה סופי": a cold shadow sweeps across the sky, the sun's warmth goes out; final bang on the bench.
// - "מתחזה": a luggage tag drops from above, jerks on its string pinned to him, swings. He looks down.
(() => {
  const { IX, IY, IW: PW, IH: PH } = PAGE;
  // ---- word times (lines.json + the voice envelope for stressed syllables) ----
  const W_HON = 16.50, W_HEAVY = 20.74, W_THIN = 21.86, W_THIS = 22.64;
  const T_HIT = 15.93, T_X1 = 17.42, T_X2 = 17.70, T_DAI = 18.55, T_SNAP = 19.55, T_FEATH = 20.86, T_CINCH = 21.98, T_FIN = 23.10, T_TAG = 24.36;
  // ---- composition (plate px) ----
  const PX = 800, PY = 334, PR = 212;                      // Pluto
  const PQ = [800, 706], PQW = 290, PQS = .42;               // his plaque (perspective squash)
  const RD0 = 628, RD1 = 794;                                // promenade band
  const INKC = 'rgba(58,38,24,.95)';

  // keyframes: [[t, v], ...] (v number or array), smooth between keys
  const kf = (n, K) => {
    if (n <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (n < K[i][0]) {
      const a = K[i - 1], b = K[i], u = ease((n - a[0]) / (b[0] - a[0]));
      return Array.isArray(a[1]) ? a[1].map((v, j) => lerp(v, b[1][j], u)) : lerp(a[1], b[1], u);
    }
    return K[K.length - 1][1];
  };
  // a decaying knock (0 before t0)
  const knock = (n, t0, tau = .09, f = 46) => { const t = n - t0; return t < 0 || t > .6 ? 0 : Math.exp(-t / tau) * Math.cos(t * f); };

  // ---------------- timing ----------------
  // the giant stamp (rubber-bottom centre, plate coords) - see stampState()
  const calA = n => pulse(n, 19.08, 19.30, 20.34, 20.60);              // caliper presence
  const scaleA = n => pulse(n, 20.40, 20.62, 21.36, 21.62);            // balance presence
  const tapeA = n => pulse(n, 21.40, 21.56, 23.40, 23.78);             // tape presence
  const cinch = n => win(n, T_CINCH - .14, T_CINCH + .06) * (1 - win(n, 23.36, 23.66));
  const cold = n => win(n, W_THIS - .02, 23.02);                       // the shadow passes, the sun's warmth goes out
  const sweepX = n => lerp(PW + 420, -520, ease((n - (W_THIS + .02)) / .55));   // edge of the passing shadow

  // balance: beam angle (+ = Pluto's side down)
  const SC = { piv: [462, 70], arm: 338 }, TH0 = .05;
  function beamAng(n) {
    const k = clamp((n - (T_FEATH - .1)) / .3);
    let a = lerp(TH0, -.13, easeBack(k));
    const t = n - (T_FEATH + .2); if (t > 0) a += .02 * Math.exp(-t * 5) * Math.sin(t * 17);
    return a;
  }
  const rise = n => SC.arm * (Math.sin(beamAng(n)) - Math.sin(TH0)) * scaleA(n);

  function plutoPos(n) {
    let y = PY + 3 * Math.sin(n * .9 + 1) * (1 - .7 * win(n, 16.2, 17.2));
    y += 7 * pulse(n, T_HIT, T_HIT + .05, 16.12, 16.5);                   // pressed down by the stamp
    y -= 7 * pulse(n, 19.26, 19.42, 19.46, 19.62);                         // he stands tall for the caliper
    y += rise(n);
    y += 5 * cinch(n);
    return [PX, y];
  }
  function squash(n) {
    const e = knock(n, T_HIT, .11, 30), e2 = .25 * (knock(n, T_DAI, .08, 40) + knock(n, T_FIN, .08, 40));
    let sx = 1 + .07 * e + .02 * e2, sy = 1 - .09 * e - .03 * e2;
    const tall = pulse(n, 19.26, 19.42, 19.48, T_SNAP + .06); sy *= 1 + .055 * tall; sx *= 1 - .012 * tall;
    sx *= 1 - .022 * win(n, T_SNAP - .06, T_SNAP + .06) * (1 - win(n, 20.3, 20.6));
    const c = cinch(n); sx *= 1 - .15 * c; sy *= 1 + .045 * c;
    const rt = n - 23.52; if (rt > 0 && rt < .9) { const w = .035 * Math.exp(-rt * 4.5) * Math.sin(rt * 20); sx *= 1 + w; sy *= 1 - w; }
    return [sx, sy];
  }
  // plate shake: only the stamp knocks
  function shake(n) {
    const a = 7 * knock(n, T_HIT) + 2.4 * knock(n, T_DAI) + 2.4 * knock(n, T_FIN);
    const b = 2.2 * knock(n, T_HIT, .09, 37);
    return [b, a];
  }
  // slow push-in on Pluto over the page
  const zoomK = n => 1 + .035 * ease((n - 15.6) / 9.4);
  function xf(g, n) {
    const [dx, dy] = shake(n), k = zoomK(n), [cx, cy] = [PX, PY + 40];
    g.translate(dx, dy); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
  }

  // ---------------- the giant stamp ----------------
  const MK = { y: -.645, s: .27, rot: -.13 };                // the ink mark on Pluto (relative to his centre, r units)
  const SS = 1.32;                                            // stamp tool scale (rubber = 220 * SS px)
  function stampState(n) {
    if (n < 15.5 || n > 16.66) return null;
    const [px, py] = plutoPos(Math.min(n, T_HIT)), hx = px, hy = py + MK.y * PR + 40;      // rubber covers the mark at impact
    const hover = [hx + 24, 70], up = [hx + 16, 38];
    let x, y, rot;
    if (n < 15.78) { const u = easeOut(clamp((n - 15.5) / .28)); x = hover[0]; y = lerp(-330, hover[1], u) + 2 * Math.sin(n * 9); rot = .07; }
    else if (n < 15.865) { const u = ease((n - 15.78) / .085); x = lerp(hover[0], up[0], u); y = lerp(hover[1], up[1], u); rot = lerp(.07, .1, u); }
    else if (n < T_HIT) { const u = easeIn((n - 15.865) / (T_HIT - 15.865)); x = lerp(up[0], hx, u); y = lerp(up[1], hy, u); rot = lerp(.1, MK.rot, u); }
    else if (n < 16.14) { x = hx; y = hy + 4 * knock(n, T_HIT, .05, 60); rot = MK.rot; }
    else {
      const u1 = easeOut(clamp((n - 16.14) / .18)), u2 = easeIn(clamp((n - 16.28) / .38));
      x = hx - 10 * u1 - 820 * u2; y = hy - 105 * u1 - 520 * u2; rot = MK.rot - .08 * u1 - .5 * u2;
    }
    return { x, y, rot };
  }
  // the stamp as an ink illustration (paper world): origin = centre of the rubber's bottom edge
  function inkStamp(p, x, y, s, rot, shadow = 0) {
    p.save(); p.translate(x, y); p.rotate(rot); p.scale(s, s);
    p.lineJoin = 'round'; p.lineCap = 'round'; p.strokeStyle = INKC; p.lineWidth = 1.6;
    const sil = () => { p.beginPath(); p.roundRect(-110, -18, 220, 18, 3); p.roundRect(-100, -62, 200, 46, 9); p.rect(-16, -116, 32, 58); p.arc(0, -142, 32, 0, 7); };
    if (shadow) { p.save(); p.shadowColor = `rgba(8,6,20,${.45 * shadow})`; p.shadowBlur = 22; p.shadowOffsetX = 10; p.shadowOffsetY = 14; p.fillStyle = 'rgb(214,170,112)'; sil(); p.fill(); p.restore(); }
    // knob
    let gr = p.createRadialGradient(-12, -152, 4, 0, -142, 34); gr.addColorStop(0, '#f2cf97'); gr.addColorStop(1, '#b07a42');
    p.fillStyle = gr; p.beginPath(); p.arc(0, -142, 32, 0, 7); p.fill(); p.stroke();
    p.save(); p.lineWidth = .9; p.globalAlpha = .55; for (let i = 0; i < 6; i++) { p.beginPath(); p.arc(0, -142, 32 - 3.2 * i, -.15, 1.25); p.stroke(); } p.restore();
    // neck + collar
    gr = p.createLinearGradient(-16, 0, 16, 0); gr.addColorStop(0, '#d9a868'); gr.addColorStop(1, '#8a5a2c');
    p.fillStyle = gr; p.beginPath(); p.rect(-16, -116, 32, 56); p.fill(); p.stroke();
    p.fillStyle = '#c99652'; p.beginPath(); p.roundRect(-24, -70, 48, 10, 3); p.fill(); p.stroke();
    // wooden block with grain + hatching on the shadow side
    gr = p.createLinearGradient(0, -62, 0, -16); gr.addColorStop(0, '#e8bd80'); gr.addColorStop(1, '#a87038');
    p.fillStyle = gr; p.beginPath(); p.roundRect(-100, -62, 200, 46, 9); p.fill(); p.stroke();
    p.save(); p.lineWidth = .8; p.globalAlpha = .45;
    for (const yy of [-52, -43, -33, -25]) { p.beginPath(); p.moveTo(-88, yy); p.bezierCurveTo(-40, yy - 4, 10, yy + 4, 88, yy - 1); p.stroke(); }
    p.globalAlpha = .6; for (let xx = 52; xx < 98; xx += 5) { p.beginPath(); p.moveTo(xx, -58); p.lineTo(xx + 4, -20); p.stroke(); }
    p.restore();
    // red rubber
    p.fillStyle = '#c8323d'; p.beginPath(); p.roundRect(-110, -18, 220, 18, 3); p.fill(); p.stroke();
    p.save(); p.lineWidth = .7; p.globalAlpha = .5; for (let xx = -104; xx < 106; xx += 6) { p.beginPath(); p.moveTo(xx, -15); p.lineTo(xx + 3, -3); p.stroke(); } p.restore();
    p.restore();
  }

  // ---------------- Pluto: acting (relief only) + light ----------------
  function plutoOpts(n) {
    const look = kf(n, [[15.5, [.15, -.05]], [15.72, [.15, -.05]], [15.84, [-.05, -.95]], [T_HIT, [0, -.5]], [16.2, [0, .1]], [16.44, [-.6, .4]], [16.62, [-1, .28]],
      [17.1, [-1, .28]], [17.32, [-.1, 1]], [18.3, [-.1, 1]], [18.62, [-.15, .7]], [19.12, [-.2, .55]], [19.3, [.12, -.9]], [T_SNAP, [.12, -.85]], [19.78, [.75, .75]],
      [20.5, [.75, .75]], [20.72, [-1, .3]], [21.3, [-1, .45]], [21.5, [.05, -.9]], [21.8, [0, -.4]], [22.0, [.5, .6]], [22.6, [.4, .7]], [23.0, [.05, .9]],
      [24.12, [.05, .9]], [24.3, [.6, -.2]], [24.5, [.4, 1]]]);
    const O = .95 * pulse(n, 15.84, T_HIT, 16.12, 16.36) + .38 * pulse(n, T_SNAP - .02, T_SNAP + .06, 19.7, 19.9) + .45 * pulse(n, T_CINCH - .08, T_CINCH + .02, 22.2, 22.42)
      + .3 * pulse(n, T_FEATH + .05, T_FEATH + .15, 21.0, 21.2);
    const face = {
      smile: kf(n, [[15.5, .4], [15.76, .4], [15.9, .1], [T_HIT, 0], [16.14, 0], [16.42, -.55], [17.6, -.6], [19.2, -.45], [19.42, .08], [T_SNAP, .02], [19.8, -.35],
        [20.7, -.35], [21.0, -.15], [21.3, -.3], [22.6, -.4], [23.05, -.62], [24.2, -.62], [24.5, -.75]]),
      sad: kf(n, [[15.5, 0], [16.14, 0], [16.44, .75], [17.0, .62], [17.6, .85], [19.2, .6], [19.4, .12], [T_SNAP, .2], [19.85, .62], [22.6, .6], [23.05, .85], [24.3, .85], [24.55, 1]]),
      brow: kf(n, [[15.5, .06], [15.74, .06], [15.9, .5], [T_HIT, .85], [16.4, .7], [19.2, .62], [19.42, .2], [T_SNAP, .5], [19.8, .6], [22.6, .66], [23.05, .85], [24.4, .95]]),
      O, look, relief: 1 + .25 * cold(n),
      open: Math.max(.25, kf(n, [[15.5, 1], [24.3, 1], [24.55, .62]]) - .7 * bump(n, T_DAI - .03, .26) - .85 * bump(n, 17.98, .16) - .85 * bump(n, 22.9, .18)),
    };
    // light: warm sun (upper right) -> the red of the stamp (flash head-on, then raking from the left as it leaves)
    //        -> cooler, dimmer -> the passing shadow takes the warmth away
    const flash = n >= T_HIT ? Math.exp(-(n - T_HIT) / .09) : 0;
    const sw = win(n, 16.08, 16.56);
    const redK = 1.25 * flash + .75 * pulse(n, 16.0, 16.18, 16.62, 17.5) + .2 * pulse(n, 16.4, 16.9, 18.6, 19.6);
    const l2 = { dir: [lerp(.06, -.88, sw), lerp(-.22, -.12, sw)], col: [250, 70, 78], k: redK };
    const c = cold(n), aft = win(n, T_HIT, 16.8);
    const approach = n < T_HIT ? win(n, 15.62, T_HIT) : 0;
    return {
      spin: -.1 * look[0] + .02 * Math.sin(n * .6),
      light: [lerp(lerp(.62, .84, aft), .9, c), lerp(lerp(-.5, -.3, aft), -.22, c)],
      lightCol: mixc(mixc([1.08, .98, .85], [.98, .97, 1.04], aft), [.7, .76, .9], c),
      amb: lerp(lerp(1, .72, aft), .5, c) - .35 * flash - .12 * approach,
      light2: l2,
      glow: .26 * (1 - win(n, 15.86, T_HIT)) + .04 * Math.sin(n * 2.1) * (1 - aft),
      gray: .2 * c, atm: lerp(1, .75, c),
      squash: squash(n), face,
    };
  }

  // on his surface (drawn over him, clipped to his disc): the stamp's shadow as it approaches, then the ink on his brow
  // (multiplied into his lit surface, so it takes his light and shade)
  function surface(g, n, pp, sq) {
    const sh = n < T_HIT ? win(n, 15.5, T_HIT) : 0, inkOn = n >= T_HIT;
    if (!sh && !inkOn) return;
    const st = stampState(n), r = PR;
    g.save(); g.translate(pp[0], pp[1]); g.scale(sq[0], sq[1]); g.beginPath(); g.arc(0, 0, r - .6, 0, 7); g.clip();
    if (sh > 0 && st) {
      const d = clamp((st.y - (pp[1] + MK.y * PR)) / -300);
      const sx = st.x - pp[0] - 30 * d, sy = MK.y * r + 10 + 40 * d, R = r * (.55 + .5 * d);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, R);
      gr.addColorStop(0, `rgba(10,8,24,${.78 * sh * (1 - .35 * d)})`); gr.addColorStop(.55, `rgba(10,8,24,${.42 * sh * (1 - .35 * d)})`); gr.addColorStop(1, 'rgba(10,8,24,0)');
      g.fillStyle = gr; g.save(); g.translate(sx, sy); g.scale(1.25, .62); g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.restore();
    }
    if (inkOn) {
      g.globalCompositeOperation = 'multiply';
      g.translate(0, MK.y * r); g.scale(1, .86);
      drawStampMark(g, 0, 0, MK.s, MK.rot, .96);
    }
    g.restore();
  }

  // ---------------- space as crew: the sun's warmth (upper right) and the dark cloud that swallows it ----------------
  let CLOUD = null, RIM = null;
  function cloudTex() {
    if (CLOUD) return CLOUD;
    const w = 360, h = 240; CLOUD = canvas(w, h); RIM = canvas(w, h); const x = CLOUD.getContext('2d'), id = x.createImageData(w, h), d = id.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = i / w, v = j / h, f = fbm2(u * 4.2 + 3, v * 3.2 + 1, 5), r = Math.hypot((u - .55) / .55, (v - .45) / .5);
      const a = clamp((f - .36) / .2) * clamp((1.05 - r) / .45);
      const k = (j * w + i) * 4; d[k] = 6 + 10 * f; d[k + 1] = 8 + 10 * f; d[k + 2] = 22 + 16 * f; d[k + 3] = 255 * a * .92;
    }
    x.putImageData(id, 0, 0);
    const rx = RIM.getContext('2d'); rx.drawImage(CLOUD, 0, 0); rx.globalCompositeOperation = 'source-in'; rx.fillStyle = 'rgb(255,190,120)'; rx.fillRect(0, 0, w, h);
    return CLOUD;
  }
  const cloudX = n => lerp(PW + 120, 640, easeOut(clamp((n - (W_THIS - .25)) / .75))) - 18 * Math.max(0, n - W_THIS);
  function sunAndCloud(g, n) {
    const warmA = (1 - .7 * win(n, 15.9, 16.4)) * (1 - cold(n));
    if (warmA > .01) {
      g.save(); g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(PW + 60, -80, 0, PW + 60, -80, 820);
      gr.addColorStop(0, `rgba(255,196,128,${.16 * warmA})`); gr.addColorStop(.5, `rgba(255,170,110,${.05 * warmA})`); gr.addColorStop(1, 'rgba(255,170,110,0)');
      g.fillStyle = gr; g.fillRect(PW - 900, -60, 960, 900); g.restore();
    }
    if (n > W_THIS - .3) {
      const cx = cloudX(n), T = cloudTex(); g.save(); g.imageSmoothingQuality = 'high';
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = .22; g.drawImage(RIM, cx + 7, -157, 1000, 680);   // its sunlit edge
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.drawImage(T, cx, -150, 1000, 680); g.restore();
    }
  }

  // ---------------- the set: promenade + plaque ----------------
  function promenade(g, n, dim) {
    g.save();
    let gr = g.createLinearGradient(0, RD0, 0, RD1); gr.addColorStop(0, 'rgba(26,36,74,.5)'); gr.addColorStop(1, 'rgba(12,18,40,.78)');
    g.fillStyle = gr; g.fillRect(-40, RD0, PW + 80, RD1 - RD0);
    g.strokeStyle = 'rgba(160,175,230,.09)'; g.lineWidth = 1;
    for (let x = PX - 1050; x <= PX + 1050; x += 150) { g.beginPath(); g.moveTo(x, RD0); g.lineTo(x + (x - PX) * .3, RD1); g.stroke(); }
    g.strokeStyle = rgba(GOLD_L, .7 * dim); g.lineWidth = 1.4; g.beginPath(); g.moveTo(-40, RD0); g.lineTo(PW + 40, RD0); g.moveTo(-40, RD1); g.lineTo(PW + 40, RD1); g.stroke();
    g.strokeStyle = rgba(GOLD_L, .28 * dim); g.lineWidth = .7; g.beginPath(); g.moveTo(-40, RD0 + 6); g.lineTo(PW + 40, RD0 + 6); g.stroke();
    for (let x = PX - 1050; x <= PX + 1050; x += 75) for (const [yy, k] of [[RD0, 0], [RD1, .3]]) {
      const sx = x + (x - PX) * k; if (sx < -10 || sx > PW + 10) continue;
      g.fillStyle = rgba(GOLD_L, (.5 + .3 * Math.sin(n * 1.7 + x * .03)) * dim); g.beginPath(); g.arc(sx, yy, 2, 0, 7); g.fill();
    }
    g.restore();
  }
  // a brushy ink stroke (tapered), drawn to progress k
  function inkStroke(g, x0, y0, x1, y1, w, k, col) {
    if (k <= 0) return; const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux, N = 14;
    const xe = x0 + (x1 - x0) * k, ye = y0 + (y1 - y0) * k;
    const top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, x = lerp(x0, xe, t), y = lerp(y0, ye, t), tt = t * k;
      const ww = w * (.35 + .65 * Math.sin(Math.PI * Math.min(1, tt * 1.15 + .08))) * (1 + .12 * Math.sin(tt * 23 + x0));
      top.push([x + nx * ww / 2, y + ny * ww / 2]); bot.push([x - nx * ww / 2, y - ny * ww / 2]);
    }
    g.beginPath(); top.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = bot.length - 1; i >= 0; i--) g.lineTo(bot[i][0], bot[i][1]); g.closePath();
    g.fillStyle = col; g.fill();
  }
  function plaque(g, n) {
    const pride = 1 - win(n, 15.9, 16.3), dimK = 1 - .35 * cold(n);
    const gold = .32 * pride + .12 * bump(n, 17.06, .5) * 0, glow = .55 * pride + .35 * bump(n, 17.04, .44);
    g.save(); g.globalAlpha = dimK + (1 - dimK) * .0;
    drawPlaque(g, PQ[0], PQ[1], PQW, { lat: 'PLVTO', he: 'פלוטו' }, { persp: PQS, gold, glow });
    g.restore();
    // in the plaque's own (perspective) frame: the red X over the STAR, the crack
    const h = PQW, sy = -h * .1, R = PQW * .36;
    g.save(); g.translate(PQ[0], PQ[1]); g.scale(1, PQS);
    // a glint on the star as his name is spoken
    const gl = bump(n, 17.04, .4); if (gl > 0) { g.save(); g.scale(1, 1 / PQS); glint(g, R * .2, (sy - R * .62) * PQS, 15 * gl, .9 * gl, [255, 236, 190]); g.restore(); }
    const red = 'rgba(214,44,52,.93)';
    inkStroke(g, R * .82, sy - R * .78, -R * .8, sy + R * .8, 21, easeOut(clamp((n - T_X1) / .11)), red);
    inkStroke(g, -R * .78, sy - R * .82, R * .84, sy + R * .76, 21, easeOut(clamp((n - T_X2) / .13)), red);
    // crack (a dark fissure with a bright chipped edge), runs down from the top through the star
    const ck = easeOut(clamp((n - T_DAI) / .08));
    if (ck > 0) {
      const P = [[-.02, -.5], [.05, -.33], [-.04, -.17], [.07, -.02], [-.03, .14], [.06, .3], [.01, .5]].map(([a, b]) => [a * PQW, b * h]);
      const m = 1 + Math.floor(ck * (P.length - 1));
      g.lineJoin = 'miter'; g.lineCap = 'round';
      for (const [col, lw, ox] of [['rgba(255,232,180,.7)', 1.6, 2.2], ['rgba(2,4,12,.95)', 3.2, 0]]) {
        g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let i = 0; i < m; i++) i ? g.lineTo(P[i][0] + ox, P[i][1]) : g.moveTo(P[i][0] + ox, P[i][1]); g.stroke();
      }
      g.strokeStyle = 'rgba(2,4,12,.85)'; g.lineWidth = 1.6;   // two side branches
      if (m > 3) { g.beginPath(); g.moveTo(P[2][0], P[2][1]); g.lineTo(P[2][0] - PQW * .1, P[2][1] + h * .06); g.lineTo(P[2][0] - PQW * .15, P[2][1] + h * .05); g.stroke(); }
      if (m > 5) { g.beginPath(); g.moveTo(P[4][0], P[4][1]); g.lineTo(P[4][0] + PQW * .12, P[4][1] + h * .05); g.stroke(); }
    }
    g.restore();
    // chips that jump out of the crack
    const cj = n - T_DAI; if (cj > 0 && cj < .5) {
      const r = mulberry(31); g.save();
      for (let i = 0; i < 9; i++) { const vx = (r() - .5) * 260, vy = -140 - r() * 160, x = PQ[0] + (r() - .5) * 30 + vx * cj, y = PQ[1] - 30 + vy * cj + 700 * cj * cj;
        g.fillStyle = `rgba(236,214,160,${.9 * (1 - cj / .5)})`; g.beginPath(); g.arc(x, y, 1 + r() * 1.6, 0, 7); g.fill(); }
      g.restore();
    }
  }

  // frost puffed from under the rubber at the impact
  function frost(g, n, px, py) {
    const t = n - T_HIT; if (t < 0 || t > .6) return;
    const r = mulberry(12), hy = py + MK.y * PR + 4;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, sp = 220 + r() * 380, ang = (r() * .5 - .1), dec = 1 - Math.exp(-t / .12);
      const x = px + side * (100 + r() * 30) + side * Math.cos(ang) * sp * .12 * dec, y = hy - 6 + r() * 14 - Math.sin(ang) * sp * .12 * dec + 18 * t * t;
      const a = (1 - t / .6) * (.35 + .5 * r());
      g.fillStyle = `rgba(226,236,255,${a})`; g.beginPath(); g.arc(x, y, .8 + r() * 1.8, 0, 7); g.fill();
    }
    g.restore();
  }

  // ---------------- instrument 1: the vernier caliper (gold line art) ----------------
  function caliper(g, n, pp, sq) {
    const a = calA(n); if (a <= 0) return;
    const oy = -260 * (1 - easeOut(clamp((n - 19.08) / .3))) - 300 * easeIn(clamp((n - 20.34) / .26));
    const top = pp[1] - PR * sq[1], y0 = top - 62 + oy, bh = 24;
    const XF = pp[0] + PR * sq[0] + 1;                                     // fixed jaw (right), inner face
    const xsOpen = pp[0] - PR - 150, xsShut = pp[0] - PR * sq[0] - 1;
    const XS = lerp(xsOpen, xsShut, easeBack(clamp((n - (T_SNAP - .14)) / .14)));
    const yTip = pp[1] + 8 + oy * .0, ytip = Math.min(yTip, y0 + 400);
    const L0 = XS - 250, L1 = XF + 70;
    g.save(); g.globalAlpha = a; g.lineJoin = 'round'; g.lineCap = 'round';
    const brass = (x0, y0b, x1, y1b) => { const gr = g.createLinearGradient(x0, y0b, x1, y1b); gr.addColorStop(0, 'rgba(248,222,150,.34)'); gr.addColorStop(.5, 'rgba(196,150,70,.20)'); gr.addColorStop(1, 'rgba(120,84,30,.30)'); return gr; };
    const line = (w, al = .95) => { g.strokeStyle = rgba(GOLD_L, al); g.lineWidth = w; };
    // beam
    g.fillStyle = brass(0, y0, 0, y0 + bh); g.beginPath(); g.rect(L0, y0, L1 - L0, bh); g.fill(); line(1.4); g.stroke();
    line(.7, .6); g.beginPath(); g.moveTo(L0 + 4, y0 + 5); g.lineTo(L1 - 4, y0 + 5); g.stroke();
    // main scale: 0 at the fixed jaw, counting leftward (thousands of km)
    g.fillStyle = rgba(GOLD_L, .85); g.font = 'italic 500 13px Cormorant'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.direction = 'ltr';
    for (let i = 0, x = XF; x > L0 + 8; i++, x -= 9.04) {
      const big = i % 10 === 0, mid = i % 5 === 0; line(big ? 1 : .7, big ? .95 : .7);
      g.beginPath(); g.moveTo(x, y0 + bh); g.lineTo(x, y0 + bh - (big ? 12 : mid ? 8 : 5)); g.stroke();
      if (big && i > 0) g.fillText(String(i / 10 * 500), x, y0 + 9 + 3);
    }
    // fixed jaw (long tapered blade) + small inside jaw above the beam
    const blade = (xi, s) => {
      g.fillStyle = brass(xi, 0, xi + s * 46, 0); g.beginPath();
      g.moveTo(xi, y0 + bh); g.lineTo(xi, ytip - 22); g.quadraticCurveTo(xi, ytip, xi - s * 2, ytip + 6); g.lineTo(xi + s * 10, ytip - 30); g.lineTo(xi + s * 44, y0 + bh + 20); g.lineTo(xi + s * 44, y0 + bh);
      g.closePath(); g.fill(); line(1.3); g.stroke();
      line(.6, .5); g.beginPath(); g.moveTo(xi + s * 5, y0 + bh + 6); g.lineTo(xi + s * 5, ytip - 40); g.stroke();
      g.fillStyle = brass(xi, 0, xi + s * 20, 0); g.beginPath(); g.moveTo(xi, y0); g.lineTo(xi, y0 - 30); g.lineTo(xi + s * 8, y0 - 30); g.lineTo(xi + s * 22, y0); g.closePath(); g.fill(); line(1.1); g.stroke();
    };
    blade(XF, 1);
    // sliding jaw with its vernier plate + thumb wheel
    blade(XS, -1);
    g.fillStyle = 'rgb(28,32,58)'; g.beginPath(); g.roundRect(XS - 92, y0 - 8, 92, bh + 16, 4); g.fill();
    g.fillStyle = brass(XS - 92, y0 - 8, XS, y0 + bh + 10); g.fill(); line(1.3); g.stroke();
    g.fillStyle = 'rgba(10,14,30,.55)'; g.beginPath(); g.rect(XS - 80, y0 + 2, 70, bh - 4); g.fill(); line(.7, .7); g.stroke();
    for (let i = 0; i <= 10; i++) { const x = XS - 12 - i * 5.8; line(.6, .85); g.beginPath(); g.moveTo(x, y0 + bh - 2); g.lineTo(x, y0 + bh - (i % 5 ? 7 : 11)); g.stroke(); }
    g.fillStyle = brass(0, y0 + bh + 8, 0, y0 + bh + 30); g.beginPath(); g.arc(XS - 46, y0 + bh + 18, 10, 0, 7); g.fill(); line(1.1); g.stroke();
    for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2 + XS * .05; g.beginPath(); g.moveTo(XS - 46 + Math.cos(an) * 6, y0 + bh + 18 + Math.sin(an) * 6); g.lineTo(XS - 46 + Math.cos(an) * 10, y0 + bh + 18 + Math.sin(an) * 10); g.stroke(); }
    // engraved maker's line on the beam
    // the snap: a glint where the jaw bites
    const gl = bump(n, T_SNAP - .02, .3); if (gl > 0) { glint(g, XS - 3, pp[1] - 4, 18 * gl, .9 * gl, [255, 240, 205]); glint(g, XF + 3, pp[1] + 6, 12 * gl, .7 * gl, [255, 240, 205]); }
    // the verdict, in the censor's red ink: PARVVS
    const pv = win(n, 19.86, 20.08);
    if (pv > 0) {
      const x = XF + 54, y = pp[1] - 34;
      g.save(); g.globalAlpha = a * pv; g.direction = 'ltr'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.strokeStyle = rgba(GOLD_L, .5); g.lineWidth = .8; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(XF + 8, pp[1] - 2); g.lineTo(x - 6, y + 10); g.stroke(); g.setLineDash([]);
      g.font = 'italic 500 17px Cormorant'; g.fillStyle = rgba(GOLD_L, .85); g.fillText('diam. 2377 km', x, y + 30);
      g.font = '600 25px Cinzel'; g.letterSpacing = '6px'; g.fillStyle = 'rgb(232,82,84)';
      const tw = g.measureText('PARVVS').width; g.save(); g.beginPath(); g.rect(x - 4, y - 30, (tw + 10) * easeOut(clamp((n - 19.86) / .3)), 44); g.clip(); g.fillText('PARVVS', x, y); g.restore();
      g.letterSpacing = '0px'; inkStroke(g, x - 2, y + 8, x + tw - 4, y + 6, 3, easeOut(clamp((n - 20.0) / .16)), 'rgb(232,82,84)');
      g.restore();
    }
    g.restore();
  }

  // ---------------- instrument 2: the balance (a single feather outweighs him) ----------------
  const featherPath = (g, x, y, s, rot) => {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.lineCap = 'round';
    // vanes: fine barbs both sides of a curved shaft
    const shaft = t => [lerp(-60, 62, t), -16 * Math.sin(t * Math.PI * .9) + 4 * t];
    g.strokeStyle = 'rgba(246,238,220,.9)'; g.lineWidth = .8;
    for (let i = 3; i < 46; i++) {
      const t = i / 48, [sx, sy] = shaft(t), w = (t < .2 ? t / .2 : 1) * (1 - Math.pow(t, 3)) * 17;
      for (const sd of [-1, 1]) { const notch = (i === 17 && sd < 0) || (i === 31 && sd > 0) ? .4 : 1; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx - 4, sy + sd * w * .5 * notch, sx - 9, sy + sd * w * notch); g.stroke(); }
    }
    g.strokeStyle = 'rgba(255,250,236,.98)'; g.lineWidth = 1.8; g.beginPath(); for (let i = 0; i <= 24; i++) { const [sx, sy] = shaft(i / 24); i ? g.lineTo(sx, sy) : g.moveTo(sx, sy); } g.stroke();
    g.strokeStyle = rgba(GOLD_L, .9); g.lineWidth = 2.2; g.beginPath(); const [qx, qy] = shaft(0); g.moveTo(qx, qy); g.lineTo(qx - 16, qy + 3); g.stroke();   // the quill
    g.restore();
  };
  function balanceBack(g, n, pp) {
    const a = scaleA(n); if (a <= 0) return;
    const sl = -90 * (1 - easeOut(clamp((n - 20.4) / .26))) - 90 * easeIn(clamp((n - 21.36) / .26));
    const th = beamAng(n), [px0, py0] = [SC.piv[0] + sl, SC.piv[1]], c = Math.cos(th), s = Math.sin(th);
    const R = [px0 + SC.arm * c, py0 + SC.arm * s], L = [px0 - SC.arm * c, py0 - SC.arm * s];
    g.save(); g.globalAlpha = a; g.lineCap = 'round'; g.lineJoin = 'round';
    const line = (w, al = .95) => { g.strokeStyle = rgba(GOLD_L, al); g.lineWidth = w; };
    // column on its stepped base on the promenade
    const bx = px0, by = RD0 + 92;
    g.fillStyle = 'rgba(196,150,70,.16)'; g.beginPath(); g.rect(bx - 7, py0 + 14, 14, by - py0 - 40); g.fill(); line(1.3); g.stroke();
    line(.6, .5); g.beginPath(); g.moveTo(bx - 2, py0 + 20); g.lineTo(bx - 2, by - 30); g.stroke();
    g.fillStyle = 'rgba(196,150,70,.22)'; g.beginPath(); g.roundRect(bx - 34, by - 26, 68, 14, 3); g.roundRect(bx - 52, by - 12, 104, 14, 3); g.fill(); line(1.2); g.stroke();
    // indicator arc + needle hanging from the pivot
    line(.8, .7); g.beginPath(); g.arc(bx, py0, 74, Math.PI / 2 - .32, Math.PI / 2 + .32); g.stroke();
    for (let i = -4; i <= 4; i++) { const an = Math.PI / 2 + i * .08; g.beginPath(); g.moveTo(bx + Math.cos(an) * 74, py0 + Math.sin(an) * 74); g.lineTo(bx + Math.cos(an) * (i ? 80 : 86), py0 + Math.sin(an) * (i ? 80 : 86)); g.stroke(); }
    const na = Math.PI / 2 - th * 2.2; line(1.6); g.beginPath(); g.moveTo(bx, py0); g.lineTo(bx + Math.cos(na) * 84, py0 + Math.sin(na) * 84); g.stroke();
    // beam (slender diamond) + pivot
    g.fillStyle = 'rgba(226,194,122,.25)'; g.beginPath(); g.moveTo(L[0], L[1]); g.lineTo(px0 - s * 7, py0 + c * 7 - 0); g.lineTo(R[0], R[1]); g.lineTo(px0 + s * 7, py0 - c * 7); g.closePath(); g.fill(); line(1.4); g.stroke();
    g.fillStyle = 'rgba(248,222,150,.6)'; g.beginPath(); g.moveTo(bx, py0 - 4); g.lineTo(bx - 9, py0 + 14); g.lineTo(bx + 9, py0 + 14); g.closePath(); g.fill(); line(1.1); g.stroke();
    g.beginPath(); g.arc(bx, py0 - 12, 6, 0, 7); g.stroke();   // finial
    // left (feather) pan: hook, three chains, dish, the feather
    const dl = [L[0], L[1] + 236];
    line(1.1); g.beginPath(); g.arc(L[0], L[1] + 7, 5, -Math.PI / 2, Math.PI * 1.3); g.stroke();
    line(.9, .85); for (const dx of [-64, 0, 64]) { g.beginPath(); g.moveTo(L[0], L[1] + 12); g.lineTo(dl[0] + dx, dl[1] - (dx ? 0 : 6)); g.stroke(); }
    g.fillStyle = 'rgba(196,150,70,.25)'; g.beginPath(); g.ellipse(dl[0], dl[1], 66, 12, 0, 0, Math.PI); g.closePath(); g.fill(); line(1.3); g.stroke();
    line(.9, .8); g.beginPath(); g.ellipse(dl[0], dl[1], 66, 9, 0, Math.PI, 0); g.stroke();
    featherPath(g, dl[0] + 6, dl[1] - 12, 1.15, -.1);
    // right (Pluto) side: the hook above him and the chains, which run behind him
    const dr = [R[0], pp[1] + PR - 6];
    line(1.1); g.beginPath(); g.arc(R[0], R[1] + 7, 5, -Math.PI / 2, Math.PI * 1.3); g.stroke();
    line(.9, .85); for (const dx of [-226, 226]) { g.beginPath(); g.moveTo(R[0], R[1] + 12); g.lineTo(dr[0] + dx, dr[1]); g.stroke(); }
    g.fillStyle = 'rgba(196,150,70,.18)'; g.beginPath(); g.ellipse(dr[0], dr[1], 226, 26, 0, Math.PI, 0); g.closePath(); g.fill(); line(.9, .7); g.stroke();
    // LEVIS: the verdict, on the indicator
    const lv = win(n, 21.02, 21.2);
    if (lv > 0) { g.globalAlpha = a * lv; g.font = '600 24px Cinzel'; g.letterSpacing = '6px'; g.fillStyle = 'rgb(232,82,84)'; g.textAlign = 'center'; g.direction = 'ltr'; g.fillText('LEVIS', bx, py0 + 122); g.letterSpacing = '0px'; }
    g.restore();
  }
  function balanceFront(g, n, pp) {
    const a = scaleA(n); if (a <= 0) return;
    const dr = [pp[0], pp[1] + PR - 6];
    g.save(); g.globalAlpha = a;
    g.fillStyle = 'rgba(196,150,70,.28)'; g.beginPath(); g.ellipse(dr[0], dr[1], 226, 26, 0, 0, Math.PI); g.lineTo(dr[0] - 226, dr[1]); g.closePath(); g.fill();
    g.strokeStyle = rgba(GOLD_L, .95); g.lineWidth = 1.4; g.beginPath(); g.ellipse(dr[0], dr[1], 226, 26, 0, 0, Math.PI); g.stroke();
    g.lineWidth = .7; g.strokeStyle = rgba(GOLD_L, .55); g.beginPath(); g.ellipse(dr[0], dr[1] + 6, 214, 20, 0, .15, Math.PI - .15); g.stroke();
    g.restore();
  }

  // ---------------- instrument 3: the tailor's tape ----------------
  const TAPE_LAT = .5;                                                  // around him, below the mouth
  function tapeGeom(n, pp, sq) {
    const c = cinch(n), drop = -320 * (1 - easeOut(clamp((n - 21.40) / .3))) + 150 * easeIn(clamp((n - 23.4) / .38));
    const cy = pp[1] + PR * sq[1] * TAPE_LAT + drop, half = PR * sq[0] * Math.sqrt(1 - TAPE_LAT * TAPE_LAT);
    const rx = lerp(305, half + 2, c) + 30 * win(n, 23.36, 23.7), ry = rx * .15;
    return { cx: pp[0], cy, rx, ry, c };
  }
  function tapeArc(g, T, a0, a1, n, col) {
    const bw = 17, N = 64;
    g.save();
    g.beginPath();
    for (let i = 0; i <= N; i++) { const a = lerp(a0, a1, i / N); const x = T.cx + Math.cos(a) * T.rx, y = T.cy + Math.sin(a) * T.ry - bw / 2; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let i = N; i >= 0; i--) { const a = lerp(a0, a1, i / N); g.lineTo(T.cx + Math.cos(a) * T.rx, T.cy + Math.sin(a) * T.ry + bw / 2); }
    g.closePath(); g.fillStyle = rgba(col); g.fill();
    g.strokeStyle = 'rgba(90,60,30,.8)'; g.lineWidth = .8; g.stroke();
    // ticks + numbers (only where the band faces us)
    g.strokeStyle = 'rgba(40,26,16,.85)'; g.fillStyle = 'rgba(40,26,16,.85)'; g.font = '600 9px Cormorant'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr';
    const per = 2 * Math.PI * T.rx / 9.5;
    for (let k = 0; k < per; k++) {
      const a = k / per * 2 * Math.PI; if (a < a0 || a > a1) continue;
      const x = T.cx + Math.cos(a) * T.rx, y = T.cy + Math.sin(a) * T.ry - bw / 2, vis = Math.abs(Math.sin(a)); if (vis < .15) continue;
      const L = k % 10 === 0 ? 8 : k % 5 === 0 ? 6 : 3.5;
      g.lineWidth = .7; g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x, y + 1 + L); g.stroke();
      if (k % 10 === 0 && vis > .4) g.fillText(String(k / 10 | 0), x, y + bw - 4);
    }
    g.restore();
  }
  function tapeBack(g, n, pp, sq) {
    const a = tapeA(n); if (a <= 0) return; const T = tapeGeom(n, pp, sq);
    g.save(); g.globalAlpha = a; tapeArc(g, T, Math.PI, 2 * Math.PI, n, mixc([212, 190, 128], [150, 160, 176], cold(n))); g.restore();
  }
  function tapeFront(g, n, pp, sq) {
    const a = tapeA(n); if (a <= 0) return; const T = tapeGeom(n, pp, sq), col = mixc([240, 222, 160], [178, 190, 206], cold(n));
    g.save(); g.globalAlpha = a;
    tapeArc(g, T, 0, Math.PI, n, col);
    // the loose end: hangs from the crossing point at the front, swinging a little, with its brass tip
    const ax = T.cx + T.rx * .28, ay = T.cy + T.ry * .96, sw = .18 * Math.sin(n * 3.1) * (1 - T.c * .6) + .25 * (1 - T.c);
    const L = 120, ex = ax + Math.sin(sw) * L + 26, ey = ay + Math.cos(sw) * L;
    g.lineCap = 'butt'; g.strokeStyle = rgba(col); g.lineWidth = 16; g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(ax + 30, ay + 40, ex, ey); g.stroke();
    g.strokeStyle = 'rgba(90,60,30,.6)'; g.lineWidth = .8;
    for (const o of [-8, 8]) { g.beginPath(); g.moveTo(ax + o, ay); g.quadraticCurveTo(ax + 30 + o, ay + 40, ex + o, ey); g.stroke(); }
    g.fillStyle = rgba(GOLD_L); g.beginPath(); g.rect(ex - 9, ey, 18, 7); g.fill(); g.strokeStyle = 'rgba(90,60,30,.8)'; g.stroke();
    // TENVIS: the reading, where the tape crosses
    const tv = win(n, 22.12, 22.3);
    if (tv > 0) {
      g.globalAlpha = a * tv; g.font = '600 22px Cinzel'; g.letterSpacing = '6px'; g.fillStyle = rgba(mixc([232, 82, 84], [196, 104, 112], cold(n))); g.textAlign = 'left'; g.direction = 'ltr';
      g.fillText('TENVIS', T.cx + T.rx + 34, T.cy + 8); g.letterSpacing = '0px';
      g.strokeStyle = rgba(GOLD_L, .5); g.lineWidth = .8; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(T.cx + T.rx + 4, T.cy); g.lineTo(T.cx + T.rx + 28, T.cy); g.stroke(); g.setLineDash([]);
    }
    g.restore();
  }

  // ---------------- the tag "מתחזה" (drops, jerks on its string, swings) ----------------
  const TG = { ang: -.42, len: 84, s: .7, off: 34 };
  function tagBody(g, s) {
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
  function tag(g, n, pp, sq) {
    const t0 = T_TAG - .3; if (n < t0) return;
    const ax = pp[0] + Math.cos(TG.ang) * PR * .93 * sq[0], ay = pp[1] + Math.sin(TG.ang) * PR * .93 * sq[1];
    const Lr = Math.sqrt(TG.len * TG.len - TG.off * TG.off);
    let tx, ty, rot, slack = 0;
    if (n < T_TAG) {                                          // free fall, string slack
      const u = (n - t0) / .3; tx = ax + TG.off; ty = lerp(-200, ay + Lr, u * u); rot = .1 * Math.sin(u * 7); slack = clamp(1 - (ty - ay) / Lr);
    } else {                                                  // caught: a jerk, then a damped swing
      const t = n - T_TAG, th = Math.atan2(TG.off, Lr) * Math.exp(-t * 1.6) * Math.cos(t * 7.6) + .32 * Math.exp(-t * 2.2) * Math.sin(t * 7.6);
      tx = ax + Math.sin(th) * TG.len; ty = ay + Math.cos(th) * TG.len + 3 * knock(n, T_TAG, .06, 50); rot = -th * .8;
    }
    g.save();
    // string (a slack loop while falling)
    g.strokeStyle = 'rgba(236,226,206,.95)'; g.lineWidth = 2;
    const mx = (ax + tx) / 2 + 60 * slack + 10, my = Math.min(ay, ty) - 70 * slack + (ty > ay ? 18 : 0);
    g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo(mx, my, tx, ty + 14 * TG.s); g.stroke();
    g.save(); g.translate(tx, ty); g.rotate(rot); tagBody(g, TG.s); g.restore();
    // the pin that fixes it to him
    g.fillStyle = rgba(GOLD_L); g.beginPath(); g.arc(ax, ay, 4.2, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,40,20,.8)'; g.lineWidth = 1; g.stroke();
    glint(g, ax - 1, ay - 1, 5, .7, [255, 244, 220]);
    g.restore();
  }

  // ---------------- the margin: the censor behind his bench ----------------
  const M = [100, 862], MS = 150, MU = MS / 100;
  const STK = .19;                                                  // his little stamp's scale
  let WORDS = null;
  function talkAt(n) {
    if (!WORDS) { WORDS = []; for (const l of (window.LINES || [])) for (const w of l.words || []) if (w.s > 15.8 && w.s < 25) WORDS.push(w); }
    for (const w of WORDS) if (n >= w.s && n <= w.e) return .35 + .65 * Math.abs(Math.sin((n - w.s) * Math.PI * 5.2));
    return 0;
  }
  // arm keys for the 'stamp' pose (1 = raised, .37 = stamp on the bench)
  const BENCH = 46, GRIP = 90, ARM_BENCH = ((-BENCH * MU - GRIP * STK) / MU + 40) / -52;   // ('point' pose: hand y = -40..-92)
  function censor(n) {
    // returns {pose, arm, held}
    const slam = (t, a0) => ({ pose: 'point', arm: n < t - .07 ? a0 : lerp(a0, ARM_BENCH, easeIn((n - (t - .07)) / .07)), held: 1 });
    if (n < 15.85) return { pose: 'point', arm: 1.45 - .04 * Math.sin(n * 7), held: 1 };
    if (n < T_HIT) return { pose: 'point', arm: lerp(1.5, ARM_BENCH, easeIn((n - 15.85) / (T_HIT - 15.85))), held: 1 };
    if (n < 16.36) return { pose: 'point', arm: ARM_BENCH, held: 1 };
    if (n < 18.18) return { pose: 'point', arm: n < 16.42 ? .2 : lerp(.2, 1, easeBack(clamp((n - 16.42) / .2))) - .1 * pulse(n, 17.3, 17.42, 17.5, 17.62) - .1 * pulse(n, 17.6, 17.7, 17.78, 17.9), held: 0 };
    if (n < 18.3) return { pose: 'point', arm: lerp(1, .2, ease((n - 18.18) / .12)), held: 0 };
    if (n < T_DAI - .07) return { pose: 'point', arm: lerp(ARM_BENCH, 1.42, easeOut((n - 18.3) / (T_DAI - .07 - 18.3))), held: 1 };
    if (n < T_DAI) return slam(T_DAI, 1.42);
    if (n < 19.0) return { pose: 'point', arm: ARM_BENCH, held: 1 };
    if (n < 22.7) {                                                 // lecturing: finger up on each measurement
      const k = n < 19.08 ? lerp(.2, .55, ease((n - 19.0) / .08)) : .55 + .4 * win(n, 19.4, 19.55) * (1 - win(n, 20.1, 20.3)) + .4 * pulse(n, 20.7, 20.85, 21.2, 21.35) + .4 * pulse(n, 21.84, 21.98, 22.3, 22.45);
      return { pose: 'point', arm: n > 22.55 ? lerp(k, .2, ease((n - 22.55) / .15)) : k, held: 0 };
    }
    if (n < T_FIN - .07) return { pose: 'point', arm: lerp(ARM_BENCH, 1.45, easeOut((n - 22.7) / (T_FIN - .07 - 22.7))), held: 1 };
    if (n < T_FIN) return slam(T_FIN, 1.45);
    if (n < 23.9) return { pose: 'point', arm: ARM_BENCH, held: 1 };
    if (n < 24.0) return { pose: 'point', arm: .2, held: 0 };
    return { pose: 'point', arm: lerp(.2, 1.05, easeBack(clamp((n - 24.12) / .22))), held: 0 };
  }
  function bench(p) {
    const u = MU, x0 = M[0] - 24 * u, x1 = M[0] + 46 * u, yt = M[1] - BENCH * u;
    p.save(); p.strokeStyle = INKC; p.lineWidth = 1.2; p.lineJoin = 'round';
    p.fillStyle = 'rgb(222,192,150)'; p.beginPath(); p.rect(x0 + 4 * u, yt + 6 * u, x1 - x0 - 8 * u, M[1] - yt - 6 * u); p.fill(); p.stroke();
    p.fillStyle = 'rgb(196,150,100)'; p.beginPath(); p.roundRect(x0, yt, x1 - x0, 6 * u, 2); p.fill(); p.stroke();
    // panel mouldings + a small engraved star-emblem (the censor's office)
    p.lineWidth = .7; p.globalAlpha = .8;
    p.beginPath(); p.rect(x0 + 10 * u, yt + 14 * u, x1 - x0 - 20 * u, M[1] - yt - 22 * u); p.stroke();
    star5(p, (x0 + x1) / 2, yt + 30 * u, 8 * u, 3.3 * u); p.fillStyle = 'rgba(196,48,56,.7)'; p.fill(); p.stroke();
    p.globalAlpha = .55; for (let y = yt + 12 * u; y < M[1] - 4; y += 4.5) { p.beginPath(); p.moveTo(x1 - 9 * u, y); p.lineTo(x1 - 5 * u, y + 3.5); p.stroke(); }
    p.restore();
  }
  function ledge(p) {
    p.save(); p.strokeStyle = INKC; p.lineWidth = 1.1; p.lineCap = 'round';
    p.beginPath(); p.moveTo(30, M[1] + 1); p.lineTo(IX - 16, M[1] + 1); p.stroke();
    p.lineWidth = .7; p.globalAlpha = .7; for (let x = 36; x < IX - 20; x += 7) { p.beginPath(); p.moveTo(x, M[1] + 3); p.lineTo(x - 5, M[1] + 8); p.stroke(); }
    p.restore();
  }
  function margin(p, n) {
    const c = censor(n), u = MU;
    const blink = bump(n, 17.25, .14) + bump(n, 20.2, .14) + bump(n, 23.6, .16);
    const bob = -1.8 * bump(n, T_HIT, .22) - 1.2 * bump(n, T_DAI, .2) - 1.2 * bump(n, T_FIN, .2) - 1.5 * pulse(n, 16.42, 16.6, 17.9, 18.1);   // pompous rise on his toes
    ledge(p);
    // the stamp resting on the bench (when not in his hand)
    const restX = M[0] + 20 * u, benchY = M[1] - BENCH * u;
    drawAstronomer(p, M[0], M[1], MS, { pose: 'point', face: 1, blink, talk: talkAt(n), arm: c.arm, bob });
    bench(p);
    if (c.held) {                                               // he grips it by the neck; the knob hides his finger
      const hx = restX, hy = M[1] + (lerp(-40, -92, c.arm) + bob) * u, up = clamp((c.arm - ARM_BENCH) / (1.45 - ARM_BENCH));
      inkStamp(p, hx, hy + GRIP * STK, STK, -.14 * up);
      p.save(); p.strokeStyle = INKC; p.lineWidth = 1.2; p.fillStyle = 'rgba(240,205,175,.98)'; p.beginPath(); p.ellipse(hx, hy, 4.2 * u, 3.6 * u, 0, 0, 7); p.fill(); p.stroke(); p.restore();
    } else inkStamp(p, restX, benchY, STK, 0);
    // the thump: tiny ink knock-lines at the bench
    for (const t of [T_HIT, T_DAI, T_FIN]) {
      const k = bump(n, t, .2); if (k <= 0) continue;
      p.save(); p.strokeStyle = INKC; p.lineWidth = 1; p.lineCap = 'round'; p.globalAlpha = k;
      for (const [dx, dy, ex, ey] of [[-20, -3, -30, -9], [-19, 2, -30, 3], [36, -3, 46, -9], [37, 2, 48, 3]]) { p.beginPath(); p.moveTo(restX + dx * u * .8, benchY + dy * u); p.lineTo(restX + ex * u * .8, benchY + ey * u); p.stroke(); }
      p.restore();
    }
    // fig. caption (inked in on "מכובדי")
    const cap = clamp((n - (W_HON - .05)) / .6);
    if (cap > 0) {
      p.save(); p.font = 'italic 500 19px Cormorant'; p.direction = 'ltr'; p.textAlign = 'left'; p.textBaseline = 'middle';
      const t1 = 'fig. III. — ', t2 = 'censor', w1 = p.measureText(t1).width; p.font = 'italic 600 19px Cormorant'; const w2 = p.measureText(t2).width;
      const x0 = M[0] + 6 - (w1 + w2) / 2, y = M[1] + 27;
      p.beginPath(); p.rect(x0 - 4, y - 16, (w1 + w2 + 8) * easeOut(cap), 32); p.clip();
      p.fillStyle = rgba(SEPIA, .95); p.font = 'italic 500 19px Cormorant'; p.fillText(t1, x0, y);
      p.fillStyle = rgba(INK, .95); p.font = 'italic 600 19px Cormorant'; p.fillText(t2, x0 + w1, y);
      p.restore();
    }
  }

  SCENE({
    id: 's3', start: 15.52, trans: 'turn', tdur: .3, folio: 3,
    plate: { lat: 'TABVLA III · DECRETVM', he: 'פסק הדין' },
    ill(g, n, lt) {
      const c = cold(n), flash = n >= T_HIT ? Math.exp(-(n - T_HIT) / .14) : 0, aft = win(n, T_HIT, 16.8);
      const pp = plutoPos(n), sq = squash(n), po = plutoOpts(n);
      g.fillStyle = '#0a0d1e'; g.fillRect(0, 0, PW, PH);
      g.save(); xf(g, n);
      SPACE.draw(g, { t: n, cam: [-.2 + (n - 15.5) * .004, .02], zoom: 1.05, neb: .6, galx: .5, gpos: [-.62, -.3],
        warm: .3 * (1 - aft), red: .38 * flash + .12 * pulse(n, 16.0, 16.2, 16.6, 17.4), cold: .2 * aft + .42 * c, gray: .2 * c, bright: 1 - .12 * c }, -40, -40, PW + 80, PH + 80);
      STARS.draw(g, { t: n, cam: [.3, .05], zoom: 1.05, dim: 1 - .35 * c });
      DUST.draw(g, { t: n, alpha: .6 * (1 - .5 * c) });
      sunAndCloud(g, n);
      // the passing shadow (a dark cloud crosses the sun): everything behind the edge goes dim
      if (n > W_THIS - .1) {
        const ex = sweepX(n), gr = g.createLinearGradient(ex - 260, 0, ex + 260, 0);
        gr.addColorStop(0, 'rgba(4,7,20,0)'); gr.addColorStop(1, 'rgba(4,7,20,.34)');
        g.fillStyle = gr; g.fillRect(-60, -60, PW + 120, PH + 120);
      }
      promenade(g, n, 1 - .4 * c);
      // fine dashed plumb line from Pluto to his plaque (atlas annotation)
      g.save(); g.setLineDash([3, 5]); g.strokeStyle = rgba(GOLD_L, .32 * (1 - .4 * c)); g.lineWidth = .9; g.beginPath(); g.moveTo(PQ[0], pp[1] + PR * sq[1] + 8); g.lineTo(PQ[0], PQ[1] - PQW * PQS / 2 - 6); g.stroke(); g.restore();
      plaque(g, n);
      balanceBack(g, n, pp);
      tapeBack(g, n, pp, sq);
      drawPluto(g, pp[0], pp[1], PR, po);
      surface(g, n, pp, sq);
      balanceFront(g, n, pp);
      tapeFront(g, n, pp, sq);
      caliper(g, n, pp, sq);
      frost(g, n, pp[0], pp[1]);
      tag(g, n, pp, sq);
      g.restore();
      // the passing shadow also falls over the props (a lighter veil), and the plate keeps its cold
      if (c > 0) { g.fillStyle = `rgba(6,10,28,${.16 * c})`; g.fillRect(0, 0, PW, PH); }
    },
    over(p, n, lt) {
      margin(p, n);
      const st = stampState(n);
      if (st) {
        p.save(); p.beginPath(); p.rect(0, 0, W, H); p.clip();
        p.translate(IX, IY); xf(p, n);
        const sp = n > 15.865 && n < T_HIT + .02 ? clamp((n - 15.865) / .05) : 0;     // ink speed lines while it falls
        if (sp > 0) {
          p.save(); p.strokeStyle = 'rgba(58,38,24,.55)'; p.lineCap = 'round'; p.lineWidth = 1.6;
          for (const [dx, L, y0] of [[-112, 110, 70], [-80, 160, 70], [-48, 80, 70], [52, 140, 70], [84, 90, 70], [112, 120, 70]]) {
            const x = st.x + dx * SS, ya = st.y - y0 * SS - 8;
            p.globalAlpha = .9 * sp; p.beginPath(); p.moveTo(x, ya); p.lineTo(x, ya - L * sp); p.stroke();
          }
          p.restore();
        }
        inkStamp(p, st.x, st.y, SS, st.rot, 1);
        p.restore();
      }
    },
  });
})();
