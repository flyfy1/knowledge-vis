const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=process.env.OUTPUT_DIR,base=process.env.PREVIEW_URL;
(async()=>{
 const source=fs.readFileSync('leetcode/679/solution.py','utf8'),records=[];
 const b=await chromium.launch();
 try {for(const lang of ['en','zh']){
  const c=await b.newContext({permissions:['clipboard-read','clipboard-write']}),p=await c.newPage();
  await p.goto(base+'/leetcode/679/');await p.locator(`[data-lang=${lang}]`).click();
  const sentinel=`679-${lang}-distinct-sentinel`;
  await p.evaluate(async seed=>{await navigator.clipboard.writeText(seed);Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw Error('denied');}});},sentinel);
  await p.click('#copy');const selection=await p.locator('#copyText').evaluate(e=>({focus:e===document.activeElement,start:e.selectionStart,end:e.selectionEnd}));
  assert.deepEqual(selection,{focus:true,start:0,end:source.length});
  const before=await p.evaluate(()=>navigator.clipboard.readText());assert.equal(before,sentinel);assert.notEqual(before,source);
  await p.keyboard.press('Meta+C');assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  records.push({lang,selection,distinctSentinel:true,noActionDoesNotEqualSource:true,shortcut:'Meta+C',exactTransfer:true});await c.close();
 }}finally{await b.close();}
 fs.writeFileSync(path.join(out,'native-clipboard.json'),JSON.stringify({platform:process.platform,records},null,2));
 const ext=path.join(out,'zoom-extension'),profile=path.join(out,'.zoom-profile');fs.mkdirSync(ext,{recursive:true});
 fs.writeFileSync(path.join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local zoom proof',version:'1.0',permissions:['tabs'],background:{service_worker:'background.js'}}));fs.writeFileSync(path.join(ext,'background.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 let c;try{
  c=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,viewport:{width:1280,height:1000},ignoreDefaultArgs:['--disable-extensions'],args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`]});
  const worker=c.serviceWorkers()[0]||await c.waitForEvent('serviceworker'),p=await c.newPage();await p.goto(base+'/leetcode/679/');
  await worker.evaluate(async url=>{for(const t of await chrome.tabs.query({}))if(t.url?.startsWith(url))await chrome.tabs.setZoom(t.id,2);},base);
  await p.waitForFunction(()=>devicePixelRatio===2&&innerWidth===640);const zoom=[];
  for(const lang of ['en','zh']){
   await p.locator(`[data-lang=${lang}]`).click();await p.selectOption('#preset','1');for(let i=0;i<5;i++)await p.click('#next');
   await p.locator('#groups').scrollIntoViewIfNeeded();
   const layout=await p.evaluate(()=>({dpr:devicePixelRatio,width:innerWidth,scroll:document.documentElement.scrollWidth,cssZoom:document.documentElement.style.zoom}));assert.equal(layout.cssZoom,'');assert(layout.scroll<=layout.width+1);
   const cdp=await c.newCDPSession(p),capture=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});fs.writeFileSync(path.join(out,`native-zoom200-${lang}.png`),Buffer.from(capture.data,'base64'));await cdp.detach();zoom.push({lang,...layout});
  }
  fs.writeFileSync(path.join(out,'native-zoom.json'),JSON.stringify({method:'chrome.tabs.setZoom(2)',zoom},null,2));
 }finally{if(c)await c.close();fs.rmSync(profile,{recursive:true,force:true});}
 console.log('PASS native clipboard in both locales and actual browser zoom');
})().catch(e=>{console.error(e);process.exitCode=1;});
