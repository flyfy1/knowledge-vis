// NODE_PATH must expose playwright. OUTPUT_DIR redirects every artifact.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18782';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+':'+r.url())});
 await page.goto(base+'/leetcode/632/');await page.locator('#frameRead').filter({hasText:/1/}).waitFor();
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.click('#copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const report={nativeClipboard:'write/read exact equality passed',browser:await browser.version(),states:[],screenshots:[],contrast:[]};
 const get=sel=>page.locator(sel).textContent();
 const snapshot=()=>page.locator('#step2 .stage').textContent();
 const expected=[[4,6],[20,24],[1,1],[-5,-4],[-2,-2],[1,20]];
 for(const lang of ['en','zh']){
  await page.click('[data-lang="'+lang+'"]');
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  await page.click('#chooseB');assert((await get('#handRead')).includes('6−4=2'));await page.click('#chooseA');
  for(let i=0;i<6;i++){
   await page.selectOption('#preset',String(i));assert(await page.locator('#tracePrev').isDisabled());const initial=await snapshot();
   let frames=1;
   while(await page.locator('#traceNext').isEnabled()){
    const before=await snapshot();await page.click('#traceNext');const after=await snapshot();
    await page.click('#tracePrev');assert.equal(await snapshot(),before);await page.click('#traceNext');assert.equal(await snapshot(),after);frames++;
   }
   const text=await get('#bestRead');assert(text.includes('['+expected[i].join(',')+']'),text);
   assert(await page.locator('#traceLast').isDisabled());
   report.states.push({lang,preset:i,frames,final:text,stop:await get('#actionRead')});
   await page.click('#traceReset');assert.equal(await snapshot(),initial);if(await page.locator('#traceLast').isEnabled())await page.click('#traceLast');assert.equal(await get('#bestRead'),text);
  }
  await page.click('#predictionReset');assert(await page.locator('#reveal').isDisabled());
  for(const answer of ['0','1','2']){
   await page.check('[name=prediction][value="'+answer+'"]');assert(!(await get('#predictionFeedback')).includes('→'));await page.click('#reveal');
   assert((await get('#predictionFeedback')).includes('[8,10]'));assert.equal(await page.locator('#predictionFeedback').evaluate(e=>e.classList.contains('correct')),answer==='1');
   report.states.push({lang,answer,feedback:await get('#predictionFeedback')});
  }
  await page.check('[name=prediction][value="1"]');await page.click('#reveal');
  const selected=await page.locator('[name=prediction]:checked').inputValue(),frame=await get('#frameRead');
  await page.click('[data-lang="'+(lang==='en'?'zh':'en')+'"]');assert.equal(await page.locator('[name=prediction]:checked').inputValue(),selected);assert.deepEqual((await get('#frameRead')).match(/\d+/g),frame.match(/\d+/g));assert((await get('#predictionFeedback')).includes('→'));
  await page.click('[data-lang="'+lang+'"]');
  await page.locator('[name=prediction][value="0"]').focus();await page.keyboard.press('ArrowDown');assert.equal(await page.locator('[name=prediction]:checked').inputValue(),'1');await page.locator('#reveal').focus();await page.keyboard.press('Enter');assert(await page.locator('#predictionFeedback').evaluate(e=>e.classList.contains('correct')));
  await page.locator('#step3 .stage').screenshot({path:path.join(out,lang+'-prediction.png')});report.screenshots.push(lang+'-prediction.png');
  // Deliberate clipboard success stub measures exact payload independent of host permissions.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copied=s}}}));
  await page.click('#copyPython');assert.equal(await page.evaluate(()=>window.copied),source);report.states.push({lang,copy:'success',text:await get('#copyStatus')});
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));
  await page.click('#copyPython');assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'manualSource');assert.equal(await page.locator('#manualSource').evaluate(e=>e.selectionEnd-e.selectionStart),source.length);report.states.push({lang,copy:'fallback',text:await get('#copyStatus')});
  await page.locator('#sourceFallback').screenshot({path:path.join(out,lang+'-fallback.png')});report.screenshots.push(lang+'-fallback.png');
  assert.equal(await get('#pythonCode'),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);const dp=path.join(out,lang+'-download.py');await download.saveAs(dp);assert.equal(fs.readFileSync(dp,'utf8'),source);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});await page.selectOption('#preset','1');await page.click('#traceNext');await page.click('#traceNext');
   await page.locator('#step2 .stage').scrollIntoViewIfNeeded();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const name=lang+'-'+width+'-trace.png';await page.screenshot({path:path.join(out,name)});report.screenshots.push(name);
   if(width===320||width===390){for(const part of ['rows','candidateRead','bestRead']){const f=lang+'-'+width+'-'+part+'.png';await page.locator('#'+part).screenshot({path:path.join(out,f)});report.screenshots.push(f);}}
   await page.locator('#preset').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));if(width===320){await page.locator('#preset').screenshot({path:path.join(out,lang+'-320-select.png')});report.screenshots.push(lang+'-320-select.png');}
   // Selected option text must fit including native arrow allowance.
   const select=await page.locator('#preset').evaluate(e=>{const c=document.createElement('canvas').getContext('2d');c.font=getComputedStyle(e).font;return {width:e.clientWidth,text:c.measureText(e.selectedOptions[0].textContent).width,font:c.font}});assert(select.text+48<select.width);report.states.push({lang,width,select});
  }
  await page.setViewportSize({width:1280,height:900});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#rows').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const name=lang+'-zoom200.png';await page.screenshot({path:path.join(out,name)});report.screenshots.push(name);await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.click('.step-nav a[href="#step2"]');await page.waitForTimeout(1200);const g=await page.locator('#step2').boundingBox(),n=await page.locator('.step-nav').boundingBox();assert(g.y>=n.y+n.height-3,JSON.stringify({g,n}));
  await page.locator('#traceReset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'traceLast');const focus=await page.locator('#traceLast').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.width,'3px');report.states.push({lang,focus});await page.keyboard.press('Enter');assert(await page.locator('#traceNext').isDisabled());
 }
 // Check internal targets and local assets without external navigation.
 for(const href of await page.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('http'))continue;
  const u=new URL(href,page.url());const r=await context.request.get(u.href.split('#')[0]);assert(r.ok(),href);if(u.hash){const body=await r.text();assert(body.includes('id="'+u.hash.slice(1)+'"'),href);}
 }
 // sRGB contrast for exact rendered role pairs (no opacity on disabled controls).
 function lum(hex){const s=hex.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*s[0]+.7152*s[1]+.0722*s[2]}
 for(const [fg,bg,role] of [['e8edf4','161b22','body/panel'],['9aa7b8','1c2330','disabled'],['9aa7b8','0d1117','muted'],['6ee7ff','1c2330','selected'],['0d1117','6ee7ff','primary'],['ffb454','161b22','focus'],['7ee2a8','1c2330','correct'],['c9d4e2','0a0e14','explanation']]){const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);assert(ratio>=4.5);report.contrast.push({role,fg,bg,ratio});}
 assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).opacity),'1');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied')}})});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(e.message));await bp.goto(base+'/leetcode/632/');await bp.locator('#frameRead').filter({hasText:/1/}).waitFor();await bp.click('[data-lang=zh]');assert.equal(await bp.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
 const offline=await browser.newPage();await offline.goto('file://'+root+'/index.html');await offline.locator('#frameRead').filter({hasText:/1/}).waitFor();assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();report.offline='file:// source and initial trace passed';
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#traceReset').focus();assert.equal(await page.locator('#traceReset').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');report.forcedColors='visible 3px focus outline; reduced-motion scroll auto';assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 report.renderedColors=await page.evaluate(()=>Object.fromEntries(['candidateRead','bestRead','traceNext'].map(id=>{const e=document.getElementById(id),s=getComputedStyle(e);return [id,{color:s.color,background:s.backgroundColor,opacity:s.opacity}]})));
 report.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(report.cssBytes<25000);
 report.assetRequests=[...new Set(requests)];assert(report.assetRequests.every(u=>u.startsWith(base)));assert.deepEqual(errors,[]);report.errors=errors;report.result='passed';fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({result:'passed',states:report.states.length,screenshots:report.screenshots.length,cssBytes:report.cssBytes}));
})().catch(e=>{console.error(e);process.exit(1)});
