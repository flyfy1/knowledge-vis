const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(OUT,{recursive:true});const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18797',url=BASE+'/leetcode/992/';
function oracle(a,k){let n=0;for(let l=0;l<a.length;l++)for(let r=l;r<a.length;r++)if(new Set(a.slice(l,r+1)).size===k)n++;return n;}
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();
const errors=[],siblingWarnings=[],requests=[],observations=[],layouts=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'){if(m.location().url===BASE+'/favicon.ico')siblingWarnings.push({message:m.text(),location:m.location().url,page:page.url(),scope:'Existing related page favicon; #992 uses inline data favicon'});else errors.push(m.text());}});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
await page.goto(url);await page.waitForFunction(()=>document.querySelector('#handRead').textContent.length>0);
for(const lang of ['en','zh']){
 await page.click(`[data-lang=${lang}]`);
 assert.equal(await page.locator('h1').textContent(),lang==='en'?'#992 · Subarrays with K Different Integers':'#992 · K 个不同整数的子数组');
 assert.equal(await page.title(),await page.locator('h1').textContent());assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/subarrays-with-k-different-integers/');
 assert.equal(await page.locator('#pythonCode').textContent(),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('(r−left_k+1) − (r−left_(k−1)+1) = left_(k−1)−left_k'));
 await page.click('#handReset');assert(await page.locator('#undo').isDisabled());for(let j=0;j<6;j++)await page.click('#add');assert(await page.locator('#add').isDisabled());assert((await page.locator('#handRead').textContent()).includes('3'));
 assert.equal(await page.locator('#handLedger li').count(),6);const hand=await page.locator('#handLedger').textContent();await page.click('#undo');await page.click('#add');assert.equal(await page.locator('#handLedger').textContent(),hand);await page.click('#handReset');
 const inputs=[[[1,2,1],2],[[1,2,1,2,3],2],[[1,2,1,3,4],3],[[1,1,1],1],[[1,2,3],2],[[1],1],[[1,1,1],3]];
 for(let i=0;i<inputs.length;i++){
  const [a,k]=inputs[i];await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#rows tr').count(),0);
  for(let r=0;r<a.length;r++){
   await page.click('#next');const cells=await page.locator('#rows tr').last().locator('td').allTextContents();
   const atMost=t=>Array.from({length:r+1},(_,l)=>a.slice(l,r+1)).filter(s=>new Set(s).size<=t).length;
   const count=oracle(a.slice(0,r+1),k),delta=atMost(k)-atMost(k-1);
   assert.deepEqual(cells,[String(r),String(atMost(k)),String(atMost(k-1)),String(delta),String(count)]);
   assert.equal(await page.locator('#starts .exact').count(),delta);
  }
  assert(await page.locator('#next').isDisabled());const snapshot=await page.locator('#windows').textContent(),ledger=await page.locator('#rows').textContent();
  await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#windows').textContent(),snapshot);assert.equal(await page.locator('#rows').textContent(),ledger);
  observations.push({lang,preset:i,input:a,k,expected:oracle(a,k),result:await page.locator('#result').textContent(),window:snapshot,ledger});
  for(let j=0;j<a.length;j++)await page.click('#prev');assert(await page.locator('#prev').isDisabled());await page.click('#reset');assert.equal(await page.locator('#rows tr').count(),0);
 }
 assert(await page.locator('#reveal').isDisabled() || await page.locator('[name=prediction]:checked').count()>0);
 for(const value of ['0','1','2']){
  await page.check(`[name=prediction][value="${value}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');
  const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('left_2=1')&&feedback.includes('left_1=3')&&feedback.includes('3−1=2'));
  assert(feedback.startsWith(value==='1'?(lang==='en'?'Your prediction is correct.':'选择正确。'):(lang==='en'?'Compare':'再对照')));observations.push({lang,prediction:value,feedback});
 }
 await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.selectOption('#preset','1');await page.click('#next');await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert((await page.locator('#progress').textContent()).includes('1/5'));assert.equal(await page.inputValue('#preset'),'1');assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.click(`[data-lang=${lang}]`);await page.click('#reset');assert(await page.locator('#feedback').isVisible());
 // Exact successful copy and distinct sentinel before each fallback transfer.
 await page.evaluate(()=>{if(window.savedWrite)navigator.clipboard.writeText=window.savedWrite;});await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 for(let attempt=0;attempt<2;attempt++){
  await page.evaluate(()=>{if(window.savedWrite)navigator.clipboard.writeText=window.savedWrite;});
  const sentinel=`992-${lang}-${attempt}-unique-clipboard-sentinel`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied for test'));});await page.click('#copy');await page.waitForFunction(()=>!document.querySelector('#manualCopy').hidden);
  assert.equal(await page.locator('#copyText').inputValue(),source);assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  observations.push({lang,attempt,host:process.platform,clipboard:'verified sentinel → denied automatic write → native manual transfer → exact source',fallback:await page.locator('#copyStatus').textContent()});
 }
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.selectOption('#preset','1');for(let i=0;i<5;i++)await page.click('#next');
  const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('button,select')].map(e=>({id:e.id,height:e.getBoundingClientRect().height})),cells:[...document.querySelectorAll('.array-value')].map(e=>e.getBoundingClientRect().width)}));assert(geometry.scroll<=width+1,JSON.stringify(geometry));assert(geometry.buttons.every(b=>b.height>=48));assert(geometry.cells.every(w=>w>=25));
  const fit=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=s.font;return [...e.options].map(o=>({label:o.textContent,text:ctx.measureText(o.textContent).width,budget:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-32,font:s.font}));});assert(fit.every(f=>f.text<=f.budget),JSON.stringify(fit));
  layouts.push({lang,...geometry,selectFit:fit,arrowReserve:32});await page.locator('#step2').scrollIntoViewIfNeeded();await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-${width}-stage.png`),style:'.step-nav{visibility:hidden}'});
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-page.png`),fullPage:true});
 }
 // Dense removal showing repeated occurrences, not merely a zero-removal frame.
 await page.setViewportSize({width:320,height:1000});await page.selectOption('#preset','1');for(let i=0;i<5;i++)await page.click('#next');
 assert((await page.locator('#windows').textContent()).includes(lang==='en'?'remaining frequency: 1':'余 1 次'));await page.locator('#tableWrap').focus();for(let i=0;i<8;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(250);assert(await page.locator('#tableWrap').evaluate(e=>e.scrollLeft>0));await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-320-right.png`),style:'.step-nav{visibility:hidden}'});
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${lang}-zoom200-stage.png`),style:'.step-nav{visibility:hidden}'});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.evaluate(()=>document.documentElement.style.zoom='');
}
await page.setViewportSize({width:390,height:1000});
for(const lang of ['zh','en','zh']){await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#992 · K 个不同整数的子数组':'#992 · Subarrays with K Different Integers');}
for(const lang of ['en','zh']){
 await page.click(`[data-lang=${lang}]`);
 for(let i=0;i<5;i++){
  await page.click(`.step-nav a[href="#step${i}"]`);await page.waitForTimeout(600);assert.equal(new URL(page.url()).hash,'#step'+i);
  const g=await page.evaluate(i=>({top:document.querySelector('#step'+i).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),i);assert(g.top>=g.nav-3,JSON.stringify(g));
 }
 for(const related of ['related1','related2']){const target=related==='related1'?'/leetcode/76/':'/leetcode/2916/',fragment=related==='related1'?'#step2':'#step1';const link=page.locator(`[data-i18n=${related}]`),label=await link.textContent();await link.focus();await Promise.all([page.waitForURL(u=>u.pathname===target&&u.hash===fragment),page.keyboard.press('Enter')]);await page.waitForFunction(h=>document.querySelector(h)?.textContent.length>100,fragment);observations.push({lang,related:label,url:page.url(),targetText:await page.locator(fragment).textContent()});await page.goBack();await page.waitForFunction(()=>document.querySelector('#handRead')?.textContent.length>0);}
 await page.locator('[data-i18n=related0]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(600);assert.equal(new URL(page.url()).hash,'#step1');
}
await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
await page.locator('[data-lang=en]').focus();await page.keyboard.press('Enter');assert(await page.locator('[data-lang=en]').evaluate(e=>document.activeElement===e));
const focus=await page.locator('[data-lang=en]').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.screenshot({path:path.join(OUT,'forced-colors-focus.png')});await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
// File source works offline; blocked storage retains functioning locale and experiment.
const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}}));const dp=await denied.newPage();await dp.goto(url);await dp.click('[data-lang=zh]');await dp.click('#next');assert((await dp.locator('#progress').textContent()).includes('1/3'));await denied.close();
const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.click('#next');assert((await offline.locator('#progress').textContent()).includes('1/3'));await offline.close();
// Actual computed solid colors, with helper calibration and AA rejection calibration.
await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.click('#next');
await page.locator('[data-lang=en]').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert(await page.locator('[data-lang=en]').evaluate(e=>e.matches(':focus-visible')&&getComputedStyle(e).outlineWidth==='3px'));
const contrast=await page.evaluate(()=>{
 function lum(rgb){const c=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*c[0]+.7152*c[1]+.0722*c[2];}
 for(const [rgb,want] of [['rgb(0,0,0)',0],['rgb(255,255,255)',1],['rgb(255,0,0)',.2126],['rgb(0,255,0)',.7152],['rgb(0,0,255)',.0722]])if(Math.abs(lum(rgb)-want)>1e-9)throw Error('luminance calibration');if(Math.abs((lum('rgb(116,116,116)')+.05)/.05-4.492948073111701)>1e-8)throw Error('AA threshold calibration');
 const result=[];for(const sel of ['body','.stage','.hint','.btn:disabled','.btn:not(:disabled)','#langToggle button.active','.readout','a','.window-box','.start.exact','.start.excluded','.array-cell.current .array-value','th']){const e=document.querySelector(sel);if(!e)continue;const s=getComputedStyle(e);let bg=s.backgroundColor,parent=e;while(bg==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}const a=lum(s.color),b=lum(bg);result.push({selector:sel,color:s.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});}const s=getComputedStyle(document.querySelector('[data-lang=en]'));result.push({selector:'focus against panel',color:s.outlineColor,background:'rgb(22,27,34)',ratio:(Math.max(lum(s.outlineColor),lum('rgb(22,27,34)'))+.05)/(Math.min(lum(s.outlineColor),lum('rgb(22,27,34)'))+.05)});return result;
});assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(u=>u.startsWith(BASE+'/')||u.startsWith('data:')||u.startsWith('file:')));
fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({kind:'author browser self-check',result:'pass',browser:await browser.version(),host:process.platform,errors,siblingWarnings,requests:[...new Set(requests)],observations,layouts,contrast,focus,zoom:'CSS root zoom 2, Chromium',capture:'Focused stage PNGs hide sticky nav using screenshot-only CSS to avoid tall-element capture overlay; viewport/page captures and navigation tests retain nav',limits:['No physical device testing','No independent review, learner study, public deployment or LeetCode submission']},null,2));
await browser.close();console.log('Browser self-check passed');
})().catch(e=>{console.error(e);process.exit(1);});
