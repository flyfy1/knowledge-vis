'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:18769';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const errors=[],results=[];try{
 for(const lang of ['en','zh'])for(const width of [320,390,768,1440]){
  const ctx=await b.newContext({viewport:{width,height:1000},locale:lang==='zh'?'zh-CN':'en-US'}),p=await ctx.newPage();p.on('pageerror',e=>errors.push(String(e)));
  await p.goto(base+'/power-converters/#step4');await p.waitForTimeout(150);
  assert.equal(await p.locator('.step').count(),7);
  let geometry=await p.evaluate(()=>({w:innerWidth,doc:document.documentElement.scrollWidth,y:document.querySelector('#step4').getBoundingClientRect().top}));assert.ok(geometry.doc<=width);assert.ok(geometry.y>=65&&geometry.y<130,JSON.stringify(geometry));
  await p.locator('#buck-next').click();await p.locator('#buck-next').click();assert.match(await p.locator('#buck-status').innerText(),/2\/8.*25.00.*OFF/);assert.match(await p.locator('#buck-read').innerText(),/6.00 V/);
  await p.locator('#buck-d').fill('75');assert.match(await p.locator('#buck-status').innerText(),/0\/8/);assert.match(await p.locator('#buck-read').innerText(),/9.00 V/);
  await p.locator('#inductor-plus').click();await p.locator('#inductor-plus').click();await p.locator('#inductor-zero').click();assert.match(await p.locator('#inductor-read').innerText(),/0.20 A/);
  await p.locator('#inductor-reset').click();assert.match(await p.locator('#inductor-read').innerText(),/0.00 A/);
  await p.locator('[value=more]').check();await p.locator('#reveal').click();await p.locator('#eta').fill('80');assert.match(await p.locator('#budget-read').innerText(),/3.00 A/);assert.match(await p.locator('#budget-read').innerText(),/15.00 W/);
  await p.locator('[data-lang="'+(lang==='zh'?'en':'zh')+'"]').click();assert.match(await p.locator('#budget-read').innerText(),/3.00 A/);assert.equal(await p.locator('#eta').inputValue(),'80');
  await p.locator('#quiz-reset').click();assert.equal(await p.locator('#budget').isVisible(),false);assert.equal(await p.locator('#reveal').isDisabled(),true);
  const minText=await p.locator('.chart-text').evaluateAll(es=>Math.min(...es.map(e=>parseFloat(getComputedStyle(e).fontSize)*e.getScreenCTM().a)));assert.ok(minText>=13.9,'chart text '+minText);
  const controls=await p.locator('button,input[type=range],.nav-step').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert.ok(controls.every(e=>e.h>=48));
  results.push({lang,width,minChartText:minText,geometry});await ctx.close();
 }
 // Actual map → new lesson → return navigation, including generated section anchors.
 const p=await b.newPage();await p.goto(base+'/atlas/?node=boost&view=list');await Promise.all([p.waitForURL('**/power-converters/#step5'),p.locator('.primary-link').click()]);assert.ok(p.url().endsWith('/power-converters/#step5'));assert.ok(await p.locator('#step5').isVisible());await Promise.all([p.waitForURL('**/atlas/**'),p.locator('#back').click()]);assert.ok(p.url().includes('/atlas/'));assert.ok(await p.locator('#detailTitle').isVisible());
 assert.deepEqual(errors,[]);console.log(JSON.stringify({base,states:results,errors,status:'pass'}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
