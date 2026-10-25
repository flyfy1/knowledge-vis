const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),assert=require('assert');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const page=await browser.newPage();await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18777/leetcode/546/');const records=[];
for(const lang of ['en','zh'])for(const width of [320,390,1440]){
 await page.setViewportSize({width,height:1100});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','2');await page.selectOption('#mode','optimal');await page.click('#next');
 assert.equal(await page.locator('#tiles .tile').count(),8);
 await page.locator('#step1 .stage').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));await page.waitForTimeout(150);
 await page.screenshot({path:path.join(out,`${lang}-${width}-middle.png`)});
 if(width===320){
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('#sourcePre').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);const offset=await page.locator('#sourcePre').evaluate(e=>e.scrollLeft);assert(offset>0);records.push({lang,width,keyboardSourceScroll:offset});
 await page.locator('#sourcePre').evaluate(e=>e.scrollLeft=0);await page.locator('#sourceDetails').screenshot({path:path.join(out,`${lang}-${width}-source.png`)});
 }
 if(width===1440){await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(out,`${lang}-header.png`)});}
}
fs.writeFileSync(path.join(out,'screenshot-results.json'),JSON.stringify({passed:true,records},null,2));await browser.close();console.log('Populated diagrams and source keyboard scrolling passed');})().catch(e=>{console.error(e);process.exit(1)});
