const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8'),C=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage(),errors=[],network=[],records=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());network.push(r.url());});page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure().errorText));
 await page.goto(BASE+'/leetcode/502/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.includes('j=0'));
 const text=id=>page.locator('#'+id).textContent(),click=id=>page.locator('#'+id).click();
 const snapshot=()=>page.evaluate(()=>['frameRead','operationRead','projectRows','heap','ledger'].map(id=>document.getElementById(id).textContent));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  for(const choice of ['A','B']){await click('choose'+choice);assert((await text('handRead')).includes(choice==='A'?'1 → 2 → 5':'1 → 4 → 9'));assert.equal(await page.locator('#choose'+choice).getAttribute('aria-pressed'),'true');}
  for(let preset=0;preset<6;preset++){
   await page.selectOption('#preset',String(preset));assert(await page.locator('#tracePrev').isDisabled());
   const ff=C.trace(C.presets[preset]);let step=0;
   do {
    const f=ff[step],read=await text('frameRead');assert(read.includes(`w=${f.w}`));assert(read.includes(`j=${f.j}/${C.presets[preset].c.length}`));assert.equal(await page.locator('#ledger li').count(),f.done.length);
    assert.equal(await page.locator('#heap .heap-item').count(),f.heap.length);
    assert(!(await text('operationRead')).includes('undefined'));assert(!(await text('operationRead')).match(/\{\w+\}/));
    if(f.kind==='pick'){const op=await text('operationRead');assert(op.includes('#'+f.id));assert(op.includes(`${f.before}+${f.profit}=${f.w}`));}
    if(step===2){const before=await snapshot();await click('tracePrev');await click('traceNext');assert.deepEqual(await snapshot(),before);}
    if(await page.locator('#traceNext').isDisabled())break;
    await click('traceNext');step++;
   }while(true);
   assert.equal(step,ff.length-1);assert((await text('operationRead')).includes(String([9,4,6,0,0,9][preset])));
   records.push({lang,preset,frames:step,readout:await text('frameRead'),operation:await text('operationRead')});
   while(!await page.locator('#tracePrev').isDisabled())await click('tracePrev');assert.equal(await page.locator('#ledger li').count(),0);
   await click('traceLast');assert(await page.locator('#traceNext').isDisabled());await click('traceReset');assert(await page.locator('#tracePrev').isDisabled());
  }
  await click('predictionReset');assert(await page.locator('#reveal').isDisabled());
  for(const value of [7,13,15]){
   await page.locator(`[name=prediction][value="${value}"]`).check();assert(!(await text('predictionFeedback')).includes('2+3=5'));
   await click('reveal');let feedback=await text('predictionFeedback');assert(feedback.includes('2+3=5'));assert(feedback.startsWith(lang==='en'?(value===13?'Correct.':'That is not'):(value===13?'正确。':'这项不符合')));
   records.push({lang,choice:value,feedback});
  }
  await page.selectOption('#preset','1');await click('traceNext');await click('traceNext');
  const before=await snapshot();await page.locator('#sourceDetails summary').click();
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator('[name=prediction][value="15"]').isChecked());assert((await text('predictionFeedback')).includes('2+3=5'));assert.equal(await page.locator('#preset').inputValue(),'1');assert.equal(await page.locator('#sourceDetails').getAttribute('open'),'');
  await page.locator(`[data-lang="${lang}"]`).click();assert.deepEqual(await snapshot(),before);
  assert.equal(await text('pythonCode'),source);
  await click('copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const dest=path.join(OUT,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
  await page.evaluate(()=>navigator.clipboard.writeText('sentinel'));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
  await click('copyPython');assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);
  await page.keyboard.press('Control+c');await page.evaluate(()=>delete navigator.clipboard);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const fallbackText=await text('copyStatus');assert(fallbackText.includes(lang==='en'?'manual':'手动'));records.push({lang,clipboard:'success and denied fallback with actual keyboard copy',fallbackText});
  await page.locator('#sourceDetails summary').click();
  // Populate a dense intermediate heap and inspect every required width.
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','5');for(let i=0;i<3;i++)await click('traceNext');
   assert.equal(await page.locator('#heap .heap-item').count(),3);
   await page.locator('.step-nav a[href="#step2"]').click();
   const geom=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,top:document.querySelector('#step2').getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));
   assert(geom.scroll<=width,JSON.stringify(geom));assert(geom.top>=geom.nav-1,JSON.stringify(geom));
   await page.locator('#frameRead').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`)});
   await page.locator('#heap').screenshot({path:path.join(OUT,`${lang}-${width}-heap.png`)});
   // The wide admission table intentionally scrolls within a keyboard-focusable region.
   assert.equal(await page.locator('.table-wrap').getAttribute('tabindex'),'0');
   records.push({lang,width,geometry:geom,heap:await text('heap'),operation:await text('operationRead')});
  }
  await page.selectOption('#preset','0');for(let i=0;i<4;i++)await click('traceNext');
  assert((await text('operationRead')).includes('#2'));assert.equal(await page.locator('#ledger li').count(),1);
  await page.locator('#ledger').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-unlock-ledger.png`)});
  await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-full-trace.png`),style:'.step-nav{visibility:hidden!important}'});
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#frameRead').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.setViewportSize({width:390,height:844});
  for(const id of ['step0','step1','step3','step4']){
   await page.locator(`.step-nav a[href="#${id}"]`).click();
   const geometry=await page.evaluate(id=>({top:document.getElementById(id).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),id);assert(geometry.top>=geometry.nav-1,JSON.stringify(geometry));
   await page.locator('#'+id).screenshot({path:path.join(OUT,`${lang}-${id}.png`),style:'.step-nav{visibility:hidden!important}'});
  }
 }
 // Keyboard operation and visible focus, including horizontal table scroll.
 await page.locator('#traceReset').focus();await page.keyboard.press('Enter');await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceNext');await page.keyboard.press('Enter');assert((await text('frameRead')).includes('j=1/3'));
 const focus=await page.locator('#traceNext').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 await page.locator('.table-wrap').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await page.locator('.table-wrap').evaluate(e=>e.scrollLeft>0));
 for(const href of await page.locator('a[href*="#"]').evaluateAll(es=>es.map(e=>e.href))){const u=new URL(href);const r=await context.request.get(u.href.split('#')[0]);assert(r.ok());assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);}
 await click('traceReset');
 const disabled=await page.locator('#tracePrev').evaluate(e=>({disabled:e.disabled,opacity:getComputedStyle(e).opacity,fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));assert(disabled.disabled);assert.equal(disabled.opacity,'1');
 await click('traceNext');
 const controlSizes=await page.locator('button,select,summary,.prediction-options label,.official-link').evaluateAll(es=>es.map(e=>({tag:e.tagName,id:e.id,height:e.getBoundingClientRect().height})));assert(controlSizes.every(e=>e.height>=48),JSON.stringify(controlSizes));
 const contrast=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  return ['.explain','.hint','.heap-item','.readout','.btn.primary','#tracePrev','.step-nav a','.lang-toggle button.active','textarea','#chooseB','th','select'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let bg=s.backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {sel,fg:s.color,bg,ratio:ratio(rgb(s.color),rgb(bg))};});
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 const focusContrast=(()=>{const rgb=h=>[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)),L=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);return ['0d1117','161b22','1c2330'].map(bg=>({bg,ratio:(L(rgb('ffb454'))+.05)/(L(rgb(bg))+.05)}));})();assert(focusContrast.every(x=>x.ratio>=3));
 await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 assert(network.every(u=>u.startsWith(BASE+'/')));assert.deepEqual(errors,[]);
 const cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(cssBytes<25000);
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}})});const bp=await blocked.newPage(),blockedErrors=[];bp.on('pageerror',e=>blockedErrors.push(e.message));await bp.goto(BASE+'/leetcode/502/');await bp.locator('[data-lang=en]').click();await bp.locator('#chooseB').click();await blocked.setOffline(true);await bp.locator('[data-lang=zh]').click();assert((await bp.locator('#handRead').textContent()).includes('1 → 4 → 9'));await bp.locator('#sourceDetails summary').click();assert.equal(await bp.locator('#pythonCode').textContent(),source);assert.deepEqual(blockedErrors,[]);
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({kind:'author self-check',result:'pass',records,focus,disabled,controlSizes,contrast,focusContrast,errors,assets:[...new Set(network)],cssBytes,limits:'Chromium desktop emulation and CSS zoom 2. No physical mobile, actual novice outcomes, LeetCode submission, deployment or independent review.'},null,2));
 await browser.close();console.log('browser pass; records:',records.length);
})().catch(e=>{console.error(e);process.exit(1)});
