#!/usr/bin/env python3
"""
Build the hero ID badge card front (public/card-front.png).

Uses David's LinkedIn profile photo (with background removed) as the
circular headshot, and renders a clean dark ID-card design with name,
title, brand, real tech brand logos, and a barcode.

Run: python3 scripts/build_card_front.py
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path
import cairosvg
import io
import os

PROJECT = Path("/home/z/my-project")
PUBLIC = PROJECT / "public"
ASSETS = PROJECT / "scripts" / "card-assets"

PHOTO_SRC = PROJECT / "upload" / "deivid perfil linkedin.png"
OUT = PUBLIC / "card-front.png"

# Card dimensions — matches the existing card-front.png used by Lanyard.
CARD_W, CARD_H = 864, 1152

# Colors (monochrome dark aesthetic to match portfolio)
BG = (10, 10, 10)              # near-black
BG_SOFT = (22, 22, 22)         # slightly lighter for borders
TEXT_WHITE = (245, 245, 245)
TEXT_GRAY = (160, 160, 160)
TEXT_DIM = (110, 110, 110)
ACCENT = (200, 200, 200)
GRID = (28, 28, 28)            # subtle grid lines

# --- 1. Open + process LinkedIn photo (background removal) ----------------
src = Image.open(PHOTO_SRC).convert("RGBA")
W, H = src.size
print(f"Source photo: {W}x{H}")

# Flood-fill from edges; threshold 185 catches the soft shadow gradient.
THRESH = 185

def is_bg_pixel(px):
    r, g, b = px[0], px[1], px[2]
    return r >= THRESH and g >= THRESH and b >= THRESH

mask = src.copy()
pixels = mask.load()

from collections import deque
visited = bytearray(W * H)
queue = deque()

def enqueue(x, y):
    if 0 <= x < W and 0 <= y < H:
        idx = y * W + x
        if not visited[idx]:
            queue.append((x, y, idx))

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

# Feather the alpha edge for smooth compositing.
alpha = mask.split()[-1]
alpha_smooth = alpha.filter(ImageFilter.GaussianBlur(1.4))
final_alpha = Image.composite(alpha_smooth, alpha, alpha)
mask.putalpha(final_alpha)

# Auto-crop to the upper-body region (head + shoulders) so the headshot
# is filled nicely instead of showing the full body.
full_bbox = mask.getbbox()
if full_bbox:
    top = full_bbox[1]
    bottom = full_bbox[3]
    head_shoulders_bottom = top + int((bottom - top) * 0.55)
    crop_bbox = (full_bbox[0], top, full_bbox[2], head_shoulders_bottom)
    cropped = mask.crop(crop_bbox)
else:
    cropped = mask

# Square-pad to a square canvas.
cw, ch = cropped.size
side = max(cw, ch)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(cropped, ((side - cw) // 2, (side - ch) // 2), cropped)

# Final headshot size (large enough for the card)
HEAD_SIZE = 380
headshot = square.resize((HEAD_SIZE, HEAD_SIZE), Image.LANCZOS)

# --- 2. Render the card background ---------------------------------------
card = Image.new("RGB", (CARD_W, CARD_H), BG)
draw = ImageDraw.Draw(card, "RGBA")

# Subtle grid pattern (graph-paper feel, very faint)
for x in range(0, CARD_W, 48):
    draw.line([(x, 0), (x, CARD_H)], fill=(*GRID, 80), width=1)
for y in range(0, CARD_H, 48):
    draw.line([(0, y), (CARD_W, y)], fill=(*GRID, 80), width=1)

# Outer border
PAD = 32
draw.rounded_rectangle(
    [PAD, PAD, CARD_W - PAD, CARD_H - PAD],
    radius=28,
    outline=(40, 40, 40),
    width=2,
)

# --- 3. Lanyard hole at top (silver ring) ---------------------------------
HOLE_Y = 80
HOLE_R = 22
hole_cx = CARD_W // 2
# Outer ring (silver)
draw.ellipse(
    [hole_cx - HOLE_R - 5, HOLE_Y - HOLE_R - 5,
     hole_cx + HOLE_R + 5, HOLE_Y + HOLE_R + 5],
    outline=(110, 110, 110), width=3,
)
# Inner black hole
draw.ellipse(
    [hole_cx - HOLE_R, HOLE_Y - HOLE_R, hole_cx + HOLE_R, HOLE_Y + HOLE_R],
    fill=(0, 0, 0), outline=(60, 60, 60), width=1,
)

# --- 4. Header row: brand "DT" logo + "Engineering" tag -----------------
# DT circular logo (top-left)
DT_R = 28
DT_CX = PAD + 40
DT_CY = PAD + 40
draw.ellipse(
    [DT_CX - DT_R, DT_CY - DT_R, DT_CX + DT_R, DT_CY + DT_R],
    fill=(245, 245, 245), outline=(200, 200, 200), width=2,
)

# Find a usable font
def load_font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

font_dt = load_font(22, bold=True)
# Center "DT" inside the circle
dt_text = "DT"
bbox = draw.textbbox((0, 0), dt_text, font=font_dt)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
draw.text(
    (DT_CX - tw / 2, DT_CY - th / 2 - 2),
    dt_text,
    fill=(10, 10, 10),
    font=font_dt,
)

# Brand text next to the DT logo
font_brand = load_font(20, bold=True)
draw.text(
    (DT_CX + DT_R + 12, DT_CY - 12),
    "DEIVID TECH",
    fill=TEXT_WHITE,
    font=font_brand,
)
font_brand_sub = load_font(11, bold=False)
draw.text(
    (DT_CX + DT_R + 12, DT_CY + 8),
    "ENGINEERING",
    fill=TEXT_DIM,
    font=font_brand_sub,
)

# Right side: status badge "LIVE"
status_x = CARD_W - PAD - 90
status_y = DT_CY - 14
draw.rounded_rectangle(
    [status_x, status_y, status_x + 80, status_y + 28],
    radius=6,
    fill=(34, 197, 94),
)
font_status = load_font(11, bold=True)
status_text = "● LIVE"
bbox = draw.textbbox((0, 0), status_text, font=font_status)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
draw.text(
    (status_x + (80 - tw) / 2, status_y + (28 - th) / 2 - 2),
    status_text,
    fill=(245, 245, 245),
    font=font_status,
)

# --- 5. Circular headshot (centered) --------------------------------------
HS_CX = CARD_W // 2
HS_CY = 340
HS_R = HEAD_SIZE // 2

# Photo background ring (slight outer halo)
draw.ellipse(
    [HS_CX - HS_R - 8, HS_CY - HS_R - 8,
     HS_CX + HS_R + 8, HS_CY + HS_R + 8],
    fill=(28, 28, 28),
)

# Composite the headshot into a circular alpha mask
circle_mask = Image.new("L", (HEAD_SIZE, HEAD_SIZE), 0)
circle_draw = ImageDraw.Draw(circle_mask)
circle_draw.ellipse([0, 0, HEAD_SIZE - 1, HEAD_SIZE - 1], fill=255)
# Anti-alias the mask edge
circle_mask = circle_mask.filter(ImageFilter.GaussianBlur(1.2))

# Place headshot using the circle mask
card_rgba = card.convert("RGBA")
card_rgba.paste(
    headshot,
    (HS_CX - HS_R, HS_CY - HS_R),
    circle_mask,
)
# Draw a thin ring around the headshot for definition
draw2 = ImageDraw.Draw(card_rgba, "RGBA")
draw2.ellipse(
    [HS_CX - HS_R - 1, HS_CY - HS_R - 1,
     HS_CX + HS_R + 1, HS_CY + HS_R + 1],
    outline=(80, 80, 80, 255), width=2,
)

card = card_rgba.convert("RGB")
draw = ImageDraw.Draw(card, "RGBA")

# --- 6. Name + title + location -------------------------------------------
font_name = load_font(48, bold=True)
font_title = load_font(20, bold=False)
font_meta = load_font(14, bold=False)

NAME_Y = HS_CY + HS_R + 36
name_text = "David Garay"
bbox = draw.textbbox((0, 0), name_text, font=font_name)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, NAME_Y),
    name_text,
    fill=TEXT_WHITE,
    font=font_name,
)

TITLE_Y = NAME_Y + 60
title_text = "Full-Stack Developer · Ciberseguridad · IA"
bbox = draw.textbbox((0, 0), title_text, font=font_title)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, TITLE_Y),
    title_text,
    fill=TEXT_GRAY,
    font=font_title,
)

LOC_Y = TITLE_Y + 30
loc_text = "Paraguay · Remoto"
bbox = draw.textbbox((0, 0), loc_text, font=font_meta)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, LOC_Y),
    loc_text,
    fill=TEXT_DIM,
    font=font_meta,
)

# --- 7. Tech logos row ----------------------------------------------------
# Render each SVG to a PNG at a fixed size, then composite centered.
LOGO_Y = LOC_Y + 50
LOGO_SIZE = 44
LOGO_GAP = 16
LOGOS = [
    ("SiPython.svg", "#FFD43B"),
    ("SiTypescript.svg", "#FFFFFF"),
    ("SiNextdotjs.svg", "#FFFFFF"),
    ("SiReact.svg", "#61DAFB"),
    ("SiDocker.svg", "#2496ED"),
    ("SiPostgresql.svg", "#4169E1"),
    ("SiSupabase.svg", "#3FCF8E"),
    ("SiKalilinux.svg", "#FFFFFF"),
]

# Compute total width
total_w = len(LOGOS) * LOGO_SIZE + (len(LOGOS) - 1) * LOGO_GAP
start_x = (CARD_W - total_w) // 2

for i, (svg_name, _) in enumerate(LOGOS):
    svg_path = ASSETS / svg_name
    if not svg_path.exists():
        continue
    png_bytes = cairosvg.svg2png(
        url=str(svg_path),
        output_width=LOGO_SIZE,
        output_height=LOGO_SIZE,
        background_color="rgba(0,0,0,0)",
    )
    logo = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    # White-tint all logos on dark background so they read uniformly
    # (keeps the brand identity but visually consistent)
    # Actually keep brand colors for visual interest
    card.paste(logo, (start_x + i * (LOGO_SIZE + LOGO_GAP), LOGO_Y), logo)

# Tech section label
font_label = load_font(11, bold=True)
label_text = "STACK EN PRODUCCIÓN"
bbox = draw.textbbox((0, 0), label_text, font=font_label)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, LOGO_Y + LOGO_SIZE + 12),
    label_text,
    fill=TEXT_DIM,
    font=font_label,
)

# --- 8. Barcode + serial number at the bottom ------------------------------
BC_Y = CARD_H - PAD - 110
BC_X = PAD + 40
BC_W = CARD_W - 2 * (PAD + 40)
BC_H = 60

# Draw random-ish barcode stripes (deterministic for repeatability)
import random
random.seed(42)
draw.rectangle([BC_X, BC_Y, BC_X + BC_W, BC_Y + BC_H], fill=TEXT_WHITE)
x = BC_X + 4
while x < BC_X + BC_W - 4:
    bw = random.choice([1, 1, 2, 2, 3, 4, 1, 2, 3, 1, 4])
    if x + bw > BC_X + BC_W - 4:
        break
    if random.random() > 0.4:
        draw.rectangle([x, BC_Y + 4, x + bw, BC_Y + BC_H - 4], fill=(10, 10, 10))
    x += bw + random.choice([1, 1, 2, 2, 3])

font_serial = load_font(14, bold=True)
serial_text = "ID · 2025-DT-PY-001"
bbox = draw.textbbox((0, 0), serial_text, font=font_serial)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, BC_Y + BC_H + 12),
    serial_text,
    fill=TEXT_GRAY,
    font=font_serial,
)

# Footer brand line
font_footer = load_font(10, bold=False)
footer = "deividtech.cloud · davidgaray849@gmail.com"
bbox = draw.textbbox((0, 0), footer, font=font_footer)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, CARD_H - PAD - 24),
    footer,
    fill=TEXT_DIM,
    font=font_footer,
)

# --- 9. Save --------------------------------------------------------------
card.save(OUT, "PNG", optimize=True)
print(f"Saved {OUT} ({CARD_W}x{CARD_H})")
print(f"File size: {os.path.getsize(OUT)} bytes")
