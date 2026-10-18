'use strict';
// NODE_PATH supplies Playwright. Outputs may be redirected without editing candidate.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const core=require('../core.js'),base=path.resolve(__dirname,'..');
const out=process.env.LESSON_OUTPUT_DIR||path.join(base,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18774')+'/leetcode/84/';
function luminance(rgb){const v=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],badAssets=[],remote=[];let operations=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)badAssets.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18774')&&!r.url().startsWith('data:'))remote.push(r.url());});
 await page.goto(url);await page.locator('#message').filter({hasText:/Start|开始/}).waitFor();
 const source=fs.readFileSync(path.join(base,'solution.py'),'utf8');
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.selectOption('#handLeft','0');await page.selectOption('#handRight','0');assert.match(await page.locator('#handResult').textContent(),/2/);
 await page.selectOption('#handRight','2');assert.match(await page.locator('#handResult').textContent(),/3/);
 await page.selectOption('#handLeft','2');await page.selectOption('#handRight','0');assert.equal(await page.inputValue('#handLeft'),'0');
 await page.selectOption('#handRight','2');
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<core.presets.length;p++){
   await page.selectOption('#preset',String(p));const expected=core.trace(core.presets[p]);
   assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   for(let i=1;i<expected.frames.length;i++){
    await page.locator('#next').click();operations++;
    assert.equal(await page.inputValue('#position'),String(i));
    assert.equal(await page.locator('#rows tr').count(),expected.frames[i].ledger.length);
    assert.match(await page.locator('#best').textContent(),new RegExp('= '+expected.frames[i].best+'(?: |（)'));
    if(i===3){const before=await page.locator('#stacks').textContent();const rect=await page.locator('#rectangle').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#stacks').textContent(),before);assert.equal(await page.locator('#rectangle').textContent(),rect);}
   }
   assert(await page.locator('#next').isDisabled());assert.match(await page.locator('#message').textContent(),new RegExp(String(expected.best)));
   for(let i=expected.frames.length-2;i>=0;i--){await page.locator('#prev').click();operations++;assert.equal(await page.inputValue('#position'),String(i));assert.equal(await page.locator('#rows tr').count(),expected.frames[i].ledger.length);}
   await page.locator('#next').click();await page.locator('#reset').click();assert.equal(await page.inputValue('#position'),'0');assert.equal(await page.locator('#rows tr').count(),0);
  }
  assert(await page.locator('#reveal').isDisabled()||await page.locator('[name=prediction]:checked').count()>0);
  for(const value of ['0','1','2']){
   await page.locator(`[name=prediction][value="${value}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert.match(await page.locator('#feedback').textContent(),value==='2'?/Correct|正确/:/Not quite|还不对/);
  }
 }
 // Preserve preset, cursor, selection, feedback, source disclosure and control focus across locale.
 await page.selectOption('#preset','1');await page.locator('#position').fill('6');await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const state=await page.evaluate(()=>({preset:document.querySelector('#preset').value,pos:document.querySelector('#position').value,radio:document.querySelector('[name=prediction]:checked').value,open:document.querySelector('#sourceDetails').open,rows:document.querySelectorAll('#rows tr').length}));
 await page.locator('[data-lang=en]').click();assert.deepEqual(await page.evaluate(()=>({preset:document.querySelector('#preset').value,pos:document.querySelector('#position').value,radio:document.querySelector('[name=prediction]:checked').value,open:document.querySelector('#sourceDetails').open,rows:document.querySelectorAll('#rows tr').length})),state);assert(await page.locator('#feedback').isVisible());
 await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 // Keyboard controls and focus outline.
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.inputValue('#position'),'7');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 const focus=await page.locator('#reset').evaluate(e=>{const s=getComputedStyle(e);return {width:s.outlineWidth,color:s.outlineColor,style:s.outlineStyle};});assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 // Successful clipboard path and exact content.
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy').click();await page.locator('#copyStatus').filter({hasText:/copied/}).waitFor();assert.match(await page.locator('#copyStatus').textContent(),/copied/);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Denial fallback and selected source parity.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('test denial'))}}));
 await page.locator('#copy').click();await page.locator('#manualCopy').waitFor();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Existing related targets resolve in actual page documents.
 for(const href of await page.locator('.related a').evaluateAll(a=>a.map(x=>x.href))){const r=await context.request.get(href.split('#')[0]);assert.equal(r.status(),200);assert((await r.text()).includes('id="'+href.split('#')[1]+'"'));}
 // Anchor navigation must reveal the target below sticky nav.
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(80);assert((await page.locator('#step2').boundingBox()).y>=70);
 // Exact rendered foreground/background colors, with inherited background resolution.
 const pairs=await page.evaluate(()=>['.explain','.hint','.step-nav a','#next','#prev','.height','.index','th','#copyStatus','#feedback','.lang-toggle button.active'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let n=e,bg='rgba(0, 0, 0, 0)';while(n&&bg==='rgba(0, 0, 0, 0)'){bg=getComputedStyle(n).backgroundColor;n=n.parentElement;}return {selector:sel,color:s.color,background:bg};}));
 const contrastResults=pairs.map(p=>({...p,ratio:contrast(p.color,p.background)}));for(const p of contrastResults)assert(p.ratio>=4.5,JSON.stringify(p));
 const focusRatio=contrast(focus.color,'rgb(28, 35, 48)');assert(focusRatio>=3);
 const rectangleBoundary=await page.locator('#chart .rectangle').evaluate(e=>{const s=getComputedStyle(e);return {border:s.borderColor,separator:s.outlineColor,shadow:s.boxShadow};});
 const rectangleContrast=contrast(rectangleBoundary.border,rectangleBoundary.separator);assert(rectangleContrast>=3);
 const disabledColors=[];await page.locator('#reset').click();for(const sel of ['#prev','#reset']){const c=await page.locator(sel).evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor};});const ratio=contrast(c.color,c.background);assert(ratio>=4.5);disabledColors.push({selector:sel,...c,ratio});}
 // Both locales, narrow + landscape + desktop; inspect populated cascade frame.
 const geometry=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:width===736?414:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#position').fill('7');await page.locator('#chart').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const bounds=await page.locator('#chart').boundingBox();assert(bounds.width>=240);const cols=await page.locator('#chart .column').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));assert(Math.max(...cols)-Math.min(...cols)<1);
  const smallest=await page.locator('#chart .height').evaluateAll(es=>Math.min(...es.map(e=>parseFloat(getComputedStyle(e).fontSize))));assert(smallest>=14);
  geometry.push({lang,width,chartWidth:bounds.width,columnWidth:cols[0]});await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});
 }
 // 200% CSS layout zoom in Chromium (full layout, not screenshot enlargement).
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:1440,height:1100});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#chart').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom-200-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='1');
 }
 // Additional evidence of complete prose, source and prediction states.
 for(const lang of ['en','zh']){await page.setViewportSize({width:390,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`header-${lang}-390.png`)});
 for(const section of ['step0','step1','step4'])await page.locator('#'+section).screenshot({path:path.join(out,`${section}-${lang}-390.png`)});
 await page.locator('[name=prediction][value="0"]').check();await page.locator('[name=prediction][value="1"]').check();assert(await page.locator('#feedback').isHidden());await page.locator('#step3').screenshot({path:path.join(out,`predict-${lang}.png`)});await page.locator('#reveal').click();await page.locator('#step3').screenshot({path:path.join(out,`reveal-${lang}.png`)});await page.locator('#stacks').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`state-${lang}-390.png`)});}
 await page.emulateMedia({forcedColors:'active'});await page.locator('#prev').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 // Local file opening + denied storage, source display remains functional without HTTP.
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});
 const local=await offline.newPage();const localErrors=[];local.on('pageerror',e=>localErrors.push(e.message));await local.goto('file://'+path.join(base,'index.html'));await local.locator('#message').waitFor();await local.locator('[data-lang=zh]').click();await local.locator('#next').click();await local.locator('[data-lang=en]').click();assert.equal(await local.inputValue('#position'),'1');assert.equal(await local.locator('#pythonCode').textContent(),source);assert.deepEqual(localErrors,[]);
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(remote,[]);
 const cssBytes=fs.statSync(path.join(base,'../style.css')).size+fs.statSync(path.join(base,'style.css')).size;assert(cssBytes<25000);
 const report={kind:'author self-check',result:'pass',url,operations,presets:9,locales:['en','zh'],geometry,zoom:'200% CSS layout zoom in real Chromium',contrastResults,disabledColors,rectangleBoundary,rectangleContrast,focus,focusRatio,cssBytes,sourceDisplayCopyDownloadExact:true,deniedClipboardFallback:true,deniedStorageAndFileOffline:true,consoleErrors:errors,assetErrors:badAssets,externalRuntimeRequests:remote};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
