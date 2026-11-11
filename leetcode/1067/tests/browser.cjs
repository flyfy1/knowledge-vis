'use strict';
// Author browser self-check for #1067. Needs a preview server and Playwright:
// NODE_PATH=~/Documents/integ-life/integ-games/node_modules PREVIEW_ROOT=http://127.0.0.1:18770 node leetcode/1067/tests/browser.cjs
// EVIDENCE_DIR receives screenshots and browser.json (default tests/evidence).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const R=path.resolve(__dirname,'..'),O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/1067/';
fs.mkdirSync(O,{recursive:true});
const meta=JSON.parse(fs.readFileSync(path.join(R,'lesson-entry.json'),'utf8')),source=fs.readFileSync(path.join(R,'solution.py'),'utf8'),C=require(path.join(R,'core.js'));
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce',viewport:{width:1280,height:900}}),page=await context.newPage();
 const errors=[],bad=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push(r.url()+' '+r.status());});
 await page.goto(URL);await page.locator('#frameRead').filter({hasText:/\S/}).waitFor();
 const report={kind:'author browser self-check (not independent review)',browser:await browser.version(),checks:[]};
 const ok=(c,label)=>{assert(c,label);report.checks.push(label);};
 const trace=async()=>JSON.stringify(await page.locator('#frameRead,#progress,#placeRows,#inputRead').allTextContents());
 const text=async id=>page.locator('#'+id).textContent();
 const hand=async(d,low,high)=>{await page.selectOption('#handD',String(d));await page.locator('#handLow').fill(String(low));await page.locator('#handHigh').fill(String(high));await page.locator('#handApply').click();};
 const setN=async N=>page.locator('#wallN').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(N));
 const custom=async(d,low,high)=>{await page.locator('#traceD').fill(String(d));await page.locator('#traceLow').fill(String(low));await page.locator('#traceHigh').fill(String(high));await page.locator('#load').click();};
 for(const lang of ['en','zh']){
  const other=lang==='en'?'zh':'en',agree=lang==='en'?'also gives':'也得到';
  await page.locator(`[data-lang=${lang}]`).click();
  ok(await page.locator('h1').textContent()===`#1067 · ${meta.title[lang]}`,`${lang}: H1 id and localized title`);
  ok(await page.title()===`1067 · ${meta.title[lang]}`,`${lang}: document title`);
  // Step 0: written-out numbers with boxed occurrences.
  await hand(1,1,13);ok((await text('handRead')).includes('6')&&await page.locator('#handNumbers .dg.hit').count()===6&&await page.locator('#handNumbers .num').count()===13,`${lang}: 1..13 has six boxed 1s`);
  await hand(0,1,100);ok(await page.locator('#handNumbers .dg.hit').count()===11&&await page.locator('#handNumbers .num.has').count()===10,`${lang}: 1..100 has 11 zeros in 10 numbers`);
  const handBefore=await text('handRead');await hand(1,1,500);ok(await text('handRead')===handBefore&&(await page.locator('#handStatus').getAttribute('class')).includes('error'),`${lang}: more than 200 numbers rejected`);
  await hand(1,5,1000);ok((await text('handStatus')).includes('999'),`${lang}: above 999 rejected with limit named`);
  await hand(5,555,555);ok(await page.locator('#handNumbers .dg.hit').count()===3,`${lang}: single number 555 has three 5s`);
  // Step 2: the number wall agrees with the place formula.
  for(const [d,p,N,count] of [[3,1,125,13],[3,10,134,15],[1,100,199,100],[9,10,95,6],[7,1,6,0]]){
   await page.selectOption('#wallD',String(d));await page.selectOption('#wallPlace',String(p));await setN(N);
   const read=await text('wallRead');ok(read.includes(`1…${N}`)&&new RegExp(`\\b${count}\\b`).test(read),`${lang}: wall d=${d} p=${p} N=${N} reads ${count}`);
   ok(await page.locator('#wall .dg.hit').count()===count&&count===C.placeCount(N,d,p).count,`${lang}: wall d=${d} p=${p} N=${N} boxes ${count}`);
  }
  await page.selectOption('#wallD','3');await page.selectOption('#wallPlace','10');await setN(134);
  ok((await text('wallRead')).includes('130…134'),`${lang}: N=134 tens names the partial run 130…134`);
  await page.locator('#wallN').focus();await page.keyboard.press('ArrowRight');ok((await text('wallNValue')).includes('135'),`${lang}: wall slider keyboard operable`);
  // Step 3: every preset to the end and back.
  await page.selectOption('#rule','correct');
  const answers=C.presets.map(p=>C.trace(p.d,p.low,p.high).at(-1).result);ok(answers[0]===6&&answers[1]===35&&answers[2]===11&&answers[5]===3,'preset answers 6, 35, 11, 3');
  for(let i=0;i<C.presets.length;i++){
   await page.selectOption('#preset',String(i));ok(await page.locator('#prev').isDisabled()&&await page.locator('#placeRows tr').count()===0,`${lang} p${i}: start with empty table`);
   const initial=await trace();await page.locator('#next').click();const first=await trace();await page.locator('#prev').click();ok(await trace()===initial,`${lang} p${i}: rewind restores`);await page.locator('#next').click();ok(await trace()===first,`${lang} p${i}: replay identical`);
   let steps=1;while(await page.locator('#next').isEnabled()){await page.locator('#next').click();steps++;}
   const total=C.trace(C.presets[i].d,C.presets[i].low,C.presets[i].high).length;ok(steps===total-1,`${lang} p${i}: stepped all ${total} frames`);
   const stop=await text('frameRead');ok(stop.includes(`= ${answers[i]}.`)||stop.includes(`= ${answers[i]}。`),`${lang} p${i}: answer ${answers[i]}`);
   ok(i===4?stop.includes(lang==='en'?'too many':'太多'):stop.includes(agree),`${lang} p${i}: ${i===4?'check skipped for 2e8 numbers':'agrees with writing every number'}`);
   ok(await page.locator('#placeRows tr.current').count()===0,`${lang} p${i}: no current row at stop`);
   await page.locator('#traceReset').click();ok(await trace()===initial,`${lang} p${i}: reset`);
  }
  // Middle frames of sample 2.
  await page.selectOption('#preset','1');await page.locator('#next').click();ok((await text('frameRead')).includes('250 = 25 | 0 | 0'),`${lang}: f(250) ones split`);
  await page.locator('#next').click();const f2=await text('frameRead');ok(f2.includes('2 | 5 | 0')&&f2.includes('25 + 30 = 55'),`${lang}: f(250) tens adds 30 to 55`);
  ok(await page.locator('#placeRows tr.current').count()===1&&(await page.locator('#placeRows tr.current th').textContent()).startsWith('★'),`${lang}: current row starred`);
  const state=await trace();await page.locator(`[data-lang=${other}]`).click();ok((await text('progress')).includes('3'),`${lang}->${other}: progress kept`);await page.locator(`[data-lang=${lang}]`).click();ok(await trace()===state,`${lang}: locale roundtrip restores trace`);
  // Zero case: the leading-zero rule gives 122 instead of 11.
  await page.selectOption('#preset','2');await page.selectOption('#rule','naive');await page.locator('#end').click();
  const wrong=await text('frameRead');ok(wrong.includes('122')&&wrong.includes('11')&&wrong.includes('111'),`${lang}: naive rule 122 vs 11, off by 111`);
  await page.selectOption('#rule','correct');await page.locator('#next').click();
  for(let k=0;k<2;k++)await page.locator('#next').click();
  ok((await text('frameRead')).includes(lang==='en'?'leading zero':'前导零'),`${lang}: hundreds place of 100 stops on leading zero`);
  // Custom inputs, including edges.
  await page.locator('#step3 details.custom').evaluate(e=>e.open=true);
  await custom(0,1,9);ok(await page.locator('#preset').inputValue()==='custom',`${lang}: custom selector`);await page.locator('#end').click();ok((await text('frameRead')).includes('= 0'),`${lang}: d=0 over 1..9 gives 0`);
  await custom(0,200000000,200000000);await page.locator('#end').click();ok((await text('frameRead')).includes(`= 8`)&&(await text('frameRead')).includes(agree),`${lang}: 200000000 holds eight zeros`);
  await custom(0,1,105);await page.locator('#end').click();ok((await text('frameRead')).includes('16'),`${lang}: prediction case checkable in trace`);
  const before=await trace();await custom(1,5,2);ok(await trace()===before&&(await text('inputStatus')).length>0,`${lang}: low > high rejected`);
  await custom(1,1,200000001);ok(await trace()===before&&(await text('inputStatus')).includes('200000000'),`${lang}: high above 2e8 rejected`);
  await custom(12,1,2);ok(await trace()===before,`${lang}: two-digit d rejected`);
  // Prediction.
  const answerMark=lang==='en'?'f(105) = 16':'f(105) = 16';
  for(const v of ['0','1','3','2']){await page.locator(`[name=prediction][value="${v}"]`).check();ok(!(await text('feedback')).includes(answerMark),`${lang}: hidden before reveal ${v}`);await page.locator('#reveal').click();const fb=await text('feedback');ok(fb.includes(answerMark)&&(v==='2')===fb.startsWith(lang==='en'?'Correct':'正确'),`${lang}: option ${v} feedback`);}
  await page.locator(`[data-lang=${other}]`).click();ok(await page.locator('[name=prediction][value="2"]').isChecked()&&(await text('feedback')).includes(answerMark),`${lang}: prediction kept across locale`);await page.locator(`[data-lang=${lang}]`).click();await page.locator('#predictionReset').click();
  // Source parity, download, copy and fallback.
  ok(await page.locator('#pythonCode').textContent()===source,`${lang}: displayed source exact`);
  const dl=page.waitForEvent('download');await page.locator('#download').click();const file=await dl;const saved=path.join(O,`download-${lang}.py`);await file.saveAs(saved);ok(fs.readFileSync(saved,'utf8')===source,`${lang}: download exact`);
  await page.locator('#copy').click();await page.locator('#copyStatus').filter({hasText:/\S/}).waitFor();ok(await page.evaluate(()=>navigator.clipboard.readText())===source,`${lang}: clipboard exact`);
  const sentinel=`1067-${lang}-${Date.now()}`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel');},sentinel);
  await page.evaluate(()=>{window.__clip=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}});});
  await page.locator('#copy').click();ok(await page.evaluate(()=>document.activeElement.id)==='manualSource'&&await page.locator('#manualSource').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd))===source,`${lang}: fallback selects full source`);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');ok(await page.evaluate(()=>window.__clip.readText())===source,`${lang}: manual copy shortcut transfers source`);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.__clip}));await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('manualCopy').hidden);
  // Keyboard.
  await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');ok((await text('progress')).includes('2'),`${lang}: Enter advances`);
  await page.locator('#handLow').fill('1');await page.locator('#handHigh').fill('');await page.locator('#handHigh').focus();await page.keyboard.type('20');await page.locator('#handApply').focus();await page.keyboard.press('Enter');ok(await page.locator('#handNumbers .num').count()===20,`${lang}: step 0 keyboard operable`);
  // Layout at three widths: 3-digit wall, a long trace table.
  await page.selectOption('#wallPlace','1');await setN(199);await page.selectOption('#preset','4');await page.locator('#end').click();await hand(1,800,999);
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:900});
   for(const id of ['step0','step2','step3','step4','step5']){await page.locator('#'+id).scrollIntoViewIfNeeded();const g=await page.evaluate(()=>({s:document.documentElement.scrollWidth,w:innerWidth}));ok(g.s<=g.w,`${lang} ${width}: no overflow at ${id}`);}
   const small=await page.locator('button:visible,select:visible,input[type=number]:visible,input[type=range]:visible,.step-nav a,summary:visible,.prediction-options label,.related a,a.btn,.back-link,.official-link').evaluateAll(es=>es.map(e=>({t:(e.id||e.textContent).trim().slice(0,30),h:e.getBoundingClientRect().height})).filter(x=>x.h<48));
   ok(small.length===0,`${lang} ${width}: controls >= 48px high ${JSON.stringify(small)}`);
   const spill=await page.evaluate(()=>[...document.querySelectorAll('.wcell,.num')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent));
   ok(spill.length===0,`${lang} ${width}: no clipped wall/number text ${spill.slice(0,5)}`);
   await page.locator('#handRead').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-hand.png`)});
   await page.locator('#wallRead').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-wall.png`)});
   await page.locator('#frameRead').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-trace.png`)});
   await page.locator('#step3 .formula').evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-120));await page.screenshot({path:path.join(O,`${lang}-${width}-zero.png`)});
  }
  await page.setViewportSize({width:1280,height:900});
 }
 ok(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto','reduced motion: no smooth scrolling');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}}));const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('#next').click();await p2.locator('[data-lang=zh]').click();ok((await p2.locator('#progress').textContent()).includes('2')&&e2.length===0,'storage blocked: works in memory');
 const p3=await browser.newPage();await p3.goto('file://'+path.join(R,'index.html'));await p3.locator('#next').click();ok(await p3.locator('#pythonCode').textContent()===source,'file:// opening shows exact source');
 ok(errors.length===0,'no console/page errors '+errors.join('|'));ok(bad.length===0,'no failed requests '+bad.join('|'));
 fs.writeFileSync(path.join(O,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();
 console.log(`browser checks passed: ${report.checks.length}`);
})().catch(e=>{console.error(e);process.exit(1);});
