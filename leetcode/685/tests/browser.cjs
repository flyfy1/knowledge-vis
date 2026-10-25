'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(OUT,{recursive:true});
const PREVIEW=process.env.PREVIEW_URL||'http://127.0.0.1:18782/leetcode/685/';
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const core=require(path.join(ROOT,'core.js'));
const expectations=[[2,3],[4,1],[2,1],[3,1],[2,1]];
const report={kind:'author browser self-check; no independent acceptance',hostPlatform:os.platform(),url:PREVIEW,semantics:[],layouts:[],screenshots:[],checks:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],assets=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{assets.push({url:r.url(),status:r.status()});if(r.status()>=400)errors.push(r.url()+': '+r.status());});
 await page.goto(PREVIEW);await page.locator('#progress').filter({hasText:/0\//}).waitFor();
 const lang=async l=>{await page.locator(`[data-lang="${l}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');assert(await page.locator(`[data-lang="${l}"]`).evaluate(el=>document.activeElement===el));};
 const value=async s=>page.locator(s).textContent();
 const snap=async()=>Promise.all(['#progress','#event','#incoming','#candidates','#groupsBefore','#groupsAfter','#edgesBody','#history'].map(value));
 for(const l of ['en','zh']){
   await lang(l);
   for(let p=0;p<5;p++){
     await page.selectOption('#preset',String(p));const frames=core.trace(core.presets[p]);
     assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
     const initial=await snap();
     for(let k=1;k<frames.length;k++){
       await page.click('#next');
       assert((await value('#progress')).includes(`${k}/${frames.length-1}`));
       assert.equal(await page.locator('#history li').count(),k);
       const f=frames[k];
       const groupText=g=>g.map(a=>'{'+a.join(', ')+'}').join(' · ');
       assert.equal(await value('#groupsAfter'),groupText(f.groups));
       assert.equal(await value('#groupsBefore'),groupText(f.before)+' →');
       const states=await page.locator('#edgesBody tr td:last-child').allTextContents();
       for(let i=0;i<states.length;i++){
         const text={en:{pending:'Pending connectivity test',kept:'Retained',skipped:'later · skipped',rejected:'Cycle closure · rejected'},zh:{pending:'待连通测试',kept:'已保留',skipped:'later · 跳过',rejected:'闭环 · 拒绝'}};
         assert.equal(states[i],text[l][f.states[i]]);
       }
       const before=await snap();await page.click('#prev');await page.click('#next');assert.deepEqual(await snap(),before);
     }
     assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
     assert((await value('#event')).includes(expectations[p].join('→')));
     report.semantics.push({locale:l,preset:p,final:await value('#event'),frames:frames.length});
     if(p===2){await page.locator('#traceGraph').screenshot({path:path.join(OUT,`graph-${l}-desktop.png`)});report.screenshots.push(`graph-${l}-desktop.png`);}
     await page.click('#reset');assert.deepEqual(await snap(),initial);await page.click('#end');assert(await page.locator('#next').isDisabled());
   }
   // Independent hand deletions: [1,2] fails, both parent removals work.
   for(const [removed,valid] of [[-1,false],[0,false],[1,true],[2,true]]){
     await page.selectOption('#handRemove',String(removed));
     const text=await value('#handResult');
     assert(text.includes(l==='en'?(valid?'Valid:':'Invalid:'):(valid?'成立：':'不成立：')));if(removed===0)assert(text.includes(l==='en'?'was not tested':'未运行'));report.semantics.push({locale:l,handRemoved:removed,valid,observed:text});
   }
   for(let c=0;c<3;c++){
     await page.locator(`[name="prediction"][value="${c}"]`).check();assert(await page.locator('#feedback').isHidden());
     await page.click('#reveal');const feedback=await value('#feedback');assert(feedback.includes('[3,2]'));assert(feedback.includes('1→4→2→3'));assert(feedback.includes('3→2→3'));
     report.semantics.push({locale:l,choice:c,feedback});
     const p=await page.inputValue('#preset'),hand=await page.inputValue('#handRemove'),k=await value('#progress');
     await lang(l==='en'?'zh':'en');assert(await page.locator(`[value="${c}"][name="prediction"]`).isChecked());assert(await page.locator('#feedback').isVisible());assert.equal(await page.inputValue('#preset'),p);assert.equal(await page.inputValue('#handRemove'),hand);assert((await value('#progress')).match(/\d+\/\d+/)[0]===k.match(/\d+\/\d+/)[0]);await lang(l);
   }
   await page.locator('[name="prediction"][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 }
 report.checks.push('Both locales: all preset frames, states and groups; full rewind/replay; all endpoints; hand deletions; all prediction choices; reveal/change/locale preservation');
 await lang('en');await page.locator('#sourceDetails summary').click();assert.equal(await value('#pythonCode'),source);
 // Native clipboard, including the actual system shortcut for fallback.
 await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>{window.nativeClipboardWrite=navigator.clipboard.writeText.bind(navigator.clipboard);});
 for(const l of ['en','zh']){
   await lang(l);await page.evaluate(()=>window.nativeClipboardWrite('685-DISTINCT-SENTINEL'));
   await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw new Error('test denial');};});
   await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.inputValue('#copyText'),source);
   assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
   await page.keyboard.press(os.platform()==='darwin'?'Meta+c':'Control+c');
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   report.semantics.push({locale:l,copyFallback:await value('#copyStatus'),transfer:'native shortcut + actual clipboard readback exact including final newline'});
 }
 const downloadEvent=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadEvent;const destination=path.join(OUT,'downloaded-solution.py');await download.saveAs(destination);assert.equal(fs.readFileSync(destination,'utf8'),source);
 report.checks.push('Displayed, embedded, native copied, manual fallback copied, and downloaded source all equal canonical bytes; Linux Control+C host shortcut');
 // Links: navigate actual anchors, and resolve related lesson anchors.
 for(let i=0;i<5;i++){
   await page.locator(`#stepNav a[href="#step${i}"]`).click();await page.waitForFunction(i=>{const s=document.getElementById('step'+i).getBoundingClientRect();return s.top>=document.querySelector('#stepNav').getBoundingClientRect().bottom-8;},i);
   const geometry=await page.locator(`#step${i}`).evaluate(el=>({top:el.getBoundingClientRect().top,nav:document.querySelector('#stepNav').getBoundingClientRect().bottom}));
   assert(geometry.top>=geometry.nav-8,JSON.stringify({i,geometry}));
 }
 for(const href of await page.locator('.related a').evaluateAll(els=>els.map(a=>a.href))){
   const u=new URL(href);const response=await context.request.get(u.href.split('#')[0]);assert.equal(response.status(),200);assert((await response.text()).includes(`id="${u.hash.slice(1)}"`));
 }
 // Layout, dense mid-trace and endpoint, both locales at all requested widths.
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
   await page.setViewportSize({width,height:1000});await lang(l);await page.selectOption('#preset','2');
   for(let i=0;i<7;i++)await page.click('#next');
   const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));assert(overflow.document<=overflow.viewport,JSON.stringify({width,l,overflow}));
   const graph=await page.locator('#traceGraph svg').boundingBox();assert(graph.width>=248);
   const textGeometry=await page.locator('#traceGraph text').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {height:r.height,width:r.width};}));assert(textGeometry.every(r=>r.height>=13));
   const sizes=await page.locator('button,select,.prediction-options label').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width).map(e=>({id:e.id||e.textContent,height:e.getBoundingClientRect().height})));assert(sizes.every(x=>x.height>=48),JSON.stringify(sizes));
   if(width===320||width===390||width===1440){
     await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`trace-${l}-${width}.png`),style:'.step-nav { visibility: hidden !important; }'});report.screenshots.push(`trace-${l}-${width}.png`);
   }
   report.layouts.push({width,locale:l,overflow,graphWidth:graph.width,labelMinHeight:Math.min(...textGeometry.map(x=>x.height))});
   await page.click('#end');await page.click('#reset');
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const l of ['en','zh']){
   await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.selectOption('#preset','2');await page.click('#end');
   const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,zoom:getComputedStyle(document.documentElement).zoom}));assert(dimensions.scroll<=dimensions.client);
   await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`zoom200-${l}.png`),style:'.step-nav { visibility: hidden !important; }'});report.screenshots.push(`zoom200-${l}.png`);report.layouts.push({test:'200% CSS zoom layout/reading check at 1440px',locale:l,dimensions});
   await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 // Keyboard navigation and native focus ring, reduced motion and forced colors.
 await page.goto(PREVIEW);await page.locator('#progress').waitFor();await page.keyboard.press('Tab');assert(await page.locator('.back-link').evaluate(el=>document.activeElement===el));
 await page.keyboard.press('Tab');assert(await page.locator('[data-lang="zh"]').evaluate(el=>document.activeElement===el));await page.keyboard.press('Enter');
 assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
 const focus=await page.locator('[data-lang="zh"]').evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert.equal(focus.width,'3px');
 await page.focus('#next');await page.keyboard.press('Enter');assert((await value('#progress')).includes('1/'));
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 // Real rendered foreground/background contrast for text-bearing elements.
 const contrast=await page.evaluate(()=>{
   function rgb(s){const a=s.match(/[\d.]+/g).map(Number);return a.slice(0,3).map(x=>x/255).concat(a[3]===undefined?1:a[3]);}
   const lum=c=>c.slice(0,3).reduce((s,x,i)=>s+[.2126,.7152,.0722][i]*(x<=.04045?x/12.92:((x+.055)/1.055)**2.4),0);
   const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
   const rows=[];
   for(const el of document.querySelectorAll('p,a,button,label,legend,summary,td,th,option,h1,h2,h3,li')){
     if(!el.getBoundingClientRect().width||!el.textContent.trim()||el.tagName==='OPTION')continue;
     let bg=[0,0,0,0],node=el;
     while(node){const c=rgb(getComputedStyle(node).backgroundColor);if(c[3]===1){bg=c;break;}node=node.parentElement;}
     const fg=rgb(getComputedStyle(el).color);rows.push({tag:el.tagName,text:el.textContent.trim().slice(0,60),color:getComputedStyle(el).color,bg:bg.slice(0,3).map(x=>Math.round(x*255)),ratio:ratio(fg,bg)});
   }
   return rows;
 });
 assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast.filter(x=>x.ratio<4.5)));report.contrast={minimum:Math.min(...contrast.map(x=>x.ratio)),samples:contrast,focus,focusContrast:await page.evaluate((focusColor)=>{const lum=c=>c.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);const color=focusColor.match(/[\d.]+/g).slice(0,3).map(Number);const bg=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).slice(0,3).map(Number);return (Math.max(lum(color),lum(bg))+.05)/(Math.min(lum(color),lum(bg))+.05);},focus.color)};
 assert(report.contrast.focusContrast>=3);
 report.contrast.controlBoundary=await page.locator('#preset').evaluate(el=>({border:getComputedStyle(el).borderColor,background:getComputedStyle(el).backgroundColor}));
 report.checks.push('Native keyboard tab, Enter activation, visible 3px focus; forced colors and reduced motion; local anchor geometry; all related targets; measured rendered contrast >=4.5:1');
 // Storage unavailable: still initializes and changes locale in memory.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const deniedPage=await denied.newPage();await deniedPage.goto(PREVIEW);await deniedPage.locator('#progress').filter({hasText:/0\//}).waitFor();await deniedPage.click('[data-lang="zh"]');assert.equal(await deniedPage.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 // Offline file opening proves source and datasets need no fetch.
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();await op.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.click('#end');assert((await op.locator('#event').textContent()).includes('2→3'));await offline.close();
 assert.equal(errors.length,0,errors.join('\n'));assert(assets.every(a=>new URL(a.url).origin===new URL(PREVIEW).origin));
 report.assets=assets;report.errors=errors;report.result='pass';report.checks.push('Storage denied; local-file offline trace/source; zero console/page errors and local asset failures');
 report.cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(report.cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,layouts:report.layouts.length,semanticChecks:report.semantics.length,screenshots:report.screenshots,contrastMinimum:report.contrast.minimum,cssBytes:report.cssBytes}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(OUT,'browser-failure.txt'),e.stack+'\n');console.error(e);process.exitCode=1;});
