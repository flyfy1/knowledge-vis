'use strict';
// Focused regression for 780-COPY-R1; intentionally leaves the numerical suites alone.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'evidence/copy-r1');
const base = process.env.PREVIEW_ROOT || 'http://127.0.0.1:18770';
const source = fs.readFileSync(path.join(root, 'solution.py'), 'utf8');
const old = ['作者自查候选', '尚待独立评审', 'Author self-checked candidate', 'Independent review pending'];
const result = { finding: '780-COPY-R1', host: process.platform, states: [], layouts: [], source: [] };
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
  try {
    result.browser = browser.version();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto(base + '/leetcode/780/');
    await page.waitForFunction(() => document.querySelector('#frameRead').textContent.length > 10);
    // The old candidate must fail here, even though its algorithm is correct.
    assert.equal(await page.locator('footer,[data-i18n="foot"],.site-foot').count(), 0, '780-COPY-R1: remove workflow footer');
    assert.equal(await page.evaluate(() => Object.hasOwn(window.LESSON_COPY, 'foot')), false);
    for (const name of ['index.html', 'copy.js', 'app.js', 'core.js', 'solution.py', 'python-code.js', 'style.css']) {
      const response = await context.request.get(base + '/leetcode/780/' + name);
      assert(response.ok());
      assert((await response.body()).equals(fs.readFileSync(path.join(root, name))), 'served bytes ' + name);
    }
    await page.locator('#preset').selectOption('1');
    await page.locator('#next').click(); // (3,17) -> (3,2): 5 completed subtractions.
    await page.locator('#addY').click();
    await page.locator('[name="prediction"][value="2"]').check();
    await page.locator('#reveal').click();
    for (const locale of ['zh', 'en', 'zh']) {
      await page.locator(`[data-lang="${locale}"]`).click();
      assert.equal(await page.locator('html').getAttribute('lang'), locale === 'zh' ? 'zh-CN' : 'en');
      const body = await page.locator('body').textContent();
      for (const text of old) assert(!body.includes(text), text);
      const bindings = await page.evaluate(() => [...document.querySelectorAll('[data-i18n]')].map(e => ({key:e.dataset.i18n,text:e.textContent})));
      for (const binding of bindings) assert(binding.text.trim().length, 'empty binding ' + binding.key);
      const limits = {};
      for (const key of ['handLimit', 'sim', 's4e', 'formula']) {
        limits[key] = await page.locator(`[data-i18n="${key}"]`).textContent();
        const expected = await page.evaluate(({key,locale}) => window.LESSON_COPY[key][locale === 'zh' ? 0 : 1], {key,locale});
        assert.equal(limits[key], expected);
      }
      assert(limits.handLimit.includes('20'));
      assert(limits.sim.includes('JavaScript') && limits.sim.includes('Python'));
      assert(limits.formula.includes('(ty − sy) % sx = 0') && limits.formula.includes('ty ≥ sy'));
      assert.equal(await page.locator('#tracePoint').textContent(), '(3, 2)');
      assert.equal(await page.locator('#handPoint').textContent(), '(1, 2)');
      assert.equal(await page.locator('#traceHistory li').count(), 1);
      assert((await page.locator('#operation').textContent()).includes('17 = 5 × 3 + 2'));
      assert((await page.locator('#frameRead').textContent()).includes('1/3'));
      assert(await page.locator('[name="prediction"][value="2"]').isChecked());
      assert((await page.locator('#feedback').textContent()).includes('17 % 5=2'));
      result.states.push({locale,limits,frame:await page.locator('#frameRead').textContent(),operation:await page.locator('#operation').textContent(),feedback:await page.locator('#feedback').textContent()});
    }
    for (const locale of ['en','zh']) {
      await page.locator(`[data-lang="${locale}"]`).click();
      const operation = await page.locator('#operation').textContent();
      await page.locator('#prev').click();
      assert.equal(await page.locator('#traceHistory li').count(),0);
      await page.locator('#next').click();
      assert.equal(await page.locator('#operation').textContent(), operation);
      await page.locator('[name="prediction"][value="0"]').check();
      assert(!(await page.locator('#feedback').textContent()).includes('17 % 5=2'));
      await page.locator('[name="prediction"][value="2"]').check();
      await page.locator('#reveal').click();
      assert.equal(await page.locator('#pythonCode').textContent(), source);
      assert.equal(await page.evaluate(() => window.PYTHON_SOURCE), source);
      await page.locator('#copyPython').click();
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()),source);
      const [download] = await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);
      assert(fs.readFileSync(await download.path()).equals(Buffer.from(source)));
      const sentinel = `780-COPY-R1-${locale}-fresh-sentinel`;
      await page.evaluate(s => navigator.clipboard.writeText(s),sentinel);
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()),sentinel);
      await page.evaluate(() => { window.originalWrite = navigator.clipboard.writeText.bind(navigator.clipboard); navigator.clipboard.writeText = () => Promise.reject(new Error('test denial')); });
      await page.locator('#copyPython').click();
      assert.deepStrictEqual(await page.locator('#manualSource').evaluate(e => [document.activeElement === e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
      const shortcut = process.platform === 'darwin' ? 'Meta+c' : 'Control+c';
      await page.keyboard.press(shortcut);
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()),source);
      await page.evaluate(() => {navigator.clipboard.writeText = window.originalWrite;});
      await page.locator('#copyPython').click();
      await page.locator('#sourceFallback').waitFor({state:'hidden'});
      result.source.push({locale,sentinel,sentinelVerified:true,shortcut,renderedMirrorCopyFallbackDownloadExact:true,bytes:Buffer.byteLength(source)});
    }
    for (const width of [320,390,1280]) for (const zoom of (width === 390 ? [1] : [1,2])) for (const locale of ['zh','en']) {
      await page.setViewportSize({width,height:900});
      await page.locator(`[data-lang="${locale}"]`).click();
      await page.evaluate(z => document.documentElement.style.zoom = z, String(zoom));
      await page.locator('#sourceDetails').evaluate(e => e.open = false);
      await page.locator('.related a[href="#step1"]').focus();
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), '#step2');
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash,'#step2');
      await page.evaluate(() => scrollTo(0,document.documentElement.scrollHeight));
      const geometry = await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyBottom:document.body.getBoundingClientRect().bottom,mainBottom:document.querySelector('main').getBoundingClientRect().bottom}));
      assert(geometry.scrollWidth <= width + 1,JSON.stringify(geometry));
      assert(Math.abs(geometry.bodyBottom-geometry.mainBottom)<1,'orphan footer gap');
      const screenshot = `end-${locale}-${width}-zoom${zoom}.png`;
      await page.screenshot({path:path.join(out,screenshot)});
      result.layouts.push({locale,width,zoom,geometry,screenshot,relatedLinksKeyboard:true});
      await page.evaluate(() => document.documentElement.style.zoom = '');
    }
    assert.deepStrictEqual(errors,[]);
    result.errors = errors;
    fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');
    console.log('780-COPY-R1: bilingual bindings/state, source transfers, served bytes, keyboard and 10 end layouts passed');
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
