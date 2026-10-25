const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const page=await context.newPage(),errors=[],requests=[],observations=[],layouts=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
await page.goto('http://127.0.0.1:18792/leetcode/972/');await page.waitForFunction(()=>document.querySelector('#handRead').textContent.includes('1/10'));
for(const lang of ['en','zh']){
 await page.click(`[data-lang=${lang}]`);
 assert((await page.locator('h1').textContent()).includes('#972'));
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 assert.equal(await page.locator('[data-i18n=formula]').textContent(),'value = I + A/10^m + B/[10^m × (10^k − 1)]');
 await page.click('#handReset');assert(await page.locator('#undo').isDisabled());
 for(let n=0;n<4;n++)await page.click('#add');assert(await page.locator('#add').isDisabled());assert.equal(await page.locator('#handLedger li').count(),5);
 const hand=await page.locator('#handLedger').textContent();await page.click('#undo');await page.click('#add');assert.equal(await page.locator('#handLedger').textContent(),hand);await page.click('#handReset');
 for(let i=0;i<6;i++){
  await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());
  for(let j=0;j<4;j++)await page.click('#next');assert(await page.locator('#next').isDisabled());
  assert.equal(await page.locator('#leftLedger li').count(),3);
  const result=await page.locator('#comparison').textContent();assert(result.includes(i===5?'false':'true'));
  const ledger=await page.locator('.trace-pair').textContent();await page.click('#prev');assert(!(await page.locator('#comparison').textContent()).includes('true'));await page.click('#next');assert.equal(await page.locator('.trace-pair').textContent(),ledger);
  observations.push({lang,preset:i,ledger,result});
  for(let j=0;j<4;j++)await page.click('#prev');assert(await page.locator('#prev').isDisabled());
 }
 for(const value of ['0','1','2']){
  await page.check(`[name=prediction][value="${value}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes('13/100'));
 }
 await page.check('[name=prediction][value="1"]');await page.click('#reveal');
 await page.selectOption('#preset','3');await page.click('#next');await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 await page.locator('#next').focus();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);
 assert.equal(await page.inputValue('#preset'),'3');assert((await page.locator('#progress').textContent()).includes('1/4'));assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
 await page.click(`[data-lang=${lang}]`);await page.click('#reset');assert(await page.locator('#feedback').isVisible());
 // Success uses real browser clipboard and exact newline parity.
 await page.evaluate(()=>{if(window.savedClipboardWrite)navigator.clipboard.writeText=window.savedClipboardWrite;});
 await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Fresh verified sentinel before EACH fallback transfer; Linux host Control+C.
 const sentinel=`972-${lang}-fresh-sentinel`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 await page.evaluate(()=>{window.savedClipboardWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied for test'));});
 await page.click('#copy');await page.waitForFunction(()=>!document.querySelector('#manualCopy').hidden);
 assert.equal(await page.locator('#copyText').inputValue(),source);
 assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
 await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 observations.push({lang,clipboard:'success and denied-write manual transfer exact',host:process.platform,sentinelVerified:true,feedback:await page.locator('#feedback').textContent(),fallback:await page.locator('#copyStatus').textContent()});
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);const downloaded=await download.path();assert.equal(fs.readFileSync(downloaded,'utf8'),source);
 await page.setViewportSize({width:320,height:900});const selectFit=await page.locator('#preset').evaluate(e=>{const st=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=st.font;return [...e.options].map(o=>({label:o.textContent,textWidth:ctx.measureText(o.textContent).width,available:e.clientWidth-parseFloat(st.paddingLeft)-parseFloat(st.paddingRight)-32,font:st.font}));});assert(selectFit.every(x=>x.textWidth<=x.available),JSON.stringify(selectFit));observations.push({lang,selectFit,arrowReserve:32,platform:process.platform});
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:900});await page.selectOption('#preset','5');for(let j=0;j<4;j++)await page.click('#next');
  await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`),fullPage:true});
  await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-${width}-stage.png`)});
  const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,selectWidth:document.querySelector('#preset').clientWidth,selectFont:getComputedStyle(document.querySelector('#preset')).font,selected:document.querySelector('#preset option:checked').textContent,controls:[...document.querySelectorAll('button,select')].map(e=>({id:e.id,height:e.getBoundingClientRect().height}))}));assert(geometry.scroll<=width+1,JSON.stringify(geometry));assert(geometry.controls.every(c=>c.height>=48));
  layouts.push({lang,...geometry});
 }
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-zoom200-stage.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
}
// Keyboard activation and focus; source detail and prediction preserve focus on locale apply.
await page.setViewportSize({width:390,height:900});await page.click('[data-lang=en]');await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
await page.locator('[data-lang=zh]').focus();await page.keyboard.press('Enter');assert(await page.locator('[data-lang=zh]').evaluate(e=>document.activeElement===e));
const focus=await page.locator('[data-lang=zh]').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.width,'3px');
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.screenshot({path:path.join(OUT,'forced-colors-focus.png')});await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
// Follow each precise related anchor at narrow width in both locales.
for(const lang of ['en','zh'])for(const selector of ['related0','related1']){
 await page.click(`[data-lang=${lang}]`);const link=page.locator(`[data-i18n=${selector}]`),label=await link.textContent(),url=await link.getAttribute('href');await link.focus();await Promise.all([page.waitForURL(u=>u.pathname.endsWith(selector==='related0'?'/65/':'/483/')&&u.hash===(selector==='related0'?'#step1':'#step2')),page.keyboard.press('Enter')]);await page.waitForLoadState();const hash=new URL(page.url()).hash;await page.waitForFunction(h=>document.querySelector(h)?.textContent.trim().length>10,hash);observations.push({lang,related:label,url:page.url(),targetText:(await page.locator(hash).textContent()).slice(0,1600)});await page.goBack();await page.waitForFunction(()=>document.querySelector('#handRead')?.textContent.length>0);
}
// Storage unavailable and file:// offline source availability.
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const dp=await denied.newPage();await dp.goto('http://127.0.0.1:18792/leetcode/972/');await dp.click('[data-lang=zh]');await dp.click('#next');assert((await dp.locator('#progress').textContent()).includes('1/4'));await denied.close();
const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
// Calculate actual rendered solid color pairs; include enabled, disabled, selected and focus.
const contrast=await page.evaluate(()=>{
 const lum=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const known=[["rgb(0, 0, 0)",0],["rgb(255, 255, 255)",1],["rgb(255, 0, 0)",.2126],["rgb(0, 255, 0)",.7152],["rgb(0, 0, 255)",.0722]];for(const [rgb,value] of known){if(Math.abs(lum(rgb)-value)>1e-9)throw Error('Luminance calibration');}if(Math.abs(1.05/.05-21)>1e-9)throw Error('Contrast calibration');const threshold=(lum('rgb(116, 116, 116)')+.05)/.05;if(Math.abs(threshold-4.492948073111701)>1e-7||threshold>=4.5)throw Error('Threshold calibration');
 const result=[];for(const sel of ['.stage','.hint','.btn:disabled','.btn.primary','#langToggle button.active','.trace-pair li.current','.readout','a']){const e=document.querySelector(sel);if(!e)continue;const style=getComputedStyle(e);let bg=style.backgroundColor,parent=e;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}const a=lum(style.color),b=lum(bg);result.push({selector:sel,color:style.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});}return result;
});assert(contrast.every(c=>c.ratio>=4.5),JSON.stringify(contrast));assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(u=>u.startsWith('http://127.0.0.1:18792/')||u.startsWith('file:')||u.startsWith('data:')));
const report={kind:'author self-check',result:'pass',errors,observations,layouts,contrast,focus,zoom:'CSS root zoom 2 at 1440px; real Chromium rendering',requests:[...new Set(requests)],limits:['No physical mobile device or public deployment tested','No independent review or learner study']};fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
