/* Author browser checks. OUTPUT_DIR controls every generated artifact. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const URL=process.env.LESSON_URL||'http://127.0.0.1:18782/leetcode/132/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],bad=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18782/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:/6/}).waitFor();
 let presets=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   const total=Number(await page.locator('#position').getAttribute('max'));
   const initial=await page.locator('#matrix').innerHTML();
   for(let k=0;k<total;k++)await page.locator('#next').click();
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   assert.equal(await page.locator('#historyBody tr').count(),total);
   const terminal=await page.locator('.stage').innerHTML();
   await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('.stage').innerHTML(),terminal);
   await page.locator('#reset').click();assert.equal(await page.locator('#matrix').innerHTML(),initial);assert(await page.locator('#final').isHidden());
   await page.locator('#position').focus();await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());
   await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
   await page.locator('#end').click();assert(await page.locator('#final').isVisible());presets++;
  }
  for(const answer of ['0','1','2']){
   await page.locator(`[name=prediction][value="${answer}"]`).check();assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
   const str=await page.locator('#feedback').textContent();assert(str.includes(lang==='en'?'aa|bab':'aa|bab'));
   assert(str.startsWith(answer==='2'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Compare':'再对照')));
  }
 }
 await page.selectOption('#preset','2');await page.locator('#next').click();
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const preserved=await page.locator('#position').inputValue();
 await page.locator('[data-lang=en]').click();
 assert.equal(await page.locator('#position').inputValue(),preserved);assert(await page.locator('[value="2"][name=prediction]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 assert.equal(await page.locator('#pythonCode').textContent(),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denial');}}}));
 await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 await page.locator('[data-lang=zh]').click();assert(await page.locator('#manualCopy').isVisible());assert((await page.locator('#copyStatus').textContent()).includes('手动'));
 await page.locator('[data-lang=en]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.locator('#next').focus();const focus=await page.locator('#next').evaluate(e=>{const s=getComputedStyle(e);return {width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor};});assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 // Every standalone action/link has a 48px target; radios use their full label.
 for(const el of await page.locator('button,a,select,summary,input[type=range]').all()){if(await el.isVisible()){const box=await el.boundingBox();assert(box.height>=48,await el.textContent());}}
 // All local anchors and related destinations exist in the already running preview.
 const hrefs=await page.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
 for(const href of hrefs){if(href.startsWith('#'))assert(await page.locator(href).count());else if(!href.startsWith('https:')&&!href.endsWith('.py')){
  const url=new global.URL(href,URL);const response=await context.request.get(url.href.split('#')[0]);assert(response.ok(),href);if(url.hash)assert((await response.text()).includes(`id="${url.hash.slice(1)}"`),href);
 }}
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   await page.selectOption('#preset','2');await page.locator('#position').evaluate(e=>{e.value='7';e.dispatchEvent(new Event('input',{bubbles:true}));});
   const geom=await page.evaluate(()=>({width:document.documentElement.scrollWidth,inner:innerWidth}));assert(geom.width<=geom.inner+1,JSON.stringify(geom));
   await page.locator('#step2').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(OUT,`trace-${lang}-${width}.png`),fullPage:false});
   const cell=await page.locator('#matrix td').first().boundingBox();assert(cell.width>=30);
   await page.locator('#matrix').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.step-nav a.active')?.hash==='#step2');await page.locator('#matrix').evaluate(e=>e.scrollLeft=e.scrollWidth);
   await page.screenshot({path:path.join(OUT,`matrix-${lang}-${width}.png`)});
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.body.style.zoom='2');
  await page.locator('#step2').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(OUT,`zoom200-${lang}.png`)});await page.evaluate(()=>document.body.style.zoom='');
 }
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.setViewportSize({width:390,height:1000});for(const step of [0,1,3,4]){await page.locator(`#step${step}`).screenshot({path:path.join(OUT,`section-${step}-${lang}.png`)});}}
 // Sticky navigation target clears its nav, even after a real click.
 await page.setViewportSize({width:390,height:1000});await page.locator('.step-nav a[href="#step2"]').click();await page.waitForFunction(()=>{const a=document.querySelector('#step2').getBoundingClientRect(),b=document.querySelector('nav').getBoundingClientRect();return a.top>=b.bottom-2&&a.top<140;});
 const nav=await page.locator('nav').boundingBox(),section=await page.locator('#step2').boundingBox();assert(section.y>=nav.y+nav.height-2);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 // Storage denial does not break locale or the simulation.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('denied');}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('denied');}});});
 const p2=await denied.newPage();p2.on('pageerror',e=>errors.push(e.message));await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();assert.equal(await p2.locator('#position').inputValue(),'1');await denied.close();
 // Offline source and experiment have no fetch dependency.
 const offline=await browser.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.locator('#next').click();assert.equal(await offline.locator('#pythonCode').textContent(),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));await offline.close();
 function lum(hex){const a=hex.match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 function contrast(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const colors={bg:'0d1117',panel:'161b22',panel2:'1c2330',text:'e8edf4',muted:'9aa7b8',accent:'6ee7ff',accent2:'ffb454',good:'7ee2a8',explain:'c9d4e2',pre:'090e16',alternate:'0a0e14'};
 const ratios=[];for(const bg of ['bg','panel','panel2','alternate','pre'])for(const fg of ['text','muted','accent','accent2','good','explain']){const ratio=contrast(colors[fg],colors[bg]);assert(ratio>=4.5,`${fg}/${bg}: ${ratio}`);ratios.push({fg,bg,ratio:Number(ratio.toFixed(2))});}
 assert(contrast(colors.accent2,colors.bg)>=3);assert(contrast(colors.bg,colors.accent)>=4.5);
 const cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(cssBytes<25000);
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const results={status:'pass',presetLocalePaths:presets,widths:[320,390,736,1440],zoom:'200% CSS layout zoom in Chromium, EN and zh',keyboard:'range Home/End, language Enter, native focus outline',clipboard:'real success and forced denial; source and downloaded bytes exact',storageDenied:true,offline:true,errors,bad,external,cssBytes,contrast:ratios,limits:'Author self-check; no physical-device, native browser-chrome zoom, novice, independent review, submission or deployment claim.'};
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({...results,contrast:'30 text/surface pairs: all AA'}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
