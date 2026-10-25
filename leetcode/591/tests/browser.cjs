'use strict';
// NODE_PATH must expose Playwright. Optional LESSON_EVIDENCE_DIR and LESSON_BASE_URL.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),out=path.resolve(process.env.LESSON_EVIDENCE_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(base,'solution.py'),'utf8'),core=require('../core.js');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
await context.grantPermissions(['clipboard-read','clipboard-write']);
const page=await context.newPage(),errors=[],requests=[];
await page.emulateMedia({reducedMotion:'reduce'});
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});page.on('request',r=>requests.push(r.url()));
await page.goto((process.env.LESSON_BASE_URL||'http://127.0.0.1:18780')+'/leetcode/591/');await page.locator('#summary').filter({hasText:/0/}).waitFor();
await page.evaluate(()=>{window.__nativeClipboard=navigator.clipboard;});
let checked=0;const snapshots=[];
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
 for(let p=0;p<core.presets.length;p++){
  await page.selectOption('#preset',String(p));const frames=core.trace(core.presets[p]);
  assert.equal(await page.locator('#prev').isDisabled(),true);
  for(let k=0;k<frames.length;k++){
   const f=frames[k],state=await page.evaluate(()=>({summary:document.getElementById('summary').textContent,stack:document.getElementById('stackView').textContent,action:document.getElementById('action').textContent,rows:document.querySelectorAll('#ledger tbody tr').length,input:document.getElementById('inputView').textContent,consumed:document.querySelectorAll('#inputView .consumed').length}));
   assert.equal(state.input,core.presets[p]);assert.equal(state.rows,k+1);assert.equal(state.consumed,f.i);assert.ok(state.summary.includes(`${k}/${frames.length-1}`));assert.ok(state.summary.includes(`${f.i}/${core.presets[p].length}`));
   const st=f.stack.length?'['+f.stack.join(', ')+']':'[]';assert.ok(state.stack.endsWith(st));assert.ok(state.action.length>10);checked++;
   if(k===frames.length-1)assert.equal(await page.locator('#next').isDisabled(),true);
   else await page.locator('#next').click();
  }
  const final=await page.locator('#summary').textContent();assert.ok(final.includes(String(frames.at(-1).result)));
  if(frames.length>1){const stack=await page.locator('#stackView').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#summary').textContent(),final);assert.equal(await page.locator('#stackView').textContent(),stack);}
  await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');await page.locator('#end').click();assert.equal(await page.locator('#summary').textContent(),final);
  if([1,2,3].includes(p))snapshots.push({lang,p,summary:final,action:await page.locator('#action').textContent(),stack:await page.locator('#stackView').textContent()});
 }
 for(const value of ['0','1','2']){
  await page.locator(`[name=prediction][value="${value}"]`).check();assert.equal(await page.locator('#feedback').isHidden(),true);await page.locator('#reveal').click();assert.equal(await page.locator('#feedback').isVisible(),true);assert.ok((await page.locator('#feedback').textContent()).includes('[R,S]'));
  const other=lang==='en'?'zh':'en';await page.locator(`[data-lang=${other}]`).click();assert.equal(await page.locator(`[name=prediction][value="${value}"]`).isChecked(),true);assert.equal(await page.locator('#feedback').isVisible(),true);await page.locator(`[data-lang=${lang}]`).click();
 }
 await page.locator('[name=prediction][value="0"]').check();assert.equal(await page.locator('#feedback').isHidden(),true);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.__nativeClipboard});});
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert.equal(await page.locator('#manualCopy').isHidden(),true);
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denied');}}});});await page.locator('#copy').click();assert.equal(await page.locator('#copyText').inputValue(),source);assert.deepEqual(await page.locator('#copyText').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);assert.equal(await page.locator('#copyText').evaluate(e=>document.activeElement===e),true);
 await page.locator('#sourceDetails').evaluate(e=>{e.open=true;});assert.equal(await page.locator('#pythonCode').textContent(),source);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Locale must preserve trace cursor, preset, source state and focus on toggle.
 await page.selectOption('#preset','0');await page.locator('#next').click();const before=await page.locator('#position').inputValue();await page.locator(`[data-lang=${lang==='zh'?'en':'zh'}]`).click();assert.equal(await page.locator('#position').inputValue(),before);assert.equal(await page.locator('#preset').inputValue(),'0');await page.locator(`[data-lang=${lang}]`).click();
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('#sourceDetails').evaluate(e=>{e.open=false;});await page.selectOption('#preset','2');await page.locator('#end').click();await page.locator('#summary').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} overflow ${width}`);
  await page.screenshot({path:path.join(out,`${lang}-${width}-trace.png`)});
 }
 await page.setViewportSize({width:390,height:1000});await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#ledger').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:path.join(out,`${lang}-mismatch-ledger.png`)});
 await page.setViewportSize({width:1440,height:1000});
 // Chromium CSS zoom at 200%, actual reflow and controls checked; no claim of OS zoom.
 await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#stackView').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 await page.selectOption('#preset','0');await page.locator('#position').focus();await page.keyboard.press('End');assert.equal(await page.locator('#next').isDisabled(),true);await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'1');
 await page.locator('.step-nav a[href="#step3"]').click();await page.waitForTimeout(500);const geo=await page.locator('#step3').boundingBox();assert.ok(geo.y>=60&&geo.y<200,JSON.stringify(geo));
 await page.locator('[name=prediction][value="1"]').focus();await page.keyboard.press('Space');await page.keyboard.press('Tab'); // next radio group endpoint -> Reveal
 await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#feedback').isVisible(),true);
 await page.locator('#reveal').evaluate(e=>e.scrollIntoView({block:'center'}));const focus=await page.locator('#reveal').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 await page.screenshot({path:path.join(out,`${lang}-prediction-focus.png`)});
}
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#reveal').focus();assert.notEqual(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineStyle),'none');assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
// All local links and deep anchors; official link excluded from runtime requests.
const links=await page.locator('a').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const href of links){if(href.startsWith('http'))continue;const u=new URL(href,page.url()),r=await context.request.get(u.href);assert.equal(r.status(),200,href);if(u.hash){const html=await r.text();assert.ok(html.includes('id="'+u.hash.slice(1)+'"'),href);}}
// Storage denied, no network source dependency: initialize from bundled files.
const denied=await context.newPage();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied storage');}});});await denied.goto(page.url());await denied.locator('#summary').waitFor();await denied.locator('[data-lang=zh]').click();assert.equal(await denied.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
// Offline file source works without fetch or server.
const offline=await context.newPage();await offline.goto('file://'+path.join(base,'index.html'));await offline.locator('#summary').waitFor();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
const contrast=await page.evaluate(()=>{
 const lum=c=>{const a=c.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
 const ratio=(fg,bg)=>{const a=lum(fg),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
 const vars=getComputedStyle(document.documentElement),pairs=[];for(const bg of ['--bg','--panel','--panel2'])for(const fg of ['--text','--muted','--accent','--accent2','--good','--bad']){const e=document.createElement('div');e.style.color=vars.getPropertyValue(fg);e.style.backgroundColor=vars.getPropertyValue(bg);document.body.append(e);const s=getComputedStyle(e);pairs.push({fg,bg,ratio:ratio(s.color,s.backgroundColor)});e.remove();}return pairs;
});for(const x of contrast)assert.ok(x.ratio>=4.5,JSON.stringify(x));
const cssBytes=fs.statSync(path.join(base,'../style.css')).size+fs.statSync(path.join(base,'style.css')).size;assert.ok(cssBytes<25000);assert.deepEqual(errors,[]);assert.ok(requests.every(u=>u.startsWith('http://127.0.0.1:18780/')||u.startsWith('data:')));
fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({kind:'author self-check',renderedFrames:checked,snapshots,viewports:[320,390,736,1440],zoom:'Chromium CSS 200%',locales:['en','zh'],sourceDisplayCopyFallbackDownload:'exact including final newline',errors,cssBytes,contrast,minimumTextContrast:Math.min(...contrast.map(x=>x.ratio)),limits:'No actual learner, independent review, production or OS/device zoom verification'},null,2)+'\n');
await browser.close();console.log(JSON.stringify({renderedFrames:checked,errors,cssBytes,screenshots:16}));
})().catch(e=>{console.error(e);process.exit(1);});
