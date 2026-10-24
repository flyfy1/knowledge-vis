const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage({viewport:{width:320,height:1000}}),records=[];
 for(const lang of ['zh','en']){
  await page.setViewportSize({width:320,height:1000});await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/466/');await page.locator(`[data-lang=${lang}]`).click();await page.screenshot({path:path.join(out,lang+'-320-header.png')});
  await page.selectOption('#preset','3');await page.locator('#end').click();
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('.state-grid').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.locator('.state-grid').screenshot({path:path.join(out,lang+'-zoom200-values.png')});
  for(const card of await page.locator('.state').all()){
   const g=await card.evaluate(e=>{const label=e.querySelector('span'),value=e.querySelector('b');return{label:label.textContent,value:value.textContent,labelBottom:label.getBoundingClientRect().bottom,valueTop:value.getBoundingClientRect().top,sw:e.scrollWidth,cw:e.clientWidth};});
   assert(g.labelBottom<=g.valueTop&&g.sw<=g.cw);records.push({lang,zoom:2,...g});
  }
  await page.locator('#decision').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.locator('#decision').screenshot({path:path.join(out,lang+'-zoom200-final.png')});
  await page.evaluate(()=>document.documentElement.style.zoom='1');await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.locator('#feedback').screenshot({path:path.join(out,lang+'-prediction.png')});
 }
 fs.writeFileSync(path.join(out,'reading.json'),JSON.stringify({status:'pass',records,method:'real Chromium, 200% CSS layout zoom; screenshots require author visual inspection'},null,2));await browser.close();console.log('reading geometry and captures: pass');
})().catch(e=>{console.error(e);process.exit(1);});
