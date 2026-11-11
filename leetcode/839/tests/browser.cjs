const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(OUT,{recursive:true});const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/839/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],requests=[],checks=[],semantic=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure().errorText));page.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>10);
 async function lang(l){await page.click(`[data-lang=${l}]`);assert.equal(await page.locator('h1').textContent(),l==='zh'?'#839 · 相似字符串组':'#839 · Similar String Groups');assert.equal(await page.title(),l==='zh'?'#839 · 相似字符串组':'#839 · Similar String Groups');}
 for(const l of ['en','zh']){
  await lang(l);await page.click('#handReset');assert((await page.locator('#handRead').textContent()).includes('tars'));
  await page.click('#swap02');assert((await page.locator('#handRead').textContent()).includes('rats'));
  await page.click('#swap01');assert((await page.locator('#handRead').textContent()).includes('arts'));
  await page.click('#undo');assert((await page.locator('#handRead').textContent()).includes('rats'));
  await page.click('#handReset');assert(await page.locator('#undo').isDisabled());
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());let seen=0;
   const states=[];
   while(!await page.locator('#next').isDisabled()){
    const before=await page.locator('#groups').textContent();await page.click('#next');seen++;
    const after=await page.locator('#groups').textContent(),read=await page.locator('#frameRead').textContent();states.push(read);
    if(seen===1){await page.click('#prev');assert.equal(await page.locator('#groups').textContent(),before);await page.click('#next');assert.equal(await page.locator('#groups').textContent(),after);}
   }
   const expected=[2,1,1,1,2,1,1][p],counts=await page.locator('#groups .group-row').count();assert.equal(counts,expected);
   assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#ledger li').count(),seen);
   await page.click('#traceReset');assert(await page.locator('#prev').isDisabled());if(!await page.locator('#end').isDisabled())await page.click('#end');assert.equal(await page.locator('#groups .group-row').count(),expected);
   checks.push({locale:l,preset:p,pairs:seen,finalGroups:counts,states});
  }
  await page.selectOption('#preset','0');await page.click('#next');await page.click('#next');
  semantic.push({locale:l,state:'tars vs arts: rejected with 3 mismatches; count remains 3',observed:await page.locator('#pairRead').textContent()});
  assert((await page.locator('#pairRead').textContent()).includes('3 → 3'));
  const traceBefore=await page.locator('#groups').textContent();await lang(l==='en'?'zh':'en');assert.equal(await page.locator('#groups .group-row').count(),3);await lang(l);assert.equal(await page.locator('#groups').textContent(),traceBefore);
  await page.click('#quizReset');assert(await page.locator('#reveal').isDisabled());
  for(const answer of ['0','1','2']){
   await page.check(`[name=prediction][value="${answer}"]`);assert(!((await page.locator('#feedback').textContent()).includes(l==='en'?'The answer is 1':'答案是 1')));
   await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes(l==='en'?'The answer is 1':'答案是 1'));
   semantic.push({locale:l,state:'prediction option '+answer,observed:await page.locator('#feedback').textContent()});
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${answer}"]`).isChecked());await lang(l);
  }
  await page.check('[name=prediction][value="1"]');assert(!(await page.locator('#feedback').textContent()).includes(l==='en'?'The answer is 1':'答案是 1'));
  await page.click('#reveal');await page.selectOption('#preset','3');assert((await page.locator('#feedback').textContent()).includes(l==='en'?'The answer is 1':'答案是 1'));await page.click('#end');assert((await page.locator('#pairRead').textContent()).includes('1 → 1'));
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  const sentinel=`automatic-${l}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.click('#copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  // Each fallback attempt gets a fresh verified sentinel, before disabling writes.
  const manualSentinel=`manual-${l}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),manualSentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),manualSentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test denied'));});
  await page.click('#copyPython');assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  semantic.push({locale:l,state:'manual clipboard fallback',observed:await page.locator('#copyStatus').textContent()});
  await page.screenshot({path:path.join(OUT,`${l}-fallback.png`)});
  await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  const downloadPromise=page.waitForEvent('download');await page.click('#download');const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 }
 // Width and state geometry; the full preset description remains outside the select.
 const fit=[];
 for(const l of ['zh','en'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);await page.selectOption('#preset','0');await page.click('#next');await page.click('#next');await page.click('#next');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const geometry=await page.evaluate(()=>{const e=document.querySelector('#preset'),s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return{width:e.clientWidth,text:Math.max(...Array.from(e.options,o=>c.measureText(o.textContent).width)),selectedText:e.selectedOptions[0].textContent,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font};});
  // Conservative native arrow budget: 52 CSS px, no scaling down of the font.
  assert(geometry.text+geometry.padding+52<=geometry.width,JSON.stringify(geometry));fit.push({locale:l,viewportWidth:width,...geometry,reserve:52});
  await page.locator('#traceStage').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${l}-${width}-trace.png`)});
  await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${l}-${width}-quiz.png`)});
 }
 for(const l of ['en','zh']){
  await page.setViewportSize({width:1440,height:1000});await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('#traceStage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(OUT,`${l}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Extra captures put each teaching surface below the sticky navigation.
 for(const l of ['en','zh']){
  await page.setViewportSize({width:320,height:1000});await lang(l);await page.selectOption('#preset','0');
  await page.locator('#preset').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-110));await page.screenshot({path:path.join(OUT,`${l}-320-controls.png`)});
  for(let i=0;i<4;i++)await page.click('#next');
  await page.locator('#groups').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-140));await page.screenshot({path:path.join(OUT,`${l}-320-groups.png`)});
  await page.click('#end');await page.locator('#ledger').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-150));await page.screenshot({path:path.join(OUT,`${l}-320-ledger.png`)});
  await page.click('#quizReset');await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${l}-320-predict.png`)});
  await page.locator('#handReset').click();await page.locator('#step0').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${l}-320-hand.png`)});
 }
 // Real keyboard activation and focus retention across locale changes.
 await page.setViewportSize({width:390,height:1000});await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#ledger li').count(),1);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');
 const outline=await page.locator('#traceReset').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(outline.width,'3px');
 await page.locator('[data-lang=zh]').focus();await page.keyboard.press('Enter');assert(await page.locator('[data-lang=zh]').evaluate(e=>e===document.activeElement));
 // Local navigation resolves each section below the sticky bar in both locales.
 for(const l of ['en','zh']){await lang(l);for(let i=0;i<5;i++){
  await page.locator(`.step-nav a[href="#step${i}"]`).click();await page.waitForTimeout(80);
  assert.equal(new URL(page.url()).hash,'#step'+i);
  assert(await page.locator('#step'+i+' h2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
 }}
 // Related links: read served target sections and activate via keyboard.
 const links=[];
 for(const l of ['en','zh'])for(const [key,fragment,needle] of [['related1','step2',''],['related2','step3','']]){
  await lang(l);const a=page.locator(`[data-i18n=${key}]`);const label=await a.textContent();const href=await a.getAttribute('href');await a.focus();await page.keyboard.press('Enter');await page.waitForURL('**/#'+fragment);assert(await page.locator('#'+fragment).isVisible());
  links.push({locale:l,label,href,labelKey:key,url:page.url(),text:(await page.locator('#'+fragment).textContent()).slice(0,3500)});await page.goto(url);
 }
 // Browser-rendered solid pairs and independently sanity-checked contrast math.
 function luminance(hex){const a=hex.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 function ratio(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 assert.equal(ratio('000000','ffffff'),21);assert.equal(ratio('123456','123456'),1);assert.equal(ratio('ffffff','000000'),ratio('000000','ffffff'));assert(ratio('767676','ffffff')>4.5);assert(ratio('777777','ffffff')<4.5);
 const contrast=[];for(const bg of ['0d1117','161b22','1c2330','0a0e14'])for(const fg of ['e8edf4','9aa7b8','6ee7ff','ffb454','c9d4e2','7ee2a8']){const r=ratio(fg,bg);assert(r>=4.5);contrast.push({fg,bg,ratio:r,threshold:4.5});}assert(ratio('0d1117','6ee7ff')>=7);
 const rendered=await page.locator('#next').evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));
 // Storage unavailable and offline opening still initialize and display source.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});});const bp=await blocked.newPage();await bp.goto(url);await bp.locator('[data-lang=zh]').click();assert.equal(await bp.locator('h1').textContent(),'#839 · 相似字符串组');await blocked.close();
 const offline=await context.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 assert.equal(errors.length,0,errors.join('\n'));assert(requests.filter(u=>u.startsWith('http')).every(u=>u.startsWith('http://127.0.0.1:18770')));
 const cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({type:'author self-check',result:'pass',hostPlatform:process.platform,checks,semantic,fit,links,contrast,rendered,cssBytes,errors,requests:[...new Set(requests)],limits:'Chromium headless; synthetic CSS zoom=2; no real-device or novice-comprehension claim.'},null,2));
 await browser.close();console.log(JSON.stringify({result:'pass',presets:checks.length,screenshots:fs.readdirSync(OUT).filter(x=>x.endsWith('.png')).length,cssBytes,errors}));
})().catch(e=>{console.error(e);process.exit(1);});
