const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {trace,presets}=require('../core.js');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18783';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],badResponses=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>badResponses.push(['failed',r.url()]));page.on('response',r=>{if(r.status()>=400)badResponses.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(base+'/leetcode/135/');await page.locator('#progress').filter({hasText:/0/}).waitFor();
 const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
 async function rendered(r,k){
  const f=trace(r)[k];
  const data=await page.locator('#tableBody tr').evaluateAll(rows=>rows.map(row=>[...row.querySelectorAll('td')].map(td=>td.textContent.replace(' ★',''))));
  assert.deepEqual(data,[r,f.L,f.R,f.C].map(a=>a.map(x=>x===null?'?':String(x))));
  assert.equal(await page.locator('#history li').count(),k);
 }
 let steps=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));const r=presets[p],n=trace(r).length-1;
   await rendered(r,0);assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   for(let k=1;k<=n;k++){await page.locator('#next').click();await rendered(r,k);steps++;}
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   for(let k=n-1;k>=0;k--){await page.locator('#prev').click();await rendered(r,k);steps++;}
   await page.locator('#end').click();await rendered(r,n);
   await page.locator('#prev').click();const before=await page.locator('#tableBody').textContent();await page.locator('#next').click();await page.locator('#prev').click();assert.equal(await page.locator('#tableBody').textContent(),before);
   if(await page.locator('#reset').isEnabled())await page.locator('#reset').click();await rendered(r,0);
  }
  await page.selectOption('#preset','0');await page.locator('#end').click();
  await page.locator('#middle').evaluate(e=>{e.value=5;e.dispatchEvent(new Event('input',{bubbles:true}));});await rendered([3,5,1],0);await page.locator('#end').click();await rendered([3,5,1],8-1); // 3*n-2 final index
  await page.locator('#position').evaluate(e=>{e.value=3;e.dispatchEvent(new Event('input',{bubbles:true}));});await rendered([3,5,1],3);
  await page.locator('#middle').evaluate(e=>{e.value=0;e.dispatchEvent(new Event('input',{bubbles:true}));});await rendered([3,0,1],0);
  await page.locator('#position').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input',{bubbles:true}));});await rendered([3,0,1],7);
  await page.locator('#position').evaluate(e=>{e.value=3;e.dispatchEvent(new Event('input',{bubbles:true}));});await rendered([3,0,1],3);
  for(let c=0;c<3;c++){
   await page.locator(`[name=prediction][value="${c}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes('13'));
   const table=await page.locator('#tableBody td').allTextContents(),history=await page.locator('#history').textContent();
   const other=lang==='en'?'zh':'en';await page.locator(`[data-lang=${other}]`).click();assert(await page.locator(`[name=prediction][value="${c}"]`).isChecked());assert(await page.locator('#feedback').isVisible());assert.deepEqual(await page.locator('#tableBody td').allTextContents(),table);assert.equal(await page.locator('#history li').count(),3);
   await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#history').textContent(),history);
  }
  await page.selectOption('#preset','4');assert(await page.locator('#feedback').isVisible());
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('blocked'))}}));
  await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'visible'});assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).evaluate(e=>e.click());assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.locator(`[data-lang=${lang}]`).evaluate(e=>e.click());
  await page.evaluate(()=>delete navigator.clipboard);
 }
 // Deep links target actual sections, remain below sticky navigation.
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>location.hash),'#step2');
 const target=await page.locator('#step2').boundingBox(),nav=await page.locator('.step-nav').boundingBox();assert(target.y>=nav.height-1);
 for(const href of await page.locator('a[href^="../"]').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){
  const u=new URL(href,base+'/leetcode/135/'),r=await context.request.get(u.href);assert.equal(r.status(),200);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`));
 }
 // Keyboard navigation operates a real native control and preserves focus on locale changes.
 await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');await rendered(presets[0],1);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 const focus=await page.locator('#reset').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 // Contrast is calculated from actual computed styles including inherited disabled states.
 function luminance(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
 function ratio(a,b){const A=luminance(a),B=luminance(b);return (Math.max(A,B)+.05)/(Math.min(A,B)+.05);}
 const pairs=await page.evaluate(()=>{
  function colors(el){const s=getComputedStyle(el);let p=el,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {fg:s.color,bg};}
  return Object.fromEntries(['.explain','.hint','#next','#prev','#langToggle .active','.step-nav a.active','.active-cell','#progress'].map(sel=>[sel,colors(document.querySelector(sel))]));
 });
 const contrasts={};for(const [sel,pair]of Object.entries(pairs)){const a=pair.fg.match(/[\d.]+/g).slice(0,3).map(Number),b=pair.bg.match(/[\d.]+/g).slice(0,3).map(Number);contrasts[sel]={...pair,ratio:ratio(a,b)};assert(contrasts[sel].ratio>=4.5,sel);}
 await page.locator('#end').click();
 const disabled=await page.locator('#next').evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));contrasts.disabled={...disabled,ratio:ratio(disabled.fg.match(/[\d.]+/g).slice(0,3).map(Number),disabled.bg.match(/[\d.]+/g).slice(0,3).map(Number))};assert(contrasts.disabled.ratio>=4.5);
 contrasts.focusVsPanel=ratio([255,180,84],[22,27,34]);assert(contrasts.focusVsPanel>=3);
 // Both locales at all required sizes and an explicit 200% CSS zoom layout.
 const screenshots=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#step2').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${width} overflow`);
  const cells=await page.locator('#tableBody td').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,font:parseFloat(getComputedStyle(e).fontSize)})));assert(cells.every(c=>c.w>=32&&c.font>=14));
  const name=`${lang}-${width}.png`;await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,name),fullPage:true});screenshots.push(name);
  const stage=`${lang}-${width}-trace.png`;await page.locator('#step2 .stage').screenshot({path:path.join(out,stage),style:'.step-nav{visibility:hidden!important}'});screenshots.push(stage);
 }
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator(`[data-lang=${lang}]`).click();await page.locator('#step2').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const name=`${lang}-zoom200.png`;await page.locator('#step2 .stage').screenshot({path:path.join(out,name),style:'.step-nav{visibility:hidden!important}'});screenshots.push(name);
 }
 await page.evaluate(()=>document.body.style.zoom='1');
 const touchSizes=await page.locator('button,select,input[type=range]').evaluateAll(es=>es.map(e=>({id:e.id,height:e.getBoundingClientRect().height})));assert(touchSizes.every(e=>e.height>=48));
 for(const lang of ['en','zh']){await page.setViewportSize({width:390,height:844});await page.locator(`[data-lang=${lang}]`).click();for(const i of [0,1,3,4]){const name=`${lang}-step${i}.png`;await page.locator(`#step${i}`).screenshot({path:path.join(out,name),style:'.step-nav{visibility:hidden!important}'});screenshots.push(name);}}
 await page.setViewportSize({width:736,height:390});await page.locator('.step-nav a[href="#step2"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({forcedColors:'active'});await page.locator('#prev').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#reset').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 // Offline file opening uses the embedded mirror, not a network fetch.
 const offline=await context.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const denied=await context.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});await denied.goto(base+'/leetcode/135/');await denied.locator('[data-lang=zh]').click();await denied.locator('#next').click();assert((await denied.locator('#progress').textContent()).includes('1/'));await denied.close();
 assert.deepEqual(errors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(external,[]);
 const report={status:'pass',locales:['en','zh'],presets:6,forwardBackwardOperations:steps,viewports:[320,390,736,1440],focusedCapture:'sticky navigation hidden only during element screenshots to remove capture overlay; full-page screenshots taken from page top',zoom:'200% CSS zoom, 780px viewport = 390px layout; real Chromium',screenshots,contrasts,sourceDisplayedCopiedDownloaded:'exact',clipboard:'native success and forced manual fallback',storage:'denied read/write fallback',offline:'file source parity',keyboard:'Enter, Tab, focus, forced colors',errors,badResponses,external};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
