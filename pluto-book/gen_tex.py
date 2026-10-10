"""Pluto surface: a high-resolution equirectangular colour map + slope (bump) map, generated procedurally.
Inspired by the New Horizons maps (a bright nitrogen-ice plain, a dark reddish equatorial belt full of craters,
blocky mountains on the plain's edge, ridged 'bladed' terrain, a pale violet polar cap), painted in the book's
pastel palette. The face region (lon ~ pi/2, the side that faces us at spin 0) is kept smooth: the relief face
is carved there at render time.
Writes tex/pluto_c.jpg (RGB) and tex/pluto_n.png (R,G = east/north slope, B = height)."""
import numpy as np, os, sys
from PIL import Image

W = int(sys.argv[1]) if len(sys.argv) > 1 else 4096
H = W // 2
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tex')
os.makedirs(OUT, exist_ok=True)

lon = (np.arange(W, dtype=np.float32) + .5) / W * 2 * np.pi
lat = ((np.arange(H, dtype=np.float32) + .5) / H - .5) * np.pi        # negative = top of the screen
LON, LAT = np.meshgrid(lon, lat)
CL, SL = np.cos(LAT), np.sin(LAT)
X, Y, Z = np.cos(LON) * CL, SL, np.sin(LON) * CL


def hash3(x, y, z, s):
    h = (x * 374761393 + y * 668265263 + z * 1440662683 + s * 974634821).astype(np.int64) & 0xffffffff
    h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff
    h = h ^ (h >> 16)
    return (h & 0xffffff).astype(np.float32) / 16777216.0


def vnoise(x, y, z, s=0):
    xi, yi, zi = np.floor(x), np.floor(y), np.floor(z)
    fx, fy, fz = x - xi, y - yi, z - zi
    xi, yi, zi = xi.astype(np.int64), yi.astype(np.int64), zi.astype(np.int64)
    q = lambda t: t * t * t * (t * (t * 6 - 15) + 10)
    ux, uy, uz = q(fx), q(fy), q(fz)
    c = lambda a, b, d: hash3(xi + a, yi + b, zi + d, s)
    x00 = c(0, 0, 0) * (1 - ux) + c(1, 0, 0) * ux
    x10 = c(0, 1, 0) * (1 - ux) + c(1, 1, 0) * ux
    x01 = c(0, 0, 1) * (1 - ux) + c(1, 0, 1) * ux
    x11 = c(0, 1, 1) * (1 - ux) + c(1, 1, 1) * ux
    return (x00 * (1 - uy) + x10 * uy) * (1 - uz) + (x01 * (1 - uy) + x11 * uy) * uz


def fbm(f, oct=5, s=0, ridged=False, gain=.5, P=None):
    X_, Y_, Z_ = P if P is not None else (X, Y, Z)
    v = np.zeros_like(X_); a = .5; fr = f
    for i in range(oct):
        n = vnoise(X_ * fr + 13.1 * i, Y_ * fr + 7.7 * i, Z_ * fr + 3.3 * i, s + i)
        if ridged: n = 1 - np.abs(2 * n - 1); n = n * n
        v += a * n; fr *= 2.03; a *= gain
    return v


