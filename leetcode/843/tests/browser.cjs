'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770',C=require('../core.js');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],assets=[],external=[],records=[],layouts=[],clipboard=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)assets.push([r.url(),r.status()]);});page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(base))external.push(r.url());});
 await page.goto(base+'/leetcode/843/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 const text=id=>page.locator('#'+id).textContent();
 const lang=async l=>{await page.locator('[data-lang='+l+']').click();assert.equal(await page.locator('html').getAttribute('lang'),l==='en'?'en':'zh-CN');};
 const state=()=>page.evaluate(()=>Object.fromEntries(['frameRead','candidates','buckets','ledger','terminal'].map(id=>[id,document.getElementById(id).textContent])));
 for(const l of ['en','zh']){
  await lang(l);assert((await page.locator('h1').textContent()).includes('#843'));
  await page.locator('#handToggle').click();assert.equal(await page.locator('.letter.hit').count(),3);assert((await text('handRead')).includes(l==='en'?'2, 5, 6':'2、5、6'));await page.locator('#handToggle').click();assert(await page.locator('#letters').isHidden());
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());const expected=C.trace(C.presets[p].words,C.presets[p].secret,C.presets[p].budget);let prior=null;
   for(let i=0;i<expected.length;i++){
    if(i)await page.locator('#next').click();const f=expected[i];
    assert.equal(await page.locator('#candidates code').count(),f.candidates.length);assert.deepEqual(await page.locator('#candidates code').allTextContents(),f.candidates.map(j=>C.presets[p].words[j]));assert.equal(await page.locator('#ledger li').count(),i);
    if(!f.done&&!f.exhausted){const plan=C.plan(C.presets[p].words,f.candidates,f.used);const rows=await page.locator('#buckets tr').allTextContents();assert(rows[plan.probe].includes(l==='en'?'Chosen next':'下一次选择'));for(let r=0;r<rows.length;r++){const nums=await page.locator('#buckets tr').nth(r).locator('td').allTextContents();assert.deepEqual(nums.slice(0,8),[...plan.rows[r].buckets,plan.rows[r].worst].map(String));}}
    const current=await state();if(i){await page.locator('#prev').click();assert.deepEqual(await state(),prior);await page.locator('#next').click();assert.deepEqual(await state(),current);}prior=current;
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert((await text('terminal')).includes(expected.at(-1).exhausted?(l==='en'?'exhausted':'耗尽'):'6'));
   assert.equal(await page.locator('.table-wrap').isHidden(),true);
   records.push({locale:l,preset:p,terminal:await state()});await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert.deepEqual(await state(),prior);
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());
  for(let v=0;v<3;v++){
   await page.locator(`[name=prediction][value="${v}"]`).check();assert(!(await text('feedback')).includes('[4, 6, 4, 2]'));
   await page.locator('#reveal').click();assert((await text('feedback')).includes('[4, 6, 4, 2]'));assert((await text('feedback')).startsWith(l==='en'?(v===1?'Correct.':'Check the equality'):(v===1?'正确。':'再检查')));
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${v}"]`).isChecked());assert((await text('feedback')).includes('[4, 6, 4, 2]'));await lang(l);
  }
  await page.locator('#preset').selectOption('0');await page.locator('#next').click();const before=await state();await lang(l==='en'?'zh':'en');await lang(l);assert.deepEqual(await state(),before);assert((await text('feedback')).includes('[4, 6, 4, 2]'));
  const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('match(guess, w) = reply'));assert(formula.includes('max(|B₀|,…,|B₅|)'));records.push({locale:l,formula,feedback:await text('feedback'),middle:await state()});
 }
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await text('pythonCode'),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 const dp=page.waitForEvent('download');await page.locator('a[download]').click();assert.equal(fs.readFileSync(await (await dp).path(),'utf8'),source);
 await page.evaluate(()=>{window.realClipboard={readText:navigator.clipboard.readText.bind(navigator.clipboard),writeText:navigator.clipboard.writeText.bind(navigator.clipboard)};});
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.realClipboard}));await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>window.realClipboard.readText()),source);
  const sentinel=`843-${l}-${Date.now()}-non-source`;await page.evaluate(s=>window.realClipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>window.realClipboard.readText()),sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('fallback test');}}}));await page.locator('#copyPython').click();
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>({focus:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd,value:e.value})),{focus:true,start:0,end:source.length,value:source});
  assert.equal(await page.evaluate(()=>window.realClipboard.readText()),sentinel);const shortcut=os.platform()==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(shortcut);assert.equal(await page.evaluate(()=>window.realClipboard.readText()),source);
  clipboard.push({locale:l,host:os.platform(),shortcut,freshSentinelVerified:true,nativeReadbackExact:true});records.push({locale:l,copyFallback:await text('copyStatus')});
 }
 // Rendered component geometry, and screenshots for visual inspection.
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('3');await page.locator('#next').click();
  await page.locator('#step2 .controls').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-document.querySelector('.step-nav').offsetHeight-12));
  const g=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,available:innerWidth,words:[...document.querySelectorAll('#candidates code')].map(e=>({client:e.clientWidth,scroll:e.scrollWidth})),table:{client:document.querySelector('.table-wrap').clientWidth,scroll:document.querySelector('.table-wrap').scrollWidth}}));
  assert(g.doc<=width+1,JSON.stringify(g));for(const w of g.words)assert(w.scroll<=w.client+1);layouts.push({locale:l,width,...g});await page.screenshot({path:path.join(out,`${l}-${width}-trace.png`)});
 }
 for(const l of ['en','zh'])for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#frameRead').scrollIntoViewIfNeeded();
  const g=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,available:document.documentElement.clientWidth}));assert(g.doc<=g.available+1,JSON.stringify(g));layouts.push({locale:l,width,zoom:2,...g});await page.screenshot({path:path.join(out,`${l}-${width}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.setViewportSize({width:390,height:1000});await lang('en');await page.locator('#preset').selectOption('0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await text('frameRead')).includes('Calls completed: 1;'));
 const focus=await page.locator('#next').evaluate(e=>({active:document.activeElement===e,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert(focus.active);assert.equal(focus.width,'3px');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 for(let i=0;i<5;i++){await page.locator(`.step-nav a[href="#step${i}"]`).click();const g=await page.evaluate(i=>({top:document.querySelector('#step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.top>=g.nav-1,JSON.stringify(g));}
 await page.setViewportSize({width:320,height:1000});await page.locator('#frameRead').evaluate(e=>e.textContent='W'.repeat(120)+' 汉字'.repeat(50));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('#reset').click();
 const contrast=await page.evaluate(()=>{
  function lum(s){return s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
  const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  if(Math.abs(ratio('rgb(0,0,0)','rgb(255,255,255)')-21)>1e-9)throw Error('calibration');
  return ['body','.hint','.explain','#prev','#next','#langToggle .active','.step-nav a','th','td'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let chain=[],n=e;while(n){chain.unshift(getComputedStyle(n).backgroundColor);n=n.parentElement;}let rgb=[0,0,0];for(const color of chain){const a=color.match(/[\d.]+/g).map(Number);const alpha=a.length===4?a[3]:1;rgb=rgb.map((v,i)=>a[i]*alpha+v*(1-alpha));}const bg='rgb('+rgb.join(',')+')';return {selector,fg:s.color,bg,ratio:ratio(s.color,bg)};}).concat([{selector:'focus vs panel2',ratio:ratio('rgb(255,180,84)','rgb(28,35,48)')}]);
 });for(const x of contrast)assert(x.ratio>=(x.selector.startsWith('focus')?3:4.5),JSON.stringify(x));
 const links=[];
 for(const href of [...new Set(await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))))]){
  if(href.startsWith('http'))continue;const u=new URL(href,page.url()),r=await context.request.get(u.href);assert(r.ok(),href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);links.push({href,status:r.status()});
 }
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const blocked=await denied.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.goto(base+'/leetcode/843/');await blocked.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);await blocked.locator('[data-lang=zh]').click();assert.equal(await blocked.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 const offline=await context.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(assets,[]);assert.deepEqual(external,[]);
 const report={kind:'author browser self-check',result:'pass',records,layouts,clipboard,sourceParity:'rendered, embedded, download, clipboard success and actual native manual-fallback copy; exact final newline',focus,contrast,cssBytes,links,storageDenied:true,offline:true,errors,assets,external,browser:await browser.version(),zoomMethod:'CSS zoom 2 in real Chromium; real device and browser-chrome zoom unverified'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:'pass',records:records.length,layouts:layouts.length,clipboard,contrast,cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
