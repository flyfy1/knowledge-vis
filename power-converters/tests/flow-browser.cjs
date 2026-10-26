'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.BASE_URL||'http://127.0.0.1:18791';
const out=process.env.REVIEW_OUTPUT_DIR||'/tmp/power-flow-evidence';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],results=[];
try{for(const width of [320,390,1440])for(const lang of ['en','zh']){
 const context=await browser.newContext({viewport:{width,height:1000},locale:lang==='zh'?'zh-CN':'en-US',reducedMotion:'no-preference'}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/power-converters/#step4');
 for(const kind of ['buck','boost']){
  const diagram=p.locator('#'+kind+'-diagram');
  await p.locator('#'+kind+'-seek').fill('20');await diagram.scrollIntoViewIfNeeded();
  await p.locator('#'+kind+'-d').fill('20');assert.equal(await diagram.getAttribute('data-on'),'false');
  await p.locator('#'+kind+'-d').fill('75');assert.equal(await diagram.getAttribute('data-on'),'true');assert.equal(await p.locator('#'+kind+'-seek').inputValue(),'20');
  for(const vin of [5,12])for(const duty of [20,75]){
   await p.locator('#'+kind+'-vin').fill(String(vin));await p.locator('#'+kind+'-d').fill(String(duty));
   for(const t of [0,duty/4,duty/2,(50+duty/2)/2,100]){
    await p.locator('#'+kind+'-seek').fill(String(t));
    const actual=await diagram.evaluate(e=>({il:+e.dataset.il,ic:+e.dataset.ic,energy:+e.dataset.energy,on:e.dataset.on==='true',paths:[...e.querySelectorAll('.flow-rail')].map(n=>({branch:n.dataset.branch,i:+n.dataset.current,d:n.getAttribute('d')}))}));
    const phase=(t/50)%1,D=duty/100,vo=kind==='buck'?vin*D:vin/(1-D),avg=kind==='buck'?1:1/(1-D),up=kind==='buck'?vin-vo:vin,down=kind==='buck'?-vo:vin-vo,ripple=up*D*50e-6/.001,on=phase<D;
    const il=avg-ripple/2+(on?up*phase*50e-6/.001:ripple+down*(phase-D)*50e-6/.001),ic=kind==='buck'?il-1:on?-1:il-1;
    assert.ok(Math.abs(actual.il-il)<1e-8);assert.ok(Math.abs(actual.ic-ic)<1e-8);assert.ok(Math.abs(actual.energy-.0005*il*il)<1e-10);assert.equal(actual.on,on);
    const path=name=>actual.paths.find(v=>v.branch===name).i;
    assert.equal(path('load'),1);assert.ok(Math.abs(path('delivery')-1-ic)<1e-8);assert.ok(Math.abs(path('capacitor-top')-Math.abs(ic))<1e-8);
    assert.ok(Math.abs(path(kind==='buck'?'diode':'switch')-(kind==='buck'?(on?0:il):(on?il:0)))<1e-8);
    if(Math.abs(ic)<1e-8)assert.ok(path('capacitor-top')<1e-8);
    results.push({kind,width,lang,vin,duty,t});
   }
  }
  await p.locator('#'+kind+'-d').fill('50');await p.locator('#'+kind+'-seek').fill('0');
  const geometry=await diagram.evaluate(e=>({scroll:e.scrollWidth,width:e.clientWidth,doc:document.documentElement.scrollWidth,svg:e.querySelector('svg').getBoundingClientRect().width,minText:Math.min(...[...e.querySelectorAll('text')].map(t=>parseFloat(getComputedStyle(t).fontSize)*t.getScreenCTM().a))}));
  assert.ok(geometry.scroll<=geometry.width+1);assert.ok(geometry.doc<=width);assert.ok(geometry.minText>=13.9,JSON.stringify(geometry));
  await diagram.scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${lang}-${width}-${kind}-on.png`});
  await p.locator('#'+kind+'-play').click();await diagram.scrollIntoViewIfNeeded();await p.waitForTimeout(550);
  const a=await p.locator('#'+kind+'-seek').inputValue();assert.ok(+a>0,'playback advances '+a);
  const svg=await diagram.evaluate(e=>{window.flowIdentity=e.querySelector('svg');return true});
  await p.waitForTimeout(300);assert.equal(await diagram.evaluate(e=>e.querySelector('svg')===window.flowIdentity),svg);
  assert.ok(await diagram.locator('.flow-packet').evaluateAll(es=>es.some(e=>e.style.opacity==='1')));
  await p.locator('#'+kind+'-play').click();const frozen=await p.locator('#'+kind+'-seek').inputValue();await p.waitForTimeout(160);assert.equal(await p.locator('#'+kind+'-seek').inputValue(),frozen);
  await p.locator('#'+kind+'-seek').fill('30');await diagram.scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${lang}-${width}-${kind}-off.png`});
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('#'+kind+'-play').click();await diagram.scrollIntoViewIfNeeded();await p.waitForTimeout(200);assert.equal(await diagram.locator('.flow-packets').evaluate(e=>getComputedStyle(e).display),'none');
  await p.locator('#'+kind+'-reset').click();assert.equal(await p.locator('#'+kind+'-seek').inputValue(),'0');assert.equal(await p.locator('#'+kind+'-play').getAttribute('aria-pressed'),'false');await p.emulateMedia({reducedMotion:'no-preference'});
 }
 await context.close();
}
assert.deepEqual(errors,[]);console.log(JSON.stringify({cases:results.length,errors,evidence:out,status:'pass'}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
