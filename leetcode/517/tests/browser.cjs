'use strict';
// Run with NODE_PATH available; artifacts can be redirected using LESSON_OUTPUT_DIR.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.LESSON_URL||'http://127.0.0.1:18775/leetcode/517/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,viewport:{width:1440,height:1000}});
const page=await context.newPage(),errors=[],requests=[],report=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
await page.goto(url);await page.waitForFunction(()=>document.getElementById('event').textContent.length>0);
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
 if(await page.locator('#moveReset').isEnabled())await page.locator('#moveReset').click();
 for(let i=1;i<=3;i++){await page.locator('#moveNext').click();assert.equal(await page.locator('#moveHistory li').count(),i+1);}
 assert(await page.locator('#moveNext').isDisabled());assert.match(await page.locator('#moveStatus').textContent(),/2,2,2/);
 const hand=await page.locator('#moveHistory').textContent();await page.locator('#movePrev').click();await page.locator('#moveNext').click();assert.equal(await page.locator('#moveHistory').textContent(),hand);await page.locator('#moveReset').click();assert(await page.locator('#movePrev').isDisabled());await page.locator('#moveEnd').click();
 for(let p=0;p<6;p++){
  await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
  const values=await page.evaluate(()=>model.a),target=values.reduce((a,b)=>a+b,0)/values.length;
  if(p===3){assert(await page.locator('#next').isDisabled());assert.match(await page.locator('#event').textContent(),/-1/);}
  else{
   for(let k=1;k<=values.length;k++){
    await page.locator('#next').click();assert.equal(await page.locator('#ledger tr').count(),k);
    const cells=await page.locator('#ledger tr').last().locator('td').allTextContents();
    const prefix=values.slice(0,k).reduce((a,b)=>a+b,0)-k*target;assert.equal(cells[2],String(values[k-1]-target));assert.equal(cells[3],`${prefix-values[k-1]+target} → ${prefix}`);
    assert.equal(await page.locator('#scanMachines .current').count(),1);
   }
   assert(await page.locator('#next').isDisabled());assert.match(await page.locator('#event').textContent(),new RegExp(lang==='en'?`final minimum ${[3,2,4,-1,0,0][p]} moves`:`最终最少 ${[3,2,4,-1,0,0][p]} 轮`));assert(!/\{\w+\}/.test(await page.locator('#event').textContent()));const endpoint=await page.locator('#ledger').textContent();
   await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#ledger').textContent(),endpoint);
   await page.locator('#reset').click();assert.equal(await page.locator('#ledger tr').count(),0);await page.locator('#end').click();assert.equal(await page.locator('#ledger').textContent(),endpoint);
   await page.locator('#position').fill('0');assert.equal(await page.locator('#ledger tr').count(),0);
  }
 }
 for(let c=0;c<3;c++){
  await page.locator(`[name=prediction][value="${c}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
  const text=await page.locator('#feedback').textContent();assert.match(text,/2/);if(c===2)assert.match(text,lang==='en'?/Correct\./:/正确/);
 }
 const selected=await page.locator('[name=prediction]:checked').inputValue();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert.equal(await page.locator('[name=prediction]:checked').inputValue(),selected);assert(await page.locator('#feedback').isVisible());await page.locator(`[data-lang=${lang}]`).click();
 const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('maxᵢ ( |bᵢ|, dᵢ )')&&formula.includes('d₁+…+dᵢ'));report.push({lang,formula,quiz:await page.locator('#feedback').textContent(),presets:6});
 await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const download=page.waitForEvent('download');await page.locator('[download]').click();const file=await download;assert.equal(fs.readFileSync(await file.path(),'utf8'),source);
 await page.locator('#sourceDetails summary').click();
}
// Explicit clipboard rejection selects the entire byte-identical source.
await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('test unavailable'))}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.deepEqual(await page.locator('#copyText').evaluate(el=>[el.selectionStart,el.selectionEnd]),[0,source.length]);
for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();assert(await page.locator('#copyStatus').textContent());}
// Links and real keyboard navigation/focus.
for(const href of await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')))){
 if(href.startsWith('https:')||href.startsWith('#'))continue;const u=new URL(href,url),r=await context.request.get(u.href);assert.equal(r.status(),200,href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);
}
await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(300);assert((await page.locator('#step2').boundingBox()).y>=0);
await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#ledger tr').count(),1);await page.keyboard.press('Tab');const focus=await page.evaluate(()=>({tag:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outlineWidth}));assert.equal(focus.outline,'3px');
// Measured computed foreground/background contrast on the actual palette.
const contrast=await page.evaluate(()=>{
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(a){return a.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}function ratio(a,b){a=lum(rgb(a));b=lum(rgb(b));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
 const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();const pairs=[['body','--text','--bg'],['muted panel','--muted','--panel'],['muted stage','--muted','--panel2'],['accent panel','--accent','--panel'],['selected','--bg','--accent'],['focus stage','--accent2','--panel2'],['disabled text','--muted','--panel']];
 return pairs.map(([role,fg,bg])=>{const e=document.createElement('span');document.body.append(e);e.style.color=v(fg);e.style.backgroundColor=v(bg);const s=getComputedStyle(e),r={role,foreground:s.color,background:s.backgroundColor,ratio:ratio(s.color,s.backgroundColor)};e.remove();return r;});
});for(const r of contrast)assert(r.ratio>=(r.role.startsWith('focus')?3:4.5),JSON.stringify(r));
// Populated component screenshots in both locales, all requested layout widths.
await page.locator('#manualCopy').evaluate(el=>el.hidden=true);
for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
 await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${lang}]`).click();await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#step2').scrollIntoViewIfNeeded();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${width} overflow`);
 const stage=page.locator('#step2 .stage');await stage.screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`scan-${lang}-${width}.png`)});
 const navOverlap=await page.locator('.step-nav a').evaluateAll(els=>els.some((el,i)=>i>0&&el.getBoundingClientRect().left<els[i-1].getBoundingClientRect().right));assert(!navOverlap,'Navigation overlap');
 if(width===320){await page.locator('.table-wrap').focus();await page.keyboard.press('End');await page.locator('.table-wrap').evaluate(el=>el.scrollLeft=el.scrollWidth);assert(await page.locator('.table-wrap').evaluate(el=>el.scrollLeft>0));await page.locator('.table-wrap').evaluate(el=>el.scrollLeft=0);}
 if(width===390){await page.locator('#step0 .stage').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`moves-${lang}.png`)});}
}
await page.setViewportSize({width:390,height:844});await page.goto(url);await page.locator('[data-lang=en]').click();await page.screenshot({path:path.join(out,'header-en-390.png')});await page.locator('[data-lang=zh]').click();await page.screenshot({path:path.join(out,'header-zh-390.png')});
for(const zoomLang of ['en','zh']){await page.locator(`[data-lang=${zoomLang}]`).click();await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.selectOption('#preset','1');await page.locator('#end').click();await page.locator('#step2').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#step2 .stage').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`scan-${zoomLang}-200percent.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');}
// Storage denial and offline source initialization.
const blocked=await browser.newContext({viewport:{width:390,height:844},offline:false});await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(url);await bp.locator('[data-lang=zh]').click();await bp.locator('#next').click();await bp.locator('[data-lang=en]').click();assert.equal(await bp.locator('#ledger tr').count(),1);await blocked.setOffline(true);assert.equal(await bp.locator('#pythonCode').textContent(),source);
assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18775/')));
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({report,contrast,focus,errors,requests,checks:['Both locales and all presets','Schedule and scan rewind/reset/end','Every prediction option, change clears feedback, locale preserves reveal','Clipboard actual readback, denial selection, download bytes','Links and deep anchors','Keyboard and focus','320/390/736/1440 and 200% CSS layout zoom','Blocked storage, source available offline'],zoomMethod:'200% CSS layout zoom at 780px; no claim of real-device or OS zoom testing'},null,2));
await browser.close();console.log('PASS: real Chromium bilingual interactions, clipboard/download parity, responsive screenshots, contrast');
})().catch(e=>{console.error(e);process.exit(1);});
