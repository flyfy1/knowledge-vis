import pathlib,subprocess,re,json
r=pathlib.Path('/Users/songyy/Documents/knowledge-vis');ids=[782,803,805]
def git(*a,**k):return subprocess.check_output(['git',*a],cwd=r,**k)
assert not git('diff','--cached','--name-only').strip()
base=git('rev-parse','HEAD').decode().strip();working=(r/'CONCEPT-MAP.md').read_text();old=git('show',base+':CONCEPT-MAP.md').decode();staged=old
for i in ids:
 assert f'<!-- leetcode-{i}-campaign -->' not in old
 block=re.search(rf'<!-- leetcode-{i}-campaign -->[\s\S]*?<!-- /leetcode-{i}-campaign -->',working).group();staged+='\n\n'+block+'\n'
blob=git('hash-object','-w','--stdin',input=staged.encode()).decode().strip()
paths=['leetcode/index.html','leetcode/problems.config.js','specs/reviews/releases/current-round-20261025']
for i in ids:paths+=[f'leetcode/{i}']+[str(p.relative_to(r)) for p in (r/'specs/reviews').glob(f'{i}-*')]
subprocess.run(['git','add','--',*paths],cwd=r,check=True);subprocess.run(['git','update-index','--cacheinfo','100644',blob,'CONCEPT-MAP.md'],cwd=r,check=True)
assert git('show',':CONCEPT-MAP.md').decode()==staged
changed=git('diff','--cached','--name-only').decode().splitlines()
assert all(p in ['CONCEPT-MAP.md','leetcode/index.html','leetcode/problems.config.js'] or p.startswith('specs/reviews/releases/current-round-20261025/') or any(p.startswith(f'leetcode/{i}/') or p.startswith(f'specs/reviews/{i}-') for i in ids) for p in changed)
assert git('rev-parse','HEAD').decode().strip()==base and (r/'CONCEPT-MAP.md').read_text()==working
subprocess.run(['git','diff','--cached','--check'],cwd=r,check=True)
subprocess.run(['git','commit','-q','-m','Integrate independently accepted 782, 803 and 805 for requested release','-m','Preserve exact accepted lesson files and original review outcomes. Repaired runtimes match their Mac-tested candidates; isolated lane histories remain on the campaign branch. Register three lessons while preserving unrelated working-tree content.','-m','Built-By: gpt-6.1-sol campaign authors; deterministic registration and Codex dispatcher (exact dispatcher model unavailable)\nVerified-By: independent campaign review runs and exact Mac browser checks; source parity verified during integration'],cwd=r,check=True)
print(git('rev-parse','HEAD').decode().strip())
