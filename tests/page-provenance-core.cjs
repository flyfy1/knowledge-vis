'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),m=JSON.parse(fs.readFileSync(path.join(root,'page-provenance.json'),'utf8'));
assert.equal(m.schemaVersion,1);assert.equal(Object.keys(m.pages).length,15);
for(const[slug,p]of Object.entries(m.pages)){
 assert.match(slug,/^[a-z][a-z-]+$/);assert.equal(p.developer,'Codex');assert.equal(p.kind,'revised');assert.match(p.sourceRevision,/^[a-f0-9]{40}$/);assert.ok(p.scope.zh&&p.scope.en);
 const src=fs.readFileSync(path.join(root,slug,'index.html'),'utf8');assert.equal((src.match(/<details class="page-provenance"/g)||[]).length,1,slug+' has one static label');assert.ok(src.includes('data-source-revision="'+p.sourceRevision+'"'));assert.ok(src.includes('data-edition="'+p.edition+'"'));assert.ok(src.includes('Codex 开发 · 改进版本'));assert.ok(src.includes(p.scope.zh));assert.ok(src.includes(p.scope.en));assert.ok(src.includes('https://github.com/flyfy1/knowledge-vis/commit/'+p.sourceRevision));assert.ok(src.includes('../page-provenance.css?v='));
 const log=cp.execFileSync('git',['show','-s','--format=%B',p.sourceRevision],{cwd:root,encoding:'utf8'});assert.match(log,/Built-By: Codex/);
 assert.ok(cp.execFileSync('git',['diff-tree','--no-commit-id','--name-only','-r',p.sourceRevision,'--',slug+'/'],{cwd:root,encoding:'utf8'}).trim(),slug+' has actual Codex source changes');
}
for(const slug of ['frozen-bubble','power-converters']){assert.ok(!m.pages[slug]);assert.ok(m.exceptions[slug]);}
assert.ok(!fs.readFileSync(path.join(root,'fourier/index.html'),'utf8').includes('page-provenance'),'unknown page is not relabelled');
const css=fs.readFileSync(path.join(root,'page-provenance.css'),'utf8');assert.match(css,/html\[lang\^="zh"\]/);assert.match(css,/forced-colors/);assert.match(css,/min-height:48px/);assert.match(css,/outline:3px/);assert.ok(!css.includes('animation:'));
console.log('PASS: all15 static labels match sourced revised-edition records; no worker/unknown automatic attribution; shared CSS contract');
