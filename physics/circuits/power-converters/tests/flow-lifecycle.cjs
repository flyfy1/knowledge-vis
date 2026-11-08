'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:18791';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({viewport:{width:390,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 await p.goto(base+'/power-converters/#step4');
 // Shrinking positive capacitor current must never make dashes reverse.
 const offsets=await p.evaluate(()=>{
  const host=document.querySelector('#buck-diagram');const m=PowerModel.converter('buck',12,.5),values=[];
  for(let i=0;i<=10;i++){const q=m.sample((.5+i*.02)*m.T);PowerFlow.update(host,'buck',q,20+i*.08,true,'test');values.push(+host.querySelector('.flow-packet[data-branch="capacitor-top"]').style.strokeDashoffset);}
  const q=m.sample(.75*m.T);PowerFlow.update(host,'buck',q,21,true,'zero');values.push(+host.querySelector('.flow-packet[data-branch="capacitor-top"]').style.strokeDashoffset);return values;
 });for(let i=1;i<offsets.length;i++)assert.ok(offsets[i]<=offsets[i-1],JSON.stringify(offsets));assert.equal(offsets.at(-1),offsets.at(-2));
 await p.reload();await p.locator('#buck-seek').fill('99');await p.locator('#buck-play').click();await p.waitForTimeout(350);assert.equal(await p.locator('#buck-seek').inputValue(),'100');assert.equal(await p.locator('#buck-play').getAttribute('aria-pressed'),'false');assert(await p.locator('#buck-next').isDisabled());
 await p.locator('#buck-play').click();await p.waitForTimeout(200);assert.ok(+(await p.locator('#buck-seek').inputValue())<5);
 await p.locator('#step0').scrollIntoViewIfNeeded();await p.waitForTimeout(150);assert.equal(await p.locator('#buck-play').getAttribute('aria-pressed'),'false');
 await p.locator('#buck-seek').fill('30');await p.locator('[data-lang=zh]').click();assert.equal(await p.locator('#buck-seek').inputValue(),'30');assert.match(await p.locator('.page-provenance summary').innerText(),/Codex/);
 await p.locator('#buck-play').click();await p.waitForTimeout(150);await p.locator('#boost-play').click();assert.equal(await p.locator('#buck-play').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('#boost-play').getAttribute('aria-pressed'),'true');
 await p.locator('#boost-reset').click();await p.locator('#buck-seek').fill('30');await p.locator('#buck-seek').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#buck-seek').inputValue(),'30.25');
 await p.setViewportSize({width:640,height:1000});await p.evaluate(()=>document.body.style.zoom='200%');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('#buck-diagram').evaluate(e=>e.scrollWidth<=e.clientWidth));
 await p.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p.locator('#buck-play').click();await p.waitForTimeout(120);assert.equal(await p.locator('#buck-diagram .flow-packets').evaluate(e=>getComputedStyle(e).display),'none');
 await p.locator('#buck-reset').click();assert.equal(await p.locator('#buck-seek').inputValue(),'0');assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'pass',forwardOffsets:offsets,errors,checks:'completion/replay/offscreen/locale/one-player/keyboard/200%-zoom/reduced-motion/forced-colors'}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
