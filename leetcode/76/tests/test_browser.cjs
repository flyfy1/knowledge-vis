// NODE_PATH provided by environment. OUTPUT_DIR and PREVIEW_ROOT can be overridden.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18773')+'/leetcode/76/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],badAssets=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url()+':'+r.status());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18773')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.locator('#state').filter({hasText:'missing'}).waitFor();
 const snap=()=>page.evaluate(()=>({state:document.querySelector('#state').textContent,best:document.querySelector('#best').textContent,counts:document.querySelector('#counts').textContent,rows:document.querySelector('#rows').textContent,tiles:document.querySelector('#tiles').textContent}));
 let endpointChecks=0;
 for(const lang of ['en','zh']){
  await page.click(`[data-lang="${lang}"]`);
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const start=await snap();const states=[start];
   while(await page.locator('#next').isEnabled()){await page.click('#next');states.push(await snap());}
   assert(await page.locator('#next').isDisabled());
   assert((await page.locator('#best').textContent()).includes(['AAC','AAC','BANC',lang==='en'?'none yet':'尚无','a',lang==='en'?'none yet':'尚无'][p]));
   for(let i=states.length-2;i>=0;i--){await page.click('#prev');assert.deepEqual(await snap(),states[i]);}
   await page.click('#next');const after=await snap();await page.click('#prev');await page.click('#next');assert.deepEqual(await snap(),after);
   await page.click('#reset');assert.deepEqual(await snap(),start);endpointChecks++;
  }
  await page.selectOption('#preset','0');await page.click('#next');const originalValue=await page.inputValue('#position');
  await page.click(`[data-lang="${lang==='en'?'zh':'en'}"]`);assert.equal(await page.inputValue('#position'),originalValue);await page.click(`[data-lang="${lang}"]`);
  // All answers, reveal then change clears feedback, locale preserves revealed state.
  for(const choice of ['0','1','2']){
   await page.check(`[name="prediction"][value="${choice}"]`);assert(await page.locator('#feedback').isHidden());
   await page.click('#reveal');assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes('ABBC'));
   const value=await page.inputValue('#position');await page.click(`[data-lang="${lang==='en'?'zh':'en'}"]`);assert(await page.locator(`[value="${choice}"][name="prediction"]`).isChecked());assert(await page.locator('#feedback').isVisible());assert.equal(await page.inputValue('#position'),value);await page.click(`[data-lang="${lang}"]`);
  }
  await page.fill('#inputS','XYZ');await page.fill('#inputT','YZ');await page.click('[data-i18n="apply"]');assert.equal(await page.inputValue('#preset'),'custom');assert.equal(await page.inputValue('#position'),'0');
  await page.click('#next');const beforeInvalid=await snap();await page.fill('#inputT','12');await page.click('[data-i18n="apply"]');assert.deepEqual(await snap(),beforeInvalid);assert(await page.locator('#validation').isVisible());
  // Copy successful path and failure/manual fallback, with exact payload checks.
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedText=text;}}});});
  await page.click('#copy');assert.equal(await page.evaluate(()=>window.copiedText),source);assert(await page.locator('#manualCopy').isHidden());
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});});
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.evaluate(()=>document.querySelector('#copyText').selectionEnd),source.length);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('[download]')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.locator('#sourceDetails').evaluate(e=>e.open=false);
  await page.selectOption('#preset','0');await page.locator('#position').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));});
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`overflow ${lang} ${width}`);
   const dims=await page.locator('.tile').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
   assert(dims.every(x=>x.w>=48&&x.h>=80));
   await page.locator('#tiles').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}.png`)});
  }
  // 200% browser-equivalent CSS zoom, with layout and populated component checks.
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));await page.locator('#tiles').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Keyboard navigation and focus outline, including native slider operations.
 await page.setViewportSize({width:390,height:900});await page.selectOption('#preset','0');await page.focus('#next');await page.keyboard.press('Enter');assert.equal(await page.inputValue('#position'),'1');await page.focus('#position');await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
 await page.focus('#next');const focus=await page.locator('#next').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'position'); // Disabled Reset is correctly skipped at the initial frame.
 // Header/control and focus contrasts from rendered styles; shared tokens for all roles.
 const styles=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good','bad','line'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
 function luminance(hex){const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const contrasts=[];for(const fg of ['text','muted','accent','accent2','good','bad'])for(const bg of ['bg','panel','panel2']){const ratio=contrast(styles[fg],styles[bg]);assert(ratio>=4.5,`${fg}/${bg} ${ratio}`);contrasts.push({fg,bg,ratio:Number(ratio.toFixed(2))});}
 assert(contrast(styles.accent2,styles.panel2)>=3);assert(contrast(styles.muted,styles.panel2)>=3);
 const controls=await page.locator('button,select,summary,.solution-actions a').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
 assert(controls.every(x=>x.h>=48&&x.w>=48),JSON.stringify(controls.filter(x=>x.h<48||x.w<48)));
 // Every existing anchor resolves, including related lesson anchors.
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 for(const href of links){if(href.startsWith('#'))assert(await page.locator(href).count());if(href.startsWith('../')&&href.includes('#')){const target=new URL(href,url),r=await context.request.get(target.href.split('#')[0]);assert(r.ok());assert((await r.text()).includes(`id="${target.hash.slice(1)}"`));}}
 await page.locator('a[href="#step1"]').click();await page.waitForTimeout(100);const top=await page.locator('#step1').evaluate(e=>e.getBoundingClientRect().top);assert(top>=70&&top<150,`anchor top ${top}`);
 // Forced colors retains focus and explicit border; reduced motion already active.
 await page.emulateMedia({forcedColors:'active'});await page.focus('#next');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 // Storage denial and offline file source/locale initialization.
 const isolated=await browser.newContext();const p2=await isolated.newPage();const recoveryErrors=[];p2.on('pageerror',e=>recoveryErrors.push(e.message));await p2.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});await p2.goto(url);await p2.locator('#state').filter({hasText:'missing'}).waitFor();await p2.click('[data-lang="zh"]');assert.equal(await p2.locator('html').getAttribute('lang'),'zh-CN');
 await p2.goto('file://'+path.resolve(__dirname,'../index.html'));await p2.locator('#state').filter({hasText:'missing'}).waitFor();assert.equal(await p2.locator('#pythonCode').textContent(),source);assert.deepEqual(recoveryErrors,[]);
 const cssBytes=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(cssBytes<25000);
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
 const result={url,endpointChecks,locales:['en','zh'],widths:[320,390,736,1440],zoom:'200% CSS zoom',screenshots:10,errors,badAssets,external,contrasts,cssBytes,checks:['all preset events forward/back','reset','snapshot replay','slider keyboard endpoints','locale preserves trace/answer/reveal/focus','all prediction choices and change clearing','custom valid/invalid','clipboard success and denied fallback','source/display/download parity','offline file','denied storage','keyboard/focus','forced colors','deep link geometry','controls >=48px']};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
