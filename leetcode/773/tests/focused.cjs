'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770';fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),ctx=await b.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:390,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage(),records=[];
await p.goto(base+'/leetcode/773/');
const native=await p.evaluate(()=>!!navigator.clipboard);
for(const lang of ['en','zh']){
 await p.locator('[data-lang='+lang+']').click();
 await p.locator('#preset').selectOption('1');await p.locator('#traceNext').click();await p.locator('#traceNext').click();
 const sample=await p.locator('#sample').textContent();assert(sample.includes('412503'));assert(sample.includes(lang==='en'?'already discovered; skip':'已经发现，跳过'));assert(sample.includes(lang==='en'?'new state; add to seen':'新状态，加入 seen'));
 assert((await p.locator('#frameRead').textContent()).includes(lang==='en'?'Discovered so far: 8':'累计发现 8'));
 await p.locator('#sampleParent').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-100));
 await p.screenshot({path:path.join(out,lang+'-candidate-decisions.png')});
 // Both UI copy branches in both languages, without changing native read access.
 await p.evaluate(()=>{if(window.nativeClipboard)Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard});else window.nativeClipboard=navigator.clipboard;});
 await p.locator('#copyPython').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);assert.equal(await p.locator('#copyStatus').textContent(),lang==='en'?'Full source copied.':'已复制完整源码。');
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText:window.nativeClipboard.readText.bind(window.nativeClipboard),writeText:async()=>{throw Error('denied');}}}));
 await p.locator('#copyPython').click();assert((await p.locator('#copyStatus').textContent()).includes(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));
 await p.locator('#manualReset').click();await p.locator('#manualBoard button').filter({hasText:/^5$/}).focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#manualHistory').textContent(),'123405 → 123450');assert.equal(await p.evaluate(()=>document.activeElement.textContent),'5');
 // Test real keyboard scrolling on contained two-dimensional boards at the extreme zoom case.
 await p.setViewportSize({width:320,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');
 const board=p.locator('#frontiers .board').first();await board.focus();const before=await board.evaluate(el=>el.scrollLeft);for(let i=0;i<4;i++)await p.keyboard.press('ArrowRight');await p.waitForTimeout(150);assert((await board.evaluate(el=>el.scrollLeft))>before);
 await p.screenshot({path:path.join(out,lang+'-zoom-keyboard-scroll.png')});
 await p.evaluate(()=>document.documentElement.style.zoom='');await p.setViewportSize({width:390,height:1000});
 const expected=lang==='en'?'The answer is 3':'答案是 3';await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();assert((await p.locator('#predictionFeedback').textContent()).includes(expected));
 await p.locator('#predictionFeedback').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-400));await p.screenshot({path:path.join(out,lang+'-prediction.png')});
 records.push({locale:lang,frame:await p.locator('#frameRead').textContent(),candidateMeaning:sample,prediction:await p.locator('#predictionFeedback').textContent(),copySuccessAndFallback:true,manualKeyboard:true,zoomKeyboardScrolling:true});
}
fs.writeFileSync(path.join(out,'focused-results.json'),JSON.stringify({result:'pass',kind:'author focused semantic and keyboard self-check',records},null,2)+'\n');await b.close();})().catch(e=>{console.error(e);process.exit(1)});
