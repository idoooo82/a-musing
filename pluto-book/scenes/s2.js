// ===================== s2: PER TVBVM - through the astronomer's telescope (n 11.30 .. 15.52) =====================
// "החליט שלא יהיה ולא יקום, שמשהו במציאות עקום."
// The eyepiece view of an antique instrument. Cut-in: page 1's plate rushes toward Pluto while an iris closes onto him
// and becomes the brass field stop (Pluto/Charon land exactly where page 1 left them); the sky is out of focus, the
// reticle (in the eyepiece's own focal plane) is sharp; the focus hunts and bites. The micrometer wires close in on him
// one notch per word and LOCK on "יקום": a cold flash from the instrument flattens his face, a red ring tightens, Charon
// has ducked behind him, the smile is gone and a worried brow rises. On "שמשהו במציאות עקום" the astronomer's crooked
// lens wobbles the world like a funhouse mirror (Pluto, sky AND reticle together); the instrument's light swims across
// his face ("oh?"); on "עקום" everything sets bent - the cross-wires sag into a frown - and the instrument turns red:
// a cold verdict is coming. Light is the actor: key = page 1's cool sun (upper right), light2 = the instrument.
(() => {
  const S0 = 11.3;
  const CX = 720, CY = 405, RF = 366, PR = 148;            // field centre / radius, Pluto radius (plate px)
  const CREAM = [244, 232, 206], WIRE = [236, 226, 196], RED = [228, 64, 68];
  // word times
  const W_DEC = 11.56, W_NOT = 11.94, W_BE = 12.30, W_NOR = 12.62, W_RISE = 12.82, W_SOME = 13.74, W_REAL = 14.12, W_CROOK = 14.72;
  // where Pluto sits on page 1 at the cut (plate px) and his radius there -> the dive lands on him seamlessly
  const ZT = [600, 400], R1 = 72;

  const FC = canvas(PAGE.IW, PAGE.IH), FG = FC.getContext('2d');        // the field (sky + Pluto), unmasked
  const WC = canvas(PAGE.IW, PAGE.IH), WG = WC.getContext('2d');        // warped copy
  const OV = canvas(W, H), OG = OV.getContext('2d');                    // page-1 overlay during the cut
  const P1 = canvas(PAGE.IW, PAGE.IH), P1G = P1.getContext('2d');       // page-1 plate (reused, like renderIll)
  const HB = canvas(PAGE.IW / 2, PAGE.IH / 2), HG = HB.getContext('2d'); // half-res copy for the cheap defocus

  // ---------------- timing curves ----------------
  const tIn = n => clamp((n - S0) / .5);
  // focus: hunts past sharp and back (a hand on the focus knob)
  // (the reticle sits in the eyepiece's own focal plane: it is always sharp, only the sky swims into focus)
  function blurAt(n) {
    if (n < 11.62) return 7;
    if (n < 11.84) return lerp(7, .3, ease((n - 11.62) / .22));
    if (n < 11.93) return lerp(.3, 2.0, ease((n - 11.84) / .09));
    return lerp(2.0, 0, ease((n - 11.93) / .13));
  }
  const focusPos = n => {                    // index of the focus scale (0..1), hunting with the blur
    const f = n < 11.62 ? 0 : n < 11.84 ? lerp(0, .62, ease((n - 11.62) / .22)) : n < 11.93 ? lerp(.62, .7, ease((n - 11.84) / .09)) : lerp(.7, .58, ease((n - 11.93) / .13));
    return f;
  };
  // micrometer wires: one mechanical notch per word, the last one locks onto Pluto's limb
  const STEPS = [[W_DEC, 282], [W_NOT, 236], [W_BE, 204], [W_NOR, 180], [W_RISE, PR + 12]];
  function wireHS(n) {
    let hs = 372;
    for (const [t, v] of STEPS) { const k = (n - t + .02) / .16; if (k <= 0) break; hs = lerp(hs, v, k >= 1 ? 1 : easeBack(k)); if (k < 1) break; }
    return hs;
  }
  const lockK = n => win(n, W_RISE, W_RISE + .2);
  const warpA = n => .88 * (win(n, W_SOME - .04, W_REAL) * .5 + win(n, W_REAL, W_REAL + .4) * .5) * (1 - .72 * win(n, W_CROOK, 15.1) - .16 * win(n, 15.1, 15.5));
  const crook = n => win(n, W_CROOK - .08, W_CROOK + .3);                // the frozen "crooked" bend
  const redK = n => win(n, 14.95, 15.4);

  // ---------------- Pluto: acting (relief only) + light ----------------
  // Page 1 hands him over already cooling: smile .26, a worried brow, looking down-left into the telescope, which lights
  // him coldly from below-left. Through the eyepiece that gaze becomes a look straight at us.
  function pluto(n) {
    const dive = win(n, S0, S0 + .4);
    const lock = win(n, W_RISE, W_RISE + .35);
    const wv = win(n, W_SOME, W_SOME + .3), wl = pulse(n, W_SOME, W_SOME + .25, 14.95, 15.3);
    const glance = -pulse(n, 13.1, 13.18, 13.28, 13.36) + pulse(n, 13.34, 13.42, 13.52, 13.62);   // nervous glances, left, right
    let look = [lerp(-1, 0, dive) + .9 * glance, lerp(.62, 0, dive)];
    const la = (n - W_SOME) * 5.2;
    look = [lerp(look[0], .9 * Math.cos(la), wl), lerp(look[1], .5 * Math.sin(la), wl)];
    const oh = win(n, W_REAL - .02, W_REAL + .1) * (1 - win(n, 14.92, 15.04));   // "oh?" - a small round mouth while reality wobbles
    const face = {
      smile: lerp(lerp(lerp(.26, .2, win(n, W_DEC, W_NOR)), 0, lock), -.16, win(n, 14.95, 15.4)) - .06 * win(n, W_SOME, W_REAL),
      brow: lerp(lerp(.3, .5, lock), .62, win(n, W_SOME, W_REAL)),
      O: .82 * oh,
      sad: lerp(lerp(.08, .1, lock), .2, win(n, 14.95, 15.45)),
      open: 1, look, relief: lerp(1, 1.12, dive),
    };
    // key: page 1's cool sun from the upper right (shadows deepen once we are inside the dark tube, so the relief reads).
    // light2: the INSTRUMENT - its cold blue-white beam comes from the telescope (lower left, as on page 1); when the wires
    // lock it flares head-on (a flash that flattens him into a specimen), then settles; it swims across his face while
    // the crooked lens bends the world, and finally turns red with the reticle.
    const rk = redK(n), A = warpA(n), cr = crook(n);
    const ph = (n - W_SOME) * 3.6, sw = wv * (1 - .7 * cr), fl = bump(n, W_RISE - .02, .42);
    const l2dir = [lerp(-.76, -.62, dive) + .5 * fl + sw * .75 * Math.sin(ph) + 1.57 * rk, lerp(.46, .38, dive) - .28 * fl - sw * .55 * Math.cos(ph * .8) - .43 * rk];
    const l2 = { dir: l2dir, col: mixc([150, 186, 240], [255, 58, 62], rk), k: lerp(lerp(.55, .32, dive), .4, lock) + .45 * fl - .12 * rk };
    return {
      spin: lerp(.17, 0, dive) + .1 * glance + .12 * wv * (1 - cr) * Math.sin((n - W_SOME) * 4.3), face,
      light: [lerp(.7, .62, dive), lerp(-.45, -.56, dive)], lightCol: mixc([.9, .94, 1.03], [.86, .93, 1.07], lock), amb: lerp(lerp(.84, .62, dive), .56, lock), light2: l2,
      glow: .06 * (1 - dive), atm: lerp(1, .8, lock), gray: .08 * lock,
      squash: [1 + .03 * A * Math.sin(n * 6.1), 1 - .03 * A * Math.sin(n * 6.1)], rot: .08 * A * Math.sin(n * 3.7),
    };
  }

  // ---------------- the field (sky + Charon + Pluto) into FC ----------------
  function drawField(n, Pc = [CX, CY], k = 1) {         // Pc/k: where Pluto sits and his scale (during the dive)
    const g = FG; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, PAGE.IW, PAGE.IH);
    const cold = win(n, W_NOR, W_RISE + .3), rk = redK(n);
    const sz = 1.05 * Math.pow(k, .45);
    SPACE.draw(g, { t: n, cam: [.22 + (n - S0) * .006, -.06], zoom: sz, neb: .62, galx: .45, gpos: [-.36, -.24], cold: .18 + .25 * cold, red: .1 * rk, warp: .25 * warpA(n), wpc: [0, 0], wpr: .42 });
    STARS.draw(g, { t: n, cam: [.4 + (n - S0) * .01, .12], zoom: sz, dim: .9 });
    // Charon: orbiting, then ducking behind Pluto before the wires lock
    const hide = win(n, W_BE + .05, W_RISE + .05), KS = PR / 36;          // page-1 world units -> field px
    const a = .42 + .45 * n;                                                // same orbit phase as on page 1
    const ox = lerp(Math.cos(a) * 74, 6, hide) * KS, oy = lerp(-6 + Math.sin(a) * 15, -12, hide) * KS;
    const behind = true;
    const P = pluto(n);
    const bob = 2 * Math.sin(n * 1.3);
    const ch = () => drawCharon(g, Pc[0] + ox * k, Pc[1] + (oy + bob) * k, 13 * KS * k, { spin: n * .3, light: P.light, lightCol: P.lightCol, amb: P.amb, light2: P.light2 });
    if (behind) ch();
    drawPluto(g, Pc[0], Pc[1] + bob * k, PR * k, P);
    if (!behind) ch();
  }

  // strip-based funhouse mirror: every horizontal slice is shifted / stretched by smooth waves
  // horizontal displacement of the field at plate row y (shared by the strips): travelling wobble + the final bend
  const wdx = (v, A, n, cr) => A * (20 * Math.sin(v * 4.2 - n * 5.5) + 8 * Math.sin(v * 9.5 + n * 7.1)) + cr * 58 * (v * v - .3);
  const wsx = (v, A, n) => 1 + A * (.11 * Math.sin(v * 3.1 - n * 3.8) + .03 * Math.sin(v * 8 + n * 5));
  function warpInto(src, A, n, cr) {
    const g = WG; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, PAGE.IW, PAGE.IH);
    const hs = 3, y0 = CY - RF - 30, y1 = CY + RF + 30;
    const fy = y => { const v = (y - CY) / RF; return y + A * 15 * Math.sin(v * 3 + n * 3.3) * (1 - v * v); };
    for (let y = y0; y < y1; y += hs) {
      const v = (y + hs / 2 - CY) / RF, sx = wsx(v, A, n), dx = wdx(v, A, n, cr);
      const s0 = fy(y), s1 = fy(y + hs);
      g.drawImage(src, 0, s0, PAGE.IW, Math.max(1, s1 - s0), CX - CX * sx + dx, y, PAGE.IW * sx, hs + .5);
    }
    if (cr < .002) return WC;
    // "crooked": a second, column pass sags the horizontal lines into a frown (the field canvas is free again)
    const f = FG; f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, PAGE.IW, PAGE.IH);
    const ws = 3, x0 = CX - RF - 6, x1 = CX + RF + 6;
    f.drawImage(WC, 0, 0, x0, PAGE.IH, 0, 0, x0, PAGE.IH); f.drawImage(WC, x1, 0, PAGE.IW - x1, PAGE.IH, x1, 0, PAGE.IW - x1, PAGE.IH);
    for (let x = x0; x < x1; x += ws) {
      const v = (x + ws / 2 - CX) / RF, dy = cr * 40 * (v * v - .3);
      f.drawImage(WC, x, 0, ws, PAGE.IH, x, dy, ws + .5, PAGE.IH);
    }
    return FC;
  }

  // ---------------- instrument parts ----------------
  function tube(g, P, R) {             // black tube interior around the field
    g.save();
    const bg = g.createRadialGradient(P[0], P[1], R, P[0], P[1], R * 2.4);
    bg.addColorStop(0, 'rgb(24,19,17)'); bg.addColorStop(.25, 'rgb(12,10,11)'); bg.addColorStop(1, 'rgb(3,3,6)');
    g.fillStyle = bg; g.beginPath(); g.rect(-20, -20, PAGE.IW + 40, PAGE.IH + 40); g.arc(P[0], P[1], R, 0, Math.PI * 2, true); g.fill();
    // baffle rings of the brass tube, catching a little light on the upper left
    for (const [k, a] of [[1.17, .16], [1.38, .10], [1.7, .07], [2.15, .045]]) {
      const rr = R * k; const lg = g.createLinearGradient(P[0] - rr, P[1] - rr, P[0] + rr, P[1] + rr);
      lg.addColorStop(0, rgba(GOLD_L, a)); lg.addColorStop(.5, rgba(GOLD, a * .25)); lg.addColorStop(1, rgba(GOLD, a * .5));
      g.strokeStyle = lg; g.lineWidth = 1.2; g.beginPath(); g.arc(P[0], P[1], rr, 0, 7); g.stroke();
    }
    g.restore();
  }
  function rim(g, P, R, knurl) {
    g.save(); g.translate(P[0], P[1]);
    // knurled focus ring
    const kg = g.createConicGradient(-2.3, 0, 0);
    kg.addColorStop(0, '#8a6428'); kg.addColorStop(.18, '#4a3216'); kg.addColorStop(.42, '#2a1c0e'); kg.addColorStop(.62, '#6a4a1e'); kg.addColorStop(.85, '#3a2812'); kg.addColorStop(1, '#8a6428');
    g.strokeStyle = kg; g.lineWidth = 13; g.beginPath(); g.arc(0, 0, R + 21, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(10,6,2,.55)'; g.lineWidth = 1;
    for (let i = 0; i < 180; i++) { const a = i / 180 * Math.PI * 2 + knurl; g.beginPath(); g.moveTo(Math.cos(a) * (R + 15.5), Math.sin(a) * (R + 15.5)); g.lineTo(Math.cos(a) * (R + 26.5), Math.sin(a) * (R + 26.5)); g.stroke(); }
    // polished brass field ring
    const bg = g.createConicGradient(-2.4, 0, 0);
    bg.addColorStop(0, '#f6dc96'); bg.addColorStop(.1, '#c99a48'); bg.addColorStop(.3, '#6b4618'); bg.addColorStop(.5, '#b8873a'); bg.addColorStop(.6, '#ecc878'); bg.addColorStop(.78, '#76501f'); bg.addColorStop(1, '#f6dc96');
    g.strokeStyle = bg; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, R + 6, 0, 7); g.stroke();
    // engraved graduation on the brass
    g.strokeStyle = 'rgba(40,24,8,.75)'; g.lineWidth = .9;
    for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2, L = i % 6 ? 3.5 : 7; g.beginPath(); g.moveTo(Math.cos(a) * (R + 12), Math.sin(a) * (R + 12)); g.lineTo(Math.cos(a) * (R + 12 - L), Math.sin(a) * (R + 12 - L)); g.stroke(); }
    g.strokeStyle = 'rgba(14,8,2,.95)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R + .5, 0, 7); g.stroke();
    g.strokeStyle = 'rgba(255,236,180,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, R + 12.5, Math.PI * .95, Math.PI * 1.6); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, R + 28, 0, 7); g.stroke();
    g.restore();
  }
  // a line drawn as a gently wobbling polyline (reality bends the instrument too)
  function wline(g, x0, y0, x1, y1, wob, n, seed) {
    const L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L, N = Math.max(2, Math.ceil(L / 14));
    g.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = i / N, x = lerp(x0, x1, t), y = lerp(y0, y1, t);
      const o = wob ? wob * (7 * Math.sin(t * 6.5 + n * 5.3 + seed) + 3 * Math.sin(t * 15 - n * 7 + seed * 2)) * Math.sin(t * Math.PI) : 0;
      i ? g.lineTo(x + nx * o, y + ny * o) : g.moveTo(x + nx * o, y + ny * o);
    }
    g.stroke();
  }
  function reticle(g, n, A) {
    const rk = redK(n), col = mixc(WIRE, RED, rk), on = win(n, 11.5, 11.68), lk = lockK(n), cr = crook(n);
    const wob = 0;
    g.save(); g.beginPath(); g.arc(CX, CY, RF - 1, 0, 7); g.clip();
    g.lineCap = 'round';
    // graduated position-angle circle just inside the field stop
    g.strokeStyle = rgba(col, .5 * on); g.lineWidth = .8;
    g.beginPath(); g.arc(CX, CY, RF - 16, 0, 7); g.stroke();
    for (let i = 0; i < 120; i++) {
      const a = i / 120 * Math.PI * 2 - Math.PI / 2, L = i % 10 === 0 ? 10 : i % 5 === 0 ? 6 : 3;
      g.beginPath(); g.moveTo(CX + Math.cos(a) * (RF - 16), CY + Math.sin(a) * (RF - 16)); g.lineTo(CX + Math.cos(a) * (RF - 16 - L), CY + Math.sin(a) * (RF - 16 - L)); g.stroke();
    }
    g.fillStyle = rgba(col, .6 * on); g.font = 'italic 500 14px Cormorant'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = 'ltr';
    for (let i = 0; i < 12; i++) { if (i % 3 === 0) continue; const a = i / 12 * Math.PI * 2 - Math.PI / 2; g.fillText(String(i * 30), CX + Math.cos(a) * (RF - 36), CY + Math.sin(a) * (RF - 36)); }
    // main cross-wires (double), stopping short of Pluto
    const gap = PR + 34, E = RF - 30;
    g.strokeStyle = rgba(col, .62 * on); g.lineWidth = .9;
    for (const d of [-2.5, 2.5]) {
      wline(g, CX - E, CY + d, CX - gap, CY + d, wob, n, 1); wline(g, CX + gap, CY + d, CX + E, CY + d, wob, n, 2);
      wline(g, CX + d, CY - E, CX + d, CY - gap, wob, n, 3); wline(g, CX + d, CY + gap, CX + d, CY + E, wob, n, 4);
    }
    // scale ticks along the horizontal wire
    g.lineWidth = .8;
    for (let k = gap + 6; k < E - 4; k += 9) { const big = Math.round((k - gap - 6) / 9) % 5 === 0, L = big ? 9 : 4;
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * k, CY + 3); g.lineTo(CX + s * k, CY + 3 + L); g.stroke(); } }
    // the moving micrometer wires + their corner brackets
    const hs = wireHS(n), wa = win(n, W_DEC - .06, W_DEC + .1);
    if (wa > 0) {
      g.strokeStyle = rgba(col, .30 * wa * (1 - .4 * lk)); g.lineWidth = .9;
      for (const s of [-1, 1]) { wline(g, CX + s * hs, CY - RF, CX + s * hs, CY + RF, wob * .8, n, 5 + s); wline(g, CX - RF, CY + s * hs, CX + RF, CY + s * hs, wob * .8, n, 7 + s); }
      const flash = bump(n, W_RISE, .35), tick = Math.max(...STEPS.map(([t]) => bump(n, t, .14)));
      const bc = mixc(mixc(col, [255, 250, 235], Math.max(flash, tick * .6) * (1 - rk)), RED, Math.max(rk, 0));
      g.strokeStyle = rgba(bc, .95 * wa); g.lineWidth = 2.2 + 1.2 * flash; const L = 30;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const x = CX + sx * hs, y = CY + sy * hs;
        g.beginPath(); g.moveTo(x, y - sy * L); g.lineTo(x, y); g.lineTo(x - sx * L, y); g.stroke();
      }
    }
    // the red measuring ring tightening on "יקום"
    const rr = win(n, W_RISE - .02, W_RISE + .1);
    if (rr > 0) {
      const R = lerp(PR * 1.75, PR * 1.07, easeOut((n - W_RISE) / .38)), rot = (n - W_RISE) * .4;
      const rc = mixc([214, 52, 58], RED, rk);
      g.strokeStyle = rgba(rc, .9 * rr); g.lineWidth = 1.6; g.beginPath(); g.arc(CX, CY, R, 0, 7); g.stroke();
      g.lineWidth = 1;
      for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 + rot, L = i % 5 ? 4 : 9; g.beginPath(); g.moveTo(CX + Math.cos(a) * R, CY + Math.sin(a) * R); g.lineTo(CX + Math.cos(a) * (R + L), CY + Math.sin(a) * (R + L)); g.stroke(); }
      // diameter pincers on the horizontal axis
      g.fillStyle = rgba(rc, .9 * rr);
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * (R + 2), CY); g.lineTo(CX + s * (R + 16), CY - 6); g.lineTo(CX + s * (R + 16), CY + 6); g.closePath(); g.fill(); }
      g.font = 'italic 600 18px Cormorant'; g.textAlign = 'left'; g.direction = 'ltr';
      g.fillText('Ø 2377 km', CX + PR + 26, CY + PR + 30);
    }
    g.restore();
  }
  // readouts printed on the dark tube, typed in one per word
  function readouts(g, n) {
    const rk = redK(n), cr = crook(n);
    const items = [[W_DEC, 'RA', '19ʰ 12ᵐ 07ˢ'], [W_NOT, 'DECL', '−21° 04′'], [W_BE, 'MAG', '14,3'], [W_NOR, 'DIAM', '0,1″'], [W_RISE, 'OBIECTVM', 'PLVTO ?']];
    g.save(); g.textBaseline = 'alphabetic'; g.direction = 'ltr';
    const x0 = 74, y0 = 300;
    g.strokeStyle = rgba(GOLD_L, .35 * win(n, W_DEC - .1, W_DEC + .2)); g.lineWidth = 1;
    g.beginPath(); g.moveTo(x0, y0 - 34); g.lineTo(x0 + 190, y0 - 34); g.stroke();
    g.font = '500 12px Cinzel'; g.letterSpacing = '4px'; g.fillStyle = rgba(GOLD_L, .55 * win(n, W_DEC - .1, W_DEC + .2)); g.fillText('OBSERVATIO', x0, y0 - 44);
    items.forEach(([t, k, v], i) => {
      const a = win(n, t - .04, t + .1); if (a <= 0) return;
      const y = y0 + i * 46, last = i === 4;
      const shake = cr * 3 * Math.sin(n * 9 + i * 2) + warpA(n) * 2.5 * Math.sin(n * 7 + i);
      const vc = last ? mixc(GOLD_L, RED, rk) : mixc(CREAM, RED, rk * .85);
      g.font = '500 12px Cinzel'; g.letterSpacing = '4px'; g.fillStyle = rgba(GOLD_L, .6 * a); g.fillText(k, x0, y + shake * .3);
      const chars = Math.ceil(v.length * clamp((n - t) / .22));
      g.font = `italic 500 ${last ? 27 : 24}px Cormorant`; g.letterSpacing = '1px'; g.fillStyle = rgba(vc, .92 * a);
      g.fillText(v.slice(0, chars), x0 + 1, y + 24 + shake);
      g.strokeStyle = rgba(GOLD, .3 * a); g.lineWidth = .8; g.beginPath(); g.moveTo(x0, y + 33); g.lineTo(x0 + 150 * a, y + 33); g.stroke();
    });
    // focus scale on the right: its index hunts with the focus, then trembles while reality bends
    const fa = win(n, 11.5, 11.7), fx = 1366, ft = 286, fb = 556;
    const fp = focusPos(n) + warpA(n) * .16 * Math.sin(n * 8.3) + .1 * cr * Math.sin(n * 13);
    g.textAlign = 'right'; g.font = '500 12px Cinzel'; g.letterSpacing = '4px'; g.fillStyle = rgba(GOLD_L, .55 * fa); g.fillText('FOCVS', fx, ft - 30);
    g.strokeStyle = rgba(GOLD_L, .35 * fa); g.lineWidth = 1; g.beginPath(); g.moveTo(fx - 120, ft - 20); g.lineTo(fx, ft - 20); g.stroke();
    g.strokeStyle = rgba(GOLD_L, .5 * fa); g.lineWidth = .9; g.beginPath(); g.moveTo(fx, ft); g.lineTo(fx, fb); g.stroke();
    g.font = 'italic 500 15px Cormorant'; g.letterSpacing = '0px'; g.fillStyle = rgba(GOLD_L, .5 * fa);
    for (let i = 0; i <= 27; i++) { const y = lerp(fb, ft, i / 27), big = i % 9 === 0, L = big ? 14 : i % 3 === 0 ? 8 : 4;
      g.beginPath(); g.moveTo(fx, y); g.lineTo(fx - L, y); g.stroke(); if (big) g.fillText(String(i / 9 * 10 + 30), fx - 20, y + 5); }
    const iy = lerp(fb, ft, clamp(fp)), ic = mixc(CREAM, RED, rk);
    g.fillStyle = rgba(ic, .9 * fa); g.beginPath(); g.moveTo(fx + 3, iy); g.lineTo(fx + 15, iy - 6); g.lineTo(fx + 15, iy + 6); g.closePath(); g.fill();
    g.strokeStyle = rgba(ic, .5 * fa); g.beginPath(); g.moveTo(fx - 70, iy); g.lineTo(fx - 26, iy); g.stroke();
    // plate legend, lower left / right
    g.textAlign = 'left'; g.letterSpacing = '0px'; g.font = 'italic 500 19px Cormorant'; g.fillStyle = rgba(GOLD_L, .45); g.fillText('fig. II — per tubum spectatum', 74, 760);
    g.textAlign = 'right'; g.font = '500 12px Cinzel'; g.letterSpacing = '4px'; g.fillText('OCVLARE · × CCC', 1366, 760);
    g.restore();
  }

  // ---------------- caption + folio cross-dissolve at the cut (page 1 -> page 2 lives on the same spread) ----------------
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

  SCENE({
    id: 's2', start: 11.3, trans: 'cut', tdur: .5, folio: 2,
    plate: { lat: 'TABVLA II · PER TVBVM', he: 'מבעד לטלסקופ' },
    ill(g, n, lt) {
      const u = tIn(n), te = ease(clamp(u / .76)), inT = u < 1;
      const R0 = Math.max(...[[0, 0], [PAGE.IW, 0], [0, PAGE.IH], [PAGE.IW, PAGE.IH]].map(([x, y]) => Math.hypot(x - ZT[0], y - ZT[1]))) + 45;
      const R = inT ? lerp(R0, RF, te) : RF;
      const P = inT ? [lerp(ZT[0], CX, te), lerp(ZT[1], CY, te)] : [CX, CY];
      const Z1 = Math.pow(PR / R1, te), Zf = Z1 * R1 / PR;
      const fa = inT ? win(u, .2, .6) : 1;
      g.fillStyle = '#05050a'; g.fillRect(0, 0, PAGE.IW, PAGE.IH);
      if (inT && fa < 1) {           // page 1, rushing toward Pluto
        const s1p = sceneById('s1');
        P1G.setTransform(1, 0, 0, 1, 0, 0); P1G.globalAlpha = 1; P1G.globalCompositeOperation = 'source-over'; P1G.filter = 'none'; P1G.clearRect(0, 0, PAGE.IW, PAGE.IH);
        P1G.save(); s1p.ill(P1G, n, n - s1p.start); P1G.restore();
        const s1 = P1;
        g.save(); g.translate(P[0], P[1]); g.scale(Z1, Z1); g.translate(-ZT[0], -ZT[1]); g.drawImage(s1, 0, 0);
        g.fillStyle = `rgba(4,4,10,${.45 * te})`; g.fillRect(0, 0, PAGE.IW, PAGE.IH); g.restore();
      }
      drawField(n, P, Zf);
      const A = warpA(n), cr = crook(n), warping = A > .002 || cr > .002;
      if (warping) reticle(FG, n, A);                 // the reticle bends with the world inside the crooked lens
      const src = warping ? warpInto(FC, A, n, cr) : FC;
      const b = blurAt(n);
      g.save(); g.beginPath(); g.arc(P[0], P[1], R, 0, 7); g.clip();
      g.globalAlpha = fa;
      if (b > .15) {                 // defocus: blur a half-res copy (4x cheaper), draw it back up
        HG.setTransform(1, 0, 0, 1, 0, 0); HG.clearRect(0, 0, HB.width, HB.height); HG.drawImage(src, 0, 0, HB.width, HB.height);
        g.filter = `blur(${(b / 2).toFixed(2)}px)`; g.imageSmoothingQuality = 'high'; g.drawImage(HB, 0, 0, PAGE.IW, PAGE.IH);
        if (b < 1.2) { g.filter = 'none'; g.globalAlpha = fa * (1 - b / 1.2); g.drawImage(src, 0, 0); }
      } else g.drawImage(src, 0, 0);
      g.restore(); g.filter = 'none'; g.globalAlpha = 1;
      // eyepiece fall-off at the field stop
      const vg = g.createRadialGradient(P[0], P[1], R * .78, P[0], P[1], R);
      vg.addColorStop(0, 'rgba(2,3,10,0)'); vg.addColorStop(1, 'rgba(2,3,10,.62)');
      g.fillStyle = vg; g.beginPath(); g.arc(P[0], P[1], R, 0, 7); g.fill();
      if (!warping && (!inT || u > .4)) { g.save(); g.translate(P[0], P[1]); g.scale(R / RF, R / RF); g.translate(-CX, -CY); reticle(g, n, A); g.restore(); }
      tube(g, P, R);
      rim(g, P, R, -(1 - blurAt(n) / 7) * .9 + .25 * Math.sin(n * .3));
      if (!inT || u > .5) { g.save(); g.globalAlpha = inT ? win(u, .5, .8) : 1; readouts(g, n); g.restore(); }
    },
    over(p, n, lt) {
      const u = tIn(n); if (u >= 1) return;
      const s1 = sceneById('s1');
      // page 1's margin drawings (the astronomer) fade as we dive into his eyepiece
      if (s1 && s1.over) {
        try { OG.setTransform(1, 0, 0, 1, 0, 0); OG.globalAlpha = 1; OG.clearRect(0, 0, W, H); OG.save(); s1.over(OG, n, n - s1.start); OG.restore();
          const { IX, IY, IW, IH } = PAGE;
          p.save(); p.globalAlpha = 1 - win(u, 0, .32); p.beginPath(); p.rect(IX, IY, IW, IH); p.clip(); p.drawImage(OV, 0, 0); p.restore();
          p.save(); p.globalAlpha = 1 - win(u, .25, .9); p.beginPath(); p.rect(0, 0, W, H); p.rect(IX, IY, IW, IH); p.clip('evenodd'); p.drawImage(OV, 0, 0); p.restore();
        } catch (e) { }
      }
      // cross-dissolve caption + folio (repaint the paper under them, redraw the narration clipped to that strip)
      if (!NOBOOK) {
      const { IX, IY, IW, IH } = PAGE, cy = IY + IH + 34;
      p.save(); p.beginPath(); p.rect(IX - 20, cy - 15, IW + 40, 30); p.rect(W / 2 - 80, 1030, 160, 32); p.clip();
      p.drawImage(PAPER, 0, 0); drawTextLine(p, n); p.restore();
      caption(p, s1, 1 - win(u, 0, .42)); caption(p, this, win(u, .5, .95));
      }
    },
  });
})();
