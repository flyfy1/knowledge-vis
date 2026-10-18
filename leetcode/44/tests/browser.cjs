const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root='http://127.0.0.1:18770',folder='leetcode/44/evidence/',source=fs.readFileSync('leetcode/44/solution.py','utf8');
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));page.on('request',r=>requests.push(r.url()));
 await page.goto(root+'/leetcode/44/');await page.waitForFunction(()=>window.lessonSnapshot&&document.querySelector('#progress').textContent);
 const snap=()=>page.evaluate(()=>window.lessonSnapshot());
 const scrub=async n=>page.locator('#position').evaluate((e,n)=>{e.value=n;e.dispatchEvent(new Event('input',{bubbles:true}));},n);
 const rows=[];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert.match(await page.locator('[data-i18n="overlapA"]').innerText(),/b\*\*/);assert.match(await page.locator('[data-i18n="derive"]').innerText(),/dp\[0\]\[2\]/);
  assert.match(await page.locator('legend').innerText(),/dp\[2\]\[2\]/);assert.doesNotMatch(await page.locator('legend').innerText(),/regex|正则/);
  for(let preset=0;preset<4;preset++){
   await page.locator('#preset').selectOption(''+preset);const start=await snap();assert.equal(start.index,0);assert.equal(await page.locator('#prev').isDisabled(),true);
   await page.locator('#next').click();const forward=await snap();await page.locator('#prev').click();assert.deepEqual(await snap(),start);await page.locator('#next').click();assert.deepEqual(await snap(),forward);
   await scrub(start.frames-1);assert.equal(await page.locator('#next').isDisabled(),true);assert.equal((await snap()).frame.result,[true,false,true,false][preset]);
   await page.locator('#prev').click();await page.locator('#next').click();assert.equal((await snap()).index,start.frames-1);await page.locator('#reset').click();assert.deepEqual(await snap(),start);
  }
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert.equal((await snap()).revealed,false);assert.equal(await page.locator('#feedback').innerText(),lang==='en'?'Choose first; the answer has not been revealed.':'请先选择，答案尚未揭晓。');
   await page.locator('#reveal').click();assert.equal((await snap()).revealed,true);assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),choice===1);
   assert.match(await page.locator('#feedback').innerText(),lang==='en'?/above/:/上格/);
  }
  await page.locator('#preset').selectOption('0');await scrub(16);
  await page.locator('#beforeDetails').evaluate(e=>e.open=true);await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  const active=page.locator('#diagram [data-cell="2,3"]');assert.equal(await active.innerText(),'T');assert.equal(await page.locator('#diagram [data-cell="2,2"]').innerText(),'F');assert.equal(await page.locator('#diagram [data-cell="1,3"]').innerText(),'T');assert.equal(await page.locator('#beforeDiagram [data-cell="2,3"]').innerText(),'·');
  const original=await snap();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});assert.deepEqual(await snap(),original);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.locator('#diagram').scrollIntoViewIfNeeded();await page.screenshot({path:folder+`${lang}-${width}-trace.png`});
   await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:folder+`${lang}-${width}-quiz.png`});
   const geometry=await page.locator('#state').evaluate(e=>[...e.children].map(n=>{const r=n.getBoundingClientRect();return {text:n.textContent,x:r.x,y:r.y,width:r.width,height:r.height,scroll:n.scrollWidth,client:n.clientWidth};}));
   geometry.forEach(g=>assert.ok(g.scroll<=g.client+1,JSON.stringify(g)));
   rows.push({lang,width,no_page_overflow:true,state_geometry:geometry});
  }
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#step0').scrollIntoViewIfNeeded();await page.screenshot({path:folder+lang+'-zoom200-teaching.png'});
  await page.locator('#diagram').scrollIntoViewIfNeeded();await page.screenshot({path:folder+lang+'-zoom200-trace.png'});
  await page.evaluate(()=>document.documentElement.style.zoom='');
  const before=await snap();await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.deepEqual(await snap(),before);assert.equal(await page.locator('#sourceDetails').getAttribute('open'),'');await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('#position').focus();await page.keyboard.press('End');assert.equal((await snap()).index,29);await page.keyboard.press('Home');assert.equal((await snap()).index,0);await page.keyboard.press('ArrowRight');assert.equal((await snap()).index,1);
  await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal((await snap()).index,0);await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal((await snap()).index,1);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('test fallback'))}));
  await page.locator('#copy').click();assert.equal(await page.locator('#manualCopy').isVisible(),true);assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length),true);
  // Restore the native clipboard method for the next locale.
  await page.evaluate(()=>delete navigator.clipboard.writeText);
 }
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();await page.setViewportSize({width:320,height:900});
  for(const key of ['overlapA','overlapB','derive','transition'])await page.locator(`[data-i18n="${key}"]`).screenshot({path:folder+`${lang}-320-${key}.png`});
 }
 // All lesson-local served source bytes agree with the frozen checkout candidate.
 const served=[];for(const name of ['index.html','copy.js','app.js','python-code.js','solution.py']){const response=await context.request.get(root+'/leetcode/44/'+name);assert.equal(response.status(),200);assert.deepEqual(await response.body(),fs.readFileSync('leetcode/44/'+name));served.push(name);}
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}}));
 const deniedPage=await denied.newPage();deniedPage.on('pageerror',e=>errors.push(e.message));await deniedPage.goto(root+'/leetcode/44/');await deniedPage.waitForFunction(()=>window.lessonSnapshot);await deniedPage.locator('[data-lang="en"]').click();await deniedPage.locator('#next').click();assert.equal(await deniedPage.evaluate(()=>lessonSnapshot().index),1);await denied.close();
 assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith(root)));
 fs.writeFileSync(folder+'browser.json',JSON.stringify({rows,locales:['en','zh'],presets_each_locale:4,all_quiz_options:true,locale_state_preserved:true,replay:true,keyboard:true,source_display_copy_download_fallback_exact:true,blocked_storage:true,zoom:'CSS root zoom 2; not native browser-menu zoom',served,all_requests_local:true,errors},null,2)+'\n');
 await browser.close();console.log('PASS: both locales, four presets, all quiz choices, replay, 320/390/736/1440, 200% CSS zoom, keyboard, clipboard/download/fallback, blocked storage, served parity');
})().catch(e=>{console.error(e);process.exit(1);});
