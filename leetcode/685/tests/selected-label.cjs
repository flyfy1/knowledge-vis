'use strict';
// Focused self-check for 685-R1-001; identical assertions before and after repair.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence/selected-label'));
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const report={kind:'author self-check; independent re-review pending',finding:'685-R1-001',platform:os.platform(),browser:browser.version(),nativeArrowReserve:16,note:'16px reserve is diagnostic for this Chromium/Linux control; screenshots require visual inspection.',cases:[]};
 try {
  const page=await browser.newPage();
  await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18782/leetcode/685/');
  for(const width of [320,390]) {
   await page.setViewportSize({width,height:950});
   await page.click('[data-lang="en"]');await page.selectOption('#preset','3');
   for(const locale of ['en','zh','en']) {
    await page.click(`[data-lang="${locale}"]`);
    assert.equal(await page.inputValue('#preset'),'3');
    assert.match(await page.locator('#progress').textContent(),/0\/8/);
    await page.locator('#preset').scrollIntoViewIfNeeded();
    const metrics=await page.locator('#preset').evaluate(el=>{
     const s=getComputedStyle(el),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=s.font;
     const options=[...el.options].map(o=>({label:o.textContent,textWidth:ctx.measureText(o.textContent).width}));
     return {font:s.font,fontFamily:s.fontFamily,controlWidth:el.getBoundingClientRect().width,clientWidth:el.clientWidth,paddingLeft:parseFloat(s.paddingLeft),paddingRight:parseFloat(s.paddingRight),selected:options[el.selectedIndex],options};
    });
    const file=`selected-${width}-${locale}-${report.cases.length}.png`;
    await page.screenshot({path:path.join(OUT,file)});
    metrics.available=metrics.clientWidth-metrics.paddingLeft-metrics.paddingRight-report.nativeArrowReserve;
    report.cases.push({viewportWidth:width,locale,state:'preset3; frame0/8; closed menu; EN→ZH→EN',...metrics,screenshot:file});
   }
  }
  report.failures=report.cases.filter(c=>c.selected.textWidth>c.available);
  report.result=report.failures.length?'FAIL':'PASS';
  fs.writeFileSync(path.join(OUT,'selected-label-results.json'),JSON.stringify(report,null,2)+'\n');
  assert.equal(report.failures.length,0,JSON.stringify(report.failures));
  console.log('PASS 685-R1-001: 320/390 closed selection, both locales and EN→ZH→EN; actual-font measurements + screenshots');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
