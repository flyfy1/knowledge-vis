'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=path.resolve(process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const p=await browser.newPage({viewport:{width:320,height:900}}),measurements=[];
 await p.goto(process.env.LESSON_URL||'http://127.0.0.1:18782/leetcode/699/');await p.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390])for(const lang of ['en','zh']){
  await p.setViewportSize({width,height:900});await p.click(`[data-lang="${lang}"]`);
  for(let i=0;i<6;i++){
   await p.selectOption('#preset',String(i));if(i===2)await p.locator('#preset').screenshot({path:path.join(out,`selected-${lang}-${width}.png`)});
   const m=await p.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;return {label:el.selectedOptions[0].text,textWidth:ctx.measureText(el.selectedOptions[0].text).width,width:el.offsetWidth,paddingLeft:parseFloat(s.paddingLeft),paddingRight:parseFloat(s.paddingRight),font:s.font};});
   assert(m.width-m.paddingLeft-m.paddingRight-16>=m.textWidth,JSON.stringify(m));measurements.push({viewport:width,locale:lang,preset:i,arrowAllowance:16,...m});
  }
  await p.selectOption('#preset','2');await p.click('#end');
  const plot=p.locator('#plot');await plot.focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);assert(await plot.evaluate(el=>el.scrollLeft>0));await plot.evaluate(el=>el.scrollLeft=el.scrollWidth);await plot.screenshot({path:path.join(out,`plot-right-${lang}-${width}.png`)});
  await p.selectOption('#preset','3');await p.click('#end');
  const wrapper=p.locator('[data-label="checkLabel"]');await wrapper.focus();await p.keyboard.press('End');await wrapper.evaluate(el=>el.scrollLeft=el.scrollWidth);assert(await wrapper.evaluate(el=>el.scrollLeft>0));await wrapper.screenshot({path:path.join(out,`table-right-${lang}-${width}.png`)});
  // Representative semantic binding: after testing #1 for square #3, the candidate is #1/top3 and base0→3.
  await p.click('#reset');for(let i=0;i<6;i++)await p.click('#next');
  const e=await p.locator('#event').textContent();assert(e.includes('#3'));assert(e.includes('#1'));assert(e.includes('top=3'));assert(e.includes('0 → 3'));
  measurements.push({viewport:width,locale:lang,event6:e,output:await p.locator('#output').textContent()});
 }
 // Focus survives a locale repaint of the surrounding state; no node replacement of focused control.
 await p.locator('#preset').focus();await p.evaluate(()=>{document.querySelector('[data-lang="en"]').click();});assert.equal(await p.evaluate(()=>document.activeElement.id),'preset');
 const hit=await p.locator('button,select,.prediction-options label,.official-link,.solution-actions a').evaluateAll(els=>els.map(el=>({id:el.id||el.textContent,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})));hit.forEach(x=>{assert(x.height>=48,JSON.stringify(x));assert(x.width>=48,JSON.stringify(x));});
 fs.writeFileSync(path.join(out,'accessibility-results.json'),JSON.stringify({measurements,hit,selectorArrowAllowance:'16px observed Chromium/Linux allowance, not a universal platform claim',focusPreserved:true,keyboardHorizontalScroll:true},null,2));console.log({measurements:measurements.length,hitTargets:hit.length});await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
