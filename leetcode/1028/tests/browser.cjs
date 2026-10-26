'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1028/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const expected=[[[8,null,null]],[[1,null,null]]]; // Concrete assertions below use independent expected edge tables.
const edges=[[[8,null,'root'],[3,0,'left'],[6,1,'left'],[5,0,'right']],[[1,null,'root'],[2,0,'left'],[3,1,'left'],[4,1,'right'],[5,0,'right'],[6,4,'left'],[7,4,'right']],[[1,null,'root'],[2,0,'left'],[3,1,'left'],[4,2,'left'],[5,0,'right'],[6,4,'left'],[7,5,'left']],[[1,null,'root'],[401,0,'left'],[349,1,'left'],[90,2,'left'],[88,1,'right']],[[1000000000,null,'root']],[[2,null,'root'],[2,0,'left'],[2,1,'left'],[2,2,'left']],[[8,null,'root'],[3,0,'left'],[6,1,'left'],[2,2,'left'],[5,0,'right']],[[9,null,'root'],[4,0,'left'],[1,1,'left'],[4,1,'right'],[4,0,'right']]];
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],assets=[],external=[],report={kind:'author self-check; independent review pending',host:process.platform,version:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],contrast:[],links:[],errors,assets,external};
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)assets.push([r.url(),r.status()]);});page.on('requestfailed',r=>assets.push([r.url(),r.failure()]));page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:'0/10'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const snapshot=()=>page.evaluate(()=>['tree','path','ledger','event','progress','tokenStrip'].map(id=>document.getElementById(id).innerHTML));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),lang==='en'?'#1028 · Recover a Tree From Preorder Traversal':'#1028 · 从先序遍历还原二叉树');assert.equal(await page.title(),lang==='en'?'1028 · Recover a Tree From Preorder Traversal':'1028 · 从先序遍历还原二叉树');
  for(let p=0;p<8;p++){
   await page.selectOption('#preset',String(p));const start=await snapshot();assert(await page.locator('#prev').isDisabled());let count=0;
   while(await page.locator('#next').isEnabled()){
    const before=await snapshot();await page.locator('#next').click();const after=await snapshot();await page.locator('#prev').click();assert.deepEqual(await snapshot(),before);await page.locator('#next').click();assert.deepEqual(await snapshot(),after);count++;
   }
   const nodes=await page.locator('#tree .tree-card').allTextContents();assert.equal(nodes.length,edges[p].length);
   for(let i=0;i<nodes.length;i++){
    const [v,parent,side]=edges[p][i];assert(nodes[i].includes(lang==='en'?`#${i} · value ${v}`:`#${i} · 值 ${v}`));
    assert(nodes[i].includes(parent===null?(lang==='en'?'Root':'根'):lang==='en'?`Parent #${parent} · ${side==='left'?'Left L':'Right R'}`:`父 #${parent} · ${side==='left'?'左 L':'右 R'}`));
   }
   assert(await page.locator('#end').isDisabled());report.presets.push({lang,p,operations:count,nodes,final:await page.locator('#progress').textContent()});
   await page.locator('#reset').click();assert.deepEqual(await snapshot(),start);await page.locator('#end').click();
  }
  await page.selectOption('#preset','0');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');
  assert((await page.locator('#event').textContent()).includes(lang==='en'?'Parse #0':'解析 #0'));
  // After root attachment current-operation and on-path labels coexist independently.
  await page.locator('#next').click();const root=page.locator('#tree .tree-card[data-node="0"]');assert.equal(await root.locator('.operation-marker').textContent(),lang==='en'?'Current':'当前');assert.equal(await root.locator('.membership').textContent(),lang==='en'?'On path':'路径内');assert.equal(await root.evaluate(e=>getComputedStyle(e).borderTopWidth),'2px');
  await root.screenshot({path:path.join(out,`overlap-${lang}.png`)});
  for(let i=0;i<6;i++)await page.locator('#next').click(); // after first pop for token 5
  assert.equal(await page.locator('#tree .tree-card').count(),3);assert.equal(await page.locator('#path .path-item').count(),2);
  await page.locator('#next').click();assert.equal(await page.locator('#path .path-item').count(),1);assert.equal(await page.locator('#tree .tree-card').count(),3);
  await page.locator('#next').click();assert.equal(await page.locator('#tree .tree-card').count(),4);
  report.semantics.push({lang,finalTiny:await page.locator('#tree').textContent(),formula:await page.locator('[data-i18n=formula]').textContent()});
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),lang==='en'?'Before attachment: len(path) = depth; after attachment: len(path) = depth + 1, path[depth] = new node.':'接入前：len(path) = depth；接入后：len(path) = depth + 1，path[depth] = 新节点。');
  let handCount=0;while(await page.locator('#handNext').isEnabled()){await page.locator('#handNext').click();handCount++;}assert.equal(handCount,4);assert.equal(await page.locator('#handTree .tree-card').count(),4);while(await page.locator('#handPrev').isEnabled())await page.locator('#handPrev').click();
  for(let opt=0;opt<3;opt++){
   await page.locator(`[name=prediction][value="${opt}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('[7,4,9]'));
   const state=await snapshot();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snapshot(),state);report.semantics.push({lang,opt,feedback});
  }
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  const sentinel=`1028-${lang}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('clipboard sentinel mismatch');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  report.clipboard.push({lang,sentinelResetVerified:true,nativeCopy:true,fallbackShortcut:process.platform==='darwin'?'Meta+C':'Control+C',exactSource:true});
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await download.saveAs(path.join(out,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(out,`download-${lang}.py`),'utf8'),source);
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.selectOption('#preset','3');await page.locator('#end').click();
   await page.locator('#tree').scrollIntoViewIfNeeded();await page.evaluate(()=>{const e=document.getElementById('tree');scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});await page.waitForTimeout(60);
   const geo=await page.evaluate(()=>({page:document.documentElement.scrollWidth,view:innerWidth,cards:[...document.querySelectorAll('#tree .tree-card')].map(e=>({w:e.clientWidth,sw:e.scrollWidth})),controls:[...document.querySelectorAll('button,select,.btn')].map(e=>({h:e.getBoundingClientRect().height})),select:(()=>{const e=document.getElementById('preset'),s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {label:e.selectedOptions[0].textContent,width:e.getBoundingClientRect().width/Number(document.body.style.zoom||1),text:c.measureText(e.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),arrowReserve:24,font:s.font,fontStack:s.fontFamily};})()}));
   assert(geo.page<=geo.view+1,JSON.stringify({lang,width,zoom,geo}));assert(geo.cards.every(e=>e.sw<=e.w+1));assert(geo.controls.every(e=>e.h>=48*zoom-1));assert(geo.select.text+geo.select.padding+geo.select.arrowReserve<=geo.select.width);report.layouts.push({lang,width,zoom,zoomMethod:'CSS content zoom (reflow)',...geo});
   if(width===320||width===1440&&zoom===1){await page.screenshot({path:path.join(out,`trace-${lang}-${width}-z${zoom}.png`)});await page.locator('#tree').screenshot({path:path.join(out,`tree-${lang}-${width}-z${zoom}.png`)});}
   if(width===320&&zoom===2){await page.locator('[data-i18n=formula]').screenshot({path:path.join(out,`formula-${lang}.png`)});await page.locator('.site-head').screenshot({path:path.join(out,`header-${lang}-320-z2.png`)});await page.locator('#preset').screenshot({path:path.join(out,`select-${lang}.png`)});}
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});
  await page.locator('#sourceDetails').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`source-${lang}.png`)});
 }
 for(const a of await page.locator('a[href*="#"]').all()){
  const href=await a.getAttribute('href'),u=new globalThis.URL(href,URL);const text=await(await context.request.get(u.href)).text();assert(text.includes(`id="${u.hash.slice(1)}"`),href);report.links.push(href);
 }
 await page.locator('.step-nav a[href="#step3"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(new globalThis.URL(page.url()).hash,'#step3');assert((await page.locator('#step3').boundingBox()).y>=60);
 // Measured rendered foreground/background pairs; calibrated sRGB luminance.
 const pairs=await page.evaluate(()=>['.explain','.hint','.readout','button:disabled','.lang-toggle button.active','.tree-card .identity','.tree-card .membership','.step-nav a','.token.current small'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let bg=s.backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {sel,fg:s.color,bg};}));
 const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 assert.equal(lum('rgb(0,0,0)'),0);assert.equal(lum('rgb(255,255,255)'),1);assert.equal(lum('rgb(255,0,0)'),.2126);assert.equal(lum('rgb(0,255,0)'),.7152);assert.equal(lum('rgb(0,0,255)'),.0722);assert.equal((1+.05)/.05,21);assert((lum('rgb(116,116,116)')+.05)/.05<4.5);
 for(const pair of pairs){const a=lum(pair.fg),b=lum(pair.bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,JSON.stringify(pair));report.contrast.push({...pair,ratio});}
 for(const [fg,bg] of [['rgb(255,180,84)','rgb(13,17,23)'],['rgb(255,180,84)','rgb(22,27,34)'],['rgb(255,180,84)','rgb(28,35,48)']]){const ratio=(lum(fg)+.05)/(lum(bg)+.05);assert(ratio>=3);report.contrast.push({role:'focus',fg,bg,ratio});}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 const linkPage=await context.newPage();
 for(const lang of ['zh','en']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const key of ['link2','link3']){
   const link=page.locator(`[data-i18n=${key}]`),href=await link.getAttribute('href'),label=await link.textContent();await linkPage.goto(new globalThis.URL(href,URL).href);await linkPage.locator(`[data-lang=${lang}]`).click();
   const target=linkPage.locator(new globalThis.URL(href,URL).hash),text=await target.textContent();assert(key==='link2'?text.includes('#'):text.includes('col')&&text.includes('row'));
   report.links.push({lang,label,href,observed:text.slice(0,1800)});
  }
 }
 await linkPage.close();
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const d=await denied.newPage();d.on('pageerror',e=>errors.push(String(e)));await d.goto(URL);await d.locator('[data-lang=zh]').click();assert.equal(await d.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.locator('#progress').filter({hasText:'0/10'}).waitFor();assert.equal(await offline.locator('#code').textContent(),source);await offline.close();
 assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(assets.length,0,JSON.stringify(assets));assert.equal(external.length,0,JSON.stringify(external));
 report.cssBytes=fs.statSync(path.join(ROOT,'../style.css')).size+fs.statSync(path.join(ROOT,'style.css')).size;assert(report.cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,presets:report.presets.length,layouts:report.layouts.length,cssBytes:report.cssBytes,clipboard:report.clipboard}));await context.close();
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
