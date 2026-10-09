// ===================== "שדרת הכוכבים" - the avenue of stars (the solar system as a walk of fame) =====================
'use strict';
const AVENUE = (() => {
  // world units = px at zoom 1. x grows to the right (the Sun side). Pluto is the 9th, at the far left end.
  const B = [
    { k: 'sun', x: 1720, r: 210, name: '' },
    { k: 'mercury', x: 1270, r: 24, name: { lat: 'MERCVRIVS', he: 'חמה' } },
    { k: 'venus', x: 1090, r: 40, name: { lat: 'VENVS', he: 'נוגה' } },
    { k: 'earth', x: 890, r: 43, name: { lat: 'TERRA', he: 'כדור הארץ' } },
    { k: 'mars', x: 705, r: 31, name: { lat: 'MARS', he: 'מאדים' } },
    { k: 'jupiter', x: 430, r: 112, name: { lat: 'IVPPITER', he: 'צדק' } },
    { k: 'saturn', x: 20, r: 86, name: { lat: 'SATVRNVS', he: 'שבתאי' } },
    { k: 'uranus', x: -320, r: 57, name: { lat: 'VRANVS', he: 'אורנוס' } },
    { k: 'neptune', x: -590, r: 54, name: { lat: 'NEPTVNVS', he: 'נפטון' } },
    { k: 'pluto', x: -880, r: 36, name: { lat: 'PLVTO', he: 'פלוטו' } },
  ];
  const ROAD_Y = 250, PLQ = 128, LEFT_END = -1060, RIGHT_END = 1560;
  const hoverY = (b, i, t) => ROAD_Y - 78 - b.r + 6 * Math.sin(t * .8 + i * 1.7);
  const S = (x, y, c) => [PAGE.IW / 2 + (x - c.x) * c.z, PAGE.IH / 2 + (y - c.y) * c.z];
  function pluto(t, o = {}) { const b = B[9]; const p = o.plutoPos || [b.x, hoverY(b, 9, t)]; return { x: p[0], y: p[1], r: b.r * (o.plutoScale || 1) }; }
  // cam: {x, y, z}.  o: {space:{...SPACE opts}, pluto:{...drawPluto opts}, plutoPos:[x,y], plutoScale, hidePluto, charon:true,
  //       plaque:{pluto:{...drawPlaque opts}}, fans:1, lights:1, dim:0, gray:0, plutoSpot (0..1 extra spotlight on Pluto), beforePluto(g,cam), afterPluto(g,cam)}
  function draw(g, t, cam, o = {}) {
    const sp = Object.assign({ t, cam: [cam.x / 2400, cam.y / 2400], zoom: 1 + (cam.z - 1) * .12, neb: .55, galx: .7, gpos: [.5, -.3] }, o.space || {});
    SPACE.draw(g, sp);
    STARS.draw(g, { t, cam: [cam.x / 1500, cam.y / 1500], zoom: 1 + (cam.z - 1) * .25, dim: 1 - (o.dim || 0) * .6 });
    DUST.draw(g, { t, cam: [cam.x / 900, 0], alpha: .7 });
    // the promenade: a dark glassy band edged with fine gold rules and studs (an atlas "walk of fame")
    const [x0, y0] = S(RIGHT_END, ROAD_Y - 44, cam), [x1, y1] = S(LEFT_END, ROAD_Y + 52, cam);
    const cxs = PAGE.IW / 2, sk = .22;                    // perspective skew: near edge spreads away from the centre
    g.save();
    let gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(26,36,74,.55)'); gr.addColorStop(1, 'rgba(14,20,44,.75)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x1, y0); g.lineTo(x0, y0); g.lineTo(x0 + (x0 - cxs) * sk, y1); g.lineTo(x1 + (x1 - cxs) * sk, y1); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(160,175,230,.10)'; g.lineWidth = Math.max(.7, cam.z * .8);
    for (let wx = LEFT_END; wx <= RIGHT_END; wx += 150) { const [sx] = S(wx, 0, cam); if (sx < -400 || sx > PAGE.IW + 400) continue; g.beginPath(); g.moveTo(sx, y0); g.lineTo(sx + (sx - cxs) * sk, y1); g.stroke(); }
    g.strokeStyle = rgba(GOLD_L, .75); g.lineWidth = Math.max(1, 1.3 * cam.z);
    g.beginPath(); g.moveTo(x1, y0); g.lineTo(x0, y0); g.moveTo(x1 + (x1 - cxs) * sk, y1); g.lineTo(x0 + (x0 - cxs) * sk, y1); g.stroke();
    g.lineWidth = Math.max(.5, .6 * cam.z); g.strokeStyle = rgba(GOLD_L, .3);
    g.beginPath(); g.moveTo(x1, y0 + 5 * cam.z); g.lineTo(x0, y0 + 5 * cam.z); g.stroke();
    for (let wx = LEFT_END + 30; wx <= RIGHT_END; wx += 75) { for (const wy of [ROAD_Y - 44, ROAD_Y + 52]) { let [sx, sy] = S(wx, wy, cam); if (wy > ROAD_Y) sx += (sx - cxs) * sk; if (sx < -10 || sx > PAGE.IW + 10) continue;
      g.fillStyle = rgba(GOLD_L, .55 + .35 * Math.sin(t * 1.7 + wx * .03)); g.beginPath(); g.arc(sx, sy, Math.max(1, 1.8 * cam.z), 0, 7); g.fill(); } }
    g.restore();
    // fine dashed plumb lines from each body to its plaque (atlas annotation)
    g.save(); g.setLineDash([3 * cam.z, 5 * cam.z]); g.strokeStyle = rgba(GOLD_L, .35); g.lineWidth = Math.max(.6, .8 * cam.z);
    B.forEach((b, i) => { if (b.k === 'sun') return; const [X, Y0] = S(b.x, hoverY(b, i, t) + b.r + 6, cam), [, Y1] = S(b.x, ROAD_Y - 30, cam); if (X < -20 || X > PAGE.IW + 20) return; g.beginPath(); g.moveTo(X, Y0); g.lineTo(X, Y1); g.stroke(); });
    g.restore();
    // plaques
    B.forEach((b, i) => {
      if (b.k === 'sun') return; const [X, Y] = S(b.x, ROAD_Y, cam); if (X < -200 || X > PAGE.IW + 200) return;
      const po = b.k === 'pluto' ? Object.assign({ glow: .5 }, (o.plaque && o.plaque.pluto) || {}) : {};
      drawPlaque(g, X, Y, PLQ * cam.z, b.name, Object.assign({ persp: .42 }, po));
      if (b.k === 'pluto' && o.afterPlaque) o.afterPlaque(g, X, Y, cam);
    });
    // fans: tiny comet-visitors strolling along the avenue; they hop carefully over Pluto's star
    const F = o.fans === undefined ? 1 : o.fans;
    if (F > 0) {
      g.save(); g.globalCompositeOperation = 'lighter';
      const px = B[9].x;
      for (let i = 0; i < 14; i++) {
        const ph = ((t * .055 + i / 14) % 1 + 1) % 1, wx = RIGHT_END - 120 - ph * (RIGHT_END - LEFT_END - 60);
        let wy = ROAD_Y + (i % 3 - 1) * 24 - 3 * Math.abs(Math.sin(t * 6 + i));
        const dx = wx - px; if (Math.abs(dx) < 95) wy -= Math.sin((dx + 95) / 190 * Math.PI) * 130;   // the respectful hop over Pluto's star
        const [X, Y] = S(wx, wy - 12, cam); if (X < -60 || X > PAGE.IW + 60) continue;
        const c = [[255, 232, 190], [205, 232, 236], [250, 215, 210]][i % 3], s2 = (2.2 + (i % 4) * .5) * cam.z;
        const tg = g.createLinearGradient(X, Y, X + s2 * 14, Y); tg.addColorStop(0, rgba(c, .75 * F)); tg.addColorStop(1, rgba(c, 0));
        g.strokeStyle = tg; g.lineWidth = Math.max(.8, s2 * .7); g.beginPath(); g.moveTo(X, Y); g.lineTo(X + s2 * 14, Y - (Math.abs(dx) < 95 ? Math.cos((dx + 95) / 190 * Math.PI) * s2 * 3 : 0)); g.stroke();
        g.fillStyle = rgba(c, .95 * F); g.beginPath(); g.arc(X, Y, s2, 0, 7); g.fill();
      }
      g.restore();
    }
    // the sun at the right end, and the bodies
    const [sx, sy] = S(B[0].x, hoverY(B[0], 0, t) + 80, cam); if (sx - B[0].r * cam.z * 4 < PAGE.IW) drawSun(g, sx, sy, B[0].r * cam.z, 1, t);
    B.forEach((b, i) => {
      if (b.k === 'sun') return;
      if (b.k === 'pluto') {
        if (o.beforePluto) o.beforePluto(g, cam);
        if (!o.hidePluto) {
          const p = pluto(t, o); const [X, Y] = S(p.x, p.y, cam);
          if (o.charon !== false) { const a = t * .7; const cx = p.x + Math.cos(a) * 70, cy = p.y - 8 + Math.sin(a) * 16; const [CX, CY] = S(cx, cy, cam);
            const behind = Math.sin(a) < 0; const ch = () => drawCharon(g, CX, CY, 14 * cam.z, { spin: t * .3, light: [.6, -.5], face: { smile: .5, blush: .4, size: .95, look: [-1, 0] } });
            if (behind) ch(); drawPluto(g, X, Y, p.r * cam.z, Object.assign({ spin: .05 * Math.sin(t * .5), light: [.65, -.5], glow: .25 + .15 * Math.sin(t * 2.2) }, o.pluto || {})); if (!behind) ch(); }
          else drawPluto(g, X, Y, p.r * cam.z, Object.assign({ spin: .05 * Math.sin(t * .5), light: [.65, -.5], glow: .25 }, o.pluto || {}));
        }
        if (o.afterPluto) o.afterPluto(g, cam);
        return;
      }
      const y = hoverY(b, i, t); const [X, Y] = S(b.x, y, cam), R = b.r * cam.z;
      if (X + R * 2.4 < 0 || X - R * 2.4 > PAGE.IW || Y + R * 2.4 < 0 || Y - R * 2.4 > PAGE.IH) return;
      drawPlanet(g, b.k, X, Y, R, { spin: t * .12 + i, light: [.65, -.5], gray: o.gray || 0 });
    });
  }
  return { draw, B, ROAD_Y, S, pluto, hoverY, LEFT_END, RIGHT_END };
})();
