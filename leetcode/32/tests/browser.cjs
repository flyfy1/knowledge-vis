const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'), out=path.join(root,'evidence/fix-r1-r2'),base='http://127.0.0.1:18770/leetcode/32/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const errors=[],results=[],ignoredRequests=[];
 try{
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'){if(m.location().url.endsWith('/favicon.ico'))ignoredRequests.push(m.location().url);else errors.push(m.text()+' '+m.location().url);}});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(base);await page.waitForFunction(()=>window.lessonSnapshot);
 const hashes={};for(const file of ['index.html','copy.js','app.js','solution.py','python-code.js']){const response=await page.request.get(base+file);const bytes=await response.body();assert.deepEqual(bytes,fs.readFileSync(path.join(root,file)));hashes[file]=crypto.createHash('sha256').update(bytes).digest('hex');}
 const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();
  for(const [preset,answer] of [4,6,2,0].entries()){
   await page.locator('#preset').selectOption(String(preset));const initial=await page.evaluate(()=>lessonSnapshot().frame);assert.ok(await page.locator('#prev').isDisabled());
   while(!await page.locator('#next').isDisabled())await page.locator('#next').click();
   assert.equal(await page.evaluate(()=>lessonSnapshot().frame.result),answer);
   if(preset!==3){const last=await page.evaluate(()=>lessonSnapshot().frame);await page.locator('#prev').click();await page.locator('#next').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),last);}
   await page.locator('#reset').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),initial);
  }
  for(const answer of ['0','1','2']){await page.locator(`[name="prediction"][value="${answer}"]`).check();assert.equal(await page.evaluate(()=>lessonSnapshot().revealed),false);await page.locator('#reveal').click();assert.equal(await page.evaluate(()=>lessonSnapshot().revealed),true);assert.ok((await page.locator('#feedback').innerText()).length>20);}
  await page.locator('#preset').selectOption('0');await page.locator('#position').fill('5');const snap=await page.evaluate(()=>lessonSnapshot());
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snap);await page.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.deepEqual(await page.locator('[data-i18n]').evaluateAll(ns=>ns.filter(n=>!n.textContent.trim()).map(n=>n.dataset.i18n)),[]);
   const hand=await page.locator('#step0').innerText();assert.ok(hand.includes('1→2→1'));assert.ok(hand.includes('right−left+1'));assert.ok(hand.includes('−1→0'));
   await page.locator('.step-nav a[href="#step0"]').click();
   if(width===320||width===1440)await page.locator('#step0').screenshot({path:path.join(out,`${lang}-${width}-hand.png`)});
   await page.locator('.step-nav a[href="#step1"]').click();assert.ok(await page.evaluate(()=>document.querySelector('#step1 h2').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
   if(width===320)await page.locator('#step1').screenshot({path:path.join(out,`${lang}-320-derive.png`)});
   await page.locator('#beforeDetails').evaluate(e=>e.open=true);await page.locator('.step-nav a[href="#step2"]').click();
   if(width===320)await page.locator('.stage').screenshot({path:path.join(out,`${lang}-320-stage.png`)});
   results.push({lang,width,noOverflow:true,workedCalculationVisible:true});
  }
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.body.style.zoom='2');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('.step-nav a[href="#step0"]').click();await page.locator('#step0').screenshot({path:path.join(out,`${lang}-zoom200-hand.png`)});await page.evaluate(()=>document.body.style.zoom='');
  await page.locator('#reset').click();await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>lessonSnapshot().index),1);await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>lessonSnapshot().index),0);
 }
 const denied=await browser.newContext({locale:'zh-CN'});await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied')}});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}}});});const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto(base);await dp.locator('#copy').click();assert.ok(await dp.locator('#manualCopy').isVisible());assert.equal(await dp.locator('#copyText').inputValue(),source);assert.equal(await dp.evaluate(()=>document.activeElement.id),'copyText');await dp.locator('[data-lang="en"]').click();assert.ok((await dp.locator('#copyStatus').innerText()).includes('Automatic copy'));await denied.close();
 await page.goto('file://'+path.join(root,'index.html'));await page.waitForFunction(()=>window.lessonSnapshot);assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#next').click();assert.equal(await page.evaluate(()=>lessonSnapshot().index),1);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({results,hashes,errors,ignoredRequests,sourceDisplayCopyDownloadParityBothLocales:true,clipboardStorageDenial:true,keyboard:true,offline:true,zoom:'CSS zoom:2 at 1280x900'},null,2)+'\n');console.log('Browser checks passed: both locales, all presets/options, four widths, CSS 200%, replay, keyboard, sources, denied APIs, offline.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
