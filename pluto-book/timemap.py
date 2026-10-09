"""Narration pacing: extra silence inserted inside natural pauses of the recording.
Story time n = time in the ORIGINAL narration. Film time F includes the LEAD and all inserted pauses.
Inside a stretched pause the story clock runs slowly (visuals breathe), outside it runs 1:1."""
import numpy as np
LEAD, END_N = 2.0, 66.0
# (silence start, silence end, extra seconds) - from silencedetect on the narration
INS = [(3.17, 4.21, 1.0), (6.32, 6.55, .6), (11.08, 11.45, .5), (13.35, 13.59, .25), (15.26, 15.78, 1.3), (18.81, 19.16, .5),
       (22.35, 22.59, .4), (24.77, 25.46, 1.3), (27.98, 28.36, .4), (29.87, 30.54, .5), (32.49, 33.08, .6), (36.47, 37.14, 1.3),
       (38.89, 39.32, .5), (41.03, 41.45, .4), (43.99, 44.36, .5), (46.39, 46.86, 1.3), (49.59, 50.07, .5), (51.87, 52.29, .35),
       (54.08, 54.68, 1.2), (57.55, 58.10, .45), (59.11, 59.45, .35), (60.01, 60.21, .8)]
_kn, _kf = [-LEAD], [0.0]
_acc = 0.0
for s0, s1, d in INS:
    _kn += [s0, s1]; _kf += [s0 + LEAD + _acc, s1 + LEAD + _acc + d]; _acc += d
_kn.append(END_N); _kf.append(END_N + LEAD + _acc)
KN, KF = np.array(_kn), np.array(_kf)
DUR = float(KF[-1])
def n2F(n): return float(np.interp(n, KN, KF))
def F2n(F): return float(np.interp(F, KF, KN))
if __name__ == '__main__':
    print('film duration', round(DUR, 2), 'extra', round(_acc, 2))
