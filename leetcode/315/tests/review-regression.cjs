const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const evidence = path.join(__dirname,'evidence');
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:18770/leetcode/315/';
const canonical = fs.readFileSync(path.join(root,'solution.py'),'utf8');
const mirror = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),mirror);
assert.equal(mirror.window.PYTHON_SOURCE,canonical);
// Detect duplicate definitions before object evaluation can silently overwrite them.
const acorn = require('acorn');
function inspect(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'ObjectExpression') {
    const keys = node.properties.filter(p=>p.type==='Property').map(p=>p.key.name ?? p.key.value);
    assert.equal(new Set(keys).size,keys.length,'duplicate localization key');
  }
  for (const value of Object.values(node)) {
    if(Array.isArray(value)) value.forEach(inspect); else inspect(value);
  }
}
inspect(acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'}));
const copy = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),copy);
for (const pair of Object.values(copy.window.LEETCODE_COPY)) assert.equal(pair.length,2);
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const context = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
  const page = await context.newPage();
  const errors = [], results = [], environmentNotices = [];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'){if(m.location().url===new URL('/favicon.ico',url).href)environmentNotices.push('Preview root favicon.ico returns 404 (outside lesson ownership)');else errors.push(m.text());}});
  page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure().errorText));
  await page.goto(url);
  await page.waitForFunction(()=>document.querySelector('#handReadout').textContent.length>0);
  for (const locale of ['en','zh']) {
    await page.click(`[data-lang="${locale}"]`);
    const correct = locale==='en'?'Correct':'正确';
    const comparisonsLabel = locale==='en'?'Comparisons so far':'累计比较';
    const empty = async id=>assert.equal(await page.locator(id).innerText(),'');
    const includes = async(id,part)=>assert.ok((await page.locator(id).innerText()).includes(part),id+' missing '+part);
    for (const [pos,count] of [[0,2],[1,1],[2,1],[3,0]]) {
      await page.selectOption('#posSelect',String(pos));
      await empty('#guessFeedback');
      for(const choice of [0,1,2,3,4]) {
        await page.click(`[data-guess="${choice}"]`);
        assert.equal((await page.locator('#guessFeedback').innerText()).startsWith(correct),choice===count);
      }
      await page.click(`[data-guess="${count}"]`);
      assert.ok((await page.locator('#guessFeedback').innerText()).startsWith(correct));
      await includes('#guessFeedback',String(count));
      assert.equal(await page.locator(`[data-guess="${count}"]`).getAttribute('aria-pressed'),'true');
      // Switching locale preserves the selected position, answer and its meaning.
      await page.click(`[data-lang="${locale==='en'?'zh':'en'}"]`);
      assert.equal(await page.locator('#posSelect').inputValue(),String(pos));
      assert.equal(await page.locator(`[data-guess="${count}"]`).getAttribute('aria-pressed'),'true');
      await page.click(`[data-lang="${locale}"]`);
      assert.ok((await page.locator('#guessFeedback').innerText()).startsWith(correct));
    }
    await page.click('#baseReset');
    for (const [i,comparisons] of [3,5,6,6,6].entries()) {
      assert.equal(await page.locator('#baseComparisons').innerText(),String(comparisons));
      await includes('#baseReadout',`${comparisonsLabel} ${comparisons}`);
      assert.equal(await page.locator('#basePrev').isDisabled(),i===0);
      assert.equal(await page.locator('#baseNext').isDisabled(),i===4);
      if(i<4) await page.click('#baseNext');
    }
    for (const comparisons of [6,6,5,3]) {
      await page.click('#basePrev');
      await includes('#baseReadout',`${comparisonsLabel} ${comparisons}`);
    }
    await page.click('#baseReset');
    assert.equal(await page.locator('#baseComparisons').innerText(),'3');
    // Fresh prediction retains the state BEFORE i=1, and hides its count until reveal.
    await page.selectOption('#traceExample','fresh');
    await page.click('#traceNext'); await page.click('#traceNext');
    assert.equal(await page.locator('#reveal').isDisabled(),true);
    assert.equal(await page.locator('#traceNext').isDisabled(),true);
    assert.deepEqual(await page.locator('#traceCounts .array-value').allTextContents(),['?','?','1','0']);
    await page.locator('#prediction').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(evidence,`r2-${locale}-prediction-before.png`)});
    await page.check('[name=pred][value="1"]'); await page.click('#reveal');
    await includes('#predictionFeedback',locale==='en'?'excluded':'不计入');
    await page.check('[name=pred][value="0"]'); await empty('#predictionFeedback');
    await page.click('#reveal');
    await includes('#predictionFeedback',locale==='en'?'Zero':'0');
    await page.screenshot({path:path.join(evidence,`r2-${locale}-prediction-after.png`)});
    assert.deepEqual(await page.locator('#traceCounts .array-value').allTextContents(),['?','0','1','0']);
    await page.click(`[data-lang="${locale==='en'?'zh':'en'}"]`);
    assert.equal(await page.locator('[name=pred][value="0"]').isChecked(),true);
    assert.ok((await page.locator('#predictionFeedback').innerText()).length>0);
    await page.click(`[data-lang="${locale}"]`);
    await page.click('#traceNext');
    assert.deepEqual(await page.locator('#traceCounts .array-value').allTextContents(),['3','0','1','0']);
    assert.equal(await page.locator('#traceNext').isDisabled(),true);
    await page.click('#traceReset');
    assert.equal(await page.locator('#tracePrev').isDisabled(),true);
    for(const preset of ['demo','ties']) {
      await page.selectOption('#traceExample',preset);
      while(!(await page.locator('#traceNext').isDisabled())) await page.click('#traceNext');
      const expected = preset==='demo'?['2','1','1','0']:['0','0','0'];
      assert.deepEqual(await page.locator('#traceCounts .array-value').allTextContents(),expected);
      while(!(await page.locator('#tracePrev').isDisabled())) await page.click('#tracePrev');
    }
    for (const [rank,total,nodes] of [[1,0,0],[2,1,1],[3,3,1],[4,4,2],[5,4,1]]) {
      await page.locator('#rankRange').fill(String(rank));
      await includes('#bitReadout',`prefix(rank−1): ${total}`);
      assert.equal(await page.locator('#fenwickCost').innerText(),String(nodes));
    }
    for (const value of await page.locator('#verifyCase option').allTextContents()) {
      await page.selectOption('#verifyCase',value);
      await includes('#verifyResult',locale==='en'?'match':'一致');
    }
    assert.equal(await page.locator('#pythonCode').textContent(),canonical);
    await page.click('#copyPython');
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),canonical);
    const downloadPromise=page.waitForEvent('download');
    await page.click('a[download]');
    const download=await downloadPromise;
    assert.equal(fs.readFileSync(await download.path(),'utf8'),canonical);
    // Failure branch must actually select the exact code it tells the reader to copy.
    await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw Error('test denied')}}));
    await page.click('#copyPython');
    assert.equal(await page.evaluate(()=>getSelection().getRangeAt(0).cloneContents().textContent),canonical);
    await includes('#copyStatus',locale==='en'?'manual copy':'手动复制');
    await page.keyboard.press('Control+c');
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),canonical);
    await page.evaluate(()=>delete navigator.clipboard.writeText);
    for (const width of [320,390,736,1440]) {
      await page.setViewportSize({width,height:900});
      await page.selectOption('#posSelect','0'); await page.click('[data-guess="2"]');
      await page.locator('#step0').scrollIntoViewIfNeeded();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.screenshot({path:path.join(evidence,`r2-${locale}-${width}-hand.png`)});
      await page.click('#baseNext'); await page.locator('#step1').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(evidence,`r2-${locale}-${width}-baseline.png`)});
      results.push({locale,width,guess:'per-position correct and incorrect',baseline:'cumulative at all states',sourceBytes:Buffer.byteLength(canonical)});
    }
    await page.setViewportSize({width:1280,height:900});
    await page.evaluate(()=>document.body.style.zoom='2');
    await page.locator('#step0').scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:path.join(evidence,`r2-${locale}-zoom200.png`)});
    await page.evaluate(()=>document.body.style.zoom='');
    await page.locator('#posSelect').focus();
    await page.keyboard.press('Tab'); await page.keyboard.press('Enter');
    assert.equal(await page.locator('[data-guess="0"]').getAttribute('aria-pressed'),'true');
  }
  assert.deepEqual(errors,[]);
  // Offline source rendering plus unavailable storage must not prevent initialization.
  const offline=await context.newPage();
  const offlineErrors=[]; offline.on('pageerror',e=>offlineErrors.push(e.message));
  await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked storage')}});});
  await offline.goto('file://'+path.join(root,'index.html'));
  await offline.waitForFunction(()=>document.querySelector('#handReadout').textContent.length>0);
  for(const locale of ['zh','en']) {
    await offline.click(`[data-lang="${locale}"]`);
    assert.equal(await offline.locator('#pythonCode').textContent(),canonical);
  }
  assert.deepEqual(offlineErrors,[]);
  fs.writeFileSync(path.join(evidence,'review-browser-r2.json'),JSON.stringify({results,errors,offlineErrors,environmentNotices,sourceParity:'canonical = JSON mirror = display = clipboard = download = manual fallback clipboard (including final newline)',status:'author self-check; independent re-review pending'},null,2)+'\n');
  await browser.close();
  console.log('PASS R315-1 R315-2 R315-3; EN/ZH, 320/390/736/1440, 200% CSS zoom, prediction, controls, clipboard/download/fallback, offline/blocked storage');
})().catch(e=>{console.error(e);process.exit(1);});
