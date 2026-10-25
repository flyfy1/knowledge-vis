"""Inspection convenience; originals are retained. Honors OUTPUT_DIR."""
from PIL import Image, ImageDraw
from pathlib import Path
import os
out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).resolve().parent / 'evidence'))
files = sorted(out.glob('*.png'))
for start in range(0, len(files), 6):
    canvas = Image.new('RGB', (1200, 1100), '#0d1117')
    draw = ImageDraw.Draw(canvas)
    for i, file in enumerate(files[start:start + 6]):
        im = Image.open(file).convert('RGB')
        im.thumbnail((390, 510))
        x, y = (i % 3) * 400, (i // 3) * 550
        draw.text((x + 6, y + 4), file.name, fill='white')
        canvas.paste(im, (x + 5, y + 30))
    canvas.save(out / f'contact-{start // 6 + 1}.jpg', quality=90)
print(f'{len(files)} screenshots; contact sheets generated')
