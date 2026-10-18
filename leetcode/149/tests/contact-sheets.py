"""Optional screenshot inspection aid; honors OUTPUT_DIR, requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
import os

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
names = json.loads((out / 'browser-results.json').read_text())['screenshots']
groups = {
    'presets': [n for n in names if n.startswith('preset-')],
    'plots': [n for n in names if n.startswith('plot-')],
    'counts': [n for n in names if n.startswith('counts-')],
    'zoom-focus': [n for n in names if n.startswith(('zoom', 'forced'))],
}
for step in [0, 1, 3, 4]:
    groups[f'section-{step}'] = [n for n in names if n.startswith(f'section-{step}')]
for group, files in groups.items():
    tiles = []
    section = group.startswith('section')
    for name in files:
        im = Image.open(out / name).convert('RGB')
        for top in (range(0, im.height, 1000) if section else [0]):
            crop = im.crop((0, top, im.width, min(top + 1000, im.height))) if section else im.copy()
            crop.thumbnail((390, 1000) if section else (360, 800))
            tile = Image.new('RGB', (crop.width + 16, crop.height + 44), '#0d1117')
            tile.paste(crop, (8, 36))
            ImageDraw.Draw(tile).text((8, 8), name + (f' @{top}' if top else ''), fill='white')
            tiles.append(tile)
    cols = min(4, len(tiles))
    width, height = max(t.width for t in tiles), max(t.height for t in tiles)
    sheet = Image.new('RGB', (cols * width, ((len(tiles) + cols - 1) // cols) * height), '#0d1117')
    for i, tile in enumerate(tiles):
        sheet.paste(tile, ((i % cols) * width, (i // cols) * height))
    sheet.save(out / f'inspection-{group}.jpg', quality=85)
print(f'{len(groups)} inspection sheets saved to {out}')
