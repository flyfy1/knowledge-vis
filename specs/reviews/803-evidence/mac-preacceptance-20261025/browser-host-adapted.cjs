'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18785',url=BASE+'/leetcode/803/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8'),core=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],network=[],evidence=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('request',r=>network.push(r.url()));
 await page.goto(url);await page.locator('#progress').filter({hasText:'0/1'}).waitFor();
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 async function locale(lang){await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');}
 async function frameMatch(p,k){const expected=core.trace(core.presets[p]).frames[k];for(const side of ['before','after']){const labels=await page.locator(`#${side}Grid td`).allTextContents();assert.deepEqual(labels,expected[side].grid.flatMap((row,r)=>row.map((v,c)=>v?(expected[side].seen[r][c]?'S':'U'):'·')));assert((await page.locator(`#${side}Caption`).textContent()).includes('R='+expected[side].size));}assert.equal(await page.locator('#result').textContent(),'['+expected.answer.map(v=>v===null?'?':v).join(', ')+']');}
 for(const lang of ['en','zh']){
  await locale(lang);
  await page.locator('#handReveal').click();assert(await page.locator('#hand').isVisible());assert((await page.locator('#hand').textContent()).includes('result=[2]'));await page.locator('#handReveal').click();assert(await page.locator('#hand').isHidden());
  for(let p=0;p<5;p++){
   await page.selectOption('#preset',String(p));await page.locator('#reset').evaluate(b=>{if(!b.disabled)b.click();});await frameMatch(p,0);assert(await page.locator('#prev').isDisabled());
   for(let k=1;k<=core.presets[p].hits.length;k++){await page.locator('#next').click();await frameMatch(p,k);}
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   await page.locator('#prev').click();await frameMatch(p,core.presets[p].hits.length-1);await page.locator('#next').click();await frameMatch(p,core.presets[p].hits.length);
   const state=await page.locator('#traceStage').textContent();await locale(lang==='en'?'zh':'en');await frameMatch(p,core.presets[p].hits.length);await locale(lang);assert.equal(await page.locator('#traceStage').textContent(),state);
   evidence.push({lang,p,final:await page.locator('#result').textContent(),detail:await page.locator('#detail').textContent()});
   await page.locator('#reset').click();await frameMatch(p,0);await page.locator('#end').click();await frameMatch(p,core.presets[p].hits.length);
  }
  for(const choice of ['0','1','2']){
   await page.locator(`input[value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('R=2'));await page.locator('#reveal').click();
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('6−2−1=3'));assert(feedback.startsWith(choice==='2'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Revise':'需要修正')));
   await locale(lang==='en'?'zh':'en');assert(await page.locator(`input[value="${choice}"]`).isChecked());assert((await page.locator('#feedback').textContent()).includes('6−2−1=3'));await locale(lang);
   evidence.push({lang,choice,feedback});
  }
  await page.locator('input[value="0"]').check();assert(!(await page.locator('#feedback').textContent()).includes('6−2−1=3'));
  // Native successful copy; exact string, including final newline.
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  evidence.push({lang,copyStatus:await page.locator('#copyStatus').textContent()});
  // Fresh verified sentinel before EVERY fallback attempt on this Linux browser host.
  for(let repeat=0;repeat<2;repeat++){
   const sentinel=`803-${lang}-${repeat}-${Date.now()}`;
   await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel reset failed');},sentinel);
   await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test-denied'));});
   await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
   assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
   await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   evidence.push({lang,repeat,host:process.platform,shortcut:process.platform==='darwin'?'Meta+c':'Control+c',fallbackStatus:await page.locator('#copyStatus').textContent(),sentinelVerified:true,transferExact:true});
   await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  }
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);const downloadPath=path.join(OUT,`download-${lang}.py`);await download.saveAs(downloadPath);assert.equal(fs.readFileSync(downloadPath,'utf8'),source);
 }
 // Layout, populated state, prediction, 200% browser-equivalent CSS zoom.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await locale(lang);await page.selectOption('#preset','3');await page.locator('#end').click();await page.locator('input[value="2"]').check();await page.locator('#reveal').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} ${zoom} overflow`);
  const sizes=await page.locator('button,select,.prediction-options label').evaluateAll(es=>es.map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(sizes.every(s=>s.h>=48*zoom-1),JSON.stringify(sizes));
  const tag=`${lang}-${width}-z${zoom}`;
  await page.locator('#traceStage').screenshot({path:path.join(OUT,`trace-${tag}.png`),style:'.step-nav{visibility:hidden}'});
  if(width===320&&zoom===2){
   await page.locator('#afterScroll').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await page.locator('#afterScroll').evaluate(e=>e.scrollLeft>0));
   await page.evaluate(()=>{const e=document.querySelector('.boards');window.scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20);});
   await page.screenshot({path:path.join(OUT,`zoom-viewport-${lang}.png`)});
   await page.locator('#afterScroll').evaluate(e=>e.scrollLeft=e.scrollWidth);await page.screenshot({path:path.join(OUT,`zoom-scrolled-${lang}.png`)});
  }
  if(width===320||width===1440){await page.screenshot({path:path.join(OUT,`page-${tag}.png`),fullPage:true});}
  evidence.push({lang,width,zoom,overflow:false,trace:await page.locator('#detail').textContent(),formula:await page.locator('[data-i18n=formula]').textContent()});
 }
 await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:1440,height:1000});
 // Real keyboard navigation and focus preservation across locale changes.
 await page.locator('#preset').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
 await page.locator('#reset').evaluate(b=>{if(!b.disabled)b.click();});await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/'));
 await page.locator('[data-lang=en]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');assert.equal(await page.locator('[data-lang=en]').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
 // Every local link resolves and any fragment target exists.
 const links=await page.locator('a').evaluateAll(es=>es.map(a=>a.href));
 for(const href of new Set(links)){const u=new URL(href);if(u.origin!==new URL(BASE).origin)continue;const res=await context.request.get(u.href.split('#')[0]);assert(res.ok(),href);if(u.hash){const txt=await res.text();assert(txt.includes(`id="${u.hash.slice(1)}"`),href);}}
 // Measure actual rendered foreground/background pairs, including disabled controls.
 await page.selectOption('#preset','0');
 await page.locator('[data-lang=en]').focus();
 const focusPair=await page.locator('[data-lang=en]').evaluate(e=>({selector:'active locale focus ring',fg:getComputedStyle(e).outlineColor,bg:getComputedStyle(e).backgroundColor}));
 const pairs=await page.evaluate(()=>{
  function bg(e){for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return 'rgb(13, 17, 23)';}
  return ['body','.hint','th','.brick-grid td.supported','.brick-grid td.unconnected','#prev:disabled','.lang-toggle button.active','a','pre','.readout','label','#feedback.correct','#manualSource'].flatMap(selector=>{const e=document.querySelector(selector);return e?[{selector,fg:getComputedStyle(e).color,bg:bg(e)}]:[];});
 });
 function lum(rgb){const v=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
 pairs.push(focusPair);
 for(const p of pairs){const a=lum(p.fg),b=lum(p.bg);p.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(p.ratio>=4.5,JSON.stringify(p));}
 await page.emulateMedia({forcedColors:'active'});assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).forcedColorAdjust),'auto');await page.emulateMedia({forcedColors:'none'});
 // No storage + offline page opening: all lesson assets remain local and source renders.
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});const p2=await offline.newPage();await p2.goto('file://'+path.resolve(__dirname,'../index.html'));await p2.locator('#progress').waitFor();assert.equal(await p2.locator('#pythonSource').textContent(),source);await p2.locator('[data-lang=zh]').click();assert((await p2.locator('#progress').textContent()).includes('逆序'));await offline.close();
 assert.equal(errors.length,0,errors.join('\n'));assert(network.every(u=>u.startsWith(BASE)||u.startsWith('data:')),JSON.stringify(network));
 const cssBytes=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({url,host:process.platform,clipboard:'native success and four fresh-sentinel manual transfers, exact final newline',zoomMethod:'CSS zoom 2 on html: doubles all layout/control/font sizes at each viewport',evidence,contrast:pairs,cssBytes,screenshotMethod:'Element trace captures hide sticky navigation only during capture to avoid full-element compositor overlays; zoom viewport images retain it. Native viewport screenshots verify keyboard horizontal scrolling.',errors,network:[...new Set(network)]},null,2)+'\n');
 await browser.close();console.log(`Browser self-check passed: ${evidence.length} recorded states; CSS ${cssBytes} bytes.`);
})().catch(e=>{console.error(e);process.exit(1);});
