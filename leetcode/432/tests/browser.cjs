const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||__dirname+'/evidence';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});let errors=[],bad=[],requests=[];
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>requests.push(r.url()));
 await page.goto('http://127.0.0.1:18770/leetcode/432/');await page.locator('#progress').filter({hasText:/0\//}).waitFor();
 const source=fs.readFileSync(root+'/solution.py','utf8');assert.equal(await page.locator('#pythonSource').textContent(),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 let checks=[],semantics=[];const presets=require(root+'/core.js').presets;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());await page.locator('#handReveal').click();assert(!await page.locator('#handAnswer').isVisible());
  for(let pre=0;pre<4;pre++){
   await page.selectOption('#preset',String(pre));assert(await page.locator('#prev').isDisabled());
   let count=0;const expected={};
   while(!await page.locator('#next').isDisabled()){
    await page.locator('#next').click();const [op,key]=presets[pre][count];if(op==='inc')expected[key]=(expected[key]||0)+1;if(op==='dec'){expected[key]--;if(!expected[key])delete expected[key];}
    const actual=await page.locator('#afterMap').innerText();const pairs=Object.keys(expected).length?Object.fromEntries(actual.split('\n').filter(Boolean).map(line=>{const [k,c]=line.split(' → ');return [k,Number(c)];})):{};assert.deepEqual(pairs,expected);
    semantics.push({lang,preset:pre,completed:count+1,operation:await page.locator('#operation').innerText(),expectedCounts:{...expected},observedLocations:actual});
    const snapshot=await page.locator('#afterBuckets').innerText();const map=await page.locator('#afterMap').innerText();const operationText=await page.locator('#operation').innerText();
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#afterBuckets').innerText(),snapshot);assert.equal(await page.locator('#afterMap').innerText(),map);assert.equal(await page.locator('#operation').innerText(),operationText);count++;
   }
   assert(await page.locator('#end').isDisabled());await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert(await page.locator('#next').isDisabled());checks.push({lang,preset:pre,operations:count});
  }
  for(const value of ['0','1','2']){
   await page.locator(`[name="prediction"][value="${value}"]`).check();const hidden=await page.locator('#feedback').innerText();assert(!hidden.includes('ant reaches')&&!hidden.includes('ant 减到'));
   await page.locator('#reveal').click();let feedback=await page.locator('#feedback').innerText();assert(feedback.includes(lang==='en'?'ant reaches 0':'ant 减到 0'));
   assert(feedback.startsWith(value==='1'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'This choice':'这个选择')));
   const progress=await page.locator('#progress').innerText();await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator(`[name="prediction"][value="${value}"]`).isChecked());assert((await page.locator('#feedback').innerText()).includes(lang==='en'?'ant 减到 0':'ant reaches 0'));await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('#progress').innerText(),progress);
  }
 }
 // Both clipboard branches, with actual browser click and controlled clipboard permission behavior.
 await ctx.grantPermissions(['clipboard-read','clipboard-write']);
 for(const lang of ['en','zh']){await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(!await page.locator('#manualCopy').isVisible());assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'Complete source copied':'已复制完整源码'));}
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));for(const lang of ['en','zh']){await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');assert.equal(await page.locator('#manualSource').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));}
 const download=await Promise.all([page.waitForEvent('download'),page.locator('[download]').click()]);assert.equal(fs.readFileSync(await download[0].path(),'utf8'),source);
 // Geometry, localized populated states, snapshots, 200% browser page scale via CSS zoom.
 let geometry=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang="${lang}"]`).click();await page.selectOption('#preset','1');for(let i=0;i<9;i++)await page.locator('#next').click();
  const data=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('button,select,.prediction-options label')].map(e=>({id:e.id,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})),buckets:[...document.querySelectorAll('.bucket')].map(e=>({w:e.clientWidth,scroll:e.scrollWidth}))}));assert(data.scroll<=width,JSON.stringify(data));assert(data.controls.every(c=>c.height>=48));assert(data.buckets.every(b=>b.scroll<=b.w));geometry.push({lang,width,...data});
  await page.locator('#afterBuckets').scrollIntoViewIfNeeded();await page.screenshot({path:out+`/${lang}-${width}.png`});
 }
 await page.setViewportSize({width:800,height:900});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#afterBuckets').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+'/zoom-200.png'});await page.evaluate(()=>document.body.style.zoom='');
 // A real keyboard traversal and activation; focus outline is computed, not inferred.
 await page.setViewportSize({width:390,height:900});await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').innerText()).includes('1/6'));await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');const focus=await page.locator('#reset').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 // Deep navigation stays below sticky nav.
 await page.locator('.step-nav a[href="#step3"]').click();await page.waitForTimeout(1200);const target=await page.locator('#step3').boundingBox(),nav=await page.locator('.step-nav').boundingBox();assert(target.y>=nav.y+nav.height-2);
 for(const a of await page.locator('a[href*="#"]').all()){const href=await a.getAttribute('href');if(href.startsWith('#'))assert(await page.locator(href).count());else{const response=await ctx.request.get(new URL(href,page.url()).href);assert(response.ok());assert((await response.text()).includes('id="'+href.split('#')[1]+'"'));}}
 await page.locator('#end').click();
 // Rendered computed color pairs and contrast, including disabled and focus.
 const colors=await page.evaluate(()=>{let result=[];for(const selector of ['body','.hint','.bucket','.bucket b','button:disabled','.btn.primary','.step-nav a','a']){let e=document.querySelector(selector);if(!e)continue;let bg=e;while(getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)'&&bg.parentElement)bg=bg.parentElement;result.push({selector,fg:getComputedStyle(e).color,bg:getComputedStyle(bg).backgroundColor});}return result;});
 function lum(s){const a=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 const contrasts=colors.map(c=>{const a=lum(c.fg),b=lum(c.bg);return {...c,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});assert(contrasts.every(c=>c.ratio>=4.5),JSON.stringify(contrasts));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')||u.startsWith('data:')));
 // Offline source rendering uses no fetch.
 const offline=await browser.newPage();await offline.goto('file://'+root+'/index.html');assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.locator('[data-lang="en"]').click();await offline.locator('#next').click();assert((await offline.locator('#progress').innerText()).includes('1/6'));await offline.close();
 // Zoom-equivalent CSS viewport/DPR check in both locales.
 await page.emulateMedia({forcedColors:'none',reducedMotion:'reduce'});await page.selectOption('#preset','1');for(let i=0;i<9;i++)await page.locator('#next').click();
 const cdp=await ctx.newCDPSession(page);await cdp.send('Emulation.setDeviceMetricsOverride',{width:400,height:450,deviceScaleFactor:2,mobile:false});
 for(const lang of ['en','zh']){await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#afterBuckets').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:out+`/zoom200-${lang}.png`});}
 await cdp.send('Emulation.clearDeviceMetricsOverride');
 for(const lang of ['en','zh'])for(const width of [320,1440]){await page.setViewportSize({width,height:1000});await page.locator(`[data-lang="${lang}"]`).click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:out+`/intro-${lang}-${width}.png`});}

 // Denied storage must still initialize and switch languages without errors.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}})});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto('http://127.0.0.1:18770/leetcode/432/');await bp.locator('[data-lang="zh"]').click();assert((await bp.locator('#progress').innerText()).includes('0/6'));await bp.locator('#next').click();await bp.locator('[data-lang="en"]').click();assert((await bp.locator('#progress').innerText()).includes('1/6'));assert.deepEqual(errors,[]);
 const a=lum(focus.color),b=lum('rgb(22, 27, 34)');focus.contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(focus.contrast>=3);
 const cssBytes=fs.statSync(root+'/local.css').size+fs.statSync(root+'/../style.css').size;assert(cssBytes<25000);
 fs.writeFileSync(out+'/browser-results.json',JSON.stringify({status:'pass',checks,semantics,geometry,contrasts,focus,cssBytes,errors,bad,localRequests:requests.length,zoom:'CSS zoom 2 at 800px plus 400 CSS pixels / DPR 2 through CDP in both locales; not OS device zoom',clipboard:'native Chromium clipboard success/readback in both locales; rejection injected for deterministic fallback',limits:'Synthetic browser checks; no actual learner or independent acceptance'},null,2));
 await browser.close();console.log('PASS browser; both locales, 4 presets, parity, geometry, keyboard, contrast');
})().catch(e=>{console.error(e);process.exit(1)});
