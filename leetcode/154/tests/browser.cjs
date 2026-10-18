const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18786/leetcode/154/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],assets=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('request',r=>assets.push(r.url()));
 await page.goto(base);await page.locator('#progress').filter({hasText:/0/}).waitFor();
 const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);
 let snapshots=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let preset=0;preset<9;preset++){
   await page.selectOption('#preset',String(preset));assert.equal(await page.locator('#position').inputValue(),'0');
   assert.ok(await page.locator('#prev').isDisabled());
   const total=Number(await page.locator('#position').getAttribute('max'));
   let states=[await page.locator('#array').innerHTML()];
   for(let i=0;i<total;i++){
    await page.locator('#next').click();const state=await page.locator('#array').innerHTML();states.push(state);snapshots++;
    const readout=await page.locator('#progress').textContent(),history=await page.locator('#historyBody').innerHTML();
    await page.locator('#prev').click();assert.equal(await page.locator('#array').innerHTML(),states[i]);
    await page.locator('#next').click();assert.equal(await page.locator('#array').innerHTML(),state);assert.equal(await page.locator('#progress').textContent(),readout);assert.equal(await page.locator('#historyBody').innerHTML(),history);
   }
   assert.ok(await page.locator('#next').isDisabled());assert.ok(await page.locator('#end').isDisabled());assert.ok(await page.locator('#final').isVisible());
   const api=await page.evaluate(p=>{const a=MinimumLesson.presets[p],f=MinimumLesson.trace(a).at(-1);return {value:a[f.l],expected:Math.min(...a)};},preset);assert.equal(api.value,api.expected);
   await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');assert.equal(await page.locator('#array').innerHTML(),states[0]);
   if(total){await page.locator('#end').click();assert.equal(await page.locator('#array').innerHTML(),states.at(-1));await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');assert.equal(await page.locator('#array').innerHTML(),states[0]);}
  }
  assert.ok(await page.locator('#reveal').isDisabled()||await page.locator('[name=prediction]:checked').count());
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert.ok(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert.ok(await page.locator('#feedback').isVisible());
   const feedback=await page.locator('#feedback').textContent();assert.ok(feedback.includes(lang==='zh'?'[0,5]':'[0,5]'));
   const chosen=await page.locator('[name=prediction]:checked').inputValue();
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await page.locator('[name=prediction]:checked').inputValue(),chosen);assert.ok(await page.locator('#feedback').isVisible());
   await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#feedback').textContent(),feedback);
  }
 }
 await page.selectOption('#preset','1');await page.locator('#next').click();await page.locator('#sourceDetails').evaluate(el=>el.open=true);
 const progress=await page.locator('#progress').textContent();await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#position').inputValue(),'1');assert.ok(await page.locator('#sourceDetails').evaluate(el=>el.open));
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}});});
 await page.locator('#copy').click();assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(el=>el.selectionEnd-el.selectionStart),source.length);
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.locator('[data-lang=zh]').click();assert.ok((await page.locator('#copyStatus').textContent()).includes('手动'));assert.ok(await page.locator('#manualCopy').isVisible());
 // Control target sizes and keyboard focus.
 for(const control of await page.locator('button,input[type=range],select').evaluateAll(els=>els.map(el=>({id:el.id||el.textContent,box:el.getBoundingClientRect().toJSON()})))){assert.ok(control.box.height>=48,JSON.stringify(control));assert.ok(control.box.width>=48,JSON.stringify(control));}
 // Keyboard and focus, including range operation.
 await page.locator('#reset').click();await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');
 const focus=await page.locator('#next').evaluate(el=>{const s=getComputedStyle(el);return {outline:s.outlineWidth,color:s.outlineColor};});assert.equal(focus.outline,'3px');
 await page.locator('#position').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('End');assert.ok(await page.locator('#next').isDisabled());
 await page.locator('[data-lang=en]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('html').getAttribute('lang'),'en');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 // Local/deep link existence and target geometry.
 for(const href of await page.locator('a[href]').evaluateAll(els=>els.map(el=>el.getAttribute('href')))){
  if(href.startsWith('https:'))continue;
  const url=new URL(href,base),response=await context.request.get(url.href.split('#')[0]);assert.equal(response.status(),200,href);
  if(url.hash){const html=await response.text();assert.ok(html.includes(`id="${url.hash.slice(1)}"`),href);}
 }
 await page.locator('a[href="#step2"]').click();await page.waitForTimeout(100);assert.ok(await page.locator('#step2').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('nav').getBoundingClientRect().height-1));
 // Measure actual rendered colors against opaque inherited backgrounds.
 const contrast=await page.evaluate(()=>{
  const rgb=v=>v.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
  function bg(el){while(el){const c=getComputedStyle(el).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;el=el.parentElement;}return 'rgb(13,17,23)';}
  return ['.explain','.hint','.cell.kept span','.cell.excluded b','#prev','#next','.lang-toggle button.active','.step-nav a.active','.btn.primary','a'].map(selector=>{const el=document.querySelector(selector),s=getComputedStyle(el),background=bg(el),a=lum(rgb(s.color)),b=lum(rgb(background));return {selector,foreground:s.color,background,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
 });for(const c of contrast)assert.ok(c.ratio>=4.5,JSON.stringify(c));
 const layouts=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#next').click();await page.locator('#manualCopy').evaluate(el=>el.hidden=true);
  await page.locator('a[href="#step2"]').click();await page.waitForTimeout(80);
  const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,minCell:Math.min(...[...document.querySelectorAll('.cell')].map(x=>x.getBoundingClientRect().width))}));assert.ok(geometry.scroll<=width,JSON.stringify(geometry));assert.ok(geometry.minCell>=80);
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});await page.locator('#array').scrollIntoViewIfNeeded();await page.waitForTimeout(200);await page.screenshot({path:path.join(out,`focused-${lang}-${width}.png`)});layouts.push({lang,width,...geometry});
 }
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:1440,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#array').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom200-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 await context.setOffline(true);assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('[data-lang=en]').click();await page.locator('#reset').click();await page.locator('#end').click();assert.ok(await page.locator('#final').isVisible());await context.setOffline(false);
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto(base);await dp.locator('[data-lang=zh]').click();assert.equal(await dp.locator('html').getAttribute('lang'),'zh-CN');await dp.locator('#end').click();assert.ok(await dp.locator('#final').isVisible());await denied.close();
 assert.deepEqual(errors,[]);assert.ok(assets.every(u=>u.startsWith('http://127.0.0.1:18786/')||u.startsWith('data:')));
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({url:base,snapshots,locales:['en','zh'],presets:9,layouts,contrast,focus,errors,assets:[...new Set(assets)],checks:['forward/back exact snapshots','reset/end/scrub endpoints','all prediction choices, reveal, change clears feedback','locale preserves trace, choice, feedback, disclosure, focus','copy success and denied fallback selection','download/display/mirror parity','keyboard enter/space/home/end','deep links and sticky geometry','200% CSS zoom reflow screenshots','forced colors and reduced motion','offline source and trace','denied storage']},null,2));
 await browser.close();console.log('Browser self-check passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
