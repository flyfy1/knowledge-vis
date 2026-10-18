const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  try {
    const page=await browser.newPage(), results=[];
    const base='http://127.0.0.1:18770';
    for(const locale of ['en','zh']) {
      await page.goto(base+'/leetcode/30/');
      await page.waitForFunction(()=>window.lessonSnapshot);
      await page.locator(`[data-lang="${locale}"]`).click();
      for(const width of [736,1440]) {
        await page.setViewportSize({width,height:900});
        for(const i of [2,5,7,12,14]) {
          await page.locator('#position').evaluate((e,i)=>{e.value=i;e.dispatchEvent(new Event('input'));},i);
          const snapshot=await page.evaluate(()=>lessonSnapshot());
          const actual=await page.locator('#diagram .trace-array').first().locator('.hot small').allTextContents();
          assert.deepEqual(actual.map(Number),snapshot.frame.rows[0].active);
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
        results.push({locale,width,events:[2,5,7,12,14],result:'passed'});
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      for(const width of [320,1280]) {
        await page.setViewportSize({width,height:900});
        for(const step of [1,2,4]) {
          await page.locator(`.step-nav a[href="#step${step}"]`).click();
          await page.waitForTimeout(350);
          const geometry=await page.evaluate(step=>({heading:document.querySelector(`#step${step} h2`).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),step);
          assert.ok(geometry.heading>=geometry.nav,JSON.stringify(geometry));
          if(step===1 || step===4) await page.screenshot({path:`leetcode/30/evidence/${locale}-${width}-step${step}-viewport.png`});
        }
      }
    }
    for(const file of ['30/index.html','30/copy.js','30/app.js','30/python-code.js','30/solution.py','common.js','style.css','hard-first-ten/core.js','hard-first-ten/lesson.js','hard-first-ten/style.css']) {
      const response=await page.request.get(base+'/leetcode/'+file);
      assert.equal(response.status(),200);
      assert.deepEqual(await response.body(),fs.readFileSync('leetcode/'+file));
    }
    fs.writeFileSync('leetcode/30/evidence/additional-widths.json',JSON.stringify({kind:'author self-check',results,deepLinks:'steps 1/2/4 clear sticky nav at 320/1280 in both locales',servedParity:'all ten loaded runtime/source files match checkout'},null,2)+'\n');
    console.log('Both locales: 736/1440 transition checks, 320/1280 deep links, served-byte parity passed');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
