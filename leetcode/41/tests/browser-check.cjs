const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),evidence=path.join(root,'evidence');
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const luminance=rgb=>{const a=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true});
 const page=await context.newPage(),errors=[],checks=[],layouts=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto('http://127.0.0.1:18770/leetcode/41/');await page.waitForFunction(()=>window.lessonSnapshot);
 const snapshot=()=>page.evaluate(()=>lessonSnapshot());
 const seek=async value=>page.locator('#position').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},value);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang="${lang}"]`);
  for(let preset=0;preset<4;preset++){
   await page.selectOption('#preset',String(preset));assert.equal((await snapshot()).index,0);assert.ok(await page.locator('#prev').isDisabled());
   await page.click('#next');const first=await snapshot();await page.click('#prev');await page.click('#next');assert.deepEqual(await snapshot(),first);
   await seek(first.frames-1);assert.ok(await page.locator('#next').isDisabled());assert.equal((await snapshot()).frame.result,[2,3,1,4][preset]);
   await page.click('#prev');assert.ok(await page.locator('#result').isHidden());await page.click('#next');assert.ok(await page.locator('#result').isVisible());
   await page.click('#reset');assert.equal((await snapshot()).index,0);
  }
  checks.push(`${lang}: all presets, rewind/replay, endpoints, reset, result visibility`);
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert.equal((await snapshot()).revealed,false);
   await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert.equal((await snapshot()).revealed,true);
   assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),choice===1);
   const before=await snapshot();await page.click(`[data-lang="${lang==='en'?'zh':'en'}"]`);assert.deepEqual(await snapshot(),before);await page.click(`[data-lang="${lang}"]`);
  }
  checks.push(`${lang}: all prediction choices, reveal Enter, stale feedback clearing, locale preservation`);
  await page.selectOption('#preset','0');await seek(4);
  await page.locator('#beforeDetails').evaluate(e=>e.open=true);
  await page.locator('#operation').evaluate(e=>e.closest('details').open=true);
  await page.locator('#history').evaluate(e=>e.closest('details').open=true);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   const geometry=await page.evaluate(()=>{
    const r=e=>{const b=e.getBoundingClientRect();return {x:b.x,right:b.right,width:b.width}};
    return {overflow:document.documentElement.scrollWidth>innerWidth,labels:[...document.querySelectorAll('#state dt')].map(r),values:[...document.querySelectorAll('#state dd')].map(r),cells:[...document.querySelectorAll('#diagram .trace-cell')].map(r),colors:[...document.querySelectorAll('#diagram .hot small,#beforeDiagram .hot small')].map(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e.parentElement).backgroundColor}))};
   });
   assert.equal(geometry.overflow,false);geometry.labels.forEach((l,i)=>assert.ok(l.right<=geometry.values[i].x));
   geometry.cells.forEach(c=>{assert.ok(c.width>=33);assert.ok(c.x>=0&&c.right<=width)});
   const ratios=geometry.colors.map(c=>(Math.max(luminance(c.fg),luminance(c.bg))+.05)/(Math.min(luminance(c.fg),luminance(c.bg))+.05));assert.ok(ratios.every(r=>r>=7));
   await page.locator('#diagram').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(evidence,`${lang}-${width}-diagram.png`)});
   layouts.push({lang,width,geometry,ratios});
  }
  await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#state').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(evidence,`${lang}-zoom200.png`)});
  await page.click('#prev');await page.click('#next');assert.equal((await snapshot()).index,4);await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.setViewportSize({width:390,height:844});await page.click('#reset');await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal((await snapshot()).index,1);
  await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal((await snapshot()).index,0);
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal((await snapshot()).index,1);
  assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  await seek(2);const skip=await snapshot();assert.deepEqual(skip.frame.state,{op_i:0,swap_to:null});assert.equal(await page.locator('#state dd').last().innerText(),'∅');
  assert.ok((await page.locator('#markerLegend').innerText()).includes('target'));
  await page.locator('#state').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(evidence,`${lang}-skip-state.png`)});
  const before=await snapshot();await page.click(`[data-lang="${lang==='en'?'zh':'en'}"]`);assert.deepEqual(await snapshot(),before);await page.click(`[data-lang="${lang}"]`);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.evaluate(()=>{window.copiedSource=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copiedSource=s}}})});
  await page.click('#copy');assert.equal(await page.evaluate(()=>window.copiedSource),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.click('#copy');
  assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
  const downloaded=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloaded;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  const response=await context.request.get('http://127.0.0.1:18770/leetcode/41/solution.py');assert.equal(await response.text(),source);
  await page.screenshot({path:path.join(evidence,`${lang}-copy-fallback.png`)});
  checks.push(`${lang}: marker semantics at skip, locale after interaction, keyboard slider/rewind/next, visible focus, display/clipboard/fallback/download parity, 200% CSS zoom`);
 }
 // Direct local-file opening exercises the offline mirror without HTTP source fetches.
 const offline=await context.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>window.lessonSnapshot);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();checks.push('Offline file page source parity');
 const denied=await context.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied')}})});await denied.goto('http://127.0.0.1:18770/leetcode/41/');await denied.waitForFunction(()=>window.lessonSnapshot);await denied.click('[data-lang="zh"]');await denied.click('#next');assert.equal(await denied.evaluate(()=>lessonSnapshot().index),1);await denied.close();checks.push('Denied localStorage preserves initialization, locale and next');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(evidence,'browser.json'),JSON.stringify({checks,layouts,errors,zoom:'200% CSS zoom/reflow; native browser toolbar zoom not tested'},null,2)+'\n');
 console.log(`${checks.length} browser check groups passed; 8 locale/width layouts; zero page/network errors`);await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
