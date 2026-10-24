const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  for (const locale of ['en','zh']) {
    const page=await browser.newPage({viewport:{width:390,height:900}});
    await page.goto('http://127.0.0.1:18795/leetcode/233/');
    await page.click(`[data-lang="${locale}"]`);
    await page.click('#transferBtns [data-g="23"]');
    assert.equal(await page.locator('#transferFeedback').isHidden(),true,`${locale}: feedback leaked before reveal`);
    assert.equal(await page.locator('#transferRows tr').count(),0,`${locale}: rows leaked before reveal`);
    await page.click('#transferReveal');
    assert.equal(await page.locator('#transferFeedback').isHidden(),false,`${locale}: feedback missing after reveal`);
    assert.equal(await page.locator('#transferRows tr').count(),3,`${locale}: contribution rows missing after reveal`);
    await page.click('#transferBtns [data-g="12"]');
    assert.equal(await page.locator('#transferFeedback').isHidden(),true,`${locale}: changing answer kept feedback visible`);
    assert.equal(await page.locator('#transferRows tr').count(),0,`${locale}: changing answer kept rows visible`);
    await page.close();
  }
  await browser.close();
  console.log('transfer reveal regression: PASS (en, zh)');
})().catch(error=>{console.error(error);process.exit(1)});
