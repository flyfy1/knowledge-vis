'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/381/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[],coverage=[],screens=[];
 async function stageCapture(name){
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(80);
  const box=await page.locator('#step2 .stage').boundingBox();
  await page.screenshot({path:path.join(out,name),clip:box,fullPage:true});
 }
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.locator('#progress').filter({hasText:/0\/6/}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  for(let p=0;p<4;p++){
   await page.selectOption('#preset',String(p));
   assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const n=[6,6,8,7][p];
   for(let i=1;i<=n;i++){
    await page.locator('#next').click();assert((await page.locator('#progress').innerText()).includes(`${i}/${n}`));
    const state=await page.locator('.snapshots').innerText();
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('.snapshots').innerText(),state);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#ledger li').count(),n);
   while(!await page.locator('#prev').isDisabled())await page.locator('#prev').click();
   assert((await page.locator('#progress').innerText()).includes(`0/${n}`));
   await page.locator('#end').click();await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
   coverage.push({lang,preset:p,actions:'all forward/back frames; end; reset; endpoints; ledger'});
  }
  for(let i=0;i<3;i++){await page.selectOption('#slotPick',String(i));assert((await page.locator('#slotResult').innerText()).includes(i===2?'9':'4'));}
  await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());await page.locator('#handReveal').click();assert(!await page.locator('#handAnswer').isVisible());
  assert(await page.locator('#reveal').isDisabled() || await page.locator('[name="prediction"]:checked').count()===1);
  for(let i=0;i<3;i++){
   await page.locator(`[name="prediction"][value="${i}"]`).check();assert(!(await page.locator('#feedback').innerText()).includes('pos[3]={1}'));
   await page.locator('#reveal').click();const feedback=await page.locator('#feedback').innerText();assert(feedback.includes('pos[3]={1}'));
   assert(feedback.startsWith(lang==='en'?(i===2?'Correct.':'Not yet.'):(i===2?'正确。':'还不对。')));
   coverage.push({lang,prediction:i,feedback});
  }
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert.equal(await page.locator('#pythonSource').textContent(),source);
  const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await downloadPromise;await dl.saveAs(path.join(out,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(out,`download-${lang}.py`),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw Error('denied');}}));
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');
  assert.equal(await page.locator('#copyStatus').innerText(),lang==='en'?'Clipboard unavailable. Source selected for manual copying.':'剪贴板不可用。源码已选中，请手动复制。');
  await page.evaluate(()=>delete navigator.clipboard.writeText);
 }
 // Locale changes preserve trace, choice, reveal, hand disclosure and focus.
 await page.selectOption('#preset','1');for(let i=0;i<4;i++)await page.locator('#next').click();
 await page.locator('[value="2"][name="prediction"]').check();await page.locator('#reveal').click();await page.locator('#handReveal').click();
 const snapshot=await page.locator('.snapshots').innerText();
 await page.locator('[data-lang="en"]').click();await page.locator('[data-lang="zh"]').click();
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'zh');assert((await page.locator('#progress').innerText()).includes('4/6'));assert(await page.locator('[value="2"][name="prediction"]').isChecked());assert((await page.locator('#feedback').innerText()).includes('pos[3]={1}'));assert(await page.locator('#handAnswer').isVisible());assert.equal(await page.locator('.snapshots').innerText(),snapshot);
 // Real keyboard traversal and activation.
 await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.locator('#next').focus();await page.keyboard.press('Space');assert((await page.locator('#progress').innerText()).includes('1/6'));
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 const focus=await page.locator('#reset').evaluate(el=>({width:getComputedStyle(el).outlineWidth,style:getComputedStyle(el).outlineStyle,color:getComputedStyle(el).outlineColor,background:getComputedStyle(el).backgroundColor}));assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 // Deep navigation lands below sticky navigation.
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);assert(await page.locator('#step2').evaluate(el=>el.getBoundingClientRect().top)>=await page.locator('.step-nav').evaluate(el=>el.getBoundingClientRect().height)-2);
 const links=await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.href));
 for(const href of links){const u=new URL(href);if(u.origin!==new URL(url).origin)continue;const response=await context.request.get(u.href.split('#')[0]);assert(response.ok(),href);if(u.hash){assert((await response.text()).includes(`id="${u.hash.slice(1)}"`),href);}}
 // Layout checks at populated states of every preset in both locales.
 for(const width of [320,390,736,1440])for(const lang of ['en','zh']){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang="${lang}"]`).click();
  for(let p=0;p<4;p++){
   await page.selectOption('#preset',String(p));for(let i=0;i<4;i++)await page.locator('#next').click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${lang} ${p} overflow`);
   const boxes=await page.locator('.tile').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,sw:e.scrollWidth,cw:e.clientWidth};}));assert(boxes.every(x=>x.w>=64&&x.sw<=x.cw+2));
   if(p===1){await page.locator('#step2 .stage').scrollIntoViewIfNeeded();const name=`trace-${width}-${lang}.png`;await stageCapture(name);screens.push(name);}
  }
 }
 // 200% browser page zoom via Chromium keyboard-equivalent CSS pixel scaling:
 // CDP device metrics halves available CSS width while screenshot DPR=2.
 await page.setViewportSize({width:720,height:500});
 const cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setDeviceMetricsOverride',{width:720,height:500,deviceScaleFactor:2,mobile:false});
 for(const lang of ['en','zh']){await page.locator(`[data-lang="${lang}"]`).click();await page.selectOption('#preset','1');for(let i=0;i<4;i++)await page.locator('#next').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const name=`zoom200-${lang}.png`;await stageCapture(name);screens.push(name);}
 await cdp.send('Emulation.clearDeviceMetricsOverride');
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const name=`css-zoom200-${lang}.png`;await stageCapture(name);screens.push(name);
 }
 await page.evaluate(()=>document.documentElement.style.zoom='');
 // Inspect the actual nav geometry, not just the page overflow metric.
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:320,height:1000});await page.locator(`[data-lang="${lang}"]`).click();
  const boxes=await page.locator('.step-nav a').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,sw:el.scrollWidth,cw:el.clientWidth};}));
  assert(boxes.every((b,i)=>b.sw<=b.cw+2&&(i===0||b.left>=boxes[i-1].right)));
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(80);const name=`intro-320-${lang}.png`;await page.screenshot({path:path.join(out,name)});screens.push(name);
 }
 const controlGeometry=await page.locator('.btn,select,.lang-toggle button,.step-nav a,.solution-actions a').evaluateAll(els=>els.filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect();return {id:el.id||el.textContent,width:r.width,height:r.height};}));
 assert(controlGeometry.every(r=>r.width>=48&&r.height>=48));
 // Measure actual computed foreground/background pairs, compositing transparent ancestors.
 const contrast=await page.evaluate(()=>{
  function rgb(s){const v=s.match(/[\d.]+/g).map(Number);return [...v.slice(0,3),v[3]??1];}
  function mix(a,b){return a.slice(0,3).map((x,i)=>x*a[3]+b[i]*(1-a[3])).concat(1);}
  function lum(c){return c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
  const all=[];
  for(const el of document.querySelectorAll('p,h1,h2,h3,a,button,select,label,legend,small,b,.positions div,code,footer')){
   if(!el.getClientRects().length||!el.textContent.trim())continue;
   let chain=[],node=el;while(node){chain.push(node);node=node.parentElement;}
   let bg=[255,255,255,1];for(const n of chain.reverse())bg=mix(rgb(getComputedStyle(n).backgroundColor),bg);
   const fg=mix(rgb(getComputedStyle(el).color),bg);const a=lum(fg),b=lum(bg);const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   all.push({selector:el.id||el.className||el.tagName,text:el.textContent.trim().slice(0,70),fg,bg,ratio});
  }
  return all;
 });
 assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast.filter(x=>x.ratio<4.5)));
 await context.close();
 // Storage denial + offline file opening: embedded source needs no HTTP fetch.
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});const op=await offline.newPage();op.on('pageerror',e=>errors.push(String(e)));await op.goto('file://'+path.join(root,'index.html'));await op.locator('#progress').waitFor();await op.locator('[data-lang="en"]').click();await op.locator('#next').click();await op.locator('[data-lang="zh"]').click();assert((await op.locator('#progress').innerText()).includes('1/6'));assert.equal(await op.locator('#pythonSource').textContent(),source);await offline.close();
 assert.equal(errors.length,0,JSON.stringify(errors));assert(requests.every(r=>r.startsWith(new URL(url).origin)||r.startsWith('data:')),requests.join('\n'));
 const report={status:'pass',scope:'author browser self-check, not independent review',coverage,screens,requests:[...new Set(requests)],errors,contrast,controlGeometry,focus,zoom:'Chromium 200% CSS zoom at 1440px plus 720 CSS px at DPR 2; narrow 320/390 CSS px checked separately',checks:['all presets/frames/rewind/end/reset in both locales','prediction choose/reveal/change, all options','state and focus across locale','keyboard Enter/Space/Tab and 3px focus','real clipboard success and forced denial fallback','canonical/display/clipboard/download parity','320/390/736/1440 layouts, both locales, all presets','blocked localStorage and file:// offline initialization','local asset errors and internal links/anchors','computed text contrast >=4.5']};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({status:'pass',screens:screens.length,minContrast:Math.min(...contrast.map(x=>x.ratio)),errors}));
})().catch(e=>{console.error(e);process.exit(1);});
