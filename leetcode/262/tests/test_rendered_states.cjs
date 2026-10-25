const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const out=process.env.OUTPUT_DIR || '/tmp/262-states';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:390,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const expected=[[],[[0,1]],[[0,1]],[[0,2]],[[1,3]],[[1,3],[0,1]],[[1,3],[0,1]],[[1,3],[0,2]],[[1,3],[0,2]],[[1,3],[0,2],[0,1]],[[1,3],[0,2],[1,2]]];
 async function totals(){return page.locator('.daily-card').evaluateAll(cards=>cards.map(c=>{const n=c.textContent.match(/\d+(?:\.\d+)?/g);return [Number(n[3]),Number(n[4])]}));}
 try{
 await page.goto('http://127.0.0.1:18770/leetcode/262/',{waitUntil:'networkidle'});
 for(const lang of ['en','zh']){
  await page.click(`[data-lang="${lang}"]`);
  await page.selectOption('#preset','0');
  for(let i=0;i<=10;i++){
   assert.deepEqual(await totals(),expected[i],`${lang} after ${i} sample rows`);
   if(i<10)await page.click('#next');
  }
  await page.click('#prev');assert.deepEqual(await totals(),expected[9]);
  await page.click('#next');assert.deepEqual(await totals(),expected[10]);
  await page.selectOption('#preset','1');
  for(let i=0;i<3;i++)await page.click('#next');
  assert.deepEqual(await totals(),[[0,1],[1,1]]);assert(await page.locator('#next').isDisabled());
  const formula=await page.locator('.formula').textContent();
  for(const operand of ['denominator += 1','numerator += 1','rate = numerator / denominator'])assert(formula.includes(operand));
  assert(formula.includes(lang==='en'?'eligible cancelled row':'合资格且取消的行'));
  await page.setViewportSize({width:390,height:900});
  // Capture settled viewport positions, avoiding full-element sticky-nav capture artifacts.
  for(const [name,selector] of [['driver-merge','[data-i18n="mapDriver"]'],['grouping','[data-i18n="map3"]'],['invariant','[data-i18n="invariant"]'],['formula','.formula']]){
   await page.locator(selector).evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-90));
   await page.waitForTimeout(350);
   await page.screenshot({path:path.join(out,`${lang}-${name}.png`)});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('all 11 sample prefixes, cumulative count pairs, rewind/replay, transfer endpoint and guarded rendered formula passed in both locales; focused screenshots saved');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
