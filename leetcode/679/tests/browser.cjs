const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18783';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{}),args:['--no-sandbox']});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage(),errors=[],requests=[],checks=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/leetcode/679/');await page.locator('#groups .group').first().waitFor();
 const language=async l=>{await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');};
 for(const lang of ['en','zh']){
  await language(lang);
  for(let p=0;p<5;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   const initial=await page.locator('#groups').textContent();
   await page.click('#next');const child=await page.locator('#groups').textContent();assert.notEqual(child,initial);
   await page.click('#prev');assert.equal(await page.locator('#groups').textContent(),initial);
   await page.click('#next');assert.equal(await page.locator('#groups').textContent(),child);
   await page.click('#next');assert.match(await page.locator('#event').textContent(),lang==='en'?/Return false/:/返回 false/);
   await page.click('#next');assert.equal(await page.locator('#groups').textContent(),initial);
   await page.click('#end');assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   assert.match(await page.locator('#progress').textContent(),[true,true,false,false,true][p]?/true/:/false/);
   if([0,1,4].includes(p))assert.equal(await page.locator('#groups .group b').textContent(),'24');
   await page.click('#reset');assert.equal(await page.locator('#groups').textContent(),initial);
  }
  await page.locator('#step0').scrollIntoViewIfNeeded();
  for(let i=0;i<3;i++)await page.click('#handNext');assert(await page.locator('#handNext').isDisabled());assert.equal(await page.locator('#handGroups .group b').textContent(),'24');
  await page.click('#handBack');await page.click('#handNext');await page.click('#handReset');assert(await page.locator('#handBack').isDisabled());
  for(let a=0;a<3;a++){
   await page.check(`[name=prediction][value="${a}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');
   assert.match(await page.locator('#feedback').textContent(),lang==='en'?/−2, 0, or 1/:/−2、0、1/);
   assert.match(await page.locator('#feedback').textContent(),a===1?(lang==='en'?/^Correct/:/^判断正确/):(lang==='en'?/^Check this child/:/^再检查/));
  }
  await page.check('[name=prediction][value="1"]');assert(await page.locator('#feedback').isHidden());await page.click('#reveal');
  await page.selectOption('#preset','1');await page.click('#next');await page.click('#next');
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.locator('#sourceDetails summary').click();checks.push(lang+': all presets; endpoints; rewind; hand; all quiz options; source/copy/download');
 }
 // Locale must preserve trace, selected/revealed answer, source disclosure and focus.
 await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.selectOption('#preset','1');await page.click('#next');
 await page.locator('#sourceDetails summary').click();await language('en');assert(await page.locator('[value="1"][name=prediction]').isChecked());assert(await page.locator('#feedback').isVisible());assert.equal(await page.locator('#preset').inputValue(),'1');assert.match(await page.locator('#progress').textContent(),/1\/7/);assert(await page.locator('#sourceDetails').getAttribute('open')!==null);assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
 // Deny programmatic write; use the actual host copy shortcut from the focused fallback.
 await page.evaluate(async()=>{await navigator.clipboard.writeText('distinct sentinel 679');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:async()=>{throw new Error('denied');}});});
 for(const lang of ['en','zh']){
  await language(lang);await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());
  assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.deepEqual(await page.locator('#copyText').evaluate(el=>[document.activeElement===el,el.selectionStart,el.selectionEnd]),[true,0,source.length]);
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 }
 checks.push('Both locale switches preserve state; denied clipboard fallback selected, native '+process.platform+' shortcut readback equals source');
 // Viewport/zoom captures include dense fractional intermediate state.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await language(lang);await page.selectOption('#preset','1');await page.click('#next');await page.click('#next');await page.click('#next');await page.click('#next');await page.click('#next');
  await page.locator('#groups').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const box of await page.locator('#groups .group').all())assert(await box.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:true});
  await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-stage.png`)});
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const lang of ['en','zh']){
  await language(lang);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#groups').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`),fullPage:true});await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-zoom200-stage.png`)});await page.locator('#groups').scrollIntoViewIfNeeded();await page.evaluate(()=>window.scrollBy(0,-100));await page.screenshot({path:path.join(out,`${lang}-zoom200-viewport.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 checks.push('320/390/736/1440 both locales; CSS layout zoom 200%, fractional intermediate state');
 await language('en');await page.locator('#preset').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await page.locator('#preset').inputValue(),'2');
 await page.locator('#next').focus();const focus=await page.locator('#next').evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert.equal(focus.width,'3px');await page.keyboard.press('Enter');assert.match(await page.locator('#progress').textContent(),/1\/4/);
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(400);const top=await page.locator('#step2').evaluate(el=>el.getBoundingClientRect().top);const navBottom=await page.locator('#stepNav').evaluate(el=>el.getBoundingClientRect().bottom);assert(top>=navBottom-2);
 const anchors=await page.locator('.related a').evaluateAll(a=>a.map(x=>x.href));for(const url of anchors){const u=new URL(url);const res=await context.request.get(u.href.split('#')[0]);assert(res.ok());assert((await res.text()).includes(`id="${u.hash.slice(1)}"`));}
 // Actual rendered colors, including disabled controls and focus.
 const colors=await page.evaluate(()=>{const s=getComputedStyle(document.querySelector('.stage')),b=getComputedStyle(document.querySelector('#prev')),t=getComputedStyle(document.querySelector('.explain'));return {text:[t.color,t.backgroundColor],stage:s.backgroundColor,disabled:[b.color,b.backgroundColor],focus:getComputedStyle(document.querySelector('#next')).outlineColor};});
 const luminance=c=>{const rgb=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 await page.click('#reset');await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');await page.keyboard.press('Enter');assert.match(await page.locator('#progress').textContent(),/1\/4/);await page.click('#reset');const pairs=await page.evaluate(()=>{const rgb=k=>getComputedStyle(document.documentElement).getPropertyValue(k).trim();return {ink:rgb('--text'),muted:rgb('--muted'),bg:rgb('--bg'),panel:rgb('--panel'),panel2:rgb('--panel2'),accent:rgb('--accent'),focus:rgb('--accent2')};});
 const asRgb=c=>'rgb('+c.slice(1).match(/../g).map(x=>parseInt(x,16)).join(',')+')';
 const contrast={};for(const [name,a,b,min]of [['body','ink','bg',7],['stage','ink','panel',7],['muted','muted','panel2',4.5],['disabled','muted','panel',4.5],['selected','bg','accent',7],['focus','focus','panel',3]]){contrast[name]=ratio(asRgb(pairs[a]),asRgb(pairs[b]));assert(contrast[name]>=min);}
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked storage');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(base+'/leetcode/679/');await bp.locator('[data-lang=zh]').click();assert.equal(await bp.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base)||u.startsWith('data:')));
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({result:'PASS',kind:'author self-check',checks,focus,renderedColors:colors,contrast,errors,requests:[...new Set(requests)],screenshots:22,limitations:'Headless Chromium; CSS layout zoom used for 200%; no real-device or learner evidence'},null,2)+'\n');
 console.log('PASS browser; contrast',contrast);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
