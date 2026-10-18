'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),evidence=path.join(root,'evidence'),base='http://127.0.0.1:18770/leetcode/10/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const models={};vm.runInNewContext(fs.readFileSync(path.join(root,'../hard-first-ten/core.js'),'utf8'),models);
let modelCases=0,prefixChecks=0;
const atoms=['a','b','.','a*','b*','.*'];
const strings=[''];for(let n=1;n<=4;n++)for(let i=0;i<2**n;i++)strings.push(i.toString(2).padStart(n,'0').replaceAll('0','a').replaceAll('1','b'));
const patterns=[''];for(const a of atoms){patterns.push(a);for(const b of atoms){patterns.push(a+b);for(const c of atoms)patterns.push(a+b+c);}}
for(const s of strings)for(const p of patterns){
 const input=[s,p],trace=models.HardModels[10](input);assert.deepEqual(input,[s,p]);
 const oracle=(text,pattern)=>new RegExp('^(?:'+pattern+')$').test(text);
 assert.equal(trace.result,oracle(s,p));
 let previous;
 for(const frame of trace.frames){
  const [i,j]=frame.active;
  assert.equal(frame.matrix[i][j],oracle(s.slice(0,i),p.slice(0,j)));prefixChecks++;
  for(const [a,b] of frame.deps)assert.notEqual(frame.matrix[a][b],null);
  if(previous){let changes=0;for(let a=0;a<=s.length;a++)for(let b=0;b<=p.length;b++)changes+=previous.matrix[a][b]!==frame.matrix[a][b];assert.equal(changes,1);}
  previous=frame;
 }
 modelCases++;
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const errors=[],checks=[],ignored=[];
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'){const url=m.location().url;if(url.endsWith('/favicon.ico'))ignored.push({message:m.text(),url});else errors.push({message:m.text(),url});}});page.on('response',r=>{if(r.status()>=400){if(r.url().endsWith('/favicon.ico'))ignored.push(r.status()+' '+r.url());else errors.push(r.status()+' '+r.url());}});
 try{
 await page.goto(base);await page.waitForFunction(()=>window.lessonSnapshot&&document.querySelector('#message').textContent);
 for(const name of ['copy.js','index.html','solution.py','python-code.js'])assert.equal(await (await page.request.get(base+name)).text(),fs.readFileSync(path.join(root,name),'utf8'));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(const key of ['overlapTitle','overlapIntro','overlapSkip','overlapConsume','overlapWork','overlapSave','suffixBridge','prefixExample'])assert.ok((await page.locator(`[data-i18n="${key}"]`).innerText()).length>0);
  for(let preset=0;preset<4;preset++){
   await page.locator('#preset').selectOption(String(preset));assert.ok(await page.locator('#prev').isDisabled());
   const start=await page.evaluate(()=>lessonSnapshot().frame);
   await page.locator('#next').click();const first=await page.evaluate(()=>lessonSnapshot().frame);await page.locator('#prev').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),start);
   await page.locator('#next').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),first);
   await page.locator('#position').fill(await page.locator('#position').getAttribute('max'));
   assert.ok(await page.locator('#next').isDisabled());assert.equal((await page.evaluate(()=>lessonSnapshot().frame)).result,[true,false,true,false][preset]);
   await page.locator('#reset').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),start);
  }
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert.equal(await page.evaluate(()=>lessonSnapshot().revealed),false);
   await page.locator('#reveal').click();assert.equal(await page.evaluate(()=>lessonSnapshot().revealed),true);
  }
  await page.locator('#preset').selectOption('0');await page.locator('#position').fill('17');
  await page.locator('#beforeDetails').evaluate(e=>e.open=true);
  assert.equal(await page.locator('#diagram [data-cell="2,4"]').innerText(),'T');assert.equal(await page.locator('#beforeDiagram [data-cell="2,4"]').innerText(),'·');
  const snap=await page.evaluate(()=>lessonSnapshot());
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snap);
  await page.locator(`[data-lang="${lang}"]`).click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snap);
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const downloadEvent=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadEvent;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${width}`);
   assert.deepEqual(await page.locator('[data-i18n]').evaluateAll(nodes=>nodes.filter(n=>!n.textContent.trim()).map(n=>n.dataset.i18n)),[]);
   if(width!==736){await page.locator('#step0').screenshot({path:path.join(evidence,`${lang}-${width}-overlap.png`)});await page.locator('#step1').screenshot({path:path.join(evidence,`${lang}-${width}-bridge.png`)});}
   checks.push(`${lang} ${width}: no overflow, all bilingual text populated; trace and quiz preserved`);
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#step1').screenshot({path:path.join(evidence,`${lang}-zoom2-bridge.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.locator('#position').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>lessonSnapshot().index),1);
  await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>lessonSnapshot().index),0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.step-nav a[href="#step1"]').click();
  assert.ok(await page.evaluate(()=>document.querySelector('#step1 h2').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
 }
 for(const href of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('https:')))){
  const url=new URL(href,base),res=await page.request.get(url.href.split('#')[0]);assert.ok(res.ok());if(url.hash)assert.ok((await res.text()).includes(`id="${url.hash.slice(1)}"`));
 }
 const blocked=await browser.newContext({viewport:{width:390,height:1000}});
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied');}}});});
 const fallback=await blocked.newPage();fallback.on('pageerror',e=>errors.push(String(e)));await fallback.goto(base);await fallback.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['en','zh']){await fallback.locator(`[data-lang="${lang}"]`).click();await fallback.locator('#copy').click();assert.ok(await fallback.locator('#manualCopy').isVisible());assert.equal(await fallback.locator('#copyText').inputValue(),source);await fallback.locator('#next').click();}
 const offline=await browser.newPage();offline.on('pageerror',e=>errors.push(String(e)));await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['en','zh']){await offline.locator(`[data-lang="${lang}"]`).click();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#next').click();assert.ok((await offline.locator('[data-i18n="suffixBridge"]').textContent()).length>30);}
 assert.deepEqual(errors,[]);
 const result={modelCases,prefixChecks,browserChecks:checks,sourceParity:'canonical/mirror/display/clipboard/download/offline exact',controls:'all presets/endpoints/rewind/reset/predictions/locales/keyboard/deep links pass',denial:'clipboard and storage denied in both locales: pass',errors,ignored,zoom:'CSS root zoom=2; browser-menu zoom not exercised'};
 fs.writeFileSync(path.join(evidence,'browser-check.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
