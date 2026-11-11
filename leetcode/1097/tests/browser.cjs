'use strict';
// Real-browser author check. Needs a running static server (PREVIEW_ROOT, default http://127.0.0.1:18770) and Playwright via NODE_PATH.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence','run');
const URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1097/';fs.mkdirSync(O,{recursive:true});
const entry=JSON.parse(fs.readFileSync(path.join(R,'lesson-entry.json'),'utf8')),source=fs.readFileSync(path.join(R,'solution.sql'),'utf8');
// Expected outputs are the hand/oracle values asserted in tests/test_solution.py.
const expected={main:[['2024-03-01','3','1','0.33'],['2024-03-02','2','1','0.50']],calendar:[['2023-12-31','1','1','1.00'],['2024-02-28','1','1','1.00'],['2024-02-29','1','1','1.00']],nobody:[['2024-05-05','2','0','0.00']]};
const innerMain=[['2024-03-01','1','1','1.00'],['2024-03-02','1','1','1.00']];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],bad=[],external=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#event').filter({hasText:/10/}).waitFor();
 await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const report={checkedAt:new Date().toISOString(),browser:await browser.version(),host:process.platform,presets:[],geometry:[],feedback:[]};
 const snap=async()=>JSON.stringify(await page.locator('#event,#progress,#activity,#installs,#output').allTextContents());
 const outputRows=async()=>(await page.locator('#output tr').evaluateAll(rs=>rs.map(r=>[...r.cells].map(c=>c.textContent.replace('▶ ','')))));
 const walkToEnd=async()=>{let n=0;while(await page.locator('#next').isEnabled()){await page.locator('#next').click();n++;}return n;};
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert.equal(await page.locator('h1').textContent(),'#1097 · '+entry.title[lang]);assert.equal(await page.title(),'1097 · '+entry.title[lang]);
  // Step 1 hand stepper
  await page.locator('#handReset').click().catch(()=>{});
  for(let i=0;i<5;i++)await page.locator('#handNext').click();
  assert.equal(await page.locator('#handList li').count(),5);assert(await page.locator('#handNext').isDisabled());assert((await page.locator('#handRead').textContent()).includes('0.33'));
  await page.locator('#handReset').click();assert.equal(await page.locator('#handList li').count(),0);
  // Step 3 marks
  if(await page.locator('#markToggle').getAttribute('aria-pressed')==='true')await page.locator('#markToggle').click();
  assert(await page.locator('#insightBlock').isHidden());await page.locator('#markToggle').click();
  assert.equal(await page.locator('#markTable tr.useful').count(),7);assert.equal(await page.locator('#markTable tr.dim').count(),3);assert(await page.locator('#insightBlock').isVisible());
  // Step 5: presets with LEFT JOIN, every endpoint, rewind/replay
  await page.locator('#joins [data-join=left]').click();
  for(const [i,key] of ['main','calendar','nobody'].entries()){
   await page.locator(`#presets [data-preset="${i}"]`).click();assert(await page.locator('#prev').isDisabled());
   const initial=await snap();await page.locator('#next').click();const first=await snap();await page.locator('#prev').click();assert.equal(await snap(),initial);await page.locator('#next').click();assert.equal(await snap(),first);
   const steps=await walkToEnd();assert.deepEqual(await outputRows(),expected[key]);const terminal=await snap();
   while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();assert.equal(await snap(),initial);
   await page.locator('#end').click();assert.equal(await snap(),terminal);await page.locator('#reset').click();assert.equal(await snap(),initial);
   report.presets.push({lang,key,steps});
  }
  // A middle frame: phase 1 replaces player 1's 03-05 with 03-01 (row 3).
  await page.locator('#presets [data-preset="0"]').click();for(let i=0;i<3;i++)await page.locator('#next').click();
  const ev=await page.locator('#event').textContent();assert(ev.includes('2024-03-01')&&ev.includes('2024-03-05'),ev);
  assert((await page.locator('#installs tr.current-row').textContent()).includes('2024-03-01'));
  // INNER JOIN wrong turn
  await page.locator('#joins [data-join=inner]').click();await walkToEnd();assert.deepEqual(await outputRows(),innerMain);
  assert.equal(await page.locator('#installs tr.removed').count(),3);
  await page.locator('#presets [data-preset="2"]').click();await walkToEnd();assert.equal(await page.locator('#output tr').count(),1);assert((await page.locator('#event').textContent()).length>5);
  await page.locator('#joins [data-join=left]').click();
  // Row toggle: removing player 1's 03-02 row (row 6) makes 03-01 retention 0.00; focus stays on the toggle.
  await page.locator('#presets [data-preset="0"]').click();await page.locator('#activity .row-toggle').nth(5).click();
  assert.equal(await page.evaluate(()=>document.activeElement.className),'btn row-toggle');
  await walkToEnd();assert.deepEqual(await outputRows(),[['2024-03-01','3','0','0.00'],['2024-03-02','2','1','0.50']]);
  await page.locator('#activity .row-toggle').nth(5).click();await walkToEnd();assert.deepEqual(await outputRows(),expected.main);
  // Removing every row gives an empty output.
  await page.locator('#presets [data-preset="2"]').click();for(let i=0;i<3;i++)await page.locator('#activity .row-toggle').nth(i).click();
  assert(await page.locator('#next').isEnabled());await walkToEnd();assert.equal(await outputRows().then(r=>r.length),1);assert(await page.locator('#prev').isEnabled());
  // Random table runs to the end with output matching the core oracle in-page.
  await page.locator('#randomTable').click();await walkToEnd();
  const inPage=await page.evaluate(()=>RetentionCore.result([...document.querySelectorAll('#activity tr')].map(r=>[...r.cells].map(c=>c.textContent)).map(c=>[Number(c[1]),Number(c[4]),c[2],Number(c[5])])));
  assert.deepEqual(await outputRows(),inPage.map(o=>[o.install_dt,String(o.installs),String(Math.round(Number(o.Day1_retention)*o.installs)),o.Day1_retention]));
  // Prediction
  for(const o of [0,1,2]){await page.locator(`[name=prediction][value="${o}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('1 / 2'));await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();assert(fb.includes('1 / 2 = 0.50'));report.feedback.push({lang,o,fb});}
  // Locale switch keeps state
  await page.locator('#presets [data-preset="0"]').click();for(let i=0;i<12;i++)await page.locator('#next').click();
  const prog=await page.locator('#progress').textContent(),other=lang==='en'?'zh':'en';
  await page.locator(`[data-lang=${other}]`).click();assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#insightBlock').isVisible());
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#progress').textContent(),prog);
  // Source, download, clipboard, fallback
  assert.equal(await page.locator('#code').textContent(),source);
  const dl=page.waitForEvent('download');await page.locator('#download').click();const d=await dl;const file=path.join(O,`download-${lang}.sql`);await d.saveAs(file);assert.equal(fs.readFileSync(file,'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();
  await page.locator('#copyStatus').filter({hasText:lang==='en'?'Copied.':'已复制。'}).waitFor();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  const sentinel=`1097-${lang}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'hidden'});
  // Keyboard
  await page.locator('#presets [data-preset="0"]').click();await page.locator('#next').click();await page.locator('#prev').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
  assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('2/'));
  // Layout
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});
   const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth,wide:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&!e.closest('.table-wrap,pre,.step-nav-inner');}).map(e=>e.tagName+'#'+e.id+'.'+e.className).slice(0,5)}));
   assert(g.scroll<=g.inner+1,JSON.stringify({lang,width,g}));assert.deepEqual(g.wide,[],JSON.stringify({lang,width}));report.geometry.push({lang,width,...g});
   await page.locator('#presets [data-preset="0"]').click();for(let i=0;i<13;i++)await page.locator('#next').click();
   for(const id of ['step1','step3','step5','step6']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.locator('#'+id+' .stage').screenshot({path:path.join(O,`${lang}-${width}-${id}.png`)});}
   const sizes=await page.locator('button:visible,summary:visible,.back-link,.official-link,.related a,#download,.step-nav a,.prediction-options label').evaluateAll(es=>es.map(e=>({t:(e.id||e.textContent).trim().slice(0,30),h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})));
   for(const c of sizes)assert(c.h>=48&&c.w>=44,JSON.stringify({width,c}));
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
