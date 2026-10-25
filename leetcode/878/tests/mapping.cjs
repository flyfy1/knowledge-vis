// 878-R1: test rendered meaning, not merely the existence of translation keys.
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence','r1-fix');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'}),observed=[];
 await page.goto(process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/878/');
 for(const locale of ['en','zh']){
  await page.locator(`[data-lang=${locale}]`).click();
  const bullets=await page.locator('#step4 li').allTextContents();
  assert.equal(bullets.length,3);
  const expected=[['lcm = (a // gcd(a, b)) * b','lo, hi = 1, n * min(a, b)','[1,8]'],
   ['mid = (lo + hi) // 2','count = mid // a + mid // b - mid // lcm','2+1−0=3','lo = mid + 1','[5,8]'],
   ['3+2−1=4','hi = mid','[5,6]','[6,6]','return lo % 1_000_000_007']];
  for(let i=0;i<3;i++)for(const fragment of expected[i])assert(bullets[i].includes(fragment),`${locale} map${i} missing ${fragment}: ${bullets[i]}`);
  assert(bullets[1].includes(locale==='en'?'every value through 4':'不超过 4'));
  assert(bullets[2].includes(locale==='en'?'keep mid itself':'保留 mid 本身'));
  // Hand-calculated default trace: two different branches, with no production oracle.
  await page.selectOption('#preset','0');
  for(const [before,after,count] of [['[1, 8]','[5, 8]','2+1−0=3'],['[5, 8]','[5, 6]','3+2−1=4']]){
   await page.locator('#next').click();
   assert.equal(await page.locator('#beforeInterval').textContent(),before);
   assert.equal(await page.locator('#afterInterval').textContent(),after);
   assert((await page.locator('#tested').textContent()).includes(count));
  }
  for(const width of [1280,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.locator('.step-nav a[href="#step4"]').click();
   await page.waitForFunction(()=>document.querySelector('#step4').getBoundingClientRect().top>=0 && document.querySelector('#step4').getBoundingClientRect().top<200);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:path.join(out,`mapping-${locale}-${width}.png`),fullPage:false});
   if(width===320)await page.locator('#step4 ul').screenshot({path:path.join(out,`mapping-bullets-${locale}-320.png`)});
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#step4 ul').screenshot({path:path.join(out,`mapping-bullets-${locale}-zoom200.png`)});
  await page.evaluate(()=>document.documentElement.style.zoom='');
  observed.push({locale,bullets,trace:'[1,8] -> mid4/count3 -> [5,8] -> mid6/count4 -> [5,6]'});
 }
 fs.writeFileSync(path.join(out,'mapping-result.json'),JSON.stringify({finding:'878-R1',result:'pass',browser:await browser.version(),platform:process.platform,observed},null,2));
 } finally {await browser.close();}
 console.log('878-R1 bilingual rendered code mappings and hand-calculated transitions passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
