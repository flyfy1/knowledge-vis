'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const p=await b.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:18770/leetcode/335/');const report=[];
for(const lang of ['en','zh']){
 await p.locator(`[data-lang=${lang}]`).click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`header-${lang}.png`)});
 await p.locator('.step-nav a[href="#step0"]').click();await p.screenshot({path:path.join(out,`hand-${lang}.png`)});
 for(const [value,name] of [[0,'A'],[2,'B'],[3,'C'],[4,'short'],[1,'outward']]){
  await p.selectOption('#preset',String(value));await p.locator('#traceLast').click();await p.locator('#plot').screenshot({path:path.join(out,`plot-${name}-${lang}.png`)});
  await p.locator('#coordinateRegion').screenshot({path:path.join(out,`coordinates-${name}-${lang}.png`)});
  const labels=await p.locator('#plot text').evaluateAll(els=>els.map(e=>({text:e.textContent,rect:e.getBoundingClientRect().toJSON(),font:getComputedStyle(e).fontSize})));
  assert(labels.every(e=>parseFloat(e.font)>=14));report.push({lang,preset:name,labelFont:'14px',labels:labels.map(e=>e.text)});
 }
 await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.locator('#step3 .stage').screenshot({path:path.join(out,`prediction-${lang}.png`)});
 await p.locator('.step-nav a[href="#step1"]').click();await p.screenshot({path:path.join(out,`derivation-${lang}.png`)});
}
await p.selectOption('#preset','0');await p.locator('#traceNext').focus();await p.keyboard.press('Tab');await p.keyboard.press('Shift+Tab');await p.screenshot({path:path.join(out,'keyboard-focus.png')});
await p.locator('#traceLast').click();await p.emulateMedia({forcedColors:'active'});await p.locator('#plot').screenshot({path:path.join(out,'forced-plot.png')});
fs.writeFileSync(path.join(out,'visual-results.json'),JSON.stringify({kind:'author supplemental browser check',checks:report},null,2));await b.close();})().catch(e=>{console.error(e);process.exit(1)});
