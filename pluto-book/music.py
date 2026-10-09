"""Score + sound design for the Pluto film, synthesized in numpy, cued to narration word times.
Writes audio/music.wav (music+sfx, stereo) and audio/mix.wav (with narration, ducked) + audio/final.m4a (loudnorm)."""
import numpy as np, subprocess, json, os
from scipy import signal as ss
D = os.path.dirname(os.path.abspath(__file__))
SR = 48000; LEAD = 2.0; DUR = 68.0; N = int(DUR * SR)
rng = np.random.default_rng(9)
F = lambda n: n + LEAD                          # narration time -> film time
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))

def m2f(m): return 440.0 * 2 ** ((m - 69) / 12)
def put(buf, x, t, pan=0.0, g=1.0):
    i = int(t * SR)
    if i >= N or len(x) == 0: return
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += x[:n] * g * l * 1.414; buf[i:i + n, 1] += x[:n] * g * r * 1.414
def env(n, a, r, hold=None):
    e = np.ones(n); A = min(n, int(a * SR)); R = min(n - A, int(r * SR))
    if A: e[:A] = np.linspace(0, 1, A) ** 1.5
    if R: e[n - R:] *= np.linspace(1, 0, R) ** 1.3
    return e
def tt(d): return np.arange(int(d * SR)) / SR

# ---------------- instruments ----------------
def harp(f, dur=2.4, amp=.18, bright=1.0):
    t = tt(dur); x = np.zeros_like(t)
    for k in range(1, 8):
        x += np.sin(2 * np.pi * f * k * (1 + .0007 * k * k) * t + rng.random()) / k ** (1.25 / bright) * np.exp(-t * (1.6 + .9 * k))
    return x * amp * np.minimum(t / .004, 1)
def musicbox(f, dur=2.2, amp=.12, detune=0.0):
    t = tt(dur); f = f * (1 + detune)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) + .45 * np.sin(2 * np.pi * f * 3.0 * t) * np.exp(-t * 5) + .22 * np.sin(2 * np.pi * f * 5.04 * t) * np.exp(-t * 9) + .12 * np.sin(2 * np.pi * f * 7.9 * t) * np.exp(-t * 14)
    return x * amp * np.minimum(t / .002, 1)
def celesta(f, dur=2.6, amp=.12):
    t = tt(dur)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 1.6) + .3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 4) + .1 * np.sin(2 * np.pi * f * 10.2 * t) * np.exp(-t * 9)
    return x * amp * np.minimum(t / .003, 1)
def pad(fs, dur, amp=.05, a=1.5, r=2.0, bright=.5, det=.004):
    t = tt(dur); x = np.zeros_like(t)
    for f in fs:
        for d in (-det, 0, det):
            for k in range(1, 6):
                x += np.sin(2 * np.pi * f * k * (1 + d) * t + rng.random() * 6) * (bright ** (k - 1)) / k
    x *= (1 + .12 * np.sin(2 * np.pi * .23 * t + rng.random() * 6))
    return x * env(len(t), a, r) * amp / (len(fs) * 3)
def strings(fs, dur, amp=.05, a=2.0, r=2.5):
    t = tt(dur); x = np.zeros_like(t)
    for f in fs:
        for d in (-.006, -.002, .003, .007):
            vib = 1 + .003 * np.sin(2 * np.pi * 5.2 * t + rng.random() * 6) * np.minimum(t / 1.5, 1)
            ph = 2 * np.pi * np.cumsum(f * (1 + d) * vib) / SR
            for k in range(1, 9): x += np.sin(k * ph) / k * (.75 ** k)
    b, a_ = ss.butter(2, 3200 / (SR / 2)); x = ss.lfilter(b, a_, x)
    return x * env(len(t), a, r) * amp / (len(fs) * 4)
def bass(f, dur, amp=.10):
    t = tt(dur); x = np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)
    return x * env(len(t), .04, .6) * amp * np.exp(-t * .4)
