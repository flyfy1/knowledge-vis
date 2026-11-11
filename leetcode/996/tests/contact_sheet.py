from pathlib import Path
import os
from PIL import Image,ImageDraw
P=Path(__file__).resolve().parents[1];out=Path(os.environ.get('EVIDENCE_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
for name,files in [('en-overview',sorted(out.glob('en-*-zoom[12].png'))),('zh-overview',sorted(out.glob('zh-*-zoom[12].png'))),('dense-overview',sorted(out.glob('*-dense.png')))]:
    sheet=Image.new('RGB',(1600,1040*((len(files)+3)//4)), '#0d1117');draw=ImageDraw.Draw(sheet)
    for i,f in enumerate(files):
        im=Image.open(f);im.thumbnail((390,1000));x=(i%4)*400;y=(i//4)*1040
        draw.text((x+5,y+5),f.name,fill='white');sheet.paste(im,(x,y+30))
    sheet.save(out/(name+'.jpg'))
