const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const ctx=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});const page=await ctx.newPage();
let errors=[],badAssets=[],external=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)badAssets.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18790')&&!r.url().startsWith('blob:'))external.push(r.url());});
await page.goto('http://127.0.0.1:18790/leetcode/964/');await page.locator('#progress').filter({hasText:'0/2'}).waitFor();await page.evaluate(()=>{window.nativeClipboard=navigator.clipboard;});
const report={browserVersion:await browser.version(),checkedAt:new Date().toISOString(),hostPlatform:process.platform,clipboard:'Each locale: mocked API exact transfer; fresh sentinel then native keyboard fallback exact bytes',kind:'author Chromium self-check',matrices:[],selectBudgets:[],presets:[],feedback:[],contrast:[],errors,badAssets,external};
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(OUT,`${lang}-header.png`)});
 const entry=JSON.parse(fs.readFileSync(path.join(ROOT,'lesson-entry.json')));assert.equal(await page.locator('h1').innerText(),'#964 · '+entry.title[lang]);assert((await page.title()).includes(entry.title[lang]));
 for(const h of ['7','8','9']){await page.selectOption('#hand',h);assert((await page.locator('#handResult').innerText()).includes('= '+h));}
 for(let i=0;i<6;i++){
  await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());
  const initial=await page.locator('#progress').innerText();
  await page.locator('#next').click();const first=await page.locator('#ledger').innerText();
  await page.locator('#prev').click();assert.equal(await page.locator('#progress').innerText(),initial);
  await page.locator('#next').click();assert.equal(await page.locator('#ledger').innerText(),first);
  while(await page.locator('#next').isEnabled())await page.locator('#next').click();
  const full=await page.locator('#ledger').innerText(),result=await page.locator('#result').innerText();
  assert(await page.locator('#end').isDisabled());assert(result.includes('='+[3,5,8,3,1,113][i]));
  if(i===2){const row=await page.locator('#ledger li').last().innerText();assert(row.includes('S=501'));assert(row.includes('min(14, 27)=14'));assert(row.includes('min(5, 12)=5'));}
  while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();
  await page.locator('#end').click();assert.equal(await page.locator('#ledger').innerText(),full);
  report.presets.push({lang,i,result});
  await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());assert((await page.locator('#progress').innerText()).includes('0/'));
 }
 for(let choice=0;choice<3;choice++){
  await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());
  await page.locator('#reveal').click();const feedback=await page.locator('#feedback').innerText();
  assert(feedback.includes('4*4−4/4=15'));assert(feedback.includes('min(6,2+2)−1=3'));
  report.feedback.push({lang,choice,feedback});
 }
 await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();
 await page.selectOption('#preset','2');await page.locator('#next').click();
 await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();
 assert.equal(await page.locator('#preset').inputValue(),'2');assert((await page.locator('#progress').innerText()).includes('1/4'));
 assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());
 await page.locator(`[data-lang=${lang}]`).click();
 // Complete source and actual blob download parity.
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const expected=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');assert.equal(await page.locator('#code').textContent(),expected);
 const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;
 const downloadPath=path.join(OUT,`download-${lang}.py`);await download.saveAs(downloadPath);assert.equal(fs.readFileSync(downloadPath,'utf8'),expected);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.capturedClipboard=text;}}});});
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.capturedClipboard),expected);
 assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'copied':'已复制'));
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});});
 await page.evaluate(async()=>{const sentinel='FALLBACK-SENTINEL-'+Date.now();await window.nativeClipboard.writeText(sentinel);if(await window.nativeClipboard.readText()!==sentinel)throw Error('sentinel reset failed');});
 await page.locator('#copy').click();assert.equal(await page.locator('#fallbackSource').inputValue(),expected);
 assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),expected);
 await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');
 assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),expected);
 assert((await page.locator('#copyStatus').innerText()).includes(lang==='en'?'manually':'手动'));
 await page.locator('#copyStatus').screenshot({path:path.join(OUT,`fallback-${lang}.png`)});
 // Keyboard activation, focus geometry, deep links.
 await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
 const focus=await page.locator('#next').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 for(const anchor of ['step2','step3','step4']){
  await page.locator(`.step-nav a[href="#${anchor}"]`).click();await page.waitForTimeout(1000);
  const geometry=await page.locator('#'+anchor).evaluate(e=>({top:e.getBoundingClientRect().top}));assert(geometry.top>=50,JSON.stringify({anchor,geometry}));
 }
 for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
  await page.selectOption('#preset','2');await page.locator('#end').click();
  const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;return {width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),arrowReserve:16,options:[...e.options].map(o=>({label:o.textContent,textWidth:ctx.measureText(o.textContent).width})),font:s.font};});
  for(const o of budget.options)assert(o.textWidth+budget.padding+budget.arrowReserve<=budget.width,JSON.stringify({lang,width,zoom,budget,o}));report.selectBudgets.push({lang,width,zoom,...budget});
  await page.locator('#preset').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-controls.png`)});
  await page.locator('#ledger').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-12));await page.waitForTimeout(300);
  const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,rows:[...document.querySelectorAll('#ledger li')].map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}));
  assert(geometry.scroll<=geometry.width+1,JSON.stringify({width,zoom,lang,geometry}));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-trace.png`)});
  await page.locator('#step4').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-z${zoom}-predict.png`)});
  report.matrices.push({lang,width,zoom,...geometry});
 }
 await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});
}
// Measured computed color pairs, including disabled controls and active locale.
function luminance(color){const nums=color.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return nums[0]*.2126+nums[1]*.7152+nums[2]*.0722;}
assert.equal(luminance('rgb(0,0,0)'),0);assert.equal(luminance('rgb(255,255,255)'),1);assert.equal((1+.05)/(.05),21);assert.equal(luminance('rgb(255,0,0)'),.2126);assert.equal(luminance('rgb(0,255,0)'),.7152);assert.equal(luminance('rgb(0,0,255)'),.0722);assert(Math.abs((luminance('rgb(116,116,116)')+.05)/.05-4.492948073111701)<.000001);
for(const selector of ['body','.explain','.hint','#progress','#result','#prev','#next','#langToggle .active','.step-nav a','.stage label','#ledger p']){
 const el=page.locator(selector).first();if(!await el.count())continue;
 const c=await el.evaluate(e=>{const s=getComputedStyle(e);let p=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {fg:s.color,bg};});
 const ls=[luminance(c.fg),luminance(c.bg)].sort((a,b)=>a-b);const ratio=(ls[1]+.05)/(ls[0]+.05);assert(ratio>=4.5,{selector,...c,ratio});report.contrast.push({selector,...c,ratio});
}
const focusColorRatio=(luminance('rgb(255, 180, 84)')+.05)/(luminance('rgb(28,35,48)')+.05);assert(focusColorRatio>=3);report.focusColorRatio=focusColorRatio;
// Every local anchor and collection destination resolves; official link is separate.
report.related=[];for(const lang of ['zh','en']){await page.locator(`[data-lang=${lang}]`).click();for(const id of ['956','920']){const a=page.locator(`.related a[href="../${id}/#step2"]`);const label=await a.innerText();const p=await ctx.newPage();await p.goto(new URL('../'+id+'/#step2',page.url()).href);await p.locator(`[data-lang=${lang}]`).click();const heading=await p.locator('#step2 h2').innerText();const text=await p.locator('#step2').innerText();assert(text.length>100);report.related.push({lang,label,href:p.url(),heading,observed:text.slice(0,700)});await p.close();}}
const hrefs=await page.locator('a').evaluateAll(a=>a.map(e=>e.getAttribute('href')));
for(const href of hrefs){if(href.startsWith('#'))assert(await page.locator(href).count());else if(href==='../')assert((await ctx.request.get(new URL(href,page.url()).href)).ok());}
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#reset').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#reset').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');report.forcedColorsAndReducedMotion=true;
// Disabled persistence and offline embedded source still initialize.
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});});
const p2=await blocked.newPage();await p2.goto(page.url());await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();assert((await p2.locator('#progress').innerText()).includes('1/2'));await blocked.setOffline(true);await p2.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await p2.locator('#code').textContent(),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));report.blockedStorageAndOffline=true;
assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
report.cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(report.cssBytes<25000);
fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({matrices:report.matrices.length,presets:report.presets.length,contrast:report.contrast.length,cssBytes:report.cssBytes,errors}));
})().catch(e=>{console.error(e);process.exit(1)});
