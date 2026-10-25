'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/select-r3');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'}),records=[];
 try{
  await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:18770')+'/leetcode/843/');
  await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
  for(const width of [320,390,1280])for(const zoom of [1,2])for(const scenario of ['6','8'])for(const locale of ['zh','en','zh']){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(zoom=>document.documentElement.style.zoom=String(zoom),zoom);
   await page.locator('#preset').selectOption(scenario);
   await page.locator('#next').click();
   const candidates=await page.locator('#candidates').textContent(),ledger=await page.locator('#ledger').textContent();
   await page.locator(`[data-lang=${locale}]`).click();
   assert.equal(await page.locator('#preset').inputValue(),scenario);
   assert.equal(await page.locator('#candidates').textContent(),candidates);
   assert.equal(await page.locator('#ledger li').count(),1);
   // A full, wrapping selected value is the repair seam: the native select
   // may still be narrower than its option, but every character is adjacent.
   const selected=await page.locator('#preset option:checked').textContent();
   assert.equal(await page.locator('#presetSelection').count(),1,'Full selected-scenario readout is missing');
   assert.equal(await page.locator('#presetSelection').textContent(),selected);
   assert.equal(await page.locator('#preset').getAttribute('aria-describedby'),'presetSelection');
   await page.locator('#preset').evaluate(e=>e.blur());
   await page.locator('#preset').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-document.querySelector('.step-nav').offsetHeight-16));
   if(zoom===2)await page.locator('#presetSelection').evaluate(e=>e.scrollIntoView({block:'center'}));
   const geometry=await page.locator('#presetSelection').evaluate(e=>{
    const r=e.getBoundingClientRect(),s=getComputedStyle(e),select=document.querySelector('#preset'),ss=getComputedStyle(select),range=document.createRange();range.selectNodeContents(e);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=ss.font;
    return {top:r.top,bottom:r.bottom,navBottom:document.querySelector('.step-nav').getBoundingClientRect().bottom,viewportHeight:innerHeight,width:r.width,height:r.height,client:e.clientWidth,scroll:e.scrollWidth,whiteSpace:s.whiteSpace,overflow:s.overflow,textOverflow:s.textOverflow,font:s.font,selectFont:ss.font,selectClient:select.clientWidth,selectedTextWidth:ctx.measureText(e.textContent).width,lines:[...range.getClientRects()].map(x=>({left:x.left,right:x.right,top:x.top,bottom:x.bottom})),left:r.left,right:r.right,doc:document.documentElement.scrollWidth,viewport:innerWidth};
   });
   assert(geometry.top>=geometry.navBottom&&geometry.bottom<=geometry.viewportHeight,'Selected readout must be fully visible in the capture');
   assert(geometry.scroll<=geometry.client+1);
   assert(geometry.doc<=geometry.viewport+1);
   assert.notEqual(geometry.whiteSpace,'nowrap');assert.notEqual(geometry.overflow,'hidden');assert.notEqual(geometry.textOverflow,'ellipsis');
   for(const line of geometry.lines)assert(line.left>=geometry.left-1&&line.right<=geometry.right+1,JSON.stringify(geometry));
   const name=`${locale}-${width}-zoom${zoom}-preset${scenario}-${records.length}.png`;
   await page.screenshot({path:path.join(out,name)});
   records.push({locale,width,zoom,scenario,selected,geometry,screenshot:name,ledgerBeforeLocale:ledger});
   await page.locator('#reset').click();
  }
  fs.writeFileSync(path.join(out,'selection-results.json'),JSON.stringify({result:'pass',kind:'author self-check',browser:await browser.version(),platform:os.platform(),records},null,2)+'\n');
  console.log(`Selected-scenario readout: ${records.length} checks passed`);
 }catch(e){fs.writeFileSync(path.join(out,'selection-results.json'),JSON.stringify({result:'fail',error:e.message,records},null,2)+'\n');throw e;}
 finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
