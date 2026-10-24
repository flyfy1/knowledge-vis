"""Review-only screenshot contact sheets; OUTPUT_DIR is also the capture input."""
from pathlib import Path
import os
from PIL import Image, ImageDraw
out=Path(os.environ.get('OUTPUT_DIR',Path(__file__).parent/'evidence'))
groups={
    'inspection-traces':sorted(out.glob('trace-*.png')),
    'inspection-zoom':sorted(out.glob('zoom200-*.png')),
    'inspection-ranges':sorted(out.glob('ranges-*.png')),
}
for name,files in groups.items():
    cols=4 if name!='inspection-zoom' else 2
    tiles=[]
    for f in files:
        im=Image.open(f).convert('RGB')
        im.thumbnail((300,1000))
        tile=Image.new('RGB',(300,im.height+24),'white')
        ImageDraw.Draw(tile).text((6,4),f.name,fill='black')
        tile.paste(im,(0,24));tiles.append(tile)
    rowheight=max(im.height for im in tiles)
    sheet=Image.new('RGB',(cols*300,((len(tiles)+cols-1)//cols)*rowheight),'#ddd')
    for i,im in enumerate(tiles):sheet.paste(im,((i%cols)*300,(i//cols)*rowheight))
    sheet.save(out/(name+'.png'))
# Readable phone header crops from full-page captures.
headers=Image.new('RGB',(780,1000),'white')
for i,lang in enumerate(['en','zh']):
    im=Image.open(out/f'page-{lang}-390.png').crop((0,0,390,1000))
    headers.paste(im,(i*390,0))
headers.save(out/'inspection-headers.png')
