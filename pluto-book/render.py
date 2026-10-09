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

_cache = {}
def film_frame(E, F):
    n = timemap.F2n(F); amb = (F - LEAD) - n; tl = E.timeline
    k = 0
    for i, s in enumerate(tl):
        if s['start'] <= n: k = i
    s = tl[k]
    fr = E.page(k, n, amb).astype(np.float32)
    if k > 0 and n < s['start'] + s['tdur']:
        u = (n - s['start']) / s['tdur']
        if s['trans'] == 'turn':
            key = (id(E), k)
            if key not in _cache: _cache[key] = E.page(k - 1, s['start'])
            if 'back' not in _cache: _cache['back'] = E.blank().astype(np.float32) * .9
            fr = page_turn(_cache[key], fr, u, _cache['back'])
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
