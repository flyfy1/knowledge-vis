// Author regression for review-3 required fixes and historical rendered contracts. Expected products are hand-derived,
// independently of COPY and the renderer: v=[1,2,1,2,1], v[3]=2.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const root = path.join(__dirname, '..');
const evidence = path.join(__dirname, 'evidence', 'review3');
const source = fs.readFileSync(path.join(root, 'solution.py'), 'utf8');
const formula = 'dp[left][right] = max over last ( dp[left][last] + dp[last][right] + v[left]·v[last]·v[right] )';
const observed = [];

async function checkQuestion(p, lang) {
  const question = await p.locator('legend').textContent();
  assert.ok(question.includes('nums=[2,1,2]'), question);
  assert.ok(question.includes('values=[1,2,1,2,1]'), question);
  assert.ok(question.includes('(0,4)'), question);
  assert.match(question, lang === 'en' ? /zero-based padded index 3/ : /补齐数组的从 0 开始的索引 3/);
  assert.ok(question.includes('nums[2]'), question);
  assert.match(question, lang === 'en' ? /product term/ : /乘积项/);
  assert.equal(await p.locator('.formula').textContent(), formula);
  // After bursting 5: [3,1]. The only continuations total 5+3+3=11 or 5+3+1=9.
  const hand = await p.locator('[data-i18n=hand]').textContent();
  assert.ok(hand.includes('3×1×1=3') && hand.includes('1×3×1=3') && hand.includes('11') && hand.includes('5+3+1=9'),hand);
  assert.ok(!hand.includes('23'),hand);
  assert.deepEqual(await p.locator('[data-i18n^="option"]').allTextContents(),
    ['2×2×1 = 4', '1×2×1 = 2', '1×1×1 = 1']);
  return question;
}

async function feedback(p, lang, option) {
  const text = await p.locator('#feedback').textContent();
  assert.ok(text.startsWith(option === 1 ? (lang === 'en' ? 'Correct.' : '正确。') : (lang === 'en' ? 'Not yet.' : '还不对。')), text);
  assert.ok(text.includes('values[3]=2'), text);
  assert.ok(text.includes('values[0]×values[3]×values[4]=1×2×1=2'), text);
  assert.ok(text.includes('values[2]=1'), text);
  assert.ok(text.includes('2×2×1=4'), text); // falsely retains a burst left-side balloon
  return text;
}

