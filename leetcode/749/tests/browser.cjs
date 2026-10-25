'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence/self-check');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),errors=[],external=[],logs=[];
const BASE=process.env.LESSON_PREVIEW_ROOT||'http://127.0.0.1:18770';
function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true}),page=await ctx.newPage();await page.emulateMedia({reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});page.on('requestfailed',r=>errors.push(r.url()));page.on('request',r=>{if(!r.url().startsWith(BASE+'/'))external.push(r.url())});
 await page.goto(BASE+'/leetcode/749/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const expected=[3,10,4,13,0,0,1],observations=[];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='en'?'#749 · Contain Virus':'#749 · 隔离病毒');
  for(let h=0;h<3;h++){await page.selectOption('#shape',String(h));assert((await page.locator('#handResult').textContent()).includes(String([2,1,4][h])));assert.equal(await page.locator('#handBoard .quarantined').count(),[3,1,8][h]);}
  let phases=0;
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));const frames=core.trace(core.presets[p]);assert(await page.locator('#prev').isDisabled());
   for(let i=0;i<frames.length;i++){
    const f=frames[i];assert((await page.locator('#progress').textContent()).includes(`${i}/${frames.length-1}`));
    const values=await page.locator('#board .cell b').allTextContents();assert.deepStrictEqual(values.map(x=>x[0]==='Q'?-1:Number(x[0])),f.grid.flat());
    assert((await page.locator('#total').textContent()).includes(String(f.total)));
    assert.equal(await page.locator('#ledger li').count(),f.ledger.length);
    assert.equal(await page.locator('#board .chosen').count(),f.chosen<0?0:f.regions[f.chosen].cells.length);assert.equal(await page.locator('#board .threat').count(),f.chosen<0?0:f.regions[f.chosen].frontier.length);
    const renderedWalls=await page.locator('#board .cell').evaluateAll(es=>es.map(e=>[...e.classList].filter(c=>c.startsWith('wall-')).sort()));
    renderedWalls.forEach((actual,u)=>{const n=f.grid[0].length,wanted=new Set();for(const [a,b]of f.walls)if(a===u||b===u){const v=a===u?b:a;wanted.add(Math.floor(v/n)<Math.floor(u/n)?'wall-top':Math.floor(v/n)>Math.floor(u/n)?'wall-bottom':v%n<u%n?'wall-left':'wall-right');}assert.deepStrictEqual(actual,[...wanted].sort());});
    const rows=await page.locator('#regionBody tr').allTextContents();f.regions.forEach((r,j)=>{assert(rows[j].includes(`${r.frontier.length}:`));for(const u of r.frontier)assert(rows[j].includes(`(${Math.floor(u/f.grid[0].length)},${u%f.grid[0].length})`));});
    observations.push({lang,preset:p,phase:f.phase,index:i,expectedTotal:f.total,observed:await page.locator('#total').textContent(),event:await page.locator('#event').textContent()});phases++;
    if(i+1<frames.length){const snapshot=await page.locator('#step2 .stage').textContent();await page.click('#next');await page.click('#prev');assert.equal(await page.locator('#step2 .stage').textContent(),snapshot);await page.click('#next');}
   }
   assert((await page.locator('#total').textContent()).includes(`${expected[p]}`));assert(await page.locator('#next').isDisabled());
   if(frames.length>1){await page.click('#reset');assert(await page.locator('#prev').isDisabled());await page.click('#end');assert((await page.locator('#total').textContent()).includes(`${expected[p]}`));}
  }
  await page.setViewportSize({width:320,height:1000});await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-320-prediction-hidden.png`)});
  for(const answer of ['0','1','2']){
   await page.check(`input[name=prediction][value="${answer}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');let feedback=await page.locator('#feedback').textContent();assert(feedback.includes('[1,1,0,0,Q,Q,0]'));assert(feedback.startsWith(answer==='1'?(lang==='en'?'Correct':'预测正确'):(lang==='en'?'Recheck':'再检查')));
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`input[name=prediction][value="${answer}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#feedback').textContent(),feedback);
  }
  await page.locator('#feedback').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-320-prediction-revealed.png`)});await page.setViewportSize({width:1000,height:900});
  await page.selectOption('#preset','0');await page.click('#next');await page.click('#next');const snap=await page.locator('#step2 .stage').textContent();
  await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang==='en'?'zh':'en');await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#step2 .stage').textContent(),snap);assert(await page.locator('#feedback').isVisible());
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#sourceDetails summary').click();assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('sentinel-749-not-source');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(Error('test denied'))})});
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());await page.locator('#manualCopy').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-manual-copy.png`)});assert.equal(await page.locator('#copyText').inputValue(),source);
  assert(await page.evaluate(()=>document.activeElement.id==='copyText'&&document.activeElement.selectionStart===0&&document.activeElement.selectionEnd===document.activeElement.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>delete navigator.clipboard.writeText);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.selectOption('#preset','1');await page.click('#next');await page.click('#next');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#board').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const geo=await page.locator('#board .cell').evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(geo.every(e=>e.w===48&&e.h===64));
   const select=page.locator('#preset');const metrics=await select.evaluate(e=>({w:e.clientWidth,text:e.options[e.selectedIndex].textContent,font:getComputedStyle(e).font}));const tw=await page.evaluate(m=>{const c=document.createElement('canvas').getContext('2d');c.font=m.font;return c.measureText(m.text).width},metrics);assert(tw+48<metrics.w,'Selected preset label clipped');
   if(width===320){const scroll=page.locator('#board').locator('..');await scroll.focus();assert.equal(await scroll.evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('ArrowRight');await page.waitForTimeout(150);assert(await scroll.evaluate(e=>e.scrollLeft>0));await scroll.evaluate(e=>e.scrollLeft=0);}
   await page.screenshot({path:path.join(out,`${lang}-${width}-board.png`)});await page.locator('#regionBody').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-summary.png`)});
  }
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#board').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.body.style.zoom='');
  await page.setViewportSize({width:1000,height:900});await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('1/6'));
  const focus=await page.locator('#next').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('0/6'));
  for(const anchor of await page.locator('#stepNav a').all()){await anchor.click();const hash=await anchor.getAttribute('href');assert.equal(await page.locator(hash).count(),1);assert((await page.locator(hash).boundingBox()).y>=70);}
  await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${lang}-390-header.png`)});
  logs.push({lang,phases,presets:7,handShapes:3,predictionOptions:3,copy:'success + native-key fallback, exact readback',download:'exact',widths:[320,390,736,1440],zoom:'CSS 200% at 780px',focus});
 }
 // Measure rendered text/background pairs on a populated diagram and disabled endpoints.
 await page.selectOption('#preset','1');await page.click('#end');await page.locator('#sourceDetails summary').click();
 const pairs=await page.evaluate(()=>{
  const parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);
  function bg(el){let p=el,layers=[];while(p){const a=parse(getComputedStyle(p).backgroundColor);if(a.length>=3){layers.push(a);if(a.length===3||a[3]===1)break;}p=p.parentElement;}let rgb=[13,17,23];for(const l of layers.reverse()){const a=l[3]??1;rgb=l.slice(0,3).map((x,i)=>x*a+rgb[i]*(1-a))}return rgb;}
  return [...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&getComputedStyle(el).visibility!=='hidden').map(el=>({tag:el.tagName,text:el.textContent.slice(0,70),fg:parse(getComputedStyle(el).color).slice(0,3),bg:bg(el)}));
 });const contrast=pairs.map(p=>({...p,ratio:ratio(p.fg,p.bg)}));assert(contrast.every(p=>p.ratio>=4.5),JSON.stringify(contrast.filter(p=>p.ratio<4.5)));
 const focusContrast=ratio([255,180,84],[28,35,48]);assert(focusContrast>=3);
 for(const href of await page.locator('.related a, a[data-i18n=related0]').evaluateAll(els=>els.map(e=>e.href))){const [url,hash]=href.split('#');const res=await ctx.request.get(url);assert.equal(res.status(),200);assert((await res.text()).includes(`id="${hash}"`));}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('blocked')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('blocked')}})});const bp=await blocked.newPage();await bp.goto(BASE+'/leetcode/749/');await bp.click('[data-lang=zh]');assert((await bp.locator('h1').textContent()).includes('隔离病毒'));await blocked.close();
 const offline=await browser.newContext(),op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.click('[data-lang=en]');assert((await op.locator('#progress').textContent()).includes('0/6'));await offline.close();
 await page.emulateMedia({forcedColors:'active'});await page.locator('#prev').focus();assert.equal(await page.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author self-check',browser:browser.version(),host:process.platform,logs,observations,contrast,minimumContrast:Math.min(...contrast.map(p=>p.ratio)),focusContrast,cssBytes,errors,external,limits:['Headless Linux Chromium, not physical devices','CSS zoom 200%, not browser-menu zoom','No independent review, learner study or LeetCode submission']},null,2));await browser.close();console.log('Browser passed; '+contrast.length+' measured text pairs; CSS '+cssBytes+' bytes.');
})().catch(e=>{console.error(e);process.exit(1)});
