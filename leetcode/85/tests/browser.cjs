// BASE_URL optionally overrides existing preview. OUTPUT_DIR redirects all artifacts.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(root,'evidence/browser');fs.mkdirSync(out,{recursive:true});
const base=process.env.BASE_URL||'http://127.0.0.1:18775',url=base+'/leetcode/85/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await ctx.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);assert.equal(errors.length,0,errors.join('\n'));
 await page.emulateMedia({reducedMotion:'reduce'});
 const snap=()=>page.evaluate(()=>['state','message','matrix','histogram','rows'].map(id=>document.getElementById(id).outerHTML).join('\n'));
 let operations=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const start=await snap(),total=Number(await page.locator('#position').getAttribute('max'));
   for(let i=1;i<=total;i++){await page.locator('#next').click();operations++;assert.equal(await page.locator('#position').inputValue(),String(i));}
   assert(await page.locator('#next').isDisabled());
   const final=await snap();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await snap(),final);
   for(let i=total-1;i>=0;i--)await page.locator('#prev').click();assert.equal(await snap(),start);
   await page.locator('#next').click();await page.locator('#reset').click();assert.equal(await snap(),start);
  }
  assert(await page.locator('#feedback').isHidden());
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'First pop':'先弹出'));
  }
  await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-quiz.png`)});
  // Changing the answer clears the old verdict.
  await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 }
 await page.selectOption('#preset','1');await page.locator('#next').click();await page.locator('#next').click();
 await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const pos=await page.locator('#position').inputValue();await page.locator('[data-lang=en]').click();
 assert.equal(await page.locator('#position').inputValue(),pos);assert.equal(await page.locator('#preset').inputValue(),'1');assert(await page.locator('[value="2"][name=prediction]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.locator('[data-lang=zh]').click();await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert((await page.locator('#copyStatus').textContent()).includes('已复制'));await page.locator('[data-lang=en]').click();
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'solution.py');assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 await page.locator('[data-lang=zh]').click();assert((await page.locator('#copyStatus').textContent()).includes('无法自动复制'));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');await page.screenshot({path:path.join(out,'zh-copy-fallback.png')});await page.locator('[data-lang=en]').click();assert((await page.locator('#copyStatus').textContent()).includes('unavailable'));
 // Actual keyboard interaction and focus outline.
 await page.locator('#position').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'1');await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());
 await page.locator('#reset').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('Tab');
 const focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return {id:e.id,width:s.outlineWidth,color:s.outlineColor};});assert.equal(focus.width,'3px');
 // Internal links must have actual existing targets.
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('.site-head').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-start.png`)});await page.locator('#step1 h2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-derivation.png`)});assert((await page.locator('[data-i18n=stackLink]').textContent()).length>10);}
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 for(const href of links){if(href.startsWith('http'))continue;const u=new URL(href,url);const res=await ctx.request.get(u.href);assert(res.ok(),href);if(u.hash)assert((await res.text()).includes(`id="${u.hash.slice(1)}"`),href);}
 // Contrast from actual computed foreground/background states.
 const contrast=await page.evaluate(()=>{
  function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}
  function lum(v){return v.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
  function ratio(a,b){let x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  return ['.explain','.hint','.stage .hint','.readout','.btn.primary','#prev','.lang-toggle button.active','select','#feedback'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let p=e,b=s.backgroundColor;while(b==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;b=getComputedStyle(p).backgroundColor;}return {selector,foreground:s.color,background:b,ratio:ratio(s.color,b),focusAgainstBackground:ratio('rgb(255, 180, 84)',b)};});
 });for(const c of contrast){assert(c.ratio>=4.5,JSON.stringify(c));if(!['#feedback','.btn.primary','.lang-toggle button.active'].includes(c.selector))assert(c.focusAgainstBackground>=3,JSON.stringify(c));}
 const targets=await page.locator('button,select,summary,.prediction-options label').evaluateAll(es=>es.map(e=>({tag:e.tagName,height:e.getBoundingClientRect().height})));assert(targets.every(e=>e.height>=48),JSON.stringify(targets));
 // Small layouts, both locales; screenshot populated pop frame, no truncated essential data.
 await page.locator('#manualCopy').evaluate(e=>e.hidden=true);
 const layouts=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');
  await page.evaluate(()=>{const r=Rectangle85.trace(Rectangle85.presets[1]);const k=r.frames.findIndex(f=>f.kind==='pop'&&f.row===2&&f.rect.area===6);const el=document.querySelector('#position');el.value=k;el.dispatchEvent(new Event('input'));});
  await page.locator('#matrix').scrollIntoViewIfNeeded();
  const sizes=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,cell:document.querySelector('#matrix td').getBoundingClientRect().width,bars:[...document.querySelectorAll('.bar')].map(e=>e.getBoundingClientRect().width)}));assert(sizes.page<=sizes.viewport,JSON.stringify(sizes));assert(sizes.cell>=24);assert(Math.min(...sizes.bars)>=20);layouts.push({lang,width,...sizes});
  await page.screenshot({path:path.join(out,`${lang}-${width}.png`)});
  await page.locator('#histogram').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-histogram.png`)});
 }
 await page.setViewportSize({width:320,height:1000});
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#step3').screenshot({path:path.join(out,`${lang}-quiz-320.png`)});}
 // Chromium layout zoom stresses the same component at 200%.
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();await page.locator('#matrix').scrollIntoViewIfNeeded();const size=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,cell:document.querySelector('#matrix td').getBoundingClientRect().width}));assert(size.page<=size.viewport);assert(size.cell>=48);await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});
 }
 await page.evaluate(()=>document.documentElement.style.zoom='1');
 // A highlighting outline must not change the dimensions of data units.
 await page.selectOption('#preset','1');await page.evaluate(()=>{const r=Rectangle85.trace(Rectangle85.presets[1]);const k=r.frames.findIndex(f=>f.kind==='push'&&f.row===3&&f.i===0);const el=document.querySelector('#position');el.value=k;el.dispatchEvent(new Event('input'));});
 const units=await page.locator('.unit').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert(Math.max(...units)-Math.min(...units)<.01);

 // Click sticky deep navigation, confirm heading is not covered.
 await page.locator('a[href="#step1"]').first().click();await page.waitForTimeout(400);assert(await page.locator('#step1 h2').evaluate(e=>e.getBoundingClientRect().top>document.querySelector('.step-nav').getBoundingClientRect().bottom));
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 // Denied storage and source display with fetch blocked: the offline mirror needs no fetch.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied')}});});const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.route('**/solution.py',r=>r.abort());await dp.goto(url);await dp.locator('[data-lang=zh]').click();await dp.locator('[data-lang=en]').click();assert.equal(await dp.locator('#pythonCode').textContent(),source);await denied.close();
 assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(u=>u.startsWith(base)||u.startsWith('data:')),requests.join('\n'));
 const report={result:'pass',forwardOperations:operations,locales:['en','zh'],presets:7,layouts,contrast,controlTargets:targets,keyboardFocus:focus,errors,checks:['forward/back/reset/endpoints','prediction all options/reveal/change','locale state and focus','clipboard success/denial','display/copy/download exact source','blocked storage','offline source mirror','deep links','local network assets','forced colors/reduced motion','200% Chromium CSS layout zoom']};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
