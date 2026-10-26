'use strict';
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = process.env.LESSON_TEST_OUTPUT_DIR || path.join(__dirname,'evidence/wall-proof');
fs.mkdirSync(output, {recursive: true});
const base = process.env.LESSON_PREVIEW || 'http://127.0.0.1:18842';
const route = process.env.LESSON_ROUTE || '/leetcode/42/';
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const errors = [], results = [];
  try {
  for (const lang of ['zh','en']) {
    const context = await browser.newContext({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
    await context.addInitScript(l => localStorage.setItem('knowledge-lang',l),lang);
    const page = await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',e => errors.push(String(e)));
    page.on('response',r => {if(r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push(r.url());});
    await page.goto(base+route); await page.waitForFunction(() => window.wallSnapshot);
    assert.match(await page.locator('.page-provenance summary').innerText(),lang==='zh'?/Codex 开发/:/Developed with Codex/);
    assert.equal((await page.evaluate(() => wallSnapshot())).phase,0);
    const states = [];
    for(let phase=0;phase<4;phase++) {
      const state = await page.evaluate(() => wallSnapshot()); states.push(state);
      assert.equal(state.phase,phase);
      assert.equal(await page.locator('#wall-chart .water').count(),phase===3?1:0);
      assert.equal(await page.locator('.wall-code .active').count(),1);
      assert.equal(await page.locator('#wall-prev').isDisabled(),phase===0);
      assert.equal(await page.locator('#wall-next').isDisabled(),phase===3);
      if(phase<3) await page.click('#wall-next');
    }
    await page.click('#wall-prev'); assert.deepEqual(await page.evaluate(() => wallSnapshot()),states[2]);
    assert.equal(await page.locator('#wall-chart .water').count(),0);
    await page.click('#wall-next'); assert.deepEqual(await page.evaluate(() => wallSnapshot()),states[3]);
    // Language changes preserve both independent simulations and all calculations.
    const traceBefore = await page.evaluate(() => lessonSnapshot());
    await page.click(`[data-lang="${lang==='zh'?'en':'zh'}"]`);
    assert.deepEqual(await page.evaluate(() => wallSnapshot()),states[3]);
    assert.deepEqual(await page.evaluate(() => lessonSnapshot()),traceBefore);
    await page.click(`[data-lang="${lang}"]`);
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
      const geometry = await page.locator('#wall-lab button, #wall-lab select, #wall-lab input').evaluateAll(ns => ns.map(n => {
        const r=n.getBoundingClientRect(); return {left:r.left,right:r.right,height:r.height};
      }));
      geometry.forEach(r => {assert.ok(r.left>=0 && r.right<=width+1); assert.ok(r.height>=48);});
      await page.locator('#wall-lab').evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 80));
      await page.screenshot({path:path.join(output,`${lang}-${width}-controls.png`)});
      await page.locator('#wall-chart').evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100));
      await page.screenshot({path:path.join(output,`${lang}-${width}-state.png`)});
      results.push({lang,width,overflow:false,controlMinHeight:Math.min(...geometry.map(r=>r.height))});
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(() => document.body.style.zoom='2');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
    await page.locator('#wall-chart').evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 150));
    await page.screenshot({path:path.join(output,`${lang}-zoom200.png`)});
    await page.evaluate(() => document.body.style.zoom='');
    // Arbitrary allowed last-wall heights and every focus column in every preset.
    for(let preset=0;preset<5;preset++) {
      await page.selectOption('#wall-preset',String(preset));
      const n = (await page.evaluate(() => wallSnapshot())).height.length;
      for(let i=0;i<n;i++) for(let h=0;h<=6;h++) {
        await page.selectOption('#wall-focus',String(i));
        await page.locator('#wall-height').evaluate((el,h) => {el.value=h;el.dispatchEvent(new Event('input',{bubbles:true}));},h);
        assert.equal((await page.evaluate(() => wallSnapshot())).phase,0);
        assert.equal(await page.locator('#wall-chart .water').count(),0);
        for(let step=0;step<3;step++) await page.click('#wall-next');
        const s = await page.evaluate(() => wallSnapshot());
        assert.equal(await page.locator('#wall-chart .water').count(),s.depth);
        assert.equal(await page.locator('#wall-depth').innerText(),String(s.depth));
      }
    }
    const beforeReset = await page.evaluate(() => wallSnapshot());
    await page.click('#wall-reset');
    assert.deepEqual(await page.evaluate(() => wallSnapshot()),{...beforeReset,phase:0});
    await page.click('#wall-restore');
    assert.deepEqual(await page.evaluate(() => wallSnapshot()),states[0]);
    await page.locator('#wall-next').focus(); await page.keyboard.press('Enter');
    assert.equal((await page.evaluate(() => wallSnapshot())).phase,1);
    await page.locator('#wall-prev').focus(); await page.keyboard.press('Space');
    assert.equal((await page.evaluate(() => wallSnapshot())).phase,0);
    await page.locator('#wall-height').focus(); await page.keyboard.press('ArrowRight');
    assert.equal((await page.evaluate(() => wallSnapshot())).height.at(-1),5);
    assert.equal(await page.evaluate(() => document.activeElement.id),'wall-height');
    assert.deepEqual(await page.evaluate(() => lessonSnapshot()),traceBefore);
    // Existing optimized trace still reaches its original result and rewinds.
    await page.click('#next'); await page.click('#prev'); assert.deepEqual(await page.evaluate(() => lessonSnapshot()),traceBefore);
    await page.locator('#position').evaluate(el => {el.value=el.max;el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal((await page.evaluate(() => lessonSnapshot())).frame.result,7);
    await page.click('#reset'); assert.deepEqual(await page.evaluate(() => lessonSnapshot()),traceBefore);
    const source = fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
    assert.equal(await page.locator('#pythonCode').textContent(),source);
    results.push({lang,combinations:119,rewind:true,reset:true,restore:true,localePreservesState:true,keyboard:true,traceIsolation:true});
    await context.close();
  }
  const context = await browser.newContext();
  await context.addInitScript(() => {Storage.prototype.getItem=()=>{throw Error('blocked');};Storage.prototype.setItem=()=>{throw Error('blocked');};});
  const page = await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+route);await page.click('[data-lang="zh"]');await page.click('#wall-next');
  assert.equal((await page.evaluate(()=>wallSnapshot())).phase,1);
  assert.match(await page.locator('#wall-message').innerText(),/右侧/);
  await context.close();
  assert.deepEqual(errors,[]);
  const report={route,results,storageDenied:'passed',errors};
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
