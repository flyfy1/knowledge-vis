// Supplemental coverage; never replaces or changes test_browser.cjs's 24px check.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence','margin-repair-20261025');
const stress=process.argv.includes('--stress'); // Synthetic sensitivity, not Mac evidence.
const stressFont=Number(process.env.STRESS_FONT||16.7),legacy=process.argv.includes('--legacy-label');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
  const page=await browser.newPage({viewport:{width:320,height:1000}}),records=[];
  // Test-only response replay before the locale helper snapshots its dictionary.
  if(legacy)await page.route('**/copy.js?*',async route=>{
   const response=await route.fetch(),body=await response.text();
   assert.ok(body.includes('8 people: counterexample'));
   await route.fulfill({response,body:body.replace('8 people: counterexample','8 people · counterexample')});
  });
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/765/');
  if(stress)await page.addStyleTag({content:`#preset { font-size: ${stressFont}px; }`});
  for(const width of stress?[320]:[320,390,1440])for(const lang of ['en','zh'])for(let preset=0;preset<5;preset++){
   await page.setViewportSize({width,height:1000});
   await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset',String(preset));
   await page.locator('#next').click();
   const before=await page.locator('#afterRow').textContent();
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();
   await page.locator(`[data-lang=${lang}]`).click();
   assert.equal(await page.locator('#preset').inputValue(),String(preset));
   assert.equal(await page.locator('#afterRow').textContent(),before);
   const fit=await page.locator('#preset').evaluate(e=>{
    const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;
    const span=document.createElement('span');span.style.cssText=`position:absolute;white-space:pre;font:${s.font}`;
    span.textContent=e.selectedOptions[0].text;document.body.append(span);const dom=span.getBoundingClientRect().width;span.remove();
    return {label:e.selectedOptions[0].text,font:s.font,clientWidth:e.clientWidth,padding:[s.paddingLeft,s.paddingRight],text:c.measureText(e.selectedOptions[0].text).width,dom,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-24};
   });
   records.push({width,lang,preset,roundtrip:true,...fit,pass:fit.text<=fit.available});
   if(!stress){await page.locator('#preset').scrollIntoViewIfNeeded();await page.locator('#preset').screenshot({path:path.join(out,`select-${width}-${lang}-${preset}.png`)});}
  }
  fs.writeFileSync(path.join(out,stress?'stress-results.json':'margin-results.json'),JSON.stringify({browser:browser.version(),host:process.platform,syntheticStress:stress,stressFont:stress?stressFont:null,legacyLabelOverride:legacy,arrowReserve:24,records},null,2)+'\n');
  assert.ok(records.every(r=>r.pass),JSON.stringify(records.filter(r=>!r.pass)));
  console.log(`${records.length} preset/locale/width checks passed; syntheticStress=${stress}`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
