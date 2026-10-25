const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url='http://127.0.0.1:18770/leetcode/871/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],badAssets=[],semantic=[],fit=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push({text:m.text(),url:m.location().url,page:page.url()});});page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url());});
 await page.goto(url);await page.locator('#operation').waitFor();
 const lang=async l=>page.locator(`[data-lang=${l}]`).click();
 for(const l of ['en','zh']){
  await lang(l);assert.equal(await page.locator('#reveal').isDisabled(),l==='en');
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert.match(await page.locator('#progress').textContent(),/0\//);
   assert(await page.locator('#prev').isDisabled());
   let index=0;
   while(!await page.locator('#next').isDisabled()){
    await page.locator('#next').click();index++;
    const snapshot=await page.locator('#step2 .stage').textContent();
    await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#step2 .stage').textContent(),snapshot);
   }
   const text=await page.locator('#operation').textContent(),expected=[1,2,1,-1,0,2][p];assert(text.includes(expected===-1?'−1':String(expected)));
   semantic.push({locale:l,preset:p,endpoint:text});
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());await page.locator('#end').click();assert(await page.locator('#next').isDisabled());
   await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');assert(await page.locator('#prev').isDisabled());
  }
  for(let answer=0;answer<3;answer++){
   await page.locator(`[name=prediction][value="${answer}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
   assert((await page.locator('#feedback').textContent()).includes('55'));assert((await page.locator('#feedback').textContent()).includes('75'));
   semantic.push({locale:l,choice:answer,feedback:await page.locator('#feedback').textContent()});
  }
  await page.selectOption('#preset','1');await page.locator('#next').click();await page.locator('#next').click();
  const before=await page.locator('#position').inputValue();await lang(l==='en'?'zh':'en');assert.equal(await page.locator('#position').inputValue(),before);assert(await page.locator('#feedback').isVisible());assert(await page.locator('[name=prediction][value="2"]').isChecked());await lang(l);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  // Fresh verified sentinel for EACH real manual transfer, host Linux => Control+C.
  const sentinel='871-'+l+'-'+Date.now();await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('denied for fallback check'));});
  await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
  assert.deepEqual(await page.locator('#copyText').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
  await page.keyboard.press('Control+c');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  semantic.push({locale:l,fallback:await page.locator('#copyStatus').textContent(),nativeTransfer:'exact with verified fresh sentinel; Linux Control+C'});
 }
 // Layout: dense candidate state, localized labels, actual font width budgets.
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);await page.selectOption('#preset','1');for(let i=0;i<5;i++)await page.locator('#next').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;const needed=c.measureText(e.selectedOptions[0].textContent).width;return{width:e.clientWidth,text:needed,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20};});fit.push({viewport:width,locale:l,...budget});assert(budget.text<=budget.available,JSON.stringify(budget));
  await page.locator('#stations').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`state-${width}-${l}.png`)});
  // Native keyboard activation and visible focus.
  await page.locator('#prev').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'4');
  const focus=await page.locator('#prev').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 }
 // 200% page magnification in the real browser via CSS zoom; effective 720px layout.
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const l of ['en','zh']){await lang(l);await page.locator('#stations').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom-200-${l}.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='');await page.emulateMedia({reducedMotion:'reduce'});
 // Deep-link geometry and target meanings, both locales; keyboard activation.
 const related=[];
 for(const l of ['en','zh']){
  await lang(l);const link=page.locator('.step-nav a[href="#step2"]');await link.focus();await page.keyboard.press('Enter');await page.waitForTimeout(300);const top=await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top);assert(top>=55&&top<150,top);
  for(const href of ['../23/#step1','../42/#step1']){
   const target=page.locator(`.related a[href="${href}"]`);const label=await target.textContent();await target.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+href.slice(3));await page.waitForTimeout(100);
   const text=await page.locator('#step1').textContent();related.push({locale:l,label,url:page.url(),excerpt:text.slice(0,1500)});assert(text.length>100);await page.goto(url);await lang(l);
  }
 }
 // Rendered contrast pairs, including disabled, selected and focus roles.
 function luminance(hex){const a=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 const contrasts=[];for(const [fg,bg] of [['e8edf4','161b22'],['9aa7b8','161b22'],['9aa7b8','1c2330'],['6ee7ff','161b22'],['ffb454','161b22'],['ffb454','1c2330'],['c9d4e2','0a0e14'],['e8edf4','090e16'],['0d1117','6ee7ff']]){const a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert(ratio>=4.5);contrasts.push({fg,bg,ratio});}
 // Storage unavailable, offline source, forced colors and reduced motion.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});const other=await denied.newPage();await other.goto(url);await other.locator('#next').click();await other.locator('[data-lang=zh]').click();assert.equal(await other.locator('#position').inputValue(),'1');await other.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await other.locator('#prev').focus();assert.equal(await other.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await denied.close();
 await context.setOffline(true);const local=await context.newPage();await local.goto('file://'+path.join(root,'index.html'));assert.equal(await local.locator('#pythonCode').textContent(),source);await local.locator('#next').click();assert.equal(await local.locator('#position').inputValue(),'1');await local.close();await context.setOffline(false);
 fs.writeFileSync(path.join(out,'asset-diagnostics.json'),JSON.stringify({errors,badAssets},null,2));const ownErrors=errors.filter(e=>!(typeof e==='object'&&e.url==='http://127.0.0.1:18770/favicon.ico'&&!e.page.includes('/871/')));assert.deepEqual(ownErrors,[]);assert.deepEqual(badAssets,[]);
 fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({result:'pass',browser:await browser.version(),platform:process.platform,semantic,fit,related,contrasts,errors,badAssets,zoom:'Real Chromium CSS zoom=2 at 1440px (200% page magnification); narrow viewports tested separately. Native browser chrome zoom and physical devices unverified.'},null,2));
 await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
