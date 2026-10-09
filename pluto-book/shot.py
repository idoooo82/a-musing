"""Render test frames of single pages (no page-turn compositing).
usage:  python3 shot.py SCENE_ID n1 n2 ...        (n = narration time in seconds)
        python3 shot.py --film F1 F2 ...            (F = film time incl. page turns, via render.py)
Writes checks/<id>_<n>.jpg and a contact sheet checks/<id>_sheet.jpg. Prints per-frame render time."""
import sys, os, time, cv2, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from engine import Engine
D = os.path.dirname(os.path.abspath(__file__))
os.makedirs(D + '/checks', exist_ok=True)

def sheet(paths, out, cols=3, w=640):
    ims = [cv2.resize(cv2.imread(p), (w, w * 9 // 16)) for p in paths]
    for im, p in zip(ims, paths):
        cv2.putText(im, os.path.basename(p)[:-4], (8, 24), cv2.FONT_HERSHEY_SIMPLEX, .7, (0, 0, 0), 4); cv2.putText(im, os.path.basename(p)[:-4], (8, 24), cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 255, 255), 1)
    while len(ims) % cols: ims.append(np.zeros_like(ims[0]))
    rows = [np.hstack(ims[i:i + cols]) for i in range(0, len(ims), cols)]
    cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 88])

if __name__ == '__main__':
    a = sys.argv[1:]
    with Engine() as E:
        paths = []
        if a[0] == '--film':
            import render
            for F in map(float, a[1:]):
                t0 = time.time(); fr = render.film_frame(E, F); p = f'{D}/checks/film_{F:06.2f}.jpg'; cv2.imwrite(p, fr, [cv2.IMWRITE_JPEG_QUALITY, 92]); paths.append(p); print(f'film {F:.2f}  {time.time() - t0:.2f}s')
            sheet(paths, f'{D}/checks/film_sheet.jpg')
        else:
            sid = a[0]; k = E.index(sid)
            for n in map(float, a[1:]):
                t0 = time.time(); fr = E.page(k, n); p = f'{D}/checks/{sid}_{n:05.2f}.jpg'; cv2.imwrite(p, fr, [cv2.IMWRITE_JPEG_QUALITY, 92]); paths.append(p); print(f'{sid} n={n:.2f}  {time.time() - t0:.2f}s')
            sheet(paths, f'{D}/checks/{sid}_sheet.jpg')
        print('sheet written')
