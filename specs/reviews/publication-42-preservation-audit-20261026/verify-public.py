from pathlib import Path
import json,hashlib,subprocess,concurrent.futures,datetime
p=Path('specs/reviews/publication-42-preservation-audit-20261026');a=json.loads((p/'audit.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest();items={**a['production42'],**{k:v['production']for k,v in a['discovery'].items()}}
def fetch(item):
 path,digest=item;c=subprocess.run(['curl','--fail','--silent','--show-error','--retry','2','--max-time','25',a['publicBase']+'/'+path],capture_output=True);return {'path':path,'exit':c.returncode,'expected':digest,'actual':sha(c.stdout)if c.returncode==0 else None,'matches':c.returncode==0 and sha(c.stdout)==digest,'error':c.stderr.decode()[:400]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as ex:results=list(ex.map(fetch,items.items()))
source=[]
for path,h in a['production42'].items():
 if '/42-codex/'not in path:continue
 file=path.replace('/42-codex/','/42/');data=subprocess.check_output(['git','show','5d5b73cd:'+file]);source.append({'path':path,'source':file,'sourceSha':sha(data),'productionSha':h,'matches':sha(data)==h})
output={'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'public':results,'productionVsMain42':source,'allPublicMatch':all(x['matches']for x in results),'allSource42Match':all(x['matches']for x in source)};(p/'public-check.json').write_text(json.dumps(output,indent=2)+'\n');print(json.dumps({k:v for k,v in output.items()if k not in ['public','productionVsMain42']}));print('Public checked',len(results),'source42',len(source));print('Failures',[x for x in results if not x['matches']])
