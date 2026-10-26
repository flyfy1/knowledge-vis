// NODE_PATH supplied by environment. OUTPUT_DIR may point outside the frozen candidate.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const core=require('../core.js');
const checks=[],errors=[],network=[],links=[],observedTexts=[],requests=[];
function ok(name){checks.push(name);}
function luminance(hex){const rgb=hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(fg,bg){const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage();
 page.on('request',r=>requests.push(r.url()));
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('requestfailed',r=>network.push(r.url()+': '+r.failure().errorText));
 page.on('response',r=>{if(r.status()>=400)network.push(r.status()+' '+r.url());});
 await page.goto(base+'/leetcode/1074/');await page.locator('#progress').filter({hasText:'0/'}).waitFor();
 assert.equal(await page.locator('#code').textContent(),source);
 assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);ok('rendered and embedded source exact including final newline');
 const expected=[5,4,0,3,1,1,3];
 for(const lang of ['en','zh']) {
  await page.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert.equal(await page.locator('[data-i18n="formula"]').textContent(),'P[c+1] − P[left] = target  ⇔  P[left] = s − target');
  observedTexts.push({locale:lang,state:'formula',text:await page.locator('[data-i18n="formula"]').textContent()});
  await page.locator('#step1').screenshot({path:path.join(out,`hand-${lang}.png`)});
  for(let i=0;i<5;i++){
   assert.match(await page.locator('#handRead').textContent(),new RegExp(`${i+1}/5`));
   assert.equal(await page.locator('#handLedger li[aria-current]').count(),1);
   if(i<4)await page.locator('#handNext').click();
  }
  assert(await page.locator('#handNext').isDisabled());
  for(let i=0;i<4;i++)await page.locator('#handPrev').click();
  assert(await page.locator('#handPrev').isDisabled());
  ok(lang+' all five hand rectangles and reverse endpoints');
  for(let p=0;p<core.presets.length;p++) {
   await page.selectOption('#preset',String(p));
   const frames=core.trace(core.presets[p].matrix,core.presets[p].target);
   for(let i=0;i<frames.length;i++) {
    const f=frames[i];
    assert.match(await page.locator('#progress').textContent(),new RegExp(`${i}/${frames.length-1}`));
    assert((await page.locator('#after').textContent()).includes(JSON.stringify(f.seen)));
    if(f.c>=0)assert((await page.locator('#before').textContent()).includes(JSON.stringify(f.before)));
    assert.equal(await page.locator('#ledger tr').count(),Math.max(1,f.ledger.length));
    if(f.ledger.length)assert.equal(await page.locator('#ledger tr:last-child td:last-child').textContent(),String(f.total));
    if((p===0&&i===5)||(p===4&&i===1)||i===0&&p===0)observedTexts.push({locale:lang,preset:p,operation:i,event:await page.locator('#event').textContent(),matches:await page.locator('#matches').textContent(),progress:await page.locator('#progress').textContent()});
    if(i>0){
     const snap=await page.locator('#event').textContent();
     await page.locator('#prev').click();await page.locator('#next').click();
     assert.equal(await page.locator('#event').textContent(),snap);
    }
    if(i<frames.length-1)await page.locator('#next').click();
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   assert.equal(await page.locator('#ledger tr:last-child td:last-child').textContent(),String(expected[p]));
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
   await page.locator('#end').click();assert(await page.locator('#next').isDisabled());
   await page.locator('#reset').click();
  }
  ok(lang+' every frame, all seven presets, rewind/replay, reset and jump endpoints');
  assert(await page.locator('#feedback').isHidden());assert(await page.locator('#reveal').isDisabled());
  for(const choice of ['0','1','2']) {
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());
   if(choice==='0')await page.locator('#step4').screenshot({path:path.join(out,`prediction-before-${lang}.png`)});
   await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();
   observedTexts.push({locale:lang,state:'prediction choice '+choice,text});
   if(choice==='2')await page.locator('#step4').screenshot({path:path.join(out,`prediction-after-${lang}.png`)});
   assert(text.includes(lang==='zh'?'共 2 个':'hence 2'));
   assert(text.startsWith(lang==='zh'?(choice==='2'?'预测正确':'这次预测需要修正'):(choice==='2'?'Correct prediction':'Revise this prediction')));
  }
  // Preserve revealed choice, preset and frame through a locale round trip.
  await page.selectOption('#preset','3');await page.locator('#end').click();
  const state=await page.locator('#after').textContent();
  await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();
  assert(await page.locator('[name="prediction"][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());
  assert.equal(await page.locator('#preset').inputValue(),'3');assert((await page.locator('#after').textContent()).includes('{"0":3}'));
  await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('#after').textContent(),state);
  await page.locator('[name="prediction"][value="0"]').check();assert(await page.locator('#feedback').isHidden());
  // Reset prediction only for the next test iteration, through reload; locale storage persists.
  ok(lang+' all prediction choices; choice change clears; locale preserves selection, reveal, preset and trace');
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#code').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert.equal(await page.locator('#copyStatus').textContent(),lang==='zh'?'已复制完整源码。':'Full source copied.');
  const downloadEvent=page.waitForEvent('download');await page.locator('#download').click();const dl=await downloadEvent;
  const downloaded=await dl.path();assert.equal(fs.readFileSync(downloaded,'utf8'),source);assert.equal(dl.suggestedFilename(),'solution.py');
  // Each manual attempt gets its own independently verified sentinel, before disabling writes.
  const sentinel='1074-'+lang+'-'+Date.now();
  await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('denied for fallback self-check');};});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
  assert.equal(await page.locator('#fallbackSource').inputValue(),source);
  assert.deepEqual(await page.locator('#fallbackSource').evaluate(el=>[document.activeElement===el,el.selectionStart,el.selectionEnd]),[true,0,source.length]);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert((await page.locator('#copyStatus').textContent()).includes(lang==='zh'?'系统复制快捷键':'system copy shortcut'));
  await page.screenshot({path:path.join(out,`fallback-${lang}.png`),fullPage:false});
  await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  ok(lang+' successful copy, native manual clipboard transfer with fresh verified sentinel, exact source/download parity');
  console.log('Locale functional checks passed:',lang);
  await page.reload();await page.locator('#progress').waitFor();
 }
 // Browser layout and meaningful populated states, not only an overflow number.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]) {
  await page.setViewportSize({width,height:950});await page.locator(`[data-lang="${lang}"]`).click();
  await page.selectOption('#preset','1');for(let i=0;i<7;i++)await page.locator('#next').click();
  await page.locator('#board').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const boxes=await page.locator('#board td').evaluateAll(els=>els.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,text:el.textContent})));
  assert(boxes.every(x=>x.w>=40&&x.h>=48));
  const widths=boxes.map(x=>x.w);assert(Math.max(...widths)-Math.min(...widths)<1);
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`),fullPage:true});
  // Inspect a focused diagram screenshot separately to avoid sticky full-page capture artifacts.
  await page.locator('#step3 .stage').screenshot({path:path.join(out,`stage-${lang}-${width}.png`)});
  await page.locator('#board').evaluate(el=>window.scrollTo({top:scrollY+el.getBoundingClientRect().top-document.querySelector('nav').getBoundingClientRect().height-16,behavior:'instant'}));
  await page.locator('#board').screenshot({path:path.join(out,`board-${lang}-${width}.png`)});
  await page.locator('#cols').screenshot({path:path.join(out,`cols-${lang}-${width}.png`)});
  for(const selector of ['#next','#prev','#reset','#end','#copy','#preset','#langToggle button']){
   const sizes=await page.locator(selector).evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
   assert(sizes.every(s=>s.w>=48&&s.h>=48),selector+' control size');
  }
  ok(lang+' '+width+'px populated board geometry, control sizes, screenshot and no document overflow');
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const lang of ['en','zh']) {
  await page.locator(`[data-lang="${lang}"]`).click();await page.evaluate(()=>document.body.style.zoom='2');
  await page.locator('#board').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,`zoom200-${lang}.png`),fullPage:false});
  await page.evaluate(()=>document.body.style.zoom='');ok(lang+' 200% CSS zoom geometry and screenshot');
 }
 await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/8'));
 assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.locator('#next').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
 await page.screenshot({path:path.join(out,'keyboard-focus.png'),fullPage:false});
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 await page.locator('a[href="#step2"]').first().focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().top;return y>=68&&y<100;});
 assert.equal(new URL(page.url()).hash,'#step2');
 assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=0));
 ok('keyboard Enter advances, Tab order, 3px visible focus, deep navigation');
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await page.screenshot({path:path.join(out,'forced-colors.png'),fullPage:false});await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
 // Follow both related destinations with keyboard; record actual explanatory text.
 for(const lang of ['en','zh']) {
  await page.locator(`[data-lang="${lang}"]`).click();
  for(const [id,fragment,promise] of [['327','step1','prefix differences'],['363','step1','row-band compression']]) {
   const anchor=page.locator(`.related a[href="../${id}/#${fragment}"]`);const label=await anchor.textContent();
   await anchor.focus();await page.keyboard.press('Enter');await page.locator('#'+fragment).waitFor();
   const explanation=await page.locator('#'+fragment).textContent();assert(explanation.length>150);
   links.push({locale:lang,label,url:page.url(),promise,explanation});
   await page.goBack();await page.locator('#progress').waitFor();
  }
 }
 // Offline assets are enough to display source; no fetch is used to populate it.
 await context.setOffline(true);await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);await context.setOffline(false);ok('source remains exact offline');
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});});
 const p2=await denied.newPage();p2.on('pageerror',e=>errors.push(String(e)));await p2.goto(base+'/leetcode/1074/');await p2.locator('#progress').waitFor();await p2.locator('[data-lang="zh"]').click();await p2.locator('#next').click();await p2.locator('[data-lang="en"]').click();assert((await p2.locator('#progress').textContent()).includes('1/8'));await denied.close();ok('blocked storage falls back; locale changes preserve trace');
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);assert(requests.every(url=>new URL(url).origin===new URL(base).origin));
 const renderedPairs=await page.evaluate(()=>{const selectors=['.hint','.explain','.btn.primary','#prev','.readout','.formula','.step-nav a.active'];return selectors.map(selector=>{const e=document.querySelector(selector);let bg=e;while(getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)'&&bg.parentElement)bg=bg.parentElement;return {selector,fg:getComputedStyle(e).color,bg:getComputedStyle(bg).backgroundColor};});});
 const hex=rgb=>'#'+rgb.match(/\d+/g).slice(0,3).map(x=>Number(x).toString(16).padStart(2,'0')).join('');
 for(const pair of renderedPairs){pair.ratio=+contrast(hex(pair.fg),hex(pair.bg)).toFixed(2);assert(pair.ratio>=4.5);}
 const pairs=[];for(const bg of ['#0d1117','#161b22','#1c2330','#0a0e14'])for(const fg of ['#e8edf4','#9aa7b8','#6ee7ff','#ffb454','#c9d4e2']){const ratio=contrast(fg,bg);assert(ratio>=4.5);pairs.push({fg,bg,ratio:+ratio.toFixed(2)});}
 for(const [fg,bg] of [['#0d1117','#6ee7ff'],['#ffb454','#161b22'],['#ffb454','#1c2330']])pairs.push({fg,bg,ratio:+contrast(fg,bg).toFixed(2)});
 const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
 const report={kind:'author self-check only',hostPlatform:process.platform,clipboard:'native shortcut; exact string readback including LF final newline; fresh sentinel per locale',checks,errors,network,contrast:pairs,renderedPairs,cssBytes,relatedLinks:links,observedTexts,assetRequests:[...new Set(requests)],limitations:'Headless Chromium, CSS 200% zoom; no physical mobile device, actual learner, production deployment, independent review, or LeetCode submission.'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:checks.length,errors,network,cssBytes,minimumTextContrast:Math.min(...pairs.map(p=>p.ratio))}));
 } finally {await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'browser-failure.txt'),String(e.stack)+'\n');console.error(e);process.exitCode=1;});
