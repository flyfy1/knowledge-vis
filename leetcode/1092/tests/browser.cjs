'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||__dirname+'/evidence',URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1092/';fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(ROOT+'/solution.py','utf8'),sandbox={window:{}};vm.runInNewContext(fs.readFileSync(ROOT+'/copy.js','utf8'),sandbox);const copy=sandbox.window.LESSON_COPY;
const inputs=[['ab','ac',3],['abac','cab',5],['aaaaaaaa','aaaaaaaa',8],['aab','baa',4],['ab','cd',4],['a','a',1],['a','b',2]];
function isSub(a,b){let i=0;for(const c of b)if(c===a[i])i++;return i===a.length;}
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'}),page=await ctx.newPage();
 const report={scope:'author self-check; independent review pending',host:process.platform,browser:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],contrast:[],links:[],errors:[],assets:[],external:[]};
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('requestfailed',r=>report.assets.push(r.url()));page.on('response',r=>{if(r.status()>=400)report.assets.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))report.external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:'0/'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const snap=()=>page.evaluate(()=>['table','event','progress','output','invariant','history'].map(id=>document.getElementById(id).innerHTML));
 for(const lang of ['en','zh']){
  const col=lang==='en'?1:0;await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),copy.title[col]);
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),copy.formula[col]);assert((await page.locator('[data-i18n=formula]').textContent()).includes('dp[i+1][j+1]'));
  for(let p=0;p<inputs.length;p++){
   await page.selectOption('#preset',String(p));const initial=await snap();assert(await page.locator('#prev').isDisabled());let count=0;const branches=new Set();
   while(await page.locator('#next').isEnabled()){
    const before=await snap();await page.locator('#next').click();const after=await snap();const f=await page.evaluate(()=>model.frames[index]);branches.add(f.reason||f.kind);
    if(f.kind==='equal'||f.kind==='different'){
     const td=page.locator(`td[data-row="${f.r}"][data-col="${f.c}"]`);assert.equal(await td.textContent(),`${f.value} ★`);assert.equal(await td.evaluate(e=>getComputedStyle(e).borderTopWidth),'2px');
     const text=await page.locator('#event').textContent();assert(text.includes(`= ${f.value}`));
    }
    if(f.kind==='emit'){assert.equal((await page.locator('#history li').all()).length,f.history.length);assert((await page.locator('#output').textContent()).endsWith(f.out));assert.equal(f.out.length+f.table[f.i][f.j],inputs[p][2]);}
    await page.locator('#prev').click();assert.deepEqual(await snap(),before);await page.locator('#next').click();assert.deepEqual(await snap(),after);count++;
   }
   const f=await page.evaluate(()=>model.frames[index]);assert.equal(f.out.length,inputs[p][2]);assert(isSub(inputs[p][0],f.out)&&isSub(inputs[p][1],f.out));assert(await page.locator('#end').isDisabled());
   report.presets.push({lang,p,operations:count,output:f.out,length:f.out.length,branches:[...branches],terminalText:await page.locator('#invariant').textContent()});
   await page.locator('#reset').click();assert.deepEqual(await snap(),initial);await page.locator('#end').click();
  }
  // Target semantic bindings: mismatch, equality, both tails, both choices.
  for(const [p,kind] of [[0,'different'],[0,'equal'],[0,'both'],[0,'takeA'],[0,'tailB'],[1,'takeB'],[1,'tailA']]){
   await page.selectOption('#preset',String(p));const k=await page.evaluate(kind=>model.frames.findIndex(f=>(f.reason||f.kind)===kind),kind);assert(k>=0,kind);
   for(let i=0;i<k;i++)await page.locator('#next').click();const text=await page.locator('#event').textContent();report.semantics.push({lang,p,kind,text});
   if(kind==='different')assert(text.includes('min('));if(['both','takeA','takeB','tailA','tailB'].includes(kind))assert(text.includes(copy[kind][col]));
  }
  await page.selectOption('#preset','0');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#event').textContent()).includes('min('));
  const state=await snap();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),state);
  for(let i=0;i<3;i++)await page.locator('#handNext').click();assert(await page.locator('#handNext').isDisabled());assert.equal(await page.locator('#handHistory li').count(),3);assert((await page.locator('#handState').textContent()).includes('abc'));
  while(await page.locator('#handPrev').isEnabled())await page.locator('#handPrev').click();assert.equal(await page.locator('#handHistory li').count(),0);
  for(let opt=0;opt<3;opt++){
   await page.locator(`[name=prediction][value="${opt}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();assert(text.startsWith(copy[opt===2?'correct':'incorrect'][col]));assert(text.includes(copy.explanation[col]));
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();report.semantics.push({lang,opt,text});
  }
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);assert.equal(await page.locator('#copyStatus').textContent(),copy.copied[col]);
  for(let attempt=0;attempt<2;attempt++){
   const sentinel=`1092-${lang}-${attempt}-${Date.now()}`;
   await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel failed');},sentinel);
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.locator('#copyStatus').textContent(),copy.manual[col]);assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);report.clipboard.push({lang,attempt,sentinelVerified:true,manualNativeTransfer:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
  }
  const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await dl.saveAs(path.join(OUT,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(OUT,`download-${lang}.py`),'utf8'),source);
  // Inspect header and a closed preset at the narrowest 200% layout.
  await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>{document.body.style.zoom=2;scrollTo(0,0);});
  await page.screenshot({path:path.join(OUT,`header-${lang}-320-zoom2.png`)});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.selectOption('#preset','2');for(let k=0;k<6;k++)await page.locator('#next').click();
   await page.locator('#tableWrap').scrollIntoViewIfNeeded();await page.evaluate(()=>{let r=document.getElementById('tableWrap').getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});
   const geometry=await page.evaluate(()=>{const el=document.getElementById('preset'),cs=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=cs.font;const label=el.options[el.selectedIndex].text;return {document:document.documentElement.scrollWidth,width:innerWidth,tableClient:document.getElementById('tableWrap').clientWidth,tableScroll:document.getElementById('tableWrap').scrollWidth,cellMin:Math.min(...[...document.querySelectorAll('#table td')].map(e=>e.getBoundingClientRect().width)),select:{label,textWidth:c.measureText(label).width,width:el.clientWidth,padding:parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),arrowReserve:20,font:cs.font}};});
   assert(geometry.document<=width+1,JSON.stringify(geometry));assert(geometry.cellMin>=48*zoom-1);assert(geometry.select.textWidth+geometry.select.padding+geometry.select.arrowReserve<=geometry.select.width,JSON.stringify(geometry.select));
   const narrowState=await snap();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),narrowState);
   await page.locator('#tableWrap').scrollIntoViewIfNeeded();await page.evaluate(()=>{const e=document.getElementById('tableWrap');e.scrollLeft=e.scrollWidth;const r=e.getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});
   const rowHeader=await page.locator('#table tbody th').first().boundingBox(),wrap=await page.locator('#tableWrap').boundingBox();assert(rowHeader.x>=wrap.x-1&&rowHeader.x<wrap.x+wrap.width,'sticky row label retained during horizontal scroll');
   await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}.png`)});report.layouts.push({lang,width,zoom,method:'CSS zoom equivalent layout stress',geometry});
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:390,height:900});await page.selectOption('#preset','0');await page.locator('#end').click();await page.locator('.stage').nth(1).screenshot({path:path.join(OUT,`reconstruction-${lang}.png`)});
  // Table scrolling is an actual keyboard action.
  await page.selectOption('#preset','2');await page.locator('#tableWrap').focus();await page.evaluate(()=>document.getElementById('tableWrap').scrollLeft=0);await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await page.locator('#tableWrap').evaluate(e=>e.scrollLeft)>0);
  for(const a of await page.locator('.related a').all()){
   const href=await a.getAttribute('href'),dest=new globalThis.URL(href,URL),p=await ctx.newPage();await p.goto(dest.href);assert(await p.locator(dest.hash).count());report.links.push({href,heading:await p.locator(dest.hash+' h2').textContent()});await p.close();
  }
  await page.locator('.related a').first().focus();await page.keyboard.press('Enter');await page.waitForTimeout(120);assert.equal(new globalThis.URL(page.url()).hash,'#step3');const top=await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top);const bottom=await page.locator('.step-nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=bottom-1,{top,bottom});
 }
 // Contrast function calibration; same function used on actual rendered colors.
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}
 function lum(a){return a.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);}
 assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(lum([255,0,0]),.2126);assert.equal(lum([0,255,0]),.7152);assert.equal(lum([0,0,255]),.0722);assert(Math.abs(lum([255,255,255])-1)<1e-12);assert.equal(lum([0,0,0]),0);const near=contrast([116,116,116],[0,0,0]);assert(Math.abs(near-4.492948073111701)<1e-12);assert(near<4.5);report.calibration={blackWhite:21,red:.2126,green:.7152,blue:.0722,nearThreshold:near,nearPass:false};
 await page.selectOption('#preset','0');await page.locator('#next').click();
 for(const selector of ['body','.hint','.explain','.readout','.dp td.current','.dp td.unknown','.dp th','.btn:disabled','.btn.primary:not(:disabled)','.step-nav a.active']){
  const colors=await page.locator(selector).first().evaluate(e=>{const st=getComputedStyle(e);let p=e,bg;while(p){const s=getComputedStyle(p);if(Number(s.opacity)!==1)throw Error('opacity');if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){bg=s.backgroundColor;break;}p=p.parentElement;}return {fg:st.color,bg};});
  const ratio=contrast(rgb(colors.fg),rgb(colors.bg));assert(ratio>=4.5,selector+' '+ratio);report.contrast.push({selector,...colors,ratio});
 }
 const focus=contrast([255,180,84],[22,27,34]);assert(focus>=3);report.focusContrast=focus;
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.screenshot({path:path.join(OUT,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));const bp=await blocked.newPage();await bp.goto(URL);await bp.locator('#progress').filter({hasText:'0/'}).waitFor();await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert((await bp.locator('#event').textContent()).includes('min('));await blocked.close();
 const offline=await ctx.newPage();await offline.goto('file://'+ROOT+'/index.html');await offline.locator('#progress').filter({hasText:'0/'}).waitFor();assert.equal(await offline.locator('#code').textContent(),source);await offline.close();
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.assets,[]);assert.deepEqual(report.external,[]);
 report.passed=true;report.shippedCssBytes=fs.statSync(ROOT+'/style.css').size+fs.statSync(ROOT+'/../style.css').size;assert(report.shippedCssBytes<25000);fs.writeFileSync(OUT+'/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,presets:report.presets.length,layouts:report.layouts.length,clipboard:report.clipboard,cssBytes:report.shippedCssBytes,contrast:report.contrast}));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
