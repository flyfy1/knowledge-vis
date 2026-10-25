'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const C=require('../core.js');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18779';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const expected=[[[0,0],[0,2],[1,0],[2,0],[2,2]],[[1,1],[2,0],[2,4],[3,3],[4,2]],[[1,2],[2,2],[4,2]],[[2,3]],[[1,0],[1,1],[1,2],[1,3]],[[0,0],[2,5],[3,0]]];
const report={selfCheck:true,origin:base,states:[],screenshots:[],errors:[],contrast:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});page.on('requestfailed',r=>report.errors.push(r.url()));
 const runtimeRequests=[];page.on('request',r=>runtimeRequests.push(r.url()));
 await page.goto(base+'/leetcode/587/');await page.locator('#progress').filter({hasText:'0/'}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator('[data-lang='+lang+']').click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),'cross(A,B,C) = (Bx−Ax)×(Cy−Ay) − (By−Ay)×(Cx−Ax)');
  await page.locator('#tinyToggle').click();assert((await page.locator('#tinyRead').textContent()).includes('(1,0)'));await page.locator('#tinyToggle').click();
  for(const [y,v]of [[-1,2],[0,0],[1,-2]]){await page.selectOption('#turnY',String(y));const text=await page.locator('#turnRead').textContent();assert(text.includes('= '+v));report.states.push({lang,state:'turn',y,expected:v,text});}
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));const frames=C.trace(C.presets[p]);
   assert(await page.locator('#tracePrev').isDisabled());
   for(let i=0;i<frames.length;i++){
    if(i)await page.locator('#traceNext').click();
    const f=frames[i],text=await page.locator('#operationRead').textContent();
    assert((await page.locator('#progress').textContent()).includes(i+'/'+(frames.length-1)));
    const lower=await page.locator('#lowerRead').textContent(),upper=await page.locator('#upperRead').textContent();
    for(const q of f.lower)assert(lower.includes('('+q.join(',')+')'));
    for(const q of f.upper)assert(upper.includes('('+q.join(',')+')'));
    if(f.kind==='pop'||f.kind==='keep'){assert(text.includes('cross='+f.value));assert(text.includes('B=('+f.b.join(',')+')'));report.states.push({lang,preset:p,event:i,kind:f.kind,text});}
    if(i===Math.floor(frames.length/2)){
     const before=await page.locator('#traceStage').textContent();await page.locator('#tracePrev').click();await page.locator('#traceNext').click();assert.equal(await page.locator('#traceStage').textContent(),before);
    }
   }
   assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());
   const text=await page.locator('#operationRead').textContent();
   for(const q of expected[p])assert(text.includes('('+q.join(',')+')'));
   assert(text.includes((lang==='zh'?'（':'(')+expected[p].length+' '));
   report.states.push({lang,preset:p,state:'completed',expected:expected[p],text});
   await page.locator('#traceReset').click();assert(await page.locator('#tracePrev').isDisabled());await page.locator('#traceLast').click();
  }
  for(const answer of [1,2,3]){
   await page.locator('[name=prediction][value="'+answer+'"]').check();assert(!(await page.locator('#feedback').textContent()).includes('−5'));
   await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();assert(text.includes('−5')&&text.includes('−3'));report.states.push({lang,state:'prediction',answer,text});
   const other=lang==='en'?'zh':'en';await page.locator('[data-lang='+other+']').click();assert(await page.locator('[name=prediction][value="'+answer+'"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('−5'));await page.locator('[data-lang='+lang+']').click();
  }
  await page.locator('#traceReset').click();assert((await page.locator('#feedback').textContent()).includes('−5'));
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const downloadPath=await download.path();assert(fs.readFileSync(downloadPath).equals(Buffer.from(source)));
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('test unavailable');};});
  await page.locator('#copyPython').click();assert(await page.locator('#manualSource').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert(await page.locator('#manualSource').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press('Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const fallbackText=await page.locator('#copyStatus').textContent();report.states.push({lang,state:'copy-fallback',text:fallbackText});
  await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  // Real keyboard activation and focus, without replacing a focused control.
  await page.locator('#tinyToggle').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#tinyToggle').getAttribute('aria-pressed'),'true');
  const outline=await page.locator('#tinyToggle').evaluate(el=>getComputedStyle(el).outlineWidth);assert.equal(outline,'3px');await page.keyboard.press('Space');
  await page.locator('[data-lang='+lang+']').focus();await page.keyboard.press('Enter');assert(await page.locator('[data-lang='+lang+']').evaluate(el=>el===document.activeElement));
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','5');
   const fr=C.trace(C.presets[5]);const index=fr.findIndex(f=>f.kind==='pop'&&f.value===-15); // fall back to first pop
   const target=index>=0?index:fr.findIndex(f=>f.kind==='pop');
   for(let i=0;i<target;i++)await page.locator('#traceNext').click();
   await page.locator('a[href="#step2"]').click();
   const geom=await page.locator('#step2').boundingBox(),nav=await page.locator('.step-nav').boundingBox();assert(geom.y>=nav.y+nav.height-2);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow,'page overflow at '+width);
   // Scroll the 2-D figure to verify both extremes remain reachable.
   const scroll=page.locator('#traceStage .plot-scroll');await scroll.evaluate(el=>el.scrollLeft=el.scrollWidth);assert(await scroll.evaluate(el=>el.scrollLeft===el.scrollWidth-el.clientWidth));await scroll.evaluate(el=>el.scrollLeft=0);
   await page.locator('#operationRead').scrollIntoViewIfNeeded();
   if(width===320||width===1440){
    const name=lang+'-plot-'+width+'-left.png';await scroll.screenshot({path:path.join(out,name)});report.screenshots.push(name);
    if(width===320){await scroll.evaluate(el=>el.scrollLeft=el.scrollWidth);const rightName=lang+'-plot-320-right.png';await scroll.screenshot({path:path.join(out,rightName)});report.screenshots.push(rightName);await scroll.evaluate(el=>el.scrollLeft=0);}
   }
   const name=lang+'-'+width+'.png';await page.screenshot({path:path.join(out,name)});report.screenshots.push(name);
   // Essential labels remain separate, with source and long readouts wrapping.
   const boxes=await page.locator('.state-grid > div').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
   assert(boxes[0].x+boxes[0].w<=boxes[1].x+1||boxes[0].y+boxes[0].h<=boxes[1].y+1);
  }
  // Desktop browser zoom 200% emulation: double CSS pixel size and halve layout viewport.
  await page.setViewportSize({width:720,height:500});await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('#operationRead').scrollIntoViewIfNeeded();assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
  const zoom=lang+'-zoom200.png';await page.screenshot({path:path.join(out,zoom)});report.screenshots.push(zoom);await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Actual computed colors: text, labels, disabled, selected, focus on their rendered backgrounds.
 await page.setViewportSize({width:1440,height:1000});await page.selectOption('#preset','0');
 await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
 const pairs=await page.evaluate(()=>{
  const sels=['body','.explain','.hint','.badge','#tracePrev','#traceNext','#langToggle .active','#operationRead','.step-nav a','#tinyToggle','#feedback'];
  return sels.map(selector=>{const el=document.querySelector(selector),s=getComputedStyle(el);let parent=el,bg='rgba(0, 0, 0, 0)';while(parent&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(parent).backgroundColor;parent=parent.parentElement;}if(bg.startsWith('rgba(')){const a=Number(bg.match(/[\d.]+/g)[3]),rgb=bg.match(/[\d.]+/g).slice(0,3).map(Number),back=[13,17,23];bg='rgb('+rgb.map((v,i)=>v*a+back[i]*(1-a)).join(', ')+')';}return {selector,fg:s.color,bg,opacity:s.opacity};});
 });
 const lum=rgb=>rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);
 for(const pair of pairs){const parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const l=[lum(parse(pair.fg)),lum(parse(pair.bg))].sort((a,b)=>a-b);pair.ratio=(l[1]+.05)/(l[0]+.05);assert(pair.ratio>=4.5,JSON.stringify(pair));assert.equal(pair.opacity,'1');report.contrast.push(pair);}
 const focusRatio=(lum([255,180,84])+.05)/(lum([28,35,48])+.05);assert(focusRatio>=3);report.focusContrast=focusRatio;
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('https:'))continue;
  const url=new URL(href,page.url());const response=await context.request.get(url.href.split('#')[0]);assert.equal(response.status(),200);
  if(url.hash){if(url.pathname==='/leetcode/587/')assert(await page.locator(url.hash).count());else assert((await response.text()).includes('id="'+url.hash.slice(1)+'"'));}
 }
 assert(runtimeRequests.every(x=>x.startsWith(base)||x.startsWith('data:')));
 report.runtimeAssetRequests=[...new Set(runtimeRequests)];
 // Storage-denied initialization, locale switching, and preserved state.
 const denied=await browser.newContext();const dp=await denied.newPage();await dp.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});
 await dp.goto(base+'/leetcode/587/');await dp.locator('#traceNext').click();const prior=await dp.locator('#progress').textContent();await dp.locator('[data-lang=zh]').click();await dp.locator('[data-lang=en]').click();assert.equal(await dp.locator('#progress').textContent(),prior);report.storageDenied=true;await denied.close();
 // Offline file source is self-contained, including bilingual rendering.
 const offline=await browser.newContext();const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.locator('[data-lang=zh]').click();assert((await op.locator('h1').textContent()).includes('安装栅栏'));report.offlineSource=true;await offline.close();
 report.cssBytes=fs.statSync(path.join(root,'local.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(report.cssBytes<25000);assert.deepStrictEqual(report.errors,[]);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({ok:true,states:report.states.length,screenshots:report.screenshots,cssBytes:report.cssBytes,errors:report.errors}));
})().catch(e=>{fs.writeFileSync(path.join(out,'browser-failure.txt'),e.stack+'\n');console.error(e);process.exit(1);});
