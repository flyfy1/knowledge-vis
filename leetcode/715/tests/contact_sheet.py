"""Create labeled review sheets from browser screenshots without modifying originals."""
import os
from pathlib import Path
from PIL import Image, ImageDraw
out=Path(os.environ.get('OUTPUT_DIR',Path(__file__).parent/'evidence'))
files=sorted(p for p in out.glob('*.png') if not p.name.startswith('contact-'))
for start in range(0,len(files),6):
    batch=files[start:start+6]
    sheet=Image.new('RGB',(1080,1400),'#ffffff')
    draw=ImageDraw.Draw(sheet)
    for n,p in enumerate(batch):
        x,y=(n%3)*360,(n//3)*700
        draw.text((x+8,y+8),p.name,fill='#000000')
        im=Image.open(p).convert('RGB');im.thumbnail((344,660))
        sheet.paste(im,(x+8,y+30))
    sheet.save(out/f'contact-{start//6+1}.png')
print(len(files),'screenshots arranged for visual inspection')
