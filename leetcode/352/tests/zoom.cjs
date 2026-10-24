const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
const extension=path.join(__dirname,'zoom-extension'),profile=fs.mkdtempSync(path.join(out,'zoom-profile-'));
(async()=>{
 let context;
 try{
  context=await chromium.launchPersistentContext(profile,{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,viewport:{width:780,height:1000},args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const page=await context.newPage(),errors=[],observed=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/352/');
  const cdp=await context.newCDPSession(page);
  const actualZoom=await worker.evaluate(async()=>{const tabs=await chrome.tabs.query({});const tab=tabs.find(t=>t.url.includes('/leetcode/352/'));await chrome.tabs.setZoom(tab.id,2);return await chrome.tabs.getZoom(tab.id);});assert.equal(actualZoom,2);
  for(const physicalWidth of [780,640])for(const lang of ['en','zh']){
   await page.setViewportSize({width:physicalWidth,height:1000});
   await page.waitForFunction(w=>innerWidth===w,physicalWidth/2);
   await page.click(`[data-lang="${lang}"]`);await page.selectOption('#preset','0');
   for(let i=0;i<3;i++)await page.click('#traceNext');
   await page.evaluate(()=>{const e=document.querySelector('.comparison'),nav=document.querySelector('.step-nav');window.scrollTo({top:scrollY+e.getBoundingClientRect().top-nav.getBoundingClientRect().height-12,behavior:'instant'});});
   const geometry=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,columns:getComputedStyle(document.querySelector('.comparison')).gridTemplateColumns}));
   assert.equal(geometry.width,physicalWidth/2);assert.equal(geometry.dpr,2);assert.ok(geometry.scrollWidth<=geometry.width+1);assert.equal(geometry.columns.split(' ').length,1);
   await page.waitForTimeout(150);
   const capture=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
   const image=Buffer.from(capture.data,'base64');assert.ok(image.length>10000,'Zoom capture must contain rendered lesson content');
   fs.writeFileSync(path.join(out,physicalWidth===780?`zoom200-${lang}.png`:`zoom200-${lang}-320.png`),image);
   await page.check('[name="prediction"][value="bridge"]');await page.click('#reveal');assert.ok((await page.locator('#feedback').innerText()).includes('[[10,16],[20,20]]'));
   await page.locator('#sourceDetails').evaluate(e=>e.open=true);
   assert.ok(await page.locator('#pythonCode').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   await page.locator('#sourceDetails').evaluate(e=>e.open=false);
   observed.push({lang,physicalWidth,actualZoom,...geometry});
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'native-zoom.json'),JSON.stringify({kind:'author self-check',result:'pass',method:'Native Chromium chrome.tabs.setZoom(2), verified by getZoom, innerWidth and devicePixelRatio; test-only local extension in fresh temporary profile',observed,errors},null,2));
  console.log(JSON.stringify({result:'pass',nativeZoom:2,paths:observed.length}));
 }finally{if(context)await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});