(async () => {
  fs.mkdirSync(evidence, {recursive:true});
  const b = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  try {
    for (const width of [320,390,682,736,1440]) {
      const context = await b.newContext({viewport:{width,height:900},deviceScaleFactor:width===682?2:1});
      const p = await context.newPage();
      const errors=[];
      p.on('pageerror', e=>errors.push(String(e)));
      p.on('response', r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`)});
      await p.goto('http://127.0.0.1:18770/leetcode/312/');
      await p.locator('#progress').waitFor();
      for (const lang of ['en','zh']) {
        await p.locator(`[data-lang="${lang}"]`).click();
        const proof = await p.locator('[data-i18n=proof]').textContent();
        assert.match(proof, lang==='en' ? /at most/ : /不超过/);
        assert.match(proof, lang==='en' ? /attain/ : /达到/);
        assert.match(proof, lang==='en' ? /need not be optimal/ : /不一定最优/);
        const example = await p.locator('[data-i18n=proofExample]').textContent();
        for(const term of ['values=[1,3,1,5,1]', '3+5=8','dp[0][3]=30','8+5=13','30+5=35']) assert(example.includes(term),example);
        await p.locator('#preset').selectOption('3');
        const advertised = await p.locator('#preset option:checked').textContent();
        assert.equal(advertised,'[0,4,2] · 12');
        assert.match(await p.locator('#progress').textContent(),/0\/6/);
        assert.equal(await p.locator('#prev').isDisabled(),true);
        for(let i=0;i<6;i++) await p.locator('#next').click();
        assert.match(await p.locator('#progress').textContent(),/dp\[0\]\[4\] = 12/);
        assert.equal(await p.locator('.hot').textContent(),'12');
        assert.match(await p.locator('#candidates').textContent(),/k=1: 8 · k=2: 12 · k=3: 10/);
        const terminal = await p.locator('#progress').textContent();
        await p.locator('#prev').click(); await p.locator('#next').click();
        assert.equal(await p.locator('#progress').textContent(),terminal);
        await p.locator('#step2 .stage').screenshot({path:path.join(evidence,`${lang}-${width}-zero.png`)});
        await p.locator('[data-i18n=proof]').scrollIntoViewIfNeeded();
        await p.screenshot({path:path.join(evidence,`${lang}-${width}-proof.png`)});
        observed.push({finding:'R312-PRESET-001',width,lang,input:[0,4,2],advertised,terminal,expected:12});
        observed.push({finding:'R312-PROOF-001',width,lang,proof,example,expected:'feasible sides <= optima, attainable candidate; replace 8 with 30 while final gain stays 5'});
        const question = await checkQuestion(p, lang);
        for (const option of [0,1,2]) {
          await p.locator(`input[value="${option}"]`).check();
          assert.equal(await p.locator('#feedback').isVisible(), false);
          await p.locator('#reveal').click();
          const text = await feedback(p,lang,option);
          const other = lang === 'en' ? 'zh' : 'en';
          await p.locator(`[data-lang="${other}"]`).click();
          await checkQuestion(p,other);
          assert.equal(await p.locator(`input[value="${option}"]`).isChecked(),true);
          await feedback(p,other,option);
          await p.locator(`[data-lang="${lang}"]`).click();
          observed.push({finding:'R312-INDEX-001',width,lang,option,question,feedback:text});
        }
        // A trace preset is independent of this fixed fresh exercise.
        await p.locator('#preset').selectOption('0');
        if(await p.locator('#reset').isEnabled()) await p.locator('#reset').click();
        assert.match(await p.locator('#progress').textContent(), /0\/10/);
        for(let i=0;i<5;i++) await p.locator('#next').click();
        // Hand calculation: (0,3), k=1 => 0+15+15=30; k=2 => 3+0+5=8.
        assert.match(await p.locator('#current').textContent(), /\(0,3\).*1.*30/);
        assert.match(await p.locator('#candidates').textContent(), /k=1: 30 · k=2: 8/);
        assert.match(await p.locator('#progress').textContent(), /5\/10/);
        const table = await p.locator('#dpTable').textContent();
        await p.locator('#next').focus();
        await p.keyboard.press('Enter');
        await p.locator('#prev').click();
        assert.equal(await p.locator('#dpTable').textContent(),table);
        await p.locator('#prev').click(); await p.locator('#next').click();
        assert.equal(await p.locator('#dpTable').textContent(),table);
        for(let i=0;i<5;i++) await p.locator('#next').click();
        assert.match(await p.locator('#progress').textContent(), /167/);
        assert.equal(await p.locator('#next').isDisabled(),true);
        await feedback(p,lang,2);
        assert.equal(await p.locator('#pythonCode').textContent(),source);
        assert.equal(await p.evaluate(()=>PYTHON_SOURCE),source);
        assert.equal(await p.locator('#copyText').inputValue(),source);
        // Transfer must remain readable as the question grows, including at 200% text size.
        await p.locator('#step3').scrollIntoViewIfNeeded();
        assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await p.screenshot({path:path.join(evidence,`${lang}-${width}.png`)});
        if(width===320) {
          await p.evaluate(()=>document.documentElement.style.fontSize='200%');
          assert.equal(await p.locator('#step3').evaluate(el=>[...el.querySelectorAll('legend,label,#feedback')].every(node=>{const r=node.getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && node.scrollWidth<=node.clientWidth})),true);
          await p.locator('#step3').screenshot({path:path.join(evidence,`${lang}-${width}-text200.png`)});
          await p.evaluate(()=>document.documentElement.style.fontSize='');
        }
      }
      // Actual browser clipboard plus a controlled rejection for manual fallback.
      await context.grantPermissions(['clipboard-read','clipboard-write']);
      await p.locator('#copy').click();
      assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
      await p.evaluate(()=>window.realClipboard=navigator.clipboard);
      await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedSource=text}}}));
      await p.locator('#copy').click();
      assert.equal(await p.evaluate(()=>window.copiedSource),source);
      await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));
      await p.locator('#copy').click();
      assert.equal(await p.locator('#manualCopy').isVisible(),true);
      assert.equal(await p.locator('#copyText').evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd)),source);
      await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.realClipboard}));
      await p.locator('#copyText').press('Control+c');
      assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
      const [download]=await Promise.all([p.waitForEvent('download'),p.locator('[download]').click()]);
      assert.deepEqual(fs.readFileSync(await download.path()),Buffer.from(source));
      assert.deepEqual(errors,[]);
      await context.close();
    }
    // Offline mirror still renders and copies when the canonical download is unavailable.
    const p = await b.newPage();
    await p.route('**/solution.py',route=>route.abort());
    await p.goto('http://127.0.0.1:18770/leetcode/312/');
    assert.equal(await p.locator('#pythonCode').textContent(),source);
    await p.close();
    fs.writeFileSync(path.join(evidence,'observed.json'),JSON.stringify({kind:'author self-check',observed},null,2)+'\n');
    console.log('PASS review-3: both locales, 320/390/682@2x/736/1440; preset 12, proof, historical formula/frame/count/quiz paths, keyboard, exact clipboard/fallback/download/offline parity.');
  } finally {await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
