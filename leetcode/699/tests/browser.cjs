'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
const url=process.env.LESSON_URL||'http://127.0.0.1:18782/leetcode/699/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const expected=[[2,4,4],[2,5,5],[100,100],[3,3,7,8],[2,4,6],[1]];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],bad=[],external=[],checks=[],snapshots=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('requestfailed',r=>bad.push([r.url(),r.failure()]));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18782/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.locator('#progress').filter({hasText:/0/}).waitFor();
 async function lang(l){await page.click(`[data-lang="${l}"]`);assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 const snapshot=()=>page.evaluate(()=>['progress','event','output','landedRows','checkRows','plot'].map(id=>document.getElementById(id).innerHTML));
 for(const l of ['en','zh']){
  await lang(l);
  assert((await page.locator('[data-i18n="overlapFormula"]').textContent()).includes('max(left, old_left) < min(right, old_right)'));
  for(const left of ['2','3','4']){await page.selectOption('#handLeft',left);const text=await page.locator('#handResult').textContent();assert(text.includes(left==='2'?'base = 2':'base = 0'));checks.push({locale:l,handLeft:left,readout:text});}
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   let events=0;
   while(await page.locator('#next').isEnabled()){
    await page.click('#next');events++;
    const s=await snapshot();await page.click('#prev');await page.click('#next');assert.deepEqual(await snapshot(),s);
   }
   assert(await page.locator('#end').isDisabled());const output=await page.locator('#output').textContent();assert(output.includes('['+expected[p].join(', ')+']'));checks.push({locale:l,preset:p,events,output,event:await page.locator('#event').textContent()});
   const end=await snapshot();await page.click('#reset');assert(await page.locator('#prev').isDisabled());await page.click('#end');assert.deepEqual(await snapshot(),end);
  }
  for(let choice=0;choice<3;choice++){
   await page.check(`[name="prediction"][value="${choice}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert(await page.locator('#feedback').isVisible());
   const f=await page.locator('#feedback').textContent();assert(f.includes(l==='zh'?'base=2、top=3':'base=2, top=3'));checks.push({locale:l,choice,feedback:f});
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name="prediction"][value="${choice}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await lang(l);
  }
  // Trace controls cannot reset independent retrieval.
  await page.click('#reset');assert(await page.locator('#feedback').isVisible());await page.selectOption('#preset','1');assert(await page.locator('#feedback').isVisible());
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  checks.push({locale:l,copyStatus:await page.locator('#copyStatus').textContent(),nativeClipboard:true});
 }
 const d=page.waitForEvent('download');await page.click('a[download]');const download=await d;const filename=path.join(out,'downloaded-solution.py');await download.saveAs(filename);assert.equal(fs.readFileSync(filename,'utf8'),source);
 // Deny only automatic API writing, leaving OS shortcut copy and readback intact.
 await page.evaluate(()=>navigator.clipboard.writeText('distinct-non-source-699-sentinel'));
 await page.evaluate(()=>{window.testNativeWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('test denial');};});
 for(const l of ['en','zh']){
  await page.evaluate(l=>window.testNativeWrite('distinct-non-source-699-'+l),l);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'distinct-non-source-699-'+l);
  await lang(l);await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());
  assert.equal(await page.locator('#copyText').inputValue(),source);
  assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  checks.push({locale:l,fallbackStatus:await page.locator('#copyStatus').textContent(),manualKeyboardCopy:true,host:process.platform});
 }
 // Keyboard native controls and focus, including scrolling data regions.
 await page.locator('#handLeft').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await page.locator('#handLeft').inputValue(),'3');
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/'));
 await page.locator('#plot').focus();assert.equal(await page.locator('#plot').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');await page.keyboard.press('ArrowRight');assert(await page.locator('#plot').evaluate(el=>document.activeElement===el));
 // Locale after interaction retains preset, frame, hand input, prediction, disclosure and useful focus.
 await page.locator('#copyText').focus();await page.locator('#copyText').selectText();
 const before=await page.evaluate(()=>({hand:handLeft.value,preset:preset.value,progress:progress.textContent.match(/\d+\/\d+/g),choice:document.querySelector('[name=prediction]:checked').value,open:sourceDetails.open}));
 await lang('en');await lang('zh');const after=await page.evaluate(()=>({hand:handLeft.value,preset:preset.value,progress:progress.textContent.match(/\d+\/\d+/g),choice:document.querySelector('[name=prediction]:checked').value,open:sourceDetails.open}));assert.deepEqual(after,before);
 // Full device/locale geometry matrix, populated support table and plot.
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.selectOption('#preset','3');await page.click('#end');
  await page.locator('#plot').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const clip=await page.locator('#plot').boundingBox();assert(clip.width>=240);assert(await page.locator('#plot svg').evaluate(el=>el.getBoundingClientRect().width>=500));
  const file=`plot-${l}-${width}.png`;await page.locator('#plot').screenshot({path:path.join(out,file)});snapshots.push(file);
  if(width===320){await page.locator('#checkRows').screenshot({path:path.join(out,`checks-${l}-320.png`)});await page.locator('.site-head').screenshot({path:path.join(out,`header-${l}-320.png`)});}
 }
 // 200% desktop browser-equivalent CSS zoom, measured in actual rendered geometry.
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const l of ['en','zh']){await lang(l);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#plot').screenshot({path:path.join(out,`zoom200-${l}.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='');
 // Follow real sticky nav links and verify anchors, all related link targets.
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=0;i<5;i++){await page.click(`#stepNav a[href="#step${i}"]`);await page.waitForFunction(id=>{const y=document.getElementById(id).getBoundingClientRect().top;return y>=70&&y<200;},`step${i}`);const y=await page.locator(`#step${i}`).evaluate(el=>el.getBoundingClientRect().top);assert(y>=70&&y<200,`sticky target ${i}: ${y}`);}
 const links=await page.locator('.related a').evaluateAll(a=>a.map(x=>x.href));for(const link of links){const u=new URL(link);const r=await context.request.get(u.href.split('#')[0]);assert.equal(r.status(),200);assert((await r.text()).includes(`id="${u.hash.slice(1)}"`));}
 // Contrast from computed real surfaces, including selected/disabled controls and focus.
 const colors=await page.evaluate(()=>{const selectors=['body','.stage','.readout','.hint','th','button:disabled','#langToggle .active','.btn:not(:disabled)'];return selectors.map(sel=>{const el=document.querySelector(sel),s=getComputedStyle(el);let parent=el,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}return{selector:sel,fg:s.color,bg};});});
 const lum=color=>{const rgb=color.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
 const contrast=colors.map(c=>{const a=lum(c.fg),b=lum(c.bg);return{...c,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});contrast.forEach(c=>assert(c.ratio>=4.5,JSON.stringify(c)));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#copy').focus();assert.equal(await page.locator('#copy').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const bp=await blocked.newPage();await bp.goto(url);await bp.click('[data-lang="zh"]');await bp.click('#next');assert((await bp.locator('#progress').textContent()).includes('1/'));await blocked.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({url,host:process.platform,checks,snapshots,contrast,errors,bad,external,viewports:[320,390,736,1440],zoom:'200% CSS zoom on 1440 desktop',keyboard:true,storageDenied:true,downloadExact:true},null,2));
 console.log(JSON.stringify({checks:checks.length,screenshots:snapshots.length,errors,bad,external,contrast}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
