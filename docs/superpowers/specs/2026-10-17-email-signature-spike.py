"""Throwaway spike: write "Mat Brown" through the letterforms and save a GIF.

Usage: python spike.py <font.ttf | mask.png> <out.gif> [text]
A .png is a white-on-black mask rendered 4x, e.g. from phraseShape via sharp.
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from skimage.morphology import skeletonize

FONT, OUT = sys.argv[1], sys.argv[2]
TEXT = sys.argv[3] if len(sys.argv) > 3 else "Mat Brown"

SS = 4                 # supersampling factor
FONT_PX = 128          # font size in the output GIF (2x for retina)
PAD = 40               # output padding, px
FPS_MS = 20            # frame delay
WRITE, HOLD, ERASE, GAP = 2.4, 3.6, 1.2, 0.6   # seconds
INK = (248, 99, 67)    # vermilion
BG = (255, 255, 255)

# 1. Render the name at SS x the output size.
pad = PAD * SS
if FONT.endswith(".png"):
    ink = Image.open(FONT).convert("L")
    W, H = ink.width + 2 * pad, ink.height + 2 * pad
    W, H = W + (-W) % SS, H + (-H) % SS
    glyph = Image.new("L", (W, H), 0)
    glyph.paste(ink, (pad, pad))
else:
    font = ImageFont.truetype(FONT, FONT_PX * SS)
    l, t, r, b = font.getbbox(TEXT)
    W, H = r - l + 2 * pad, b - t + 2 * pad
    W, H = W + (-W) % SS, H + (-H) % SS
    glyph = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glyph).text((pad - l, pad - t), TEXT, font=font, fill=255)
g = np.asarray(glyph).astype(np.float32) / 255
solid = g > 0.5

# 2. Center line of the letters.
skel = skeletonize(solid)

# 3. Pen walk: depth first through the center line, one component at a time,
#    left to right, starting each at its leftmost end. Prefer the neighbor that
#    keeps the current direction, so loops are drawn one way round.
order = np.full(skel.shape, -1, dtype=np.int64)
NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
ys, xs = np.nonzero(skel)
pts = set(zip(ys.tolist(), xs.tolist()))

def neighbors(p):
    return [(p[0] + dy, p[1] + dx) for dy, dx in NB if (p[0] + dy, p[1] + dx) in pts]

labels, n = ndimage.label(skel, structure=np.ones((3, 3)))
comps = []
for i in range(1, n + 1):
    cy, cx = np.nonzero(labels == i)
    if len(cy) < 6 * SS:      # drop specks
        continue
    comps.append((cx.min(), i, list(zip(cy.tolist(), cx.tolist()))))
comps.sort()

step = 0
LIFT = 40 * SS               # pen-lift pause between components, in path px
for _, i, cpts in comps:
    ends = [p for p in cpts if len(neighbors(p)) == 1] or cpts
    start = min(ends, key=lambda p: (p[1], -p[0]))
    stack = [(start, (0, 1))]
    while stack:
        p, d = stack.pop()
        if order[p] >= 0:
            continue
        order[p] = step
        step += 1
        nxt = [q for q in neighbors(p) if order[q] < 0]
        # push worst first so the straightest continuation pops first
        nxt.sort(key=lambda q: (q[0] - p[0]) * d[0] + (q[1] - p[1]) * d[1])
        for q in nxt:
            stack.append((q, (q[0] - p[0], q[1] - p[1])))
    step += LIFT
total = step - LIFT

# 4. Each ink pixel takes the time of its nearest center-line pixel.
_, (iy, ix) = ndimage.distance_transform_edt(order < 0, return_indices=True)
t_px = order[iy, ix].astype(np.float32) / total
t_px[g <= 0.01] = 2.0

def ease(x):  # ease in-out, gentle
    return 3 * x * x - 2 * x * x * x

def frame(progress):
    """progress 0..1 = fraction of the path inked."""
    a = g * (t_px <= progress)
    a = a.reshape(H // SS, SS, W // SS, SS).mean(axis=(1, 3))[..., None]
    img = np.array(BG, np.float32) * (1 - a) + np.array(INK, np.float32) * a
    return Image.fromarray(img.astype(np.uint8), "RGB")

frames, durs = [], []
fps = 1000 / FPS_MS
for k in range(int(WRITE * fps)):
    frames.append(frame(ease((k + 1) / (WRITE * fps)))); durs.append(FPS_MS)
frames.append(frame(1.0)); durs.append(int(HOLD * 1000))
for k in range(int(ERASE * fps)):
    frames.append(frame(1 - ease((k + 1) / (ERASE * fps)))); durs.append(FPS_MS)
frames.append(frame(0.0)); durs.append(int(GAP * 1000))

frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=durs,
               loop=0, optimize=True, disposal=1)
print(f"{len(frames)} frames, {W // SS}x{H // SS}px, {len(comps)} strokes")
