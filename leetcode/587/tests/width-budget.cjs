'use strict';
// 587-MAC-001: real rendered width regression under explicit synthetic font stress.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const out=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence/mac-fix'));
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const rows=[];
 try{
  const page=await browser.newPage({viewport:{width:320,height:950}});
  await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:18770')+'/leetcode/587/');
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  await page.locator('#progress').filter({hasText:'0/'}).waitFor();
  async function record(mode){
   for(const lang of ['en','zh']){
    await page.locator('[data-lang='+lang+']').click();
    for(let preset=0;preset<6;preset++){
     await page.selectOption('#preset',String(preset));
     rows.push({mode,lang,preset,...await page.locator('#preset').evaluate(el=>{
      const s=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;
      const label=el.selectedOptions[0].textContent,textWidth=ctx.measureText(label).width;
      const available=el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-16;
      return {label,font:s.font,textWidth,available,margin:available-textWidth,pass:textWidth<=available};
     })});
    }
   }
  }
  await record('baseline');
  // Synthetic sensitivity check, not a claim to reproduce Mac's resolved fonts.
  const stress=await page.addStyleTag({content:'#preset{font-size:17.6px!important}'});
  await record('font-size-plus-10-percent');
  const padding=await page.addStyleTag({content:'#preset{padding-inline:8px!important}'});
  await record('stress-plus-padding-8px');await padding.evaluate(el=>el.remove());
  await page.locator('[data-lang=en]').click();await page.locator('[data-lang=zh]').click();await page.locator('[data-lang=en]').click();
  await record('stress-locale-roundtrip');
  await page.locator('[data-lang=en]').click();await page.selectOption('#preset','1');await page.locator('#preset').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'en-320-width-stress.png')});
  await stress.evaluate(el=>el.remove());
  fs.writeFileSync(path.join(out,'width-budget.json'),JSON.stringify({selfCheck:true,finding:'587-MAC-001',browser:browser.version(),syntheticStress:'17.6px versus normal 16px; not native Mac evidence',rows},null,2)+'\n');
  assert(rows.every(r=>r.pass),'587-MAC-001: selected text exceeds native-arrow width budget; see width-budget.json');
  assert(rows.filter(r=>r.mode==='font-size-plus-10-percent').every(r=>r.margin>=8),'587-MAC-001: stress must leave at least 8px spare beyond the 16px arrow allowance');
  console.log(JSON.stringify({ok:true,states:rows.length,minimumMargin:Math.min(...rows.map(r=>r.margin))}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'width-budget-failure.txt'),e.stack+'\n');console.error(e);process.exitCode=1;});
