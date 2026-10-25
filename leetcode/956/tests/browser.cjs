const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const URL=process.env.PREVIEW_URL||'http://127.0.0.1:18788/leetcode/956/';
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
function luminance(rgb){const c=rgb.map(v=>{v/=255;return v<=0.04045?v/12.92:((v+.055)/1.055)**2.4});return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function contrast(a,b){const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (l[0]+.05)/(l[1]+.05);}
assert.equal(luminance([0,0,0]),0);assert.equal(luminance([255,255,255]),1);assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(luminance([255,0,0]),.2126);assert.equal(luminance([0,255,0]),.7152);assert.equal(luminance([0,0,255]),.0722);assert(Math.abs(contrast([116,116,116],[0,0,0])-4.492948)<.000001);
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
const page=await context.newPage();const errors=[],failed=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));page.on('request',r=>requests.push(r.url()));
await page.goto(URL);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
const results={status:'pass',host:process.platform,browser:browser.version(),viewports:[],clipboard:[],semantics:[],contrast:[]};
const expected=[3,6,10,0,0,2];
for(const lang of ['en','zh']){
 await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='en'?'#956 · Tallest Billboard':'#956 · 最高的广告牌');assert.equal(await page.title(),await page.locator('h1').textContent());
 for(let preset=0;preset<6;preset++){
  await page.selectOption('#preset',String(preset));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  const disabled=await page.locator('#prev').evaluate(e=>({opacity:getComputedStyle(e).opacity,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));assert.equal(disabled.opacity,'1');assert(contrast(disabled.color.match(/\d+/g).map(Number),disabled.bg.match(/\d+/g).map(Number))>=4.5);
  await page.click('#next');const next=await page.locator('#traceStage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#traceStage').textContent(),next);
  if(!await page.locator('#end').isDisabled())await page.click('#end');assert((await page.locator('#result').textContent()).includes(`= ${expected[preset]}`));assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  await page.click('#reset');assert((await page.locator('#progress').textContent()).includes('0/'));
 }
 await page.selectOption('#preset','0');await page.click('#next');await page.click('#next');await page.selectOption('#gap','1');assert((await page.locator('#compare').textContent()).includes('0 →'));assert((await page.locator('#compare').textContent()).includes('1'));
 results.semantics.push({lang,state:'[1,2,3], completed 2, gap1',observed:await page.locator('#compare').textContent(),candidates:await page.locator('#candidates').textContent()});
 for(const x of ['1','2','3','5']){await page.selectOption('#rodX',x);assert((await page.locator('#branch').textContent()).includes('h='+String(1+Math.min(2,+x))));}
 for(const option of ['0','1','2']){await page.check(`[name=prediction][value="${option}"]`);assert(!(await page.locator('#feedback').textContent()).includes('(1,8)'));await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes('(1,8)'));assert((await page.locator('#feedback').textContent()).includes(option==='1'?'✓':'×'));}
 await page.check('[name=prediction][value="1"]');await page.click('#reveal');const state=await page.locator('#traceStage').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.locator('#preset').inputValue(),'0');assert.equal(await page.locator('#gap').inputValue(),'1');assert(await page.locator('[value="1"][name=prediction]').isChecked());assert((await page.locator('#feedback').textContent()).includes('(1,8)'));await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#traceStage').textContent(),state);
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 await page.evaluate(()=>{window.denyCopy=false;if(!window.originalWrite){window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=(text)=>window.denyCopy?Promise.reject(new Error('test denial')):window.originalWrite(text);}});
 await page.evaluate(()=>navigator.clipboard.writeText('success-sentinel-'+document.documentElement.lang));await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Every fallback attempt has a fresh verified native clipboard sentinel.
 const sentinel=`fallback-${lang}-${Date.now()}`;await page.evaluate(s=>window.originalWrite(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);await page.evaluate(()=>window.denyCopy=true);await page.click('#copy');await page.locator('#manualSource').waitFor({state:'visible'});assert.equal(await page.locator('#manualSource').inputValue(),source);assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);results.clipboard.push({lang,sentinelVerified:true,automaticExact:true,nativeFallbackExact:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});await page.evaluate(()=>window.denyCopy=false);
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#download')]);const dest=path.join(OUT,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
 await page.click('#handReveal');assert(await page.locator('#hand').isVisible());await page.click('#handReveal');assert(await page.locator('#hand').isHidden());
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.selectOption('#preset','2');await page.click('#end');await page.selectOption('#gap','1');await page.locator('#traceStage').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} overflow ${width}`);
  const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:c.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font,fontStack:s.fontFamily};});assert(budget.text+budget.padding+24<budget.width,JSON.stringify(budget));
  await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`),fullPage:false});
  await page.locator('#compare').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-16,behavior:'instant'}));await page.waitForTimeout(100);await page.screenshot({path:path.join(OUT,`${lang}-${width}-witness.png`)});
  results.viewports.push({lang,width,budget});
 }
 await page.setViewportSize({width:640,height:900});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#traceStage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.locator('#compare').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-16,behavior:'instant'}));await page.waitForTimeout(100);await page.screenshot({path:path.join(OUT,`${lang}-zoom200-witness.png`)});await page.evaluate(()=>document.body.style.zoom='');
 await page.setViewportSize({width:390,height:900});await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-prediction.png`)});
}
await page.setViewportSize({width:1440,height:1000});await page.click('[data-lang=en]');await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(200);await page.screenshot({path:path.join(OUT,'desktop-heading.png')});
await page.locator('.step-nav a[href="#step2"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(500);const rect=await page.locator('#step2').boundingBox();assert(rect.y>=70&&rect.y<200,JSON.stringify(rect));
await page.locator('#prev').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');const focus=await page.locator('#next').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');await page.screenshot({path:path.join(OUT,'keyboard-focus.png')});results.focus=focus;
await page.setViewportSize({width:320,height:900});
for(const lang of ['zh','en','zh']){await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#956 · 最高的广告牌':'#956 · Tallest Billboard');assert.equal(await page.title(),await page.locator('h1').textContent());}
await page.click('[data-lang=en]');
const outlineRatio=contrast([255,180,84],[28,35,48]);assert(outlineRatio>=3);results.focusContrast=outlineRatio;
// Measure actual rendered solid text/background pairs; no translucent overlay text in this local design.
const pairs=await page.evaluate(()=>[...document.querySelectorAll('p,h1,h2,h3,a,button,select,label,legend,.state,.ledger-item,code,li')].filter(e=>e.getClientRects().length).map(e=>{let a=e,bg;while(a){const v=getComputedStyle(a).backgroundColor;if(v!=='rgba(0, 0, 0, 0)'){bg=v;break;}a=a.parentElement;}return {color:getComputedStyle(e).color,bg,text:e.textContent.slice(0,50)};}));
const seen=new Set();for(const p of pairs){const key=p.color+p.bg;if(seen.has(key))continue;seen.add(key);const parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const ratio=contrast(parse(p.color),parse(p.bg));assert(ratio>=4.5,JSON.stringify({p,ratio}));results.contrast.push({...p,ratio});}
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.screenshot({path:path.join(OUT,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
for(const [selector,fragment,needle] of [['[data-i18n=rel1]','step2','L[i]'],['[data-i18n=rel2]','step2','dp']]){
 const href=await page.locator(selector).getAttribute('href');const target=await context.newPage();await target.goto(new global.URL(href,URL).href);await target.waitForFunction(()=>document.querySelector('h1').textContent.length);for(const lang of ['zh','en']){await target.click(`[data-lang=${lang}]`);const section=await target.locator('#'+fragment).textContent();assert(section.includes(needle));results.semantics.push({related:href,lang,observed:section.slice(0,500)});}await target.close();
}
assert.equal(errors.length,0,errors.join('\n'));assert.equal(failed.length,0,failed.join('\n'));assert(requests.every(u=>u.startsWith('http://127.0.0.1:18788/')||u.startsWith('data:')));results.localRequests=requests;results.errors=errors;results.failed=failed;
await page.locator('[data-i18n=rel1]').focus();await page.keyboard.press('Enter');await page.waitForURL('**/805/#step2');assert((await page.locator('#step2').textContent()).includes('L[i]'));results.relatedKeyboard=true;
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('denied')}});});const dp=await denied.newPage();await dp.goto(URL);await dp.click('[data-lang=zh]');await dp.click('#next');assert((await dp.locator('#progress').textContent()).includes('1/3'));await dp.click('[data-lang=en]');assert((await dp.locator('#progress').textContent()).includes('1/3'));results.storageDenied=true;await denied.close();
// file:// source and trace work without fetch.
const offline=await context.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.click('#next');assert((await offline.locator('#progress').textContent()).includes('1/3'));results.offline=true;await offline.close();
results.cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(results.cssBytes<25000);
fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(results,null,2)+'\n');await browser.close();console.log(JSON.stringify({status:'pass',viewports:results.viewports.length,contrastPairs:results.contrast.length,cssBytes:results.cssBytes,clipboard:results.clipboard}));
})().catch(e=>{console.error(e);process.exit(1)});
