// 679-R1: closed native select, unchanged 320x950 reproduction plus roundtrip.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence/r1-fix'));
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:320,height:950}}),records=[];
  await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:18783')+'/leetcode/679/');
  for(const width of [320,390])for(const lang of ['en','zh']){
   await page.setViewportSize({width,height:950});
   await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','4');
   for(const roundtrip of [false,true]){
    if(roundtrip){await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);}
    await page.locator('#preset').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    await page.screenshot({path:path.join(out,`${lang}-${width}${roundtrip?'-roundtrip':''}-selected.png`)});
    const m=await page.locator('#preset').evaluate(el=>{
     const s=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;
     return {label:el.selectedOptions[0].textContent,font:s.font,controlWidth:el.getBoundingClientRect().width,clientWidth:el.clientWidth,paddingLeft:parseFloat(s.paddingLeft),paddingRight:parseFloat(s.paddingRight),textWidth:ctx.measureText(el.selectedOptions[0].textContent).width};
    });
    // Conservative extra native-arrow allowance for this Chromium/Linux control;
    // screenshot inspection is still required, not inferred from page overflow.
    m.arrowAllowance=16;m.available=m.clientWidth-m.paddingLeft-m.paddingRight-m.arrowAllowance;
    records.push({lang,width,roundtrip,...m});
   }
  }
  fs.writeFileSync(path.join(out,'selected-label-results.json'),JSON.stringify({kind:'author self-check',finding:'679-R1',browser:browser.version(),platform:process.platform,records},null,2)+'\n');
  for(const r of records){assert.match(r.label,r.lang==='en'?/\[1,5,5,5\].*intermediate.*(?:< 1|below one)/:/\[1,5,5,5\].*小于一的中间值/);assert(r.textWidth<=r.available,`${r.lang} ${r.width}: selected label ${r.textWidth.toFixed(2)}px exceeds ${r.available}px`);}
  console.log('PASS 679-R1: both locales, 320/390, closed label and locale roundtrip');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
