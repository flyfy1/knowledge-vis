/* R691-01 author regression: actual closed native select, not option DOM alone. */
const {chromium}=require('playwright');
const assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/review-1-fix');
const tag=process.env.EVIDENCE_TAG||'after';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const page=await browser.newPage({viewport:{width:320,height:844}}),records=[];
 let failure;
 try {
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18783')+'/leetcode/691/');
  await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
  for(const size of [{width:320,zoom:1},{width:390,zoom:1},{width:1440,zoom:1},{width:640,zoom:2}]){
   await page.setViewportSize({width:size.width,height:1000});
   await page.evaluate(z=>document.documentElement.style.zoom=String(z),size.zoom);
   for(const lang of ['en','zh']){
    await page.click(`[data-lang=${lang}]`);
    // Start with the original failing option, then cover every other label.
    for(const preset of ['6','0','1','2','3','4','5']){
     await page.selectOption('#preset',preset);
     await page.locator('#preset').blur();
     await page.locator('#preset').scrollIntoViewIfNeeded();
     await page.waitForTimeout(150);
     const r=await page.locator('#preset').evaluate(n=>{
      const s=getComputedStyle(n),c=document.createElement('canvas').getContext('2d');c.font=s.font;
      const label=n.selectedOptions[0].textContent;
      // Conservative 20 CSS px native-arrow reserve for this Chromium control.
      // Record it explicitly; screenshots are also inspected, not inferred from DOM text.
      return {label,font:s.font,fontFamily:s.fontFamily,width:n.offsetWidth,height:n.offsetHeight,
       textWidth:c.measureText(label).width,allowance:n.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20,
       arrowReserve:20,value:n.value};
     });
     records.push({finding:'R691-01',viewportWidth:size.width,zoom:size.zoom,lang,preset,...r});
     if(preset==='6'){
      await page.locator('#preset').screenshot({path:path.join(out,`${tag}-${lang}-${size.width}-zoom${size.zoom}-label.png`)});
     }
     assert(r.textWidth<=r.allowance,`R691-01 ${lang} ${size.width} zoom ${size.zoom}: ${JSON.stringify(r)}`);
     assert(r.height>=48);assert(r.label.endsWith(preset==='0'||preset==='3'?'2':preset==='1'||preset==='4'?'3':'−1'));
    }
    await page.selectOption('#preset','6');
    for(let i=0;i<3;i++)await page.click('#next');
    const state=await page.locator('#progress').textContent();
    const label=await page.locator('#preset option:checked').textContent();
    await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);
    assert.equal(await page.inputValue('#preset'),'6');
    assert.equal(await page.locator('#progress').textContent(),state);
    assert.equal(await page.locator('#preset option:checked').textContent(),label);
    await page.locator('#step2 .stage').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`${tag}-${lang}-${size.width}-zoom${size.zoom}-event3-roundtrip.png`)});
    await page.click('#end');assert((await page.locator('#progress').textContent()).endsWith('-1'));
   }
  }
 } catch(e){failure=e;}
 fs.writeFileSync(path.join(out,`${tag}-selected-label.json`),JSON.stringify({kind:'author self-check',hostPlatform:process.platform,browser:browser.version(),arrowReserveNote:'20 CSS px conservative allowance for this control; not a universal native-arrow width',records,passed:!failure,error:failure?.message},null,2)+'\n');
 await browser.close();if(failure)throw failure;
 console.log('R691-01 selected-label regression passed (both locales, every preset, event 3, locale roundtrip, 200% CSS zoom).');
})().catch(e=>{console.error(e);process.exitCode=1;});
