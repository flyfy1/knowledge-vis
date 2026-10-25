'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),os=require('os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
const C=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
 const p=await context.newPage(),errors=[],requests=[],records=[],layouts=[],clipboard=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});p.on('request',r=>requests.push(r.url()));
 await p.goto(base+'/leetcode/829/');await p.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 const text=async id=>p.locator('#'+id).textContent();
 async function lang(l){await p.locator(`[data-lang=${l}]`).click();assert.equal(await p.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 function expected(n){let count=0;for(let a=1;a<=n;a++){let s=0;for(let b=a;s<n;b++){s+=b;if(s===n)count++;}}return count;}
 async function snapshot(){return {frame:await text('frameRead'),event:await text('event'),ledger:await text('ledger'),guard:await text('guard'),guardHidden:await p.locator('#guard').isHidden()};}
 for(const l of ['en','zh']){
  await lang(l);assert.equal(await p.evaluate(()=>window.PYTHON_SOURCE),source);assert.equal(await text('pythonCode'),source);
  const formula=await p.locator('[data-i18n=formula]').textContent();assert(formula.includes('n = k·a + k(k−1)/2'));assert(formula.includes('a = R/k'));
  for(let k=1;k<=3;k++){
   await p.locator('#hand'+k).click();assert.equal(await p.locator('#hand'+k).getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#tiles .tile').count(),k);
   const read=await text('handRead');assert(read.includes(k===1?'5−0=5':k===2?'5−(0+1)=4':'1+2+3=6'));
   records.push({locale:l,branch:'hand',k,read,tiles:await text('tiles')});
  }
  await p.locator('#handReset').click();assert.equal(await p.locator('#hand1').getAttribute('aria-pressed'),'true');
  // Every preset: every frame, reverse replay, final stop, initial reset.
  for(const n of C.presets){
   await p.locator('#preset').selectOption(String(n));const frames=C.trace(n);assert(await p.locator('#prev').isDisabled());assert((await text('frameRead')).includes('0/'+(frames.length-1)));
   for(let i=1;i<frames.length;i++){
    await p.locator('#next').click();const f=frames[i];assert((await text('frameRead')).includes(`${i}/${frames.length-1}`));
    assert((await text('frameRead')).includes(l==='en'?`${f.count} ways`:`${f.count} 种`));
    assert.equal(await p.locator('.candidate-row').count(),f.done.length);
    if(f.phase==='stop'){assert((await text('event')).includes(`${f.current.minimum} > ${n}`));assert(await p.locator('#next').isDisabled());assert(await p.locator('#guard').isHidden());assert.equal(f.count,expected(n));}
    else{
     assert((await text('event')).includes(`R=${n}−${f.current.offset}=${f.current.remaining}`));
     const row=p.locator('.candidate-row').last();assert((await row.textContent()).includes(`R % k=${f.current.remainder}`));
     assert((await row.locator('b').textContent()).includes(l==='en'?(f.current.accepted?'Accepted':'Rejected'):(f.current.accepted?'通过 ✓':'不通过 ×')));
    }
    const before=await snapshot();await p.locator('#prev').click();await p.locator('#next').click();assert.deepEqual(await snapshot(),before);
   }
   records.push({locale:l,branch:'preset endpoint',n,expected:expected(n),...(await snapshot())});
   while(!await p.locator('#prev').isDisabled())await p.locator('#prev').click();assert((await text('event')).includes(l==='en'?'No length':'还没有'));
   await p.locator('#end').click();assert(await p.locator('#end').isDisabled());await p.locator('#traceReset').click();assert(await p.locator('#prev').isDisabled());
  }
  await p.locator('#preset').selectOption('15');await p.locator('#next').click();await p.locator('#next').click();
  // Fresh prediction hidden until explicit reveal. Every choice, change, cross-locale preservation.
  await p.locator('#quizReset').click();assert(await p.locator('#reveal').isDisabled());assert(!(await text('feedback')).includes('12%4'));
  for(const choice of ['0','1','2']){
   await p.locator(`[name=prediction][value="${choice}"]`).check();assert(!(await text('feedback')).includes('12%4'));
   await p.locator('#reveal').click();let feedback=await text('feedback');assert(feedback.includes('12%4=0'));assert(feedback.includes('3+4+5+6=18'));assert(feedback.startsWith(l==='en'?(choice==='1'?'Correct':'Revise'):(choice==='1'?'判断正确':'需要调整')));
   records.push({locale:l,branch:'prediction',choice,feedback});
   const preserved=await snapshot();await lang(l==='en'?'zh':'en');assert(await p.locator(`[name=prediction][value="${choice}"]`).isChecked());assert((await text('feedback')).includes('12%4=0'));assert((await text('frameRead')).includes('2/'));await lang(l);assert.deepEqual(await snapshot(),preserved);assert.equal(await text('feedback'),feedback);
  }
  await p.locator('[name=prediction][value="0"]').check();assert(!(await text('feedback')).includes('12%4'));await p.locator('#quizReset').click();assert(await p.locator('#reveal').isDisabled());
  // Trace controls do not destroy prediction and vice versa.
  await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.locator('#traceReset').click();assert((await text('feedback')).includes('12%4=0'));
  await p.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await text('pythonCode'),source);
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await p.evaluate(()=>{window.realClipboard=navigator.clipboard;});await p.locator('#copyPython').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  for(let repeat=0;repeat<2;repeat++){
   const sentinel=`829-${l}-${repeat}-${Date.now()}`;
   await p.evaluate(async s=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.realClipboard});await navigator.clipboard.writeText(s);},sentinel);assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));await p.locator('#copyPython').click();assert(await p.locator('#sourceFallback').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'manualSource');
   assert.deepEqual(await p.locator('#manualSource').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);
   const shortcut=os.platform()==='darwin'?'Meta+C':'Control+C';await p.keyboard.press(shortcut);assert.equal(await p.evaluate(()=>window.realClipboard.readText()),source);
   clipboard.push({locale:l,repeat,host:os.platform(),shortcut,freshSentinelVerified:true,exactNativeReadback:true});
  }
  records.push({locale:l,branch:'copy fallback',text:await text('copyStatus')});await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.realClipboard}));
 }
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await p.setViewportSize({width,height:1000});await lang(l);await p.locator('#sourceFallback').evaluate(e=>e.hidden=true);await p.locator('#preset').selectOption('45');for(let i=0;i<4;i++)await p.locator('#next').click();
  await p.locator('#event').scrollIntoViewIfNeeded();
  const geometry=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:innerWidth,rows:[...document.querySelectorAll('.candidate-row,.tile,#event,#frameRead')].map(e=>({w:e.clientWidth,scroll:e.scrollWidth}))}));assert(geometry.doc<=width+1,JSON.stringify(geometry));geometry.rows.forEach(g=>assert(g.scroll<=g.w+1));
  layouts.push({locale:l,width,...geometry});await p.screenshot({path:path.join(out,`${l}-${width}-trace.png`)});
  await p.locator('#end').click();await p.locator('#ledger').screenshot({path:path.join(out,`${l}-${width}-ledger.png`)});
  await p.locator('#hand2').click();await p.locator('#step0 .stage').screenshot({path:path.join(out,`${l}-${width}-hand.png`)});
  await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.locator('#step3 .stage').screenshot({path:path.join(out,`${l}-${width}-quiz.png`)});
  if(width===1440){await p.locator('#step0').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${l}-desktop.png`)});}
 }
 for(const l of ['zh','en'])for(const width of [320,390,1440]){
  await p.setViewportSize({width,height:1000});await lang(l);await p.evaluate(()=>document.documentElement.style.zoom='2');await p.locator('#preset').selectOption('15');await p.locator('#next').click();await p.locator('#next').click();await p.locator('#event').scrollIntoViewIfNeeded();
  const g=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,rows:[...document.querySelectorAll('.candidate-row,#event,#frameRead')].map(e=>({w:e.clientWidth,scroll:e.scrollWidth}))}));assert(g.doc<=g.viewport+1,JSON.stringify(g));g.rows.forEach(e=>assert(e.scroll<=e.w+1));layouts.push({locale:l,width,zoom:2,...g});
  await p.screenshot({path:path.join(out,`${l}-${width}-zoom200.png`)});await p.evaluate(()=>document.documentElement.style.zoom='');
 }
 await p.setViewportSize({width:390,height:1000});await lang('en');await p.locator('#preset').selectOption('5');await p.locator('#next').focus();await p.keyboard.press('Enter');assert((await text('frameRead')).includes('1/3'));
 const focus=await p.locator('#next').evaluate(e=>({active:document.activeElement===e,outline:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert(focus.active);assert.equal(focus.outline,'3px');await p.locator('#next').screenshot({path:path.join(out,'keyboard-focus.png')});await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'traceReset');
 await p.emulateMedia({forcedColors:'active'});await p.locator('#next').focus();assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await p.emulateMedia({forcedColors:'none'});
 for(let i=0;i<5;i++){
  await p.locator(`.step-nav a[href="#step${i}"]`).click();const g=await p.evaluate(i=>({top:document.getElementById('step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.top>=g.nav-1,JSON.stringify(g));
 }
 const links=[];
 for(const href of [...new Set(await p.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))))]){
  if(href.startsWith('http'))continue;const u=new URL(href,p.url()),r=await context.request.get(u.href);assert(r.ok(),href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);links.push(href);
 }
 // Actually follow related anchors and confirm the promised concept is present.
 for(const l of ['en','zh'])for(const [i,id,needle] of [[0,483,l==='en'?'integer':'整数'],[1,233,l==='en'?'digit':'数位']]){
  await lang(l);await p.locator('.related a').nth(i).click();await p.waitForURL(`**/${id}/#step2`);const content=await p.locator('#step2').textContent();assert(content.toLowerCase().includes(needle),content);records.push({locale:l,branch:'related anchor',id,text:content.slice(0,500)});
  await p.goto(base+'/leetcode/829/');await p.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 }
 await lang('en');await p.setViewportSize({width:320,height:1000});await p.locator('#frameRead').evaluate(e=>e.textContent='W'.repeat(120)+'中文'.repeat(120));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.locator('#traceReset').click();
 const targets=await p.locator('button,.btn,.prediction-options label,.step-nav a,.official-link').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));for(const e of targets)assert(e.w>=48&&e.h>=48,JSON.stringify(e));
 await p.locator('#hand2').click();await p.locator('#next').click();
 const contrasts=await p.evaluate(()=>{
  function lum(s){return s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>(v/=255)<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
  function ratio(a,b){return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);}
  if(ratio('rgb(0,0,0)','rgb(255,255,255)')!==21)throw Error('contrast calibration');
  const values=['body','.explain','.hint','#prev','#next','#hand2','.lang-toggle .active','.tile span','.step-nav a','#feedback','.candidate-row b','.candidate-row p'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let n=e,bg;while(n){bg=getComputedStyle(n).backgroundColor;if(!['transparent','rgba(0, 0, 0, 0)'].includes(bg))break;n=n.parentElement;}return {selector,fg:s.color,bg,ratio:ratio(s.color,bg)};});
  return values.concat([{selector:'focus/panel2',ratio:ratio('rgb(255,180,84)','rgb(28,35,48)')},{selector:'control border/panel2',ratio:ratio('rgb(154,167,184)','rgb(28,35,48)')}]);
 });for(const c of contrasts)assert(c.ratio>=(c.selector.includes('focus')||c.selector.includes('border')?3:4.5),JSON.stringify(c));
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));const d=await denied.newPage();d.on('pageerror',e=>errors.push(e.message));await d.goto(base+'/leetcode/829/');await d.locator('[data-lang=zh]').click();assert.equal(await d.locator('html').getAttribute('lang'),'zh-CN');await d.locator('[data-lang=en]').click();assert((await d.locator('#frameRead').textContent()).includes('Checks completed'));await denied.close();
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base)));
 const result={kind:'author real-browser self-check',result:'pass',browser:await browser.version(),records,layouts,clipboard,focus,contrasts,links,cssBytes,errors,localAssetsOnly:true,storageDenied:true,offline:true,sourceParity:'embedded / rendered / downloaded / successful clipboard / native manual fallback exact',zoomMethod:'CSS zoom 2; native chrome zoom and real devices unverified'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({result:'pass',records:records.length,layouts:layouts.length,clipboard,contrasts,cssBytes},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
