const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/810/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const presets=[[1,2],[1,1,2],[0,1],[1,2,3],[1],[0],[2,2,3,3]],expected=[true,false,true,true,false,true,true];
const bx=a=>Array.from({length:16},(_,i)=>a.reduce((s,v)=>s+Math.floor(v/2**i)%2,0)%2*2**i).reduce((a,b)=>a+b,0);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}}),page=await ctx.newPage();
 const report={errors:[],assetErrors:[],external:[],bindings:[],layouts:[],states:0,host:process.platform,fallback:[],related:[],relatedAssetErrors:[],relatedConsoleErrors:[]};
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')(page.url().includes('/leetcode/810/')?report.errors:report.relatedConsoleErrors).push({message:m.text(),location:m.location()});});page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).origin!==new URL(url).origin)report.external.push(r.url());});page.on('response',r=>{if(r.status()>=400)(page.url().includes('/leetcode/810/')?report.assetErrors:report.relatedAssetErrors).push([r.status(),r.url()]);});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>10);assert.equal(await page.locator('#pythonSource').textContent(),source);
 async function boardCheck(a,turn,lang,done){
  assert.deepEqual(await page.locator('#board button').evaluateAll(es=>es.map(e=>Number(e.dataset.id))),a.map(v=>v.id));
  const x=bx(a.map(v=>v.value));assert.equal(await page.locator('#summary').textContent(),lang==='en'?`Remaining n=${a.length}; current X=${x}; ${turn} numbers erased.`:`剩余 n=${a.length}；当前 X=${x}；已擦 ${turn} 个数。`);
  for(const v of a){const after=bx(a.filter(w=>w.id!==v.id).map(v=>v.value)),status=done?(lang==='en'?'game ended':'已终局'):after===0?(lang==='en'?'loses now':'立即输'):(lang==='en'?'safe':'安全');
   assert.equal(await page.locator(`[data-id="${v.id}"]`).textContent(),lang==='en'?`Index ${v.id}, value ${v.value}; child X′=${after}; ${status}`:`下标 ${v.id}，值 ${v.value}；擦后 X′=${after}；${status}`);
  }
  assert.equal(await page.locator('#next').isDisabled(),done);assert.equal(await page.locator('#end').isDisabled(),done);assert.equal(await page.locator('#history li').count(),turn+1);report.states++;
 }
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);const title=lang==='en'?'#810 · Chalkboard XOR Game':'#810 · 黑板异或游戏';assert.equal(await page.locator('h1').textContent(),title);assert.equal(await page.title(),title);
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),lang==='en'?'Alice wins ⇔ (X = 0) OR (n is even)':'Alice 赢 ⇔ (X = 0) 或 (n 为偶数)');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));assert.equal(await page.locator('#preset option:checked').textContent(),'['+presets[p].join(',')+']');
   let a=presets[p].map((value,id)=>({value,id})),turn=0,done=bx(presets[p])===0;await boardCheck(a,turn,lang,done);
   while(!done){const x=bx(a.map(v=>v.value)),v=a.find(v=>(x^v.value)!==0)||a[0];a=a.filter(w=>w.id!==v.id);turn++;done=bx(a.map(v=>v.value))===0;
    await page.click('#next');await boardCheck(a,turn,lang,done);
    const snap=await page.locator('#traceStage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#traceStage').textContent(),snap);
   }
   const winner=turn===0?'Alice':turn%2===1?'Bob':'Alice';assert.equal(winner,expected[p]?'Alice':'Bob');assert((await page.locator('#progress').textContent()).includes(winner));
   report.bindings.push({lang,preset:presets[p],state:'terminal',observed:await page.locator('#progress').textContent(),winner});
   if(turn){await page.click('#reset');assert(await page.locator('#prev').isDisabled());await page.click('#end');assert(await page.locator('#next').isDisabled());}
  }
  // Losing choice, rewind, safe alternative, and branch replacement.
  await page.selectOption('#preset','1');await page.click('[data-id="2"]');assert((await page.locator('#progress').textContent()).includes(lang==='en'?'Alice made X=0':'Alice 的擦除使 X=0'));
  report.bindings.push({lang,state:'unsafe erase 2 from [1,1,2]',observed:await page.locator('#progress').textContent(),history:await page.locator('#history').textContent()});
  await page.click('#prev');assert(!(await page.locator('#reset').isDisabled()));await page.click('#reset');assert(await page.locator('#reset').isDisabled());await page.click('#next');assert(!(await page.locator('#next').isDisabled()));await page.click('#prev');await page.click('[data-id="0"]');await boardCheck([{id:1,value:1},{id:2,value:2}],1,lang,false);assert.equal(await page.locator('#history li').count(),2);
  await page.locator('[data-id="1"]').focus();await page.evaluate(l=>document.querySelector(`[data-lang=${l}]`).click(),lang==='en'?'zh':'en');assert.equal(await page.evaluate(()=>document.activeElement.dataset.id),'1');await page.evaluate(l=>document.querySelector(`[data-lang=${l}]`).click(),lang);
  const snap=await page.locator('#traceStage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#traceStage').textContent(),snap);
  await page.locator('#board').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`board-${lang}.png`)});
  await page.click('#handReveal');assert(await page.locator('#hand').isVisible());await page.click('#handReveal');assert(await page.locator('#hand').isHidden());
  for(const ch of ['0','1','2']){
   await page.check(`input[name=prediction][value="${ch==='0'?'1':'0'}"]`);await page.check(`input[name=prediction][value="${ch}"]`);assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is':'答案是'));
   await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is no':'答案是不能'));assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),ch==='1');
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`input[value="${ch}"]`).isChecked());assert((await page.locator('#feedback').textContent()).includes(lang==='en'?'答案是不能':'The answer is no'));await page.click(`[data-lang=${lang}]`);
  }
  await page.check('input[value="1"]');assert(!(await page.locator('#feedback').textContent()).includes(lang==='en'?'The answer is':'答案是'));await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();await page.click('#reset');assert.equal(await page.locator('#feedback').textContent(),feedback);await page.selectOption('#preset','0');assert.equal(await page.locator('#feedback').textContent(),feedback);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const dl=page.waitForEvent('download');await page.click('#download');assert.equal(fs.readFileSync(await (await dl).path(),'utf8'),source);
 }
 for(const lang of ['en','zh'])for(let attempt=0;attempt<2;attempt++){
  await page.click(`[data-lang=${lang}]`);const sentinel=`810-${lang}-${attempt}-distinct-sentinel`;
  await page.evaluate(async s=>{delete navigator.clipboard.writeText;await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw Error('forced denial');}}));await page.click('#copy');
  assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
  const key=process.platform==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(key);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);report.fallback.push({lang,attempt,sentinel,key,verified:true,text:await page.locator('#copyStatus').textContent()});
 }
 await page.evaluate(()=>{delete navigator.clipboard.writeText;});
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','1');
  for(const width of [320,390,736,1440])for(const zoom of [1,2]){
   await page.setViewportSize({width,height:1000});await page.evaluate(z=>{document.documentElement.style.zoom=String(z);dispatchEvent(new Event('resize'));},zoom);
   await page.locator('#preset').scrollIntoViewIfNeeded();await page.waitForTimeout(150);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const fit=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:c.measureText(e.selectedOptions[0].text).width,width:e.clientWidth,pad:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)};});assert(fit.text+fit.pad+24<=fit.width);
   assert(await page.locator('#board button').evaluateAll(es=>es.every(e=>e.scrollWidth<=e.clientWidth+1)));
   await page.screenshot({path:path.join(out,`controls-${lang}-${width}-z${zoom}.png`)});await page.locator('#board').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`tiles-${lang}-${width}-z${zoom}.png`)});report.layouts.push({lang,width,zoom,fit});
  }
  await page.evaluate(()=>document.documentElement.style.zoom='');await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`heading-${lang}.png`)});
  assert.equal(await page.locator('h1').textContent(),lang==='en'?'#810 · Chalkboard XOR Game':'#810 · 黑板异或游戏');await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`prediction-${lang}.png`)});
  // Read actual related destinations, with localized labels and keyboard activation.
  for(const key of ['rel1','rel2']){const a=page.locator(`[data-i18n=${key}]`),href=await a.getAttribute('href');report.related.push({lang,label:await a.textContent(),href});await a.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+(key==='rel1'?'782':'51')+'/#step1');const target=await page.locator('#step1').textContent();assert(target.includes(key==='rel1'?'XOR':lang==='en'?'column':'列'));report.related.at(-1).destinationExcerpt=target.slice(0,1000);await page.goto(url);await page.click(`[data-lang=${lang}]`);}
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('#next').focus();const before=await page.locator('#summary').textContent();await page.keyboard.press('Enter');assert.notEqual(await page.locator('#summary').textContent(),before);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 report.focus=await page.locator('#reset').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(report.focus.width,'3px');
 await page.click('.step-nav a[href="#step2"]');await page.waitForTimeout(700);assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('https:'))continue;const u=new URL(href,url),r=await ctx.request.get(u.href.split('#')[0]);assert.equal(r.status(),200,u.href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`));
 }
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2','good'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});
 function lum(h){const v=h.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
 assert.equal(lum('000000'),0);assert.equal(lum('ffffff'),1);assert.equal(lum('ff0000'),.2126);assert.equal(lum('00ff00'),.7152);assert.equal(lum('0000ff'),.0722);assert.equal((lum('ffffff')+.05)/.05,21);assert(Math.abs((lum('747474')+.05)/.05-4.492948)<.000001);
 report.contrast=[];for(const [a,b] of [['text','panel2'],['text','panel'],['muted','panel2'],['muted','panel'],['muted','bg'],['accent','bg'],['accent','panel'],['accent2','panel2'],['accent2','bg'],['good','panel2'],['bg','accent']]){const x=lum(colors[a].slice(1)),y=lum(colors[b].slice(1)),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05);assert(ratio>=4.5);report.contrast.push({a,b,ratio});}
 report.fontStack=await page.locator('body').evaluate(e=>getComputedStyle(e).fontFamily);report.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(report.cssBytes<25000);
 const controls=await page.locator('button,select').evaluateAll(es=>es.map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert(controls.every(c=>c.h>=48));report.controls=controls;
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));const bp=await blocked.newPage();await bp.goto(url);await bp.click('[data-lang=zh]');await bp.click('#next');assert((await bp.locator('#summary').textContent()).includes('已擦 1'));await blocked.close();report.blockedStorage=true;
 const offline=await browser.newContext({offline:true}),op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await op.click('#next');await offline.close();report.offline=true;
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.assetErrors,[]);assert.deepEqual(report.external,[]);assert(report.relatedAssetErrors.every(([status,u])=>status===404&&u.endsWith('/favicon.ico')));assert(report.relatedConsoleErrors.every(e=>e.location.url.endsWith('/favicon.ico')));report.result='PASS';report.browser=await browser.version();report.zoom='CSS layout zoom at 200%; native browser zoom and real devices untested';fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,states:report.states,layouts:report.layouts.length,cssBytes:report.cssBytes}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
