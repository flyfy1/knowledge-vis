'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'evidence/review-1-fix');
const base=process.env.LESSON_BASE_URL||'http://127.0.0.1:18770';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const errors=[],results={locales:[],layouts:[],parity:[],screenshots:[]};
 try{
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1280,height:900}}),p=await ctx.newPage();
 p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error'){const url=m.location().url;if(url===base+'/favicon.ico')results.unrelatedFavicon404={url,message:m.text()};else errors.push({message:m.text(),url});}});p.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url());});
 await p.goto(base+'/leetcode/25/');await p.waitForFunction(()=>window.lessonSnapshot&&document.querySelector('#message').textContent);
 const snap=()=>p.evaluate(()=>lessonSnapshot());
 async function shot(key,file){
  await p.locator(key).evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-160));
  await p.screenshot({path:path.join(out,file)});results.screenshots.push(file);
 }
 for(const lang of ['en','zh']){
  await p.locator(`[data-lang=${lang}]`).click();
  assert.equal(await p.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  // Read in DOM order: prerequisites and concrete causal steps precede abstraction.
  const order=['nodeBasics','nodeDiagram','referenceAssignment','statement','hand','pointerSetup','pointerFirst','pointerSecond','pointerFinish','baselineBridge','derive','groupRoles','proof'];
  const texts=[];let last=-1;
  for(const key of order){const element=p.locator(`[data-i18n=${key}]`);assert(await element.isVisible());const y=await element.evaluate(e=>e.getBoundingClientRect().top+scrollY);assert(y>last,key);last=y;texts.push(await element.innerText());}
  fs.writeFileSync(path.join(out,`${lang}-rendered-bridge.txt`),texts.join('\n\n')+'\n');
  assert.deepEqual(await p.locator('[data-i18n]').evaluateAll(es=>es.filter(e=>!e.textContent.trim()).map(e=>e.dataset.i18n)),[]);
  for(let preset=0;preset<4;preset++){
   await p.locator('#preset').selectOption(String(preset));assert(await p.locator('#prev').isDisabled());const first=await snap();
   await p.locator('#next').click();const second=await snap();await p.locator('#prev').click();assert.deepEqual(await snap(),first);await p.locator('#next').click();assert.deepEqual(await snap(),second);
   await p.locator('#position').fill(await p.locator('#position').getAttribute('max'));assert(await p.locator('#next').isDisabled());assert(await p.locator('#result').isVisible());
   assert.deepEqual((await snap()).frame.result,[[2,1,4,3,5],[3,2,1,4,5],[2,2,3,3],[1,2]][preset]);
   const end=await snap();await p.locator('#prev').click();await p.locator('#next').click();assert.deepEqual(await snap(),end);await p.locator('#reset').click();assert.deepEqual(await snap(),first);
  }
  for(const choice of ['0','1','2']){await p.locator(`[name=prediction][value="${choice}"]`).check();assert(!(await snap()).revealed);await p.locator('#reveal').click();assert((await snap()).revealed);assert((await p.locator('#feedback').innerText()).includes(await p.evaluate(({choice,lang})=>window.LESSON.quiz.feedback[Number(choice)][lang==='zh'?0:1],{choice,lang})));}
  await p.locator('#preset').selectOption('0');await p.locator('#next').click();await p.locator('#next').click();
  await p.locator('#beforeDetails').evaluate(e=>e.open=true);await p.locator('#sourceDetails').evaluate(e=>e.open=true);
  const before=await snap();await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await snap(),before);await p.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),before);
  assert(await p.locator('#beforeDetails').getAttribute('open')!==null);
  assert.equal(await p.locator('#pythonCode').textContent(),source);assert.equal(await p.evaluate(()=>window.PYTHON_SOURCE),source);
  await p.locator('#copy').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('a[download]').click()]);assert.equal(download.suggestedFilename(),'solution.py');assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  results.parity.push({lang,display:true,embedded:true,clipboard:true,download:true});
  for(const width of [320,390,736,1280]){
   await p.setViewportSize({width,height:900});assert.deepEqual(await snap(),before);
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${width} overflow`);
   const boxes=await p.locator('#step0 .explain,#step1 .explain,[data-i18n=nodeDiagram]').evaluateAll(es=>es.map(e=>({key:e.dataset.i18n,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,height:e.clientHeight,scrollHeight:e.scrollHeight})));
   assert(boxes.every(b=>b.left>=0&&b.right<=width&&b.height>=b.scrollHeight-1));
   results.layouts.push({lang,width,noPageOverflow:true,bridgeBoxesUnclipped:true});
   if(width===320||width===1280){await shot('[data-i18n=nodeTitle]',`${lang}-${width}-prerequisite.png`);await shot('[data-i18n=pointerTitle]',`${lang}-${width}-rewire.png`);}
  }
  await shot('#step1 h2',`${lang}-1280-derive.png`);
  await p.locator('#position').focus();await p.keyboard.press('Home');assert.equal((await snap()).index,0);await p.keyboard.press('ArrowRight');assert.equal((await snap()).index,1);
  await p.locator('#prev').focus();await p.keyboard.press('Space');assert.equal((await snap()).index,0);await p.locator('#next').focus();await p.keyboard.press('Enter');assert.equal((await snap()).index,1);
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.step-nav a[href="#step2"]').click();assert(await p.evaluate(()=>document.querySelector('#step2 h2').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
  await shot('#diagram',`${lang}-1280-trace.png`);
  await p.locator('#reset').focus();assert.equal(await p.locator('#reset').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  await p.evaluate(()=>document.body.style.zoom='2');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot('[data-i18n=pointerTitle]',`${lang}-zoom200-rewire.png`);await p.evaluate(()=>document.body.style.zoom='');
  results.locales.push({lang,allPresets:true,rewindReset:true,quiz:true,preservedState:true,keyboard:true,deepLink:true,cssZoom200:true});
 }
 const denied=await browser.newContext({viewport:{width:320,height:900},locale:'zh-CN'});
 await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied');}}});});
 const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto(base+'/leetcode/25/');await dp.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['zh','en']){await dp.locator(`[data-lang=${lang}]`).click();await dp.locator('#copy').click();assert(await dp.locator('#manualCopy').isVisible());assert.equal(await dp.locator('#copyText').inputValue(),source);assert((await dp.locator('#copyStatus').innerText()).length>15);}
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>window.lessonSnapshot);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#next').click();assert.equal(await offline.evaluate(()=>lessonSnapshot().index),1);
 results.deniedClipboardStorageBothLocales=true;results.offline=true;
 const assets=['index.html','copy.js','app.js','solution.py','python-code.js'];for(const file of assets){const response=await p.request.get(base+'/leetcode/25/'+file);assert.deepEqual(await response.body(),fs.readFileSync(path.join(root,file)));}
 results.previewBytesMatch=assets;
 results.presentation=await p.evaluate(()=>{const root=getComputedStyle(document.documentElement),text=root.getPropertyValue('--text').trim(),bg=root.getPropertyValue('--bg').trim();return {text,bg};});
 const luminance=hex=>{const rgb=hex.slice(1).match(/../g).map(h=>parseInt(h,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};
 results.presentation.textContrast=(luminance(results.presentation.text)+0.05)/(luminance(results.presentation.bg)+0.05);
 results.presentation.cssBytes=['../style.css','../hard-first-ten/style.css'].map(file=>({file,bytes:fs.statSync(path.resolve(root,file)).size}));
 assert.deepEqual(errors,[]);results.errors=errors;
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
