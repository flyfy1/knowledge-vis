'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const page=await b.newPage({viewport:{width:390,height:1000}});const errors=[],screens=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const lang of ['en','zh']){
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/440/');await page.locator(`[data-lang=${lang}]`).click();
  for(const [name,selector] of [['header','.site-head'],['hand','#step0 .step-inner'],['count-explanation','#step1 .step-inner'],['prediction-before','#step3 .step-inner']]){await page.locator(selector).evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));const file=lang+'-reading-'+name+'.png';await page.locator(selector).screenshot({path:path.join(out,file)});screens.push(file);}
  assert(await page.locator('#feedback').isHidden());await page.locator('input[name=prediction][value="1"]').check();await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());await page.locator('#step3 .step-inner').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));let file=lang+'-reading-prediction-after.png';await page.locator('#step3 .step-inner').screenshot({path:path.join(out,file)});screens.push(file);
  await page.evaluate(()=>document.documentElement.style.zoom='2');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.state-grid').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));file=lang+'-390-zoom200.png';await page.locator('.state-grid').screenshot({path:path.join(out,file)});screens.push(file);await page.evaluate(()=>document.documentElement.style.zoom='1');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'reading.json'),JSON.stringify({status:'pass',screenshots:screens,viewport:390,zoom:'200% CSS layout zoom also checked at 390px',errors},null,2));await b.close();console.log('Reading/390px zoom screenshots: pass');
})().catch(e=>{console.error(e);process.exit(1);});
