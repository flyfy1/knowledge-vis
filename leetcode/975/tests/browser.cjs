const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const page=await context.newPage(),errors=[],siblingWarnings=[],requests=[],observations=[],layouts=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'){if(m.location().url.endsWith('/favicon.ico'))siblingWarnings.push({message:m.text(),url:m.location().url});else errors.push(m.text());}});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
await page.goto('http://127.0.0.1:18793/leetcode/975/');await page.waitForFunction(()=>document.querySelector('#handRead').textContent.length>0);
for(const lang of ['en','zh']){
 await page.click(`[data-lang=${lang}]`);
 assert(await page.evaluate(()=>Object.values(window.LESSON_COPY).every(p=>Array.isArray(p)&&p.length===2&&p.every(s=>typeof s==='string'&&s.length>0))));
 assert((await page.locator('h1').textContent()).includes('#975'));
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 assert.equal(await page.locator('[data-i18n=formula]').textContent(),'odd[i] = (up[i] ≠ -1) AND even[up[i]]; even[i] = (down[i] ≠ -1) AND odd[down[i]]');
 await page.click('#handReset');assert(await page.locator('#undo').isDisabled());
 for(let n=0;n<4;n++)await page.click('#add');assert(await page.locator('#add').isDisabled());assert.equal(await page.locator('#handLedger li').count(),5);
 const hand=await page.locator('#handLedger').textContent();await page.click('#undo');await page.click('#add');assert.equal(await page.locator('#handLedger').textContent(),hand);await page.click('#handReset');
 const expected=[3,2,3,1,3,2,1,2];
 for(let i=0;i<8;i++){
  await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());
  let count=0;while(!(await page.locator('#next').isDisabled())){await page.click('#next');count++;assert(count<30);}
  assert((await page.locator('#result').textContent()).includes('= '+expected[i]));
  const ledger=await page.locator('#rows').textContent(),event=await page.locator('#event').textContent();
  await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#rows').textContent(),ledger);assert.equal(await page.locator('#event').textContent(),event);
  observations.push({lang,preset:i,ledger,event,result:await page.locator('#result').textContent()});
  for(let j=0;j<count;j++)await page.click('#prev');assert(await page.locator('#prev').isDisabled());
 }
 for(const value of ['0','1','2']){
  await page.check(`[name=prediction][value="${value}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'Only indices 1 and 3':'只有索引 1、3'));
 }
 await page.check('[name=prediction][value="2"]');await page.click('#reveal');
 await page.selectOption('#preset','3');await page.click('#next');await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 await page.locator('#next').focus();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);
 assert.equal(await page.inputValue('#preset'),'3');assert((await page.locator('#progress').textContent()).includes('1/3'));assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
 await page.click(`[data-lang=${lang}]`);await page.click('#reset');assert(await page.locator('#feedback').isVisible());
 // Success uses real browser clipboard and exact newline parity.
 await page.evaluate(()=>{if(window.savedClipboardWrite)navigator.clipboard.writeText=window.savedClipboardWrite;});
 await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Fresh verified sentinel before EACH fallback transfer; Linux host Control+C.
 const sentinel=`975-${lang}-fresh-sentinel`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 await page.evaluate(()=>{window.savedClipboardWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied for test'));});
 await page.click('#copy');await page.waitForFunction(()=>!document.querySelector('#manualCopy').hidden);
 assert.equal(await page.locator('#copyText').inputValue(),source);
 assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
 await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 observations.push({lang,clipboard:'success and denied-write manual transfer exact',host:process.platform,sentinelVerified:true,feedback:await page.locator('#feedback').textContent(),fallback:await page.locator('#copyStatus').textContent()});
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);const downloaded=await download.path();assert.equal(fs.readFileSync(downloaded,'utf8'),source);
 await page.setViewportSize({width:320,height:900});const selectFit=await page.locator('#preset').evaluate(e=>{const st=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=st.font;return [...e.options].map(o=>({label:o.textContent,textWidth:ctx.measureText(o.textContent).width,available:e.clientWidth-parseFloat(st.paddingLeft)-parseFloat(st.paddingRight)-32,font:st.font}));});assert(selectFit.every(x=>x.textWidth<=x.available),JSON.stringify(selectFit));observations.push({lang,selectFit,arrowReserve:32,platform:process.platform});
 // Inspect causal middle frames and keyboard access to the final column at 320px.
 await page.setViewportSize({width:320,height:900});await page.selectOption('#preset','0');
 for(let j=0;j<4;j++)await page.click('#next');
 assert((await page.locator('#event').textContent()).includes('up[0]=1'));
 assert((await page.locator('#order').textContent()).includes('[3,1]'));
 await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-320-stack.png`)});
 for(let j=0;j<8;j++)await page.click('#next');
 assert((await page.locator('#event').textContent()).includes('i=3'));
 await page.locator('#tableWrap').focus();await page.keyboard.press('End');
 for(let k=0;k<8;k++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(300);
 assert(await page.locator('#tableWrap').evaluate(e=>e.scrollLeft>0));
 await page.locator('#tableWrap').evaluate(e=>e.scrollLeft=e.scrollWidth);
 await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-320-dp-right.png`)});
 observations.push({lang,middleEvent:await page.locator('#event').textContent(),scroll:await page.locator('#tableWrap').evaluate(e=>({left:e.scrollLeft,width:e.clientWidth,total:e.scrollWidth}))});
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:900});await page.selectOption('#preset','5');while(!(await page.locator('#next').isDisabled()))await page.click('#next');
  await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`),fullPage:true});
  await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-${width}-stage.png`)});
  const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,selectWidth:document.querySelector('#preset').clientWidth,selectFont:getComputedStyle(document.querySelector('#preset')).font,selected:document.querySelector('#preset option:checked').textContent,controls:[...document.querySelectorAll('button,select')].map(e=>({id:e.id,height:e.getBoundingClientRect().height}))}));assert(geometry.scroll<=width+1,JSON.stringify(geometry));assert(geometry.controls.every(c=>c.height>=48));
  layouts.push({lang,...geometry});
 }
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-zoom200-stage.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
}
// Real deep-link navigation checks, after both locale exercise paths.
await page.setViewportSize({width:390,height:900});
for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);for(let i=0;i<5;i++){await page.click(`.step-nav a[href="#step${i}"]`);await page.waitForTimeout(700);assert.equal(new URL(page.url()).hash,'#step'+i);const g=await page.evaluate(i=>({top:document.querySelector('#step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.top>=g.nav-3,JSON.stringify(g));}}
// Keyboard activation and focus; source detail and prediction preserve focus on locale apply.
await page.setViewportSize({width:390,height:900});await page.click('[data-lang=en]');await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
await page.locator('[data-lang=zh]').focus();await page.keyboard.press('Enter');assert(await page.locator('[data-lang=zh]').evaluate(e=>document.activeElement===e));
const focus=await page.locator('[data-lang=zh]').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.width,'3px');
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.screenshot({path:path.join(OUT,'forced-colors-focus.png')});await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
// Follow each precise related anchor at narrow width in both locales.
for(const lang of ['en','zh'])for(const selector of ['related0','related1']){
 await page.click(`[data-lang=${lang}]`);const link=page.locator(`[data-i18n=${selector}]`),label=await link.textContent(),url=await link.getAttribute('href');await link.focus();await Promise.all([page.waitForURL(u=>u.pathname.endsWith(selector==='related0'?'/329/':'/32/')&&u.hash===(selector==='related0'?'#step2':'#step1')),page.keyboard.press('Enter')]);await page.waitForLoadState();const hash=new URL(page.url()).hash;await page.waitForFunction(h=>document.querySelector(h)?.textContent.trim().length>10,hash);observations.push({lang,related:label,url:page.url(),targetText:(await page.locator(hash).textContent()).slice(0,1600)});await page.goBack();await page.waitForFunction(()=>document.querySelector('#handRead')?.textContent.length>0);
}
// Storage unavailable and file:// offline source availability.
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const dp=await denied.newPage();await dp.goto('http://127.0.0.1:18793/leetcode/975/');await dp.click('[data-lang=zh]');await dp.click('#next');assert((await dp.locator('#progress').textContent()).includes('1/15'));await denied.close();
const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
// Calculate actual rendered solid color pairs; include enabled, disabled, selected and focus.
const contrast=await page.evaluate(()=>{
 const lum=rgb=>{const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const known=[["rgb(0, 0, 0)",0],["rgb(255, 255, 255)",1],["rgb(255, 0, 0)",.2126],["rgb(0, 255, 0)",.7152],["rgb(0, 0, 255)",.0722]];for(const [rgb,value] of known){if(Math.abs(lum(rgb)-value)>1e-9)throw Error('Luminance calibration');}if(Math.abs(1.05/.05-21)>1e-9)throw Error('Contrast calibration');const threshold=(lum('rgb(116, 116, 116)')+.05)/.05;if(Math.abs(threshold-4.492948073111701)>1e-7||threshold>=4.5)throw Error('Threshold calibration');
 const result=[];for(const sel of ['.stage','.hint','.btn:disabled','.btn.primary','#langToggle button.active','#handLedger li.current','.readout','a']){const e=document.querySelector(sel);if(!e)continue;const style=getComputedStyle(e);let bg=style.backgroundColor,parent=e;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}const a=lum(style.color),b=lum(bg);result.push({selector:sel,color:style.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});}return result;
});assert(contrast.every(c=>c.ratio>=4.5),JSON.stringify(contrast));assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(u=>u.startsWith('http://127.0.0.1:18793/')||u.startsWith('file:')||u.startsWith('data:')));
const report={kind:'author self-check',result:'pass',errors,siblingWarnings,observations,layouts,contrast,focus,zoom:'CSS root zoom 2 at 1440px; real Chromium rendering',requests:[...new Set(requests)],limits:['No physical mobile device or public deployment tested','No independent review or learner study']};fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
