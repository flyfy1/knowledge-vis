// OUTPUT_DIR redirects all artifacts. Uses the existing preview; starts no server.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18785/leetcode/730/';
const expected=[6,4,1,4,4,14],inputs=['bccb','bcb','a','abcd','aaaa','abccba'];
function oracle(s){let words=[''];for(const c of s)words=words.concat(words.map(w=>w+c));return new Set(words.filter(w=>w&&w===Array.from(w).reverse().join('')));}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});await context.grantPermissions(['clipboard-read','clipboard-write']);
 const page=await context.newPage(),errors=[],bad=[],external=[],states=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(new URL(url).origin)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');assert.equal(await page.locator('#pythonCode').textContent(),source);
 fs.writeFileSync(path.join(out,'rendered-baseline.py'),await page.locator('#baselineCode code').textContent());
 assert(await page.locator('#reveal').isDisabled());assert(await page.locator('#feedback').isHidden());assert(await page.locator('#handAnswer').isHidden());
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  await page.locator('#handReveal').click();assert(await page.locator('#handAnswer').isVisible());assert((await page.locator('#handAnswer').textContent()).includes('6'));await page.locator('#handReveal').click();
  for(let p=0;p<inputs.length;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   assert.equal(await page.locator('#dpTable td').filter({hasText:'?'}).count(),inputs[p].length*(inputs[p].length+1)/2);
   const s=inputs[p];let k=0;
   for(let len=1;len<=s.length;len++)for(let i=0;i+len<=s.length;i++){
    const j=i+len-1;k++;await page.locator('#next').click();
    assert.equal(await page.locator('#dpTable td.current').textContent(),'▶ '+oracle(s.slice(i,j+1)).size);
    const prog=await page.locator('#progress').textContent();assert(prog.includes(`D[${i}][${j}] (${s.slice(i,j+1)})`)||prog.includes(`D[${i}][${j}]（${s.slice(i,j+1)}）`));
    const ledger=await page.locator('#groups li').allTextContents();const words=oracle(s.slice(i,j+1));
    ledger.forEach((text,c)=>assert(text.endsWith(String([...words].filter(w=>w[0]==='abcd'[c]).length))));
    if(p===0&&len===s.length)states.push({lang,preset:s,k,progress:prog,groups:ledger,actual:await page.locator('#actual').textContent()});
   }
   assert.equal(oracle(s).size,expected[p]);assert((await page.locator('#finalCount').textContent()).includes(String(expected[p])));
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const terminal=await page.locator('#dpTable').textContent(),ledger=await page.locator('#groups').textContent();
   await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#dpTable').textContent(),terminal);assert.equal(await page.locator('#groups').textContent(),ledger);
   for(let v=k;v>0;v--)await page.locator('#prev').click();assert(await page.locator('#prev').isDisabled());assert(await page.locator('#actual').isHidden());
   await page.locator('#end').click();assert.equal(await page.locator('#dpTable').textContent(),terminal);await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
   states.push({lang,preset:s,intervals:k,expected:expected[p],forwardBackwardResetEnd:true});
  }
  for(const choice of ['0','1','2']){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('2+3=5'));assert(feedback.includes('aaa'));
   if(choice==='1')assert(feedback.startsWith(lang==='zh'?'正确。':'Correct.'));else assert(feedback.startsWith(lang==='zh'?'再比较一下。':'Compare'));
   states.push({lang,choice,feedback});
   await page.selectOption('#preset','0');await page.locator('#next').click();
   await page.locator('#sourceDetails').evaluate(e=>e.open=true);
   await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator(`[name=prediction][value="${choice}"]`).isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.inputValue('#preset'),'0');assert((await page.locator('#progress').textContent()).includes('1/10'));assert(await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).evaluate(e=>e===document.activeElement));
   await page.locator(`[data-lang=${lang}]`).click();
  }
  const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('2 + D[L+1][R−1]'));assert(formula.includes('Σ(c ∈ {a,b,c,d})'));states.push({lang,formula});
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('730-fallback-sentinel');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new Error('simulated denial');}});});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.deepEqual(await page.locator('#copyText').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd]),[true,0,source.length]);
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  states.push({lang,clipboardFallback:await page.locator('#copyStatus').textContent(),nativeShortcut:process.platform==='darwin'?'Meta+C':'Control+C',sentinelReplaced:true});
  await page.evaluate(()=>delete navigator.clipboard.writeText);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.selectOption('#preset','5');await page.locator('#end').click();await page.locator('a[href="#step2"]').click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'document overflow');
   const geometry=await page.locator('#preset').evaluate(e=>{const c=getComputedStyle(e),ctx=document.createElement('canvas').getContext('2d');ctx.font=c.font;return{width:e.clientWidth,text:ctx.measureText(e.selectedOptions[0].textContent).width,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight),font:c.font};});assert(geometry.text+geometry.padding+20<=geometry.width);
   await page.locator('#tableRegion').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>document.activeElement.id),'tableRegion');
   await page.locator('#tableRegion').evaluate(e=>e.scrollLeft=0);
   await page.waitForTimeout(200);
   await page.locator('#step2').screenshot({path:path.join(out,`trace-${lang}-${width}.png`)});
   if(width===390){for(const step of [0,1,3,4])await page.locator('#step'+step).screenshot({path:path.join(out,`step${step}-${lang}-390.png`)});}
   await page.locator('#tableRegion').evaluate(e=>e.scrollLeft=e.scrollWidth);
   await page.locator('#tableRegion').evaluate(e=>e.scrollIntoView({block:'center'}));await page.waitForTimeout(250);
   await page.screenshot({path:path.join(out,`populated-${lang}-${width}.png`)});
   states.push({lang,width,geometry,overflow:false});
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('a[href="#step2"]').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#step2').screenshot({path:path.join(out,`zoom200-${lang}.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'prev');await page.keyboard.press('Enter');
 assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await page.emulateMedia({forcedColors:'active'});await page.locator('#preset').focus();assert.equal(await page.locator('#preset').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none'});
 await page.locator('[name=prediction][value="1"]').focus();await page.keyboard.press('Space');assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert(await page.locator('#feedback').isVisible());
 await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.locator('#sourceDetails summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
 await page.locator('a[href="#step2"]').focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);assert(await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().height));
 await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
 // All authored anchor targets exist (official external link isn't clicked).
 for(const href of await page.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('https:'))continue;
  const u=new URL(href,url),res=await context.request.get(u.href);assert(res.ok(),href);
  if(u.hash){const html=await res.text();assert(html.includes(`id="${u.hash.slice(1)}"`),href);}
 }
 const contrast=await page.evaluate(()=>{
  function luminance(v){const a=v.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return a.reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}
  function ratio(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  const records=['body','.explain','.hint','.step-nav a','#prev','#next','#copy','#langToggle button.active','th','#groups','#feedback'].map(q=>{const e=document.querySelector(q),s=getComputedStyle(e);let el=e,b=s.backgroundColor;while(b==='rgba(0, 0, 0, 0)'&&el.parentElement){el=el.parentElement;b=getComputedStyle(el).backgroundColor;}return{q,foreground:s.color,background:b,ratio:ratio(s.color,b)};});
  records.push({q:'focus on panel',ratio:ratio('rgb(255,180,84)','rgb(22,27,34)')});return records;
 });contrast.forEach(x=>assert(x.ratio>=4.5,JSON.stringify(x)));
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied storage');}});});const dp=await denied.newPage();await dp.goto(url);await dp.locator('[data-lang=zh]').click();assert((await dp.locator('#progress').textContent()).includes('已完成'));await denied.close();
 const offline=await browser.newContext();const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 const baselineCheck=require('node:child_process').spawnSync('python3',['-B',path.join(__dirname,'test_rendered_baseline.py')],{env:{...process.env,OUTPUT_DIR:out},encoding:'utf8'});assert.equal(baselineCheck.status,0,baselineCheck.stderr);
 const report={kind:'author self-check',browser:await browser.version(),hostPlatform:process.platform,states,contrast,cssBytes,errors,bad,external,storageDenied:true,offlineSource:true,sourceParity:true,zoom:'200% CSS zoom, desktop 1440px; physical device and browser-toolbar zoom unverified'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log('Browser PASS: '+states.length+' state records');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
