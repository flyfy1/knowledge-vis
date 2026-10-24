'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/327/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await ctx.newPage(),errors=[],requests=[],checks=[],bindings=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(BASE);await page.locator('#baseStatus').waitFor();
 const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(200);await page.screenshot({path:path.join(OUT,`header-${lang}.png`)});
  await page.locator('#baseReset').click();assert(await page.locator('#basePrev').isDisabled());
  for(let i=0;i<6;i++)await page.locator('#baseNext').click();
  await page.locator('#step0 .stage').screenshot({path:path.join(OUT,`baseline-${lang}.png`)});
  assert.equal(await page.locator('#baseRows tr').count(),6);assert(await page.locator('#baseNext').isDisabled());
  const status=await page.locator('#baseStatus').innerText();assert(status.includes('3'));bindings.push({lang,state:'baseline completed',text:status});
  await page.locator('#basePrev').click();assert.equal(await page.locator('#baseRows tr').count(),5);await page.locator('#baseNext').click();
  for(let i=0;i<6;i++){
   await page.locator('#pairSelect').selectOption(String(i));
   const got=await page.locator('#pairRead').innerText();assert(got.includes('P['));bindings.push({lang,state:'prefix pair '+i,text:got});
  }
  for(let preset=0;preset<5;preset++){
   await page.locator('#preset').selectOption(String(preset));assert(await page.locator('#tracePrev').isDisabled());
   const max=await page.evaluate(()=>frames.length-1);let n=0;
   while(!await page.locator('#traceNext').isDisabled()){
    await page.locator('#traceNext').click();n++;const before=await page.locator('#operationRead').innerText();
    await page.locator('#tracePrev').click();await page.locator('#traceNext').click();assert.equal(await page.locator('#operationRead').innerText(),before);
   }
   assert.equal(n,max);
   const total=await page.evaluate(()=>frames[at].total);assert.equal(total,[3,1,6,1,1][preset]);
   await page.locator('#traceReset').click();assert.equal(await page.locator('#countLedger li').count(),0);
   await page.locator('#traceLast').click();assert.equal(await page.evaluate(()=>frames[at].total),total);
   checks.push(`${lang} preset ${preset}: all ${max} operations reversible, total ${total}`);
  }
  await page.locator('#preset').selectOption('0');await page.locator('#traceNext').click();
  const before=await page.evaluate(()=>JSON.stringify({at,preset,base,pair}));
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.equal(await page.evaluate(()=>JSON.stringify({at,preset,base,pair})),before);
  await page.locator(`[data-lang="${lang}"]`).click();
  bindings.push({lang,state:'first cross count, inclusive lower boundary',text:await page.locator('#operationRead').innerText(),right:await page.locator('#rightValues').innerText()});
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!((await page.locator('#predictionFeedback').innerText()).includes('k=0')));
  for(const choice of [1,3,6]){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(!((await page.locator('#predictionFeedback').innerText()).includes('k=0')));
   await page.locator('#reveal').click();assert((await page.locator('#predictionFeedback').innerText()).includes('k=0'));
   assert.equal(await page.locator('#predictionFeedback').evaluate(e=>e.classList.contains('correct')),choice===3);
   bindings.push({lang,state:'prediction '+choice,text:await page.locator('#predictionFeedback').innerText()});
  }
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator('[name="prediction"][value="6"]').isChecked());assert((await page.locator('#predictionFeedback').innerText()).includes('k=0'));
  await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('[name="prediction"][value="3"]').check();assert(!((await page.locator('#predictionFeedback').innerText()).includes('k=0')));
  await page.locator('#reveal').click();
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const dl=page.waitForEvent('download');await page.locator('a[download]').click();const d=await dl;await d.saveAs(path.join(OUT,'download-'+lang+'.py'));assert.equal(fs.readFileSync(path.join(OUT,'download-'+lang+'.py'),'utf8'),source);
 }
 // Real keyboard: focus, activation, radio navigation, retained focus across locale change.
 await page.locator('#traceReset').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>at),0);
 await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>at),1);
 const focus=await page.locator('#traceNext').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.style,'solid');assert.equal(focus.width,'3px');
 await page.locator('[name="prediction"][value="1"]').focus();await page.keyboard.press('ArrowDown');assert(await page.locator('[name="prediction"][value="3"]').isChecked());
 await page.locator('[data-lang="en"]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw Error('test denied');}}));
 for(const lang of ['en','zh']){await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>document.getElementById('manualSource').value.slice(document.getElementById('manualSource').selectionStart,document.getElementById('manualSource').selectionEnd)),source);bindings.push({lang,state:'clipboard fallback',text:await page.locator('#copyStatus').innerText()});}
 // Local source display still works offline; storage refusal is a separate fresh session.
 const offline=await browser.newContext();await offline.setOffline(true);const filePage=await offline.newPage();await filePage.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await filePage.locator('#pythonCode').textContent(),source);await offline.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage unavailable');}});});const bp=await blocked.newPage();await bp.goto(BASE);await bp.locator('[data-lang="zh"]').click();assert.equal(await bp.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 // Inspect layout at actual populated states in both locales.
 const shots=[];
 for(const width of [320,390,736,1440])for(const lang of ['en','zh']){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang="${lang}"]`).click();
  await page.locator('#preset').selectOption('2');await page.locator('#traceLast').click();await page.locator('#tracePrev').click();await page.locator('#tracePrev').click();
  await page.locator('#frameRead').scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${lang}`);
  const targets=await page.locator('button,select').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({id:e.id||e.dataset.lang,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(targets.every(e=>e.w>=48&&e.h>=48),JSON.stringify(targets));
  const selectFits=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return c.measureText(e.options[e.selectedIndex].text).width <= e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20;});assert(selectFits,`preset label clipping ${lang} ${width}`);
  if(width===320)await page.locator('#halves').screenshot({path:path.join(OUT,`halves-${lang}-320.png`)});
  const shot=`trace-${lang}-${width}.png`;await page.screenshot({path:path.join(OUT,shot)});shots.push(shot);
  await page.locator('#step3').scrollIntoViewIfNeeded();await page.locator('[name="prediction"][value="3"]').check();await page.locator('#reveal').click();
  await page.locator('#predictionFeedback').screenshot({path:path.join(OUT,`prediction-${lang}-${width}.png`)});
 }
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:320,height:1000});await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#preset').selectOption('4');await page.locator('#traceLast').click();await page.locator('#tracePrev').click();await page.locator('#tracePrev').click();await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`extremes-${lang}-320.png`)});
  await page.setViewportSize({width:1440,height:1000});await page.locator(`[data-lang="${lang}"]`).click();await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#frameRead').scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.waitForTimeout(200);await page.evaluate(()=>updateNav());assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step2');await page.screenshot({path:path.join(OUT,`zoom200-${lang}.png`)});await page.evaluate(()=>document.body.style.zoom='');
 }
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
 // Deep links resolve and land below sticky nav.
 await page.locator('.step-nav a[href="#step1"]').click();await page.waitForTimeout(400);const geometry=await page.locator('#step1 h2').boundingBox();assert(geometry.y>=48);// All link targets checked from files below.
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('https:'))continue;const [file,anchor]=href.split('#');let target=file?path.resolve(ROOT,file):path.join(ROOT,'index.html');if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');assert(fs.existsSync(target));if(anchor)assert(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`));
 }
 assert.equal(errors.length,0,JSON.stringify(errors));assert(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')));
 // Measured nominal/computed solid foreground/background pairs, including disabled and focus.
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement),names=['bg','panel','panel2','text','muted','accent','accent2','good'];return Object.fromEntries(names.map(n=>[n,s.getPropertyValue('--'+n).trim()]));});
 function luminance(hex){const c=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const contrasts=[];for(const bg of ['bg','panel','panel2'])for(const fg of ['text','muted','accent','accent2','good']){const ratio=contrast(colors[fg],colors[bg]);assert(ratio>=4.5);contrasts.push({fg,bg,ratio:+ratio.toFixed(2)});}
 const cssBytes=fs.statSync(path.join(ROOT,'local.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({status:'PASS (author self-check)',checks,bindings,shots,errors,localRequests:requests.length,cssBytes,contrasts,keyboardFocus:focus,zoom:'200% CSS layout zoom; physical browser chrome/device not tested',offlineSource:true,storageBlocked:true},null,2));
 console.log('PASS: bilingual controls, all presets, source actions, offline/storage, keyboard, layouts, contrast.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
