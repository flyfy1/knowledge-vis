/* Real-browser author checks. OUTPUT_DIR may point outside the frozen candidate. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const origin=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}
function lum(v){return v.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
function ratio(a,b){a=lum(a);b=lum(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[],requests=[],log=[],semantic=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(origin+'/leetcode/488/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0/'));
 assert.equal(await page.locator('#pythonSource').textContent(),source);
 assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 const snapshot=async()=>page.evaluate(()=>['beforeBoard','afterBoard','remainingHand','progress','operation','ledger','endpoint'].map(id=>document.getElementById(id).textContent));
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();
  assert.equal(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');
  await page.locator('#handReveal').click();assert.equal(await page.locator('#handAnswer').isVisible(),true);assert.match(await page.locator('#handAnswer').textContent(),/RRBBBRR/);
  await page.locator('#handReveal').click();assert.equal(await page.locator('#handAnswer').isVisible(),false);
  await page.locator('#baselineDisclosure summary').click();assert(await page.locator('#baselineSource').isVisible()); await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator('#baselineSource').isVisible());await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#baselineDisclosure summary').click();
  for(const hand of ['B','R']){await page.selectOption('#stateHand',hand);const s=await page.locator('#stateResult').textContent();assert(s.includes(hand==='B'?'−1':'1'));semantic.push({lang,state:'RR/'+hand,observed:s});}
  for(let p=0;p<4;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   const frames=await page.evaluate(p=>ZumaLesson.trace(ZumaLesson.presets[p]),p);
   for(let i=1;i<frames.length;i++){
    await page.locator('#next').click();const f=frames[i];
    const a=await page.locator('#afterBoard').textContent();assert.equal(a,f.row||(lang==='zh'?'空 ∅':'Empty ∅'));
    const h=await page.locator('#remainingHand').textContent();assert.equal(h,f.hand||(lang==='zh'?'空 ∅':'Empty ∅'));
    assert((await page.locator('#progress').textContent()).includes(`${i}/${frames.length-1}`));
    assert((await page.locator('#progress').textContent()).includes(lang==='zh'?(f.stable?'稳定，可作':'待继续消除'):(f.stable?'Stable:':'Removal pending:')));
    assert.equal(await page.locator('#beforeText').textContent(),f.before||(lang==='zh'?'空 ∅':'Empty ∅'));assert.equal(await page.locator('#afterText').textContent(),f.row||(lang==='zh'?'空 ∅':'Empty ∅'));
    assert.equal(await page.locator('#ledger li').count(),i);
    if(i===1){const state=await snapshot();await page.locator('#prev').click();await page.locator('#next').click();assert.deepEqual(await snapshot(),state);}
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert(await page.locator('#endpoint').isVisible());
   const endpoint=await page.locator('#endpoint').textContent();semantic.push({lang,preset:p,endpoint});
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());assert(!(await page.locator('#endpoint').isVisible()));await page.locator('#end').click();assert(await page.locator('#end').isDisabled());
   while(!(await page.locator('#prev').isDisabled()))await page.locator('#prev').click();
   log.push({lang,preset:p,events:frames.length-1,endpoints:true,rewind:true});
  }
  for(const answer of ['0','1','2']){
   await page.locator(`[name="prediction"][value="${answer}"]`).check();assert(!(await page.locator('#reveal').isDisabled()));
   assert(!(await page.locator('#feedback').textContent()).includes('RBBBR'));
   await page.locator('#reveal').click();if(answer==='2'){await page.setViewportSize({width:320,height:1000});await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});await page.setViewportSize({width:1440,height:1000});}const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('RBBBR → RR'));assert(feedback.includes(lang==='zh'?(answer==='2'?'预测正确':'需要修正'):(answer==='2'?'Correct prediction':'Revise')));semantic.push({lang,answer,feedback});
   const state=await snapshot();const other=lang==='en'?'zh':'en';await page.locator(`[data-lang="${other}"]`).click();assert(await page.locator(`[name="prediction"][value="${answer}"]`).isChecked());assert((await page.locator('#feedback').textContent()).includes('RBBBR → RR'));await page.locator(`[data-lang="${lang}"]`).click();assert.deepEqual(await snapshot(),state);
  }
  await page.locator('[name="prediction"][value="0"]').check();assert(!(await page.locator('#feedback').textContent()).includes('RBBBR'));
  await page.selectOption('#preset','2');await page.locator('#next').click();const state=await snapshot();await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();await page.locator(`[data-lang="${lang}"]`).click();assert.deepEqual(await snapshot(),state);
  const formula=await page.locator('[data-i18n="formula"]').textContent();assert(formula.includes('1+F(collapse('));assert(formula.includes('H−{c}'));semantic.push({lang,formula,operation:await page.locator('#operation').textContent(),progress:await page.locator('#progress').textContent()});
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   for(let p=0;p<4;p++){await page.selectOption('#preset',String(p));const frames=await page.evaluate(p=>ZumaLesson.trace(ZumaLesson.presets[p]),p);for(let i=1;i<frames.length;i++){await page.locator('#next').click();assert.equal(await page.locator('#afterText').textContent(),frames[i].row||(lang==='zh'?'空 ∅':'Empty ∅'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}}
   await page.selectOption('#preset','2');await page.locator('#end').click();await page.locator('#prev').click();
   await page.evaluate(()=>scrollBy(0,document.querySelector('#progress').getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${lang} ${width}`);
   if(width===320){await page.locator('#beforeBoard').focus();await page.locator('#beforeBoard').evaluate(e=>e.scrollLeft=0);await page.keyboard.press('ArrowRight');await page.waitForTimeout(120);assert(await page.locator('#beforeBoard').evaluate(e=>e.scrollLeft>0));await page.locator('#beforeBoard').evaluate(e=>e.scrollLeft=0);}
   const geometry=await page.locator('.ball').evaluateAll(els=>els.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,font:getComputedStyle(e).fontSize})));assert(geometry.every(x=>x.width>=31&&x.height>=39));
   const controlGeometry=await page.locator('button,select').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));assert(controlGeometry.every(h=>h>=48));
   await page.screenshot({path:path.join(out,`${lang}-${width}-trace.png`)});
   if(width===320||width===1440){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-${width}-intro.png`)});}
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.evaluate(()=>scrollBy(0,document.querySelector('#progress').getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-20));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Keyboard activation, focus and native clipboard success.
 await page.setViewportSize({width:1440,height:1000});await page.locator('[data-lang="en"]').click();
 await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/3'));
 const outline=await page.locator('#next').evaluate(e=>{const c=getComputedStyle(e);return {width:c.outlineWidth,offset:c.outlineOffset,color:c.outlineColor,style:c.outlineStyle};});assert.equal(outline.width,'3px');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert((await page.locator('#copyStatus').textContent()).includes('copied'));
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang="${lang}"]`).click();await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('test denied');};});await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
  const sel=await page.locator('#manualSource').evaluate(e=>({start:e.selectionStart,end:e.selectionEnd,focused:document.activeElement===e}));assert.deepEqual(sel,{start:0,end:source.length,focused:true});
  await page.keyboard.press('Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const status=await page.locator('#copyStatus').textContent();semantic.push({lang,copyFallback:status});
 }
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none',reducedMotion:'reduce'});
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 // Resolve every local link, including real deep targets, without external requests.
 const links=await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.href));
 for(const href of links.filter(h=>h.startsWith(origin))){const u=new URL(href);const r=await ctx.request.get(u.origin+u.pathname);assert(r.ok(),href);if(u.hash){const body=await r.text();assert(body.includes(`id="${u.hash.slice(1)}"`),href);}}
 await page.locator('a[href="#step2"]').first().click();await page.waitForTimeout(100);assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().height));
 // Contrast uses actual computed style pairs, with explicit stage backgrounds.
 await page.selectOption('#preset','0'); if(!(await page.locator('#reset').isDisabled()))await page.locator('#reset').click(); assert(await page.locator('#prev').isDisabled());
 const pairs=await page.evaluate(()=>{
  const c=s=>getComputedStyle(document.querySelector(s));const vars=getComputedStyle(document.documentElement);
  return [
   ['body',c('body').color,c('body').backgroundColor],['muted on panel',vars.getPropertyValue('--muted').trim(),vars.getPropertyValue('--panel').trim()],
   ['ball',c('.ball').color,c('.ball').backgroundColor],['disabled',c('#prev').color,c('#prev').backgroundColor],
   ['primary',c('#next').color,c('#next').backgroundColor],['focus on panel',vars.getPropertyValue('--accent2').trim(),vars.getPropertyValue('--panel').trim()],
   ['text on panel2',vars.getPropertyValue('--text').trim(),vars.getPropertyValue('--panel2').trim()]
  ];
 });
 function color(s){return s.startsWith('#')?[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)):rgb(s);}
 const contrasts=pairs.map(([name,a,b])=>({name,foreground:a,background:b,ratio:ratio(color(a),color(b))}));assert(contrasts.every(c=>c.ratio>=(c.name.startsWith('focus')?3:4.5)),JSON.stringify(contrasts));
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked');};Storage.prototype.setItem=()=>{throw Error('blocked');};});const bpage=await blocked.newPage();bpage.on('pageerror',e=>errors.push(e.message));await bpage.goto(origin+'/leetcode/488/');await bpage.locator('[data-lang="zh"]').click();assert((await bpage.locator('#progress').textContent()).includes('事件'));await blocked.close();
 assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(r=>r.startsWith(origin)),requests.join('\n'));
 const result={status:'pass',log,semantic,viewports:[320,390,736,1440],zoom:'200% CSS zoom in real headless Chromium at 1440px; not OS/browser chrome zoom',sourceDisplayMirrorClipboardDownloadParity:true,manualFallbackKeyboardCopyParity:true,blockedStorage:true,outline,contrasts,errors,localAssetRequests:requests};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2)+'\n');await browser.close();console.log('Browser checks passed.');
})().catch(e=>{console.error(e);process.exit(1);});
