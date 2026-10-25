const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const P=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status());});page.on('request',r=>requests.push(r.url()));
const base='http://127.0.0.1:18774/leetcode/514/';await page.goto(base);await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0'));
const result={presets:[],states:[],layouts:[],contrast:[]};
const read=()=>page.locator('#progress').textContent();
for(const lang of ['en','zh']){
 await page.click(`[data-lang=${lang}]`);
 assert((await page.locator('[data-i18n=formula]').textContent()).includes('previous[p] + min(|q−p|, n−|q−p|) + 1'));
 for(let i=0;i<7;i++){
  await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());
  const frames=await page.evaluate(()=>Trail.trace(...Trail.presets[Number(document.querySelector('#preset').value)]).frames);
  for(let j=1;j<frames.length;j++){
   await page.click('#next');const current=await read();assert(current.includes(String(Math.min(...Object.values(frames[j].costs)))));
   const snapshot=await page.locator('#ledger').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#ledger').textContent(),snapshot);
  }
  assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  await page.click('#reset');assert(await page.locator('#reset').isDisabled());await page.click('#end');assert(await page.locator('#next').isDisabled());
  await page.locator('#position').fill('0');assert(await page.locator('#prev').isDisabled());
  result.presets.push({lang,preset:i,frames:frames.length,status:'forward/back/replay/reset/end/range passed'});
 }
 await page.selectOption('#preset','1');await page.click('#end');
 const candidateText=await page.locator('#candidates').textContent();assert(candidateText.includes('6')&&candidateText.includes('5'));
 result.states.push({lang,input:'abxxcbx / bc',progress:await read(),candidates:candidateText});
 for(let choice=0;choice<3;choice++){
  await page.check(`[name=prediction][value="${choice}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert(await page.locator('#feedback').isVisible());const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('2+4+1=7')&&feedback.includes('4+1+1=6'));
  result.states.push({lang,choice,feedback});
 }
 const prior=await page.locator('#ledger').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert((await read()).includes('5'));await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#ledger').textContent(),prior);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copied=s;}}});});await page.click('#copy');assert.equal(await page.evaluate(()=>window.copied),source);assert(await page.locator('#manualCopy').isHidden());
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied');}}});});await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
 assert.deepEqual(await page.locator('#copyText').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);
 result.states.push({lang,copyFallback:await page.locator('#copyStatus').textContent()});
 await page.click('#sourceDetails summary');assert.equal(await page.locator('#pythonCode').textContent(),source);
 const downloadPromise=page.waitForEvent('download');await page.click('[download]');const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);await page.click('#sourceDetails summary');
 // Keyboard control and retained focus: tab from Previous to Next, then enter.
 await page.click('#reset');await page.click('#next');await page.focus('#prev');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');await page.keyboard.press('Enter');assert((await page.locator('#summary').textContent()).includes('2/2'));
 await page.focus('[data-lang=en]');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
}
// Audit all local href targets including cross-lesson anchors via actual responses.
for(const href of await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')))){
 if(href.startsWith('https:'))continue;const u=new URL(href,base);const response=await context.request.get(u.href.split('#')[0]);assert(response.ok(),u.href);if(u.hash)assert((await response.text()).includes(`id="${u.hash.slice(1)}"`),u.href);
}
for(const lang of ['en','zh'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
 await page.setViewportSize({width,height:950});await page.evaluate(z=>document.documentElement.style.zoom=z,zoom);await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','1');await page.click('#end');
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(150);
 const g=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,table:document.querySelector('#ledger').getBoundingClientRect().width,stage:document.querySelector('.stage').getBoundingClientRect().width}));assert(g.scroll<=g.width+1,JSON.stringify({lang,width,zoom,g}));
 result.layouts.push({lang,width,zoom,...g});
 if((width===390&&zoom===1)||(width===1440&&zoom===1)||(width===320&&zoom===2)){
  await page.locator('#summary').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}.png`),fullPage:false});
 }
}
await page.evaluate(()=>document.documentElement.style.zoom=1);await page.setViewportSize({width:1440,height:1000});await page.click('[data-lang=en]');
// Measured rendered palette contrast, including disabled/selected/focus and surfaces.
result.contrast=await page.evaluate(()=>{
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number)}function lum(a){return a.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0)}function ratio(a,b){const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
 return ['body','.explain','.hint','.btn:disabled','.btn.primary','.lang-toggle button.active','.ring-cell.live','th'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let bg=s.backgroundColor;let p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {selector,color:s.color,bg,ratio:ratio(s.color,bg)};});
});assert(result.contrast.every(c=>c.ratio>=4.5));
await page.focus('#prev');const focus=await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return {style:s.outlineStyle,width:s.outlineWidth,color:s.outlineColor}});assert.equal(focus.width,'3px');result.focus=focus;
// Storage denial and file:// offline source use the same local static assets.
const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}})});const offline=await denied.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto(base);await offline.click('[data-lang=zh]');assert((await offline.locator('h1').textContent()).includes('自由之路'));
await offline.goto('file://'+path.join(P,'index.html'));await offline.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);assert.equal(await offline.locator('#pythonCode').textContent(),source);
assert.equal(errors.length,0,errors.join('\n'));assert(requests.filter(u=>!u.startsWith('http://127.0.0.1:18774/')&&!u.startsWith('data:')).length===0);
result.errors=errors;result.assets='local only';result.source='display/copy/fallback selection/download exact';result.storage='denied storage and file:// offline passed';
result.cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(result.cssBytes<25000);
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({layouts:result.layouts.length,presets:result.presets.length,contrast:result.contrast,cssBytes:result.cssBytes,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
