// Focused 51-R1 regression: exercise actual zoomed board glyphs and axis words.
const fs = require('fs'), path = require('path'), assert = require('assert');
const {chromium} = require('playwright');
const out = process.env.LESSON_TEST_OUTPUT_DIR || path.join(__dirname, 'zoom-evidence');
const base = process.env.LESSON_URL || 'http://127.0.0.1:18770/leetcode/51/';
fs.mkdirSync(out, {recursive:true});
(async () => {
  const browser = await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
  const report = {cases:[], errors:[]};
  try {
    for (const lang of ['en', 'zh']) {
      const context = await browser.newContext({locale:lang === 'en' ? 'en-US' : 'zh-CN'});
      const page = await context.newPage();
      page.on('pageerror', e => report.errors.push(e.message));
      await page.goto(base);
      await page.waitForSelector('#diagram .queen-board');
      await page.locator('#position').fill('32');
      await page.locator('#position').dispatchEvent('input');
      await page.locator('#beforeDetails summary').click();
      for (const [width, zoom] of [[320,1],[390,1],[736,1],[1440,1],[640,2]]) {
        await page.setViewportSize({width,height:1000});
        await page.evaluate(z => {document.body.style.zoom = String(z)}, zoom);
        const result = await page.evaluate(() => {
          const tables = [...document.querySelectorAll('.queen-board')];
          const failures = [];
          const metrics = tables.map(table => {
            const cells = [...table.querySelectorAll('th,td')];
            for (const cell of cells) {
              const box = cell.getBoundingClientRect(), style = getComputedStyle(cell);
              const scale = Number(document.body.style.zoom || 1);
              const left = box.left + parseFloat(style.paddingLeft) * scale;
              const right = box.right - parseFloat(style.paddingRight) * scale;
              // Test individual words so a natural break around " / " stays allowed.
              for (const match of cell.textContent.matchAll(/[^\s/]+/g)) {
                const range = document.createRange();
                range.setStart(cell.firstChild, match.index);
                range.setEnd(cell.firstChild, match.index + match[0].length);
                const rects = [...range.getClientRects()];
                if (rects.length !== 1 || rects.some(r => r.left < left - 0.5 || r.right > right + 0.5)) {
                  failures.push(`${table.parentElement.id || 'previous'}: clipped or split ${JSON.stringify(match[0])}`);
                }
              }
            }
            const widths = [...table.querySelectorAll('td')].map(e=>e.getBoundingClientRect().width);
            if (Math.max(...widths) - Math.min(...widths) > 1) failures.push('queen columns have unequal widths');
            return {width:table.getBoundingClientRect().width, minCellWidth:Math.min(...widths)};
          });
          const board = document.querySelector('#diagram').getBoundingClientRect();
          const state = document.querySelector('#state').parentElement.getBoundingClientRect();
          return {failures, metrics, stacked:state.top >= board.bottom, noOverflow:document.documentElement.scrollWidth <= innerWidth,
            position:document.querySelector('#position').value, placement:document.querySelector('#state dd').textContent,
            ledger:document.querySelectorAll('#results li').length, locale:document.documentElement.lang};
        });
        if (zoom === 2 && !result.stacked) result.failures.push('zoomed board and state must stack');
        if (!result.noOverflow) result.failures.push('whole-page overflow');
        if (result.position !== '32' || result.placement !== '[1, 3, 0]' || result.ledger !== 1) result.failures.push('trace or saved board changed');
        if (result.locale !== (lang === 'en' ? 'en' : 'zh-CN')) result.failures.push('wrong locale');
        const name = `${lang}-${width}-zoom${zoom}`;
        await page.locator('#diagram').scrollIntoViewIfNeeded();
        // Hide only the sticky nav during the tall element capture; board geometry stays intact.
        await page.locator('.board-layout').first().screenshot({path:path.join(out, `${name}.png`),style:'.step-nav{visibility:hidden}'});
        report.cases.push({name,...result});
      }
      await context.close();
    }
  } finally {await browser.close();}
  fs.writeFileSync(path.join(out,'zoom-results.json'), JSON.stringify(report,null,2)+'\n');
  const failures = report.cases.flatMap(c => c.failures.map(f => `${c.name}: ${f}`)).concat(report.errors);
  console.log(JSON.stringify({cases:report.cases.length, failures},null,2));
  assert.strictEqual(failures.length, 0, '51-R1: board markers and axis words must fit at normal widths and 200% zoom');
})().catch(e => {console.error(e);process.exitCode=1});
