"""Make an overview of screenshots for author inspection; no product image assets."""
from pathlib import Path
from PIL import Image, ImageDraw
import os
out=Path(os.environ.get('EVIDENCE_DIR',Path(__file__).parent/'evidence'))
shots=sorted(p for p in out.glob('*.png') if not p.name.startswith('contact-'))
for batch in range(0,len(shots),8):
    sheet=Image.new('RGB',(1440,1400),'#161b22');draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(shots[batch:batch+8]):
        im=Image.open(p).convert('RGB');im.thumbnail((350,660))
        x=(i%4)*360;y=(i//4)*700
        draw.text((x+4,y+4),p.name,fill='#e8edf4');sheet.paste(im,(x,y+28))
    sheet.save(out/f'contact-{batch//8+1}.png')
print(len(shots),'screenshots in contact sheets')
