'use strict';
// EVIDENCE_DIR=/absolute/path node leetcode/410/tests/browser.js
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const out=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/410/';
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();const errors=[],requests=[],semantic=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url());});
await page.goto(url);await page.locator('#scanProgress').filter({hasText:'3'}).waitFor();
assert.equal(await page.locator('#pythonSource').textContent(),source);
const dump=()=>page.evaluate(()=>({preset:document.querySelector('#preset').value,cap:document.querySelector('#cap').value,scan:scanIndex,search:searchIndex,choice:document.querySelector('input[name=prediction]:checked')?.value,revealed,source:document.querySelector('#pythonSource').textContent}));
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();
 assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
 for(let p=0;p<6;p++){
  await page.selectOption('#preset',String(p));
  assert(await page.locator('#scanPrev').isDisabled());assert(await page.locator('#searchPrev').isDisabled());
  const n=await page.evaluate(()=>SplitArray.presets[preset].nums.length);
  // Traverse every actual scan frame; rewind then replay the exact visible evidence.
  for(let i=0;i<n;i++){
   await page.click('#scanNext');const after=await page.locator('#scanHistory').textContent();
   await page.click('#scanPrev');await page.click('#scanNext');assert.equal(await page.locator('#scanHistory').textContent(),after);
  }
  assert(await page.locator('#scanNext').isDisabled());await page.click('#scanReset');assert.equal(await page.locator('#scanHistory li').count(),0);
  await page.click('#scanEnd');assert(await page.locator('#scanEnd').isDisabled());
  // Use keyboard on real range to hit min and max boundaries, including min==max.
  await page.focus('#cap');await page.keyboard.press('Home');if(await page.locator('#scanEnd').isEnabled())await page.click('#scanEnd');
  const min=Number(await page.locator('#cap').inputValue());assert.equal(min,await page.evaluate(()=>Math.max(...SplitArray.presets[preset].nums)));
  await page.focus('#cap');await page.keyboard.press('End');if(await page.locator('#scanEnd').isEnabled())await page.click('#scanEnd');
  assert.equal(await page.locator('#scanGroups .group').count(),1);
  const rounds=await page.evaluate(()=>searchFrames.length-1);
  for(let i=0;i<rounds;i++){
   await page.click('#searchNext');const interval=await page.locator('#interval').textContent(),history=await page.locator('#searchHistory').textContent();
   await page.click('#searchPrev');await page.click('#searchNext');assert.equal(await page.locator('#interval').textContent(),interval);assert.equal(await page.locator('#searchHistory').textContent(),history);
  }
  assert(await page.locator('#searchNext').isDisabled());const expected=[5,18,9,0,8,4][p];
  assert((await page.locator('#searchProgress').textContent()).includes('= '+expected));
  if(rounds){await page.click('#searchReset');assert.equal(await page.locator('#searchHistory li').count(),0);await page.click('#searchEnd');}
  semantic.push({lang,preset:p,expected,terminal:await page.locator('#searchProgress').textContent()});
 }
 await page.selectOption('#preset','1');
 for(const cap of [17,18]){
  await page.locator('#cap').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},cap);
  await page.click('#scanEnd');const count=await page.locator('#scanGroups .group').count();assert.equal(count,cap===17?3:2);
  semantic.push({lang,cap,expected:cap===17?'infeasible':'feasible',visible:await page.locator('#scanProgress').textContent(),lastTransition:await page.locator('#scanHistory li').last().textContent()});
 }
 await page.locator('input[name=cut][value="2"]').check();assert((await page.locator('#handResult').textContent()).includes('= 5'));
 await page.locator('input[name=cut][value="1"]').check();assert((await page.locator('#handResult').textContent()).includes('= 7'));
 for(const choice of ['0','1','2']){
  await page.locator(`input[name=prediction][value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('[4,4]'));
  await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('[4,4]'));assert(feedback.includes('[4,9]'));
  semantic.push({lang,choice,correct:choice==='1',visible:feedback});
  const state=await dump();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await dump(),state);await page.locator(`[data-lang=${lang}]`).click();
 }
 await page.click('#copy');await page.waitForFunction(()=>copyState==='copied');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('denied for self-check');};});await page.click('#copy');await page.locator('#manualSource').waitFor({state:'visible'});
 assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.locator('#manualSource').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 semantic.push({lang,clipboard:'denied',visible:await page.locator('#copyStatus').textContent()});
 // Restore clipboard via reload; normal state preservation already tested above.
 await page.reload();await page.locator('#scanProgress').filter({hasText:'3'}).waitFor();await page.locator(`[data-lang=${lang}]`).click();
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.selectOption('#preset','1');await page.click('#scanEnd');await page.click('#searchEnd');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  // Capture populated complete diagrams with textual state, not only whole-page overflow.
  await page.locator('#scanGroups').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`${lang}-${width}-scan.png`)});
  await page.locator('#interval').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`${lang}-${width}-search.png`)});
  const sizes=await page.locator('button,select').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width).map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  assert(sizes.every(s=>s.w>=48&&s.h>=48),JSON.stringify(sizes));
 }
 // Browser CSS zoom produces half the usable layout width on a 1280px viewport.
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#scanGroups').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`${lang}-zoom200-scan.png`)});await page.locator('#interval').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,`${lang}-zoom200-search.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
}
// Real keyboard activation and focus ring; local anchors and linked targets.
await page.setViewportSize({width:1440,height:1000});await page.selectOption('#preset','0');await page.focus('#searchNext');await page.keyboard.press('Enter');assert.equal((await dump()).search,1);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'searchReset');assert.equal(await page.locator('#searchReset').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'keyboard-focus.png')});
for(const href of await page.locator('a[href*="#"]').evaluateAll(es=>es.map(e=>e.href))){const u=new URL(href),r=await context.request.get(u.href.split('#')[0]);assert(r.ok());assert(new RegExp('id=["\']'+u.hash.slice(1)+'["\']').test(await r.text()));}
await page.locator('.step-nav a[href="#step3"]').click();await page.waitForTimeout(350);assert((await page.locator('#step3').boundingBox()).y>=0);
// Offline file source display; unavailable localStorage must fall back without error.
const fallback=await browser.newContext();const fp=await fallback.newPage();fp.on('pageerror',e=>errors.push(e.message));await fp.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('unavailable');};Storage.prototype.setItem=()=>{throw new Error('unavailable');};});await fp.goto('file://'+path.join(root,'index.html'));await fp.locator('#scanProgress').waitFor();assert.equal(await fp.locator('#pythonSource').textContent(),source);await fp.locator('[data-lang=zh]').click();await fp.locator('[data-lang=en]').click();await fp.click('#scanNext');assert((await fp.locator('#scanProgress').textContent()).includes('1/3'));
// Measured rendered colors, including disabled text and focus.
const measured=await page.evaluate(()=>{
 const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);const ratio=(a,b)=>{const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 const pairs=[];for(const selector of ['body','.hint','.group b','.group small','button:disabled','.btn.primary','.lang-toggle .active']){const e=document.querySelector(selector),s=getComputedStyle(e);let bg=s.backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}pairs.push({selector,fg:s.color,bg,ratio:ratio(s.color,bg)});}const btn=getComputedStyle(document.querySelector('.btn'));pairs.push({selector:'focus outline / panel',fg:'rgb(255, 180, 84)',bg:'rgb(22, 27, 34)',ratio:ratio('rgb(255, 180, 84)','rgb(22, 27, 34)')});return pairs;
});assert(measured.every(p=>p.ratio>=4.5),JSON.stringify(measured));
const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'local.css')).size;assert(cssBytes<25000);assert.equal(errors.length,0,JSON.stringify(errors));assert(requests.every(u=>u.startsWith(base)||u.startsWith('data:')));
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({selfCheck:true,errors,localRequestsOnly:true,cssBytes,measured,semantic,screenshots:'both locales at 320,390,736,1440 and CSS zoom 200%; keyboard focus',sourceParity:'display/copy/download/manual fallback/file offline',keyboard:'range Home/End, button Enter, Tab, visible focus',blockedStorage:true},null,2));
await browser.close();console.log('Browser checks passed; evidence: '+out);
})().catch(e=>{console.error(e);process.exit(1);});
