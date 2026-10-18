const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const core=require(path.join(ROOT,'core.js'));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],bad=[],external=[];let assertions=0;
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)bad.push(r.url())});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18784')&&!r.url().startsWith('data:'))external.push(r.url())});
 await page.goto('http://127.0.0.1:18784/leetcode/140/');await page.locator('#progress').filter({hasText:/0/}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<core.presets.length;p++){
   await page.selectOption('#preset',String(p));const frames=core.trace(core.presets[p]);
   assert(await page.locator('#prev').isDisabled());assert(await page.locator('#final').isHidden());
   for(let i=1;i<frames.length;i++){
    await page.locator('#next').click();
    const text=await page.locator('#ledger').innerText();
    if(i===1){await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#ledger').innerText(),text);}
    assert.equal(await page.locator('#position').inputValue(),String(i));assertions++;
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert(await page.locator('#final').isVisible());
   await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');assert(await page.locator('#final').isHidden());
   await page.locator('#end').click();assert.equal(await page.locator('#position').inputValue(),String(frames.length-1));
   await page.locator('#position').fill('1');assert.equal(await page.locator('#position').inputValue(),'1');
  }
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
   assert.match(await page.locator('#feedback').innerText(),choice===1?(lang==='zh'?/预测正确/:/Correct/):(lang==='zh'?/遗漏/:/omits/));
   const idx=await page.locator('#position').inputValue();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();
   assert(await page.locator(`[name=prediction][value="${choice}"]`).isChecked());assert(await page.locator('#feedback').isVisible());assert.equal(await page.locator('#position').inputValue(),idx);
   await page.locator(`[data-lang=${lang}]`).click();
  }
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.length>0);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const d=page.waitForEvent('download');await page.locator('a[download]').click();const download=await d;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.evaluate(()=>{window.oldWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test blocked'))});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
  await page.evaluate(()=>{navigator.clipboard.writeText=window.oldWrite});
 }
 // Actual keyboard activation and focus, plus navigation target geometry.
 await page.locator('[data-lang=en]').click();await page.selectOption('#preset','0');
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');
 assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'0');
 for(let i=0;i<5;i++){
  await page.locator(`nav a[href="#step${i}"]`).click();await page.waitForTimeout(40);
  const rect=await page.locator(`#step${i}`).boundingBox(),nav=await page.locator('nav').boundingBox();assert(rect.y>=nav.height-1);
 }
 const anchors=await page.locator('a[href^="../"]').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
 for(const href of anchors){const u=new URL(href,page.url());const r=await context.request.get(u.href.split('#')[0]);assert(r.ok());if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`));}
 // Populated diagrams at all contract widths and CSS 200% layout zoom.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','0');
  await page.locator('#end').click();await page.evaluate(()=>{const y=document.querySelector('.stage').getBoundingClientRect().top+scrollY-document.querySelector('nav').getBoundingClientRect().height-12;scrollTo(0,y)});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const el of await page.locator('button,select,summary,input[type=range],.back-link,.official-link,.related a,.solution-actions a').all()){if(await el.isVisible())assert((await el.boundingBox()).height>=48,(await el.evaluate(e=>e.outerHTML)));}
  for(const box of await page.locator('.suffix-cell').all()){assert((await box.boundingBox()).width>=200);}
  await page.screenshot({path:path.join(OUT,`lab-${lang}-${width}.png`)});
 }
 await page.setViewportSize({width:780,height:1100});await page.evaluate(()=>document.body.style.zoom='2');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>{scrollTo(0,document.querySelector('.stage').getBoundingClientRect().top+scrollY-document.querySelector('nav').getBoundingClientRect().height-12)});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(OUT,`zoom-200-${lang}.png`)});
  await page.evaluate(()=>scrollTo(0,document.querySelector('#ledger').getBoundingClientRect().top+scrollY-document.querySelector('nav').getBoundingClientRect().height-12));
  await page.screenshot({path:path.join(OUT,`zoom-ledger-${lang}.png`)});
 }
 await page.evaluate(()=>document.body.style.zoom='1');
 // Measure text/background and focus pairs using actual computed colors.
 const pairs=await page.evaluate(()=>{
  const selectors=['body','.explain','.hint','.suffix-cell','.suffix-cell small','#prev','#next','.lang-toggle button.active','nav a.active','summary'];
  function bg(el){while(el){const c=getComputedStyle(el).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;el=el.parentElement;}return 'rgb(13, 17, 23)';}
  return selectors.map(s=>{const e=document.querySelector(s),cs=getComputedStyle(e);return {selector:s,fg:cs.color,bg:bg(e)}}).concat([{selector:'focus / panel2',fg:'rgb(255, 180, 84)',bg:'rgb(28, 35, 48)'}]);
 });
 if(await page.locator('#end').isEnabled())await page.locator('#end').click();
 const disabled=await page.locator('#next').evaluate(el=>({selector:'disabled next',fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor}));pairs.push(disabled);
 function lum(s){const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
 for(const p of pairs){const a=lum(p.fg),b=lum(p.bg);p.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(p.ratio>=(p.selector.startsWith('focus')?3:4.5),JSON.stringify(p));}
 fs.writeFileSync(path.join(OUT,'contrast.json'),JSON.stringify(pairs,null,2));
 await page.emulateMedia({forcedColors:'active'});await page.locator('#reset').click();await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 // Denied storage and denied clipboard: no runtime error and working locale.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('test storage disabled')}})});
 const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto('http://127.0.0.1:18784/leetcode/140/');await dp.locator('[data-lang=zh]').click();await dp.locator('#next').click();assert.match(await dp.locator('#progress').innerText(),/1/);await denied.close();
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();op.on('pageerror',e=>errors.push(String(e)));await op.goto('file://'+path.join(ROOT,'index.html'));await op.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await op.locator('#pythonCode').textContent(),source);await op.locator('#next').click();assert.equal(await op.locator('#position').inputValue(),'1');await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({result:'pass',candidate:'140-1',traceChecks:assertions,locales:['en','zh'],widths:[320,390,736,1440],zoom:'CSS layout zoom 200% at viewport 780',tested:['all presets and every event','back/forward identity','endpoints/reset/range','all predictions and stale feedback','locale state preservation','clipboard success and manual fallback','source/display/download parity','keyboard focus and activation','deep links','blocked storage','no external assets or runtime/network errors'],errors,bad,external},null,2));
 await browser.close();console.log('Browser checks passed:',assertions);
})().catch(e=>{console.error(e);process.exit(1)});
