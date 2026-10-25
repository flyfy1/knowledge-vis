'use strict';
// 741-R1: measure the closed native select, then inspect retained screenshots.
const {chromium}=require('playwright');
const assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence','fix-r1');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:320,height:950}}),observations=[],errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:18770/leetcode/741/');
  await page.waitForFunction(()=>document.querySelector('#progress').textContent);
  for(const width of [320,390]){
   await page.setViewportSize({width,height:950});
   await page.click('[data-lang=en]');await page.selectOption('#preset','2');
   // Direct EN plus EN -> ZH -> EN reproduces the report's locale roundtrip.
   for(const [step,lang] of [['direct','en'],['switch','zh'],['roundtrip','en']]){
    await page.click(`[data-lang=${lang}]`);
    await page.locator('#preset').evaluate(el=>el.scrollIntoView({block:'center'}));
    await page.evaluate(()=>document.activeElement.blur());
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const box=await page.locator('#preset').boundingBox();
    assert(box.y>100&&box.y+box.height<950,'Closed selector must be visible in the settled capture');
    const measurement=await page.locator('#preset').evaluate(el=>{
     const style=getComputedStyle(el),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
     ctx.font=style.font;
     const text=el.selectedOptions[0].textContent;
     // Bounded conservative allowance for this Linux Chromium native arrow.
     // A screenshot is still required; this is not a cross-platform guarantee.
     const arrowAllowance=24,paddingLeft=parseFloat(style.paddingLeft),paddingRight=parseFloat(style.paddingRight);
     return {text,value:el.value,font:style.font,fontFamily:style.fontFamily,
      controlWidth:el.getBoundingClientRect().width,clientWidth:el.clientWidth,paddingLeft,paddingRight,
      arrowAllowance,textWidth:ctx.measureText(text).width,
      available:el.clientWidth-paddingLeft-paddingRight-arrowAllowance};
    });
    assert.equal(measurement.value,'2');
    assert(lang==='en'?/Official.*2.*no path.*→ 0/.test(measurement.text):/官方.*2.*无路.*→ 0/.test(measurement.text));
    assert((await page.locator('#progress').textContent()).includes('0 / 4'));
    assert(await page.locator('#prev').isDisabled());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(out,`${lang}-${width}-${step}.png`)});
    observations.push({width,lang,step,...measurement,fits:measurement.textWidth<=measurement.available});
   }
   await page.click('#end');assert((await page.locator('#output').textContent()).includes('0'));
  }
  assert.deepEqual(errors,[]);
 }finally{
  fs.writeFileSync(path.join(out,'preset-readability.json'),JSON.stringify({kind:'author self-check',finding:'741-R1',browser:browser.version(),host:process.platform,observations,errors,limits:['Headless Linux Chromium only; screenshots require visual inspection','24px arrow allowance is local to this measured control/browser']},null,2)+'\n');
  await browser.close();
 }
 assert(observations.every(o=>o.fits),'741-R1: selected text exceeds closed control text area: '+JSON.stringify(observations.filter(o=>!o.fits)));
 console.log('741-R1: direct and roundtrip closed labels fit at 320/390px in both locales; result remains 0.');
})().catch(e=>{console.error(e);process.exit(1)});
