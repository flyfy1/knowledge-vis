// Re-run with NODE_PATH configured; OUTPUT_DIR redirects all generated evidence.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18782/leetcode/664/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true});await context.grantPermissions(['clipboard-read','clipboard-write']);
 const page=await context.newPage(),errors=[],bad=[],external=[],states=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18782')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 // Execute exactly the displayed BFS code independently in the Python test entrypoint's source audit.
 fs.writeFileSync(path.join(OUT,'rendered-baseline.py'),await page.locator('#baselineCode code').textContent());
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  await page.locator('#strokeReset').evaluate(e=>{if(!e.disabled)e.click();});
  assert(await page.locator('#strokeBack').isDisabled());await page.locator('#strokeNext').click();await page.locator('#strokeNext').click();assert(await page.locator('#strokeNext').isDisabled());assert.equal(await page.locator('#strip b').allTextContents()+'','a,b,a');
  await page.locator('#strokeBack').click();assert.equal(await page.locator('#strip b').allTextContents()+'','a,a,a');
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   const trace=await page.evaluate(()=>Printer.trace(Printer.presets[Number(document.querySelector('#preset').value)]));
   for(let i=1;i<trace.length;i++){
    await page.locator('#next').click();
    const actual=await page.locator('#dpTable tr').evaluateAll(rows=>rows.slice(1).map(r=>[...r.querySelectorAll('td')].map(c=>c.textContent)));
    const f=trace[i];for(let a=0;a<actual.length;a++)for(let b=a;b<actual.length;b++)assert.equal(actual[a][b],f.dp[a][b]===null?'·':String(f.dp[a][b]));
    if(f.kind==='merge'){
     const text=await page.locator('#history li').last().textContent();assert(text.includes(`${f.left} + ${f.gap} = ${f.value}`));assert(text.includes(`k=${f.k}`));
     states.push({lang,preset:p,frame:i,expected:f,observed:text});
    }
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const terminal=await page.locator('#dpTable').textContent(),terminalHistory=await page.locator('#history').textContent(),terminalProgress=await page.locator('#progress').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#dpTable').textContent(),terminal);assert.equal(await page.locator('#history').textContent(),terminalHistory);assert.equal(await page.locator('#progress').textContent(),terminalProgress);
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert.equal(await page.locator('#dpTable').textContent(),terminal);
  }
  // Predict wrong, reveal, switch locale and preserve, change answer and clear, reveal correct.
  await page.locator('[name=prediction][value="1"]').check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert((await page.locator('#feedback').textContent()).includes('3'));
  const preset=await page.inputValue('#preset'),progress=await page.locator('#dpTable').textContent();
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());assert.equal(await page.inputValue('#preset'),preset);assert.equal(await page.locator('#dpTable').textContent(),progress);
  await page.locator(`[data-lang=${lang}]`).click();await page.locator('[name=prediction][value="2"]').check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
  states.push({lang,formula:await page.locator('[data-i18n=formula]').textContent(),feedback:await page.locator('#feedback').textContent()});
  // Clipboard success and byte parity.
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert(await page.locator('#manualCopy').isHidden());
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new Error('test denial');}}));
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.deepEqual(await page.locator('#copyText').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd]),[true,0,source.length]);
  await page.keyboard.press('Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator(`[data-lang=${lang}]`).click();
  states.push({lang,clipboardFallback:await page.locator('#copyStatus').textContent()});
  await page.evaluate(()=>delete navigator.clipboard.writeText);
  for(const width of [320,390,1280]){
   await page.setViewportSize({width,height:900});await page.selectOption('#preset','1');await page.locator('#end').click();
   await page.locator('a[href="#step2"]').click();await page.waitForTimeout(150);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow');
   await page.selectOption('#preset','5');
   const geometry=await page.locator('#preset').evaluate(e=>{const c=getComputedStyle(e),cv=document.createElement('canvas'),ctx=cv.getContext('2d');ctx.font=c.font;return {width:e.clientWidth,text:ctx.measureText(e.selectedOptions[0].textContent).width,pad:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight),font:c.font};});assert(geometry.text+geometry.pad+20<=geometry.width,'selected label clipping');
   await page.selectOption('#preset','1');await page.locator('#end').click();
   await page.locator('#tableRegion').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.id),'tableRegion');
   await page.locator('#tableRegion').screenshot({path:path.join(OUT,`table-${lang}-${width}.png`)});
   await page.screenshot({path:path.join(OUT,`lesson-${lang}-${width}.png`),fullPage:true});
   if(width===390){for(const id of ['step0','step3','step4']){await page.locator('#'+id).screenshot({path:path.join(OUT,`${id}-${lang}-390.png`)});}}
   states.push({lang,width,selectGeometry:geometry});
  }
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('a[href="#step2"]').click();await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'zoom overflow');await page.screenshot({path:path.join(OUT,`zoom200-${lang}.png`),fullPage:true});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Keyboard navigation, focus, reduced motion and forced-color rendering.
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'prev');
 assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 const contrast=await page.evaluate(()=>{
  function rgb(v){return v.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(v){return rgb(v).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}function ratio(a,b){let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  return ['body','.explain','.hint','.step-nav a','#prev','#next','#copy','#tableRegion','th'].map(q=>{const e=document.querySelector(q),s=getComputedStyle(e);let n=e,b=s.backgroundColor;while(b==='rgba(0, 0, 0, 0)'&&n.parentElement){n=n.parentElement;b=getComputedStyle(n).backgroundColor;}return {q,foreground:s.color,background:b,ratio:ratio(s.color,b)};});
 });contrast.forEach(x=>assert(x.ratio>=4.5,JSON.stringify(x)));
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const dp=await denied.newPage();await dp.goto(url);await dp.locator('[data-lang=zh]').click();assert((await dp.locator('#progress').textContent()).includes('已完成'));await denied.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({browser:await browser.version(),states,contrast,errors,bad,external,zoom:'200% CSS zoom, desktop viewport 1280; layout/visual checks; no physical device claim',sourceParity:true,clipboard:'successful clipboard and selected full-source fallback in both locales',storageDenied:true},null,2));
 await browser.close();console.log('Browser PASS',states.length,'state records');
})().catch(e=>{console.error(e);process.exit(1);});
