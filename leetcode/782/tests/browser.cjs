'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',URL=BASE+'/leetcode/782/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const results={host:process.platform,url:URL,checks:[],semantic:[],screenshots:[]};
function luminance(c){const a=c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(luminance([255,0,0]),.2126);assert.equal(luminance([0,255,0]),.7152);assert.equal(luminance([0,0,255]),.0722);assert.equal(contrast([1,2,3],[1,2,3]),1);assert(Math.abs(contrast([116,116,116],[0,0,0])-4.492948073111701)<1e-10);assert(contrast([116,116,116],[0,0,0])<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(URL);await page.locator('#frameRead').filter({hasText:'Frame'}).waitFor();
 async function lang(l){await page.locator(`[data-lang="${l}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');assert.equal(await page.locator('h1').textContent(),l==='zh'?'#782 · 变为棋盘':'#782 · Transform to Chessboard');assert.equal(await page.title(),l==='zh'?'#782 · 变为棋盘':'#782 · Transform to Chessboard');}
 async function board(id){return page.locator('#'+id+' tr').evaluateAll(rows=>rows.slice(1).map(r=>[...r.querySelectorAll('td')].map(td=>Number(td.textContent))));}
 const expected=[2,1,0,-1,-1,-1,0];
 for(const l of ['en','zh']){
  await lang(l);await page.locator('#handReset').click();assert(await page.locator('#undo').isDisabled());
  const original=await board('handCurrent');await page.locator('#swapHand').click();assert.deepEqual(await board('handCurrent'),[[0,1,0],[1,0,1],[0,1,0]]);assert.equal(await page.locator('#handPath li').count(),2);
  await page.locator('#undo').click();assert.deepEqual(await board('handCurrent'),original);await page.locator('#swapHand').click();await page.locator('#swapHand').click();assert.deepEqual(await board('handCurrent'),original);await page.locator('#handReset').click();assert.equal(await page.locator('#handPath li').count(),1);
  for(let i=0;i<7;i++){
   await page.locator('#preset').selectOption(String(i));assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#traceHistory li').count(),1);
   let n=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#operation').textContent(),b=await board('traceCurrent');await page.locator('#next').click();n++;
    const after=await page.locator('#operation').textContent(),ledger=await page.locator('#traceHistory').textContent(),afterBoard=await board('traceCurrent');assert.equal(await page.locator('#traceHistory li').count(),n+1);
    await page.locator('#prev').click();assert.equal(await page.locator('#operation').textContent(),before);assert.deepEqual(await board('traceCurrent'),b);
    await page.locator('#next').click();assert.equal(await page.locator('#operation').textContent(),after);assert.equal(await page.locator('#traceHistory').textContent(),ledger);assert.deepEqual(await board('traceCurrent'),afterBoard);
   }
   const read=await page.locator('#frameRead').textContent();assert(read.endsWith(String(expected[i])));assert(await page.locator('#end').isDisabled());results.semantic.push({locale:l,preset:i,terminal:await page.locator('#operation').textContent(),read});
   await page.locator('#traceReset').click();assert.equal(await page.locator('#traceHistory li').count(),1);assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert(await page.locator('#next').isDisabled());
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!(await page.locator('#feedback').textContent()).includes('101 / 010 / 101'));
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('101 / 010 / 101'));
   await page.locator('#reveal').click();assert((await page.locator('#feedback').textContent()).includes('101 / 010 / 101'));results.semantic.push({locale:l,choice,feedback:await page.locator('#feedback').textContent()});
  }
  assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  await page.locator('#copyPython').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  results.checks.push(l+': hand moves/undo/reset; all seven presets + every frame reverse/replay; prediction all options/change; exact source/copy/download');
 }
 await page.locator('#preset').selectOption('0');await page.locator('#next').click();await page.locator('#swapHand').click();
 const handBefore=await board('handCurrent'),before=await board('traceCurrent'),ledgerBefore=await page.locator('#traceHistory li').count();
 await lang('en');await lang('zh');assert.deepEqual(await board('handCurrent'),handBefore);assert.deepEqual(await board('traceCurrent'),before);assert.equal(await page.locator('#traceHistory li').count(),ledgerBefore);assert(await page.locator('[name="prediction"][value="2"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('101 / 010 / 101'));
 // Actual native fallback transfer on the Linux browser host. Reset and verify a distinct sentinel each attempt.
 for(const l of ['en','zh']){
  await lang(l);const sentinel='782-'+l+'-'+Date.now();await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.realWriteText=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test denies automatic write'));});
  await page.locator('#copyPython').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  const selected=await page.locator('#manualSource').evaluate(e=>({focused:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd}));assert(selected.focused&&selected.start===0&&selected.end===source.length);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  results.semantic.push({locale:l,clipboardFallback:await page.locator('#copyStatus').textContent(),sentinelVerified:true,nativeCopyExact:true});
  await page.evaluate(()=>{navigator.clipboard.writeText=window.realWriteText;});await page.locator('#copyPython').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 }
 await page.locator('#traceReset').click();await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#traceHistory li').count(),2);
 const focus=await page.locator('#next').evaluate(e=>{const c=getComputedStyle(e);return {width:c.outlineWidth,color:c.outlineColor,style:c.outlineStyle};});assert.equal(focus.width,'3px');results.focus=focus;
 for(const l of ['en','zh']){
  await lang(l);const equation=await page.locator('[data-i18n="formula"]').textContent();assert(equation.includes('board[0][0] ^ board[i][0] ^ board[0][j] ^ board[i][j] = 0'));results.semantic.push({locale:l,centralEquation:equation});
 }
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);
  for(let i=0;i<7;i++){await page.locator('#preset').selectOption(String(i));const m=await page.locator('#preset').evaluate(e=>{const c=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=c.font;return {text:e.selectedOptions[0].textContent,textWidth:ctx.measureText(e.selectedOptions[0].textContent).width,width:e.clientWidth,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight),font:c.font};});results.semantic.push({locale:l,width,preset:i,select:m});assert(m.textWidth+m.padding+20<=m.width,JSON.stringify(m));}

  for(const preset of ['0','4','5']){
   await page.locator('#preset').selectOption(preset);await page.locator('#end').click();await page.locator('#step2 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+l);
   const f=`trace-${l}-${width}-p${preset}.png`;await page.locator('#step2 .stage').screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);
   const cells=await page.locator('#traceCurrent td').evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize})));assert(cells.every(c=>c.w>=26&&c.h>=30&&parseFloat(c.font)>=16));
  }
  await page.locator('#step3 .stage').scrollIntoViewIfNeeded();const f=`prediction-${l}-${width}.png`;await page.locator('#step3 .stage').screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#preset').selectOption('0');await page.locator('#end').click();await page.locator('#step2 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const f=`zoom200-${l}.png`;await page.screenshot({path:path.join(OUT,f)});results.screenshots.push(f);await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 results.zoom='200% CSS zoom in Chromium at 1440px; also 320/390/736/1440 CSS pixel widths';
 await page.setViewportSize({width:320,height:1000});
 for(const l of ['zh','en']){await lang(l);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));const f=`header-${l}.png`;await page.screenshot({path:path.join(OUT,f)});results.screenshots.push(f);
  for(const anchor of ['step1','step2']){await page.locator(`.related a[href="#${anchor}"]`).focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>{const top=document.getElementById(id).getBoundingClientRect().top,nav=document.querySelector('.step-nav').getBoundingClientRect().bottom;return top>=nav-2&&top<=nav+120;},anchor);}
 }
 const links=await page.locator('a[href^="../765/"]').getAttribute('href');const response=await context.request.get(BASE+'/leetcode/765/');assert(response.ok());assert((await response.text()).includes('id="step2"'));
 await page.setViewportSize({width:1440,height:1000});await page.locator('#preset').selectOption('4');await page.locator('#end').click();
 const pairs=await page.evaluate(()=>{
  const parse=s=>s.match(/[\d.]+/g).map(Number),over=(a,b)=>{const al=a[3]??1;return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)).concat(1);};
  const data=[];for(const el of document.querySelectorAll('h1,h2,p,li,a,button,label,legend,summary,select,textarea,code,td,th,caption')){
   if(!el.getClientRects().length)continue;const c=getComputedStyle(el),chain=[];let node=el;while(node){chain.push(node);node=node.parentElement;}let bg=[13,17,23,1];for(const parent of chain.reverse())bg=over(parse(getComputedStyle(parent).backgroundColor),bg);
   data.push({tag:el.tagName,id:el.id,text:el.textContent.slice(0,50),fg:parse(c.color).slice(0,3),bg:bg.slice(0,3)});
  }return data;
 });
 const measured=pairs.map(p=>({...p,ratio:contrast(p.fg,p.bg)}));for(const p of measured)assert(p.ratio>=4.5,JSON.stringify(p));
 results.contrast={formula:'sRGB .2126R+.7152G+.0722B after linearization; composited backgrounds',threshold:4.5,min:Math.min(...measured.map(p=>p.ratio)),pairs:measured};
 results.focus.contrastOnPanel=contrast([255,180,84],[22,27,34]);assert(results.focus.contrastOnPanel>=3);
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#prev').focus();assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'none'});
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(BASE)||u.startsWith('data:')));results.network={errors,localOnly:true,requests:[...new Set(requests)]};
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});});const p2=await blocked.newPage();await p2.goto(URL);await p2.locator('[data-lang="zh"]').click();await p2.locator('[data-lang="en"]').click();assert.equal(await p2.locator('#pythonCode').textContent(),source);await blocked.close();
 const offline=await browser.newContext();const p3=await offline.newPage();await p3.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await p3.locator('#pythonCode').textContent(),source);assert((await p3.locator('#frameRead').textContent()).length>10);await offline.close();
 results.checks.push('Locale preserves all experiment/reveal states; native fallback clipboard exact in both locales with distinct verified sentinels; keyboard/focus; local/related anchors; reduced motion/forced colors; blocked storage; file:// offline; no asset/console errors');
 const css=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(css<25000);results.shippedCssBytes=css;
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({checks:results.checks,contrastMinimum:results.contrast.min,css,screenshots:results.screenshots.length},null,2));
 await context.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
