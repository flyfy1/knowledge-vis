"""Arrange existing screenshots for author visual inspection; OUTPUT_DIR is rerunnable."""
from pathlib import Path
from PIL import Image, ImageDraw
import os
root = Path(__file__).resolve().parents[1]
out = Path(os.environ.get('OUTPUT_DIR', root/'tests/evidence'))
groups = {f'trace-{w}': [f'{lang}-{w}-zoom{z}-trace.png' for lang in ['zh','en'] for z in [1,2]] for w in [320,390,736,1440]}
groups.update({f'prediction-{w}':[f'{lang}-{w}-zoom{z}-prediction.png' for lang in ['zh','en'] for z in [1,2]] for w in [320,1440]})
groups['headings'] = [f'{lang}-320-zoom{z}-heading.png' for lang in ['zh','en'] for z in [1,2]]
for key, files in groups.items():
    imgs=[Image.open(out/f).convert('RGB') for f in files]
    w=max(i.width for i in imgs)
    sheet=Image.new('RGB',(w*2,1040*2),(13,17,23))
    d=ImageDraw.Draw(sheet)
    for j,(img,name) in enumerate(zip(imgs,files)):
        x=(j%2)*w;y=(j//2)*1040
        d.text((x+8,y+8),name,fill=(232,237,244))
        sheet.paste(img,(x,y+32))
    sheet.save(out/f'contact-{key}.png')
print('Created 7 contact sheets covering all 28 screenshots')
