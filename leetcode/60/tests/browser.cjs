'use strict';
// OUTPUT_DIR=/tmp/review60 node leetcode/60/tests/browser.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/60/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const report={type:'author browser self-check',errors:[],requests:[],checks:[],contrast:[]};
const check=s=>report.checks.push(s);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-gpu'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 report.chromiumVersion=browser.version();report.launchArgs=['--disable-gpu'];
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.url()+' '+r.status());report.requests.push(r.url());});
 await page.goto(url);await page.locator('#state').filter({hasText:'r=8'}).waitFor();
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));const n=Number(await page.inputValue('#inputN'));
   assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   let before=await page.locator('#state').textContent();
   for(let i=1;i<=n;i++){
    await page.click('#next');const after=await page.locator('#state').textContent();assert.notEqual(after,before);
    assert.equal(await page.locator('#rows tr').count(),i);assert.equal(await page.locator('.block.chosen').count(),1);
    await page.click('#prev');assert.equal(await page.locator('#state').textContent(),before);
    await page.click('#next');assert.equal(await page.locator('#state').textContent(),after);before=after;
   }
   assert((await page.locator('#state').textContent()).includes(['2314','1432','2134','123','4321','1'][p]));assert(await page.isDisabled('#next'));await page.click('#reset');assert.equal(await page.inputValue('#position'),'0');
   assert.equal(await page.locator('#rows tr').count(),0);assert.equal(await page.locator('.block.chosen').count(),0);
  }
  check(lang+': all six presets, every frame, forward/back/forward, endpoints/reset');
  await page.fill('#inputN','9');await page.fill('#inputK','362880');await page.click('#apply');
  for(let i=0;i<9;i++)await page.click('#next');assert((await page.locator('#state').textContent()).includes('987654321'));
  const state=await page.locator('#state').textContent();await page.fill('#inputK','362881');await page.click('#apply');
  assert.equal(await page.locator('#state').textContent(),state);assert(await page.isVisible('#validation'));
  await page.fill('#inputN','1.5');await page.fill('#inputK','1');await page.click('#apply');assert.equal(await page.locator('#state').textContent(),state);
  await page.selectOption('#preset','0');
  // Slider direct endpoint and native keyboard movement.
  await page.locator('#position').focus();await page.keyboard.press('End');assert.equal(await page.inputValue('#position'),'4');
  await page.keyboard.press('ArrowLeft');assert.equal(await page.inputValue('#position'),'3');
  await page.keyboard.press('Home');assert.equal(await page.inputValue('#position'),'0');
  for(const value of ['0','1','2']){
   await page.check(`[name=prediction][value="${value}"]`);assert(await page.isHidden('#feedback'));await page.click('#reveal');
   assert(await page.isVisible('#feedback'));assert((await page.locator('#feedback').textContent()).includes('48=2×24+0'));
   assert((await page.locator('#feedback').getAttribute('class')).includes(value==='1'?'status-good':'status-bad'));
   const oldFeedback=await page.locator('#feedback').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);
   assert(await page.isChecked(`[name=prediction][value="${value}"]`));assert(await page.isVisible('#feedback'));
   assert.notEqual(await page.locator('#feedback').textContent(),oldFeedback);await page.click(`[data-lang=${lang}]`);
  }
  await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));
  await page.selectOption('#preset','2');assert(await page.isChecked('[name=prediction][value="0"]'));
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.inputValue('#position'),'1');await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal(await page.inputValue('#position'),'0');
  check(lang+': max/custom invalid, keyboard buttons/slider, all predictions, reveal/change/locale persistence');
 }
 // Native clipboard success, captured arguments, denial fallback, and exact source parity.
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>{window.copiedText='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedText=text;}}});});
 await page.click('#copy');assert.equal(await page.evaluate(()=>window.copiedText),source);assert(await page.isHidden('#manualCopy'));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
 await page.click('#copy');assert(await page.isVisible('#manualCopy'));assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.locator('#sourceDetails summary').click();await page.click('[data-lang=en]');assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 const download=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download[0].path(),'utf8'),source);
 check('clipboard success/denial/manual focus and exact displayed/copied/downloaded source parity');
 // Locale preservation of actual edited fields, frame, disclosures, answer, focus.
 await page.selectOption('#preset','1');await page.click('#next');await page.fill('#inputK','5');await page.check('[name=prediction][value="1"]');await page.click('#reveal');
 const saved=await page.locator('#rows').textContent();await page.focus('[data-lang=zh]');await page.keyboard.press('Enter');
 assert.equal(await page.inputValue('#position'),'1');assert.equal(await page.inputValue('#inputK'),'5');assert(await page.isVisible('#feedback'));assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'zh');
 assert.equal(await page.locator('#sourceDetails').getAttribute('open'),'');
 // Geometry and settled screenshots in both locales. Wait for actual paint, not a timer.
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','2');await page.click('#next');
  await page.locator('#step2').scrollIntoViewIfNeeded();await page.evaluate(()=>window.scrollTo(0,document.querySelector('#blocks').getBoundingClientRect().top+scrollY-240));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width}: overflow`);
  const rects=await page.locator('.block').evaluateAll(els=>els.map(el=>({w:el.clientWidth,sw:el.scrollWidth})));assert(rects.every(r=>r.sw<=r.w+1));
  if(width===320){await page.focus('#ledgerWrap');await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#ledgerWrap').scrollLeft>0);await page.locator('#ledgerWrap').evaluate(el=>new Promise(resolve=>{let old=el.scrollLeft,stable=0;function settle(){const now=el.scrollLeft;stable=now===old?stable+1:0;old=now;if(stable>=3){el.scrollTo({left:0,behavior:'instant'});el.blur();resolve();}else requestAnimationFrame(settle);}requestAnimationFrame(settle);}));assert.equal(await page.locator('#ledgerWrap').evaluate(el=>el.scrollLeft),0);}
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:false});
 }
 // 200% content zoom with native CSS zoom, including 320 CSS px equivalent reflow.
 await page.setViewportSize({width:640,height:1000});
 await page.evaluate(()=>{document.documentElement.style.zoom='2';});
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#blocks').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='');
 check('EN/ZH widths 320/390/736/1440 and 200% zoom screenshots; no document or block overflow');
 // Real anchor click with reduced motion means no delayed smooth scroll.
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});
 for(const id of ['step0','step1','step2','step3','step4']){await page.click(`.step-nav a[href="#${id}"]`);const y=await page.locator('#'+id).evaluate(el=>el.getBoundingClientRect().top);assert(y>=75&&y<130,`${id}: ${y}`);}
 for(const href of ['../4/#step1','../51/#step1']){const link=page.locator(`a[href="${href}"]`);const target=new URL(href,url);const r=await context.request.get(target.href);assert.equal(r.status(),200);assert((await r.text()).includes('id="step1"'));}
 // Keyboard focus; focus outline must be visible and 3px, disabled states stay fully opaque.
 await page.focus('#copy');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 const focus=await page.locator('#copy').evaluate(el=>({width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor,visible:el.matches(':focus-visible')}));assert.equal(focus.width,'3px');assert(focus.visible);const focusColor=focus.color;
 await page.emulateMedia({forcedColors:'active'});await page.focus('#copy');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#copy').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 await page.selectOption('#preset','5');assert.equal(await page.locator('#prev').evaluate(el=>getComputedStyle(el).opacity),'1');
 const controlSizes=await page.locator('button,select,input[type=number],input[type=range],summary,.prediction-options label').evaluateAll(els=>els.map(el=>({tag:el.tagName,id:el.id,h:el.getBoundingClientRect().height,w:el.getBoundingClientRect().width})));assert(controlSizes.every(r=>r.h>=48&&r.w>=48),JSON.stringify(controlSizes));
 // Measure actual computed foreground/background roles with WCAG sRGB calculation.
 await page.click('#next');
 const pairs=await page.evaluate(()=>{
  function bg(el){while(el){const c=getComputedStyle(el).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;el=el.parentElement;}return 'rgb(13,17,23)';}
  return ['body','.explain','.hint','.readout','.block','.block span','.block b','.btn.primary','#copy','#prev','#next','#preset','.step-nav a.active','.lang-toggle button.active','#copyText'].map(sel=>{const el=document.querySelector(sel),s=getComputedStyle(el);return{sel,fg:s.color,bg:bg(el)};});
 });
 const lum=c=>{const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];};
 function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 for(const choice of ['0','1']){await page.check(`[name=prediction][value="${choice}"]`);await page.click('#reveal');pairs.push(await page.locator('#feedback').evaluate(el=>({sel:'#feedback.'+el.className,fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor})));}
 report.contrast=pairs.map(p=>({...p,ratio:ratio(p.fg,p.bg)}));assert(report.contrast.every(p=>p.ratio>=4.5));
 report.contrast.push({role:'focus against panel2',fg:focusColor,bg:'rgb(28,35,48)',ratio:ratio(focusColor,'rgb(28,35,48)')});assert(report.contrast.at(-1).ratio>=3);
 check('related/internal anchors, keyboard 3px focus, forced colors/reduced motion, 48px controls, computed contrast AA');
 // Additional header, fresh question and revealed answer visual branches.
 for(const lang of ['en','zh']){
  const shots=await context.newPage();await shots.goto(url);await shots.emulateMedia({reducedMotion:'reduce'});
  await shots.click(`[data-lang=${lang}]`);await shots.setViewportSize({width:390,height:1000});await shots.evaluate(()=>scrollTo(0,0));await shots.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await shots.screenshot({path:path.join(out,`${lang}-header.png`)});
  await shots.check('[name=prediction][value="0"]');await shots.check('[name=prediction][value="2"]');assert(await shots.isHidden('#feedback'));await shots.locator('#step3').scrollIntoViewIfNeeded();await shots.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await shots.screenshot({path:path.join(out,`${lang}-prediction.png`)});const revealPage=await context.newPage();await revealPage.setViewportSize({width:390,height:1000});await revealPage.goto(url);await revealPage.emulateMedia({reducedMotion:'reduce'});await revealPage.click(`[data-lang=${lang}]`);await revealPage.check('[name=prediction][value="2"]');await revealPage.click('#reveal');await revealPage.locator('#feedback').scrollIntoViewIfNeeded();await revealPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await revealPage.screenshot({path:path.join(out,`${lang}-revealed.png`)});await revealPage.close();
  await shots.setViewportSize({width:736,height:414});await shots.selectOption('#preset','2');await shots.click('#next');await shots.locator('#blocks').scrollIntoViewIfNeeded();assert(await shots.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shots.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await shots.screenshot({path:path.join(out,`${lang}-landscape.png`)});await shots.close();
 }
 // Storage denied and offline file source remains usable, with no fetch needed.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied');}});});
 const dp=await denied.newPage();await dp.goto(url);await dp.click('[data-lang=zh]');await dp.click('#next');await dp.click('[data-lang=en]');assert.equal(await dp.inputValue('#position'),'1');
 await denied.close();
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.click('#next');assert.equal(await op.inputValue('#position'),'1');await offline.close();
 check('denied storage and offline file opening, source and interactions');
 assert.equal(report.errors.length,0,report.errors.join('\n'));assert(report.requests.every(u=>u.startsWith(base)),'unexpected external assets');
 report.cssBytes=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(report.cssBytes<25000);
 report.result='pass';fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,checks:report.checks,cssBytes:report.cssBytes,contrast:report.contrast},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
