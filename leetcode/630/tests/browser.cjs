/* Run: node leetcode/630/tests/browser.cjs; OUTPUT_DIR and PREVIEW_ROOT are optional. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18783')+'/leetcode/630/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const reports=[],errors=[],requests=[];
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url);});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.locator('#pythonCode').waitFor({state:'attached'});
 const setLang=async lang=>{await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');};
 for(const lang of ['en','zh']){
  await setLang(lang);
  await page.locator('#chooseB').click();assert.equal(await page.locator('#chooseB').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#handRead').textContent(),/6−4=2/);
  for(let preset=0;preset<5;preset++){
   await page.locator('#preset').selectOption(String(preset));
   assert(await page.locator('#tracePrev').isDisabled());
   const count=await page.locator('#courses .course').count();
   let snapshots=[];
   for(let k=0;k<=count;k++){
    assert.equal(await page.locator('#ledger li').count(),k);
    snapshots.push(await page.locator('#courses').textContent()+'|'+await page.locator('#schedule').textContent()+'|'+await page.locator('#frameRead').textContent());
    if(preset===0&&k===2){const text=await page.locator('#ledger li').nth(1).textContent();assert(text.includes('4+2=6'));assert(text.includes(lang==='en'?'remove longest #0 (4 days)':'删除最长 #0（4 天）'));assert(text.includes(lang==='en'?'processing 2 days':'处理后 2 天'));}
    if(k<count)await page.locator('#traceNext').click();
   }
   assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());
   assert.match(await page.locator('#frameRead').textContent(),new RegExp(lang==='en'?`retained ${[2,3,1,0,3][preset]}`:`保留 ${[2,3,1,0,3][preset]} 门`));
   for(let k=count;k>0;k--){await page.locator('#tracePrev').click();const snap=await page.locator('#courses').textContent()+'|'+await page.locator('#schedule').textContent()+'|'+await page.locator('#frameRead').textContent();assert.equal(snap,snapshots[k-1]);}
   await page.locator('#traceLast').click();await page.locator('#traceReset').click();assert.equal(await page.locator('#ledger li').count(),0);
  }
  for(const answer of ['2','3','4']){
   await page.locator(`input[value="${answer}"]`).check();assert(!await page.locator('#predictionFeedback').textContent().then(x=>x.includes('9>6')));
   await page.locator('#reveal').click();assert.match(await page.locator('#predictionFeedback').textContent(),/9>6/);
   assert.equal(await page.locator('#predictionFeedback').evaluate(e=>e.classList.contains('correct')),answer==='3');
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());
  reports.push(`${lang}: all 5 presets, all frames, rewind/reset/end, hand choice, all prediction choices`);
 }
 // Preserve independently held state across locale switches; do not use trace Reset to reset exercise.
 await page.locator('#preset').selectOption('0');await page.locator('#traceNext').click();await page.locator('#traceNext').click();
 await page.locator('input[value="3"]').check();await page.locator('#reveal').click();await setLang('en');
 assert.equal(await page.locator('#ledger li').count(),2);assert(await page.locator('input[value="3"]').isChecked());assert.match(await page.locator('#predictionFeedback').textContent(),/answer is 3/);
 assert.match(await page.locator('#ledger li').nth(1).textContent(),/4\+2=6 days, deadline 5; over deadline, remove longest #0 \(4 days\); total after processing 2 days/);
 await page.locator('input[value="2"]').check();assert(!await page.locator('#predictionFeedback').textContent().then(x=>x.includes('answer is')));
 await page.locator('#traceReset').click();assert(await page.locator('input[value="2"]').isChecked());
 await page.locator('#traceLast').click();
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.locator('#copyPython').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.includes('copied'));
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await setLang('zh');assert.match(await page.locator('#copyStatus').textContent(),/已复制/);await setLang('en');
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('intentional clipboard test');}}}));
 await page.locator('#copyPython').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
 assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[e.selectionStart,e.selectionEnd,document.activeElement===e]),[0,source.length,true]);
 await setLang('zh');assert.match(await page.locator('#copyStatus').textContent(),/手动复制/);assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await setLang('en');
 // A keyboard-only endpoint action and visible focus.
 await page.locator('#traceReset').focus();await page.keyboard.press('Enter');assert(await page.locator('#tracePrev').isDisabled());
 await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceNext');await page.keyboard.press('Enter');assert.equal(await page.locator('#ledger li').count(),1);
 const focus=await page.locator('#traceNext').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 await page.locator('#traceNext').click();
 // Representative semantic states + viewport layout, including actual CSS zoom in Chromium.
 for(const lang of ['en','zh']){
  await setLang(lang);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} overflow ${width}`);
   const geometry=await page.locator('#courses .course').evaluateAll(es=>es.map(e=>({w:e.clientWidth,scroll:e.scrollWidth})));
   assert(geometry.every(e=>e.scroll<=e.w));
   await page.locator('a[href="#step2"]').click();await page.waitForTimeout(80);
   assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));
   if(width===320||width===1440){await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});await page.locator('#step2 .stage').screenshot({path:path.join(out,`stage-${lang}-${width}.png`)});}
   if(width===320||width===390){for(let i=0;i<5;i++){await page.locator('#preset').selectOption(String(i));await page.locator('#traceLast').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const cards=await page.locator('#courses .course').evaluateAll(es=>es.map(e=>e.scrollWidth<=e.clientWidth));assert(cards.every(Boolean));}await page.locator('#preset').selectOption('0');await page.locator('#traceNext').click();await page.locator('#traceNext').click();}
   const targets=await page.locator('button,select,.prediction-options label').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({tag:e.tagName,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
   assert(targets.every(x=>x.h>=48));
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`zoom-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // All internal deep links resolve to actual anchors.
 for(const href of await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(h=>!h.startsWith('http')))){
  const dest=new URL(href,url);const res=await context.request.get(dest.href);assert(res.ok(),dest.href);
  if(dest.hash)assert((await res.text()).includes(`id="${dest.hash.slice(1)}"`),dest.href);
 }
 await page.locator('#traceReset').click();
 const colors=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
  const luminance=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const contrast=(a,b)=>(Math.max(luminance(rgb(a)),luminance(rgb(b)))+.05)/(Math.min(luminance(rgb(a)),luminance(rgb(b)))+.05);
  const pairs=[];for(const sel of ['body','.stage','.readout','.hint','.explain','.btn','.lang-toggle button.active','button:disabled','summary','pre']){
   const e=document.querySelector(sel),cs=getComputedStyle(e);let node=e,bg=cs.backgroundColor;
   while(bg==='rgba(0, 0, 0, 0)'&&node.parentElement){node=node.parentElement;bg=getComputedStyle(node).backgroundColor;}
   pairs.push({selector:sel,fg:cs.color,bg,ratio:contrast(cs.color,bg)});
  }
  const focus=getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim();
  pairs.push({selector:'focus on panel2',fg:focus,bg:'rgb(28,35,48)',ratio:contrast('rgb(255,180,84)','rgb(28,35,48)')});return pairs;
 });
 assert(colors.every(x=>x.ratio>=4.5),JSON.stringify(colors));
 // Missing storage and clipboard do not prevent startup.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage blocked');}});});
 const p2=await blocked.newPage();p2.on('pageerror',e=>errors.push(e.message));await p2.goto(url);await p2.locator('[data-lang=zh]').click();assert.equal(await p2.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 assert.equal(errors.length,0,JSON.stringify(errors));assert(requests.every(x=>x.startsWith(new URL(url).origin)),requests.join('\n'));
 await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();await page.keyboard.press('Tab');const forcedFocus=await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle);assert.notEqual(forcedFocus,'none');await page.emulateMedia({forcedColors:'none'});
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const copyFile=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copyFile.matchAll(/(?:^|[,{])\s*(\w+):\[/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
 const pairs=await page.evaluate(()=>Object.entries(window.LESSON_COPY).every(([k,v])=>Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==='string'&&x.length)));assert(pairs);
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author browser self-check',reports,source:'rendered, actual clipboard read, selected fallback, downloaded exact parity',state:'locale preservation, prediction invalidation, keyboard Enter and focus, blocked storage, local requests',widths:[320,390,736,1440],zoom:'200% CSS zoom in Chromium',contrast:colors,cssBytes,errors,result:'pass'},null,2)+'\n');
 await browser.close();console.log('PASS browser checks; screenshots require author visual inspection.');
})().catch(e=>{console.error(e);process.exit(1)});
