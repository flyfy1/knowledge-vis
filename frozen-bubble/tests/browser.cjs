'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.LESSON_BASE_URL||'http://127.0.0.1:18775';
const out=process.env.LESSON_SCREENSHOTS||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const checks=[],errors=[],external=[];
 try {
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  p.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
  await p.goto(base+'/frozen-bubble/');
  const seek=async(id,v)=>p.locator('#'+id+'-time').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},v);
  const time=async id=>Number(await p.locator('#'+id+'-readout').getAttribute('data-time'));
  for(const lang of ['zh','en']) {
   await p.locator(`[data-lang="${lang}"]`).click();
   assert.equal(await p.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
   assert.equal(await p.locator('#growth-play').isDisabled(),true);
   await seek('growth',24);assert.equal(await p.locator('#seed').isDisabled(),true);
   await p.locator('#growth').click({position:{x:120,y:120}});assert.equal(await p.locator('#growth-play').isDisabled(),true);
   await seek('growth',0);assert.equal(await p.locator('#seed').isEnabled(),true);
   await p.locator('#seed').click();assert.equal(await p.locator('#growth-play').isEnabled(),true);
   await p.locator('#growth-play').click();await p.waitForTimeout(300);await p.locator('#growth-play').click();
   const paused=await time('growth');assert.ok(paused>.1);await p.waitForTimeout(200);assert.equal(await time('growth'),paused);
   await p.locator('#growth-play').click();await p.waitForTimeout(200);await p.locator('#growth-play').click();assert.ok(await time('growth')>paused);
   await seek('growth',12);
   await p.locator('#undercooling').evaluate(el=>{el.value=18;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await time('growth'),12);
   await p.locator('a[href="#step1"]').click();assert.equal(await time('growth'),12);
   await p.locator('#compare-play').click();await p.waitForTimeout(250);await p.locator('#compare-play').click();assert.ok(await time('compare')>.1);
   await seek('compare',15);await p.locator('#trails').uncheck();assert.equal(await time('compare'),15);await p.locator('#trails').check();
   for(let i=0;i<3;i++){await p.locator('#compare-reset').click();assert.equal(await time('compare'),0);await p.waitForTimeout(70);assert.equal(await time('compare'),0);}
   await seek('compare',24);assert.match(await p.locator('#compare-play').textContent(),lang==='zh'?/从头/:/start/);await p.locator('#compare-play').click();await p.waitForTimeout(100);assert.ok(await time('compare')<1);await p.locator('#compare-play').click();
   await seek('compare',15);
   for(const width of [320,390,640,1280]) {
    await p.setViewportSize({width,height:900});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${width}: no horizontal overflow`);
    const tiny=await p.locator('button,input[type=range],.nav-step,.backline a').evaluateAll(es=>es.filter(el=>el.getBoundingClientRect().height<47.9).map(el=>el.id||el.className));assert.deepEqual(tiny,[]);
    await p.locator('#step1').scrollIntoViewIfNeeded();
    if(width===390||width===1280)await p.screenshot({path:path.join(out,`${lang}-${width}-compare.png`),fullPage:true});
   }
   await p.setViewportSize({width:1280,height:900});
   await p.locator('#step0').scrollIntoViewIfNeeded();await seek('growth',15);await p.screenshot({path:path.join(out,`${lang}-growth.png`)});
   for(let i=0;i<3;i++){await p.locator('#growth-reset').click();assert.equal(await time('growth'),0);assert.equal(await p.locator('#growth-play').isDisabled(),true);}
   checks.push(`${lang}: seed, play/pause/resume, seek, same-time undercooling, independent clocks, trails, repeat reset, end/replay, 320/390/640/1280`);
  }
  for(const dpr of [1,2,3]) {
   const c=await browser.newContext({viewport:{width:390,height:900},deviceScaleFactor:dpr});const q=await c.newPage();await q.goto(base+'/frozen-bubble/');
   for(const width of [320,640,390,390]) {await q.setViewportSize({width,height:900});await q.waitForTimeout(60);assert.ok(await q.locator('#growth').evaluate(c=>Math.abs(c.width-c.getBoundingClientRect().width*devicePixelRatio)<=1));}
   await c.close();
  }
  checks.push('DPR 1/2/3, repeated resize without backing-store growth');
  const locked=await browser.newContext({viewport:{width:844,height:390},locale:'zh-CN'});
  const lockedPage=await locked.newPage();
  await lockedPage.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError');}});});
  await lockedPage.goto(base+'/frozen-bubble/');assert.equal(await lockedPage.locator('html').getAttribute('lang'),'zh-CN');
  await lockedPage.locator('[data-lang="en"]').click();assert.equal(await lockedPage.locator('html').getAttribute('lang'),'en');
  await lockedPage.locator('#seed').focus();await lockedPage.keyboard.press('Enter');assert.equal(await lockedPage.locator('#growth-play').isEnabled(),true);
  await lockedPage.locator('#growth-time').focus();await lockedPage.keyboard.press('ArrowRight');assert.ok(Number(await lockedPage.locator('#growth-readout').getAttribute('data-time'))>0);
  assert.ok(await lockedPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await locked.close();checks.push('Blocked localStorage memory fallback, navigator locale, landscape layout, keyboard seed/seek');
  await p.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await p.reload();assert.equal(await time('growth'),0);assert.equal(await time('compare'),0);await p.locator('#seed').focus();assert.equal(await p.locator('#seed').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
  await p.emulateMedia({forcedColors:'none'});
  await p.locator('#seed').click();for(let i=0;i<5;i++)await p.locator('#seed').click();assert.equal(await p.locator('#seed').isDisabled(),true);await p.locator('#growth-reset').click();
  await p.goto(base+'/?category=physics');await p.locator('[data-lang="en"]').click();const link=p.locator('a.card[href="frozen-bubble/"]');await link.waitFor();await link.click();assert.ok(p.url().includes('/frozen-bubble/'));await p.locator('.backline a').click();assert.ok(p.url().includes('category=physics'));await p.goBack();assert.ok(p.url().includes('/frozen-bubble/'));
  await p.goto(base+'/frozen-bubble/#step2');await p.waitForTimeout(250);assert.equal(await p.locator('.nav-step.active').getAttribute('href'),'#step2');
  const bounds=await p.locator('#step2').boundingBox();assert.ok(bounds.y>=0&&bounds.y<250);
  await p.locator('.related a[href="../interference/#step1"]').click();assert.ok(p.url().endsWith('/interference/#step1'));await p.goBack();
  checks.push('Reduced-motion initial pause, forced-color focus, seed boundary, home registration, return/Back, direct hash nav and cross-lesson deep link');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  // Compare the exact solid text pairs inherited from the existing lesson palette.
  const luminance=hex=>{const a=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
  const ratios={};for(const [name,fg,bg] of [['body','e8edf4','0a0e14'],['muted','9aaabd','121a24'],['button','0a0e14','67d7f9'],['focus','ffb454','121a24']]){const a=luminance(fg),b=luminance(bg);ratios[name]=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratios[name]>=7);}
  fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({checks,errors,external,contrast:ratios},null,2));console.log(JSON.stringify({checks,errors,external,contrast:ratios},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
