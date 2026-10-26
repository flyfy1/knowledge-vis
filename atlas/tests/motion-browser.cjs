'use strict';
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.ATLAS_BASE_URL||'http://127.0.0.1:18775';
const output=process.env.ATLAS_MOTION_EVIDENCE||'/tmp/atlas-motion-evidence';fs.mkdirSync(output,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,channel:'chrome'}),errors=[],requests=[],checks=[];
 try{
  const c=await b.newContext({viewport:{width:1280,height:1000},locale:'en-US'}),p=await c.newPage();
  p.on('pageerror',e=>errors.push(String(e)));p.on('request',r=>{if(!r.url().startsWith(base))requests.push(r.url());});
  const get=async key=>Number(await p.locator('#motion-lab').getAttribute('data-'+key));
  const input=async(id,value)=>p.locator('#motion-'+id).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
  const near=(a,b,eps=1e-6)=>assert.ok(Math.abs(a-b)<eps,`${a} ≈ ${b}`);
  await p.goto(base+'/atlas/');assert.equal(await p.locator('#motion-lab').isVisible(),false);
  for(const lang of ['en','zh']){
   await p.locator(`[data-lang=${lang}]`).click();await p.goto(base+'/atlas/?node=oscillation&view=list');
   assert.match(await p.locator('.source-note').innerText(),lang==='en'?/associated experiment/:/关联实验/);
   const oldSource=await p.locator('.primary-link').getAttribute('href');assert.ok(oldSource.includes('15-1-simple-harmonic-motion'));
   await p.locator('[data-open-motion=oscillation]').click();assert.ok(p.url().includes('trail=motion'));assert.ok(await p.locator('#motion-lab').isVisible());
   await p.locator('#motion-reset').click();
   for(const[phase,x,F]of [[0,.6,-2.4],[.25,0,0],[.5,-.6,2.4],[.75,0,0],[1,.6,-2.4]]){await input('phase',phase);near(await get('position'),x);near(await get('force'),F);}
   await input('phase',.5);const T=await get('period'),time=Number(await p.locator('#motion-time').innerText());
   await input('mass',2);near(await get('cycles'),.5);near((await get('period'))/T,Math.sqrt(2));near(Number(await p.locator('#motion-time').innerText())/time,Math.sqrt(2),.002);assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');
   await input('phase',0);await input('amplitude',.1);const small=await p.locator('#motion-spring').screenshot();near(await get('position'),.1);const unchangedPeriod=await get('period');
   await input('amplitude',1);const large=await p.locator('#motion-spring').screenshot();near(await get('position'),1);near(await get('period'),unchangedPeriod);assert.notDeepEqual(small,large,'Amplitude changes the drawing on a fixed scale');
   await p.locator('#motion-reset').click();await p.locator('#motion-play').click();await p.waitForTimeout(300);await p.locator('#motion-play').click();const stopped=await get('cycles');assert.ok(stopped>.04);await p.waitForTimeout(160);near(await get('cycles'),stopped);await p.locator('#motion-play').click();await p.waitForTimeout(160);await p.locator('#motion-play').click();assert.ok(await get('cycles')>stopped);
   await input('phase',.375);await input('mass',2);const snap=await get('cycles');
   await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();near(await get('cycles'),snap);assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');await p.locator(`[data-lang=${lang}]`).click();
   await p.locator('[data-motion-node=sine]').click();near(await get('cycles'),snap);assert.ok(p.url().includes('node=sine'));
   await p.locator('#motion-close').click();assert.equal(await p.locator('#motion-lab').isVisible(),false);await p.goBack();assert.ok(await p.locator('#motion-lab').isVisible());near(await get('cycles'),snap);
   await p.locator('[data-trail=power]').click();assert.equal(await p.locator('#motion-lab').isVisible(),false);await p.locator('[data-trail=motion]').click();near(await get('cycles'),snap);assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');
   await p.locator('#motion-play').click();await p.waitForTimeout(120);await p.locator('#motion-close').click();await p.goBack();assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');
   await input('phase',.625);await input('mass',2);await p.locator('[data-motion-text=circleLink]').click();assert.ok(p.url().endsWith('/trig/#step1'));await p.goBack();near(await get('cycles'),.625);assert.equal(await p.locator('#motion-mass').inputValue(),'2');assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');
   await input('mass',.25);await input('stiffness',16);await input('phase',0);await p.locator('#motion-play').click();await p.waitForFunction(()=>document.querySelector('#motion-lab').dataset.playing==='false',{},{timeout:5000});near(await get('cycles'),2);
   assert.match(await p.locator('#motion-play').innerText(),lang==='en'?/Replay/:/重播/);await p.locator('#motion-play').click();await p.waitForTimeout(100);await p.locator('#motion-play').click();assert.ok(await get('cycles')<.5);
   for(let i=0;i<3;i++){await p.locator('#motion-reset').click();near(await get('cycles'),0);assert.equal(await p.locator('#motion-mass').inputValue(),'1');assert.equal(await p.locator('#motion-stiffness').inputValue(),'4');assert.equal(await p.locator('#motion-amplitude').inputValue(),'0.6');assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');}
   await input('phase',.125);
   for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:1000});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${width} overflow`);
    const tiny=await p.locator('#motion-lab button,#motion-lab input').evaluateAll(es=>es.filter(e=>e.getClientRects().length).filter(e=>e.getBoundingClientRect().height<47.9).map(e=>e.id));assert.deepEqual(tiny,[]);
    assert.doesNotMatch(await p.locator('#motion-lab').innerText(),/undefined/);
    await p.locator('#motion-lab').scrollIntoViewIfNeeded();if(width===390||width===1280)await p.screenshot({path:path.join(output,`${lang}-${width}.png`),fullPage:true});
   }
   checks.push(`${lang}: existing-node entry, quarter phases/force signs, period ratios, visible amplitude, same-phase parameter comparison, pause/resume, locale/node/history/route retention, lesson Back, end/replay, 3 resets, widths320/390/768/1280`);
  }
  for(const dpr of [1,2,3]){const dc=await b.newContext({viewport:{width:390,height:1000},deviceScaleFactor:dpr});const q=await dc.newPage();await q.goto(base+'/atlas/?trail=motion&node=unit-circle');for(const width of [320,768,390,390]){await q.setViewportSize({width,height:1000});await q.waitForTimeout(60);assert.ok(await q.locator('#motion-circle').evaluate(c=>Math.abs(c.width-c.getBoundingClientRect().width*devicePixelRatio)<=1));}await dc.close();}
  await p.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await p.reload();assert.equal(await p.locator('#motion-lab').getAttribute('data-playing'),'false');await p.locator('#motion-play').focus();assert.equal(await p.locator('#motion-play').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await p.emulateMedia({forcedColors:'none'});
  await p.addStyleTag({content:'html{font-size:200%}'});await p.setViewportSize({width:320,height:1000});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const locked=await b.newContext({viewport:{width:390,height:900}}),q=await locked.newPage();await q.addInitScript(()=>{for(const k of ['localStorage','sessionStorage'])Object.defineProperty(window,k,{get(){throw new DOMException('Blocked','SecurityError');}});});await q.goto(base+'/atlas/?trail=motion&node=sine');await q.locator('[data-lang=zh]').click();await q.locator('#motion-phase').focus();await q.keyboard.press('ArrowRight');assert.ok(Number(await q.locator('#motion-lab').getAttribute('data-cycles'))>0);await q.locator('#motion-reset').click();await q.locator('#motion-play').focus();await q.keyboard.press('Enter');await q.waitForTimeout(100);await q.keyboard.press('Enter');assert.equal(await q.locator('#motion-lab').getAttribute('data-playing'),'false');await locked.close();
  checks.push('DPR1/2/3 repeat resize; reduced-motion paused; forced-colors focus; 200% text at320; denied local/session storage; keyboard seek/play');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const result={checks,errors,externalRuntimeRequests:requests,limits:['No physical-phone or screen-reader speech test','No real-hardware or learning-gain evidence']};fs.writeFileSync(path.join(output,'motion-browser.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
