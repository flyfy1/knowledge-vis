'use strict';
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const out=process.env.OUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})}),p=await b.newPage({viewport:{width:320,height:1000}}),screens=[];
 async function shot(name,selector){await p.locator(selector).evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-150,behavior:'instant'}));await p.screenshot({path:path.join(out,name+'.png')});screens.push(name+'.png');}
 for(const lang of ['en','zh']){
  await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/483/');await p.locator(`[data-lang=${lang}]`).click();await p.selectOption('#preset','4');await p.locator('#end').click();await shot(lang+'-320-ledger','#ledger');
  await p.selectOption('#preset','0');await p.locator('#end').click();await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');await shot(lang+'-zoom200-values','#comparison');
  assert(await p.locator('.sequence span').evaluateAll(els=>els.every(e=>e.scrollWidth<=e.clientWidth+1)));assert((await p.locator('#event').textContent()).includes('13'));
  await p.evaluate(()=>document.documentElement.style.zoom='1');await p.setViewportSize({width:320,height:1000});await p.locator('[name=prediction][value="0"]').check();await p.locator('#reveal').click();await shot(lang+'-320-quiz','#step4');
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));await p.locator('#copy').click();await shot(lang+'-320-manual','#manualCopy');assert.equal(await p.evaluate(()=>document.activeElement.id),'copyText');
 }
 fs.writeFileSync(path.join(out,'focus-results.json'),JSON.stringify({passed:true,screenshots:screens,coverage:'320px ledger/quiz/manual source; 200% populated arithmetic and result in both languages'},null,2));console.log('PASS focused evidence',screens.length);await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
