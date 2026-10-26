// EVIDENCE_DIR redirects all emitted results and screenshots.
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),fixtures=JSON.parse(fs.readFileSync(path.join(out,'oracle-fixtures.json'))),source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
for(const f of fixtures)assert.deepStrictEqual(C.trace(f.k,f.n),f.rows);
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/887/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});const page=await context.newPage(),errors=[],bad=[],records=[],selectorMetrics=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>assert(new URL(r.url()).origin===base,'external runtime request'));
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('progress').textContent.includes('0'));
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 const pairs=await page.evaluate(()=>window.LESSON_COPY);assert.equal(Object.keys(pairs).length,79);for(const v of Object.values(pairs))assert(v.length===2&&v.every(x=>typeof x==='string'&&x.length));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert((await page.locator('[data-i18n=rule]').textContent()).includes('C(m−1,e−1) + 1 + C(m−1,e)'));assert((await page.locator('[data-i18n=map1]').textContent()).includes('dp[2]=1+1+1=3'));assert((await page.locator('[data-i18n=map2]').textContent()).includes('dp[2]=2+1+1=4'));assert((await page.locator('[data-i18n=baselineRule]').textContent()).includes('min₁≤x≤h max(D(e−1,x−1), D(e,h−x))'));
  for(let preset=0;preset<C.presets.length;preset++){
   await page.locator('#preset').selectOption(String(preset));assert(await page.locator('#prev').isDisabled());
   const input=C.presets[preset],rows=C.trace(input.k,input.n);
   for(let m=0;m<rows.length;m++){
    const actual=await page.locator('#tableBody tr').evaluateAll(trs=>trs.map(tr=>[...tr.querySelectorAll('td')].map(td=>Number(td.textContent))));assert.deepStrictEqual(actual,rows.slice(0,m+1));
    if(m)assert((await page.locator('#operation').textContent()).includes(`${rows[m-1][input.k-1]}`));
    if(m<rows.length-1)await page.locator('#next').click();
   }
   assert(await page.locator('#next').isDisabled());
   const endText=await page.locator('#operation').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#operation').textContent(),endText);
   await page.locator('#reset').click();assert(await page.locator('#reset').isDisabled());await page.locator('#end').click();assert(await page.locator('#end').isDisabled());
   records.push({lang,preset,rows:rows.length,terminal:await page.locator('#decision').textContent()});
  }
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('15')&&feedback.includes('10'));assert(feedback.startsWith(pairs[i===1?'correct':'incorrect'][lang==='zh'?0:1]));
  }
  // Successful copy, then fresh sentinel before each real manual fallback copy.
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const sentinel=`887-${lang}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.realWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('test denied');};});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
  assert(await page.locator('#copyText').evaluate(el=>el===document.activeElement&&el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>{navigator.clipboard.writeText=window.realWrite;});
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 }
 // Preserve trace, prediction, reveal, disclosure, and focused locale control.
 await page.locator('#preset').selectOption('2');await page.locator('#next').click();await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#sourceDetails').evaluate(el=>el.open=true);
 const before=await page.locator('#tableBody').textContent();await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#preset').inputValue(),'2');assert.equal(await page.locator('#position').inputValue(),'1');assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(el=>el.open));assert(await page.locator('[data-lang=en]').evaluate(el=>el===document.activeElement));
 // Keyboard controls and direct scrub.
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
 await page.locator('#position').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:900});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.locator(`[data-lang=${lang}]`).click();await page.locator('#preset').selectOption('2');await page.locator('#end').click();
  const metric=await page.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:el.selectedOptions[0].textContent,width:el.clientWidth,textWidth:c.measureText(el.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font};});assert(metric.textWidth+metric.padding+20<=metric.width,JSON.stringify(metric));selectorMetrics.push({lang,width,zoom,...metric});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} ${zoom} overflow`);
  await page.locator('#preset').scrollIntoViewIfNeeded();if(width===320)await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}-selector.png`)});await page.locator('.stage').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}-trace.png`)});
  await page.locator('.table-wrap').scrollIntoViewIfNeeded();await page.locator('.table-wrap').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);assert(await page.locator('.table-wrap').evaluate(el=>el.scrollWidth<=el.clientWidth||el.scrollLeft>0));await page.locator('.table-wrap').evaluate(el=>el.scrollLeft=el.scrollWidth);await page.locator('.table-wrap').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}-table-right.png`)});await page.locator('.table-wrap').evaluate(el=>el.scrollLeft=0);await page.locator('.table-wrap').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}-table.png`)});
  // All controls have a name and >=48 CSS px height, even in disabled state.
  const controls=await page.locator('button,select').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),height:parseFloat(getComputedStyle(e).height),width:parseFloat(getComputedStyle(e).width)})));assert(controls.every(e=>e.text&&e.height>=48&&e.width>=48));
 }
 await page.evaluate(()=>document.body.style.zoom=1);for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-exercise.png`)});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-header.png`)});}await page.setViewportSize({width:1440,height:900});
 for(const a of await page.locator('a[href]').all()){
  const href=await a.getAttribute('href');if(href.startsWith('http')||await a.getAttribute('download')!==null)continue;
  const parsed=new URL(href,url),response=await context.request.get(parsed.href);assert(response.ok(),href);if(parsed.hash)assert((await response.text()).includes(`id="${parsed.hash.slice(1)}"`),href);
 }
 await page.locator('nav a[href="#step2"]').click();await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().y;return y>=50&&y<180;});const geom=await page.locator('#step2').boundingBox();assert(geom.y>=50&&geom.y<180);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#prev').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 // Contrast of actual inherited role pairs, sRGB formula, including disabled.
 const rgb=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
 function lum(hex){const x=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*x[0]+.7152*x[1]+.0722*x[2];}
 assert.equal(lum('#000000'),0);assert.equal(lum('#ffffff'),1);assert.equal(lum('#ff0000'),.2126);assert.equal(lum('#00ff00'),.7152);assert.equal(lum('#0000ff'),.0722);assert(Math.abs((lum('#747474')+.05)/.05-4.492948)<.000001);assert.equal((lum('#ffffff')+.05)/.05,21);
 const contrasts=[];for(const fg of ['text','muted','accent','accent2'])for(const bg of ['bg','panel','panel2']){const a=lum(rgb[fg]),b=lum(rgb[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);contrasts.push({fg,bg,ratio});}
 const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
 // Unavailable local storage must fall back to navigator, locale switching stays usable.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('test blocked');}});});const bp=await blocked.newPage();await bp.goto(url);await bp.locator('[data-lang=zh]').click();assert.equal(await bp.locator('html').getAttribute('lang'),'zh-CN');await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert.equal(await bp.locator('#position').inputValue(),'1');await blocked.close();
 // file:// opens with no server fetch for source or experiment.
 const offline=await browser.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#end').click();assert(await offline.locator('#next').isDisabled());await offline.close();
 assert.deepStrictEqual(errors,[]);assert.deepStrictEqual(bad,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author self-check',host:process.platform,coreTraces:fixtures.length,records,viewports:[320,390,736,1440],zooms:[1,2],zoomMechanism:'CSS zoom 1 and 2 in real Chromium; viewport reflow widths tested separately',locales:['en','zh'],clipboard:'success and real keyboard fallback, each locale with fresh verified sentinel',cssBytes,contrasts,contrastCalibration:true,selectorMetrics,errors,bad,sourceParity:true,storageBlocked:true,offline:true},null,2));
 console.log('Browser checks passed; '+records.length+' preset/locale traces; '+cssBytes+' CSS bytes.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
