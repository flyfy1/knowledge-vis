'use strict';
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),os=require('os');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/906/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce',viewport:{width:1440,height:1000}});
 const page=await context.newPage(),errors=[],network=[],records=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)network.push([r.url(),r.status()]);});page.on('requestfailed',r=>network.push([r.url(),r.failure()]));
 await page.goto(url);await page.locator('#progress').filter({hasText:'1000'}).waitFor();
 const switchLang=async lang=>{await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');};
 const read=id=>page.locator('#'+id).textContent();
 const core=require('../core.js');
 for(const lang of ['en','zh']){
  await switchLang(lang);assert.equal(await read('pythonCode'),source);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
  for(let i=0;i<6;i++){
   await page.selectOption('#preset',String(i));assert.equal(await page.locator('#position').inputValue(),'0');assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('.root-card').count(),0);
   const expectedRows=core.trace(...core.presets[i]),max=expectedRows.length;
   assert.equal(Number(await page.locator('#position').getAttribute('max')),max);
   for(let j=1;j<=max;j++){
    await page.locator('#next').click();assert.equal(Number(await page.locator('#position').inputValue()),j);assert.equal(await page.locator('.root-card').count(),j);
    const row=expectedRows[j-1],card=page.locator('.root-card').last();assert.equal(await card.locator('.pair').textContent(),`${row.root}² = ${row.square}`);
    assert.equal(await page.locator('.root-card.current').count(),1);assert((await card.locator('.status').textContent()).includes(lang==='en'?'Current':'当前'));
    assert.equal(await card.locator('.decision').textContent(),(lang==='en'?(row.accept?'Accepted':'Rejected')+' · cumulative ':'通过拒绝'.slice(row.accept?0:2,row.accept?2:4)+' · 累计 ')+row.count);
    const snapshot=await read('cards'),op=await read('operation');await page.locator('#prev').click();assert.equal(await page.locator('.root-card').count(),j-1);await page.locator('#next').click();assert.equal(await read('cards'),snapshot);assert.equal(await read('operation'),op);
   }
   const answer=[4,1,0,1,3,0][i];assert((await read('result')).includes(`= ${answer}`));assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   records.push({lang,preset:i,frames:max,answer,finalText:await read('result'),lastOperation:await read('operation')});
   await page.locator('#reset').click();assert.equal(await page.locator('.root-card').count(),0);await page.locator('#end').click();
   await page.locator('#position').focus();await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');await page.keyboard.press('End');assert.equal(Number(await page.locator('#position').inputValue()),max);
  }
  // A rejected palindromic root and an accepted current card, then language roundtrip.
  await page.selectOption('#preset','0');await page.locator('#position').evaluate(e=>{e.value='4';e.dispatchEvent(new Event('input'));});
  assert((await read('operation')).includes('4 →'));assert((await read('operation')).includes('16'));assert((await page.locator('.root-card.current .decision').textContent()).includes(lang==='en'?'Rejected':'拒绝'));
  const saved=await read('cards');await switchLang(lang==='en'?'zh':'en');assert.equal(await page.locator('#position').inputValue(),'4');await switchLang(lang);assert.equal(await read('cards'),saved);
  records.push({lang,state:'root4 square16 rejection',operation:await read('operation'),card:await page.locator('.root-card.current').textContent(),formula:await page.locator('[data-i18n=mirror]').textContent()});
  for(let k=0;k<3;k++){
   await page.locator(`[name=prediction][value="${k}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();assert((await read('feedback')).includes('44944'));assert((await read('feedback')).includes('49284'));
   assert((await read('feedback')).startsWith(lang==='en'?(k===2?'Correct':'Check'):(k===2?'预测正确':'再核对')));
   const before=await read('feedback');await page.selectOption('#preset','1');assert.equal(await read('feedback'),before);await switchLang(lang==='en'?'zh':'en');assert(await page.locator(`[name=prediction][value="${k}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await switchLang(lang);
   records.push({lang,prediction:k,feedback:await read('feedback')});
  }
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
  for(let attempt=0;attempt<2;attempt++){
   const sentinel=`906-${lang}-${attempt}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await page.evaluate(()=>{window.__copyOriginal=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('forced denial for self-check');};});
   await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
   assert(await page.locator('#copyText').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   records.push({lang,manualAttempt:attempt,sentinelVerified:true,nativeShortcut:process.platform==='darwin'?'Meta+C':'Control+C',exact:true,feedback:await read('copyStatus')});await page.evaluate(()=>{navigator.clipboard.writeText=window.__copyOriginal;});
  }
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const dest=path.join(out,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
 }
 for(const lang of ['en','zh'])for(const [width,zoom] of [[320,1],[390,1],[736,1],[1440,1],[780,2],[1440,2]]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await switchLang(lang);
  for(let i=0;i<6;i++){
   await page.selectOption('#preset',String(i));
   const measure=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.selectedOptions[0].textContent,width:e.clientWidth,textWidth:c.measureText(e.selectedOptions[0].textContent).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font};});
   assert(measure.textWidth+measure.padding+36<=measure.width,JSON.stringify(measure));
  }
  await page.selectOption('#preset','4');await page.locator('#end').click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const geometry=await page.locator('.root-card').evaluateAll(xs=>xs.map(e=>({width:e.getBoundingClientRect().width,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth})));assert(geometry.every(e=>e.scrollWidth<=e.clientWidth+1));
  await page.locator('.root-card.current').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-zoom${zoom}.png`)});
  if(width===390&&zoom===1){await page.locator('.stage').screenshot({path:path.join(out,`${lang}-390-stage.png`)});}
  records.push({lang,width,zoom,noOverflow:true,geometry,finalCard:await page.locator('.root-card.current').textContent()});
 }
 await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:390,height:900});await page.selectOption('#preset','0');
 await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 await page.locator('.step-nav a[href="#step3"]').click();assert(await page.locator('#step3').evaluate(e=>e.getBoundingClientRect().top>=60&&e.getBoundingClientRect().top<150));
 for(const href of await page.locator('a').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')).filter(x=>x&&!x.startsWith('https:')))){
  if(href.startsWith('#'))assert(await page.locator(href).count());else {const target=new URL(href,url),r=await context.request.get(target.href);assert(r.ok(),target.href);if(target.hash)assert((await r.text()).includes(`id="${target.hash.slice(1)}"`));}
 }
 // Follow each related link using keyboard, capture the advertised content in both locales.
 for(const lang of ['en','zh'])for(const index of [0,1]){
  await page.goto(url);await switchLang(lang);const a=page.locator('.related a').nth(index),label=await a.textContent();await a.focus();await page.keyboard.press('Enter');await page.waitForURL(index===0?'**/132/#step1':'**/60/#step2');
  const section=page.locator(index===0?'#step1':'#step2');records.push({lang,relatedLabel:label,target:page.url(),targetText:(await section.textContent()).slice(0,6500)});assert(await section.isVisible());
 }
 await page.goto(url);
 const contrast=await page.evaluate(()=>{
  const s=getComputedStyle(document.documentElement),names=['bg','panel','panel2','text','muted','accent','accent2'];const colors=Object.fromEntries(names.map(n=>[n,s.getPropertyValue('--'+n).trim()]));
  function lum(h){const a=h.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
  const pairs=[];for(const bg of ['bg','panel','panel2'])for(const fg of ['text','muted','accent','accent2']){let a=lum(colors[bg]),b=lum(colors[fg]);pairs.push({fg,bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)});}return {colors,pairs};});assert(contrast.pairs.every(x=>x.ratio>=4.5));
 const offline=await browser.newContext();await offline.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied for self-check');}});});const p2=await offline.newPage(),offlineErrors=[];p2.on('pageerror',e=>offlineErrors.push(String(e)));await p2.goto('file://'+path.join(root,'index.html'));await p2.locator('#progress').filter({hasText:'1000'}).waitFor();await p2.locator('[data-lang=zh]').click();await p2.locator('#end').click();assert((await p2.locator('#result').textContent()).includes('= 4'));assert.equal(await p2.locator('#pythonCode').textContent(),source);assert.deepEqual(offlineErrors,[]);await p2.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p2.locator('#reset').focus();assert.equal(await p2.locator('#reset').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 const report={kind:'author self-check, independent review pending',host:os.platform(),browser:browser.version(),zoomMethod:'CSS layout zoom 2; native browser UI zoom not automated',sourceParity:'display, mirror, native copy, fallback native copy twice per locale, downloaded files exact including final newline',contrast,cssBytes,errors,network,offlineStorageDenied:true,records};fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();console.log(JSON.stringify({pass:true,records:records.length,contrastMin:Math.min(...contrast.pairs.map(p=>p.ratio)),cssBytes}));
})().catch(e=>{console.error(e);process.exitCode=1;});
