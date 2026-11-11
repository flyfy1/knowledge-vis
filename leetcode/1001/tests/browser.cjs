'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1001/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],assets=[],external=[],report={kind:'author self-check; independent review pending',host:process.platform,version:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],contrast:[],links:[],errors,assets,external};
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)assets.push([r.url(),r.status()]);});page.on('requestfailed',r=>assets.push([r.url(),r.failure()]));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:'0/4'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const expected=[[1,1],[1,0],[1,1],[1,1,0],[1,1],[0,0],[1,0],[]];
 const snapshot=()=>page.evaluate(()=>['board','active','rows','cols','down','up','ledger','event','progress'].map(id=>document.getElementById(id).innerHTML));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),lang==='en'?'#1001 · Grid Illumination':'#1001 · 网格照明');assert.equal(await page.title(),lang==='en'?'1001 · Grid Illumination':'1001 · 网格照明');assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/grid-illumination/');
  for(let p=0;p<8;p++){
   await page.selectOption('#preset',String(p));const start=await snapshot();assert(await page.locator('#prev').isDisabled());
   let count=0;
   while(await page.locator('#next').isEnabled()){
    const before=await snapshot();await page.locator('#next').click();const after=await snapshot();await page.locator('#prev').click();assert.deepEqual(await snapshot(),before);await page.locator('#next').click();assert.deepEqual(await snapshot(),after);count++;
   }
   assert.equal(count,expected[p].length*2);assert((await page.locator('#progress').textContent()).endsWith(JSON.stringify(expected[p])));assert(await page.locator('#end').isDisabled());
   report.presets.push({lang,p,operations:count,expected:expected[p],final:await page.locator('#progress').textContent()});
   if(p!==7){await page.locator('#reset').click();assert.deepEqual(await snapshot(),start);await page.locator('#end').click();}
  }
  // Worked example: read precedes removal, two sources become one.
  await page.selectOption('#preset','0');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');
  assert.equal(await page.locator('#rows').textContent(),'0 → 2');assert((await page.locator('#event').textContent()).includes('[2, 0, 0, 0]'));
  await page.locator('#next').click();assert.equal(await page.locator('#rows').textContent(),'0 → 1');assert.equal(await page.locator('#active').textContent(),'[[0,3]]');
  report.semantics.push({lang,phase:'remove',event:await page.locator('#event').textContent(),row:await page.locator('#rows').textContent(),formula:await page.locator('[data-i18n=formula]').textContent()});
  const handStates=[];while(await page.locator('#handNext').isEnabled()){await page.locator('#handNext').click();handStates.push(await page.locator('#handText').textContent());}assert.equal(handStates.length,4);while(await page.locator('#handPrev').isEnabled())await page.locator('#handPrev').click();
  for(let opt=0;opt<3;opt++){
   await page.locator(`[name=prediction][value="${opt}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('[1,1,0]'));
   const state=await snapshot();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snapshot(),state);report.semantics.push({lang,opt,feedback});
  }
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  const sentinel=`1001-${lang}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('clipboard sentinel mismatch');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  report.clipboard.push({lang,sentinelResetVerified:true,nativeCopy:true,fallbackShortcut:process.platform==='darwin'?'Meta+C':'Control+C',exactSource:true});
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await download.saveAs(path.join(out,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(out,`download-${lang}.py`),'utf8'),source);
  // Lamp and current-query markers overlap without losing either identity.
  await page.selectOption('#preset','6');await page.locator('#next').click();const overlap=page.locator('#board .cell');assert.equal(await overlap.textContent(),'LQ');assert(await overlap.evaluate(e=>getComputedStyle(e).outlineStyle==='solid'&&getComputedStyle(e).borderTopWidth==='2px'));
  await overlap.screenshot({path:path.join(out,`overlap-${lang}.png`)});
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),lang==='en'?'Lit ⇔ rows[r]>0 OR cols[c]>0 OR down[r−c]>0 OR up[r+c]>0':'有光 ⇔ rows[r]>0 或 cols[c]>0 或 down[r−c]>0 或 up[r+c]>0');
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.selectOption('#preset','3');await page.locator('#next').click();await page.locator('#next').click();
   await page.locator('#boardWrap').scrollIntoViewIfNeeded();await page.evaluate(()=>{const e=document.getElementById('boardWrap');scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});await page.waitForTimeout(100);
   const geo=await page.evaluate(()=>({page:document.documentElement.scrollWidth,view:innerWidth,cells:[...document.querySelectorAll('#board .cell')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),state:[...document.querySelectorAll('.state-grid>div')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth})),controls:[...document.querySelectorAll('button,select,.btn,.back-link,.official-link,.related a')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))}));
   assert(geo.page<=geo.view+1,JSON.stringify({lang,width,zoom,geo}));assert(geo.cells.every(e=>e.w>=36*zoom-1));assert(geo.state.every(e=>e.scroll<=e.width+1));assert(geo.controls.every(e=>e.h>=48*zoom-1));report.layouts.push({lang,width,zoom,...geo});
   if(width===320||width===1440&&zoom===1)await page.screenshot({path:path.join(out,`trace-${lang}-${width}-z${zoom}.png`)});
   if(width===320&&zoom===2){
    for(const id of ['active','rows','cols','down','up']){
     const card=page.locator('#'+id).locator('..');await card.scrollIntoViewIfNeeded();await card.evaluate(e=>scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20));await page.waitForTimeout(50);await card.screenshot({path:path.join(out,`state-card-${id}-${lang}.png`)});
    }
    await page.locator('#boardWrap').focus();const before=await page.locator('#boardWrap').evaluate(e=>e.scrollLeft);for(let k=0;k<8;k++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await page.locator('#boardWrap').evaluate(e=>e.scrollLeft)>before);await page.locator('#boardWrap').screenshot({path:path.join(out,`board-scroll-${lang}.png`)});
    
    await page.locator('[data-i18n=formula]').screenshot({path:path.join(out,`formula-${lang}.png`)});
    await page.locator('.site-head').screenshot({path:path.join(out,`header-${lang}-320-z2.png`)});
   }
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});
  await page.locator('#sourceDetails').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`source-${lang}.png`)});
 }
 // Deep anchors and actual keyboard navigation to the local simulation.
 for(const a of await page.locator('a[href*="#"]').all()){
  const href=await a.getAttribute('href'),u=new globalThis.URL(href,URL);const text=await(await context.request.get(u.href)).text();assert(text.includes(`id="${u.hash.slice(1)}"`),href);report.links.push(href);
 }
 await page.locator('.step-nav a[href="#step3"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(new globalThis.URL(page.url()).hash,'#step3');assert((await page.locator('#step3').boundingBox()).y>=60);
 await page.locator('#boardWrap').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.id),'boardWrap');
 // Rendered palette pairs, including disabled and focus roles.
 const pairs=await page.evaluate(()=>['.explain','.hint','.readout','button:disabled','.lang-toggle button.active','.cell.lamp','.cell.lit:not(.lamp)','.step-nav a'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let bg=s.backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {sel,fg:s.color,bg};}));
 const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 // Calibrate the very same luminance helper, including a near-threshold fail.
 assert.equal(lum('rgb(0,0,0)'),0);assert.equal(lum('rgb(255,255,255)'),1);
 assert.equal(lum('rgb(255,0,0)'),.2126);assert.equal(lum('rgb(0,255,0)'),.7152);assert.equal(lum('rgb(0,0,255)'),.0722);
 assert.equal((lum('rgb(255,255,255)')+.05)/(lum('rgb(0,0,0)')+.05),21);
 const near=(lum('rgb(116,116,116)')+.05)/.05;assert(Math.abs(near-4.492948)<.000001);assert(near<4.5);report.contrastCalibration={black:0,white:1,primaries:[.2126,.7152,.0722],blackWhite:21,nearThreshold:near};
 for(const pair of pairs){const a=lum(pair.fg),b=lum(pair.bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,JSON.stringify(pair));report.contrast.push({...pair,ratio});}
 for(const [fg,bg] of [['rgb(255,180,84)','rgb(13,17,23)'],['rgb(255,180,84)','rgb(22,27,34)']])assert((lum(fg)+.05)/(lum(bg)+.05)>=3);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.screenshot({path:path.join(out,'forced-colors.png')});
 const linkPage=await context.newPage();
 for(const lang of ['zh','en']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const key of ['link2','link3']){
   const link=page.locator(`[data-i18n=${key}]`),href=await link.getAttribute('href'),label=await link.textContent();await linkPage.goto(new globalThis.URL(href,URL).href);await linkPage.locator(`[data-lang=${lang}]`).click();
   const target=linkPage.locator(new globalThis.URL(href,URL).hash);const text=await target.textContent();assert(key==='link2'?text.includes('r−c')&&text.includes('r+c'):text.includes('2kS')&&text.includes('k²m'));
   report.links.push({lang,label,href,observed:text.slice(0,1200)});
  }
 }
 await linkPage.close();
 // Denied storage and an offline file:// opening still render both code and trace.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const d=await denied.newPage();d.on('pageerror',e=>errors.push(String(e)));await d.goto(URL);await d.locator('[data-lang=zh]').click();assert.equal(await d.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.locator('#progress').filter({hasText:'0/4'}).waitFor();assert.equal(await offline.locator('#code').textContent(),source);await offline.close();
 assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(assets.length,0,JSON.stringify(assets));assert.equal(external.length,0,JSON.stringify(external));
 report.cssBytes=fs.statSync(path.join(ROOT,'../style.css')).size+fs.statSync(path.join(ROOT,'style.css')).size;assert(report.cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,presets:report.presets.length,layouts:report.layouts.length,cssBytes:report.cssBytes,clipboard:report.clipboard}));await context.close();
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
