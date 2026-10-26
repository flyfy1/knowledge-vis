/* Author browser self-check. Every artifact is redirected by OUTPUT_DIR. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),metadata=JSON.parse(fs.readFileSync(path.join(root,'lesson-entry.json'),'utf8'));
const {trace,presets}=require('../core.js');
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/943/';
const launch={headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})};
function luminance(c){const a=c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(ratio([255,255,255],[0,0,0]),21);assert.equal(luminance([0,0,0]),0);assert.equal(luminance([255,255,255]),1);assert(Math.abs(luminance([255,0,0])-.2126)<1e-12);assert(Math.abs(ratio([116,116,116],[0,0,0])-4.492948)<.000001);
(async()=>{
const browser=await chromium.launch(launch),context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],responses=[],states=[],screenshots=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{responses.push({url:r.url(),status:r.status()});if(r.status()>=400)errors.push(r.status()+' '+r.url())});
await page.goto(url);await page.locator('#pythonSource').waitFor();
const lang=async l=>{await page.locator('#langToggle [data-lang='+l+']').click();await page.waitForFunction(v=>document.documentElement.lang===v,l==='zh'?'zh-CN':'en')};
const text=id=>page.locator('#'+id).textContent();
for(const language of ['en','zh']){
 await lang(language);assert.equal(await page.locator('h1').textContent(),'#943 · '+metadata.title[language]);assert.equal(await page.title(),'#943 · '+metadata.title[language]);assert.equal(await text('pythonSource'),source);
 await page.locator('#handReveal').click();assert(await page.locator('#hand').isVisible());assert((await text('hand')).includes('2 + 2 − 1 = 3'));await lang(language==='en'?'zh':'en');assert(await page.locator('#hand').isVisible());await lang(language);await page.locator('#handReveal').click();
 for(let preset=0;preset<presets.length;preset++){
  await page.selectOption('#preset',String(preset));const model=trace(presets[preset]),initial=await text('tableBody');
  assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
  if(model.frames.length===1){assert(await page.locator('#next').isDisabled());assert((await text('result')).includes('solo'));continue;}
  for(let k=1;k<model.frames.length;k++){
   await page.locator('#next').click();const f=model.frames[k],e=f.event;
   const actual=await page.locator('#tableBody td').evaluateAll(cells=>cells.filter(e=>e.querySelector('b')).map(e=>({mask:+e.dataset.mask,last:+e.dataset.last,value:e.querySelector('b').textContent,labels:e.textContent})));
   for(const cell of actual)assert.equal(cell.value,f.dp[cell.mask][cell.last]===null?'—':String(f.dp[cell.mask][cell.last]));
   const calc=await text('calculation');assert(calc.includes(e.source+' + ('+presets[preset][e.j].length+' − '+e.overlap+') = '+e.candidate));
   assert(calc.includes((language==='en'?'best predecessor ':'最佳前驱 ')+e.winner));
   assert.equal(await page.locator('td.source').count(),1);assert.equal(await page.locator('td.target').count(),1);
   assert((await page.locator('td.source').textContent()).includes(language==='en'?'Source':'源'));assert((await page.locator('td.target').textContent()).includes(language==='en'?'Target':'目标'));
   if(k===model.frames.length-1||k===2){
    const current=await text('tableBody'),history=await text('history');await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await text('tableBody'),current);assert.equal(await text('history'),history);assert.equal(await text('calculation'),calc);
    await lang(language==='en'?'zh':'en');assert.equal(await page.locator('#preset').inputValue(),String(preset));await lang(language);assert.equal(await text('tableBody'),current);assert.equal(await text('calculation'),calc);
   }
  }
  assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
  assert((await text('result')).includes((language==='en'?'length ':'长度 ')+[4,12,17,4,4][preset]));
  states.push({language,preset,frames:model.frames.length,result:await text('result'),lastCalculation:await text('calculation')});
  while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();assert.equal(await text('tableBody'),initial);
  await page.locator('#end').click();assert(await page.locator('#next').isDisabled());await page.locator('#reset').click();assert.equal(await text('tableBody'),initial);
 }
 assert((await page.locator('.formula').textContent()).includes('dp[mask][j] = min(i ∈ P) (dp[P][i] + len(words[j]) − overlap[i][j])'));
 for(let option=0;option<3;option++){
  await page.locator('input[name=prediction][value="'+option+'"]').check();assert(!(await text('feedback')).includes('bcabcx'));await page.locator('#reveal').click();
  const feedback=await text('feedback');assert(feedback.includes('bcabcx'));assert(feedback.includes('3 − 2'));assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),option===2);
  await lang(language==='en'?'zh':'en');assert(await page.locator('input[value="'+option+'"]').isChecked());await lang(language);assert.equal(await text('feedback'),feedback);states.push({language,option,feedback});
 }
 await page.locator('input[name=prediction][value="0"]').check();assert(!(await text('feedback')).includes('bcabcx'));await page.selectOption('#preset','0');await page.locator('#end').click();await page.locator('#reset').click();assert(await page.locator('input[value="0"]').isChecked());
 await page.evaluate(()=>{if(window.originalWrite)navigator.clipboard.writeText=window.originalWrite});await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 for(let attempt=0;attempt<2;attempt++){
  const sentinel='943-'+language+'-'+attempt+'-'+Date.now();await page.evaluate(async s=>{if(window.originalWrite)navigator.clipboard.writeText=window.originalWrite;await navigator.clipboard.writeText(s)},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test blocked automatic copy'))});await page.locator('#copy').click();await page.locator('#manualSource').waitFor({state:'visible'});
  assert.equal(await page.locator('#manualSource').inputValue(),source);assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);states.push({language,attempt,clipboard:'native fallback',host:process.platform,sentinelVerified:true,sourceExact:true});
 }
 const dp=page.waitForEvent('download');await page.locator('#download').click();const download=await dp;const file=path.join(out,'download-'+language+'.py');await download.saveAs(file);assert.equal(fs.readFileSync(file,'utf8'),source);
}
await page.goto(url);await lang('en');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await text('progress')).includes('1/12'));
const focus=await page.locator('#next').evaluate(e=>({focused:document.activeElement===e,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert(focus.focused&&focus.width==='3px');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
await page.locator('.step-nav a[href="#step2"]').click();assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-1));
for(const width of [320,390,736,1440])for(const language of ['en','zh']){
 await page.setViewportSize({width,height:width===736?414:1000});await lang(language);await page.selectOption('#preset','1');
 // A losing current candidate with a retained best winner; both markers remain visible.
 const model=trace(presets[1]),idx=model.frames.findIndex(f=>f.event&&f.event.complete&&f.event.candidate>f.event.best);
 for(let k=0;k<idx;k++)await page.locator('#next').click();
 await page.locator('#tableScroll').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-100));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('#calculation').evaluate(e=>e.scrollWidth<=e.clientWidth));
 const optionBudget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {label:e.selectedOptions[0].textContent,text:c.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.fontFamily}});
 assert(optionBudget.text+optionBudget.padding+24<=optionBudget.width,JSON.stringify(optionBudget));
 const disabled=await page.locator('#prev').evaluate(e=>({opacity:getComputedStyle(e).opacity}));assert.equal(disabled.opacity,'1');
 await page.locator('#tableScroll').focus();await page.keyboard.press('ArrowRight');if(width<420)await page.waitForFunction(()=>document.getElementById('tableScroll').scrollLeft>0);await page.locator('#tableScroll').evaluate(e=>e.scrollLeft=0);
 const name='table-'+language+'-'+width+'.png';await page.locator('#tableScroll').screenshot({path:path.join(out,name),style:'.step-nav{visibility:hidden}'});screenshots.push(name);
 if(width<420){await page.locator('#tableScroll').evaluate(e=>e.scrollLeft=e.scrollWidth);const right='table-right-'+language+'-'+width+'.png';await page.locator('#tableScroll').screenshot({path:path.join(out,right),style:'.step-nav{visibility:hidden}'});screenshots.push(right);await page.locator('#tableScroll').evaluate(e=>e.scrollLeft=0);}
 const presetName='preset-'+language+'-'+width+'.png';await page.locator('#preset').screenshot({path:path.join(out,presetName),style:'.step-nav{visibility:hidden}'});screenshots.push(presetName);
 await page.locator('#calculation').scrollIntoViewIfNeeded();const calcName='calculation-'+language+'-'+width+'.png';await page.screenshot({path:path.join(out,calcName)});screenshots.push(calcName);
 assert.equal(await page.locator('h1').textContent(),'#943 · '+metadata.title[language]);
 states.push({language,width,optionBudget,competingCandidate:model.frames[idx].event,renderedCalculation:await text('calculation')});
}
for(const language of ['en','zh']){
 await page.setViewportSize({width:390,height:1000});await lang(language);await page.locator('input[value="2"]').check();await page.locator('#reveal').click();await page.locator('#step3').scrollIntoViewIfNeeded();const name='prediction-'+language+'-390.png';await page.screenshot({path:path.join(out,name)});screenshots.push(name);
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));const full='lesson-'+language+'-desktop.png';await page.screenshot({path:path.join(out,full),fullPage:true});screenshots.push(full);
}
// Actual browser 200% zoom through Chromium's tabs API, not CSS scaling.
const zoomRuntime=path.join(out,'zoom-runtime'),extension=path.join(zoomRuntime,'extension');
fs.rmSync(zoomRuntime,{recursive:true,force:true});fs.mkdirSync(extension,{recursive:true});
fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local lesson zoom test',version:'1.0',permissions:['tabs'],background:{service_worker:'zoom.js'}}));
fs.writeFileSync(path.join(extension,'zoom.js'),"chrome.tabs.onUpdated.addListener((id,info,tab)=>{if(info.status==='complete'&&tab.url.startsWith("+JSON.stringify(new URL(url).origin)+"))chrome.tabs.setZoom(id,2);});");
const zoomContext=await chromium.launchPersistentContext(path.join(zoomRuntime,'profile'),{...launch,viewport:null,args:['--window-size=1280,1400','--disable-extensions-except='+extension,'--load-extension='+extension]});
const worker=zoomContext.serviceWorkers()[0]||await zoomContext.waitForEvent('serviceworker');
const zp=await zoomContext.newPage();zp.on('pageerror',e=>errors.push(e.message));await zp.goto(url);
await worker.evaluate(async target=>{for(const tab of await chrome.tabs.query({}))if(tab.url===target)await chrome.tabs.setZoom(tab.id,2);},url);
await zp.waitForFunction(()=>devicePixelRatio===2&&innerWidth===640);
const zoomClient=await zoomContext.newCDPSession(zp);
const zoomMetrics=await zp.evaluate(()=>({devicePixelRatio,innerWidth,outerWidth,innerHeight}));
for(const language of ['en','zh']){
 await zp.locator('#langToggle [data-lang='+language+']').click();await zp.selectOption('#preset','1');await zp.locator('#end').click();
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
// Follow related concepts with keyboard and save actual destination content.
await page.setViewportSize({width:320,height:1000});
for(const language of ['zh','en','zh'])for(const [id,step] of [[940,2],[552,1]]){
 await page.goto(url);await lang(language);const anchor=page.locator('.related a[href="../'+id+'/#step'+step+'"]'),label=await anchor.textContent();await anchor.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+id+'/#step'+step);
 const section=await page.locator('#step'+step).textContent();assert(section.includes(id===940?(language==='en'?'final':'末尾'):(language==='en'?'trailing':'末尾')));
 states.push({language,relatedLabel:label,url:page.url(),destination:section.slice(0,3500),targetCopySHA256:require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'..',String(id),'copy.js'))).digest('hex')});
}
await page.goto(url);await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked storage')};Storage.prototype.setItem=()=>{throw Error('blocked storage')}});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(url);await bp.locator('#langToggle [data-lang=zh]').click();assert.equal(await bp.locator('h1').textContent(),'#943 · 最短超级串');await blocked.close();
const offline=await browser.newContext({offline:true});const op=await offline.newPage();op.on('pageerror',e=>errors.push(e.message));await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await offline.close();
assert.equal(errors.length,0,JSON.stringify(errors));assert(responses.every(r=>r.url.startsWith(new URL(url).origin)));
const report={type:'author browser self-check',url,browser:browser.version(),host:process.platform,zoom:'Native Chromium tabs.setZoom(2), window 1280x1400; CDP fromSurface capture',zoomMetrics,colors,contrasts,focus,states,screenshots,errors,localAssetsOnly:true};
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({result:'pass',states:states.length,screenshots:screenshots.length,minimumTextContrast:Math.min(...contrasts.map(c=>c.ratio)),errors}));
})().catch(e=>{console.error(e);process.exit(1)});
