"""Diagnostic thumbnail sheet; OUTPUT_DIR selects both screenshot input and output."""
from pathlib import Path
import os
from PIL import Image, ImageDraw
out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).resolve().parent/'evidence'))
files = sorted(p for p in out.glob('*.png') if p.name != 'contact-sheet.png')
width, height = 260, 370
sheet = Image.new('RGB', (width*4, height*((len(files)+3)//4)), 'white')
draw = ImageDraw.Draw(sheet)
for i, p in enumerate(files):
    im = Image.open(p).convert('RGB')
    im.thumbnail((250, 340))
    x, y = (i%4)*width, (i//4)*height
    draw.text((x+5,y+4),p.name,fill='black')
    sheet.paste(im,(x+5,y+25))
sheet.save(out/'contact-sheet.png')
