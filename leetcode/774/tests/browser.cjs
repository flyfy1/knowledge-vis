'use strict';
// Author browser self-check for #774. Needs a preview server and Playwright:
// NODE_PATH=~/Documents/integ-life/integ-games/node_modules PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/774/tests/browser.cjs
// EVIDENCE_DIR receives screenshots and browser.json (default tests/evidence).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/774/';
fs.mkdirSync(O,{recursive:true});
const meta=JSON.parse(fs.readFileSync(path.join(R,'lesson-entry.json'),'utf8')),source=fs.readFileSync(path.join(R,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce',viewport:{width:1280,height:900}}),page=await context.newPage();
 const errors=[],bad=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push(r.url()+' '+r.status());});
 await page.goto(URL);await page.locator('#frameRead').filter({hasText:/\S/}).waitFor();
 const report={kind:'author browser self-check (not independent review)',browser:await browser.version(),checks:[],geometry:[]};
 const ok=(c,label)=>{assert(c,label);report.checks.push(label);};
 const trace=async()=>JSON.stringify(await page.locator('#frameRead,#progress,#historyRows,#needRows,#starRead').allTextContents());
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  ok(await page.locator('h1').textContent()===`#774 · ${meta.title[lang]}`,`${lang}: H1 has id and localized title`);
  ok(await page.title()===`774 · ${meta.title[lang]}`,`${lang}: document title`);
  // Step 0: hand experiment; try all four full splits.
  await page.locator('#handReset').click().catch(()=>{});
  for(const seq of [['addB','addB','addB'],['subB','addA'],['subB','addA'],['subB','addA']])for(const id of seq)await page.locator('#'+id).click();
  ok(await page.locator('#handLedger li').count()===4&&await page.locator('#handDone').isVisible(),`${lang}: all four splits recorded`);
  const ledger=await page.locator('#handLedger').textContent();ok(ledger.includes('1 + 2 → 2')&&ledger.includes('0 + 3 → 4')&&ledger.includes('3 + 0 → 6')&&ledger.includes('2 + 1 → 3'),`${lang}: hand ledger values 6,3,2,4`);
  ok(await page.locator('#addA').isDisabled()&&await page.locator('#addB').isDisabled(),`${lang}: budget of 3 enforced`);
  await page.locator('#subA').click();await page.locator('#subA').click();await page.locator('#addB').click();await page.locator('#addB').click();
  ok((await page.locator('#handRead').textContent()).includes(lang==='en'?'Worst gap ▲ = 2':'最长空档 ▲ = 2'),`${lang}: 1+2 shows worst gap 2`);
  ok(await page.locator('#handRoad .worst-mark').count()>=1,`${lang}: worst piece marked`);
  // Step 2: staircase.
  for(const [v,total,okv] of [['6','0',true],['2','3',true],['1.5','5',false]]){
   await page.locator('#dRange').fill(v);const text=await page.locator('#needRead').textContent();
   ok(text.includes(`${lang==='en'?'Total':'共'} ${total}`)&&text.includes(okv?'✓':'✗'),`${lang}: D=${v} need ${total}`);
  }
  ok(await page.locator('.stair').count()===12&&await page.locator('.stair.selected').count()===1,`${lang}: 12 staircase bars, one selected`);
  // Step 3: every preset to the end and back; rewind restores.
  const expectStar=['2','2','1/2','14','99/2','3/2'];
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));ok(await page.locator('#prev').isDisabled(),`${lang} p${p}: start disables back`);
   const initial=await trace();await page.locator('#next').click();const first=await trace();await page.locator('#prev').click();ok(await trace()===initial,`${lang} p${p}: rewind restores start`);
   await page.locator('#next').click();ok(await trace()===first,`${lang} p${p}: replay identical`);
   let n=1;while(await page.locator('#next').isEnabled()){await page.locator('#next').click();n++;}
   const stop=await page.locator('#frameRead').textContent();ok(stop.includes(`D* = ${expectStar[p]}`),`${lang} p${p}: stop shows exact D* ${expectStar[p]}`);
   const hi=Number(stop.match(/= ([\d.]+)\. (?:Exact|精确)|返回 hi = ([\d.]+)/).slice(1).find(Boolean));const [a,b]=expectStar[p].split('/').map(Number);ok(Math.abs(hi-a/(b||1))<=1e-6,`${lang} p${p}: returned hi within 1e-6`);
   ok(await page.locator('#end').isDisabled(),`${lang} p${p}: end disabled at stop`);
   const rows=await page.locator('#historyRows tr').count();ok(rows===n-1,`${lang} p${p}: history keeps all ${rows} rounds`);
   await page.locator('#traceReset').click();ok(await trace()===initial,`${lang} p${p}: reset restores start`);
  }
  // Custom input, invalid input keeps the last valid trace.
  await page.locator('#step3 details.custom').evaluate(e=>e.open=true);
  await page.locator('#stationsInput').fill('0 7 10');await page.locator('#kInput').fill('2');await page.locator('#load').click();
  ok(await page.locator('#preset').inputValue()==='custom',`${lang}: custom input marks selector`);
  await page.locator('#end').click();ok((await page.locator('#frameRead').textContent()).includes('D* = 3'),`${lang}: custom [0,7,10] k=2 gives 3`);
  const before=await trace();await page.locator('#stationsInput').fill('5 3');await page.locator('#load').click();
  ok(await trace()===before&&(await page.locator('#inputStatus').textContent()).length>0,`${lang}: invalid input rejected, trace kept`);
  await page.locator('#stationsInput').fill('0 1');await page.locator('#kInput').fill('1');await page.locator('#load').click();await page.locator('#end').click();
  ok((await page.locator('#frameRead').textContent()).includes('D* = 1/2'),`${lang}: edge case two stations`);
  // Middle frame: invariant visible; locale switch keeps state.
  await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.locator('#next').click();
  const mid=await page.locator('#frameRead').textContent();ok(mid.includes(lang==='en'?'Round 3':'第 3 轮'),`${lang}: round 3 readout`);
  const state=await trace();const other=lang==='en'?'zh':'en';await page.locator(`[data-lang=${other}]`).click();
  ok((await page.locator('#progress').textContent()).includes('3'),`${lang}->${other}: progress kept`);await page.locator(`[data-lang=${lang}]`).click();ok(await trace()===state,`${lang}: locale roundtrip restores trace text`);
  // Prediction.
  for(const v of ['0','1','3','2']){await page.locator(`[name=prediction][value="${v}"]`).check();ok(!(await page.locator('#feedback').textContent()).includes('need(3)'),`${lang}: feedback hidden before reveal (${v})`);await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();ok(fb.includes('need(3)')&&(v==='2')===(fb.startsWith(lang==='en'?'Correct':'正确')),`${lang}: option ${v} feedback`);}
  await page.locator(`[data-lang=${other}]`).click();ok(await page.locator('[name=prediction][value="2"]').isChecked()&&(await page.locator('#feedback').textContent()).includes('need(3)'),`${lang}: prediction kept across locale`);await page.locator(`[data-lang=${lang}]`).click();
  await page.locator('#predictionReset').click();
  // Source parity, download, copy and fallback.
  ok(await page.locator('#pythonCode').textContent()===source,`${lang}: displayed source exact`);
  const dl=page.waitForEvent('download');await page.locator('#download').click();const file=await dl;const saved=path.join(O,`download-${lang}.py`);await file.saveAs(saved);ok(fs.readFileSync(saved,'utf8')===source,`${lang}: download exact`);
  await page.locator('#copy').click();await page.locator('#copyStatus').filter({hasText:/\S/}).waitFor();ok(await page.evaluate(()=>navigator.clipboard.readText())===source,`${lang}: clipboard exact`);
  const sentinel=`774-${lang}-${Date.now()}`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel');},sentinel);
  await page.evaluate(()=>{window.__clip=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});});
  await page.locator('#copy').click();ok(await page.evaluate(()=>document.activeElement.id)==='manualSource'&&await page.locator('#manualSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd))===source,`${lang}: fallback selects full source`);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');ok(await page.evaluate(()=>window.__clip.readText())===source,`${lang}: manual copy shortcut transfers source`);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.__clip}));await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('manualCopy').hidden);
  // Keyboard: Tab from prev reaches next and Enter advances.
  await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');ok((await page.locator('#progress').textContent()).includes('1'),`${lang}: keyboard Enter advances trace`);
  ok(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle)==='solid',`${lang}: visible focus ring`);
  // Layout at three widths.
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});
   for(const id of ['step0','step2','step3','step5']){
    await page.locator('#'+id).scrollIntoViewIfNeeded();
    const g=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));ok(g.scroll<=g.inner,`${lang} ${width}: no horizontal overflow at ${id}`);
   }
   const small=await page.locator('button:visible,select:visible,input[type=text]:visible,input[type=number]:visible,.step-nav a,summary:visible,.prediction-options label,.related a,a.btn,.back-link,.official-link').evaluateAll(es=>es.map(e=>({t:(e.id||e.textContent).trim().slice(0,30),h:e.getBoundingClientRect().height})).filter(x=>x.h<48));
   ok(small.length===0,`${lang} ${width}: controls >= 48px ${JSON.stringify(small)}`);
   // Road labels and staircase stay inside their stage.
   const clip=await page.evaluate(()=>[...document.querySelectorAll('.tick-label,.stair-d,.stair-val,.stair-k-label')].filter(e=>{const r=e.getBoundingClientRect(),s=e.closest('.stage').getBoundingClientRect();return r.width&&(r.left<s.left-1||r.right>s.right+1);}).map(e=>e.textContent));
   ok(clip.length===0,`${lang} ${width}: diagram labels inside stage ${clip}`);
   report.geometry.push({lang,width});
   await page.locator('#step0 .stage').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(O,`${lang}-${width}-hand.png`)});
   await page.locator('#stairs').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(O,`${lang}-${width}-stairs.png`)});
   await page.locator('#frameRead').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-trace.png`)});
   await page.locator('#step4').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(O,`${lang}-${width}-predict.png`)});
  }
  await page.setViewportSize({width:1280,height:900});
 }
 ok(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto','reduced motion: no smooth scrolling');
 // Storage blocked and offline file opening.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();ok((await p2.locator('#progress').textContent()).includes('1')&&e2.length===0,'storage blocked: works in memory');
 const p3=await browser.newPage();await p3.goto('file://'+path.join(R,'index.html'));await p3.locator('#next').click();ok(await p3.locator('#pythonCode').textContent()===source,'file:// opening shows exact source');
 ok(errors.length===0,'no console/page errors '+errors.join('|'));ok(bad.length===0,'no failed requests '+bad.join('|'));
 fs.writeFileSync(path.join(O,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();
 console.log(`browser checks passed: ${report.checks.length}`);
})().catch(e=>{console.error(e);process.exit(1);});
