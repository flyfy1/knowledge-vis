// Run from repository root. Writes only lesson-local self-check evidence.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.resolve('leetcode/30');
const source = fs.readFileSync(path.join(root, 'solution.py'), 'utf8');
const base = process.env.LESSON_PREVIEW || 'http://127.0.0.1:18770/leetcode/30/';
const evidence = path.join(root, 'evidence');
async function seek(page, index) {
  await page.locator('#position').evaluate((node, i) => {
    node.value = i; node.dispatchEvent(new Event('input', {bubbles:true}));
  }, index);
}
async function snap(page) { return page.evaluate(() => window.lessonSnapshot()); }
async function checkDiagram(page, target, frame) {
  const expected = frame.rows[0].active;
  const hot = await page.locator(`${target} .trace-array`).first().locator('.hot small').allTextContents();
  assert.deepEqual(hot.map(Number), expected);
  assert.match(await page.locator(`${target} > .hint`).innerText(), /\[left, right\)/);
  assert.equal(frame.state.used, (frame.state.right - frame.state.left) / 3);
}
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const checks = [], errors = [];
  try {
    for (const locale of ['en', 'zh']) {
      const context = await browser.newContext({viewport:{width:1280,height:900}, permissions:['clipboard-read','clipboard-write']});
      const page = await context.newPage();
      page.on('pageerror', e => errors.push(String(e)));
      page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
      await page.goto(base);
      await page.waitForFunction(() => window.lessonSnapshot && document.querySelector('#message').textContent);
      await page.locator(`[data-lang="${locale}"]`).click();
      await page.locator('#beforeDetails').evaluate(el => el.open = true);
      // Add, match/overlap removal, excess shrink, unknown reset.
      for (const i of [2,3,4,5,6,7,8,9,10,11,12,14]) {
        await seek(page, i);
        const current = await snap(page);
        await checkDiagram(page, '#diagram', current.frame);
        await seek(page, i-1);
        const previous = await snap(page);
        await seek(page, i);
        await checkDiagram(page, '#beforeDiagram', previous.frame);
      }
      await seek(page, 7);
      const removed = await snap(page);
      assert.deepEqual(removed.frame.state, {offset:0,left:6,right:9,used:1});
      assert.deepEqual(removed.frame.rows[0].active, [6,7,8]);
      assert.deepEqual(removed.frame.rows[2].values, ['foo: 1']);
      for (const width of [320,390,1280]) {
        await page.setViewportSize({width,height:900});
        for (const i of [2,5,7,12,14]) {
          await seek(page,i);
          await checkDiagram(page,'#diagram',(await snap(page)).frame);
          await seek(page,i-1);
          const previous=await snap(page);
          await seek(page,i);
          await checkDiagram(page,'#beforeDiagram',previous.frame);
        }
        await seek(page,7);
        await page.locator('#diagram').scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
        await page.screenshot({path:path.join(evidence, `${locale}-${width}-shrink.png`)});
        if(width===320 || width===1280) {
          for(const step of ['step1','step4']) {
            await page.locator(`#${step}`).screenshot({path:path.join(evidence,`${locale}-${width}-${step}.png`)});
          }
        }
      }
      await page.setViewportSize({width:1280,height:900});
      await page.evaluate(() => document.documentElement.style.zoom = '2');
      await page.locator('#diagram').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth),1280);
      await page.screenshot({path:path.join(evidence, `${locale}-zoom200-shrink.png`)});
      await page.evaluate(() => document.documentElement.style.zoom = '');
      // Replay exact snapshots and keyboard interaction.
      await page.locator('#prev').click();
      assert.equal((await snap(page)).index, 6);
      await page.locator('#next').click();
      assert.deepEqual(await snap(page), removed);
      await page.locator('#position').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal((await snap(page)).index,8);
      await page.locator('#reset').click();
      assert.equal((await snap(page)).index,0);
      assert.equal(await page.locator('#prev').isDisabled(),true);
      const expected = [[0,9],[1],[0,3],[]];
      for (let preset=0;preset<4;preset++) {
        await page.selectOption('#preset', String(preset));
        assert.equal((await snap(page)).index,0);
        const {frames} = await snap(page);
        for(let i=1;i<frames;i++) await page.locator('#next').click();
        assert.deepEqual((await snap(page)).frame.result,expected[preset]);
        assert.equal(await page.locator('#next').isDisabled(),true);
      }
      for (let choice=0;choice<3;choice++) {
        await page.locator(`[name="prediction"][value="${choice}"]`).check();
        assert.equal((await snap(page)).revealed,false);
        await page.locator('#reveal').click();
        assert.equal((await snap(page)).revealed,true);
        assert.ok(await page.locator('#feedback').innerText());
      }
      const beforeLocale = await snap(page);
      await page.locator(`[data-lang="${locale==='en'?'zh':'en'}"]`).click();
      assert.deepEqual(await snap(page),beforeLocale);
      await page.locator(`[data-lang="${locale}"]`).click();
      assert.equal(await page.locator('#beforeDetails').evaluate(el => el.open),true);
      // Display, embedded string, clipboard and actual download bytes all match canonical.
      assert.equal(await page.locator('#pythonCode').textContent(),source);
      assert.equal(await page.evaluate(() => window.PYTHON_SOURCE),source);
      await page.locator('#copy').click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()),source);
      const downloaded = page.waitForEvent('download');
      await page.locator('a[download]').click();
      const stream = await (await downloaded).createReadStream();
      const chunks=[]; for await (const chunk of stream) chunks.push(chunk);
      assert.equal(Buffer.concat(chunks).toString('utf8'),source);
      await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
      await page.locator('#copy').click();
      assert.equal(await page.locator('#manualCopy').isVisible(),true);
      assert.equal(await page.locator('#copyText').inputValue(),source);
      checks.push(`${locale}: transition semantics, widths 320/390/1280, CSS zoom 200%, keyboard, all preset endpoints, predictions, locale preservation, source/copy/download/fallback passed`);
      await context.close();
    }
    // Offline file behavior and unavailable storage in both locales.
    for (const locale of ['en','zh']) {
      const context = await browser.newContext({locale:locale==='zh'?'zh-CN':'en-US'});
      await context.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));
      const page=await context.newPage(); page.on('pageerror',e=>errors.push(String(e)));
      await page.goto('file://'+path.join(root,'index.html'));
      await page.waitForFunction(()=>window.lessonSnapshot);
      assert.equal(await page.locator('#pythonCode').textContent(),source);
      await page.locator('#next').click();
      assert.equal((await snap(page)).index,1);
      checks.push(`${locale}: offline source/next with denied storage passed`);
      await context.close();
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify({kind:'author self-check',checks,errors},null,2)+'\n');
    console.log(checks.join('\n'));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
