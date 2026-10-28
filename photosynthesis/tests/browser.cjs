'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.PHOTO_BASE_URL||'http://127.0.0.1:18843';
const out=process.env.PHOTO_EVIDENCE||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});const reports=[];
 try{
 for(const cfg of [
  {name:'android-360',width:360,height:800,dpr:3},
  {name:'android-393',width:393,height:851,dpr:3},
  {name:'android-412',width:412,height:915,dpr:2},
  {name:'desktop-en',width:1440,height:900,dpr:1,en:true},
  {name:'reduced',width:393,height:851,dpr:3,reduced:true},
  {name:'no-observer',width:393,height:851,dpr:3,noObserver:true},
  {name:'no-canvas',width:393,height:851,dpr:3,noCanvas:true},
  {name:'no-js',width:393,height:851,dpr:3,noJS:true},
  {name:'blocked-app',width:393,height:851,dpr:3,blocked:true}
 ]){
 const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height},deviceScaleFactor:cfg.dpr,isMobile:cfg.width<500,hasTouch:cfg.width<500,locale:cfg.en?'en-US':'zh-CN',reducedMotion:cfg.reduced?'reduce':'no-preference',javaScriptEnabled:!cfg.noJS});
 if(cfg.noObserver)await context.addInitScript(()=>{if(location.pathname.includes('/photosynthesis/'))delete window.IntersectionObserver;});
 if(cfg.noCanvas)await context.addInitScript(()=>{if(location.pathname.includes('/photosynthesis/'))HTMLCanvasElement.prototype.getContext=()=>null;});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(cfg.blocked)await page.route('**/photosynthesis/app.js*',r=>r.abort());
 await page.goto(base+'/photosynthesis/');await page.waitForTimeout(120);
 const active=!cfg.noJS&&!cfg.blocked;
 const metrics=()=>page.evaluate(()=>({height:document.documentElement.scrollHeight,width:document.documentElement.scrollWidth,viewport:innerWidth,canvas:[...document.querySelectorAll('canvas')].map(c=>({cssHeight:c.clientHeight,bufferHeight:c.height,width:c.clientWidth,bufferWidth:c.width})),headings:[...document.querySelectorAll('section h2')].map(el=>el.textContent)}));
 const initial=await metrics();assert(initial.headings.every(Boolean));assert.equal(initial.width,cfg.width);
 if(active){
  await page.evaluate(()=>{for(let i=0;i<30;i++){dispatchEvent(new Event('resize'));document.querySelector('#lightRange').dispatchEvent(new Event('input'));}});
  await page.waitForTimeout(150);
  const after=await metrics();assert.equal(after.height,initial.height);assert(after.canvas.every(c=>c.cssHeight===300));
  if(!cfg.noCanvas)assert(after.canvas.every(c=>c.bufferHeight===300*cfg.dpr));
  await page.locator('[data-bet=o2]').click();assert(await page.locator('[data-bet=o2]').evaluate(b=>b.classList.contains('correct')));
  const bridge=page.locator('#s1-bridge');assert(await bridge.isVisible());
  assert((await bridge.innerText()).includes(cfg.en?'step 0':'第 0 步'));
  await page.locator('[data-term=o2]').click();assert((await page.locator('#ledger').innerText()).includes(cfg.en?'by-product':'副产品'));
  await page.locator('[data-term=h2o]').click();assert((await page.locator('#ledger').innerText()).includes(cfg.en?'roots':'根'));
  if(!cfg.noCanvas){
   await page.locator('#s0-play').click();await page.waitForTimeout(850);
   assert(await page.evaluate(()=>PHOTOSYNTHESIS.state.s0.released>0));
   // A playing animation must not replace the focused betting button every frame.
   await page.locator('[data-bet=co2]').focus();await page.waitForTimeout(50);assert.equal(await page.evaluate(()=>document.activeElement.dataset.bet),'co2');
   await page.locator('#s0-reset').click();assert.equal(await page.evaluate(()=>PHOTOSYNTHESIS.state.s0.playing),false);assert.equal(await page.evaluate(()=>PHOTOSYNTHESIS.state.s0.released),0);
   await page.locator('#s0-play').click();
   await page.evaluate(()=>document.querySelector('#step2').scrollIntoView({behavior:'instant'}));await page.waitForTimeout(80);
   if(!cfg.noObserver)assert.equal(await page.evaluate(()=>PHOTOSYNTHESIS.state.s0.playing),false);
   await page.evaluate(()=>dispatchEvent(new Event('pagehide')));assert.equal(await page.evaluate(()=>PHOTOSYNTHESIS.state.s0.playing),false);
  }
  await page.locator('[data-term=h2o]').click();assert((await page.locator('#ledger').innerText()).includes(cfg.en?'roots':'根'));
  for(const [id,value] of [['lightRange','0'],['lightRange','100'],['co2Range','100']]){
   await page.locator('#'+id).fill(value);await page.locator('#'+id).dispatchEvent('input');
  }
  assert.equal(await page.locator('#lightValue').innerText(),'100');assert.equal(await page.locator('#co2Value').innerText(),'100');
  await page.locator('[data-q=q1][data-opt=b]').click();await page.locator('[data-q=q2][data-opt=a]').click();assert((await page.locator('#s4-score').innerText()).includes('2 / 2'));
  await page.locator('#quizReset').click();assert.equal(await page.locator('#s4-score').innerText(),'');
  if(cfg.noCanvas)assert.equal(await page.locator('.canvas-fallback:visible').count(),3);
  if(cfg.reduced)assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 }
 // Walk the full page, screenshot every mobile viewport, and require real text/canvas in each window.
 const height=(await metrics()).height,samples=[];
 for(let y=0;y<height;y+=Math.floor(cfg.height*.72)){
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(35);
  const sample=await page.evaluate(()=>({y:scrollY,content:[...document.querySelectorAll('main h2,main p,main button,main canvas')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>70&&r.top<innerHeight&&getComputedStyle(e).visibility!=='hidden'&&(e.textContent.trim()||e.tagName==='CANVAS');}).length}));
  assert(sample.content>0,'blank viewport '+cfg.name+' '+y);samples.push(sample);
  if(cfg.name==='android-393')await page.screenshot({path:path.join(out,'scroll-'+samples.length+'.png'),scale:'css'});
 }
 await page.screenshot({path:path.join(out,cfg.name+'-finale.png'),scale:'css'});
 if(active){
  await page.locator('.nav-step[href="#step2"]').click();await page.waitForTimeout(650);assert(page.url().endsWith('#step2'));
  await page.reload();await page.waitForTimeout(150);assert(await page.locator('#step2 h2').isVisible());
  assert((await page.locator('#step2').boundingBox()).y<cfg.height);
  // Follow an actual related lesson and return, retaining usable anchors and stable dimensions.
  await page.locator('a[href="../mass-conservation/#step1"]').first().click();await page.goBack();await page.waitForTimeout(150);
  assert(page.url().includes('/photosynthesis/'));assert((await metrics()).canvas.every(c=>c.cssHeight===300));
  await page.locator('[data-lang=en]').click();assert((await page.locator('#step0 h2').innerText()).includes('sunlight'));
  await page.locator('[data-lang=zh]').click();assert((await page.locator('#step0 h2').innerText()).includes('阳光'));
  if(cfg.name==='android-393'){
   // Android address-bar height changes and orientation changes must not feed back into canvas size.
   for(const size of [{width:393,height:720},{width:851,height:393},{width:393,height:851}]){await page.setViewportSize(size);await page.waitForTimeout(80);assert((await metrics()).canvas.every(c=>c.cssHeight===300));}
   const cdp=await context.newCDPSession(page);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   for(let i=0;i<4;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:720}]});for(let y=650;y>=180;y-=70)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   await page.waitForTimeout(200);assert(await page.evaluate(()=>scrollY>400));await page.screenshot({path:path.join(out,'touch-scroll.png'),scale:'css'});
  }
 }
 assert.deepEqual(errors,[]);reports.push({name:cfg.name,initial,scrollSamples:samples,pageErrors:errors});await context.close();console.log('PASS '+cfg.name);
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({browser:browser.version(),physicalAndroid:false,reports},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
