'use strict';
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {trace}=require('../core.js'),root=path.resolve(__dirname,'..'),out=process.env.OUT_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/483/';
fs.mkdirSync(out,{recursive:true});const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),presets=['13','31','4681','3','1000000000000000000','16'],checks=[],screens=[],meaning=[],errors=[],requests=[];
function watch(p){p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('requestfailed',r=>errors.push(r.url()));p.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url());});}
async function shot(p,name,target){await p.locator(target).evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-100,behavior:'instant'}));await p.screenshot({path:path.join(out,name+'.png')});screens.push(name+'.png');}
async function checkFrame(p,m,i){const f=m.frames[i];assert.equal(await p.locator('#position').inputValue(),String(i));assert.equal(await p.locator('#ledger tr').count(),f.history.length);if(f.terms){assert.deepEqual(await p.locator('#sequence span').allTextContents(),f.terms.map((v,j)=>(j?'→ ':'')+String(v)));assert((await p.locator('#comparison').textContent()).includes('['+f.beforeLo+', '+f.beforeHi+']'));}assert((await p.locator('#progress').textContent()).includes(String(m.N)));}
(async()=>{
 const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await b.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const p=await ctx.newPage();watch(p);
 for(const lang of ['en','zh']){
  await p.goto(url);await p.locator(`[data-lang=${lang}]`).click();await p.waitForFunction(()=>document.getElementById('progress').textContent.length>0);
  assert.equal(await p.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');assert(await p.locator('#reveal').isDisabled());assert(await p.locator('#feedback').isHidden());
  for(let j=0;j<presets.length;j++){
   await p.selectOption('#preset',String(j));const m=trace(presets[j]);
   for(let i=0;i<m.frames.length;i++){await checkFrame(p,m,i);if(i<m.frames.length-1)await p.locator('#next').click();}
   assert(await p.locator('#next').isDisabled());assert(await p.locator('#end').isDisabled());
   for(let i=m.frames.length-2;i>=0;i--){await p.locator('#prev').click();await checkFrame(p,m,i);}
   assert(await p.locator('#prev').isDisabled());assert(await p.locator('#reset').isDisabled());
   await p.locator('#end').click();await checkFrame(p,m,m.frames.length-1);await p.locator('#reset').click();await checkFrame(p,m,0);
  }
  checks.push(lang+': all frames of six presets forward/back; endpoint, reset/end and exact totals/history checks');
  // Meaning binding: small/large/equal/terminal must explain the algorithm,
  // independently of clipboard failure copy.
  for(const [preset,pos,kind,fragment] of [[0,1,'high',lang==='en'?'too large':'太大'],[0,3,'equal',lang==='en'?'return base 3':'返回进制 3'],[5,4,'low',lang==='en'?'too small':'太小'],[3,1,'fallback',lang==='en'?'Use two ones':'用两位 11']]){
   await p.selectOption('#preset',String(preset));await p.locator('#position').fill(String(pos));const event=await p.locator('#event').textContent();assert(event.includes(fragment),event);meaning.push({lang,preset:presets[preset],pos,kind,observed:event});
  }
  await p.selectOption('#preset','0');await p.locator('#next').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#position').inputValue(),'1');assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  await p.locator('#position').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#position').inputValue(),'2');await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('#position').inputValue(),'1');
  for(let j=0;j<3;j++){
   await p.locator(`[name=prediction][value="${j}"]`).check();assert(await p.locator('#feedback').isHidden());await p.locator('#reveal').click();const text=await p.locator('#feedback').textContent();assert(text.includes('[2,4]'));assert(text.startsWith(lang==='en'?(j===1?'Correct.':'Check the discard direction.'):(j===1?'正确。':'再检查排除方向。')));
   const before=await p.locator('#position').inputValue();await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await p.locator('#position').inputValue(),before);assert(await p.locator(`[name=prediction][value="${j}"]`).isChecked());assert(await p.locator('#feedback').isVisible());assert.equal(await p.locator('#preset').inputValue(),'0');await p.locator(`[data-lang=${lang}]`).click();
  }
  await p.selectOption('#preset','2');assert(await p.locator('#feedback').isVisible());await shot(p,lang+'-exercise','#step4');
  await p.locator('#sourceDetails summary').click();assert.equal(await p.locator('#pythonCode').textContent(),source);
  await p.locator('#copy').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);assert(await p.locator('#manualCopy').isHidden());
  const promise=p.waitForEvent('download');await p.locator('a[download]').click();assert.equal(fs.readFileSync(await (await promise).path(),'utf8'),source);
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denial');}}}));await p.locator('#copy').click();assert(await p.locator('#manualCopy').isVisible());assert.equal(await p.locator('#copyText').inputValue(),source);assert.equal(await p.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await p.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);assert((await p.locator('#copyStatus').textContent()).includes(lang==='en'?'manual copy':'手动复制'));
  await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await p.locator('#manualCopy').isVisible());assert(await p.locator('#sourceDetails').evaluate(e=>e.open));await p.locator(`[data-lang=${lang}]`).click();
  checks.push(lang+': every prediction reveal/change; locale and preset isolation; keyboard range/Enter/focus; displayed/copied/downloaded exact source; denied clipboard selects manual source');
  await p.reload();await p.locator(`[data-lang=${lang}]`).click();
  await p.setViewportSize({width:390,height:1000});await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:path.join(out,lang+'-intro.png')});screens.push(lang+'-intro.png');
  for(const w of [320,390,736,1440]){
   await p.setViewportSize({width:w,height:1000});
   for(let j=0;j<presets.length;j++){
    await p.selectOption('#preset',String(j));await p.locator('#end').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert(await p.locator('#ledger td,#event,#comparison,#after,.sequence span').evaluateAll(els=>els.filter(e=>e.getClientRects().length).every(e=>e.scrollWidth<=e.clientWidth+1)));
   }
   await p.selectOption('#preset','4');await p.locator('#position').fill('248');await shot(p,`${lang}-${w}-trace`,'.stage');if(w===320||w===390)await shot(p,`${lang}-${w}-values`,'#comparison');
   for(const el of await p.locator('button,select').all())if(await el.isVisible()){const box=await el.boundingBox();assert(box.height>=48);assert(box.width>=48);}
  }
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(p,lang+'-zoom200','.stage');await p.evaluate(()=>document.documentElement.style.zoom='1');
  // Deep navigation target not hidden beneath sticky navigation.
  for(let i=0;i<6;i++){await p.locator(`.step-nav a[href="#step${i}"]`).click();await p.waitForFunction(i=>{const r=document.getElementById('step'+i).getBoundingClientRect();return r.top>=70&&r.top<160;},i);}
  for(const href of ['../410/#step2','../233/#step0']){const r=await ctx.request.get(new URL(href,url).href);assert(r.ok());assert((await r.text()).includes('id="'+href.split('#')[1]+'"'));}
  checks.push(lang+': 320/390/736/1440 populated geometry, six presets; 200% CSS zoom; six deep nav targets and two related anchors');
 }
 const denied=await b.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const q=await denied.newPage();watch(q);await q.goto(url);await q.locator('[data-lang=zh]').click();await q.locator('#next').click();await q.locator('[data-lang=en]').click();assert.equal(await q.locator('#position').inputValue(),'1');assert.equal(await q.locator('#pythonCode').textContent(),source);await denied.close();
 const offline=await b.newPage();watch(offline);await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('[data-lang=en]').click();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#next').click();assert.equal(await offline.locator('#position').inputValue(),'1');await offline.close();checks.push('storage denial preserves in-memory locale; file:// works with offline source and local simulation');
 await p.goto(url);await p.locator('[data-lang=en]').click();
 const colors=await p.evaluate(()=>['body','.explain','.hint','.step-nav a','.lang-toggle button.active','.btn:disabled','a','#next','#event','#progress'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let parent=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}return{selector,color:s.color,bg};}));
 function lum(s){const v=s.match(/[\d.]+/g).slice(0,3).map(x=>{const a=Number(x)/255;return a<=.04045?a/12.92:((a+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
 const contrast=colors.map(c=>{const a=lum(c.color),b=lum(c.bg);return{...c,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});for(const c of contrast)assert(c.ratio>=4.5,JSON.stringify(c));const focusContrast=(lum('rgb(255,180,84)')+.05)/(lum('rgb(28,35,48)')+.05);assert(focusContrast>=3);
 await p.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p.locator('#next').focus();assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 await p.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});await p.setViewportSize({width:320,height:1000});for(const text of ['字'.repeat(120),'W'.repeat(120)]){await p.locator('.tagline').evaluate((e,text)=>e.textContent=text,text);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert(requests.every(x=>x.startsWith(base)||x.startsWith('file:')||x.startsWith('data:')));
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({passed:true,checks,meaning,screenshots:screens,contrast,focusContrast,cssBytes,errors,externalRequests:requests.filter(x=>!x.startsWith(base)&&!x.startsWith('file:')),zoom:'CSS layout zoom=2 at 1440; physical device/browser chrome zoom unverified'},null,2));
 console.log('PASS browser',checks.length,'groups',screens.length,'screenshots',cssBytes,'CSS bytes');await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
