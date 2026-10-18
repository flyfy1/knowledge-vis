'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const folder=path.resolve(__dirname,'..'), evidence=path.join(folder,'evidence/fix-r1');
const base=process.env.LESSON_PREVIEW || 'http://127.0.0.1:18770';
const source=fs.readFileSync(path.join(folder,'solution.py'),'utf8');
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const results=[], errors=[], externalPreviewIssues=[];
  for(const lang of ['en','zh']) {
    const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
    await context.addInitScript(l=>localStorage.setItem('knowledge-lang',l),lang);
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(String(e)));
    page.on('console',m=>{if(m.type()==='error'){const item={message:m.text(),url:m.location().url};if(item.url===`${base}/favicon.ico`)externalPreviewIssues.push(item);else errors.push(item);}});
    page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
    await page.goto(`${base}/leetcode/42/`); await page.waitForFunction(()=>window.lessonSnapshot?.().frames>1);
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
    for(const file of ['index.html','copy.js','solution.py','python-code.js','app.js']) {
      const res=await context.request.get(`${base}/leetcode/42/${file}`);assert.equal(res.status(),200);
      assert.deepEqual(await res.body(),fs.readFileSync(path.join(folder,file)));
    }
    const hand=await page.locator('[data-i18n="hand"]').innerText();
    assert.ok(hand.includes('min(3,4) = 3')&&hand.includes('3 − 2 = 1'));
    assert.ok((await page.locator('[data-i18n="handDepths"]').innerText()).includes('0 + 3 + 1 + 3 + 0 = 7'));
    assert.ok(await page.evaluate(()=>document.querySelector('[data-i18n="handWrong"]').compareDocumentPosition(document.querySelector('[data-i18n="baselineTitle"]'))&Node.DOCUMENT_POSITION_FOLLOWING));
    for(const width of [320,390,736,1440]) {
      await page.setViewportSize({width,height:1000});
      await page.locator('[data-i18n="handTitle"]').scrollIntoViewIfNeeded();
      const geometry=await page.locator('#step0 [data-i18n="hand"], #step0 [data-i18n="handDepths"], #step0 [data-i18n="handWrong"]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,client:n.clientWidth,scroll:n.scrollWidth,text:n.textContent};}));
      for(const r of geometry){assert.ok(r.left>=0&&r.right<=width+1);assert.ok(r.scroll<=r.client+1);}
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.locator('#step0 .step-inner').screenshot({path:path.join(evidence,`${lang}-${width}-hand.png`)});
      results.push({lang,width,handGeometry:geometry.map(({text,...r})=>r)});
    }
    await page.setViewportSize({width:1440,height:1000});
    // All presets, endpoint, replay, reset, and every quiz option.
    for(const [preset,expected] of [[0,7],[1,6],[2,0],[3,0]]) {
      await page.selectOption('#preset',String(preset));assert.equal((await page.evaluate(()=>lessonSnapshot())).index,0);
      assert.ok(await page.locator('#prev').isDisabled());
      await page.click('#next');const first=await page.evaluate(()=>lessonSnapshot());
      await page.click('#prev');await page.click('#next');assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),first);
      await page.locator('#position').evaluate(n=>{n.value=n.max;n.dispatchEvent(new Event('input',{bubbles:true}));});
      const last=await page.evaluate(()=>lessonSnapshot());assert.equal(last.frame.result,expected);
      assert.ok(await page.locator('#next').isDisabled());assert.ok(await page.locator('#result').isVisible());
      await page.click('#reset');assert.equal((await page.evaluate(()=>lessonSnapshot())).index,0);
    }
    await page.selectOption('#preset','0');
    await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal((await page.evaluate(()=>lessonSnapshot())).index,1);
    await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>lessonSnapshot())).index,2);
    await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal((await page.evaluate(()=>lessonSnapshot())).index,1);
    await page.click('#next');
    assert.equal(await page.locator('#diagram .water-block').count(),3);
    const snap=await page.evaluate(()=>lessonSnapshot());assert.equal(snap.frame.state.water,3);assert.equal(snap.frame.state.left,2);
    for(let choice=0;choice<3;choice++){
      await page.check(`[name="prediction"][value="${choice}"]`);assert.equal((await page.evaluate(()=>lessonSnapshot())).revealed,false);
      await page.click('#reveal');assert.ok((await page.locator('#feedback').innerText()).length>10);
      const state=await page.evaluate(()=>lessonSnapshot());
      await page.click(`[data-lang="${lang==='en'?'zh':'en'}"]`);assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),state);
      await page.click(`[data-lang="${lang}"]`);assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),state);
    }
    await page.click('#reset');await page.click('#next');
    assert.equal(await page.locator('#diagram .water-column.hot .water-block').count(),0);
    assert.equal(await page.locator('#diagram .water-column.hot').evaluate(n=>getComputedStyle(n).backgroundColor),'rgba(0, 0, 0, 0)');
    await page.selectOption('#preset','1');
    await page.locator('#position').evaluate(n=>{n.value='8';n.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.locator('#beforeDetails').evaluate(n=>n.open=true);
    for(const width of [320,390,736,1440]) {
      await page.setViewportSize({width,height:1000});await page.locator('#diagram').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('#diagram .water-column').count(),12);
      const geometry=await page.locator('#diagram .water-column small').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {x:r.x,width:r.width,right:r.right,client:n.clientWidth,scroll:n.scrollWidth};}));
      geometry.forEach(r=>assert.ok(r.x>=0&&r.right<=width+1&&r.client+1>=r.scroll));
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      if(width===320||width===390){await page.locator('#diagram').screenshot({path:path.join(evidence,`${lang}-${width}-trace.png`)});await page.locator('#state').screenshot({path:path.join(evidence,`${lang}-${width}-state.png`)});}
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(()=>document.body.style.zoom='2');
    await page.locator('#step0 .step-inner').screenshot({path:path.join(evidence,`${lang}-zoom200-hand.png`)});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.evaluate(()=>document.body.style.zoom='');
    // Exact canonical displayed, copied, downloaded, and fallback bytes.
    await page.locator('#sourceDetails').evaluate(n=>n.open=true);
    assert.equal(await page.locator('#pythonCode').textContent(),source);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>window.copiedSource=s}}));
    await page.click('#copy');assert.equal(await page.evaluate(()=>window.copiedSource),source);
    const [download]=await Promise.all([page.waitForEvent('download'),page.click('[download]')]);
    assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));
    await page.click('#copy');assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
    for(const href of await page.locator('a[href]').evaluateAll(ns=>[...new Set(ns.map(n=>n.getAttribute('href')))].filter(x=>!x.startsWith('https:')))){
      const url=new URL(href,page.url());const response=await context.request.get(url.href);assert.equal(response.status(),200,href);
      if(url.hash){const html=await response.text();assert.ok(html.includes(`id="${url.hash.slice(1)}"`),href);}
    }
    await page.click('.step-nav a[href="#step2"]');
    await page.waitForTimeout(150);
    const target=await page.locator('#step2').boundingBox();assert.ok(target.y>=0&&target.y<200);
    results.push({lang,presets:[7,6,0,0],replay:true,quizOptions:3,localePreservesState:true,keyboard:true,copyDownloadFallback:'exact',links:'passed'});
    await context.close();
  }
  // Offline source has no request dependency; storage failures preserve in-memory locale.
  const context=await browser.newContext();
  await context.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('blocked')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('blocked')}});});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('file://'+path.join(folder,'index.html'));await page.waitForFunction(()=>window.lessonSnapshot?.().frames>1);
  for(const lang of ['en','zh']){await page.click(`[data-lang="${lang}"]`);assert.equal(await page.locator('#pythonCode').textContent(),source);await page.click('#next');}
  results.push({offline:true,blockedStorage:true});await context.close();
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(evidence,'browser-results.json'),JSON.stringify({results,errors,externalPreviewIssues},null,2)+'\n');
  await browser.close();console.log(JSON.stringify({locales:2,widths:[320,390,736,1440],errors,externalPreviewIssues,checks:'passed'}));
})().catch(e=>{console.error(e);process.exit(1)});
