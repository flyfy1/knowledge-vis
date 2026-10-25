/* Author browser self-check. OUTPUT_DIR redirects all emitted evidence. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18781',url=base+'/leetcode/600/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const oracle=JSON.parse(fs.readFileSync(path.join(out,'oracle-cases.json'))),presets=[1,2,5,6,8,10,12,1000000000];
// Independent binary enumeration with memoization: explore legal next bits.
function tails(k,last=0,memo={}){if(!k)return 1;const key=k+','+last;if(memo[key])return memo[key];return memo[key]=tails(k-1,0,memo)+(last?0:tails(k-1,1,memo));}
function expected(n){const bits=n.toString(2);let sum=0,prev=0;const frames=[{sum,kind:'initial'}];for(let j=0;j<bits.length;j++){const bit=+bits[j],i=bits.length-j-1,add=bit?tails(i):0,branch=bit?bits.slice(0,j)+'0'+'?'.repeat(i):null;sum+=add;const kind=bit&&prev?'stop':bit?'one':'zero';frames.push({sum,kind,bit,i,add,branch});if(kind==='stop')return frames;prev=bit;}frames.push({sum:sum+1,kind:'finish',add:1,branch:bits});return frames;}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 await context.addInitScript(()=>{localStorage.setItem('knowledge-lang','en');window.copyWrites=[];window.nativeClipboard=navigator.clipboard;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copyWrites.push(text)}});});
 const page=await context.newPage(),errors=[],bad=[],external=[],coverage=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#summary').textContent.includes('0/4'));
 const locale=async lang=>{await page.click(`[data-lang=${lang}]`);assert.equal(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang);};
 async function check(n,at){const frames=expected(n),f=frames[at],summary=await page.textContent('#summary');assert(summary.includes(`${at}/${frames.length-1}`));assert(summary.includes(String(f.sum)));assert.equal(await page.locator('#bits .completed').count(),at===0?0:f.kind==='finish'?n.toString(2).length:n.toString(2).length-f.i);assert.equal(await page.inputValue('#position'),String(at));
  if(at){const cells=await page.locator('#ledger tbody tr').last().locator('td').allTextContents();assert.equal(cells[0],f.branch===null?(await page.getAttribute('html','lang')==='en'?'No smaller branch':'无较小分支'):f.branch);assert.equal(cells[1],f.bit===1?`f[${f.i}] = ${f.add}`:String(f.add));assert.equal(+cells[2],f.sum);}else assert.equal(await page.locator('#ledger table').count(),0);
  if(at===frames.length-1)assert.equal(f.sum,oracle[n]);
 }
 for(const lang of ['en','zh']){
  await locale(lang);
  const formula=await page.locator('[data-i18n=formula]').textContent();for(const token of ['f[0] = 1','f[1] = 2','f[k] = f[k−1] + f[k−2]','k ≥ 2'])assert(formula.includes(token));
  for(let k=0;k<=5;k++){await page.selectOption('#suffixK',String(k));const tiles=await page.locator('#suffixStrings .ledger-item').allTextContents();assert.equal(tiles.length,tails(k));if(k)assert(tiles.every(x=>x.length===k&&!x.includes('11')));else assert(tiles[0].includes('ε'));assert((await page.textContent('#suffixSummary')).includes(`f[${k}] = ${tiles.length}`));}
  for(const n of presets){const frames=expected(n),last=frames.length-1;await page.selectOption('#preset',String(n));await check(n,0);assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   for(let at=1;at<=last;at++){await page.click('#next');await check(n,at);if(frames[at].kind==='stop')assert((await page.textContent('#event')).includes(lang==='en'?'first count':'先把'));}
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).opacity),'1');
   const snapshot=await page.locator('#ledger').textContent();await page.click('#prev');await check(n,last-1);await page.click('#next');assert.equal(await page.locator('#ledger').textContent(),snapshot);
   await page.click('#reset');await check(n,0);await page.click('#end');await check(n,last);await page.locator('#position').fill('0');await check(n,0);await page.locator('#position').fill(String(last));await check(n,last);
   coverage.push({lang,n,frames:frames.length,allIntermediateValues:true,endpoints:true,replay:true,slider:true});
  }
  assert(await page.isHidden('#feedback'));assert(await page.isDisabled('#reveal'));
  for(const option of ['0','1','2']){await page.check(`[name=prediction][value="${option}"]`);assert(await page.isHidden('#feedback'));await page.click('#reveal');const feedback=await page.textContent('#feedback');assert(feedback.startsWith(lang==='en'?(option==='2'?'Correct choice.':'This choice'):(option==='2'?'选择正确。':'这个选择')));assert(feedback.includes('f[3] = 5'));assert(feedback.includes('f[2] = 3'));assert(feedback.includes(lang==='en'?'answer is 8':'答案为 8'));await locale(lang==='en'?'zh':'en');assert(await page.isChecked(`[name=prediction][value="${option}"]`));assert(await page.isVisible('#feedback'));await check(1e9,expected(1e9).length-1);await locale(lang);coverage.push({lang,option,feedback});}
  await page.reload();await page.waitForFunction(()=>document.querySelector('#summary').textContent.length>0);
 }
 await locale('en');await page.check('[name=prediction][value="2"]');await page.click('#reveal');await page.selectOption('#preset','6');assert(await page.isVisible('#feedback'));await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));
 // Source transfer, including actual manual selection after clipboard rejection.
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.textContent('#pythonCode'),source);await page.click('#copy');assert.equal(await page.evaluate(()=>window.copyWrites.at(-1)),source);assert((await page.textContent('#copyStatus')).includes('copied'));
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('[download]')]);await download.saveAs(path.join(out,'downloaded-solution.py'));assert.equal(fs.readFileSync(path.join(out,'downloaded-solution.py'),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));
 for(const lang of ['en','zh']){await locale(lang);await page.click('#copy');assert(await page.isVisible('#manualCopy'));assert.equal(await page.inputValue('#copyText'),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');assert.equal(await page.locator('#copyText').evaluate(e=>e.value.substring(e.selectionStart,e.selectionEnd)),source);await page.keyboard.press('Control+C');assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);assert((await page.textContent('#copyStatus')).includes(lang==='en'?'Automatic copy unavailable':'自动复制不可用'));}
 // Keyboard uses actual events; locale preserves focus rather than rebuilding controls.
 await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.focus('#sourceDetails summary');await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.selectOption('#preset','5');await page.selectOption('#suffixK','5');await page.focus('#position');await page.keyboard.press('ArrowRight');await check(5,1);
 const focus=await page.locator('#position').evaluate(e=>({width:getComputedStyle(e).outlineWidth,style:getComputedStyle(e).outlineStyle}));assert.deepEqual(focus,{width:'3px',style:'solid'});
 await page.focus('#next');await page.keyboard.press('Enter');await check(5,2);await locale('en');await check(5,2);assert.equal(await page.inputValue('#suffixK'),'5');
 for(const href of await page.locator('.related a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){const u=new URL(href,url),res=await context.request.get(u.href.split('#')[0]);assert(res.ok());assert((await res.text()).includes(`id="${u.hash.slice(1)}"`));}
 await page.click('.step-nav a[href="#step2"]');await page.waitForFunction(()=>{const y=document.querySelector('#step2').getBoundingClientRect().y;return y>=60&&y<=110;});assert((await page.locator('#step2').boundingBox()).y>=0);
 // Both dense 30-bit input and early-stop small example, at every supported width.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await locale(lang);await page.selectOption('#preset','1000000000');await page.click('#end');await page.locator('#summary').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang}/${width} overflow`);
  const geometry=await page.locator('.bit').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth})));assert(geometry.every(x=>x.width>=46&&x.scroll<=x.width+1));
  const controls=await page.locator('button,select').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().width>0).map(e=>({id:e.id,h:e.getBoundingClientRect().height})));assert(controls.every(x=>x.h>=48),JSON.stringify(controls));
  await page.screenshot({path:path.join(out,`${lang}-${width}-dense.png`)});
  await page.selectOption('#preset','6');await page.click('#end');await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');await page.locator('#step2 .stage').screenshot({path:path.join(out,`${lang}-${width}-stop.png`)});await page.locator('.step-nav').evaluate(e=>e.style.visibility='');if(width===320){await page.focus('#ledger');await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);assert(await page.locator('#ledger').evaluate(e=>e.scrollLeft>0));}
  coverage.push({lang,width,bitGeometry:geometry,controls:'>=48px',noPageOverflow:true});
 }
 await page.setViewportSize({width:1440,height:1100});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const lang of ['en','zh']){await locale(lang);await page.locator('#summary').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='1');
 // Capture formula, suffix split, quiz and source in addition to scan stages.
 await page.setViewportSize({width:390,height:1000});for(const lang of ['en','zh']){await locale(lang);await page.selectOption('#suffixK','3');await page.locator('.step-nav').evaluate(e=>e.style.visibility='hidden');await page.locator('#step1').screenshot({path:path.join(out,`${lang}-suffix.png`)});await page.check('[name=prediction][value="2"]');await page.click('#reveal');await page.locator('#step3').screenshot({path:path.join(out,`${lang}-quiz.png`)});await page.locator('.step-nav').evaluate(e=>e.style.visibility='');}
 // Rendered pairs; backgrounds include actual inherited solid surfaces.
 const contrast=await page.evaluate(()=>{
  const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  const sels=['body','.explain','.hint','.formula','.ledger-item','.bit span','.bit.completed span','#next:disabled','#langToggle button:not(.active)','#langToggle button.active','.step-nav a:not(.active)','#copy','#feedback'];
  return sels.map(selector=>{const e=document.querySelector(selector);const st=getComputedStyle(e);let node=e,bg;while(node){const color=getComputedStyle(node).backgroundColor;if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent'){bg=color;break;}node=node.parentElement;}return {selector,foreground:st.color,background:bg,ratio:ratio(rgb(st.color),rgb(bg))};}).concat([{selector:'focus accent2 / panel2',ratio:ratio([255,180,84],[28,35,48])},{selector:'control border muted / panel2',ratio:ratio([154,167,184],[28,35,48])}]);
 });assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast));
 const deny=await browser.newContext({viewport:{width:390,height:900}});await deny.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('denied')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('denied')}});});const p2=await deny.newPage();p2.on('pageerror',e=>errors.push(e.message));await p2.goto(url);await p2.waitForFunction(()=>document.querySelector('#summary').textContent.length>0);await deny.setOffline(true);await p2.click('[data-lang=zh]');await p2.click('#next');assert((await p2.textContent('#summary')).includes('1/4'));assert.equal(await p2.textContent('#pythonCode'),source);await deny.close();
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.focus('#position');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#position').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author real Chromium self-check',status:'PASS',coverage,contrast,cssBytes,errors,badResponses:bad,externalRequests:external,sourceParity:'exact displayed, native browser clipboard, mock payload, selected text and Control+C fallback, downloaded bytes',zoom:'CSS zoom 2 at 1440; both locales',blockedStorageOffline:true,keyboard:true,forcedColors:true},null,2));console.log('PASS: Chromium checks; evidence '+out);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
