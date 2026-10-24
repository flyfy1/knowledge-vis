/* OUTPUT_DIR redirects screenshots and reports for independent reruns. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence'),url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/321/';fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(root+'/solution.py','utf8'),C=require(root+'/core.js');
const pickCases=[[[3,5,4],2],[[3,4,6,5],2],[[9,7,4,2],2],[[5,5,4],2],[[6,2],0],[[6,0,4],3]],mergeCases=[[[6,7],[6,0,4]],[[6,6,8],[6,6,3]],[[6],[6,0]],[[5,2],[5,2]],[[],[6,2]]];
const errors=[],assets=[],external=[];let assertions=0;
const eq=(a,b)=>{assert.deepStrictEqual(a,b);assertions++;};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 await context.addInitScript(()=>{localStorage.setItem('knowledge-lang','en');Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.__copied=value;}},configurable:true});});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+JSON.stringify(m.location()));});page.on('response',r=>{if(r.status()>=400)assets.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/'))external.push(r.url());});
 await page.goto(url);await page.locator('#pickReason').waitFor();
 // Exercise Chromium's real clipboard before injecting deterministic success/denial branches.
 await page.evaluate(()=>delete navigator.clipboard);await page.locator('#copySource').click();eq(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.__copied=value;}},configurable:true}));
 const tiles=async id=>page.locator('#'+id+' .digit').allTextContents().then(a=>a.map(Number));
 const snapshots=[];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();eq(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(out,`${lang}-header.png`)});
  for(const take of ['1','2','3']){await page.selectOption('#take',take);eq((await page.locator('#splitLedger .current').textContent()).includes('take='+take),true);}
  for(let preset=0;preset<pickCases.length;preset++){
   await page.selectOption('#pickPreset',String(preset));const [nums,take]=pickCases[preset],frames=C.pickTrace(nums,take);
   eq(await page.locator('#pickPrev').isDisabled(),true);
   const seen=[];
   for(let f=0;f<frames.length;f++){
    eq(await tiles('pickBefore'),frames[f].before);eq(await tiles('pickAfter'),frames[f].stack);
    eq(await page.locator('#pickHistory li').count(),f);seen.push(await page.locator('#pickReason').textContent());
    if(f<frames.length-1)await page.locator('#pickNext').click();
   }
   eq(await page.locator('#pickNext').isDisabled(),true);
   for(let f=frames.length-2;f>=0;f--){await page.locator('#pickPrev').click();eq(await tiles('pickAfter'),frames[f].stack);eq(await page.locator('#pickReason').textContent(),seen[f]);}
   await page.locator('#pickNext').click();eq(await tiles('pickAfter'),frames[1].stack);await page.locator('#pickReset').click();eq(await tiles('pickAfter'),[]);eq(await page.locator('#pickHistory li').count(),0);
  }
  for(let preset=0;preset<mergeCases.length;preset++){
   await page.selectOption('#mergePreset',String(preset));const [a,b]=mergeCases[preset],frames=C.mergeTrace(a,b);eq(await page.locator('#mergePrev').isDisabled(),true);
   for(let f=0;f<frames.length;f++){
    eq(await tiles('mergeOutput'),frames[f].out);eq(await tiles('leftSuffix'),frames[f].left);eq(await tiles('rightSuffix'),frames[f].right);eq(await page.locator('#mergeHistory li').count(),f);
    if(f<frames.length-1)await page.locator('#mergeNext').click();
   }
   eq(await page.locator('#mergeNext').isDisabled(),true);
   for(let f=frames.length-2;f>=0;f--){await page.locator('#mergePrev').click();eq(await tiles('mergeOutput'),frames[f].out);}
   await page.locator('#mergeNext').click();eq(await tiles('mergeOutput'),frames[1].out);await page.locator('#mergeReset').click();eq(await tiles('mergeOutput'),[]);
  }
  for(const value of ['0','1','2']){
   await page.locator(`[name=prediction][value="${value}"]`).check();eq((await page.locator('#feedback').textContent()).includes('[8,8,9,8,8,1]'),false);
   await page.locator('#reveal').click();const text=await page.locator('#feedback').textContent();eq(text.includes('[8,8,9,8,8,1]'),true);eq(text.includes('[8,8,8,9,8,1]'),true);
   snapshots.push({locale:lang,choice:value,feedback:text});
  }
  await page.locator('#copySource').click();eq(await page.evaluate(()=>window.__copied),source);eq(await page.locator('#pythonCode').textContent(),source);
 }
 // Locale changes preserve the actual dependent and independent state.
 await page.selectOption('#pickPreset','1');await page.locator('#pickNext').click();await page.locator('#pickNext').click();await page.selectOption('#mergePreset','0');await page.locator('#mergeNext').click();await page.locator('#codeDetails summary').click();
 const state=await page.evaluate(()=>({pick:[...document.querySelectorAll('#pickAfter .digit')].map(e=>e.textContent),merge:document.querySelector('#mergeOutput').textContent,take:document.querySelector('#take').value,selected:document.querySelector('[name=prediction]:checked').value,open:document.querySelector('#codeDetails').open}));
 await page.locator('[data-lang=en]').click();eq(await page.evaluate(()=>({pick:[...document.querySelectorAll('#pickAfter .digit')].map(e=>e.textContent),merge:document.querySelector('#mergeOutput').textContent,take:document.querySelector('#take').value,selected:document.querySelector('[name=prediction]:checked').value,open:document.querySelector('#codeDetails').open})),state);eq((await page.locator('#feedback').textContent()).includes('[8,8,9,8,8,1]'),true);eq(await page.locator('[data-lang=en]').evaluate(e=>e===document.activeElement),true);
 // Denied clipboard has a selected, exact, read-only text source, in both locales.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('denied');}},configurable:true}));
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#copySource').click();eq(await page.locator('#manualSource').inputValue(),source);eq(await page.locator('#manualSource').evaluate(e=>e.selectionStart===0&&e.selectionEnd===e.value.length&&e===document.activeElement),true);await page.keyboard.press('Control+c');eq(await page.evaluate(()=>Object.getOwnPropertyDescriptor(Navigator.prototype,'clipboard').get.call(navigator).readText()),source);snapshots.push({locale:lang,clipboard:await page.locator('#copyStatus').textContent()});}
 const downloadEvent=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadEvent;eq(fs.readFileSync(await download.path(),'utf8'),source);
 // Internal links and their fragment targets, including the shared navigation.
 for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){
  if(href.startsWith('https:'))continue;const link=new URL(href,url),r=await context.request.get(link.href);eq(r.ok(),true);if(link.hash){const text=await r.text();eq(text.includes('id="'+link.hash.slice(1)+'"'),true);}
 }
 // Actual keyboard activation and focus styling.
 await page.locator('#pickReset').click();await page.locator('#pickPrev').focus();await page.locator('#pickNext').focus();await page.keyboard.press('Enter');eq(await tiles('pickAfter'),[3]);
 const focus=await page.locator('#pickNext').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));eq(focus.style,'solid');eq(focus.width,'3px');
 await page.locator('#pickPreset').focus();await page.keyboard.press('Tab');eq(await page.evaluate(()=>document.activeElement.id),'pickPrev');
 // Both translations at each target width, populated traces rather than empty diagrams.
 const geometry=[];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#pickPreset','1');for(let i=0;i<5;i++)await page.locator('#pickNext').click();await page.selectOption('#mergePreset','1');for(let i=0;i<3;i++)await page.locator('#mergeNext').click();
   eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   const boxes=await page.locator('.digit').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {w:r.width,h:r.height,x:r.x,right:r.right};}));eq(boxes.every(b=>b.w>=36&&b.h>=48&&b.x>=0&&b.right<=width),true);
   const controls=await page.locator('button,select,input[type=radio],.btn').evaluateAll(els=>els.filter(e=>e.getClientRects().length&&!e.matches('[type=radio]')).map(e=>({id:e.id,h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})));eq(controls.every(x=>x.h>=48&&x.w>=48),true);
   await page.locator('a[href="#step2"]').click();await page.waitForTimeout(1000);const y=await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top),bottom=await page.locator('.step-nav').evaluate(e=>e.getBoundingClientRect().bottom);eq(y>=bottom-1,true);eq(await page.locator('a[href="#step2"]').getAttribute('aria-current'),'step');
   await page.locator('#mergePreset').scrollIntoViewIfNeeded();await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-merge.png`),style:'.step-nav{visibility:hidden}'});
   await page.locator('#pickPreset').scrollIntoViewIfNeeded();await page.locator('#step1 .stage').screenshot({path:path.join(out,`${lang}-${width}-pick.png`),style:'.step-nav{visibility:hidden}'});
   geometry.push({locale:lang,width,noOverflow:true,minDigitWidth:Math.min(...boxes.map(x=>x.w)),minControlHeight:Math.min(...controls.map(x=>x.h))});
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#mergePreset').scrollIntoViewIfNeeded();eq(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-zoom200.png`),style:'.step-nav{visibility:hidden}'});geometry.push({locale:lang,width:1440,zoom:'200% CSS layout zoom',noOverflow:true});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Measure actual foreground/background pairs for text, controls and state colors.
 await page.locator('#pickReset').click();
 const pairs=await page.evaluate(()=>{
  const bg=e=>{for(let x=e;x;x=x.parentElement){const c=getComputedStyle(x).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return 'rgb(13, 17, 23)';};
  return ['body','.explain','.hint','.digit','.readout','.btn','.btn:disabled','.btn.primary','.lang-toggle button.active','.badge','.step-nav a','.label','th','a','summary'].map(sel=>{const e=document.querySelector(sel);return e?{selector:sel,fg:getComputedStyle(e).color,bg:bg(e)}:null;}).filter(Boolean);
 });
 const lum=s=>{const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const p of pairs){const a=lum(p.fg),b=lum(p.bg);p.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);eq(p.ratio>=4.5,true);}
 const focusContrast=(lum(focus.color)+.05)/(lum('rgb(28, 35, 48)')+.05);eq(focusContrast>=3,true);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#pickPreset').focus();await page.keyboard.press('Tab');eq(await page.locator('#pickNext').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');eq(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 // Storage failure must not prevent initial localization or a state-preserving switch.
 const blocked=await browser.newContext({viewport:{width:390,height:844}});await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage blocked');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(url);await bp.locator('#pickNext').click();await bp.locator('[data-lang=zh]').click();eq(await bp.locator('#pickAfter .digit').allTextContents(),['3']);eq(await bp.locator('html').getAttribute('lang'),'zh-CN');await bp.locator('[data-lang=en]').click();eq(await bp.locator('#pickAfter .digit').allTextContents(),['3']);
 eq(errors,[]);eq(assets,[]);eq(external,[]);
 const report={kind:'author browser self-check',assertions,errors,assetErrors:assets,externalRequests:external,geometry,contrast:pairs,focus:{...focus,contrast:focusContrast},semanticBindings:snapshots,sourceParity:['embedded','displayed','copied','downloaded','manual fallback'],storageDenied:true,limitations:['Headless Chromium, not a physical phone','200% uses CSS layout zoom','No independent review or actual novice study']};fs.writeFileSync(path.join(out,'browser-check.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({assertions,errors,geometry,contrast:pairs},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
