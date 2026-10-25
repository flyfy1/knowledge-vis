import json,os
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=Path(os.environ.get('OUTPUT_DIR',root/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
def lum(h):
    a=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    a=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in a]
    return sum(x*w for x,w in zip(a,[.2126,.7152,.0722]))
def ratio(a,b):
    l,h=sorted([lum(a),lum(b)]);return (h+.05)/(l+.05)
pairs={}
for fg,name in [('#c9d4e2','explanation'),('#e8edf4','text'),('#9aa7b8','muted'),('#6ee7ff','accent'),('#ffb454','focus'),('#7ee2a8','good'),('#ff7a93','bad')]:
    for bg,bname in [('#0d1117','bg'),('#161b22','panel'),('#1c2330','panel2'),('#090e16','code')]:
        r=ratio(fg,bg);pairs[name+'/'+bname]=round(r,3);assert r>=4.5
pairs['selected bg on accent']=round(ratio('#0d1117','#6ee7ff'),3)
css=sum((root/x).stat().st_size for x in ['style.css'])+(root.parent/'style.css').stat().st_size
assert css<25000
(out/'contrast.json').write_text(json.dumps({'pairs':pairs,'shippedCSSBytes':css,'method':'WCAG sRGB relative luminance; opaque inherited palette with disabled opacity reset to 1'},indent=2));print('PASS contrast, CSS bytes',css)
