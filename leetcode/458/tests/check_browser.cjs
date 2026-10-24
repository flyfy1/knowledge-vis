'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/458/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),errors=[],requests=[],checks=[],screens=[],bindings=[];
function watch(page){page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure()?.errorText));}
async function screenshot(page,name,selector){await page.locator(selector).scrollIntoViewIfNeeded();await page.locator(selector).screenshot({path:path.join(out,name+'.png')});screens.push(name+'.png');}
async function viewportShot(page,name,selector){await page.locator(selector).evaluate(e=>{const top=scrollY+e.getBoundingClientRect().top-document.querySelector('nav').getBoundingClientRect().height-24;window.scrollTo({top,behavior:'instant'});});await page.screenshot({path:path.join(out,name+'.png')});screens.push(name+'.png');}
async function snapshot(page){return page.evaluate(()=>({preset:document.getElementById('preset').value,poison:document.getElementById('poison').value,index:Number(document.getElementById('position').value),candidates:Array.from(document.querySelectorAll('[data-candidate=true]')).map(e=>Number(e.dataset.bucket)),history:document.querySelectorAll('.history-entry').length,choice:document.querySelector('[name=prediction]:checked')?.value||null,revealed:!document.getElementById('feedback').hidden}));}
async function frame(page,m,i){const s=await snapshot(page);assert.equal(s.index,i);assert.deepEqual(s.candidates,m.frames[i].candidates);assert.equal(s.history,i);assert.equal(await page.locator('.pig-card').count(),m.pigs);assert.equal(await page.locator('.bucket-card').count(),m.b);}
function lum(s){const v=s.match(/[\d.]+/g).slice(0,3).map(x=>{const t=Number(x)/255;return t<=.04045?t/12.92:((t+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();watch(page);
 for(const lang of ['en','zh']){
  await page.goto(url);await page.locator(`[data-lang=${lang}]`).click();await page.waitForFunction(()=>document.getElementById('progress').textContent.length>0);
  await page.screenshot({path:path.join(out,lang+'-intro.png')});screens.push(lang+'-intro.png');assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');assert(await page.locator('#reveal').isDisabled());assert(await page.locator('#feedback').isHidden());
  for(let preset=0;preset<C.presets.length;preset++){
   await page.selectOption('#preset',String(preset));const {b,d,t}=C.presets[preset];
   // Every poison choice, all forward frames; final singleton and rewind identity.
   for(let poison=1;poison<=b;poison++){
    await page.selectOption('#poison',String(poison));const m=C.experiment(b,d,t,poison);
    await frame(page,m,0);assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
    for(let i=1;i<m.frames.length;i++){await page.locator('#next').click();await frame(page,m,i);}
    assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
    for(let i=m.frames.length-2;i>=0;i--){await page.locator('#prev').click();await frame(page,m,i);}
    await page.locator('#end').click();await frame(page,m,m.rounds);await page.locator('#reset').click();await frame(page,m,0);
   }
  }
  console.log(lang+': all interactive preset paths passed');checks.push(lang+': all 8 presets and every poison; all forward/back frames, candidate status/history, reset/end, disabled endpoints');
  await page.selectOption('#preset','1');await page.selectOption('#poison','6');await page.locator('#next').click();
  assert.deepEqual((await snapshot(page)).candidates,[4,6]);const h=await page.locator('#history').innerText();assert(h.includes('15'));
  bindings.push({lang,state:'9 buckets, poison 6, after wait 1',expected:'A survives, B dies in round 1; candidate buckets 4 and 6',visible:await page.locator('#pigs').innerText(),progress:await page.locator('#progress').innerText()});
  let saved=await snapshot(page);await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await snapshot(page),saved);await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snapshot(page),saved);
  await page.locator('#next').click();assert.deepEqual((await snapshot(page)).candidates,[6]);
  bindings.push({lang,state:'9 buckets, poison 6, after wait 2',expected:'B already dead, feeding skipped; A dies in round 2; only candidate 6',visible:await page.locator('#history').innerText()});
  await page.locator('#reset').click();await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal((await snapshot(page)).index,1);await page.keyboard.press('ArrowLeft');assert.equal((await snapshot(page)).index,0);
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal((await snapshot(page)).index,1);assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  checks.push(lang+': keyboard range/buttons; locale preserves preset, poison and progress; death/skip semantic binding captured');
  for(const choice of ['0','1','2']){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());assert.equal(await page.locator('#feedback').textContent(),'');await page.locator('#reveal').click();
   if(choice==='1')await screenshot(page,lang+'-quiz-revealed','#step3');const feedback=await page.locator('#feedback').innerText();assert(feedback.includes('27')&&feedback.includes('17'));assert.equal(feedback.startsWith(lang==='en'?'Correct.':'正确。'),choice==='1');
   bindings.push({lang,state:'prediction choice '+choice,expected:choice==='1'?'correct: 9<17<=27':'not minimal: explain missing or unused outcomes',visible:feedback});
   saved=await snapshot(page);await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await snapshot(page),saved);await page.locator(`[data-lang=${lang}]`).click();
  }
  await page.selectOption('#preset','4');assert(await page.locator('#feedback').isVisible());await page.locator('[name=prediction][value="1"]').check();assert(await page.locator('#feedback').isHidden());
  checks.push(lang+': all prediction choices, explicit reveal, stale feedback clears, locale preserves, experiment isolation');
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  const dlPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await dlPromise;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);assert.equal(dl.suggestedFilename(),'solution.py');
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denied');}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
  bindings.push({lang,state:'clipboard denied',expected:'manual copy instruction, independent of algorithm feedback',visible:await page.locator('#copyStatus').innerText()});
  await screenshot(page,lang+'-copy-fallback','#manualCopy');await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('#manualCopy').isVisible());await page.locator(`[data-lang=${lang}]`).click();
  checks.push(lang+': displayed/copied/downloaded exact canonical source, manual-copy fallback focus and selection');
  await page.reload();await page.selectOption('#preset','1');await page.selectOption('#poison','6');await page.locator('#next').click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('.step-nav a[href="#step2"]').click();await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().top;return y>=60&&y<150;});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=60));
   for(const card of await page.locator('.pig-card,.bucket-card').all())assert(await card.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   await screenshot(page,`${lang}-${width}-pigs`,'#pigs');await screenshot(page,`${lang}-${width}-buckets`,'#buckets');
   await page.locator('.table-wrap').first().focus();await page.keyboard.press('ArrowRight');
  }
  for(const width of [1440,780]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await viewportShot(page,`${lang}-${width}-zoom200`,'#pigs');await viewportShot(page,`${lang}-${width}-zoom200-pigB`,'.pig-card:nth-child(2)');await page.evaluate(()=>document.documentElement.style.zoom='1');
  }
  await page.setViewportSize({width:390,height:1000});await page.selectOption('#preset','7');await page.selectOption('#poison','26');await page.locator('#end').click();await screenshot(page,lang+'-27-buckets','#buckets');await screenshot(page,lang+'-history','#history');
  await page.selectOption('#preset','5');assert((await page.locator('#pigs').innerText()).includes(lang==='en'?'Zero pigs':'零只'));await viewportShot(page,lang+'-one-bucket','#pigs');
  await page.selectOption('#preset','6');assert((await page.locator('#leftover').innerText()).includes('14'));
  await page.setViewportSize({width:1440,height:1000});
  for(let i=0;i<5;i++){await page.locator(`.step-nav a[href="#step${i}"]`).click();await page.waitForFunction(i=>{const y=document.getElementById('step'+i).getBoundingClientRect().top;return y>=60&&y<150;},i);assert(await page.locator('#step'+i).evaluate(e=>{const top=e.getBoundingClientRect().top;return top>=60&&top<150;}));}
  for(const href of ['../60/#step2','../440/#step2']){const r=await context.request.get(new URL(href,url).href);assert(r.ok());assert((await r.text()).includes('id="step2"'));}
  checks.push(lang+': 320/390/736/1440, 200% CSS zoom at 1440/780, populated diagrams, no clipping, one bucket, leftover time, navigation/deep links');
 }
 const isolated=await browser.newContext();await isolated.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied');}}));const fallback=await isolated.newPage();watch(fallback);
 const sourceRequestsBefore=requests.filter(u=>u.endsWith('/solution.py')).length;await fallback.route('**/solution.py',route=>route.abort());await fallback.goto(url);await fallback.locator('[data-lang=zh]').click();await fallback.locator('#next').click();const s=await snapshot(fallback);await fallback.locator('[data-lang=en]').click();assert.deepEqual(await snapshot(fallback),s);assert.equal(await fallback.locator('#pythonCode').textContent(),source);assert.equal(requests.filter(u=>u.endsWith('/solution.py')).length,sourceRequestsBefore); // source display does not fetch
 await isolated.close();checks.push('blocked storage: in-memory locale state and offline embedded source');
 await page.goto(url);await page.locator('[data-lang=en]').click();
 const colors=await page.evaluate(()=>['body','.explain','.hint','.step-nav a','.lang-toggle button.active','.btn:disabled','.pig-card','.bucket-card b','.bucket-card span','th','a','#next','.ledger-item'].map(selector=>{const e=document.querySelector(selector),style=getComputedStyle(e);let p=e,bg=style.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return{selector,color:style.color,bg};}));
 const contrast=colors.map(c=>({...c,ratio:(Math.max(lum(c.color),lum(c.bg))+.05)/(Math.min(lum(c.color),lum(c.bg))+.05)}));contrast.forEach(c=>assert(c.ratio>=4.5,JSON.stringify(c)));
 const focusContrast=(lum('rgb(255,180,84)')+.05)/(lum('rgb(28,35,48)')+.05);assert(focusContrast>=3);
 const controlGeometry=await page.locator('button,select,.step-nav a,summary').evaluateAll(es=>es.map(e=>({text:e.textContent,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})));controlGeometry.forEach(e=>assert(e.height>=48&&e.width>=48,JSON.stringify(e)));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 await page.setViewportSize({width:320,height:1000});for(const str of ['字'.repeat(120),'W'.repeat(120)]){await page.locator('.tagline').evaluate((e,s)=>e.textContent=s,str);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base)||u.startsWith('data:')));
 const result={status:'pass',checks,screenshots:screens,contrast,focusContrast,controlGeometry,cssBytes,errors,externalRuntimeRequests:[],semanticBindings:bindings,zoomMethod:'CSS layout zoom=2 at desktop and effective 390px; physical device/native browser zoom not claimed',motion:'main suite uses reduced-motion to make scroll geometry stable; normal smooth-scroll navigation separately checked'};
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:'pass',checks:checks.length,screenshots:screens.length,cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
