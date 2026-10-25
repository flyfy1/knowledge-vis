"""Single authorized object fetch only after the exact prior import completed/exited.
This may write Git objects/FETCH_HEAD; it is deliberately not called read-only.
It never edits checkout files, campaign state, STOP or refs explicitly.
"""
import datetime,hashlib,json,subprocess
from pathlib import Path
repo=Path('/home/songyy/projects/leetcode-hard-campaign-20261018')
state=Path('/home/songyy/projects/leetcode-hard-campaign-state-20261018')
source='47d97f6bf07dd1f4b8c7e1ca493ca3d21b3b9c7b'
raw=(state/'import9961000-only-20261026-641c280f.json').read_bytes();r=json.loads(raw)
assert r['owner']=='import9961000-only-20261026-641c280f' and r['status']=='completed-resumed' and r['ledger_preserved'] is True
assert len(r['imports'])==2 and {str(i['problem_id'])for i in r['imports']}=={'996','1000'} and all(i['status']=='completed'for i in r['imports'])
assert not Path('/proc/1904720').exists() and not (state/'STOP').exists()
def git(*args):return subprocess.run(['git','-C',str(repo),*args],capture_output=True,text=True)
head_before=git('rev-parse','HEAD');assert head_before.returncode==0
assert git('ls-remote','origin','refs/heads/codex/leetcode-854-proof-bridge').stdout.split()[0]==source
probe=git('cat-file','-e',source+'^{commit}')
fetch=None
if probe.returncode:
 fetch=git('fetch','--no-tags','origin',source)
result={'observed_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'previous_receipt_sha256':hashlib.sha256(raw).hexdigest(),'operator_exited':True,'object_present_before':probe.returncode==0,'object_fetch_performed':fetch is not None,'read_only':fetch is None,'object_fetch_command':None if fetch is None else ['git','-C',str(repo),'fetch','--no-tags','origin',source],'fetch_exit':None if fetch is None else fetch.returncode,'fetch_stdout':None if fetch is None else fetch.stdout,'fetch_stderr':None if fetch is None else fetch.stderr,'head_before':head_before.stdout.strip(),'head_after':git('rev-parse','HEAD').stdout.strip(),'checkout_or_campaign_mutation_command_performed':False,'source_object_verified':git('rev-parse',source+'^{commit}').stdout.strip()==source}
print(json.dumps(result,indent=2),flush=True)
assert fetch is None or fetch.returncode==0
assert result['source_object_verified']
