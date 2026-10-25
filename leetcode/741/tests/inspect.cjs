'use strict';
// Supplemental rendered-meaning captures; optional OUTPUT_DIR avoids modifying the candidate.
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const page=await browser.newPage({viewport:{width:390,height:950}});const evidence=[];
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:18770/leetcode/741/');await page.waitForFunction(()=>document.querySelector('#progress').textContent);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);await page.setViewportSize({width:320,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-header.png`)});
  await page.selectOption('#handRoute','split');await page.locator('#handBoard').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-hand.png`)});
  await page.selectOption('#preset','0');await page.click('#end');await page.locator('[data-state="1,1"]').click();const merge=await page.locator('#event').textContent();assert(merge.includes('3+1=4'));const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('p1')&&formula.includes('p2')&&formula.includes('r1≠r2'));
  await page.selectOption('#preset','2');await page.click('#end');await page.locator('[data-state="2,2"]').click();const unreachable=await page.locator('#event').textContent();assert(unreachable.includes(lang==='en'?'all four predecessors are unreachable':'四个前驱都不可达'));assert((await page.locator('#output').textContent()).includes('0'));await page.locator('#predBody').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-unreachable.png`)});
  await page.selectOption('#preset','1');await page.locator('[data-state="0,1"]').click();const invalid=await page.locator('#event').textContent();assert(invalid.includes(lang==='en'?'outside the grid or a thorn':'越界或有荆棘'));
  await page.selectOption('#preset','4');assert(await page.locator('#next').isDisabled());await page.locator('#step2 .controls').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-single.png`)});
  await page.check('input[name=prediction][value="1"]');await page.check('input[name=prediction][value="0"]');assert(await page.locator('#feedback').isHidden());await page.click('#reveal');await page.locator('#feedback').scrollIntoViewIfNeeded();const feedback=await page.locator('#feedback').textContent();assert(feedback.includes(lang==='en'?'Choosing 3 omits the new cherry':'选 3 漏掉了当前新樱桃'));await page.screenshot({path:path.join(out,`${lang}-quiz.png`)});
  await page.locator('#sourceDetails summary').click();await page.locator('#sourceDetails').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-source.png`)});await page.locator('#sourceDetails summary').click();
  evidence.push({lang,case:'2x2 all ones, merged final endpoint',merge,formula,unreachable,invalid,feedback});
 }
 fs.writeFileSync(path.join(out,'rendered-meaning.json'),JSON.stringify({kind:'author self-check',evidence},null,2));await browser.close();console.log('Rendered semantic branches and supplemental captures passed.');
})().catch(e=>{console.error(e);process.exit(1)});
