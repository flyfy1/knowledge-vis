'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage({viewport:{width:390,height:1000}}),evidence=[];
 await page.goto(base+'/leetcode/479/');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','0');
  for(const [i,expected] of [[0,lang==='en'?'No checks yet':'尚未检查'],[1,'9779 = 99'],[2,lang==='en'?'All remaining x':'后续 x'],[24,'9009']]){
   await page.locator('#position').fill(String(i));
   const text=await page.locator('#decision').textContent();assert(text.includes(expected));
   evidence.push({lang,step:i,expectedMeaning:i===0?'no completed check':i===1?'nonzero remainder rejects factor':i===2?'square cutoff rejects candidate':'exact factorization found',visible:text});
  }
  // The transfer premise must be attainable, not merely a conditional impossible state.
  const rows=require('../core.js').probe(1331,10,99);assert(rows.every(r=>r.kind!=='found'));assert.equal(rows.at(-1).x,36);
  for(const c of ['0','1','2']){await page.locator(`[name=prediction][value="${c}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();assert(text.includes('1296'));assert(text.startsWith(lang==='en'?(c==='2'?'Correct':'This choice'):(c==='2'?'预测正确':'这个选择')));evidence.push({lang,choice:c,expectedMeaning:'square cutoff excludes every factor pair',visible:text});}
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(out,lang+'-header.png')});
  await page.locator('#step3').screenshot({path:path.join(out,lang+'-prediction.png')});
  if(await page.locator('#end').isEnabled())await page.locator('#end').click();await page.locator('.state-grid').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.locator('.state-grid').screenshot({path:path.join(out,lang+'-final-state.png')});
  await page.locator('#candidates').screenshot({path:path.join(out,lang+'-final-ledger.png')});
  // Capture viewport frames after deliberately aligning content below sticky nav.
  await page.locator('#decision').evaluate(e=>{e.scrollIntoView({block:'center',behavior:'instant'});});await page.screenshot({path:path.join(out,lang+'-final-viewport.png')});
 }
 fs.writeFileSync(path.join(out,'reading.json'),JSON.stringify({authorSelfCheck:true,semanticBindings:evidence,exercisePremiseReachable:true},null,2)+'\n');await browser.close();console.log('Reading paths passed');
})().catch(e=>{console.error(e);process.exit(1)});
