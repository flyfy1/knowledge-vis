const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18794';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}});const page=await context.newPage(),errors=[],network=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status());});page.on('request',r=>network.push(r.url()));
 await page.goto(base+'/leetcode/980/');await page.waitForFunction(()=>document.querySelector('#readout').textContent.length>0);
 const expected=[1,2,4,0,1,0];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));await page.waitForFunction(()=>document.querySelector('#prev').disabled);
   await page.setViewportSize({width:320,height:1000});
   assert(await page.locator('#preset').evaluate(el=>{const c=document.createElement('canvas').getContext('2d'),s=getComputedStyle(el);c.font=s.font;return c.measureText(el.selectedOptions[0].text).width<=el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20;}),'selected preset label clips');
   await page.setViewportSize({width:1440,height:1000});
   let count=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#readout').textContent();await page.click('#next');const after=await page.locator('#readout').textContent();
    if(count===2){await page.click('#prev');assert.equal(await page.locator('#readout').textContent(),before);await page.click('#next');assert.equal(await page.locator('#readout').textContent(),after);}
    count++;
   }
   assert((await page.locator('#readout').textContent()).endsWith(expected[p]+'.')||(await page.locator('#readout').textContent()).endsWith(expected[p]+'。'));
   assert.equal(await page.locator('#board .used').count(),0);assert(await page.locator('#end').isDisabled());
   await page.click('#reset');assert(await page.locator('#prev').isDisabled());await page.click('#end');assert(await page.locator('#next').isDisabled());results.push({lang,preset:p,events:count,expected:expected[p]});
  }
  for(const option of [0,1,2]){
   await page.check(`[name=prediction][value="${option}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.includes(lang==='en'?'answer is 0':'正确数目是 0'));assert(text.includes(option===1?(lang==='en'?'correct':'预测正确'):(lang==='en'?'failed branches':'失败分支')));
  }
  const feedback=await page.locator('#feedback').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator('[value="2"][name=prediction]').isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#feedback').textContent(),feedback);
  await page.locator('summary[data-i18n=source]').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const dl=page.waitForEvent('download');await page.click('a[download]');const download=await dl;const filename=path.join(out,`download-${lang}.py`);await download.saveAs(filename);assert.equal(fs.readFileSync(filename,'utf8'),source);
  // Fresh sentinel before EACH fallback attempt. Linux browser host uses Control+C.
  const sentinel=`980-${lang}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.nativeWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('deliberately denied for fallback test');};});
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert(await page.locator('#copyText').evaluate(el=>el===document.activeElement&&el.selectionStart===0&&el.selectionEnd===el.value.length));await page.keyboard.press('Control+c');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>navigator.clipboard.writeText=window.nativeWrite);
  assert((await page.locator('#copyStatus').textContent()).includes(lang==='en'?'Automatic copying':'自动复制'));
  await page.locator('summary[data-i18n=source]').click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','1');await page.click('#next');await page.click('#next');await page.locator('#board').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const geometry=await page.locator('#board .cell').evaluateAll(es=>es.map(e=>({w:e.getBoundingClientRect().width,sw:e.scrollWidth,cw:e.clientWidth})));assert(geometry.every(x=>x.w>=45&&x.sw<=x.cw+1));
   await page.screenshot({path:path.join(out,`${lang}-${width}.png`)});results.push({lang,width,geometry});
  }
  await page.setViewportSize({width:1440,height:1000});const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});await cdp.detach();
  // Reflow equivalent to 1440 desktop browser at 200% zoom, without changing CSS font size.
  await page.setViewportSize({width:720,height:500});await page.locator('#board').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-zoom-reflow.png`)});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#next').evaluate(el=>el===document.activeElement),true);const outline=await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth);assert.equal(outline,'3px');
  await page.click('[href="#step3"]');await page.waitForTimeout(600);const top=await page.locator('#step3').evaluate(el=>el.getBoundingClientRect().top);assert(top>=45&&top<150);
 }
 // State-preserving locale transition inside an early-end frame, including selected preset.
 await page.setViewportSize({width:390,height:900});await page.selectOption('#preset','0');for(let i=0;i<3;i++)await page.click('#next');
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);const txt=await page.locator('#progress').textContent();assert(txt.includes(lang==='en'?'Early E':'提前到达 E'));assert.equal(await page.inputValue('#preset'),'0');assert((await page.locator('#readout').textContent()).includes('remaining=2'));results.push({lang,earlyText:txt,readout:await page.locator('#readout').textContent()});}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}}));const bp=await blocked.newPage();await bp.goto(base+'/leetcode/980/');await bp.click('[data-lang=zh]');assert.equal(await bp.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 // Related anchors resolve in the already-running local preview.
 for(const href of ['../51/#step2','../115/#step1']){const target=new URL(href,base+'/leetcode/980/');const response=await context.request.get(target.href);assert(response.ok());assert((await response.text()).includes(`id="${target.hash.slice(1)}"`));}
 // Offline source assets, with external HTTP unavailable, from a local file.
 const offline=await browser.newContext();const op=await offline.newPage();await op.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await offline.close();
 assert.deepEqual(errors,[]);assert(network.every(u=>u.startsWith(base)||u.startsWith('data:')));
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({kind:'author self-check',host:process.platform,results,errors,network:[...new Set(network)],sourceParity:'display, automatic clipboard, native manual fallback and downloads exact',zoom:'CDP scale 2 plus 720 CSS px reflow equivalent; no physical browser chrome zoom or real-device claim'},null,2));await browser.close();console.log('PASS browser: both locales, 6 presets, all 720 frames per locale, prediction, exact source transfers, widths, zoom, keyboard, blocked storage');
})().catch(e=>{console.error(e);process.exit(1);});
