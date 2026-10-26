// Author self-check: semantic states, focus preservation and populated diagrams.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
async function align(page,selector){await page.locator(selector).scrollIntoViewIfNeeded();await page.locator(selector).evaluate(el=>window.scrollBy(0,el.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().bottom-8));await page.waitForTimeout(80);}
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence')),base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined}),context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage(),errors=[],evidence=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
 await page.goto(base+'/leetcode/928/');await page.waitForFunction(()=>document.getElementById('round').textContent.length>0);
 assert(await page.locator('#reveal').isDisabled());assert(await page.locator('#feedback').isHidden());
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  assert((await page.locator('[data-i18n=mapping]').textContent()).includes('next(iter(boundary))'));
  for(const p of ['3','4','6','7']){
   await page.selectOption('#preset',p);await page.click('#scoreEnd');
   if(p==='4'){
    const read=await page.locator('#scoreRead').textContent();assert(read.includes(lang==='en'?'Best index so far 0, saving 2 clean nodes, leaving 2 infected':'目前最佳编号 0，保护 2 个健康节点，最终感染 2 台'));
    const current=await page.locator('#scoreTable tbody tr').last().textContent();assert(current.includes(lang==='en'?'1 ← Current candidate':'1 ← 当前候选'));
    assert.deepEqual(await page.locator('#scoreTable tbody tr').last().locator('td').allTextContents(),[lang==='en'?'1 ← Current candidate':'1 ← 当前候选','1','3']);
    const snapshot=await page.locator('#scoreTable').innerHTML();await page.click('#scorePrev');await page.click('#scoreNext');assert.equal(await page.locator('#scoreTable').innerHTML(),snapshot);
   }
   for(const width of [320,390]){
    await page.setViewportSize({width,height:1000});if(await page.locator('#end').isEnabled())await page.click('#end');
    await align(page,'#graph');await page.locator('#graph').screenshot({path:path.join(out,`${lang}-${width}-p${p}-populated-graph.png`)});
    await align(page,'#step2 .stage');await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-p${p}-ledger.png`)});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   }
   evidence.push({lang,preset:p,read:await page.locator('#scoreRead').textContent(),groups:await page.locator('#groups').textContent(),ledger:await page.locator('#scoreTable').textContent()});
  }
  await page.selectOption('#preset','2');await page.selectOption('#remove','0');await page.click('#next');await page.click('#scoreNext');
  const snap=await page.evaluate(()=>({preset:document.getElementById('preset').value,remove:document.getElementById('remove').value,history:document.getElementById('history').children.length,graph:document.getElementById('graph').innerHTML,ledger:document.querySelectorAll('#scoreTable td.pending').length}));
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).focus();await page.keyboard.press('Enter');assert(await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).evaluate(el=>el===document.activeElement));
  assert.deepEqual(await page.evaluate(()=>({preset:document.getElementById('preset').value,remove:document.getElementById('remove').value,history:document.getElementById('history').children.length,graph:document.getElementById('graph').innerHTML,ledger:document.querySelectorAll('#scoreTable td.pending').length})),snap);
  await page.click(`[data-lang=${lang}]`);await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[name=prediction]:checked').inputValue(),'5');await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert((await page.locator('#feedback').textContent()).startsWith(lang==='en'?'Correct.':'正确。'));
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
  await page.locator('[name=prediction][value="3"]').check();assert(await page.locator('#feedback').isHidden());
  await page.setViewportSize({width:320,height:1000});await page.locator('#reset').focus();await page.keyboard.press('Tab');assert(await page.locator('#end').evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineWidth==='3px'&&getComputedStyle(el).outlineColor==='rgb(255, 180, 84)'));await page.screenshot({path:path.join(out,`${lang}-enabled-keyboard-focus.png`)});
  await page.locator('.graph-wrap').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(120);assert(await page.locator('.graph-wrap').evaluate(el=>el.scrollLeft>0));
  evidence.push({lang,midTraceLocalePreserved:true,keyboardRadioAndReveal:true,keyboardDiagramScroll:true});
 }
 // A desktop browser zoom equivalent: CSS zoom doubles the rendered metrics.
 // Existing main harness also checks 320/390 at this scale.
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await align(page,'#graph');await page.locator('#graph').screenshot({path:path.join(out,'focused-desktop-200-graph.png')});
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'focused-results.json'),JSON.stringify({status:'PASS',evidence,errors},null,2));await browser.close();console.log('PASS focused semantic, bilingual, keyboard and populated-layout checks');
})().catch(e=>{console.error(e);process.exit(1)});
