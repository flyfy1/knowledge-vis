'use strict';
// Real-Chromium checks for #1183. Needs a server running from the repository root at PREVIEW_ROOT
// (default http://127.0.0.1:18770) and Playwright via NODE_PATH. OUTPUT_DIR receives browser.json
// and screenshots (default tests/evidence).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',URL=BASE+'/leetcode/1183/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const C=require('../core.js');
const results={host:process.platform,url:URL,checks:[],semantic:[],screenshots:[]};
const TITLES={zh:'#1183 · 矩阵中 1 的最大数量',en:'#1183 · Maximum Number of Ones'};
// Expected preset answers, from the exhaustive brute force in test_solution.py (independent of core).
const EXPECT=[12,6,4,12,16,0,1,63];
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
 const num=async sel=>Number((await page.locator(sel).textContent()).match(/[:：]\s*(\d+)/)[1]);
 for(const l of ['en','zh']){
  await lang(l);
  // Sandbox: overfull detection, greedy 10, the column layout 12 is valid.
  if(await page.locator('#sbClear').isEnabled())await page.locator('#sbClear').click();
  for(const c of ['0,0','0,1','1,0'])await page.locator(`[data-cell="${c}"]`).click();
  assert.equal(await page.locator('#sandbox .over').count(),4);assert(await page.locator('#sbRead').evaluate(e=>e.classList.contains('bad')));
  await page.locator('[data-cell="1,0"]').click();assert.equal(await page.locator('#sandbox .over').count(),0);
  await page.locator('#sbGreedy').click();assert.equal(await num('#sbRead'),10);
  await page.locator('#sbClear').click();for(let r=0;r<4;r++)for(const c of [0,2,4])await page.locator(`[data-cell="${r},${c}"]`).click();
  assert.equal(await num('#sbRead'),12);assert.equal(await page.locator('#sandbox .over').count(),0);
  // Explorer: every window position shows A B C D exactly once; filling A gives exactly 1 per window.
  while(await page.locator('#exUp').isEnabled())await page.locator('#exUp').click();
  while(await page.locator('#exLeft').isEnabled())await page.locator('#exLeft').click();
  await page.locator('#exFill').click();
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){
   const txt=await page.locator('#exRead').textContent();assert(txt.includes('A B C D'),txt);assert(/[:：]\s*1[。.]$/.test(txt.trim()),txt);
   if(c<3)await page.locator('#exRight').click();
   else{for(let i=0;i<3;i++)await page.locator('#exLeft').click();if(r<2)await page.locator('#exDown').click();}
  }
  await page.locator('#exFill').click();
  // Trace: every preset every frame back/replay; final total = brute-force answer; window ≤ k.
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());let n=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#step6 .stage').textContent();await page.locator('#next').click();n++;
    const after=await page.locator('#step6 .stage').textContent();
    await page.locator('#prev').click();assert.equal(await page.locator('#step6 .stage').textContent(),before);
    await page.locator('#next').click();assert.equal(await page.locator('#step6 .stage').textContent(),after);
   }
   const fr=await page.locator('#frameRead').textContent();assert(fr.trim().endsWith(String(EXPECT[p])),fr);
   const pr=C.presets[p];assert.equal(await page.locator('#traceGrid .cell.one').count(),EXPECT[p]);
   const win=await page.locator('#twRead').textContent();assert(Number(win.match(/(\d+)/g)[2])===pr.k||pr.k===0,win);
   results.semantic.push({locale:l,preset:p,frames:n,final:fr,window:win});
  }
  // Steppers: clamp and restart.
  await page.locator('#preset').selectOption('4');await page.locator('#end').click();
  for(let i=0;i<4;i++)await page.locator('#dec-w').click();
  assert.equal(await page.locator('#val-w').textContent(),'2');assert.equal(await page.locator('#val-s').textContent(),'2');assert.equal(await page.locator('#val-k').textContent(),'4');
  assert((await page.locator('#restart').textContent()).length>0);assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#preset').inputValue(),'custom');
  await page.locator('#end').click();assert((await page.locator('#frameRead').textContent()).trim().endsWith(String(C.answer(2,6,2,4))));
  // Prediction.
  await page.locator('#predictReset').click().catch(()=>{});assert(await page.locator('#reveal').isDisabled());
  for(const choice of [0,1,2]){await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('6+4'));
   await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();assert(fb.includes('6+4=10')||fb.includes('6 + 4 = 10'));results.semantic.push({locale:l,choice,feedback:fb});}
  assert.equal(await page.locator('#sourceCode').textContent(),source);
  await page.locator('#copySource').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  results.checks.push(l+': sandbox overfull/greedy 10/columns 12; explorer all 12 window positions with class A filled; all 8 presets every frame back/replay + final ones; stepper clamp/restart; predictions; exact source/copy/download');
 }
 await page.locator('#preset').selectOption('3');for(let i=0;i<5;i++)await page.locator('#next').click();await page.locator('#exRight').click();
 const keep=[await page.locator('#frameRead').textContent().then(s=>s.match(/\d+/g).join(',')),await page.locator('#exRead').textContent().then(s=>s.match(/\d+/g).join(','))];
 await lang('en');await lang('zh');
 assert.deepStrictEqual([await page.locator('#frameRead').textContent().then(s=>s.match(/\d+/g).join(',')),await page.locator('#exRead').textContent().then(s=>s.match(/\d+/g).join(','))],keep);
 assert(await page.locator('[name="prediction"][value="2"]').isChecked());
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>{if(window.realWriteText)navigator.clipboard.writeText=window.realWriteText;});
  const sentinel='1183-sentinel-'+l;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.realWriteText=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied by test'));});
  await page.locator('#copySource').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  const sel=await page.locator('#manualSource').evaluate(e=>({f:document.activeElement===e,s:e.selectionStart,e:e.selectionEnd}));assert(sel.f&&sel.s===0&&sel.e===source.length);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>{navigator.clipboard.writeText=window.realWriteText;});await page.locator('#copySource').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 }
 // Keyboard: toggle a sandbox cell, stepper with focus retained, anchors.
 await page.locator('[data-cell="3,4"]').focus();const v0=await page.locator('[data-cell="3,4"]').getAttribute('aria-pressed');await page.keyboard.press('Enter');assert.notEqual(await page.locator('[data-cell="3,4"]').getAttribute('aria-pressed'),v0);assert.equal(await page.evaluate(()=>document.activeElement.dataset.cell),'3,4');
 await page.locator('#preset').selectOption('0');await page.locator('#inc-w').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#val-w').textContent(),'6');assert.equal(await page.evaluate(()=>document.activeElement.id),'inc-w');
 await page.locator('.related a[href="#step5"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(200);assert.equal(new globalThis.URL(page.url()).hash,'#step5');
 for(const width of [320,390,1280])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('3');await page.locator('#end').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+l);
  const small=await page.evaluate(()=>[...document.querySelectorAll('button,select,.step-nav a,.related a,summary,a.btn,.official-link,.back-link')].filter(e=>e.getClientRects().length&&(e.getBoundingClientRect().height<47.5||e.getBoundingClientRect().width<47.5)&&!e.closest('.lang-toggle')&&!e.closest('.step-nav')&&!e.closest('.related')&&e.tagName!=='A'&&e.tagName!=='SUMMARY').map(e=>e.id||e.dataset.cell||e.textContent));
  assert.deepStrictEqual(small,[]);
  const tall=await page.evaluate(()=>[...document.querySelectorAll('.step-nav a,.related a,summary,a.btn,.official-link,.back-link,.lang-toggle button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().height<47.5).map(e=>e.textContent));assert.deepStrictEqual(tall,[]);
  for(const [sel,name] of [['#step1 .stage','sandbox'],['#step3 .stage','explorer'],['#step5 .pair','weights'],['#step6 .stage','trace'],['#step7 .stage','prediction']]){const f=`${name}-${l}-${width}.png`;await page.locator(sel).screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);}
 }
 await page.setViewportSize({width:1280,height:1000});
 for(const l of ['en','zh']){await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step6 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const f=`zoom200-${l}.png`;await page.screenshot({path:path.join(OUT,f)});results.screenshots.push(f);await page.evaluate(()=>document.documentElement.style.zoom='');}
 const pairs=await page.evaluate(()=>{const parse=s=>s.match(/[\d.]+/g).map(Number),over=(a,b)=>{const al=a[3]??1;return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)).concat(1);};const data=[];
  for(const el of document.querySelectorAll('h1,h2,h3,p,li,a,button,label,legend,summary,select,textarea,code,td,th,caption,output,figcaption,.cell')){if(!el.getClientRects().length||!el.textContent.trim())continue;const c=getComputedStyle(el),chain=[];let n=el;while(n){chain.push(n);n=n.parentElement;}let bg=[13,17,23,1];for(const p of chain.reverse())bg=over(parse(getComputedStyle(p).backgroundColor),bg);data.push({tag:el.tagName,text:el.textContent.slice(0,40),fg:parse(c.color).slice(0,3),bg:bg.slice(0,3)});}return data;});
 const measured=pairs.map(p=>({...p,ratio:contrast(p.fg,p.bg)}));for(const p of measured)assert(p.ratio>=4.5,JSON.stringify(p));results.contrastMin=Math.min(...measured.map(p=>p.ratio));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.deepStrictEqual(errors,[]);assert(requests.every(u=>u.startsWith(BASE)||u.startsWith('data:')));
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('[data-lang="zh"]').click();assert.equal(await p2.locator('h1').textContent(),TITLES.zh);assert.deepStrictEqual(e2,[]);await blocked.close();
 const offline=await browser.newContext();const p3=await offline.newPage();await p3.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await p3.locator('#sourceCode').textContent(),source);await offline.close();
 results.checks.push('locale roundtrip preserves state; native fallback copy per locale with fresh sentinel; keyboard cell/stepper focus/anchor; 320/390/1280 both locales no overflow, controls >=48px; 200% zoom; contrast >=4.5 incl. grid cells; reduced motion; storage blocked; file://; no console/network errors');
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({checks:results.checks,contrastMin:results.contrastMin,screenshots:results.screenshots.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
