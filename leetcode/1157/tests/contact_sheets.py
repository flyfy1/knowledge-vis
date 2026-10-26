"""Create review sheets; OUTPUT_DIR is both screenshot input and sheet output."""
from pathlib import Path
import os
from PIL import Image, ImageDraw
out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent/'evidence'))
for lang in ('en','zh'):
    for kind in ('blocks','hand','prediction','heading'):
        files = sorted(out.glob(f'{lang}-*-{kind}.png'))
        if not files:
            continue
        columns = 4
        width, height = 400, 690
        canvas = Image.new('RGB',(width*columns,height*((len(files)+columns-1)//columns)), '#0d1117')
        draw = ImageDraw.Draw(canvas)
        for i,p in enumerate(files):
            im=Image.open(p).convert('RGB')
            im.thumbnail((width-12,height-40))
            x,y=(i%columns)*width,(i//columns)*height
            draw.text((x+6,y+5),p.name,fill='#e8edf4')
            canvas.paste(im,(x+6,y+30))
        canvas.save(out/f'sheet-{lang}-{kind}.jpg',quality=88)
print('Contact sheets created from browser screenshots; inspect originals for fine text.')
