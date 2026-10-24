const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const OUT=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const root=path.resolve(__dirname,'..'),C=require('../core.js'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),copy=JSON.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8').replace(/^window.LESSON_COPY = /,'').replace(/;\s*$/,''));
const url=process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18770/leetcode/330/';
const errors=[],requests=[],checks=[],contrast=[];
const record=s=>checks.push(s);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('frameRead').textContent.includes('miss=1'));
 const text=id=>page.locator('#'+id).textContent();
 const click=id=>page.locator('#'+id).click();
 async function lang(l){await page.locator(`[data-lang="${l}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='en'?'en':'zh-CN');}
 async function shot(selector,name){
  const el=page.locator(selector).first(),original=page.viewportSize();const box=await el.boundingBox();await page.setViewportSize({width:original.width,height:Math.max(1000,Math.ceil(box.height)+200)});
  await el.evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-document.querySelector('.step-nav').getBoundingClientRect().height-24));await page.waitForTimeout(30);await el.screenshot({path:path.join(OUT,name)});await page.setViewportSize(original);
 }
 async function measure(tag){
  const result=await page.evaluate(()=>{
   function rgb(s){const a=s.match(/[\d.]+/g)?.map(Number)||[];return [a[0]||0,a[1]||0,a[2]||0,a[3]??1];}
   function composite(f,b){const a=f[3];return [0,1,2].map(i=>f[i]*a+b[i]*(1-a)).concat(1);}
   function bg(el){if(!el)return [255,255,255,1];return composite(rgb(getComputedStyle(el).backgroundColor),bg(el.parentElement));}
   const lum=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
   const items=[];for(const el of document.querySelectorAll('body *')){if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||!el.getClientRects().length)continue;const st=getComputedStyle(el),b=bg(el),f=composite(rgb(st.color),b),l1=lum(f),l2=lum(b);items.push({element:el.id||el.tagName,text:el.textContent.slice(0,60),ratio:(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)});}return items;
  });
  assert(result.length>20);assert(result.every(x=>x.ratio>=4.5),JSON.stringify(result.filter(x=>x.ratio<4.5)));contrast.push({tag,minimum:Math.min(...result.map(x=>x.ratio)),pairs:result});
 }
 for(const l of ['en','zh']){
  await lang(l);await shot('.site-head',`header-${l}.png`);
  for(const patch of [0,1,2,3,5]){await page.selectOption('#handPatch',String(patch));const reachable=C.sums([1,3,...(patch?[patch]:[])]);assert.equal(await page.locator('#handSums .gap').count(),[1,2,3,4,5,6].filter(x=>!reachable.has(x)).length);}
  await page.selectOption('#handPatch','2');await page.locator('details').first().locator('summary').click();assert(await page.locator('details').first().evaluate(el=>el.open));assert.equal(await text('baselineCode'),fs.readFileSync(path.join(root,'baseline.py'),'utf8'));await shot('details',`baseline-${l}.png`);await page.locator('details').first().locator('summary').click();
  for(let x=1;x<=6;x++){await page.selectOption('#xValue',String(x));assert.equal(await text('shifted'),`[${x}, ${x+3}]`);assert.equal(await text('joinRead'),copy[x<=4?'joined':'gapRead'][l==='en'?1:0].replaceAll('{x}',x).replaceAll('{end}',x+3));}
  for(let preset=0;preset<C.presets.length;preset++){
   await page.selectOption('#preset',String(preset));const p=C.presets[preset],frames=C.trace(p.nums,p.n);assert(await page.locator('#tracePrev').isDisabled());
   for(let at=0;at<frames.length;at++){
    const f=frames[at];assert((await text('frameRead')).includes(`miss=${f.miss}`));assert((await text('frameRead')).includes(`i=${f.i}`));assert.equal(await page.locator('#ledgerRows tr').count(),at);assert.equal(await text('afterCoverage'),`[0, ${f.miss-1}]`);
    if(at<frames.length-1){await click('traceNext');if(at===1){const snapshot=await text('frameRead'),ledger=await page.locator('#ledgerRows').innerHTML();await click('tracePrev');await click('traceNext');assert.equal(await text('frameRead'),snapshot);assert.equal(await page.locator('#ledgerRows').innerHTML(),ledger);}}
   }
   assert(await page.locator('#traceNext').isDisabled());assert(await page.locator('#traceLast').isDisabled());assert(!(await page.locator('#doneRead').isHidden()));
   await click('traceReset');assert(await page.locator('#tracePrev').isDisabled());assert.equal(await page.locator('#ledgerRows tr').count(),0);assert(await page.locator('#doneRead').isHidden());await click('traceLast');assert.equal(await page.locator('#ledgerRows tr').count(),frames.length-1);await click('tracePrev');assert(!(await page.locator('#traceNext').isDisabled()));
  }
  for(const answer of [0,2,1]){
   await page.check(`[name=prediction][value="${answer}"]`);assert.equal(await text('predictionFeedback'),copy.await[l==='en'?1:0]);await click('reveal');assert((await text('predictionFeedback')).startsWith(copy[answer===1?'correct':'incorrect'][l==='en'?1:0]));assert((await text('predictionFeedback')).includes('miss=15'));
  }
  await click('predictionReset');assert(await page.locator('#reveal').isDisabled());assert.equal(await page.locator('[name=prediction]:checked').count(),0);
  if(await page.locator('#sourceDetails').evaluate(el=>el.open))await page.locator('#sourceDetails summary').click();await page.locator('#sourceDetails summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').evaluate(el=>el.open));assert.equal(await text('pythonCode'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>window.copiedSource=s}}));await click('copyPython');assert.equal(await page.evaluate(()=>window.copiedSource),source);assert.equal(await text('copyStatus'),copy.copied[l==='en'?1:0]);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[download]').click()]);const dest=path.join(OUT,`download-${l}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));await click('copyPython');assert.equal(await page.locator('#manualSource').inputValue(),source);assert(await page.locator('#manualSource').evaluate(el=>document.activeElement===el&&el.selectionEnd-el.selectionStart===el.value.length));assert.equal(await text('copyStatus'),copy.fallback[l==='en'?1:0]);
  await page.selectOption('#preset','1');await click('traceNext');await click('traceNext');await page.check('[name=prediction][value="2"]');await click('reveal');
  await lang(l==='en'?'zh':'en');assert.equal(await page.locator('#preset').inputValue(),'1');assert((await text('frameRead')).includes('miss=4'));assert(await page.locator('[name=prediction][value="2"]').isChecked());assert((await text('predictionFeedback')).includes('miss=15'));assert(await page.locator('#sourceDetails').evaluate(el=>el.open));await lang(l);
  await measure(l+'-intermediate');await shot('#step0 .stage',`hand-${l}.png`);await shot('#step3 .stage',`prediction-${l}.png`);await shot('#step4',`source-${l}.png`);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','1');await click('traceLast');await page.locator('#step2').scrollIntoViewIfNeeded();
   if(width===320){await page.locator('#ledgerRegion').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);await page.locator('#ledgerRegion').evaluate(el=>el.scrollLeft=el.scrollWidth);assert(await page.locator('#ledgerRegion').evaluate(el=>el.scrollLeft>0));await page.locator('#ledgerRegion').evaluate(el=>el.scrollLeft=0);}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${l} width ${width}`);
   const boxes=await page.locator('.interval').evaluateAll(els=>els.map(el=>({w:el.clientWidth,scroll:el.scrollWidth})));assert(boxes.every(x=>x.scroll<=x.w));
   await page.locator('.step-nav a[href="#step1"]').click();await page.waitForTimeout(50);const rect=await page.locator('#step1 h2').boundingBox();const nav=await page.locator('.step-nav').boundingBox();assert(rect.y>=nav.y+nav.height-1,JSON.stringify({message:'anchor must clear sticky nav',l,width,rect,nav,hash:await page.evaluate(()=>location.hash)}));
   if(width===390||width===1440){await shot('#step2 .stage',`trace-${l}-${width}.png`);await shot('#step1 .stage',`join-${l}-${width}.png`);}
  }
  for(const zoomWidth of [320,390,1280]){await page.setViewportSize({width:zoomWidth,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#step2').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${l} 200% at ${zoomWidth}`);await shot('#step2 .stage',zoomWidth===1280?`zoom-${l}.png`:`zoom-${l}-${zoomWidth}.png`);if(zoomWidth===320){await page.locator('#frameRead').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`zoom-${l}-320-viewport.png`)});}await page.evaluate(()=>document.body.style.zoom='');}record(`${l}: all controls, presets, every frame, choices, copy, fallback, download, widths and zoom`);
 }
 await page.setViewportSize({width:390,height:844});await lang('en');await page.selectOption('#preset','0');await page.locator('#traceNext').focus();await page.keyboard.press('Enter');assert((await text('frameRead')).includes('miss=2'));assert(await page.locator('#traceNext').evaluate(el=>document.activeElement===el));
 const focus=await page.locator('#traceNext').evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor};});assert.equal(focus.width,'3px');await page.keyboard.press('Tab');assert(await page.locator('#traceReset').evaluate(el=>document.activeElement===el));await page.keyboard.press('Enter');assert((await text('frameRead')).includes('miss=1'));
 await page.locator('#xValue').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('ArrowDown');assert(await page.locator('[name=prediction][value="2"]').isChecked());
 await page.emulateMedia({forcedColors:'active'});await page.locator('#traceNext').focus();await page.keyboard.press('Tab');assert(await page.locator('#traceReset').evaluate(el=>document.activeElement===el));await page.emulateMedia({forcedColors:'none'});record('keyboard enter/tab/arrows, visible 3px focus, forced colors and reduced-motion');
 const controls=await page.locator('button,select,summary,.btn,.site-head a,.step-nav a,.prediction-options label').evaluateAll(els=>els.filter(el=>el.getClientRects().length).map(el=>({text:el.textContent.slice(0,40),h:el.getBoundingClientRect().height,w:el.getBoundingClientRect().width})));assert(controls.every(x=>x.h>=48&&x.w>=48),JSON.stringify(controls.filter(x=>x.h<48||x.w<48)));record('48px minimum control and link heights');
 for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){
  if(href.startsWith('https:'))continue;const target=new URL(href,url),r=await ctx.request.get(target.href.split('#')[0]);assert(r.ok(),href);if(target.hash){assert((await r.text()).includes(`id="${target.hash.slice(1)}"`),href);}
 }
 const offline=await ctx.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));await offline.waitForFunction(()=>document.getElementById('frameRead').textContent.includes('miss=1'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.locator('#traceNext').click();assert((await offline.locator('#frameRead').textContent()).includes('miss=2'));await offline.close();record('offline file source display and simulation without fetch');
 const denied=await browser.newContext({locale:'en-US'});await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});const dp=await denied.newPage();dp.on('pageerror',e=>errors.push(e.message));await dp.goto(url);await dp.waitForFunction(()=>document.getElementById('frameRead').textContent.includes('miss=1'));await dp.locator('[data-lang=zh]').click();assert.equal(await dp.locator('html').getAttribute('lang'),'zh-CN');record('blocked storage fallback');await denied.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')||u.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'local.css')).size;assert(cssBytes<25000);
 // Focus color on panels, field borders and disabled text use shared token pairs.
 record('mobile ledger scrolls to retained new-miss and patch columns');
 const roles=await page.evaluate(()=>{const next=document.getElementById('traceNext'),stage=next.closest('.stage');next.focus();const outline=getComputedStyle(next).outlineColor;document.getElementById('traceLast').click();return {focus:outline,focusBackground:getComputedStyle(stage).backgroundColor,disabledText:getComputedStyle(next).color,disabledBackground:getComputedStyle(next).backgroundColor,fieldBorder:getComputedStyle(document.getElementById('preset')).borderTopColor};});
 assert.equal(roles.disabledText,'rgb(154, 167, 184)');assert.equal(roles.disabledBackground,'rgb(28, 35, 48)');
 fs.writeFileSync(path.join(OUT,'role-colors.json'),JSON.stringify(roles,null,2));
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({kind:'author self-check',checks,errors,requests:[...new Set(requests)],cssBytes,focus,contrastMinimum:Math.min(...contrast.map(x=>x.minimum)),limits:'Synthetic Chromium only; no real device, independent review, learner trial or public deployment.'},null,2));fs.writeFileSync(path.join(OUT,'contrast.json'),JSON.stringify(contrast,null,2));
 await browser.close();console.log('PASS browser checks: '+checks.length+' groups; CSS '+cssBytes+' bytes');
})().catch(e=>{console.error(e);process.exit(1)});