def bassoon(f, dur, amp=.07):             # the pompous astronomer's little motif
    t = tt(dur); vib = 1 + .006 * np.sin(2 * np.pi * 5 * t) * np.minimum(t / .3, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR; x = sum(np.sin(k * ph) / k ** .9 * (1 if k % 2 else .55) for k in range(1, 12))
    b, a = ss.butter(2, [300 / (SR / 2), 1800 / (SR / 2)], 'band'); x = ss.lfilter(b, a, x)
    return x * env(len(t), .04, .12) * amp
def noise(d, lo, hi, order=2):
    x = rng.standard_normal(int(d * SR)); b, a = ss.butter(order, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], 'band'); return ss.lfilter(b, a, x)

# ---------------- sound effects (gentle, "space & science") ----------------
def page_turn(dur=.75):
    t = tt(dur); x = noise(dur, 500, 4200) * np.sin(np.pi * np.minimum(t / dur, 1)) ** 2.2 * .5
    cr = noise(dur, 1800, 6000) * (rng.random(len(t)) < .003) * 2
    return (x + cr * np.exp(-((t - dur * .55) / (dur * .25)) ** 2)) * .22
def thump(f0=70, d=1.6, amp=.9):
    t = tt(d); x = np.sin(2 * np.pi * np.cumsum(f0 * np.exp(-t * 3) + 34) / SR) * np.exp(-t * 3.2)
    x += noise(d, 120, 1800) * np.exp(-t * 22) * .6
    return x * amp
def tick(f=3200, amp=.12):
    t = tt(.05); return np.sin(2 * np.pi * f * t) * np.exp(-t * 260) * amp + noise(.05, 2000, 9000) * np.exp(-t * 300) * amp * .5
def whoosh(d, f0, f1, amp=.25):
    t = tt(d); x = rng.standard_normal(len(t)); y = np.zeros_like(x)
    fc = np.geomspace(f0, f1, len(t)); out = np.zeros_like(x)
    for i0 in range(0, len(t), 2400):                     # block-wise moving band-pass
        c = fc[i0]; b, a = ss.butter(2, [max(60, c * .6) / (SR / 2), min(c * 1.6, SR / 2 - 200) / (SR / 2)], 'band'); out[i0:i0 + 2400] = ss.lfilter(b, a, x[i0:i0 + 2400])
    return out * np.sin(np.pi * t / d) ** 1.5 * amp
def ice(t0, d, n, amp=.05):
    for i in range(n):
        tt0 = t0 + rng.random() * d; f = m2f(rng.choice([93, 95, 98, 100, 102, 105])); put(sfx, celesta(f, 1.2, amp * (.4 + .6 * rng.random())), tt0, rng.uniform(-.7, .7))
def heartbeat(t, amp=.25):
    for dt, a in ((0, 1), (.28, .6)):
        x = tt(.4); put(sfx, np.sin(2 * np.pi * np.cumsum(55 * np.exp(-x * 9) + 38) / SR) * np.exp(-x * 9) * amp * a, t + dt)
def honk(t, amp=.06):        # a tiny, muted clown horn (bittersweet)
    x = tt(.32); f = 330 * (1 - .1 * x / .32); ph = 2 * np.pi * np.cumsum(f) / SR; y = np.tanh(3 * np.sin(ph)) * env(len(x), .02, .1)
    b, a = ss.butter(2, 1500 / (SR / 2)); put(sfx, ss.lfilter(b, a, y) * amp, t, .2)
def scratch(t, d=.35, amp=.12):
    x = noise(d, 2500, 9000) * np.sin(np.pi * tt(d) / d); put(sfx, x * amp, t, .1)
def gliss(t, notes, step=.05, amp=.12, inst=harp, pan=0):
    for i, m in enumerate(notes): put(mus, inst(m2f(m), 2.5, amp), t + i * step, pan + .4 * np.sin(i))

# ======================= SCORE (film time) =======================
D_ = [62, 66, 69, 74]; Bm = [59, 62, 66, 71]; G_ = [55, 59, 62, 67]; A_ = [57, 61, 64, 69]
Dm = [62, 65, 69, 74]; Bb = [58, 62, 65, 70]; Gm = [55, 58, 62, 67]; A7 = [57, 61, 64, 67]; F_ = [53, 57, 60, 65]; C_ = [48, 52, 55, 60]
def arp(ch, t0, dur, step=.42, amp=.10, octv=12, pan=-.3, inst=harp):
    seq = ch + [ch[2] + octv, ch[1] + octv]; k = 0; t = t0
    while t < t0 + dur - .05: put(mus, inst(m2f(seq[k % len(seq)] + octv * 0), 2.2, amp), t, pan + .25 * np.sin(k)); t += step; k += 1
