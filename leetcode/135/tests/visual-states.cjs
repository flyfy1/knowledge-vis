// Supplemental reproducible focused captures for visual inspection of partial states.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto((process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18783')+'/leetcode/135/');
 assert(await page.locator('#feedback').isHidden());assert(await page.locator('#reveal').isDisabled());
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');
  await page.locator('#position').evaluate(e=>{e.value=5;e.dispatchEvent(new Event('input',{bubbles:true}));});
  const row=await page.locator('#tableBody tr').nth(2).locator('td').allTextContents();assert.deepEqual(row,['1','3 ★','2','1']);
  await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-partial-right.png`),style:'.step-nav{visibility:hidden!important}'});
 }
 await browser.close();fs.writeFileSync(path.join(out,'visual-states-results.json'),JSON.stringify({status:'pass',captures:['en-partial-right.png','zh-partial-right.png'],state:'L complete; R[1] just became 3; C unknown; quiz initially hidden and disabled',captureNote:'sticky navigation hidden during focused screenshot only'},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
