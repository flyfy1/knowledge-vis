'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage();const results=[];
 for(const lang of ['en','zh'])for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:1000});await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18792/leetcode/214/');
  await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('#preset').selectOption('2');await page.locator('#end').click();
  await page.locator('.cell').first().evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
  await page.evaluate(()=>window.scrollBy({top:-document.querySelector('nav').getBoundingClientRect().height-16,behavior:'instant'}));
  const geometry=await page.evaluate(()=>({pageWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,cells:[...document.querySelectorAll('.cell')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,font:getComputedStyle(e.querySelector('b')).fontSize})),piFont:getComputedStyle(document.querySelector('.cell div')).fontSize}));
  assert(geometry.scrollWidth<=geometry.pageWidth);assert(geometry.cells.every(c=>c.w===128));
  await page.screenshot({path:path.join(out,`${lang}-${width}-zoom200-viewport.png`)});
  await page.locator('.cell').last().evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
  await page.evaluate(()=>window.scrollBy({top:-document.querySelector('nav').getBoundingClientRect().height-16,behavior:'instant'}));
  await page.screenshot({path:path.join(out,`${lang}-${width}-zoom200-final-viewport.png`)});
  results.push({lang,width,...geometry});
 }
 fs.writeFileSync(path.join(out,'zoom-results.json'),JSON.stringify({status:'passed',method:'CSS zoom: 2 in real Chromium; inspect viewport screenshots at full size',results},null,2)+'\n');
 await browser.close();console.log('Focused zoom screenshots and geometry passed');
})().catch(e=>{console.error(e);process.exit(1);});
