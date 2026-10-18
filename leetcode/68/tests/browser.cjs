// Run against the already-running preview. Output can be redirected without editing candidate.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18772/leetcode/68/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const page=await context.newPage();let errors=[],bad=[],checks=0;
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});
 await page.goto(base);await page.locator('#next').waitFor();
 const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);checks++;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   let steps=0;
   while(await page.locator('#next').isEnabled()){
    await page.locator('#next').click();steps++;
    const after=await page.locator('#message').textContent(),hist=await page.locator('#history').textContent();
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#message').textContent(),after);assert.equal(await page.locator('#history').textContent(),hist);
   }
   assert(steps>0);assert(await page.locator('#next').isDisabled());
   const n=await page.locator('#position').getAttribute('max');assert.equal(await page.locator('#position').inputValue(),n);
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#history').textContent(),'');checks++;
  }
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'C is correct':'正确是 C'));
   const feedback=await page.locator('#feedback').textContent();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${i}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#feedback').textContent(),feedback);checks++;
  }
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});await page.selectOption('#preset','3');
   await page.locator('#position').fill(await page.locator('#position').getAttribute('max'));
   await page.locator('#step2').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:true});checks++;
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.selectOption('#preset','0');await page.locator('#next').click();
 const before=await page.locator('#position').inputValue();await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#position').inputValue(),before);
 await page.locator('#width').fill('7');assert.equal(await page.locator('#position').inputValue(),'0');assert.equal(await page.locator('#widthValue').textContent(),'7');
 await page.locator('#width').fill('100');await page.locator('#width').fill('4');assert.equal(await page.locator('#widthValue').textContent(),'4');
 // Real keyboard focus and range navigation.
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');
 await page.locator('#position').focus();await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
 await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');checks++;
 await page.evaluate(()=>{window.__copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}});});await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.__copied),source);assert(await page.locator('#manualCopy').isHidden());
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 const selected=await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart);assert.equal(selected,source.length);
 for(const lang of ['zh','en']){await page.locator(`[data-lang=${lang}]`).click();assert((await page.locator('#copyStatus').textContent()).length>10);}
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);checks++;
 // Both locales at 200% zoom, using CSS zoom with narrow viewport; retain evidence.
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step2').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`),fullPage:true});}await page.evaluate(()=>document.documentElement.style.zoom='');
 // Deep navigation geometry and existing related anchors.
 await page.setViewportSize({width:390,height:900});await page.locator('.step-nav a[href="#step4"]').click();await page.waitForTimeout(500);assert((await page.locator('#step4').boundingBox()).y>=60);
 const links=await page.locator('.related a').evaluateAll(a=>a.map(x=>x.href));for(const link of links){const r=await context.request.get(link.split('#')[0]);assert(r.ok());assert((await r.text()).includes('id="'+link.split('#')[1]+'"'));}checks++;
 // Nominal colors are read from rendered elements, then measured with WCAG luminance.
 const pairs=await page.evaluate(()=>{
  const styles=[['body','body'],['.hint','.stage'],['#message','#message'],['#next','#next'],['#prev','#prev'],['.lang-toggle button.active','.lang-toggle button.active']];
  return styles.map(([s,b])=>({selector:s,fg:getComputedStyle(document.querySelector(s)).color,bg:getComputedStyle(document.querySelector(b)).backgroundColor}));
 });
 function lum(c){let a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 for(const p of pairs){p.ratio=(Math.max(lum(p.fg),lum(p.bg))+.05)/(Math.min(lum(p.fg),lum(p.bg))+.05);assert(p.ratio>=4.5,JSON.stringify(p));}
 const focus={fg:'rgb(255, 180, 84)',bg:'rgb(28, 35, 48)'};focus.ratio=(lum(focus.fg)+.05)/(lum(focus.bg)+.05);assert(focus.ratio>=3);
 const cssBytes=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(cssBytes<25000);
 const controls=await page.locator('button,select').evaluateAll(es=>es.map(e=>({id:e.id||e.textContent,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})));assert(controls.every(c=>c.height>=48&&c.width>=48));
 // Storage denial must degrade to memory without console/page errors.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const d=await denied.newPage();d.on('pageerror',e=>errors.push(e.message));await d.goto(base);await d.locator('[data-lang=zh]').click();assert.equal(await d.locator('html').getAttribute('lang'),'zh-CN');await denied.close();checks++;
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({status:'passed',checks,errors,badResponses:bad,contrast:pairs,focus,cssBytes,controls,viewports:[320,390,736,1440],locales:['en','zh'],zoom:'200% CSS zoom',note:'Author self-check, not independent review or physical device testing.'},null,2));
 console.log('Browser checks passed: '+checks);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
