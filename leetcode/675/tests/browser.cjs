'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.OUT_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18782';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),C=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],external=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(base))external.push(r.url());});page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});
 await page.goto(base+'/leetcode/675/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 await page.screenshot({path:path.join(out,'cold-desktop.png')});
 const records=[];
 async function lang(l){await page.locator('[data-lang='+l+']').click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 const text=id=>page.locator('#'+id).textContent();
 async function state(){return page.evaluate(()=>({board:document.querySelector('#board').innerHTML,ledger:document.querySelector('#ledger').textContent,frame:document.querySelector('#frameRead').textContent}));}
 for(const l of ['en','zh']){
  await lang(l);
  assert((await page.locator('h1').textContent()).includes('#675'));
  await page.locator('#handToggle').click();assert((await text('handRead')).includes('2 + 1 = 3'));await page.locator('#handToggle').click();assert(!(await text('handRead')).includes('2 + 1 = 3'));
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#tracePrev').isDisabled());
   const expected=C.trace(C.presets[p]);let prior=null;
   for(let i=0;i<expected.length;i++){
    if(i)await page.locator('#traceNext').click();
    const f=expected[i];assert((await text('frameRead')).includes(`${i}/${expected.length-1}`));assert.equal(await page.locator('#ledger li').count(),f.ledger.length);
    const cells=await page.locator('#board .cell').allTextContents();
    const want=C.presets[p].flatMap((row,r)=>row.map((h,c)=>String(h)+(h===0?'#':f.dist[r][c]===null?'d ·':'d '+f.dist[r][c])+( [f.front.some(x=>x[0]===r&&x[1]===c)?'F':'',f.target[1]===r&&f.target[2]===c?'T':'',f.cut.includes(h)?'×':''].filter(Boolean).join(' ')||'·')));
    assert.deepEqual(cells,want);
    const current=await state();
    if(i){await page.locator('#tracePrev').click();assert.deepEqual(await state(),prior);await page.locator('#traceNext').click();assert.deepEqual(await state(),current);}prior=current;
   }
   assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());
   console.log('trace checked',l,p,expected.length);
   const f=expected.at(-1),answer=['blocked','unreachable'].includes(f.kind)?-1:f.total;
   assert((await text('frameRead')).includes(String(answer)));
   records.push({locale:l,preset:p,frames:expected.length,answer,visible:await text('frameRead')});
   await page.locator('#traceReset').click();assert(await page.locator('#tracePrev').isDisabled());if(expected.length>1)await page.locator('#traceLast').click();assert.deepEqual(await state(),prior);
  }
  // Prediction: hidden truth, every choice, explicit reveal, locale preservation, change invalidation.
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!(await text('predictionFeedback')).includes('2+1+2'));
  for(const value of ['3','5','7']){
   await page.locator(`[name=prediction][value="${value}"]`).check();assert(!(await text('predictionFeedback')).includes('2+1+2'));
   await page.locator('#reveal').click();assert((await text('predictionFeedback')).includes('2+1+2=5'));assert.equal(await page.locator('#predictionFeedback').evaluate(el=>el.classList.contains('correct')),value==='5');
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${value}"]`).isChecked());assert((await text('predictionFeedback')).includes('2+1+2=5'));await lang(l);
  }
  // Trace changes leave independent prediction alone.
  await page.locator('#preset').selectOption('1');assert((await text('predictionFeedback')).includes('2+1+2=5'));
  await page.locator('#traceNext').click();const beforeSwitch=await page.locator('#board').innerHTML();await lang(l==='en'?'zh':'en');
  assert.equal(await page.locator('#board').innerHTML().then(x=>x.replace(/aria-label="[^"]*"/g,'')),beforeSwitch.replace(/aria-label="[^"]*"/g,''));await lang(l);
 }
 // Code display/copy/download exact parity including terminal newline.
 await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await text('pythonCode'),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await downloadPromise;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);
 const sentinel='675 distinct clipboard sentinel, not source';await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText:navigator.clipboard.readText.bind(navigator.clipboard),writeText:async()=>{throw Error('intentional fallback');}}}));
 await page.locator('#copyPython').click();assert(await page.locator('#manualSource').isVisible());
 const selection=await page.locator('#manualSource').evaluate(el=>({focus:document.activeElement===el,start:el.selectionStart,end:el.selectionEnd,value:el.value}));assert.deepEqual(selection,{focus:true,start:0,end:source.length,value:source});assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 const host=os.platform(),shortcut=host==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(shortcut);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.screenshot({path:path.join(out,'copy-fallback.png')});
 // Layout and 200% real-browser CSS layout zoom, with explicit method.
 const layouts=[];
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('1');
  for(let i=0;i<6;i++)await page.locator('#traceNext').click();
  const read=await text('frameRead');assert(read.includes(l==='en'?'distance layer 6':'距离 6 层'));
  await page.locator('#board').scrollIntoViewIfNeeded();
  const geometry=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,cells:[...document.querySelectorAll('.cell')].map(el=>{const r=el.getBoundingClientRect();return {w:r.width,scroll:el.scrollWidth,client:el.clientWidth};})}));
  assert(geometry.doc<=width+1);for(const c of geometry.cells)assert(c.scroll<=c.client+1,JSON.stringify(c));
  await page.screenshot({path:path.join(out,`${l}-${width}-trace.png`)});
  await page.locator('#step2 .controls').screenshot({path:path.join(out,`${l}-${width}-controls.png`)});
  layouts.push({locale:l,width,...geometry,visible:read});
 }
 for(const l of ['en','zh'])for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#board').scrollIntoViewIfNeeded();
  const g=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,available:document.documentElement.clientWidth,cells:[...document.querySelectorAll('.cell')].map(el=>({scroll:el.scrollWidth,client:el.clientWidth}))}));assert(g.doc<=g.available+1,JSON.stringify(g));for(const c of g.cells)assert(c.scroll<=c.client+1,JSON.stringify(c));
  await page.screenshot({path:path.join(out,`${l}-${width}-zoom200.png`)});layouts.push({locale:l,width,zoom:2,...g});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Native keyboard operation and focus, including sticky anchor placement.
 await page.setViewportSize({width:390,height:1000});await lang('en');await page.locator('#preset').selectOption('0');
 await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert((await text('frameRead')).includes('1/'));
 const focus=await page.locator('#traceNext').evaluate(el=>({active:document.activeElement===el,style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert(focus.active);assert.equal(focus.width,'3px');
 await page.locator('#traceNext').screenshot({path:path.join(out,'keyboard-focus.png')});
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');
 await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 for(let i=0;i<5;i++){await page.locator(`.step-nav a[href="#step${i}"]`).click();await page.waitForTimeout(100);const g=await page.evaluate(i=>({target:document.querySelector('#step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.target>=g.nav-1,JSON.stringify(g));}
 // Actual rendered foreground/background contrast, including disabled and borders.
 await page.locator('#traceReset').click();
 const contrasts=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=s=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const data=[];
  for(const sel of ['body','.hint','.explain','.cell','#tracePrev','#traceNext','#langToggle .active','.step-nav a','#copyStatus']){
   const el=document.querySelector(sel),cs=getComputedStyle(el);let x=el,bg;
   while(x){const b=getComputedStyle(x).backgroundColor;if(b!=='rgba(0, 0, 0, 0)'&&b!=='transparent'){bg=b;break;}x=x.parentElement;}
   data.push({selector:sel,fg:cs.color,bg,ratio:ratio(cs.color,bg)});
  }
  data.push({selector:'focus on panel2',ratio:ratio('rgb(255,180,84)','rgb(28,35,48)')});
  const cs=getComputedStyle(document.querySelector('.cell'));data.push({selector:'cell border',ratio:ratio(cs.borderTopColor,cs.backgroundColor)});return data;
 });for(const c of contrasts)assert(c.ratio>=(c.selector.includes('focus')||c.selector.includes('border')?3:4.5),JSON.stringify(c));
 // All local links have actual targets; external official links aren't fetched in this test.
 for(const href of await page.locator('a[href]').evaluateAll(els=>els.map(x=>x.getAttribute('href')))){
  if(href.startsWith('http'))continue;
  const u=new URL(href,page.url()),r=await context.request.get(u.href);assert(r.ok(),href);
  if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);
 }
 const isolated=await browser.newContext();await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const isolatedPage=await isolated.newPage();isolatedPage.on('pageerror',e=>errors.push(e.message));await isolatedPage.goto(base+'/leetcode/675/');await isolatedPage.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);await isolatedPage.locator('[data-lang=zh]').click();assert.equal(await isolatedPage.locator('html').getAttribute('lang'),'zh-CN');await isolated.close();
 // Offline file opening uses embedded data and source, without fetch.
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(bad,[]);
 const report={kind:'author browser self-check',result:'pass',records,layouts,source:'exact rendered, embedded, clipboard, download and sentinel-seeded native manual-copy parity',clipboard:{host,shortcut,fullSelection:true,actualReadback:true},keyboard:focus,contrasts,cssBytes,storageDenied:true,offline:true,localErrors:errors,badAssets:bad,externalRequests:external,zoomMethod:'CSS zoom:2 in real Chromium; browser-chrome zoom and real devices unverified'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:'pass',records:records.length,layouts:layouts.length,cssBytes,contrasts},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