def sm(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def angd(a, b):
    return np.arctan2(np.sin(a - b), np.cos(a - b))


def mix(c, d, t):
    t = t[..., None]; return c * (1 - t) + np.asarray(d, np.float32) * t


print('noise...', flush=True)
# domain warp for organic shapes
wx = fbm(1.6, 4, 101) - .5; wy = fbm(1.6, 4, 202) - .5; wz = fbm(1.6, 4, 303) - .5
PW = (X + .35 * wx, Y + .35 * wy, Z + .35 * wz)
base = fbm(2.2, 6, 1, P=PW)
mott = fbm(7, 5, 2, P=PW)
fine = fbm(28, 4, 3)
vfine = fbm(90, 3, 4)

# ---- regions (laid out like the New Horizons map; the face sits in the smooth ice of the "heart") ----
FC = np.pi / 2                                                          # longitude that faces us at spin 0
face = np.exp(-(angd(LON, FC) / .62) ** 2 - ((LAT - .02) / .55) ** 2)    # the face field (kept calm)
nz1 = fbm(3, 6, 7, P=PW) - .5; nz2 = fbm(9, 5, 8, P=PW) - .5
edge = 1.5 * nz1 + .9 * nz2 + .35 * (fine - .5)                         # ragged, fractal region borders
# Sputnik-like plain: a tall smooth oval of nitrogen ice, pointed at the bottom (the heart's left lobe)
dsx, dsy = angd(LON, FC + .1) / .44, (LAT - .08) / np.where(LAT > .08, .62, .5)
pr = np.hypot(dsx, dsy) + .16 * edge
east = sm(-.1, .35, angd(LON, FC + .1))
plain = sm(1.0 + .25 * east, .93 - .25 * east, pr)
# the heart's right lobe: bright but rougher, fading east
lobe_r = np.hypot(angd(LON, FC + .95) / .48, (LAT + .02) / .5) + .3 * edge
lobe = sm(1.05, .75, lobe_r) * np.clip(.85 + 1.2 * nz2, 0, 1)
ice = np.clip(plain + .7 * lobe * (1 - plain), 0, 1)
# Cthulhu-like dark belt: west of the heart, south of the equator, long and ragged; and a chain of dark maculae beyond
cx = angd(LON, FC - 1.35)
belt_y = LAT - .26 - .12 * np.sin(cx * 2.2) + .3 * nz1
belt = sm(1.2, .95, np.abs(cx) + .35 * edge) * sm(.36, .27, np.abs(belt_y) + .2 * edge) * sm(.25, .45, base + .25 * mott)
tip = sm(.85, .7, np.hypot(angd(LON, FC - .5) / .5, (LAT - .45) / .22) + .35 * edge)   # its eastern tip reaching the heart
belt = np.clip(np.maximum(belt, tip) * 1.6, 0, 1) * sm(.9, 1.15, pr)
mac = np.zeros_like(LAT)
for k, (lo, la, a, b) in enumerate([(FC + 1.25, .62, .35, .17), (FC + 2.25, .22, .33, .2), (FC + 2.9, .18, .3, .22), (FC + 3.55, .24, .34, .2), (FC + 4.1, .3, .3, .18)]):
    mac = np.maximum(mac, sm(1.0, .85, np.hypot(angd(LON, lo) / a, (LAT - la) / b) + .4 * edge))
mac *= (1 - ice)
# northern high latitudes: warm tan with a darker collar, pale polar cap
north = sm(-.45, -.85, LAT + .25 * nz1)
collar = sm(.18, .0, np.abs(LAT + 1.05 + .15 * nz1)) * .6
cap = sm(-1.15, -1.4, LAT + .2 * nz1)
# bladed terrain far to the east
blade_reg = sm(.55, .2, np.abs(angd(LON, FC + 1.85))) * sm(.5, .2, np.abs(LAT + .05))
Pb = (X * 34, Y * 6, Z * 34)
blades = fbm(1.0, 4, 21, ridged=True, P=Pb)

# ---- height field ----
hgt = .5 * (base - .5) + .3 * (mott - .5) + .12 * (fine - .5) + .05 * (vfine - .5)
# chaotic mountain blocks on the plain's western shore
shore = sm(.9, 1.0, pr) * sm(1.45, 1.05, pr) * sm(.1, -.25, angd(LON, FC + .1))
blk = fbm(16, 4, 11)
mtn = shore * sm(.5, .62, blk)
hgt += 1.5 * mtn * (.7 + .6 * fine)
hgt += .45 * blade_reg * blades
hgt = hgt * (1 - .9 * plain) + .015 * plain * (vfine - .5)           # the ice is flat
hgt *= 1 - .6 * face

# ---- craters (dense on the dark belt and the old northern terrain, none on the ice) ----
print('craters...', flush=True)
rng = np.random.default_rng(1930)
cr_h = np.zeros_like(hgt); cr_a = np.zeros_like(hgt)


def at(lonv, latv):
    i = int((lonv % (2 * np.pi)) / (2 * np.pi) * W); j = int(np.clip((latv / np.pi + .5) * H, 0, H - 1)); return j, i


placed = 0
for k in range(3400):
    r = .009 * (1 / (1 - rng.random() * .97)) ** .75
    r = min(r, .15)
    lo, la = rng.random() * 2 * np.pi, np.arcsin(rng.random() * 2 - 1)
    j, i = at(lo, la)
    keep = (1 - face[j, i]) ** 3 * (1 - .99 * ice[j, i]) * (.25 + .75 * belt[j, i] + .3 * north[j, i])
    if rng.random() > keep or abs(la) > 1.25: continue
    placed += 1
    ext = 2.6 * r; cl = max(np.cos(abs(la) + ext), .15)
    j0, j1 = int(np.clip((la - ext) / np.pi * H + H / 2, 0, H - 1)), int(np.clip((la + ext) / np.pi * H + H / 2 + 1, 0, H))
    di = int(ext / cl / (2 * np.pi) * W) + 2
    ii = (np.arange(i - di, i + di + 1)) % W
    sub_lon, sub_lat = LON[j0:j1][:, ii], LAT[j0:j1][:, ii]
    d = np.hypot(angd(sub_lon, lo) * np.cos(sub_lat), sub_lat - la) / r
    deep = .9 * r / .05 * (.55 + .45 * rng.random())
    hh = (-(1 - sm(0, 1, d)) * (1 - d * d * .35) + .5 * np.exp(-((d - 1.0) / .22) ** 2) + .12 * np.exp(-((d - 1.5) / .5) ** 2)
          + .25 * np.exp(-(d / .18) ** 2) * (r > .045)) * deep * (d < 2.6)
    cr_h[j0:j1, ii] += hh
    fresh = rng.random() < .4                                          # bright frosted rims, like in the photographs
    cr_a[j0:j1, ii] += (.035 * np.exp(-((d - 1.0) / .2) ** 2) * (2 if fresh else 1) - .05 * (1 - sm(.5, .95, d))) * (d < 2.6)
print('craters placed', placed, flush=True)
hgt += cr_h * .55

# ---- colour (true-colour palette of the New Horizons mosaics) ----
print('colour...', flush=True)
C_CREAM, C_BEIGE, C_GREY = [226, 216, 198], [204, 188, 164], [170, 160, 146]
C_BROWN, C_BROWND, C_ICE, C_TAN, C_CAP = [104, 76, 50], [72, 52, 36], [244, 236, 220], [226, 206, 166], [212, 204, 190]
col = mix(np.full((H, W, 3), C_CREAM, np.float32), C_BEIGE, np.clip((base - .4) * 2.2, 0, 1))
col = mix(col, C_GREY, np.clip((mott - .5) * 2.5, 0, 1) * .6)
col = mix(col, [200, 186, 166], np.clip((nz1 + .1) * 3, 0, 1) * .45 * (1 - north))
col = mix(col, C_TAN, north * (.6 + .4 * mott))
col = mix(col, [168, 146, 118], collar * (.5 + .5 * mott))
col = mix(col, C_CAP, cap * .8)
col = mix(col, C_BROWN, belt * .95)
col = mix(col, C_BROWND, np.clip(belt * (mott - .4) * 3, 0, 1) * .8)
col = mix(col, C_BROWN, mac * .85)
col = mix(col, C_BROWND, np.clip((belt + mac) * (nz2 + .15) * 3, 0, 1) * .6)
col = mix(col, [150, 120, 92], np.clip((belt + mac) * (fine - .55) * 4, 0, 1) * .5)
# frost streaks inside the dark belt (bright N-S smears, as in the photographs)
streak = sm(.6, .78, fbm(1, 4, 81, P=(X * 30, Y * 3, Z * 30))) * belt
col = mix(col, [214, 204, 190], streak * .7)
col = mix(col, [196, 176, 146], blade_reg * (.2 + .2 * blades))
col = mix(col, C_ICE, ice * (.9 + .1 * fine))
col = mix(col, [228, 222, 210], plain * sm(.62, .7, fbm(5, 3, 91)) * .5)  # faint cell mottling on the ice, no lines
col = mix(col, [244, 238, 226], mtn * .55)
col *= (1 + cr_a + .07 * (fine - .5) + .04 * (vfine - .5))[..., None]
col = np.clip(col, 0, 255)

# ---- slopes (east, north) in height units per radian of arc ----
print('slopes...', flush=True)
hs = hgt.astype(np.float32)
du = 2 * np.pi / W; dv = np.pi / H
ge = (np.roll(hs, -1, 1) - np.roll(hs, 1, 1)) / (2 * du) / np.maximum(CL, .08)
gn = np.zeros_like(hs); gn[1:-1] = (hs[2:] - hs[:-2]) / (2 * dv)
SLOPE_K = 1 / 220.0                                   # stored as 128 + slope * 127 * SLOPE_K ...
print('slope p99', np.percentile(np.abs(ge), 99), np.percentile(np.abs(gn), 99))
enc = lambda g: np.clip(128 + g * SLOPE_K * 127, 0, 255).astype(np.uint8)
hb = np.clip((hs - hs.min()) / (np.ptp(hs) + 1e-6) * 255, 0, 255).astype(np.uint8)
Image.fromarray(col.astype(np.uint8)).save(os.path.join(OUT, 'pluto_c.jpg'), quality=93)
Image.fromarray(np.dstack([enc(ge), enc(gn), hb])).save(os.path.join(OUT, 'pluto_n.png'))
print('done', W, H)
