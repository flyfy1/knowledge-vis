'use strict';
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/902/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce',viewport:{width:1440,height:1000}});
 const page=await context.newPage();const errors=[],network=[],records=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)network.push([r.url(),r.status()]);});page.on('requestfailed',r=>network.push([r.url(),r.failure()]));
 await page.goto(url);await page.locator('#progress').filter({hasText:'31'}).waitFor();
 const switchLang=async lang=>{await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');};
 const read=async id=>page.locator('#'+id).textContent();
 for(const lang of ['en','zh']){
  await switchLang(lang);
  assert.equal(await page.locator('#pythonCode').textContent(),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
  for(let i=0;i<7;i++){
   await page.selectOption('#preset',String(i));assert.equal(await page.locator('#position').inputValue(),'0');assert(await page.locator('#prev').isDisabled());
   const max=Number(await page.locator('#position').getAttribute('max'));
   const ledger=[];
   for(let j=1;j<=max;j++){
    await page.locator('#next').click();assert.equal(Number(await page.locator('#position').inputValue()),j);
    assert.equal(await page.locator('#history li').count(),j+1);
    const snapshot=await read('accounting');ledger.push(snapshot);
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await read('accounting'),snapshot);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const expected=[5,4,20,29523,1,0,435848049][i];assert((await read('result')).includes(String(expected)));
   await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');assert.equal(await page.locator('#history li').count(),1);
   await page.locator('#end').click();assert((await read('result')).includes(String(expected)));
   await page.locator('#position').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('End');assert.equal(Number(await page.locator('#position').inputValue()),max);
   records.push({lang,preset:i,expected,steps:max,ledger});
  }
  // Inspect central mechanism, retained accounting and invariant in rendered text.
  await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#next').click();
  assert((await read('operation')).includes('3'));assert((await page.locator('#branches').textContent()).includes('2^1 = 2'));
  assert((await read('accounting')).includes('4'));
  const saved=await page.locator('#position').inputValue();await switchLang(lang==='en'?'zh':'en');assert.equal(await page.locator('#position').inputValue(),saved);await switchLang(lang);
  // All predictions, changing choices clears stale feedback, locale and trace preserve state.
  for(let k=0;k<3;k++){
   await page.locator(`[name=prediction][value="${k}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert((await read('feedback')).includes('23'));
   const before=await read('feedback');await page.selectOption('#preset','1');assert.equal(await read('feedback'),before);
   await switchLang(lang==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${k}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await switchLang(lang);
  }
  // Exact native clipboard success.
  await page.evaluate(()=>{delete window.__copyOriginal;});
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  // Before EACH manual attempt set and verify a fresh non-source sentinel.
  for(let attempt=0;attempt<2;attempt++){
   const sentinel=`902-${lang}-${attempt}-${Date.now()}`;
   await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await page.evaluate(()=>{window.__copyOriginal=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('self-check forced denial');};});
   await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
   assert.equal(await page.locator('#copyText').inputValue(),source);
   assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e && e.selectionStart===0 && e.selectionEnd===e.value.length));
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   records.push({lang,manualAttempt:attempt,clipboardSentinelVerified:true,nativeShortcut:process.platform==='darwin'?'Meta+C':'Control+C',sourceExact:true,feedback:await read('copyStatus')});
   await page.evaluate(()=>{navigator.clipboard.writeText=window.__copyOriginal;});
  }
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const dest=path.join(out,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
 }
 // Device layout and 200% CSS layout zoom; screenshots inspect actual populated controls.
 for(const lang of ['en','zh'])for(const [width,zoom] of [[320,1],[390,1],[736,1],[1440,1],[780,2],[1440,2]]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await switchLang(lang);
  await page.selectOption('#preset','6');await page.locator('#end').click();await page.locator('#prev').click();await page.locator('#prev').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  // Closed native option font budget, including 36px allowance for arrow and platform margins.
  for(let i=0;i<7;i++){
   await page.selectOption('#preset',String(i));
   const measure=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.selectedOptions[0].textContent,width:e.clientWidth,textWidth:c.measureText(e.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font};});
   assert(measure.textWidth+measure.padding+36<=measure.width,JSON.stringify(measure));
  }
  await page.selectOption('#preset','6');await page.locator('#end').click();await page.locator('#prev').click();await page.locator('#prev').click();
  await page.locator('#branches').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}-dense.png`)});
  if(width===390&&zoom===1){await page.locator('.stage').screenshot({path:path.join(out,`${lang}-390-stage.png`)});}
  records.push({lang,width,zoom,layout:'no document overflow',screenshot:`${lang}-${width}-zoom${zoom}-dense.png`,branchText:await page.locator('#branches').textContent()});
 }
 // Keyboard focus, deep-link positioning, and target existence.
 await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:390,height:900});
 await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 await page.locator('.step-nav a[href="#step3"]').click();assert(await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top>=60&&e.getBoundingClientRect().top<150));
 for(const href of await page.locator('a').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')).filter(x=>x&&!x.startsWith('https:')))){
  if(href.startsWith('#'))assert(await page.locator(href).count());
  else {const target=new URL(href,url),r=await context.request.get(target.href);assert(r.ok(),target.href);if(target.hash)assert((await r.text()).includes(`id="${target.hash.slice(1)}"`));}
 }
 // Measured text/focus pairs against the inherited surfaces.
 const contrast=await page.evaluate(()=>{
  const s=getComputedStyle(document.documentElement),names=['bg','panel','panel2','text','muted','accent','accent2'];const colors=Object.fromEntries(names.map(n=>[n,s.getPropertyValue('--'+n).trim()]));
  function lum(h){const a=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
  const pairs=[];for(const bg of ['bg','panel','panel2'])for(const fg of ['text','muted','accent','accent2']){let a=lum(colors[bg]),b=lum(colors[fg]);pairs.push({fg,bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});}return {colors,pairs};});
 assert(contrast.pairs.every(p=>p.ratio>=4.5));assert(fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size<25000);
 // Storage denied, offline file source and forced-colors / reduced-motion behavior.
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('self-check storage denial');}});});const p2=await offline.newPage();const offlineErrors=[];p2.on('pageerror',e=>offlineErrors.push(String(e)));await p2.goto('file://'+path.join(root,'index.html'));await p2.locator('#progress').waitFor();await p2.locator('[data-lang=zh]').click();await p2.locator('#end').click();assert((await p2.locator('#result').textContent()).includes('5'));assert.equal(await p2.locator('#pythonCode').textContent(),source);assert.equal(offlineErrors.length,0);await p2.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p2.locator('#reset').focus();assert.equal(await p2.locator('#reset').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 const report={kind:'author self-check; no independent acceptance',host:os.platform(),browser:browser.version(),zoomMethod:'CSS layout zoom 2 (not native browser UI zoom)',viewports:[320,390,736,1440],sourceParity:'display, mirror, native copy, fallback native copy x2 per locale, downloads exact including final newline',contrast,cssBytes:fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size,errors,network,offlineStorageDenied:true,records};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({pass:true,records:records.length,contrastMin:Math.min(...contrast.pairs.map(p=>p.ratio)),cssBytes:report.cssBytes}));
})().catch(e=>{console.error(e);process.exitCode=1;});
