const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const core=require('../core.js');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18790/leetcode/188/';
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({acceptDownloads:true,reducedMotion:'reduce'});const page=await context.newPage();const errors=[],requests=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+' '+r.status());});page.on('request',r=>requests.push(r.url()));
await page.goto(url);assert(await page.locator('#reveal').isDisabled());await page.locator('#progress').filter({hasText:'0/4'}).waitFor();
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
assert.strictEqual(await page.locator('#pythonCode').textContent(),source);
let presetVisits=0;
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();
 assert.strictEqual(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');
 for(let i=0;i<8;i++){
  await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  const max=+(await page.locator('#position').getAttribute('max'));
  for(let d=1;d<=max;d++){
   await page.locator('#next').click();
   const frame=core.trace(core.presets[i])[d];
   const got=await page.locator('.state-card .result').allTextContents();
   assert.deepStrictEqual(got.map(x=>Number(x.split(':').at(-1).trim().replace('−','-'))),frame.values);
   const candidate=await page.locator('.state-card p:nth-child(3)').allTextContents();
   candidate.forEach((text,j)=>assert.strictEqual(Number(text.split('=').at(-1).trim().replace('−','-').replace('-∞','-Infinity')),frame.candidates[j]));
  }
  assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  assert.strictEqual(await page.locator('#ledger tr').count(),max+1);
  const terminal=await page.locator('#transition').textContent();
  await page.locator('#prev').click();await page.locator('#next').click();assert.strictEqual(await page.locator('#transition').textContent(),terminal);
  await page.locator('#reset').click();assert.strictEqual(await page.locator('#ledger tr').count(),1);
  await page.locator('#end').click();assert(await page.locator('#next').isDisabled());
  await page.locator('#position').fill('1');assert.strictEqual(await page.locator('#ledger tr').count(),2);presetVisits++;
 }
 for(let i=0;i<3;i++){
  await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes('6'));
 }
 const before=await page.locator('#position').inputValue();await page.locator('#sourceDetails summary').click();
 await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.strictEqual(await page.locator('#position').inputValue(),before);assert(await page.locator('#feedback').isVisible());assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 await page.locator(`[data-lang=${lang}]`).click();await page.locator('#sourceDetails summary').click();
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.testCopied=text;}}}));await page.locator('#copy').click();assert.strictEqual(await page.evaluate(()=>window.testCopied),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.strictEqual(await page.locator('#copyText').inputValue(),source);assert.strictEqual(await page.evaluate(()=>document.activeElement.id),'copyText');
 const dl=page.waitForEvent('download');await page.locator('a[download]').click();const download=await dl;assert.strictEqual(fs.readFileSync(await download.path(),'utf8'),source);
 await page.screenshot({path:path.join(OUT,`${lang}-copy-fallback.png`),fullPage:false});
 // Keyboard action changes state without a pointer.
 await page.locator('#reset').click();await page.locator('#next').focus();await page.keyboard.press('Enter');assert.strictEqual(await page.locator('#position').inputValue(),'1');
 await page.keyboard.press('Tab');assert.strictEqual(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Shift+Tab');assert.strictEqual(await page.evaluate(()=>document.activeElement.id),'next');const focus=await page.locator('#next').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.strictEqual(focus.width,'3px');
 await page.selectOption('#preset','0');await page.locator('#end').click();
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:900});if(await page.locator('#end').isEnabled())await page.locator('#end').click();await page.locator('a[href="#step2"]').click();await page.waitForTimeout(100);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} width ${width}`);
  const target=await page.locator('#step2').boundingBox();assert(target.y>=65&&target.y<=110,`sticky anchor geometry ${lang} ${width}: ${target.y}`);const heights=await page.locator('button,select,input[type=range],.prediction-options label').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>e.getBoundingClientRect().height));assert(heights.every(h=>h>=48));const cards=await page.locator('.state-card').evaluateAll(es=>es.map(e=>({w:e.clientWidth,scroll:e.scrollWidth})));assert(cards.every(c=>c.scroll<=c.w));
  await page.locator('#position').fill('3');await page.locator('#transition').evaluate(e=>{e.scrollIntoView({block:'start'});window.scrollBy(0,-document.querySelector('.step-nav').getBoundingClientRect().height-12);});await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`)});await page.locator('#end').click();await page.locator('#ledgerWrap').evaluate(e=>{e.scrollIntoView({block:'start'});window.scrollBy(0,-document.querySelector('.step-nav').getBoundingClientRect().height-12);});await page.screenshot({path:path.join(OUT,`${lang}-${width}-ledger.png`)});if(width<736){await page.locator('#ledgerWrap').focus();await page.keyboard.press('ArrowRight');await page.locator('#ledgerWrap').evaluate(e=>e.scrollLeft=e.scrollWidth);assert(await page.locator('#ledgerWrap').evaluate(e=>e.scrollLeft>0));await page.screenshot({path:path.join(OUT,`${lang}-${width}-ledger-right.png`)});}
 }
 // Chromium CSS zoom reproduces 200% page magnification with unchanged viewport.
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('a[href="#step2"]').click();await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#position').fill('3');await page.locator('#transition').evaluate(e=>{e.scrollIntoView({block:'start'});window.scrollBy(0,-document.querySelector('.step-nav').getBoundingClientRect().height-12);});await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.evaluate(()=>document.body.style.zoom='');
 await page.setViewportSize({width:390,height:900});await page.locator('a[href="#step3"]').click();await page.screenshot({path:path.join(OUT,`${lang}-prediction.png`)});await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(100);assert.strictEqual(await page.locator('.step-nav a.active').getAttribute('href'),'#step0');await page.screenshot({path:path.join(OUT,`${lang}-header.png`)});
}
// Additional reading-path captures at phone size.
for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();for(const [id,label] of [['step0','hand'],['step1','derivation'],['step4','proof']]){await page.locator(`a[href="#${id}"]`).click();await page.screenshot({path:path.join(OUT,`${lang}-${label}.png`)});}await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('#pythonCode').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-source.png`)});await page.locator('#sourceDetails').evaluate(e=>e.open=false);}
// Measured rendered colors: sample text/surfaces, borders, selected controls and focus.
await page.locator('#end').click();
const samples=await page.evaluate(()=>{const sels=['.site-head','.explain','.hint','.state-card','.state-card .result','.state-card .decision','.price small','.active-row','.btn.primary','.btn:disabled','.lang-toggle button.active','.step-nav a.active','select'];function bg(e){for(let n=e;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return 'rgb(13, 17, 23)';}return sels.map(s=>{const e=document.querySelector(s);return {selector:s,fg:getComputedStyle(e).color,bg:bg(e)};});});
function lum(c){const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
const contrasts=samples.map(s=>({...s,ratio:(Math.max(lum(s.fg),lum(s.bg))+.05)/(Math.min(lum(s.fg),lum(s.bg))+.05)}));assert(contrasts.every(s=>s.ratio>=4.5),JSON.stringify(contrasts));
await page.locator('#prev').focus();await page.keyboard.press('Tab');const focusPair=await page.evaluate(()=>{const e=document.activeElement;if(getComputedStyle(e).outlineWidth!=='3px')throw Error('keyboard outline missing');let n=e.parentElement;while(n&&getComputedStyle(n).backgroundColor==='rgba(0, 0, 0, 0)')n=n.parentElement;return {fg:getComputedStyle(e).outlineColor,bg:getComputedStyle(n).backgroundColor};});const focusRatio=(lum(focusPair.fg)+.05)/(lum(focusPair.bg)+.05);assert(focusRatio>=3);
// Local and related targets exist, including their fragment anchors.
for(const href of await page.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
 if(href.startsWith('https:'))continue;const u=new URL(href,url),r=await context.request.get(u.href.split('#')[0]);assert(r.ok(),u.href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),u.href);
}
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('a[href="#step2"]').click();await page.locator('#position').fill('3');await page.locator('#transition').evaluate(e=>{e.scrollIntoView({block:'start'});window.scrollBy(0,-document.querySelector('.step-nav').getBoundingClientRect().height-12);});await page.screenshot({path:path.join(OUT,'forced-colors.png')});
// Storage denial and offline source do not block initialization.
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('blocked')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('blocked')}});});const dpage=await denied.newPage();await dpage.goto(url);await dpage.locator('#next').click();await dpage.locator('[data-lang=zh]').click();assert.strictEqual(await dpage.locator('#position').inputValue(),'1');await denied.close();
await context.setOffline(true);await page.locator('#sourceDetails summary').click();assert.strictEqual(await page.locator('#pythonCode').textContent(),source);await context.setOffline(false);
assert.deepStrictEqual(errors,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18790/')||u.startsWith('data:')));
const cssBytes=fs.statSync(path.join(P,'../style.css')).size+fs.statSync(path.join(P,'style.css')).size;assert(cssBytes<25000);
fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({presetVisits,locales:['en','zh'],widths:[320,390,736,1440],zoom:'CSS zoom 2 at 1280px',sourceParity:true,renderedDailyValuesAndCandidates:true,copySuccessAndFallback:true,storageDenied:true,offlineSource:true,errors,cssBytes,contrasts,focusPair,focusRatio},null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
