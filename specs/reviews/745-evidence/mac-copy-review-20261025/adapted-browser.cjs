const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),base=process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18770/leetcode/745/';
const C=require('../core.js');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const ctx=await b.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),p=await ctx.newPage();const errors=[],external=[],failed=[],results=[],nativeLabels=[],related=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/')&&!r.url().startsWith('data:'))external.push(r.url());});p.on('response',r=>{if(r.status()>=400)failed.push([r.status(),r.url()]);});
 await p.goto(base);await p.locator('#progress').filter({hasText:/0\/3/}).waitFor();
 async function lang(l){await p.locator(`[data-lang="${l}"]`).click();assert.equal(await p.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 async function text(id){return p.locator('#'+id).textContent();}
 for(const l of ['en','zh']){
  await lang(l);
  assert.equal(await p.locator('h1').textContent(),l==='en'?'#745 · Prefix and Suffix Search':'#745 · 前缀和后缀搜索');assert.equal(await p.title(),l==='en'?'#745 · Prefix and Suffix Search':'#745 · 前缀和后缀搜索');
  for(let q=0;q<3;q++){await p.selectOption('#handQuery',String(q));assert.match(await text('handResult'),new RegExp('= '+[2,1,-1][q]+'$'));}
  for(let i=0;i<C.presets.length;i++){
   await p.selectOption('#preset',String(i));assert.equal(await p.locator('#prev').isDisabled(),true);
   const frames=C.trace(C.presets[i].words);
   for(let k=0;k<frames.length;k++){
    if(k)await p.click('#next');
    assert.ok((await text('progress')).includes(`${k}/${frames.length-1}`));
    assert.ok((await text('progress')).includes(l==='en'?`${frames[k].writes} cumulative pair writes`:`累计 ${frames[k].writes} 次`));
    if(k)assert.equal(await p.locator('#grid tbody td').count(),C.presets[i].words[k-1].length**2);
    for(let q=0;q<C.presets[i].queries.length;q++){
     await p.selectOption('#query',String(q));const [a,z]=C.presets[i].queries[q];
     const matching=C.presets[i].words.slice(0,k).map((w,j)=>[w,j]).filter(([w])=>w.startsWith(a)&&w.endsWith(z)).map(([,j])=>j),expected=matching.length?Math.max(...matching):-1;
     assert.ok((await text('probe')).includes(`: ${expected}.`)||(await text('probe')).includes(`：${expected}。`));
     assert.equal(await p.locator('#ledger li').count(),k||1);
    }
    if(k){const snap=await p.locator('#progress,#event,#probe,#grid,#ledger,#map').allTextContents();await p.click('#prev');await p.click('#next');assert.deepEqual(await p.locator('#progress,#event,#probe,#grid,#ledger,#map').allTextContents(),snap);}
   }
   assert.equal(await p.locator('#next').isDisabled(),true);assert.equal(await p.locator('#end').isDisabled(),true);
   await p.click('#reset');assert.equal(await p.inputValue('#query'),'0');assert.ok((await text('probe')).includes('-1'));await p.click('#end');assert.equal(await p.locator('#next').isDisabled(),true);
  }
  // Fresh exercise: each choice begins concealed; verify state and meanings after reveal.
  for(let a=0;a<4;a++){
   await p.check(`[name="prediction"][value="${a}"]`);assert.equal(await p.locator('#feedback').isHidden(),true);await p.click('#reveal');assert.ok((await text('feedback')).includes('2'));assert.ok((await text('feedback')).includes('0 → 1 → 2'));
   const original=await p.inputValue('[name="prediction"]:checked');await lang(l==='en'?'zh':'en');assert.equal(await p.inputValue('[name="prediction"]:checked'),original);assert.equal(await p.locator('#feedback').isVisible(),true);await lang(l);
  }
  assert.equal(await p.inputValue('[name="prediction"]:checked'),'3');await p.click('#reset');assert.equal(await p.locator('#feedback').isVisible(),true);await p.selectOption('#preset','0');await p.click('#next');await p.selectOption('#query','1');await p.locator('#mapDetails').evaluate(e=>e.open=true);
  const saved=await text('progress');await lang(l==='en'?'zh':'en');assert.ok((await text('progress')).includes('1/3'));assert.equal(await p.inputValue('#query'),'1');assert.equal(await p.locator('#mapDetails').getAttribute('open'),'');await lang(l);assert.equal(await text('progress'),saved);
  // Language switch retains useful focus on the actual button, not rebuilt controls.
  assert.equal(await p.evaluate(()=>document.activeElement.dataset.lang),l);
  await p.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await text('pythonCode'),source);
  await p.click('#copy');await p.waitForFunction(()=>document.querySelector('#copyStatus').textContent.includes('copied')||document.querySelector('#copyStatus').textContent.includes('已复制'));
  assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  const downloadEvent=p.waitForEvent('download');await p.click('a[download]');const download=await downloadEvent;const file=path.join(out,`download-${l}.py`);await download.saveAs(file);assert.equal(fs.readFileSync(file,'utf8'),source);
  for(const width of [320,390,736,1440]){
   await p.setViewportSize({width,height:950});await p.selectOption('#preset','0');await p.click('#end');await p.selectOption('#query','1');
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow ${width} ${l}`);
   await p.locator('#grid').scrollIntoViewIfNeeded();await p.waitForTimeout(60);
   for(let choice=0;choice<4;choice++){await p.selectOption('#preset',String(choice));await p.click('#end');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('#grid tbody td').count(),C.presets[choice].words.at(-1).length**2);const fit=await p.locator('#preset').evaluate(e=>{const c=document.createElement('canvas').getContext('2d'),s=getComputedStyle(e);c.font=s.font;return {text:e.selectedOptions[0].textContent,measured:c.measureText(e.selectedOptions[0].textContent).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20,font:s.font};});assert.ok(fit.measured<=fit.available,JSON.stringify(fit));nativeLabels.push({locale:l,width,...fit});}
   await p.selectOption('#preset','0');await p.click('#end');await p.selectOption('#query','1');await p.locator('#grid').scrollIntoViewIfNeeded();await p.waitForTimeout(60);await p.screenshot({path:path.join(out,`trace-${l}-${width}.png`)});
   const dims=await p.locator('#grid th').first().boundingBox();assert.ok(dims.width>=50);
   if(width===320){const area=p.locator('.table-wrap');await area.focus();const before=await area.evaluate(e=>e.scrollLeft);await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);assert.ok(await area.evaluate(e=>e.scrollLeft)>before);await area.evaluate(e=>e.scrollLeft=0);}
   results.push({locale:l,width,overflow:false});
  }
  await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>document.documentElement.style.zoom='2');await p.locator('#grid').scrollIntoViewIfNeeded();await p.waitForTimeout(60);
   for(let choice=0;choice<4;choice++){await p.selectOption('#preset',String(choice));await p.click('#end');assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('#grid tbody td').count(),C.presets[choice].words.at(-1).length**2);const fit=await p.locator('#preset').evaluate(e=>{const c=document.createElement('canvas').getContext('2d'),s=getComputedStyle(e);c.font=s.font;return {text:e.selectedOptions[0].textContent,measured:c.measureText(e.selectedOptions[0].textContent).width,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20,font:s.font};});assert.ok(fit.measured<=fit.available,JSON.stringify(fit));nativeLabels.push({locale:l,width:1440,zoom:2,...fit});}
   await p.selectOption('#preset','0');await p.click('#end');await p.selectOption('#query','1');await p.locator('#grid').scrollIntoViewIfNeeded();await p.waitForTimeout(60);await p.screenshot({path:path.join(out,`zoom200-${l}.png`)});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.evaluate(()=>document.documentElement.style.zoom='');
  // Navigate an actual sticky anchor; check target clear of navigation.
  await p.locator('a[href="#step2"]').click();await p.waitForTimeout(100);const geo=await p.evaluate(()=>({top:document.querySelector('#step2').getBoundingClientRect().top,bottom:document.querySelector('#stepNav').getBoundingClientRect().bottom}));assert.ok(geo.top>=geo.bottom-2,JSON.stringify(geo));
  await p.locator('#reset').focus();await p.keyboard.press('Enter');assert.ok((await text('progress')).includes('0/3'));await p.locator('#next').focus();await p.keyboard.press('Enter');assert.ok((await text('progress')).includes('1/3'));assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 }
 // Deny writeText only, then perform REAL Linux Ctrl+C from selected fallback.
 await p.evaluate(async()=>{await navigator.clipboard.writeText('745-native-copy-sentinel');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('denied for test'))});});
 for(const l of ['en','zh']){
  await lang(l);await p.click('#copy');await p.locator('#manualCopy').waitFor({state:'visible'});assert.equal(await p.inputValue('#copyText'),source);
  assert.deepEqual(await p.locator('#copyText').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd]),[true,0,source.length]);
  await p.keyboard.press('Meta+c');await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  assert.ok((await text('copyStatus')).includes(l==='en'?'system copy shortcut':'系统复制快捷键'));
 }
 // Block localStorage, verify memory locale and state survive.
 const blocked=await ctx.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});await blocked.goto(base);await blocked.locator('#progress').filter({hasText:/0\/3/}).waitFor();await blocked.click('#next');await blocked.click('[data-lang="zh"]');assert.ok((await blocked.locator('#progress').textContent()).includes('1/3'));await blocked.close();
 await p.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await p.locator('#next').focus();assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await p.screenshot({path:path.join(out,'forced-colors.png')});await p.emulateMedia({forcedColors:'none'});
 // Local source and deep-link targets, no mutations or navigation off page.
 for(const href of await p.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')).filter(x=>!x.startsWith('http')))){
  if(href.startsWith('#'))assert.equal(await p.locator(href).count(),1);
  else {const url=new URL(href,base),r=await ctx.request.get(url.href);assert.equal(r.status(),200,url.href);if(url.hash)assert.ok((await r.text()).includes(`id="${url.hash.slice(1)}"`));}
 }
 await p.click('#end');
 for(const id of ['next','end']){const disabled=await p.locator('#'+id).evaluate(e=>({disabled:e.disabled,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor,opacity:getComputedStyle(e).opacity}));assert.deepEqual(disabled,{disabled:true,color:'rgb(154, 167, 184)',bg:'rgb(28, 35, 48)',opacity:'1'});}
 // Calculate actual rendered pairs including all currently visible text and control states.
 const styles=await p.locator('body,.stage,.hint,.readout,button:disabled,.lang-toggle button.active,.btn.primary,.step-nav a,.question').evaluateAll(es=>es.map(e=>({selector:e.tagName+'.'+e.className,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor,opacity:getComputedStyle(e).opacity})));
 function lum(hex){const a=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
 assert.equal(lum('000000'),0);assert.equal(lum('ffffff'),1);assert.equal(lum('ff0000'),.2126);assert.equal(lum('00ff00'),.7152);assert.equal(lum('0000ff'),.0722);assert.ok(Math.abs((lum('747474')+.05)/.05-4.492948073111701)<1e-9);assert.ok((lum('747474')+.05)/.05<4.5);
 const pairs=[['code text','e8edf4','090e16'],['text','e8edf4','161b22'],['muted','9aa7b8','1c2330'],['muted on panel','9aa7b8','161b22'],['accent','6ee7ff','1c2330'],['orange','ffb454','1c2330'],['good','7ee2a8','161b22'],['primary','0d1117','6ee7ff'],['focus','ffb454','161b22']].map(([role,fg,bg])=>({role,fg,bg,ratio:(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05)}));for(const x of pairs)assert.ok(x.ratio>=4.5,JSON.stringify(x));
 // Follow both related links by keyboard and inspect rendered destination sections in both locales.
 const dest=await ctx.newPage();
 for(const l of ['en','zh'])for(const [href,fragment,term] of [['../336/#step1','step1',l==='en'?'trie':'字典树'],['../472/#step2','step2',l==='en'?'prefix boundary':'前缀边界']]){
  await p.setViewportSize({width:320,height:950});await lang(l);const link=p.locator(`a[href="${href}"]`);const label=await link.textContent();await link.focus();await Promise.all([p.waitForURL(new URL(href,base).href),p.keyboard.press('Enter')]);await p.locator(`[data-lang="${l}"]`).click();const excerpt=await p.locator('#'+fragment).textContent();assert.ok(excerpt.includes(term));related.push({locale:l,label,url:p.url(),excerpt:excerpt.slice(0,1600)});await p.goto(base);await p.locator('#progress').filter({hasText:/0\/3/}).waitFor();
 }
 await dest.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({status:'pass',base,host:process.platform,results,zoom:'200% CSS zoom at 1440px, effective content width 720px; not OS UI zoom',nativeCopy:'Linux Control+C; sentinel, full selection, real shortcut, clipboard readback exact',sourceDisplayCopyDownloadExact:true,localStorageDenied:true,consoleErrors:errors,failedRequests:failed,externalRequests:external,contrast:pairs,contrastCalibration:'black=0, white=1, primaries=.2126/.7152/.0722, #747474 on black=4.492948073111701 (fails 4.5)',nativeLabels,related,renderedStyles:styles},null,2));
 await b.close();console.log('Browser checks passed; '+results.length+' viewport/locale states plus zoom, source transfer, keyboard, storage and contrast.');
})().catch(e=>{console.error(e);process.exit(1);});
