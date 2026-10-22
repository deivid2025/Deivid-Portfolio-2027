#!/usr/bin/env python3
"""
Build the hero ID badge card front (public/card-front.png).

Uses David's LinkedIn profile photo (with background removed) as the
circular headshot, and renders a clean dark ID-card design with name,
title, brand, real tech brand logos, "4 SISTEMAS EN PRODUCCIÓN" badge
and a barcode.

Output is 1024x1440 to match the Lanyard's FACE_WIDTH=1024 exactly,
so there's no upscaling when the texture is mapped onto the 3D card
(which was the cause of the previous "blurry card" bug).

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

# --- Card dimensions --------------------------------------------------------
# Match the Lanyard FACE_WIDTH=1024 exactly — no upscaling, sharp text.
CARD_W, CARD_H = 1024, 1440
# Scale factor vs the old 864-wide design — every size below is multiplied
# by S so the layout proportions are preserved at the new resolution.
S = CARD_W / 864

# --- Colors (match the website's dark palette) ----------------------------
# Website uses oklch(0.12 0.002 240) for --background (page bg) and
# oklch(0.16 0.002 240) for --card. Sampled from the browser, the actual
# rendered RGB values are:
#   --background dark ≈ RGB(12, 12, 12)
#   --card        dark ≈ RGB(12, 13, 14)
# We make the card surface slightly LIGHTER than the page bg so the ID
# badge visually "sits on top" of the page (matches the way real ID cards
# look on a table — elevated, not sinking into the background).
BG = (22, 23, 28)              # ~#16171C — slightly lighter than page bg, cool blue tint
BG_SOFT = (32, 33, 40)        # for borders/elevations
CARD_BG_DARK = (16, 17, 22)   # for inner panels (slightly darker than card surface)
TEXT_WHITE = (245, 245, 247)
TEXT_GRAY = (165, 167, 175)
TEXT_DIM = (115, 117, 125)
ACCENT = (200, 200, 205)
GRID = (32, 33, 40)
# Accent green for "LIVE" status (subtle, kept on-brand).
GREEN = (52, 211, 153)        # emerald-400 — matches palette, no warm tones
GREEN_DARK = (16, 80, 60)


def s(value):
    """Scale a dimension by S (rounded to int)."""
    return int(round(value * S))


# --- 1. Open + process LinkedIn photo (background removal) ----------------
src = Image.open(PHOTO_SRC).convert("RGBA")
W, H = src.size
print(f"Source photo: {W}x{H}")

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

# Feather alpha edge for smooth compositing.
alpha = mask.split()[-1]
alpha_smooth = alpha.filter(ImageFilter.GaussianBlur(1.4))
final_alpha = Image.composite(alpha_smooth, alpha, alpha)
mask.putalpha(final_alpha)

# Auto-crop to head + shoulders (top 55% of subject bbox).
full_bbox = mask.getbbox()
if full_bbox:
    top = full_bbox[1]
    bottom = full_bbox[3]
    head_shoulders_bottom = top + int((bottom - top) * 0.55)
    crop_bbox = (full_bbox[0], top, full_bbox[2], head_shoulders_bottom)
    cropped = mask.crop(crop_bbox)
else:
    cropped = mask

cw, ch = cropped.size
side = max(cw, ch)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(cropped, ((side - cw) // 2, (side - ch) // 2), cropped)

HEAD_SIZE = s(380)
headshot = square.resize((HEAD_SIZE, HEAD_SIZE), Image.LANCZOS)

# --- 2. Render the card background -----------------------------------------
card = Image.new("RGB", (CARD_W, CARD_H), BG)
draw = ImageDraw.Draw(card, "RGBA")

# Subtle grid pattern.
for x in range(0, CARD_W, s(48)):
    draw.line([(x, 0), (x, CARD_H)], fill=(*GRID, 80), width=1)
for y in range(0, CARD_H, s(48)):
    draw.line([(0, y), (CARD_W, y)], fill=(*GRID, 80), width=1)

# Outer border.
PAD = s(32)
draw.rounded_rectangle(
    [PAD, PAD, CARD_W - PAD, CARD_H - PAD],
    radius=s(28),
    outline=(40, 40, 40),
    width=2,
)

# --- 3. Lanyard hole at top -------------------------------------------------
HOLE_Y = s(80)
HOLE_R = s(22)
hole_cx = CARD_W // 2
draw.ellipse(
    [hole_cx - HOLE_R - 5, HOLE_Y - HOLE_R - 5,
     hole_cx + HOLE_R + 5, HOLE_Y + HOLE_R + 5],
    outline=(110, 110, 110), width=3,
)
draw.ellipse(
    [hole_cx - HOLE_R, HOLE_Y - HOLE_R, hole_cx + HOLE_R, HOLE_Y + HOLE_R],
    fill=(0, 0, 0), outline=(60, 60, 60), width=1,
)


# --- Font helper -----------------------------------------------------------
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


# --- 4. Header row: brand "DT" logo + "Engineering" tag --------------------
DT_R = s(28)
DT_CX = PAD + s(40)
DT_CY = PAD + s(40)
draw.ellipse(
    [DT_CX - DT_R, DT_CY - DT_R, DT_CX + DT_R, DT_CY + DT_R],
    fill=(245, 245, 245), outline=(200, 200, 200), width=2,
)

font_dt = load_font(s(22), bold=True)
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

font_brand = load_font(s(20), bold=True)
draw.text(
    (DT_CX + DT_R + s(12), DT_CY - s(12)),
    "DEIVID TECH",
    fill=TEXT_WHITE,
    font=font_brand,
)
font_brand_sub = load_font(s(11), bold=False)
draw.text(
    (DT_CX + DT_R + s(12), DT_CY + s(8)),
    "ENGINEERING",
    fill=TEXT_DIM,
    font=font_brand_sub,
)

# Right side: status badge "LIVE"
status_w = s(80)
status_h = s(28)
status_x = CARD_W - PAD - status_w - s(10)
status_y = DT_CY - s(14)
draw.rounded_rectangle(
    [status_x, status_y, status_x + status_w, status_y + status_h],
    radius=s(6),
    fill=GREEN,
)
font_status = load_font(s(11), bold=True)
status_text = "● LIVE"
bbox = draw.textbbox((0, 0), status_text, font=font_status)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
draw.text(
    (status_x + (status_w - tw) / 2, status_y + (status_h - th) / 2 - 2),
    status_text,
    fill=(245, 245, 245),
    font=font_status,
)

# --- 5. Circular headshot (centered) --------------------------------------
HS_CX = CARD_W // 2
HS_CY = s(340)
HS_R = HEAD_SIZE // 2

draw.ellipse(
    [HS_CX - HS_R - s(8), HS_CY - HS_R - s(8),
     HS_CX + HS_R + s(8), HS_CY + HS_R + s(8)],
    fill=(32, 33, 40),
)

circle_mask = Image.new("L", (HEAD_SIZE, HEAD_SIZE), 0)
circle_draw = ImageDraw.Draw(circle_mask)
circle_draw.ellipse([0, 0, HEAD_SIZE - 1, HEAD_SIZE - 1], fill=255)
circle_mask = circle_mask.filter(ImageFilter.GaussianBlur(1.2))

card_rgba = card.convert("RGBA")
card_rgba.paste(
    headshot,
    (HS_CX - HS_R, HS_CY - HS_R),
    circle_mask,
)
draw2 = ImageDraw.Draw(card_rgba, "RGBA")
draw2.ellipse(
    [HS_CX - HS_R - 1, HS_CY - HS_R - 1,
     HS_CX + HS_R + 1, HS_CY + HS_R + 1],
    outline=(80, 80, 80, 255), width=2,
)

card = card_rgba.convert("RGB")
draw = ImageDraw.Draw(card, "RGBA")

# --- 6. Name + title + location -------------------------------------------
font_name = load_font(s(48), bold=True)
font_title = load_font(s(20), bold=False)
font_meta = load_font(s(14), bold=False)

NAME_Y = HS_CY + HS_R + s(36)
name_text = "David Garay"
bbox = draw.textbbox((0, 0), name_text, font=font_name)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, NAME_Y),
    name_text,
    fill=TEXT_WHITE,
    font=font_name,
)

TITLE_Y = NAME_Y + s(60)
title_text = "Full-Stack Developer · Ciberseguridad · IA"
bbox = draw.textbbox((0, 0), title_text, font=font_title)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, TITLE_Y),
    title_text,
    fill=TEXT_GRAY,
    font=font_title,
)

LOC_Y = TITLE_Y + s(30)
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
# (The "4 SISTEMAS EN PRODUCCIÓN" count lives in the hero stats grid, NOT
# on this card. Removed here per user feedback — see FIXES_LOG.md.)
LOGO_Y = LOC_Y + s(40)
LOGO_SIZE = s(44)
LOGO_GAP = s(16)
LOGOS = [
    "SiPython.svg",
    "SiTypescript.svg",
    "SiNextdotjs.svg",
    "SiReact.svg",
    "SiDocker.svg",
    "SiPostgresql.svg",
    "SiSupabase.svg",
    "SiKalilinux.svg",
]

total_w = len(LOGOS) * LOGO_SIZE + (len(LOGOS) - 1) * LOGO_GAP
start_x = (CARD_W - total_w) // 2

for i, svg_name in enumerate(LOGOS):
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
    card.paste(logo, (start_x + i * (LOGO_SIZE + LOGO_GAP), LOGO_Y), logo)

font_label = load_font(s(11), bold=True)
label_text = "STACK EN PRODUCCIÓN"
bbox = draw.textbbox((0, 0), label_text, font=font_label)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, LOGO_Y + LOGO_SIZE + s(12)),
    label_text,
    fill=TEXT_DIM,
    font=font_label,
)

# --- 9. Barcode + serial number at the bottom ------------------------------
BC_Y = CARD_H - PAD - s(110)
BC_X = PAD + s(40)
BC_W = CARD_W - 2 * (PAD + s(40))
BC_H = s(60)

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

font_serial = load_font(s(14), bold=True)
serial_text = "ID · 2025-DT-PY-001"
bbox = draw.textbbox((0, 0), serial_text, font=font_serial)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, BC_Y + BC_H + s(12)),
    serial_text,
    fill=TEXT_GRAY,
    font=font_serial,
)

font_footer = load_font(s(10), bold=False)
footer = "deividtech.cloud · davidgaray849@gmail.com"
bbox = draw.textbbox((0, 0), footer, font=font_footer)
tw = bbox[2] - bbox[0]
draw.text(
    ((CARD_W - tw) / 2, CARD_H - PAD - s(24)),
    footer,
    fill=TEXT_DIM,
    font=font_footer,
)

# --- 10. Save --------------------------------------------------------------
card.save(OUT, "PNG", optimize=True)
print(f"Saved {OUT} ({CARD_W}x{CARD_H})")
print(f"File size: {os.path.getsize(OUT)} bytes")
