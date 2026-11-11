'use strict';
// Real-Chromium checks for #1153. Needs a server running from the repository root at PREVIEW_ROOT
// (default http://127.0.0.1:18770) and Playwright via NODE_PATH. OUTPUT_DIR receives browser.json
// and screenshots (default tests/evidence).
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const BASE=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',URL=BASE+'/leetcode/1153/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const C=require('../core.js');
const results={host:process.platform,url:URL,checks:[],semantic:[],screenshots:[]};
const TITLES={zh:'#1153 · 字符串转化',en:'#1153 · String Transforms Into Another String'};
// Expected verdicts come from the BFS-checked solution rule, restated here independently.
const EXPECT=[true,true,false,false,true,false,true,false,true];
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
 const cur=async()=>(await page.locator('#sbStrip tr:first-child td').allTextContents()).join('');
 for(const l of ['en','zh']){
  await lang(l);
  // Sandbox: wrong order gets stuck, undo restores, right order finishes; swap needs a spare.
  await page.locator('#sbPreset').selectOption('0');assert(await page.locator('#sbUndo').isDisabled());
  await page.locator('#sbFrom').selectOption('a');await page.locator('#sbTo').selectOption('b');await page.locator('#sbApply').click();
  assert.equal(await cur(),'bbbc');const stuck=await page.locator('#sbRead').textContent();assert(stuck.includes(l==='en'?'merged':'合并'));
  await page.locator('#sbUndo').click();assert.equal(await cur(),'abbc');assert(await page.locator('#sbUndo').isDisabled());
  for(const [f,to] of [['c','d'],['b','c'],['a','b']]){await page.locator('#sbFrom').selectOption(f);await page.locator('#sbTo').selectOption(to);await page.locator('#sbApply').click();}
  assert.equal(await cur(),'bccd');assert(await page.locator('#sbApply').isDisabled());assert.equal(await page.locator('#sbHistory li').count(),3);
  await page.locator('#sbPreset').selectOption('1');assert.equal(await page.locator('#sbHistory li').count(),0);
  for(const [f,to] of [['a','c'],['b','a'],['c','b']]){await page.locator('#sbFrom').selectOption(f);await page.locator('#sbTo').selectOption(to);await page.locator('#sbApply').click();}
  assert.equal(await cur(),'baba');await page.locator('#sbReset').click();assert.equal(await cur(),'abab');
  // Trace: every preset, every frame forward/back/forward identical; verdict matches.
  for(let p=0;p<C.presets.length;p++){
   await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());
   assert.equal(await page.locator('#in1').inputValue(),C.presets[p].s);
   let n=0;
   while(await page.locator('#next').isEnabled()){
    const before=await page.locator('#step6 .stage').textContent();await page.locator('#next').click();n++;
    const after=await page.locator('#step6 .stage').textContent();
    await page.locator('#prev').click();assert.equal(await page.locator('#step6 .stage').textContent(),before);
    await page.locator('#next').click();assert.equal(await page.locator('#step6 .stage').textContent(),after);
   }
   const fr=await page.locator('#frameRead').textContent();assert(fr.includes(EXPECT[p]?'True':'False'),p+fr);
   assert.equal(n,C.trace(C.presets[p].s,C.presets[p].t,C.presets[p].alphabet).length-1);
   if(EXPECT[p]&&C.presets[p].s!==C.presets[p].t){const now=(await page.locator('#strip tr:last-child td').allTextContents()).join('');assert.equal(now,C.presets[p].t);}
   results.semantic.push({locale:l,preset:p,frames:n,verdict:fr,event:await page.locator('#eventRead').textContent()});
  }
  // Custom input + validation errors (state preserved on error).
  await page.locator('#in1').fill('abc');await page.locator('#in2').fill('ab');await page.locator('#run').click();
  assert((await page.locator('#restart').textContent()).includes('3'));assert.equal(await page.locator('#preset').inputValue(),'8');
  await page.locator('#in2').fill('aBc');await page.locator('#run').click();assert((await page.locator('#restart').textContent()).includes('B'));
  await page.locator('#alphabet').selectOption('ab');await page.locator('#in1').fill('ab');await page.locator('#in2').fill('ba');await page.locator('#in2').press('Enter');
  assert.equal(await page.locator('#preset').inputValue(),'custom');await page.locator('#end').click();assert((await page.locator('#frameRead').textContent()).includes('False'));
  await page.locator('#alphabet').selectOption('abc');await page.locator('#run').click();await page.locator('#end').click();assert((await page.locator('#frameRead').textContent()).includes('True'));
  // Prediction.
  await page.locator('#predictReset').click().catch(()=>{});assert(await page.locator('#reveal').isDisabled());
  for(const choice of [0,1,2]){await page.locator(`[name="prediction"][value="${choice}"]`).check();assert(!(await page.locator('#feedback').textContent()).includes('25'));
   await page.locator('#reveal').click();const fb=await page.locator('#feedback').textContent();assert(fb.includes('25'));results.semantic.push({locale:l,choice,feedback:fb});}
  assert.equal(await page.locator('#sourceCode').textContent(),source);
  await page.locator('#copySource').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  results.checks.push(l+': sandbox stuck/undo/chain/spare; all 9 presets every frame back/replay + final string; custom input and errors; toy alphabets; predictions; exact source/copy/download');
 }
 // Locale switch preserves trace position, sandbox, inputs, prediction.
 await page.locator('#preset').selectOption('1');for(let i=0;i<5;i++)await page.locator('#next').click();
 await page.locator('#sbFrom').selectOption('a');await page.locator('#sbTo').selectOption('z');await page.locator('#sbApply').click();
 const keep=[await page.locator('#frameRead').textContent().then(s=>s.match(/\d+/g).join(',')),await cur(),await page.locator('#in1').inputValue()];
 await lang('en');await lang('zh');
 assert.deepStrictEqual([await page.locator('#frameRead').textContent().then(s=>s.match(/\d+/g).join(',')),await cur(),await page.locator('#in1').inputValue()],keep);
 assert(await page.locator('[name="prediction"][value="2"]').isChecked());
 // Error message relocalizes without restarting.
 await page.locator('#in2').fill('x');await page.locator('#run').click();const zhErr=await page.locator('#restart').textContent();await lang('en');assert.notEqual(await page.locator('#restart').textContent(),zhErr);assert((await page.locator('#restart').textContent()).includes('differ'));
 await page.locator('#preset').selectOption('0');
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(()=>{if(window.realWriteText)navigator.clipboard.writeText=window.realWriteText;});
  const sentinel='1153-sentinel-'+l;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.realWriteText=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied by test'));});
  await page.locator('#copySource').click();assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  const sel=await page.locator('#manualSource').evaluate(e=>({f:document.activeElement===e,s:e.selectionStart,e:e.selectionEnd}));assert(sel.f&&sel.s===0&&sel.e===source.length);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>{navigator.clipboard.writeText=window.realWriteText;});await page.locator('#copySource').click();await page.locator('#sourceFallback').waitFor({state:'hidden'});
 }
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#frameRead').textContent()).includes('1'));
 await page.locator('.related a[href="#step4"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(200);assert.equal(new globalThis.URL(page.url()).hash,'#step4');
 for(const width of [320,390,1280])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('7');await page.locator('#end').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+l);
  const small=await page.evaluate(()=>[...document.querySelectorAll('button,select,input,.step-nav a,.related a,summary,a.btn,.official-link,.back-link')].filter(e=>e.getClientRects().length&&e.type!=='radio'&&e.getBoundingClientRect().height<47.5).map(e=>e.id||e.textContent));
  assert.deepStrictEqual(small,[]);
  let f=`trace-full-${l}-${width}.png`;await page.locator('#step6 .stage').screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);
  await page.locator('#preset').selectOption('1');for(let i=0;i<6;i++)await page.locator('#next').click();
  f=`trace-spare-${l}-${width}.png`;await page.locator('#step6 .stage').screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);
  for(const [sel,name] of [['#step1 .stage','sandbox'],['#step7 .stage','prediction']]){f=`${name}-${l}-${width}.png`;await page.locator(sel).screenshot({path:path.join(OUT,f),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(f);}
 }
 await page.setViewportSize({width:1280,height:1000});
 for(const l of ['en','zh']){await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step6 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const f=`zoom200-${l}.png`;await page.screenshot({path:path.join(OUT,f)});results.screenshots.push(f);await page.evaluate(()=>document.documentElement.style.zoom='');}
 const pairs=await page.evaluate(()=>{const parse=s=>s.match(/[\d.]+/g).map(Number),over=(a,b)=>{const al=a[3]??1;return [0,1,2].map(i=>a[i]*al+b[i]*(1-al)).concat(1);};const data=[];
  for(const el of document.querySelectorAll('h1,h2,h3,p,li,a,button,label,legend,summary,select,textarea,code,td,th,caption,input[type=text]')){if(!el.getClientRects().length||!(el.textContent.trim()||el.value))continue;const c=getComputedStyle(el),chain=[];let n=el;while(n){chain.push(n);n=n.parentElement;}let bg=[13,17,23,1];for(const p of chain.reverse())bg=over(parse(getComputedStyle(p).backgroundColor),bg);data.push({tag:el.tagName,text:(el.textContent||el.value).slice(0,40),fg:parse(c.color).slice(0,3),bg:bg.slice(0,3)});}return data;});
 const measured=pairs.map(p=>({...p,ratio:contrast(p.fg,p.bg)}));for(const p of measured)assert(p.ratio>=4.5,JSON.stringify(p));results.contrastMin=Math.min(...measured.map(p=>p.ratio));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.deepStrictEqual(errors,[]);assert(requests.every(u=>u.startsWith(BASE)||u.startsWith('data:')));
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});const p2=await blocked.newPage();const e2=[];p2.on('pageerror',e=>e2.push(String(e)));await p2.goto(URL);await p2.locator('[data-lang="zh"]').click();assert.equal(await p2.locator('h1').textContent(),TITLES.zh);assert.deepStrictEqual(e2,[]);await blocked.close();
 const offline=await browser.newContext();const p3=await offline.newPage();await p3.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await p3.locator('#sourceCode').textContent(),source);await offline.close();
 results.checks.push('locale roundtrip preserves state and relocalizes input errors; native fallback copy per locale with fresh sentinel; keyboard; 320/390/1280 both locales no overflow, targets >=48px; 200% zoom; contrast >=4.5; reduced motion; storage blocked; file://; no console/network errors');
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify({checks:results.checks,contrastMin:results.contrastMin,screenshots:results.screenshots.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
