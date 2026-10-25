const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});const page=await context.newPage(),errors=[],network=[],records=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());network.push(r.url());});
 await page.goto('http://127.0.0.1:18776/leetcode/493/');await page.waitForSelector('#pairRead');
 const text=id=>page.locator('#'+id).textContent();const click=id=>page.locator('#'+id).click();
 for(const lang of ['en','zh']){
 await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
 await click('baseReset');assert(await page.locator('#basePrev').isDisabled());
 for(let i=0;i<3;i++)await click('baseNext');assert(await page.locator('#baseNext').isDisabled());assert((await text('baseStatus')).includes(lang==='en'?'count = 1':'1 对'));
 assert.equal(await page.locator('#baseRows tr').count(),3);assert((await text('baseRows')).includes('4 > 4'));
 await click('basePrev');await click('baseNext');await click('baseReset');assert.equal(await page.locator('#baseRows tr').count(),0);
 for(let i=0;i<3;i++){await page.selectOption('#pairSelect',String(i));assert((await text('pairRead')).includes('q='+[1,2,2][i]));assert.equal(await page.locator('#prefixValues .valid').count(),[1,2,2][i]);}
 for(let preset=0;preset<6;preset++){
 await page.selectOption('#preset',String(preset));assert(await page.locator('#tracePrev').isDisabled());
 let step=0;while(!await page.locator('#traceNext').isDisabled()){
 await click('traceNext');step++;
 const before=await text('operationRead'),read=await text('frameRead'),ledger=await text('countLedger');
 if(step===2){await click('tracePrev');await click('traceNext');assert.equal(await text('operationRead'),before);assert.equal(await text('frameRead'),read);assert.equal(await text('countLedger'),ledger);}
 assert(!before.includes('undefined'));assert(!before.match(/\{\w+\}/));
 }
 const expected=[2,3,1,1,0,2][preset];assert((await text('frameRead')).includes(lang==='en'?`pairs = ${expected}`:`${expected} 对`));
 records.push({lang,preset,frames:step,terminal:await text('frameRead')});await click('traceReset');assert(await page.locator('#tracePrev').isDisabled());await click('traceLast');assert(await page.locator('#traceNext').isDisabled());
 }
 await click('predictionReset');assert(await page.locator('#reveal').isDisabled());
 for(const choice of [3,4,6]){
 await page.locator(`[name=prediction][value="${choice}"]`).check();assert(!(await text('predictionFeedback')).includes('1,1,2'));await click('reveal');
 const feedback=await text('predictionFeedback');assert(feedback.includes(lang==='en'?'1,1,2':'1、1、2'));assert(feedback.startsWith(lang==='en'?(choice===4?'Correct':'Revisit'):(choice===4?'预测正确':'再看')));
 }
 // Switching locale preserves preset, position, answer, reveal and open details.
 await page.locator('#sourceDetails summary').click();const state=await text('frameRead');await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator('[value="6"][name=prediction]').isChecked());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);assert((await text('predictionFeedback')).includes(lang==='en'?'共 4 对':'Total 4'));
 await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await text('frameRead'),state);assert.equal(await text('pythonCode'),source);
 // actual browser clipboard write/read, exact source including final newline
 await click('copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const dest=path.join(OUT,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
 // clipboard denial fallback, selection and keyboard copy
 await page.evaluate(()=>navigator.clipboard.writeText('fallback sentinel'));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
 await click('copyPython');assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);
 assert.deepEqual(await page.locator('#manualSource').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);
 await page.keyboard.press('Control+c');assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');
 // Restore real API by removing override.
 await page.evaluate(()=>delete navigator.clipboard);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.locator('#sourceDetails summary').click();
 for(const width of [320,390,736,1440]){
 await page.setViewportSize({width,height:1000});await page.locator('.step-nav a[href="#step2"]').click();
 await page.selectOption('#preset','0');await click('traceLast');await click('tracePrev');await click('tracePrev');
 assert((await text('operationRead')).includes('x=3'));assert((await text('operationRead')).includes(lang==='en'?'cross contribution +1':'本次 +1 对'));
 const geom=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,top:document.querySelector('#step2').getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(geom.scroll<=width,JSON.stringify(geom));
 await page.locator('#operationRead').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-trace.png`)});
 await page.locator('#halves').screenshot({path:path.join(OUT,`${lang}-${width}-halves.png`)});
 records.push({lang,width,geometry:geom,renderedOperation:await text('operationRead'),renderedCells:await text('rightValues')});
 }
 await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#operationRead').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Inspect other lesson sections at phone width in each locale.
 await page.setViewportSize({width:390,height:844});
 for(const lang of ['en','zh']){
 await page.locator(`[data-lang="${lang}"]`).click();
 await click('baseReset');for(let i=0;i<3;i++)await click('baseNext');
 for(const id of ['step0','step1','step3','step4']){
 await page.locator(`.step-nav a[href="#${id}"]`).click();
 const geometry=await page.evaluate(id=>({target:document.getElementById(id).getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}),id);assert(geometry.target>=geometry.nav-1,JSON.stringify(geometry));
 // Full-element captures can paint a sticky nav in the middle of tall content.
 // Hide it only for this capture; real deep-link geometry is checked above.
 await page.locator('#'+id).screenshot({path:path.join(OUT,`${lang}-${id}.png`),style:'.step-nav{visibility:hidden!important}'});
 }
 }
 // Real keyboard navigation/focus indicator and deep links.
 await page.setViewportSize({width:390,height:844});await page.locator('#traceReset').focus();await page.keyboard.press('Enter');await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceNext');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceReset');await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceNext');
 const focus=await page.locator('#traceNext').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 for(const href of await page.locator('a[href*="#"]').evaluateAll(es=>es.map(e=>e.href))){const u=new URL(href);const r=await context.request.get(u.href.split('#')[0]);assert(r.ok());assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);}
 const contrast=await page.evaluate(()=>{
 const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 return ['.explain','.hint','.value','.readout','.btn.primary','#tracePrev','.step-nav a','.lang-toggle button.active','textarea'].map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let bg=s.backgroundColor,p=e;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {sel,fg:s.color,bg,ratio:ratio(rgb(s.color),rgb(bg))};});
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 assert(network.every(u=>u.startsWith('http://127.0.0.1:18776/')));assert.deepEqual(errors,[]);
 // No storage and clipboard; offline canonical display from embedded mirror.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}})});const bp=await blocked.newPage();const blockedErrors=[];bp.on('pageerror',e=>blockedErrors.push(e.message));await bp.goto('http://127.0.0.1:18776/leetcode/493/');await bp.locator('[data-lang=en]').click();assert.equal(await bp.locator('#pythonCode').textContent(),source);await blocked.setOffline(true);await bp.locator('#sourceDetails summary').click();assert.equal(await bp.locator('#pythonCode').textContent(),source);assert.deepEqual(blockedErrors,[]);
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({kind:'author self-check',result:'pass',records,focus,contrast,errors,assets:[...new Set(network)],cssBytes:fs.statSync(path.join(P,'local.css')).size+fs.statSync(path.join(P,'../style.css')).size,limits:'Chromium desktop emulation; CSS zoom 2 models 200% layout zoom. No physical mobile, novice outcomes, deployment or independent review.'},null,2));
 await browser.close();console.log('browser pass; records:',records.length);
})().catch(e=>{console.error(e);process.exit(1)});
