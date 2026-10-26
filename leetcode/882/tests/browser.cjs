const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const mirror={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),mirror);assert.equal(mirror.window.PYTHON_SOURCE,source);
// Detect dictionary duplicates before JavaScript evaluation can overwrite one.
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8'),keys=[...copy.matchAll(/(?:^|[,\n])\s*(\w+):\[/g)].map(x=>x[1]);assert.equal(keys.length,new Set(keys).size);const context={window:{}};vm.runInNewContext(copy,context);assert.equal(keys.length,Object.keys(context.window.COPY).length);for(const pair of Object.values(context.window.COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await ctx.newPage();const errors=[],requests=[],semantics=[],screens=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+' '+r.status());});page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/leetcode/882/');await page.locator('#handRead').filter({hasText:'3'}).waitFor();
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  const tr=context.window.COPY;const ix=lang==='zh'?0:1;
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),tr.formula[ix]);
  await page.setViewportSize({width:390,height:900});await page.locator('#step0').screenshot({path:path.join(out,`${lang}-hand.png`)});
  await page.locator('#budget').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#budget').inputValue(),'3');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#budget').inputValue(),'2');
  await page.locator('[data-lang=zh]').focus();await page.keyboard.press('Tab');assert(await page.locator('[data-lang=en]').evaluate(e=>document.activeElement===e));
  for(const m of [0,1,2,3,4,6,2]){await page.locator('#budget').fill(String(m));assert((await page.locator('#handRead').textContent()).includes(String(Math.min(5,m+1))));assert.equal(await page.locator('.chain-item.reached').count(),Math.min(5,m+1));}
  for(const [i,answer] of [3,13,23,1,1,1].entries()){
   await page.selectOption('#preset',String(i));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   await page.click('#next');const frame=await page.locator('#nodes').textContent();assert((await page.locator('#frameRead').textContent()).includes('0'));assert.equal(await page.locator('.node.current b').textContent(),tr.current[ix]);
   await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#nodes').textContent(),frame);
   while(await page.locator('#next').isEnabled())await page.click('#next');
   assert.equal(await page.locator('#total').textContent(),tr.total[ix].replace('{total}',String(answer)));assert(await page.locator('#end').isDisabled());
   await page.click('#prev');await page.click('#end');assert.equal(await page.locator('#total').textContent(),tr.total[ix].replace('{total}',String(answer)));
   await page.click('#reset');assert(await page.locator('#prev').isDisabled());assert((await page.locator('#total').textContent()).includes('0'));
  }
  for(const option of [0,1,2]){
   await page.locator(`[name=prediction][value="${option}"]`).check();assert.equal(await page.locator('#feedback').textContent(),tr.waiting[ix]);await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes(tr.explain[ix]));
   if(option===2)await page.locator('#step3').screenshot({path:path.join(out,`${lang}-revealed.png`)});
   const f=await page.locator('#feedback').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`[name=prediction][value="${option}"]`).isChecked());assert((await page.locator('#feedback').textContent()).includes(tr.explain[1-ix]));await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#feedback').textContent(),f);
  }
  semantics.push({locale:lang,formula:await page.locator('[data-i18n=formula]').textContent(),prediction:await page.locator('#feedback').textContent()});
  await page.click('#predictionReset');assert(await page.locator('#reveal').isDisabled());
  await page.selectOption('#preset','1');await page.click('#next');await page.click('#next');const nodes=await page.locator('#nodes').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#nodes').textContent(),nodes);assert.equal(await page.locator('#preset').inputValue(),'1');
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert.equal(await page.locator('#copyStatus').textContent(),tr.copied[ix]);
  const downloadPromise=page.waitForEvent('download');await page.click('a[download]');const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  // Reset and verify a fresh sentinel before EACH fallback attempt, then use Linux host Control+C.
  const sentinel=`fallback-sentinel-${lang}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('test denial'));});
  await page.click('#copy');assert.equal(await page.locator('#copyStatus').textContent(),tr.fallback[ix]);assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e));
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);
  await page.keyboard.press('Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  semantics.push({locale:lang,fallback:await page.locator('#copyStatus').textContent(),manualTransfer:'exact source after fresh sentinel; Linux Control+C'});
  await page.click('#copy');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});await page.locator('#step2').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const fit=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {available:e.getBoundingClientRect().width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-2-16,labels:[...e.options].map(o=>({text:o.text,width:c.measureText(o.text).width}))};});assert(fit.labels.every(o=>o.width<=fit.available),JSON.stringify(fit));
   for(const el of await page.locator('#nodes .node').all()){const box=await el.boundingBox();assert(box.width>=150);}
   if(width===320||width===1440){await page.locator('#nodes').screenshot({path:path.join(out,`${lang}-${width}-nodes.png`)});await page.click('#end');await page.locator('#ledger').screenshot({path:path.join(out,`${lang}-${width}-ledger.png`)});await page.click('#reset');await page.click('#next');await page.click('#next');}
   const file=`${lang}-${width}-trace.png`;await page.screenshot({path:path.join(out,file)});screens.push(file);
  }
  await page.setViewportSize({width:640,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#nodes').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const file=`${lang}-zoom200.png`;await page.screenshot({path:path.join(out,file)});screens.push(file);await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.setViewportSize({width:390,height:900});await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});
  // Real keyboard action and visible focus; links lead to actual sections in this lesson.
  await page.locator('.related a').first().focus();await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#step2');await page.waitForTimeout(250);
  await page.locator('.related a').nth(1).focus();await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#step1');
  const related=await ctx.newPage();await related.goto(base+'/leetcode/778/#step2');assert(await related.locator('#step2').count());const destination=await related.locator('#step2').textContent();assert(destination.includes('max(cost')||destination.includes('max(cost, H[v])'));await related.close();
  await page.locator('#copy').focus();const focus=await page.locator('#copy').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.style,'solid');assert.equal(focus.width,'3px');
 }
 // Storage denial still initializes and switches languages without page error.
 const denied=await ctx.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied');}});});await denied.goto(base+'/leetcode/882/');await denied.click('[data-lang=zh]');assert((await denied.locator('#handRead').textContent()).includes('3'));await denied.close();
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 await page.goto(base+'/leetcode/882/');
 const renderedPairs=await page.evaluate(()=>['body','.stage','.explain','.hint','.btn.primary','#prev','#nodes .node'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let p=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {selector,color:s.color,background:bg,opacity:s.opacity};}));
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good','bad'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));}).catch(()=>null);
 function luminance(hex){const a=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
 assert.equal(luminance('#000000'),0);assert.equal(luminance('#ffffff'),1);assert.equal(luminance('#ff0000'),.2126);assert.equal(luminance('#00ff00'),.7152);assert.equal(luminance('#0000ff'),.0722);assert(Math.abs((luminance('#747474')+.05)/.05-4.492948)<.00001);
 const contrast=[];const palette={bg:'#0d1117',panel:'#161b22',panel2:'#1c2330',text:'#e8edf4',muted:'#9aa7b8',accent:'#6ee7ff',accent2:'#ffb454'};
 for(const fg of ['text','muted','accent','accent2'])for(const bg of ['bg','panel','panel2']){const a=luminance(palette[fg]),b=luminance(palette[bg]),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);contrast.push({fg,bg,ratio});}
 for(const pair of renderedPairs){const hex=rgb=>'#'+rgb.match(/\d+/g).slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');const a=luminance(hex(pair.color)),b=luminance(hex(pair.background));pair.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(pair.ratio>=4.5);assert.equal(pair.opacity,'1');}
 assert(Math.abs((luminance('#ffffff')+.05)/.05-21)<1e-10);
 const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base)||u.startsWith('data:')));
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({kind:'author self-check',status:'pass',host:process.platform,errors,requests:[...new Set(requests)],semantics,screens,contrast,renderedPairs,cssBytes,zoom:'CSS zoom 2 at 640px viewport (320px layout width); physical devices untested',relatedLinks:'local #step2 overlap explanation and #step1 BFS baseline; ../778/#step2 inspected in both locales, explains max(cost,H[v]) bottleneck relaxation and minimum-candidate finalization (distinct from additive distance here)',source:'mirror/rendered/copy/download/manual exact equality',colors},null,2));
 await browser.close();console.log('browser author checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
