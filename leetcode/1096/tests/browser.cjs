'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||__dirname+'/evidence',URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1096/';fs.mkdirSync(OUT,{recursive:true});
const {presets,trace}=require(ROOT+'/core.js'),source=fs.readFileSync(ROOT+'/solution.py','utf8'),box={window:{}};vm.runInNewContext(fs.readFileSync(ROOT+'/copy.js','utf8'),box);const copy=box.window.LESSON_COPY;
const setText=a=>a.length?'{'+a.map(x=>JSON.stringify(x)).join(', ')+'}':'∅';
function eventText(f,col){const d={};for(const [key,value] of Object.entries(f.detail))d[key]=Array.isArray(value)?(f.event==='done'?JSON.stringify(value):setText(value)):value;return copy[f.event==='return'?'returnEvent':f.event][col].replace(/\{(\w+)\}/g,(m,k)=>k in d?d[k]:m);}
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'}),page=await ctx.newPage();
 const report={scope:'author self-check; independent review pending',host:process.platform,browser:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],contrast:[],links:[],errors:[],assets:[],external:[]};
 page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('requestfailed',r=>report.assets.push(r.url()));page.on('response',r=>{if(r.status()>=400)report.assets.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))report.external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:'0/'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);assert(await page.locator('#reveal').isDisabled());assert.equal(await page.locator('#feedback').textContent(),'');
 const snap=()=>page.evaluate(()=>['expression','stack','event','progress','output','history'].map(id=>document.getElementById(id).innerHTML));
 for(const lang of ['en','zh']){
  const col=lang==='en'?1:0;await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),copy.title[col]);assert.equal(await page.title(),copy.docTitle[col]);assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/brace-expansion-ii/');
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),copy.formula[col]);assert((await page.locator('[data-i18n=formula]').textContent()).includes('T ← {x+y | x∈T, y∈A}'));
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',{value:String(p)});const initial=await snap(),model=trace(presets[p]);assert(await page.locator('#prev').isDisabled());assert((await page.locator('#selectedExpression').textContent()).includes(presets[p]));
   for(let k=1;k<model.length;k++){
    const before=await snap();await page.locator('#next').click();const after=await snap(),f=model[k];
    assert.equal(await page.locator('#event').textContent(),eventText(f,col),JSON.stringify({lang,p,k}));
    assert((await page.locator('#progress').textContent()).includes(`${f.i}/${presets[p].length}`));
    assert.equal(await page.locator('#history li').count(),k);assert.equal(await page.locator('.call').count(),f.stack.length);
    for(let d=0;d<f.stack.length;d++){
     const e=page.locator(`.call[data-depth="${d}"]`);assert.deepEqual(await e.locator('code').allTextContents(),[setText(f.stack[d].union),setText(f.stack[d].term)]);
     assert((await e.locator('h3').textContent()).includes(copy[d===f.stack.length-1?'active':'waiting'][col]));
    }
    assert.equal(await page.locator('.token.current').getAttribute('data-index'),String(f.i));
    assert((await page.locator('.token.current small').textContent()).includes(copy[f.i===presets[p].length?'endToken':'nextToken'][col]));
    await page.locator('#prev').click();assert.deepEqual(await snap(),before);await page.locator('#next').click();assert.deepEqual(await snap(),after);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert((await page.locator('#output').textContent()).includes(JSON.stringify(model.at(-1).detail.result)));
   report.presets.push({lang,p,expression:presets[p],operations:model.length-1,answer:model.at(-1).detail.result,output:await page.locator('#output').textContent()});
   await page.locator('#reset').click();assert.deepEqual(await snap(),initial);await page.locator('#end').click();
  }
  // Read each event branch and preserve its rendered meaning through a locale roundtrip.
  for(const key of ['enter','descend','product','comma','return','done']){
   await page.selectOption('#preset',{value:'0'});const f=trace(presets[0]),k=f.findIndex(x=>x.event===key);assert(k>=0,key);
   for(let i=0;i<k;i++)await page.locator('#next').click();const state=await snap();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),state);report.semantics.push({lang,key,event:await page.locator('#event').textContent(),stack:await page.locator('#stack').textContent()});
  }
  await page.selectOption('#preset',{value:'0'});await page.locator('#next').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/'));
  for(let i=0;i<2;i++)await page.locator('#handNext').click();assert(await page.locator('#handNext').isDisabled());assert.equal(await page.locator('#handLog>div').count(),2);assert((await page.locator('#handLog').textContent()).includes(copy.hand1[col]));await page.locator('#handReset').click();assert.equal(await page.locator('#handLog').textContent(),copy.handInitial[col]);
  for(let opt=0;opt<3;opt++){
   await page.locator(`[name=prediction][value="${opt}"]`).check();assert.equal(await page.locator('#feedback').textContent(),copy.chosen[col]);await page.locator('#reveal').click();assert.equal(await page.locator('#feedback').textContent(),copy[opt===1?'correct':'incorrect'][col]+' '+copy.answer[col]);
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());await page.locator(`[data-lang=${lang}]`).click();assert((await page.locator('#feedback').textContent()).includes(copy.answer[col]));
   await page.locator('#next').click();await page.locator('#reset').click();assert((await page.locator('#feedback').textContent()).includes(copy.answer[col]));report.semantics.push({lang,opt,text:await page.locator('#feedback').textContent()});
  }
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#code').textContent(),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();await page.waitForFunction(expected=>document.getElementById('copyStatus').textContent===expected,copy.copied[col]);assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  for(let attempt=0;attempt<2;attempt++){
   const sentinel=`1096-${lang}-${attempt}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel failed');},sentinel);
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.locator('#copyStatus').textContent(),copy.manual[col]);assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);report.clipboard.push({lang,attempt,sentinelVerified:true,nativeTransfer:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
  }
  const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await dl.saveAs(path.join(OUT,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(OUT,`download-${lang}.py`),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();await page.waitForFunction(expected=>document.getElementById('copyStatus').textContent===expected,copy.copied[col]);assert(await page.locator('#manualCopy').isHidden());
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>{document.body.style.zoom=z;scrollTo(0,0);},zoom);await page.selectOption('#preset',{value:'1'});
   const model=trace(presets[1]),index=model.findIndex(f=>f.event==='return'&&f.stack.length===3);assert(index>0);for(let i=0;i<index;i++)await page.locator('#next').click();
   const geometry=await page.evaluate(()=>({document:document.documentElement.scrollWidth,width:innerWidth,cards:[...document.querySelectorAll('.call')].map(e=>({width:e.getBoundingClientRect().width,scroll:e.scrollWidth,client:e.clientWidth})),select:(()=>{const e=document.getElementById('preset'),s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.selectedOptions[0].text,textWidth:c.measureText(e.selectedOptions[0].text).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20,font:s.font};})(),labelWords:[...document.querySelectorAll('.sets b')].map(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.textContent,maxWord:Math.max(...e.textContent.split(/\s+/).map(w=>c.measureText(w).width)),available:e.clientWidth};}),controlMin:Math.min(...[...document.querySelectorAll('button,select')].map(e=>e.getBoundingClientRect().height))}));
   assert(geometry.select.textWidth<=geometry.select.available,JSON.stringify(geometry.select));assert(geometry.document<=width+1,JSON.stringify(geometry));assert(geometry.controlMin>=48*zoom-1);for(const card of geometry.cards)assert(card.scroll<=card.client+1,JSON.stringify({lang,width,zoom,card}));
   if(lang==='en')for(const label of geometry.labelWords)assert(label.maxWord<=label.available,JSON.stringify(label));
   if(width===320&&zoom===2){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(OUT,`header-${lang}-320-zoom2.png`)});}
   await page.locator('#stack').scrollIntoViewIfNeeded();await page.evaluate(()=>{const r=document.getElementById('stack').getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});
   await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}.png`)});
   if(width===320&&zoom===2){await page.locator('#preset').scrollIntoViewIfNeeded();await page.locator('#preset').screenshot({path:path.join(OUT,`select-${lang}-320-zoom2.png`)});}
   report.layouts.push({lang,width,zoom,method:'CSS zoom layout stress',geometry});
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:390,height:900});await page.selectOption('#preset',{value:'2'});await page.locator('#end').click();await page.locator('#step3 .stage').screenshot({path:path.join(OUT,`terminal-${lang}.png`)});
  for(const a of await page.locator('.related a').all()){
   const href=await a.getAttribute('href'),label=await a.textContent(),dest=new globalThis.URL(href,URL),p=await ctx.newPage();await p.setViewportSize({width:320,height:900});await p.goto(URL);await p.locator(`[data-lang=${lang}]`).click();const link=p.locator(`.related a[href="${href}"]`);await link.focus();await p.keyboard.press('Enter');await p.waitForURL(dest.href);assert(await p.locator(dest.hash).count());report.links.push({lang,label,href,resolved:dest.href,keyboard:'Enter',width:320,heading:await p.locator(dest.hash+' h2').textContent(),destinationText:await p.locator(dest.hash).textContent(),destinationSha256:require('crypto').createHash('sha256').update(fs.readFileSync(path.resolve(ROOT,href.split('#')[0],'index.html'))).digest('hex')});await p.close();
  }
  for(const step of [1,2,4,5]){await page.locator(`#step${step}`).screenshot({path:path.join(OUT,`section-${step}-${lang}.png`)});}
  await page.locator('.step-nav a[href="#step3"]').click();await page.waitForTimeout(100);const top=await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top),bottom=await page.locator('.step-nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=bottom-1,JSON.stringify({top,bottom}));
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('[data-lang=en]').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(OUT,'full-en.png'),fullPage:true});
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(a){return a.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}function contrast(a,b){return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);}
 assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(lum([255,0,0]),.2126);assert.equal(lum([0,255,0]),.7152);assert.equal(lum([0,0,255]),.0722);assert(Math.abs(contrast([116,116,116],[0,0,0])-4.492948073111701)<1e-12);
 await page.selectOption('#preset',{value:'0'});await page.locator('#next').click();
 await page.locator('#handNext').click();await page.locator('#handNext').click();
 for(const selector of ['body','.hint','.readout','.call code','.call h3','.sets b','.token.current small','.token.read','.btn:disabled','.btn.primary:not(:disabled)','.step-nav a.active','select','.trace-log li','textarea']){
  const colors=await page.locator(selector).first().evaluate(e=>{const st=getComputedStyle(e);let p=e,bg;while(p){const s=getComputedStyle(p);if(Number(s.opacity)!==1)throw Error('opacity');if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){bg=s.backgroundColor;break;}p=p.parentElement;}return {fg:st.color,bg};});const ratio=contrast(rgb(colors.fg),rgb(colors.bg));assert(ratio>=4.5,selector+' '+ratio);report.contrast.push({selector,...colors,ratio});
 }
 report.focusContrast=contrast([255,180,84],[22,27,34]);assert(report.focusContrast>=3);
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.screenshot({path:path.join(OUT,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));const bp=await blocked.newPage();await bp.goto(URL);await bp.locator('#progress').filter({hasText:'0/'}).waitFor();await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert((await bp.locator('#progress').textContent()).includes('1/'));await blocked.close();
 const offline=await ctx.newPage();await offline.goto('file://'+ROOT+'/index.html');await offline.locator('#progress').filter({hasText:'0/'}).waitFor();assert.equal(await offline.locator('#code').textContent(),source);await offline.locator('#end').click();assert((await offline.locator('#output').textContent()).includes('["ab","ac"]'));await offline.close();
 // Compare rendered baseline with the independently executed oracle source, not a separately maintained code sample.
 assert.equal(await page.locator('#baselineCode').textContent(),fs.readFileSync(ROOT+'/tests/oracle.py','utf8').split('\n').slice(1).join('\n'));
 fs.writeFileSync(OUT+'/browser-results.json',JSON.stringify(report,null,2)+'\n');assert.deepEqual(report.errors,[]);assert.deepEqual(report.assets,[]);assert.deepEqual(report.external,[]);report.passed=true;report.shippedCssBytes=fs.statSync(ROOT+'/lesson.css').size+fs.statSync(ROOT+'/../style.css').size;assert(report.shippedCssBytes<25000);fs.writeFileSync(OUT+'/browser-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,presets:report.presets.length,layouts:report.layouts.length,clipboard:report.clipboard,cssBytes:report.shippedCssBytes,minContrast:Math.min(...report.contrast.map(x=>x.ratio))}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
