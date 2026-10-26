"""Make a review-only contact sheet of browser captures; honors OUTPUT_DIR."""
from pathlib import Path
import os, math
from PIL import Image, ImageDraw
out=Path(os.environ.get('OUTPUT_DIR',Path(__file__).resolve().parent/'evidence'))
files=sorted(out.glob('*.png'))
sheet=Image.new('RGB',(1200,math.ceil(len(files)/4)*280),'white');draw=ImageDraw.Draw(sheet)
for i,p in enumerate(files):
    img=Image.open(p).convert('RGB');img.thumbnail((290,250))
    x=(i%4)*300;y=(i//4)*280
    sheet.paste(img,(x,y+25));draw.text((x+3,y+3),p.name,fill='black')
sheet.save(out/'contact-sheet.jpg',quality=85)
print(len(files),'screenshots')
