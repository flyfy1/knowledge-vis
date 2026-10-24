const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/466/',core=require('../core.js'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),errors=[],requests=[],checks=[],screens=[];
// Inspect syntax before evaluating: duplicated localization keys must not be silently overwritten.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),ast=acorn.parse(copy,{ecmaVersion:'latest'});
function unique(n){if(!n||typeof n!=='object')return;if(n.type==='ObjectExpression'){const keys=n.properties.map(x=>x.key.name||x.key.value);assert.equal(new Set(keys).size,keys.length);}Object.values(n).forEach(v=>Array.isArray(v)?v.forEach(unique):unique(v));}unique(ast);
const env={window:{}};vm.runInNewContext(copy,env);Object.values(env.window.LESSON_COPY).forEach(v=>assert(v.length===2&&v.every(s=>typeof s==='string'&&s.length)));
const log=s=>checks.push(s);
async function state(p){return p.evaluate(()=>['block','j','count'].map(k=>+document.getElementById(k+'Value').textContent));}
async function shot(p,name,selector='.stage'){await p.locator(selector).evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await p.evaluate(()=>scrollBy({top:-document.querySelector('.step-nav').offsetHeight-16,behavior:'instant'}));if(selector==='.stage')await p.screenshot({path:path.join(out,name+'.png')});else await p.locator(selector).screenshot({path:path.join(out,name+'.png')});screens.push(name+'.png');}
function watch(p){p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url());});p.on('requestfailed',r=>errors.push('Failed '+r.url()));}
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true}),p=await ctx.newPage();watch(p);
for(const lang of ['en','zh']){
 await p.goto(url);await p.locator(`[data-lang=${lang}]`).click();await p.waitForFunction(()=>document.getElementById('blockValue').textContent==='0');
 assert(await p.locator('#reveal').isDisabled());assert(await p.locator('#feedback').isHidden());
 for(const e of await p.locator('button,select,.back-link,.official-link,.step-nav a').all()){const r=await e.boundingBox();assert(r.width>=48&&r.height>=48,'48px target: '+await e.textContent());}
 for(let preset=0;preset<core.presets.length;preset++){
  await p.selectOption('#preset',String(preset));const frames=core.trace(...core.presets[preset]);
  for(let i=0;i<frames.length;i++){
   assert.deepEqual(await state(p),[frames[i].block,frames[i].j,frames[i].count]);assert.equal(await p.locator('#history tr').count(),i+1);
   if(frames[i].kind==='char')assert((await p.locator('#decision').textContent()).includes(lang==='en'?(frames[i].match?'take it':'skip it'):(frames[i].match?'接收':'跳过')));
   if(i<frames.length-1)await p.locator('#next').click();
  }
  assert(await p.locator('#next').isDisabled());assert(await p.locator('#end').isDisabled());
  for(let i=frames.length-2;i>=0;i--){await p.locator('#prev').click();assert.deepEqual(await state(p),[frames[i].block,frames[i].j,frames[i].count]);}
  assert(await p.locator('#prev').isDisabled());assert(await p.locator('#reset').isDisabled());
  await p.locator('#end').click();assert.deepEqual(await state(p),[frames.at(-1).block,frames.at(-1).j,frames.at(-1).count]);await p.locator('#reset').click();assert.deepEqual(await state(p),[0,0,0]);
 }
 log(lang+': all 7 presets, every forward/back frame, retained history, reset/end/disabled endpoints; match/mismatch semantic copy');
 await p.locator('#position').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#position').inputValue(),'1');await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('#position').inputValue(),'0');
 for(const choice of ['0','1','2']){
  await p.locator(`input[name=prediction][value="${choice}"]`).check();assert(await p.locator('#feedback').isHidden());await p.locator('#reveal').click();assert((await p.locator('#feedback').textContent()).includes('⌊3/2⌋=1'));
  const s=await state(p);await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await state(p),s);assert(await p.locator(`input[name=prediction][value="${choice}"]`).isChecked());assert(await p.locator('#feedback').isVisible());await p.locator(`[data-lang=${lang}]`).click();
 }
 await p.locator('input[name=prediction][value="0"]').check();assert(await p.locator('#feedback').isHidden());await p.locator('#reveal').click();await p.selectOption('#preset','3');assert(await p.locator('#feedback').isVisible());await p.locator('#end').click();await shot(p,lang+'-jump-final');
 log(lang+': prediction before reveal, all options, changing clears feedback, locale preserves answer/reveal/trace; presets independent');
 await p.locator('#sourceDetails summary').click();assert.equal(await p.locator('#pythonCode').textContent(),source);
 await p.locator('#copy').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
 const dp=p.waitForEvent('download');await p.locator('a[download]').click();const dl=await dp;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));await p.locator('#copy').click();assert(await p.locator('#manualCopy').isVisible());assert.equal(await p.locator('#copyText').inputValue(),source);assert.equal(await p.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await p.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 assert((await p.locator('#copyStatus').textContent()).includes(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await p.locator('#manualCopy').isVisible());await p.locator(`[data-lang=${lang}]`).click();await shot(p,lang+'-copy-fallback','#manualCopy');
 log(lang+': displayed/copied/downloaded exact source; denied clipboard focuses selected complete source; fallback remains localized across locale');
 await p.selectOption('#preset','1');await p.locator('#next').click();await p.locator('#next').click();await p.locator('#next').click();
 for(const width of [320,390,736,1440]){
  await p.setViewportSize({width,height:1000});await p.locator('.step-nav a[href="#step2"]').click();await p.waitForTimeout(1000);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert(await p.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=70),'step2 top '+await p.locator('#step2').evaluate(e=>e.getBoundingClientRect().top));
  await shot(p,`${lang}-${width}-trace`);await shot(p,`${lang}-${width}-state`,'.state-grid');
  for(const card of await p.locator('.state').all()){const g=await card.evaluate(e=>({a:e.querySelector('span').getBoundingClientRect().bottom,b:e.querySelector('b').getBoundingClientRect().top,sw:e.scrollWidth,cw:e.clientWidth}));assert(g.a<=g.b+1&&g.sw<=g.cw+1);}
  await p.locator('#historyWrap').focus();await p.keyboard.press('ArrowRight');if(width<=390){await shot(p,`${lang}-${width}-history-left`,'#historyWrap');await p.locator('#historyWrap').evaluate(e=>e.scrollLeft=e.scrollWidth);await shot(p,`${lang}-${width}-history-right`,'#historyWrap');}
 }
 await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');await shot(p,lang+'-zoom200');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.evaluate(()=>document.documentElement.style.zoom='1');
 await p.locator('#next').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#position').inputValue(),'4');assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 for(let i=0;i<5;i++){await p.locator(`.step-nav a[href="#step${i}"]`).click();await p.waitForTimeout(1000);assert(await p.locator('#step'+i).evaluate(e=>{const y=e.getBoundingClientRect().top;return y<150&&e.querySelector('h2').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom;}),'anchor '+i+' y='+await p.locator('#step'+i).evaluate(e=>e.getBoundingClientRect().top));}
 for(const href of ['../10/#step1','../44/#step2']){const r=await ctx.request.get(new URL(href,url).href);assert(r.ok());assert((await r.text()).includes('id="'+href.split('#')[1]+'"'));}
 log(lang+': 320/390/736/1440 geometry and screenshots, 200% CSS layout zoom, keyboard slider/button/focus, all deep navigation and related targets');
}
const isolated=await browser.newContext();await isolated.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const noStore=await isolated.newPage();watch(noStore);await noStore.goto(url);await noStore.locator('[data-lang=zh]').click();await noStore.locator('#next').click();const before=await state(noStore);await noStore.locator('[data-lang=en]').click();assert.deepEqual(await state(noStore),before);assert.equal(await noStore.locator('#pythonCode').textContent(),source);await isolated.close();log('blocked localStorage: in-memory locale works and preserves trace; embedded source needs no source request');
await p.goto(url);await p.locator('[data-lang=en]').click();
const colors=await p.evaluate(()=>['body','.explain','.hint','.step-nav a','.lang-toggle button.active','.btn:disabled','.state','.state span','.state b','th','a','#next'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let parent=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}return{selector,color:s.color,bg};}));
function lum(s){const a=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
const contrast=colors.map(c=>{const a=lum(c.color),b=lum(c.bg);return{...c,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});contrast.forEach(c=>assert(c.ratio>=4.5,JSON.stringify(c)));
const focusContrast=(lum('rgb(255,180,84)')+.05)/(lum('rgb(28,35,48)')+.05);assert(focusContrast>=3);
await p.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p.locator('#next').focus();await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');await p.emulateMedia({forcedColors:'none'});
await p.setViewportSize({width:320,height:1000});for(const text of ['W'.repeat(120),'字'.repeat(120)]){await p.locator('.tagline').evaluate((e,t)=>e.textContent=t,text);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base)));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({status:'pass',checks,contrast,focusContrast,cssBytes,screens,errors,externalRequests:requests.filter(u=>!u.startsWith(base)),zoom:'CSS zoom=2; physical devices and browser chrome zoom untested'},null,2));console.log({status:'pass',checks:checks.length,screens:screens.length,cssBytes});await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
