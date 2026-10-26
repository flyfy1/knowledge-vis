'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1147/';
const src=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'),{presets,trace}=require('../core.js');
const expected=[3,4,1,7,11,1,2,3];
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],requests=[],coverage=[],shots=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>4);
 async function snapshot(){return page.evaluate(()=>['chunks','event','bounds','progress','history'].map(id=>document.getElementById(id).textContent).join('\n'));}
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);const zh=lang==='zh';
  assert.equal(await page.locator('h1').textContent(),zh?'#1147 · 段式回文':'#1147 · Longest Chunked Palindrome Decomposition');assert.equal(await page.title(),await page.locator('h1').textContent());
  assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/longest-chunked-palindrome-decomposition/');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   const initial=await snapshot();let previous=initial;
   const frames=trace(presets[p]).frames;
   for(let i=1;i<frames.length;i++){
    await page.click('#next');const current=await snapshot();const event=await page.locator('#event').textContent(),e=frames[i].event;
    if(e.kind!=='middle'){assert(event.includes(e.a));assert(event.includes(e.b));assert(event.includes(e.kind==='match'?' = ':' ≠ '));}
    await page.click('#prev');assert.equal(await snapshot(),previous);await page.click('#next');assert.equal(await snapshot(),current);previous=current;
   }
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));
   const output=await page.locator('#progress').textContent();assert(output.includes(zh?`已计入 ${expected[p]} 块`:`counted ${expected[p]} chunks`));
   const final=await snapshot();await page.click('#reset');assert.equal(await snapshot(),initial);await page.click('#end');assert.equal(await snapshot(),final);
   coverage.push({lang,preset:p,input:presets[p],expected:expected[p],observed:output,rewindReplay:'all frames pass'});
  }
  await page.selectOption('#preset','0');await page.click('#next');assert((await page.locator('#event').textContent()).includes('v ≠ o'));
  const mismatch=await page.locator('#event').textContent();await page.click('#next');const matched=await page.locator('#event').textContent();assert(matched.includes('vo = vo'));
  assert((await page.locator('#bounds').textContent()).includes('[2,3)'));assert((await page.locator('#progress').textContent()).includes(zh?'2 块':'2 chunks'));
  assert((await page.locator('#chunks').textContent()).includes('[vo]'));assert.equal(await page.locator('#history li.current').count(),1);
  const formula=await page.locator('.formula').textContent();assert(formula.includes('fixed + OPT(text[left:right])'));assert(formula.includes('= 0'));
  coverage.push({lang,binding:{mismatch,matched,formula,afterBounds:await page.locator('#bounds').textContent(),afterChunks:await page.locator('#chunks').textContent()}});
  for(let i=0;i<4;i++)await page.click('#handNext');assert(await page.isDisabled('#handNext'));assert((await page.locator('#handState').textContent()).includes('5'));
  for(let i=0;i<4;i++)await page.click('#handPrev');assert(await page.isDisabled('#handPrev'));
  for(const option of ['0','1','2']){
   await page.check(`[name=prediction][value="${option}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('(ab)(xy)(ab)'));assert(feedback.startsWith(option==='2'?(zh?'正确。':'Correct.'):(zh?'再检查一次。':'Reconsider.')));
  }
  const state=await snapshot(),feedback=await page.locator('#feedback').textContent();
  await page.click(`[data-lang=${zh?'en':'zh'}]`);assert(await page.isChecked('[value="2"][name=prediction]'));assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await snapshot(),state);assert.equal(await page.locator('#feedback').textContent(),feedback);
  await page.click('#reset');assert(await page.locator('#feedback').isVisible());await page.selectOption('#preset','6');assert(await page.locator('#feedback').isVisible());
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#code').textContent(),src);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),src);
  const sentinel=`1147-${lang}-${Date.now()}-sentinel`;
  await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel failed');window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('intentional test denial'));},sentinel);
  await page.click('#copy');assert(await page.locator('#fallbackSource').evaluate(e=>e===document.activeElement));
  assert.deepEqual(await page.locator('#fallbackSource').evaluate(e=>({a:e.selectionStart,b:e.selectionEnd,value:e.value})),{a:0,b:src.length,value:src});
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),src);
  coverage.push({lang,clipboard:'automatic + denied-write native fallback passed',host:process.platform,sentinelVerified:true,newlineConversion:'none; exact string equality',fallback:await page.locator('#copyStatus').textContent()});
  await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('#download')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),src);
  await page.locator('#sourceDetails summary').click();
 }
 for(const lang of ['zh','en'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','4');await page.click('#end');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${lang} ${width} ${zoom} overflow`);
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));await page.click('#end');assert(await page.isDisabled('#next'));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const fit=await page.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return c.measureText(el.selectedOptions[0].textContent).width+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+24<=el.getBoundingClientRect().width/Number(document.body.style.zoom||1);});assert(fit,`${lang} ${width} ${zoom} preset ${p}`);
  }
  await page.selectOption('#preset','4');await page.click('#end');
  await page.locator('#chunks').scrollIntoViewIfNeeded();const name=`${lang}-${width}-zoom${zoom}-trace.png`;await page.screenshot({path:path.join(OUT,name)});shots.push(name);
  const boxes=await page.locator('#chunks p').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,scroll:e.scrollWidth,client:e.clientWidth};}));for(let i=0;i<boxes.length;i++){assert(boxes[i].scroll<=boxes[i].client+1);if(i)assert(boxes[i-1].bottom<=boxes[i].top);}
  await page.locator('#reveal').scrollIntoViewIfNeeded();await page.focus('#reveal');assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  if(width===320||width===1440){const q=`${lang}-${width}-zoom${zoom}-prediction.png`;await page.screenshot({path:path.join(OUT,q)});shots.push(q);}
  if(width===320){await page.locator('h1').scrollIntoViewIfNeeded();const h=`${lang}-320-zoom${zoom}-heading.png`;await page.screenshot({path:path.join(OUT,h)});shots.push(h);}
  coverage.push({lang,width,zoom,allPresetsNoOverflow:true,chunkRowsNoOverlap:true});
 }
 await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.body.style.zoom=1);
 for(const lang of ['zh','en']){
  await page.click(`[data-lang=${lang}]`);
  for(const a of await page.locator('.related a[href^="#"]').all()){
   const href=await a.getAttribute('href');await a.focus();await page.keyboard.press('Enter');await page.waitForTimeout(80);assert.equal(new URL(page.url()).hash,href);const top=await page.locator(href).evaluate(e=>e.getBoundingClientRect().top),nav=await page.locator('nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=nav-1);coverage.push({lang,deepLink:href,top,nav});
  }
  const a=page.locator('.related a[href="../214/#step1"]');await a.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('h1').textContent.length>4);assert.equal(new URL(page.url()).pathname,'/leetcode/214/');assert(await page.locator('#step1').count());coverage.push({lang,relatedTarget:page.url(),excerpt:(await page.locator('#step1').textContent()).slice(0,400)});await page.goBack();await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>4);
 }
 await page.check('[name=prediction][value="0"]');await page.focus('[name=prediction][value="0"]');await page.keyboard.press('ArrowRight');assert(await page.isChecked('[name=prediction][value="1"]'));assert(await page.locator('#feedback').isHidden());await page.keyboard.press('Tab');assert(await page.locator('#reveal').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert(await page.locator('#feedback').isVisible());
 function lum(rgb){return rgb.map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}assert.equal(contrast([0,0,0],[255,255,255]),21);
 await page.selectOption('#preset','0');await page.click('#end');const pairs=[];
 for(const sel of ['body','.explain','.hint','#chunks p','#next','#preset','#fallbackSource','#reveal','.lang-toggle .active','.step-nav a.active','a.official-link']){
  const colors=await page.locator(sel).first().evaluate(el=>{const cs=getComputedStyle(el);let p=el,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;p=p.parentElement;}return {fg:cs.color,bg};});const parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const ratio=contrast(parse(colors.fg),parse(colors.bg));assert(ratio>=4.5,sel+' '+ratio);pairs.push({selector:sel,...colors,ratio});
 }
 for(const bg of [[13,17,23],[28,35,48],[22,27,34]]){const ratio=contrast([255,180,84],bg);assert(ratio>=3);pairs.push({selector:'focus outline',bg,ratio});}
 const controlSizes=await page.locator('button,select,.prediction-options label').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {id:e.id,text:e.textContent,width:r.width,height:r.height};}));controlSizes.forEach(x=>assert(x.height>=48,x.id+' height'));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.focus('#reveal');assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));
 const storage=await browser.newContext();await storage.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('storage blocked')};Storage.prototype.setItem=()=>{throw Error('storage blocked')};});const sp=await storage.newPage();await sp.goto(url);await sp.click('[data-lang=zh]');assert.equal(await sp.locator('h1').textContent(),'#1147 · 段式回文');await storage.setOffline(true);assert.equal(await sp.locator('#code').textContent(),src);await sp.click('[data-lang=en]');assert.equal(await sp.locator('h1').textContent(),'#1147 · Longest Chunked Palindrome Decomposition');await storage.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(new URL(url).origin)||u.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'..','style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({kind:'author self-check',status:'pass',browser:browser.version(),host:process.platform,url,coverage,screenshots:shots,contrast:pairs,controlSizes,errors,localAssetsOnly:true,storageDenied:true,offlineSource:true,cssBytes,sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),zoomMethod:'CSS zoom 1 and 2; physical browser/device zoom unverified'},null,2)+'\n');
 await browser.close();console.log('PASS browser',coverage.length,'recorded checks',shots.length,'screenshots');
})().catch(e=>{console.error(e);process.exit(1);});
