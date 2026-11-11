const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence')),base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';fs.mkdirSync(out,{recursive:true});
const C=require('../core.js'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),oracles=JSON.parse(fs.readFileSync(path.join(out,'oracle-presets.json')));
function lum(c){return c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);assert.equal(ratio([0,0,0],[255,255,255]),21);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await ctx.newPage();
 const errors=[],requests=[],results={selectFit:[],markerStates:[],host:os.platform(),browser:browser.version(),presets:[],layouts:[],clipboard:[],semanticBindings:[],contrast:[],links:[]};
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(base+'/leetcode/913/');await page.waitForFunction(()=>document.getElementById('progress').textContent.length>0);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.title(),lang==='en'?'#913 · Cat and Mouse':'#913 · 猫和老鼠');
  assert((await page.locator('[data-i18n=formula]').textContent()).includes('⇒'));
  assert(await page.locator('#reveal').isDisabled()===true||lang==='zh');
  await page.click('#handReset');await page.click('#move3');assert((await page.locator('#handRead').textContent()).includes('(3,2,2)'));
  await page.click('#move3');assert((await page.locator('#handRead').textContent()).includes(lang==='en'?'2 Cat wins':'2 猫胜'));
  await page.locator('#step0 .stage').screenshot({path:path.join(out,lang+'-hand-capture.png')});
  await page.click('#undo');await page.click('#undo');assert(await page.locator('#undo').isDisabled());await page.click('#move0');assert((await page.locator('#handRead').textContent()).includes(lang==='en'?'1 Mouse wins':'1 鼠胜'));await page.click('#handReset');
  for(let p=0;p<4;p++){
   await page.selectOption('#preset',''+p);await page.click('#reset');assert(await page.locator('#prev').isDisabled());
   const frames=C.trace(C.presets[p]),reachable=C.reachable(C.presets[p]);
   for(let i=0;i<frames.length;i++){
    if(i)await page.click('#next');
    for(const turn of [1,2]){
     await page.selectOption('#view',''+turn);
     const values=await page.locator('#states td').evaluateAll(els=>els.map(el=>({k:el.dataset.state,text:el.childNodes[0].textContent,r:el.querySelector('small').textContent,marker:el.classList.contains('current')})));
     for(const v of values){const f=frames[i],w=f.w[v.k],available=reachable.has(v.k);assert.equal(v.text.replace('→ ',''),available?''+(w||(f.done?'0':'?')):'×');assert.equal(v.r,'r '+(!available||w?'—':f.r[v.k]));assert.equal(v.marker,available&&!!f.current&&C.key(f.current)===v.k);}
    }
    if(i===Math.floor(frames.length/2)){
     const snap=await page.locator('#states').innerHTML(),read=await page.locator('#current').textContent(),updates=await page.locator('#updates').textContent();
     await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#states').innerHTML(),snap);assert.equal(await page.locator('#updates').textContent(),updates);assert.equal(await page.locator('#current').textContent(),read);
     await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#states').innerHTML(),snap);
     if(frames[i].current){await page.selectOption('#view',''+frames[i].current[2]);const marked=page.locator('td.current');assert((await marked.textContent()).includes('→'));assert(await marked.evaluate(el=>el.classList.contains('finalized')&&getComputedStyle(el).outlineWidth==='3px'));await page.locator('#states').screenshot({path:path.join(out,`${lang}-preset${p}-marker.png`)});results.markerStates.push({lang,p,state:frames[i].current,markerAndWinner:true});}
    }
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert((await page.locator('#current').textContent()).includes(''+oracles[p].winner['1,2,1']));
   results.presets.push({lang,p,frames:frames.length,answer:oracles[p].winner['1,2,1'],allCellsAllFrames:true});
   await page.locator('#states').screenshot({path:path.join(out,`${lang}-preset${p}-final.png`)});
   await page.click('#reset');assert(await page.locator('#prev').isDisabled());await page.click('#end');assert(await page.locator('#next').isDisabled());await page.click('#reset');
  }
  for(const value of ['0','2','1']){await page.check(`[name=prediction][value="${value}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.includes(lang==='en'?'result is 1':'结果为 1'));assert(text.startsWith(value==='1'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Reconsider':'再看')));results.semanticBindings.push({lang,value,text});}
  const fb=await page.locator('#feedback').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.locator('[name=prediction]:checked').inputValue(),'1');await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#feedback').textContent(),fb);
  await page.locator('#step3').screenshot({path:path.join(out,lang+'-prediction.png')});
  await page.selectOption('#preset','2');await page.click('#reset');for(let i=0;i<Math.min(8,C.trace(C.presets[2]).length-1);i++)await page.click('#next');await page.selectOption('#view','1');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#states').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:path.join(out,`${lang}-${width}-trace.png`)});await page.locator('#states').screenshot({path:path.join(out,`${lang}-${width}-table.png`)});
   for(const el of await page.locator('button,select,.prediction-options label').all()){if(await el.isVisible()){const b=await el.boundingBox();assert(b.width>=48&&b.height>=48,JSON.stringify(b));}}
   if(width===320){for(const sel of ['#preset','#view'])for(const opt of await page.locator(sel+' option').all()){const value=await opt.getAttribute('value');await page.selectOption(sel,value);const fit=await page.locator(sel).evaluate(el=>{const cs=getComputedStyle(el),ctx=document.createElement('canvas').getContext('2d');ctx.font=cs.font;return {text:el.selectedOptions[0].text,width:el.clientWidth,textWidth:ctx.measureText(el.selectedOptions[0].text).width,padding:parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),stack:cs.fontFamily};});assert(fit.textWidth+fit.padding+24<=fit.width,JSON.stringify(fit));results.selectFit.push({lang,sel,...fit,arrowAllowance:24});}await page.selectOption('#preset','2');for(let k=0;k<8;k++)await page.click('#next');await page.selectOption('#view','1');}
   await page.locator('#handGraph').screenshot({path:path.join(out,`${lang}-${width}-hand-graph.png`)});await page.locator('#states').scrollIntoViewIfNeeded();
   results.layouts.push({lang,width,noPageOverflow:true,tableScrollContained:true});
  }
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#states').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,lang+'-zoom200.png')});await page.locator('#handGraph').screenshot({path:path.join(out,lang+'-zoom200-hand-graph.png')});await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const sentinel=`913-${lang}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('forced'))}));await page.click('#copy');
  assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press(os.platform()==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>delete navigator.clipboard.writeText);
  results.clipboard.push({lang,sentinelVerified:true,automatic:true,nativeFallback:true,shortcut:os.platform()==='darwin'?'Meta+C':'Control+C',newlineConversion:'none observed; exact string equality'});
  await page.screenshot({path:path.join(out,lang+'-fallback.png')});
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);const dest=path.join(out,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);await page.locator('#sourceDetails summary').click();
 }
 await page.setViewportSize({width:390,height:900});await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/'));
 const focus=await page.locator('#next').evaluate(el=>({width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert.equal(focus.width,'3px');assert(ratio(rgb(focus.color),[28,35,48])>=3);
 await page.setViewportSize({width:320,height:900});await page.locator('.table-wrap').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await page.locator('.table-wrap').evaluate(el=>el.scrollLeft>0));
 await page.screenshot({path:path.join(out,'keyboard-focus.png')});
 await page.selectOption('#view','2');await page.click('#reset');
 for(const selector of ['body','.hint','#next','#prev','.lang-toggle button.active','td.finalized','td small','a']){
  const colors=await page.locator(selector).first().evaluate(el=>{let node=el,bg;while(node){let c=getComputedStyle(node).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'){bg=c;break;}node=node.parentElement;}return {fg:getComputedStyle(el).color,bg,opacity:getComputedStyle(el).opacity}});const value=ratio(rgb(colors.fg),rgb(colors.bg));assert(value>=4.5,selector+' '+value);results.contrast.push({selector,...colors,ratio:value});
 }
 await page.emulateMedia({forcedColors:'active'});await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  for(let i=0;i<5;i++){await page.click(`.step-nav a[href="#step${i}"]`);await page.waitForTimeout(100);assert(await page.locator('#step'+i).evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-3));}
 }
 for(const lang of ['en','zh'])for(const [id,step] of [[847,2],[329,1]]){
  await page.goto(base+'/leetcode/913/');await page.click(`[data-lang=${lang}]`);const link=page.locator(`.related a[href="../${id}/#step${step}"]`),label=await link.textContent();await link.focus();await page.keyboard.press('Enter');await page.waitForURL(`**/${id}/#step${step}`);assert((await page.locator('#step'+step).textContent()).length>100);results.links.push({lang,id,step,exists:true,label,destinationText:await page.locator('#step'+step).textContent()});
 }
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}}));const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(base+'/leetcode/913/');await bp.click('[data-lang=zh]');assert((await bp.locator('h1').textContent()).includes('猫和老鼠'));await bp.click('[data-lang=en]');assert((await bp.locator('h1').textContent()).includes('Cat and Mouse'));await blocked.close();
 // Offline file opening still embeds code and computes experiments without fetching sources.
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#sourceDetails summary').click();assert.equal(await offline.locator('#pythonCode').textContent(),source);assert((await offline.locator('#progress').textContent()).length>0);await offline.close();
 assert.deepStrictEqual(errors,[]);assert(requests.every(u=>u.startsWith(base+'/')));
 results.errors=errors;results.localRequestsOnly=true;results.blockedStorage=true;results.offlineSource=true;results.keyboard={nativeActivation:true,scroll:true,focus};results.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(results.cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();console.log('PASS browser',results.presets.length,'preset/locale runs',results.layouts.length,'layouts');
})().catch(e=>{console.error(e);process.exit(1)});
