'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1032/';fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'),copy=JSON.parse(fs.readFileSync(path.join(ROOT,'copy.js'),'utf8').replace(/^window.LESSON_COPY = /,'').trim().replace(/;$/,''));
const inputs=[{words:['ab','cb'],stream:'abxcb'},{words:['cd','f','kl'],stream:'abcdefghijkl'},{words:['ab'],stream:'b'},{words:['a','ba'],stream:'ba'},{words:['aa'],stream:'aaaa'},{words:['abc'],stream:'zzabcx'},{words:['ab','ab'],stream:'abab'},{words:['cab'],stream:'cab'}];
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
const ctx=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await ctx.newPage();
const report={kind:'author self-check; independent review pending',host:process.platform,browser:browser.version(),presets:[],semantics:[],layouts:[],clipboard:[],links:[],errors:[],assetErrors:[],external:[],contrast:[]};
page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('requestfailed',r=>report.assetErrors.push([r.url(),r.failure()]));page.on('response',r=>{if(r.status()>=400)report.assetErrors.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))report.external.push(r.url());});
await page.goto(URL);await page.locator('#progress').filter({hasText:'0/'}).waitFor();await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
const snap=()=>page.evaluate(()=>['buffer','state','pathState','trie','event','progress','history'].map(id=>document.getElementById(id).innerHTML));
for(const lang of ['en','zh']){
 const col=lang==='zh'?0:1;
 await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),copy.title[col]);assert.equal(await page.title(),copy.docTitle[col]);
 for(let p=0;p<inputs.length;p++){
  await page.selectOption('#preset',String(p));const start=await snap();assert(await page.locator('#prev').isDisabled());let count=0;const branches=new Set();
  while(await page.locator('#next').isEnabled()){
   const before=await snap();await page.locator('#next').click();const after=await snap();
   const f=await page.evaluate(()=>model.frames[index]);branches.add(f.kind);
   const rows=await page.locator('#history li').allTextContents();
   if(f.history.length){assert.equal(rows.length,f.history.length);rows.forEach((r,j)=>{const prefix=inputs[p].stream.slice(0,j+1),expected=inputs[p].words.some(w=>prefix.endsWith(w));assert(r.includes(`${prefix} → ${expected}`));});}
   assert.equal(await page.locator('#buffer .letter').allTextContents().then(a=>a.join('')),f.buffer);
   await page.locator('#prev').click();assert.deepEqual(await snap(),before);await page.locator('#next').click();assert.deepEqual(await snap(),after);count++;
  }
  assert(await page.locator('#end').isDisabled());report.presets.push({lang,p,operations:count,branches:[...branches],history:await page.locator('#history').textContent()});
  await page.locator('#reset').click();assert.deepEqual(await snap(),start);await page.locator('#end').click();
 }
 // Partial path, exhausted; terminal with outgoing edge; missing-edge semantics.
 for(const [p,expect] of [[2,lang==='en'?'not a complete word':'不是完整词'],[3,lang==='en'?'complete word a':'完整词 a'],[5,lang==='en'?'no x edge':'没有字符 x']]){
  await page.selectOption('#preset',String(p));await page.locator('#end').click();const text=await page.locator('#event').textContent();assert(text.includes(expect),text);report.semantics.push({lang,p,text});
 }
 await page.selectOption('#preset','0');await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#event').textContent()).includes(lang==='en'?'Appended a':'加入 a'));
 for(let i=0;i<4;i++)await page.locator('#next').click(); // path ba terminal
 const current=page.locator('.trie-node.current');assert((await current.textContent()).includes(copy.current[col]));assert((await current.textContent()).includes(copy.visited[col]));assert((await current.textContent()).includes(lang==='en'?'Complete word: ab':'完整词：ab'));
 assert.equal(await current.evaluate(e=>getComputedStyle(e).borderTopWidth),'3px');
 await page.locator('#trie').screenshot({path:path.join(OUT,`overlap-${lang}.png`)});
 assert.equal(await page.locator('[data-i18n=formula]').textContent(),copy.formula[col]);
 const state=await snap();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),state);
 await page.locator('#handNext').click();await page.locator('#handNext').click();await page.locator('#handNext').click();assert(await page.locator('#handNext').isDisabled());assert((await page.locator('#handHistory li').nth(1).textContent()).includes('ab → true'));assert((await page.locator('#handHistory li').nth(2).textContent()).includes('abx → false'));while(await page.locator('#handPrev').isEnabled())await page.locator('#handPrev').click();
 for(let opt=0;opt<3;opt++){
  await page.locator(`[name=prediction][value="${opt}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();assert(text.startsWith(copy[opt===1?'correct':'incorrect'][col]));assert(text.includes(copy.explanation[col]));
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();report.semantics.push({lang,opt,text});
 }
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);assert.equal(await page.locator('#copyStatus').textContent(),copy.copied[col]);
 for(let attempt=0;attempt<2;attempt++){
  const sentinel=`1032-${lang}-${attempt}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel failed');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();assert.equal(await page.locator('#copyStatus').textContent(),copy.manual[col]);assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);report.clipboard.push({lang,attempt,sentinelVerified:true,nativeManualTransfer:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
 }
 const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);await dl.saveAs(path.join(OUT,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(OUT,`download-${lang}.py`),'utf8'),source);
 for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.selectOption('#preset','3');await page.locator('#end').click();
  // At a terminal that still has outgoing edges, current/on-path/terminal must all remain legible.
  await page.locator('#trie').scrollIntoViewIfNeeded();await page.evaluate(()=>{const r=document.getElementById('trie').getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});await page.waitForTimeout(80);
  const geometry=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('.trie-node')].map(e=>({client:e.clientWidth,scroll:e.scrollWidth,text:e.textContent})),select:{client:document.getElementById('preset').clientWidth,scroll:document.getElementById('preset').scrollWidth}}));assert(geometry.document<=width+1,JSON.stringify(geometry));assert(geometry.cards.every(c=>c.scroll<=c.client+1));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-zoom${zoom}.png`)});report.layouts.push({lang,width,zoom,geometry});
 }
 await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:390,height:900});
 // Narrow locale roundtrip preserves trace, quiz, heading identity and title.
 const before=await snap();await page.locator('[data-lang=zh]').click();assert.equal(await page.locator('h1').textContent(),copy.title[0]);await page.locator('[data-lang=en]').click();assert.equal(await page.title(),copy.docTitle[1]);await page.locator('[data-lang=zh]').click();assert.equal(await page.title(),copy.docTitle[0]);await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),before);
 for(const anchor of await page.locator('.related a').all()){
  const href=await anchor.getAttribute('href'),label=await anchor.textContent(),dest=new globalThis.URL(href,URL),target=await ctx.newPage();await target.goto(dest.href);await target.locator(dest.hash).waitFor();const text=await target.locator(dest.hash).textContent();assert(text.length>100);report.links.push({lang,label,url:dest.href,heading:await target.locator(dest.hash+' h2').textContent(),excerpt:text.slice(0,550)});await target.close();
 }
 // Keyboard deep-link activation with scroll geometry.
 const localLink=page.locator('.related a').first();await localLink.focus();await page.keyboard.press('Enter');await page.waitForTimeout(80);assert.equal(new globalThis.URL(page.url()).hash,'#step3');
}
// Measured actual opaque surfaces; no opacity allowed on text ancestors.
function rgb(str){return str.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(c){return c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}function contrast(a,b){return (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);}
assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(contrast([12,12,12],[12,12,12]),1);
assert.equal(lum([0,0,0]),0);assert.equal(lum([255,0,0]),.2126);assert.equal(lum([0,255,0]),.7152);assert.equal(lum([0,0,255]),.0722);assert(Math.abs(lum([255,255,255])-1)<1e-12);const near=contrast([116,116,116],[0,0,0]);assert(Math.abs(near-4.492948073111701)<1e-12);assert(near<4.5);report.calibration={blackWhite:21,red:.2126,green:.7152,blue:.0722,nearThreshold:near,threshold:4.5,nearThresholdPass:false,scope:'opaque solid backgrounds only'};
await page.selectOption('#preset','0');
for(const selector of ['body','.hint','.explain','.readout','.trie-node','.node-flags','.btn:disabled','.btn.primary:not(:disabled)','.step-nav a.active']){
 const colors=await page.locator(selector).first().evaluate(e=>{const st=getComputedStyle(e);let p=e,bg;while(p){const s=getComputedStyle(p);if(Number(s.opacity)!==1)throw Error('text opacity unsupported');if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){bg=s.backgroundColor;break;}p=p.parentElement;}return {fg:st.color,bg};});
 assert(colors.bg);const ratio=contrast(rgb(colors.fg),rgb(colors.bg));assert(ratio>=4.5,`${selector} ${ratio}`);report.contrast.push({selector,...colors,ratio});
}
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.screenshot({path:path.join(OUT,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage blocked');}});});const bp=await blocked.newPage();await bp.goto(URL);await bp.locator('#progress').filter({hasText:'0/'}).waitFor();await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert((await bp.locator('#event').textContent()).startsWith('Appended a'));await blocked.close();
// File-open source access needs no fetch.
const offline=await ctx.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.locator('#progress').filter({hasText:'0/'}).waitFor();assert.equal(await offline.locator('#code').textContent(),source);await offline.close();
assert.deepEqual(report.errors,[]);assert.deepEqual(report.assetErrors,[]);assert.deepEqual(report.external,[]);report.passed=true;fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,presets:report.presets.length,layouts:report.layouts.length,manualTransfers:report.clipboard.length,contrast:report.contrast}));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
