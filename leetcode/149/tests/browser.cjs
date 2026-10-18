/* Author self-check. All results/screenshots go to OUTPUT_DIR when set. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.LESSON_URL||'http://127.0.0.1:18785/leetcode/149/',origin=new URL(url).origin;
const core=require('../core.js'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
function oracle(points){let best=1;for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){let count=0;for(const p of points)if((p[0]-points[i][0])*(points[j][1]-points[i][1])===(p[1]-points[i][1])*(points[j][0]-points[i][0]))count++;best=Math.max(best,count);}return best;}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],bad=[],external=[];
 const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};watch(page);
 page.on('response',r=>{if(r.status()>=400)bad.push([r.status(),r.url()]);});
 page.on('request',r=>{if(!r.url().startsWith(origin+'/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto(url);await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#progress').filter({hasText:/0\/9/}).waitFor();
 assert(await page.locator('#reveal').isDisabled());assert(await page.locator('#feedback').isHidden());assert.equal(await page.locator('#feedback').textContent(),'');
 let paths=0,actions=0;
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(let p=0;p<core.presets.length;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   const frames=core.trace(core.presets[p]),initial=await page.locator('.stage').innerHTML();
   for(let k=1;k<frames.length;k++){
    await page.locator('#next').click();actions++;
    assert.equal(await page.locator('#position').inputValue(),String(k));
    assert.equal(Number(await page.locator('#local').textContent()),frames[k].local);
    assert.equal(Number(await page.locator('#best').textContent()),frames[k].best);
    assert.equal(await page.locator('#historyBody tr').count(),frames[k].log.length);
    assert.equal(await page.locator('.completed-item').count(),frames[k].completed.length);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   assert(await page.locator('#final').isVisible());assert.equal(Number(await page.locator('#best').textContent()),oracle(core.presets[p]));
   const terminal=await page.locator('.stage').innerHTML();
   if(frames.length>1){await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('.stage').innerHTML(),terminal);}
   await page.locator('#reset').click();assert.equal(await page.locator('.stage').innerHTML(),initial);
   await page.locator('#position').focus();await page.keyboard.press('End');assert(await page.locator('#next').isDisabled());
   await page.keyboard.press('Home');assert(await page.locator('#prev').isDisabled());
   if(frames.length>1)await page.locator('#end').click();
   assert(await page.locator('#final').isVisible());paths++;
  }
  for(const answer of ['0','1','2']){
   await page.locator(`[name=prediction][value="${answer}"]`).check();assert(await page.locator('#feedback').isHidden());assert.equal(await page.locator('#feedback').textContent(),'');
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
   const text=await page.locator('#feedback').textContent();
   assert(text.startsWith(answer==='1'?(lang==='en'?'Your prediction is correct.':'预测正确。'):(lang==='en'?'Check the direction':'再检查方向')));
   assert(text.includes('(1,1)')&&text.includes('(0,1)'));
  }
 }
 await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#next').click();
 assert.equal(await page.locator('#best').textContent(),'3');assert((await page.locator('#buckets').textContent()).includes('#1, #2'));
 await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const position=await page.locator('#position').inputValue();
 await page.locator('[data-lang=en]').click();assert.equal(await page.locator('#position').inputValue(),position);
 assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 await page.locator('#reset').click();assert(await page.locator('#feedback').isVisible());assert(await page.locator('[name=prediction][value="2"]').isChecked());
 await page.locator('#next').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert((await page.locator('#copyStatus').textContent()).includes('copied'));
 const promise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await promise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('simulated permission denial');}}}));
 await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
 assert.equal(await page.locator('#copyText').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);
 await page.locator('[data-lang=zh]').click();assert((await page.locator('#copyStatus').textContent()).includes('手动'));assert(await page.locator('#manualCopy').isVisible());
 await page.locator('[data-lang=en]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('html').getAttribute('lang'),'en');
 await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'2');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Shift+Tab');
 const focus=await page.locator('#next').evaluate(e=>{let s=getComputedStyle(e);return {width:s.outlineWidth,style:s.outlineStyle,color:s.outlineColor,offset:s.outlineOffset};});assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');assert.equal(focus.offset,'4px');
 for(const el of await page.locator('button,a,select,summary,input[type=range]').all())if(await el.isVisible()){
  const box=await el.boundingBox();assert(box.height>=48&&box.width>=48,`${await el.textContent()}: ${JSON.stringify(box)}`);
 }
 for(const href of await page.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('#'))assert(await page.locator(href).count());
  else if(!href.startsWith('https:')){const u=new URL(href,url),r=await context.request.get(u.href.split('#')[0]);assert(r.ok(),href);if(u.hash)assert((await r.text()).includes(`id="${u.hash.slice(1)}"`),href);}
 }
 const screenshots=[];
 const snap=async(name,locator)=>{const dest=path.join(out,name);if(locator)await locator.screenshot({path:dest,style:'.step-nav { visibility: hidden !important; }'});else await page.screenshot({path:dest});screenshots.push(name);};
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});
   await page.selectOption('#preset','3');await page.locator('#position').evaluate(e=>{e.value='4';e.dispatchEvent(new Event('input',{bubbles:true}));});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.locator('#plotWrap').evaluate(e=>{e.scrollLeft=0;window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY-100);});await snap(`plot-${lang}-${width}.png`);
   const navBoxes=await page.locator('.step-nav a').evaluateAll(es=>es.map(e=>({width:e.clientWidth,scroll:e.scrollWidth,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})));assert(navBoxes.every(b=>b.scroll<=b.width+1),'Navigation text clips');for(let i=1;i<navBoxes.length;i++)assert(navBoxes[i].left>=navBoxes[i-1].right);
   const graph=await page.locator('#plot').boundingBox();assert(graph.width>=420);assert.equal(await page.locator('#plot circle').count(),5);
   const font=await page.locator('#plot text').first().evaluate(e=>getComputedStyle(e).fontSize);assert.equal(font,'14px');
   if(width<736){await page.locator('#plotWrap').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>document.querySelector('#plotWrap').scrollLeft>0);}
   await page.locator('#history').scrollIntoViewIfNeeded();await snap(`counts-${lang}-${width}.png`);
   // Text must remain inside the stage while only true 2D content scrolls.
   const boxes=await page.locator('.bucket-item,.metric,#event').evaluateAll(es=>es.map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})));
   assert(boxes.every(b=>b.left>=0&&b.right<=width+1));
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.body.style.zoom='2');
  await page.locator('#plotWrap').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+window.scrollY-160));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await snap(`zoom200-${lang}.png`);await page.evaluate(()=>document.body.style.zoom='');
  await page.setViewportSize({width:736,height:1000});
  for(let p=0;p<core.presets.length;p++){await page.selectOption('#preset',String(p));await page.locator('#position').evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},core.presets[p].length-1);await page.locator('#plotWrap').screenshot({path:path.join(out,`preset-${p}-${lang}.png`)});screenshots.push(`preset-${p}-${lang}.png`);}
  await page.setViewportSize({width:390,height:1000});
  for(const step of [0,1,3,4])await snap(`section-${step}-${lang}.png`,page.locator(`#step${step}`));
 }
 // Native keyboard paths for preset, radio, reveal, and source disclosure.
 await page.setViewportSize({width:1440,height:1000});
 await page.selectOption('#preset','0');await page.locator('#preset').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await page.locator('#preset').inputValue(),'1');assert.equal(await page.locator('#position').inputValue(),'0');
 await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isHidden());
 await page.locator('#reveal').focus();await page.keyboard.press('Space');assert(await page.locator('#feedback').isVisible());
 await page.locator('#sourceDetails').evaluate(e=>e.open=false);await page.locator('summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').getAttribute('open')!==null);
 await page.setViewportSize({width:390,height:1000});
 // Actual sticky-navigation click; content target clears the nav.
 await page.locator('.step-nav a[href="#step2"]').click();
 await page.waitForFunction(()=>{const a=document.querySelector('#step2').getBoundingClientRect(),b=document.querySelector('nav').getBoundingClientRect();return a.top>=b.bottom-2&&a.top<140;});
 await page.waitForFunction(()=>document.querySelector('.step-nav a.active')?.hash==='#step2');
 await page.selectOption('#preset','0');await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await snap('forced-colors-focus.png');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 // Storage blocked: memory locale retains independent quiz and trace state.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('denied');}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('denied');}});});
 const deniedPage=await denied.newPage();watch(deniedPage);await deniedPage.goto(url);await deniedPage.locator('#next').click();await deniedPage.locator('[name=prediction][value="1"]').check();await deniedPage.locator('#reveal').click();await deniedPage.locator('[data-lang=zh]').click();assert.equal(await deniedPage.locator('#position').inputValue(),'1');assert(await deniedPage.locator('#feedback').isVisible());assert.equal(await deniedPage.locator('html').getAttribute('lang'),'zh-CN');await denied.close();
 const offline=await browser.newPage();watch(offline);await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#next').click();assert.equal(await offline.locator('#pythonCode').textContent(),source);assert.equal(await offline.locator('#position').inputValue(),'1');await offline.close();
 // Localized static keys have matching two-string entries and nonempty text.
 const keys=await page.evaluate(()=>Object.entries(LESSON_COPY).every(([k,v])=>v.length===2&&v.every(x=>typeof x==='string'&&x.length)));assert(keys);
 function luminance(hex){const a=hex.match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
 function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const colors={bg:'0d1117',panel:'161b22',panel2:'1c2330',text:'e8edf4',muted:'9aa7b8',accent:'6ee7ff',accent2:'ffb454',explain:'c9d4e2',pre:'090e16',alternate:'0a0e14'};
 const contrast=[];for(const bg of ['bg','panel','panel2','alternate','pre'])for(const fg of ['text','muted','accent','accent2','explain']){const value=ratio(colors[fg],colors[bg]);assert(value>=4.5);contrast.push({fg,bg,ratio:Number(value.toFixed(2))});}
 contrast.push({fg:'bg',bg:'accent',ratio:ratio(colors.bg,colors.accent)});
 const rendered=await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,opacity:s.opacity};});
 await page.locator('#reset').click();const disabled=await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,opacity:s.opacity};});assert.equal(disabled.opacity,'1');assert.equal(disabled.color,'rgb(154, 167, 184)');assert.equal(disabled.background,'rgb(28, 35, 48)');
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const report={kind:'author self-check',status:'pass',presetLocalePaths:paths,peerAndAnchorAdvances:actions,widths:[320,390,736,1440],zoom:'200% CSS layout zoom in real Chromium, both locales',screenshots,focus,disabled,rendered,cssBytes,contrast,errors,bad,external,clipboard:'actual Clipboard API copy/read plus forced denial, exact manual source and selection',sourceParity:'display, clipboard, download and file:// mirror equal solution.py',storageDenied:true,offline:true,limits:'No physical-device, native browser-chrome zoom, novice, independent review, accepted submission or deployment evidence.'};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,contrast:'26 measured pairs: all AA',screenshots:screenshots.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
