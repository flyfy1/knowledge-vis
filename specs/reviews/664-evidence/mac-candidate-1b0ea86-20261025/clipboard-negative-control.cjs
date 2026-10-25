const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const source=fs.readFileSync(path.join(process.cwd(),'leetcode/664/solution.py'),'utf8');
 const b=await chromium.launch();const records=[];
 for(const mode of ['stale-source-no-action','sentinel-Control+C','sentinel-Meta+C']){
  const c=await b.newContext({permissions:['clipboard-read','clipboard-write']});const p=await c.newPage();
  await p.goto(process.env.PREVIEW_ROOT+'/leetcode/664/');await p.locator('[data-lang=en]').click();
  const seed=mode==='stale-source-no-action'?source:'664 clipboard negative-control sentinel';
  await p.evaluate(async seed=>{await navigator.clipboard.writeText(seed);const readText=navigator.clipboard.readText.bind(navigator.clipboard);Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText,writeText:async()=>{throw Error('intentional fallback');}}});},seed);
  await p.locator('#copy').click();
  assert.equal(await p.locator('#copyText').inputValue(),source);
  const selection=await p.locator('#copyText').evaluate(e=>({focused:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd}));
  assert.deepEqual(selection,{focused:true,start:0,end:source.length});
  if(mode==='sentinel-Control+C')await p.keyboard.press('Control+C');
  if(mode==='sentinel-Meta+C')await p.keyboard.press('Meta+C');
  const value=await p.evaluate(()=>navigator.clipboard.readText());
  records.push({mode,selection,equalsSource:value===source,unchangedFromSeed:value===seed});
  await c.close();
 }
 const result={candidate:process.env.CANDIDATE,platform:process.platform,browser:b.version(),sourceLength:source.length,records};
 fs.mkdirSync(process.env.OUTPUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUTPUT_DIR,'clipboard-negative-control.json'),JSON.stringify(result,null,2)+'\n');
 await b.close();console.log(JSON.stringify(result));
 assert(records[0].equalsSource && records[0].unchangedFromSeed,'No-action negative control should expose stale-source false positive');
 assert(!records[1].equalsSource && records[1].unchangedFromSeed,'Linux shortcut should leave Mac sentinel unchanged');
 assert(records[2].equalsSource && !records[2].unchangedFromSeed,'Native Mac shortcut must transfer canonical source');
})().catch(e=>{console.error(e);process.exitCode=1;});
