const assert=require('assert/strict'),fs=require('fs'),core=require('../core.js');
const cases=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
let frames=0;
// Independent repeated relaxation on the grid, rather than the queue in core.js.
function reachable(g){let s=g.map((row,r)=>row.map(v=>!!v&&r===0)),changed=true;while(changed){changed=false;for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++)if(g[r][c]&&!s[r][c]&&[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].some(([x,y])=>s[x]?.[y])){s[r][c]=true;changed=true;}}return s;}
for(const input of cases){const model=core.trace(input);assert.deepEqual(model.frames.at(-1).answer,input.expected);
 model.frames.forEach((f,k)=>{const expected=structuredClone(input.grid);input.hits.slice(0,input.hits.length-k).forEach(([r,c])=>expected[r][c]=0);assert.deepEqual(f.after.grid,expected);assert.deepEqual(f.after.seen,reachable(expected));assert.equal(f.after.size,1+f.after.seen.flat().filter(Boolean).length);if(k){assert.deepEqual(f.before,model.frames[k-1].after);assert.equal(f.event.fall,input.expected[f.event.i]);}frames++;});
}
const expected=[[2],[0,0],[0,0],[2,0],[0,0]];
core.presets.forEach((p,i)=>assert.deepEqual(core.trace(p).frames.at(-1).answer,expected[i]));
console.log(JSON.stringify({cases:cases.length,frames,presetExpected:expected}));
