'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1036/';fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8'),copy=JSON.parse(fs.readFileSync(path.join(P,'copy.js'),'utf8').replace(/^window.LESSON_COPY = /,'').replace(/;\s*$/,''));
const expected=[false,false,true,true,true,false];
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});try{
const ctx=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await ctx.newPage();
const report={kind:'author self-check; independent review pending',host:process.platform,browser:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],links:[],errors:[],assetErrors:[],external:[],contrast:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('requestfailed',r=>report.assetErrors.push([r.url(),r.failure()]));page.on('response',r=>{if(r.status()>=400)report.assetErrors.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))report.external.push(r.url());});
await page.goto(URL);await page.locator('#progress').filter({hasText:'0/'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
const snap=()=>page.evaluate(()=>['board','state','seen','pending','event','progress'].map(id=>document.getElementById(id).innerHTML));
for(const lang of ['en','zh']){
 const col=lang==='zh'?0:1;await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),copy.title[col]);assert.equal(await page.title(),copy.docTitle[col]);
 assert.equal(await page.locator('[data-i18n=formula]').textContent(),copy.formula[col]);assert((await page.locator('[data-i18n=formula]').textContent()).includes('b²'));
 for(let p=0;p<6;p++){
  await page.selectOption('#preset',String(p));const start=await snap();assert(await page.locator('#prev').isDisabled());let count=0;
  while(await page.locator('#next').isEnabled()){
   const before=await snap();await page.locator('#next').click();const after=await snap();const f=await page.evaluate(()=>model.frames[index]);
   const readout=await page.locator('#state').textContent();assert(readout.includes(`L=${f.limit}`));assert(readout.includes(String(f.seen.length)));
   const seen=await page.locator('#seen').textContent();for(const k of f.seen)assert(seen.includes('('+k+')'));
   assert((await page.locator('#event').textContent()).startsWith(copy[f.kind][col].split('{')[0]));
   await page.locator('#prev').click();assert.deepEqual(await snap(),before);await page.locator('#next').click();assert.deepEqual(await snap(),after);count++;
  }
  assert(await page.locator('#end').isDisabled());assert((await page.locator('#progress').textContent()).includes(String(expected[p])));report.presets.push({lang,p,events:count,result:await page.locator('#progress').textContent(),lastEvent:await page.locator('#event').textContent()});
  await page.locator('#reset').click();assert.deepEqual(await snap(),start);await page.locator('#end').click();
 }
 await page.selectOption('#preset','3');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');
 const current=page.locator('.cell.current');assert((await current.textContent()).includes('[S v]'));assert.equal(await current.evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.locator('#board').screenshot({path:path.join(OUT,`overlap-${lang}.png`)});
 const state=await snap();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),state);
 report.semantics.push({lang,kind:'expanded current source remains seen',text:await page.locator('#event').textContent()});
 for(let opt=0;opt<3;opt++){
  await page.locator(`[name=prediction][value="${opt}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();assert(text.startsWith(copy[opt===1?'correct':'incorrect'][col]));assert(text.includes(copy.answer[col]));
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();report.semantics.push({lang,opt,text});
 }
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);assert.equal(await page.locator('#copyStatus').textContent(),copy.copied[col]);
 for(let attempt=0;attempt<2;attempt++){
  const sentinel=`1036-${lang}-${attempt}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel failed');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.locator('#copyStatus').textContent(),copy.manual[col]);assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);report.clipboard.push({lang,attempt,sentinelVerified:true,nativeManualTransfer:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
 }
 const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await dl.saveAs(path.join(OUT,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(OUT,`download-${lang}.py`),'utf8'),source);
 for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.selectOption('#preset','1');await page.locator('#end').click();
  await page.locator('#board').scrollIntoViewIfNeeded();await page.evaluate(()=>{const r=document.getElementById('board').getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});
  const geometry=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,cells:[...document.querySelectorAll('.cell')].map(e=>({client:e.clientWidth,scroll:e.scrollWidth})),boardWidth:document.getElementById('board').getBoundingClientRect().width}));assert(geometry.document<=width+1,JSON.stringify(geometry));assert(geometry.cells.every(c=>c.scroll<=c.client+1));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}.png`)});report.layouts.push({lang,width,zoom,geometry});
 }
 await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:390,height:1000});
 for(const [key,id] of [['link1','step2'],['link2','step3']]){
  const link=page.locator(`[data-i18n=${key}]`);assert.equal(await link.getAttribute('href'),'#'+id);await link.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);assert.equal(new globalThis.URL(page.url()).hash,'#'+id);assert.equal(await link.textContent(),copy[key][col]);report.links.push({lang,label:await link.textContent(),target:page.url(),sectionText:(await page.locator('#'+id).textContent()).slice(0,250)});
 }
}
// Actual foreground/background pairs including disabled, visited and focus.
function luminance(c){return c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(contrast([0,0,0],[0,0,0]),1);
await page.selectOption('#preset','0');await page.locator('#end').click();
for(const selector of ['body','.hint','.btn:disabled','.cell.visited','.cell.current','.cell.wall','.lang-toggle button.active','.step-nav a.active']){
 const el=page.locator(selector).first();if(!await el.count())continue;
 const colors=await el.evaluate(e=>{let b=getComputedStyle(e).backgroundColor,p=e;while((b==='rgba(0, 0, 0, 0)'||b==='transparent')&&p.parentElement){p=p.parentElement;b=getComputedStyle(p).backgroundColor;}const s=getComputedStyle(e);return {foreground:s.color,background:b,outline:s.outlineColor,opacity:s.opacity};});
 const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),ratio=contrast(rgb(colors.foreground),rgb(colors.background));assert(ratio>=4.5,selector+' '+ratio);report.contrast.push({selector,...colors,ratio});
}
const focus=contrast([255,180,84],[22,27,34]);assert(focus>=3);report.contrast.push({role:'focus against panel',ratio:focus});
// Denied localStorage must not prevent locale initialization or interaction.
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('denied')}});});const d=await denied.newPage();await d.goto(URL);await d.locator('[data-lang=zh]').click();assert.equal(await d.locator('h1').textContent(),copy.title[0]);await d.locator('#next').click();await d.locator('[data-lang=en]').click();assert.equal(await d.locator('h1').textContent(),copy.title[1]);await denied.close();
assert.deepEqual(report.errors,[]);assert.deepEqual(report.assetErrors,[]);assert.deepEqual(report.external,[]);
report.cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(report.cssBytes<25000);report.status='passed';fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,presets:report.presets.length,layouts:report.layouts.length,clipboard:report.clipboard.length,cssBytes:report.cssBytes}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
