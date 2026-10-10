"""Film driver: narration time -> pages, page turns (Hebrew book: left page lifts over to the right), fades, ffmpeg.
usage: python3 render.py FRAME_A FRAME_B out.mp4      (frames at 24 fps, film time F = frame/24, narration n = F - LEAD)"""
import sys, os, math, subprocess, time, numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine import Engine
import timemap
FPS, LEAD, END_N = 24, timemap.LEAD, timemap.END_N
DUR = timemap.DUR
W, H = 1920, 1080

def ease(u): u = min(max(u, 0), 1); return u * u * (3 - 2 * u)

def page_turn(old, new, u, back):
    """from the Saba Tocha engine: the left page lifts and folds over to the right."""
    u = ease(u); out = new.astype(np.float32).copy(); xl = u * W; xs = np.arange(W)
    shadow = np.clip(1 - np.abs(xs - xl) / 140, 0, 1) * 0.45 * math.sin(math.pi * u)
    out *= (1 - shadow)[None, :, None]
    if W - xl > 4:
        src = old if u < 0.5 else back
        lift = 70 * math.sin(math.pi * u)
        M = cv2.getPerspectiveTransform(np.float32([[0, 0], [W, 0], [W, H], [0, H]]), np.float32([[xl, -lift], [W, 0], [W, H], [xl, H + lift]]))
        warped = cv2.warpPerspective(src.astype(np.float32), M, (W, H), flags=cv2.INTER_LINEAR)
        mask = cv2.warpPerspective(np.ones((H, W), np.float32), M, (W, H), flags=cv2.INTER_LINEAR)
        warped *= (1 - 0.35 * u * np.clip((W - xs) / W, 0, 1))[None, :, None]
        out = out * (1 - mask[..., None]) + warped * mask[..., None]
    return out

def page_curl(old, new, u, back, rect):
    """A real sheet of paper turning inside the open book (Hebrew: free edge on the left, binding on the right).
    rect = (X0, Y0, PW, PH): the left page on screen. The sheet wraps round a cylinder whose axis sweeps toward the
    binding, the bottom corner leading; past the fold it lies upside down on top (its back: plain paper with the print
    faintly showing through), crosses the gutter and lands on the facing page. Soft shadows fall under it."""
    X0, Y0, PW, PH = rect
    rx0, ry0, rx1, ry1 = X0, 0, W, H
    RW, RH = rx1 - rx0, ry1 - ry0; py0 = Y0 - ry0                  # page rect inside the region: x 0..PW, y py0..py0+PH
    u = min(max(u, 0.0), 1.0)
    e = u * u * (3 - 2 * u)
    e = .5 * e + .5 * (1 - (1 - u) ** 2.2) * (u ** .9)
    tilt = .30 * (1 - e) + .04
    d = np.array([-1.0, tilt]); d /= np.linalg.norm(d)
    Rc = (40 + 120 * math.sin(math.pi * min(1, u * 1.15))) * PW / W * 1.25
    # fold sweeps from the bottom-left corner of the page to past the facing page (the sheet lands over there)
    xa, xb = -PH * .5 * .34 + 4, PW + (RW - PW) + PH * .5 * tilt + 2 * Rc + 30
    x0 = xa + e * (xb - xa); P0 = (x0, py0 + PH * .5)
    ys, xs = np.mgrid[0:RH, 0:RW].astype(np.float32)
    s = (xs - P0[0]) * d[0] + (ys - P0[1]) * d[1]
    inside = lambda qx, qy: (qx >= 0) & (qx <= PW - 1) & (qy >= py0) & (qy <= py0 + PH - 1)
    def at(t): k = t - s; return xs + k * d[0], ys + k * d[1]
    tb = math.pi * Rc - s; bx, by = at(tb); flap = (s < 0) & inside(bx, by)
    sr = np.clip(s / Rc, -1, 1); onc = (s >= 0) & (s <= Rc)
    th2 = math.pi - np.arcsin(sr); c2x, c2y = at(Rc * th2); cyl2 = onc & inside(c2x, c2y) & ~flap
    th1 = np.arcsin(sr); c1x, c1y = at(Rc * th1); cyl1 = onc & inside(c1x, c1y) & ~cyl2 & ~flap
    flat = (s < 0) & ~flap & inside(xs, ys)
    sub = lambda a: a[ry0:ry1, rx0:rx1].astype(np.float32)
    oldr, newr = sub(old), sub(new)
    backr = np.zeros_like(oldr); backr[py0:py0 + PH, :PW] = cv2.resize(back.astype(np.float32), (PW, PH))
    rm = lambda img, mx, my: cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    def backside(mx, my):
        b = rm(backr, mx, my); o = rm(oldr, mx, my); l = o.mean(axis=2, keepdims=True)
        return b * (.92 + .08 * l / 255.0)
    out = newr.copy()
    cover = (flap | cyl1 | cyl2 | flat).astype(np.float32)
    sh = cv2.GaussianBlur(cover, (0, 0), 14 + Rc * .25)
    M = np.float32([[1, 0, d[0] * (8 + Rc * .2)], [0, 1, d[1] * (8 + Rc * .2) + 5]])
    sh = cv2.warpAffine(sh, M, (RW, RH), borderMode=cv2.BORDER_REPLICATE)
    out *= (1 - .45 * math.sin(math.pi * u) ** .6 * sh * (1 - cover))[..., None]
    fl = oldr.copy()
    fs = cv2.GaussianBlur(flap.astype(np.float32), (0, 0), 9)
    crease = np.clip(1 + s / 24, 0, 1) * (s < 0)
    fl *= (1 - .30 * fs * (1 - flap) - .16 * crease)[..., None]
    out = np.where(flat[..., None], fl, out)
    if cyl1.any():
        out = np.where(cyl1[..., None], rm(oldr, c1x, c1y) * (.66 + .34 * np.cos(th1))[..., None], out)
    if cyl2.any():
        lum = .72 + .22 * (-np.cos(th2)) + .16 * np.exp(-((th2 - 2.0) / .28) ** 2)
        out = np.where(cyl2[..., None], backside(c2x, c2y) * lum[..., None], out)
    if flap.any():
        out = np.where(flap[..., None], backside(bx, by) * .97, out)
    full = new.astype(np.float32).copy(); full[ry0:ry1, rx0:rx1] = out
    return np.clip(full, 0, 255)

