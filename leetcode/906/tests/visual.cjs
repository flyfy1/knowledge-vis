'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const preview=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const page=await browser.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'}),assets=[];
 page.on('request',r=>{if(r.resourceType()!=='document'){assets.push(r.url());assert(r.url().startsWith(preview+'/')||r.url().startsWith('data:'));}});
 await page.goto(preview+'/leetcode/906/');
 const records=[];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`${lang}-320-header.png`)});
  await page.selectOption('#preset','4');await page.locator('#position').evaluate(e=>{e.value='21';e.dispatchEvent(new Event('input'));});
  await page.locator('#preset').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`${lang}-320-controls.png`)});
  await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.locator('#step3').screenshot({path:path.join(out,`${lang}-320-quiz.png`)});
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('#sourceDetails').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`${lang}-320-source.png`)});
  const controls=await page.locator('button,select,input[type=range],summary').evaluateAll(xs=>xs.map(e=>({tag:e.tagName,id:e.id,height:e.getBoundingClientRect().height,outline:getComputedStyle(e).outlineWidth})));
  assert(controls.every(c=>c.height>=48),JSON.stringify(controls));
  records.push({lang,controls,bodyOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),feedback:await page.locator('#feedback').textContent()});
 }
 assert(records.every(r=>!r.bodyOverflow));fs.writeFileSync(path.join(out,'visual-results.json'),JSON.stringify({status:'pass',assets,records},null,2));await browser.close();console.log('visual checks: pass');
})().catch(e=>{console.error(e);process.exit(1);});
