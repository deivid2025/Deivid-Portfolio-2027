#!/usr/bin/env python3
"""
Build favicon variants from profile-photo.png.

Goals:
  - Remove the light/off-white background completely (transparent alpha)
  - Focus on the upper body (head + torso) so the subject fills a square
    canvas — a full body shot is too small at favicon sizes (16/32/64)
  - Save favicon.png (64), icon.png (192), apple-icon.png (180), icon-512.png (512)

Run: python3 scripts/build_favicon.py
"""
from PIL import Image, ImageFilter
from pathlib import Path
from collections import deque

SRC = Path("/home/z/my-project/public/profile-photo.png")
OUT_DIR = Path("/home/z/my-project/public")

src = Image.open(SRC).convert("RGBA")
W, H = src.size
print(f"Source: {W}x{H} {src.mode}")

# --- 1. Background removal: flood-fill from all 4 edges ------------------
# Threshold lowered to 185 so the soft shadow gradient near the subject
# (which fades from white to gray) is also removed.
THRESH = 185

def is_bg_pixel(px):
    r, g, b = px[0], px[1], px[2]
    return r >= THRESH and g >= THRESH and b >= THRESH

mask = src.copy()
pixels = mask.load()

visited = bytearray(W * H)
queue = deque()

def enqueue(x, y):
    if 0 <= x < W and 0 <= y < H:
        idx = y * W + x
        if not visited[idx]:
            queue.append((x, y, idx))

# Seed from a thick border (every pixel on each edge) for more reliable fill.
for x in range(W):
    enqueue(x, 0)
    enqueue(x, H - 1)
for y in range(H):
    enqueue(0, y)
    enqueue(W - 1, y)

while queue:
    x, y, idx = queue.popleft()
    if visited[idx]:
        continue
    visited[idx] = 1
    px = pixels[(x, y)]
    if not is_bg_pixel(px):
        continue
    pixels[(x, y)] = (0, 0, 0, 0)
    enqueue(x + 1, y)
    enqueue(x - 1, y)
    enqueue(x, y + 1)
    enqueue(x, y - 1)

# --- 2. Soften the alpha edge for anti-aliasing ---------------------------
alpha = mask.split()[-1]
alpha_smooth = alpha.filter(ImageFilter.GaussianBlur(1.2))
final_alpha = Image.composite(alpha_smooth, alpha, alpha)
mask.putalpha(final_alpha)

# --- 3. Auto-crop to the subject's full bounding box ----------------------
full_bbox = mask.getbbox()
if not full_bbox:
    raise SystemExit("No opaque pixels found — check source image")

# We want the favicon to focus on HEAD + TORSO so the subject reads well at
# 16x16/32x32. Use the top ~62% of the subject's vertical extent (head +
# shoulders + upper chest). Discard the lower body.
top = full_bbox[1]
bottom = full_bbox[3]
head_torso_bottom = top + int((bottom - top) * 0.62)
crop_bbox = (full_bbox[0], top, full_bbox[2], head_torso_bottom)
cropped = mask.crop(crop_bbox)
cw, ch = cropped.size
print(f"Full bbox: {full_bbox} -> cropped to upper body {crop_bbox} = {cw}x{ch}")

# Square-pad to a 1:1 canvas centered.
side = max(cw, ch)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(cropped, ((side - cw) // 2, (side - ch) // 2), cropped)

# --- 4. Save variants -----------------------------------------------------
sizes = {
    "favicon.png": 64,
    "icon.png": 192,
    "apple-icon.png": 180,
    "icon-512.png": 512,
}

for name, size in sizes.items():
    out = square.resize((size, size), Image.LANCZOS)
    out_path = OUT_DIR / name
    out.save(out_path, "PNG", optimize=True)
    print(f"  saved {out_path} ({size}x{size})")

# Stats
alpha_final = square.split()[-1]
hist = alpha_final.histogram()
transparent = sum(hist[0:30])
total = side * side
print(f"Final subject coverage: {100*(total-transparent)/total:.1f}% opaque, {100*transparent/total:.1f}% transparent")
print("Done.")
