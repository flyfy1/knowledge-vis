/* Supplementary visual/access checks for the introduction, full bit grid and source. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage({viewport:{width:320,height:1000}});await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18781')+'/leetcode/600/');
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-320-intro.png`)});
  const rule=await page.locator('[data-i18n=scanRule]').textContent();assert(rule.includes('2ⁱ−1'));assert(rule.includes('f[i]'));
  await page.selectOption('#preset','1000000000');await page.click('#end');await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');await page.locator('#bits').screenshot({path:path.join(out,`${lang}-320-all-bits.png`)});assert.equal(await page.locator('#bits .bit').count(),30);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.locator('#step4').screenshot({path:path.join(out,`${lang}-320-source.png`)});assert.equal(await page.textContent('#pythonCode'),fs.readFileSync(path.join(root,'solution.py'),'utf8'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  // The canonical solution disclosure stays open after locale changes.
  await page.locator('.step-nav').evaluate(e=>e.style.visibility='');await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
 }
 fs.writeFileSync(path.join(out,'visual-results.json'),JSON.stringify({kind:'author supplemental browser check',status:'PASS',locales:['en','zh'],width:320,all30Bits:true,canonicalSourceExact:true,sourceDisclosurePreserved:true,placeValueProof:'2ⁱ−1 and f[i] visible in both locales'},null,2));await browser.close();console.log('PASS: supplementary visual captures');
})().catch(e=>{console.error(e);process.exit(1)});
