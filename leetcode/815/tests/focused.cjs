'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),base=process.env.PREVIEW_URL||'http://127.0.0.1:18770';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),page=await browser.newPage({viewport:{width:390,height:1000},reducedMotion:'reduce'});const records=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/leetcode/815/');await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 for(const l of ['en','zh']){
  await page.locator(`[data-lang=${l}]`).click();await page.locator('#manualReset').click();
  const disabled=await page.locator('#boardB').evaluate(e=>({disabled:e.disabled,fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));assert(disabled.disabled);assert.equal(disabled.bg,'rgb(28, 35, 48)');
  await page.locator('#boardA').click();await page.locator('#boardB').click();await page.locator('#manualRead').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${l}-manual-complete.png`)});
  await page.locator('#preset').selectOption('0');await page.locator('#traceLast').click();await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
  const contrast=await page.evaluate(()=>{
   const lum=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
   for(const [value,want] of [['rgb(0,0,0)',0],['rgb(255,255,255)',1],['rgb(255,0,0)',.2126],['rgb(0,255,0)',.7152],['rgb(0,0,255)',.0722]])if(Math.abs(lum(value)-want)>1e-10)throw Error('luminance calibration');if(Math.abs(ratio('rgb(0,0,0)','rgb(255,255,255)')-21)>1e-10||ratio('rgb(116,116,116)','rgb(0,0,0)')>=4.5)throw Error('contrast threshold calibration');
   return ['#routeRows .used','#stopRows .front','#stopRows .goal','#predictionFeedback.correct','#traceNext:disabled'].map(selector=>{const e=document.querySelector(selector),s=getComputedStyle(e);let n=e,bg;while(n){const b=getComputedStyle(n).backgroundColor;if(!['transparent','rgba(0, 0, 0, 0)'].includes(b)){bg=b;break;}n=n.parentElement;}return {selector,fg:s.color,bg,ratio:ratio(s.color,bg)};});
  });for(const c of contrast)assert(c.ratio>=4.5,JSON.stringify(c));
  await page.locator('#stopRows').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${l}-found-stops.png`)});await page.locator('#predictionFeedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${l}-prediction-revealed.png`)});
  await page.locator('[name=prediction][value="1"]').check();assert((await page.locator('#predictionFeedback').textContent()).includes(l==='en'?'Answer hidden':'答案隐藏'));await page.locator('#reveal').click();assert(!(await page.locator('#predictionFeedback').getAttribute('class')).includes('correct'));
  await page.setViewportSize({width:320,height:1000});for(const round of ['zh','en','zh']){await page.locator(`[data-lang=${round}]`).click();assert.equal(await page.locator('h1').textContent(),round==='en'?'#815 · Bus Routes':'#815 · 公交路线');assert(await page.locator('[name=prediction][value="1"]').isChecked());assert((await page.locator('#frameRead').textContent()).includes('2/2'));}
  records.push({locale:l,disabledPrimary:disabled,contrast,predictionWrongAfterChange:true,headingRoundtripAt320:true});await page.setViewportSize({width:390,height:1000});
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'focused-results.json'),JSON.stringify({kind:'author focused self-check',result:'pass',records,errors},null,2)+'\n');console.log('Focused state contrast, disabled-primary styling and narrow heading roundtrip: pass');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
