"""Draws the app icon (a little coral crab on a rose slate in a birch frame) straight to PNG files.
Usage: python3 tools/make_icon.py   (no image library needed: a tiny shape filler with 4x supersampling)"""
import os, struct, zlib
WOOD, SLATE, CHALK, CRAB, DARK, INK, GREEN = (210, 173, 140), (74, 47, 58), (248, 239, 234), (242, 135, 111), (184, 81, 63), (43, 26, 33), (127, 184, 138)
def ell(x, y, cx, cy, rx, ry): return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1
def seg(x, y, x0, y0, x1, y1, w):
    dx, dy = x1 - x0, y1 - y0; t = max(0, min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)))
    return (x - x0 - t * dx) ** 2 + (y - y0 - t * dy) ** 2 < w * w
def color_at(x, y):  # in 512 space
    if not (34 <= x < 478 and 34 <= y < 478): return WOOD
    if y > 400: return (95, 68, 74)
    for s in (-1, 1):
        if ell(x, y, 256 + s * 46, 190, 22, 22): return CHALK if not ell(x, y, 256 + s * 48, 190, 11, 11) else INK
        if seg(x, y, 256 + s * 40, 250, 256 + s * 44, 205, 9): return DARK
        if ell(x, y, 256 + s * 150, 200, 48, 48):
            return SLATE if seg(x, y, 256 + s * 150, 200, 256 + s * 205, 160, 16) else CRAB
        if seg(x, y, 256 + s * 100, 290, 256 + s * 140, 230, 14): return DARK
        for k in range(3):
            if seg(x, y, 256 + s * 90, 330 + k * 22, 256 + s * (160 + k * 10), 380 + k * 14, 9): return DARK
    if ell(x, y, 256, 320, 120, 80): return CRAB if not seg(x, y, 226, 340, 286, 340, 6) or y < 336 else INK
    return SLATE
def render(size):
    ss = 4; px = bytearray()
    for j in range(size):
        px.append(0)
        for i in range(size):
            acc = [0, 0, 0]
            for a in range(ss):
                for b in range(ss):
                    c = color_at((i + (a + .5) / ss) * 512 / size, (j + (b + .5) / ss) * 512 / size)
                    for k in range(3): acc[k] += c[k]
            px += bytes(v // (ss * ss) for v in acc)
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(bytes(px), 9)) + chunk(b'IEND', b'')
out = os.path.join(os.path.dirname(__file__), '..', 'icons')
for name, size in [('icon-512.png', 512), ('icon-192.png', 192), ('apple-touch-icon.png', 180)]:
    open(os.path.join(out, name), 'wb').write(render(size))
