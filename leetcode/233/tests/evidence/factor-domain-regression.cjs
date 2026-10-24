const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  for(const locale of ['en','zh']){
    const page=await browser.newPage({viewport:{width:390,height:900}});
    await page.goto('http://127.0.0.1:18795/leetcode/233/');
    await page.click(`[data-lang="${locale}"]`);
    assert.deepEqual(await page.locator('#factor option').evaluateAll(es=>es.map(e=>Number(e.value))),[1,10,100],`${locale}: non-decimal factor enabled`);
    await page.selectOption('#factor','10');
    assert.equal(await page.locator('#factorValue').textContent(),'10');
    assert.match(await page.locator('#formulaReadout').textContent(),/higher=0, current=1, lower=3/);
    await page.selectOption('#factor','100');
    assert.equal(await page.locator('#factorValue').textContent(),'100');
    assert.match(await page.locator('#formulaReadout').textContent(),/higher=0, current=0, lower=13/);
    await page.close();
  }
  await browser.close();
  console.log('factor domain regression: PASS (decimal factors 1, 10, 100; en, zh)');
})().catch(error=>{console.error(error);process.exit(1)});
