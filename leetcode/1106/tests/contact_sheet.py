from pathlib import Path
from PIL import Image, ImageDraw
import os
OUT=Path(os.environ.get('OUTPUT_DIR',Path(__file__).resolve().parent/'evidence'))
files=[]
for lang in ['en','zh']:
    files += [OUT/f'{lang}-{width}-zoom{zoom}.png' for width in [320,390,736,1440] for zoom in [1,2]]
files += [OUT/f'header-{lang}-320-zoom2.png' for lang in ['en','zh']]
files += [OUT/f'{kind}-{lang}-{width}-zoom{zoom}.png' for lang in ['en','zh'] for kind in ['stacks','select'] for width,zoom in [(320,2),(390,1)]]
files += [OUT/f'section-{step}-{lang}.png' for lang in ['en','zh'] for step in [1,2,4,5]]
files += [OUT/f'terminal-{lang}.png' for lang in ['en','zh']]
files += [OUT/'forced-colors.png']
w,h=300,1100
for batch in range(0,len(files),8):
    items=files[batch:batch+8]
    sheet=Image.new('RGB',(4*w,2*h),'#0d1117');d=ImageDraw.Draw(sheet)
    for j,p in enumerate(items):
        im=Image.open(p).convert('RGB');im.thumbnail((w-12,h-40))
        x=(j%4)*w;y=(j//4)*h
        d.text((x+6,y+5),p.name,fill='white');sheet.paste(im,(x+6,y+30))
    sheet.save(OUT/f'contact-{batch//8+1}.png')
