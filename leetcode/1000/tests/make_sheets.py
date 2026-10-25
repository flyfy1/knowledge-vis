from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import os
O=Path(os.environ.get('EVIDENCE_DIR',Path(__file__).parent/'evidence'))
for lang in ['en','zh']:
    for state in ['controls','state','prediction']:
        files=[O/f'{lang}-{w}-z{z}-{state}.png' for w in [320,390,736,1440] for z in [1,2]]
        sheet=Image.new('RGB',(1200,1050),'white');d=ImageDraw.Draw(sheet)
        for i,p in enumerate(files):
            im=Image.open(p);im.thumbnail((296,490));x=(i%4)*300;y=(i//4)*525;sheet.paste(im,(x,y+25));d.text((x+4,y+4),p.name,fill='black')
        sheet.save(O/f'sheet-{lang}-{state}.jpg')
    files=[O/f'{lang}-header.png']+[O/f'focus-{lang}-{x}.png'for x in ['ledger','failure','source','fallback']]
    sheet=Image.new('RGB',(1500,1030),'white');d=ImageDraw.Draw(sheet)
    for i,p in enumerate(files):
        im=Image.open(p);im.thumbnail((296,1000));sheet.paste(im,(i*300,25));d.text((i*300+4,4),p.name,fill='black')
    sheet.save(O/f'sheet-{lang}-details.jpg')
