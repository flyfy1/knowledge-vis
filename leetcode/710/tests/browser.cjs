'use strict';
const {chromium}=require('playwright'), assert=require('assert/strict'), fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});const url=process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/710/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),C=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage();const errors=[],bad=[],external=[],checks=[],screenshots=[],semantic=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});
 page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('progress').textContent.includes('0/'));
 async function lang(l){await page.click(`[data-lang="${l}"]`);assert.equal(await page.getAttribute('html','lang'),l==='zh'?'zh-CN':'en');}
 async function state(){return page.evaluate(()=>['progress','event','mappingRows','ledger','probe'].map(id=>document.getElementById(id).textContent));}
 async function snap(name,locator='#step2 .stage'){await page.locator(locator).screenshot({path:path.join(out,name+'.png')});screenshots.push(name+'.png');}
 for(const l of ['en','zh']){
  await lang(l);
  for(let h=0;h<3;h++){await page.selectOption('#handTicket',String(h));assert((await page.textContent('#handResult')).includes(l==='en'?`Ticket ${h} → output ${[0,4,2][h]}`:`票号 ${h} → 返回 ${[0,4,2][h]}`));}
  for(let p=0;p<C.presets.length;p++){
   await page.selectOption('#preset',String(p)); const input=C.presets[p],frames=C.trace(input.n,input.blacklist);
   assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#ticket'));
   for(let i=1;i<frames.length;i++){
    await page.click('#next');const f=frames[i];
    assert((await page.textContent('#progress')).includes(`${i}/${frames.length-1}`));
    const rows=await page.locator('#mappingRows tr').allTextContents();
    for(let k=0;k<f.m;k++)if(!input.blacklist.includes(k)||Object.hasOwn(f.remap,k))assert(rows[k].includes(String(C.output(f,k))));
    const saved=await state();await page.click('#prev');await page.click('#next');assert.deepEqual(await state(),saved);
    if(p===3 && f.event.kind==='skip')semantic.push({locale:l,action:'skip',expected:`blocked ${f.event.old}; high now ${f.high}`,observed:await page.textContent('#event')});
   }
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));assert(!(await page.isDisabled('#ticket')));
   const outputs=[];for(let k=0;k<frames[0].m;k++){
    await page.selectOption('#ticket',String(k));const v=C.output(frames.at(-1),k);outputs.push(v);
    assert((await page.textContent('#probe')).includes(`${k} → ${v}`));assert((await page.textContent('#probe')).includes(`1/${frames[0].m}`));
   }
   assert.deepEqual(outputs.sort((a,b)=>a-b),Array.from({length:input.n},(_,i)=>i).filter(i=>!input.blacklist.includes(i)));
   await page.click('#reset');assert((await page.textContent('#progress')).includes(`0/${frames.length-1}`));assert.equal(await page.inputValue('#ticket'),'0');
   await page.click('#end');assert(await page.isDisabled('#next'));
   checks.push(`${l}:preset${p}:every-operation/back/replay/reset/end/tickets`);
  }
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await page.textContent('#pythonCode'),source);
  assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
  await page.click('#copy');await page.waitForFunction(()=>!document.getElementById('copyStatus').textContent.includes('…'));
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const dl=page.waitForEvent('download');await page.click('a[download]');const download=await dl;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  checks.push(`${l}:render/mirror/copy/download-exact`);
 }
 // Prediction remains fresh and requires explicit selection and reveal.
 assert(await page.isDisabled('#reveal'));assert(await page.isHidden('#feedback'));
 for(const l of ['en','zh']){
  await lang(l);
  for(const choice of ['0','1','2']){
   await page.check(`[name="prediction"][value="${choice}"]`);assert(await page.isHidden('#feedback'));
   await page.click('#reveal');const text=await page.textContent('#feedback');assert(text.includes('3→7')&&text.includes('1/5')&&text.includes('2/5'));
   assert(text.startsWith(l==='en'?(choice==='1'?'Correct prediction.':'Recheck the invariant.'):(choice==='1'?'预测正确。':'再核对不变量。')));
   semantic.push({locale:l,action:'predict '+choice+' then reveal',observed:text});
   const before=await state();await lang(l==='en'?'zh':'en');assert.equal(await page.inputValue('[name="prediction"]:checked'),choice);assert(await page.isVisible('#feedback'));assert.deepEqual((await state())[0].match(/\d+/g),before[0].match(/\d+/g));await lang(l);assert.deepEqual(await state(),before);
  }
 }
 await page.check('[name="prediction"][value="1"]');assert(await page.isHidden('#feedback'));await page.click('#reveal');
 await page.selectOption('#preset','3');await page.click('#next');await page.click('#next');const saved=await state();
 await page.focus('#ticket'); // disabled element must not acquire focus
 await lang('en');await lang('zh');assert.deepEqual(await state(),saved);assert(await page.isVisible('#feedback'));
 await page.click('#reset');assert(await page.isVisible('#feedback'));checks.push('locale and independent quiz state preservation');
 // Native manual copy with distinct clipboard sentinel, host-specific actual shortcut.
 await page.evaluate(()=>{window.nativeWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('test-denied');};});
 for(const l of ['en','zh']){
  await lang(l);await page.evaluate(l=>window.nativeWrite('non-source-710-sentinel-'+l),l);
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'non-source-710-sentinel-'+l);
  await page.click('#copy');assert(await page.isVisible('#manualCopy'));
  assert.equal(await page.inputValue('#copyText'),source);
  assert.deepEqual(await page.$eval('#copyText',e=>[document.activeElement===e,e.selectionStart,e.selectionEnd]),[true,0,source.length]);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  semantic.push({locale:l,action:'clipboard denial',observed:await page.textContent('#copyStatus')});
 }
 await page.evaluate(()=>navigator.clipboard.writeText=window.nativeWrite);
 // Narrow and dense states, both locales and a locale roundtrip.
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});
  for(const l of ['en','zh']){
   await lang(l);await page.selectOption('#preset','3');await page.click('#end');await page.selectOption('#ticket','1');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+l);
   const metrics=await page.$eval('#preset',el=>{const s=getComputedStyle(el),canvas=document.createElement('canvas'),c=canvas.getContext('2d');c.font=s.font;return {text:c.measureText(el.selectedOptions[0].textContent).width,width:el.clientWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)};});
   assert(metrics.text+metrics.padding+24<=metrics.width,JSON.stringify({width,l,metrics}));
   const cells=await page.locator('.value').evaluateAll(es=>es.map(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight})));assert(cells.every(c=>c.sw<=c.w&&c.sh<=c.h));
   await snap(`${width}-${l}-complete`);
   await page.click('#reset');await page.click('#next');await page.click('#next');await snap(`${width}-${l}-skip`);
   await lang(l==='en'?'zh':'en');await lang(l);assert((await page.textContent('#progress')).includes('2/'));
   checks.push(`${width}:${l}:layout/select/domain/roundtrip`);
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const l of ['en','zh']){await lang(l);await page.click('#reset');await page.click('#end');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await snap(`zoom200-${l}`);}
 await page.evaluate(()=>document.documentElement.style.zoom='');
 // Real navigation target and native keyboard operation, focus outlines.
 await lang('en');await page.locator('#stepNav a[href="#step2"]').click();await page.waitForTimeout(500);
 const target=await page.locator('#step2').boundingBox(),nav=await page.locator('#stepNav').boundingBox();assert(target.y>=nav.height-1);
 await page.focus('#preset');await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await page.inputValue('#preset'),'1');
 await page.focus('#next');await page.keyboard.press('Enter');assert((await page.textContent('#progress')).includes('1/'));
 const focus=await page.$eval('#next',el=>({focused:document.activeElement===el,outline:getComputedStyle(el).outlineWidth}));assert(focus.focused);assert.equal(focus.outline,'3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 const sizes=await page.locator('button,select,summary,.official-link,.back-link,.related a,a[download],#stepNav a').evaluateAll(es=>es.map(e=>({name:e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(sizes.every(e=>e.w>=48&&e.h>=48),JSON.stringify(sizes.filter(e=>e.w<48||e.h<48)));
 // Local links and fragment targets, served bytes.
 const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.href));
 for(const href of links.filter(h=>h.startsWith('http://127.0.0.1:18770/'))){const u=new URL(href),res=await context.request.get(u.origin+u.pathname);assert.equal(res.status(),200);if(u.hash)assert((await res.text()).includes(`id="${u.hash.slice(1)}"`),href);}
 assert.equal(await (await context.request.get(url+'solution.py')).text(),source);
 // Measure rendered foreground/background pairs and field/focus boundaries.
 function lum(hex){const vals=hex.match(/\d+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*vals[0]+.7152*vals[1]+.0722*vals[2];}
 function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const pairs=await page.evaluate(()=>{
  const sels=['body','.explain','.hint','.stage','#event','#progress','#next','#prev','#preset','.value.blocked b','.value span','.active-row','#copyStatus','#pythonCode'];
  return sels.map(sel=>{const e=document.querySelector(sel),s=getComputedStyle(e);let p=e,bg;do{bg=getComputedStyle(p).backgroundColor;p=p.parentElement;}while(bg==='rgba(0, 0, 0, 0)'&&p);return {sel,fg:s.color,bg};});
 });const contrast=pairs.map(p=>({...p,ratio:ratio(p.fg,p.bg)}));contrast.forEach(p=>assert(p.ratio>=4.5,JSON.stringify(p)));
 await page.focus('#next');
 const boundaries=await page.evaluate(()=>{const e=document.querySelector('#preset'),s=getComputedStyle(e);return {border:s.borderTopColor,bg:s.backgroundColor,focus:getComputedStyle(document.querySelector('#next')).outlineColor,outer:getComputedStyle(document.querySelector('.stage')).backgroundColor};});
 assert(ratio(boundaries.border,boundaries.bg)>=3);assert(ratio(boundaries.focus,boundaries.outer)>=3);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.focus('#next');assert.equal(await page.$eval('#next',e=>getComputedStyle(e).outlineStyle),'solid');await snap('forced-colors');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Offline runtime and focused reading surfaces use the same local assets.
 await page.setViewportSize({width:390,height:1000});
 for(const l of ['en','zh']){await lang(l);await snap('hand-'+l,'#step0');await snap('quiz-'+l,'#step3');await snap('code-'+l,'#step4');}
 const offline=await context.newPage();const offlineErrors=[];offline.on('pageerror',e=>offlineErrors.push(e.message));await offline.goto('file://'+root+'/index.html');await offline.waitForFunction(()=>document.getElementById('progress').textContent.length>0);assert.equal(await offline.textContent('#pythonCode'),source);await offline.click('#end');assert(!(await offline.isDisabled('#ticket')));assert.deepEqual(offlineErrors,[]);await offline.close();checks.push('file:// offline source and simulation');
 // Denied storage must still initialize and switch, state remains in memory.
 const denied=await context.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('test-storage-denied');}});});await denied.goto(url);await denied.waitForSelector('#progress');await denied.click('[data-lang="zh"]');await denied.click('#next');const num=await denied.textContent('#progress');await denied.click('[data-lang="en"]');assert.deepEqual((await denied.textContent('#progress')).match(/\d+/g),num.match(/\d+/g));await denied.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.resolve(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
 const report={status:'pass',url,host:process.platform,browser:browser.version(),checks,screenshots,semantic,contrast,boundaries,cssBytes,errors,bad,external,keyboard:true,storageDenied:true,clipboard:'native success and native manual fallback, exact final newline; distinct sentinel; '+(process.platform==='darwin'?'Meta+C':'Control+C'),zoom:'200% CSS browser rendering zoom at 1440; not physical device evidence'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:checks.length,screenshots:screenshots.length,cssBytes,contrast}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
