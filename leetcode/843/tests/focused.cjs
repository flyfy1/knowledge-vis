const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),p=await b.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});await p.goto((process.env.PREVIEW_URL||'http://127.0.0.1:18770')+'/leetcode/843/');await p.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);const records=[];
for(const l of ['en','zh']){
 await p.locator(`[data-lang=${l}]`).click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`${l}-390-top.png`)});
 await p.locator('#handToggle').click();await p.locator('#letters').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${l}-hand.png`)});await p.locator('#handToggle').click();
 await p.locator('#predictionReset').click();await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.locator('#step3').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${l}-prediction.png`)});
 await p.locator('#preset').selectOption('0');await p.locator('#next').click();await p.locator('.table-wrap').evaluate(e=>e.scrollLeft=e.scrollWidth);assert(await p.locator('.table-wrap').evaluate(e=>e.scrollLeft>0));await p.locator('#frameRead').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${l}-table-right.png`)});await p.locator('.table-wrap').evaluate(e=>e.scrollLeft=0);
 await p.locator('#end').click();await p.locator('#frameRead').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${l}-terminal.png`)});
 const sizes=await p.locator('button,.btn,summary,.prediction-options label').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({text:e.textContent,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));for(const s of sizes)assert(s.w>=48&&s.h>=48,JSON.stringify(s));
 records.push({locale:l,terminal:await p.locator('#terminal').textContent(),touchTargets:sizes,tableRightScroll:true});
}
fs.writeFileSync(path.join(out,'focused-results.json'),JSON.stringify({result:'pass',records},null,2));console.log('Focused screenshot and touch-target checks passed');await b.close();})().catch(e=>{console.error(e);process.exit(1);});
