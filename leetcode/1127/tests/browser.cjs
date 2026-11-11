'use strict';
// Real-Chromium checks for #1127. Needs a server already running at PREVIEW_ROOT (default
// http://127.0.0.1:18770) from the repository root, and Playwright via NODE_PATH.
// OUTPUT_DIR receives browser.json and screenshots (default tests/evidence).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',URL=BASE+'/leetcode/1127/';
const source=fs.readFileSync(path.join(__dirname,'../solution.sql'),'utf8');
const C=require('../core.js');
const results={host:process.platform,url:URL,checks:[],semantic:[],screenshots:[]};
const TITLES={zh:'#1127 · 用户购买平台',en:'#1127 · User Purchase Platform'};
function luminance(c){const a=c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(contrast([0,0,0],[255,255,255]),21);assert(Math.abs(contrast([116,116,116],[0,0,0])-4.492948073111701)<1e-10);
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(URL);await page.locator('#frameRead').filter({hasText:/0/}).waitFor();
 async function lang(l){await page.locator(`[data-lang="${l}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');assert.equal(await page.locator('h1').textContent(),TITLES[l]);assert.equal(await page.title(),TITLES[l]);}
 for(const l of ['en','zh']){
  await lang(l);
  // Step 1 hand stepper: endpoints, fill-in, the zero row appears only at the end.
  await page.locator('#handReset').click().catch(()=>{});assert(await page.locator('#handPrev').isDisabled());
  assert.equal(await page.locator('#handAnswer tr:last-child td:nth-child(3)').textContent(),'?');
  for(let i=0;i<5;i++)await page.locator('#handNext').click();
  assert.equal(await page.locator('#handAnswer tr:last-child td:nth-child(3)').textContent(),'?');
  await page.locator('#handNext').click();assert(await page.locator('#handNext').isDisabled());
  assert.equal(await page.locator('#handAnswer tr:last-child td:nth-child(3)').textContent(),'0');
  assert.equal(await page.locator('#handAnswer tr:nth-child(3) td:nth-child(3)').textContent(),'65');
  assert.equal(await page.locator('#handLedger li').count(),5);
  await page.locator('#handPrev').click();assert.equal(await page.locator('#handAnswer tr:last-child td:nth-child(3)').textContent(),'?');
  // Step 2: naive vs right; step 4 COUNT(*) column shows the wrong 1 on the empty cell.
  assert.equal(await page.locator('#naiveBody .missing-row').count(),2);
  assert.equal(await page.locator('#naiveBody tr:nth-child(2) td:nth-child(3)').textContent(),'70');
  assert((await page.locator('#joinBody tr:last-child').textContent()).includes('1'));
  // Step 5: every preset, every frame: forward, back, forward reproduces the exact frame.
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());
   const rows=C.rowsFrom(C.presets[p].on),expected=C.result(rows),frames=C.trace(rows);let n=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#step5 .stage').textContent();await page.locator('#next').click();n++;
    const after=await page.locator('#step5 .stage').textContent();
    await page.locator('#prev').click();assert.equal(await page.locator('#step5 .stage').textContent(),before);
    await page.locator('#next').click();assert.equal(await page.locator('#step5 .stage').textContent(),after);
   }
   assert.equal(n,frames.length-1);
   const out=await page.locator('#outBody tr').evaluateAll(trs=>trs.map(tr=>[...tr.children].map(td=>td.textContent)));
   if(expected.length)assert.deepStrictEqual(out.map(r=>[r[2],Number(r[3]),Number(r[4])]),expected.map(e=>[e.platform,e.total_amount,e.total_users]));
   else assert.equal(out.length,1);
   assert(await page.locator('#end').isDisabled());results.semantic.push({locale:l,preset:p,frames:n,output:out.map(r=>r.slice(1).join(' '))});
   if(n>0){await page.locator('#traceReset').click();assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert(await page.locator('#next').isDisabled());}else{// one-frame trace (empty table): every trace control must be disabled, not merely skipped
    for(const id of ['prev','next','traceReset','end'])assert(await page.locator('#'+id).isDisabled(),id+' enabled on a one-frame trace');}
  }
  // Toggle: removing user 1's desktop purchase restarts and moves money from both to mobile.
  await page.locator('#preset').selectOption('0');await page.locator('#end').click();
  await page.locator('[data-key="2024-03-01|1|desktop"]').click();
  assert((await page.locator('#restart').textContent()).length>0);assert(await page.locator('#prev').isDisabled());
  assert.equal(await page.locator('#preset').inputValue(),'custom');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.key),'2024-03-01|1|desktop');
  await page.locator('#end').click();
  const edited=await page.locator('#outBody tr').evaluateAll(trs=>trs.slice(0,3).map(tr=>tr.children[3].textContent+'/'+tr.children[4].textContent));
  assert.deepStrictEqual(edited,['50/1','70/2','0/0']);
  for(const u of [2,3])await page.locator(`[data-key="2024-03-02|${u}|${u===2?'desktop':'mobile'}"]`).click();
  await page.locator('#end').click();assert.equal(await page.locator('#outBody tr').count(),3);
  await page.locator('#preset').selectOption('0');
  // Prediction: hidden until reveal; changing choice clears; each option explained.
  await page.locator('#predictReset').click().catch(()=>{});assert(await page.locator('#reveal').isDisabled());
  for(const choice of [0,1,2]){
   await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('66'));
   await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();assert(fb.includes('66'));results.semantic.push({locale:l,choice,feedback:fb});
  }
  assert.equal(await page.locator('#sourceCode').textContent(),source);
  await page.locator('#copySource').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  results.checks.push(l+': hand stepper endpoints; naive/COUNT(*) contrasts; all presets every frame back/replay; toggle restart + focus; empty day; predictions; exact source/copy/download');
 }
 // Locale switch preserves trace position, hand progress, toggles and prediction.
 await page.locator('#preset').selectOption('3');for(let i=0;i<4;i++)await page.locator('#next').click();await page.locator('#handNext').click();
 const keep=await page.evaluate(()=>[document.getElementById('frameRead').textContent.match(/\d+/g).join(','),document.getElementById('handLedger').children.length]);
 await lang('en');await lang('zh');
 assert.deepStrictEqual(await page.evaluate(()=>[document.getElementById('frameRead').textContent.match(/\d+/g).join(','),document.getElementById('handLedger').children.length]),keep);
 assert(await page.locator('[name="prediction"][value="2"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('66'));
 // Manual fallback: fresh sentinel each locale, denied write, real OS copy shortcut.
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>{if(window.realWriteText)navigator.clipboard.writeText=window.realWriteText;});
  const sentinel='1127-sentinel-'+l;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.realWriteText=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied by test'));});
  await page.locator('#copySource').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  const sel=await page.locator('#manualSource').evaluate(e=>({f:document.activeElement===e,s:e.selectionStart,e:e.selectionEnd}));assert(sel.f&&sel.s===0&&sel.e===source.length);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>{navigator.clipboard.writeText=window.realWriteText;});await page.locator('#copySource').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 }
 // Keyboard operation and anchors.
 await page.locator('#preset').selectOption('0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#frameRead').textContent()).includes('1'));
 await page.locator('[data-key="2024-03-02|1|mobile"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-key="2024-03-02|1|mobile"]').getAttribute('aria-pressed'),'true');
 await page.locator('.related a[href="#step4"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(200);assert.equal(new globalThis.URL(page.url()).hash,'#step4');
 // Layouts.
 for(const width of [320,390,1280])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('0');for(let i=0;i<9;i++)await page.locator('#next').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+l);
  const small=await page.evaluate(()=>[...document.querySelectorAll('button,select,.step-nav a,.related a,summary,a.btn,.official-link,.back-link')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<47.5).map(e=>e.id||e.textContent));
  assert.deepStrictEqual(small,[]);
  for(const [sel,name] of [['#step1 .stage','hand'],['#step4 .table-wrap','join'],['#step5 .stage','trace'],['#step6 .stage','prediction']]){
   const f=`${name}-${l}-${width}.png`;await page.locator(sel).first().screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);}
 }
 await page.setViewportSize({width:1280,height:1000});
 for(const l of ['en','zh']){await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step5 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const f=`zoom200-${l}.png`;await page.screenshot({path:path.join(OUT,f)});results.screenshots.push(f);await page.evaluate(()=>document.documentElement.style.zoom='');}
 // Contrast of rendered text.
 const pairs=await page.evaluate(()=>{const parse=s=>s.match(/[\d.]+/g).map(Number),over=(a,b)=>{const al=a[3]??1;return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)).concat(1);};const data=[];
  for(const el of document.querySelectorAll('h1,h2,h3,p,li,a,button,label,legend,summary,select,textarea,code,td,th,caption')){if(!el.getClientRects().length||!el.textContent.trim())continue;const c=getComputedStyle(el),chain=[];let n=el;while(n){chain.push(n);n=n.parentElement;}let bg=[13,17,23,1];for(const p of chain.reverse())bg=over(parse(getComputedStyle(p).backgroundColor),bg);data.push({tag:el.tagName,text:el.textContent.slice(0,40),fg:parse(c.color).slice(0,3),bg:bg.slice(0,3)});}return data;});
 const measured=pairs.map(p=>({...p,ratio:contrast(p.fg,p.bg)}));for(const p of measured)assert(p.ratio>=4.5,JSON.stringify(p));results.contrastMin=Math.min(...measured.map(p=>p.ratio));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.deepStrictEqual(errors,[]);assert(requests.every(u=>u.startsWith(BASE)||u.startsWith('data:')));
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('[data-lang="zh"]').click();assert.equal(await p2.locator('h1').textContent(),TITLES.zh);assert.deepStrictEqual(e2,[]);await blocked.close();
 const offline=await browser.newContext();const p3=await offline.newPage();await p3.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await p3.locator('#sourceCode').textContent(),source);await offline.close();
 results.checks.push('locale roundtrip preserves state; native fallback copy per locale with fresh sentinel; keyboard trace/toggle/anchor; 320/390/1280 both locales no overflow, targets >=48px; 200% zoom; contrast >=4.5; reduced motion; storage blocked; file://; no console/network errors');
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({checks:results.checks,contrastMin:results.contrastMin,screenshots:results.screenshots.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
