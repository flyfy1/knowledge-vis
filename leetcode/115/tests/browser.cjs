const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
let launched;
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18777')+'/leetcode/115/';
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
launched=browser;
const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}});
await context.addInitScript(()=>{localStorage.setItem('knowledge-lang','en');});
const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());requests.push(r.url());});
await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0/'));
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
assert.equal(await page.locator('#pythonCode').textContent(),source);
await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(url).origin});
await page.locator('#copy').click();await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent==='Copied.');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
const results=[];
const expected=[[1,0,0],[1,0,0],[1,1,0],[1,1,1],[1,2,1],[1,2,3],[1,3,3],[1,3,3]];
for(let i=0;i<expected.length;i++){
 assert.deepEqual(await page.locator('#array .dp-cell b').allTextContents(),expected[i].map(String));
 if(i<expected.length-1)await page.locator('#next').click();
}
assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(22, 27, 34)');

async function lang(locale){await page.locator(`[data-lang="${locale}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'zh-CN':'en');}
async function end(){await page.locator('#position').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));});}
async function snap(){return await page.locator('#array').innerText()+'\n'+await page.locator('#dpTable').innerText();}
for(const locale of ['en','zh']){
 await lang(locale);
 for(let preset=0;preset<8;preset++){
  await page.selectOption('#preset',String(preset));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  const init=await snap();await page.locator('#next').click();const next=await snap();await page.locator('#prev').click();assert.equal(await snap(),init);await page.locator('#next').click();assert.equal(await snap(),next);
  await end();assert(await page.locator('#next').isDisabled());const final=await page.locator('#array .dp-cell b').last().textContent();assert.equal(Number(final),[3,0,3,5,0,1,0,1][preset]);
  await page.locator('#prev').click();await page.locator('#next').click();assert.equal(Number(await page.locator('#array .dp-cell b').last().textContent()),Number(final));
  await page.locator('#reset').click();assert.equal(await snap(),init);results.push(`${locale} preset ${preset} endpoints/replay`);
 }
 for(let choice=0;choice<3;choice++){
  await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes('4'));
  const before=await page.locator('#feedback').textContent();await lang(locale==='en'?'zh':'en');assert(await page.locator(`[name="prediction"][value="${choice}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await lang(locale);assert.equal(await page.locator('#feedback').textContent(),before);
 }
 await page.locator('[name="prediction"][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 await page.fill('#inputS','ababa');await page.fill('#inputT','aba');await page.locator('#customForm button').click();await end();assert.equal(await page.locator('#array .dp-cell b').last().textContent(),'4');
 await page.fill('#inputS','aaaaaaaaaa');await page.fill('#inputT','aaaaa');await page.locator('#customForm button').click();await end();assert.equal(await page.locator('#array .dp-cell b').last().textContent(),'252');
 await page.fill('#inputS','aaaaaaaaaaa');const maxSaved=await snap();await page.locator('#customForm button').click();assert.equal(await snap(),maxSaved);
 await page.fill('#inputS','a!');const saved=await snap();await page.locator('#customForm button').click();assert.equal(await snap(),saved);assert(await page.locator('#validation').isVisible());
 await page.fill('#inputS','');await page.fill('#inputT','');await page.locator('#customForm button').click();await end();assert.equal(await page.locator('#array .dp-cell b').last().textContent(),'1');
 await page.selectOption('#preset','0');await page.locator('#next').click();const state=await snap();await lang(locale==='en'?'zh':'en');await lang(locale);assert.equal(await snap(),state);
 // Both clipboard paths use exact source. Denial exposes manual field and focus.
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testClipboard=text;}}});});
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.testClipboard),source);assert(await page.locator('#manualCopy').isHidden());
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});});
 await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 const dlPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await dlPromise;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);
 await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.locator('#sourceDetails summary').click();assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await lang(locale==='en'?'zh':'en');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await lang(locale);
 // Navigation target remains below sticky nav.
 await page.locator('a[href="#step2"]').click();await page.waitForTimeout(500);assert((await page.locator('#step2').boundingBox()).y>=0);
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.selectOption('#preset','2');await end();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} overflow ${width}`);
  assert(await page.locator('#array .dp-cell').first().evaluate(e=>e.getBoundingClientRect().width>=100));
  await page.locator('#message').scrollIntoViewIfNeeded();await page.waitForTimeout(120);await page.screenshot({path:path.join(out,`${locale}-${width}.png`),fullPage:false});
 }
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#message').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`zoom overflow ${width}`);await page.waitForTimeout(120);await page.screenshot({path:path.join(out,`${locale}-zoom200-${width}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.setViewportSize({width:1440,height:1100});await page.reload();await page.locator(`[data-lang="${locale}"]`).click();await page.selectOption('#preset','0');await page.locator('#position').evaluate(e=>{e.value=3;e.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#message').scrollIntoViewIfNeeded();await page.waitForTimeout(120);await page.screenshot({path:path.join(out,`${locale}-causal.png`)});
 await page.waitForTimeout(120);await page.locator('#tableWrap').screenshot({path:path.join(out,`${locale}-table.png`)});
 await page.locator('#step0').scrollIntoViewIfNeeded();await page.waitForTimeout(120);await page.screenshot({path:path.join(out,`${locale}-hand.png`)});
}
// Genuine keyboard action + focus geometry and computed outline.
await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/'));
await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
const focus=await page.locator('#reset').evaluate(e=>({outline:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.outline,'3px');
await page.locator('#position').focus();await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
const sizes=await page.locator('button,select,input:not([type="radio"]),summary,a[download]').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(sizes.every(s=>s.h>=48&&s.w>=48));
// Deep links and local assets resolve without editing anything shared.
for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>h.startsWith('../')))){
 const full=new URL(href,url),res=await context.request.get(full.href);assert.equal(res.status(),200);if(full.hash)assert((await res.text()).includes(`id="${full.hash.slice(1)}"`));
}
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});});const p2=await denied.newPage();p2.on('pageerror',e=>errors.push(String(e)));await p2.goto(url);await p2.locator('[data-lang="zh"]').click();assert((await p2.locator('#progress').textContent()).includes('0/'));await p2.locator('[data-lang="en"]').click();assert((await p2.locator('#progress').textContent()).includes('0/'));await p2.close();
// Offline display uses no source fetch.
const offline=await context.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
const colors=await page.evaluate(()=>{const c=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good','bad'].map(k=>[k,c.getPropertyValue('--'+k).trim()]));});
function lum(hex){return hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
const contrast=[];for(const fg of ['text','muted','accent','accent2','good','bad'])for(const bg of ['bg','panel','panel2']){const a=lum(colors[fg]),b=lum(colors[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);contrast.push({fg,bg,ratio:Number(ratio.toFixed(2))});}
const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18777')));
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({status:'passed',results,viewports:[320,390,736,1440],zoom:'200% CSS zoom at 320,390,1440, actual browser layout and screenshots',keyboard:focus,cssBytes,contrast,errors,sourceParity:'display + clipboard + fallback + download + offline',scope:'Author browser self-check; no independent acceptance or real-device claim'},null,2));
await browser.close();console.log('Browser checks passed');
})().catch(async e=>{console.error(e);if(launched)await launched.close();process.exitCode=1;});
