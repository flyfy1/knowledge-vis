const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/765/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const ratio=(a,b)=>{const lum=h=>{const c=h.replace('#','').match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
assert.equal(ratio('#000000','#ffffff'),21);assert.ok(Math.abs(ratio('#ff0000','#000000')-5.252)<1e-10);assert.ok(Math.abs(ratio('#00ff00','#000000')-15.304)<1e-10);assert.ok(Math.abs(ratio('#0000ff','#000000')-2.444)<1e-10);assert.ok(Math.abs(ratio('#747474','#000000')-4.492948073111701)<1e-10);assert.ok(ratio('#747474','#000000')<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],requests=[],states=[],relatedDestinationWarnings=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'){const entry={message:m.text(),location:m.location(),page:page.url()};if(new URL(page.url()).pathname==='/leetcode/41/'&&m.location().url===new URL('/favicon.ico',url).href)relatedDestinationWarnings.push(entry);else errors.push(entry);}});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+' '+r.status());});page.on('request',r=>requests.push(r.url()));
 const traceSnapshot=()=>page.evaluate(()=>Object.fromEntries(['progress','operation','beforeRow','afterRow','positions','history','final','graphRead'].map(id=>[id,document.getElementById(id).textContent])));
 await page.goto(url);await page.locator('#progress').filter({hasText:'0/2'}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),lang==='en'?'#765 · Couples Holding Hands':'#765 · 情侣牵手');assert.equal(await page.title(),await page.locator('h1').textContent());
  await page.locator('#handNext').click();assert.ok((await page.locator('#handRead').textContent()).includes(lang==='en'?'minimum is 1':'最少是 1'));await page.locator('#handPrev').click();
  for(let preset=0;preset<5;preset++){
   await page.selectOption('#preset',String(preset));assert.ok(await page.locator('#prev').isDisabled());assert.ok(await page.locator('#reset').isDisabled());
   let snapshots=[];snapshots.push(await traceSnapshot());
   while(await page.locator('#next').isEnabled()){
    await page.locator('#next').click();const snapshot=await traceSnapshot();snapshots.push(snapshot);
    const text=await page.locator('#operation').textContent();states.push({lang,preset,text,progress:await page.locator('#progress').textContent(),groups:await page.locator('#graphRead').textContent()});
    await page.locator('#prev').click();assert.deepEqual(await traceSnapshot(),snapshots.at(-2));await page.locator('#next').click();assert.deepEqual(await traceSnapshot(),snapshot);
   }
   assert.ok(await page.locator('#end').isDisabled());const expected=[1,0,2,3,2][preset];assert.ok((await page.locator('#final').textContent()).includes(lang==='en'?`minimum is ${expected}`:`最少交换 ${expected}`));
   await page.locator('#reset').click();assert.ok(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert.ok(await page.locator('#next').isDisabled());await page.locator('#reset').click();
  }
  assert.ok(await page.locator('#reveal').isDisabled());assert.ok(!(await page.locator('#feedback').textContent()).includes('4−2'));
  for(let option=0;option<3;option++){
   await page.locator(`[name=prediction][value="${option}"]`).check();assert.ok(!(await page.locator('#feedback').textContent()).includes('4−2'));await page.locator('#reveal').click();assert.ok((await page.locator('#feedback').textContent()).includes('4−2=2'));
   const previous=await page.locator('#feedback').textContent();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.ok(await page.locator(`[name=prediction][value="${option}"]`).isChecked());assert.ok((await page.locator('#feedback').textContent()).includes('4−2=2'));await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#feedback').textContent(),previous);
  }
  await page.locator('#quizReset').click();assert.ok(await page.locator('#reveal').isDisabled());
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.locator('#sourceDetails summary').click();
 }
 // Meaningful state survives locale roundtrip, including disclosure and focus.
 await page.locator('[data-lang=en]').click();await page.selectOption('#preset','3');await page.locator('#next').click();await page.locator('#sourceDetails summary').click();
 const before=await page.locator('#afterRow').textContent();await page.locator('[data-lang=zh]').click();await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#afterRow').textContent(),before);assert.equal(await page.locator('#preset').inputValue(),'3');assert.ok(await page.locator('#sourceDetails').evaluate(e=>e.open));
 // Denied automatic clipboard -> actual Linux host keyboard copy, seeded sentinel.
 await page.evaluate(()=>navigator.clipboard.writeText('NON-SOURCE-SENTINEL-765'));
 await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test denial'));});
 for(const lang of ['zh','en']){
  await page.locator(`[data-lang=${lang}]`).click();await page.locator('#copyPython').click();assert.ok(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>({focus:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd})),{focus:true,start:0,end:source.length});
  await page.keyboard.press(os.platform()==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>window.savedWrite('NON-SOURCE-SENTINEL-765'));
 }
 await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
 const contrast=[];
 for(const fg of ['#e8edf4','#9aa7b8','#6ee7ff','#ffb454','#7ee2a8','#c9d4e2'])for(const bg of ['#0d1117','#161b22','#1c2330','#0a0e14']){const r=ratio(fg,bg);assert.ok(r>=4.5);contrast.push({fg,bg,ratio:r,threshold:4.5});}
 for(const [fg,bg] of [['#0d1117','#6ee7ff'],['#ffb454','#161b22'],['#ffb454','#0d1117'],['#ffb454','#1c2330']]){const r=ratio(fg,bg);assert.ok(r>=4.5);contrast.push({fg,bg,ratio:r,threshold:4.5});}
 const disabled=await page.locator('#reveal').evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor,opacity:getComputedStyle(e).opacity}));assert.equal(disabled.fg,'rgb(154, 167, 184)');assert.equal(disabled.bg,'rgb(28, 35, 48)');assert.equal(disabled.opacity,'1');
 const rendered=await page.locator('#next').evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor,font:getComputedStyle(e).fontFamily,minHeight:getComputedStyle(e).minHeight}));assert.equal(rendered.minHeight,'48px');
 for(const width of [320,390,736,1440])for(const lang of ['zh','en']){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','3');await page.locator('#next').click();await page.locator('#afterRow').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}/${lang}`);
  assert.ok(await page.locator('.step-nav a').evaluateAll(as=>as.every(a=>a.scrollWidth<=a.clientWidth)));
  if(width===320||width===1440){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`header-${width}-${lang}.png`)});await page.locator('#afterRow').scrollIntoViewIfNeeded();}
  const fit=await page.locator('#preset').evaluate(e=>{const c=document.createElement('canvas').getContext('2d'),s=getComputedStyle(e);c.font=s.font;return {text:c.measureText(e.selectedOptions[0].text).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-24};});assert.ok(fit.text<=fit.available);
  await page.screenshot({path:path.join(out,`trace-${width}-${lang}.png`)});
  await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`quiz-${width}-${lang}.png`)});await page.locator('[name=prediction][value="0"]').check();assert.ok(!(await page.locator('#feedback').textContent()).includes('4−2'));await page.locator('#quizReset').click();
 }
 // Native 200% browser zoom via test-only extension; no viewport emulation.
 const ext=path.join(__dirname,'zoom-extension'),profile=path.join(out,'zoom-profile');fs.rmSync(profile,{recursive:true,force:true});
 const zc=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,viewport:null,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`,'--window-size=1440,1000'],ignoreDefaultArgs:['--disable-extensions']});
 const zp=await zc.newPage();await zp.goto(url);
 const zoomWorker=zc.serviceWorkers()[0]||await zc.waitForEvent('serviceworker');
 await zoomWorker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.setZoom(tabs.find(t=>t.url.includes('/765/')).id,2,resolve))));
 await zp.waitForFunction(()=>devicePixelRatio===2);
 const zoom=await zp.evaluate(()=>({innerWidth,devicePixelRatio}));assert.equal(zoom.innerWidth,720);
 zoom.nativeFactor=await zoomWorker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.getZoom(tabs.find(t=>t.url.includes('/765/')).id,resolve))));assert.equal(zoom.nativeFactor,2);
 for(const lang of ['zh','en']){await zp.locator(`[data-lang=${lang}]`).click();await zp.selectOption('#preset','3');await zp.locator('#next').click();await zp.locator('#afterRow').scrollIntoViewIfNeeded();assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await zp.waitForTimeout(200);const session=await zc.newCDPSession(zp);const shot=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`zoom200-${lang}.png`),Buffer.from(shot.data,'base64'));await session.detach();}
 await zc.close();fs.rmSync(profile,{recursive:true,force:true});
 // Keyboard-visible focus and actual control activation.
 await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.ok((await page.locator('#progress').textContent()).includes('1/2'));await page.locator('#prev').focus();assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');
 for(const a of await page.locator('.step-nav a').all()){
  await a.focus();await page.keyboard.press('Enter');const id=await a.getAttribute('href');await page.waitForFunction(id=>{const y=document.querySelector(id).getBoundingClientRect().top;return y>=0&&y<200;},id);const y=await page.locator(id).evaluate(e=>e.getBoundingClientRect().top);assert.ok(y>=0&&y<200,`${id} ${y}`);
 }
 const related=await page.locator('.related a').all();for(const a of related){const href=await a.getAttribute('href');const target=new URL(href,url);const r=await context.request.get(target.href);assert.equal(r.status(),200);assert.ok((await r.text()).includes(`id="${target.hash.slice(1)}"`));}
 await page.locator('.related a').last().focus();await page.keyboard.press('Enter');await page.waitForURL('**/41/#step2');assert.ok((await page.locator('#step2').textContent()).includes('x−1'));await page.locator('[data-lang=zh]').click();assert.ok((await page.locator('#step2').textContent()).includes('交换'));
 // Storage denied and reduced motion/forced colors preserve functionality.
 const denied=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',forcedColors:'active'});await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto(url);await dp.locator('[data-lang=zh]').click();await dp.locator('#next').click();assert.ok((await dp.locator('#progress').textContent()).includes('1/2'));await dp.screenshot({path:path.join(out,'forced-colors.png')});await denied.close();
 const offlineContext=await browser.newContext();const offline=await offlineContext.newPage();offline.on('pageerror',e=>errors.push(String(e)));await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#sourceDetails summary').click();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offlineContext.close();
 assert.equal(errors.length,0,JSON.stringify(errors));assert.ok(requests.every(r=>r.startsWith('http://127.0.0.1:18770/')||r.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert.ok(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({browser:await browser.version(),host:os.platform(),url,states,errors,relatedDestinationWarnings,localRequestsOnly:true,contrast,rendered,disabled,zoom,cssBytes,clipboard:'success and denied fallback actual host shortcut exact',source:'DOM, clipboard, fallback keyboard readback, downloaded bytes exact',screenshots:'generated; author inspection recorded separately'},null,2)+'\n');
 await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
