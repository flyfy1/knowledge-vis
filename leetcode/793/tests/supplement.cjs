const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),C=require('../core.js');
function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
function ratio(a,b){let x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(ratio([255,255,255],[0,0,0]),21);assert(Math.abs(ratio([116,116,116],[0,0,0])-4.4929480731)<1e-8);assert.equal(lum([0,255,0]),.7152);
const P=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const p=await b.newPage({viewport:{width:390,height:1100},reducedMotion:'reduce'});const r={kind:'author supplementary self-check',rewind:[],focus:[],inspection:[]};
try{await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/793/');assert.equal(await p.locator('#preset').inputValue(),'2');
for(const l of ['en','zh']){
 await p.locator(`[data-lang=${l}]`).click();assert.equal(await p.locator('[data-i18n=loLabel]').textContent(),l==='en'?'Current lower bound lo':'当前下界 lo');
 for(let index=0;index<C.presets.length;index++){
  const trace=C.trace(C.presets[index]);await p.locator('#preset').selectOption(''+index);await p.locator('#end').click();
  for(let at=trace.length-1;at>=0;at--){let f=trace[at];assert.equal(await p.locator('#loValue').textContent(),''+f.lo);assert.equal(await p.locator('#hiValue').textContent(),''+f.hi);assert.equal(await p.locator('#traceHistory li').count(),f.history.length);if(at>0)await p.locator('#prev').click();}
  assert(await p.locator('#prev').isDisabled());r.rewind.push({locale:l,k:C.presets[index],frames:trace.length});
 }
 await p.locator('#handX').focus();await p.keyboard.press('Home');await p.locator('#predictionReset').click();
 // Include native disabled appearance and ring geometry in evidence.
 r.disabled=await p.locator('button:disabled').evaluateAll(es=>es.map(e=>({id:e.id,color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor,opacity:getComputedStyle(e).opacity})));
 for(const c of r.disabled){assert.equal(c.opacity,'1');assert.equal(c.color,'rgb(154, 167, 184)');assert.equal(c.background,'rgb(22, 27, 34)');}
 const sizes=await p.locator('button,.btn,select,.prediction-options label').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({id:e.id,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
 for(const s of sizes){assert(s.width>=48&&s.height>=48,JSON.stringify(s));}
 await p.keyboard.press("Tab");await p.locator(`[data-lang=${l}]`).focus();const focus=await p.locator(`[data-lang=${l}]`).evaluate(e=>({outline:getComputedStyle(e).outlineWidth,offset:getComputedStyle(e).outlineOffset,parentOverflow:getComputedStyle(e.parentElement).overflow,visible:e.matches(':focus-visible')}));assert.equal(focus.outline,'3px');assert.equal(focus.parentOverflow,'visible');assert(focus.visible);const ring=await p.locator(`[data-lang=${l}]`).evaluate(e=>({color:getComputedStyle(e).outlineColor,background:getComputedStyle(document.body).backgroundColor}));const parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const ringRatio=ratio(parse(ring.color),parse(ring.background));assert(ringRatio>=3);r.focus.push({locale:l,...focus,...ring,contrast:ringRatio});r.disabledContrast=ratio([154,167,184],[22,27,34]);assert(r.disabledContrast>=4.5);
 await p.locator('#preset').selectOption('2');await p.locator('#next').click();await p.locator('#next').click();await p.locator('#operation').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,`${l}-final-mobile.png`)});
 await p.locator('#quiz').selectOption('29');await p.locator('[name=prediction][value="0"]').check();await p.locator('#reveal').click();await p.locator('#feedback').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,`${l}-final-prediction.png`)});
 await p.locator('#sourceDetails').evaluate(e=>e.open=true);await p.locator('#pythonCode').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,`${l}-final-source.png`)});
}
await p.emulateMedia({forcedColors:'active'});await p.locator('#copyPython').focus();const fc=await p.locator('#copyPython').evaluate(e=>({outline:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(fc.outline,'3px');r.forcedColors=fc;assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
await p.emulateMedia({forcedColors:'none'});await p.locator('#sourceDetails').evaluate(e=>e.open=true);const pre=p.locator('#sourceDetails pre');await pre.focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);assert(await pre.evaluate(e=>e.scrollLeft>0));r.sourceKeyboardHorizontalScroll=true;r.status='passed';fs.writeFileSync(path.join(OUT,'supplement.json'),JSON.stringify(r,null,2));console.log(JSON.stringify({status:r.status,rewinds:r.rewind.length,focus:r.focus,forcedColors:r.forcedColors}));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
