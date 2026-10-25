// Actual Chromium tab zoom via a test-only extension, not CSS zoom emulation.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('node:assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'zuma-zoom-'));
 const extension=path.join(__dirname,'zoom-extension');
 let context;
 try{
  context=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:1440,height:1100},reducedMotion:'reduce',...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const page=await context.newPage(),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/488/');
  const tab=await worker.evaluate(async()=>{const tabs=await chrome.tabs.query({});return tabs.find(t=>t.url.includes('/leetcode/488/')).id;});
  assert.equal(await worker.evaluate(async id=>{await chrome.tabs.setZoom(id,2);return chrome.tabs.getZoom(id);},tab),2);
  for(const lang of ['en','zh'])for(const width of [1440,780]){
   await page.setViewportSize({width,height:1100});await page.locator(`[data-lang="${lang}"]`).click();await page.selectOption('#preset','2');await page.locator('#next').click();
   assert.equal(await page.locator('#afterText').textContent(),'WWRRRBBWW');
   const dimensions=await page.evaluate(()=>({innerWidth,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth}));assert.equal(dimensions.innerWidth,width/2);assert.equal(dimensions.devicePixelRatio,2);assert(dimensions.scrollWidth<=dimensions.innerWidth);
   const balls=await page.locator('#afterBoard .ball').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize})));assert(balls.every(b=>b.w>=32&&b.h>=40&&parseFloat(b.font)>=16));
   await page.evaluate(()=>scrollBy(0,document.querySelector('#progress').getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20));
   await page.waitForTimeout(100);const session=await context.newCDPSession(page);const capture=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`${lang}-actual-zoom200-${width}.png`),Buffer.from(capture.data,'base64'));await session.detach();results.push({lang,viewport:width,zoom:2,...dimensions,balls});
  }
  for(const lang of ['en','zh']){
   await page.setViewportSize({width:780,height:1100});await page.locator(`[data-lang="${lang}"]`).click();
   for(const key of ['returnFailure','returnSibling','returnMinimum']){
    await page.locator(`[data-i18n="${key}"]`).scrollIntoViewIfNeeded();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const session=await context.newCDPSession(page);
    const capture=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
    fs.writeFileSync(path.join(out,`${lang}-zoom200-${key}.png`),Buffer.from(capture.data,'base64'));await session.detach();
   }
  }
  await worker.evaluate(id=>chrome.tabs.setZoom(id,1),tab);assert.equal(await worker.evaluate(id=>chrome.tabs.getZoom(id),tab),1);assert.equal(errors.length,0);
  fs.writeFileSync(path.join(out,'zoom-results.json'),JSON.stringify({status:'pass',method:'chrome.tabs.setZoom(tabId, 2), read back with getZoom; effective width and DPR asserted',results,errors},null,2)+'\n');
  console.log('Actual 200% tab zoom checks passed.');
 }finally{if(context)await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});
