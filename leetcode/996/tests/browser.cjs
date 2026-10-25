const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('assert');
const {presets,trace}=require('../core.js');
const P=path.resolve(__dirname,'..'),out=path.resolve(process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}}),page=await ctx.newPage();
 const errors=[],badAssets=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18799/')&&!r.url().startsWith('data:'))remote.push(r.url());});
 await page.goto('http://127.0.0.1:18799/leetcode/996/');await page.locator('#progress').filter({hasText:'0/'}).waitFor();
 const results={kind:'author self-check',host:process.platform,locales:[],screenshots:[],layout:[],clipboard:[],eventChecks:0};
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  assert.equal(await page.locator('#pythonSource').textContent(),source);
  const cost=await page.locator('[data-i18n=cost]').textContent();
  assert(cost.includes(lang==='en'?'Preprocessing takes O(n+k²)':'预处理 O(n+k²)'));
  for(const term of ['O(n)', 'O(k log k)', 'O(k²)', 'k≥1'])assert(cost.includes(term));
  results.locales.push({lang,cost});
  for(const [width,zoom] of [[390,1],[320,2]]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
   await page.locator('[data-i18n=cost]').scrollIntoViewIfNeeded();
   assert(await page.locator('[data-i18n=cost]').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}-cost.png`)});
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});
  await page.click('#handReveal');assert.equal(await page.locator('#hand').isVisible(),true);assert((await page.locator('#hand').textContent()).includes('18'));await page.click('#handReveal');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));const frames=trace(presets[p]).frames;
   for(let i=0;i<frames.length;i++){
    const f=frames[i];assert((await page.locator('#progress').textContent()).includes(`${i}/${frames.length-1}`));
    assert.deepStrictEqual(await page.locator('#path .tile').allTextContents(),f.path.map(String));
    assert.deepStrictEqual(await page.locator('#ledger li').allTextContents(),f.accepted.map(a=>'['+a.join(', ')+']'));
    assert.equal((await page.locator('#counts span').allTextContents()).join('|'),trace(presets[p]).values.map((v,j)=>`${v} → ${f.counts[j]}`).join('|'));
    const op=await page.locator('#operation').textContent();
    if(f.kind==='reject')assert(op.includes(String(f.sum))&&op.includes(lang==='en'?'not square':'不是平方数'));
    if(f.kind==='undo')assert(op.includes(lang==='en'?'return one copy':'归还一个副本'));
    results.eventChecks++;
    if(i<frames.length-1)await page.click('#next');
   }
   assert(await page.locator('#next').isDisabled());await page.click('#prev');const prevText=await page.locator('#progress').textContent();await page.click('#next');await page.click('#prev');assert.equal(await page.locator('#progress').textContent(),prevText);
   await page.click('#reset');assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#ledger li').count(),0);await page.click('#end');assert(await page.locator('#next').isDisabled());
  }
  for(let opt=0;opt<3;opt++){
   await page.check(`input[value="${opt}"][name=prediction]`);assert.equal(await page.locator('#feedback').isVisible(),false);await page.click('#reveal');const f=await page.locator('#feedback').textContent();assert(f.includes('[1,0,1]'));assert(f.startsWith(lang==='en'?(opt===2?'Correct':'Revise'):(opt===2?'预测正确':'需要修正')));
  }
  const state=await page.locator('#progress').textContent();const feedback=await page.locator('#feedback').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.locator('input[name=prediction]:checked').inputValue(),'2');assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#progress').textContent(),state);assert.equal(await page.locator('#feedback').textContent(),feedback);
  // Successful copy uses real browser clipboard.
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  // Seed and verify a distinct sentinel before EACH native fallback attempt.
  const sentinel=`clipboard-sentinel-${lang}-${Date.now()}`;
  await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('test denial');};});
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'Automatic copy unavailable':'自动复制不可用'));
  results.clipboard.push({lang,sentinelVerified:true,successfulCopy:true,nativeFallbackTransfer:true,shortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
  await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('#download')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.selectOption('#preset','3');await page.click('#next');await page.click('#next');
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
   await page.locator('#traceStage').scrollIntoViewIfNeeded();
   const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert(geometry.scroll<=geometry.width+1,JSON.stringify({lang,width,zoom,geometry}));
   for(const id of ['counts','path','operation'])assert(await page.locator('#'+id).evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   const name=`${lang}-${width}-zoom${zoom}.png`;await page.locator('#operation').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-170,behavior:'instant'}));await page.screenshot({path:path.join(out,name)});results.screenshots.push(name);results.layout.push({lang,width,zoom,geometry});
  }
  await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:390,height:900});
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#progress').textContent().then(x=>x.includes('3/')),true);
  const focus=await page.locator('#next').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.style,'solid');assert.equal(focus.width,'3px');
  await page.click('a[href="#step3"]');await page.waitForFunction(()=>{const t=document.getElementById('step3').getBoundingClientRect().top;return t>=80&&t<300;});const top=await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top);assert(top>=80&&top<300);
  results.locales.push({lang,presets:6,predictions:3,sourceParity:true,keyboard:true,anchor:true});
 }
 // Local deep links must resolve to real anchors.
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>h.includes('/#')))){
  const target=new URL(href,page.url());const response=await ctx.request.get(target.href.split('#')[0]);assert(response.ok());assert((await response.text()).includes(`id="${target.hash.slice(1)}"`));
 }
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});});const offline=await blocked.newPage();await offline.route('**/solution.py',r=>r.abort());await offline.goto(page.url());assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.click('[data-lang=zh]');assert.equal(await offline.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 assert.deepStrictEqual(errors,[]);assert.deepStrictEqual(badAssets,[]);assert.deepStrictEqual(remote,[]);
 results.errors=errors;results.badAssets=badAssets;results.remoteRequests=remote;results.blockedStorage=true;results.offlineMirror=true;
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();console.log('PASS real browser',results.eventChecks,'rendered events; 16 locale/width/zoom states; source/clipboard/download');
})().catch(e=>{console.error(e);process.exit(1);});