TURN_FILM = {'s3': .8}
_cache = {}
def film_frame(E, F):
    n = timemap.F2n(F); amb = (F - LEAD) - n; tl = E.timeline
    k = 0
    for i, s in enumerate(tl):
        if s['start'] <= n: k = i
    s = tl[k]
    fr = E.page(k, n, amb).astype(np.float32)
    TD = TURN_FILM.get(s['id'], 1.15) if s['trans'] == 'turn' else None      # page turns run on film time (a real hand's pace)
    Fs = timemap.n2F(s['start']) if TD else None
    if k > 0 and ((TD and F < Fs + TD) or (not TD and n < s['start'] + s['tdur'])):
        u = (F - Fs) / TD if TD else (n - s['start']) / s['tdur']
        if s['trans'] == 'turn':
            key = (id(E), k)
            if key not in _cache: _cache[key] = E.page(k - 1, s['start'])
            if 'back' not in _cache: _cache['back'] = E.blank().astype(np.float32) * .93
            if 'rect' not in _cache: _cache['rect'] = tuple(E.pg.evaluate('bookGeom()'))
            fr = page_curl(_cache[key], fr, u, _cache['back'], _cache['rect'])
        elif s['trans'] == 'fade':
            fr = E.page(k - 1, n, amb).astype(np.float32) * (1 - ease(u)) + fr * ease(u)
    if F < .8: fr *= F / .8
    if F > DUR - 1.8: fr *= max(0, (DUR - F) / 1.8)
    return np.clip(fr, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    a, b, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    p = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    t0 = time.time()
    with Engine() as E:
        for f in range(a, b):
            p.stdin.write(film_frame(E, f / FPS).tobytes())
            if (f - a) % 48 == 0: print(f'frame {f}  {(time.time() - t0) / max(1, f - a + 1):.2f}s/frame', flush=True)
    p.stdin.close(); p.wait(); print('done', out, f'{time.time() - t0:.0f}s')
