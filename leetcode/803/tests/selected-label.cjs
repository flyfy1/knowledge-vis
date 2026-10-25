'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence/repair-r1'));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage();const states=[];
 async function capture(name){
  await page.evaluate(()=>{const stage=document.querySelector('#traceStage'),nav=document.querySelector('.step-nav');window.scrollBy(0,stage.getBoundingClientRect().top-nav.getBoundingClientRect().bottom-12);});
  await page.screenshot({path:path.join(OUT,name)});
 }
 try{
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18785')+'/leetcode/803/');
  for(const width of [320,390])for(const lang of ['en','zh']){
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>{document.documentElement.style.zoom='2';document.documentElement.style.scrollBehavior='auto';});
   await page.locator(`[data-lang=${lang}]`).click();
   // D first reproduces the exact independent finding, then cover every option.
   for(const p of ['3','0','1','2','4']){
    await page.selectOption('#preset',p);
    if(p==='3')await page.locator('#next').click();
    await page.locator('#preset').scrollIntoViewIfNeeded();
    const measure=await page.locator('#preset').evaluate(e=>{
     const s=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=s.font;
     return {text:e.selectedOptions[0].textContent,font:s.font,width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),textWidth:ctx.measureText(e.selectedOptions[0].textContent).width};
    });
    const state={viewportWidth:width,lang,p,...measure};states.push(state);
    if(p==='3')await capture(`selected-${lang}-${width}-z2.png`);
    // 24 CSS px is a conservative Chromium test budget, not an asserted native arrow measurement.
    assert(measure.textWidth+measure.padding+24<=measure.width,`803-R1 selected label clips: ${JSON.stringify(state)}`);
    assert.equal(measure.text,'ABCDE'[Number(p)]);
    const caption=page.locator('#presetSelected');
    assert.equal(await caption.textContent(),await page.evaluate(p=>window.COPY['presetShort'+p][document.documentElement.lang==='en'?1:0],p));
    assert.equal(await page.locator('#preset').getAttribute('aria-describedby'),'presetSelected presetName');
    const geometry=await caption.evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth,height:e.getBoundingClientRect().height,text:e.textContent}));
    assert(geometry.scroll<=geometry.client+1,JSON.stringify(geometry));state.caption=geometry;
    if(p==='3'){
     assert.equal(await page.locator('#result').textContent(),'[?, 0]');
     await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();
     assert.equal(await page.locator('#result').textContent(),'[?, 0]');
     await page.locator(`[data-lang=${lang}]`).click();
     await page.locator('#end').click();
     assert.equal(await page.locator('#result').textContent(),'[2, 0]');
     await page.locator('#preset').scrollIntoViewIfNeeded();
     await capture(`selected-end-${lang}-${width}-z2.png`);
    }
   }
  }
  fs.writeFileSync(path.join(OUT,'selected-label.json'),JSON.stringify({finding:'803-R1',browser:browser.version(),host:process.platform,zoom:'html CSS zoom=2',arrowBudget:24,states},null,2)+'\n');
  console.log(`803-R1 passed: ${states.length} selected labels, both locales, 320/390 at CSS 200%.`);
 }finally{
  fs.writeFileSync(path.join(OUT,'selected-label-observed.json'),JSON.stringify(states,null,2)+'\n');
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
