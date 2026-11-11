'use strict';
// Real-browser author check. Needs a running static server (PREVIEW_ROOT, default http://127.0.0.1:18770) and Playwright via NODE_PATH.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence','run');
const URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1121/';fs.mkdirSync(O,{recursive:true});
const entry=JSON.parse(fs.readFileSync(path.join(R,'lesson-entry.json'),'utf8')),source=fs.readFileSync(path.join(R,'solution.py'),'utf8');
const C=require(path.join(R,'core.js'));
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],bad=[],external=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#progress').filter({hasText:/0/}).waitFor();
 await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const report={checkedAt:new Date().toISOString(),browser:await browser.version(),host:process.platform,presets:[],geometry:[],feedback:[]};
 const snap=async()=>JSON.stringify(await page.locator('#event,#progress,#mRun,#mMost,#mAnswer,#array,#piles').allTextContents());
 const pileRows=async()=>page.locator('#piles .pile .chips').evaluateAll(rs=>rs.map(r=>[...r.children].map(c=>Number(c.textContent))));
 const walkToEnd=async()=>{let n=0;while(await page.locator('#next').isEnabled()){await page.locator('#next').click();n++;}return n;};
 const enter=async(nums,k)=>{await page.locator('#numsInput').fill(nums);await page.locator('#kInput').fill(k);await page.locator('#apply').click();};
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert.equal(await page.locator('h1').textContent(),'#1121 · '+entry.title[lang]);assert((await page.title()).includes(entry.title[lang]));
  // Presets: walk every frame forward, rewind, replay; final piles equal the core's.
  for(const [i,p] of C.presets.entries()){
   await page.locator(`#presets [data-preset="${i}"]`).click();assert(await page.locator('#prev').isDisabled());
   assert.equal(await page.locator(`#presets [data-preset="${i}"]`).getAttribute('aria-pressed'),'true');
   const initial=await snap();await page.locator('#next').click();const first=await snap();await page.locator('#prev').click();assert.equal(await snap(),initial);await page.locator('#next').click();assert.equal(await snap(),first);
   const steps=await walkToEnd()+1,tr=C.trace(p.nums,p.k);assert.equal(steps,tr.length-1);
   assert.deepEqual(await pileRows(),tr.at(-1).piles);
   const ans=await page.locator('#mAnswer').textContent();assert.equal(ans,String(tr.at(-1).answer));
   assert.equal(await page.locator('#piles .pile.short').count(),tr.at(-1).piles.filter(x=>x.length<p.k).length);
   const terminal=await snap();while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();assert.equal(await snap(),initial);
   await page.locator('#end').click();assert.equal(await snap(),terminal);await page.locator('#reset').click();assert.equal(await snap(),initial);
   report.presets.push({lang,nums:p.nums.join(','),k:p.k,steps,answer:tr.at(-1).answer});
  }
  // Middle frames of the first preset: the second 1 makes the run 2; the bound frame says 2 x 3 = 6.
  await page.locator('#presets [data-preset="0"]').click();await page.locator('#next').click();await page.locator('#next').click();
  assert.equal(await page.locator('#mRun').textContent(),'2');assert.equal(await page.locator('#mMost').textContent(),'2');assert.equal(await page.locator('#array .cell.current .v').textContent(),'1');
  for(let i=0;i<5;i++)await page.locator('#next').click();assert((await page.locator('#event').textContent()).includes('6'));
  assert((await page.locator('#greedy').textContent()).includes('[1, 2, 3, 4] + [1, 2]'));
  // Custom input, including the prediction's array, and every invalid kind keeps the display.
  await enter('1 2 2 3 3 3 4 5 6 7','3');await page.locator('#end').click();assert.deepEqual(await pileRows(),[[1,3,4,7],[2,3,5],[2,3,6]]);
  const kept=await snap();
  for(const [nums,k,kind] of [['3, 1','1','sorted'],['1, 100','1','value'],['1, 2','3','k'],['','1','length'],['1, x','1','value']]){
   await enter(nums,k);assert(await page.locator('#inputError').isVisible(),kind);assert.equal(await snap(),kept);
   assert.equal(await page.locator(kind==='k'?'#kInput':'#numsInput').getAttribute('aria-invalid'),'true');
  }
  await page.locator('#numsInput').fill('4,4,5');await page.locator('#kInput').fill('1');await page.locator('#kInput').press('Enter');
  assert(await page.locator('#inputError').isHidden());await walkToEnd();assert.deepEqual(await pileRows(),[[4,5],[4]]);
  // Prediction: hidden until Reveal, cleared on change.
  for(const o of [0,2,1]){await page.locator(`[name=prediction][value="${o}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('9 ≤ 10'));
   await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();assert(fb.includes('9 ≤ 10'));assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),o===1);report.feedback.push({lang,o,fb});}
  // Locale switch keeps state.
  await page.locator('#presets [data-preset="2"]').click();for(let i=0;i<12;i++)await page.locator('#next').click();
  const prog=await page.locator('#progress').textContent(),other=lang==='en'?'zh':'en';
  await page.locator(`[data-lang=${other}]`).click();assert(await page.locator('[name=prediction][value="1"]').isChecked());
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#progress').textContent(),prog);
  // Source, download, clipboard, fallback.
  assert.equal(await page.locator('#code').textContent(),source);
  const dl=page.waitForEvent('download');await page.locator('#download').click();const d=await dl;const file=path.join(O,`download-${lang}.py`);await d.saveAs(file);assert.equal(fs.readFileSync(file,'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();
  await page.locator('#copyStatus').filter({hasText:lang==='en'?'Copied.':'已复制。'}).waitFor();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);},`1121-${lang}-${Date.now()}`);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'hidden'});
  // Keyboard.
  await page.locator('#presets [data-preset="0"]').click();await page.locator('#next').click();await page.locator('#prev').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
  assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('2/'));
  // Layout at three widths with the longest custom array.
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});
   await enter(Array.from({length:24},(_,i)=>90+Math.floor(i/3)).join(', '),'3');for(let i=0;i<40;i++)await page.locator('#next').click();
   const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth,wide:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&!e.closest('pre,.step-nav-inner');}).map(e=>e.tagName+'#'+e.id+'.'+e.className).slice(0,5)}));
   assert(g.scroll<=g.inner+1,JSON.stringify({lang,width,g}));assert.deepEqual(g.wide,[],JSON.stringify({lang,width}));report.geometry.push({lang,width,...g});
   for(const id of ['step3','step5','step6']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.locator('#'+id+' .stage').screenshot({path:path.join(O,`${lang}-${width}-${id}.png`)});}
   const sizes=await page.locator('button:visible,summary:visible,input[type=text]:visible,.back-link,.official-link,.related a,#download,.step-nav a,.prediction-options label').evaluateAll(es=>es.map(e=>({t:(e.id||e.textContent).trim().slice(0,30),h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})));
   for(const c of sizes)assert(c.h>=48&&c.w>=44,JSON.stringify({width,c}));
   await page.locator('#presets [data-preset="0"]').click();
  }
  await page.setViewportSize({width:1280,height:900});
 }
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));
 const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();assert((await p2.locator('#progress').textContent()).includes('1/'));assert.deepEqual(e2,[]);
 const p3=await browser.newPage();await p3.goto('file://'+path.join(R,'index.html'));await p3.locator('#next').click();assert.equal(await p3.locator('#code').textContent(),source);
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(O,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();
 console.log(JSON.stringify({presets:report.presets.length,geometry:report.geometry.length,feedback:report.feedback.length,errors}));
})().catch(e=>{console.error(e);process.exit(1);});
