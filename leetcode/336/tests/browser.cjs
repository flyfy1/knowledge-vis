// NODE_PATH supplies Playwright. LESSON_OUTPUT_DIR redirects every generated artifact.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18770/leetcode/336/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const copyAst=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const props=copyAst.body[1].expression.right.properties,keys=props.map(p=>p.key.name);assert.equal(keys.length,new Set(keys).size);
for(const prop of props)assert.equal(prop.value.elements.length,2);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(),errors=[],bad=[],requests=[],semantics=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});
 await page.goto(base);await page.locator('#progress').filter({hasText:/0\//}).waitFor();
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  for(let preset=0;preset<6;preset++){
   await page.selectOption('#preset',String(preset));assert(await page.locator('#prev').isDisabled());
   const count=Number(await page.locator('#position').getAttribute('max'));assert(count>0);
   for(let i=0;i<count;i++)await page.locator('#next').click();
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const final=await page.locator('#ledger').innerText();
   await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#ledger').innerText(),final);
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#historyBody tr').count(),0);
   await page.locator('#end').click();assert.equal(await page.locator('#ledger').innerText(),final);
  }
  await page.selectOption('#preset','0');
  // Semantic branches and preservation: shorter check, missing edge, finish with self exclusion.
  for(const kind of ['check','miss','finish','edge']){
   const idx=await page.evaluate(k=>PairLesson.trace(PairLesson.presets[0]).findIndex(f=>f.kind===k),kind);
   await page.locator('#position').evaluate((el,idx)=>{el.value=idx;el.dispatchEvent(new Event('input',{bubbles:true}));},idx);
   const text=await page.locator('#event').innerText();assert(!text.includes('undefined'));semantics.push({lang,kind,event:idx,text});
  }
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();const text=await page.locator('#feedback').innerText();
   assert(text.startsWith(lang==='en'?(choice===1?'Correct.':'Revise'):(choice===1?'正确。':'还需调整。')));
   semantics.push({lang,kind:'prediction',choice,text});
  }
  // Real permitted clipboard branch, exact read-back.
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  assert(await page.locator('#manualCopy').isHidden());
 }
 // Language switching preserves trace, quiz choice/reveal, focus and source panel.
 await page.locator('#sourceDetails').evaluate(el=>el.open=true);
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 const before=await page.locator('#position').inputValue();
 await page.locator('[data-lang=en]').click();await page.locator('[data-lang=zh]').click();
 assert.equal(await page.locator('#position').inputValue(),before);assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 assert.equal(await page.locator('[data-lang=zh]').evaluate(el=>el===document.activeElement),true);
 await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 // Download is actually saved to requested output dir.
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);await download.saveAs(path.join(out,'downloaded-solution.py'));assert.equal(fs.readFileSync(path.join(out,'downloaded-solution.py'),'utf8'),source);
 // Deterministic clipboard failure, in each locale; manual text remains exact.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('test denial');}}}));
 for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.locator('#copyText').evaluate(el=>el===document.activeElement),true);semantics.push({lang,kind:'copyFallback',text:await page.locator('#copyStatus').innerText()});}
 // Re-check successful branch hides manual copy after failure.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copiedSource=s;}}}));await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.copiedSource),source);assert(await page.locator('#manualCopy').isHidden());
 // Keyboard activation + focus outline.
 await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'end');
 const focus=await page.locator('#end').evaluate(el=>{const s=getComputedStyle(el);return {width:s.outlineWidth,color:s.outlineColor,style:s.outlineStyle};});assert.equal(focus.width,'3px');
 await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'1');
 // Link files and fragment targets, including reused sibling concepts.
 const hrefs=await page.locator('a[href]').evaluateAll(els=>els.map(el=>el.href));
 for(const href of hrefs){const url=new URL(href);if(url.origin!==new URL(base).origin)continue;const res=await context.request.get(url.href);assert(res.ok(),href);if(url.hash){const text=await res.text();assert(text.includes(`id="${url.hash.slice(1)}"`),href);}}
 // Deep-link navigation must land below sticky nav.
 await page.locator('.step-nav a[href="#step3"]').click();await page.waitForFunction(()=>Math.abs(document.getElementById('step3').getBoundingClientRect().top-110)<3);
 const geom=await page.evaluate(()=>({section:document.getElementById('step3').getBoundingClientRect().top,nav:document.querySelector('nav').getBoundingClientRect().bottom}));assert(geom.section>=geom.nav-2,JSON.stringify(geom));
 const screenshots=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');
  await page.locator('#position').evaluate(el=>{el.value='12';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#words').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} overflow`);
  const name=`trace-${lang}-${width}.png`;await page.screenshot({path:path.join(out,name)});screenshots.push(name);
  const finished=await page.evaluate(()=>PairLesson.trace(PairLesson.presets[1]).findIndex(f=>f.kind==='finish'&&f.i===3));
  await page.locator('#position').evaluate((el,i)=>{el.value=i;el.dispatchEvent(new Event('input',{bubbles:true}));},finished);
  await page.locator('#tree').scrollIntoViewIfNeeded();
  const activeGeometry=await page.locator('#tree').evaluate(el=>{const row=el.querySelector('.active-row').getBoundingClientRect(),box=el.getBoundingClientRect(),head=el.querySelector('thead').getBoundingClientRect();return {rowTop:row.top,rowBottom:row.bottom,boxBottom:box.bottom,headerBottom:head.bottom};});
  assert(activeGeometry.rowTop>=activeGeometry.headerBottom-2&&activeGeometry.rowBottom<=activeGeometry.boxBottom+2,JSON.stringify(activeGeometry));
  const stateName=`state-${lang}-${width}.png`;await page.screenshot({path:path.join(out,stateName)});screenshots.push(stateName);
  if(width===320){await page.locator('#tree').focus();await page.keyboard.press('End');await page.locator('#tree').evaluate(el=>el.scrollLeft=el.scrollWidth);const rightName=`state-${lang}-320-right.png`;await page.screenshot({path:path.join(out,rightName)});screenshots.push(rightName);await page.locator('#tree').evaluate(el=>el.scrollLeft=0);}
 }
 for(const lang of ['en','zh']){
  await page.setViewportSize({width:780,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.evaluate(()=>{document.documentElement.style.zoom='2';window.dispatchEvent(new Event('resize'));});await page.locator('#words').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const name=`trace-${lang}-zoom200.png`;await page.screenshot({path:path.join(out,name)});screenshots.push(name);
  await page.locator('#tree').scrollIntoViewIfNeeded();
  const zg=await page.locator('#tree').evaluate(el=>{const row=el.querySelector('.active-row').getBoundingClientRect(),box=el.getBoundingClientRect(),head=el.querySelector('thead').getBoundingClientRect();return {rowTop:row.top,rowBottom:row.bottom,boxBottom:box.bottom,headerBottom:head.bottom};});
  assert(zg.rowTop>=zg.headerBottom-3&&zg.rowBottom<=zg.boxBottom+3,JSON.stringify(zg));
  const stateName=`state-${lang}-zoom200.png`;await page.screenshot({path:path.join(out,stateName)});screenshots.push(stateName);
  await page.evaluate(()=>{document.documentElement.style.zoom='';window.dispatchEvent(new Event('resize'));});
 }
 // Rendered color pairs: core text, muted/disabled labels, focus, selected language.
 await page.locator('#reset').click();
 const pairs=await page.evaluate(()=>{
  const bg=getComputedStyle(document.body).backgroundColor,panel=getComputedStyle(document.querySelector('.stage')).backgroundColor;
  return [{role:'body',fg:getComputedStyle(document.body).color,bg},{role:'stage label',fg:getComputedStyle(document.querySelector('.stage label')).color,bg:panel},{role:'hint',fg:getComputedStyle(document.querySelector('.hint')).color,bg},{role:'disabled button',fg:getComputedStyle(document.querySelector('#prev:disabled')).color,bg:getComputedStyle(document.querySelector('#prev')).backgroundColor},{role:'focus on panel',fg:getComputedStyle(document.querySelector('#end')).getPropertyValue('--accent2').trim(),bg:panel},{role:'active language',fg:getComputedStyle(document.querySelector('.lang-toggle .active')).color,bg:getComputedStyle(document.querySelector('.lang-toggle .active')).backgroundColor},{role:'table muted',fg:getComputedStyle(document.querySelector('th')).color,bg:getComputedStyle(document.querySelector('th')).backgroundColor}];
 });
 function luminance(s){if(s.startsWith('#'))s='rgb('+[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)).join(',')+')';const a=s.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
 for(const p of pairs){const a=luminance(p.fg),b=luminance(p.bg);p.ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(p.ratio>=(p.role.startsWith('focus')?3:4.5),JSON.stringify(p));}
 // Blocked storage still gives usable locale switching and trace.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(base);await bp.locator('#progress').waitFor();await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();assert.equal(await bp.locator('#position').inputValue(),'1');await blocked.close();
 // Offline source display loads from exact local mirror without fetch.
 const offline=await browser.newContext();const op=await offline.newPage();op.on('pageerror',e=>errors.push(String(e)));await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.locator('#next').click();assert.equal(await op.locator('#position').inputValue(),'1');await offline.close();
 assert.deepStrictEqual(errors,[]);assert.deepStrictEqual(bad,[]);assert(requests.every(url=>new URL(url).origin===new URL(base).origin));
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({status:'pass',locales:['en','zh'],presets:6,widths:[320,390,736,1440],zoom:'CSS zoom 200%, viewport 780px (390px layout)',screenshots,semantics,focus,contrast:pairs,cssBytes,copyDuplicateKeys:'AST-checked',sourceDownloadCopy:'exact',errors,bad,allRequestsLocal:true,storageBlocked:true,offline:true},null,2));
 await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
