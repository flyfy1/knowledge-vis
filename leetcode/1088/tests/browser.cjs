'use strict';
// Real-browser author check. Needs a running static server (PREVIEW_ROOT, default http://127.0.0.1:18770) and Playwright via NODE_PATH.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence','run');
const URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1088/';fs.mkdirSync(O,{recursive:true});
const entry=JSON.parse(fs.readFileSync(path.join(R,'lesson-entry.json'),'utf8')),source=fs.readFileSync(path.join(R,'solution.py'),'utf8');
// Expected values come from tests/test_solution.py's independent oracle (and hand counts in the lesson).
const presetAnswers={70:10,6189:269,8250:394,1:0,10:3,69:10,1000000000:1950627};
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],bad=[],external=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith(new globalThis.URL(URL).origin)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(URL);await page.locator('#event').filter({hasText:/70/}).waitFor();
 await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 const report={checkedAt:new Date().toISOString(),browser:await browser.version(),host:process.platform,presets:[],geometry:[],feedback:[],controls:[]};
 const snap=async()=>JSON.stringify(await page.locator('#event,#progress,#mTurn,#mSame,#mAnswer,#nDigits,#sampleBox,#ledger').allTextContents());
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert.equal(await page.locator('h1').textContent(),'#1088 · '+entry.title[lang]);assert.equal(await page.title(),'1088 · '+entry.title[lang]);
  // Step 1 tool
  const turnRead=async v=>{await page.fill('#turnInput',v);return page.locator('#turnRead').textContent();};
  let s=await turnRead('10');assert(s.includes('01')&&s.includes(' 1'),s);
  s=await turnRead('69');assert(s.includes('69'));assert.equal(await page.locator('#turnTo .digit').count(),2);
  s=await turnRead('25');assert.equal(await page.locator('#turnTo .digit.bad').count(),2);
  s=await turnRead('abc');assert.equal(await page.locator('#turnInput').getAttribute('aria-invalid'),'true');assert(s.includes('1000000000'));
  await page.locator('#turnPresets button[data-x="8916"]').click();assert((await page.locator('#turnRead').textContent()).includes('9168'));
  // Step 3 grid and reveal
  await page.fill('#gridInput','70');if(await page.locator('#gridToggle').getAttribute('aria-pressed')==='true')await page.locator('#gridToggle').click();assert((await page.locator('#gridRead').textContent()).includes('14'));
  assert.equal(await page.locator('#grid .cell').count(),70);assert.equal(await page.locator('#grid .cell.turnable').count(),14);assert(await page.locator('#splitBlock').isHidden());
  await page.locator('#gridToggle').click();assert.deepEqual(await page.locator('#grid .cell.self').allTextContents(),['↺1','↺8','↺11','↺69']);assert(await page.locator('#splitBlock').isVisible());
  assert.equal(await page.locator('#grid .cell').nth(65).getAttribute('class'),'cell turnable');// 66 stays confusing
  await page.fill('#gridInput','300');assert.equal(await page.locator('#grid .cell.self').count(),9);
  await page.fill('#gridInput','301');assert(await page.locator('#gridBad').isVisible());assert.equal(await page.locator('#grid .cell').count(),300);
  await page.fill('#gridInput','70');
  // Step 6 trace on every preset
  for(const n of Object.keys(presetAnswers).map(Number)){
   await page.locator(`#tracePresets button[data-n="${n}"]`).click();assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const initial=await snap();await page.locator('#next').click();const first=await snap();await page.locator('#prev').click();assert.equal(await snap(),initial);await page.locator('#next').click();assert.equal(await snap(),first);
   let steps=1;while(await page.locator('#next').isEnabled()){await page.locator('#next').click();steps++;}
   assert.equal(await page.locator('#mAnswer').textContent(),String(presetAnswers[n]));assert(await page.locator('#end').isDisabled());
   const terminal=await snap();while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();assert.equal(await snap(),initial);
   await page.locator('#end').click();assert.equal(await snap(),terminal);await page.locator('#reset').click();assert.equal(await snap(),initial);
   report.presets.push({lang,n,steps,answer:presetAnswers[n]});
  }
  // A middle frame for 70: the stop at digit 7, with operands visible.
  await page.locator('#tracePresets button[data-n="70"]').click();await page.locator('#next').click();await page.locator('#next').click();
  const ev=await page.locator('#event').textContent();assert(ev.includes('1, 6')&&ev.includes('2 × 5^1 = 10'),ev);assert.equal(await page.locator('#mTurn').textContent(),'14');
  assert.equal(await page.locator('#nDigits .digit.bad').count(),1);assert((await page.locator('#ledger tr.current-row').textContent()).includes('★'));
  await page.locator('#next').click();await page.locator('#next').click();assert.deepEqual(await page.locator('#sample .chip').allTextContents(),['11 ✓','69 ✓','88 ✗','96 ✗']);
  // Custom input and invalid input
  await page.fill('#nInput','200');await page.press('#nInput','Enter');await page.locator('#end').click();assert.equal(await page.locator('#mAnswer').textContent(),'40');
  const before=await snap();await page.fill('#nInput','0');await page.locator('#apply').click();assert(await page.locator('#nBad').isVisible());assert.equal(await snap(),before);
  await page.fill('#nInput','999999999');await page.locator('#apply').click();await page.locator('#end').click();
  // Large length-9 group: sample window shows the omission notes.
  await page.locator('#prev').click();assert(await page.locator('#sampleBefore').isVisible());report.largeSample=await page.locator('#sampleBox').textContent();
  // Prediction
  for(const o of [0,1,3,2]){await page.locator(`[name=prediction][value="${o}"]`).check();const pre=await page.locator('#feedback').textContent();assert(!pre.includes('49 − 9'));await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();assert(fb.includes('49 − 9 = 40'));report.feedback.push({lang,o,fb});}
  // Locale switch preserves state
  await page.locator('#tracePresets button[data-n="6189"]').click();for(let i=0;i<3;i++)await page.locator('#next').click();
  const prog=await page.locator('#progress').textContent(),other=lang==='en'?'zh':'en';
  await page.locator(`[data-lang=${other}]`).click();assert(await page.locator('[name=prediction][value="2"]').isChecked());assert((await page.locator('#feedback').textContent()).length>10);
  assert.equal(await page.locator('#mTurn').textContent(),'124');assert(await page.locator('#splitBlock').isVisible());
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#progress').textContent(),prog);
  // Source parity, download, clipboard and fallback
  assert.equal(await page.locator('#code').textContent(),source);
  const dl=page.waitForEvent('download');await page.locator('#download').click();const d=await dl;const file=path.join(O,`download-${lang}.py`);await d.saveAs(file);assert.equal(fs.readFileSync(file,'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();
  await page.locator('#copyStatus').filter({hasText:lang==='en'?'Copied.':'已复制。'}).waitFor();assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  const sentinel=`1088-${lang}-${Date.now()}`;await page.evaluate(async s=>{await window.nativeClipboard.writeText(s);if(await window.nativeClipboard.readText()!==s)throw Error('sentinel');},sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await page.locator('#copy').click();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'fallbackSource');assert.equal(await page.locator('#fallbackSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'hidden'});
  // Keyboard operation of the trace
  await page.locator('#tracePresets button[data-n="70"]').click();await page.locator('#next').click();await page.locator('#prev').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');
  assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('2/'));
  await page.locator('#tracePresets button[data-n="1"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#nInput').inputValue(),'1');
  // Layout at three widths
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});
   for(const id of ['step1','step3','step6','step7','step8']){await page.locator('#'+id).scrollIntoViewIfNeeded();}
   const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth,wide:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&!e.closest('.table-wrap,pre,.step-nav-inner');}).map(e=>e.tagName+'#'+e.id+'.'+e.className).slice(0,5)}));
   assert(g.scroll<=g.inner+1,JSON.stringify({lang,width,g}));assert.deepEqual(g.wide,[],JSON.stringify({lang,width}));report.geometry.push({lang,width,...g});
   await page.locator('#tracePresets button[data-n="8250"]').click();for(let i=0;i<4;i++)await page.locator('#next').click();
   for(const id of ['step1','step3','step6']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.locator('#'+id+' .stage').screenshot({path:path.join(O,`${lang}-${width}-${id}.png`)});}
   const sizes=await page.locator('button:visible,select:visible,input[type=text]:visible,summary:visible,.back-link,.official-link,.related a,#download,.step-nav a,.prediction-options label').evaluateAll(es=>es.map(e=>({t:(e.id||e.textContent).trim().slice(0,30),h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})));
   for(const c of sizes)assert(c.h>=48&&c.w>=44,JSON.stringify({width,c}));report.controls.push({lang,width,count:sizes.length});
  }
  await page.setViewportSize({width:1280,height:900});
 }
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 // Blocked storage and offline file opening
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));
 const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();assert((await p2.locator('#progress').textContent()).includes('1/'));assert.deepEqual(e2,[]);
 const p3=await browser.newPage();await p3.goto('file://'+path.join(R,'index.html'));await p3.locator('#next').click();assert.equal(await p3.locator('#code').textContent(),source);
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(O,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();
 console.log(JSON.stringify({presets:report.presets.length,geometry:report.geometry.length,controls:report.controls,errors}));
})().catch(e=>{console.error(e);process.exit(1);});
