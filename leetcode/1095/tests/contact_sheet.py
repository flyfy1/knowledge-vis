"""Optional screenshot viewing aid; OUTPUT_DIR selects existing images and output."""
import os
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
out=Path(os.environ.get('OUTPUT_DIR',Path(__file__).parent/'evidence'));out.mkdir(parents=True,exist_ok=True)
names=[f'{lang}-{width}-zoom{zoom}.png' for lang in ['en','zh'] for width in [320,390,736,1440] for zoom in [1,2]]
canvas=Image.new('RGB',(1200,1900),'white');draw=ImageDraw.Draw(canvas)
for i,name in enumerate(names):
    im=Image.open(out/name).convert('RGB');im.thumbnail((290,440))
    x=(i%4)*300;y=(i//4)*475
    draw.text((x+5,y+2),name,fill='black');canvas.paste(im,(x+5,y+25))
canvas.save(out/'layout-contact.png')
# Full-page capture slices retain readable text for visual inspection.
f=out/'full-en.png'
if f.exists():
    im=Image.open(f)
    for i,y in enumerate(range(0,im.height,1600)):
        im.crop((0,y,im.width,min(y+1600,im.height))).save(out/f'full-en-part{i}.png')
print(out/'layout-contact.png')
