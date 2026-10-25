import json
from pathlib import Path
text=(Path(__file__).resolve().parents[1]/'copy.js').read_text()
def unique(pairs):
    out={}
    for k,v in pairs:
        assert k not in out, 'Duplicate copy key: '+k
        out[k]=v
    return out
copy=json.loads(text[text.index('{'):text.rindex('}')+1],object_pairs_hook=unique)
assert all(isinstance(v,list) and len(v)==2 and all(isinstance(x,str) and x for x in v) for v in copy.values())
print(f'{len(copy)} unique bilingual pairs')
