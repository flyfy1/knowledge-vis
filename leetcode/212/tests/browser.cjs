'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(OUT,{recursive:true});
const URL=process.env.LESSON_URL||'http://127.0.0.1:18791/leetcode/212/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();const errors=[],badAssets=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)badAssets.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18791')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').waitFor();
 const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);
 const results={presets:[],layouts:[],contrast:[],sourceParity:true};
 async function state(){return page.evaluate(()=>({board:document.querySelector('#board').innerHTML,trie:document.querySelector('#trie').innerHTML,path:document.querySelector('#path').textContent,found:document.querySelector('#found').textContent,event:document.querySelector('#event').textContent,history:document.querySelector('#history').innerHTML}));}
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   const initial=await state();await page.click('#next');const first=await state();await page.click('#prev');assert.deepEqual(await state(),initial);await page.click('#next');assert.deepEqual(await state(),first);
   const max=Number(await page.locator('#position').getAttribute('max'));
   for(let i=1;i<max;i++)await page.locator('#next').click();
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const expected=await page.evaluate(p=>WordSearchLesson.trace(WordSearchLesson.presets[p]).at(-1).found,p);
   assert.equal(await page.locator('#history li').count(),max);
   assert((await page.locator('#found').textContent()).includes(String(expected.length)));
   for(let i=0;i<max;i++)await page.locator('#prev').click();
   assert.deepEqual(await state(),initial);await page.click('#end');assert(await page.locator('#next').isDisabled());await page.click('#reset');assert.deepEqual(await state(),initial);
   results.presets.push({lang,p,operations:max});
  }
  assert(await page.locator('#reveal').isDisabled()||await page.locator('[name=prediction]:checked').count());
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert(await page.locator('#feedback').isVisible());
   assert((await page.locator('#feedback').textContent()).includes(lang==='en'?(i===2?'Correct prediction.':'That prediction does not hold.'):(i===2?'预测正确。':'这次预测不成立。')));
  }
 }
 // Language switch preserves selected/revealed prediction, frame and preset.
 await page.selectOption('#preset','0');await page.locator('#position').fill('8');const pos=await page.locator('#position').inputValue();
 await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#position').inputValue(),pos);assert.equal(await page.locator('[name=prediction]:checked').inputValue(),'2');assert(await page.locator('#feedback').isVisible());
 await page.locator('[data-lang=zh]').click();assert.equal(await page.locator('#position').inputValue(),pos);
 // Explicit code copy success, fallback, and downloaded bytes.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.capturedCopy=s;}}}));
 await page.click('#copy');assert.equal(await page.evaluate(()=>window.capturedCopy),source);assert(await page.locator('#manualCopy').isHidden());
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('blocked test clipboard');}}}));await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;const filename=path.join(OUT,'downloaded-solution.py');await download.saveAs(filename);assert.equal(fs.readFileSync(filename,'utf8'),source);
 await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
 // Keyboard focus is visible and native controls respond to keys.
 await page.locator('#next').focus();assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
 const focus=await page.locator('#next').evaluate(el=>({outline:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert.equal(focus.outline,'3px');
 const before=Number(await page.locator('#position').inputValue());await page.keyboard.press('Enter');assert.equal(Number(await page.locator('#position').inputValue()),before+1);
 await page.locator('#position').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());
 // Locale keeps clipboard fallback and its localized recovery label.
 await page.locator('[data-lang=en]').click();assert((await page.locator('#copyStatus').textContent()).startsWith('Automatic copy unavailable'));assert(await page.locator('#manualCopy').isVisible());
 // Click a real sticky deep link and verify the target clears the navigation.
 await page.locator('nav a[href="#step2"]').click();await page.waitForFunction(()=>Math.abs(document.querySelector('#step2').getBoundingClientRect().top-72)<4);assert(await page.locator('nav a[href="#step2"]').getAttribute('aria-current')==='step');
 // Check all internal fragment targets via HTTP and DOMParser.
 const links=await page.locator('a[href]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')).filter(x=>x.includes('#')));
 for(const href of links){const target=new global.URL(href,URL),response=await page.request.get(target.href.split('#')[0]);assert(response.ok(),href);const html=await response.text();assert(html.includes('id="'+target.hash.slice(1)+'"'),href);}
 // Every layout uses a dense populated state including rejection/reuse history.
 for(const width of [320,390,736,1440])for(const lang of ['zh','en']){
  await page.setViewportSize({width,height:950});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#position').fill('6');
  await page.locator('#board').scrollIntoViewIfNeeded();
  const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,cells:[...document.querySelectorAll('.cell')].map(c=>({w:c.getBoundingClientRect().width,h:c.getBoundingClientRect().height,overflow:c.scrollWidth>c.clientWidth}))}));
  assert(!geometry.overflow,JSON.stringify({width,lang,geometry}));assert(geometry.cells.every(c=>c.w>=42&&!c.overflow));
  await page.locator('.stage').screenshot({path:path.join(OUT,`lab-${width}-${lang}.png`),style:'.step-nav{visibility:hidden}'});
  results.layouts.push({width,lang,...geometry});
 }
 // 200% equivalent CSS viewport/device scale, then explicit CSS zoom reflow.
 const zoomContext=await browser.newContext({viewport:{width:640,height:900},deviceScaleFactor:2});const zoom=await zoomContext.newPage();await zoom.goto(URL);await zoom.selectOption('#preset','1');await zoom.locator('#position').fill('6');
 for(const lang of ['en','zh']){await zoom.locator(`[data-lang=${lang}]`).click();await zoom.locator('.stage').screenshot({path:path.join(OUT,`zoom200-${lang}.png`),style:'.step-nav{visibility:hidden}'});assert(await zoom.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await zoomContext.close();
 const enlarged=await context.newPage();await enlarged.setViewportSize({width:1280,height:1000});await enlarged.goto(URL);await enlarged.evaluate(()=>document.documentElement.style.zoom='2');await enlarged.selectOption('#preset','1');await enlarged.locator('#position').fill('6');
 for(const lang of ['en','zh']){await enlarged.locator(`[data-lang=${lang}]`).click();assert(await enlarged.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await enlarged.locator('.lab-grid').screenshot({path:path.join(OUT,`css-zoom200-${lang}.png`),style:'.step-nav{visibility:hidden}'});}
 await enlarged.close();
 // Measure actual rendered text/background pairs, including disabled controls.
 results.contrast=await page.evaluate(()=>{
  function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(a){return a.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}const pairs=new Map();
  for(const el of document.querySelectorAll('body *')){
   if(!el.checkVisibility()||!Array.from(el.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue;
   let parent=el,bg;while(parent){const c=getComputedStyle(parent).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){bg=c;break;}parent=parent.parentElement;}
   if(!bg)continue;const fg=getComputedStyle(el).color,a=lum(rgb(fg)),b=lum(rgb(bg)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);pairs.set(fg+' / '+bg,{fg,bg,ratio});
  }return [...pairs.values()];
 });assert(results.contrast.every(x=>x.ratio>=4.5),JSON.stringify(results.contrast));
 assert.equal(errors.length,0,errors.join('\n'));assert.equal(badAssets.length,0,JSON.stringify(badAssets));assert.equal(external.length,0,external.join('\n'));
 // Storage denied and file:// source display do not rely on fetch.
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied storage test');}});});const local=await offline.newPage();const localErrors=[];local.on('pageerror',e=>localErrors.push(e.message));await local.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await local.locator('#pythonCode').textContent(),source);await local.locator('[data-lang=zh]').click();await local.click('#end');assert(await local.locator('#next').isDisabled());assert.equal(localErrors.length,0);await offline.close();
 results.errors=errors;results.assetErrors=badAssets;results.externalRequests=external;results.focus=focus;results.storageDeniedOffline=true;results.status='passed author browser self-check';
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({status:results.status,presets:results.presets.length,layouts:results.layouts.length,contrastMin:Math.min(...results.contrast.map(x=>x.ratio))}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
