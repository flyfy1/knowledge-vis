const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),out=process.env.OUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18781/leetcode/127/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});const page=await ctx.newPage();const errors=[];const bad=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});
 await page.goto(base);await page.locator('#progress').waitFor();
 const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);
 const snapshot=()=>page.locator('#layers').innerHTML();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const initial=await snapshot();
   if(p===2){assert(await page.locator('#next').isDisabled());assert((await page.locator('#event').textContent()).includes('0'));continue;}
   await page.locator('#next').click();const once=await snapshot();await page.locator('#prev').click();assert.equal(await snapshot(),initial);await page.locator('#next').click();assert.equal(await snapshot(),once);
   while(await page.locator('#next').isEnabled())await page.locator('#next').click();
   assert(await page.locator('#end').isDisabled());
   const result=await page.locator('#event').textContent();assert(result.includes(String([3,5,0,0,2,5][p])));
   await page.locator('#reset').click();assert.equal(await snapshot(),initial);await page.locator('#end').click();assert.equal(await page.locator('#event').textContent(),result);
   await page.locator('#position').fill('0');assert.equal(await snapshot(),initial);
  }
  assert(await page.locator('#reveal').isDisabled());
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());assert((await page.locator('#feedback').textContent()).includes('tex'));
  }
  await page.locator('[name=prediction][value="1"]').check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
  await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#sourceDetails summary').click();
  const before=await snapshot();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await page.locator('#position').inputValue(),'1');assert(await page.locator('[value="1"][name=prediction]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await snapshot(),before);
  await page.locator('#sourceDetails summary').click();
  // Reset only prediction state via page reload for the next locale's initial-state assertions.
  if(lang==='en'){await page.reload();await page.locator('#progress').waitFor();}
 }
 // Copy success with captured exact payload, then clipboard-denied manual fallback.
 await page.evaluate(()=>{window.copiedPayload=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedPayload=text;}}});});
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.copiedPayload),source);assert(await page.locator('#manualCopy').isHidden());
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'prev');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
 const focus=await page.locator('#next').evaluate(e=>{const s=getComputedStyle(e);return {style:s.outlineStyle,width:s.outlineWidth,color:s.outlineColor}});assert.equal(focus.width,'3px');
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#end').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${width} overflow`);
  for(const a of await page.locator('.step-nav a').all()){
   await a.click();const y=await page.locator(await a.getAttribute('href')).evaluate(e=>e.getBoundingClientRect().top);assert(y>=55&&y<180,`anchor y=${y}`);
  }
  await page.locator('#step1').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:true});await page.locator('#layers').screenshot({path:path.join(out,`${lang}-${width}-layers.png`)});
 }
 // CSS zoom exercises 200% scale; 720 CSS viewport also exercises desktop browser zoom reflow.
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#step1').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom-200-${lang}.png`),fullPage:true});await page.evaluate(()=>document.body.style.zoom='');}
 await page.setViewportSize({width:720,height:550});await page.locator('#step1').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'zoom-reflow.png')});
 // Related and step anchors resolve; every local href has a valid target.
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.href));for(const href of links){const u=new URL(href);if(u.origin!==new URL(base).origin)continue;const response=await ctx.request.get(u.origin+u.pathname);assert(response.ok(),href);if(u.hash){assert((await response.text()).includes(`id="${u.hash.slice(1)}"`),href);}}
 const cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(cssBytes<25000);
 const pairs=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return ['--text','--muted','--accent','--accent2'].flatMap(f=>['--bg','--panel','--panel2'].map(b=>({f,b,fg:s.getPropertyValue(f).trim(),bg:s.getPropertyValue(b).trim()})));});
 function lum(hex){const a=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
 const rendered=await page.evaluate(()=>['.explain','.hint','.word','.readout','.btn:disabled','.lang-toggle button.active','.step-nav a.active','pre'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let p=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {sel,fg:s.color,bg,opacity:s.opacity};}));
 function rgbLum(rgb){const a=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
 const renderedContrast=rendered.map(p=>({...p,ratio:(Math.max(rgbLum(p.fg),rgbLum(p.bg))+.05)/(Math.min(rgbLum(p.fg),rgbLum(p.bg))+.05)}));assert(renderedContrast.every(p=>p.ratio>=4.5&&p.opacity==='1'));
 const targetSizes=await page.locator('.btn,select,.lang-toggle button,.step-nav a,.back-link,.official-link,.related a').evaluateAll(es=>es.map(e=>({label:e.textContent,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));assert(targetSizes.every(e=>e.width>=48&&e.height>=48));
 const contrast=pairs.map(p=>({...p,ratio:(Math.max(lum(p.fg),lum(p.bg))+.05)/(Math.min(lum(p.fg),lum(p.bg))+.05)}));assert(contrast.every(p=>p.ratio>=4.5));
 // No local storage and no network still permits locale, trace and source from mirrors.
 const off=await browser.newContext();await off.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});const op=await off.newPage();await op.goto(base);await op.locator('#progress').waitFor();await off.setOffline(true);await op.locator('[data-lang=zh]').click();await op.locator('#end').click();assert.equal(await op.locator('#pythonCode').textContent(),source);assert((await op.locator('#event').textContent()).includes('3'));await off.close();
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({status:'pass',locales:['en','zh'],presets:6,widths:[320,390,736,1440],zoom:'200% CSS + 720px reflow',sourceParity:'display/copy/fallback/download match solution.py',errors,bad,cssBytes,focus,contrast,renderedContrast,targetSizes,checks:['all snapshots forward/back/reset/end/range','all prediction choices/reveal/change','locale preserves trace/choice/reveal/disclosure','clipboard success/denial','keyboard Enter/focus','local href anchors','blocked storage/offline interactions','forced colors/reduced motion']},null,2));
 await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
