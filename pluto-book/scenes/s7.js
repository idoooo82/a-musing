// ===================== PAGE 7 — back on the Via Stellarum: "small, but all gold" (n 54.45 .. 62.4) =====================
(() => {
  const camAt = n => {
    const a = { x: -770, y: 128, z: 2.15 }, b = { x: -690, y: 112, z: 1.45 }, c = { x: -840, y: 132, z: 2.0 };
    const u = win(n, 58.0, 59.6), v = win(n, 60.3, 61.8);
    return { x: lerp(lerp(a.x, b.x, u), c.x, v), y: lerp(lerp(a.y, b.y, u), c.y, v), z: lerp(lerp(a.z, b.z, u), c.z, v) + .01 * Math.sin(n * .7) };
  };
  const gold = n => win(n, 60.38, 61.35);
  function plutoFace(n) {
    const serene = pulse(n, 56.7, 57.15, 58.0, 58.5);
    const listen = pulse(n, 54.7, 55.2, 56.6, 56.9);
    return { smile: lerp(.55, .85, Math.max(serene, gold(n))) - .3 * listen, open: 1 - .85 * serene, look: [-.7 * listen, .1 * listen], brow: .15 * listen };
  }
  SCENE({
    id: 's7', start: 54.45, trans: 'turn', tdur: .7, folio: 7, plate: { lat: 'TABVLA VII · PARVVS SED AVREVS', he: 'קטן, אבל כולו זהב' },
    ill(g, n, lt) {
      const cam = camAt(n), G = gold(n);
      AVENUE.draw(g, n, cam, {
        space: { warm: .55 * G, gold: .35 * G, neb: .55 + .2 * G },
        pluto: { light: [.68, -.48], lightCol: [1, .97 - .05 * G, .9 - .15 * G], glow: .2 + .55 * G, gold: G, face: plutoFace(n),
                 light2: { dir: [-.5, .6], col: [255, 200, 110], k: .7 * G } },
        plaque: { pluto: { gold: win(n, 60.6, 61.5), glow: .4 + .5 * G } },
        plutoSpot: 0, charon: false,
        afterPluto: (g2, cm) => {
          const p = AVENUE.pluto(n), [X, Y] = AVENUE.S(p.x, p.y, cm), R = p.r * cm.z;
          // "קטן" — an engraved caliper, affectionate this time
          const k = pulse(n, 59.4, 59.75, 60.5, 60.9);
          if (k > 0) {
            g2.save(); g2.globalAlpha = k; g2.strokeStyle = rgba(GOLD_L, .95); g2.lineWidth = 1.4;
            const y0 = Y - R - 26, w = R * (1 - .0 * k);
            g2.beginPath(); g2.moveTo(X - w, Y - R * .2); g2.lineTo(X - w, y0 - 8); g2.moveTo(X + w, Y - R * .2); g2.lineTo(X + w, y0 - 8);
            g2.moveTo(X - w, y0); g2.lineTo(X + w, y0); g2.stroke();
            for (const s of [-1, 1]) { g2.beginPath(); g2.moveTo(X + s * w, y0); g2.lineTo(X + s * (w - 7), y0 - 4); g2.moveTo(X + s * w, y0); g2.lineTo(X + s * (w - 7), y0 + 4); g2.stroke(); }
            g2.font = '600 15px Cinzel'; g2.letterSpacing = '5px'; g2.fillStyle = rgba(GOLD_L); g2.textAlign = 'center'; g2.direction = 'ltr'; g2.fillText('PARVVS', X, y0 - 20); g2.letterSpacing = '0px';
            g2.restore();
          }
          // "כולו זהב" — AVREVS + a few fine golden glints
          const a = win(n, 61.05, 61.5);
          if (a > 0) {
            g2.save(); g2.globalAlpha = a; g2.font = '600 19px Cinzel'; g2.letterSpacing = '9px'; g2.textAlign = 'center'; g2.direction = 'ltr';
            g2.fillStyle = rgba([246, 212, 128]); g2.fillText('AVREVS', X, Y - R - 46 + 6 * (1 - a)); g2.letterSpacing = '0px'; g2.restore();
          }
          if (G > 0) for (let i = 0; i < 9; i++) {
            const an = i / 9 * 6.283 + n * .35, rr = R * (1.5 + .25 * Math.sin(n * 1.3 + i));
            glint(g2, X + Math.cos(an) * rr, Y + Math.sin(an) * rr * .8, (3 + 4 * Math.max(0, Math.sin(n * 2.4 + i * 1.7))) * G, .85 * G, [255, 228, 160]);
          }
        }
      });
      // words of the bubble dissolve into tiny stars that drift into the plate
      const d = win(n, 56.85, 57.9);
      if (d > 0 && d < 1) for (let i = 0; i < 14; i++) {
        const r0 = mulberry(i * 7 + 3); const sx = -30 + r0() * 60, sy = 640 + r0() * 80, tx = 120 + r0() * 520, ty = 380 + r0() * 300;
        const u = easeOut(clamp(d * 1.25 - r0() * .25));
        glint(g, lerp(sx, tx, u), lerp(sy, ty, u) - 30 * Math.sin(u * Math.PI), 2 + 3 * (1 - u), (1 - u * .4) * (u > 0 ? 1 : 0), [255, 240, 205]);
      }
    },
    over(p, n, lt) {
      // the tiny astronomer in the left margin, with his little speech bubble
      const vis = win(n, 54.6, 55.0) * (1 - win(n, 59.0, 59.6)); if (vis <= 0) return;
      p.save(); p.globalAlpha = vis;
      const talk = n > 54.94 && n < 56.7 ? .5 + .5 * Math.abs(Math.sin(n * 13)) : 0;
      drawAstronomer(p, 132, 868, 130, { pose: n < 57.0 ? 'point' : 'stand', arm: win(n, 54.7, 55.0) * (1 - win(n, 56.9, 57.3)), face: 1, talk, blink: bump(n, 57.6, .18) });
      const b = win(n, 54.9, 55.15) * (1 - win(n, 56.85, 57.3));
      if (b > 0) drawBubble(p, 150, 640, 250, 118, 150, 760, 'לא כל כך...', { alpha: b, scale: .9 + .1 * easeBack(win(n, 54.9, 55.2)), size: 50 });
      p.restore();
    }
  });
})();
