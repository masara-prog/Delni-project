# Original soundtrack for the promo (generated here, so it is free to use):
# D Hijaz colour (D Eb F# G A Bb C) for a Libyan / North African feel, cinematic pads, a soft groove,
# risers and impacts on the scene changes. 97 seconds, 44.1 kHz stereo.
import numpy as np, wave

SR = 44100
DUR = 97.0
N = int(SR * DUR)
t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

BPM = 96.0
BEAT = 60 / BPM


def hz(n):  # midi -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def env(n, a, d, s=0.0, r=0.0):
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nd: e[na:na + nd] = np.linspace(1, s, nd)[: max(0, min(nd, n - na))]
    e[na + nd:] = s
    if r:
        nr = min(int(r * SR), n)
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):  # small buffers only
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * (1 - pan) / 1.0
    R[i:i + len(sig)] += sig * gain * (1 + pan) / 1.0


def automation(points):
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)


# ---------- pads (sustained chords, slow attack, detuned sines + soft saw) ----------
def pad(notes, start, dur, gain):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for m in notes:
        f = hz(m)
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * tt) + 0.18 * np.sin(2 * np.pi * 2 * ff * tt + 1.3)
    s *= env(n, min(1.8, dur / 3), 0.1, 1.0, min(1.8, dur / 3)) / (len(notes) * 3)
    add(s, start, gain, -0.2); add(s * 0.9, start + 0.013, gain, 0.2)


# chord map (midi): D minor-ish with the Hijaz Eb / F# colour
D_DRONE = [38, 45, 50]
PROG = [[50, 54, 57], [46, 50, 53], [48, 51, 55], [45, 49, 52]]  # D(F#) - Bb - Cm(Eb) - A
pad(D_DRONE, 0.0, 14.5, 0.55)
for k in range(9):  # 14 -> 48 : chords every 4 bars-ish
    pad(PROG[k % 4], 14.2 + k * 3.8, 4.4, 0.42)
for k in range(7):  # 48 -> 74 fuller
    pad([n + 12 for n in PROG[k % 4]] + PROG[k % 4], 48 + k * 3.75, 4.3, 0.46)
pad(D_DRONE + [57, 62], 74.0, 10.5, 0.42)
pad([50, 54, 57, 62, 66], 84.0, 4.3, 0.5)
pad([38, 50, 54, 57, 62, 69], 88.2, 8.6, 0.62)

# ---------- pluck arpeggio on the Hijaz scale ----------
HIJAZ = [62, 63, 66, 67, 69, 70, 72, 74]


def pluck(m, start, gain, pan):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    f = hz(m)
    s = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) + 0.25 * np.sin(2 * np.pi * 3 * f * tt))
    s *= np.exp(-tt * 6.5)
    add(s, start, gain, pan)


pattern = [0, 2, 4, 7, 4, 2, 1, 2]
step = BEAT / 2
x = 3.0
i = 0
while x < 92:
    if not (12.6 < x < 14.3) and not (86.8 < x < 88.2):
        g = 0.10 if x < 14 else 0.16 if x < 74 else 0.11
        note = HIJAZ[pattern[i % 8]] + (12 if (i // 16) % 2 and x > 48 else 0)
        pluck(note, x, g, 0.35 * np.sin(i * 0.9))
    x += step if x > 14 else step * 2
    i += 1

# ---------- melody (oud-like lead) in the roles section and finale ----------
MEL = [(69, 1), (70, .5), (69, .5), (67, 1), (66, 1), (67, .5), (69, .5), (70, 1), (69, 2),
       (72, 1), (70, .5), (69, .5), (67, 1), (66, .5), (63, .5), (62, 3)]
def lead(m, start, dur, gain):
    n = int((dur * BEAT + 0.4) * SR); tt = np.arange(n) / SR
    f = hz(m)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * tt) * np.clip(tt * 2, 0, 1)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + 0.45 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph) + 0.1 * np.sin(4 * ph)
    s *= env(n, 0.02, 0.25, 0.55, 0.3)
    add(s, start, gain, 0.1)
