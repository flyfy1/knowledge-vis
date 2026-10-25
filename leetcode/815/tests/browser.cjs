'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770',C=require('../core.js');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],bad=[],external=[],records=[],layouts=[],clipboard=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(base))external.push(r.url());});
 await page.goto(base+'/leetcode/815/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 const text=id=>page.locator('#'+id).textContent();
 async function lang(l){await page.locator('[data-lang='+l+']').click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 async function state(){return page.evaluate(()=>Object.fromEntries(['frameRead','routeRows','stopRows','events','ledger'].map(id=>[id,document.getElementById(id).textContent])));}
 await lang('en');await page.screenshot({path:path.join(out,'en-desktop-top.png')});
 for(const l of ['en','zh']){
  await lang(l);assert.equal(await page.locator('h1').textContent(),l==='en'?'#815 · Bus Routes':'#815 · 公交路线');assert((await page.title()).includes(l==='en'?'#815 Bus Routes':'#815 公交路线'));
  await page.locator('#manualReset').click();assert(await page.locator('#undo').isDisabled());assert(await page.locator('#boardB').isDisabled());assert.equal(await text('manualStops'),'1');
  await page.locator('#boardA').click();assert.equal(await text('manualStops'),'17');assert(!(await page.locator('#boardB').isDisabled()));
  await page.locator('#boardB').click();assert.equal(await text('manualStops'),'176');assert((await text('manualRead')).includes(l==='en'?'2 boardings; target 6 reached':'2 次；已到目标 6'));
  await lang(l==='en'?'zh':'en');assert.equal(await text('manualStops'),'176');await lang(l);
  await page.locator('#undo').click();assert.equal(await text('manualStops'),'17');await page.locator('#undo').click();assert.equal(await text('manualStops'),'1');await page.locator('#manualReset').click();assert.equal(await text('manualHistory'),l==='en'?'Boarding history: none':'上车历史：无');
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#tracePrev').isDisabled());
   const expected=C.trace(C.presets[p]);let prior=null;
   for(let i=0;i<expected.length;i++){
    if(i)await page.locator('#traceNext').click();const f=expected[i];
    assert((await text('frameRead')).includes(`${i}/${expected.length-1}`));assert.equal(await page.locator('#ledger li').count(),f.history.length);
    assert.equal(await page.locator('#routeRows .used').count(),f.used.length);assert.equal(await page.locator('#stopRows .stop-chip').count(),f.dist.length);
    assert.equal(await page.locator('#stopRows .front').count(),f.front.length);assert.equal(await page.locator('#events li').count(),f.events.length);
    const expectedChips=f.dist.map(([s,d])=>l==='en'?`Stop ${s} · buses: ${d}${f.front.includes(s)?' · frontier':''}${s===C.presets[p].target?' · target':''}`:`站 ${s} · ${d} 次${f.front.includes(s)?' · 前沿':''}${s===C.presets[p].target?' · 目标':''}`);
    assert.deepEqual(await page.locator('#stopRows .stop-chip').allTextContents(),expectedChips);
    const current=await state();if(i){await page.locator('#tracePrev').click();assert.deepEqual(await state(),prior);await page.locator('#traceNext').click();assert.deepEqual(await state(),current);}prior=current;
   }
   assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());
   const answer=expected.at(-1).result;assert((await text('frameRead')).includes(answer===-1?'-1':`${answer}.`)||(await text('frameRead')).includes(`${answer}。`));
   records.push({locale:l,preset:p,frames:expected.length,answer,visible:await text('frameRead'),events:await text('events'),ledger:await text('ledger')});
   await page.locator('#traceReset').click();assert(await page.locator('#tracePrev').isDisabled());if(expected.length>1)await page.locator('#traceLast').click();assert.deepEqual(await state(),prior);
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!(await text('predictionFeedback')).includes(l==='en'?'answer is 1':'答案是 1'));
  for(const v of ['0','1','2']){
   await page.locator(`[name=prediction][value="${v}"]`).check();assert(!(await text('predictionFeedback')).includes(l==='en'?'answer is 1':'答案是 1'));
   await page.locator('#reveal').click();assert((await text('predictionFeedback')).includes(l==='en'?'answer is 1':'答案是 1'));assert.equal(await page.locator('#predictionFeedback').evaluate(e=>e.classList.contains('correct')),v==='2');
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${v}"]`).isChecked());assert((await text('predictionFeedback')).includes(l==='en'?'答案是 1':'answer is 1'));await lang(l);
  }
  await page.locator('#preset').selectOption('0');await page.locator('#traceNext').click();const before=await state();await lang(l==='en'?'zh':'en');await lang(l);assert.deepEqual(await state(),before);assert((await text('predictionFeedback')).includes(l==='en'?'answer is 1':'答案是 1'));
  // Exact, complete formula/causal text and data binding, not just nonempty strings.
  assert((await page.locator('[data-i18n=invariant]').textContent()).includes(l==='en'?'d+1 boardings':'d+1 次上车'));
  assert((await text('events')).includes(l==='en'?'Board R0 at stop 1; newly discover [2, 7]':'从站 1 上 R0；新发现 [2, 7]'));
  records.push({locale:l,branch:'selected-revealed-correct and middle trace preserved over locale',feedback:await text('predictionFeedback'),causalText:await text('events')});
 }
 // Code parity: display/embedding/download and success-copy plus freshly seeded native fallback for each locale.
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await text('pythonCode'),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);assert.equal(await page.locator('#step1 pre code').textContent(),fs.readFileSync(path.join(root,'tests/baseline.py'),'utf8'));
 const dlPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await dlPromise;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);
 await page.evaluate(()=>{window.realClipboard={readText:navigator.clipboard.readText.bind(navigator.clipboard),writeText:navigator.clipboard.writeText.bind(navigator.clipboard)};});
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.realClipboard}));
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>window.realClipboard.readText()),source);assert((await text('copyStatus')).includes(l==='en'?'Complete source copied':'已复制完整源码'));
  const sentinel=`815-${l}-${Date.now()}-non-source clipboard sentinel`;await page.evaluate(s=>window.realClipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>window.realClipboard.readText()),sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText:window.realClipboard.readText,writeText:async()=>{throw Error('intentional fallback');}}}));
  await page.locator('#copyPython').click();assert(await page.locator('#manualSource').isVisible());
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>({focus:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd,value:e.value})),{focus:true,start:0,end:source.length,value:source});
  assert.equal(await page.evaluate(()=>window.realClipboard.readText()),sentinel);
  const shortcut=os.platform()==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(shortcut);assert.equal(await page.evaluate(()=>window.realClipboard.readText()),source);
  clipboard.push({locale:l,host:os.platform(),shortcut,freshSentinelVerified:true,nativeReadbackExact:true,finalNewline:source.endsWith('\n')});
  assert((await text('copyStatus')).includes(l==='en'?'system copy shortcut':'系统复制快捷键'));await page.screenshot({path:path.join(out,`${l}-copy-fallback.png`)});
 }
 // Width, closed-select fit, and populated component geometry, in both locales.
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('5');await page.locator('#traceNext').click();await page.locator('#traceNext').click();
  await page.locator('#routeRows').scrollIntoViewIfNeeded();
  const g=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,available:innerWidth,chips:[...document.querySelectorAll('.stop-chip')].map(e=>({client:e.clientWidth,scroll:e.scrollWidth,w:e.getBoundingClientRect().width})),routes:[...document.querySelectorAll('.route-row')].map(e=>({client:e.clientWidth,scroll:e.scrollWidth})),select:(()=>{const e=document.querySelector('#preset'),s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {w:e.getBoundingClientRect().width,text:c.measureText(e.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),reserve:24};})()}));
  assert(g.doc<=width+1,JSON.stringify(g));for(const r of [...g.chips,...g.routes])assert(r.scroll<=r.client+1,JSON.stringify(r));assert(g.select.text+g.select.padding+g.select.reserve<=g.select.w,JSON.stringify(g.select));
  layouts.push({locale:l,width,...g});await page.screenshot({path:path.join(out,`${l}-${width}-trace.png`)});
  await page.locator('#step2 .controls').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-document.querySelector('.step-nav').getBoundingClientRect().height-16));await page.screenshot({path:path.join(out,`${l}-${width}-controls.png`)});
 }
 for(const l of ['en','zh'])for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#routeRows').scrollIntoViewIfNeeded();
  const g=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,available:document.documentElement.clientWidth,chips:[...document.querySelectorAll('.stop-chip')].map(e=>({client:e.clientWidth,scroll:e.scrollWidth}))}));assert(g.doc<=g.available+1,JSON.stringify(g));for(const r of g.chips)assert(r.scroll<=r.client+1);
  layouts.push({locale:l,width,zoom:2,...g});await page.screenshot({path:path.join(out,`${l}-${width}-zoom200.png`)});await page.locator('#stopRows').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${l}-${width}-zoom200-stops.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Keyboard, focus, sticky anchors, forced colors, long label stress.
 await page.setViewportSize({width:390,height:1000});await lang('en');await page.locator('#preset').selectOption('0');await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert((await text('frameRead')).includes('1/2'));
 const focus=await page.locator('#traceNext').evaluate(e=>({active:document.activeElement===e,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert(focus.active);assert.equal(focus.width,'3px');await page.locator('#traceNext').screenshot({path:path.join(out,'keyboard-focus.png')});await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');
 await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 for(let i=0;i<5;i++){await page.locator(`.step-nav a[href="#step${i}"]`).click();const g=await page.evaluate(i=>({top:document.querySelector('#step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.top>=g.nav-1,JSON.stringify(g));}
 await page.setViewportSize({width:320,height:1000});const old=await text('frameRead');await page.locator('#frameRead').evaluate(e=>e.textContent='W'.repeat(120)+' 公交路线'.repeat(30));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#frameRead').evaluate((e,s)=>e.textContent=s,old);
 const targets=await page.locator('button,.btn,summary,.prediction-options label,.related a').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));for(const x of targets)assert(x.w>=48&&x.h>=48,JSON.stringify(x));
 // Measured colors of actual rendered states.
 await page.locator('#traceReset').click();
 const contrasts=await page.evaluate(()=>{
  const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const calibration={black:lum('rgb(0,0,0)'),white:lum('rgb(255,255,255)'),red:lum('rgb(255,0,0)'),green:lum('rgb(0,255,0)'),blue:lum('rgb(0,0,255)'),blackWhite:ratio('rgb(0,0,0)','rgb(255,255,255)'),nearThreshold:ratio('rgb(116,116,116)','rgb(0,0,0)')};
  for(const [key,want] of Object.entries({black:0,white:1,red:.2126,green:.7152,blue:.0722,blackWhite:21,nearThreshold:4.492948073}))if(Math.abs(calibration[key]-want)>1e-8)throw Error('contrast calibration '+key);if(calibration.nearThreshold>=4.5)throw Error('near-threshold contrast incorrectly passes');window.contrastCalibration=calibration;
  return ['body','.hint','.explain','.route-row','.stop-chip','#tracePrev','#traceNext','#langToggle .active','.step-nav a'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let n=e,bg;while(n){const b=getComputedStyle(n).backgroundColor;if(!['transparent','rgba(0, 0, 0, 0)'].includes(b)){bg=b;break;}n=n.parentElement;}return {selector,fg:s.color,bg,ratio:ratio(s.color,bg)};}).concat([{selector:'focus on panel2',ratio:ratio('rgb(255,180,84)','rgb(28,35,48)')},{selector:'stop border on panel2',ratio:ratio('rgb(154,167,184)','rgb(28,35,48)')}]);
 });for(const x of contrasts)assert(x.ratio>=(x.selector.includes('focus')||x.selector.includes('border')?3:4.5),JSON.stringify(x));
 const contrastCalibration=await page.evaluate(()=>window.contrastCalibration);const linkRecords=[];
 for(const href of [...new Set(await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))))]){
  if(href.startsWith('http'))continue;const u=new URL(href,page.url()),r=await context.request.get(u.href);assert(r.ok(),href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);linkRecords.push({href,url:u.href,status:r.status()});
 }
 // Follow the explanatory links as a keyboard user; inspect actual destination section.
 for(const [href,terms] of [['../126/#step2',['layer','parent']],['../773/#step2',['layer','BFS']]]){
  await lang('en');const a=page.locator(`.related a[href="${href}"]`);await a.focus();await page.keyboard.press('Enter');await page.waitForLoadState('load');const dest=await page.locator('#step2').textContent();assert(terms.every(x=>dest.includes(x)),dest);linkRecords.push({href,destinationText:dest.slice(0,1400),keyboardActivated:true});await page.goto(base+'/leetcode/815/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 }
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(e.message));await dp.goto(base+'/leetcode/815/');await dp.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);await dp.locator('[data-lang=zh]').click();assert.equal(await dp.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const report={kind:'author browser self-check',result:'pass',records,layouts,clipboard,source:'exact rendered/embedded/download/success-copy/native-fallback including final newline',focus,contrasts,cssBytes,linkRecords,storageDenied:true,offline:true,errors,badAssets:bad,external,zoomMethod:'CSS zoom:2 in real Chromium; browser-chrome zoom and real devices not tested',browser:await browser.version(),fontStack:await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily),contrastCalibration,contrastScope:'solid rendered backgrounds; local nav made solid; WCAG sRGB weights calibrated against black, white, primaries and unrounded near-4.5 failure'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:'pass',records:records.length,layouts:layouts.length,clipboard,contrasts,cssBytes},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
