"""Optional contact sheets for visual inspection; requires installed Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw
import os
out = Path(os.environ.get('EVIDENCE_DIR', Path(__file__).parent / 'evidence'))
out.mkdir(parents=True, exist_ok=True)
files = sorted(out.glob('*.png'))
for start in range(0, len(files), 8):
    sheet = Image.new('RGB', (1440, 1040), '#0d1117')
    draw = ImageDraw.Draw(sheet)
    for k, source in enumerate(files[start:start + 8]):
        image = Image.open(source)
        image.thumbnail((350, 480))
        x, y = (k % 4) * 360, (k // 4) * 520
        sheet.paste(image, (x, y + 24))
        draw.text((x + 4, y + 4), source.name, fill='white')
    sheet.save(out / f'sheet-{start // 8 + 1}.jpg')
print(f'{len(files)} screenshots indexed')
