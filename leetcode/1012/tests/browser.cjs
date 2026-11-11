'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),BASE=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1012/';fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const report={kind:'author browser self-check; independent review pending',host:process.platform,browser:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],links:[],contrast:[],errors:[],assets:[],external:[]};
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)report.assets.push([r.url(),r.status()]);});page.on('requestfailed',r=>report.assets.push([r.url(),r.failure()]));page.on('request',r=>{if(!r.url().startsWith(new URL(BASE).origin)&&!r.url().startsWith('data:'))report.external.push(r.url());});
 await page.goto(BASE);await page.locator('#unique').filter({hasText:'0'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const snapshot=()=>page.evaluate(()=>['event','progress','prefix','used','unique','result','ledger'].map(id=>document.getElementById(id).innerHTML));
 const expected=[1,10,25,69,0,994388230];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');assert.equal(await page.locator('h1').textContent(),lang==='en'?'#1012 · Numbers With Repeated Digits':'#1012 · 至少有 1 位重复的数字');
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));const start=await snapshot();assert(await page.locator('#prev').isDisabled());let count=0;
   while(await page.locator('#next').isEnabled()){
    const before=await snapshot();await page.locator('#next').click();const after=await snapshot();await page.locator('#prev').click();assert.deepEqual(await snapshot(),before);await page.locator('#next').click();assert.deepEqual(await snapshot(),after);count++;
   }
   assert.equal(Number(await page.locator('#result').textContent()),expected[p],JSON.stringify({p,lang}));assert(await page.locator('#end').isDisabled());
   report.presets.push({lang,p,operations:count,answer:expected[p],event:await page.locator('#event').textContent()});
   if(p===1){await page.locator('#event').screenshot({path:path.join(OUT,`stop-${lang}.png`)});}
   await page.locator('#reset').click();assert.deepEqual(await snapshot(),start);await page.locator('#end').click();
  }
  await page.selectOption('#preset','0');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert.equal(await page.locator('#unique').textContent(),'9');assert((await page.locator('#event').textContent()).includes('9 × P(9,0) = 9'));
  await page.locator('#next').click();assert.equal(await page.locator('#unique').textContent(),'18');assert.equal(await page.locator('#ledger .block').count(),2);assert.equal(await page.locator('#ledger .current').count(),1);
  report.semantics.push({lang,phase:'smaller digit block',event:await page.locator('#event').textContent(),formula:await page.locator('[data-i18n=formula]').textContent(),ledger:await page.locator('#ledger').textContent()});
  assert((await page.locator('[data-i18n=formula]').textContent()).includes('P(9−i,D−i−1)'));
  await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isHidden());
  for(let opt=0;opt<3;opt++){
   await page.locator(`[name=prediction][value="${opt}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('121−99=22'));assert(feedback.includes('90+8+1=99'));
   const state=await snapshot();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snapshot(),state);
   report.semantics.push({lang,opt,feedback});if(opt===1)await page.locator('#step4').screenshot({path:path.join(OUT,`quiz-${lang}.png`)});
  }
  await page.selectOption('#preset','2');assert(await page.locator('#feedback').isVisible());
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  const sentinel=`1012-${lang}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel failed');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  report.clipboard.push({lang,sentinelResetVerified:true,nativeCopy:true,fallbackShortcut:process.platform==='darwin'?'Meta+C':'Control+C',exactSource:true});
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await download.saveAs(path.join(OUT,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(OUT,`download-${lang}.py`),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.selectOption('#preset','3');for(let op=0;op<9;op++)await page.locator('#next').click();
   await page.locator('#event').scrollIntoViewIfNeeded();await page.evaluate(()=>{const e=document.getElementById('event');scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-16);});
   const geo=await page.evaluate(()=>({page:document.documentElement.scrollWidth,view:innerWidth,state:[...document.querySelectorAll('.state>div,.block')].map(e=>({w:e.clientWidth,s:e.scrollWidth})),controls:[...document.querySelectorAll('button,select,.btn,.back-link,.official-link,.related a')].map(e=>({id:e.id,text:e.textContent,h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})),font:getComputedStyle(document.getElementById('preset')).font,selectW:document.getElementById('preset').clientWidth}));
   assert(geo.page<=geo.view+1,JSON.stringify({lang,width,zoom,geo}));assert(geo.state.every(e=>e.s<=e.w+1));assert(geo.controls.every(e=>e.h>=48*zoom-1),JSON.stringify({lang,width,zoom,bad:geo.controls.filter(e=>e.h<48*zoom-1)}));
   const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return{width:e.clientWidth,needed:Math.max(...[...e.options].map(o=>c.measureText(o.text).width))+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+24,font:s.font};});assert(budget.width>=budget.needed);report.layouts.push({lang,width,zoom,...geo,selectBudget:budget});
   if(width===320||width===390&&zoom===1||width===1440&&zoom===1){await page.screenshot({path:path.join(OUT,`trace-${lang}-${width}-z${zoom}.png`)});await page.locator('.stage').screenshot({path:path.join(OUT,`stage-${lang}-${width}-z${zoom}.png`)});}
   if(width===320&&zoom===2){await page.locator('.state').screenshot({path:path.join(OUT,`state-${lang}-320-z2.png`)});await page.locator('[data-i18n=formula]').screenshot({path:path.join(OUT,`formula-${lang}.png`)});await page.locator('.site-head').screenshot({path:path.join(OUT,`header-${lang}-320-z2.png`)});}
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});await page.locator('#sourceDetails').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`source-${lang}.png`)});
 }
 // All deep links, and keyboard activation. Follow related destinations in both locales.
 for(const a of await page.locator('a[href*="#"]').all()){
  const href=await a.getAttribute('href'),u=new URL(href,BASE),response=await context.request.get(u.href);assert(response.ok());assert((await response.text()).includes(`id="${u.hash.slice(1)}"`));report.links.push(href);
 }
 await page.locator('.step-nav a[href="#step3"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(150);assert.equal(new URL(page.url()).hash,'#step3');assert((await page.locator('#step3').boundingBox()).y>=60);
 const lp=await context.newPage();await lp.setViewportSize({width:320,height:1000});
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();for(const key of ['link2','link3']){
   const link=page.locator(`[data-i18n=${key}]`),href=await link.getAttribute('href'),label=await link.textContent();await lp.goto(BASE);await lp.locator(`[data-lang=${lang}]`).click();await lp.locator(`[data-i18n=${key}]`).focus();await lp.locator(`[data-i18n=${key}]`).screenshot({path:path.join(OUT,`related-${key}-${lang}-320.png`)});await lp.keyboard.press('Enter');await lp.waitForURL(new URL(href,BASE).href);await lp.locator(`[data-lang=${lang}]`).click();const text=await lp.locator(new URL(href,BASE).hash).textContent();assert(key==='link2'?text.includes('(m−1)!'):text.includes('mʳ'));report.links.push({lang,label,href,observed:text});
  }
 }
 await lp.close();
 const pairs=await page.evaluate(()=>['.explain','.hint','.readout','.lang-toggle button.active','.block.current','.step-nav a'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let bg=s.backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return{sel,fg:s.color,bg};}));
 await page.locator('#reset').click();pairs.push(await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return{sel:'button:disabled',fg:s.color,bg:s.backgroundColor};}));
 const lum=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 assert.equal(lum('rgb(0,0,0)'),0);assert.equal(lum('rgb(255,255,255)'),1);for(const [rgb,v] of [['rgb(255,0,0)',.2126],['rgb(0,255,0)',.7152],['rgb(0,0,255)',.0722]])assert.equal(lum(rgb),v);assert.equal((1+.05)/.05,21);const near=(lum('rgb(116,116,116)')+.05)/.05;assert(Math.abs(near-4.492948)<.000001&&near<4.5);report.contrastCalibration={black:0,white:1,blackWhite:21,nearThreshold:near};
 for(const pair of pairs){const a=lum(pair.fg),b=lum(pair.bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,JSON.stringify(pair));report.contrast.push({...pair,ratio});}
 for(const bg of ['rgb(13,17,23)','rgb(22,27,34)','rgb(28,35,48)']){const ratio=(lum('rgb(255,180,84)')+.05)/(lum(bg)+.05);assert(ratio>=3);report.contrast.push({role:'focus',fg:'rgb(255,180,84)',bg,ratio});}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.screenshot({path:path.join(OUT,'forced-colors.png')});
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const dp=await denied.newPage();dp.on('pageerror',e=>report.errors.push(String(e)));await dp.goto(BASE);await dp.locator('[data-lang=zh]').click();assert.equal(await dp.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.locator('#unique').filter({hasText:'0'}).waitFor();assert.equal(await offline.locator('#code').textContent(),source);await offline.close();
 assert.equal(report.errors.length,0,JSON.stringify(report.errors));assert.equal(report.assets.length,0,JSON.stringify(report.assets));assert.equal(report.external.length,0,JSON.stringify(report.external));report.cssBytes=fs.statSync(path.join(ROOT,'../style.css')).size+fs.statSync(path.join(ROOT,'style.css')).size;assert(report.cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,presets:report.presets.length,layouts:report.layouts.length,cssBytes:report.cssBytes,clipboard:report.clipboard}));await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
