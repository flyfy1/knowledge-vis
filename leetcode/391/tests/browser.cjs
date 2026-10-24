'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),page=await ctx.newPage(),errors=[],badAssets=[],remote=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url());});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))remote.push(r.url());});
 await page.goto(base+'/leetcode/391/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0/3'));
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 await ctx.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());await page.locator('#step0').screenshot({path:path.join(out,`${lang}-hand.png`),style:'.step-nav{visibility:hidden}'});await page.locator('#step1').screenshot({path:path.join(out,`${lang}-baseline.png`),style:'.step-nav{visibility:hidden}'});await page.locator('#handReveal').click();assert(!await page.locator('#handAnswer').isVisible());
  for(let preset=0;preset<6;preset++){
   await page.selectOption('#preset',String(preset));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const n=[3,3,3,4,1,5][preset];
   for(let k=1;k<=n;k++){
    await page.locator('#next').click();assert((await page.locator('#progress').textContent()).includes(`${k}/${n}`));assert.equal(await page.locator('#toggles tr').count(),4);assert.equal(await page.locator('#ledger li').count(),k);
    const snap=await page.locator('#traceGrid').innerHTML(),metrics=await page.locator('#metrics').textContent();
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#traceGrid').innerHTML(),snap);assert.equal(await page.locator('#metrics').textContent(),metrics);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert((await page.locator('#verdict').textContent()).includes([true,false,false,false,true,true][preset]?'true':'false'));
   await page.locator('#reset').click();assert((await page.locator('#progress').textContent()).includes('0/'));assert.equal(await page.locator('#ledger li').count(),0);await page.locator('#end').click();
  }
  for(let option=0;option<3;option++){
   await page.locator(`[name="prediction"][value="${option}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('3+1+1+1'));
   await page.locator('#reveal').click();const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('3+1+1+1=6'));assert(feedback.includes('(0,2)'));
   const alt=lang==='en'?'zh':'en';await page.locator(`[data-lang="${alt}"]`).click();assert(await page.locator(`[name="prediction"][value="${option}"]`).isChecked());assert((await page.locator('#feedback').textContent()).includes('3+1+1+1=6'));await page.locator(`[data-lang="${lang}"]`).click();
  }
  await page.selectOption('#preset','0');await page.locator('#next').click();const metrics=await page.locator('#metrics').textContent();assert(metrics.includes('2'));assert(metrics.includes(lang==='en'?'pass':'通过'));
  await page.locator('#next').click();assert((await page.locator('#toggles').textContent()).includes(lang==='en'?'Remove':'删除'));
  await page.locator('#copy').evaluate(el=>el.scrollIntoView());
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.__copied=s;}}});});
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.__copied),source);assert((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'copied':'已复制'));
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});});await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.inputValue('#manualSource'),source);assert.equal(await page.locator('#manualSource').evaluate(el=>el.selectionEnd-el.selectionStart),source.length);assert((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));
  const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;await download.saveAs(path.join(out,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(out,`download-${lang}.py`),'utf8'),source);
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.__copied=s;}}});});await page.locator('#copy').click();assert(!await page.locator('#manualCopy').isVisible());
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','5');await page.locator('#end').click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${lang} ${width}`);
   await page.locator('#traceGrid').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-trace.png`),fullPage:false});
   const geometry=await page.locator('#traceGrid').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,svg:el.querySelector('svg').getBoundingClientRect().width}));assert(geometry.svg>=360);if(width===320)assert(geometry.scroll>geometry.client);
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#traceGrid').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.locator('#traceGrid').screenshot({path:path.join(out,`${lang}-zoom200-grid.png`),style:'.step-nav{visibility:hidden}'});await page.evaluate(()=>document.documentElement.style.zoom='1');
 }
 for(const lang of ['zh','en']){await page.locator(`[data-lang="${lang}"]`).click();await page.setViewportSize({width:390,height:1000});await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#next').click();await page.locator('#traceGrid').screenshot({path:path.join(out,`${lang}-intermediate-grid.png`)});await page.locator('#beforeSet').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-intermediate-ledger.png`)});}
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#traceGrid').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-390-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='1');
  await page.locator('#traceGrid').focus();const scrollBefore=await page.locator('#traceGrid').evaluate(el=>el.scrollLeft);await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await page.locator('#traceGrid').evaluate(el=>el.scrollLeft)>=scrollBefore);
  await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});
  await page.locator('#step4').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-document.querySelector('.step-nav').offsetHeight-20,behavior:'instant'}));await page.screenshot({path:path.join(out,`${lang}-source-mapping.png`)});
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-desktop-full.png`),fullPage:true});
 }
 // Real keyboard activation and native focus outline.
 await page.setViewportSize({width:1440,height:1000});await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/3'));
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');const outline=await page.locator('#reset').evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert.equal(outline.width,'3px');assert.equal(outline.style,'solid');
 const countBefore=await page.locator('#progress').textContent();await page.locator('[data-lang="en"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');assert((await page.locator('#progress').textContent()).includes('1/3'));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.keyboard.press('Enter');await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Internal links and sticky target geometry; all related targets fetched and verified.
 for(const href of await page.locator('.related a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  const url=new URL(href,page.url());if(url.pathname.endsWith('/391/')){await page.locator(`.related a[href="${href}"]`).click();await page.waitForTimeout(1200);const geometry=await page.locator(url.hash).evaluate(el=>({top:el.getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().height}));assert(geometry.top>=geometry.nav-2,JSON.stringify({href,geometry}));}
  else{const res=await ctx.request.get(url.href);assert(res.ok());assert((await res.text()).includes(`id="${url.hash.slice(1)}"`));}
 }
 // Offline source remains available; blocked localStorage uses memory and locale still switches.
 const denied=await ctx.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});await denied.goto(base+'/leetcode/391/');await denied.locator('[data-lang="zh"]').click();assert.equal(await denied.locator('html').getAttribute('lang'),'zh-CN');await denied.locator('#next').click();await denied.locator('[data-lang="en"]').click();assert((await denied.locator('#progress').textContent()).includes('1/3'));await denied.close();
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.close();
 // Exact rendered token contrast; states do not use opacity after overrides.
 const contrast=await page.evaluate(()=>{
  function lum(hex){const rgb=hex.match(/\w\w/g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
  const get=k=>getComputedStyle(document.documentElement).getPropertyValue('--'+k).trim().slice(1),pairs=[['text','bg'],['text','panel'],['muted','panel2'],['accent','panel'],['accent2','panel2'],['accent2','bg'],['bad','panel2'],['bg','accent']];
  return pairs.map(([fg,bg])=>{const a=lum(get(fg)),b=lum(get(bg));return {fg,bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});});assert(contrast.every(c=>c.ratio>=4.5));
 const controls=await page.locator('button,select,.step-nav a').evaluateAll(es=>es.map(e=>({id:e.id||e.textContent,h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})));assert(controls.every(c=>c.h>=48&&c.w>=48));
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(remote,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({result:'pass',locales:['zh','en'],presets:6,widths:[320,390,736,1440],zoom:'CSS 200% (document zoom)',keyboard:true,copy_and_fallback:true,download_parity:true,storage_blocked:true,offline_source:true,errors,badAssets,remote,contrast,controls,focus:outline},null,2));
 await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
