'use strict';
// 782-MAC-FIT-01: preserve the original width predicate and the approved copy.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const result={finding:'782-MAC-FIT-01',host:process.platform,browser:browser.version(),measurements:[]};
 try{
  const page=await browser.newPage({viewport:{width:320,height:1000}});
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/782/');
  for(const locale of ['en','zh','en']){
   await page.locator(`[data-lang="${locale}"]`).click();
   assert.equal(await page.locator('#preset option').count(),7);
   for(let i=0;i<7;i++){
    await page.locator('#preset').selectOption(String(i));
    const m=await page.locator('#preset').evaluate(e=>{
     const c=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=c.font;
     return {text:e.selectedOptions[0].textContent,textWidth:ctx.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight),font:c.font};
    });
    result.measurements.push({locale,preset:i,...m,margin:m.width-m.padding-20-m.textWidth});
    assert(m.textWidth+m.padding+20<=m.width,JSON.stringify(m));
   }
   await page.locator('#preset').selectOption('4');
   await page.locator('#preset').screenshot({path:path.join(OUT,`failure-label-${locale}-320.png`)});
  }
  // Linux can fit the old text: assert the repair explicitly as well as geometry.
  assert.equal(await page.locator('#preset option:checked').textContent(),'Four-corner failure: −1');
  await page.locator('#end').click();
  assert((await page.locator('#frameRead').textContent()).endsWith('-1'));
  result.status='passed';
 }catch(e){result.status='failed';result.error=String(e);throw e;}
 finally{fs.writeFileSync(path.join(OUT,'selected-label.json'),JSON.stringify(result,null,2)+'\n');await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
