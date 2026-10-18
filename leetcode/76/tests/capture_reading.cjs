// Extra visual-state checks; OUTPUT_DIR supported.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const p=await b.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18773')+'/leetcode/76/');await p.locator('#state').filter({hasText:'missing'}).waitFor();
 for(const lang of ['en','zh']){
  await p.click(`[data-lang="${lang}"]`);await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`${lang}-header.png`)});
  for(const i of [0,1,3,4]){await p.locator(`#step${i}`).scrollIntoViewIfNeeded();await p.locator(`#step${i}`).screenshot({path:path.join(out,`${lang}-reading${i}.png`)});}
  await p.check('[name="prediction"][value="2"]');await p.click('#reveal');await p.locator('#step3').screenshot({path:path.join(out,`${lang}-prediction-revealed.png`)});
  assert(await p.locator('#feedback').isVisible());await p.selectOption('#preset','1');await p.locator('#position').evaluate(e=>{e.value=6;e.dispatchEvent(new Event('input'));});
  await p.locator('#tiles').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${lang}-surplus.png`)});
  // Minimum width under zoom: CSS viewport 320 at 200%, intentionally severe.
  await p.setViewportSize({width:640,height:1200});await p.evaluate(()=>document.documentElement.style.zoom=2);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('#tiles').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`${lang}-narrow-zoom200.png`)});await p.evaluate(()=>document.documentElement.style.zoom='');await p.setViewportSize({width:390,height:1000});
 }
 // 120-letter invalid alphabetic draft in the text field cannot affect committed trace.
 await p.locator('#inputS').evaluate(e=>e.value='A'.repeat(120));await p.locator('#inputT').evaluate(e=>e.value='A');await p.click('[data-i18n="apply"]');assert(await p.locator('#validation').isVisible());assert.equal(await p.inputValue('#position'),'6');
 fs.writeFileSync(path.join(out,'reading-results.json'),JSON.stringify({locales:['en','zh'],screenshots:16,checks:['header','all reading sections','revealed prediction','surplus frame','320 CSS pixel equivalent at 200% zoom','120-character draft rejected without loss']},null,2));await b.close();})().catch(e=>{console.error(e);process.exit(1);});
