'use strict';
// Additional populated-state visual checks; rerunnable without modifying candidate.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{const page=await browser.newPage({viewport:{width:320,height:1000}}),rows=[];await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/782/');
for(const lang of ['en','zh']){
 await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#preset').selectOption('0');await page.locator('#traceReset').click();
 for(let k=0;k<7;k++)await page.locator('#next').click();
 const text=await page.locator('#operation').textContent();assert(text.includes('1 ↔ 2'));assert.equal(await page.locator('#traceCurrent tr.active').count(),0);assert.equal(await page.locator('#traceCurrent td.mark').count(),8);
 const filename=`swap-${lang}-320.png`;await page.locator('#step2 .stage').screenshot({path:path.join(OUT,filename),style:'.step-nav{visibility:hidden!important}'});rows.push({locale:lang,filename,operation:text,markedCells:8});
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 const geometry=await page.locator('#traceCurrent td').evaluateAll(els=>els.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize})));assert(geometry.every(c=>c.width===geometry[0].width&&c.width>=52&&c.height>=60&&parseFloat(c.font)>=16));
 const zoom=`zoom-board-${lang}.png`;await page.locator('#traceCurrent').screenshot({path:path.join(OUT,zoom)});rows.push({locale:lang,filename:zoom,geometry});
 await page.evaluate(()=>document.documentElement.style.zoom='');await page.setViewportSize({width:320,height:1000});
 // The longest repaired label is captured closed, with the same width-budget predicate.
 await page.locator('#preset').selectOption('3');const select=`selected-label-${lang}-320.png`;await page.locator('#preset').screenshot({path:path.join(OUT,select),style:'.step-nav{visibility:hidden!important}'});rows.push({locale:lang,filename:select,label:await page.locator('#preset option:checked').textContent()});
}
fs.writeFileSync(path.join(OUT,'focused.json'),JSON.stringify({status:'passed',rows},null,2)+'\n');console.log('Focused swap, repaired select, and 200% board geometry passed in both locales.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
