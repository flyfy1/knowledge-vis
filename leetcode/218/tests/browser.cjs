'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),BASE=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/218/';
fs.mkdirSync(OUT,{recursive:true});const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
 const page=await ctx.newPage();page.setDefaultTimeout(8000);const errors=[],assets=[],external=[],checks=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)assets.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(new URL(BASE).origin)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(BASE);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const snap=()=>page.evaluate(()=>Object.fromEntries(['progress','event','heap','ops','ledger','output','skyline'].map(id=>[id,document.getElementById(id).innerHTML])));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<6;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());const n=+(await page.locator('#position').getAttribute('max')),states=[await snap()];
   for(let k=1;k<=n;k++){await page.locator('#next').click();states.push(await snap());assert.equal(await page.locator('#ledger tr').count(),k);}
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const oracle=await page.evaluate(()=>{const bs=Skyline.presets[+document.getElementById('preset').value],r=[];for(const x of [...new Set(bs.flatMap(b=>b.slice(0,2)))].sort((a,b)=>a-b)){const h=Math.max(0,...bs.filter(b=>b[0]<=x&&x<b[1]).map(b=>b[2]));if(!r.length||r.at(-1)[1]!==h)r.push([x,h]);}return JSON.stringify(r);});
   assert((await page.locator('#output').innerText()).includes(oracle));
   for(let k=n-1;k>=0;k--){await page.locator('#prev').click();assert.deepEqual(await snap(),states[k]);}
   await page.locator('#next').click();assert.deepEqual(await snap(),states[1]);await page.locator('#end').click();assert.deepEqual(await snap(),states[n]);
   await page.locator('#reset').click();assert.deepEqual(await snap(),states[0]);checks.push(`${lang}: preset ${p}, every endpoint and rewind`);
  }
  for(const v of ['0','1','2']){await page.locator(`[name=prediction][value="${v}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').innerText()).includes('[3,6]'));}
 }
 await page.locator('#preset').selectOption('3');await page.locator('#position').fill('4');await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#preset').inputValue(),'3');assert.equal(await page.locator('#position').inputValue(),'4');assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 await page.locator('#reset').click();assert(await page.locator('#feedback').isVisible());
 assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const pending=page.waitForEvent('download');await page.locator('a[download]').click();const download=await pending;assert.equal(download.suggestedFilename(),'solution.py');assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);}
 await page.locator('#manualCopy').screenshot({path:path.join(OUT,'copy-fallback.png')});
 await page.locator('#preset').selectOption('0');await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'1');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
 const focus=await page.locator('#next').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowRight');assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isHidden());
 const related=await page.locator('.related a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));for(const href of related){const [file,hash]=href.split('#');const r=await ctx.request.get(new URL(file,BASE).href);assert(r.ok());assert((await r.text()).includes(`id="${hash}"`));}
 const geometry=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await page.locator(`[data-lang=${lang}]`).click();await page.locator('#preset').selectOption('3');await page.locator('#position').fill('4');
  const g=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,svgWidth:document.getElementById('skyline').getBoundingClientRect().width,heap:[...document.querySelectorAll('#heap li')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,text:e.innerText})),controls:[...document.querySelectorAll('button,select')].filter(e=>e.getBoundingClientRect().width).map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))}));
  assert(g.scroll<=g.width+1,JSON.stringify({lang,width,zoom,g}));assert(g.svgWidth>=560*zoom-1);assert(g.controls.every(v=>v.w>=48*zoom-1&&v.h>=48*zoom-1));
  await page.locator('#diagram').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.evaluate(()=>window.scrollBy({top:-document.querySelector('nav').getBoundingClientRect().height-16,behavior:'instant'}));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-diagram.png`)});
  await page.locator('#heap').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));await page.evaluate(()=>window.scrollBy({top:-document.querySelector('nav').getBoundingClientRect().height-16,behavior:'instant'}));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-heap.png`)});
  geometry.push({lang,width,zoom,...g});
 }
 await page.setViewportSize({width:320,height:1000});await page.locator('#diagram').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert((await page.locator('#diagram').evaluate(e=>e.scrollLeft))>0);await page.locator('#diagram').evaluate(e=>e.scrollLeft=e.scrollWidth);await page.screenshot({path:path.join(OUT,'diagram-right-edge.png')});
 await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:1440,height:1000});
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('.step-nav a[href="#step3"]').click();await page.waitForTimeout(350);const top=await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top);const nav=await page.locator('nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=nav-2);}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.keyboard.press('Tab');await page.locator('#reset').focus();assert.equal(await page.locator('#reset').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.screenshot({path:path.join(OUT,'forced-colors-focus.png')});
 // Actual rendered color pairs plus focus/diagram roles.
 await page.emulateMedia({forcedColors:'none'});await page.locator('#reset').click();
 const pairs=await page.evaluate(()=>{const ids=['#progress','#event','#output','#heap li','.hint','.btn:disabled','.btn.primary','.lang-toggle button.active'];return ids.map(s=>{const e=document.querySelector(s),c=getComputedStyle(e);let p=e,bg=c.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {selector:s,fg:c.color,bg};});});
 function lum(c){const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 function ratio(a,b){let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 for(const p of pairs){p.ratio=ratio(p.fg,p.bg);assert(p.ratio>=4.5,JSON.stringify(p));}
 const boundaryPairs=['.btn','select','.lang-toggle','.scroll'].map(selector=>({selector}));for(const pair of boundaryPairs){const values=await page.locator(pair.selector).first().evaluate(e=>({border:getComputedStyle(e).borderTopColor,bg:getComputedStyle(e).backgroundColor}));pair.border=values.border;pair.ratio=ratio(values.border,'rgb(13,17,23)');assert(pair.ratio>=3);}
 const focusPairs=['rgb(13,17,23)','rgb(22,27,34)','rgb(28,35,48)'].map(bg=>({fg:'rgb(255,180,84)',bg,ratio:ratio('rgb(255,180,84)',bg)}));assert(focusPairs.every(x=>x.ratio>=3));
 // Blocked storage and offline/local-file source: shared locale must recover.
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});const op=await offline.newPage();let offlineErrors=[];op.on('pageerror',e=>offlineErrors.push(String(e)));await op.goto('file://'+path.join(P,'index.html'));await op.locator('[data-lang=zh]').click();assert.equal(await op.locator('#pythonCode').textContent(),source);await op.locator('#next').click();assert.equal(await op.locator('#position').inputValue(),'1');assert.deepEqual(offlineErrors,[]);await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(assets,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.join(P,'../style.css')).size+fs.statSync(path.join(P,'style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({status:'passed',checks,geometry,focus,contrast:pairs,focusContrast:focusPairs,boundaryContrast:boundaryPairs,cssBytes,errors,assets,external,sourceParity:'display/clipboard/download/fallback exact',zoomMethod:'Chromium CSS zoom=2; fixed-width diagram scroll region; viewport screenshots',offline:'local-file, denied storage passed'},null,2));
 await browser.close();console.log('Browser checks passed; '+geometry.length+' locale/width/zoom configurations.');
})().catch(e=>{console.error(e);process.exit(1);});
