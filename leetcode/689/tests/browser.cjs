'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18783';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),C=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],external=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>{if(r.url().startsWith('http')&&!r.url().startsWith(base))external.push(r.url());});page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});
 await page.goto(base+'/leetcode/689/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);await page.screenshot({path:path.join(out,'cold-desktop.png')});
 const records=[],bindings=[];
 async function lang(l){await page.locator('[data-lang='+l+']').click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 const text=id=>page.locator('#'+id).textContent();
 async function state(){return page.evaluate(()=>({windows:document.querySelector('#windows').innerHTML,rows:document.querySelector('#summaryRows').innerHTML,ledger:document.querySelector('#ledger').textContent,frame:document.querySelector('#frameRead').textContent,best:document.querySelector('#bestRead').textContent}));}
 for(const l of ['en','zh']){
  await lang(l);assert((await page.locator('h1').textContent()).includes('#689'));
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),'j = k … m−k−1;  candidate = [L[j−k], j, R[j+k]];  total = W[L[j−k]] + W[j] + W[R[j+k]]');
  await page.locator('#handToggle').click();assert((await text('handRead')).includes('2+4+3=9'));await page.locator('#handToggle').click();assert(!(await text('handRead')).includes('2+4+3=9'));
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#tracePrev').isDisabled());const expected=C.trace(C.presets[p]);let prior=null;
   for(let i=0;i<expected.length;i++){
    if(i)await page.locator('#traceNext').click();const f=expected[i];assert((await text('frameRead')).includes(`${i}/${expected.length-1}`));assert.equal(await page.locator('#ledger li').count(),f.ledger.length);
    const rows=await page.locator('#summaryRows tr').evaluateAll(els=>els.map(tr=>[...tr.children].map(td=>td.textContent)));
    assert.deepEqual(rows,f.w.map((v,j)=>[String(j),String(v),f.left[j]===null?(l==='en'?'pending':'待算'):String(f.left[j]),f.right[j]===null?(l==='en'?'pending':'待算'):String(f.right[j])]));
    if(f.kind==='middle'){const row=f.ledger.at(-1);assert((await text('frameRead')).includes(JSON.stringify(row.candidate)));assert((await text('frameRead')).includes(row.candidate.map(j=>f.w[j]).join('+')+'='+row.total));assert((await text('bestRead')).includes(JSON.stringify(f.best)));assert((await text('bestRead')).includes(String(f.bestSum)));}
    if(p===2&&f.kind==='right'&&f.old!==null&&f.w[f.i]===f.w[f.old]){assert((await text('frameRead')).includes(`${f.w[f.i]}≥${f.w[f.old]}`));bindings.push({locale:l,preset:p,operation:i,meaning:'equal suffix sums replace old with earlier i',visible:await text('frameRead')});}
    const current=await state();if(i){await page.locator('#tracePrev').click();assert.deepEqual(await state(),prior);await page.locator('#traceNext').click();assert.deepEqual(await state(),current);}prior=current;
   }
   assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());
   records.push({locale:l,preset:p,frames:expected.length,final:await text('bestRead')});console.log('trace checked',l,p,expected.length);
   await page.locator('#traceReset').click();assert(await page.locator('#tracePrev').isDisabled());await page.locator('#traceLast').click();assert.deepEqual(await state(),prior);
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!(await text('predictionFeedback')).includes('3+4+4=11'));
  for(const value of ['0','1','2']){
   await page.locator(`[name=prediction][value="${value}"]`).check();assert(!(await text('predictionFeedback')).includes('3+4+4=11'));await page.locator('#reveal').click();assert((await text('predictionFeedback')).includes('3+4+4=11'));assert.equal(await page.locator('#predictionFeedback').evaluate(el=>el.classList.contains('correct')),value==='2');
   bindings.push({locale:l,choice:value,meaning:'fixed j=2 picks earlier tied right start 4; start 1 is illegal overlap',visible:await text('predictionFeedback')});
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${value}"]`).isChecked());assert((await text('predictionFeedback')).includes('3+4+4=11'));await lang(l);
  }
  await page.locator('#preset').selectOption('1');assert((await text('predictionFeedback')).includes('3+4+4=11'));await page.locator('#traceNext').click();
  const before=await page.locator('#summaryRows').innerHTML();await lang(l==='en'?'zh':'en');assert((await text('frameRead')).includes('1/'));assert(await page.locator('[name=prediction][value="2"]').isChecked());await lang(l);assert.equal(await page.locator('#summaryRows').innerHTML(),before);
 }
 await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await text('pythonCode'),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await downloadPromise;assert.equal(fs.readFileSync(await dl.path(),'utf8'),source);
 const sentinel='689 distinct clipboard sentinel, not source';await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText:navigator.clipboard.readText.bind(navigator.clipboard),writeText:async()=>{throw Error('intentional fallback');}}}));
 await page.locator('#copyPython').click();assert(await page.locator('#manualSource').isVisible());
 assert.deepEqual(await page.locator('#manualSource').evaluate(el=>({focus:document.activeElement===el,start:el.selectionStart,end:el.selectionEnd,value:el.value})),{focus:true,start:0,end:source.length,value:source});assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 const host=os.platform(),shortcut=host==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(shortcut);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.screenshot({path:path.join(out,'copy-fallback.png')});
 const layouts=[];
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('1');await page.locator('#traceLast').click();await page.locator('#tracePrev').click();
  await page.locator('#windows').scrollIntoViewIfNeeded();
  const geometry=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('#windows .window')].map(el=>({w:el.getBoundingClientRect().width,scroll:el.scrollWidth,client:el.clientWidth}))}));assert(geometry.doc<=width+1);for(const c of geometry.cards)assert(c.scroll<=c.client+1,JSON.stringify(c));
  await page.screenshot({path:path.join(out,`${l}-${width}-trace.png`)});await page.locator('#step2 .controls').screenshot({path:path.join(out,`${l}-${width}-controls.png`)});
  // Explicit horizontal scroll is keyboard-accessible and preserves column headings.
  await page.locator('#tableWrap').focus();await page.keyboard.press('End');
  layouts.push({locale:l,width,...geometry,frame:await text('frameRead'),best:await text('bestRead')});
 }
 for(const l of ['en','zh'])for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#windows').scrollIntoViewIfNeeded();
  const g=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,available:document.documentElement.clientWidth,cards:[...document.querySelectorAll('#windows .window')].map(el=>({scroll:el.scrollWidth,client:el.clientWidth}))}));assert(g.doc<=g.available+1,JSON.stringify(g));for(const c of g.cards)assert(c.scroll<=c.client+1,JSON.stringify(c));
  await page.screenshot({path:path.join(out,`${l}-${width}-zoom200.png`)});layouts.push({locale:l,width,zoom:2,...g});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.setViewportSize({width:390,height:1000});await lang('en');await page.locator('#preset').selectOption('0');await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert((await text('frameRead')).includes('1/'));
 const focus=await page.locator('#traceNext').evaluate(el=>({active:document.activeElement===el,width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert(focus.active);assert.equal(focus.width,'3px');await page.locator('#traceNext').screenshot({path:path.join(out,'keyboard-focus.png')});await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');
 await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 for(let i=0;i<5;i++){await page.locator(`.step-nav a[href="#step${i}"]`).click();await page.waitForTimeout(100);const g=await page.evaluate(i=>({target:document.querySelector('#step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.target>=g.nav-1,JSON.stringify(g));}
 await page.locator('#traceReset').click();
 const contrasts=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=s=>rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05),data=[];
  for(const sel of ['body','.hint','.explain','.window','#tracePrev','#traceNext','#langToggle .active','.step-nav a','#copyStatus']){
   const el=document.querySelector(sel),cs=getComputedStyle(el);let x=el,bg;
   while(x){const b=getComputedStyle(x).backgroundColor;if(b!=='rgba(0, 0, 0, 0)'&&b!=='transparent'){bg=b;break;}x=x.parentElement;}
   data.push({selector:sel,fg:cs.color,bg,ratio:ratio(cs.color,bg)});
  }
  data.push({selector:'focus on panel2',ratio:ratio('rgb(255,180,84)','rgb(28,35,48)')});const cs=getComputedStyle(document.querySelector('.window'));data.push({selector:'window border',ratio:ratio(cs.borderTopColor,cs.backgroundColor)});return data;
 });for(const c of contrasts)assert(c.ratio>=(c.selector.includes('focus')||c.selector.includes('border')?3:4.5),JSON.stringify(c));
 for(const href of await page.locator('a[href]').evaluateAll(els=>els.map(x=>x.getAttribute('href')))){
  if(href.startsWith('http'))continue;const u=new URL(href,page.url()),r=await context.request.get(u.href);assert(r.ok(),href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);
 }
 const isolated=await browser.newContext();await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const ip=await isolated.newPage();ip.on('pageerror',e=>errors.push(e.message));await ip.goto(base+'/leetcode/689/');await ip.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);await ip.locator('[data-lang=zh]').click();assert.equal(await ip.locator('html').getAttribute('lang'),'zh-CN');await isolated.close();
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(bad,[]);
 const report={kind:'author browser self-check',result:'pass',records,bindings,layouts,source:'exact embedded/rendered/copied/downloaded/manual copy including final newline',clipboard:{host,shortcut,fullSelection:true,actualReadback:true},keyboard:focus,contrasts,cssBytes,storageDenied:true,offline:true,localErrors:errors,badAssets:bad,externalRequests:external,zoomMethod:'real Chromium CSS zoom:2; browser-chrome zoom and physical devices unverified'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:'pass',records:records.length,layouts:layouts.length,cssBytes,contrasts},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
