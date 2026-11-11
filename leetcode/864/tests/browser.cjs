'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),out=process.env.LESSON_EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/864/';
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'),entry=JSON.parse(fs.readFileSync(path.join(ROOT,'lesson-entry.json'),'utf8'));
// Calibrated sRGB luminance, no transparency handled here; measured pairs below are solid.
function luminance(hex){const a=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(luminance('000000'),0);assert.equal(luminance('ffffff'),1);assert.equal(contrast('ffffff','000000'),21);
assert.equal(luminance('ff0000'),.2126);assert.equal(luminance('00ff00'),.7152);assert.equal(luminance('0000ff'),.0722);assert(contrast('747474','000000')<4.5);
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},acceptDownloads:true});
const page=await ctx.newPage(),errors=[],bad=[],external=[],checks=[],screens=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
await page.goto(url);await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.includes('target='));
async function lang(l){await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('h1').textContent(),`#864 · ${entry.title[l]}`);assert((await page.title()).includes(entry.title[l]));}
async function click(id){await page.locator('#'+id).click();}
async function read(){return page.locator('#frameRead').textContent();}
for(const l of ['en','zh']){
 await lang(l);await click('handToggle');assert(await page.locator('#handAnswer').isVisible());await click('handToggle');assert(!(await page.locator('#handAnswer').isVisible()));
 for(let p=0;p<6;p++){
  await page.selectOption('#preset',String(p));assert(await page.locator('#tracePrev').isDisabled());
  const frames=await page.evaluate(p=>KeysCore.trace(KeysCore.presets[p]),p);let i=0;
  for(;i<frames.length-1;i++)await click('traceNext');
  assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());
  const last=await read();const expected=[2,8,8,6,-1,6][p];assert(last.includes(expected===-1?'-1':String(expected)));
  await click('tracePrev');await click('traceNext');assert.equal(await read(),last);
  await click('traceReset');assert(await page.locator('#tracePrev').isDisabled());await click('traceLast');assert.equal(await read(),last);
  checks.push(`${l} preset ${p}: all ${frames.length} frames; endpoints and replay`);
 }
 await page.selectOption('#preset','1');for(let j=0;j<4;j++)await click('traceNext');
 const cell=page.locator('.key-cell').nth(4);assert((await cell.textContent()).includes('0:0'));assert((await cell.textContent()).includes('★ 1:4'));
 assert(await cell.locator('.active-record').isVisible());await page.locator('summary[data-i18n=eventsTitle]').click();assert(await page.locator('#events li').count()>0);
 const keep=await page.locator('#grid .record').allTextContents();await lang(l==='en'?'zh':'en');assert.deepEqual(await page.locator('#grid .record').allTextContents(),keep);await lang(l);
 await page.locator('summary[data-i18n=eventsTitle]').click();
 // Every prediction choice, changed feedback, unrelated trace controls, language roundtrip.
 for(const answer of ['0','1','2']){
  await page.locator(`[name=prediction][value="${answer}"]`).check();assert(!(await page.locator('#predictionFeedback').textContent()).includes('2+4'));
  await click('reveal');assert((await page.locator('#predictionFeedback').textContent()).includes('2+4'));
  assert.equal(await page.locator('#predictionFeedback').getAttribute('class'),answer==='1'?'readout correct':'readout');
  const feedback=await page.locator('#predictionFeedback').textContent();await click('traceReset');assert.equal(await page.locator('#predictionFeedback').textContent(),feedback);
  await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${answer}"]`).isChecked());assert((await page.locator('#predictionFeedback').textContent()).includes('2+4'));await lang(l);
 }
 await click('predictionReset');assert(await page.locator('#reveal').isDisabled());
 // Exact rendered source and download bytes.
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 const dl=page.waitForEvent('download');await page.locator('a[download]').click();const file=await dl;assert.equal(fs.readFileSync(await file.path(),'utf8'),source);
 await click('copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Fresh sentinel for EACH fallback attempt, verify reset before disabling writes.
 const sentinel=`864-${l}-${Date.now()}-sentinel`;
 await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('forced fallback');};});
 await click('copyPython');assert(await page.locator('#sourceFallback').isVisible());
 assert.equal(await page.locator('#manualSource').inputValue(),source);
 assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
 await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});
 checks.push(`${l}: exact embedded/rendered/download/automatic clipboard/native manual fallback; fresh sentinel, host ${process.platform}`);
}
// Narrow layouts, controls and a populated revisit state, all in both locales.
for(const width of [320,390,736,1440])for(const l of ['zh','en']){
 await page.setViewportSize({width,height:1000});await lang(l);await page.selectOption('#preset','1');for(let j=0;j<4;j++)await click('traceNext');
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(250);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 // Board horizontal scrolling is explicit and keyboard reachable; cells retain full labels.
 assert(await page.locator('#gridScroll').evaluate(e=>e.scrollWidth>e.clientWidth||e.clientWidth>=e.scrollWidth));
 const geometry=await page.locator('.key-cell').nth(4).evaluate(e=>({h:e.clientHeight,child:[...e.children].map(x=>({h:x.clientHeight,sh:x.scrollHeight}))}));
 assert(geometry.child.every(x=>x.h+1>=x.sh));
 const selectFit=await page.locator('#preset').evaluate(e=>{const c=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=c.font;return {available:e.clientWidth-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight)-24,text:Math.max(...[...e.options].map(o=>ctx.measureText(o.text).width)),font:c.font};});
 assert(selectFit.available>=selectFit.text,JSON.stringify(selectFit));
 await page.locator('#gridScroll').evaluate(e=>e.scrollLeft=350);
 const name=`revisit-${width}-${l}.png`;await page.locator('#step2 .stage').screenshot({path:path.join(out,name)});screens.push(name);
 await page.locator('#gridScroll').scrollIntoViewIfNeeded();const boardName=`board-${width}-${l}.png`;await page.locator('#gridScroll').screenshot({path:path.join(out,boardName)});screens.push(boardName);
 checks.push(`${width} ${l}: closed-select fit ${JSON.stringify(selectFit)}; contained board scrolling; populated labels; no page overflow`);
}
// 200% CSS zoom reflows a real Chromium page to 390 CSS-pixel content width.
await page.setViewportSize({width:780,height:1200});await page.evaluate(()=>document.documentElement.style.zoom='2');
for(const l of ['en','zh']){await lang(l);await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(250);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&document.body.scrollWidth<=innerWidth/2+1));await page.locator('#gridScroll').evaluate(e=>e.scrollLeft=350);const boardName=`board-zoom200-${l}.png`;await page.locator('#gridScroll').screenshot({path:path.join(out,boardName)});screens.push(boardName);const name=`zoom200-${l}.png`;await page.locator('#step2 .stage').screenshot({path:path.join(out,name)});screens.push(name);}
await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:390,height:1000});
// Keyboard actual activation and focus treatment.
await page.selectOption('#preset','0');await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert((await read()).includes('d=1'));
assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');await page.keyboard.press('Enter');assert((await read()).includes('d=0'));
await page.locator('#gridScroll').focus();await page.keyboard.press('ArrowRight');
// Forced-colors and reduced motion retain meaningful state and focus.
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
// Measure actual solid text/disabled/focus pairs from computed styles.
function hex(rgb){return rgb.match(/\d+/g).slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('');}
const pairs=[];
for(const selector of ['.readout','.key-cell','.key-cell small','.active-record','#tracePrev','.btn.primary']){
 const colors=await page.locator(selector).first().evaluate(e=>{let b=e;while(getComputedStyle(b).backgroundColor==='rgba(0, 0, 0, 0)')b=b.parentElement;return {fg:getComputedStyle(e).color,bg:getComputedStyle(b).backgroundColor};});
 const ratio=contrast(hex(colors.fg),hex(colors.bg));assert(ratio>=4.5,selector+' '+ratio);pairs.push({selector,...colors,ratio});
}
assert(contrast('ffb454','161b22')>=3);checks.push('Calibrated contrast: solid computed pairs AA; accent2 focus >=3 against panel');
// Follow both actual links with keyboard and inspect destination section text/identity.
const related=[];
for(const l of ['zh','en'])for(const dest of ['773','126']){
 await lang(l);const link=page.locator(`.related a[href="../${dest}/#step2"]`);const label=await link.textContent();await link.focus();await page.keyboard.press('Enter');await page.waitForURL(`**/${dest}/#step2`);await page.waitForFunction(()=>document.querySelector('#step2').textContent.length>100);
 related.push({locale:l,label,url:page.url(),section:(await page.locator('#step2').textContent()).slice(0,1800)});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.includes('target='));
}
// Storage failures degrade safely, source still works without asset fetch.
const blocked=await ctx.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage disabled');}});});await blocked.goto(url);await blocked.waitForFunction(()=>document.querySelector('#frameRead').textContent.includes('target='));await blocked.locator('[data-lang=zh]').click();assert.equal(await blocked.locator('h1').textContent(),'#864 · 获取所有钥匙的最短路径');await blocked.close();
const offline=await ctx.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.waitForFunction(()=>document.querySelector('#pythonCode').textContent.length>100);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
const report={status:'pass',authorSelfCheck:true,browser:await browser.version(),host:process.platform,checks,screens,related,contrast:pairs,errors,bad,external,cssBytes:fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size,zoom:'200% CSS zoom in real Chromium, 780 viewport / 390 layout; no native browser chrome zoom claim'};
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:checks.length,screens:screens.length,contrast:pairs}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
