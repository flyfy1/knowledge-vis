const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const origin=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=origin+'/leetcode/354/';
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage(),errors=[],bad=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push(r.url()+':'+r.status());});
await page.goto(url);await page.locator('#progress').filter({hasText:/0\/3/}).waitFor();
const text=id=>page.locator('#'+id).innerText();
async function locale(l){await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
async function noOverflow(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow');}
for(const lang of ['en','zh']){
 await locale(lang);await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isHidden());
 for(let p=0;p<6;p++)for(const mode of ['valid','wrong']){
  await page.selectOption('#preset',String(p));await page.selectOption('#sort',mode);
  assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  await page.locator('#next').click();const snap=await text('ledger');await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await text('ledger'),snap);
  if(await page.locator('#end').isEnabled())await page.locator('#end').click();assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  assert.equal(await page.locator('#ledger li').count(),require('../core.js').presets[p].length);
  assert.equal(await page.locator('#warning').isVisible(),mode==='wrong');
  const end=await text('ledger');await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await text('ledger'),end);
  await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
 }
 await page.selectOption('#sort','valid');await page.selectOption('#preset','2');await page.locator('#end').click();assert((await text('progress')).includes('1'));
 await page.selectOption('#sort','wrong');await page.locator('#end').click();assert((await text('progress')).includes('2'));
 await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-wrong-sort.png`),style:'.step-nav {visibility:hidden}'});
 for(const value of ['4','3','2']){
  await page.locator(`input[value="${value}"]`).check();assert(!(await text('feedback')).includes('[]→[4]'));
  await page.locator('#reveal').click();assert((await text('feedback')).includes('[]→[4]→[2]→[2,3]→[2,3,5]'));
  const stored=await text('ledger');await locale(lang==='en'?'zh':'en');assert(await page.locator(`input[value="${value}"]`).isChecked());assert((await text('feedback')).includes('[]→[4]'));assert.equal(await page.locator('#sort').inputValue(),'wrong');await locale(lang);assert.equal(await text('ledger'),stored);
 }
 await page.locator('#step3 .stage').screenshot({path:path.join(out,`${lang}-prediction.png`),style:'.step-nav {visibility:hidden}'});
 checks.push(lang+': all presets, sort modes, endpoints, reversible snapshots, prediction options and locale persistence');
}
// Clipboard success and actual source parity.
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');assert.equal(await page.locator('#pythonSource').textContent(),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
await page.locator('#copy').click();await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denied');}}}));
await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'visible'});assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');assert.equal(await page.evaluate(()=>{let e=document.querySelector('#manualSource');return e.selectionEnd-e.selectionStart;}),source.length);
for(const l of ['zh','en']){await locale(l);assert((await text('copyStatus')).includes(l==='zh'?'手动':'manual'));}
checks.push('actual clipboard success/readback, forced denial/manual selection, display/mirror/download exact parity');
// Real keyboard and deep links; focus must remain on locale button after rerender.
await page.locator('[data-lang=zh]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'zh');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.matches('.official-link')));await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement.matches('.step-nav a')));
await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(250);assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=0));
await page.locator('#preset').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await text('progress')).includes('1/'));
const focus=await page.locator('#next').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.outline,'solid');assert.equal(focus.width,'3px');
// Screenshot populated states across required widths, both locales.
for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
 await page.setViewportSize({width,height:1000});await locale(lang);await page.selectOption('#preset','4');await page.selectOption('#sort','valid');await page.locator('#end').click();await noOverflow();
 await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-trace.png`),style:".step-nav {visibility:hidden}"});
 if(width===1440){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-desktop.png`)});}
 // All primary controls >=48, text labels fit in cards.
 assert(await page.locator('button,select').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.width>=48&&r.height>=48;})));
}
// CSS zoom scales real layout: 1440 physical pixels leaves 720 CSS-pixel layout width.
await page.setViewportSize({width:1440,height:1200});
for(const lang of ['en','zh']){await locale(lang);await page.evaluate(()=>document.documentElement.style.zoom='2');await noOverflow();await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-zoom200.png`),style:".step-nav {visibility:hidden}"});await page.evaluate(()=>document.documentElement.style.zoom='');}
// Actual internal target files/anchors are reachable. Check all internal links.
for(const href of await page.locator('a').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){
 if(href.startsWith('http'))continue;const target=new URL(href,url);const response=await context.request.get(target.href.split('#')[0]);assert(response.ok(),href);if(target.hash){assert((await response.text()).includes(`id="${target.hash.slice(1)}"`),href);}
}
// Measure rendered foreground/background pairs used by this lesson.
assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(28, 35, 48)');
const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good','bad'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
function lum(c){const a=c.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
const contrast=[];for(const fg of ['text','muted','accent','accent2','good','bad'])for(const bg of ['bg','panel','panel2']){const a=lum(colors[fg]),b=lum(colors[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);contrast.push({fg,bg,ratio});assert(ratio>=4.5,`${fg}/${bg}: ${ratio}`);}
assert((lum(colors.accent2)+.05)/(lum(colors.panel2)+.05)>=3);
const css=fs.statSync(path.join(P,'../style.css')).size+fs.statSync(path.join(P,'local.css')).size;assert(css<25000);
// Storage unavailable and offline source: block all networking after initial load, reload is not required.
const restricted=await browser.newContext();await restricted.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage blocked');}});});const rp=await restricted.newPage();await rp.goto(url);await rp.locator('#progress').filter({hasText:/0\/3/}).waitFor();await rp.locator('[data-lang=zh]').click();assert.equal(await rp.locator('html').getAttribute('lang'),'zh-CN');await restricted.route('**/*',route=>route.abort());await rp.locator('#copy').click();assert.equal(await rp.locator('#pythonSource').textContent(),source);await restricted.close();
// Also load file:// to prove no runtime fetch required for code or trace.
const offline=await browser.newPage();await offline.goto('file://'+path.join(P,'index.html'));await offline.locator('#progress').filter({hasText:/0\/3/}).waitFor();assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.locator('#end').click();assert(await offline.locator('#next').isDisabled());await offline.close();
assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
checks.push('both locales at 320/390/736/1440 and CSS zoom 200%; keyboard/focus; internal anchors; blocked storage; offline file opening');
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author self-check',checks,errors,bad,cssBytes:css,contrast,focus,zoomMethod:'CSS zoom:2 at 1440 viewport; actual layout reflow, plus 320 narrow viewport'},null,2));
await browser.close();console.log('Browser self-check passed');
})().catch(e=>{console.error(e);process.exit(1);});
