/* Optional authoring check: NODE_PATH=<Playwright packages> node leetcode/tests/test_browser.cjs */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.LESSON_BASE_URL || 'http://127.0.0.1:18767';
const screenshots=process.env.LESSON_SCREENSHOTS;
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'zh-CN',permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('response',response=>{if(response.status()>=400&&!response.url().includes('favicon'))errors.push(response.status()+' '+response.url());});
    await page.goto(base+'/');
    await page.locator('[data-cat="leetcode"]').click();
    assert.equal(await page.locator('#grid a.card').count(),1);
    await page.locator('#grid a.card').click();
    assert.ok(page.url().endsWith('/leetcode/'));
    await page.locator('.problem-card').click();
    assert.ok(page.url().endsWith('/leetcode/2916/'));
    await page.waitForFunction(()=>document.querySelectorAll('#subarrayGrid button').length===6&&document.getElementById('subarrayInfo').textContent.length>0);
    for(const button of await page.locator('#subarrayGrid button').all())await button.click();
    await page.locator('[data-guess="9"]').click();assert.match(await page.locator('#guessFeedback').innerText(),/15/);
    await page.locator('[data-guess="15"]').click();assert.match(await page.locator('#guessFeedback').innerText(),/对了/);
    await page.locator('#groupNext').click();await page.locator('#groupNext').click();
    assert.match(await page.locator('#groupInfo').innerText(),/15/);
    assert.equal(await page.locator('#groupLedger .ledger-item').count(),3);
    for(const [key,expected] of [['repeat',15],['equal',3],['long',70],['unique',50]]) {
      await page.locator('#rangeExample').selectOption(key);
      let clicks=0;
      while(!(await page.locator('#rangeNext').isDisabled())){await page.locator('#rangeNext').click();assert.ok(++clicks<20);}
      assert.equal(Number(await page.locator('#rangeAnswer').innerText()),expected,key);
      const last=await page.locator('#rangeStatus').innerText();
      await page.locator('#rangePrev').click();await page.locator('#rangeNext').click();assert.equal(await page.locator('#rangeStatus').innerText(),last);
      await page.locator('#verifyExample').selectOption(key);assert.match(await page.locator('#verifyResult').innerText(),new RegExp(String(expected)));
    }
    await page.locator('#increment').fill('3');assert.match(await page.locator('#formulaReadout').innerText(),/66/);
    await page.locator('#increment').fill('1');assert.match(await page.locator('#formulaReadout').innerText(),/22/);
    let operations=0;
    while(!(await page.locator('#treeNext').isDisabled())){await page.locator('#treeNext').click();assert.ok(++operations<20);}
    assert.equal(operations,9);assert.match(await page.locator('#treeStatus').innerText(),/32/);
    assert.deepEqual(await page.locator('#treeValues .array-value').allTextContents(),['3','3','3','2','1']);
    assert.equal(await page.locator('#treeLog li').count(),10);
    for(let i=0;i<9;i++)await page.locator('#treePrev').click();
    assert.equal(await page.locator('#treePrev').isDisabled(),true);
    await page.locator('#stepNav a[href="#step4"]').click();
    await page.waitForFunction(()=>document.querySelector('#stepNav a[aria-current="step"]')?.hash==='#step4');
    await page.locator('#copyPython').click();
    await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);
    assert.match(await page.locator('#copyStatus').innerText(),/已复制/);
    const displayed=await page.locator('#pythonCode').textContent();
    const response=await page.request.get(base+'/leetcode/2916/solution.py');assert.equal(response.status(),200);assert.equal(displayed,await response.text());
    assert.equal(displayed,fs.readFileSync(path.join(__dirname,'../2916/solution.py'),'utf8'));
    await page.evaluate(()=>{Object.defineProperty(navigator.clipboard,'writeText',{value:()=>Promise.reject(new Error('Simulated denied permission')),configurable:true});});
    await page.locator('#copyPython').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.includes('未允许'));
    for(const lang of ['en','zh']) {
      await page.locator('#langToggle [data-lang="'+lang+'"]').click();
      assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
      for(const width of [320,390,736,1440]) {
        await page.setViewportSize({width,height:1000});
        await page.waitForTimeout(80);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),lang+' width '+width);
        const geometry=await page.locator('.tree-svg text').evaluateAll(elements=>elements.map(el=>{
          const text=el.getBoundingClientRect(),parent=el.closest('g').querySelector('rect').getBoundingClientRect();
          return text.left>=parent.left-1&&text.right<=parent.right+1;
        }));
        assert.ok(geometry.every(Boolean),'Node labels fit at '+lang+' '+width);
        if(screenshots&&lang==='zh'&&(width===390||width===1440)) {
          await page.locator('#rangeCounts').scrollIntoViewIfNeeded();await page.waitForTimeout(150);await page.screenshot({path:path.join(screenshots,'lesson-range-'+width+'.png')});
          await page.locator('#treeDiagram').scrollIntoViewIfNeeded();await page.waitForTimeout(150);await page.screenshot({path:path.join(screenshots,'lesson-tree-'+width+'.png')});
        }
      }
    }
    // All internal lesson links and deep anchors must resolve.
    const links=await page.locator('a').evaluateAll(elements=>elements.map(a=>a.href));
    for(const href of new Set(links.filter(url=>url.startsWith(base)&&!url.endsWith('.py')))) {
      const url=new URL(href),res=await page.request.get(url.origin+url.pathname);assert.equal(res.status(),200,href);
      if(url.hash)assert.ok((await res.text()).includes('id="'+url.hash.slice(1)+'"'),href);
    }
    await page.locator('#langToggle [data-lang="en"]').click();await page.goto(base+'/leetcode/');assert.match(await page.locator('h1').innerText(),/Reason/);
    const blocked=await browser.newContext({locale:'zh-CN'});
    await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError');}}));
    const fallback=await blocked.newPage();fallback.on('pageerror',error=>errors.push(String(error)));
    await fallback.goto(base+'/leetcode/2916/');
    await fallback.waitForFunction(()=>document.querySelectorAll('#subarrayGrid button').length===6&&document.getElementById('subarrayInfo').textContent.length>0);
    await fallback.locator('#langToggle [data-lang="en"]').click();assert.match(await fallback.locator('h1').innerText(),/Subarrays/);
    assert.deepEqual(errors,[]);
    console.log('Homepage → collection → lesson; all controls, both languages, preset and reverse navigation, clipboard success/fallback, blocked storage, source download, local links, and 320/390/736/1440 layouts passed.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
