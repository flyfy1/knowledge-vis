// Uses Chromium's actual tabs.setZoom API, not CSS scaling.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),ext=path.join(__dirname,'zoom-extension'),profile=path.join(out,'.zoom-profile');fs.mkdirSync(out,{recursive:true});
(async()=>{
 let context;
 try{
 context=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:1280,height:900},ignoreDefaultArgs:['--disable-extensions'],args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
 const page=await context.newPage();await page.goto('http://127.0.0.1:18782/leetcode/664/');
 await worker.evaluate(async()=>{const tabs=await chrome.tabs.query({});for(const tab of tabs)if(tab.url?.startsWith('http://127.0.0.1:18782/leetcode/664/'))await chrome.tabs.setZoom(tab.id,2);});
 await page.waitForFunction(()=>devicePixelRatio===2&&innerWidth===640,{},{timeout:15000});
 const results=[];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','3');await page.locator('#end').click();await page.locator('a[href="#step2"]').click();await page.waitForTimeout(150);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const measured=await page.evaluate(()=>({dpr:devicePixelRatio,innerWidth,zoom:document.documentElement.style.zoom,tableWidth:document.querySelector('#tableRegion').clientWidth}));assert.equal(measured.zoom,'');
  await page.locator('#tableRegion').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(150);
  const cdp=await context.newCDPSession(page);const capture=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`browser-zoom200-${lang}.png`),Buffer.from(capture.data,'base64'));await cdp.detach();
  results.push({lang,...measured});
 }
 fs.writeFileSync(path.join(out,'browser-zoom-results.json'),JSON.stringify({method:'Chromium extension tabs.setZoom(2), verified DPR 2 and layout viewport 640 from 1280 CSS viewport; no CSS zoom',results},null,2));console.log('Actual browser zoom PASS');
 }finally{if(context)await context.close();fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});
