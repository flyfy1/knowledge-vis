const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const p=await browser.newPage({viewport:{width:320,height:850},reducedMotion:'reduce'}),results={selects:[],captures:[],checks:[]};
 await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/753/');
 for(const lang of ['zh','en']){
  await p.locator(`[data-lang=${lang}]`).click();
  await p.locator('.site-head').screenshot({path:path.join(out,lang+'-320-header.png')});results.captures.push(lang+'-320-header.png');
  for(let i=0;i<5;i++){
   await p.selectOption('#preset',String(i));
   const measurement=await p.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {label:el.selectedOptions[0].textContent,width:el.clientWidth,text:c.measureText(el.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font,arrowAllowance:24};});
   assert.ok(measurement.width>=measurement.text+measurement.padding+measurement.arrowAllowance,JSON.stringify(measurement));results.selects.push({lang,...measurement});
  }
  await p.locator('#step1').screenshot({path:path.join(out,lang+'-320-derivation.png'),style:'.step-nav{visibility:hidden!important}'});results.captures.push(lang+'-320-derivation.png');
  await p.setViewportSize({width:1440,height:1000});await p.locator('#sourceDetails').evaluate(x=>x.open=true);await p.locator('#sourceDetails').screenshot({path:path.join(out,lang+'-1440-source.png'),style:'.step-nav{visibility:hidden!important}'});results.captures.push(lang+'-1440-source.png');await p.setViewportSize({width:320,height:850});
  await p.locator('[data-step="0"]#handNext').focus();await p.keyboard.press('Enter');
  const before=await p.locator('#handRead').textContent();await p.locator(`[data-lang=${lang==='zh'?'en':'zh'}]`).click();await p.locator(`[data-lang=${lang}]`).click();assert.equal(await p.locator('#handRead').textContent(),before);
  assert.equal(await p.locator('h1').textContent(),lang==='en'?'#753 · Cracking the Safe':'#753 · 破解保险箱');results.checks.push(lang+' narrow roundtrip preserves hand state and identity');
 }
 const controls=await p.locator('button,select,.btn').evaluateAll(es=>es.map(x=>({text:x.textContent.trim(),w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})));assert.ok(controls.every(x=>x.w>=48&&x.h>=48));results.controls=controls;
 await p.emulateMedia({forcedColors:'active'});await p.locator('#reset').focus();assert.equal(await p.locator('#reset').evaluate(x=>getComputedStyle(x).outlineWidth),'3px');results.checks.push('forced-colors keeps focus outline');
 fs.writeFileSync(path.join(out,'layout-results.json'),JSON.stringify(results,null,2));await browser.close();console.log('Layout passed: 10 closed selects, 6 inspected captures, controls >=48px, forced-colors focus.');
})().catch(e=>{console.error(e);process.exit(1)});
