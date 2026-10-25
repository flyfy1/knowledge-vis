'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18783')+'/leetcode/639/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const cases=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'),'utf8'));
const observations=[],errors=[],requests=[];
const log=(kind,data)=>observations.push({kind,...data});
const launch={headless:true};if(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH)launch.executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
(async()=>{
 const browser=await chromium.launch(launch);
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+' '+r.status());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.locator('#summary').filter({hasText:'0/2'}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  const formula=await page.locator('[data-i18n=recurrence]').textContent();assert(formula.includes('a(s[i−1]) × D[i−1] + b(s[i−2],s[i−1]) × D[i−2]'));log('formula',{lang,text:formula});
  await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`header-${lang}-320.png`)});await page.setViewportSize({width:1440,height:1000});
  for(let d=1;d<=9;d++){await page.selectOption('#digit',String(d));assert((await page.locator('#splitPath').textContent()).includes('A'+String.fromCharCode(64+d)));assert((await page.locator('#joinedPath').textContent()).includes(String.fromCharCode(74+d)));}
  for(const [s,a,b] of [['1*',9,9],['2*',9,6],['**',9,15],['*0',0,2],['*7',1,1],['06',1,0]]){
   await page.selectOption('#pairInput',s);assert((await page.locator('#singleCount').textContent()).includes(`= ${a}`));assert((await page.locator('#pairCount').textContent()).includes(`= ${b}`));
   const codes=await page.locator('#pairTokens').textContent();if(s==='*0')assert(codes.includes('10 → J')&&codes.includes('20 → T'));
  }
  const presets=await page.locator('#preset option').evaluateAll(es=>es.map(e=>e.value));
  for(const s of presets){
   await page.selectOption('#preset',s);assert(await page.locator('#prev').isDisabled());assert((await page.locator('#event').textContent()).includes('D[0] = 1'));
   for(let i=1;i<=s.length;i++){
    await page.locator('#next').click();assert((await page.locator('#ledger').textContent()).includes(`D[${i}] = ${cases[s.slice(0,i)]}`));
    const before=await page.locator('#ledger').textContent(),event=await page.locator('#event').textContent();
    const a=cases[s[i-1]],b=i>1?cases[s.slice(i-2,i)]-cases[s[i-2]]*a:0,old1=cases[s.slice(0,i-1)],old2=i>1?cases[s.slice(0,i-2)]:0;assert(event.includes(`(${a} × ${old1} + ${b} × ${old2}) mod M = ${cases[s.slice(0,i)]}`),event);
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#ledger').textContent(),before);assert.equal(await page.locator('#event').textContent(),event);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert((await page.locator('#summary').textContent()).includes(`= ${cases[s]}`));
   await page.locator('#reset').click();assert(await page.locator('#reset').isDisabled());await page.locator('#end').click();assert((await page.locator('#summary').textContent()).includes(`= ${cases[s]}`));
   await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');assert(await page.locator('#prev').isDisabled());
  }
  assert(await page.locator('#feedback').isHidden());
  for(const choice of ['0','1','2']){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
   const text=await page.locator('#feedback').textContent();assert(text.includes('D[3]=0×D[2]+1×D[1]=9'));assert(text.includes(lang==='en'?(choice==='2'?'Correct prediction':'does not match'):(choice==='2'?'预测正确':'预测不符')));
   log('quiz',{lang,choice,text});
   if(choice==='2'){await page.setViewportSize({width:320,height:1000});await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`quiz-${lang}-320.png`)});await page.setViewportSize({width:1440,height:1000});}
  }
  await page.selectOption('#preset','1*0');await page.locator('#next').click();
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  await page.locator('#next').focus();const before=await page.locator('#ledger').textContent();
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert.equal(await page.locator('#preset').inputValue(),'1*0');assert.equal(await page.locator('#position').inputValue(),'1');assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#ledger').textContent(),before);
  await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
  // Actual clipboard success, then deterministic denial fallback.
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  await page.evaluate(async()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);await window.savedWrite('clipboard sentinel');navigator.clipboard.writeText=async()=>{throw new Error('test denial');};});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
  assert.deepEqual(await page.locator('#copyText').evaluate(e=>({text:e.value,start:e.selectionStart,end:e.selectionEnd,active:document.activeElement===e})),{text:source,start:0,end:source.length,active:true});
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+c' : 'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.setViewportSize({width:320,height:1000});await page.locator('#copyText').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`copy-${lang}-320.png`)});await page.setViewportSize({width:1440,height:1000});
  const fallback=await page.locator('#copyStatus').textContent();assert(fallback.includes(lang==='en'?'manual':'手动'));log('copy-fallback',{lang,text:fallback});
  await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const target=path.join(out,`download-${lang}.py`);await download.saveAs(target);assert.equal(fs.readFileSync(target,'utf8'),source);
  // Clear the choice feedback for the next locale's hidden-state test.
  await page.locator('[name=prediction][value="1"]').check();
  // Keyboard and 3px focus, no control reconstruction on locale changes.
  await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'prev');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
  assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','***');await page.locator('#end').click();
   await page.locator('#ledger').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`page overflow ${lang} ${width}`);
   const geom=await page.locator('.prefix').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth,text:e.textContent})));assert(geom.every(e=>e.scroll<=e.width),JSON.stringify(geom));
   await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`),fullPage:false});
   await page.locator('#ledger').screenshot({path:path.join(out,`ledger-${lang}-${width}.png`)});
   // Native selected labels are literal strings; measure actual font and arrow room.
   const selectGeometry=await page.locator('#preset').evaluate(e=>{const st=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=st.font;return {text:e.selectedOptions[0].text,width:e.clientWidth,textWidth:c.measureText(e.selectedOptions[0].text).width,padding:parseFloat(st.paddingLeft)+parseFloat(st.paddingRight),font:st.font};});assert(selectGeometry.width-selectGeometry.padding-selectGeometry.textWidth>=16);log('native-select',{lang,width,...selectGeometry});
   log('layout',{lang,width,ledger:await page.locator('#ledger').textContent(),geometry:geom});
  }
  await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#ledger').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom200-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
  // Deep links: settle smooth scrolling disabled by reduced motion.
  await page.locator('a[href="#step1"]').click();await page.waitForTimeout(80);const y=await page.locator('#step1').evaluate(e=>e.getBoundingClientRect().top);assert(y>=70&&y<150,`deep anchor ${y}`);
 }
 // Same-origin local links and fragment existence.
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('http'))continue;const u=new URL(href,url);const response=await context.request.get(u.href.split('#')[0]);assert.equal(response.status(),200,href);if(u.hash)assert((await response.text()).includes(`id="${u.hash.slice(1)}"`),href);
 }
 await page.locator('#reset').click();
 const contrast=await page.evaluate(()=>{
  function lum(c){const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
  return ['body','.explain','.hint','.readout','.btn.primary','.btn:disabled','.token','.prefix.current','.prefix.future','.lang-toggle .active'].map(sel=>{const e=document.querySelector(sel),st=getComputedStyle(e);let p=e,bg=st.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}const a=lum(st.color),b=lum(bg);return {selector:sel,color:st.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 // Focus and forced colors remain explicit; no motion is required.
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked storage');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(url);await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert.equal(await bp.locator('#position').inputValue(),'1');await blocked.close();
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();op.on('pageerror',e=>errors.push(String(e)));await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.locator('#end').click();assert((await op.locator('#summary').textContent()).includes('18'));await offline.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18783/')||u.startsWith('data:')));
 const report={status:'passed',type:'author browser self-check',browser:await browser.version(),cssBytes,contrast,errors,requests:[...new Set(requests)],observations,zoom:'200% CSS zoom; 1440px viewport, 720px effective layout',limits:'Headless Chromium only; no real-device or novice-learning evidence; independent review pending.'};
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,browser:report.browser,cssBytes,observations:observations.length,minContrast:Math.min(...contrast.map(x=>x.ratio)),errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