def chord(ch, t0, dur, amp=.05, bassamp=.09, a=1.2, r=1.8, st=False):
    put(mus, pad([m2f(m) for m in ch], dur + r, amp, a, r), t0, 0)
    if st: put(mus, strings([m2f(m) for m in ch[1:]], dur + r, amp * .9, a * 1.3, r), t0, .1)
    if bassamp: put(mus, bass(m2f(ch[0] - 12), dur, bassamp), t0, 0)
def melody(notes, t0, beat, inst=musicbox, amp=.11, pan=.35, detune=0.0):
    t = t0
    for m, b in notes:
        if m: put(mus, inst(m2f(m), 2.4, amp) if inst is not musicbox else musicbox(m2f(m), 2.4, amp, detune * rng.uniform(-1, 1)), t, pan)
        t += b * beat

B = .80   # beat (s)
# --- 0..5.75 cover: a music-box lullaby wakes the book
chord(D_, 0.2, 2.6, .045, .07); chord(G_, 2.8, 2.6, .045, .07)
melody([(78, 1), (81, 1), (83, 1), (81, 1.5), (78, .5), (76, 2)], 0.6, B, amp=.10)
put(mus, celesta(m2f(86), 3, .10), F(0.5), .3); put(mus, celesta(m2f(93), 3, .05), F(0.5) + .02, -.3)      # "פלוטו" chime
put(sfx, page_turn(), F(3.75) + .05, -.2)
# --- 5.75..13.3 the avenue: wonder; the astronomer interrupts
chord(D_, 5.4, 2.5, .05, .08); arp(D_, 5.6, 2.4, .40, .085); chord(Bm, 7.9, 1.0, .045, .07)
for k in range(6): put(sfx, celesta(m2f(98 + (k % 3) * 2), .8, .03), F(5.55) + k * .16, -.5 + k * .1)     # comet visitors hop
# the astronomer: music stops, a pompous little bassoon figure
for m, t0, d in ((50, F(6.68), .28), (47, F(6.98), .28), (45, F(7.26), .55)): put(mus, bassoon(m2f(m), d + .15), t0, .3)
put(sfx, tick(5200, .06), F(8.66), .4)                                                                   # "פירור" tiny pip
put(mus, bassoon(m2f(57), .25), F(8.18), .3)
chord([50, 57, 62, 64], F(9.0), 4.4, .045, .06, 2.0, 2.0)                                                  # mysterious open fifth (the hole)
put(sfx, whoosh(3.0, 120, 600, .06), F(9.2), -.6)
# --- 13.3..17.5 the telescope
put(sfx, whoosh(.6, 400, 3000, .10), F(11.30), .3); put(sfx, tick(1800, .10), F(11.75))
for i, w in enumerate([11.56, 11.94, 12.30, 12.62]): put(sfx, tick(2600 - i * 150, .10), F(w), .2)        # ratchet clicks on each word
put(sfx, tick(1400, .16), F(12.82)); put(mus, celesta(m2f(81), 1.5, .05), F(12.82), .3)                 # lock
put(mus, pad([m2f(m) for m in (57, 64, 69, 71)], 4.0, .04, .8, 1.5), F(11.4), 0)
x = tt(1.9); f = m2f(76) * (1 + .06 * np.sin(2 * np.pi * 1.6 * x)) * (1 - .12 * x / 1.9); put(mus, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), .3, .6) * .06, F(13.74), -.2)   # funhouse theremin "crooked"
# --- 17.5..27 the verdict
put(sfx, page_turn(.4), F(15.52), -.2)
put(sfx, thump(68, 1.8, .85), F(15.86)); put(mus, strings([m2f(m) for m in (50, 57, 62, 65)], 3.0, .06, .05, 2.0), F(15.9), 0)
put(mus, bassoon(m2f(57), .22), F(16.50), .4); put(mus, bassoon(m2f(62), .35), F(16.74), .4)          # "מכובדי" pompous
scratch(F(17.54)); put(sfx, thump(90, 1.0, .45), F(18.42)); put(sfx, noise(.25, 1500, 7000) * np.exp(-tt(.25) * 18) * .15, F(18.46), .2)   # crack
pizz = [(62, 19.18), (65, 19.44), (69, 19.88), (65, 20.48), (62, 20.74), (58, 21.04), (57, 21.46), (57, 21.86)]
for m, w in pizz: put(mus, harp(m2f(m), .9, .10, .6), F(w), -.2)
for k in range(8): put(sfx, tick(4200, .05), F(19.2) + k * .16, .4)                                     # caliper ticks
put(mus, harp(m2f(79), 1.2, .08), F(20.74), .3); put(mus, harp(m2f(67), 1.6, .08), F(20.98), .3)         # see-saw "plink-plonk"
put(sfx, whoosh(.35, 3000, 800, .10), F(21.86), -.2)                                                     # tape cinch
put(sfx, thump(55, 1.4, .55), F(22.64)); chord(Dm, F(22.64), 2.0, .05, .09, .05, 1.5)
x = tt(.7); f = 520 * np.exp(-x * 1.1); put(mus, np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), .01, .3) * .06, F(24.18), .3)   # tag drops (little descending slide)
# --- 27..38.3 sadness
put(sfx, page_turn(), F(25.0), -.2)
chord(Dm, F(25.7), 3.0, .05, .07, 1.5, 2); chord(Bb, F(28.4), 2.2, .05, .07); chord(Gm, F(30.6), 2.4, .05, .07); chord(A7, F(33.0), 3.0, .05, .07)
melody([(74, 1.5), (72, .5), (70, 1), (69, 2)], F(26.0), B, amp=.07, detune=.006)                       # lonely, slightly out of tune
ice(F(28.6), 2.0, 14, .045); put(sfx, noise(1.0, 400, 2500) * np.sin(np.pi * tt(1.0)) * .05, F(29.3), 0)   # thin air
put(sfx, whoosh(1.2, 2500, 300, .10), F(30.9), .6); honk(F(31.35))                                       # meteor pass + tiny clown honk
put(sfx, noise(.6, 2000, 8000) * (rng.random(int(.6 * SR)) < .01) * .5, F(33.4), .1)                    # ice cracks
put(sfx, whoosh(1.4, 200, 1800, .14), F(34.95), -.4); put(sfx, whoosh(1.2, 1800, 200, .10), F(35.6), .4)  # spin
# --- 38.3..48.4 calm -> inner strength -> comet
put(sfx, page_turn(), F(36.3), -.2)
for k in range(5): heartbeat(F(37.4) + k * 1.05, .22 + .03 * k)
chord(Bb, F(37.2), 2.2, .045, .06, 1.5); chord(F_, F(39.3), 2.2, .05, .07, 1.5, st=True); chord(C_, F(41.5), 2.6, .05, .07, 1.2, st=True)
put(sfx, harp(m2f(76), .6, .12), F(42.38), .3); put(sfx, noise(.5, 1500, 6000) * np.sin(np.pi * tt(.5) / .5) * .08, F(42.45), .5)   # string snaps, tag flutters
for k in range(6): put(mus, celesta(m2f(88 + k), 1.2, .025), F(43.62) + k * .07, -.4)                    # ink flakes to dust
chord(D_, F(44.36), 3.0, .055, .09, .4, st=True)
gliss(F(44.4), [62, 66, 69, 74, 78, 81, 86, 90, 93], .09, .10)
put(sfx, whoosh(2.1, 300, 5000, .16), F(44.5), -.3)
put(mus, celesta(m2f(86), 3, .10), F(45.82), .2); put(mus, celesta(m2f(93), 3, .06), F(45.86), -.2)     # "שביט!"
# --- 48.25..56.6 to the children
put(sfx, whoosh(.8, 4000, 600, .09), F(46.25), .5)
chord(D_, F(46.42), 3.2, .05, .08, .8, st=True); chord(Bm, F(49.6), 2.6, .05, .08, st=True); chord(G_, F(52.2), 2.4, .05, .08, st=True); chord(A_, F(53.6), 1.4, .05, .08)
melody([(78, 1), (81, 1), (83, 1), (86, 1.5), (85, .5), (83, 1), (81, 2)], F(46.6), B, celesta, .08, .3)
for k, w in enumerate([48.12, 48.5, 48.74, 49.0, 49.4]): put(mus, musicbox(m2f([86, 88, 90, 93, 95][k]), 1.6, .05), F(w), -.5 + .25 * k)   # constellations drawn
for k, w in enumerate([50.18, 50.5, 50.92, 51.18, 51.6]): put(mus, celesta(m2f([74, 78, 81, 86, 90][k]), 2, .06), F(w), .5 - .25 * k)    # stars ignite
put(mus, strings([m2f(m) for m in (62, 66, 69, 74, 78)], 3.6, .07, 1.6, 2.0), F(52.4), 0)            # sunrise swell
# --- 56.6..64.4 the golden ending
put(sfx, page_turn(.7), F(54.45), -.2)
chord(G_, F(54.7), 2.2, .045, .07); chord(A_, F(56.9), 2.2, .045, .07)
put(sfx, tick(2400, .05), F(54.94), .5)                                                                    # bubble pops in
for k in range(5): put(mus, celesta(m2f(93 - k * 2), 1.5, .03), F(57.0) + k * .12, .5 - k * .2)         # words dissolve
put(mus, musicbox(m2f(90), 1.4, .07), F(59.48), .3)                                                       # "קטן"
chord([62, 66, 69, 76, 78], F(60.38), 4.5, .06, .10, .6, 3.0, st=True)                                     # "כולו זהב" - D add9
for k, m in enumerate([86, 90, 93, 98]): put(mus, celesta(m2f(m), 3.0, .07), F(61.12) + k * .11, -.3 + .2 * k)
# --- 64.4..68 back cover
put(sfx, page_turn(.9), F(62.4), -.2)
melody([(81, 1), (78, 1), (76, 1), (74, 3)], F(62.9), B * 1.15, amp=.09)
chord(D_, F(63.2), 3.5, .04, .06, 1.5, 2.5); put(mus, celesta(m2f(93), 2, .05), F(63.6), .4)

