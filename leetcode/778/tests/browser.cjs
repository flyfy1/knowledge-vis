const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/778/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const {presets,trace}=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}}),page=await ctx.newPage();
 const report={errors:[],assetErrors:[],external:[],bindings:[],layouts:[],states:0,host:process.platform};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:18770'))report.external.push(r.url());});page.on('response',r=>{if(r.status()>=400)report.assetErrors.push([r.status(),r.url()]);});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>10);
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  const titles={en:'#778 · Swim in Rising Water',zh:'#778 · 水位上升的泳池中游泳'};assert.equal(await page.locator('h1').textContent(),titles[lang]);assert.equal(await page.title(),titles[lang]);
  assert.equal(await page.locator('.formula').textContent(),'candidate = max(cost, H[v]); D[v] = min(D[v], candidate)');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',{value:String(p)});const model=trace(presets[p]);
   assert(await page.locator('#prev').isDisabled());
   for(let i=0;i<model.frames.length;i++){
    const f=model.frames[i];assert.equal(await page.locator('#terrain td.settled').count(),i);
    const vals=await page.locator('#terrain td').allTextContents();
    f.dist.flat().forEach((v,k)=>assert(vals[k].includes('D '+(v===Infinity?'∞':v))));
    report.states++;
    if(i===2){const before=await page.locator('#terrain').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#terrain').textContent(),before);}
    if(i<model.frames.length-1)await page.click('#next');
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   assert((await page.locator('#progress').textContent()).includes(String(model.result)));
   await page.click('#reset');assert.equal(await page.locator('#terrain td.settled').count(),0);
   await page.click('#end');assert.equal(await page.locator('#terrain td.settled').count(),model.frames.length-1);
  }
  await page.selectOption('#preset',{value:'1'});await page.click('#next');await page.click('#next');
  report.bindings.push({lang,state:'trap, after two removals',progress:await page.locator('#progress').textContent(),history:await page.locator('#history').textContent()});
  for(const ch of ['0','1','2']){
   await page.check(`input[name=prediction][value="${ch==='0'?'2':'0'}"]`);await page.check(`input[name=prediction][value="${ch}"]`);assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is':'答案是'));
   await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is 4':'答案是 4'));
   assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),ch==='1');
   const state=await page.locator('#terrain').textContent();
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`input[value="${ch}"]`).isChecked());assert.equal(await page.locator('#terrain td.settled').count(),2);
   assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'答案是 4':'The answer is 4'));
   await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#terrain').textContent(),state);
  }
  await page.check('input[name=prediction][value="0"]');assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is':'答案是'));
  await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();await page.click('#reset');assert.equal(await page.locator('#feedback').textContent(),feedback);
  await page.click('#handReveal');assert(await page.locator('#hand').isVisible());await page.click('#handReveal');assert(await page.locator('#hand').isHidden());
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const download=page.waitForEvent('download');await page.click('#download');const file=await download;assert.equal(fs.readFileSync(await file.path(),'utf8'),source);
 }
 // Force only automatic writing to fail; use the browser's actual keyboard copy.
 await page.evaluate(async()=>{await navigator.clipboard.writeText('778 distinct clipboard sentinel');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new Error('denied for self-check');}});});
 await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());
 assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
 await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 report.fallbackNativeClipboard=true;
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset',{value:'2'});await page.click('#next');await page.click('#next');await page.click('#next');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#terrainScroll').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const geo=await page.locator('#terrain td').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,text:e.textContent,scroll:e.scrollWidth,client:e.clientWidth};}));
   assert(geo.every(g=>g.w>=48&&g.h>=60&&g.scroll<=g.client+1));
   await page.locator('#next').focus();await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});
   await page.locator('#terrainScroll').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);assert(await page.locator('#terrainScroll').evaluate(e=>e.scrollWidth<=e.clientWidth||e.scrollLeft>0));await page.locator('#terrainScroll').evaluate(e=>e.scrollLeft=0);
   report.layouts.push({lang,width,zoom:1,geo});
  }
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#terrainScroll').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const measure=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {width:e.clientWidth,text:c.measureText(e.selectedOptions[0].text).width,pad:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)};});
   assert(measure.text+measure.pad+24<=measure.width,JSON.stringify({lang,width,measure}));
   await page.screenshot({path:path.join(out,`zoom-${lang}-${width}.png`)});report.layouts.push({lang,width,zoom:2});await page.evaluate(()=>document.documentElement.style.zoom='');
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.selectOption('#preset',{value:'0'});await page.locator('#next').focus();
 const initial=await page.locator('#progress').textContent();await page.keyboard.press('Enter');assert.notEqual(await page.locator('#progress').textContent(),initial);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 const focus=await page.locator('#reset').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 await page.click('.step-nav a[href="#step2"]');await page.waitForFunction(()=>{const y=document.querySelector('#step2').getBoundingClientRect().top;return y>=85&&y<=95;});assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=60));
 // Every local href and deep target exists, tested on served HTML.
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('https:'))continue;
  const u=new URL(href,url);const r=await ctx.request.get(u.href.split('#')[0]);assert.equal(r.status(),200,u.href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),u.href);
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
 function lum(hex){const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
 assert.equal(lum('000000'),0);assert.equal(lum('ffffff'),1);assert.equal(lum('ff0000'),.2126);assert.equal(lum('00ff00'),.7152);assert.equal(lum('0000ff'),.0722);assert(Math.abs((lum('747474')+.05)/.05-4.492948)<.000001);assert((lum('747474')+.05)/.05<4.5);report.contrastCalibration={black:0,white:1,blackWhite:21,nearThreshold:(lum('747474')+.05)/.05};report.contrast=[];for(const [a,b] of [['text','panel2'],['muted','panel2'],['muted','panel'],['muted','bg'],['accent','panel'],['accent2','panel2'],['good','panel2'],['bg','accent']]){const x=lum(colors[a].slice(1)),y=lum(colors[b].slice(1)),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);assert(ratio>=4.5);report.contrast.push({a,b,ratio});}
 report.focus=focus;report.fontStack=await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily);report.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(report.cssBytes<25000);
 const controls=await page.locator('button,select').evaluateAll(es=>es.map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert(controls.every(c=>c.h>=48));report.controls=controls;
 for(const lang of ['en','zh']){await page.setViewportSize({width:390,height:1000});await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`heading-${lang}.png`)});await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`prediction-${lang}.png`)});report.bindings.push({lang,copyStatus:await page.locator('#copyStatus').textContent(),feedback:await page.locator('#feedback').textContent()});}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage disabled');}});});const bp=await blocked.newPage();await bp.goto(url);await bp.click('[data-lang=zh]');await bp.click('#next');assert((await bp.locator('#progress').textContent()).includes('已取出 1'));await blocked.close();report.storageBlocked=true;
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await op.click('#next');await offline.close();report.offline=true;
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.assetErrors,[]);assert.deepEqual(report.external,[]);report.result='PASS';report.zoom='CSS layout zoom 200%, not native browser zoom';report.browser=await browser.version();
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,states:report.states,layouts:report.layouts.length,cssBytes:report.cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
