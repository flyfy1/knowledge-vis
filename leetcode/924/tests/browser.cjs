const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence')),base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770',C=require('../core.js');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const expectedTotals=[[2,3],[7,7,4],[2,2],[1,1],[3,3],[0],[2,2]],expectedAnswers=[0,4,0,0,1,1,0];
function lum(c){return c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
assert.equal(lum([0,0,0]),0);assert.equal(lum([255,255,255]),1);assert.equal(ratio([0,0,0],[255,255,255]),21);assert.equal(lum([255,0,0]),.2126);assert.equal(lum([0,255,0]),.7152);assert.equal(lum([0,0,255]),.0722);assert(Math.abs(ratio([116,116,116],[0,0,0])-4.492948)<.000001);assert(ratio([116,116,116],[0,0,0])<4.5);
const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await ctx.newPage();
 const errors=[],requests=[],result={host:os.platform(),browser:browser.version(),presets:[],layouts:[],selectFit:[],clipboard:[],contrast:[],semantics:[],related:[]};page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await page.goto(base+'/leetcode/924/');await page.waitForFunction(()=>document.getElementById('round').textContent.length>0);
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  assert.equal(await page.locator('h1').textContent(),lang==='en'?'#924 · Minimize Malware Spread':'#924 · 尽量减少恶意软件的传播');assert.equal(await page.title(),await page.locator('h1').textContent());
  assert((await page.locator('[data-i18n=formula]').textContent()).includes('M(r) = T − saved(r)'));
  for(let p=0;p<C.presets.length;p++){
   await page.selectOption('#preset',''+p);const {graph,initial}=C.presets[p],s=C.summarize(graph,initial),scan=C.scan(s.scores);
   const baseline=await page.locator('#baselineTable tbody tr').evaluateAll(els=>els.map(e=>[...e.cells].map(c=>Number(c.textContent))));
   assert.deepEqual(baseline.map(row=>row[1]),expectedTotals[p]);assert.equal(scan.at(-1).answer,expectedAnswers[p]);
   for(const removed of initial){
    await page.selectOption('#remove',''+removed);const frames=C.spread(graph,initial,removed);assert(await page.locator('#prev').isDisabled());
    for(let i=0;i<frames.length;i++){
     if(i)await page.click('#next');const marked=await page.locator('#graph [data-infected=true]').evaluateAll(els=>els.map(el=>Number(el.dataset.node)));assert.deepEqual(marked,frames[i]);
     assert.equal(await page.locator('#history li').count(),i+1);const text=await page.locator('#round').textContent();assert(text.includes(`${i}/${frames.length-1}`));assert(text.includes(`[${frames[i].join(',')}]`));
     if(i){const snap=await page.locator('#graph').innerHTML(),history=await page.locator('#history').innerHTML();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#graph').innerHTML(),snap);assert.equal(await page.locator('#history').innerHTML(),history);}
    }
    assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(28, 35, 48)');await page.click('#reset');assert(await page.locator('#prev').isDisabled());if(frames.length>1)await page.click('#end');assert(await page.locator('#next').isDisabled());
    result.presets.push({lang,p,removed,final:C.spread(graph,initial,removed).at(-1),frames:frames.length});
   }
   await page.click('#scoreReset');assert(await page.locator('#scorePrev').isDisabled());
   for(let j=0;j<=initial.length;j++){
    if(j)await page.click('#scoreNext');const rows=await page.locator('#scoreTable tbody tr').evaluateAll(els=>els.map(e=>[...e.cells].map(c=>c.textContent)));
    rows.forEach((row,i)=>{assert.equal(row[1],i<j?''+s.scores[i].saved:(lang==='en'?'? Pending':'? 待检查'));assert.equal(row[2],i<j?''+s.scores[i].final:'?');assert.equal(row[0].includes('←'),i===j-1);});
    const read=await page.locator('#scoreRead').textContent();assert(read.includes(`${j}/${initial.length}`));
    if(j){assert(read.includes(lang==='en'?`Best index so far ${scan[j].answer}, saving ${scan[j].best}`:`目前最佳编号 ${scan[j].answer}，挽救 ${scan[j].best}`));const snap=await page.locator('#scoreTable').innerHTML();await page.click('#scorePrev');await page.click('#scoreNext');assert.equal(await page.locator('#scoreTable').innerHTML(),snap);}
   }
   assert(await page.locator('#scoreNext').isDisabled());await page.click('#scoreReset');await page.click('#scoreEnd');assert(await page.locator('#scoreNext').isDisabled());
  }
  for(const val of ['0','5','3']){await page.check(`[name=prediction][value="${val}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.includes(lang==='en'?'The answer is 3.':'答案为 3。'));assert(text.startsWith(val==='3'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Recheck':'再检查')));result.semantics.push({lang,val,text});}
  const snapshot={round:await page.locator('#round').textContent(),score:await page.locator('#scoreRead').textContent(),graph:await page.locator('#graph').innerHTML(),feedback:await page.locator('#feedback').textContent()};
  await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.locator('[name=prediction]:checked').inputValue(),'3');assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);for(const [key,id]of [['round','round'],['score','scoreRead'],['feedback','feedback']])assert.equal(await page.locator('#'+id).textContent(),snapshot[key]);assert.equal(await page.locator('#graph').innerHTML(),snapshot.graph);
  await page.locator('#step3').screenshot({path:path.join(out,`${lang}-quiz.png`)});
  await page.selectOption('#preset','1');await page.selectOption('#remove','0');await page.click('#end');await page.click('#scoreNext');await page.click('#scoreNext');
  assert.equal(await page.locator('#graph g[data-node="0"]').getAttribute('data-infected'),'true');
  result.semantics.push({lang,state:'Two-seed trap, cleared 0, terminal',round:await page.locator('#round').textContent(),best:await page.locator('#scoreRead').textContent(),rule:await page.locator('[data-i18n=formula]').textContent()});
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#graph').scrollIntoViewIfNeeded();await page.waitForTimeout(100);assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step0');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-${width}-spread.png`)});await page.locator('#graph').screenshot({path:path.join(out,`${lang}-${width}-graph.png`)});
   await page.locator('#scoreRead').scrollIntoViewIfNeeded();await page.waitForTimeout(100);assert.equal(await page.locator('.step-nav a.active').getAttribute('href'),'#step2');await page.screenshot({path:path.join(out,`${lang}-${width}-scores.png`)});
   for(const el of await page.locator('button,select,.prediction-options label').all()){if(await el.isVisible()){const b=await el.boundingBox();assert(b.width>=48&&b.height>=48,JSON.stringify(b));}}
   if(width===320){for(let p=0;p<C.presets.length;p++){await page.selectOption('#preset',''+p);const fit=await page.locator('#preset').evaluate(el=>{const cs=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=cs.font;const range=document.createRange();range.selectNodeContents(el.selectedOptions[0]);return {label:el.selectedOptions[0].text,width:el.clientWidth,textWidth:c.measureText(el.selectedOptions[0].text).width,padding:parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),font:cs.font,stack:cs.fontFamily};});assert(fit.textWidth+fit.padding+24<=fit.width,JSON.stringify(fit));result.selectFit.push({lang,...fit,arrowReserve:24});await page.locator('#preset').screenshot({path:path.join(out,`${lang}-320-select${p}.png`)});}await page.selectOption('#preset','1');await page.click('#end');await page.click('#scoreNext');await page.click('#scoreNext');}
   result.layouts.push({lang,width,noPageOverflow:true,controls48:true});
  }
  await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#graph').scrollIntoViewIfNeeded();await page.evaluate(()=>{const graph=document.getElementById('graph'),nav=document.querySelector('.step-nav');window.scrollBy(0,graph.getBoundingClientRect().top-nav.getBoundingClientRect().bottom-8);});await page.waitForTimeout(100);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('#graph').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.locator('#graph').screenshot({path:path.join(out,`${lang}-zoom200-graph.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
  for(const width of [320,390]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#graph').scrollIntoViewIfNeeded();await page.waitForTimeout(100);await page.locator('#graph').screenshot({path:path.join(out,`${lang}-${width}-zoom200-graph.png`)});await page.locator('#scoreRead').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-zoom200-scores.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');}
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  for(let attempt=0;attempt<2;attempt++){
   await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   const sentinel=`924-${lang}-${attempt}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('forced'))}));await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
   await page.keyboard.press(os.platform()==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>delete navigator.clipboard.writeText);result.clipboard.push({lang,attempt,sentinelVerified:true,automatic:true,nativeFallback:true,shortcut:os.platform()==='darwin'?'Meta+C':'Control+C',newlineConversion:'none observed: exact equality'});
  }
  await page.screenshot({path:path.join(out,`${lang}-fallback.png`)});
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);const dest=path.join(out,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);await page.locator('#sourceDetails summary').click();
 }
 await page.setViewportSize({width:390,height:900});await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#round').textContent()).includes('1/'));
 const focus=await page.locator('#next').evaluate(el=>({width:getComputedStyle(el).outlineWidth,color:getComputedStyle(el).outlineColor}));assert.equal(focus.width,'3px');assert(ratio(rgb(focus.color),[28,35,48])>=3);result.focus=focus;await page.screenshot({path:path.join(out,'keyboard.png')});
 await page.setViewportSize({width:320,height:900});await page.locator('#step2 .table-wrap').focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(180);assert(await page.locator('#step2 .table-wrap').evaluate(el=>el.scrollLeft>0));
 await page.click('#reset');await page.click('#scoreReset');await page.click('#scoreNext');
 for(const selector of ['body','.hint','#next','#prev','.lang-toggle button.active','.current','td.pending','a']){
  const colors=await page.locator(selector).first().evaluate(el=>{let node=el,bg;while(node){const c=getComputedStyle(node).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'){bg=c;break;}node=node.parentElement;}return {fg:getComputedStyle(el).color,bg,opacity:getComputedStyle(el).opacity}});const value=ratio(rgb(colors.fg),rgb(colors.bg));assert(value>=4.5,selector+' '+value);result.contrast.push({selector,...colors,ratio:value});
 }
 await page.emulateMedia({forcedColors:'active'});await page.locator('#scoreNext').focus();await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
 for(const lang of ['zh','en','zh']){await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='en'?'#924 · Minimize Malware Spread':'#924 · 尽量减少恶意软件的传播');await page.locator('h1').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-320-heading.png`)});for(let i=0;i<5;i++){await page.click(`.step-nav a[href="#step${i}"]`);await page.waitForTimeout(100);assert(await page.locator('#step'+i).evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-3));}}
 for(const lang of ['en','zh'])for(const id of [803,778]){
  await page.goto(base+'/leetcode/924/');await page.click(`[data-lang=${lang}]`);const link=page.locator(`.related a[href="../${id}/#step2"]`),label=await link.textContent();await link.focus();await page.keyboard.press('Enter');await page.waitForURL(`**/${id}/#step2`);const text=await page.locator('#step2').textContent();assert(text.length>100);result.related.push({lang,id,label,url:page.url(),destinationText:text});
 }
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}}));const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto(base+'/leetcode/924/');await bp.click('[data-lang=zh]');assert((await bp.locator('h1').textContent()).includes('尽量减少'));await bp.click('[data-lang=en]');assert((await bp.locator('h1').textContent()).includes('Minimize'));await blocked.close();
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#sourceDetails summary').click();assert.equal(await offline.locator('#pythonCode').textContent(),source);assert((await offline.locator('#round').textContent()).length>0);await offline.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(base+'/')));result.errors=errors;result.localRequestsOnly=true;result.blockedStorage=true;result.offlineSource=true;result.contrastCalibration={blackWhite:21,red:.2126,green:.7152,blue:.0722,nearThreshold:ratio([116,116,116],[0,0,0])};result.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(result.cssBytes<25000);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));await browser.close();console.log('PASS browser',result.presets.length,'preset/removal/locale paths',result.layouts.length,'layouts');
})().catch(e=>{console.error(e);process.exit(1)});
