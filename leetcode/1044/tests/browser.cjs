'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',url=base+'/leetcode/1044/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
function exactLcp(s,i,j){if(j===null)return 0;let h=0;while(i+h<s.length&&j+h<s.length&&s[i+h]===s[j+h])h++;return h;}
function expected(s){const sa=Array.from({length:s.length},(_,i)=>i).sort((a,b)=>s.slice(a)<s.slice(b)?-1:1);return {sa,len:Math.max(...sa.map((i,p)=>p?exactLcp(s,i,sa[p-1]):0))};}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],locale:'en-US'});
 const page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)network.push({url:r.url(),status:r.status()});});
 page.on('requestfailed',r=>network.push({url:r.url(),failure:r.failure()}));
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.locator('#rankRead').filter({hasText:'Initial'}).waitFor();
 const report={kind:'author self-check',browser:browser.version(),hostPlatform:process.platform,url,locales:[],views:[],clipboard:[],related:[],errors,network};
 const strings=['banana','aaaa','abcd','aa','ab','ababab'];
 async function lang(l){await page.locator(`[data-lang="${l}"]`).click();assert.equal(await page.locator('h1').textContent(),l==='en'?'#1044 · Longest Duplicate Substring':'#1044 · 最长重复子串');assert.equal(await page.title(),await page.locator('h1').textContent());}
 for(const l of ['en','zh']){
  await lang(l);await page.locator('#handToggle').click();assert.equal(await page.locator('.char.second').count(),3);await page.locator('#handToggle').click();
  for(let p=0;p<strings.length;p++){
   await page.selectOption('#preset',String(p));const s=strings[p],e=expected(s);
   assert.equal(await page.locator('#rankPrev').isDisabled(),true);assert.equal(await page.locator('#scanPrev').isDisabled(),true);
   const states=[];
   while(!await page.locator('#rankNext').isDisabled()){
    await page.locator('#rankNext').click();states.push(await page.locator('#ranks').textContent());
   }
   if(p===0){assert.ok((await page.locator('[data-i18n=doubleExample]').textContent()).includes('(1,1)'));assert.equal(await page.locator('#ranks tr').filter({has:page.locator('td:first-child',{hasText:/^1$/})}).locator('td').nth(2).textContent(),'(1, 1)');}
   const order=await page.locator('#ranks tr td:first-child').allTextContents();assert.deepEqual(order.map(Number),e.sa);
   await page.locator('#rankPrev').click();await page.locator('#rankNext').click();assert.equal(await page.locator('#ranks').textContent(),states.at(-1));
   await page.locator('#rankReset').click();assert.equal(await page.locator('#rankPrev').isDisabled(),true);await page.locator('#rankEnd').click();
   let best=0,bestStart=0;
   for(let i=0;i<s.length;i++){
    await page.locator('#scanNext').click();
    const rows=await page.locator('#scan tr').evaluateAll(rs=>rs.map(r=>Array.from(r.cells,c=>c.textContent)));
    assert.equal(rows.length,i+1);
    const pos=e.sa.indexOf(i),j=pos?e.sa[pos-1]:null,len=exactLcp(s,i,j);
    assert.equal(Number(rows[i][0]),i);assert.equal(Number(rows[i][5]),len);
    if(len>best){best=len;bestStart=i;}
    const read=await page.locator('#scanRead').textContent();assert.ok(read.includes(l==='en'?`length ${best}`:`长度 ${best}`));assert.ok(read.includes(JSON.stringify(s.slice(bestStart,bestStart+best))));
   }
   assert.equal(best,e.len);assert.equal(await page.locator('#scanNext').isDisabled(),true);
   const end=await page.locator('#scan').textContent();await page.locator('#scanPrev').click();await page.locator('#scanNext').click();assert.equal(await page.locator('#scan').textContent(),end);
   await page.locator('#scanReset').click();assert.equal(await page.locator('#scan tr').count(),1);await page.locator('#scanEnd').click();
   report.locales.push({locale:l,preset:s,completedStarts:s.length,best,order});
  }
  assert.equal(await page.locator('#reveal').isDisabled(),l==='en');
  for(let choice=0;choice<3;choice++){
   await page.locator(`[name=prediction][value="${choice}"]`).check();assert.equal(await page.locator('#feedback').isHidden(),true);
   await page.locator('#reveal').click();const feedback=await page.locator('#feedback').textContent();assert.ok(feedback.includes('cababa'));assert.ok(feedback.startsWith(l==='en'?(choice===2?'Correct.':'Check the starts'):(choice===2?'正确。':'再检查起点')));
   const before=await page.locator('#scan').textContent();await lang(l==='en'?'zh':'en');assert.equal(await page.locator(`[name=prediction][value="${choice}"]`).isChecked(),true);assert.equal(await page.locator('#feedback').isHidden(),false);assert.equal(await page.locator('#scan tr').count(),6);await lang(l);assert.equal(await page.locator('#scan').textContent(),before);
  }
  await page.locator('[name=prediction][value="0"]').check();assert.equal(await page.locator('#feedback').isHidden(),true);
  await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();await page.selectOption('#preset','1');assert.equal(await page.locator('#rankPrev').isDisabled(),true);assert.equal(await page.locator('#scanPrev').isDisabled(),true);assert.equal(await page.locator('#feedback').isHidden(),false);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#code').textContent(),source);
  // Native clipboard success, then a fresh sentinel before each denied automatic attempt.
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  for(let attempt=0;attempt<2;attempt++){
   const sentinel=`1044-${l}-${attempt}-${Date.now()}`;
   await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel failed');},sentinel);
   await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test denial'));});
   await page.locator('#copy').click();assert.equal(await page.locator('#fallbackSource').inputValue(),source);
   assert.deepEqual(await page.locator('#fallbackSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd]),[true,0,source.length]);
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});
   report.clipboard.push({locale:l,attempt,sentinelVerified:true,nativeCopyExact:true,hostShortcut:process.platform==='darwin'?'Meta+C':'Control+C'});
  }
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);const file=await download.path();assert.deepEqual(fs.readFileSync(file),Buffer.from(source));
 }
 // Responsive populated states, selected labels, keyboard scroll and 200% CSS zoom.
 for(const width of [320,390,736,1440])for(const zoom of [1,2])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await lang(l);
  await page.selectOption('#preset','0');await page.locator('#rankEnd').click();await page.locator('#scanEnd').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),true,`overflow ${width} ${zoom} ${l}`);
  for(const id of ['#ranks','#scan']){
   const box=await page.locator(id).evaluate(e=>{const cells=[...e.querySelectorAll('td')];return cells.every(c=>getComputedStyle(c).fontSize==='14px'&&c.clientWidth>20);});assert.equal(box,true);
  }
  const select=await page.locator('#preset').evaluate(e=>{const st=getComputedStyle(e),can=document.createElement('canvas'),ctx=can.getContext('2d');ctx.font=st.font;const text=e.selectedOptions[0].textContent;return {text,width:e.clientWidth,font:st.font,textWidth:Math.max(...Array.from(e.options,o=>ctx.measureText(o.textContent).width)),padding:parseFloat(st.paddingLeft)+parseFloat(st.paddingRight),arrowReserve:24};});
  assert.ok(select.textWidth+select.padding+select.arrowReserve<=select.width,JSON.stringify(select));
  await page.locator('#rankNext').focus(); // disabled endpoint must not become an operable action
  await page.locator('#rankPrev').focus();assert.equal(await page.locator('#rankPrev').evaluate(e=>document.activeElement===e),true);
  await page.keyboard.press('Enter');assert.equal(await page.locator('#rankNext').isDisabled(),false);
  const focus=await page.locator('#rankPrev').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
  await page.locator('#rankNext').click();
  const scroll=page.locator('#scan').locator('..').locator('..');await scroll.focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(200);await page.evaluate(()=>document.activeElement.blur());
  if((width===320||width===1440)&&zoom===1||width===390&&zoom===2){
   await page.locator('#scan').evaluate(e=>{const box=e.closest('.table-wrap');window.scrollTo({top:box.getBoundingClientRect().top+window.scrollY-document.querySelector('.step-nav').getBoundingClientRect().height-16,behavior:'instant'});});await page.waitForTimeout(200);await page.screenshot({path:path.join(out,`scan-${l}-${width}-z${zoom}.png`)});
   await page.locator('#scan').evaluate(e=>{const wrap=e.closest('.table-wrap');wrap.scrollLeft=e.rows[0].cells[5].offsetLeft-e.rows[0].cells[0].offsetWidth;});await page.waitForTimeout(200);await page.screenshot({path:path.join(out,`scan-values-${l}-${width}-z${zoom}.png`)});await page.locator('#scan').evaluate(e=>e.closest('.table-wrap').scrollLeft=0);
   await page.locator('#ranks').evaluate(e=>{const box=e.closest('.table-wrap');window.scrollTo({top:box.getBoundingClientRect().top+window.scrollY-document.querySelector('.step-nav').getBoundingClientRect().height-16,behavior:'instant'});});await page.waitForTimeout(200);await page.screenshot({path:path.join(out,`rank-${l}-${width}-z${zoom}.png`)});
  }
  report.views.push({width,zoom,locale:l,overflow:false,select,focus});
 }
 await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:390,height:1000});
 await page.evaluate(()=>document.documentElement.style.zoom='1');await page.setViewportSize({width:1440,height:1000});await lang('en');await page.screenshot({path:path.join(out,'desktop-full-en.png'),fullPage:true});
 // Narrow zh→en→zh roundtrip preserves meaningful trace state and H1 identity.
 await lang('zh');await page.setViewportSize({width:390,height:1000});await page.selectOption('#preset','0');await page.locator('#scanNext').click();await page.locator('#scanNext').click();const state=await page.locator('#scan tr td:first-child').allTextContents();
 for(const l of ['en','zh']){await lang(l);assert.deepEqual(await page.locator('#scan tr td:first-child').allTextContents(),state);}
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'header-zh-390.png')});
 // Follow actual rendered concept links, not just file existence.
 for(const l of ['en','zh']){
  await lang(l);
  for(const sel of ['.related a:first-child','.related a:last-child']){
   const a=page.locator(sel),label=await a.textContent(),href=await a.getAttribute('href');
   await a.focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);
   const hash=new URL(page.url()).hash;const heading=await page.locator(hash+' h2').textContent();const text=await page.locator(hash).textContent();
   assert.ok(text.length>150);if(href.includes('115'))assert.ok(text.includes(l==='en'?'prefix':'前缀'));
   report.related.push({locale:l,label,url:page.url(),heading,observedText:text.slice(0,1000)});await page.goto(url);await lang(l);
  }
 }
 // Solid rendered contrast, measured via the exact function tested below.
 function luminance(hex){const rgb=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];}
 function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 assert.equal(ratio('000000','ffffff'),21);assert.equal(ratio('ffffff','ffffff'),1);assert.ok(Math.abs(ratio('ff0000','000000')-5.252)<1e-10);assert.ok(ratio('747474','000000')<4.5);
 report.contrast={reference:'sRGB .2126/.7152/.0722; solid colors only',calibration:{blackWhite:ratio('000000','ffffff'),redBlack:ratio('ff0000','000000'),nearThreshold:ratio('747474','000000')},pairs:[]};
 assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/longest-duplicate-substring/');
 const pairs=[['e8edf4','161b22'],['e8edf4','1c2330'],['9aa7b8','161b22'],['9aa7b8','1c2330'],['c9d4e2','0d1117'],['6ee7ff','0d1117'],['ffb454','1c2330'],['ffb454','161b22']];
 for(const [fg,bg] of pairs){const r=ratio(fg,bg);assert.ok(r>=4.5);report.contrast.pairs.push({fg,bg,ratio:r,threshold:4.5});}
 await page.locator('#scanEnd').click();
 report.renderedColors=await page.locator('p,caption,td,th,button,a,summary,label,legend,code,li').evaluateAll(es=>{
  const rgba=s=>{const v=s.match(/[\d.]+/g).map(Number);return [v[0],v[1],v[2],v[3]??1];};
  const blend=(f,b)=>f.slice(0,3).map((v,i)=>v*f[3]+b[i]*(1-f[3]));
  const hex=c=>c.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');
  return es.filter(e=>e.getClientRects().length&&e.textContent.trim()).map(e=>{
   const chain=[];for(let n=e;n;n=n.parentElement)chain.unshift(n);let bg=[13,17,23];for(const n of chain)bg=blend(rgba(getComputedStyle(n).backgroundColor),bg);
   const st=getComputedStyle(e),fg=blend(rgba(st.color),bg);return {selector:e.id||e.className||e.tagName,fg:hex(fg),bg:hex(bg),opacity:st.opacity};
  });
 });
 for(const pair of report.renderedColors){pair.ratio=ratio(pair.fg,pair.bg);assert.ok(pair.ratio>=4.5,JSON.stringify(pair));assert.equal(pair.opacity,'1');}
 report.contrast.minimumRendered=Math.min(...report.renderedColors.map(p=>p.ratio));
 // Static file opening proves no network needed to show code and experiments.
 const offline=await browser.newContext();const op=await offline.newPage();const offlineErrors=[];op.on('pageerror',e=>offlineErrors.push(e.message));await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#code').textContent(),source);await op.locator('#scanEnd').click();assert.equal(await op.locator('#scan tr').count(),6);assert.deepEqual(offlineErrors,[]);report.offline=true;await offline.close();
 const denied=await browser.newContext();await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked');};Storage.prototype.setItem=()=>{throw new Error('blocked');};});const dp=await denied.newPage();await dp.goto(url);await dp.locator('[data-lang=zh]').click();assert.equal(await dp.locator('h1').textContent(),'#1044 · 最长重复子串');await dp.locator('#scanEnd').click();report.storageDenied=true;await denied.close();
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#handToggle').click();await page.locator('#rankPrev').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});report.forcedColors=true;
 assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
 report.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert.ok(report.cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify({locales:report.locales.length,views:report.views.length,clipboard:report.clipboard.length,errors,network,cssBytes:report.cssBytes}));
})().catch(e=>{console.error(e);process.exit(1);});