# ---------------- reverb, mix ----------------
def reverb(x, sec=2.8, wet=.35):
    n = int(sec * SR); out = np.zeros_like(x)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.2 / sec * 2.2); b, a = ss.butter(1, 5000 / (SR / 2)); ir = ss.lfilter(b, a, ir); ir /= np.sqrt((ir ** 2).sum())
        out[:, ch] = ss.fftconvolve(x[:, ch], ir)[:len(x)]
    return x * (1 - wet) + out * wet * 1.6
mus = reverb(mus, 3.2, .42); sfx = reverb(sfx, 1.6, .22)
music = mus / (np.abs(mus).max() + 1e-9) * .8 + sfx / (np.abs(sfx).max() + 1e-9) * .55
r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', D + '/audio/narration.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
v = np.frombuffer(r.stdout, np.float32).astype(float); V = np.zeros(N); i0 = int(LEAD * SR); V[i0:i0 + len(v)] = v[:N - i0]
from scipy.ndimage import uniform_filter1d as U1, maximum_filter1d as MX
e = np.minimum(U1(np.abs(V), int(.25 * SR)) / .04, 1); e = U1(MX(e, int(.5 * SR)), int(.35 * SR))
duck = (1 - .5 * e)[:, None]
fade = np.ones(N); fade[:int(.8 * SR)] = np.linspace(0, 1, int(.8 * SR)); fade[-int(2.2 * SR):] = np.linspace(1, 0, int(2.2 * SR))
bg = music * duck * .72
mix = (np.stack([V, V], 1) / (np.abs(V).max() + 1e-9) * .85 + bg) * fade[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05); mix /= np.abs(mix).max() / .95
def wav(path, x):
    import wave
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
np.save(D + '/audio/_bg.npy', (bg * fade[:, None]).astype(np.float32)); np.save(D + '/audio/_v.npy', (V / (np.abs(V).max() + 1e-9) * .85 * fade).astype(np.float32))
wav(D + '/audio/music_only.wav', music / np.abs(music).max() * .9 * fade[:, None]); wav(D + '/audio/mix.wav', mix)
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', D + '/audio/mix.wav', '-af', 'loudnorm=I=-16:TP=-1.2:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k', D + '/audio/final.m4a'])
print('ok', DUR)
