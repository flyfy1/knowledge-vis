'use strict';
// 675-R1-01: closed native controls, not menu options or duplicate text below.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const out=process.env.OUT_DIR||path.join(__dirname,'evidence','r1-fix');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18782';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
 const page=await browser.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'});
 if(process.env.STYLESHEET_UNDER_TEST)await page.route('**/675/style.css*',route=>route.fulfill({contentType:'text/css',body:fs.readFileSync(process.env.STYLESHEET_UNDER_TEST,'utf8')}));
 await page.goto(base+'/leetcode/675/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent);
 const records=[];
 for(const width of [320,390])for(const zoom of [1,2])for(const locale of ['en','zh']){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
  await page.locator(`[data-lang=${locale}]`).click();
  for(let preset=0;preset<6;preset++){
   await page.locator('#preset').selectOption(String(preset));
   // Preserve the review's multiple-legs locale roundtrip, with selection intact.
   if(preset===4){await page.locator(`[data-lang=${locale==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${locale}]`).click();}
   await page.locator('#preset').scrollIntoViewIfNeeded();await page.waitForTimeout(60);
   const record=await page.locator('#preset').evaluate(el=>{
    const css=getComputedStyle(el),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=css.font;
    const label=el.selectedOptions[0].textContent,textWidth=ctx.measureText(label).width;
    const contentWidth=el.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
    // Conservative allowance for the observed Linux Chromium native arrow.
    const arrowAllowance=24;
    return {label,value:el.value,font:css.font,whiteSpace:css.whiteSpace,clientWidth:el.clientWidth,height:el.getBoundingClientRect().height,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight,scrollWidth:el.scrollWidth,fieldSizing:css.fieldSizing,textWidth,contentWidth,arrowAllowance,spare:contentWidth-textWidth-arrowAllowance};
   });
   assert.equal(record.value,String(preset));
   records.push({width,zoom,locale,preset,...record});
   if([2,4].includes(preset)){
    await page.screenshot({path:path.join(out,`${locale}-${width}-zoom${zoom}-preset${preset}.png`)});
    await page.locator('#preset').screenshot({path:path.join(out,`${locale}-${width}-zoom${zoom}-preset${preset}-control.png`)});
   }
  }
 }
 const result={kind:'author self-check',finding:'675-R1-01',result:records.every(r=>r.scrollHeight<=r.clientHeight && r.scrollWidth<=r.clientWidth && (r.spare>=0 || r.fieldSizing==='content'))?'pass':'fail',host:os.platform(),browser:browser.version(),arrowAllowanceScope:'24 CSS px for this Linux Chromium control; not a cross-platform guarantee',zoomMethod:'CSS zoom:2; no physical-device or browser-chrome zoom claim',records};
 fs.writeFileSync(path.join(out,'selected-labels.json'),JSON.stringify(result,null,2)+'\n');
 assert.equal(result.result,'pass',JSON.stringify(records.filter(r=>r.scrollHeight>r.clientHeight),null,2));
 console.log(JSON.stringify({result:'pass',checks:records.length,wrappedChecks:records.filter(r=>r.spare<0).length,clippedChecks:records.filter(r=>r.scrollHeight>r.clientHeight).length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
