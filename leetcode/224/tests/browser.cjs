/* NODE_PATH already supplies Playwright. OUTPUT_DIR controls all generated evidence. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18794/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto('http://127.0.0.1:18794/leetcode/224/');await page.locator('#state').waitFor();
 const checks=[];const state=()=>page.locator('#state').textContent();
 const expected=[6,-5,3,23,3,0,3,2];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let i=0;i<8;i++){
   await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());let count=0;
   while(await page.locator('#next').isEnabled()){await page.locator('#next').click();count++;}
   assert((await state()).includes(`total = ${expected[i]}`));assert.equal(await page.locator('#rows tr').count(),count);
   const final=await state();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await state(),final);
   await page.locator('#reset').click();assert.equal(await page.locator('#rows tr').count(),0);assert(await page.locator('#prev').isDisabled());
   checks.push(`${lang} preset ${i}: both endpoints, rewind/replay/reset`);
  }
  assert(await page.locator('#feedback').isHidden());
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
  }
  await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
  await page.locator('#reveal').click();await page.selectOption('#preset','0');await page.locator('#next').click();
  const before=await page.locator('#position').inputValue();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await page.locator('#position').inputValue(),before);assert(await page.locator('#feedback').isVisible());assert(await page.locator('[value="0"][name=prediction]').isChecked());
  // Clear feedback for the next locale loop.
  await page.locator('[value="1"][name=prediction]').check();
 }
 // Actual browser clipboard success, then deterministic success fixture and failure fallback.
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fs.readFileSync(path.join(root,'solution.py'),'utf8'));
 await page.evaluate(()=>{window.copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copied=s;}}});});
 await page.locator('#copy').click();const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');assert.equal(await page.evaluate(()=>window.copied),source);
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Keyboard: range navigation, buttons, focus outline.
 await page.selectOption('#preset','3');await page.locator('#position').focus();await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineWidth),'3px');
 // Navigate actual deep link and verify sticky header does not obscure the heading.
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForFunction(()=>{const y=document.querySelector('#step2 h2').getBoundingClientRect().top;return y>=75&&y<260;});await page.waitForTimeout(500);const geometry=await page.locator('#step2 h2').boundingBox();assert(geometry.y>=75);
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:960});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','3');
  await page.locator('#position').evaluate(el=>{el.value='10';el.dispatchEvent(new Event('input'));});
  await page.locator('.stage').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const tokenBoxes=await page.locator('.token').evaluateAll(xs=>xs.map(x=>({w:x.getBoundingClientRect().width,h:x.getBoundingClientRect().height})));assert(tokenBoxes.every(b=>b.w>=30&&b.h>=40));
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`),fullPage:false});checks.push(`${lang} ${width}px: no overflow, populated trace screenshot`);
 }
 // Desktop browser 200% zoom equivalent: halve CSS viewport, double device scale.
 const zoomContext=await browser.newContext({viewport:{width:720,height:550},deviceScaleFactor:2});const zoomPage=await zoomContext.newPage();await zoomPage.goto('http://127.0.0.1:18794/leetcode/224/');
 for(const lang of ['zh','en']){await zoomPage.locator(`[data-lang=${lang}]`).click();await zoomPage.selectOption('#preset','3');await zoomPage.locator('#position').evaluate(e=>{e.value=10;e.dispatchEvent(new Event('input'));});await zoomPage.locator('.stage').scrollIntoViewIfNeeded();assert(await zoomPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await zoomPage.screenshot({path:path.join(out,`zoom-200-${lang}.png`)});}
 // CSS 200% zoom additionally exercises browser layout at doubled CSS size.
 await page.setViewportSize({width:1440,height:1100});
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>document.body.style.zoom='2');await page.locator('.stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`css-zoom-200-${lang}.png`)});}
 await page.evaluate(()=>document.body.style.zoom='1');
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineWidth),'3px');await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
 // Blocked storage/offline source is still usable (runtime has no fetch).
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto('http://127.0.0.1:18794/leetcode/224/');await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await blocked.setOffline(true);await bp.locator('[data-lang=en]').click();assert.equal(await bp.locator('#pythonCode').textContent(),source);
 // Verify existing related anchors via served pages, without navigating away.
 for(const href of await page.locator('.related a').evaluateAll(xs=>xs.map(a=>a.href))){const [url,hash]=href.split('#');const r=await context.request.get(url);assert(r.ok());assert((await r.text()).includes(`id="${hash}"`));}
 await page.locator('#position').focus();await page.keyboard.press('End');
 // Measure actual computed foreground/background pairs from inherited tokens.
 const contrasts=await page.evaluate(()=>{
  const rgba=c=>c.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>rgba(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const pairs=[['body','body'],['.hint','.stage'],['.readout','.readout'],['#reveal','#reveal'],['.btn:disabled','.btn:disabled'],['.token.current','.stage'],['.explain','.step'],['#feedback','#feedback']];
  return pairs.map(([fg,bg])=>{const a=getComputedStyle(document.querySelector(fg)).color;let el=document.querySelector(bg),b;while(el){b=getComputedStyle(el).backgroundColor;if(b!=='rgba(0, 0, 0, 0)')break;el=el.parentElement;}const x=lum(a),y=lum(b);return {fg,bg,color:a,background:b,ratio:(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};});
 });assert(contrasts.every(p=>p.ratio>=4.5));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({status:'pass',checks,clipboard:'actual browser write/read + success fixture + failure fallback; exact displayed/copied/downloaded parity',keyboard:'range Home/End, Enter, Tab, 3px focus',storage:'blocked, locale functional',offline:'source and controls functional',zoom:'CSS zoom 200% plus equivalent CSS viewport720 from1440 with deviceScaleFactor2',contrasts,cssBytes,errors,external},null,2));
 await browser.close();console.log('Browser self-check PASS');
})().catch(e=>{console.error(e);process.exit(1);});
