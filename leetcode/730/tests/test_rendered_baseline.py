"""Execute the exact baseline extracted by the real browser, not a retyped copy."""
import itertools,json,os
from pathlib import Path
out=Path(os.environ.get('OUTPUT_DIR',Path(__file__).parent/'evidence'))
namespace={};exec((out/'rendered-baseline.py').read_text(),namespace)
def independent(s):
    words=['']
    for c in s:words+= [w+c for w in words]
    return len({w for w in words if w and w==w[::-1]})
cases=0
for n in range(1,7):
    for chars in itertools.product('abc',repeat=n):
        s=''.join(chars);assert namespace['oracle'](s)==independent(s);cases+=1
(out/'rendered-baseline-results.json').write_text(json.dumps({'cases':cases,'exact_browser_extracted_baseline_executed':True},indent=2)+'\n')
