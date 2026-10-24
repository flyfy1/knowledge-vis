'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'});
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/381/');
 const states=[];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
  assert((await page.locator('h1').innerText()).startsWith('#381'));
  assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step0');
  await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);
  assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step2');
  await page.locator('#next').focus();await page.keyboard.press('Space');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
  const focus=await page.locator('#reset').evaluate(el=>{const s=getComputedStyle(el);return {color:s.outlineColor,width:s.outlineWidth,style:s.outlineStyle,adjacent:getComputedStyle(el.parentElement.parentElement).backgroundColor};});
  const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((v,c,i)=>v+c*[.2126,.7152,.0722][i],0);
  const a=lum(focus.color),b=lum(focus.adjacent);focus.contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(focus.contrast>=3&&focus.width==='3px');
  await page.emulateMedia({forcedColors:'active'});const forced=await page.locator('#reset').evaluate(el=>getComputedStyle(el).outlineStyle);assert.equal(forced,'solid');await page.emulateMedia({forcedColors:'none'});
  states.push({lang,topNav:'step0',clickedNav:'step2',heading:'ID prefix verified',keyboard:'Space then Tab reaches reset',focus,forcedColors:forced});
  await page.locator('#reset').click();await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);await page.screenshot({path:path.join(out,`intro-320-${lang}.png`)});
 }
 await browser.close();const report={status:'pass',states};fs.writeFileSync(path.join(out,'a11y-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exit(1);});
