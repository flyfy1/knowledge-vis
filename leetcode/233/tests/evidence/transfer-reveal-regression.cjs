const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  for (const locale of ['en','zh']) for (const width of [320,390,1280]) {
    const page=await browser.newPage({viewport:{width,height:900}});
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
    await page.fill('#nInput','11');
    assert.equal(await page.locator('#nInput').inputValue(),'11',`${locale}: custom input was not accepted`);
    await page.click('#resetBtn');
    assert.equal(await page.locator('#nInput').inputValue(),'13',`${locale}: reset left stale visible n input`);
    assert.match(await page.locator('#formulaReadout').textContent(),/higher=1, current=3, lower=0/,
      `${locale}: reset formula did not return to preset n=13`);
    await page.close();
  }
  await browser.close();
  console.log('transfer reveal and reset regression: PASS (en, zh; 320, 390, 1280px)');
})().catch(error=>{console.error(error);process.exit(1)});
