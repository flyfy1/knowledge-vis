"""Make bounded contact sheets from this run's browser captures."""
import json
import os
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).resolve().parent / 'evidence'))
results = json.loads((out / 'browser-results.json').read_text())
names = results['screenshots']
layout = out / 'layout-results.json'
if layout.exists():
    names += json.loads(layout.read_text())['captures']
files = [out / name for name in names]
for group in range((len(files)+5)//6):
    subset = files[group*6:group*6+6]
    canvas = Image.new('RGB', (1200, 1900), '#ffffff')
    for i, f in enumerate(subset):
        im = Image.open(f).convert('RGB')
        im.thumbnail((380, 900))
        x, y = (i % 3)*400, (i//3)*950
        canvas.paste(im, (x+(400-im.width)//2, y+30))
        ImageDraw.Draw(canvas).text((x+8, y+8), f.name, fill='#000000')
    canvas.save(out / f'inspection-{group+1}.jpg')
print(f'{len(files)} captures in {(len(files)+5)//6} sheets')
