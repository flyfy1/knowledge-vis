const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const models=require('../../hard-first-ten/core.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('leetcode/44/copy.js','utf8'),ctx);
const l=ctx.window.LESSON,c=ctx.window.LESSON_COPY;
for(const k of ['hand','cost','derive','proof','transition','baselineIntro','overlapA','overlapB','complexity','task','traps'])assert.equal(JSON.stringify(l[k]),JSON.stringify(c[k]));
assert.equal(JSON.stringify(l.quiz.question),JSON.stringify(c.quizQuestion));
l.quiz.options.forEach((x,i)=>assert.equal(JSON.stringify(x),JSON.stringify(c['option'+i])));
function oracle(s,p){if(!p)return !s;if(p[0]==='*'){for(let k=0;k<=s.length;k++)if(oracle(s.slice(k),p.slice(1)))return true;return false;}return !!s&&(p[0]==='?'||p[0]===s[0])&&oracle(s.slice(1),p.slice(1));}
function strings(chars,n){let all=[''],last=[''];for(let k=1;k<=n;k++){last=last.flatMap(s=>[...chars].map(c=>s+c));all.push(...last);}return all;}
let pairs=0,cells=0;for(const s of strings('ab',3))for(const p of strings('ab?*',3)){
 const trace=models[44]([s,p]);assert.equal(trace.result,oracle(s,p));
 for(const f of trace.frames){const [i,j]=f.active;assert.equal(f.matrix[i][j],oracle(s.slice(0,i),p.slice(0,j)));for(const [a,b] of f.deps)assert.notEqual(f.matrix[a][b],null);cells++;}pairs++;
}
const quiz=models[44](['ba','?*']).frames.at(-1);assert.deepEqual(quiz.matrix,[[true,false,false],[false,true,true],[false,false,true]]);assert.deepEqual(quiz.deps,[[2,1],[1,2]]);
const result={trace_pairs:pairs,active_cells_and_dependencies:cells,quiz_matrix:quiz.matrix,quiz_dependencies:quiz.deps,copy_dictionary_parity:true};fs.writeFileSync('leetcode/44/evidence/core.json',JSON.stringify(result,null,2)+'\n');console.log(result);
