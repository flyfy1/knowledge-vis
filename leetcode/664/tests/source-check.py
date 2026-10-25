"""Run the baseline captured from the real DOM by browser.cjs."""
from pathlib import Path
import os,json,runpy
P=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('OUTPUT_DIR',P/'tests/evidence'))
baseline=runpy.run_path(str(OUT/'rendered-baseline.py'))['baseline']
cases={'a':1,'aba':2,'aaabbb':2,'abc':3,'abab':3,'ababa':3,'abcba':3,'aabb':2,'abca':3,'bcacba':4}
for s,v in cases.items():assert baseline(s)==v,(s,v)
(OUT/'baseline-results.json').write_text(json.dumps({'executed':'BFS code captured from rendered DOM','cases':cases},indent=2)+'\n')
print('Rendered BFS PASS',len(cases))
