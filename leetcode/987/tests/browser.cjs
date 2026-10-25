const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const URL=process.env.PREVIEW_URL||'http://127.0.0.1:18796/leetcode/987/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],badAssets=[],external=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)badAssets.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:'0/7'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const report={kind:'author browser self-check',browserVersion:await browser.version(),hostPlatform:process.platform,checkedAt:new Date().toISOString(),presets:[],feedback:[],geometry:[],selectBudgets:[],semantics:[],contrast:[],related:[],errors,badAssets,external};
 const expectedOutputs=[[[4],[8,2,9],[6]],[[9],[3,15],[20],[7]],[[0]],[[5],[5,5,5],[5]],[[2],[4],[6],[8]]];
 const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
 const snapshot=async()=>JSON.stringify(await page.locator('#grid,#records,#progress,#event,#result').allTextContents());
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  const metadata=JSON.parse(fs.readFileSync(path.join(ROOT,'lesson-entry.json')));assert.equal(await page.locator('h1').innerText(),'#987 · '+metadata.title[lang]);
  assert((await page.locator('#step1').innerText()).includes('[[4],[8],[6]]'));
  await page.locator('#swap').click();assert((await page.locator('#comparison').innerText()).includes('[8,2,9]'));await page.locator('#swap').click();assert((await page.locator('#comparison').innerText()).includes('[8,9,2]'));
  for(let p=0;p<5;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const initial=await snapshot();await page.locator('#next').click();const first=await snapshot();await page.locator('#prev').click();assert.equal(await snapshot(),initial);await page.locator('#next').click();assert.equal(await snapshot(),first);
   while(await page.locator('#next').isEnabled())await page.locator('#next').click();assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#result').innerText(),(lang==='en'?'Final column lists: ':'最终列列表：')+JSON.stringify(expectedOutputs[p]));
   const terminal=await snapshot();while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();assert.equal(await snapshot(),initial);await page.locator('#end').click();assert.equal(await snapshot(),terminal);await page.locator('#reset').click();assert.equal(await snapshot(),initial);
   report.presets.push({lang,p,expected:expectedOutputs[p],fullRewindReplay:true});
  }
  // Actual overlap: one current node is also collected, while another is collected.
  await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.locator('#next').click();
  const current=page.locator('.node-card.current');assert.equal(await current.count(),1);assert((await current.innerText()).includes('LR: 9'));assert((await current.innerText()).includes('(2,0)'));assert((await current.innerText()).includes(lang==='en'?'current · collected':'当前 · 已收集'));
  const colors=await current.evaluate(e=>({border:getComputedStyle(e).borderTopColor,label:getComputedStyle(e.querySelector('.state')).color}));assert.equal(colors.border,'rgb(255, 180, 84)');assert.equal(await page.locator('.node-card.seen:not(.current)').count(),2);report.semantics.push({lang,state:'after LR collection',current:await current.innerText(),operation:await page.locator('#event').innerText(),progress:await page.locator('#progress').innerText(),records:await page.locator('#records').innerText(),...colors});
  await page.locator('#prev').click();await page.locator('#next').click();assert((await current.innerText()).includes('LR: 9'));
  for(let option=0;option<3;option++){
   await page.locator(`[name=prediction][value="${option}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const text=await page.locator('#feedback').innerText();assert(text.includes('[10,3,8]'));assert(text.includes('(0,2,3)'));if(option!==1)assert(text.startsWith(option===0?'A':'C'));report.feedback.push({lang,option,text});
  }
  await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  const at=await page.locator('#progress').innerText();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert((await page.locator('#progress').innerText()).includes('3/7'));assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#progress').innerText(),at);
  assert.equal(await page.locator('#code').textContent(),source);
  const downloading=page.waitForEvent('download');await page.locator('#download').click();const download=await downloading;await download.saveAs(path.join(OUT,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(OUT,`download-${lang}.py`),'utf8'),source);
  // Native automatic copy, then fresh verified sentinel before each fallback attempt.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'copied':'已复制'));
  const sentinel='987-FALLBACK-'+lang+'-'+Date.now();await page.evaluate(async sentinel=>{await window.nativeClipboard.writeText(sentinel);if(await window.nativeClipboard.readText()!==sentinel)throw Error('sentinel reset failed');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  await page.locator('#copyStatus').screenshot({path:path.join(OUT,`fallback-${lang}.png`)});
  // Native keyboard control and visible focus.
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').innerText()).includes('4/7'));await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'prev');assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#progress').innerText()).includes('3/7'));
  for(const id of ['step1','step2','step3','step4','step5']){await page.locator(`.step-nav a[href="#${id}"]`).click();const top=await page.locator('#'+id).evaluate(e=>e.getBoundingClientRect().top);assert(top>=70,{id,top});await page.waitForTimeout(50);assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#'+id);}
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
   await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.locator('#next').click();
   const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;return {width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),arrowReserve:16,font:s.font,options:[...e.options].map(o=>({label:o.textContent,textWidth:ctx.measureText(o.textContent).width}))};});
   for(const o of budget.options)assert(o.textWidth+budget.padding+budget.arrowReserve<=budget.width,JSON.stringify({lang,width,zoom,budget,o}));report.selectBudgets.push({lang,width,zoom,...budget});
   await page.locator('#preset').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-controls.png`)});
   await page.locator('#grid').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-8));
   const geo=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,gridWidth:document.querySelector('#grid').clientWidth,gridScroll:document.querySelector('#grid').scrollWidth}));assert(geo.scroll<=geo.width+1,JSON.stringify({lang,width,zoom,geo}));report.geometry.push({lang,width,zoom,...geo});
   await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-grid.png`)});
   // Every card can be reached by contained horizontal scroll; text stays legible.
   await page.locator('#grid').evaluate(e=>e.scrollLeft=e.scrollWidth);await page.locator('#step4').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-prediction.png`)});
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(50);assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step1');await page.screenshot({path:path.join(OUT,`${lang}-header.png`)});
 }
 function luminance(c){const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
 assert.equal(luminance('rgb(0,0,0)'),0);assert.equal(luminance('rgb(255,255,255)'),1);
 for(const selector of ['body','.explain','.hint','#progress','#event','#result','#prev','#next','#langToggle .active','.step-nav a','.grid-axis','.node-card b','.node-card small','.node-card.current .state','#records li','#comparison']){
  const c=await page.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);let p=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {fg:s.color,bg};});const l=[luminance(c.fg),luminance(c.bg)].sort((a,b)=>a-b),ratio=(l[1]+.05)/(l[0]+.05);assert(ratio>=4.5,JSON.stringify({selector,c,ratio}));report.contrast.push({selector,...c,ratio});
 }
 report.controlSizes=await page.locator('button,select,summary,.back-link,.official-link,.related a,.solution-actions a,.step-nav a,.prediction-options label').evaluateAll(es=>es.map(e=>({label:e.textContent.trim(),height:e.getBoundingClientRect().height})));for(const control of report.controlSizes)assert(control.height>=48,JSON.stringify(control));
 report.focusContrast=(luminance('rgb(255,180,84)')+.05)/(luminance('rgb(28,35,48)')+.05);assert(report.focusContrast>=3);
 // Text in remote lesson targets is actually present; no registration performed.
 for(const [id,hash]of [['124','step1'],['4','step1']]){const p=await context.newPage();await p.goto(new globalThis.URL(`../${id}/#${hash}`,URL).href);await p.locator('#'+hash+' h2').waitFor();report.related.push({href:p.url(),heading:await p.locator('#'+hash+' h2').innerText()});await p.close();}
 for(const href of await page.locator('a').evaluateAll(a=>a.map(e=>e.getAttribute('href')))){if(href.startsWith('#'))assert(await page.locator(href).count());else if(href==='../')assert((await context.request.get(new globalThis.URL(href,URL).href)).ok());}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');report.forcedColorsAndReducedMotion=true;
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('storage blocked')}}));const p2=await blocked.newPage();await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();assert((await p2.locator('#progress').innerText()).includes('1/7'));await blocked.setOffline(true);await p2.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await p2.locator('#code').textContent(),source);report.blockedStorageOffline=true;
 const offline=await browser.newContext();const p3=await offline.newPage();await p3.goto('file://'+path.join(ROOT,'index.html'));await p3.locator('#next').click();assert((await p3.locator('#progress').innerText()).includes('1/7'));assert.equal(await p3.locator('#code').textContent(),source);report.fileOpening=true;
 report.cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(report.cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({presets:report.presets.length,geometries:report.geometry.length,minimumContrast:Math.min(...report.contrast.map(x=>x.ratio)),cssBytes:report.cssBytes,errors}));
})().catch(e=>{console.error(e);process.exit(1)});
