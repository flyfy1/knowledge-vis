/* 630-MAC-001: selected text must fit beside the native arrow.
 * Linux runs are regression/sensitivity evidence, never native Mac closure.
 * FONT_SIZE_PX is an optional synthetic sensitivity check, not a font emulator.
 */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=process.env.OUTPUT_DIR;
assert(out,'Set OUTPUT_DIR to a new evidence directory');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage();
 await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/630/');
 if(process.env.FONT_SIZE_PX)await page.addStyleTag({content:`#preset{font-size:${Number(process.env.FONT_SIZE_PX)}px}`});
 const records=[];
 const inputs=[[[4,4],[2,5],[2,6]],[[100,200],[200,1300],[1000,1250],[2000,3200]],[[1,2]],[[3,2],[4,3]],[[2,2],[2,2],[1,4],[1,4]]];
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:950});
  for(const lang of ['en','zh','en']){
   await page.locator(`[data-lang=${lang}]`).click();
   for(let index=0;index<5;index++){
    await page.selectOption('#preset',String(index));
    assert.equal(await page.locator('#inputRead').textContent(),JSON.stringify(inputs[index]));
    const data=await page.locator('#preset').evaluate(el=>{
     const s=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;
     const label=el.selectedOptions[0].textContent;
     return {label,font:s.font,fontFamily:s.fontFamily,width:el.clientWidth,paddingLeft:parseFloat(s.paddingLeft),paddingRight:parseFloat(s.paddingRight),arrowAllowance:16,textWidth:ctx.measureText(label).width};
    });
    data.available=data.width-data.paddingLeft-data.paddingRight-data.arrowAllowance;
    data.fits=data.textWidth<=data.available;
    // Independent expected output counts, explicitly scoped to courses in both locales.
    const count=[2,3,1,0,3][index];
    assert.match(data.label,new RegExp(lang==='en'?`${count} courses?`:`可选 ${count} 门`));
    records.push({viewportWidth:width,lang,index,...data});
    await page.locator('#preset').screenshot({path:path.join(out,`${lang}-${width}-${index}.png`)});
   }
  }
 }
 const failures=records.filter(r=>!r.fits);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({finding:'630-MAC-001',kind:'author self-check',platform:process.platform,browser:browser.version(),syntheticFontSize:process.env.FONT_SIZE_PX||null,arrowAllowanceScope:'16px retained from incident probe; screenshots also require inspection',records,failures},null,2)+'\n');
 await browser.close();
 console.log(JSON.stringify({records:records.length,failures}));
 assert.equal(failures.length,0,'Closed selected labels clip');
})().catch(e=>{console.error(e);process.exitCode=1});
