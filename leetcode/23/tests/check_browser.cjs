'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),evidence=path.join(root,'evidence'),base='http://127.0.0.1:18770/leetcode/23/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const sandbox={};vm.runInNewContext(fs.readFileSync(path.join(root,'../hard-first-ten/core.js'),'utf8'),sandbox);
let modelCases=0,frameChecks=0;
const atoms=[[],[-1],[0],[1],[-1,-1],[-1,0],[-1,1],[0,0],[0,1],[1,1]];
function model(input){
 const original=JSON.stringify(input),trace=JSON.parse(JSON.stringify(sandbox.HardModels[23](input)));
 assert.equal(JSON.stringify(input),original);
 assert.deepEqual(trace.result,input.flat().sort((a,b)=>a-b));
 for(const f of trace.frames){
  const counts=input.map(()=>0),emitted=[];
  for(const s of f.output){const [id,value]=s.split(' = '),[src,index]=id.split(':').map(Number);assert.equal(index,counts[src]++);assert.equal(+value,input[src][index]);emitted.push(+value);}
  assert.deepEqual(emitted,[...emitted].sort((a,b)=>a-b));
  const seen=new Set();
  f.heap.forEach((n,i)=>{assert.ok(!seen.has(n.source));seen.add(n.source);assert.equal(n.index,counts[n.source]);assert.equal(n.value,input[n.source][n.index]);if(i){const p=f.heap[(i-1)>>1];assert.ok(p.value<n.value||(p.value===n.value&&p.source<n.source));}});
  const pending=f.code.startsWith('_, source, node')?f.selected.source:-1;
  input.forEach((a,s)=>assert.equal(seen.has(s),counts[s]<a.length&&s!==pending));
  frameChecks++;
 }
 modelCases++;
}
for(const a of atoms)for(const b of atoms)for(const c of atoms)model([a,b,c]);
for(const input of [[[-2,4],[],[-2,0,5]],[[1,100],[2,3]],[[1,100],[2]],[],[[],[1,1],[1],[]]])model(input);
(async()=>{
 const ext=path.join(__dirname,'zoom-extension'),profile=path.join(evidence,'native-zoom-profile');
 const ctx=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,ignoreDefaultArgs:['--disable-extensions'],args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`],viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
 const errors=[],ignored=[],checks=[],zoomEvidence=[];
 function track(page){page.on('console',m=>{if(m.type()==='error'){const url=m.location().url;if(url.endsWith('/favicon.ico'))ignored.push({url,message:m.text()});else errors.push({url,message:m.text()});}});page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400){if(r.url().endsWith('/favicon.ico'))ignored.push(r.status()+' '+r.url());else errors.push(r.status()+' '+r.url());}});}
 try{
 const worker=ctx.serviceWorkers()[0]||await ctx.waitForEvent('serviceworker');
 const page=await ctx.newPage();track(page);await page.goto(base);await page.waitForFunction(()=>window.lessonSnapshot&&document.querySelector('#message').textContent);
 const zoom=async factor=>worker.evaluate(async({url,factor})=>{const tab=(await chrome.tabs.query({})).find(t=>t.url.startsWith(url));await chrome.tabs.setZoom(tab.id,factor);return await chrome.tabs.getZoom(tab.id);},{url:base,factor});
 for(const name of ['index.html','copy.js','solution.py','python-code.js'])assert.equal(await (await page.request.get(base+name)).text(),fs.readFileSync(path.join(root,name),'utf8'));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(const key of ['nodeBasics','hand','heapExample','linkIntro','link1Change','link3Change','linkLedger','pointerCode'])assert.ok((await page.locator(`[data-i18n="${key}"]`).textContent()).length>30);
  for(let preset=0;preset<3;preset++){
   await page.locator('#preset').selectOption(String(preset));const initial=await page.evaluate(()=>lessonSnapshot().frame);assert.ok(await page.locator('#prev').isDisabled());
   if(preset!==2){await page.locator('#next').click();const first=await page.evaluate(()=>lessonSnapshot().frame);await page.locator('#prev').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),initial);await page.locator('#next').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),first);}
   await page.locator('#position').fill(await page.locator('#position').getAttribute('max'));assert.ok(await page.locator('#next').isDisabled());assert.deepEqual((await page.evaluate(()=>lessonSnapshot().frame)).result,[[1,1,2,3,4,4,5,6],[1,1,1],[]][preset]);
   await page.locator('#reset').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),initial);
  }
  for(let choice=0;choice<3;choice++){await page.locator(`[name="prediction"][value="${choice}"]`).check();assert.equal(await page.evaluate(()=>lessonSnapshot().revealed),false);await page.locator('#reveal').click();assert.equal(await page.evaluate(()=>lessonSnapshot().revealed),true);assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),choice===1);}
  await page.locator('#preset').selectOption('0');await page.locator('#position').fill('3');await page.locator('#beforeDetails').evaluate(e=>e.open=true);
  const snapshot=await page.evaluate(()=>lessonSnapshot());assert.equal(snapshot.frame.selected.source,1);assert.equal(snapshot.frame.selected.index,0);
  assert.deepEqual(snapshot.frame.output,['0:0 = 1','1:0 = 1']);
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snapshot);await page.locator(`[data-lang="${lang}"]`).click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} width ${width}`);
   assert.deepEqual(await page.locator('[data-i18n]').evaluateAll(ns=>ns.filter(n=>!n.textContent.trim()).map(n=>n.dataset.i18n)),[]);
   assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snapshot);
   for(const target of ['linkBridge','diagram'])await page.locator('#'+target).screenshot({path:path.join(evidence,`${lang}-${width}-${target}.png`)});
   checks.push(`${lang} ${width}: populated bilingual copy, no document overflow, exact trace/quiz preservation`);
  }
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const promised=page.waitForEvent('download');await page.locator('a[download]').click();const download=await promised;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  // Native browser zoom, via Chromium's tabs API. No CSS zoom or page-scale emulation.
  await page.setViewportSize({width:1440,height:1000});const before=await page.evaluate(()=>({innerWidth,devicePixelRatio,cssZoom:getComputedStyle(document.documentElement).zoom}));
  assert.equal(await zoom(2),2);await page.waitForFunction(()=>innerWidth===720&&devicePixelRatio===2);
  const native=await page.evaluate(()=>({innerWidth,devicePixelRatio,cssZoom:getComputedStyle(document.documentElement).zoom,scrollWidth:document.documentElement.scrollWidth}));
  assert.equal(native.cssZoom,'1');assert.ok(native.scrollWidth<=native.innerWidth);assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snapshot);
  // Playwright surface captures are blank under this Chromium's native zoom.
  // Capture the actual compositor viewport through CDP, without surface emulation.
  const cdp=await ctx.newCDPSession(page);
  for(const [name,selector] of [['linkBridge','#linkBridge'],['linkTable','#linkBridge table'],['linkLedger','[data-i18n="linkLedger"]'],['diagram','#diagram'],['heap','#diagram .heap-levels'],['ledger','#diagram .ledger'],['hand','[data-i18n="hand"]'],['controls','.controls'],['pointerCode','[data-i18n="pointerCode"]']]){
   await page.evaluate(selector=>{const target=document.querySelector(selector),nav=document.querySelector('.step-nav');window.scrollTo({top:scrollY+target.getBoundingClientRect().top-nav.getBoundingClientRect().height-12,behavior:'instant'});},selector);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const raw=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:false});
   const pixels=Buffer.from(raw.data,'base64');assert.ok(pixels.length>10000,'populated native screenshot');
   fs.writeFileSync(path.join(evidence,`${lang}-native200-${name}.png`),pixels);
  }
  await cdp.detach();
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>lessonSnapshot().index),4);
  await page.locator('#prev').focus();await page.keyboard.press('Space');assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),snapshot);
  await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>lessonSnapshot().index),4);
  await page.locator('#reset').click();assert.equal(await page.evaluate(()=>lessonSnapshot().index),0);
  await page.locator('#preset').selectOption('2');assert.ok(await page.locator('#next').isDisabled());await page.locator('#preset').selectOption('0');await page.locator('#position').fill('3');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.step-nav a[href="#step2"]').click();
  assert.ok(await page.evaluate(()=>document.querySelector('#step2 h2').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
  zoomEvidence.push({lang,api:'chrome.tabs.setZoom / chrome.tabs.getZoom',reportedZoom:2,before,after:native,operation:'Enter Next, Space Rewind, range ArrowRight, Reset, empty preset, sticky navigation: pass'});
  assert.equal(await zoom(1),1);await page.waitForFunction(()=>innerWidth===1440&&devicePixelRatio===1);
 }
 for(const href of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('https:')))){
  const url=new URL(href,base),res=await page.request.get(url.href.split('#')[0]);assert.ok(res.ok());if(url.hash)assert.ok((await res.text()).includes(`id="${url.hash.slice(1)}"`));
 }
 const denied=await ctx.newPage();track(denied);await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied');}}});});await denied.goto(base);await denied.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['en','zh']){await denied.locator(`[data-lang="${lang}"]`).click();await denied.locator('#copy').click();assert.ok(await denied.locator('#manualCopy').isVisible());assert.equal(await denied.locator('#copyText').inputValue(),source);assert.equal(await denied.evaluate(()=>document.activeElement.id),'copyText');await denied.locator('#next').click();}
 const offline=await ctx.newPage();track(offline);await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['en','zh']){await offline.locator(`[data-lang="${lang}"]`).click();assert.equal(await offline.locator('#pythonCode').textContent(),source);assert.ok((await offline.locator('[data-i18n="link3Change"]').textContent()).includes('0:0.next'));await offline.locator('#next').click();}
 assert.deepEqual(errors,[]);
 const result={kind:'author self-check',modelCases,frameChecks,checks,zoomEvidence,sourceParity:'canonical/mirror/display/clipboard/streamed download/offline exact',regressions:'all presets, endpoints, rewind/replay, reset, slider, all quiz options, stale feedback, locale state, keyboard, links, denied storage/clipboard, offline',errors,ignored};
 fs.writeFileSync(path.join(evidence,'browser-check.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
 }finally{await ctx.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});
