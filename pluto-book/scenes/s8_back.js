// ===================== s8: the back cover - the book closes on a golden Pluto (n 62.4 .. end) =====================
'use strict';
SCENE({
  id: 's8', start: 62.4, trans: 'turn', tdur: .9, layout: 'full', text: false,
  page(p, n, lt) {
    const t = n;
    p.drawImage(clothTex(), 0, 0);
    coverFrame(p, t, .6);
    // golden Pluto in a smaller porthole of light
    port.ring = 'PARVVS · SED TOTVS AVREVS · PARVVS · SED TOTVS AVREVS · '; port.ringRot = -n * .03;
    porthole(p, 960, 430, 250, t, (g, S) => {
      g.save(); g.globalCompositeOperation = 'lighter';
      const gr = g.createRadialGradient(320, 330, 40, 320, 330, 330); gr.addColorStop(0, 'rgba(255,200,110,.22)'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 640, 640);
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283 + t * .2, rr = 214 + 10 * Math.sin(t + i); glint(g, 320 + Math.cos(a) * rr, 330 + Math.sin(a) * rr * .5, 5 + 4 * Math.sin(t * 2 + i), .7, [255, 228, 160]); }
      g.restore();
      const wink = pulse(n, 63.35, 63.55, 64.15, 64.4);
      drawPluto(g, 320, 330 + 5 * Math.sin(t * 1.1), 150, { gold: 1, glow: .9, spin: .05 * Math.sin(t * .6), light: [-.6, -.55], face: { smile: .9, wink: Math.min(1, wink * 1.4) } });
    });
    foilText(p, 'סוף', 960, 808, 140, { weight: 900, glow: .3 + .2 * Math.sin(t * 1.5), sheen: (n - 62.9) / 1.2 });
    foilText(p, 'קטן, אבל כולו זהב', 960, 912, 54, { weight: 500, fill: '#f1dfb6', glow: .2 });
    p.save(); p.font = '600 15px Cinzel'; p.letterSpacing = '7px'; p.fillStyle = rgba(GOLD_L, .85); p.textAlign = 'center'; p.direction = 'ltr'; p.fillText('FINIS', 960, 980); p.restore();
    DUST.draw(p, { t, alpha: .5 }, W, H);
  }
});
