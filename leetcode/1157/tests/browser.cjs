'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1157/',src=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const {presets,trace}=require('../core.js'),expected=[1,-1,2,-1,7,20000,-1];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await ctx.newPage();
 const errors=[],requests=[],coverage=[],shots=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url);});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>5);
 const snapshot=()=>page.evaluate(()=>['blocks','event','progress','history'].map(id=>document.getElementById(id).textContent).join('\n'));
 const hsnapshot=()=>page.evaluate(()=>['handTiles','handEvent','handRead','pairs','handHistory'].map(id=>document.getElementById(id).textContent).join('\n'));
 async function shot(name){await page.screenshot({path:path.join(OUT,name)});shots.push(name);}
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);const zh=lang==='zh';
  assert.equal(await page.locator('h1').textContent(),zh?'#1157 · 子数组中占绝大多数的元素':'#1157 · Online Majority Element In Subarray');
  assert.equal(await page.locator('html').getAttribute('lang'),zh?'zh-CN':'en');
  assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/online-majority-element-in-subarray/');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   const initial=await snapshot();let previous=initial;
   const frames=trace(presets[p]).frames;
   for(let i=1;i<frames.length;i++){
    await page.click('#next');const current=await snapshot(),f=frames[i],event=await page.locator('#event').textContent();
    if(f.kind==='block'){
     const a=f.before,b=trace(presets[p]).tree[f.id];
     assert(event.includes(`(${a.join(',')})`));assert(event.includes(`(${b.join(',')})`));assert(event.includes(`(${f.summary.join(',')})`));
     const reason=(!a[1]||!b[1])?(zh?'空摘要':'empty summary'):a[0]===b[0]?(zh?'候选相同':'Equal candidates'):(zh?'候选不同':'Different candidates');assert(event.includes(reason));
     assert.equal(await page.locator('.block.current').count(),1);assert((await page.locator('.block.current').textContent()).includes(zh?'已合并 · 当前':'merged · current'));
    }
    await page.click('#prev');assert.equal(await snapshot(),previous);await page.click('#next');assert.equal(await snapshot(),current);previous=current;
   }
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));
   const event=await page.locator('#event').textContent();assert(event.includes(zh?`返回 ${expected[p]}`:`return ${expected[p]}`));
   const final=await snapshot();await page.click('#reset');assert.equal(await snapshot(),initial);await page.click('#end');assert.equal(await snapshot(),final);
   coverage.push({lang,preset:p,input:presets[p],expected:expected[p],observed:event,allFramesRewound:true});
  }
  await page.selectOption('#preset','0');await page.click('#next');const rangeState=await snapshot();
  const initialH=await hsnapshot();let previous=initialH;
  for(let k=1;k<=6;k++){
   await page.click('#handNext');const current=await hsnapshot();
   assert.equal(await page.locator('#handTiles .current').count(),1);
   const cur=await page.locator('#handTiles .current').textContent();assert(cur.includes(zh?'当前':'current'));
   if(k===2)assert(cur.includes(zh?'留下':'kept'));if(k===3)assert(cur.includes(zh?'配对':'paired'));
   await page.click('#handPrev');assert.equal(await hsnapshot(),previous);await page.click('#handNext');assert.equal(await hsnapshot(),current);previous=current;
   coverage.push({lang,handStep:k,visibleEvent:await page.locator('#handEvent').textContent(),readout:await page.locator('#handRead').textContent(),pairs:await page.locator('#pairs').textContent()});
  }
  assert(await page.isDisabled('#handNext'));assert((await page.locator('#handRead').textContent()).includes(zh?'候选 = 1':'candidate = 1'));assert((await page.locator('#handRead').textContent()).includes(zh?'= 2 张':'= 2 surviving'));
  assert.equal(await snapshot(),rangeState);await page.click('#handReset');assert.equal(await hsnapshot(),initialH);
  const formula=await page.locator('.formula').textContent();assert(formula.includes('(x,p−q)'));assert(formula.includes('(y,q−p)'));assert(formula.includes('(0,0)'));for(const term of ['(x,p+q)','x≠y','p>q','q>p','p=q'])assert(formula.includes(term));
  coverage.push({lang,formula});
  for(const opt of ['0','1','2']){
   await page.check(`[name=prediction][value="${opt}"]`);assert(await page.locator('#feedback').isHidden());assert.equal(await page.locator('#feedback').textContent(),'');
   await page.click('#reveal');const feed=await page.locator('#feedback').textContent();assert(feed.startsWith(opt==='1'?(zh?'正确。':'Correct.'):(zh?'需要修正。':'Revise this prediction.')));assert(feed.includes('[0,1,2]'));assert(feed.includes(zh?'返回 4':'return 4'));coverage.push({lang,choice:opt,feedback:feed});
  }
  const state=await snapshot(),feed=await page.locator('#feedback').textContent();
  await page.click(`[data-lang=${zh?'en':'zh'}]`);assert(await page.isChecked('[name=prediction][value="2"]'));assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await snapshot(),state);assert.equal(await page.locator('#feedback').textContent(),feed);
  await page.click('#reset');assert(await page.locator('#feedback').isVisible());await page.selectOption('#preset','3');assert(await page.locator('#feedback').isVisible());
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#code').textContent(),src);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('automatic-copy-fresh-sentinel');if(await navigator.clipboard.readText()!=='automatic-copy-fresh-sentinel')throw Error('automatic sentinel failed');});await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.includes('copied')||document.querySelector('#copyStatus').textContent.includes('已复制'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),src);
  // Each individual manual copy starts with its own verified non-source sentinel.
  for(let attempt=0;attempt<2;attempt++){
   const sentinel=`1157-${lang}-${attempt}-${Date.now()}-sentinel`;
   await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel reset failed');window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('test denial'));},sentinel);
   await page.click('#copy');assert(await page.locator('#fallbackSource').evaluate(e=>e===document.activeElement));
   assert.deepEqual(await page.locator('#fallbackSource').evaluate(e=>({a:e.selectionStart,b:e.selectionEnd,value:e.value})),{a:0,b:src.length,value:src});
   await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),src);
   coverage.push({lang,attempt,host:process.platform,sentinelVerified:true,manualTransfer:'native host shortcut + exact readback',feedback:await page.locator('#copyStatus').textContent(),newlineConversion:'none'});
   await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});
  }
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('#download')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),src);
  await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#manualCopy').hidden);await page.locator('#sourceDetails summary').click();
 }
 // Real browser reflow with CSS zoom: explicit method, not a physical device claim.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.click(`[data-lang=${lang}]`);
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));await page.click('#end');assert(await page.isDisabled('#next'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang}/${width}/zoom${zoom}/preset${p} overflow`);
   const fit=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:e.selectedOptions[0].textContent,needed:c.measureText(e.selectedOptions[0].textContent).width+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+22,available:e.clientWidth};});assert(fit.needed<=fit.available+1,JSON.stringify({lang,width,zoom,p,fit}));
   for(const id of ['#blocks','#event','#progress','#queryInput']){
    const geometry=await page.locator(id).evaluate(e=>({scroll:e.scrollWidth,client:e.clientWidth}));assert(geometry.scroll<=geometry.client+1,`${id} ${lang} ${width} ${zoom}`);
   }
  }
  await page.selectOption('#preset','0');await page.click('#next');await page.locator('#blocks').scrollIntoViewIfNeeded();await shot(`${lang}-${width}-zoom${zoom}-blocks.png`);
  const boxes=await page.locator('#blocks .block p').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,scroll:e.scrollWidth,client:e.clientWidth};}));
  boxes.forEach(b=>assert(b.scroll<=b.client+1));for(let i=1;i<boxes.length;i++)if(Math.abs(boxes[i].left-boxes[i-1].left)<1)assert(boxes[i-1].bottom<=boxes[i].top+1);
  await page.click('#handNext');await page.click('#handNext');await page.click('#handNext');await page.locator('#handTiles').scrollIntoViewIfNeeded();
  if(width===320||width===1440)await shot(`${lang}-${width}-zoom${zoom}-hand.png`);
  const tiles=await page.locator('#handTiles .tile').evaluateAll(es=>es.map(e=>({scroll:e.scrollWidth,client:e.clientWidth})));tiles.forEach(b=>assert(b.scroll<=b.client+1,JSON.stringify({lang,width,zoom,tile:b})));await page.click('#handReset');
  await page.locator('#reveal').scrollIntoViewIfNeeded();await page.focus('#reveal');assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  if(width===320||width===1440)await shot(`${lang}-${width}-zoom${zoom}-prediction.png`);
  if(width===320){await page.locator('h1').scrollIntoViewIfNeeded();await shot(`${lang}-320-zoom${zoom}-heading.png`);}
  coverage.push({lang,width,zoom,allPresetsNoOverflow:true,nativeSelectFit:true,blockAndTileTextFit:true});
 }
 await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.body.style.zoom=1);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  for(const a of await page.locator('.related a[href^="#"]').all()){
   const href=await a.getAttribute('href');await a.focus();await page.keyboard.press('Enter');await page.waitForTimeout(100);assert.equal(new URL(page.url()).hash,href);const top=await page.locator(href).evaluate(e=>e.getBoundingClientRect().top),nav=await page.locator('nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=nav-1);coverage.push({lang,deepLink:href,top,nav});
  }
  const a=page.locator('.related a[href="../327/#step2"]'),target=new URL(await a.getAttribute('href'),url);const response=await ctx.request.get(target.href);assert.equal(response.status(),200);const targetHtml=await response.text();assert(targetHtml.includes('id="step2"'));coverage.push({lang,related:target.href,targetStatus:200,targetAnchorExists:true});
 }
 await page.check('[name=prediction][value="0"]');await page.focus('[name=prediction][value="0"]');await page.keyboard.press('ArrowRight');assert(await page.isChecked('[name=prediction][value="1"]'));assert(await page.locator('#feedback').isHidden());await page.keyboard.press('Tab');assert(await page.locator('#reveal').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert(await page.locator('#feedback').isVisible());
 // Keyboard stepping and locale changes preserve focus.
 await page.selectOption('#preset','0');await page.focus('#next');await page.keyboard.press('Enter');assert((await page.locator('#history').textContent()).includes('6'));await page.focus('[data-lang=en]');await page.keyboard.press('Enter');assert(await page.locator('[data-lang=en]').evaluate(e=>e===document.activeElement));
 function lum(rgb){return rgb.map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}assert.equal(contrast([0,0,0],[255,255,255]),21);
 await page.click('#end');const pairs=[];
 for(const sel of ['body','.explain','.hint','#blocks p','#next','#preset','#fallbackSource','#reveal','.lang-toggle .active','.step-nav a.active','a.official-link','#handTiles small']){
  const colors=await page.locator(sel).first().evaluate(e=>{const s=getComputedStyle(e);let p=e,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;p=p.parentElement;}return {fg:s.color,bg};});const parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const ratio=contrast(parse(colors.fg),parse(colors.bg));assert(ratio>=4.5,sel+' '+ratio);pairs.push({selector:sel,...colors,ratio});
 }
 for(const bg of [[13,17,23],[28,35,48],[22,27,34]]){const ratio=contrast([255,180,84],bg);assert(ratio>=3);pairs.push({selector:'focus outline',bg,ratio});}
 const sizes=await page.locator('button,select,.prediction-options label').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {id:e.id,text:e.textContent,width:r.width,height:r.height};}));for(const s of sizes){assert(s.height>=48,s.id+' height');assert(s.width>=48,JSON.stringify(s)+' width');}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.focus('#reveal');assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
 const storage=await browser.newContext();await storage.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('storage blocked')};Storage.prototype.setItem=()=>{throw Error('storage blocked')};});const sp=await storage.newPage();sp.on('pageerror',e=>errors.push(e.message));await sp.goto(url);await sp.click('[data-lang=zh]');assert((await sp.locator('h1').textContent()).includes('#1157'));await storage.setOffline(true);assert.equal(await sp.locator('#code').textContent(),src);await sp.click('[data-lang=en]');assert.equal(await sp.locator('html').getAttribute('lang'),'en');await sp.click('#next');assert((await sp.locator('#history').textContent()).includes('6'));await storage.close();
 // Standalone local opening does not fetch source at runtime.
 const local=await browser.newPage();await local.goto('file://'+path.join(ROOT,'index.html'));await local.waitForFunction(()=>document.querySelector('#progress').textContent.length>5);assert.equal(await local.locator('#code').textContent(),src);await local.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(new URL(url).origin)||u.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'..','style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({kind:'author self-check',status:'pass',browser:browser.version(),host:process.platform,url,coverage,screenshots:shots,contrast:pairs,controlSizes:sizes,errors,localAssetsOnly:true,blockedStorage:true,offlineAndFileSource:true,cssBytes,sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),zoomMethod:'CSS zoom 2 tests reflow at 200%; physical browser chrome zoom and real devices not measured'},null,2)+'\n');
 await browser.close();console.log('PASS browser',coverage.length,'checks',shots.length,'screenshots');
})().catch(e=>{console.error(e);process.exit(1);});
