"""Run the inspected read-only capture through SSH stdin; save a new local evidence file.
The remote capture refuses until the prior import is completed and its operator exited.
Object fetch, if required, is a separate explicitly authorized command, never done here.
"""
import argparse,hashlib,json,subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
assert not args.output.exists() and not args.output.with_suffix('.stderr').exists(),'Preserve prior evidence; choose a fresh output filename'
values={'pins':json.loads((HERE.parent/'pending-pins.json').read_text()),'manifest_raw':(HERE.parent/'payload-manifest.json').read_text(),
        'helper_source':(ROOT/'specs/reviews/parallel-968972-import-818-search-preparation-20261026/operate.py').read_text(),
        'reopen_source':(ROOT/'specs/reviews/workflow-copy-repair-transition-preparation-20261026/reopen.py').read_text(),
        'operator_source':(HERE.parent/'operate.py').read_text()}
body='\n'.join(k+'='+repr(v)for k,v in values.items())+'\n'+(HERE/'capture-readonly.py').read_text()
r=subprocess.run(['ssh','-o','BatchMode=yes','-o','ConnectTimeout=8','pi','python3 -B -'],input=body.encode(),capture_output=True)
args.output.parent.mkdir(parents=True,exist_ok=True)
with args.output.open('xb')as out:out.write(r.stdout)
with args.output.with_suffix('.stderr').open('xb')as out:out.write(r.stderr)
print(json.dumps({'exit_code':r.returncode,'output':str(args.output),'sha256':hashlib.sha256(r.stdout).hexdigest()}))
raise SystemExit(r.returncode)
