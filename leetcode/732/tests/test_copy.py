import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
def unique(pairs):
    d={}
    for key,value in pairs:
        assert key not in d, f'duplicate key: {key}'
        d[key]=value
    return d
text=(root/'copy.js').read_text()
data=json.loads(text.removeprefix('window.LESSON_COPY = ').rstrip().removesuffix(';'),object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in data.values())
for key in re.findall('data-i18n="([^"]+)"',(root/'index.html').read_text()):assert key in data,key
print('PASS',len(data),'unique bilingual keys and static bindings')
