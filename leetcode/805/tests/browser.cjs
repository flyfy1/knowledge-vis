const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18786/leetcode/805/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),{presets,trace}=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}}),page=await ctx.newPage();
 const report={errors:[],assetErrors:[],external:[],bindings:[],layouts:[],states:0,host:process.platform,fallback:[]};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(url).origin)report.external.push(r.url());});page.on('response',r=>{if(r.status()>=400)report.assetErrors.push([r.status(),r.url()]);});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>10);
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert((await page.locator('h1').textContent()).startsWith('#805'));
  assert.equal(await page.locator('.formula').textContent(),'s/k = (S−s)/(n−k) ⇔ n·s = k·S ⇔ s = k·S/n');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',{value:String(p)});const model=trace(presets[p]);assert(await page.locator('#prev').isDisabled());
   assert((await page.locator('#presetName').textContent()).includes(String(model.result)));
   for(let i=0;i<model.frames.length;i++){
    const f=model.frames[i];
    for(const side of ['left','right'])assert.deepEqual(await page.locator(`#${side}Sets .sum-row span`).allTextContents(),f[side].map(g=>'{'+g.join(', ')+'}'));
    assert.equal(await page.locator('#history li').count(),i+1);assert((await page.locator('#progress').textContent()).includes(`${i}/${model.frames.length-1}`));
    assert.equal(await page.locator('.check.hit').count(),f.event.checks?f.event.checks.filter(c=>c.hit).length:0);
    assert.equal(await page.locator('#result').isVisible(),f.done);
    if(f.done)assert((await page.locator('#result').textContent()).includes(String(model.result)));
    if(i===2){const before=await page.locator('#traceStage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#traceStage').textContent(),before);}
    report.states++;if(i<model.frames.length-1)await page.click('#next');
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());await page.click('#reset');assert(await page.locator('#prev').isDisabled());await page.click('#end');assert(await page.locator('#next').isDisabled());
  }
  // Representative meanings: construction, unsuccessful probe, successful probe.
  await page.selectOption('#preset',{value:'0'});await page.click('#next');await page.click('#next');
  report.bindings.push({lang,state:'right [2], before adding 3',progress:await page.locator('#progress').textContent(),sets:await page.locator('#rightSets').textContent()});
  await page.click('#next');assert.deepEqual(await page.locator('#rightSets .sum-row span').allTextContents(),['{0}','{2, 3}','{5}']);
  await page.click('#next');assert((await page.locator('#result').textContent()).includes(lang==='en'?'0 + right sum 2 = 2':'0 + 右和 2 = 2'));
  report.bindings.push({lang,state:'first match i=0 j=1',result:await page.locator('#result').textContent()});await page.locator('#checks').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`match-${lang}.png`)});
  await page.selectOption('#preset',{value:'1'});await page.click('#end');report.bindings.push({lang,state:'integer target but impossible',result:await page.locator('#result').textContent()});await page.locator('#result').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`impossible-${lang}.png`)});
  for(const ch of ['0','1','2']){
   await page.check(`input[name=prediction][value="${ch==='0'?'1':'0'}"]`);await page.check(`input[name=prediction][value="${ch}"]`);
   assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is':'答案是'));await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is true':'答案是 true'));
   assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),ch==='2');
   const state=await page.locator('#leftSets').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`input[name=prediction][value="${ch}"]`).isChecked());assert.equal(await page.locator('#leftSets').textContent()===state,false);assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'答案是 true':'The answer is true'));await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#leftSets').textContent(),state);
  }
  await page.check('input[value="0"]');assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is':'答案是'));await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();await page.click('#reset');assert.equal(await page.locator('#feedback').textContent(),feedback);
  await page.click('#handReveal');assert(await page.locator('#hand').isVisible());await page.click('#handReveal');assert(await page.locator('#hand').isHidden());
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const download=page.waitForEvent('download');await page.click('#download');assert.equal(fs.readFileSync(await (await download).path(),'utf8'),source);
 }
 // Reset and verify a distinct clipboard sentinel BEFORE EACH fallback attempt.
 for(const lang of ['en','zh'])for(let attempt=0;attempt<2;attempt++){
  await page.click(`[data-lang=${lang}]`);const sentinel=`805-${lang}-${attempt}-fresh-non-source`;
  await page.evaluate(async sentinel=>{delete navigator.clipboard.writeText;await navigator.clipboard.writeText(sentinel);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new Error('forced denial');}}));
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);report.fallback.push({lang,attempt,sentinel,verified:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
 }
 await page.evaluate(()=>{delete navigator.clipboard.writeText;});
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset',{value:'5'});for(let i=0;i<8;i++)await page.click('#next');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#leftSets').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const geo=await page.locator('.sum-row').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,text:e.textContent,scroll:e.scrollWidth,client:e.clientWidth};}));assert(geo.every(g=>g.h>=48&&g.scroll<=g.client+1));
   await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});report.layouts.push({lang,width,zoom:1,geo});
  }
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>{document.documentElement.style.zoom='2';dispatchEvent(new Event('resize'));});await page.locator('#preset').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const measured=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {width:e.clientWidth,text:c.measureText(e.selectedOptions[0].text).width,pad:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)};});assert(measured.text+measured.pad+24<=measured.width);
   await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`zoom-${lang}-${width}.png`)});report.layouts.push({lang,width,zoom:2,measured});await page.locator('#leftSets').scrollIntoViewIfNeeded();assert(await page.locator('.sum-row').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)));await page.waitForTimeout(150);await page.screenshot({path:path.join(out,`zoom-sets-${lang}-${width}.png`)});await page.evaluate(()=>{document.documentElement.style.zoom='';dispatchEvent(new Event('resize'));});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.selectOption('#preset',{value:'0'});await page.locator('#next').focus();const before=await page.locator('#progress').textContent();await page.keyboard.press('Enter');assert.notEqual(await page.locator('#progress').textContent(),before);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 report.focus=await page.locator('#reset').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(report.focus.width,'3px');
 // Locale preserves focused element and snapshot, not only the rendered words.
 await page.evaluate(()=>document.querySelector('[data-lang=en]').click());assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 await page.click('.step-nav a[href="#step2"]');await page.waitForFunction(()=>{const y=document.querySelector('#step2').getBoundingClientRect().top;return y>=85&&y<=95;});assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>document.querySelector('.step-nav').getBoundingClientRect().bottom));
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('https:'))continue;const u=new URL(href,url),r=await ctx.request.get(u.href.split('#')[0]);assert.equal(r.status(),200,u.href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),u.href);
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
 function lum(hex){const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
 assert.equal(lum('000000'),0);assert.equal(lum('ffffff'),1);assert.equal(lum('ff0000'),.2126);assert(Math.abs((lum('747474')+.05)/.05-4.492948)<.000001);
 report.contrast=[];for(const [a,b] of [['text','panel2'],['muted','panel2'],['muted','panel'],['muted','bg'],['accent','panel'],['accent2','panel2'],['accent2','bg'],['good','panel'],['bg','accent']]){const x=lum(colors[a].slice(1)),y=lum(colors[b].slice(1)),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);assert(ratio>=4.5);report.contrast.push({a,b,ratio});}
 report.fontStack=await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily);
 report.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(report.cssBytes<25000);
 const controls=await page.locator('button,select').evaluateAll(es=>es.map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert(controls.every(c=>c.h>=48));report.controls=controls;
 for(const lang of ['en','zh']){await page.setViewportSize({width:390,height:1000});await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`heading-${lang}.png`)});await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`prediction-${lang}.png`)});report.bindings.push({lang,copyStatus:await page.locator('#copyStatus').textContent(),feedback:await page.locator('#feedback').textContent()});}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage disabled');}});});const bp=await blocked.newPage();await bp.goto(url);await bp.click('[data-lang=zh]');await bp.click('#next');assert((await bp.locator('#progress').textContent()).includes('已处理左半'));await blocked.close();report.storageBlocked=true;
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await op.click('#next');await offline.close();report.offline=true;
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.assetErrors,[]);assert.deepEqual(report.external,[]);report.result='PASS';report.zoom='CSS layout zoom 200%; native browser zoom/real devices untested';report.browser=await browser.version();fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,states:report.states,layouts:report.layouts.length,cssBytes:report.cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
