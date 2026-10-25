const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const out = process.env.OUTPUT_DIR || '/tmp/lesson262-teaching';
  fs.mkdirSync(out, {recursive:true});
  const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const page = await browser.newPage();
  const failures = [], observations = [];
  const copySource = fs.readFileSync(path.join(__dirname,'../copy.js'),'utf8');
  const keys = [...copySource.matchAll(/^  "([^"]+)":/gm)].map(m=>m[1]);
  assert.equal(new Set(keys).size,keys.length,'duplicate COPY keys');
  const copy = JSON.parse(copySource.split('const COPY=')[1].trim().replace(/;$/, ''));
  for (const value of Object.values(copy)) assert(Array.isArray(value) && value.length===2 && value.every(v=>typeof v==='string'),'two-string locale pair');
  try {
    await page.goto('http://127.0.0.1:18770/leetcode/262/', {waitUntil:'networkidle'});
    for (const lang of ['en','zh']) {
      await page.click(`[data-lang="${lang}"]`);
      for (const [id, selector, phrases] of [
        ['FIND-262-003', '#step2, #step4', ['[1, 3, 4, 10, 11, 12, 13]', '#1, #3, #4', '[0, 0, 1]', 'sum = 1', 'count = 3', '64', 'T =', 'U =', lang === 'en' ? 'two merges' : '两次 merge']],
        ['FIND-262-004', '#step2', [lang === 'en' ? 'excluded row changes neither count' : '排除行不改变任何计数', '(0, 1)', lang === 'en' ? 'eligible cancelled row' : '合资格且取消的行']]
      ]) {
        const text = (await page.locator(selector).allTextContents()).join('\n');
        try { for (const phrase of phrases) assert(text.includes(phrase), `${id} ${lang}: missing ${phrase}`); }
        catch(e) { failures.push(e.message); }
        observations.push({id,lang,text});
      }
      for (const width of [320,390,1280]) {
        await page.setViewportSize({width,height:900});
        if (await page.locator('#reset').isEnabled()) await page.click('#reset');
        await page.click('#next');
        const before = await page.locator('#daily').textContent();
        await page.click('#next');
        assert.equal(await page.locator('#daily').textContent(), before, 'excluded #2 must preserve (0,1)');
        await page.click('#prev');
        assert.equal(await page.locator('#daily').textContent(), before);
        await page.click('#next');
        assert.equal(await page.locator('#daily').textContent(), before);
        if (width === 390 || width === 1280) await page.locator('#step4').screenshot({path:path.join(out,`${lang}-${width}-complete-bridge.png`)});
        for (const zoom of [1,2]) {
          await page.evaluate(z => document.body.style.zoom=String(z), zoom);
          for (const section of ['step2','step4']) {
            await page.locator('#'+section).scrollIntoViewIfNeeded();
            await page.screenshot({path:path.join(out,`${lang}-${width}-${zoom}-${section}.png`),fullPage:false});
          }
        }
        await page.evaluate(()=>document.body.style.zoom='1');
      }
    }
    fs.writeFileSync(path.join(out,'observations.json'),JSON.stringify({failures,observations},null,2));
    assert.deepEqual(failures, []);
    console.log('teaching regressions passed: FIND-262-003/004, EN/zh, excluded transition/rewind/replay, 320/390/1280 and CSS zoom 200% captures');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
