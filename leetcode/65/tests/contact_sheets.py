"""Optional visual-inspection aid. OUTPUT_DIR selects existing screenshot folder."""
import os
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
shots = sorted(p for p in out.glob('*.png') if not p.name.startswith('contact-'))
for batch in range(0,len(shots),4):
    sheet = Image.new('RGB',(980,2080),'#0d1117')
    draw = ImageDraw.Draw(sheet)
    for offset,p in enumerate(shots[batch:batch+4]):
        im = Image.open(p).convert('RGB')
        im.thumbnail((480,1000))
        x = (offset%2)*490
        y = (offset//2)*1040
        draw.text((x+4,y+4),p.name,fill='#e8edf4')
        sheet.paste(im,(x,y+30))
    sheet.save(out/f'contact-{batch//4+1}.jpg',quality=88)
print(f'{len(shots)} screenshots in {(len(shots)+3)//4} contact sheets')