for rep, base in enumerate((50.0, 61.6)):
    x = base
    for m, d in MEL:
        lead(m, x, d, 0.085)
        x += d * BEAT

# ---------- bass ----------
def bass(m, start, dur, gain):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)
    s *= env(n, 0.01, 0.2, 0.7, 0.15)
    add(s, start, gain, 0)
roots = [38, 34, 36, 33]
for k in range(9):
    for b in range(4):
        bass(roots[k % 4], 14.2 + k * 3.8 + b * 0.95, 0.85, 0.22)
for k in range(7):
    for b in range(8):
        bass(roots[k % 4], 48 + k * 3.75 + b * 0.47, 0.42, 0.24)

# ---------- drums ----------
def kick(start, gain):
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 120 * np.exp(-tt * 18) + 45
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 7)
    add(s, start, gain)
def hat(start, gain, pan):
    n = int(0.08 * SR)
    s = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 60)
    s = s - np.concatenate([[0], s[:-1]])  # crude high-pass
    add(s, start, gain, pan)
def clap(start, gain):
    n = int(0.25 * SR); tt = np.arange(n) / SR
    s = rng.standard_normal(n) * (np.exp(-tt * 25) + 0.5 * np.exp(-np.maximum(tt - 0.012, 0) * 25) * (tt > .012))
    add(lowpass(s, 2500), start, gain)
x = 20.0
while x < 84:
    beat_in_bar = round((x - 20.0) / BEAT) % 4
    if not (35.4 < x < 36.6) and not (47.4 < x < 48.4) and not (73.4 < x < 74.5):
        kick(x, 0.55 if x < 48 else 0.7)
        hat(x + BEAT / 2, 0.05, 0.3)
        if x >= 48 and beat_in_bar in (1, 3):
            clap(x, 0.12)
    x += BEAT

# ---------- transitions: risers, whooshes and impacts ----------
def riser(end, length, gain):
    n = int(length * SR); tt = np.arange(n) / SR
    s = rng.standard_normal(n)
    s = lowpass(s, 1800) * (tt / length) ** 2
    add(s, end - length, gain, 0)
def whoosh(at, gain):
    n = int(1.2 * SR); tt = np.arange(n) / SR
    s = lowpass(rng.standard_normal(n), 1200) * np.sin(np.pi * tt / 1.2) ** 2
    add(s, at - 0.6, gain, 0.4)
def impact(at, gain):
    n = int(3.5 * SR); tt = np.arange(n) / SR
    s = (np.sin(2 * np.pi * (60 * np.exp(-tt * 3) + 32) * tt) * np.exp(-tt * 1.6)
         + 0.4 * lowpass(rng.standard_normal(n), 500) * np.exp(-tt * 3))
    add(s, at, gain, 0)

riser(14.2, 2.6, 0.32); impact(14.2, 0.8)
riser(88.2, 3.0, 0.38); impact(88.2, 0.95)
for at in (7.3, 20.0, 36.0, 48.0, 74.0, 84.2):
    whoosh(at, 0.22)
impact(48.0, 0.45)
for i in range(5):   # soft hits on each role (50, 54.8, ...)
    impact(50 + i * 4.8, 0.2)
pluck(74, 1.0, 0.18, 0); pluck(81, 1.05, 0.08, 0.3)  # the pin's ping

# ---------- reverb (feedback delays) and master ----------
def reverb(x, mix):
    y = x.copy()
    for d, g in ((0.0297, .5), (0.0371, .48), (0.0411, .46), (0.0437, .44)):
        k = int(d * SR)
        buf = x.copy()
        for _ in range(6):
            buf = np.concatenate([np.zeros(k), buf[:-k]]) * g
            y += buf * mix
    return y
L = reverb(L, 0.35); R = reverb(R, 0.35)
master = automation([(0, 0), (0.3, 1), (94.5, 1), (97, 0)])
L *= master; R *= master
peak = max(np.abs(L).max(), np.abs(R).max())
L = np.tanh(L / peak * 1.4) * 0.89; R = np.tanh(R / peak * 1.4) * 0.89
data = (np.stack([L, R], axis=1) * 32767).astype(np.int16)
with wave.open('music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print('music.wav', DUR, 's')
