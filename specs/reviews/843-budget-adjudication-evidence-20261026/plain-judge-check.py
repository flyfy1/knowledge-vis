"""Tiny independent public-interface check; never changes lesson source."""
from pathlib import Path
import hashlib,json
source=Path('specs/reviews/843-budget-evidence-20261026/canonical.py').read_text()
assert hashlib.sha256(source.encode()).hexdigest()=='dc0d1552f34cc429efa9f3ff12daf0c9c42f6ca5604d97ae64dc42aa2b7bff30'
words=[g+c*5 for g in 'ab' for c in 'cdefghijklm']
class Master:
 def __init__(self,secret):self.secret=secret;self.calls=[];self.found=False
 def guess(self,word):
  assert word in words and len(self.calls)<11
  self.calls.append(word)
  reply=sum(x==y for x,y in zip(word,self.secret))
  self.found |= reply==6
  return reply
results={}
for name,text in [('frozen',source),('diagnostic_cap11',source.replace('range(10)','range(11)'))]:
 scope={};exec(text,scope);rows=[]
 for secret in words:
  m=Master(secret);scope['Solution']().findSecretWord(words.copy(),m)
  rows.append({'secret':secret,'calls':len(m.calls),'found':m.found})
 results[name]={'tested':len(rows),'found':sum(r['found'] for r in rows),'max_calls':max(r['calls'] for r in rows),'failures':[r for r in rows if not r['found']]}
assert results['frozen']['found']==20 and results['diagnostic_cap11']['found']==22
print(json.dumps({'scope':'22-word family only; no source/frame introspection by judge; no solution budget argument','budget':11,'results':results},indent=2))
