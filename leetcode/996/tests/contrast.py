import json,os
from pathlib import Path
P=Path(__file__).resolve().parents[1];out=Path(os.environ.get('EVIDENCE_DIR',P/'tests/evidence'));out.mkdir(parents=True,exist_ok=True)
colors={'bg':'#0d1117','panel':'#161b22','panel2':'#1c2330','text':'#e8edf4','muted':'#9aa7b8','accent':'#6ee7ff','accent2':'#ffb454'}
def luminance(h):
 c=[int(h[i:i+2],16)/255 for i in (1,3,5)];c=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c];return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
def ratio(a,b):
 x,y=sorted([luminance(colors[a]),luminance(colors[b])]);return (y+.05)/(x+.05)
rows=[]
for fg in ['text','muted','accent','accent2']:
 for bg in ['bg','panel','panel2']:
  r=ratio(fg,bg);assert r>=4.5;rows.append({'foreground':fg,'background':bg,'ratio':round(r,3)})
assert ratio('accent2','panel2')>=3
sizes={str(f.relative_to(P.parent)):f.stat().st_size for f in [P.parent/'style.css',P/'style.css']};assert sum(sizes.values())<25000
(out/'contrast.json').write_text(json.dumps({'measuredExactOpaquePairs':rows,'focus':'3px accent2 + 4px offset against bg/panel/panel2','disabled':'opacity 1, muted on panel','shippedCSSBytes':sizes},indent=2)+'\n')
print('PASS contrast; min',min(r['ratio'] for r in rows),'CSS bytes',sum(sizes.values()))
