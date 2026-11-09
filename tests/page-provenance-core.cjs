'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),m=JSON.parse(fs.readFileSync(path.join(root,'page-provenance.json'),'utf8'));
assert.equal(m.schemaVersion,1);
const inventoryPaths=Object.entries(m.pages).map(([slug,p])=>p.path||slug+'/index.html');
assert.equal(new Set(inventoryPaths).size,inventoryPaths.length,'provenance inventory paths must be unique');
function labeledHtmlFiles(dir){
 const files=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(entry.name==='.git'||entry.name==='node_modules')continue;
  const filename=path.join(dir,entry.name);
  if(entry.isDirectory())files.push(...labeledHtmlFiles(filename));
  else if(entry.name.endsWith('.html')&&fs.readFileSync(filename,'utf8').includes('<details class="page-provenance"'))files.push(path.relative(root,filename));
 }
 return files;
}
assert.deepEqual(labeledHtmlFiles(root).sort(),inventoryPaths.slice().sort(),'static provenance labels must match the authoritative inventory');
// Developers are display names of agents registered in AUTHORSHIP.md §2; each
// needs a Built-By pattern that proves the source revision is really theirs.
const DEVELOPERS={'Codex':/Built-By: Codex/,'Claude Code':/Built-By: Claude/,'Alberto (Muse)':/Built-By: (?:Alberto|Muse)\b/};
// AUTHORSHIP.md §5: a human-confirmed authorship/overrides.json entry is the other valid proof.
const AGENT_IDS={'Codex':'codex','Claude Code':'claude-code','Alberto (Muse)':'alberto'};
const overrides=JSON.parse(fs.readFileSync(path.join(root,'authorship/overrides.json'),'utf8'));
const KIND={revised:['改进版本','Revised edition'],original:['原创版本','Original edition']};
const labelZh=p=>p.developer+' 开发 · '+KIND[p.kind][0],labelEn=p=>'Developed with '+p.developer+' · '+KIND[p.kind][1];
const counts={};
for(const[slug,p]of Object.entries(m.pages)){
 assert.match(slug,/^[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)?$/);assert.ok(DEVELOPERS[p.developer],slug+' developer must be a registered agent');assert.ok(KIND[p.kind],slug+' kind must be revised|original');counts[p.developer+'/'+p.kind]=(counts[p.developer+'/'+p.kind]||0)+1;assert.match(p.sourceRevision,/^[a-f0-9]{40}$/);assert.ok(p.scope.zh&&p.scope.en);
 const filename=p.path||slug+'/index.html';assert.ok(!path.isAbsolute(filename)&&!filename.split('/').includes('..')&&filename.endsWith('.html'));const src=fs.readFileSync(path.join(root,filename),'utf8');assert.equal((src.match(/<details class="page-provenance"/g)||[]).length,1,slug+' has one static label');assert.ok(src.includes('data-source-revision="'+p.sourceRevision+'"'));assert.ok(src.includes('data-edition="'+p.edition+'"'));assert.ok(src.includes(labelZh(p)),slug+' zh label');assert.ok(src.includes(labelEn(p)),slug+' en label');assert.ok(src.includes('data-developer="'+p.developer+'"'));assert.ok(src.includes(p.scope.zh));assert.ok(src.includes(p.scope.en));assert.ok(src.includes('https://github.com/flyfy1/knowledge-vis/commit/'+p.sourceRevision));assert.ok(src.includes('page-provenance.css'));if(p.integrationRevision){assert.ok(src.includes('https://github.com/flyfy1/knowledge-vis/commit/'+p.integrationRevision));cp.execFileSync('git',['cat-file','-e',p.integrationRevision+'^{commit}'],{cwd:root});}
 const log=cp.execFileSync('git',['show','-s','--format=%B',p.sourceRevision],{cwd:root,encoding:'utf8'});if(!DEVELOPERS[p.developer].test(log)&&p.provenanceEvidence==='authorship/overrides.json'){
  const o=overrides.commits[p.sourceRevision];assert.ok(o&&o.agent===AGENT_IDS[p.developer]&&o.impact==='authored'&&o.source,slug+' override must confirm '+p.developer+' authored the source revision');
 }else if(!DEVELOPERS[p.developer].test(log)){
  assert.match(p.provenanceEvidence||'',/^specs\/reviews\/[a-z0-9-]+\.md$/,'missing commit trailer needs exact tracked author evidence');
  const evidence=cp.execFileSync('git',['show',p.sourceRevision+':'+p.provenanceEvidence],{cwd:root,encoding:'utf8'});assert.ok(new RegExp('^# .*'+p.developer,'m').test(evidence),'source revision must contain its '+p.developer+' authorship record');
 }
 // Pages moved (2026-11-08 topic reorg), so look in every directory the page file has lived in.
 const pastDirs=cp.execFileSync('git',['log','--follow','--name-only','--format=','--',filename],{cwd:root,encoding:'utf8'}).split('\n').filter(Boolean).map(f=>path.dirname(f)+'/');
 // originalSourceRevision = the lesson source this edition builds on (its creation commit for an original edition,
 // or a worker commit later integrated); previousSourceRevision = the sourceRevision value just before the latest
 // repoint. Both must be full SHAs of existing commits that touched the page (specs/visual-page-provenance.md).
 for(const field of ['originalSourceRevision','previousSourceRevision'])if(p[field]){
  assert.match(p[field],/^[a-f0-9]{40}$/,slug+' '+field+' must be a full SHA');assert.notEqual(p[field],p.sourceRevision,slug+' '+field+' differs from sourceRevision');
  cp.execFileSync('git',['cat-file','-e',p[field]+'^{commit}'],{cwd:root});
  assert.ok(cp.execFileSync('git',['diff-tree','--no-commit-id','--name-only','-r','--root',p[field],'--',...new Set([path.dirname(filename)+'/',...pastDirs])],{cwd:root,encoding:'utf8'}).trim(),slug+' '+field+' touched the page');
 }
 assert.ok(cp.execFileSync('git',['diff-tree','--no-commit-id','--name-only','-r',p.sourceRevision,'--',...new Set([path.dirname(filename)+'/',...pastDirs])],{cwd:root,encoding:'utf8'}).trim(),slug+' has actual '+p.developer+' source changes');
}
assert.ok(m.exceptions['*'],'unknown provenance policy remains explicit');
assert.ok(!fs.readFileSync(path.join(root,'signal/transforms/fourier/index.html'),'utf8').includes('page-provenance'),'unknown page is not relabelled');
const css=fs.readFileSync(path.join(root,'page-provenance.css'),'utf8');assert.match(css,/html\[lang\^="zh"\]/);assert.match(css,/forced-colors/);assert.match(css,/min-height:48px/);assert.match(css,/outline:3px/);assert.ok(!css.includes('animation:'));
console.log(`PASS: ${inventoryPaths.length} static labels match the authoritative sourced inventory (${JSON.stringify(counts)}); unknown attribution remains opt-in; shared CSS contract`);
