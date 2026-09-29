// Sound effects for "בשביל החלה", all made in the browser (no audio files, nothing to download).
// ChallahSfx.create(audioContext, outputNode) returns one function per sound. Each takes an optional start time.
(function (root) {
  'use strict';

  function create(ctx, out) {
    // everything the effects make goes through one small compressor, so a big hit can never distort
    const bus = ctx.createDynamicsCompressor();
    bus.threshold.value = -12; bus.knee.value = 8; bus.ratio.value = 5; bus.attack.value = .002; bus.release.value = .16;
    bus.connect(out);

    const N = ctx.sampleRate * 2, nbuf = ctx.createBuffer(1, N, ctx.sampleRate), nd = nbuf.getChannelData(0);
    for (let i = 0; i < N; i++) nd[i] = Math.random() * 2 - 1;

    // each sound gets its own volume knob; helpers write to `dest`, which is the knob of the sound being played
    let dest = bus;
    const at = (t) => (t === undefined ? ctx.currentTime : t);
    const FLOOR = .0001;
    function shape(g, t, a, peak, dur) {
      const attack = Math.max(a, .001);
      g.gain.setValueAtTime(FLOOR, t);
      g.gain.linearRampToValueAtTime(Math.max(peak, FLOOR * 2), t + attack);
      g.gain.exponentialRampToValueAtTime(FLOOR, t + Math.max(dur, attack + .01));
    }
    // a pitched sound that glides from f0 to f1
    function tone(type, f0, f1, t, dur, peak, a, lp) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      shape(g, t, a === undefined ? .004 : a, peak, dur);
      let node = o;
      if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); node = f; }
      node.connect(g); g.connect(dest);
      o.start(t); o.stop(t + dur + .06);
    }
    // filtered noise: air, rumble, crackle
    function noise(t, dur, peak, o) {
      o = o || {};
      const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass'; f.Q.value = o.q === undefined ? 1 : o.q;
      const f0 = o.f0 || 800, f1 = o.f1 || f0;
      f.frequency.setValueAtTime(f0, t);
      if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
      const g = ctx.createGain(); shape(g, t, o.a === undefined ? .005 : o.a, peak, dur);
      s.connect(f); f.connect(g); g.connect(dest);
      s.start(t, Math.random() * 1.4); s.stop(t + dur + .06);
    }

    const api = {
      // the siren when the battle starts
      alarm(t) { t = at(t); [540, 650, 540].forEach((f, i) => tone('sawtooth', f, f, t + i * .36, .3, .2, .01, 1800)); },

      // one laser shot outside the window ("pew"); p changes the pitch so shots differ
      laser(p, t) { t = at(t); p = p || 1;
        tone('sawtooth', 2600 * p, 420 * p, t, .18, .26, .002, 7000);
        tone('square', 1300 * p, 210 * p, t, .12, .1, .001);
        noise(t, .04, .12, { type: 'highpass', f0: 4000, a: .001 }); },

      // the ship is hit; k is how hard (grows with the score)
      hit(k, t) { t = at(t); k = Math.min(3, Math.max(.6, k || 1)); const s = Math.min(k, 1.7);
        tone('sine', 130, 34, t, .45 + .1 * k, .85 * s / 1.7 + .1, .002);
        noise(t, .5 + .25 * k, .5 * s / 1.7 + .1, { type: 'lowpass', f0: 520, f1: 80, q: .7, a: .004 });
        noise(t + .06, .45, .12, { type: 'bandpass', f0: 2000, f1: 700, q: 7, a: .01 });
        for (let i = 0; i < 3 + Math.round(k); i++) noise(t + .12 + Math.random() * .45, .03, .1, { type: 'highpass', f0: 3500, a: .001 });
        tone('square', 900, 180, t + .02, .12, .09, .001); },

      // a challah falling through the air
      whoosh(dur, t) { t = at(t); dur = Math.min(1, Math.max(.4, dur || .7));
        noise(t, dur, .13, { type: 'bandpass', f0: 1800, f1: 380, q: 1.1, a: dur * .3 }); },
      // it lands
      thud(t) { t = at(t);
        tone('sine', 150, 55, t, .15, .38, .002);
        noise(t, .05, .14, { type: 'lowpass', f0: 900, f1: 300, a: .001 }); },
      // the last two seconds of the five-second rule
      tick(last, t) { t = at(t); const f = last ? 1900 : 1300; tone('sine', f, f, t, .05, .2, .001); },

      // Bat Chen picks a challah up
      pickup(t) { t = at(t); tone('triangle', 320, 700, t, .1, .24, .003); },
      // the kiss ("mwah")
      smooch(t) { t = at(t);
        tone('sine', 190, 250, t, .09, .16, .01);
        noise(t + .07, .05, .42, { type: 'bandpass', f0: 2400, f1: 900, q: 3, a: .001 });
        tone('sine', 1500, 520, t + .06, .1, .26, .002); },
      // a small blessing sparkle after the kiss
      chime(t) { t = at(t); [1047, 1568, 2093].forEach((f, i) => tone('sine', f, f, t + i * .07, .55, .16, .004)); },
      // the challah is put back on the table
      tap(t) { t = at(t);
        tone('triangle', 210, 100, t, .1, .36, .002);
        noise(t, .04, .16, { type: 'bandpass', f0: 1400, f1: 900, q: 2, a: .001 }); },
      // +1 (bonus: an extra note for the quick kiss)
      score(bonus, t) { t = at(t); const n = bonus ? [1319, 1568, 2093] : [1319, 1760];
        n.forEach((f, i) => tone('sine', f, f, t + i * .07, .3, .18, .003)); },
      // a challah is lost
      lose(t) { t = at(t);
        tone('sawtooth', 330, 80, t, .5, .3, .01, 900);
        tone('square', 70, 38, t, .3, .3, .005);
        noise(t, .06, .2, { type: 'highpass', f0: 2500, a: .001 }); },

      // "בל תשחית": rising sweep, a big boom exactly when the title slams in, then a bright chord
      superMove(t) { t = at(t);
        noise(t, .55, .3, { type: 'bandpass', f0: 300, f1: 5000, q: 1.5, a: .3 });
        tone('sawtooth', 110, 660, t, .5, .18, .05, 3000);
        const b = t + .22;
        tone('sine', 90, 28, b, 1, .95, .003);
        noise(b, 1.1, .5, { type: 'lowpass', f0: 600, f1: 70, q: .7, a: .004 });
        [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, b + i * .04, 1, .15, .01)); },

      // doors: air hiss, a small motor, and a clunk at the end
      doorOpen(t) { t = at(t);
        noise(t, .6, .24, { type: 'bandpass', f0: 500, f1: 2600, q: .8, a: .05 });
        tone('sawtooth', 180, 420, t, .5, .08, .05, 1200);
        tone('sine', 100, 50, t + .55, .14, .42, .002); },
      doorClose(t) { t = at(t);
        noise(t, .55, .24, { type: 'bandpass', f0: 2600, f1: 500, q: .8, a: .04 });
        tone('sawtooth', 420, 180, t, .45, .08, .04, 1200);
        tone('sine', 100, 50, t + .5, .14, .42, .002); },
      // the air rushing out while the back door is open
      windOn(t) { t = at(t); if (api._wind) return;
        const s = ctx.createBufferSource(); s.buffer = nbuf; s.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = .6;
        const g = ctx.createGain(); g.gain.setValueAtTime(FLOOR, t); g.gain.linearRampToValueAtTime(.13, t + .5);
        const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = .7; lg.gain.value = 180;
        l.connect(lg); lg.connect(f.frequency);
        s.connect(f); f.connect(g); g.connect(dest); s.start(t); l.start(t);
        api._wind = { s, g, l }; },
      windOff(t) { const w = api._wind; if (!w) return; t = at(t); api._wind = null;
        w.g.gain.cancelScheduledValues(t); w.g.gain.setValueAtTime(Math.max(w.g.gain.value, FLOOR), t);
        w.g.gain.linearRampToValueAtTime(FLOOR, t + .6); w.s.stop(t + .7); w.l.stop(t + .7); },

      // the oven "ding"
      bell(t) { t = at(t);
        tone('sine', 1568, 1568, t, 1.4, .24, .002);
        tone('sine', 2349, 2349, t, 1, .07, .002);
        tone('sine', 3136, 3136, t, .7, .07, .002);
        tone('sine', 110, 60, t + .0, .15, .3, .002); },
      // a short blip that says "I heard your kiss"
      confirm(t) { t = at(t); tone('sine', 880, 1320, t, .1, .22, .003); },
      // end of the round
      gameOver(t) { t = at(t);
        [523, 466, 392, 311].forEach((f, i) => tone('triangle', f, f, t + i * .3, .4, .16, .01));
        tone('sine', 80, 40, t + .9, .6, .42, .01); },
    };
    api._wind = null;
    // loudness per sound (measured against the music so nothing hides and nothing hurts)
    const LEVEL = { alarm: .7, laser: .34, hit: .72, whoosh: 1.7, thud: .5, tick: .55, pickup: .6, smooch: .8, chime: .62,
      tap: .5, score: .55, lose: .55, superMove: .82, doorOpen: .55, doorClose: .55, windOn: .55, bell: .5, confirm: .6, gameOver: .5 };
    Object.keys(LEVEL).forEach((name) => {
      const f = api[name], lg = ctx.createGain(); lg.gain.value = LEVEL[name]; lg.connect(bus);
      api[name] = function () { const prev = dest; dest = lg; try { return f.apply(api, arguments); } finally { dest = prev; } };
    });
    return api;
  }

  root.ChallahSfx = { create };
})(typeof globalThis !== 'undefined' ? globalThis : this);
