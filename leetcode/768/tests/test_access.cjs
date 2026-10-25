// Additional actual related-link reading and narrow native-zoom checks.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const origin=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=origin+'/leetcode/768/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const page=await browser.newPage({viewport:{width:320,height:900}}),links=[];
 for(const lang of ['zh','en']){
  await page.goto(url);await page.locator(`[data-lang=${lang}]`).click();
  for(let i=0;i<3;i++){
   const a=page.locator('.related a').nth(i),label=await a.textContent(),href=await a.getAttribute('href');await a.focus();await page.keyboard.press('Enter');
   const target=i===0?'#step2':i===1?'#step3':'#step2';
   if(i===2){await page.waitForURL('**/239/#step2');await page.waitForFunction(()=>{const y=document.querySelector('#step2').getBoundingClientRect().top;return y>=0&&y<160;});}
   const text=await page.locator(target).textContent();
   assert.ok(text.includes(i===0?'suffix_min':i===1?(lang==='en'?'Necessity':'必要性'):(lang==='en'?'deque':'双端队列')));
   links.push({lang,label,url:page.url(),observedConcept:i===0?'suffix minima and full-side cut operands':i===1?'safe cut necessity and sufficiency':'monotonic deque eliminates expired/dominated candidates to reuse sliding-window maxima',sectionExcerpt:text.slice(0,550)});
   if(i===2){await page.screenshot({path:path.join(out,`related-target-${lang}.png`)});await page.goto(url);await page.locator(`[data-lang=${lang}]`).click();}
  }
  // Actual browser-rendered suffix values, both initial and terminal, against hand minima.
  await page.selectOption('#preset','2');await page.locator('#end').click();assert.deepEqual(await page.locator('.value-card b').allTextContents(),['2','1','1','1','3','3','4','4','4','4']);
  await page.locator('#reset').click();await page.locator('#next').click();assert.deepEqual(await page.locator('.value-card b').allTextContents(),['2','—','1','—','3','—','4','—','4','4']);
  await page.locator('#operation').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`suffix-initial-320-${lang}.png`)});
  // Long visible localized links fit after the documented regression repair.
  for(const a of await page.locator('.related a').all()){const box=await a.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=320);}
  await page.locator('.related').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`related-repaired-320-${lang}.png`)});
 }
 await browser.close();
 const ext=path.join(__dirname,'zoom-extension'),profile=path.join(out,'narrow-zoom-profile');fs.rmSync(profile,{recursive:true,force:true});
 const context=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,viewport:null,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`,'--window-size=640,1000'],ignoreDefaultArgs:['--disable-extensions']});const zp=await context.newPage();await zp.goto(url);const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');await worker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.setZoom(tabs.find(t=>t.url.includes('/768/')).id,2,resolve))));await zp.waitForFunction(()=>devicePixelRatio===2);
 const zoom=await zp.evaluate(()=>({innerWidth,devicePixelRatio}));assert.equal(zoom.innerWidth,320);
 for(const lang of ['zh','en']){
  await zp.locator(`[data-lang=${lang}]`).click();await zp.selectOption('#preset','2');await zp.locator('#end').click();assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await zp.locator('#values').scrollIntoViewIfNeeded();const session=await context.newCDPSession(zp);const shot=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`zoom200-narrow-${lang}.png`),Buffer.from(shot.data,'base64'));await session.detach();
  await zp.locator('.related').scrollIntoViewIfNeeded();assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await context.close();fs.rmSync(profile,{recursive:true,force:true});
 const targetHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'../239/copy.js'))).digest('hex');
 fs.writeFileSync(path.join(out,'access-results.json'),JSON.stringify({links,relatedTargetCopySha256:targetHash,relatedTarget:'existing registered /leetcode/239/, observed via provided preview only; production delivery not claimed',zoom,suffixDOM:'actual initial/final values matched hand expectations',regression:'related link boxes within 320px in both locales'},null,2)+'\n');console.log('Additional access checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
