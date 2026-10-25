'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const base=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const origin=process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18770',url=origin+'/leetcode/850/';
const source=fs.readFileSync(path.join(base,'solution.py'),'utf8');
function lum(c){const x=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return x[0]*.2126+x[1]*.7152+x[2]*.0722;}
function contrast(a,b){a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce',permissions:['clipboard-read','clipboard-write']});
const page=await ctx.newPage(),errors=[],assets=[],remote=[],semantic=[],fits=[],screens=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)assets.push(r.url());});page.on('request',r=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))remote.push(r.url());});
await page.goto(url);await page.locator('#progress').filter({hasText:/0\/3/}).waitFor();assert.equal(await page.locator('#pythonCode').textContent(),source);
const expected=[5,6,4,4,4,2],deltas=[[2,2,1],[2,3,1],[4],[4],[2,2],[1,0,1]];let transitions=0;
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();
 await page.locator('#toggleB').click();assert.match(await page.locator('#handResult').textContent(),/4/);await page.locator('#toggleB').click();assert.match(await page.locator('#handResult').textContent(),/5/);
 for(let p=0;p<6;p++){
  await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#rows tr').count(),0);
  while(!await page.locator('#next').isDisabled()){
   await page.locator('#next').click();transitions++;
   const state=await page.locator('#metric').textContent(),rows=await page.locator('#rows').innerHTML();
   const area=Number(await page.locator('#rows tr:last-child td:last-child').textContent());assert.match(state,new RegExp(String(area)));const k=Number(await page.inputValue('#position'));assert.equal(Number(await page.locator('#rows tr:last-child td:nth-child(3)').textContent()),deltas[p][k-1]);assert.equal(area,deltas[p].slice(0,k).reduce((a,b)=>a+b,0));
   await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#metric').textContent(),state);assert.equal(await page.locator('#rows').innerHTML(),rows);
  }
  assert.equal(Number(await page.locator('#rows tr:last-child td:last-child').textContent()),expected[p]);
  while(!await page.locator('#prev').isDisabled()){await page.locator('#prev').click();transitions++;}
  await page.locator('#next').click();await page.locator('#reset').click();assert.equal(await page.inputValue('#position'),'0');assert.equal(await page.locator('#rows tr').count(),0);
 }
 for(const val of ['0','1','2']){await page.locator(`[name=prediction][value="${val}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();assert.match(text,val==='1'?/Correct prediction|预测正确/:/Check which|再看/);assert.match(text,/2×4=8/);semantic.push({lang,state:'prediction '+val,text});}
 await page.selectOption('#preset','0');await page.locator('#position').fill('2');assert.equal(await page.locator('#rows tr').count(),2);assert.match(await page.locator('#ranges').textContent(),/\[0,1\).*\[0,2\).*\[0,2\)/);semantic.push({lang,state:'A+B strip 2',metric:await page.locator('#metric').textContent(),ranges:await page.locator('#ranges').textContent()});
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const before=await page.evaluate(()=>({p:document.querySelector('#preset').value,k:document.querySelector('#position').value,choice:document.querySelector('[name=prediction]:checked').value,open:document.querySelector('#sourceDetails').open,revealed:!document.querySelector('#feedback').hidden}));
 await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.deepEqual(await page.evaluate(()=>({p:document.querySelector('#preset').value,k:document.querySelector('#position').value,choice:document.querySelector('[name=prediction]:checked').value,open:document.querySelector('#sourceDetails').open,revealed:!document.querySelector('#feedback').hidden})),before);
 await page.locator(`[data-lang=${lang}]`).click();await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 // Native clipboard success, then a fresh sentinel for EACH fallback attempt.
 await page.evaluate(()=>{if(window.originalClipboard)Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.originalClipboard});else window.originalClipboard=navigator.clipboard;});
 await page.locator('#copy').click();await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.match(/copied|已复制/));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const sentinel='850-'+lang+'-'+Date.now();await page.evaluate(v=>navigator.clipboard.writeText(v),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('test denial'))}}));
 await page.locator('#copy').click();await page.locator('#manualCopy').waitFor();assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.originalClipboard.readText()),source);
 semantic.push({lang,state:'clipboard denied',text:await page.locator('#copyStatus').textContent(),nativeTransferExact:true,sentinel});
 await page.screenshot({path:path.join(out,lang+'-fallback.png')});
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
}
await page.locator('[data-lang=en]').click();await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.inputValue('#position'),'1');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
const focus=await page.locator('#reset').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');assert(contrast(focus.color,'rgb(22,27,34)')>=3);
await page.locator('#position').focus();await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
 await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#position').fill('2');
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);const target=await page.locator('#step2').boundingBox();assert(target.y>=50&&target.y<140);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(let p=0;p<6;p++){
  await page.selectOption('#preset',String(p));const fit=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;const text=e.selectedOptions[0].textContent;return {text,width:e.clientWidth,textWidth:c.measureText(text).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font};});assert(fit.width>=fit.textWidth+fit.padding+24);fits.push({lang,width,...fit});
 }
 await page.selectOption('#preset','1');await page.locator('#position').fill('2');await page.locator('#chart').scrollIntoViewIfNeeded();
 const shot=lang+'-'+width+'-diagram.png';await page.screenshot({path:path.join(out,shot)});screens.push(shot);
 // Every populated diagram glyph remains at least 12 CSS pixels after viewBox scale.
 const geometry=await page.locator('#chart svg').evaluate(e=>{const r=e.getBoundingClientRect(),v=e.viewBox.baseVal;return {width:r.width,labelPixels:parseFloat(getComputedStyle(e.querySelector('text')).fontSize)*r.width/v.width};});assert(geometry.labelPixels>=12);
 await page.locator('#reveal').scrollIntoViewIfNeeded();await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.screenshot({path:path.join(out,lang+'-'+width+'-prediction.png')});
}
// Browser 200% page scale through CSS zoom and a 1280 px viewport: usable layout width 640px.
for(const lang of ['en','zh']){await page.setViewportSize({width:1280,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#chart').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.evaluate(()=>{const r=document.querySelector('#chart').getBoundingClientRect(),n=document.querySelector('.step-nav').getBoundingClientRect();scrollBy(0,r.top-n.height-16);});await page.screenshot({path:path.join(out,lang+'-zoom200.png')});await page.locator('#metric').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,lang+'-zoom200-ledger.png')});await page.evaluate(()=>document.documentElement.style.zoom='');}
await page.locator('#position').fill('0');const pairs=await page.evaluate(()=>{const selectors=['body','.explain','.hint','.btn.primary','#prev','.formula','.readout','th','.step-nav a','.lang-toggle button'];return selectors.map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let p=e,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;p=p.parentElement;}return {selector:sel,color:s.color,bg};});});
for(const pair of pairs){pair.ratio=contrast(pair.color,pair.bg);assert(pair.ratio>=4.5,JSON.stringify(pair));}
// The live focus and input hit areas, no external asset requests.
const buttons=await page.locator('button').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({id:e.id,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(buttons.every(x=>x.h>=48&&x.w>=48));
for(const href of await page.locator('.related a').evaluateAll(es=>es.map(e=>e.href))){const r=await ctx.request.get(href.split('#')[0]);assert.equal(r.status(),200);assert((await r.text()).includes('id="'+href.split('#')[1]+'"'));}
// File-open source works without a web server.
const offline=await ctx.newPage();await offline.goto('file://'+path.join(base,'index.html'));await offline.locator('#progress').filter({hasText:/0\/3/}).waitFor();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#next').click();assert.equal(await offline.inputValue('#position'),'1');await offline.close();
await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.locator('#position').fill('2');await page.locator('#chart').scrollIntoViewIfNeeded();const forcedText=await page.locator('#chart svg text:not(.cell-label)').first().evaluate(e=>getComputedStyle(e).fill);assert(contrast(forcedText,'rgb(255,255,255)')>=7);await page.locator('#chart').screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
// Storage-denied context and entirely offline reload after loading local assets.
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const dp=await denied.newPage();await dp.goto(url);await dp.locator('#progress').filter({hasText:/0\/3/}).waitFor();await dp.locator('[data-lang=zh]').click();assert.equal(await dp.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
await page.route('**/*',r=>r.abort());await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#pythonCode').textContent(),source); // already loaded: source display never fetches
await page.unroute('**/*');assert.deepEqual(errors,[]);assert.deepEqual(assets,[]);assert.deepEqual(remote,[]);
const result={status:'pass',transitions,errors,assets,remote,semantic,fits,contrast:pairs,focus,buttons,screens,browser:await browser.version(),platform:process.platform,zoom:'CSS zoom 2 at 1280px, equivalent 640px layout; not a physical device',limitations:['No real mobile hardware','No production delivery','No novice learning measurement','No independent review']};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({status:result.status,transitions,screens:screens.length,contrast:pairs}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
