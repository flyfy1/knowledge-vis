'use strict';
// OUTPUT_DIR redirects every screenshot/report/download. Preview server is pre-existing.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],badAssets=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badAssets.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto('http://127.0.0.1:18770/leetcode/335/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 const report={kind:'author real Chromium self-check',locales:[],presetVariants:0,screenshots:[],viewportChecks:[],consoleErrors:errors,assetErrors:badAssets,externalRequests:external};
 async function snap(name){await page.screenshot({path:path.join(out,name)});report.screenshots.push(name);}
 async function state(){return page.evaluate(()=>({frame:document.querySelector('#frameRead').textContent,plot:document.querySelector('#plot').innerHTML,coords:document.querySelector('#coordinates').textContent,conditions:document.querySelector('#conditions').textContent,result:document.querySelector('#resultRead').textContent}));}
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<7;p++)for(let length=1;length<=6;length++){
   await page.selectOption('#preset',String(p));await page.selectOption('#finalLength',String(length));
   const initial=await state();assert(await page.locator('#tracePrev').isDisabled());
   while(await page.locator('#traceNext').isEnabled())await page.locator('#traceNext').click();
   const end=await state();assert(await page.locator('#traceLast').isDisabled());
   await page.locator('#tracePrev').click();await page.locator('#traceNext').click();assert.deepEqual(await state(),end);
   await page.locator('#traceReset').click();assert.deepEqual(await state(),initial);
   await page.locator('#traceLast').click();assert.deepEqual(await state(),end);report.presetVariants++;
  }
  // Visible algorithm meaning: named case, exact inequalities, and contacted segment.
  for(const [p,kind,formula] of [[0,'A','2 ≥ 1 ∧ 1 ≤ 2'],[2,'B','1 = 1 ∧ 1 + 1 ≥ 2'],[3,'C','2 ≥ 1 ∧ 1 + 1 ≥ 2 ∧ 1 ≤ 2 ∧ 1 + 1 ≥ 2']]){
   await page.selectOption('#preset',String(p));await page.locator('#traceLast').click();
   assert((await page.locator('#resultRead').innerText()).includes(kind));assert((await page.locator('#conditions').innerText()).includes(formula));
   assert((await page.locator('#coordinates').innerText()).includes(lang==='en'?'Contacted old segment':'相交旧段'));
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());
  for(const option of [0,1,2]){
   await page.locator(`[name=prediction][value="${option}"]`).check();assert(!(await page.locator('#predictionFeedback').innerText()).includes('(−1,−2)'));
   await page.locator('#reveal').click();assert((await page.locator('#predictionFeedback').innerText()).includes('e+a=2+1≥3'));
   assert((await page.locator('#predictionFeedback').innerText()).startsWith(lang==='en'?(option===1?'Correct prediction.':'Check the closed spans again.'):(option===1?'预测正确。':'再核对闭区间。')));
  }
  await page.locator('[name=prediction][value="1"]').check();assert(!(await page.locator('#predictionFeedback').innerText()).includes('e+a='));await page.locator('#reveal').click();
  // Locale must preserve frame/selection/reveal/disclosure rather than reset.
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);
  const before=await page.evaluate(()=>({preset:preset,at:at,selected:selected,revealed:revealed,open:document.querySelector('#sourceDetails').open}));
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();
  assert.deepEqual(await page.evaluate(()=>({preset:preset,at:at,selected:selected,revealed:revealed,open:document.querySelector('#sourceDetails').open})),before);
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'copied':'已复制'));
  const dlPromise=page.waitForEvent('download');await page.locator('a[download]').click();const dl=await dlPromise;await dl.saveAs(path.join(out,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(out,`download-${lang}.py`),'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}}));
  await page.locator('#copyPython').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert.equal(await page.evaluate(()=>{const e=document.activeElement;return e.id==='manualSource'&&e.selectionEnd-e.selectionStart===e.value.length;}),true);
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'手动复制':'manually'));await page.locator(`[data-lang=${lang}]`).click();
  // Restore real clipboard for the next locale.
  await page.evaluate(()=>delete navigator.clipboard);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>{document.body.style.zoom='1';window.dispatchEvent(new Event('resize'));});
   await page.locator('.step-nav a[href="#step2"]').click();await page.locator('#plot').scrollIntoViewIfNeeded();
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert(overflow.scroll<=overflow.viewport+1,JSON.stringify({lang,width,overflow}));
   const geometry=await page.locator('#plot').boundingBox();assert(geometry.width>200&&geometry.x>=0&&geometry.x+geometry.width<=width+1);
   await snap(`trace-${lang}-${width}.png`);report.viewportChecks.push({lang,width,zoom:1,overflow:false});
   await page.evaluate(()=>{document.body.style.zoom='2';window.dispatchEvent(new Event('resize'));});
   const zoomOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);
   assert(zoomOverflow,`zoom overflow ${lang} ${width}`);
   report.viewportChecks.push({lang,width,zoom:2,overflow:false});
   if(width===1440){await page.locator('#conditions').scrollIntoViewIfNeeded();await snap(`zoom200-${lang}.png`);}
   await page.evaluate(()=>{document.body.style.zoom='1';window.dispatchEvent(new Event('resize'));});
  }
  report.locales.push(lang);
 }
 // Real keyboard actions, focus, endpoints, deep targets, and forced-colors state.
 await page.setViewportSize({width:390,height:900});await page.selectOption('#preset','0');await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert((await page.locator('#frameRead').innerText()).includes('1/4'));
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');
 await page.keyboard.press('Enter');assert(await page.locator('#tracePrev').isDisabled());
 await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('ArrowDown');assert(await page.locator('[name=prediction][value="1"]').isChecked());
 for(let i=0;i<5;i++){
  await page.locator(`.step-nav a[href="#step${i}"]`).click();const box=await page.locator(`#step${i}`).boundingBox(),nav=await page.locator('.step-nav').boundingBox();assert(box.y>=nav.y+nav.height-2);
 }
 const focus=await page.locator('#traceNext').evaluate(el=>{el.focus();const s=getComputedStyle(el);return {outline:s.outlineWidth,color:s.outlineColor};});assert.equal(focus.outline,'3px');report.focus=focus;
 const buttons=await page.locator('button').evaluateAll(els=>els.map(el=>({text:el.textContent,height:el.getBoundingClientRect().height})));assert(buttons.every(b=>b.height>=48));report.minButtonHeight=Math.min(...buttons.map(b=>b.height));
 await page.locator('#traceLast').click();await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();await page.locator('#plot').scrollIntoViewIfNeeded();await snap('forced-colors.png');await page.emulateMedia({forcedColors:'none'});await page.locator('#traceReset').click();
 await page.locator('#traceNext').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 // Measured actual computed foreground/background pairs, including disabled text.
 report.contrast=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>{const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  return [['body','body','body'],['muted','.hint','body'],['explain','.explain','body'],['readout','#frameRead','#frameRead'],['disabled','#tracePrev','#tracePrev'],['primary','#traceNext','#traceNext'],['focus','#traceNext','body'],['correct','#predictionFeedback','#predictionFeedback']].map(([name,sel,bgSel])=>{const s=getComputedStyle(document.querySelector(sel)),bg=getComputedStyle(document.querySelector(bgSel)).backgroundColor;const color=name==='focus'?s.outlineColor:s.color;return {name,color,bg,ratio:ratio(color,bg)};});
 });
 assert(report.contrast.every(x=>x.ratio>=4.5),JSON.stringify(report.contrast));
 const links=await page.locator('a[href^="#"]').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const hash of links)assert.equal(await page.locator(hash).count(),1);
 // Storage denial at initialization and source visibility without any source fetch.
 const blocked=await context.newPage();blocked.on('pageerror',e=>errors.push(e.message));
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{value:{getItem(){throw Error('denied')},setItem(){throw Error('denied')}}});});
 await blocked.route('**/solution.py',r=>r.abort());await blocked.goto('http://127.0.0.1:18770/leetcode/335/');await blocked.locator('[data-lang=zh]').click();await blocked.locator('#traceLast').click();await blocked.locator('[data-lang=en]').click();assert((await blocked.locator('#resultRead').innerText()).includes('Final result true'));assert.equal(await blocked.locator('#pythonCode').textContent(),source);await blocked.close();
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
 report.focus={outline:'3px',color:report.contrast.find(x=>x.name==='focus').color};report.keyboard='Enter, Tab, radio ArrowDown; visible 3px outline';report.storageDenied='pass';report.clipboard='real clipboard success and denied fallback in both locales';report.sourceParity='display, clipboard, manual selection, HTTP download';report.zoomMethod='CSS zoom=2 at each viewport, not OS/device zoom';
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
