// Run with NODE_PATH supplied by environment. OUTPUT_DIR redirects all emitted evidence.
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.LESSON_URL||'http://127.0.0.1:18779/leetcode/124/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const p=await context.newPage();const errors=[],badAssets=[],remote=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)badAssets.push([r.status(),r.url()])});p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18779')&&!r.url().startsWith('data:'))remote.push(r.url())});
 await p.goto(base);await p.locator('#progress').filter({hasText:'3'}).waitFor();
 const shot=async name=>p.screenshot({path:path.join(out,name+'.png'),fullPage:true});
 const treeShot=async name=>{await p.locator('#tree').evaluate(e=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-16,behavior:'instant'}));await p.locator('#tree').screenshot({path:path.join(out,name+'.png')});};
 const snapshot=()=>p.evaluate(()=>({tree:document.querySelector('#tree').innerHTML,ledger:document.querySelector('#ledger').innerHTML,calc:document.querySelector('#calculation').textContent,progress:document.querySelector('#progress').textContent}));
 let interactions=0;
 for(const lang of ['en','zh']){
  await p.locator(`[data-lang=${lang}]`).click();assert.equal(await p.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let preset=0;preset<6;preset++){
   await p.selectOption('#preset',String(preset));assert(await p.locator('#prev').isDisabled());assert(await p.locator('#reset').isDisabled());assert.equal(await p.locator('#ledger tr').count(),0);
   const n=await p.locator('#position').getAttribute('max');let previous;
   for(let i=0;i<Number(n);i++){previous=await snapshot();await p.locator('#next').click();const next=await snapshot();await p.locator('#prev').click();assert.deepEqual(await snapshot(),previous);await p.locator('#next').click();assert.deepEqual(await snapshot(),next);interactions+=3;}
   assert(await p.locator('#next').isDisabled());assert(await p.locator('#end').isDisabled());const final=await snapshot();
   await p.locator('#reset').click();assert.equal(await p.locator('#ledger tr').count(),0);await p.locator('#end').click();assert.deepEqual(await snapshot(),final);
   const rootBefore=Number(await p.locator('#rootValue').inputValue());await p.locator('#rootValue').focus();await p.keyboard.press(rootBefore===10?'ArrowLeft':'ArrowRight');assert.equal(Number(await p.locator('#rootValue').inputValue()),rootBefore+(rootBefore===10?-1:1));assert.equal(await p.locator('#ledger tr').count(),0);await p.locator('#end').click();
   await p.locator('#position').fill('0');assert(await p.locator('#prev').isDisabled());await p.locator('#position').fill(n);assert(await p.locator('#next').isDisabled());
  }
  await p.selectOption('#preset','1');await p.locator('#end').click();const expected=await snapshot();await p.locator(`[data-lang=${lang==='zh'?'en':'zh'}]`).click();assert.equal(await p.locator('#position').inputValue(),'5');assert.equal(await p.locator('#preset').inputValue(),'1');await p.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snapshot(),expected);
  assert(await p.locator('#reveal').isDisabled() || await p.locator('[name=prediction]:checked').count());
  for(let option=0;option<3;option++){
   await p.locator(`[name=prediction][value="${option}"]`).check();assert(await p.locator('#feedback').isHidden());await p.locator('#reveal').click();assert(await p.locator('#feedback').isVisible());assert((await p.locator('#feedback').innerText()).includes('13'));
   await p.locator(`[data-lang=${lang==='zh'?'en':'zh'}]`).click();assert(await p.locator('#feedback').isVisible());assert(await p.locator(`[name=prediction][value="${option}"]`).isChecked());await p.locator(`[data-lang=${lang}]`).click();
  }
  await p.locator('[name=prediction][value="1"]').check();assert(await p.locator('#feedback').isHidden());
  await p.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await p.locator('#pythonCode').textContent(),fs.readFileSync(path.join(root,'solution.py'),'utf8'));
  await p.locator('#copy').click();assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),fs.readFileSync(path.join(root,'solution.py'),'utf8'));assert(await p.locator('#manualCopy').isHidden());
  const [download]=await Promise.all([p.waitForEvent('download'),p.locator('a[download]').click()]);const file=path.join(out,lang+'-download.py');await download.saveAs(file);assert.equal(fs.readFileSync(file,'utf8'),fs.readFileSync(path.join(root,'solution.py'),'utf8'));
  for(const width of [320,390,736,1440]){
   await p.setViewportSize({width,height:900});await p.locator('#step2').scrollIntoViewIfNeeded();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await shot(`${lang}-${width}`);await p.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-lab.png`)});await treeShot(`${lang}-${width}-tree`);if(width===320){await p.locator('#ledgerWrap').focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);assert(await p.locator('#ledgerWrap').evaluate(e=>e.scrollLeft>0));await p.locator('#ledgerWrap').evaluate(e=>e.scrollLeft=0);}
   for(const id of ['next','prev','reset','end']){const box=await p.locator('#'+id).boundingBox();assert(box.height>=48);assert(box.width>=48);}
  }
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.locator('#step2').scrollIntoViewIfNeeded();await shot(`${lang}-zoom200`);await p.setViewportSize({width:1440,height:1400});await treeShot(`${lang}-zoom200-tree`);await p.evaluate(()=>document.documentElement.style.zoom='');
 }
 await p.selectOption('#preset','0');for(const [value,expected] of [['10',15],['-10',3],['1',6]]){await p.locator('#rootValue').fill(value);assert.equal(await p.locator('#ledger tr').count(),0);await p.locator('#end').click();assert((await p.locator('#progress').innerText()).endsWith(String(expected)));}
 await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.selectOption('#preset','2');assert(await p.locator('#feedback').isVisible());
 // Clipboard denial: manual fallback is localized, selected and focusable.
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('denied'))}}));
 for(const lang of ['zh','en']){await p.locator(`[data-lang=${lang}]`).click();await p.locator('#copy').click();assert(await p.locator('#manualCopy').isVisible());assert.equal(await p.locator('#copyText').inputValue(),fs.readFileSync(path.join(root,'solution.py'),'utf8'));assert(await p.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionEnd-e.selectionStart===e.value.length));}
 // Actual Tab and Space operate quiz, with rendered focus outline.
 await p.locator('[name=prediction][value="0"]').focus();await p.keyboard.press('Space');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'reveal');const focus=await p.locator('#reveal').evaluate(e=>({outline:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.outline,'3px');await p.keyboard.press('Enter');assert(await p.locator('#feedback').isVisible());
 // Deep anchors land below sticky navigation; related anchors resolve on existing lessons.
 await p.locator('a[href="#step1"]').click();await p.waitForFunction(()=>Math.abs(document.querySelector('#step1').getBoundingClientRect().top-90)<3);
 const related=await p.locator('.related a').evaluateAll(es=>es.map(e=>e.href));for(const href of related){const url=new URL(href);const r=await context.request.get(url.href.split('#')[0]);assert(r.ok());assert((await r.text()).includes('id="'+url.hash.slice(1)+'"'));}
 // Measure actual rendered palette pairs on surfaces and control states.
 const pairs=await p.evaluate(()=>{
 const result=[];for(const [selector,background] of [['body','body'],['.explain','.step'],['.hint','.step'],['#progress','#progress'],['#prev','#prev'],['#next','#next'],['#copy','#copy'],['.tree-svg text','.stage'],['.tree-svg .status','.stage']]){
 const e=document.querySelector(selector);let b=document.querySelector(background);while(getComputedStyle(b).backgroundColor==='rgba(0, 0, 0, 0)'&&b.parentElement)b=b.parentElement;result.push({selector,foreground:getComputedStyle(e)[selector.startsWith('.tree-svg')?'fill':'color'],background:selector.startsWith('.tree-svg')?getComputedStyle(document.querySelector('.tree-node')).fill:getComputedStyle(b).backgroundColor});}
 return result;});
 function lum(s){const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
 const contrast=pairs.map(pair=>{const a=lum(pair.foreground),b=lum(pair.background),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5,JSON.stringify({...pair,ratio}));return {...pair,ratio};});
 for(const bg of ['rgb(13, 17, 23)','rgb(28, 35, 48)']){const a=lum(focus.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=3);contrast.push({selector:'focus outline',foreground:focus.color,background:bg,ratio});}
 const storageContext=await browser.newContext();await storageContext.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};});const s=await storageContext.newPage();s.on('pageerror',e=>errors.push(e.message));await s.goto(base);await s.locator('[data-lang=zh]').click();await s.locator('#next').click();await s.locator('[data-lang=en]').click();assert.equal(await s.locator('#position').inputValue(),'1');await storageContext.close();
 const offline=await context.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),fs.readFileSync(path.join(root,'solution.py'),'utf8'));await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(remote,[]);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({kind:'author browser self-check',url:base,interactions,locales:['en','zh'],widths:[320,390,736,1440],zoom:'CSS 200%',presets:6,checks:['all frame rewinds','endpoints','root edit restart','slider','quiz all options/reveal/change/locale preservation','actual clipboard and denial fallback','download/display parity','blocked storage','offline source','keyboard/focus','related/deep anchors','local assets'],errors,badAssets,remote,focus,contrast},null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
