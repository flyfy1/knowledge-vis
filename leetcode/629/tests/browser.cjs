/* Real Chromium author self-check. OUTPUT_DIR and PREVIEW_ROOT are rerunnable. */
'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18782',url=base+'/leetcode/629/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),hist=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'))).histograms;
const presets=[[3,1,2],[3,3,1],[4,5,3],[4,0,1],[3,4,0],[1,0,1],[5,6,20]],value=(i,j)=>hist[i][j]||0;
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 await context.addInitScript(()=>{localStorage.setItem('knowledge-lang','en');window.copyWrites=[];window.nativeClipboard=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>window.copyWrites.push(s)}});});
 const page=await context.newPage(),errors=[],bad=[],external=[],coverage=[],bindings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 const ready=()=>page.waitForFunction(()=>document.querySelector('#summary')?.textContent.length>0);
 await page.goto(url);await ready();
 async function locale(lang){await page.click(`[data-lang=${lang}]`);assert.equal(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang);}
 async function check(n,k,at){
  const last=n*(k+1),i=at?Math.floor((at-1)/(k+1))+1:0,j=at?(at-1)%(k+1):null,lang=await page.getAttribute('html','lang');
  assert.equal(await page.inputValue('#position'),String(at));const summary=await page.textContent('#summary');assert(summary.includes(`${at}/${last}`));
  if(at===last)assert(summary.includes((lang==='en'?'Final answer = ':'最终答案 = ')+value(n,k)));else assert(summary.includes(lang==='en'?'Target not yet complete':'目标尚未完成'));
  const table=await page.locator('#dpTable tbody tr').evaluateAll(rows=>rows.map(row=>Array.from(row.querySelectorAll('td'),td=>td.firstChild.textContent)));
  assert.equal(table.length,n+1);
  for(let r=0;r<=n;r++)for(let c=0;c<=k;c++){const done=r===0||r<i||(r===i&&j!==null&&c<=j);assert.equal(table[r][c],done?String(value(r,c)):'?',`${n},${k},${at},${r},${c}`);}
  if(at){
   const add=value(i-1,j),remove=j>=i?value(i-1,j-i):0,before=j?value(i,j-1):0,event=await page.textContent('#event');
   assert(event.includes(`D[${i}][${j}]`));assert(event.includes(`prev[${j}]=${add}`));assert(event.includes(`= ${value(i,j)}`));assert(event.includes((lang==='en'?'old window ':'旧窗口 ')+before));
   if(j>=i)assert(event.includes(`prev[${j-i}]=${remove}`));else assert(event.includes(lang==='en'?'no expired term':'没有过期项'));
   const used=await page.locator('#windowTerms .term.used').evaluateAll(es=>es.map(e=>({col:+e.querySelector('span').textContent.replace(/[()]/g,''),v:+e.querySelector('b').textContent})));
   assert.deepEqual(used,Array.from({length:j-Math.max(0,j-i+1)+1},(_,z)=>{const col=Math.max(0,j-i+1)+z;return {col,v:value(i-1,col)};}));
   const current=await page.locator('.current-cell').textContent();assert(current.startsWith(String(value(i,j))));assert(current.includes(lang==='en'?'Just filled':'刚完成'));
  }else{assert.equal(await page.locator('.current-cell').count(),0);assert.equal(await page.locator('#windowTerms .term').count(),0);}
 }
 for(const lang of ['en','zh']){
  console.log('Checking all states: '+lang);
  await locale(lang);
  assert(await page.isHidden('#feedback'));assert(await page.isDisabled('#reveal'));
  for(const key of ['recurrence','slideFormula']){const txt=await page.locator(`[data-i18n=${key}]`).textContent();for(const token of key==='recurrence'?['D[i][j]','D[i−1][j−x]','D[0][0] = 1']:['window + prev[j]','prev[j−i]','cur[j] ← window'])assert(txt.includes(token),txt);bindings.push({lang,key,visible:txt});}
  for(const p of ['1,2,3','1,3,2','2,1,3','2,3,1','3,1,2','3,2,1']){await page.selectOption('#permutation',p);let count=0;const a=p.split(',').map(Number);for(let l=0;l<3;l++)for(let r=l+1;r<3;r++)count+=a[l]>a[r];assert.equal(await page.locator('#pairs li').count(),count||1);assert((await page.textContent('#pairSummary')).includes(lang==='en'?`${count} inverse`:`${count} 对`));}
  for(let x=0;x<=2;x++){await page.selectOption('#insertion',String(x));const expected=[[2,1,3],[2,3,1],[3,2,1]][x];assert.deepEqual((await page.locator('#cards .card').allTextContents()).map(Number),expected);assert.equal(await page.locator('#insertPairs li').count(),1+x);assert.equal((await page.locator('#insertPairs li').allTextContents()).filter(x=>x.startsWith(lang==='en'?'New':'新增')).length,x);}
  for(const [n,k,answer] of presets){
   const opt=await page.locator(`#preset option[value="${n},${k}"]`).textContent();assert(opt.endsWith('→ '+answer));await page.selectOption('#preset',`${n},${k}`);await check(n,k,0);assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   for(let at=1;at<=n*(k+1);at++){await page.click('#next');await check(n,k,at);}
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));
   const snapshot=await page.locator('#dpTable').textContent();await page.click('#prev');await check(n,k,n*(k+1)-1);await page.click('#next');assert.equal(await page.locator('#dpTable').textContent(),snapshot);
   await page.click('#reset');await check(n,k,0);await page.click('#end');await check(n,k,n*(k+1));await page.locator('#position').fill('0');await check(n,k,0);await page.locator('#position').fill(String(n*(k+1)));await check(n,k,n*(k+1));coverage.push({lang,n,k,answer,allCells:true,endpoints:true,replay:true,slider:true});
  }
  for(const option of ['0','1','2']){await page.check(`[name=prediction][value="${option}"]`);assert(await page.isHidden('#feedback'));assert.equal(await page.textContent('#feedback'),'');await page.click('#reveal');const feedback=await page.textContent('#feedback');assert(feedback.startsWith(lang==='en'?(option==='1'?'Correct':'This choice'):(option==='1'?'选择正确':'这个选择')));assert(feedback.includes('5+3+1=9'));assert(feedback.includes('D[4][3]=6'));await locale(lang==='en'?'zh':'en');assert(await page.isChecked(`[name=prediction][value="${option}"]`));assert(await page.isVisible('#feedback'));await check(5,6,35);assert.equal(await page.inputValue('#insertion'),'2');await locale(lang);bindings.push({lang,option,feedback});}
  await page.reload();await ready();
 }
 // Fresh prediction is independent from the table; a changed choice clears feedback.
 await locale('en');await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.selectOption('#preset','3,3');await page.click('#end');assert(await page.isVisible('#feedback'));await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));
 await locale('zh');await check(3,3,12);await locale('en');await check(3,3,12);bindings.push({state:'subtraction frame + locale switch',event:await page.textContent('#event')});
 // All source paths preserve the final newline and exact canonical bytes.
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.textContent('#pythonCode'),source);await page.click('#copy');assert.equal(await page.evaluate(()=>window.copyWrites.at(-1)),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('[download]')]);await download.saveAs(path.join(out,'downloaded-solution.py'));assert.equal(fs.readFileSync(path.join(out,'downloaded-solution.py'),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied')}}}));
 for(const lang of ['en','zh']){await locale(lang);await page.click('#copy');assert(await page.isVisible('#manualCopy'));assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),source);await page.keyboard.press('Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);assert((await page.textContent('#copyStatus')).includes(lang==='en'?'Automatic copy unavailable':'自动复制不可用'));bindings.push({lang,state:'manual clipboard fallback',visible:await page.textContent('#copyStatus')});}
 await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.focus('#sourceDetails summary');await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await locale('en');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));
 // Native keyboard controls and contextual focus.
 await page.selectOption('#preset','3,3');await page.focus('#position');await page.keyboard.press('ArrowRight');await check(3,3,1);await page.focus('#next');await page.keyboard.press('Enter');await check(3,3,2);const focus=await page.locator('#next').evaluate(e=>({width:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle}));assert.deepEqual(focus,{width:'3px',style:'solid'});
 for(const href of await page.locator('.related a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){const u=new URL(href,url),res=await context.request.get(u.href.split('#')[0]);assert(res.ok());assert((await res.text()).includes(`id="${u.hash.slice(1)}"`));}
 await page.click('.step-nav a[href="#step2"]');await page.waitForFunction(()=>{const y=document.querySelector('#step2').getBoundingClientRect().y;return y>=65&&y<=100;});assert((await page.locator('#step2').boundingBox()).y>=70);
 // Dense completed and meaningful subtraction states in both locales and widths.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  console.log('Checking viewport: '+lang+' '+width);
  await page.setViewportSize({width,height:1000});await locale(lang);await page.selectOption('#preset','5,6');await page.click('#end');await page.locator('#summary').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang}/${width}: overflow`);
  const controls=await page.locator('button,select,.back-link,.official-link,.related a,.solution-actions a').evaluateAll(es=>es.map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert(controls.every(x=>x.h>=48),JSON.stringify(controls));const terms=await page.locator('.term').evaluateAll(es=>es.map(e=>({w:e.clientWidth,scroll:e.scrollWidth})));assert(terms.every(x=>x.w>=58&&x.scroll<=x.w));
  await page.screenshot({path:path.join(out,`${lang}-${width}-dense.png`)});
  await page.selectOption('#preset','3,3');await page.click('#end');await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-subtract.png`)});await page.locator('.step-nav').evaluate(e=>e.style.visibility='');
  if(width===320){await page.focus('#dpTable');await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert(await page.locator('#dpTable').evaluate(e=>e.scrollLeft>0));}
  coverage.push({lang,width,controls:'>=48px',noPageOverflow:true,termGeometry:terms,table:'contained horizontal scrolling'});
 }
 // 200% CSS zoom changes layout, including an effective 320px usable width.
 for(const width of [640,1440]){await page.setViewportSize({width,height:1100});await page.evaluate(()=>document.documentElement.style.zoom='2');for(const lang of ['en','zh']){await locale(lang);await page.locator('#summary').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const terms=await page.locator('.term').evaluateAll(es=>es.map(e=>({w:e.clientWidth,s:e.scrollWidth})));assert(terms.every(x=>x.w>=58&&x.s<=x.w));await page.screenshot({path:path.join(out,`${lang}-${width}-zoom200.png`)});}await page.evaluate(()=>document.documentElement.style.zoom='1');}
 await page.setViewportSize({width:390,height:1000});for(const lang of ['en','zh']){await locale(lang);await page.selectOption('#insertion','2');await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');for(const s of ['step0','step1','step3','step4'])await page.locator('#'+s).screenshot({path:path.join(out,`${lang}-${s}.png`)});await page.locator('.step-nav').evaluate(e=>e.style.visibility='');}
 // Measured colors read from rendered elements, not assumed token ratios.
 for(const lang of ['en','zh']){await locale(lang);await page.locator('.site-head').screenshot({path:path.join(out,`${lang}-header.png`)});await page.selectOption('#preset','3,3');await page.locator('#position').fill('11');await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-middle.png`)});await page.click('#reset');await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-base.png`)});await page.click('#end');await page.locator('.step-nav').evaluate(e=>e.style.visibility='');}
 const contrast=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  return ['body','.explain','.hint','.formula','.term.used','.term:not(.used)','.current-cell','#next:disabled','#langToggle button:not(.active)','#langToggle button.active','.step-nav a:not(.active)','#copy','#feedback'].map(selector=>{const e=document.querySelector(selector),st=getComputedStyle(e);let node=e,bg;while(node){const color=getComputedStyle(node).backgroundColor;if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent'){bg=color;break;}node=node.parentElement;}return {selector,foreground:st.color,background:bg,opacity:st.opacity,ratio:ratio(rgb(st.color),rgb(bg))};}).concat([{selector:'focus accent2 / panel2',ratio:ratio([255,180,84],[28,35,48])},{selector:'field boundary muted / panel2',ratio:ratio([154,167,184],[28,35,48])}]);
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.focus('#position');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#position').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 // Block storage and then network: locale and the already-loaded source still work.
 const deny=await browser.newContext({viewport:{width:390,height:900}});await deny.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('denied')}});});const p2=await deny.newPage();p2.on('pageerror',e=>errors.push(e.message));await p2.goto(url);await p2.waitForFunction(()=>document.querySelector('#summary').textContent.length);await deny.setOffline(true);await p2.click('[data-lang=zh]');await p2.click('#next');assert((await p2.textContent('#summary')).includes('1/6'));assert.equal(await p2.textContent('#pythonCode'),source);await deny.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author real Chromium self-check',status:'PASS',coverage,bindings,contrast,cssBytes,errors,badResponses:bad,externalRequests:external,sourceParity:'exact mirror, textContent, intercepted and native clipboard, actual manual selection plus Control+C, downloaded bytes',zoom:'200% CSS zoom at 640 and 1440 widths, both locales',keyboard:true,forcedColors:true,blockedStorageOffline:true},null,2)+'\n');console.log('PASS Chromium; evidence: '+out);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
