/* Author self-check against the already-running preview. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18783';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage(),errors=[],badAssets=[],requests=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)badAssets.push([r.url(),r.status()]);});page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/leetcode/691/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const snapshot=()=>page.evaluate(()=>['progress','calls','memo','history'].map(id=>document.getElementById(id).textContent));
 const traces=[],semantics=[];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');
  const formula=await page.locator('.formula').textContent();assert(formula.includes('F(0)=0')&&formula.includes('max(0,r[j]−sticker[j])')&&formula.includes('sticker[p]>0'));
  if(!await page.isDisabled('#handReset'))await page.click('#handReset');await page.click('#handNext');assert((await page.locator('#handProgress').textContent()).includes('1'));
  await page.click('#handNext');assert(await page.isDisabled('#handNext'));assert((await page.locator('#handHistory').textContent()).includes('a:1→0'));
  await page.click('#handBack');await page.click('#handReset');assert(await page.isDisabled('#handBack'));
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.isDisabled('#prev'));
   await page.click('#next');const middle=await snapshot();await page.click('#prev');await page.click('#next');assert.deepEqual(await snapshot(),middle);
   // Walk every event to the end, not just the jump control.
   let steps=1;while(!await page.isDisabled('#next')){await page.click('#next');steps++;}
   assert(await page.isDisabled('#end'));const text=await page.locator('#progress').textContent();
   const expected=[2,3,-1,2,3,-1,-1][p];assert(text.endsWith(String(expected)), text);
   traces.push({lang,p,steps,expected,text});
   await page.click('#reset');assert(await page.isDisabled('#prev'));await page.click('#end');assert(await page.isDisabled('#next'));
  }
  // Fresh prediction must stay hidden until selection and explicit reveal.
  for(let a=0;a<3;a++){
   await page.check(`[name=prediction][value="${a}"]`);assert(await page.isHidden('#feedback'));await page.click('#reveal');
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes(lang==='en'?'The answer is 3':'答案是 3'));
   assert(feedback.startsWith(lang==='en'?(a===2?'Correct prediction.':'That prediction does not hold.'):(a===2?'预测正确。':'这个预测不成立。')));
   semantics.push({lang,answer:a,feedback});
  }
  const before=await snapshot();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.isChecked('[name=prediction][value="2"]'));assert(await page.isVisible('#feedback'));
  assert.equal((await page.locator('#history li').count()),(await page.evaluate(()=>Stickers.trace(Stickers.presets[6]).frames.length)));
  await page.click(`[data-lang=${lang}]`);assert.deepEqual(await snapshot(),before);
  await page.selectOption('#preset','0');assert(await page.isVisible('#feedback'));assert(await page.isChecked('[name=prediction][value="2"]'));
  await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));
  await page.selectOption('#preset','0');
  for(let i=0;i<10;i++)await page.click('#next');
  semantics.push({lang,formula,history:await page.locator('#history').textContent()});
  // Layout/screenshot checks on populated state, quiz and controls.
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#step2 .stage').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const dimensions=await page.locator('button:not([hidden])').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
   assert(dimensions.every(d=>d.w>=47&&d.h>=47));
   await page.locator('#step2 .stage').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`${lang}-${width}-trace.png`)});
   await page.locator('#step3').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`${lang}-${width}-quiz.png`)});
  }
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('#step2 .stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#step2 .stage').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 }
 await page.click('[data-lang=en]');
 await page.locator('a[href="#step2"]').click();await page.waitForTimeout(1000);
 assert(await page.locator('#step2').evaluate(n=>{const top=n.getBoundingClientRect().top;return top>=document.querySelector('#stepNav').getBoundingClientRect().height-2&&top<200;}));
 // Real keyboard traversal and focus ring.
 await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'prev');
 const focus=await page.locator('#prev').evaluate(n=>({outline:getComputedStyle(n).outlineWidth,color:getComputedStyle(n).outlineColor}));assert.equal(focus.outline,'3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');await page.keyboard.press('Enter');
 // Source and actual downloaded bytes.
 await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const downloadPromise=page.waitForEvent('download');await page.click('a[download]');const download=await downloadPromise;await download.saveAs(path.join(out,'downloaded-solution.py'));assert.equal(fs.readFileSync(path.join(out,'downloaded-solution.py'),'utf8'),source);
 // Denied write API: seed distinct sentinel and use the host's actual copy key.
 await page.evaluate(()=>navigator.clipboard.writeText('691-fallback-sentinel'));
 await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('self-check denial'));});
 await page.click('#copy');assert(await page.isVisible('#manualCopy'));
 assert.deepEqual(await page.locator('#copyText').evaluate(n=>({focused:document.activeElement===n,start:n.selectionStart,end:n.selectionEnd,value:n.value})),{focused:true,start:0,end:source.length,value:source});
 await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');
 assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.locator('#manualCopy').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,'copy-fallback.png')});
 await page.click('[data-lang=zh]');await page.waitForFunction(()=>document.documentElement.lang==='zh-CN');assert((await page.locator('#copyStatus').textContent()).includes('剪贴板不可用'), await page.locator('#copyStatus').textContent());assert(await page.isVisible('#manualCopy'));
 await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);await page.click('#copy');await page.locator('#manualCopy').waitFor({state:'hidden'});assert(await page.isHidden('#manualCopy'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Link paths and real target anchors exist.
 for(const href of await page.locator('.related a').evaluateAll(ns=>ns.map(n=>n.href))){const u=new URL(href);const response=await context.request.get(u.href.split('#')[0]);assert.equal(response.status(),200);assert((await response.text()).includes('id="'+u.hash.slice(1)+'"'));}
 // Measured rendered token pairs and focus, not visual estimates.
 const pairs=await page.evaluate(()=>{const style=n=>getComputedStyle(n);const background=n=>{for(let e=n;e;e=e.parentElement){const b=style(e).backgroundColor;if(b!=='rgba(0, 0, 0, 0)')return b;}return 'rgb(13, 17, 23)';};return [['body',document.body],['muted',document.querySelector('.hint')],['button',document.querySelector('#next')],['disabled',document.querySelector('#handBack')],['code',document.querySelector('pre')]].map(([name,n])=>({name,fg:style(n).color,bg:background(n)}));});
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(c){return rgb(c).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}function ratio(f,b){const a=lum(f),c=lum(b);return (Math.max(a,c)+.05)/(Math.min(a,c)+.05);}
 const contrast=pairs.map(p=>({...p,bg:p.bg==='rgba(0, 0, 0, 0)'?'rgb(22, 27, 34)':p.bg})).map(p=>({...p,ratio:ratio(p.fg,p.bg)}));assert(contrast.every(p=>p.ratio>=4.5));
 contrast.push({name:'focus on panel',ratio:ratio(focus.color,'rgb(22, 27, 34)')});assert(contrast.at(-1).ratio>=3);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#copy').focus();assert.equal(await page.locator('#copy').evaluate(n=>getComputedStyle(n).outlineWidth),'3px');
 const offline=await browser.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked for self-check');}});});await blocked.goto(base+'/leetcode/691/');await blocked.click('[data-lang=zh]');await blocked.click('#next');assert((await blocked.locator('#progress').textContent()).startsWith('事件 1/'));await blocked.close();
 await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,'ordinary-390-header.png')});
 await page.locator('#step0 .stage').screenshot({style:'.step-nav{visibility:hidden}',path:path.join(out,'zh-hand-390.png')});
 assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert(requests.every(u=>u.startsWith(base)||u.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author self-check',hostPlatform:process.platform,traces,semantics,contrast,focus,cssBytes,errors,badAssets,sourceParity:{display:true,clipboard:true,download:true,manualNativeCopy:true,offline:true},widths:[320,390,736,1440],zoom:'200% CSS layout zoom in Chromium',blockedStorage:true,keyboard:true,forcedColors:true,reducedMotion:true},null,2)+'\n');
 await browser.close();console.log('Browser self-check passed; evidence: '+out);
})().catch(e=>{console.error(e);process.exit(1);});
