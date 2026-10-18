'use strict';
// NODE_PATH supplies Playwright. OUTPUT_DIR redirects every generated artifact.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_URL||'http://127.0.0.1:18792/leetcode/214/';
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 context.setDefaultTimeout(8000);
 const page=await context.newPage(),errors=[],badAssets=[],external=[];let assertions=0;
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)badAssets.push([r.status(),r.url()]);});
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18792/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(BASE);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const snapshot=()=>page.evaluate(()=>({cells:document.querySelector('#chars').innerText,event:document.querySelector('#event').innerText,history:document.querySelector('#historyBody').innerText,progress:document.querySelector('#progress').innerText,final:document.querySelector('#final').innerText,hidden:document.querySelector('#final').hidden}));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let preset=0;preset<8;preset++){
   await page.locator('#preset').selectOption(String(preset));
   const total=await page.locator('#position').getAttribute('max');
   assert(await page.locator('#prev').isDisabled());
   if(Number(total)===0){assert(await page.locator('#next').isDisabled());assert(await page.locator('#final').isVisible());}
   let states=[await snapshot()];
   for(let i=1;i<=Number(total);i++){await page.locator('#next').click();states.push(await snapshot());assert.equal(await page.locator('#position').inputValue(),String(i));}
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(28, 35, 48)');
   for(let i=Number(total)-1;i>=0;i--){await page.locator('#prev').click();const a=await snapshot();delete a.final;const b={...states[i]};delete b.final;assert.deepEqual(a,b);assertions++;}
   if(Number(total)>0){await page.locator('#next').click();const a=await snapshot();delete a.final;const b={...states[1]};delete b.final;assert.deepEqual(a,b);}
   // Disabled endpoints have already been asserted above.
   if(Number(total)>1){await page.locator('#end').click();assert(await page.locator('#final').isVisible());}
   await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');assert.equal(await page.locator('#historyBody tr').count(),0);
   assertions++;
  }
  // Every prediction option: no feedback before reveal, changed answer clears it.
  for(const value of ['0','1','2']){
   await page.locator(`[name=prediction][value="${value}"]`).check();assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
   assert((await page.locator('#feedback').innerText()).includes('pi[5]=2'));assertions++;
  }
 }
 // Locale switches preserve experiment, reveal, selection, disclosure, and focus.
 await page.locator('#preset').selectOption('1');await page.locator('#next').click();
 await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const position=await page.locator('#position').inputValue();
 await page.locator('[data-lang=en]').click();
 assert.equal(await page.locator('#position').inputValue(),position);assert.equal(await page.locator('#preset').inputValue(),'1');
 assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 await page.locator('#preset').selectOption('0');assert(await page.locator('#feedback').isVisible());
 // Source display, actual clipboard success, download, denied clipboard fallback.
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const pending=page.waitForEvent('download');await page.locator('a[download]').click();const download=await pending;
 assert.equal(download.suggestedFilename(),'solution.py');assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}}));
 await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 await page.locator('[data-lang=zh]').click();assert(await page.locator('#manualCopy').isVisible());
 await page.locator('#manualCopy').screenshot({path:path.join(OUT,'copy-fallback.png')});
 // Keyboard controls and focus: range, radios, step link target.
 await page.locator('#preset').selectOption('1');await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'1');
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
 const focus=await page.locator('#next').evaluate(e=>{let c=getComputedStyle(e);return {width:c.outlineWidth,style:c.outlineStyle,color:c.outlineColor};});assert.equal(focus.width,'3px');
 await page.locator('[name=prediction][value="0"]').check();await page.locator('#reveal').click();await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('ArrowRight');assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isHidden());
 for(let i=0;i<5;i++){
  await page.locator(`.step-nav a[href="#step${i}"]`).click();await page.waitForFunction(id=>{const e=document.querySelector('#step'+id),n=document.querySelector('nav');return e.getBoundingClientRect().top>=n.getBoundingClientRect().bottom-2&&e.getBoundingClientRect().top<=120;},i);
  const geometry=await page.locator(`#step${i}`).evaluate(e=>({top:e.getBoundingClientRect().top,nav:document.querySelector('nav').getBoundingClientRect().bottom}));
  assert(geometry.top>=geometry.nav-2,JSON.stringify({i,geometry}));
 }
 // Verify related destinations from the running preview and source anchors.
 for(const href of await page.locator('.related a').evaluateAll(a=>a.map(e=>e.getAttribute('href')))){
  const [file,anchor]=href.split('#'),resp=await context.request.get(new URL(file,BASE).href);assert.equal(resp.status(),200);assert((await resp.text()).includes(`id="${anchor}"`));
 }
 const layout=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.locator('#preset').selectOption('1');
  const frames=await page.evaluate(()=>PalindromeLesson.trace('abab'));const idx=frames.findIndex(f=>f.kind==='fallback');
  await page.locator('#position').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(idx));
  assert((await page.locator('#event').innerText()).includes('pi['));assert((await page.locator('#event').innerText()).includes('?'));
  await page.locator('#step2 .stage').scrollIntoViewIfNeeded();
  const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,cells:[...document.querySelectorAll('.cell')].map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})),controls:[...document.querySelectorAll('button,select')].map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))}));
  const navRects=await page.locator('.step-nav a').evaluateAll(es=>es.map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})));for(let k=1;k<navRects.length;k++)assert(navRects[k].left>=navRects[k-1].right);
  assert(!geometry.overflow,`${lang} ${width} page overflow`);assert(geometry.cells.every(e=>e.w>=64));assert(geometry.controls.every(e=>e.w>=48&&e.h>=48));
  await page.locator('#step2 .stage').screenshot({style:'.step-nav{visibility:hidden!important}',path:path.join(OUT,`${lang}-${width}-fallback.png`)});
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-viewport.png`)});
  await page.locator('#end').click();assert(await page.locator('#final').isVisible());
  layout.push({lang,width,...geometry});
 }
 // Desktop browser 200% layout zoom; viewport halves available CSS width equivalently.
 for(const lang of ['en','zh'])for(const zoomWidth of [320,390,1280]){
  await page.setViewportSize({width:zoomWidth,height:1000});await page.locator(`[data-lang=${lang}]`).click();
  await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#preset').selectOption('2');
  await page.locator('#end').click();await page.locator('#chars').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const sizes=await page.locator('.cell').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));assert(sizes.every(x=>x>=128));
  await page.locator('#step2 .stage').screenshot({style:'.step-nav{visibility:hidden!important}',path:path.join(OUT,`${lang}-${zoomWidth}-zoom200.png`)});
  await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Actual CSS color pairs, including disabled controls and focus.
 await page.setViewportSize({width:1440,height:1000});await page.locator('#reset').click();
 const colors=await page.evaluate(()=>{
  const style=s=>{let c=getComputedStyle(document.querySelector(s));return {fg:c.color,bg:c.backgroundColor,opacity:c.opacity,outline:c.outlineColor};};
  return {body:style('body'),hint:style('.hint'),primary:style('#next'),disabled:style('#prev'),cell:style('.cell'),selected:style('.lang-toggle button.active'),link:style('.back-link'),tokens:getComputedStyle(document.documentElement).getPropertyValue('--panel2')};
 });
 function rgb(s){const a=s.match(/[\d.]+/g).map(Number);return a.slice(0,3);}
 function luminance(c){return c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){a=luminance(rgb(a));b=luminance(rgb(b));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
 const pairs={body:[colors.body.fg,colors.body.bg],mutedPanel2:[colors.hint.fg,colors.disabled.bg],primary:[colors.primary.fg,colors.primary.bg],disabled:[colors.disabled.fg,colors.disabled.bg],cell:[colors.cell.fg,colors.cell.bg],selected:[colors.selected.fg,colors.selected.bg],link:[colors.link.fg,colors.body.bg],focus:[focus.color,colors.disabled.bg]};
 const contrasts=Object.fromEntries(Object.entries(pairs).map(([k,v])=>[k,{colors:v,ratio:contrast(...v)}]));
 for(const [key,value]of Object.entries(contrasts))assert(value.ratio>=(key==='focus'?3:4.5),JSON.stringify({key,value}));
 assert.equal(colors.disabled.opacity,'1');
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.screenshot({path:path.join(OUT,'forced-colors-focus.png')});
 // Fresh context with denied storage; offline file mode source remains available.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('unavailable');}});});
 const deniedPage=await denied.newPage();deniedPage.on('pageerror',e=>errors.push(String(e)));await deniedPage.goto(BASE);await deniedPage.locator('[data-lang=zh]').click();assert.equal(await deniedPage.locator('html').getAttribute('lang'),'zh-CN');await deniedPage.locator('#next').click();
 const offline=await browser.newContext({offline:true});const filePage=await offline.newPage();filePage.on('pageerror',e=>errors.push(String(e)));await filePage.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await filePage.locator('#pythonCode').textContent(),source);assert((await filePage.locator('#progress').innerText()).length>0);
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.join(ROOT,'../style.css')).size+fs.statSync(path.join(ROOT,'style.css')).size;assert(cssBytes<25000);
 const result={status:'passed',assertions,locales:['en','zh'],allPresets:8,layout,zoom:'CSS zoom 2 at 320, 390, 1280px; real-device/browser-chrome zoom unverified',contrast:contrasts,cssBytes,focus,clipboard:'actual browser copy/read plus denied fallback',sourceDisplayDownloadParity:true,storageDenied:true,offlineFile:true,consoleErrors:errors,badAssets,externalRequests:external};
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:'passed',assertions,cssBytes,contrast:contrasts},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
