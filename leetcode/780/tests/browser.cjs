'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';const URL=BASE+'/leetcode/780/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const results={host:process.platform,url:URL,checks:[],semantic:[],screenshots:[]};
function luminance(c){const a=c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(contrast([1,2,3],[1,2,3]),1);
assert.equal(luminance([255,0,0]),.2126);assert.equal(luminance([0,255,0]),.7152);assert.equal(luminance([0,0,255]),.0722);
assert(Math.abs(contrast([116,116,116],[0,0,0])-4.492948073111701)<1e-10);assert(contrast([116,116,116],[0,0,0])<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(URL);await page.locator('#frameRead').filter({hasText:'Frame'}).waitFor();
 async function lang(l){await page.locator(`[data-lang="${l}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');assert.equal(await page.locator('h1').textContent(),l==='zh'?'#780 · 到达终点':'#780 · Reaching Points');assert.equal(await page.title(),l==='zh'?'#780 · 到达终点':'#780 · Reaching Points');}
 const expected=[true,true,true,false,false,false,true,true,false];
 for(const l of ['en','zh']){
  await lang(l);
  await page.locator('#handReset').click();await page.locator('#addY').click();await page.locator('#addX').click();await page.locator('#addY').click();
  assert.equal(await page.locator('#handPoint').textContent(),'(3, 5)');assert.equal(await page.locator('#handPath li').count(),4);
  await page.locator('#undo').click();assert.equal(await page.locator('#handPoint').textContent(),'(3, 2)');await page.locator('#addY').click();
  await page.locator('#handReset').click();for(let i=0;i<19;i++)await page.locator('#addY').click();assert(await page.locator('#addY').isDisabled());assert(await page.locator('#addX').isDisabled());assert.equal(await page.locator('#handPoint').textContent(),'(1, 20)');
  await page.locator('#undo').click();assert(await page.locator('#addX').isEnabled());await page.locator('#handReset').click();assert(await page.locator('#undo').isDisabled());
  for(let i=0;i<9;i++){
   await page.locator('#preset').selectOption(String(i));assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#traceHistory li').count(),0);
   let n=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#operation').textContent();await page.locator('#next').click();n++;
    const after=await page.locator('#operation').textContent(),ledger=await page.locator('#traceHistory').textContent();assert.equal(await page.locator('#traceHistory li').count(),n);
    await page.locator('#prev').click();assert.equal(await page.locator('#operation').textContent(),before);
    await page.locator('#next').click();assert.equal(await page.locator('#operation').textContent(),after);assert.equal(await page.locator('#traceHistory').textContent(),ledger);
   }
   assert((await page.locator('#frameRead').textContent()).includes(expected[i]?'(true)':'(false)')||(await page.locator('#frameRead').textContent()).includes(expected[i]?'（true）':'（false）'));
   assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(22, 27, 34)');results.semantic.push({locale:l,preset:i,terminal:await page.locator('#operation').textContent()});
   await page.locator('#traceReset').click();assert.equal(await page.locator('#traceHistory li').count(),0);assert(await page.locator('#prev').isDisabled());
   await page.locator('#end').click();assert(await page.locator('#next').isDisabled());
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!(await page.locator('#feedback').textContent()).includes('17 % 5'));
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('17 % 5'));
   await page.locator('#reveal').click();assert((await page.locator('#feedback').textContent()).includes('17 % 5=2'));results.semantic.push({locale:l,choice,feedback:await page.locator('#feedback').textContent()});
  }
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  results.checks.push(l+': hand history/cap/undo/reset; all nine presets + every frame reverse/replay; prediction all options/change; exact source/copy/download');
 }
 // Locale changes preserve position, hand history, prediction/reveal, open source and useful focus.
 await page.locator('#preset').selectOption('1');await page.locator('#next').click();
 await page.locator('#addY').click();const handBefore=await page.locator('#handPath').textContent();const before=await page.locator('#tracePoint').textContent();await lang('en');await lang('zh');assert.equal(await page.locator('#handPath').textContent(),handBefore);assert.equal(await page.locator('#tracePoint').textContent(),before);assert(await page.locator('[name="prediction"][value="2"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('17 % 5=2'));assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 // Real Linux keyboard clipboard fallback, with distinct sentinel before denial.
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>navigator.clipboard.writeText('780-native-fallback-sentinel'));
  await page.evaluate(()=>{window.realWriteText=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied by test'));});
  await page.locator('#copyPython').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  const selected=await page.locator('#manualSource').evaluate(e=>({focused:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd}));assert(selected.focused&&selected.start===0&&selected.end===source.length);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  results.semantic.push({locale:l,clipboardFallback:await page.locator('#copyStatus').textContent(),nativeCopyExact:true});
  await page.evaluate(()=>{navigator.clipboard.writeText=window.realWriteText;});await page.locator('#copyPython').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 }
 // Keyboard, deep links, measured focus, and localized central equation.
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#tracePoint').textContent(),'(1, 2)');
 await page.locator('.related a[href="#step2"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);assert.equal(new globalThis.URL(page.url()).hash,'#step2');assert(await page.locator('#step2 h2').isVisible());
 const focus=await page.locator('.related a[href="#step2"]').evaluate(e=>{const c=getComputedStyle(e);return {width:c.outlineWidth,color:c.outlineColor,style:c.outlineStyle};});assert.equal(focus.width,'3px');results.focus=focus;
 for(const l of ['en','zh']){
  await lang(l);const equation=await page.locator('[data-i18n="formula"]').textContent();assert(equation.includes('(ty − sy) % sx = 0'));assert(equation.includes('ty ≥ sy'));results.semantic.push({locale:l,centralEquation:equation});
 }
 // Layout at all required widths, populated arithmetic and long localized choices.
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('1');await page.locator('#next').click();await page.locator('#step2 .stage').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+l);
  const selectorMetrics=[];for(let i=0;i<9;i++){await page.locator('#preset').selectOption(String(i));const m=await page.locator('#preset').evaluate(e=>{const c=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=c.font;return {text:e.selectedOptions[0].textContent,textWidth:ctx.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight),font:c.font};});assert(m.textWidth+m.padding+20<=m.width,JSON.stringify(m));selectorMetrics.push(m);}results.semantic.push({locale:l,width,selectorMetrics});await page.locator('#preset').selectOption('1');await page.locator('#next').click();
  const filename=`trace-${l}-${width}.png`;await page.locator('#step2 .stage').screenshot({path:path.join(OUT,filename),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(filename);
  const text=await page.locator('#operation').textContent();assert(text.includes('17 = 5 × 3 + 2'));assert(text.includes('(3, 17) → (3, 2)'));
  await page.locator('#step3 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const f=`prediction-${l}-${width}.png`;await page.locator('#step3 .stage').screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step2 .stage').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const f=`zoom200-${l}.png`;await page.screenshot({path:path.join(OUT,f)});results.screenshots.push(f);await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 results.screenshotMethod='Full stage captures suppress sticky navigation only during capture, avoiding screenshot overlay artifacts; viewport zoom captures retain navigation.';
 // Header identity, all local related anchors, and narrow keyboard navigation.
 await page.setViewportSize({width:320,height:1000});
 for(const l of ['zh','en','zh']){await lang(l);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));const f=`header-${l}.png`;await page.screenshot({path:path.join(OUT,f)});if(!results.screenshots.includes(f))results.screenshots.push(f);
 for(const anchor of ['step1','step2']){await page.locator(`.related a[href="#${anchor}"]`).focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>{const top=document.getElementById(id).getBoundingClientRect().top,nav=document.querySelector('.step-nav').getBoundingClientRect().bottom;return top>=nav-2&&top<=nav+120;},anchor);const geometry=await page.locator('#'+anchor).evaluate(e=>({top:e.getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(geometry.top>=geometry.nav-2,JSON.stringify(geometry));}}
 await page.setViewportSize({width:1440,height:1000});
 results.zoom='200% CSS zoom in real Chromium at 1440px (effective 720px content); also 320/390 CSS pixel layouts';
 // Collect rendered solid foreground/background text pairs; support compositing alpha surfaces.
 const pairs=await page.evaluate(()=>{
  const parse=s=>s.match(/[\d.]+/g).map(Number),over=(a,b)=>{const al=a[3]??1;return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)).concat(1);};
  const data=[];for(const el of document.querySelectorAll('h1,h2,p,li,a,button,label,legend,summary,select,textarea,code')){
   if(!el.getClientRects().length)continue;const c=getComputedStyle(el),chain=[];let node=el;while(node){chain.push(node);node=node.parentElement;}let bg=[13,17,23,1];for(const parent of chain.reverse())bg=over(parse(getComputedStyle(parent).backgroundColor),bg);
   data.push({tag:el.tagName,id:el.id,text:el.textContent.slice(0,50),fg:parse(c.color).slice(0,3),bg:bg.slice(0,3)});
  }return data;
 });
 const measured=pairs.map(p=>({...p,ratio:contrast(p.fg,p.bg)}));for(const p of measured)assert(p.ratio>=4.5,JSON.stringify(p));
 results.contrast={formula:'sRGB 0.2126R + 0.7152G + 0.0722B, linearized; alpha-composited ancestor backgrounds',threshold:4.5,min:Math.min(...measured.map(p=>p.ratio)),pairs:measured};
 results.focus.contrastOnPanel=contrast([255,180,84],[22,27,34]);assert(results.focus.contrastOnPanel>=3);
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
 assert.deepStrictEqual(errors,[]);assert(requests.every(u=>u.startsWith(BASE)||u.startsWith('data:')));results.network={errors,localOnly:true,requests:[...new Set(requests)]};
 // No localStorage available; locale and all offline source must still initialize.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});});const p2=await blocked.newPage();await p2.goto(URL);await p2.locator('#frameRead').waitFor();await p2.locator('[data-lang="zh"]').click();await p2.locator('[data-lang="en"]').click();assert.equal(await p2.locator('#pythonCode').textContent(),source);await blocked.close();
 const offline=await browser.newContext();const p3=await offline.newPage();await p3.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await p3.locator('#pythonCode').textContent(),source);assert((await p3.locator('#frameRead').textContent()).length>10);await offline.close();
 results.checks.push('State preserved on locale roundtrip; native fallback clipboard exact in both locales; keyboard activation/focus; local concept anchors; reduced motion/forced colors; storage denied; file:// offline source; no local asset/console errors');
 const css=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(css<25000);results.shippedCssBytes=css;
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({checks:results.checks,contrastMinimum:results.contrast.min,css,screenshots:results.screenshots.length},null,2));
 await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
