'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const P=path.resolve(__dirname,'..'),OUT=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const SOURCE=fs.readFileSync(path.join(P,'solution.py'),'utf8'),meta=JSON.parse(fs.readFileSync(path.join(P,'lesson-entry.json'))),base='http://127.0.0.1:18770',url=base+'/leetcode/847/';
function luminance(rgb){let a=rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(luminance([0,0,0]),0);assert.equal(luminance([255,255,255]),1);assert.equal(contrast([0,0,0],[255,255,255]),21);
assert.equal(luminance([255,0,0]),.2126);assert.equal(luminance([0,255,0]),.7152);assert.equal(luminance([0,0,255]),.0722);assert(Math.abs(contrast([116,116,116],[0,0,0])-4.492948)<.000001);assert(contrast([116,116,116],[0,0,0])<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const page=await ctx.newPage();
 const errors=[],network=[],semantics=[],shots=[],fits=[],colors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>network.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('frameRead').textContent.includes('0'));
 const text=id=>page.locator('#'+id).textContent();
 async function lang(l){await page.locator('[data-lang='+l+']').click();assert.equal(await page.locator('h1').textContent(),'#847 · '+meta.title[l]);assert.equal(await page.title(),'#847 · '+meta.title[l]);}
 async function capture(name,selector){await page.locator(selector).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,name),fullPage:false});shots.push(name);}
 for(const l of ['en','zh']){
  await lang(l);
  await page.locator('#handReset').click();assert(await page.locator('#undo').isDisabled());
  for(const v of [0,2,0,3])await page.locator('#move'+v).click();assert((await text('handHistory')).includes('1 → 0 → 2 → 0 → 3'));assert((await text('handRead')).includes('4'));
  const hand=await text('handRead');await page.locator('#undo').click();assert(!(await text('handRead')).includes('{0, 1, 2, 3}'));await page.locator('#move3').click();assert.equal(await text('handRead'),hand);
  semantics.push({locale:l,action:'manual cover and undo/replay',observed:hand});await capture('hand-'+l+'.png','#handGraph');
  for(let p=0;p<5;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());let steps=0;
   while(!await page.locator('#next').isDisabled()){
    const before=await text('frameRead');await page.locator('#next').click();const after=await page.locator('#states').textContent();
    await page.locator('#prev').click();assert.equal(await text('frameRead'),before);await page.locator('#next').click();assert.equal(await page.locator('#states').textContent(),after);steps++;
   }
   assert.equal(steps,[4,4,0,2,2][p]);assert((await text('frameRead')).includes(l==='zh'?'最短覆盖长度 = '+steps:'Shortest covering length = '+steps));assert(await page.locator('#end').isDisabled());
   semantics.push({locale:l,preset:p,action:'all layers, back/replay and endpoint',observed:await text('frameRead')});
   const final=await text('frameRead');await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());if(steps)await page.locator('#end').click();else assert(await page.locator('#end').isDisabled());assert.equal(await text('frameRead'),final);
  }
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());
  for(const option of [0,1,2]){
   await page.locator('[name=prediction][value="'+option+'"]').check();assert.equal(await text('feedback'),l==='en'?'Choose, then check; the answer stays hidden until then.':'先选择，再验证；答案在验证前隐藏。');
   await page.locator('#reveal').click();assert((await text('feedback')).includes(l==='en'?'From 2, take 2→3: 1 move.':'从 2 只走 2→3，需 1 步'));
   assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),option===1);
  }
  semantics.push({locale:l,action:'all predictions/reveal/change',observed:await text('feedback')});await capture('prediction-'+l+'.png','#feedback');
  await page.locator('#preset').selectOption('0');await page.locator('#next').click();const current=await text('frameRead');assert.equal(await page.locator('#states .state-card p').first().textContent(),l==='en'?'Endpoint u=1; mask=0011₂=3; set {0, 1}':'终点 u=1；mask=0011₂=3；集合 {0, 1}');
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  const other=l==='en'?'zh':'en';await lang(other);assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert((await text('feedback')).includes(other==='en'?'From 2':'从 2'));
  await lang(l);assert.equal(await text('frameRead'),current);
  const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('(u, mask, d) → (v, mask | (1 << v), d + 1)'));assert(formula.includes('full = (1 << n) − 1'));
  semantics.push({locale:l,action:'locale roundtrip after interactions',formula,frame:current,maskCause:await page.locator('#states .hint').first().textContent()});
  assert.equal(await text('pythonCode'),SOURCE);
  const download=page.waitForEvent('download');await page.locator('a[download]').click();const d=await download;assert.equal(fs.readFileSync(await d.path(),'utf8'),SOURCE);
  await page.locator('#copy').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),SOURCE);
  // Each fallback attempt has its own verified clipboard sentinel.
  for(let attempt=0;attempt<2;attempt++){
   const sentinel='847-'+l+'-'+attempt+'-'+Date.now();await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied for test'));});
   await page.locator('#copy').click();await page.locator('#manualSource').waitFor({state:'visible'});assert.equal(await page.locator('#manualSource').inputValue(),SOURCE);
   assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),SOURCE);
   semantics.push({locale:l,action:'native fallback copy',attempt,sentinelVerified:true,host:process.platform,exactSource:true,observed:await text('copyStatus')});
   await page.evaluate(()=>{navigator.clipboard.writeText=window.originalWrite;});
  }
  await page.locator('#copy').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 }
 // Responsive dense state and closed select budget, both languages.
 for(const width of [320,390,736,1440])for(const l of ['zh','en']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('1');await page.locator('#next').click();await page.locator('#next').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const fit=await page.locator('#preset').evaluate(e=>{const c=getComputedStyle(e),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=c.font;return {label:e.selectedOptions[0].text,width:e.getBoundingClientRect().width,text:ctx.measureText(e.selectedOptions[0].text).width,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight),font:c.fontFamily};});
  assert(fit.text+fit.padding+24<=fit.width);fits.push({width,locale:l,...fit,arrowReserve:24});
  const geo=await page.locator('#states .state-card').first().evaluate(e=>({card:e.getBoundingClientRect().toJSON(),text:[...e.querySelectorAll('p')].map(p=>p.getBoundingClientRect().toJSON())}));assert(geo.text[0].bottom<=geo.text[1].top+1);
  if([320,390,1440].includes(width))await capture('trace-'+l+'-'+width+'.png','#traceGraph');
  if(width===320){await capture('states-'+l+'-320.png','#states .state-card:first-child');await page.locator('#sourceDetails').evaluate(e=>e.open=true);await capture('source-'+l+'-320.png','#sourceDetails');}
  if(width===1440){await page.evaluate(()=>document.body.style.zoom='2');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await capture('zoom200-'+l+'.png','#traceGraph');await page.evaluate(()=>document.body.style.zoom='');}
 }
 // Keyboard and focus; clicking nav must land below sticky navigation.
 await page.setViewportSize({width:390,height:900});await lang('en');await page.locator('.step-nav a[href="#step3"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(350);
 assert(await page.evaluate(()=>document.getElementById('step3').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-1));
 await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('ArrowDown');assert(await page.locator('[name=prediction][value="1"]').isChecked());await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert((await text('feedback')).includes('Correct prediction.'));
 const focus=await page.locator('#reveal').evaluate(e=>{const c=getComputedStyle(e);return {width:c.outlineWidth,color:c.outlineColor,offset:c.outlineOffset}});assert.equal(focus.width,'3px');assert.equal(focus.offset,'4px');
 await capture('keyboard-focus.png','#reveal');
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#reveal').focus();assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await capture('forced-colors.png','#reveal');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Rendered solid text pairs; explicitly scoped to text/background styles, not arbitrary effects.
 const pairs=await page.evaluate(()=>{
  const pairs=new Map();for(const e of document.querySelectorAll('body *')){
   if(!e.getClientRects().length||!Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim())||e.closest('svg')||['SCRIPT','STYLE','NOSCRIPT','OPTION'].includes(e.tagName))continue;
   const c=getComputedStyle(e);let p=e,bg;while(p){const x=getComputedStyle(p).backgroundColor;if(x!=='rgba(0, 0, 0, 0)'&&x!=='transparent'){bg=x;break;}p=p.parentElement;}if(bg)pairs.set(c.color+'|'+bg,{fg:c.color,bg,example:e.textContent.slice(0,60)});
  }return [...pairs.values()];
 });
 for(const p of pairs){const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);p.ratio=contrast(rgb(p.fg),rgb(p.bg));assert(p.ratio>=4.5,JSON.stringify(p));colors.push(p);}
 const focusRatio=contrast([255,180,84],[28,35,48]);assert(focusRatio>=3);
 // Related labels and actual destination explanation, in both locales.
 const related=[];
 for(const l of ['zh','en']){await lang(l);for(const a of await page.locator('.related a').all()){
  const href=await a.getAttribute('href'),label=await a.textContent();const target=await ctx.newPage();await target.goto(new URL(href,url).href);await target.waitForFunction(()=>document.querySelector('#step2 h2')?.textContent.length>0);
  const section=await target.locator('#step2').textContent();assert(section.includes(l==='en'?'layer':'层'));related.push({locale:l,label,url:target.url(),heading:await target.locator('#step2 h2').textContent(),excerpt:section.slice(0,1800)});await target.close();
 }}
 // Offline file + unavailable storage in a separate context, source requires no network.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('storage blocked')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('storage blocked')}});});const offline=await blocked.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(P,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),SOURCE);await offline.locator('[data-lang=zh]').click();await offline.locator('#next').click();assert((await offline.locator('#frameRead').textContent()).includes('d=1'));await blocked.close();
 const targets=await page.locator('button,select,.prediction-options label,.solution-actions a').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({id:e.id||e.tagName,height:e.getBoundingClientRect().height})));assert(targets.every(x=>x.height>=48));
 assert(!network.some(x=>/^https?:/.test(x)&&!x.startsWith(base)));assert.deepEqual(errors,[]);
 const cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(cssBytes<25000);
 const report={kind:'author browser self-check',browser:await browser.version(),host:os.platform(),url,errors,localRuntimeRequests:[...new Set(network)],semantics,fits,contrast:{calibration:true,solidTextPairs:colors,focusRatio},focus,cssBytes,targets,screenshots:shots,related,offlineStorageDenied:true,limits:['CSS zoom2 used for 200% zoom coverage; no physical device or OS browser-zoom test.','Headless Linux Chromium; no independent reviewer or novice study.']};
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({ok:true,screenshots:shots.length,semanticRecords:semantics.length,cssBytes}));
})().catch(e=>{console.error(e);process.exit(1)});
