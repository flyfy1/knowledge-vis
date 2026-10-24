'use strict';
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-write','clipboard-read'],locale:'en-US',reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[],failures=[],checks=[],bindings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)failures.push([r.status(),r.url()]);});
 await page.goto(base+'/leetcode/407/');await page.locator('#progress').filter({hasText:'Completed'}).waitFor();
 const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  for(let preset=0;preset<6;preset++){
   await page.selectOption('#preset',String(preset));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const initial=await page.locator('#terrain').textContent();let steps=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#terrain').textContent(),progress=await page.locator('#progress').textContent(),heap=await page.locator('#heap').textContent();
    await page.click('#next');const after=await page.locator('#terrain').textContent();
    await page.click('#prev');assert.equal(await page.locator('#terrain').textContent(),before);assert.equal(await page.locator('#progress').textContent(),progress);assert.equal(await page.locator('#heap').textContent(),heap);
    await page.click('#next');assert.equal(await page.locator('#terrain').textContent(),after);steps++;
   }
   assert(await page.locator('#end').isDisabled());const expected=[2,4,4,10,0,0][preset];
   const text=await page.locator('#progress').textContent();assert(text.includes(lang==='en'?`water accumulated so far ${expected}`:`当前累计水量 ${expected}`));
   assert.equal(await page.locator('#history li').count(),steps+1);
   await page.click('#reset');assert.equal(await page.locator('#terrain').textContent(),initial);assert(await page.locator('#prev').isDisabled());
   await page.click('#end');assert(await page.locator('#next').isDisabled());
   checks.push({locale:lang,preset,all_rounds:steps,rewind:'PASS',endpoints:'PASS'});
  }
  await page.selectOption('#preset','1');
  for(let gate=0;gate<=5;gate++){
   await page.locator('#gate').fill(String(gate));assert(await page.locator('#prev').isDisabled());await page.click('#end');
   const expected=4*Math.max(0,gate-1);assert((await page.locator('#progress').textContent()).includes(lang==='en'?`water accumulated so far ${expected}`:`当前累计水量 ${expected}`));
  }
  await page.locator('#gate').fill('2');await page.click('#end');
  await page.locator('#handReveal').click();assert(await page.locator('#hand').isVisible());await page.locator('#handReveal').click();assert(await page.locator('#hand').isHidden());
  for(const option of ['0','1','2']){
   await page.check(`input[name=prediction][value="${option}"]`);assert(!(await page.locator('#feedback').textContent()).includes('3+0+2=5'));
   await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('3+0+2=5'));assert(feedback.includes(lang==='en'?(option==='1'?'Correct prediction':'Revise this prediction'):(option==='1'?'预测正确':'需要修正')));
   bindings.push({locale:lang,state:'revealed option '+option,observed:feedback});
  }
  const before=await page.locator('#terrain').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator('input[name=prediction][value="2"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('3+0+2=5'));assert.equal(await page.locator('#preset').inputValue(),'1');assert.equal(await page.locator('#gate').inputValue(),'2');assert(await page.locator('#next').isDisabled());
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#terrain').textContent(),before);
  // Explicit clipboard success test then denied clipboard fallback, in each locale.
  await page.evaluate(()=>{window.__copied=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}});});
  await page.click('#copy');assert.equal(await page.evaluate(()=>window.__copied),source);assert(await page.locator('#manualCopy').isHidden());
  assert((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'Complete source copied':'已复制完整'));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.locator('#manualSource').evaluate(el=>el.selectionEnd-el.selectionStart),source.length);
  bindings.push({locale:lang,state:'clipboard denied',observed:await page.locator('#copyStatus').textContent()});
 }
 const downloadPromise=page.waitForEvent('download');await page.click('#download');const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 const response=await context.request.get(base+'/leetcode/407/solution.py');assert.equal(await response.text(),source);
 // Ordinary native keyboard operation and stable focus across locale rerender.
 await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/9'));
 await page.locator('#gate').count();await page.locator('[data-lang=en]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineStyle),'none');await page.locator('#next').focus();const focus=await page.locator('#next').evaluate(el=>({width:getComputedStyle(el).outlineWidth,style:getComputedStyle(el).outlineStyle,color:getComputedStyle(el).outlineColor}));assert.equal(focus.width,'3px');
 await page.selectOption('#preset','1');await page.locator('#gate').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#gate').inputValue(),'0');await page.keyboard.press('End');assert.equal(await page.locator('#gate').inputValue(),'5');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#gate').inputValue(),'4');
 const geometry=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:900});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','2');
  for(let i=0;i<6;i++)await page.click('#next');
  const over=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(over,false,`page overflow ${lang} ${width}`);
  await page.locator('#terrainScroll').scrollIntoViewIfNeeded();
  const sizes=await page.locator('#terrain').evaluate(el=>[...el.querySelectorAll('td')].map(td=>({w:td.getBoundingClientRect().width,h:td.getBoundingClientRect().height,font:getComputedStyle(td.querySelector('span')).fontSize})));
  assert(sizes.every(s=>s.w>=78&&s.h>=95&&parseFloat(s.font)>=14));
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});
  await page.locator('#terrainScroll').focus();await page.keyboard.press('End');await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);
  const scroll=await page.locator('#terrainScroll').evaluate(el=>({left:el.scrollLeft,scroll:el.scrollWidth,client:el.clientWidth}));if(width<=390)assert(scroll.left>0);
  geometry.push({locale:lang,width,cell:sizes[0],scroll});
 }
 // 200% CSS layout zoom creates the effective half-width layout, including CJK.
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:1440,height:1000});await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('#terrainScroll').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`zoom200-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.setViewportSize({width:390,height:900});await page.click('a[href="#step3"]');await page.waitForFunction(()=>{const y=document.getElementById('step3').getBoundingClientRect().top,h=document.querySelector('.step-nav').getBoundingClientRect().height;return y>=h-2&&y<=h+30;});const target=await page.locator('#step3').boundingBox();const nav=await page.locator('.step-nav').boundingBox();assert(target.y>=nav.height-2);
 await page.check('input[name=prediction][value="1"]');assert(!(await page.locator('#feedback').textContent()).includes('3+0+2=5'));await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert((await page.locator('#feedback').textContent()).includes('3+0+2=5'));
 await page.screenshot({path:path.join(out,'prediction-zh-390.png')});
 // Verify every local anchor/link exists, without mutating registry.
 for(const href of await page.locator('a[href]').evaluateAll(els=>els.map(el=>el.getAttribute('href')))){
  const url=new URL(href,page.url());if(url.origin!==base)continue;
  if(url.pathname===new URL(page.url()).pathname){if(url.hash)assert(await page.locator(url.hash).count());continue;}
  const res=await context.request.get(url.href);assert(res.ok(),url.href);if(url.hash)assert((await res.text()).includes(`id="${url.hash.slice(1)}"`),url.href);
 }
 // Rendered token-pair contrast, including native disabled and selected controls.
 const contrast=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),L=v=>v.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0),rows=[];
  for(const selector of ['body','.stage','.hint','.heap','.terrain td span','.terrain td small','#next:disabled','#prev','#langToggle button.active','.step-nav a']){
   const el=document.querySelector(selector);if(!el)continue;const cs=getComputedStyle(el);let b=el;while(b&&getComputedStyle(b).backgroundColor==='rgba(0, 0, 0, 0)')b=b.parentElement;
   const bg=getComputedStyle(b||document.body).backgroundColor,fg=cs.color,a=L(rgb(fg)),z=L(rgb(bg));rows.push({selector,fg,bg,ratio:(Math.max(a,z)+.05)/(Math.min(a,z)+.05)});
  }return rows;
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#prev').focus();assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Storage denial and offline source display: runtime assets remain local.
 const isolated=await browser.newContext();await isolated.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});
 const isolatedPage=await isolated.newPage();await isolatedPage.goto(base+'/leetcode/407/');await isolatedPage.locator('#progress').waitFor();await isolatedPage.click('[data-lang=zh]');assert.equal(await isolatedPage.locator('html').getAttribute('lang'),'zh-CN');
 await isolated.setOffline(true);await isolatedPage.click('[data-lang=en]');assert.equal(await isolatedPage.locator('#pythonSource').textContent(),source);await isolated.close();
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);assert(requests.every(url=>url.startsWith(base)||url.startsWith('data:')),requests.join('\n'));
 const report={status:'PASS',checks,bindings,geometry,focus,contrast,consoleErrors:errors,assetFailures:failures,requests:[...new Set(requests)],sourceCopyDownloadParity:true,clipboardSuccessAndDenial:true,blockedStorage:true,offlineSource:true,layoutZoom:'200% CSS zoom (both locales)',keyboard:true,localLinks:true,forcedColors:true,reducedMotion:true};
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',preset_locale_paths:checks.length,screenshots:11,contrast_min:Math.min(...contrast.map(x=>x.ratio))}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
