'use strict';
// OUTPUT_DIR=/tmp/review65 node leetcode/65/tests/browser.cjs
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/65/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const report={type:'author browser self-check',errors:[],requests:[],checks:[],contrast:[]};
const check=s=>report.checks.push(s);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--disable-gpu'],...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 report.chromiumVersion=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)report.errors.push(r.url()+' '+r.status());report.requests.push(r.url());});
 await page.goto(url);await page.locator('#state').filter({hasText:'digit = false'}).waitFor();await page.emulateMedia({reducedMotion:'reduce'});
 const expected=[true,false,false,true,false,false,true,false,false,false];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let p=0;p<10;p++){
   await page.selectOption('#preset',String(p));assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   const max=Number(await page.locator('#position').getAttribute('max'));let old=await page.locator('#state').textContent();
   for(let i=1;i<=max;i++){
    await page.click('#next');const after=await page.locator('#state').textContent();const row=await page.locator('#rows').textContent();
    assert.equal(await page.locator('#rows tr').count(),i);assert.equal(await page.locator('#rows tr.current').count(),1);
    await page.click('#prev');assert.equal(await page.locator('#state').textContent(),old);
    await page.click('#next');assert.equal(await page.locator('#state').textContent(),after);assert.equal(await page.locator('#rows').textContent(),row);old=after;
   }
   assert((await page.locator('#result').textContent()).includes('→ '+expected[p]));assert(await page.isDisabled('#next'));
   if(p===4)assert((await page.locator('#inputView').textContent()).endsWith('5'));
   await page.click('#reset');assert.equal(await page.inputValue('#position'),'0');assert.equal(await page.locator('#rows tr').count(),0);
  }
  check(lang+': all ten presets, every frame, forward/back/forward, cumulative ledger, reset, terminal rejection suffix');
  for(const s of ['0','1e999999999999999999','-.7E-2','1e+','99e2.5','abc']){
   await page.fill('#custom',s);await page.click('#apply');assert.equal(await page.inputValue('#position'),'0');
   await page.locator('#position').focus();await page.keyboard.press('End');
   const answer=/^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/.test(s);
   assert((await page.locator('#result').textContent()).includes('→ '+answer));
  }
  const saved=await page.locator('#state').textContent();
  for(const s of ['',' ','1_2','0'.repeat(21),'١','1/2']){await page.fill('#custom',s);await page.click('#apply');assert(await page.isVisible('#validation'));assert.equal(await page.locator('#state').textContent(),saved);}
  await page.selectOption('#preset','0');assert(await page.isHidden('#validation'));
  await page.locator('#position').focus();await page.keyboard.press('End');assert.equal(await page.inputValue('#position'),'5');await page.keyboard.press('ArrowLeft');assert.equal(await page.inputValue('#position'),'4');await page.keyboard.press('Home');assert.equal(await page.inputValue('#position'),'0');
  for(const value of ['0','1','2']){
   await page.check(`[name=prediction][value="${value}"]`);assert(await page.isHidden('#feedback'));await page.click('#reveal');assert(await page.isVisible('#feedback'));
   assert((await page.locator('#feedback').getAttribute('class')).includes(value==='1'?'status-good':'status-bad'));
   const old=await page.locator('#feedback').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);
   assert(await page.isChecked(`[name=prediction][value="${value}"]`));assert(await page.isVisible('#feedback'));assert.notEqual(await page.locator('#feedback').textContent(),old);await page.click(`[data-lang=${lang}]`);
  }
  await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));await page.selectOption('#preset','2');assert(await page.isChecked('[name=prediction][value="0"]'));
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.inputValue('#position'),'1');await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal(await page.inputValue('#position'),'0');
  check(lang+': custom/boundaries/invalid-input preservation, keyboard buttons/slider, all predictions, reveal/change/locale persistence');
 }
 // Exact source display, real clipboard, denied clipboard fallback, and browser download.
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
 await page.click('#copy');assert(await page.isVisible('#manualCopy'));assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.evaluate(()=>document.querySelector('#copyText').selectionEnd-document.querySelector('#copyText').selectionStart),source.length);
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.locator('#sourceDetails summary').click();await page.click('[data-lang=en]');assert.notEqual(await page.locator('#sourceDetails').getAttribute('open'),null);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Recovery from denial is truthful and clears the manual fallback.
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copied=s;}}});});await page.click('#copy');assert.equal(await page.evaluate(()=>window.copied),source);assert(await page.isHidden('#manualCopy'));
 check('clipboard success/denial/recovery, selected manual fallback, source/copy/download parity');
 // Locale preserves frame, edited field, answer/reveal/disclosure, and keyboard focus.
 await page.selectOption('#preset','0');await page.click('#next');await page.fill('#custom','-.6E+7');await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.focus('[data-lang=zh]');await page.keyboard.press('Enter');
 assert.equal(await page.inputValue('#position'),'1');assert.equal(await page.inputValue('#custom'),'-.6E+7');assert(await page.isVisible('#feedback'));assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'zh');assert.equal(await page.locator('#sourceDetails').getAttribute('open'),'');
 await page.locator('#sourceDetails summary').click();
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','0');
  await page.locator('#position').focus();await page.keyboard.press('End');
  await page.locator('#step2').scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,document.querySelector('#inputView').getBoundingClientRect().top+scrollY-110));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width}: overflow`);
  assert(await page.locator('#state').evaluate(el=>el.scrollWidth<=el.clientWidth));
  if(width===320){await page.focus('#ledgerWrap');await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#ledgerWrap').scrollLeft>0);await page.locator('#ledgerWrap').evaluate(el=>new Promise(resolve=>{let previous=el.scrollLeft,stable=0;function settle(){const now=el.scrollLeft;stable=now===previous?stable+1:0;previous=now;if(stable>=3){el.scrollTo({left:0,behavior:'instant'});el.blur();resolve();}else requestAnimationFrame(settle);}requestAnimationFrame(settle);}));assert.equal(await page.locator('#ledgerWrap').evaluate(el=>el.scrollLeft),0);}
  await page.evaluate(()=>scrollTo(0,document.querySelector('#inputView').getBoundingClientRect().top+scrollY-110));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:path.join(out,`${lang}-${width}.png`)});
  if(width===1440){await page.focus('#position');await page.keyboard.press('Home');for(let k=0;k<3;k++)await page.keyboard.press('ArrowRight');assert((await page.locator('#state').textContent()).includes('digit = false'));await page.locator('#ledgerWrap').screenshot({path:path.join(out,`${lang}-exponent-ledger.png`)});}
 }
 await page.setViewportSize({width:640,height:1000});await page.evaluate(()=>{document.documentElement.style.zoom='2';});
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);await page.locator('#state').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='');
 check('EN/ZH 320/390/736/1440 and 200% CSS zoom; no document/state overflow; table scrolls with keyboard');
 // Real links and sticky target clearance.
 await page.setViewportSize({width:1440,height:1000});
 for(const id of ['step0','step1','step2','step3','step4']){await page.click(`.step-nav a[href="#${id}"]`);const y=await page.locator('#'+id).evaluate(el=>el.getBoundingClientRect().top);assert(y>=75&&y<130,`${id}: ${y}`);}
 for(const href of ['../10/#step1','../32/#step1']){const r=await context.request.get(new URL(href,url).href);assert.equal(r.status(),200);assert((await r.text()).includes('id="step1"'));}
 await page.focus('#copy');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 const focus=await page.locator('#copy').evaluate(el=>({width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor,visible:el.matches(':focus-visible')}));assert.equal(focus.width,'3px');assert(focus.visible);
 await page.emulateMedia({forcedColors:'active'});await page.focus('#copy');await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#copy').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 await page.selectOption('#preset','0');assert.equal(await page.locator('#prev').evaluate(el=>getComputedStyle(el).opacity),'1');await page.locator('#position').focus();await page.keyboard.press('End');assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(28, 35, 48)');await page.click('#reset');
 const sizes=await page.locator('button,select,input[type=text],input[type=range],summary,.prediction-options label').evaluateAll(els=>els.map(el=>({id:el.id,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));assert(sizes.every(s=>s.w>=48&&s.h>=48),JSON.stringify(sizes));
 const pairs=await page.evaluate(()=>{
  function bg(el){while(el){const c=getComputedStyle(el).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;el=el.parentElement;}return 'rgb(13,17,23)';}
  return ['body','.explain','.hint','.readout','.formula','.btn.primary','#copy','#prev','#preset','#custom','.step-nav a.active','.lang-toggle button.active'].map(sel=>{const el=document.querySelector(sel),s=getComputedStyle(el);return{sel,fg:s.color,bg:bg(el)};});
 });
 const lum=c=>{const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];};
 function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 for(const v of ['0','1']){await page.check(`[name=prediction][value="${v}"]`);await page.click('#reveal');pairs.push(await page.locator('#feedback').evaluate(el=>({sel:'#feedback.'+el.className,fg:getComputedStyle(el).color,bg:getComputedStyle(el).backgroundColor})));}
 report.contrast=pairs.map(p=>({...p,ratio:ratio(p.fg,p.bg)}));assert(report.contrast.every(p=>p.ratio>=4.5));report.contrast.push({role:'focus against panel2',ratio:ratio(focus.color,'rgb(28,35,48)')});assert(report.contrast.at(-1).ratio>=3);
 check('related links, sticky targets, keyboard 3px focus, forced colors/reduced motion, 48px controls, measured contrast');
 // Additional important visual branches.
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:390,height:1000});await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-header.png`)});
  await page.check('[name=prediction][value="0"]');await page.check('[name=prediction][value="2"]');await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});
  await page.click('#reveal');await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-revealed.png`)});
  await page.selectOption('#preset','4');await page.locator('#position').focus();await page.keyboard.press('End');await page.locator('#result').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-rejected.png`)});
  await page.setViewportSize({width:736,height:414});await page.locator('#state').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-landscape.png`)});
 }
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied');}});});const dp=await denied.newPage();await dp.goto(url);await dp.click('[data-lang=zh]');await dp.click('#next');await dp.click('[data-lang=en]');assert.equal(await dp.inputValue('#position'),'1');await denied.close();
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.click('#next');assert.equal(await op.inputValue('#position'),'1');await offline.close();
 check('denied storage, offline file source and interactions');
 assert.equal(report.errors.length,0,report.errors.join('\n'));assert(report.requests.every(u=>u.startsWith(base)),'unexpected external assets');
 report.cssBytes=fs.statSync(path.join(__dirname,'../../style.css')).size+fs.statSync(path.join(__dirname,'../style.css')).size;assert(report.cssBytes<25000);
 report.result='pass';fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,checks:report.checks,cssBytes:report.cssBytes,contrast:report.contrast},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
