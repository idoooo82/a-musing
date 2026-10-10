// ===================== s1: VIA STELLARVM - the avenue of stars + the astronomer in the margin (n 3.75 .. 11.30) =====================
// "פעם הוא היה כוכב, ואף אחד לא דרך עליו / אבל אז איזה אסטרונום, איזה פירור קיום / בקצה של חור ביקום,"
// A glide along the walk of fame from the Sun's end to Pluto at the far left. On "כוכב" his plaque-star lights up gold and
// warms him from below (pride); on "לא דרך עליו" three little comet-visitors hop, one after another, over his star
// (nobody steps on him) and then lift off from the end of the promenade.
// "אבל אז": an ink figure blooms on the paper margin - a tiny astronomer with an enormous brass telescope that slides,
// clack by clack, over the plate's edge into the sky. "פירור קיום": a dimension line "1 mm", "fig. 1. — homo minimus".
// "בקצה של חור ביקום": the sky at his corner drains into a slow engraved whirlpool; fine lines of sight reach Pluto; his
// star's warmth drains away and the instrument's cold light takes over from the lower left - he stops floating, looks
// at it, and his smile fades (anticipation).
// Ends on the framing page 2 dives from: Pluto at plate (600,400), r = 72, the telescope aimed at him.
(() => {
  const ROAD = AVENUE.ROAD_Y, PWX = AVENUE.B[9].x, PR0 = AVENUE.B[9].r;   // Pluto's world x and radius
  const PY0 = ROAD - 78 - PR0;                                             // Pluto's nominal hover height (world)
  const IX = PAGE.IX, IY = PAGE.IY;
  // ---- word times (lines.json) ----
  const W_STAR = 4.72, W_BUT = 6.68, W_CRUMB = 8.18, W_EXIST = 8.66, W_EDGE = 9.14, W_HOLE = 10.06;
  const HOPS = [5.66, 5.96, 6.27];                                        // apexes: "לא" / "דרך" / "עליו"

  // ---------------- camera ----------------
  // Pluto-centred framings: [plate x, plate y, zoom]
  const F1 = [700, 318, 2.08], F2 = [614, 392, 1.86], F3 = [600, 400, 2.0];
  const K0 = { x: 430, y: 104, z: .6 };
  const camOf = f => ({ x: PWX - (f[0] - 720) / f[2], y: PY0 - (f[1] - 405) / f[2], z: f[2] });
  const mixF = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), a[2] * Math.pow(b[2] / a[2], t)];
  function cam(n) {
    if (n < 5.55) {                                                      // the establishing glide (right -> left)
      const u = clamp((n - 3.55) / (5.55 - 3.55)), c1 = camOf(F1);
      const ex = 1 - Math.pow(1 - ease(u * .85 + .15 * u * u), 1.6), ez = Math.pow(ease(u), 1.35);
      return { x: lerp(K0.x, c1.x, ex), y: lerp(K0.y, c1.y, ex), z: K0.z * Math.pow(c1.z / K0.z, ez) };
    }
    let f = F1;
    f = mixF(f, F2, win(n, 6.5, 8.6));
    f = mixF(f, F3, win(n, 8.9, 11.3));
    return camOf(f);
  }
  // Pluto stops floating when he feels the telescope on him
  const bobAt = n => 6 * Math.sin(n * .8 + 15.3) * (1 - win(n, 9.95, 11.0));
  const plutoW = n => [PWX, PY0 + bobAt(n)];
  const plutoPlate = n => { const c = cam(n), [x, y] = plutoW(n); const [X, Y] = AVENUE.S(x, y, c); return [X, Y, PR0 * c.z]; };

  // ---------------- comet-visitors strolling the avenue (a loop: left along the far lane, U-turn, back on the near lane) ----------------
  const LL = ROAD - 8, LR = ROAD + 24, XL = AVENUE.LEFT_END + 46, XR = AVENUE.RIGHT_END - 110, RT = (LR - LL) / 2, CYT = (LL + LR) / 2;
  const SEG = XR - XL, TURN = Math.PI * RT, LOOP = 2 * SEG + 2 * TURN;
  const HW = 74, HH = 39;                                                // hop half-width / height over Pluto's plaque
  function path(s) {                                                     // -> [x, groundY]
    s = ((s % LOOP) + LOOP) % LOOP;
    if (s < SEG) return [XR - s, LL];
    s -= SEG; if (s < TURN) { const a = s / TURN * Math.PI; return [XL - RT * Math.sin(a), CYT - RT * Math.cos(a)]; }
    s -= TURN; if (s < SEG) return [XL + s, LR];
    s -= SEG; const a = s / TURN * Math.PI; return [XR + RT * Math.sin(a), CYT + RT * Math.cos(a)];
  }
  const S_PL_R = SEG + TURN + (PWX - XL);                                // arc position of Pluto's star on the near lane
  const VIS = [];
  // the three heroes stroll toward the end along the far lane, hop over his star one after another, and at the very
  // end of the promenade lift off into space like the little comets they are (the stage is clear for "אבל אז")
  HOPS.forEach((T, i) => VIS.push({ v: 205, T, r: 3.5 - i * .25, c: [[255, 232, 190], [205, 232, 236], [250, 215, 210]][i], hero: 1 }));
  // the rest of the crowd: spread over the bright end of the avenue, none crossing Pluto's star while the astronomer has the floor
  [[128, 30], [135, 200], [122, 400], [140, 630], [130, 850], [185, 3108], [170, 3468], [200, 3788], [180, 4088], [175, 4388], [190, 4678]].forEach(([v, s0], i) =>
    VIS.push({ v, ph: s0 - v * 3.75, r: 2.3 + (i % 4) * .4, c: [[255, 232, 190], [205, 232, 236], [250, 215, 210]][i % 3], hero: 0 }));
  const XOFF = AVENUE.LEFT_END + 70;
  function visitorAt(V, n) {                                             // -> [x, groundY, lift, alpha]
    let x, gy, lift = 12, al = 1;
    if (V.hero) {
      x = PWX + V.v * (V.T - n); gy = LL;
      if (x < XOFF) { const d = XOFF - x; lift += .014 * d * d; al = clamp(1 - (lift - 12) / 230); }
    } else [x, gy] = path(V.ph + V.v * n);
    const dx = x - PWX;
    if (Math.abs(dx) < HW && gy > ROAD - 30) { const q = dx / HW; lift += HH * (1 - q * q); }
    return [x, gy, lift, al];
  }
  function drawVisitors(g, n, c) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'butt';
    for (const V of VIS) {
      const [x, gy, lift, al] = visitorAt(V, n); const [X, Y] = AVENUE.S(x, gy - lift, c);
      if (al <= 0 || X < -120 || X > PAGE.IW + 120 || Y < -60 || Y > PAGE.IH + 60) continue;
      const rr = V.r * c.z;
      // a little pool of its light on the promenade (stays on the ground when it hops)
      const [GX, GY] = AVENUE.S(Math.max(x, AVENUE.LEFT_END + 10), gy, c), hk = clamp(1 - (lift - 12) / (HH * 1.2));
      const pg = g.createRadialGradient(GX, GY, 0, GX, GY, rr * 5); pg.addColorStop(0, rgba(V.c, .16 * (.35 + .65 * hk) * al)); pg.addColorStop(1, rgba(V.c, 0));
      g.save(); g.translate(GX, GY); g.scale(1, .32); g.translate(-GX, -GY); g.fillStyle = pg; g.beginPath(); g.arc(GX, GY, rr * 5, 0, 7); g.fill(); g.restore();
      // the tail follows the path it travelled (curves over the hop)
      let px = X, py = Y;
      for (let j = 1; j <= 9; j++) {
        const [x2, gy2, l2] = visitorAt(V, n - j * .028); const [X2, Y2] = AVENUE.S(x2, gy2 - l2, c);
        g.strokeStyle = rgba(V.c, .62 * (1 - j / 10) * al); g.lineWidth = Math.max(.6, rr * 1.15 * (1 - j / 11));
        g.beginPath(); g.moveTo(px, py); g.lineTo(X2, Y2); g.stroke(); px = X2; py = Y2;
      }
      g.fillStyle = rgba(V.c, .95 * al); g.beginPath(); g.arc(X, Y, rr, 0, 7); g.fill();
      g.fillStyle = `rgba(255,255,250,${.9 * al})`; g.beginPath(); g.arc(X, Y, rr * .45, 0, 7); g.fill();
    }
    g.restore();
  }
  // how much a hero is above the star right now (for the plaque's glimmer)
  const hopGlow = n => HOPS.reduce((a, T) => a + bump(n, T - .22, .44), 0);

  // ---------------- Charon (own orbit phase: stays clear of Pluto's face at the key moments) ----------------
  const chA = n => .42 + .45 * n;
  function charon(g, n, c, front) {
    const a = chA(n); if ((Math.sin(a) >= 0) !== front) return;
    const [px, py] = plutoW(n); const [X, Y] = AVENUE.S(px + Math.cos(a) * 74, py - 6 + Math.sin(a) * 15, c);
    drawCharon(g, X, Y, 13 * c.z, { spin: n * .3, light: [.65, -.5], amb: lerp(1, .85, win(n, 10, 11.2)) });
  }

  // ---------------- the hole at the edge: a slow dark whirl in the sky at the astronomer's corner ----------------
  // A second copy of the same sky (same SPACE/STARS params as the avenue), spun around the corner and darkened,
  // composited only there and never over the promenade - the road stays straight, the sky behind it drains.
  const VC = [62, 764], VR = 340;
  const SWC = [(VC[0] - 720) / 810, (VC[1] - 405) / 810];
  const SKY = canvas(PAGE.IW, PAGE.IH), SKG = SKY.getContext('2d');
  const VX = canvas(Math.ceil(VC[0] + VR), Math.ceil(VR + 80)), VXG = VX.getContext('2d'), VY0 = PAGE.IH - VX.height;
  function roadPoly(g, c, ox, oy) {
    const [x0, y0] = AVENUE.S(AVENUE.RIGHT_END, ROAD - 44, c), [x1, y1] = AVENUE.S(AVENUE.LEFT_END, ROAD + 52, c), cxs = PAGE.IW / 2, sk = .22;
    g.beginPath(); g.moveTo(x1 - ox, y0 - oy); g.lineTo(x0 - ox, y0 - oy); g.lineTo(x0 + (x0 - cxs) * sk - ox, y1 - oy); g.lineTo(x1 + (x1 - cxs) * sk - ox, y1 - oy); g.closePath();
  }
  function hole(g, n, c, sp, A, depth, trail, arms) {
    SKG.setTransform(1, 0, 0, 1, 0, 0); SKG.globalAlpha = 1; SKG.globalCompositeOperation = 'source-over';
    SPACE.draw(SKG, Object.assign({ t: n, cam: [c.x / 2400, c.y / 2400], zoom: 1 + (c.z - 1) * .12, neb: .55, galx: .7, gpos: [.5, -.3] }, sp, { swirl: A, swc: SWC }));
    STARS.draw(SKG, { t: n, cam: [c.x / 1500, c.y / 1500], zoom: 1 + (c.z - 1) * .25, dim: 1, swirl: A, swc: SWC, trail });
    const x = VXG; x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, VX.width, VX.height);
    x.drawImage(SKY, 0, VY0, VX.width, VX.height, 0, 0, VX.width, VX.height);
    // the well: deeper ink toward the centre
    const cy = VC[1] - VY0;
    x.globalCompositeOperation = 'source-atop';
    let gr = x.createRadialGradient(VC[0], cy, 0, VC[0], cy, VR * .9);
    gr.addColorStop(0, `rgba(2,3,10,${.95 * depth})`); gr.addColorStop(.3, `rgba(4,6,18,${.62 * depth})`); gr.addColorStop(1, 'rgba(4,6,18,0)');
    x.fillStyle = gr; x.fillRect(0, 0, VX.width, VX.height);
    // fine spiral currents drawn into the well (an engraver's whirlpool), slowly turning inward
    if (arms > 0) {
      x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
      for (let k = 0; k < 7; k++) {
        const th0 = k / 7 * 2 * Math.PI - n * .55 + .4 * Math.sin(k * 2.1);
        let px = null, py = null;
        for (let i = 0; i <= 90; i++) {
          const u = i / 90, rr = VR * (.9 - .03 * (k % 3)) * Math.exp(-3.1 * u), th = th0 + u * 2.4 * Math.PI;
          const X = VC[0] + Math.cos(th) * rr, Y = cy + Math.sin(th) * rr * .92;
          if (px !== null) { const al = arms * .5 * Math.sin(Math.PI * Math.min(1, u * 1.12)) * (k % 2 ? .6 : 1);
            x.strokeStyle = `rgba(178,192,240,${al})`; x.lineWidth = lerp(1.5, .6, u); x.beginPath(); x.moveTo(px, py); x.lineTo(X, Y); x.stroke(); }
          px = X; py = Y;
        }
      }
    }
    // feathered edge + keep the promenade untouched
    x.globalCompositeOperation = 'destination-in';
    gr = x.createRadialGradient(VC[0], cy, VR * .45, VC[0], cy, VR); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, VX.width, VX.height);
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineWidth = 9;
    roadPoly(x, c, 0, VY0); x.fill(); x.stroke();
    x.globalCompositeOperation = 'source-over';
    g.drawImage(VX, 0, VY0);
  }

  // ---------------- Pluto's acting ----------------
  // light story: his own star-plaque warms him from below (pride); when the telescope's lines of sight reach him that
  // warmth drains away and the instrument's cold light takes its place from the lower left (scrutiny).
  const starGoldAt = n => .9 * win(n, W_STAR - .05, W_STAR + .4) * (1 - .6 * win(n, 9.8, 11.0));
  function plutoOpts(n) {
    const hop = pulse(n, 5.35, 5.7, 6.35, 6.8);                        // delighted, watching his visitors
    const notice = win(n, 9.98, 10.5), cool = win(n, 9.85, 11.0), fade = win(n, 10.2, 11.2);
    const lookHopX = lerp(.55, -.35, clamp((n - 5.4) / 1.2));
    const look = [lerp(lerp(0, lookHopX, hop), -1, notice), lerp(lerp(0, .75, hop), .62, notice)];
    const warmK = (.42 * starGoldAt(n) / .5 + .12 * hopGlow(n)) * (1 - win(n, 9.7, 10.15)), coldK = .42 * win(n, 10.05, 11.0);
    const l2 = warmK >= coldK ? { dir: [.12, .72], col: [255, 196, 118], k: warmK } : { dir: [-.76, .46], col: [140, 178, 240], k: coldK };
    return {
      spin: .05 * Math.sin(n * .5) * (1 - notice) + .17 * notice,
      light: [lerp(.7, .8, cool), lerp(-.45, -.32, cool)], lightCol: mixc([1.07, .98, .86], [.94, .95, 1.02], cool), amb: lerp(1, .8, cool),
      light2: l2,
      glow: lerp(.28 + .1 * Math.sin(n * 2.2), .06, cool),
      face: { smile: lerp(.58 + .14 * hop, .26, fade), open: 1, look, brow: .3 * fade, sad: .08 * fade },
    };
  }

  // ---------------- paparazzi: "פעם הוא היה כוכב" - only the flashes, popping from the dark around him ----------------
  const FLASH = (() => { const r = mulberry(4711), out = [];
    const T = [4.48, 4.6, 4.68, 4.72, 4.76, 4.83, 4.9, 4.95, 5.03, 5.08, 5.15, 5.24, 5.3, 5.38, 5.47, 5.56, 5.68, 5.82, 5.97];
    T.forEach((t, i) => { const a = (i % 2 ? -1 : 1) * (.35 + r() * 1.25) + (r() < .5 ? 0 : Math.PI);    // left / right, mostly low
      const d = 230 + r() * 330; out.push({ t: t + (r() - .5) * .03, dx: Math.cos(a) * d, dy: Math.abs(Math.sin(a)) * d * (r() < .78 ? .55 : -.45) + 60, s: .7 + r() * .6 }); });
    return out; })();
  const flashK = (f, n) => { const u = n - f.t; return u < 0 || u > .32 ? 0 : (u < .025 ? u / .025 : Math.exp(-(u - .025) * 16)); };
  function flashLight(n) {                                                  // the strongest flash lights his face
    let best = null, bk = 0;
    for (const f of FLASH) { const k = flashK(f, n) * f.s; if (k > bk) { bk = k; best = f; } }
    if (!best || bk < .02) return null;
    const L = Math.hypot(best.dx, best.dy, 420);
    return { dir: [best.dx / L, best.dy / L, 420 / L], col: [255, 250, 244], k: 1.25 * bk };
  }
  function drawFlashes(g, n, X, Y) {
    g.save(); g.globalCompositeOperation = 'lighter';
    let tot = 0;
    for (const f of FLASH) {
      const k = flashK(f, n) * f.s; if (k <= .01) continue; tot += k;
      const x = X + f.dx, y = Y + f.dy, R = 240 * f.s;
      const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, `rgba(255,255,255,${.95 * k})`); gr.addColorStop(.08, `rgba(240,246,255,${.6 * k})`);
      gr.addColorStop(.35, `rgba(190,215,255,${.12 * k})`); gr.addColorStop(1, 'rgba(180,210,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
      glint(g, x, y, 60 * f.s * (.6 + .4 * k), k, [255, 255, 255]); glint(g, x, y, 22 * f.s, k, [255, 255, 255]);                    // the crisp cross of a camera flash
      g.strokeStyle = `rgba(235,242,255,${.35 * k})`; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x - 200 * f.s * k, y); g.lineTo(x + 200 * f.s * k, y); g.stroke();       // a thin anamorphic streak
    }
    if (tot > 0) { g.fillStyle = `rgba(214,226,255,${Math.min(.2, .11 * tot)})`; g.fillRect(0, 0, PAGE.IW, PAGE.IH); }   // the whole sky blinks
    g.restore();
  }

  // ---------------- the margin: astronomer + brass telescope (page coordinates) ----------------
  const M = [114, 852], MS = 96, MU = MS / 100;                           // his feet, his height (he's tiny)
  const EYE = [M[0] + 13.5 * MU, M[1] - 80 * MU];                          // eyepiece position
  const INK_C = 'rgba(58,38,24,.92)';
  const scopeAng = n => { const [X, Y] = plutoPlate(n); return Math.atan2(IY + Y - EYE[1], IX + X - EYE[0]); };
  // telescope extension (three clacks, one per section)
  const extA = n => easeBack(clamp((n - 7.06) / .2)), extB = n => easeBack(clamp((n - 7.32) / .2)), extC = n => easeBack(clamp((n - 7.56) / .22));
  const LA = 118, LB = 98, LC = 92, BELL = 24;
  const scopeLen = n => 10 + LA + LB * extA(n) + LC * extB(n) + 26 * extC(n) + BELL;
  function brass(p, x0, x1, r0, r1) {
    const R = Math.max(r0, r1), gr = p.createLinearGradient(0, -R, 0, R);
    gr.addColorStop(0, '#f3d48c'); gr.addColorStop(.22, '#fff0c4'); gr.addColorStop(.4, '#dcae5a'); gr.addColorStop(.75, '#a5722c'); gr.addColorStop(1, '#5f3f17');
    p.fillStyle = gr; p.beginPath(); p.moveTo(x0, -r0); p.lineTo(x1, -r1); p.lineTo(x1, r1); p.lineTo(x0, r0); p.closePath(); p.fill(); p.stroke();
    // engraved shade hatching along the underside
    p.save(); p.globalAlpha = .45; p.lineWidth = .6; for (let x = x0 + 4; x < x1 - 2; x += 4) { const t = (x - x0) / (x1 - x0), r = lerp(r0, r1, t); p.beginPath(); p.moveTo(x, r * .5); p.lineTo(x + 2.4, r * .93); p.stroke(); } p.restore();
  }
  function band(p, x, r, w = 3.4) {
    const gr = p.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#e8c070'); gr.addColorStop(.3, '#fff2c8'); gr.addColorStop(1, '#6a4818');
    p.fillStyle = gr; p.beginPath(); p.rect(x - w / 2, -r, w, 2 * r); p.fill(); p.stroke();
  }
  // draws the tube from the eyepiece outward; returns the objective centre (page coords) and its radius
  function drawScope(p, n, ang) {
    const a = extA(n), b = extB(n), c = extC(n);
    p.save(); p.translate(EYE[0], EYE[1]); p.rotate(ang); p.lineJoin = 'round'; p.strokeStyle = INK_C; p.lineWidth = 1.05;
    // eyepiece
    p.fillStyle = '#4a3420'; p.beginPath(); p.rect(-4, -3.6, 15, 7.2); p.fill(); p.stroke();
    p.beginPath(); p.rect(-6, -4.6, 3, 9.2); p.fill(); p.stroke();
    // main barrel (with the mount) + a little finder scope on top
    let x = 10; brass(p, x, x + LA, 7.2, 8.4); band(p, x + 2, 8); band(p, x + LA * .55, 8.6, 2.6); band(p, x + LA - 2, 9.2, 4.4);
    p.fillStyle = '#7a5420'; p.beginPath(); p.rect(x + 52, -12.6, 2.4, 5); p.rect(x + 74, -12.4, 2.4, 4.6); p.fill();
    brass(p, x + 46, x + 86, 2.4, 2.8);
    x += LA;
    // draw tubes slide out (thinner)
    const lb = LB * a, lc = LC * b + 26 * c;
    if (lb > 1) { brass(p, x - 1, x + lb, 7.0, 7.0); band(p, x + lb - 1.5, 7.6); }
    x += lb;
    if (lc > 1) { brass(p, x - 1, x + lc, 6.0, 6.0); }
    x += lc;
    // objective cell: a flared brass dew-cap with the lens
    brass(p, x, x + BELL, 7.4, 12.2); band(p, x + 1.5, 8.0); band(p, x + BELL - 1.8, 12.8, 4.2);
    x += BELL;
    p.fillStyle = '#16203c'; p.beginPath(); p.ellipse(x + .8, 0, 3.2, 11.4, 0, 0, 7); p.fill(); p.stroke();
    p.fillStyle = 'rgba(170,220,255,.7)'; p.beginPath(); p.ellipse(x + 1.5, -4, 1.3, 4.2, 0, 0, 7); p.fill();
    p.restore();
    return [EYE[0] + Math.cos(ang) * (x + 1), EYE[1] + Math.sin(ang) * (x + 1), 11.5];
  }
  function drawTripod(p, ang) {
    const mx = EYE[0] + Math.cos(ang) * 66, my = EYE[1] + Math.sin(ang) * 66;
    p.save(); p.lineCap = 'round'; p.strokeStyle = INK_C;
    for (const [fx, w] of [[-27, 2.3], [24, 2.3], [-3, 1.8]]) {
      p.lineWidth = w + 1.6; p.strokeStyle = INK_C; p.beginPath(); p.moveTo(mx, my + 4); p.lineTo(M[0] + 62 + fx, M[1]); p.stroke();
      p.lineWidth = w - .4; p.strokeStyle = 'rgba(150,104,60,.95)'; p.beginPath(); p.moveTo(mx, my + 4); p.lineTo(M[0] + 62 + fx, M[1]); p.stroke();
    }
    p.strokeStyle = INK_C; p.lineWidth = 1; p.fillStyle = '#7a5420'; p.beginPath(); p.rect(mx - 5, my + 2, 10, 7); p.fill(); p.stroke();
    p.restore();
  }
  // a fine ink ground: the paper margin is his little ledge; it ends exactly at the plate's edge
  function drawLedge(p) {
    p.save(); p.strokeStyle = INK_C; p.lineWidth = 1.1; p.lineCap = 'round';
    p.beginPath(); p.moveTo(34, M[1] + 1); p.lineTo(IX - 14, M[1] + 1); p.stroke();
    p.lineWidth = .7; p.globalAlpha = .7;
    for (let x = 40; x < IX - 18; x += 7) { p.beginPath(); p.moveTo(x, M[1] + 3); p.lineTo(x - 5, M[1] + 8); p.stroke(); }
    p.restore();
  }
  // ink-bloom reveal (the drawing soaks into the paper)
  const MC = canvas(W, H), MG = MC.getContext('2d');
  const RX0 = 0, RY0 = 600, RW = 560, RH = 300, MK = canvas(RW / 5, RH / 5), MKG = MK.getContext('2d');
  let NZ = null;
  function bloomMask(prog) {
    const w = MK.width, h = MK.height;
    if (!NZ) { NZ = new Float32Array(w * h); for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) NZ[j * w + i] = fbm2(i * .16 + 3, j * .16 + 7, 4); }
    const id = MKG.createImageData(w, h), d = id.data, sx = (M[0] + 18 - RX0) / 5, sy = (M[1] - 44 - RY0) / 5;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const v = .62 * Math.hypot(i - sx, (j - sy) * 1.15) / 52 + .5 * (NZ[j * w + i] - .25);
      const k = (j * w + i) * 4; d[k] = d[k + 1] = d[k + 2] = 0; d[k + 3] = 255 * clamp((prog - v) / .1);
    }
    MKG.putImageData(id, 0, 0);
  }

  function margin(p, n) {
    const ang = scopeAng(n);
    drawLedge(p);
    drawTripod(p, ang);
    const obj = drawScope(p, n, ang);
    const blink = bump(n, 8.0, .16) + bump(n, 10.7, .16);
    const lean = .05 * pulse(n, 9.1, 9.6, 10.6, 11.4);                   // "at the edge" - he leans in toward the hole
    p.save(); p.translate(M[0], M[1]); p.rotate(lean); p.translate(-M[0], -M[1]);
    const bob = -1.6 * (bump(n, 7.06, .2) + bump(n, 7.32, .2) + bump(n, 7.56, .24));   // a proud little bounce at each clack
    drawAstronomer(p, M[0], M[1], MS, { pose: 'scope', face: 1, blink, bob });
    p.restore();
    return obj;
  }

  // dimension line "1 mm" + figure caption
  function annotations(p, n) {
    const dl = easeOut(clamp((n - (W_CRUMB - .04)) / .34)), lab = win(n, W_CRUMB + .12, W_CRUMB + .42);
    const x = M[0] - 46, yb = M[1] - 1, yt = M[1] - 97 * MU, ym = (yb + yt) / 2;
    if (dl > 0) {
      p.save(); p.strokeStyle = rgba(SEPIA, .95); p.fillStyle = rgba(SEPIA, .95); p.lineWidth = .9; p.lineCap = 'round';
      const half = (yb - yt) / 2 * dl, gap = 11 * lab;
      p.beginPath(); p.moveTo(x, ym - gap); p.lineTo(x, ym - half); p.moveTo(x, ym + gap); p.lineTo(x, ym + half); p.stroke();
      // extension lines toward him
      p.globalAlpha = dl; p.setLineDash([2, 2.5]);
      p.beginPath(); p.moveTo(x - 5, yt); p.lineTo(M[0] - 10, yt); p.moveTo(x - 5, yb); p.lineTo(M[0] - 14, yb); p.stroke(); p.setLineDash([]);
      // arrowheads
      const ah = clamp((dl - .85) / .15);
      if (ah > 0) { p.globalAlpha = ah; for (const [yy, s] of [[yt, 1], [yb, -1]]) { p.beginPath(); p.moveTo(x, yy); p.lineTo(x - 2.6, yy + 6 * s); p.lineTo(x + 2.6, yy + 6 * s); p.closePath(); p.fill(); } }
      if (lab > 0) { p.globalAlpha = lab; p.font = 'italic 600 17px Cormorant'; p.textAlign = 'center'; p.textBaseline = 'middle'; p.direction = 'ltr'; p.fillText('1 mm', x, ym + 1); }
      p.restore();
    }
    // fig. caption, inked in left to right on "קיום"
    const cap = clamp((n - (W_EXIST - .1)) / .55);
    if (cap > 0) {
      p.save(); p.font = 'italic 500 19px Cormorant'; p.direction = 'ltr'; p.textAlign = 'left'; p.textBaseline = 'middle';
      const t1 = 'fig. 1. — ', t2 = 'homo minimus', w1 = p.measureText(t1).width; p.font = 'italic 600 19px Cormorant'; const w2 = p.measureText(t2).width;
      const x0 = M[0] + 12 - (w1 + w2) / 2, y = M[1] + 27;
      p.beginPath(); p.rect(x0 - 4, y - 16, (w1 + w2 + 8) * easeOut(cap), 32); p.clip();
      p.fillStyle = rgba(SEPIA, .95); p.font = 'italic 500 19px Cormorant'; p.fillText(t1, x0, y);
      p.fillStyle = rgba(INK, .95); p.font = 'italic 600 19px Cormorant'; p.fillText(t2, x0 + w1, y);
      p.restore();
    }
  }

  // fine "lines of sight" from the objective to Pluto (an optics diagram, engraved in pale gold)
  function sightLines(p, n, obj) {
    const k = easeOut(clamp((n - 9.3) / .75)), fadeIn = win(n, 9.25, 9.5); if (k <= 0) return;
    const [X, Y, R] = plutoPlate(n), P = [IX + X, IY + Y];
    const dx = P[0] - obj[0], dy = P[1] - obj[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    p.save(); p.beginPath(); p.rect(IX, IY, PAGE.IW, PAGE.IH); p.clip();
    p.strokeStyle = rgba(GOLD_L, .5 * fadeIn); p.lineWidth = .9; p.setLineDash([5, 6]); p.lineDashOffset = -n * 14;
    for (const s of [-1, 1]) {
      const ax = obj[0] + nx * obj[2] * s, ay = obj[1] + ny * obj[2] * s;
      const bx = P[0] - ux * R * .15 + nx * R * .98 * s, by = P[1] - uy * R * .15 + ny * R * .98 * s;
      p.beginPath(); p.moveTo(ax, ay); p.lineTo(lerp(ax, bx, k), lerp(ay, by, k)); p.stroke();
    }
    p.setLineDash([]); p.restore();
  }

  SCENE({
    id: 's1', start: 3.75, trans: 'turn', tdur: .9, folio: 1,
    plate: { lat: 'TABVLA I · VIA STELLARVM', he: 'שדרת הכוכבים' },
    ill(g, n, lt) {
      const c = cam(n), po = plutoOpts(n), cool = win(n, 9.85, 11.0);
      const fl = flashLight(n); if (fl && (!po.light2 || fl.k > po.light2.k)) po.light2 = fl;
      const starGold = starGoldAt(n);
      const sp = { warm: lerp(.22, .05, cool), cold: .22 * cool, neb: .55 };
      AVENUE.draw(g, n, c, {
        fans: 0, charon: false, plutoPos: plutoW(n), pluto: po,
        plaque: { pluto: { gold: starGold, glow: .5 + .7 * hopGlow(n) } },
        space: sp,
        beforePluto: (gg, cc) => { drawVisitors(gg, n, cc); charon(gg, n, cc, false); },
        afterPluto: (gg, cc) => charon(gg, n, cc, true),
        afterPlaque: (gg, X, Y, cc) => {                                  // each hop makes his star twinkle
          HOPS.forEach((T, i) => { const b = bump(n, T - .12, .5); if (b > 0) glint(gg, X + (i - 1) * 9 * cc.z, Y - 6 * cc.z, 10 * cc.z * b, .8 * b, [255, 236, 190]); });
        },
      });
      if (n > 4.4 && n < 6.2) { const [FX, FY] = plutoPlate(n); drawFlashes(g, n, FX, FY); }
      // the hole at the edge of the universe
      const hk = win(n, W_EDGE - .15, 11.8), A = .3 * Math.pow(hk, 1.2), dep = win(n, W_EDGE, W_HOLE + .6);
      if (hk > .002) hole(g, n, c, sp, A, dep, 0, win(n, W_EDGE + .2, W_HOLE + .3));
      // attention narrows on the two of them (gentle cool vignette)
      if (cool > 0) {
        const [X, Y] = plutoPlate(n), vg = g.createRadialGradient(X - 120, Y + 120, 260, X - 120, Y + 120, 1000);
        vg.addColorStop(0, 'rgba(6,10,26,0)'); vg.addColorStop(1, `rgba(6,10,26,${.45 * cool})`); g.fillStyle = vg; g.fillRect(0, 0, PAGE.IW, PAGE.IH);
      }
    },
    over(p, n, lt) {
      if (n < W_BUT - .08) return;
      const bl = clamp((n - (W_BUT - .06)) / .42);
      if (bl < 1) {                                                       // ink bloom
        MG.setTransform(1, 0, 0, 1, 0, 0); MG.clearRect(RX0, RY0, RW, RH);
        margin(MG, n);
        bloomMask(bl * 1.25);
        MG.save(); MG.globalCompositeOperation = 'destination-in'; MG.imageSmoothingQuality = 'high'; MG.drawImage(MK, RX0, RY0, RW, RH); MG.restore();
        MG.save(); MG.globalCompositeOperation = 'destination-out'; MG.fillRect(0, 0, W, RY0); MG.fillRect(RX0 + RW, 0, W, H); MG.restore();
        p.drawImage(MC, 0, 0);
        return;
      }
      const ang = scopeAng(n);
      // sight lines sit under the brass
      const objPre = [EYE[0] + Math.cos(ang) * (scopeLen(n) + 1), EYE[1] + Math.sin(ang) * (scopeLen(n) + 1), 11.5];
      sightLines(p, n, objPre);
      const obj = margin(p, n);
      // the lens catches starlight as he locks on
      const gl = bump(n, 9.18, .5); if (gl > 0) glint(p, obj[0] + 2, obj[1] - 4, 16 * gl, .9 * gl, [235, 245, 255]);
      annotations(p, n);
    },
  });
})();
