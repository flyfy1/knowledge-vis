// OUTPUT_DIR redirects reports and screenshots; BASE_URL overrides the existing preview.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status());});page.on('request',r=>assert(r.url().startsWith('http://127.0.0.1:18770/')||r.url().startsWith('data:')));
await page.goto((process.env.BASE_URL||'http://127.0.0.1:18770')+'/leetcode/460/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');assert.equal(await page.locator('#pythonSource').textContent(),source);
const log=[];
for(const lang of ['en','zh']){
 await page.locator(`[data-lang="${lang}"]`).click();
 await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());await page.locator('#handReveal').click();assert(!(await page.locator('#handAnswer').isVisible()));
 for(let p=0;p<4;p++){
  await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());const n=await page.evaluate(p=>LFULesson.presets[p].ops.length,p);
  for(let i=0;i<n;i++){await page.locator('#next').click();const a=await page.locator('#afterBuckets').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#afterBuckets').textContent(),a);}
  assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#ledger li').count(),n);
  await page.locator('#reset').click();assert(await page.locator('#reset').isDisabled());await page.locator('#end').click();await page.locator('#prev').click();log.push({lang,preset:p,operation:await page.locator('#operation').textContent()});
 }
 for(const opt of ['0','1','2']){
  await page.locator(`[name="prediction"][value="${opt}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'All three':'三个键'));await page.locator('#reveal').click();assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'All three':'三个键'));
 }
 const saved=await page.locator('#progress').textContent();await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator('[name="prediction"][value="2"]').isChecked());await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('#progress').textContent(),saved);
 await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#prev').click();
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('a[href="#step2"]').first().click();await page.waitForTimeout(350);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const bucketBoxes=await page.locator('#afterBuckets .bucket').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth})));assert(bucketBoxes.every(b=>b.scroll<=b.width));
  await page.screenshot({path:path.join(out,`${lang}-${width}.png`)});await page.locator('.snapshots').screenshot({path:path.join(out,`${lang}-${width}-buckets.png`)});
 }
 // CSS zoom at 200% exercises doubled text and reduced usable layout space.
 await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('a[href="#step2"]').first().click();await page.waitForTimeout(250);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>{const e=document.querySelector('.snapshots');scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20)});await page.screenshot({path:path.join(out,`${lang}-zoom200-buckets.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
}
await page.setViewportSize({width:1440,height:1000});
await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
await page.evaluate(()=>{window.copiedText='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>window.copiedText=s}})});await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.copiedText),source);
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denial')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');
const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
await page.locator('#reset').click();await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');const outline=await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth);assert.equal(outline,'3px');
for(const a of await page.locator('a[href*="#step"]').all()){const href=await a.getAttribute('href');if(href.startsWith('#'))assert(await page.locator(href).count());else{const url=new URL(href,page.url());const r=await context.request.get(url.href.split('#')[0]);assert(r.ok());assert((await r.text()).includes('id="'+url.hash.slice(1)+'"'));}}
const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await offline.close();
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}})});const bp=await blocked.newPage();await bp.goto(page.url().split('#')[0]);await bp.locator('[data-lang="zh"]').click();assert.equal(await bp.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
// WCAG sRGB contrasts, measured token pairs used on all rendered panels.
const rgb=h=>h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);const lum=h=>rgb(h).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const contrasts={};for(const fg of ['e8edf4','9aa7b8','6ee7ff','ffb454','7ee2a8'])for(const bg of ['0d1117','161b22','1c2330']){const n=ratio(fg,bg);contrasts[`${fg}/${bg}`]=+n.toFixed(2);assert(n>=4.5);}contrasts.focus=+ratio('ffb454','1c2330').toFixed(2);
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({status:'pass',presets:log,viewports:[320,390,736,1440],zoom:'200% CSS zoom at 780px viewport',sourceDisplayCopyDownloadParity:true,clipboardFallback:true,blockedStorage:true,focusOutline:outline,contrasts,errors},null,2));await browser.close();console.log('Browser checks pass');
})().catch(e=>{console.error(e);process.exit(1)});
