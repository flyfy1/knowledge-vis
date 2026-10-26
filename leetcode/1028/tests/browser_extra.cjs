const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});try{
const page=await b.newPage({viewport:{width:320,height:1000}}),rows=[];
await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1028/');
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','3');await page.locator('#end').click();await page.evaluate(()=>document.body.style.zoom=2);
 const tree=page.locator('#tree');await tree.focus();assert.equal(await page.evaluate(()=>document.activeElement.id),'tree');assert.equal(await tree.evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 await tree.evaluate(e=>e.scrollLeft=0);for(let i=0;i<12;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(250);
 const moved=await tree.evaluate(e=>({left:e.scrollLeft,client:e.clientWidth,total:e.scrollWidth}));assert(moved.left>0);await tree.screenshot({path:path.join(out,`tree-panned-${lang}.png`)});
 const text=await tree.textContent();assert(text.includes(lang==='en'?'#3 · value 90 · depth 3':'#3 · 值 90 · 深度 3'));
 for(let i=0;i<12;i++)await page.keyboard.press('ArrowLeft');await page.waitForTimeout(250);assert.equal(await tree.evaluate(e=>e.scrollLeft),0);
 await page.evaluate(()=>document.body.style.zoom=1);await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();
 const state=await page.locator('#progress').textContent();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert(await page.locator('#feedback').isVisible());assert.equal(await page.locator('#preset').inputValue(),'3');await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#progress').textContent(),state);
 await page.locator('#reset').click();assert(await page.locator('#feedback').isVisible());assert(await page.locator('#progress').textContent().then(t=>t.includes('0/12')));
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#event').textContent()).includes(lang==='en'?'Parse #0':'解析 #0'));
 // Every letter selector keeps a full bilingual description beside the actual input.
 for(let p=0;p<8;p++){await page.selectOption('#preset',String(p));assert.equal(await page.locator('#presetDescription').textContent(),await page.evaluate(p=>String.fromCharCode(65+p)+' · '+window.COPY['sel'+p][document.documentElement.lang==='en'?1:0],p));}
 rows.push({lang,keyboardPan:moved,keyboardReturnToStart:true,focusOutline:'3px',disclosureAndQuizPreserved:true,traceResetDoesNotResetQuiz:true,allPresetDescriptions:true});
}
fs.writeFileSync(path.join(out,'browser-extra-results.json'),JSON.stringify({kind:'author self-check',rows},null,2)+'\n');console.log(JSON.stringify({passed:true,rows}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
