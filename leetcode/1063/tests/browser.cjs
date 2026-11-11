'use strict';
// Author browser self-check for #1063. Needs a preview server and Playwright:
// NODE_PATH=~/Documents/integ-life/integ-games/node_modules PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/1063/tests/browser.cjs
// EVIDENCE_DIR receives screenshots and browser.json (default tests/evidence).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1063/';
fs.mkdirSync(O,{recursive:true});
const meta=JSON.parse(fs.readFileSync(path.join(R,'lesson-entry.json'),'utf8')),source=fs.readFileSync(path.join(R,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce',viewport:{width:1280,height:900}}),page=await context.newPage();
 const errors=[],bad=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push(r.url()+' '+r.status());});
 await page.goto(URL);await page.locator('#frameRead').filter({hasText:/\S/}).waitFor();
 const report={kind:'author browser self-check (not independent review)',browser:await browser.version(),checks:[]};
 const ok=(c,label)=>{assert(c,label);report.checks.push(label);};
 const trace=async()=>JSON.stringify(await page.locator('#frameRead,#progress,#arr,#stack,#gridTrace,#ledger').allTextContents());
 const text=async id=>page.locator('#'+id).textContent();
 for(const lang of ['en','zh']){
  const other=lang==='en'?'zh':'en';
  await page.locator(`[data-lang=${lang}]`).click();
  ok(await page.locator('h1').textContent()===`#1063 · ${meta.title[lang]}`,`${lang}: H1 id and localized title`);
  ok(await page.title()===`1063 · ${meta.title[lang]}`,`${lang}: document title`);
  // Step 0: check two squares, then show all.
  if(await page.locator('#showAll').getAttribute('aria-pressed')==='true')await page.locator('#showAll').click();
  await page.locator('#grid0 button[data-i="1"][data-j="2"]').click();
  ok((await text('cellRead')).includes(lang==='en'?'2 at index 2 is smaller than 4':'下标 2 的 2 比 4 小'),`${lang}: [4,2] invalid with breaker named`);
  await page.locator('#grid0 button[data-i="2"][data-j="4"]').click();ok((await text('cellRead')).includes('✓'),`${lang}: [2,5,3] valid`);
  await page.locator('#showAll').click();ok((await text('gridCount')).includes('11')&&(await text('gridCount')).includes('15'),`${lang}: show all gives 11 of 15`);
  ok(await page.locator('#grid0 .tri-cell.ok').count()===11,`${lang}: 11 check marks rendered`);
  // Step 2: rows and columns.
  const rowCounts=[5,1,3,1,1];for(let i=0;i<5;i++){await page.selectOption('#rowSel',String(i));ok((await text('rowRead')).includes(lang==='en'?`${rowCounts[i]} subarrays`:`共 ${rowCounts[i]} 个`),`${lang}: row ${i} count ${rowCounts[i]}`);}
  const colAlive=['[0:1]','[0:1, 1:4]','[0:1, 2:2]','[0:1, 2:2, 3:5]','[0:1, 2:2, 4:3]'];
  for(let j=0;j<5;j++){await page.selectOption('#colSel',String(j));ok((await text('colRead')).includes(colAlive[j]),`${lang}: column ${j} alive ${colAlive[j]}`);}
  await page.selectOption('#colSel','2');ok((await text('colRead')).includes('1:4')&&await page.locator('#gridCol .breaker').count()===1,`${lang}: column 2 shows start 1 killed`);
  // Step 3: presets to the end and back.
  await page.selectOption('#rule','gt');
  const totals=[11,3,6,15,11];
  for(let p=0;p<5;p++){
   await page.selectOption('#preset',String(p));ok(await page.locator('#prev').isDisabled(),`${lang} p${p}: start`);
   const initial=await trace();await page.locator('#next').click();const first=await trace();await page.locator('#prev').click();ok(await trace()===initial,`${lang} p${p}: rewind restores`);await page.locator('#next').click();ok(await trace()===first,`${lang} p${p}: replay identical`);
   while(await page.locator('#next').isEnabled())await page.locator('#next').click();
   const stop=await text('frameRead');ok(stop.includes(String(totals[p]))&&stop.includes(lang==='en'?'They agree':'两者一致'),`${lang} p${p}: total ${totals[p]} agrees with definition`);
   ok(await page.locator('#gridTrace .tri-cell.ok').count()===totals[p],`${lang} p${p}: triangle shows ${totals[p]} check marks`);
   await page.locator('#traceReset').click();ok(await trace()===initial,`${lang} p${p}: reset`);
  }
  // Middle frame of sample 1: index 2 pops start 1.
  await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.locator('#next').click();
  const f=await text('frameRead');ok(f.includes('[1:4]')&&f.includes('[0:1, 2:2]')&&f.includes('3 + 2 = 5'),`${lang}: index 2 pops 1:4, stack [0:1, 2:2], total 5`);
  ok((await page.locator('#gridTrace .tri-cell.current').count())===3,`${lang}: current column has 3 cells`);
  ok((await page.locator('#arr .cell.dead').count())===1&&(await page.locator('#arr .cell.now').count())===1,`${lang}: dead and just-arrived states both shown`);
  const state=await trace();await page.locator(`[data-lang=${other}]`).click();ok((await text('progress')).includes('3'),`${lang}->${other}: progress kept`);await page.locator(`[data-lang=${lang}]`).click();ok(await trace()===state,`${lang}: locale roundtrip restores trace`);
  // Wrong rule on ties.
  await page.selectOption('#preset','2');await page.selectOption('#rule','ge');await page.locator('#end').click();
  const wrong=await text('frameRead');ok(wrong.includes(lang==='en'?'Done: total 3':'结束：总数 3')&&wrong.includes('6'),`${lang}: >= rule gives 3 vs 6`);ok(await page.locator('#gridTrace .mismatch').count()===3,`${lang}: three mismatching squares marked`);
  await page.selectOption('#rule','gt');
  // Custom and invalid input; edge case single element.
  await page.locator('#step3 details.custom').evaluate(e=>e.open=true);
  await page.locator('#numsInput').fill('7');await page.locator('#load').click();ok(await page.locator('#preset').inputValue()==='custom',`${lang}: custom selector`);await page.locator('#end').click();ok((await text('frameRead')).includes(lang==='en'?'total 1':'总数 1'),`${lang}: single element gives 1`);
  const before=await trace();await page.locator('#numsInput').fill('1 200');await page.locator('#load').click();ok(await trace()===before&&(await text('inputStatus')).length>0,`${lang}: invalid input rejected`);
  await page.locator('#numsInput').fill('3 1 2 2 0');await page.locator('#load').click();for(let i=0;i<4;i++)await page.locator('#next').click();ok((await text('frameRead')).includes('[1:1, 2:2, 3:2]'),`${lang}: prediction case checkable in trace`);
  // Prediction.
  for(const v of ['0','2','3','1']){await page.locator(`[name=prediction][value="${v}"]`).check();ok(!(await text('feedback')).includes('[1:1, 2:2, 3:2]'),`${lang}: hidden before reveal ${v}`);await page.locator('#reveal').click();const fb=await text('feedback');ok(fb.includes('[1:1, 2:2, 3:2]')&&(v==='1')===fb.startsWith(lang==='en'?'Correct':'正确'),`${lang}: option ${v} feedback`);}
  await page.locator(`[data-lang=${other}]`).click();ok(await page.locator('[name=prediction][value="1"]').isChecked()&&(await text('feedback')).includes('8'),`${lang}: prediction kept across locale`);await page.locator(`[data-lang=${lang}]`).click();await page.locator('#predictionReset').click();
  // Source parity, download, copy and fallback.
  ok(await page.locator('#pythonCode').textContent()===source,`${lang}: displayed source exact`);
  const dl=page.waitForEvent('download');await page.locator('#download').click();const file=await dl;const saved=path.join(O,`download-${lang}.py`);await file.saveAs(saved);ok(fs.readFileSync(saved,'utf8')===source,`${lang}: download exact`);
  await page.locator('#copy').click();await page.locator('#copyStatus').filter({hasText:/\S/}).waitFor();ok(await page.evaluate(()=>navigator.clipboard.readText())===source,`${lang}: clipboard exact`);
  const sentinel=`1063-${lang}-${Date.now()}`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel');},sentinel);
  await page.evaluate(()=>{window.__clip=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});});
  await page.locator('#copy').click();ok(await page.evaluate(()=>document.activeElement.id)==='manualSource'&&await page.locator('#manualSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd))===source,`${lang}: fallback selects full source`);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');ok(await page.evaluate(()=>window.__clip.readText())===source,`${lang}: manual copy shortcut transfers source`);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.__clip}));await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('manualCopy').hidden);
  // Keyboard.
  await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');ok((await text('progress')).includes('1'),`${lang}: Enter advances`);
  await page.locator('#grid0 button[data-i="0"][data-j="0"]').focus();await page.keyboard.press('Enter');ok((await text('cellRead')).includes('nums[0..0]'),`${lang}: grid square keyboard operable`);
  // Layout at three widths, with a 10-element input in the trace.
  await page.locator('#numsInput').fill('9 8 7 6 5 4 3 2 1 99');await page.locator('#load').click();await page.locator('#end').click();
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});
   for(const id of ['step0','step2','step3','step5']){await page.locator('#'+id).scrollIntoViewIfNeeded();const g=await page.evaluate(()=>({s:document.documentElement.scrollWidth,w:innerWidth}));ok(g.s<=g.w,`${lang} ${width}: no overflow at ${id}`);}
   const small=await page.locator('button:visible,select:visible,input[type=text]:visible,.step-nav a,summary:visible,.prediction-options label,.related a,a.btn,.back-link,.official-link').evaluateAll(es=>es.map(e=>({t:(e.id||e.textContent).trim().slice(0,30),h:e.getBoundingClientRect().height})).filter(x=>x.h<48));
   ok(small.length===0,`${lang} ${width}: controls >= 48px high ${JSON.stringify(small)}`);
   const spill=await page.evaluate(()=>[...document.querySelectorAll('.tri-cell,.tri-head,.cell-state,.cell-val')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));
   ok(spill.length===0,`${lang} ${width}: no clipped triangle/array text ${spill}`);
   await page.locator('#step0 .stage').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(O,`${lang}-${width}-grid.png`)});
   await page.locator('#gridCol').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(O,`${lang}-${width}-columns.png`)});
   await page.locator('#frameRead').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-trace.png`)});
   await page.locator('#gridTrace').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-trace-grid.png`)});
  }
  await page.setViewportSize({width:1280,height:900});
 }
 ok(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto','reduced motion: no smooth scrolling');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();ok((await p2.locator('#progress').textContent()).includes('1')&&e2.length===0,'storage blocked: works in memory');
 const p3=await browser.newPage();await p3.goto('file://'+path.join(R,'index.html'));await p3.locator('#next').click();ok(await p3.locator('#pythonCode').textContent()===source,'file:// opening shows exact source');
 ok(errors.length===0,'no console/page errors '+errors.join('|'));ok(bad.length===0,'no failed requests '+bad.join('|'));
 fs.writeFileSync(path.join(O,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();
 console.log(`browser checks passed: ${report.checks.length}`);
})().catch(e=>{console.error(e);process.exit(1);});
