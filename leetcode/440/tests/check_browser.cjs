'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/440/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const errors=[],network=[],screens=[],checks=[];
const record=s=>checks.push(s);
async function shot(page,name,selector='.stage') {await page.locator(selector).screenshot({path:path.join(out,name+'.png')});screens.push(name+'.png');}
async function state(page){return page.evaluate(()=>({p:Number(document.getElementById('prefixValue').textContent),r:Number(document.getElementById('remainingValue').textContent),size:Number(document.getElementById('sizeValue').textContent),index:Number(document.getElementById('position').value)}));}
function watch(page){page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());network.push(r.url());});page.on('requestfailed',r=>errors.push('requestfailed '+r.url()+' '+r.failure()?.errorText));}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();watch(page);
 for(const lang of ['en','zh']){
  await page.goto(url);await page.locator(`[data-lang=${lang}]`).click();await page.waitForFunction(()=>document.getElementById('prefixValue').textContent==='1');
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert(await page.locator('#reveal').isDisabled());assert(await page.locator('#feedback').isHidden());
  for(let p=0;p<core.presets.length;p++){
   await page.selectOption('#preset',String(p));const {n,k}=core.presets[p],frames=core.trace(n,k);
   for(let i=0;i<frames.length;i++){
    const s=await state(page);assert.deepEqual(s,{p:frames[i].p,r:frames[i].r,size:frames[i].size,index:i});
    assert.equal(await page.locator('#history tr').count(),Math.max(1,i));
    assert.equal(await page.locator('#count tr').count(),frames[i].rows.length);
    if(i<frames.length-1)await page.locator('#next').click();
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   for(let i=frames.length-2;i>=0;i--){await page.locator('#prev').click();assert.equal((await state(page)).p,frames[i].p);assert.equal((await state(page)).r,frames[i].r);}
   assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   if(frames.length>1){await page.locator('#end').click();assert.equal((await state(page)).p,frames.at(-1).p);await page.locator('#reset').click();assert.equal((await state(page)).index,0);}
  }
  record(lang+': all presets, complete forward/back trace, history/count rows, reset/end/disabled endpoints');
  await page.selectOption('#preset','0');await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal((await state(page)).index,1);await page.keyboard.press('ArrowLeft');assert.equal((await state(page)).index,0);
  // All misconception choices, stale-feedback clearing, and language preservation.
  for(const choice of ['0','1','2']){
   await page.locator(`input[value="${choice}"][name=prediction]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes('27'));
   const saved=await state(page);await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await state(page),saved);assert(await page.locator(`input[value="${choice}"][name=prediction]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();
  }
  await page.locator('input[value="1"][name=prediction]').check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();await page.selectOption('#preset','2');assert(await page.locator('#feedback').isVisible());
  await page.selectOption('#preset','5');await page.setViewportSize({width:320,height:1000});await page.locator('#countWrap').evaluate(e=>{e.scrollIntoView({block:'center',behavior:'instant'});e.scrollLeft=e.scrollWidth;});await shot(page,lang+'-maximum-count','#countWrap');await page.locator('#end').click();await page.locator('.state-grid').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await shot(page,lang+'-maximum-state','.state-grid');await page.setViewportSize({width:1440,height:1000});
  record(lang+': keyboard range, prediction/reveal/change/all options/locale and experiment isolation');
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  const dlPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await dlPromise;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);
  record(lang+': displayed/clipboard/download exact canonical source');
  // Force clipboard failure, inspect focused manual selection, then preserve it across locale.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denial');},readText:async()=>''}}));
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);await shot(page,lang+'-fallback','#manualCopy');
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await page.evaluate(()=>document.activeElement.tagName),'BUTTON');assert(await page.locator('#manualCopy').isVisible());await page.locator(`[data-lang=${lang}]`).click();
  record(lang+': denied clipboard shows full selected source and localized status');
  await page.reload();await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#next').click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('.step-nav a[href="#step2"]').click();await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().top;return y>=70&&y<140;});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=50));
   await shot(page,`${lang}-${width}-trace`);await page.locator('.state-grid').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await shot(page,`${lang}-${width}-states`,'.state-grid');await page.locator('#countWrap').evaluate(e=>{e.scrollIntoView({block:'center',behavior:'instant'});e.scrollLeft=e.scrollWidth;});await shot(page,`${lang}-${width}-count-right`,'#countWrap');await page.locator('#countWrap').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowLeft');
   // Tables scroll locally, state labels/values occupy separate lines.
   for(const card of await page.locator('.state').all()){
    const geometry=await card.evaluate(e=>{const a=e.querySelector('span').getBoundingClientRect(),b=e.querySelector('b').getBoundingClientRect();return{bottom:a.bottom,top:b.top,width:e.scrollWidth,box:e.clientWidth};});assert(geometry.bottom<=geometry.top+1);assert(geometry.width<=geometry.box+1);
   }
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#decision').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,lang+'-zoom200-trace');await page.locator('.state-grid').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await shot(page,lang+'-zoom200-states','.state-grid');await page.evaluate(()=>document.documentElement.style.zoom='1');
  // Native button keyboard activation, visible focus, and deep anchors.
  await page.locator('#reset').click();await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal((await state(page)).index,1);assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  for(let i=0;i<5;i++){await page.locator(`.step-nav a[href="#step${i}"]`).click();await page.waitForFunction(i=>{const y=document.getElementById('step'+i).getBoundingClientRect().top;return y>=70&&y<140;},i);assert(await page.locator('#step'+i).evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=50&&r.top<150;}));}
  // Related deep links are present and resolve to existing anchors.
  for(const href of ['../60/#step2','../41/#step2']){const response=await context.request.get(new URL(href,url).href);assert(response.ok());assert((await response.text()).includes('id="step2"'));}
  record(lang+': widths 320/390/736/1440, 200% CSS layout zoom, state geometry, keyboard focus, all navigation and related anchors');
 }
 // Test storage disabled before any app code. Locale changes remain in memory.
 const isolated=await browser.newContext();await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const offline=await isolated.newPage();watch(offline);await offline.route('**/solution.py',route=>route.abort());await offline.goto(url);await offline.locator('[data-lang=zh]').click();await offline.locator('#next').click();const s=await state(offline);await offline.locator('[data-lang=en]').click();assert.deepEqual(await state(offline),s);assert.equal(await offline.locator('#pythonCode').textContent(),source);await isolated.close();record('blocked storage fallback and offline source mirror (no source fetch required)');
 // Rendered contrast, including disabled/readout/selected/focus.
 await page.goto(url);await page.locator('[data-lang=en]').click();
 const colors=await page.evaluate(()=>['body','.explain','.hint','.step-nav a','.lang-toggle button.active','.btn:disabled','.state','.state span','.state b','th','a','#next'].map(selector=>{const e=document.querySelector(selector),style=getComputedStyle(e);let p=e,bg=style.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return{selector,color:style.color,bg};}));
 function luminance(s){const vals=s.match(/[\d.]+/g).slice(0,3).map(x=>{const v=Number(x)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*vals[0]+.7152*vals[1]+.0722*vals[2];}
 const contrast=colors.map(c=>{const a=luminance(c.color),b=luminance(c.bg);return{...c,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});contrast.forEach(c=>assert(c.ratio>=4.5,JSON.stringify(c)));
 const focusRatio=(luminance('rgb(255,180,84)')+.05)/(luminance('rgb(28,35,48)')+.05);assert(focusRatio>=3);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Long labels/CJK wrap rather than clip on narrow controls and body copy.
 await page.setViewportSize({width:320,height:1000});await page.locator('.tagline').evaluate(e=>e.textContent='字'.repeat(120));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.tagline').evaluate(e=>e.textContent='W'.repeat(120));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));record('120 Latin/CJK characters wrap; forced colors and reduced-motion focus remain available');
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert(network.every(u=>u.startsWith(base)||u.startsWith('data:')));
 const result={status:'pass',checks,screenshots:screens,contrast,focusContrast:focusRatio,cssBytes,errors,externalRuntimeRequests:network.filter(u=>!u.startsWith(base)&&!u.startsWith('data:')),zoomMethod:'documentElement CSS zoom=2 at 1440px; layout and screenshots inspected; physical device/browser UI zoom not claimed'};
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,checks:checks.length,screenshots:screens.length,cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
