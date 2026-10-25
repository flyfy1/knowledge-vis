"""Make inspection contact sheets from browser captures (optional; requires Pillow)."""
import os,pathlib
from PIL import Image,ImageOps,ImageDraw
out=pathlib.Path(os.environ.get('LESSON_OUTPUT_DIR',pathlib.Path(__file__).parent/'evidence'))
for kind in ('diagram','prediction'):
    paths=sorted(out.glob(f'*-*-{kind}.png'))
    sheet=Image.new('RGB',(1120,740*((len(paths)+3)//4)),'white')
    for i,p in enumerate(paths):
        im=Image.open(p).convert('RGB');im.thumbnail((280,700))
        x=(i%4)*280;y=(i//4)*740
        sheet.paste(im,(x,y+30));ImageDraw.Draw(sheet).text((x+4,y+4),p.name,fill='black')
    sheet.save(out/f'contact-{kind}.jpg',quality=85)
