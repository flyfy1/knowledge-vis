'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const folder=path.resolve(__dirname,'..'), out=path.join(folder,'evidence');
const source=fs.readFileSync(path.join(folder,'solution.py'),'utf8');
const core=require('../../hard-first-ten/core.js');
const vm=require('node:vm'), sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(folder,'copy.js'),'utf8'),sandbox);
const lesson=JSON.parse(JSON.stringify(sandbox.window.LESSON));
const traces=lesson.presets.map(p=>core[37](p.input));
assert.equal(traces[0].frames[9].board[0].join(''),'5312748..');
assert.equal(traces[0].frames[10].board[0].join(''),'53127489.');
assert.deepEqual(traces[0].frames[11].state.candidates_at_entry,[]);
assert.deepEqual(traces[0].frames[12].board,traces[0].frames[9].board);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:900},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await ctx.newPage(), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto('http://127.0.0.1:18770/leetcode/37/');
 await page.waitForFunction(()=>window.lessonSnapshot);
 const snapshot=()=>page.evaluate(()=>lessonSnapshot());
 const seek=async i=>page.locator('#position').evaluate((e,i)=>{e.value=i;e.dispatchEvent(new Event('input',{bubbles:true}));},i);
 const geometry=()=>page.evaluate(()=>{
   const bad=[];
   for(const dt of document.querySelectorAll('#state dt')){
     const dd=dt.nextElementSibling, range=document.createRange();range.selectNodeContents(dt);
     const box=dt.getBoundingClientRect(), value=dd.getBoundingClientRect();
     for(const glyph of range.getClientRects()) if(glyph.right>value.left+.5 && glyph.bottom>value.top && glyph.top<value.bottom)bad.push(dt.textContent);
     if(dt.scrollWidth>box.width+1)bad.push('overflow:'+dt.textContent);
   }
   return {bad,width:document.documentElement.scrollWidth,viewport:innerWidth};
 });
 await seek(12);
 // Causal regression: disabling only the lesson repair reproduces the prior collision.
 await page.locator('link[href^="lesson.css"]').evaluate(el=>{el.sheet.disabled=true;});
 const before=await geometry();assert(before.bad.includes('candidates_at_entry'));
 await page.locator('link[href^="lesson.css"]').evaluate(el=>{el.sheet.disabled=false;});
 assert.deepEqual((await geometry()).bad,[]);
 const report={baselineCollision:before,matrices:[],sourceParity:[],errors};
 for(const lang of ['en','zh']){
   await page.locator(`[data-lang="${lang}"]`).click();
   assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
   for(const width of [320,390,736,1440]){
     await page.setViewportSize({width,height:900});
     for(let i=0;i<traces[0].frames.length;i++){
       await seek(i);const g=await geometry();assert.deepEqual(g.bad,[],`${lang}/${width}/${i}`);assert(g.width<=g.viewport,`${lang}/${width} page overflow`);
     }
     await seek(12);await page.locator('#state').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(out,`${lang}-${width}-undo.png`)});
     report.matrices.push(`${lang} ${width}: ${traces[0].frames.length} frames; no state collision or page overflow`);
   }
   await page.setViewportSize({width:1280,height:900});
   await page.evaluate(()=>document.documentElement.style.zoom='2');
   for(let i=0;i<traces[0].frames.length;i++){await seek(i);assert.deepEqual((await geometry()).bad,[],`${lang}/zoom/${i}`);assert((await geometry()).width<=1280);}
   await seek(12);await page.locator('#state').scrollIntoViewIfNeeded();
   assert.deepEqual((await geometry()).bad,[]);assert((await geometry()).width<=1280);
   await page.screenshot({path:path.join(out,`${lang}-zoom200-undo.png`)});
   await page.evaluate(()=>document.documentElement.style.zoom='');
   for(let p=0;p<3;p++){
     await page.selectOption('#preset',String(p));const initial=await snapshot();
     assert.equal(initial.index,0);assert(await page.locator('#prev').isDisabled());
     await page.locator('#next').click();const step=await snapshot();
     await page.locator('#prev').click();assert.deepEqual(await snapshot(),initial);
     await page.locator('#next').click();assert.deepEqual(await snapshot(),step);
     await seek(initial.frames-1);assert(await page.locator('#next').isDisabled());assert(await page.locator('#result').isVisible());
     assert.deepEqual((await snapshot()).frame.board,traces[p].result);
     await page.locator('#prev').click();assert.equal((await snapshot()).index,initial.frames-2);
     await page.locator('#reset').click();assert.deepEqual(await snapshot(),initial);
   }
   for(let choice=0;choice<3;choice++){
     await page.locator(`[name=prediction][value="${choice}"]`).check();assert(!(await snapshot()).revealed);
     await page.locator('#reveal').click();assert((await snapshot()).revealed);
     assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),choice===2);
     assert((await page.locator('#feedback').innerText()).includes(lesson.quiz.feedback[choice][lang==='zh'?0:1]));
   }
   await page.selectOption('#preset','0');await seek(12);const retained=await snapshot();
   await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.deepEqual(await snapshot(),retained);
   await page.locator(`[data-lang="${lang}"]`).click();
   await page.locator('#sourceDetails').evaluate(e=>e.open=true);
   assert.equal(await page.locator('#pythonCode').textContent(),source);
   await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);
   assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
   report.sourceParity.push(`${lang}: displayed, clipboard, download, embedded mirror equal canonical bytes`);
   await seek(0);await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal((await snapshot()).index,1);
   await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal((await snapshot()).index,2);
   await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal((await snapshot()).index,1);
   await page.locator('#step0').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-worked-branch.png`),fullPage:true});
   await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});
 }
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}}});});
 await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
 assert.equal(await page.locator('#copyText').inputValue(),source);
 assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionEnd-e.selectionStart===e.value.length));
 const offline=await browser.newContext();
 await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});});
 const local=await offline.newPage();local.on('pageerror',e=>errors.push(e.message));
 await local.goto('file://'+path.join(folder,'index.html'));await local.waitForFunction(()=>window.lessonSnapshot);
 for(const lang of ['en','zh']){await local.locator(`[data-lang="${lang}"]`).click();assert.equal(await local.locator('#pythonCode').textContent(),source);await local.locator('#next').click();}
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();console.log('PASS: both locales, all official frames at four widths, CSS zoom, presets/replay/reset, quiz/state persistence, keyboard, source parity/fallback, file offline/denied storage; no page errors.');
})().catch(e=>{console.error(e);process.exitCode=1;});
