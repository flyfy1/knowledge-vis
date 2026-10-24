const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/352/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const presets=[[4,6,5,5,9,8,7],[1,3,7,2,6],[5,4,6,2],[0,10000,9999,1,0],[]];
function oracle(values){const seen=new Set(values),result=[];let start=null;for(let x=0;x<=10001;x++){if(seen.has(x)&&start===null)start=x;else if(!seen.has(x)&&start!==null){result.push([start,x-1]);start=null;}}return result;}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[],assets=[],semantics=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);assets.push(r.url());});
 await page.goto(url);await page.locator('#progress').filter({hasText:/0\/7/}).waitFor();
 const snapshot=()=>page.locator('#step2 .stage').innerText();
 async function checkRanges(values){const got=await page.locator('#after .range').allTextContents();assert.deepEqual(got,oracle(values).map(r=>`[${r}]`));}
 for(const lang of ['en','zh']){
  await page.click(`[data-lang="${lang}"]`);
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));const values=presets[p],states=[await snapshot()];
   assert.equal(await page.locator('#tracePrev').isDisabled(),true);
   for(let i=0;i<values.length;i++){await page.click('#traceNext');await checkRanges(values.slice(0,i+1));states.push(await snapshot());}
   assert.equal(await page.locator('#traceNext').isDisabled(),true);assert.equal(await page.locator('#traceLast').isDisabled(),true);
   for(let i=values.length-1;i>=0;i--){await page.click('#tracePrev');assert.equal(await snapshot(),states[i]);}
   if(values.length){await page.click('#traceLast');assert.equal(await snapshot(),states.at(-1));await page.click('#traceReset');assert.equal(await snapshot(),states[0]);}
   semantics.push({lang,preset:p,forwardBackwardResetEnd:'pass'});
  }
  await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.click('#traceNext');
  assert.match(await page.locator('#reason').innerText(),lang==='en'?/Bridge/:/桥接/);
  semantics.push({lang,action:'insert 5 after 4,6',observed:await page.locator('#reason').innerText()});
  await page.click('#traceNext');assert.match(await page.locator('#reason').innerText(),lang==='en'?/Duplicate/:/重复/);
  await page.selectOption('#preset','2');await page.click('#traceNext');await page.click('#traceNext');
  assert.match(await page.locator('#reason').innerText(),lang==='en'?/Right only/:/只接右边/);
  await page.click('#traceNext');assert.match(await page.locator('#reason').innerText(),lang==='en'?/Left only/:/只接左边/);
  await page.click('#quizReset');assert.ok(await page.locator('#reveal').isDisabled());
  for(const value of ['left','bridge','all']){
   await page.check(`[name="prediction"][value="${value}"]`);assert.match(await page.locator('#feedback').innerText(),lang==='en'?/not yet/:/尚未/);
   await page.click('#reveal');const text=await page.locator('#feedback').innerText();assert.ok(text.includes('[[10,16],[20,20]]'));assert.ok(text.includes('17'));
   assert.match(text,lang==='en'?(value==='bridge'?/^Correct/:/^Check/):(value==='bridge'?/^正确/:/^再检查/));semantics.push({lang,answer:value,observed:text});
  }
  await page.click('#quizReset');assert.ok(await page.locator('#reveal').isDisabled());
  await page.click('#handReveal');assert.equal(await page.locator('#handAnswer').isVisible(),true);await page.click('#handReveal');assert.equal(await page.locator('#handAnswer').isVisible(),false);
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copyPython');await page.waitForFunction(expected=>document.getElementById('copyStatus').textContent===expected,lang==='en'?'Complete source copied.':'已复制完整源码。');assert.match(await page.locator('#copyStatus').innerText(),lang==='en'?/copied/:/已复制/);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('test denied'))}}));
  await page.click('#copyPython');await page.locator('#sourceFallback').waitFor({state:'visible'});assert.ok(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');
  assert.equal(await page.locator('#manualSource').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
  semantics.push({lang,action:'clipboard denied',observed:await page.locator('#copyStatus').innerText()});
  await page.evaluate(()=>delete navigator.clipboard);
 }
 // Switch locale with state and focus intact, including revealed quiz and fallback.
 await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.click('#traceNext');
 await page.check('[name="prediction"][value="bridge"]');await page.click('#reveal');
 await page.click('[data-lang="en"]');await page.locator('[data-lang="zh"]').focus();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'zh');assert.equal(await page.locator('[name="prediction"]:checked').inputValue(),'bridge');assert.match(await page.locator('#feedback').innerText(),/^正确/);await checkRanges([4,6,5]);
 // Download exact bytes.
 const downloadPromise=page.waitForEvent('download');await page.click('#download');const download=await downloadPromise;const saved=await download.path();assert.equal(fs.readFileSync(saved,'utf8'),source);
 // Deep links, including related external lesson anchor.
 for(const href of await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){
  if(!href||href.startsWith('https:'))continue;
  const link=new URL(href,url);const response=await context.request.get(link.href.split('#')[0]);assert.equal(response.status(),200,link.href);
  if(link.hash){const html=await response.text();assert.ok(html.includes(`id="${link.hash.slice(1)}"`),link.href);}
 }
 await page.click('.step-nav a[href="#step2"]');await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().top;return y>=40&&y<110;});
 assert.ok(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=40));
 // Keyboard operations and focus visibility.
 await page.locator('#traceNext').focus();await page.keyboard.press('Enter');await checkRanges([4,6,5,5]);
 const focus=await page.locator('#traceNext').evaluate(e=>{const s=getComputedStyle(e);return {width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor};});assert.equal(focus.width,'3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');
 await page.locator('[name="prediction"][value="bridge"]').focus();await page.keyboard.press('ArrowDown');assert.equal(await page.locator('[name="prediction"]:checked').inputValue(),'all');assert.match(await page.locator('#feedback').innerText(),/尚未/);await page.keyboard.press('ArrowUp');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reveal');await page.keyboard.press('Enter');assert.match(await page.locator('#feedback').innerText(),/^正确/);
 await page.click('#copyPython');await page.waitForFunction(()=>document.getElementById('sourceFallback').hidden&&document.getElementById('copyStatus').textContent==='已复制完整源码。');
 // Each locale / width gets focused trace and complete-page captures.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.click(`[data-lang="${lang}"]`);await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.click('#traceNext');
  await page.locator('#sourceDetails').evaluate(el=>el.open=false);
  await page.locator('#step2').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${lang} ${width}`);
  for(const selector of ['#before','#after','.prediction-options','#candidate'])assert.ok(await page.locator(selector).evaluate(e=>e.scrollWidth<=e.clientWidth+1),`${selector} ${width}`);
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});
  await page.locator('#step2 .comparison').screenshot({path:path.join(out,`ranges-${lang}-${width}.png`)});
  if(width===390||width===1440)await page.screenshot({path:path.join(out,`page-${lang}-${width}.png`),fullPage:true});
  if(width===320||width===390){
   await page.selectOption('#preset','3');await page.click('#traceLast');await checkRanges(presets[3]);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.locator('#step2 .stage').screenshot({path:path.join(out,`boundary-${lang}-${width}.png`),style:'.step-nav{visibility:hidden!important}'});
  }
 }
 // Focused reading surfaces at phone width.
 await page.setViewportSize({width:390,height:1000});
 for(const lang of ['en','zh']){
  await page.click(`[data-lang="${lang}"]`);
  for(const id of ['step0','step1','step3','step4'])await page.locator('#'+id).screenshot({path:path.join(out,`${id}-${lang}-390.png`),style:'.step-nav{visibility:hidden!important}'});
 }
 // Forced colors and reduced motion retain meaningful focus and data.
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Measured rendered color pairs: inspect inherited foreground/background.
 await page.selectOption('#preset','4');
 const pairs=await page.evaluate(()=>{
  const results=[];for(const sel of ['body','.explain','.hint','.range','.range.result','.range.neighbor','.btn.primary','#tracePrev:disabled','#traceNext:disabled','.step-nav a','.lang-toggle button.active','pre','textarea']){
   const e=document.querySelector(sel);if(!e)continue;let b=e,bg;while(b){bg=getComputedStyle(b).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;b=b.parentElement;}
   results.push({selector:sel,foreground:getComputedStyle(e).color,background:bg});
  }return results;
 });
 function lum(s){const a=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 for(const p of pairs){const a=lum(p.foreground),b=lum(p.background);p.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(p.ratio>=4.5,JSON.stringify(p));}
 fs.writeFileSync(path.join(out,'contrast.json'),JSON.stringify({pairs,focus,focusOnPanel:(lum('rgb(255,180,84)')+.05)/(lum('rgb(28,35,48)')+.05)},null,2));
 // Storage unavailable and offline: scripts/source still work after initial local load.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('disabled storage');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(url);await bp.click('[data-lang="zh"]');await bp.click('#traceNext');await blocked.setOffline(true);await bp.click('[data-lang="en"]');await bp.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await bp.locator('#pythonCode').textContent(),source);await blocked.close();
 assert.deepEqual(errors,[]);assert.ok(assets.every(a=>a.startsWith('http://127.0.0.1:18770/')||a.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'local.css')).size;assert.ok(cssBytes<25000);
 const report={kind:'author self-check',url,result:'pass',locales:['en','zh'],widths:[320,390,736,1440],zoom:'Native 200% tab zoom tested separately by zoom.cjs; see native-zoom.json',allPresets:true,sourceCopyFallbackDownloadParity:true,blockedStorageAndOffline:true,keyboardFocus:true,errors,localAssetCount:new Set(assets).size,cssBytes,semantics};
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({result:'pass',cssBytes,semanticPaths:semantics.length}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
