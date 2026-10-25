const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const P=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(OUT,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/793/',source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
const report={kind:'author browser self-check',host:os.platform(),screenshots:[],states:[],links:[],contrast:[],errors:[],requests:[]};
function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);}
function contrast(a,b){let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(lum([0,0,0]),0);assert.equal(lum([255,255,255]),1);assert.equal(contrast([255,255,255],[0,0,0]),21);
assert(Math.abs(lum([255,0,0])-.2126)<1e-9);assert(Math.abs(lum([0,255,0])-.7152)<1e-9);assert(Math.abs(lum([0,0,255])-.0722)<1e-9);
assert(Math.abs(contrast([116,116,116],[0,0,0])-4.4929480731)<1e-8);assert(contrast([116,116,116],[0,0,0])<4.5);
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
try{
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});page.on('request',r=>report.requests.push(r.url()));
 await page.goto(url);await page.locator('#handRead').filter({hasText:'24'}).waitFor();
 const text=id=>page.locator('#'+id).textContent();
 const lang=async l=>{await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');};
 const shot=async(name,target)=>{if(target)await page.locator(target).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false});report.screenshots.push(name+'.png');};
 for(const l of ['en','zh']){
  await lang(l);const title=l==='en'?'#793 · Preimage Size of Factorial Zeroes Function':'#793 · 阶乘函数后 K 个零';assert.equal(await page.locator('h1').textContent(),title);assert.equal(await page.title(),title);
  assert.equal(await page.locator('[data-i18n=zeroFormula]').textContent(),'f(x) = ⌊x/5⌋ + ⌊x/25⌋ + ⌊x/125⌋ + …');
  await page.locator('#handReset').click();await page.locator('#plus').click();assert((await text('handRead')).includes('f(25)=6'));assert((await text('layers')).includes('25'));await page.locator('#minus').click();assert((await text('handRead')).includes('f(24)=4'));
  await page.locator('#handX').focus();await page.keyboard.press('Home');assert((await text('handRead')).includes('f(0)=0'));assert(await page.locator('#minus').isDisabled());await page.keyboard.press('End');assert((await text('handRead')).includes('f(30)=7'));assert(await page.locator('#plus').isDisabled());await page.locator('#handReset').click();
  const core=require('../core.js');
  for(let p=0;p<core.presets.length;p++){
   const k=core.presets[p],trace=core.trace(k);await page.locator('#preset').selectOption(String(p));assert(await page.locator('#prev').isDisabled());
   for(let i=0;i<trace.length;i++){
    const f=trace[i];assert.equal(await text('loValue'),String(f.lo));assert.equal(await text('hiValue'),String(f.hi));assert.equal(await page.locator('#traceHistory li').count(),f.history.length);
    if(f.row){let op=await text('operation');assert(op.includes('mid='+f.row.mid));assert(op.includes('f(mid)='+f.row.z));assert(op.includes('['+f.row.lo+','+f.row.hi+']'));}
    if(i<trace.length-1)await page.locator('#next').click();
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert((await text('result')).endsWith('='+trace.at(-1).result+'.')||(await text('result')).endsWith('='+trace.at(-1).result+'。'));
   const terminal=await text('operation');await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await text('operation'),terminal);await page.locator('#traceReset').click();assert.equal(await page.locator('#traceHistory li').count(),0);await page.locator('#end').click();assert.equal(await text('operation'),terminal);
   report.states.push({locale:l,k,comparisons:trace.at(-1).history.length,final:await text('result')});
  }
  for(const q of ['29','31']){await page.locator('#quiz').selectOption(q);assert(await page.locator('#reveal').isDisabled());for(let opt=0;opt<3;opt++){
   await page.locator(`[name=prediction][value="${opt}"]`).check();assert(!(await text('feedback')).includes('125'));await page.locator('#reveal').click();const feedback=await text('feedback');assert(feedback.includes('125'));assert(feedback.includes(q==='29'?'L(29)=L(30)=125':'L(31)=125'));
   const expected=opt===(q==='29'?0:1);assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),expected);
   await lang(l==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${opt}"]`).isChecked());assert((await text('feedback')).includes('125'));await lang(l);
  }}
  await page.locator('#predictionReset').click();assert(await page.locator('#reveal').isDisabled());assert(!(await text('feedback')).includes('125'));
  // Source transfer: real clipboard success plus per-attempt native manual fallback.
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await text('pythonCode'),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
  await page.locator('#copyPython').click();await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.includes('copied')||document.getElementById('copyStatus').textContent.includes('已复制'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[download]').click()]);const file=await download.path();assert.equal(fs.readFileSync(file,'utf8'),source);
  for(let repeat=0;repeat<2;repeat++){
   const sentinel=`793-${l}-${repeat}-${Date.now()}`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel reset failed');},sentinel);
   await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('forced unavailable');};});
   await page.locator('#copyPython').click();await page.locator('#manualSource').waitFor({state:'visible'});const selection=await page.locator('#manualSource').evaluate(e=>({focus:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd,value:e.value}));assert(selection.focus);assert.equal(selection.start,0);assert.equal(selection.end,source.length);assert.equal(selection.value,source);
   await page.keyboard.press(os.platform()==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   report.states.push({locale:l,manualCopyAttempt:repeat,hostShortcut:os.platform()==='darwin'?'Meta+C':'Control+C',sentinelVerified:true,exactTransfer:true});await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
  }
 }
 // Locale roundtrip preserves trace, lab, selected and revealed exercise.
 await page.locator('#preset').selectOption('2');await page.locator('#next').click();await page.locator('#handReset').click();await page.locator('#plus').click();await page.locator('#quiz').selectOption('29');await page.locator('[name=prediction][value="0"]').check();await page.locator('#reveal').click();const state=await text('loValue');for(const l of ['zh','en','zh']){await lang(l);assert.equal(await text('loValue'),state);assert((await text('handRead')).includes('f(25)=6'));assert((await text('feedback')).includes('125'));}
 // Width/locale screen captures and geometry; native select text measured with a 32px arrow reserve.
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('5');await page.locator('#next').click();await page.locator('#next').click();await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.locator('#sourceFallback').evaluate(e=>e.hidden=true);
  const geometry=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,selects:[...document.querySelectorAll('select')].map(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {id:e.id,text:e.selectedOptions[0].textContent,textWidth:c.measureText(e.selectedOptions[0].textContent).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-32};})}));assert(geometry.scroll<=geometry.viewport+1);for(const s of geometry.selects)assert(s.textWidth<=s.available,JSON.stringify(s));
  report.states.push({locale:l,width,geometry});await shot(`${l}-${width}-trace`,'#frameRead');if(width<=390)await shot(`${l}-${width}-operation`,'#operation');
  if(width===320||width===1440){await page.evaluate(()=>scrollTo(0,0));await shot(`${l}-${width}-heading`);}
 }
 // 200% browser-rendered CSS zoom exercises text enlargement and reflow.
 await page.setViewportSize({width:1440,height:1100});for(const l of ['en','zh']){await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#preset').selectOption('2');await page.locator('#next').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(`${l}-200percent`,'#frameRead');await page.evaluate(()=>document.documentElement.style.zoom='');}
 report.zoom='200% CSS zoom in Chromium at 1440px; text and component reflow checked. Physical browser chrome zoom/real devices unverified.';
 // Native keyboard activation, focus visibility and sticky anchors.
 await page.setViewportSize({width:320,height:1000});for(const l of ['en','zh']){await lang(l);for(let n=0;n<5;n++){const a=page.locator(`.step-nav a[href="#step${n}"]`);await a.focus();await page.keyboard.press('Enter');await page.waitForTimeout(50);const geo=await page.locator('#step'+n).evaluate(e=>({top:e.getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(geo.top>=geo.nav-2,JSON.stringify(geo));}
  await page.locator('#next').focus();const focus=await page.locator('#next').evaluate(e=>({visible:e.matches(':focus-visible'),outline:getComputedStyle(e).outlineWidth}));assert(focus.visible);assert.equal(focus.outline,'3px');
  const links=await page.locator('.related a').evaluateAll(es=>es.map(e=>({label:e.textContent,href:e.href})));for(const link of links){const dest=await ctx.newPage();await dest.goto(link.href);const hash=new URL(link.href).hash;assert.equal(await dest.locator(hash).count(),1);await dest.locator(`[data-lang=${l}]`).click();const body=await dest.locator(hash).textContent();assert(link.href.includes('/4/') ? /i\+j=half/.test(body) && /aL/.test(body) : /C\(mid\)/.test(body));report.links.push({locale:l,...link,fragmentText:body.slice(0,1800)});await dest.close();}
 }
 // Measure solid/composited ancestral text backgrounds; known no text gradients/images.
 const pairs=await page.evaluate(()=>{
  function rgba(s){return (s.match(/[\d.]+/g)||[]).map(Number);}
  const result=[];
  for(const e of document.querySelectorAll('p,h1,h2,h3,label,legend,button,a,summary,span,b,li,select,textarea,code')){
   if(!e.getClientRects().length||!e.textContent.trim())continue;const cs=getComputedStyle(e);let bg=[13,17,23],anc=[];for(let p=e;p;p=p.parentElement)anc.unshift(p);for(const a of anc){const c=rgba(getComputedStyle(a).backgroundColor);if(c.length>=3){let alpha=c[3]??1;bg=bg.map((v,i)=>v*(1-alpha)+c[i]*alpha);}}
   const fg=rgba(cs.color);result.push({tag:e.tagName,id:e.id,text:e.textContent.slice(0,70),fg:fg.slice(0,3),bg,size:parseFloat(cs.fontSize),weight:cs.fontWeight});
  }return result;
 });
 for(const p of pairs){p.ratio=contrast(p.fg,p.bg);p.threshold=p.size>=24||(p.size>=18.66&&Number(p.weight)>=700)?3:4.5;assert(p.ratio>=p.threshold,JSON.stringify(p));}report.contrast=pairs;report.contrastCalibration={blackWhite:21,nearThreshold:contrast([116,116,116],[0,0,0]),red:lum([255,0,0]),green:lum([0,255,0]),blue:lum([0,0,255])};
 // Blocked storage and offline file source initialize from local scripts.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('unavailable');}});});const bp=await blocked.newPage();await bp.goto(url);await bp.locator('#handRead').filter({hasText:'24'}).waitFor();await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert((await bp.locator('#frameRead').textContent()).includes('Frame 1/'));await blocked.close();
 const offline=await browser.newContext();const op=await offline.newPage();await op.goto('file://'+path.join(P,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await offline.close();
 assert(report.requests.every(u=>u.startsWith(base)));assert.deepEqual(report.errors,[]);
 report.browser=await browser.version();report.cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(report.cssBytes<25000);report.status='passed';
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,browser:report.browser,states:report.states.length,screenshots:report.screenshots.length,contrastPairs:pairs.length,minContrast:Math.min(...pairs.map(p=>p.ratio)),cssBytes:report.cssBytes,errors:report.errors}));
}finally{await browser.close();}})().catch(e=>{report.failure=String(e.stack);fs.writeFileSync(path.join(OUT,'browser-failure.json'),JSON.stringify(report,null,2));console.error(e);process.exit(1);});
