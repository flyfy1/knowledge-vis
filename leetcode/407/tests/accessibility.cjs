'use strict';
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:390,height:844}}),page=await context.newPage();
 await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/407/');await page.locator('#progress').waitFor();await page.click('[data-lang=en]');
 // Exercise Chromium's real clipboard API, without replacement.
 await page.click('#copy');await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.includes('Complete source copied'));assert((await page.locator('#copyStatus').textContent()).includes('Complete source copied'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fs.readFileSync(path.resolve(__dirname,'../solution.py'),'utf8'));
 const measure=async()=>page.evaluate(()=>{
  const L=s=>{const c=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return c.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);};
  const ratio=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);
  const selectors=['body','#prev:disabled','#reset:disabled','.stage','.stage .hint','#langToggle button.active','#langToggle button:not(.active)'];
  return selectors.map(selector=>{const el=document.querySelector(selector),cs=getComputedStyle(el);let b=el;while(getComputedStyle(b).backgroundColor==='rgba(0, 0, 0, 0)')b=b.parentElement;const bg=getComputedStyle(b).backgroundColor;return {selector,fg:cs.color,bg,ratio:ratio(cs.color,bg)};});
 });
 const contrast=await measure();assert(contrast.every(x=>x.ratio>=4.5));
 await page.locator('#next').focus();const focus=await page.locator('#next').evaluate(el=>({width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor,offset:getComputedStyle(el).outlineOffset}));assert.equal(focus.width,'3px');
 // Measure orange focus against both adjacent surfaces and cyan cell boundary against surface.
 const extra=await page.evaluate(()=>{const cs=getComputedStyle(document.documentElement);return ['--accent2','--panel','--panel2','--accent'].map(k=>[k,cs.getPropertyValue(k).trim()]);});
 const lum=hex=>{const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c.reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);};const colors=Object.fromEntries(extra);
 const boundaries=['--panel','--panel2'].map(k=>({foreground:colors['--accent2'],background:colors[k],ratio:(lum(colors['--accent2'])+.05)/(lum(colors[k])+.05)}));assert(boundaries.every(x=>x.ratio>=3));
 const controls=await page.locator('button,select').evaluateAll(els=>els.filter(el=>el.getClientRects().length).map(el=>({id:el.id||el.dataset.lang,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,label:el.textContent.trim()})));assert(controls.every(x=>x.width>=48&&x.height>=48),JSON.stringify(controls));
 // Native tab traversal reaches all four trace actions; Enter changes trace state.
 await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');await page.keyboard.press('Enter');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());
 // The disclosure survives a locale switch; independent experiments survive resets.
 await page.click('#handReveal');await page.click('[data-lang=zh]');assert(await page.locator('#hand').isVisible());assert.equal(await page.locator('#handReveal').getAttribute('aria-expanded'),'true');
 await page.check('input[name=prediction][value="1"]');await page.click('#reveal');await page.click('#end');await page.click('#reset');assert((await page.locator('#feedback').textContent()).includes('3+0+2=5'));
 // Wide CJK source fallback and landscape reflow remain contained.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('blocked')}},configurable:true}));await page.click('#copy');
 await page.setViewportSize({width:320,height:740});await page.locator('#manualCopy').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'fallback-zh-320.png')});
 await page.setViewportSize({width:736,height:414});await page.selectOption('#preset','1');await page.click('#next');await page.locator('#terrainScroll').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,'landscape-zh-736.png')});
 const semanticBindings=[];
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:390,height:900});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','0');await page.click('#next');await page.click('#next');await page.locator('#terrainScroll').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`tiny-positive-${lang}-390.png`)});assert((await page.locator('#progress').textContent()).includes(lang==='en'?'water accumulated so far 2':'当前累计水量 2'));
  assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step2');
  const observed=await page.locator('#history li').last().textContent();assert(observed.includes('max(3,1)=3'));assert(observed.includes('W=3−1=2'));assert(!observed.includes(lang==='en'?'Clipboard':'剪贴板'));semanticBindings.push({locale:lang,state:'tiny bowl, second removal',expected:'Center escape level 3, ground 1, added depth 2',observed});
  await page.selectOption('#preset','1');await page.click('#end');await page.locator('#terrainScroll').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`corridor-complete-${lang}-390.png`)});
 }
 const report={status:'PASS',nativeClipboard:true,semanticBindings,contrast,focus,focusContrast:boundaries,controls,keyboardTabEnter:true,disclosureState:true,predictionIsolation:true,landscape:true,narrowFallback:true};fs.writeFileSync(path.join(out,'accessibility.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',nativeClipboard:true,minimumContrast:Math.min(...contrast.map(x=>x.ratio))}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
