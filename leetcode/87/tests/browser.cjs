'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18776')+'/leetcode/87/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],remote=[],badAssets=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18776')&&!r.url().startsWith('data:'))remote.push(r.url());});
 await page.goto(url);await page.locator('#progress').filter({hasText:'ab'}).waitFor();
 const checkOverflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'document overflow');
 const state=()=>page.locator('#tables').innerText();
 const controlSizes=await page.locator('.lang-toggle button,.official-link,.btn,select,input[type=text]').evaluateAll(es=>es.map(e=>({id:e.id||e.className,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
 assert.ok(controlSizes.every(e=>e.width>=48&&e.height>=48),JSON.stringify(controlSizes));
 let navigatedFrames=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let preset=0;preset<6;preset++){
   await page.selectOption('#preset',String(preset));assert.ok(await page.locator('#prev').isDisabled());assert.ok(await page.locator('#reset').isDisabled());
   const start=await state();await page.locator('#next').click();const after=await state();assert.notEqual(start,after);
   await page.locator('#prev').click();assert.equal(await state(),start);await page.locator('#next').click();assert.equal(await state(),after);
   while(await page.locator('#next').isEnabled()){await page.locator('#next').click();navigatedFrames++;}
   assert.ok(await page.locator('#next').isDisabled());
   const expected=preset!==2&&preset!==4;
   assert.match(await page.locator('#message').innerText(),new RegExp(expected?'true':'false'));
   await page.locator('#prev').click();assert.ok(await page.locator('#next').isEnabled());await page.locator('#next').click();
   await page.locator('#reset').click();assert.equal(await state(),start);assert.ok(await page.locator('#reset').isDisabled());
  }
  // Slider, input acceptance and invalid preservation.
  await page.locator('#inputA').fill('abcd');await page.locator('#inputB').fill('badc');await page.locator('#customForm button').click();assert.equal(await page.inputValue('#preset'),'custom');
  await page.locator('#position').focus();await page.keyboard.press('End');assert.ok(await page.locator('#next').isDisabled());assert.match(await page.locator('#message').innerText(),/true/);await page.keyboard.press('Home');assert.ok(await page.locator('#prev').isDisabled());
  const valid=await page.locator('#progress').innerText();await page.locator('#inputA').fill('A');await page.locator('#customForm button').click();assert.equal(await page.locator('#progress').innerText(),valid);assert.ok(await page.locator('#validation').isVisible());
  await page.locator('#inputA').fill('');await page.locator('#customForm button').click();assert.equal(await page.locator('#progress').innerText(),valid);
  // Every prediction distractor, reveal, then changed selection clears feedback.
  for(let answer=0;answer<3;answer++){
   await page.check(`[name=prediction][value="${answer}"]`);assert.ok(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert.ok(await page.locator('#feedback').isVisible());
   assert.match(await page.locator('#feedback').innerText(),lang==='zh'?(answer===1?/判断正确/:/再检查/):(answer===1?/Correct/:/Check/));
  }
  await page.check('[name=prediction][value="1"]');await page.locator('#reveal').click();
  const pos=await page.inputValue('#position'),preset=await page.inputValue('#preset');
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  const other=lang==='en'?'zh':'en';await page.locator(`[data-lang=${other}]`).click();assert.equal(await page.inputValue('#position'),pos);assert.equal(await page.inputValue('#preset'),preset);assert.ok(await page.locator('[value="1"][name=prediction]').isChecked());assert.ok(await page.locator('#feedback').isVisible());assert.ok(await page.locator('#sourceDetails').getAttribute('open')!==null);assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),other);
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert.ok(await page.locator('#manualCopy').isHidden());
  const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 }
 // Fallback is a real denied clipboard path, with keyboard-accessible selected source.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}}));
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#copy').click();assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.evaluate(()=>document.querySelector('#copyText').selectionEnd-document.querySelector('#copyText').selectionStart),source.length);}
 // Every locale and responsive width, focused split frame and retained tables.
 await page.selectOption('#preset','0');await page.locator('#position').evaluate(e=>{e.value=Number(e.max)-1;e.dispatchEvent(new Event('input'));});
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await checkOverflow();
  await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(60);
  assert.ok(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=0));
  const geometry=await page.locator('.dp-table').first().evaluate(table=>[...table.querySelectorAll('td')].map(e=>e.getBoundingClientRect().width));assert.ok(geometry.every(x=>x>=48));
  await page.locator('#message').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});
  await page.locator('#next').focus();assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineWidth),'3px');await page.keyboard.press('Enter');assert.ok(await page.locator('#next').isDisabled());await page.locator('#prev').click();
 }
 // 200% zoom at desktop: content must reflow at half the available CSS width.
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await checkOverflow();
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#message').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`zoom-200-${lang}.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='1');
 // Measure computed text against composited ancestor backgrounds.
 const contrast=await page.evaluate(()=>{
  const parse=s=>{const m=s.match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0];};
  const composite=(fg,bg)=>{const a=fg[3]??1;return [0,1,2].map(i=>fg[i]*a+bg[i]*(1-a));};
  function background(e){const chain=[];for(let q=e;q;q=q.parentElement)chain.push(q);let bg=[255,255,255];for(const q of chain.reverse())bg=composite(parse(getComputedStyle(q).backgroundColor),bg);return bg;}
  const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
  const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const samples=[];
  for(const e of document.querySelectorAll('body *')){const cs=getComputedStyle(e);if(!e.getClientRects().length||cs.visibility==='hidden'||!Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue;const bg=background(e),fg=composite(parse(cs.color),bg);samples.push({tag:e.tagName,id:e.id,text:e.textContent.trim().slice(0,50),ratio:ratio(fg,bg),color:cs.color,bg});}
  return {minText:Math.min(...samples.map(s=>s.ratio)),samples};
 });assert.ok(contrast.minText>=4.5,JSON.stringify(contrast.samples.sort((a,b)=>a.ratio-b.ratio).slice(0,4)));
 fs.writeFileSync(path.join(out,'contrast.json'),JSON.stringify(contrast,null,2));
 // Forced colors and keyboard navigation retain a visible native focus indicator.
 await page.emulateMedia({forcedColors:'active'});await page.locator('#prev').focus();assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 // Real Tab traverses a locale control without replacing focus.
 await page.locator('.back-link').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'zh');await page.keyboard.press('Enter');assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
 // Verify internal related targets and navigation targets exist on preview.
 const links=await page.locator('.related a,.step-nav a').evaluateAll(es=>es.map(e=>e.href));for(const link of links){const u=new URL(link);const response=await context.request.get(u.origin+u.pathname);assert.ok(response.ok(),link);assert.ok((await response.text()).includes(`id="${u.hash.slice(1)}"`),link);}
 // Clipboard fallback and blocked storage on initialization, plus offline file source.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('storage blocked')};Storage.prototype.setItem=()=>{throw new Error('storage blocked')};});const bpage=await blocked.newPage();bpage.on('pageerror',e=>errors.push(e.message));await bpage.goto(url);await bpage.locator('#progress').filter({hasText:'ab'}).waitFor();await bpage.locator('[data-lang=zh]').click();assert.equal(await bpage.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#next').click();assert.match(await offline.locator('#message').innerText(),/false/);await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(badAssets,[]);
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert.ok(cssBytes<25000);
 const report={type:'author browser self-check',preview:url,locales:['en','zh'],widths:[320,390,736,1440],zoom:'200% CSS zoom at 1440px',navigatedFrames,sourceDisplayCopyDownloadParity:true,deniedClipboardFallback:true,blockedStorage:true,offlineFile:true,keyboard:true,forcedColors:true,minTextContrast:contrast.minText,cssBytes,errors,remote,badAssets};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2));console.log(report);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
