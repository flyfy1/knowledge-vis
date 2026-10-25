const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/801/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const ratio=(a,b)=>{const lum=h=>{const c=h.replace('#','').match(/../g).map(s=>parseInt(s,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
assert.equal(ratio('#000000','#ffffff'),21);for(const [c,r] of [['#ff0000',5.252],['#00ff00',15.304],['#0000ff',2.444],['#747474',4.492948073111701]])assert.ok(Math.abs(ratio(c,'#000000')-r)<1e-10);assert.ok(ratio('#747474','#000000')<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],requests=[],destinationErrors=[],states=[],fits=[],links=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'){const item={message:m.text(),location:m.location(),page:page.url()};if(!page.url().startsWith(url)&&m.location().url.endsWith('/favicon.ico'))destinationErrors.push(item);else errors.push(item);}});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+' '+r.status());});page.on('request',r=>requests.push(r.url()));
 const snapshot=()=>page.evaluate(()=>Object.fromEntries(['original','progress','history','final'].map(id=>[id,document.getElementById(id).textContent])));
 await page.goto(url);await page.locator('#progress').filter({hasText:'1/4'}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('h1').textContent(),lang==='en'?'#801 · Minimum Swaps To Make Sequences Increasing':'#801 · 使序列递增的最小交换次数');assert.equal(await page.title(),await page.locator('h1').textContent());
  assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/minimum-swaps-to-make-sequences-increasing/');
  const formula=await page.locator('.formula').textContent();assert.ok(formula.includes('next_keep = min(S ? keep : ∞, C ? swap : ∞)'));assert.ok(formula.includes('nums2[i−1] < nums1[i]'));
  for(let mask=0;mask<16;mask++){
   for(let i=0;i<4;i++)if((await page.locator('#swap'+i).getAttribute('aria-pressed')==='true')!==!!(mask>>i&1))await page.locator('#swap'+i).click();
   const a=[0,4,3,4],b=[0,2,5,6],x=a.map((v,i)=>mask>>i&1?b[i]:v),y=b.map((v,i)=>mask>>i&1?a[i]:v),valid=x.every((v,i)=>!i||(x[i-1]<v&&y[i-1]<y[i])),cost=mask.toString(2).split('1').length-1;
   assert.deepEqual(await page.locator('#handPairs .pair b').allTextContents(),x.flatMap((v,i)=>[String(v),String(y[i])]));
   const text=await page.locator('#handRead').textContent();assert.ok(text.includes(String(cost)));assert.ok(text.includes(lang==='en'?(valid?'yes.':'no.'):(valid?'是。':'否。')));
  }
  for(let preset=0;preset<5;preset++){
   await page.selectOption('#preset',String(preset));assert.ok(await page.locator('#prev').isDisabled());assert.ok(await page.locator('#reset').isDisabled());
   const shots=[await snapshot()];
   while(await page.locator('#next').isEnabled()){
    await page.locator('#next').click();const s=await snapshot();shots.push(s);states.push({lang,preset,...s});
    await page.locator('#prev').click();assert.deepEqual(await snapshot(),shots.at(-2));await page.locator('#next').click();assert.deepEqual(await snapshot(),s);
   }
   assert.ok(await page.locator('#end').isDisabled());assert.ok((await page.locator('#final').textContent()).includes(`=${[1,1,1,0,1][preset]}`));
   if(preset===0){const h=await page.locator('.trace-card[data-i="2"]').textContent();assert.ok(h.includes('4 < 3'));assert.ok(h.includes('1'));}
   await page.locator('#reset').click();assert.deepEqual(await snapshot(),shots[0]);await page.locator('#end').click();assert.deepEqual(await snapshot(),shots.at(-1));await page.locator('#reset').click();
  }
  assert.ok(await page.locator('#reveal').isDisabled());assert.ok(!(await page.locator('#feedback').textContent()).includes('(2,2)'));
  for(let option=0;option<3;option++){
   await page.locator(`[name=prediction][value="${option}"]`).check();assert.ok(!(await page.locator('#feedback').textContent()).includes('(2,2)'));await page.locator('#reveal').click();
   const feedback=await page.locator('#feedback').textContent();assert.ok(feedback.includes('(0,1) → (0,1) → (1,1) → (1,2) → (2,2)'));assert.ok(feedback.startsWith(lang==='en'?(option===2?'Correct.':'Compare'):(option===2?'正确。':'再比较')));
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.ok(await page.locator(`[name=prediction][value="${option}"]`).isChecked());assert.ok((await page.locator('#feedback').textContent()).includes('(2,2)'));await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#feedback').textContent(),feedback);
  }
  await page.locator('#quizReset').click();assert.ok(await page.locator('#reveal').isDisabled());
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('SUCCESS-SENTINEL-'+Math.random());});await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);await page.locator('#sourceDetails summary').click();
 }
 // Meaningful state persists across locale roundtrip; experiments remain independent.
 await page.locator('[data-lang=en]').click();await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#sourceDetails summary').click();await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
 const before=await snapshot(),handBefore=await page.locator('#handRead').textContent();
 await page.locator('[data-lang=zh]').click();await page.locator('[data-lang=en]').click();assert.deepEqual(await snapshot(),before);assert.equal(await page.locator('#handRead').textContent(),handBefore);assert.ok(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.ok(await page.locator('[data-lang=en]').evaluate(e=>document.activeElement===e));
 await page.locator('#reset').click();assert.ok((await page.locator('#feedback').textContent()).includes('(2,2)'));await page.selectOption('#preset','1');assert.ok((await page.locator('#feedback').textContent()).includes('(2,2)'));await page.locator('#quizReset').click();
 // Each fallback attempt gets a distinct sentinel verified before automatic writes are denied.
 for(const [attempt,lang] of ['zh','en'].entries()){
  const sentinel=`FALLBACK-801-${lang}-${attempt}-${Date.now()}`;
  await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test denial'));});
  await page.locator(`[data-lang=${lang}]`).click();await page.locator('#copyPython').click();assert.ok(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>({focus:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd})),{focus:true,start:0,end:source.length});
  await page.keyboard.press(os.platform()==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert.ok((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'Automatic copy failed':'自动复制失败'));
  await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
 }
 await page.locator('#copyPython').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 const contrast=[];
 for(const fg of ['#e8edf4','#9aa7b8','#6ee7ff','#ffb454','#7ee2a8','#ff7a93','#c9d4e2'])for(const bg of ['#0d1117','#161b22','#1c2330','#0a0e14']){const r=ratio(fg,bg);assert.ok(r>=4.5);contrast.push({fg,bg,ratio:r,threshold:4.5});}
 for(const [fg,bg] of [['#0d1117','#6ee7ff'],['#e8edf4','#3c2c16']]){const r=ratio(fg,bg);assert.ok(r>=4.5);contrast.push({fg,bg,ratio:r,threshold:4.5});}
 await page.locator('#end').click();
 const rendered=[];
 for(const selector of ['#reveal','#prev','#preset','#swap1','.pair span','.pair b','#feedback','.candidate'])rendered.push(await page.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);return {selector:e.id||e.className,fg:s.color,bg:s.backgroundColor,opacity:s.opacity,font:s.fontFamily,minHeight:s.minHeight};}));
 assert.equal(rendered[0].fg,'rgb(154, 167, 184)');assert.equal(rendered[0].bg,'rgb(28, 35, 48)');assert.equal(rendered[0].opacity,'1');
 for(const width of [320,390,736,1440])for(const lang of ['zh','en']){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();
  for(let i=0;i<5;i++){
   await page.selectOption('#preset',String(i));const fit=await page.locator('#preset').evaluate(e=>{const c=document.createElement('canvas').getContext('2d'),s=getComputedStyle(e);c.font=s.font;return {text:e.selectedOptions[0].text,measured:c.measureText(e.selectedOptions[0].text).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-24,font:s.fontFamily};});fits.push({width,lang,...fit});assert.ok(fit.measured<=fit.available,`select fit ${lang}/${width}/${i}`);
  }
  await page.selectOption('#preset','0');await page.locator('#end').click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}/${lang}`);
  assert.ok(await page.locator('.formula').evaluate(e=>e.scrollWidth<=e.clientWidth),'formula wraps within its panel');
  assert.ok(await page.locator('.pair,.candidate').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth)));
  if(width===320||width===1440){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`header-${width}-${lang}.png`)});}
  await page.locator('.trace-card[data-i="2"]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`trace-${width}-${lang}.png`)});
  await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.locator('#feedback').scrollIntoViewIfNeeded();if(width===390)await page.screenshot({path:path.join(out,`quiz-${width}-${lang}.png`)});await page.locator('[name=prediction][value="0"]').check();assert.ok(!(await page.locator('#feedback').textContent()).includes('(2,2)'));await page.locator('#quizReset').click();
  assert.equal(await page.locator('h1').textContent(),lang==='en'?'#801 · Minimum Swaps To Make Sequences Increasing':'#801 · 使序列递增的最小交换次数');
 }
 // Native Chrome tab zoom via test-only local extension.
 const ext=path.join(__dirname,'zoom-extension'),profile=path.join(out,'zoom-profile');fs.rmSync(profile,{recursive:true,force:true});
 const zc=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,viewport:null,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`,'--window-size=1440,1000'],ignoreDefaultArgs:['--disable-extensions']});
 const zp=await zc.newPage();await zp.goto(url);const worker=zc.serviceWorkers()[0]||await zc.waitForEvent('serviceworker');
 await worker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.setZoom(tabs.find(t=>t.url.includes('/801/')).id,2,resolve))));await zp.waitForFunction(()=>devicePixelRatio===2);
 const zoom=await zp.evaluate(()=>({innerWidth,devicePixelRatio}));zoom.nativeFactor=await worker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.getZoom(tabs.find(t=>t.url.includes('/801/')).id,resolve))));assert.equal(zoom.innerWidth,720);assert.equal(zoom.nativeFactor,2);
 for(const lang of ['zh','en']){await zp.locator(`[data-lang=${lang}]`).click();await zp.selectOption('#preset','0');await zp.locator('#end').click();await zp.locator('.trace-card[data-i="2"]').scrollIntoViewIfNeeded();assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const session=await zc.newCDPSession(zp);const shot=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`zoom200-${lang}.png`),Buffer.from(shot.data,'base64'));await session.detach();}
 await zc.close();fs.rmSync(profile,{recursive:true,force:true});
 await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.ok((await page.locator('#progress').textContent()).includes('2/4'));await page.locator('#prev').focus();assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');await page.keyboard.press('Tab');assert.ok(await page.locator('#next').evaluate(e=>document.activeElement===e));
 for(const a of await page.locator('.step-nav a').all()){
  await a.focus();await page.keyboard.press('Enter');const id=await a.getAttribute('href');await page.waitForFunction(id=>{const y=document.querySelector(id).getBoundingClientRect().top;return y>=0&&y<200;},id);
 }
 for(const lang of ['zh','en']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const a of await page.locator('.related a').all()){
   const label=await a.textContent(),target=new URL(await a.getAttribute('href'),url);const r=await context.request.get(target.href);assert.equal(r.status(),200);assert.ok((await r.text()).includes(`id="${target.hash.slice(1)}"`));
   await a.focus();await page.keyboard.press('Enter');await page.waitForURL(target.href);links.push({lang,label,url:target.href,section:await page.locator(target.hash).textContent()});if(!target.href.startsWith(url))await page.goto(url);await page.locator(`[data-lang=${lang}]`).click();
  }
 }
 const denied=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',forcedColors:'active'});await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(String(e)));await dp.goto(url);await dp.locator('[data-lang=zh]').click();await dp.locator('#next').click();assert.ok((await dp.locator('#progress').textContent()).includes('2/4'));await dp.screenshot({path:path.join(out,'forced-colors.png')});await denied.close();
 const offlineContext=await browser.newContext();const offline=await offlineContext.newPage();offline.on('pageerror',e=>errors.push(String(e)));await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#sourceDetails summary').click();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offlineContext.close();
 assert.equal(errors.length,0,JSON.stringify(errors));assert.ok(requests.every(r=>r.startsWith(new URL(url).origin+'/')||r.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert.ok(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({browser:await browser.version(),host:os.platform(),url,states,errors,destinationErrors,localRequestsOnly:true,contrast,rendered,zoom,cssBytes,fits,links,clipboard:'success and per-attempt verified sentinel; actual host keyboard fallback exact',source:'DOM, clipboard, fallback keyboard readback, downloaded bytes exact',screenshots:'generated; inspection recorded separately'},null,2)+'\n');await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
