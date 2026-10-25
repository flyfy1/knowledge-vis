/* Run: node leetcode/564/tests/browser.cjs; OUTPUT_DIR and PREVIEW_ROOT optional. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/564/';
const canonical=fs.readFileSync(path.join(root,'solution.py'),'utf8'),oracle=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json')));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 await context.addInitScript(()=>{localStorage.setItem('knowledge-lang','en');window.copyWrites=[];Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copyWrites.push(text);}}});});
 const page=await context.newPage(),errors=[],bad=[],external=[],coverage=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('0/5'));
 const locale=async lang=>{await page.click(`[data-lang=${lang}]`);assert.equal(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang);};
 const presets=['123','129','121','1','10','99','100','1234','999999999999999999'];
 for(const lang of ['en','zh']){
  await locale(lang);
  const formula=await page.locator('[data-i18n=formula]').textContent();for(const token of ['mirror(p−1)','mirror(p+1)','10^(d−1)−1','10^d+1','|y−n|'])assert(formula.includes(token));
  for(const n of presets){
   await page.selectOption('#preset',n);assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   const total=await page.locator('.candidate').count();
   for(let i=1;i<=total;i++){await page.click('#next');assert.equal(await page.locator('.candidate.tested').count(),i);assert((await page.textContent('#summary')).includes(`${i}/${total}`));const tested=await page.locator('.candidate.tested p:first-of-type').allTextContents();const x=BigInt(n),values=tested.map(v=>BigInt(v.match(/(?:Value |数值 )(\d+)/)[1])).filter(v=>v!==x);values.sort((a,b)=>{let da=a>x?a-x:x-a,db=b>x?b-x:x-b;return da<db?-1:da>db?1:a<b?-1:1;});assert((await page.textContent('#summary')).endsWith(values.length?String(values[0]):lang==='en'?'None yet':'尚无'));}
   assert((await page.textContent('#summary')).endsWith(oracle[n]));
   const final=await page.textContent('#candidates');assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));
   await page.click('#prev');assert.equal(await page.locator('.candidate.tested').count(),total-1);await page.click('#next');assert.equal(await page.textContent('#candidates'),final);
   await page.click('#reset');assert.equal(await page.locator('.candidate.tested').count(),0);await page.click('#end');assert((await page.textContent('#summary')).endsWith(oracle[n]));
   await page.locator('#position').fill('0');assert.equal(await page.locator('.candidate.tested').count(),0);await page.locator('#position').fill(String(total));
   coverage.push({lang,n,total,expected:oracle[n],allFrames:true,endpoints:true,rewindReplay:true});
  }
  assert(await page.isHidden('#feedback'));assert(await page.isDisabled('#reveal'));
  for(const opt of ['0','1','2']){
   await page.check(`[name=prediction][value="${opt}"]`);assert(await page.isHidden('#feedback'));await page.click('#reveal');const feedback=await page.textContent('#feedback');assert(feedback.includes('999'));assert(feedback.includes('1001'));assert(feedback.startsWith(lang==='en'?(opt==='1'?'Correct':'Recheck'):(opt==='1'?'预测正确':'再比较')));
   await locale(lang==='en'?'zh':'en');assert(await page.isChecked(`[name=prediction][value="${opt}"]`));assert(await page.isVisible('#feedback'));assert((await page.textContent('#summary')).endsWith(oracle[presets.at(-1)]));await locale(lang);
   coverage.push({lang,choice:opt,feedback});
  }
  await page.reload();await page.waitForFunction(()=>document.querySelector('#summary').textContent.length>0);
 }
 await locale('en');await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.selectOption('#preset','129');assert(await page.isVisible('#feedback'));assert(await page.isChecked('[name=prediction][value="1"]'));await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 assert.equal(await page.textContent('#pythonCode'),canonical);
 await page.click('#copy');assert.equal(await page.evaluate(()=>window.copyWrites.at(-1)),canonical);assert((await page.textContent('#copyStatus')).includes('copied'));
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('[download]')]);await download.saveAs(path.join(out,'downloaded-solution.py'));assert.equal(fs.readFileSync(path.join(out,'downloaded-solution.py'),'utf8'),canonical);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));
 for(const lang of ['zh','en']){await locale(lang);await page.click('#copy');assert(await page.isVisible('#manualCopy'));assert.equal(await page.inputValue('#copyText'),canonical);assert.equal(await page.evaluate(()=>document.querySelector('#copyText').selectionEnd-document.querySelector('#copyText').selectionStart),canonical.length);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert((await page.textContent('#copyStatus')).includes(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));}
 // Keyboard source disclosure and range, visible focus.
 await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.locator('#sourceDetails summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
 await page.selectOption('#preset','123');await page.focus('#position');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('.candidate.tested').count(),1);
 const focus=await page.locator('#position').evaluate(e=>({width:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle}));assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');
 // Deep links are fetched without editing registry; inspect actual target anchors.
 for(const a of await page.locator('.related a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  const u=new URL(a,url),res=await context.request.get(u.href.split('#')[0]);assert(res.ok());assert((await res.text()).includes(`id="${u.hash.slice(1)}"`));
 }
 await page.click('.step-nav a[href="#step2"]');await page.waitForFunction(()=>{const y=document.querySelector('#step2').getBoundingClientRect().y;return y>=60&&y<=100;});const bounds=await page.locator('#step2').boundingBox();assert(bounds.y>=0);assert(bounds.y<150);
 // Layout matrix and screenshots of populated count cards in both languages.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await locale(lang);await page.selectOption('#preset','999999999999999999');await page.click('#end');await page.locator('#summary').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} page overflow`);
  const geometry=await page.locator('.candidate').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth})));assert(geometry.every(x=>x.width>=180&&x.scroll<=x.width+1));
  const controls=await page.locator('button,select').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width>0).map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert(controls.every(x=>x.h>=48),JSON.stringify(controls));
  await page.screenshot({path:path.join(out,`${lang}-${width}-states.png`)});if(width===320||width===390){await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');await page.locator('#candidates').screenshot({path:path.join(out,`${lang}-${width}-full-grid.png`)});await page.locator('.step-nav').evaluate(e=>e.style.visibility='');}coverage.push({lang,width,geometry,controls:'>=48px'});
 }
 await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const lang of ['en','zh']){await locale(lang);await page.locator('#summary').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='1');
 // Measure actual inherited foreground/background pairs plus disabled and focus.
 const contrast=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  return ['body','.hint','.candidate h3','.candidate p','.candidate .status','#next:disabled','#langToggle button:not(.active)','.step-nav a:not(.active)'].map(sel=>{
   const e=document.querySelector(sel);if(!e)return null;const st=getComputedStyle(e);let node=e,bg;while(node){const c=getComputedStyle(node).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){bg=c;break;}node=node.parentElement;}return {selector:sel,fg:st.color,bg,ratio:ratio(rgb(st.color),rgb(bg))};
  }).filter(Boolean).concat([{selector:'focus accent2 / panel2',ratio:ratio([255,180,84],[28,35,48])},{selector:'focus accent2 / accent selected',ratio:ratio([255,180,84],[13,17,23])}]);
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 // Offline and storage unavailable path: no runtime network needed for source or state.
 const deny=await browser.newContext({viewport:{width:390,height:900}});await deny.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('denied')}});});
 const p2=await deny.newPage();p2.on('pageerror',e=>errors.push(e.message));await p2.goto(url);await p2.waitForFunction(()=>document.querySelector('#summary').textContent.length>0);await deny.setOffline(true);await p2.click('[data-lang=zh]');await p2.click('#next');assert((await p2.textContent('#summary')).includes('1/5'));assert.equal(await p2.textContent('#pythonCode'),canonical);await deny.close();
 await page.setViewportSize({width:390,height:1000});
 for(const lang of ['en','zh']){await locale(lang);await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-prediction.png`)});await page.click('#copy');await page.locator('#manualCopy').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-copy-fallback.png`)});await page.locator('header').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-intro.png`)});}
 await page.emulateMedia({forcedColors:'active' ,reducedMotion:'reduce'});await page.keyboard.press('Tab');await page.focus('#position');assert.equal(await page.locator('#position').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const result={kind:'author browser self-check',result:'PASS',coverage,contrast,errors,badResponses:bad,externalRequests:external,sourceParity:'display, copy, manual selection, download all exact',zoom:'document CSS zoom=2 at 1440px, both locales (headless layout check)',offlineStorageDenied:true,keyboard:true,forcedColors:true};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));console.log('PASS: real Chromium browser checks; screenshots saved to '+out);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
