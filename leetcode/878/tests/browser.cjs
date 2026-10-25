const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/878/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),core=require('../core.js');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],badAssets=[],external=[],semantics=[],fit=[],focusChecks=[],links=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push({text:m.text(),url:m.location().url});});page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.locator('#operation').waitFor();assert((await page.locator('#operation').textContent()).includes('[1, 8]'));
 const lang=async l=>page.locator(`[data-lang=${l}]`).click();
 const state=async()=>page.locator('#step2 .stage').textContent();
 for(const l of ['en','zh']){
  await lang(l);
  assert.equal(await page.locator('h1').textContent(),l==='zh'?'#878 · 第 N 个神奇数字':'#878 · Nth Magical Number');assert.equal(await page.title(),l==='zh'?'#878 · 第 N 个神奇数字':'#878 · Nth Magical Number');
  const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('C(x) = x//a + x//b − x//L'));assert(formula.includes('(a//gcd(a,b))·b'));
  for(const x of [1,5,6,7,18]){
   await page.locator('#countX').fill(String(x));await page.locator('#countX').dispatchEvent('input');
   assert((await page.locator('#countResult').textContent()).includes(`${Math.floor(x/2)} + ${Math.floor(x/3)} − ${Math.floor(x/6)} = ${core.count(x,2,3)}`));assert.equal(await page.locator('#countNumbers .number').count(),x);
   semantics.push({locale:l,x,count:await page.locator('#countResult').textContent()});
  }
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#result').isHidden());
   const frames=core.trace(core.presets[p]);
   for(let i=1;i<frames.length;i++){
    await page.locator('#next').click();const f=frames[i];
    assert.equal(await page.locator('#beforeInterval').textContent(),`[${f.beforeLo}, ${f.beforeHi}]`);assert.equal(await page.locator('#afterInterval').textContent(),`[${f.lo}, ${f.hi}]`);
    assert((await page.locator('#tested').textContent()).includes(`C(mid)=${f.ca}+${f.cb}−${f.both}=${f.c}`));
    assert.equal(await page.locator('#history li').count(),i+1);assert((await page.locator('#history li.current').textContent()).includes('mid='+f.mid));
    const snapshot=await state();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await state(),snapshot);
    // Keep representative renderings of both branch meanings.
    if(p===0)semantics.push({locale:l,frame:i,before:await page.locator('#beforeInterval').textContent(),test:await page.locator('#tested').textContent(),after:await page.locator('#afterInterval').textContent(),decision:await page.locator('#operation').textContent()});
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const raw=frames.at(-1).lo;assert((await page.locator('#result').textContent()).includes(String(raw)));assert((await page.locator('#result').textContent()).includes(String(raw%1000000007)));
   semantics.push({locale:l,preset:p,endpoint:await page.locator('#result').textContent()});
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());assert(await page.locator('#tested').isHidden());assert(await page.locator('#result').isHidden());assert.equal(await page.locator('#history li').count(),1);
   await page.locator('#end').click();assert(await page.locator('#next').isDisabled());await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');assert(await page.locator('#prev').isDisabled());
  }
  for(let c=0;c<3;c++){
   await page.locator(`[name=prediction][value="${c}"]`).check();assert(await page.locator('#feedback').isHidden());assert.equal(await page.locator('#feedback').textContent(),'');await page.locator('#reveal').click();
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('[12,16]'));assert(feedback.includes('15'));assert(feedback.startsWith(l==='zh'?(c===1?'正确。':'再看边界。'):(c===1?'Correct.':'Check the boundary.')));
   semantics.push({locale:l,choice:c,feedback});
  }
  await page.selectOption('#preset','2');await page.locator('#next').click();await page.locator('#next').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  const pos=await page.locator('#position').inputValue(),countX=await page.locator('#countX').inputValue();
  await page.locator('#next').focus();await page.evaluate(()=>document.querySelector('[data-lang='+ (document.documentElement.lang==='en'?'zh':'en')+']').click());
  assert.equal(await page.locator('#position').inputValue(),pos);assert.equal(await page.locator('#countX').inputValue(),countX);assert(await page.locator('#feedback').isVisible());assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.evaluate(()=>document.activeElement.id),'next');await lang(l);
  assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  // EACH fallback starts with a distinct non-source clipboard value, verified first.
  const sentinel='878-'+l+'-'+Date.now();await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('fallback test'));});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.deepEqual(await page.locator('#copyText').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  semantics.push({locale:l,copy:'automatic clipboard, downloaded bytes, rendered text and native fallback all exact including final newline',fallback:await page.locator('#copyStatus').textContent(),sentinel,host:process.platform});
 }
 // Layout, long numeric bounds, operation/history association, keyboard and focus.
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.selectOption('#preset','5');await page.locator('#next').click();await page.locator('#next').click();await page.locator('#next').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return{width:e.clientWidth,text:c.measureText(e.selectedOptions[0].textContent).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20,font:s.font};});
  fit.push({viewport:width,locale:l,...budget});fs.writeFileSync(path.join(out,'fit-progress.json'),JSON.stringify(fit,null,2));assert(budget.text<=budget.available,JSON.stringify(budget));
  await page.locator('#beforeInterval').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`state-${width}-${l}.png`)});
  // Essential interval values must fit in their own boxes, not overlap adjacent text.
  for(const id of ['beforeInterval','afterInterval'])assert(await page.locator('#'+id).evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.locator('#prev').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
  const focus=await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return{width:s.outlineWidth,color:s.outlineColor,height:e.getBoundingClientRect().height};});assert.equal(focus.width,'3px');assert(focus.height>=48);focusChecks.push({locale:l,viewport:width,...focus});
 }
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const l of ['en','zh']){await lang(l);await page.locator('#beforeInterval').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom-200-${l}.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='');
 // Document screenshots of the actual learning path, not just numerical boxes.
 await page.setViewportSize({width:1440,height:1000});
 for(const l of ['en','zh']){await lang(l);await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#countX').fill('6');await page.locator('#countX').dispatchEvent('input');await page.screenshot({path:path.join(out,`lesson-${l}.png`),fullPage:true});}
 // Keyboard deep links must expose the section heading below the sticky navigation.
 for(const l of ['en','zh']){
  await lang(l);for(let i=0;i<5;i++){const a=page.locator(`.step-nav a[href="#step${i}"]`);await a.focus();await page.keyboard.press('Enter');await page.waitForTimeout(80);const geo=await page.locator('#step'+i).evaluate(e=>({top:e.getBoundingClientRect().top}));const navBottom=await page.locator('.step-nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(geo.top>=navBottom-1,JSON.stringify({i,geo,navBottom}));}
  for(const href of ['../668/#step2','../793/#step2']){const a=page.locator(`.related a[href="${href}"]`),label=await a.textContent();await a.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+href.slice(3));const text=await page.locator('#step2').textContent();assert(text.length>100);links.push({locale:l,label,url:page.url(),excerpt:text.slice(0,1200)});await page.goto(url);await lang(l);}
 }
 // Actual rendered colors/opacity, then measured contrast ratios.
 const rendered=await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return{color:s.color,background:s.backgroundColor,opacity:s.opacity};});assert.equal(rendered.opacity,'1');
 function lum(hex){const a=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 const calibration=[['000000',0],['ffffff',1],['ff0000',.2126],['00ff00',.7152],['0000ff',.0722]];for(const [hex,expected] of calibration)assert(Math.abs(lum(hex)-expected)<1e-12);assert(Math.abs((lum('ffffff')+.05)/(lum('000000')+.05)-21)<1e-12);const near=(lum('747474')+.05)/.05;assert(Math.abs(near-4.492948)<.000001&&near<4.5);
 const contrasts=[];for(const [fg,bg] of [['e8edf4','161b22'],['9aa7b8','161b22'],['9aa7b8','1c2330'],['6ee7ff','161b22'],['ffb454','161b22'],['ffb454','1c2330'],['c9d4e2','0a0e14'],['e8edf4','090e16'],['0d1117','6ee7ff'],['ffb454','0d1117']]){const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);contrasts.push({fg,bg,ratio});}
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});const other=await denied.newPage();await other.goto(url);await other.locator('#next').click();await other.locator('[data-lang=zh]').click();assert.equal(await other.locator('#position').inputValue(),'1');await other.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await other.locator('#prev').focus();assert.equal(await other.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await denied.close();
 // Offline opening uses only embedded source and local scripts.
 const offline=await browser.newContext({offline:true});const local=await offline.newPage();await local.goto('file://'+path.join(root,'index.html'));assert.equal(await local.locator('#pythonCode').textContent(),source);await local.locator('#next').click();assert.equal(await local.locator('#position').inputValue(),'1');await offline.close();
 fs.writeFileSync(path.join(out,'asset-diagnostics.json'),JSON.stringify({errors,badAssets,external},null,2));assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.resolve(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({result:'pass',browser:await browser.version(),platform:process.platform,semantics,fit,focusChecks,links,rendered,contrastCalibration:{primaries:calibration,blackWhite:21,nearThreshold:near},contrasts,cssBytes,errors,badAssets,external,zoom:'Chromium CSS zoom=2 at 1440px; narrow widths tested independently. Native chrome zoom/physical devices not tested.'},null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
