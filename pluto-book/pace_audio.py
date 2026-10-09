"""Build audio/narration_paced.wav: original narration with room-tone filled pauses inserted (48 kHz mono)."""
import numpy as np, subprocess, wave, os
from timemap import INS, LEAD
D = os.path.dirname(os.path.abspath(__file__)); SR = 48000
r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', D + '/audio/narration.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True)
v = np.frombuffer(r.stdout, np.float32).astype(float)
tone = v[int(3.30 * SR):int(4.10 * SR)].copy()                      # room tone from a quiet gap
def roomtone(n):
    out = np.zeros(n); i = 0; L = len(tone); xf = int(.08 * SR)
    while i < n:
        seg = tone.copy(); seg[:xf] *= np.linspace(0, 1, xf); seg[-xf:] *= np.linspace(1, 0, xf)
        m = min(L, n - i); out[i:i + m] += seg[:m]; i += L - xf
    return out
parts = []; pos = 0
for s0, s1, d in INS:
    m = int((s0 + s1) / 2 * SR); parts.append(v[pos:m]); parts.append(roomtone(int(d * SR))); pos = m
parts.append(v[pos:])
out = np.concatenate(parts)
with wave.open(D + '/audio/narration_paced.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print('paced narration', round(len(out) / SR, 2), 's')
