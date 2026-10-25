"""Create inspection sheets without changing candidate source; OUTPUT_DIR supported."""
import os
from pathlib import Path
from PIL import Image, ImageDraw
p=Path(os.environ.get('OUTPUT_DIR',Path(__file__).parent/'evidence'))
files=[f for f in sorted(p.glob('*.png')) if not any(x in f.name for x in ['contact','reading','full'])]
for start in range(0,len(files),6):
    sheet=Image.new('RGB',(960,1480),'#dddddd')
    for j,f in enumerate(files[start:start+6]):
        im=Image.open(f).convert('RGB');im.thumbnail((300,700))
        tile=Image.new('RGB',(320,740),'white');tile.paste(im,((320-im.width)//2,30))
        ImageDraw.Draw(tile).text((6,8),f.name,fill='black')
        sheet.paste(tile,((j%3)*320,(j//3)*740))
    sheet.save(p/f'contact-{start//6}.png')
