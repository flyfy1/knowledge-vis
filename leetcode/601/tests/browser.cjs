const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/601/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const expected=[[4,5,6,7],[5,6,7,8],[],[],[1,2,3,7,8,9],[],[],[]];
const checks=[],shots=[],errors=[],requests=[],semantics=[];
const record=name=>checks.push(name);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 page.on('request',r=>requests.push(r.url()));
 await page.goto(base);await page.locator('#progress').filter({hasText:'0/4'}).waitFor();
 async function lang(l){await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 for(const l of ['en','zh']){
  await lang(l);
  await page.selectOption('#hand','99');assert.match(await page.textContent('#handResult'),/\[\]/);
  assert.match(await page.textContent('#handResult'),l==='en'?/breaks the triple/:/打断三连/);
  await page.selectOption('#hand','100');assert.match(await page.textContent('#handResult'),/\[4, 5, 6\]/);
  for(let p=0;p<expected.length;p++){
   await page.selectOption('#preset',String(p));const total=Number(await page.locator('#position').getAttribute('max'));
   assert.ok(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#position').inputValue(),'0');
   for(let k=1;k<=total;k++){
    await page.click('#next');assert.equal(await page.locator('#position').inputValue(),String(k));
    const snap=await page.locator('#ledger').innerHTML();
    await page.click('#prev');assert.equal(await page.locator('#position').inputValue(),String(k-1));
    await page.click('#next');assert.equal(await page.locator('#ledger').innerHTML(),snap);
   }
   assert.ok(await page.locator('#next').isDisabled());assert.ok(await page.locator('#end').isDisabled());
   assert.match(await page.textContent('#final'),new RegExp('\\['+expected[p].join(', ')+'\\]'));
   const snap=await page.locator('#ledger').innerHTML();await lang(l==='en'?'zh':'en');
   assert.equal(await page.locator('#position').inputValue(),String(total));await lang(l);
   assert.equal(await page.locator('#ledger').innerHTML(),snap);
   await page.click('#reset');assert.equal(await page.locator('#position').inputValue(),'0');
   if(total)await page.click('#end');else assert.ok(await page.locator('#end').isDisabled());assert.equal(await page.locator('#position').inputValue(),String(total));
  }
  await page.selectOption('#preset','0');await page.click('#next');
  const hit=await page.textContent('#event');assert.match(hit,/s=4/);assert.match(hit,/\[4, 5, 6\]/);
  assert.match(hit,l==='en'?/all belong to eligible/:/都在 eligible/);
  await page.click('#end');const miss=await page.textContent('#event');assert.match(miss,/s=7/);assert.match(miss,/\[8, 9\]/);
  assert.match(miss,l==='en'?/earlier stay marked/:/早先证明的行继续保留/);
  semantics.push({locale:l,state:'hit s=4',text:hit},{locale:l,state:'miss s=7',text:miss});
  for(const choice of ['0','1','2']){
   await page.check(`[name=prediction][value="${choice}"]`);assert.ok(await page.locator('#feedback').isHidden());
   await page.click('#reveal');const feedback=await page.textContent('#feedback');assert.match(feedback,/\[20,21,22\]/);
   assert.match(feedback,choice==='2'?(l==='en'?/Correct prediction/:/预测正确/):(l==='en'?/Revise/:/需要修正/));
   const before=feedback;await lang(l==='en'?'zh':'en');assert.ok(await page.locator(`[name=prediction][value="${choice}"]`).isChecked());
   assert.ok(await page.locator('#feedback').isVisible());await lang(l);assert.equal(await page.textContent('#feedback'),before);
   await page.click('#reset');assert.ok(await page.locator('#feedback').isVisible());
  }
  await page.check('[name=prediction][value="0"]');assert.ok(await page.locator('#feedback').isHidden());
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copied=s;}}}));
  await page.click('#copy');assert.equal(await page.evaluate(()=>window.copied),source);assert.ok(await page.locator('#manualCopy').isHidden());
  semantics.push({locale:l,state:'copy success',text:await page.textContent('#copyStatus')});
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));
  await page.click('#copy');assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
  assert.equal(await page.evaluate(()=>document.querySelector('#copyText').selectionEnd),source.length);
  assert.equal(await page.evaluate(()=>document.querySelector('#copyText').selectionStart),0);
  const fallback=await page.textContent('#copyStatus');assert.match(fallback,l==='en'?/copy manually/:/手动复制/);
  semantics.push({locale:l,state:'copy denied',text:fallback});
  record(`${l}: all 8 presets, step/back replay, endpoints/reset/end, hand threshold, all predictions and changed answer, locale state, exact copy and fallback`);
 }
 await page.locator('#sourceDetails').evaluate(el=>{el.open=true;});assert.equal(await page.textContent('#pythonCode'),source);
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.evaluate(()=>{delete navigator.clipboard;});await page.click('#copy');
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);record('real Chromium clipboard write/read exact source');
 const downloadPromise=page.waitForEvent('download');await page.click('a[download]');const download=await downloadPromise;
 assert.equal(fs.readFileSync(await download.path(),'utf8'),source);record('display/download exact source including final newline');
 await lang('en');await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#position').inputValue(),'1');await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'2');
 const focus=await page.locator('#position').evaluate(el=>({outline:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
 assert.equal(focus.outline,'solid');assert.equal(focus.width,'3px');record('keyboard Enter and range ArrowRight; 3px visible focus');
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await lang(l);
  for(let preset=0;preset<8;preset++){
   await page.selectOption('#preset',String(preset));
   const size=await page.locator('#preset').evaluate(el=>{const c=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=c.font;return {label:el.selectedOptions[0].text,text:ctx.measureText(el.selectedOptions[0].text).width,width:el.clientWidth,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight)};});
   assert.ok(size.text+size.padding+20<=size.width,JSON.stringify(size));
  }
  await page.selectOption('#preset','1');await page.click('#end');
  const geometry=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,
    selects:[...document.querySelectorAll('select')].map(el=>{const c=getComputedStyle(el),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=c.font;return {id:el.id,width:el.clientWidth,textWidth:ctx.measureText(el.selectedOptions[0].text).width,padding:parseFloat(c.paddingLeft)+parseFloat(c.paddingRight)};}),
    heights:[...document.querySelectorAll('button,select')].map(el=>({id:el.id,h:el.getBoundingClientRect().height})),
    rows:document.querySelector('#rows').getBoundingClientRect().width}));
  assert.ok(geometry.scroll<=width+1,JSON.stringify(geometry));geometry.heights.forEach(x=>assert.ok(x.h>=48,x.id));
  geometry.selects.forEach(x=>assert.ok(x.textWidth+x.padding+20<=x.width,JSON.stringify(x)));
  await page.locator('#step2').scrollIntoViewIfNeeded();
  await page.evaluate(()=>{document.querySelector('nav').style.visibility='hidden';});
  const filename=`trace-${l}-${width}.png`;await page.locator('#step2 .stage').screenshot({path:path.join(out,filename)});shots.push({filename,locale:l,width,geometry,captureNote:'sticky nav hidden only for full element capture'});
  await page.evaluate(()=>{document.querySelector('nav').style.visibility='';});
  if(width===320){
   await page.locator('#ledgerWrap').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(100);
   assert.ok(await page.locator('#ledgerWrap').evaluate(el=>el.scrollLeft>0));
   await page.locator('#ledgerWrap').evaluate(el=>{el.scrollLeft=el.scrollWidth;});
   assert.ok(await page.locator('#ledgerWrap').evaluate(el=>Math.abs(el.querySelector('tbody th').getBoundingClientRect().left-el.getBoundingClientRect().left)<8));
   await page.evaluate(()=>{document.querySelector('nav').style.visibility='hidden';});
   const right=`ledger-right-${l}.png`;await page.locator('#ledgerWrap').screenshot({path:path.join(out,right)});shots.push({filename:right,locale:l,width,scroll:'right endpoint'});
   await page.evaluate(()=>{document.querySelector('nav').style.visibility='';window.scrollTo(0,0);});
   const top=`header-${l}-320.png`;await page.screenshot({path:path.join(out,top)});shots.push({filename:top,locale:l,width,view:'real viewport header'});
  }
 }
 // Rendered page zoom doubles CSS dimensions, equivalent content stress to 200% browser zoom.
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>{document.documentElement.style.zoom='2';});
 for(const l of ['en','zh']){
  await lang(l);await page.selectOption('#preset','0');await page.click('#next');await page.click('#next');
  await page.locator('#step2').scrollIntoViewIfNeeded();const filename=`zoom200-${l}.png`;
  await page.evaluate(()=>{document.querySelector('nav').style.visibility='hidden';});
  await page.locator('#step2 .stage').screenshot({path:path.join(out,filename)});await page.evaluate(()=>{document.querySelector('nav').style.visibility='';});shots.push({filename,locale:l,zoom:'200% CSS page zoom',viewport:1280});
  assert.ok(await page.evaluate(()=>document.querySelector('.stage').getBoundingClientRect().right<=innerWidth));
 }
 await page.evaluate(()=>{document.documentElement.style.zoom='';});
 // Deep links: use actual navigation and independently check target existence.
 await page.setViewportSize({width:1440,height:1000});await page.locator('nav a[href="#step3"]').click();
 await page.waitForTimeout(400);assert.equal(new URL(page.url()).hash,'#step3');
 assert.ok(await page.locator('#step3').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('nav').getBoundingClientRect().bottom-1));
 for(const href of await page.locator('.related a').evaluateAll(els=>els.map(e=>e.href))){
  const u=new URL(href),r=await context.request.get(u.origin+u.pathname);assert.ok(r.ok());assert.match(await r.text(),new RegExp(`id=["']${u.hash.slice(1)}["']`));
 }
 record('deep navigation clears sticky header; related anchors exist');
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();
 assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');record('forced-colors focus and reduced-motion render');
 // Storage denial starts and switches normally; file:// tests offline mirrors without fetch.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage denied');}});});
 const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(base);await bp.click('[data-lang=zh]');await bp.click('#next');await bp.click('[data-lang=en]');assert.equal(await bp.locator('#position').inputValue(),'1');await blocked.close();
 const offline=await browser.newPage();offline.on('pageerror',e=>errors.push(String(e)));await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.textContent('#pythonCode'),source);await offline.click('#next');assert.equal(await offline.locator('#position').inputValue(),'1');await offline.close();record('blocked storage and file:// offline source/trace');
 assert.deepEqual(errors,[]);assert.ok(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')));
 const contrast=await page.evaluate(()=>{
  const s=getComputedStyle(document.documentElement),names=['bg','panel','panel2','text','muted','accent','accent2','good','bad'],colors=Object.fromEntries(names.map(n=>[n,s.getPropertyValue('--'+n).trim()]));
  function lum(h){const c=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  function ratio(a,b){const x=lum(colors[a]),y=lum(colors[b]);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  return {colors,pairs:['bg','panel','panel2'].flatMap(bg=>['text','muted','accent','accent2'].map(ink=>({ink,bg,ratio:ratio(ink,bg)}))),focus:ratio('accent2','panel2'),primary:ratio('bg','accent')};
 });contrast.pairs.forEach(p=>assert.ok(p.ratio>=4.5));assert.ok(contrast.focus>=3);assert.ok(contrast.primary>=4.5);
 const report={kind:'author browser self-check',browser:browser.version(),base,checks,shots,semantics,errors,externalRequests:requests.filter(u=>!u.startsWith('http://127.0.0.1:18770/')),contrast,cssBytes:fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size,limitations:['CSS page zoom stress, not physical device or browser-toolbar zoom proof','Screenshots require separate visual inspection','No independent review, novice learner test, LeetCode submission or production deployment']};
 assert.ok(report.cssBytes<25000);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({checks,shots:shots.length,errors,cssBytes:report.cssBytes}));
})().catch(e=>{console.error(e);process.exit(1);});
