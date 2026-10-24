/* Run check.py first. OUTPUT_DIR and PREVIEW_URL support frozen-candidate reruns. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const P=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(OUT,{recursive:true});
const {presets,trace}=require('../core.js');
const fixtures=JSON.parse(fs.readFileSync(path.join(OUT,'oracle-fixtures.json')));
let invariantCount=0;
for(const {nums,frames} of fixtures){const actual=trace(nums);assert.equal(actual.length,frames.length);actual.forEach((f,i)=>{assert.deepEqual({dp:f.dp,answer:f.answer},frames[i]);invariantCount++;});}
function oracleFrames(a){
 const valid=[];for(let mask=0;mask<2**a.length;mask++){const ids=a.map((_,i)=>i).filter(i=>mask&(1<<i));if(ids.length<2)continue;const d=a[ids[1]]-a[ids[0]];if(ids.slice(1).every((v,k)=>a[v]-a[ids[k]]===d))valid.push({ids,d});}
 const dp=a.map(()=>({})),frames=[{dp:structuredClone(dp),answer:0}];let answer=0;
 for(let i=0;i<a.length;i++)for(let j=0;j<i;j++){for(const {ids,d} of valid.filter(v=>v.ids.at(-1)===i&&v.ids.at(-2)===j)){dp[i][d]=(dp[i][d]||0)+1;if(ids.length>=3)answer++;}frames.push({dp:structuredClone(dp),answer});}return frames;
}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const base=process.env.PREVIEW_URL||'http://127.0.0.1:18770',url=base+'/leetcode/446/';
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[],bad=[],external=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0/3'));
 const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);
 const logs=[];
 async function snapshot(){return page.evaluate(()=>({progress:document.querySelector('#progress').textContent,maps:document.querySelector('#maps').innerText,history:document.querySelector('#history').innerText,transition:document.querySelector('#transition').textContent}));}
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let preset=0;preset<presets.length;preset++){
   await page.selectOption('#preset',String(preset));const expected=oracleFrames(presets[preset]);
   assert.equal(await page.locator('#prev').isDisabled(),true);
   for(let i=0;i<expected.length;i++){
    if(i)await page.locator('#next').click();
    const readout=await page.locator('#progress').textContent();assert(readout.includes(`${i}/${expected.length-1}`));assert(readout.endsWith(String(expected[i].answer)));
    assert.equal(await page.locator('#maps .map-row').count(),presets[preset].length);
    const ui=await page.locator('#maps .map-row').evaluateAll(rows=>rows.map(r=>Object.fromEntries([...r.querySelectorAll('.entry')].map(e=>e.textContent.split(' : ').map((v,i)=>i?Number(v):v)))));
    assert.deepEqual(ui,expected[i].dp);
    if(i){const first=await snapshot();await page.locator('#prev').click();await page.locator('#next').click();assert.deepEqual(await snapshot(),first);}
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   if(expected.length>1){await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert((await page.locator('#progress').textContent()).endsWith(String(expected.at(-1).answer)));}
   logs.push({lang,preset,frames:expected.length,result:expected.at(-1).answer});
  }
  // Each distractor, explicit reveal, then changed selection clears derived feedback.
  await page.locator('[name=prediction][value="1"]').check();
  for(const option of [0,1,2]){await page.locator(`[name=prediction][value="${option}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const result=await page.locator('#feedback').textContent();assert(result.includes('dp[2][2]=2'));assert(result.includes(lang==='en'?(option===2?'Correct prediction':'Revisit'):(option===2?'预测正确':'再看')));}
  await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
  // Test true clipboard path then forced denial with selectable manual text.
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert.equal(await page.locator('#copyStatus').textContent(),lang==='en'?'Copied.':'已复制。');
  await page.evaluate(()=>{window.savedClipboard=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('test denial'))}});});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);assert((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.savedClipboard}));
  logs.push({lang,feedback:await page.locator('#feedback').textContent(),fallback:await page.locator('#copyStatus').textContent()});
 }
 // Locale switches preserve experiment, quiz, disclosure and useful focus.
 await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const state=await page.locator('#position').inputValue();await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#position').inputValue(),state);assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.locator('[name=prediction]:checked').inputValue(),'0');assert(await page.locator('[data-lang=en]').evaluate(e=>document.activeElement===e));
 await page.selectOption('#preset','0');assert(await page.locator('#feedback').isVisible());
 // Keyboard controls and range endpoints.
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');await page.keyboard.press('Space');assert.equal(await page.locator('#position').inputValue(),'2');
 await page.locator('#position').focus();await page.keyboard.press('End');assert.equal(await page.locator('#position').inputValue(),'3');await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'1');
 await page.locator('#next').focus();const focus=await page.locator('#next').evaluate(e=>{const s=getComputedStyle(e);return {width:s.outlineWidth,color:s.outlineColor,style:s.outlineStyle};});assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 await page.screenshot({path:path.join(OUT,'keyboard-focus.png')});
 // Source copied/displayed/downloaded are exact bytes.
 const downloadEvent=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await downloadEvent;await dl.saveAs(path.join(OUT,'downloaded-solution.py'));assert.equal(fs.readFileSync(path.join(OUT,'downloaded-solution.py'),'utf8'),source);
 // Verify all local related destinations and sticky nav geometry.
 for(const href of await page.locator('.related a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){
  const target=new URL(href,url);const res=await ctx.request.get(target.href);assert.equal(res.status(),200);assert((await res.text()).includes(`id="${target.hash.slice(1)}"`));
 }
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);const geometry=await page.locator('#step2').evaluate(e=>({top:e.getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(geometry.top>=geometry.nav-2,JSON.stringify(geometry));
 const layouts=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#end').click();
  await page.locator('#progress').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const cards=await page.locator('#array .card').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth})));assert(cards.every(x=>x.scroll<=x.width+1));
  await page.evaluate(()=>window.scrollTo(0,document.querySelector('#progress').getBoundingClientRect().top+scrollY-90));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-values.png`)});
  await page.locator('#historyWrap').focus();await page.keyboard.press('ArrowRight');
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`)});
  // Wide signed differences must wrap in state cards and stay associated with counts.
  await page.selectOption('#preset','5');await page.locator('#end').click();await page.locator('#maps').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-wide.png`)});
  assert(await page.locator('#maps').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  if(width===390){
   await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-390-prediction.png`)});
   await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(OUT,`${lang}-390-header.png`)});
  }
  layouts.push({lang,width,pageOverflow:false,cardClipping:false});
 }
 // 200% rendered zoom, plus 320 effective px at the 640px viewport.
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:640,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>document.documentElement.style.zoom='2');await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#maps').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Actual computed colors; nontransparent backgrounds resolved through ancestors.
 await page.setViewportSize({width:1440,height:1000});if(await page.locator('#end').isEnabled())await page.locator('#end').click();
 const colors=await page.evaluate(()=>{
  function pair(selector){const e=document.querySelector(selector),s=getComputedStyle(e);let n=e,bg;while(n){const b=getComputedStyle(n).backgroundColor;if(b!=='rgba(0, 0, 0, 0)'&&b!=='transparent'){bg=b;break;}n=n.parentElement;}return {selector,fg:s.color,bg};}
  return ['body','.hint','.explain','#prev','#next','#copy','#langToggle button.active','.entry','.step-nav a.active'].map(pair);
 });
 function rgb(s){return (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);}
 function lum(s){return rgb(s).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
 const contrast=colors.map(x=>{const a=lum(x.fg),b=lum(x.bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,JSON.stringify({...x,ratio}));return {...x,ratio};});
 const focusRatio=(lum(focus.color)+.05)/(lum('rgb(13,17,23)')+.05);assert(focusRatio>=3);
 await page.emulateMedia({forcedColors:'active'});await page.locator('#copy').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#copy').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 // Denied persistent storage must fall back to in-memory locale with state intact.
 const denied=await browser.newContext({locale:'en-US'});await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('denied');};Storage.prototype.setItem=()=>{throw new Error('denied');};});const dp=await denied.newPage();const storageErrors=[];dp.on('pageerror',e=>storageErrors.push(String(e)));await dp.goto(url);await dp.locator('#next').click();await dp.locator('[data-lang=zh]').click();assert((await dp.locator('#progress').textContent()).includes('1/3'));assert.equal(await dp.locator('html').getAttribute('lang'),'zh-CN');assert.deepEqual(storageErrors,[]);await denied.close();
 // file:// offline opening loads local mirrors without network fetching.
 const offline=await browser.newContext();await offline.setOffline(true);const op=await offline.newPage();await op.goto('file://'+path.join(P,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.locator('#next').click();assert((await op.locator('#progress').textContent()).includes('1/3'));await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const targets=await page.locator('.btn,select,.lang-toggle button,.back-link,.official-link').evaluateAll(es=>es.map(e=>({id:e.id||e.className,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(targets.every(x=>x.w>=48&&x.h>=48));
 const cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({kind:'author self-check; no independent review',invariantFrames:invariantCount,presetsAndFeedback:logs,layouts,zoom:'200% CSS zoom at 640px viewport (320px effective reading width)',focus,focusContrast:focusRatio,contrast,cssBytes,targets,clipboardSuccess:true,clipboardFallback:true,sourceDownloadParity:true,storageDenied:true,offlineFile:true,keyboard:true,deepLinks:true,errors,bad,external},null,2)+'\n');
 await browser.close();console.log('PASS: core invariants, both locales/presets, controls, quiz, clipboard, layouts, contrast, offline and source parity.');
})().catch(e=>{console.error(e);process.exit(1);});
