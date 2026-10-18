const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
require('../core.js');const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
const fixtures=JSON.parse(fs.readFileSync(path.join(out,'fixtures.json'),'utf8'));let framesChecked=0;
for(const {grid,needs,need} of fixtures){
 const before=JSON.stringify(grid),frames=DungeonLesson.trace(grid);assert.equal(frames.length,grid.length*grid[0].length+1);
 for(let i=0;i<frames.length;i++){
  const f=frames[i];assert.equal(f.needs.flat().filter(v=>v!==null).length,i);
  for(let r=0;r<grid.length;r++)for(let c=0;c<grid[0].length;c++)if(f.needs[r][c]!==null)assert.equal(f.needs[r][c],needs[r][c]);
  if(i){const e=f.event;assert.equal(f.needs[e.r][e.c],e.need);assert.equal(e.need,Math.max(1,e.target-e.value));if(e.r+1<grid.length)assert.equal(e.down,frames[i-1].needs[e.r+1][e.c]);if(e.c+1<grid[0].length)assert.equal(e.right,frames[i-1].needs[e.r][e.c+1]);}
  framesChecked++;
 }
 assert.equal(frames.at(-1).needs[0][0],need);assert.equal(JSON.stringify(grid),before);
 const saved=JSON.stringify(frames[0]);frames.at(-1).needs[0][0]=-999;assert.equal(JSON.stringify(frames[0]),saved);
}
const result={fixtures:fixtures.length,framesChecked,invariants:'all completed cells match independent suffix-survival oracle; dependencies accurate; snapshots isolated'};fs.writeFileSync(path.join(out,'trace.json'),JSON.stringify(result,null,2));console.log(result);
