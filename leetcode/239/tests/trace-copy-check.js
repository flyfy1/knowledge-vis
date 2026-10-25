'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),acorn=require('acorn');
const out=process.env.OUTPUT_DIR||'leetcode/239/tests/evidence/trace-repair-20261025/copy';
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const copy=fs.readFileSync('leetcode/239/copy.js','utf8');
 const ast=acorn.parse(copy,{ecmaVersion:'latest'});
 function walk(node){if(!node||typeof node!=='object')return;if(node.type==='ObjectExpression'){const keys=node.properties.map(p=>p.key.name??p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate localization key')}for(const x of Object.values(node))if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object')walk(x)}walk(ast);
 const ctx={window:{}};vm.runInNewContext(copy,ctx);for(const pair of Object.values(ctx.window.LESSON_COPY)){assert.equal(pair.length,2);assert.ok(pair.every(x=>typeof x==='string'))}
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const receipts=[];
 try{
  const p=await b.newPage({viewport:{width:390,height:900}});
  await p.goto(`${process.env.PREVIEW_URL||'http://127.0.0.1:18770'}/leetcode/239/`);await p.waitForFunction(()=>document.querySelector('#progress').textContent.length);
  for(const lang of ['en','zh','en']){
   await p.click(`[data-lang="${lang}"]`);if(await p.locator('#reset').isEnabled())await p.click('#reset');
   const initial=await p.locator('#traceScope').textContent();assert.match(initial,lang==='zh'?/尚未处理任何元素/:/no elements processed/);
   await p.locator('#next').focus();await p.keyboard.press('Enter');
   const partial=await p.locator('#traceScope').textContent();assert.match(partial,/\[0, 0\]/);assert.match(partial,lang==='zh'?/尚不输出/:/no output yet/);
   for(let j=0;j<4;j++)await p.click('#next');
   const scope=await p.locator('#traceScope').textContent(),removed=await p.locator('#removed').textContent();
   assert.match(scope,/\[2, 4\]/);assert.match(scope,/\[-1, -3, 5\]/);
   assert.ok(removed.includes(lang==='zh'?'1 (已过期), 3 (被新值支配), 2 (被新值支配)':'1 (expired), 3 (dominated), 2 (dominated)'));
   const legend=await p.locator('[data-i18n=traceLegend]').textContent();assert.match(legend,/nums\[1\]=3/);
   const baseline=await p.locator('[data-i18n=baseline]').textContent();for(const bit of ['n=len(nums)','(n−k+1)k','2500050000','k=n'])assert.ok(baseline.includes(bit));
   await p.locator('#traceViz').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${lang}-removals.png`});
   for(const choice of ['0','1','2']){
    await p.check(`[name=pred][value="${choice}"]`);assert.equal(await p.locator('#feedback').isHidden(),true);await p.click('#reveal');assert.match(await p.locator('#feedback').textContent(),lang==='zh'?/答案是 \[2\]/:/answer is \[2\]/);
   }
   await p.click('#reset');receipts.push({lang,initial,partial,scope,removed,legend,baseline});
  }
  for(const lang of ['en','zh']){await p.click(`[data-lang="${lang}"]`);if(await p.locator('#wrongNext').isEnabled())await p.click('#wrongNext');const readout=await p.locator('#wrongReadout').textContent();assert.match(readout,lang==='zh'?/上一个最大值 9 → 已过期；正确最大值 [23]/:/previous max 9 → expired; correct max [23]/);receipts.push({lang,readout});}
  await p.close();
  const blocked=await b.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied')}})});await blocked.goto(`${process.env.PREVIEW_URL||'http://127.0.0.1:18770'}/leetcode/239/`);await blocked.waitForFunction(()=>document.querySelector('#progress').textContent.length);await blocked.click('[data-lang=zh]');assert.match(await blocked.locator('#traceScope').textContent(),/尚未处理/);await blocked.close();
  fs.writeFileSync(`${out}/results.json`,JSON.stringify({receipts,duplicateKeys:'none',copyShape:'all two-string pairs',keyboard:'Enter advances insertion',blockedStorage:'initialized and switched locale'},null,2)+'\n');console.log('239-R2-N1/N2 and frame labels: passed');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
