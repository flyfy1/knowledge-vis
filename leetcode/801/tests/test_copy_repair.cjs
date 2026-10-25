// Focused author regression for 801-COPY-R1; never independent closure.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence','copy-r1');
fs.mkdirSync(out,{recursive:true});
const root=path.resolve(__dirname,'..'),url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/801/';
const result={finding:'801-COPY-R1',kind:'author self-check',host:os.platform(),url,states:[],errors:[]};
(async()=>{
 let browser,zoomContext;
 try {
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  result.browser=await browser.version();
  const context=await browser.newContext({viewport:{width:320,height:900}}),page=await context.newPage();
  page.on('pageerror',e=>result.errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)result.errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(url);await page.waitForFunction(()=>document.getElementById('progress').textContent.includes('1/4'));
  await page.locator('[data-lang=zh]').click();
  await page.locator('#next').click();await page.locator('#next').click();
  await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
  for(const lang of ['zh','en','zh']){
   await page.locator(`[data-lang=${lang}]`).click();
   await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   await page.screenshot({path:path.join(out,`end-320-${lang}.png`)});
   assert.equal(await page.locator('footer, .site-foot, [data-i18n=foot]').count(),0,'Remove the orphan footer binding and its space');
   assert.ok(await page.evaluate(()=>!Object.hasOwn(window.COPY,'foot')),'Remove unused foot key');
   assert.ok(!/Author self-checked candidate|independent review pending|作者自查候选|尚待独立评审/.test(await page.locator('body').textContent()));
   assert.ok(await page.evaluate(()=>[...document.querySelectorAll('[data-i18n]')].every(e=>Array.isArray(window.COPY[e.dataset.i18n])&&window.COPY[e.dataset.i18n].length===2)),'Every remaining static binding resolves');
   assert.ok((await page.locator('#progress').textContent()).includes('3/4'));
   assert.ok((await page.locator('.trace-card[data-i="2"]').textContent()).includes('4 < 3'));
   assert.ok((await page.locator('#feedback').textContent()).includes('(0,1) → (0,1) → (1,1) → (1,2) → (2,2)'));
   assert.ok(await page.locator('[name=prediction][value="2"]').isChecked());
   for(const key of ['sim','originalLabel','p4'])assert.equal(await page.locator(`[data-i18n=${key}]`).textContent(),await page.evaluate(({key,lang})=>COPY[key][lang==='zh'?0:1],{key,lang}));
   const formula=await page.locator('.formula').textContent();assert.ok(formula.includes('next_keep = min(S ? keep : ∞, C ? swap : ∞)'));
   // Real sequential keyboard navigation through neighboring source controls and links.
   await page.locator('#copyPython').focus();
   const focus=[];
   for(const selector of ['#copyPython','#download','#sourceDetails summary',...Array.from({length:4},(_,i)=>`.related a:nth-child(${i+1})`)]){
    assert.ok(await page.locator(selector).evaluate(e=>document.activeElement===e),selector);
    focus.push(await page.locator(selector).textContent());await page.keyboard.press('Tab');
   }
   const geometry=await page.evaluate(()=>{
    window.scrollTo(0,document.documentElement.scrollHeight);
    const main=document.querySelector('main').getBoundingClientRect();
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bottomGap:innerHeight-main.bottom};
   });
   assert.ok(geometry.scrollWidth<=geometry.width);assert.ok(Math.abs(geometry.bottomGap)<=1,'No leftover footer gap');
   result.states.push({lang,width:320,trace:'i=2, processed 3/4',prediction:'revealed (2,2), retained',focus,geometry,limitations:await page.locator('[data-i18n=sim], [data-i18n=originalLabel], [data-i18n=p4]').allTextContents()});
  }
  const ext=path.join(__dirname,'zoom-extension'),profile=path.join(out,'zoom-profile');
  zoomContext=await chromium.launchPersistentContext(profile,{headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,viewport:null,args:[`--disable-extensions-except=${ext}`,`--load-extension=${ext}`,'--window-size=1440,1000'],ignoreDefaultArgs:['--disable-extensions']});
  const zp=await zoomContext.newPage();zp.on('pageerror',e=>result.errors.push(String(e)));await zp.goto(url);
  const worker=zoomContext.serviceWorkers()[0]||await zoomContext.waitForEvent('serviceworker');
  await worker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.setZoom(tabs.find(t=>t.url.includes('/801/')).id,2,resolve))));
  await zp.waitForFunction(()=>devicePixelRatio===2);
  result.zoom=await zp.evaluate(()=>({innerWidth,devicePixelRatio}));
  result.zoom.nativeFactor=await worker.evaluate(()=>new Promise(resolve=>chrome.tabs.query({},tabs=>chrome.tabs.getZoom(tabs.find(t=>t.url.includes('/801/')).id,resolve))));
  assert.equal(result.zoom.nativeFactor,2);assert.equal(result.zoom.innerWidth,720);
  for(const lang of ['zh','en','zh']){
   await zp.locator(`[data-lang=${lang}]`).click();await zp.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
   assert.ok(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await zp.locator('footer, [data-i18n=foot]').count(),0);
   const session=await zoomContext.newCDPSession(zp),shot=await session.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
   fs.writeFileSync(path.join(out,`end-zoom200-${lang}.png`),Buffer.from(shot.data,'base64'));await session.detach();
  }
  assert.deepEqual(result.errors,[]);result.status='PASS';
 } catch(e){result.status='FAIL';result.failure=String(e);throw e;}
 finally {
  if(zoomContext)await zoomContext.close();if(browser)await browser.close();
  fs.rmSync(path.join(out,'zoom-profile'),{recursive:true,force:true});
  fs.writeFileSync(path.join(out,'copy-repair-results.json'),JSON.stringify(result,null,2)+'\n');
 }
 console.log('801-COPY-R1 focused browser regression PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
