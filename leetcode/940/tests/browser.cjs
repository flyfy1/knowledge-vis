/* Author browser checks. OUTPUT_DIR redirects all results and downloads. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const metadata=JSON.parse(fs.readFileSync(path.join(root,'lesson-entry.json'),'utf8'));
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18787')+'/leetcode/940/';
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
 await lang(language);assert.equal(await page.locator('h1').textContent(),'#940 · '+metadata.title[language]);assert.equal(await page.title(),'#940 · '+metadata.title[language]);
 assert.equal(await text('pythonSource'),source);
 await page.locator('#handReveal').click();assert(await page.locator('#hand').isVisible());assert((await text('hand')).includes('aa'));await page.locator('#handReveal').click();assert(!(await page.locator('#hand').isVisible()));
 for(let preset=0;preset<6;preset++){
  await page.selectOption('#preset',String(preset));
  assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  const initial=await text('tableBody');await page.locator('#next').click();
  const forward=await text('tableBody'),calc=await text('calculation');
  await page.locator('#prev').click();assert.equal(await text('tableBody'),initial);
  await page.locator('#next').click();assert.equal(await text('tableBody'),forward);assert.equal(await text('calculation'),calc);
  if(await page.locator('#end').isEnabled())await page.locator('#end').click();assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  const expected=[6,7,3,1,11,14][preset];assert((await text('result')).includes('= '+expected));

  states.push({language,preset,result:await text('result')});
  // Walk every frame backward and forward, checking exact prefix counts independently.
  while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();
  assert.equal(await text('tableBody'),initial);
  const input=['aba','abc','aaa','a','abab','abca'][preset];
  for(let k=1;k<=input.length;k++){
   await page.locator('#next').click();
   const words=new Set();for(let mask=1;mask<2**k;mask++){let w='';for(let i=0;i<k;i++)if(mask&(1<<i))w+=input[i];words.add(w);}
   assert.equal(await page.locator('#tableBody tr:last-child td:last-child').textContent(),String(words.size));
  }
  const disabledColor=await page.locator('#next').evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor,opacity:getComputedStyle(e).opacity}));
  assert.equal(disabledColor.fg,'rgb(154, 167, 184)');assert.equal(disabledColor.bg,'rgb(28, 35, 48)');assert.equal(disabledColor.opacity,'1');
  await page.locator('#reset').click();assert.equal(await text('tableBody'),initial);
 }
 // Independently hand-derived ab -> aba replacement, with restored locale state.
 await page.selectOption('#preset','0');await page.locator('#end').click();
 assert((await text('calculation')).includes('3 − 1 + 4 = 6'));
 assert((await text('groups')).includes('{a, aa, aba, ba}'));
 assert((await text('groups')).includes('{ab, b}'));
 const middle=await text('tableBody'),progress=await text('progress');
 await lang(language==='en'?'zh':'en');await lang(language);assert.equal(await text('tableBody'),middle);assert.equal(await text('progress'),progress);
 states.push({language,state:'aba terminal',formula:await page.locator('.formula').textContent(),calculation:await text('calculation')});
 assert.equal(await page.locator('.formula').textContent(),'new = total + 1; total′ = total − ending[c] + new; ending[c] = new');
 for(let option=0;option<3;option++){
  await page.locator('input[name=prediction][value="'+option+'"]').check();
  assert(!(await text('feedback')).includes('The answer is 10'));assert(!(await text('feedback')).includes('答案为 10'));
  await page.locator('#reveal').click();assert((await text('feedback')).includes('10'));
  const feedback=await text('feedback');await lang(language==='en'?'zh':'en');assert(await page.locator('input[value="'+option+'"]').isChecked());await lang(language);assert.equal(await text('feedback'),feedback);
  states.push({language,option,feedback});
 }
 await page.locator('input[name=prediction][value="0"]').check();assert(!(await text('feedback')).includes('10'));
 // Trace reset does not erase an independent prediction.
 await page.locator('#reset').click();assert(await page.locator('input[value="0"]').isChecked());
 // Successful native write and native manual fallback, fresh verified sentinel every attempt.
 await page.evaluate(()=>{if(window.originalWrite)navigator.clipboard.writeText=window.originalWrite;});
 await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 for(let attempt=0;attempt<2;attempt++){
  const sentinel='940-'+language+'-'+attempt+'-'+Date.now();
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
await page.goto(url);await lang('en');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await text('progress')).includes('1/3'));
const focus=await page.locator('#next').evaluate(e=>({focused:document.activeElement===e,style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert(focus.focused&&focus.style==='solid'&&focus.width==='3px');
await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(100);
assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-1));
for(const href of ['../115/#step0','../552/#step2']){const target=new URL(href,url);const response=await context.request.get(target.href);assert.equal(response.status(),200);assert((await response.text()).includes('id="'+target.hash.slice(1)+'"'));}
// Desktop/mobile/landscape matrices, dense table with source operands.
for(const width of [320,390,736,1440])for(const language of ['en','zh']){
 await page.setViewportSize({width,height:width===736?414:900});await lang(language);await page.selectOption('#preset','5');
 await page.locator('#end').click();
 await page.locator('#traceStage').scrollIntoViewIfNeeded();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert(await page.locator('#tableScroll').evaluate(e=>e.scrollWidth<=e.clientWidth));
 const optionBudget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),canvas=document.createElement('canvas'),c=canvas.getContext('2d');c.font=s.font;return {label:e.selectedOptions[0].textContent,text:c.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.fontFamily};});
 assert(optionBudget.text+optionBudget.padding+24<=optionBudget.width,JSON.stringify(optionBudget));
 const presetName='preset-'+language+'-'+width+'.png';await page.locator('#preset').screenshot({path:path.join(out,presetName),style:'.step-nav{visibility:hidden}'});screenshots.push(presetName);
 const name='trace-'+language+'-'+width+'.png';await page.screenshot({path:path.join(out,name)});screenshots.push(name);
 const tableName='table-'+language+'-'+width+'.png';await page.locator('#tableScroll').screenshot({path:path.join(out,tableName),style:'.step-nav{visibility:hidden}'});screenshots.push(tableName);
 await page.locator('#calculation').scrollIntoViewIfNeeded();assert(await page.locator('#calculation').evaluate(e=>e.scrollWidth<=e.clientWidth));
 states.push({language,width,optionBudget,heading:await page.locator('h1').textContent()});
 assert.equal(await page.locator('h1').textContent(),'#940 · '+metadata.title[language]);assert.equal(await page.title(),'#940 · '+metadata.title[language]);
}
for(const language of ['en','zh']){
 await page.setViewportSize({width:390,height:900});await lang(language);
 await page.locator('input[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#step3').scrollIntoViewIfNeeded();
 const name='prediction-'+language+'-390.png';await page.screenshot({path:path.join(out,name)});screenshots.push(name);
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));
 const full='lesson-'+language+'-desktop.png';await page.screenshot({path:path.join(out,full),fullPage:true});screenshots.push(full);
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
 await zp.locator('#langToggle [data-lang='+language+']').click();await zp.selectOption('#preset','5');await zp.locator('#end').click();
 await zp.locator('#tableScroll').scrollIntoViewIfNeeded();assert(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await zp.locator('#tableScroll').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-80));
 await zp.waitForTimeout(150);
 const name='zoom200-'+language+'.png',capture=await zoomClient.send('Page.captureScreenshot',{format:'png',fromSurface:true});
 const png=Buffer.from(capture.data,'base64');assert(png.length>5000,'Native zoom screenshot must contain rendered content');fs.writeFileSync(path.join(out,name),png);screenshots.push(name);
 await zp.locator('#calculation').scrollIntoViewIfNeeded();assert(await zp.locator('#calculation').evaluate(e=>e.scrollWidth<=e.clientWidth));
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
for(const language of ['zh','en','zh'])for(const id of [115,552]){
 await page.goto(url);await lang(language);
 const step=id===115?'step0':'step2';
 const anchor=page.locator('.related a[href="../'+id+'/#'+step+'"]'),label=await anchor.textContent();
 await anchor.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+id+'/#'+step);
 const heading=await page.locator('#'+step+' h2').textContent(),section=await page.locator('#'+step).textContent();
 assert.equal(heading,id===115?(language==='en'?'1 · Count choices of positions':'1 · 数的是位置选择'):(language==='en'?'03 · Watch six counts accumulate':'03 · 看六个计数如何累积'));
 states.push({language,relatedLabel:label,target:page.url(),heading,observedSection:section.slice(0,1800),targetSourceSHA256:require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'..',String(id),'copy.js'))).digest('hex')});
}
await page.goto(url);await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();
assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
// Storage denial fallback and local file source with no network access.
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked storage')};Storage.prototype.setItem=()=>{throw Error('blocked storage')};});
const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(url);await bp.locator('#langToggle [data-lang=zh]').click();assert((await bp.locator('h1').textContent()).includes('#940'));await blocked.close();
const offline=await browser.newContext({offline:true});const op=await offline.newPage();op.on('pageerror',e=>errors.push(e.message));await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await offline.close();
assert.equal(errors.length,0,JSON.stringify(errors));assert(responses.every(r=>r.url.startsWith(new URL(url).origin)));
const report={type:'author browser self-check',url,browser:browser.version(),host:process.platform,zoom:'Native Chromium tabs.setZoom(2), window 1280x1400; CDP fromSurface capture',zoomMetrics,colors,contrasts,focus,states,screenshots,errors,localAssetsOnly:true};
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
await browser.close();console.log(JSON.stringify({result:'pass',states:states.length,screenshots:screenshots.length,minimumTextContrast:Math.min(...contrasts.map(c=>c.ratio)),errors}));
})().catch(e=>{console.error(e);process.exit(1)});
