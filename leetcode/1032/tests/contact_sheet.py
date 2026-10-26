"""Optional visual inspection aid; screenshot inputs and outputs use OUTPUT_DIR."""
from PIL import Image,ImageOps,ImageDraw
import os,pathlib
out=pathlib.Path(os.environ.get('OUTPUT_DIR',pathlib.Path(__file__).parent/'evidence'))
groups={lang:list(out.glob(f'{lang}-*-zoom*.png')) for lang in ['en','zh']}
for lang in ['en','zh']:
    groups['extra-'+lang]=[p for kind in ['header','prediction','source','exhausted','preset'] for p in out.glob(f'{kind}-{lang}-zoom*.png')]
groups['states']=[*out.glob('overlap-*.png'),*out.glob('forced-colors.png')]
for name,files in groups.items():
    files=sorted(files);sheet=Image.new('RGB',(1024,840*((len(files)+3)//4)), '#0d1117');draw=ImageDraw.Draw(sheet)
    for i,p in enumerate(files):
        image=Image.open(p).convert('RGB');image.thumbnail((250,800))
        x=(i%4)*256;y=(i//4)*840
        draw.text((x+3,y+3),p.name,fill='white');sheet.paste(image,(x+3,y+26))
    sheet.save(out/f'contact-{name}.jpg')
