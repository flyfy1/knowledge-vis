const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const LESSON_URL=process.env.LESSON_URL||'http://127.0.0.1:18788/leetcode/174/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});await context.grantPermissions(['clipboard-read','clipboard-write']);const page=await context.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+':'+r.url())});page.on('request',r=>requests.push(r.url()));
 await page.goto(LESSON_URL);await page.waitForSelector('#grid td');await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);
 const getState=()=>page.evaluate(()=>({grid:document.querySelector('#grid').innerHTML,event:document.querySelector('#event').textContent,progress:document.querySelector('#progress').textContent}));
 let transitions=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<8;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   assert.equal(await page.locator('#grid td.pending').count(),await page.locator('#grid td').count());
   const states=[await getState()];
   while(!await page.locator('#next').isDisabled()){
    await page.locator('#next').click();const now=await getState();states.push(now);
    await page.locator('#prev').click();assert.deepEqual(await getState(),states.at(-2));
    await page.locator('#next').click();assert.deepEqual(await getState(),now);transitions++;
   }
   assert(await page.locator('#end').isDisabled());assert(await page.locator('#final').isVisible());
   await page.locator('#reset').click();assert.deepEqual(await getState(),states[0]);
   await page.locator('#end').click();assert.deepEqual(await getState(),states.at(-1));
   await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');assert.deepEqual(await getState(),states[0]);
  }
  // Hand experiment: later positive room cannot revive a dead knight.
  await page.selectOption('#path','right');await page.locator('#health').fill('5');await page.locator('#health').dispatchEvent('input');assert.match(await page.locator('#handResult').textContent(),/5 → 3 → 0 → †/);
  await page.locator('#health').fill('6');await page.locator('#health').dispatchEvent('input');assert.match(await page.locator('#handResult').textContent(),/6 → 4 → 1 → 11/);
  await page.selectOption('#path','down');assert.match(await page.locator('#handResult').textContent(),/6 → 4 → -1 → †/);
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert.match(await page.locator('#feedback').textContent(),/5→6→4→1/);
   if(choice===2)assert.match(await page.locator('#feedback').textContent(),lang==='en'?/^Correct/:/^预测正确/);
  }
  // Locale preserves trace, health, answer, reveal, and open source.
  await page.selectOption('#preset','1');await page.locator('#next').click();await page.locator('#sourceDetails').evaluate(el=>el.open=true);
  const keep=await page.evaluate(()=>({i:document.querySelector('#position').value,p:document.querySelector('#preset').value,h:document.querySelector('#health').value,path:document.querySelector('#path').value}));
  const other=lang==='en'?'zh':'en';await page.locator(`[data-lang=${other}]`).click();
  assert.deepEqual(await page.evaluate(()=>({i:document.querySelector('#position').value,p:document.querySelector('#preset').value,h:document.querySelector('#health').value,path:document.querySelector('#path').value})),keep);
  assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
  await page.locator(`[data-lang=${lang}]`).click();
  // Copy success through Chromium's real clipboard, then a denied-API fallback.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert(await page.locator('#manualCopy').isHidden());
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
  assert.equal(await page.evaluate(()=>{const e=document.querySelector('#copyText');return e.selectionEnd-e.selectionStart}),source.length);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  // Actual keyboard operation and focus styling.
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
  assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
  await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#position').inputValue(),'1');
  await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(1000);
  assert(await page.locator('#step2').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('nav').getBoundingClientRect().bottom-2));
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','1');await page.locator('#position').fill('7');await page.locator('#position').dispatchEvent('input');
   await page.locator('#gridWrap').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${width} overflow`);
   // Verify actual cell contents remain inside each cell, rather than just page width.
   assert(await page.locator('#grid td').evaluateAll(cells=>cells.every(cell=>[...cell.children].every(e=>e.scrollWidth<=e.clientWidth))),`cell clipping ${lang} ${width}`);
   await page.screenshot({path:path.join(OUT,`${lang}-${width}.png`)});
  }
  await page.setViewportSize({width:390,height:1000});await page.locator('.site-head').screenshot({path:path.join(OUT,`${lang}-header.png`)});await page.locator('#step3').screenshot({path:path.join(OUT,`${lang}-prediction.png`)});
  await page.setViewportSize({width:1440,height:1000});await page.locator('#step0').screenshot({path:path.join(OUT,`${lang}-hand.png`)});
  // Effective 200% page zoom: Chromium page-scale via CSS zoom; layout viewport 640 => 320 CSS-pixel content.
  await page.setViewportSize({width:640,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#gridWrap').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('#grid td').evaluateAll(cells=>cells.every(cell=>[...cell.children].every(e=>e.scrollWidth<=e.clientWidth))));
  await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 const offlineSource=await context.newPage();await offlineSource.route('**/solution.py',r=>r.abort());await offlineSource.goto(LESSON_URL);assert.equal(await offlineSource.locator('#pythonCode').textContent(),source);await offlineSource.close();
 // Deep targets exist, including related lessons.
 const hrefs=await page.locator('a[href*="#"]').evaluateAll(es=>es.map(e=>e.href));for(const href of hrefs){const u=new URL(href);const resp=await context.request.get(u.origin+u.pathname);assert.equal(resp.status(),200);assert((await resp.text()).includes(`id="${u.hash.slice(1)}"`),href);}
 // Rendered colors, not a visual estimate.
 await page.locator('#reset').click();await page.keyboard.press('Tab');await page.locator('#next').focus();assert(await page.locator('#prev').isDisabled());
 const pairs=await page.evaluate(()=>{const bg=getComputedStyle(document.querySelector('.stage')).backgroundColor;return {body:[getComputedStyle(document.body).color,getComputedStyle(document.body).backgroundColor],muted:[getComputedStyle(document.querySelector('#progress')).color,bg],cell:[getComputedStyle(document.querySelector('#grid td b')).color,getComputedStyle(document.querySelector('#grid td')).backgroundColor],disabled:[getComputedStyle(document.querySelector('#prev')).color,getComputedStyle(document.querySelector('#prev')).backgroundColor],focus:[getComputedStyle(document.querySelector('#next')).outlineColor,bg],primary:[getComputedStyle(document.querySelector('#next')).color,getComputedStyle(document.querySelector('#next')).backgroundColor]}});
 const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};
 const contrast={};for(const [k,[a,b]] of Object.entries(pairs)){const x=lum(a),y=lum(b);contrast[k]={foreground:a,background:b,ratio:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};assert(contrast[k].ratio>=(k==='focus'?3:4.5),k);}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(LESSON_URL);await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();assert.equal(await bp.locator('#position').inputValue(),'1');await blocked.close();
 // Force colors and reduced motion are executable accessibility states.
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.keyboard.press('Tab');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
 assert.equal(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior),'auto');
 assert.deepEqual(errors,[]);assert(requests.filter(x=>!x.startsWith('data:')).every(x=>new URL(x).origin===new URL(LESSON_URL).origin));
 const cssBytes=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({url:LESSON_URL,transitions,locales:['en','zh'],widths:[320,390,736,1440],zoom:'200% CSS zoom at 640px viewport (effective 320px)',errors,contrast,cssBytes,checks:['all presets/all frames round-trip','start/end/reset/scrub','hand death and survival','every prediction/reveal/change','locale preserves state','source/copy success/denial/download parity','keyboard Enter/Space/focus','deep link geometry/targets','blocked storage','local-only requests','forced colors/reduced motion'],limits:'Author browser self-check. Real devices, independent teaching review, public delivery and LeetCode submission unverified.'},null,2));
 console.log(JSON.stringify({transitions,errors,contrast,cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
