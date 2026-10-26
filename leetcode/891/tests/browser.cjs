const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/891/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
function oracle(a){const b=[...a].sort((x,y)=>x-y),n=b.length,terms=Array(n).fill(0);let sum=0;
 for(let mask=1;mask<2**n;mask++){const ids=b.map((_,i)=>i).filter(i=>mask&(1<<i));terms[ids.at(-1)]+=b[ids.at(-1)];terms[ids[0]]-=b[ids[0]];sum+=b[ids.at(-1)]-b[ids[0]];}return{b,terms,sum};}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await ctx.newPage();
 p.setDefaultTimeout(15000);
 const errors=[],assets=[],external=[],semantics=[],fits=[],focus=[],links=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)assets.push(r.url());});p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770')&&!r.url().startsWith('data:'))external.push(r.url());});
 const lang=async l=>p.locator('[data-lang='+l+']').click();
 const snapshot=async()=>p.locator('#traceStage').textContent();
 await p.goto(url);await p.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0/3'));
 for(const l of ['en','zh']){
  await lang(l);const heading=l==='en'?'#891 · Sum of Subsequence Widths':'#891 · 子序列宽度之和';assert.equal(await p.locator('h1').textContent(),heading);assert.equal(await p.title(),heading);
  assert((await p.locator('[data-i18n=formula]').textContent()).includes('a[i] × (2ⁱ − 2ⁿ⁻¹⁻ⁱ)'));assert((await p.locator('[data-i18n=proof]').textContent()).includes(l==='en'?'rightmost':'最右'));
  await p.locator('#handReset').click();assert.equal(await p.locator('#handDone').isHidden(),true);
  for(let i=0;i<7;i++)await p.locator('#handGrid button').nth(i).click();
  assert((await p.locator('#handRead').textContent()).includes('7/7'));assert((await p.locator('#handRead').textContent()).endsWith('= 6'));assert(await p.locator('#handDone').isVisible());
  await p.locator('#handGrid button').nth(0).focus();await p.evaluate(()=>document.querySelector('[data-lang='+ (document.documentElement.lang==='en'?'zh':'en')+']').click());assert.equal(await p.evaluate(()=>document.activeElement===document.querySelector('#handGrid button')),true);assert(await p.locator('#handDone').isVisible());await lang(l);
  await p.locator('#handReset').click();assert((await p.locator('#handRead').textContent()).includes('0/7'));
  for(let preset=0;preset<6;preset++){
   await p.selectOption('#preset',String(preset));const a=JSON.parse(await p.locator('#preset option:checked').textContent()),o=oracle(a);assert(await p.locator('#prev').isDisabled());assert.equal(await p.locator('#ledger li').count(),0);
   let acc=0;
   for(let i=0;i<a.length;i++){
    await p.locator('#next').click();acc+=o.terms[i];assert.equal(await p.locator('#ledger li').count(),i+1);
    const term=await p.locator('#ledger li').nth(i).textContent();assert(term.includes('= '+o.terms[i]));assert(term.includes('after '+acc)||term.includes('累计后 '+acc));
    const current=p.locator('.position.current');assert((await current.textContent()).includes('i='+i));assert((await current.textContent()).includes(l==='en'?'Just added · Done':'刚计入 · 已处理'));
    const snap=await snapshot();await p.locator('#prev').click();await p.locator('#next').click();assert.equal(await snapshot(),snap);
    if(preset===0)semantics.push({locale:l,preset,frame:i+1,term,roles:await p.locator('#groups').textContent(),total:await p.locator('#total').textContent()});
   }
   assert(await p.locator('#next').isDisabled());assert(await p.locator('#end').isDisabled());assert((await p.locator('#total').textContent()).endsWith('= '+o.sum));
   semantics.push({locale:l,preset,input:a,expected:o.sum,endpoint:await p.locator('#total').textContent()});
   for(let i=0;i<a.length;i++)await p.locator('#prev').click();assert(await p.locator('#prev').isDisabled());assert.equal(await p.locator('#ledger li').count(),0);assert(await p.locator('#roleTitle').isHidden());
   await p.locator('#end').click();assert((await p.locator('#total').textContent()).endsWith('= '+o.sum));await p.locator('#reset').click();assert(await p.locator('#prev').isDisabled());
  }
  await p.locator('#quizReset').click();assert(await p.locator('#reveal').isDisabled());assert(!(await p.locator('#feedback').textContent()).includes('2×'));
  for(let c=0;c<3;c++){
   await p.locator(`[name=prediction][value="${c}"]`).check();assert(!(await p.locator('#feedback').textContent()).includes('2×'));await p.locator('#reveal').click();
   const feedback=await p.locator('#feedback').textContent();assert(feedback.includes('2×(2−4)=−4'));assert(feedback.startsWith(l==='en'?(c===1?'Correct prediction.':c===0?'A middle position':'The sign is reversed'):(c===1?'预测正确。':c===0?'中间不保证':'符号颠倒')));semantics.push({locale:l,choice:c,feedback});
  }
  await p.selectOption('#preset','1');await p.locator('#next').click();await p.locator('#next').click();await p.locator('#handGrid button').nth(4).click();
  await p.locator('#next').focus();await p.evaluate(()=>document.querySelector('[data-lang='+ (document.documentElement.lang==='en'?'zh':'en')+']').click());
  assert.equal(await p.evaluate(()=>document.activeElement.id),'next');assert.equal(await p.locator('#ledger li').count(),2);assert.equal(await p.locator('#preset').inputValue(),'1');assert(await p.locator('[name=prediction][value="2"]').isChecked());assert((await p.locator('#feedback').textContent()).includes('2×(2−4)=−4'));assert.equal(await p.locator('#handGrid button[aria-pressed=true]').count(),1);await lang(l);
  assert.equal(await p.locator('#pythonSource').textContent(),source);await p.locator('#copy').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#download').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  // Every native fallback attempt begins with its own verified distinct sentinel.
  const sentinel='891-fallback-'+l+'-'+Date.now();await p.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await p.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('forced fallback'));});
  await p.locator('#copy').click();assert.deepEqual(await p.locator('#manualSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
  await p.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  semantics.push({locale:l,copy:'source rendered/copied/downloaded/native fallback exact including final newline',sentinel,platform:process.platform,fallback:await p.locator('#copyStatus').textContent()});
  await p.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);await lang(l==='en'?'zh':'en');assert(await p.locator('#manualCopy').isVisible());assert.equal(await p.locator('#manualSource').inputValue(),source);await lang(l);await p.locator('#copy').click();await p.locator('#manualCopy').waitFor({state:'hidden'});assert(await p.locator('#manualCopy').isHidden());
 }
 // Both languages at all widths; inspect populated duplicate role groups and ledger.
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await p.setViewportSize({width,height:1000});await lang(l);await p.selectOption('#preset','1');await p.locator('#next').click();await p.locator('#next').click();
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(let v=0;v<6;v++){
   await p.selectOption('#preset',String(v));const budget=await p.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return{label:e.selectedOptions[0].textContent,width:e.clientWidth,text:c.measureText(e.selectedOptions[0].textContent).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20};});assert(budget.text<=budget.available);fits.push({locale:l,width,preset:v,...budget});
  }
  await p.selectOption('#preset','1');await p.locator('#next').click();await p.locator('#next').click();await p.locator('#positions').scrollIntoViewIfNeeded();
  for(const selector of ['.position','.group-box','#ledger li'])for(const el of await p.locator(selector).all())assert(await el.evaluate(e=>e.scrollWidth<=e.clientWidth),selector);
  await p.screenshot({path:path.join(out,`trace-${width}-${l}.png`)});
  await p.locator('#prev').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#ledger li').count(),1);await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'next');await p.keyboard.press('Enter');assert.equal(await p.locator('#ledger li').count(),2);
  const f=await p.locator('#next').evaluate(e=>{const s=getComputedStyle(e);return{width:s.outlineWidth,color:s.outlineColor,height:e.getBoundingClientRect().height};});assert.equal(f.width,'3px');assert(f.height>=48);focus.push({locale:l,width,...f});
 }
 await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');
 for(const l of ['en','zh']){await lang(l);await p.locator('#positions').scrollIntoViewIfNeeded();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(out,`zoom-200-${l}.png`)});}
 await p.evaluate(()=>document.documentElement.style.zoom='');
 await p.setViewportSize({width:1440,height:1000});
 for(const l of ['en','zh']){await lang(l);await p.locator('#handReset').click();for(let i=0;i<7;i++)await p.locator('#handGrid button').nth(i).click();await p.selectOption('#preset','0');await p.locator('#end').click();await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.screenshot({path:path.join(out,'lesson-'+l+'.png'),fullPage:true});}
 for(const l of ['en','zh']){
  await lang(l);
  for(let i=0;i<5;i++){await p.locator(`.step-nav a[href="#step${i}"]`).focus();await p.keyboard.press('Enter');await p.waitForTimeout(80);const top=await p.locator('#step'+i).evaluate(e=>e.getBoundingClientRect().top),bottom=await p.locator('.step-nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=bottom-1,{top,bottom});}
  await p.setViewportSize({width:320,height:1000});
  for(const href of ['../828/#step2','../940/#step0']){
   const a=p.locator(`.related a[href="${href}"]`),label=await a.textContent();await a.focus();await p.keyboard.press('Enter');await p.waitForURL('**/'+href.slice(3));const target=href.split('#')[1],text=await p.locator('#'+target).textContent();assert(text.includes(href.includes('828')?(l==='en'?'position':'位置'):(l==='en'?'Distinct':'不同')));links.push({locale:l,label,resolved:p.url(),excerpt:text.slice(0,2000)});await p.goto(url);await lang(l);
  }
  await p.setViewportSize({width:1440,height:1000});
 }
 // Populate applicable rendered branch after returning from related pages.
 await p.selectOption('#preset','1');await p.locator('#next').click();await p.locator('#next').click();
 // Measure actual rendered pairs, including disabled controls and focus backgrounds.
 function lum(c){const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}
 assert.equal((lum('rgb(255,255,255)')+.05)/(lum('rgb(0,0,0)')+.05),21);assert.equal(lum('rgb(255,0,0)'),.2126);
 const contrasts=[];
 for(const selector of ['body','.explain','.hint','.position span','#prev','#next','.group-box','#total','pre','.lang-toggle button.active']){
  const pair=await p.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);let a=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&a.parentElement){a=a.parentElement;bg=getComputedStyle(a).backgroundColor;}return{color:s.color,background:bg,opacity:s.opacity};});
  const a=lum(pair.color),b=lum(pair.background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,JSON.stringify({selector,pair,ratio}));assert.equal(pair.opacity,'1');contrasts.push({selector,...pair,ratio});
 }
 await p.locator('#prev').focus();await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'next');
 const outline=await p.locator('#next').evaluate(e=>{const s=getComputedStyle(e);return{color:s.outlineColor,width:s.outlineWidth,style:s.outlineStyle};});assert.equal(outline.style,'solid');assert.equal(outline.width,'3px');
 for(const bg of ['rgb(13,17,23)','rgb(22,27,34)','rgb(28,35,48)']){const a=lum(outline.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);fs.writeFileSync(path.join(out,'focus-measurement.json'),JSON.stringify({outline,background:bg,ratio},null,2));assert(ratio>=3,JSON.stringify({outline,bg,ratio}));contrasts.push({role:'focus',color:outline.color,background:bg,ratio});}
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));const d=await denied.newPage();await d.goto(url);await d.locator('#next').click();await d.locator('[data-lang=zh]').click();assert.equal(await d.locator('#ledger li').count(),1);await d.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await d.locator('#next').focus();assert.equal(await d.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await denied.close();
 const offline=await browser.newContext({offline:true}),local=await offline.newPage();await local.goto('file://'+path.join(root,'index.html'));assert.equal(await local.locator('#pythonSource').textContent(),source);await local.locator('#next').click();assert.equal(await local.locator('#ledger li').count(),1);await offline.close();
 const cssBytes=fs.statSync(path.resolve(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'asset-diagnostics.json'),JSON.stringify({errors,assets,external},null,2));assert.deepEqual(errors,[]);assert.deepEqual(assets,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({result:'pass',browser:await browser.version(),host:process.platform,semantics,fits,focus,links,contrasts,cssBytes,errors,assets,external,zoom:'CSS zoom=2 at 1440; independent 320/390/736 widths. Physical devices/native browser chrome zoom not measured.'},null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
