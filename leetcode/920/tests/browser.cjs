/* Author browser checks. OUTPUT_DIR redirects all results and downloads. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const metadata=JSON.parse(fs.readFileSync(path.join(root,'lesson-entry.json'),'utf8'));
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18786')+'/leetcode/920/';
function luminance(c){let a=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(luminance([0,0,0]),0);assert.equal(luminance([255,255,255]),1);assert.equal(ratio([255,255,255],[0,0,0]),21);
assert(Math.abs(luminance([255,0,0])-.2126)<1e-12);assert(Math.abs(luminance([0,255,0])-.7152)<1e-12);assert(Math.abs(luminance([0,0,255])-.0722)<1e-12);
assert(Math.abs(ratio([116,116,116],[0,0,0])-4.492948)<.000001);assert(ratio([116,116,116],[0,0,0])<4.5);
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],responses=[],states=[],screenshots=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('response',r=>{responses.push({url:r.url(),status:r.status()});if(r.status()>=400)errors.push(r.status()+' '+r.url());});
await page.goto(url);await page.locator('#pythonSource').waitFor();
const lang=async value=>{await page.locator('#langToggle [data-lang='+value+']').click();await page.waitForFunction(v=>document.documentElement.lang===v,value==='zh'?'zh-CN':'en');};
const text=id=>page.locator('#'+id).textContent();
for(const language of ['en','zh']){
 await lang(language);assert.equal(await page.locator('h1').textContent(),'#920 · '+metadata.title[language]);assert.equal(await page.title(),'#920 · '+metadata.title[language]);
 assert.equal(await text('pythonSource'),source);
 await page.locator('#handReveal').click();assert(await page.locator('#hand').isVisible());assert((await text('hand')).includes('ABA'));await page.locator('#handReveal').click();assert(!(await page.locator('#hand').isVisible()));
 for(let preset=0;preset<6;preset++){
  await page.selectOption('#preset',String(preset));
  assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  const initial=await text('tableBody');await page.locator('#next').click();
  const forward=await text('tableBody'),calc=await text('calculation');
  await page.locator('#prev').click();assert.equal(await text('tableBody'),initial);
  await page.locator('#next').click();assert.equal(await text('tableBody'),forward);assert.equal(await text('calculation'),calc);
  await page.locator('#end').click();assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  const expected=[2,6,6,6,1,24][preset];assert((await text('result')).includes('= '+expected));
  assert.equal(await page.locator('#tableBody .future').count(),0);
  states.push({language,preset,result:await text('result')});
  await page.locator('#reset').click();assert.equal(await text('tableBody'),initial);
 }
 // Hand-derived middle transition (2,2), then the final (3,2).
 await page.selectOption('#preset','0');for(let i=0;i<4;i++)await page.locator('#next').click();
 assert.equal(await page.locator('td.current .cell-value').textContent(),'2');
 assert.equal(await page.locator('td.source').count(),2);
 assert.equal(await text('calculation'),language==='en'?'Target dp[2][2]: new N = 2 from dp[1][1] × 1 choices = 2; replay R = 0 from dp[1][2] × 1 choices = 0. Total: 2 prefixes.':'目标 dp[2][2]：新歌 N = dp[1][1] 的 2 × 1 个选择 = 2；重播 R = dp[1][2] 的 0 × 1 个选择 = 0。合计 2 张前缀。');
 const middle=await text('tableBody'),progress=await text('progress');
 await lang(language==='en'?'zh':'en');assert.equal(await text('tableBody'),middle);
 await lang(language);assert.equal(await text('progress'),progress);
 states.push({language,state:'middle (2,2)',formula:await page.locator('.formula').textContent(),calculation:await text('calculation')});
 assert((await page.locator('.formula').textContent()).includes('dp[i−1][j−1] × (n−j+1) + dp[i−1][j] × max(j−k, 0)'));
 for(let option=0;option<3;option++){
  await page.locator('input[name=prediction][value="'+option+'"]').check();
  assert(!(await text('feedback')).includes('18:'));assert(!(await text('feedback')).includes('答案是 18'));
  await page.locator('#reveal').click();assert((await text('feedback')).includes('18'));
  const feedback=await text('feedback');await lang(language==='en'?'zh':'en');assert(await page.locator('input[value="'+option+'"]').isChecked());await lang(language);assert.equal(await text('feedback'),feedback);
  states.push({language,option,feedback});
 }
 await page.locator('input[name=prediction][value="0"]').check();assert(!(await text('feedback')).includes('18'));
 // Trace reset does not erase an independent prediction.
 await page.locator('#reset').click();assert(await page.locator('input[value="0"]').isChecked());
 // Successful native write and native manual fallback, fresh verified sentinel every attempt.
 await page.evaluate(()=>{if(window.originalWrite)navigator.clipboard.writeText=window.originalWrite;});
 await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 for(let attempt=0;attempt<2;attempt++){
  const sentinel='920-'+language+'-'+attempt+'-'+Date.now();
  await page.evaluate(async s=>{if(window.originalWrite)navigator.clipboard.writeText=window.originalWrite;await navigator.clipboard.writeText(s);},sentinel);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test blocked automatic copy'));});
  await page.locator('#copy').click();await page.locator('#manualSource').waitFor({state:'visible'});
  assert.equal(await page.locator('#manualSource').inputValue(),source);
  assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  states.push({language,clipboard:'native fallback',attempt,host:process.platform,sentinelVerified:true,exactSource:true});
 }
 const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;
 const downloadPath=path.join(out,'download-'+language+'.py');await download.saveAs(downloadPath);assert.equal(fs.readFileSync(downloadPath,'utf8'),source);
}
// Keyboard focus, activation, internal anchors and local related targets.
await page.goto(url);await lang('en');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await text('progress')).includes('1/6'));
const focus=await page.locator('#next').evaluate(e=>({focused:document.activeElement===e,style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert(focus.focused&&focus.style==='solid'&&focus.width==='3px');
await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);
assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-1));
for(const href of ['../629/#step2','../552/#step2']){const target=new URL(href,url);const response=await context.request.get(target.href);assert.equal(response.status(),200);assert((await response.text()).includes('id="step2"'));}
// Desktop/mobile/landscape matrices, dense table with source operands.
for(const width of [320,390,736,1440])for(const language of ['en','zh']){
 await page.setViewportSize({width,height:width===736?414:900});await lang(language);await page.selectOption('#preset','5');
 for(let i=0;i<11;i++)await page.locator('#next').click();
 await page.locator('#traceStage').scrollIntoViewIfNeeded();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const optionBudget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),canvas=document.createElement('canvas'),c=canvas.getContext('2d');c.font=s.font;return {label:e.selectedOptions[0].textContent,text:c.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.fontFamily};});
 assert(optionBudget.text+optionBudget.padding+24<=optionBudget.width,JSON.stringify(optionBudget));
 const name='trace-'+language+'-'+width+'.png';await page.screenshot({path:path.join(out,name)});screenshots.push(name);
 const tableName='table-'+language+'-'+width+'.png';await page.locator('#tableScroll').screenshot({path:path.join(out,tableName),style:'.step-nav{visibility:hidden}'});screenshots.push(tableName);
 await page.locator('#calculation').scrollIntoViewIfNeeded();assert(await page.locator('#calculation').evaluate(e=>e.scrollWidth<=e.clientWidth));
 states.push({language,width,optionBudget,heading:await page.locator('h1').textContent()});
 assert.equal(await page.locator('h1').textContent(),'#920 · '+metadata.title[language]);assert.equal(await page.title(),'#920 · '+metadata.title[language]);
}
// Actual browser 200% zoom through Chromium's tabs API, not CSS scaling.
const zoomRuntime=path.join(out,'zoom-runtime'),extension=path.join(zoomRuntime,'extension');
fs.rmSync(zoomRuntime,{recursive:true,force:true});fs.mkdirSync(extension,{recursive:true});
fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local lesson zoom test',version:'1.0',permissions:['tabs'],background:{service_worker:'zoom.js'}}));
fs.writeFileSync(path.join(extension,'zoom.js'),"chrome.tabs.onUpdated.addListener((id,info,tab)=>{if(info.status==='complete'&&tab.url.startsWith("+JSON.stringify(new URL(url).origin)+"))chrome.tabs.setZoom(id,2);});");
const zoomContext=await chromium.launchPersistentContext(path.join(zoomRuntime,'profile'),{headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),viewport:null,args:['--window-size=1280,1400','--disable-extensions-except='+extension,'--load-extension='+extension]});
const worker=zoomContext.serviceWorkers()[0]||await zoomContext.waitForEvent('serviceworker');
const zp=await zoomContext.newPage();zp.on('pageerror',e=>errors.push(e.message));await zp.goto(url);
await worker.evaluate(async target=>{for(const tab of await chrome.tabs.query({}))if(tab.url===target)await chrome.tabs.setZoom(tab.id,2);},url);
await zp.waitForFunction(()=>devicePixelRatio===2&&innerWidth===640);
const zoomClient=await zoomContext.newCDPSession(zp);
const zoomMetrics=await zp.evaluate(()=>({devicePixelRatio,innerWidth,outerWidth,innerHeight}));
for(const language of ['en','zh']){
 await zp.locator('#langToggle [data-lang='+language+']').click();await zp.selectOption('#preset','5');for(let i=0;i<11;i++)await zp.locator('#next').click();
 await zp.locator('#tableScroll').scrollIntoViewIfNeeded();assert(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await zp.locator('#tableScroll').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-80));
 await zp.waitForTimeout(150);
 const name='zoom200-'+language+'.png',capture=await zoomClient.send('Page.captureScreenshot',{format:'png',fromSurface:true});
 const png=Buffer.from(capture.data,'base64');assert(png.length>5000,'Native zoom screenshot must contain rendered content');fs.writeFileSync(path.join(out,name),png);screenshots.push(name);
 await zp.locator('#calculation').scrollIntoViewIfNeeded();assert(await zp.locator('#calculation').evaluate(e=>e.scrollWidth<=e.clientWidth));
 // 920-COPY-R1: inspect the changed page end at native 200% zoom too.
 assert.equal(await zp.locator('footer,[data-i18n="foot"]').count(),0);
 await zp.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
 assert(await zp.evaluate(()=>Math.abs(document.querySelector('main').getBoundingClientRect().bottom-document.body.getBoundingClientRect().bottom)<=1));
 const endName='page-end-zoom200-'+language+'.png';
 const endCapture=await zoomClient.send('Page.captureScreenshot',{format:'png',fromSurface:true});
 fs.writeFileSync(path.join(out,endName),Buffer.from(endCapture.data,'base64'));screenshots.push(endName);
}
await zoomContext.close();fs.rmSync(zoomRuntime,{recursive:true,force:true});
// Measure actual solid text/background roles; helper calibrated above.
const colors=await page.evaluate(()=>{
 const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
 return ['--bg','--panel','--panel2','--text','--muted','--accent','--accent2','--good'].reduce((o,k)=>{const el=document.createElement('span');el.style.color='var('+k+')';document.body.append(el);o[k]=rgb(getComputedStyle(el).color);el.remove();return o;},{});
});
const contrasts=[];for(const fg of ['--text','--muted','--accent','--accent2','--good'])for(const bg of ['--bg','--panel','--panel2']){const r=ratio(colors[fg],colors[bg]);assert(r>=4.5);contrasts.push({fg,bg,ratio:r,threshold:4.5});}
assert(ratio(colors['--accent2'],colors['--panel2'])>=3);assert(ratio(colors['--bg'],colors['--accent'])>=4.5);
// Manual fallback visible and translated after language switches.
await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('test blocked'));});
await page.locator('#copy').click();await page.locator('#manualSource').waitFor({state:'visible'});
for(const language of ['zh','en']){await lang(language);assert((await text('copyStatus')).includes(language==='zh'?'快捷键':'shortcut'));}
// Follow the actual related links by keyboard and retain their rendered meaning.
await page.setViewportSize({width:320,height:900});
for(const language of ['zh','en','zh'])for(const id of [629,552]){
 await page.goto(url);await lang(language);
 const anchor=page.locator('.related a[href="../'+id+'/#step2"]'),label=await anchor.textContent();
 await anchor.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+id+'/#step2');
 const heading=await page.locator('#step2 h2').textContent(),section=await page.locator('#step2').textContent();
 assert.equal(heading,id===629?(language==='en'?'Reuse neighboring sums':'相邻的和，共享计算'):(language==='en'?'03 · Watch six counts accumulate':'03 · 看六个计数如何累积'));
 states.push({language,relatedLabel:label,target:page.url(),heading,observedSection:section.slice(0,1800),targetSourceSHA256:require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'..',String(id),'copy.js'))).digest('hex')});
}
// Storage denial fallback and local file source with no network access.
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked storage')};Storage.prototype.setItem=()=>{throw Error('blocked storage')};});
const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(url);await bp.locator('#langToggle [data-lang=zh]').click();assert((await bp.locator('h1').textContent()).includes('#920'));await blocked.close();
const offline=await browser.newContext({offline:true});const op=await offline.newPage();op.on('pageerror',e=>errors.push(e.message));await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await offline.close();
assert.equal(errors.length,0,JSON.stringify(errors));assert(responses.every(r=>r.url.startsWith(new URL(url).origin)));
const report={type:'author browser self-check',url,browser:browser.version(),host:process.platform,zoom:'Native Chromium tabs.setZoom(2), window 1280x1400; CDP fromSurface capture (Playwright zoom capture was blank)',zoomMetrics,colors,contrasts,focus,states,screenshots,errors,localAssetsOnly:true};
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
await browser.close();console.log(JSON.stringify({result:'pass',states:states.length,screenshots:screenshots.length,minimumTextContrast:Math.min(...contrasts.map(c=>c.ratio)),errors}));
})().catch(e=>{console.error(e);process.exit(1)});
