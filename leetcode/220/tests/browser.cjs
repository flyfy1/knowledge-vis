'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.TEST_OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18793';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
 const page=await context.newPage(),errors=[],requests=[],checks=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('requestfailed',r=>errors.push(r.failure().errorText+' '+r.url()));
 page.on('request',r=>requests.push(r.url()));
 await page.goto(base+'/leetcode/220/');
 await page.waitForFunction(()=>document.querySelector('#event').textContent.length>10);
 await page.evaluate(()=>window.nativeClipboard=navigator.clipboard);
 async function snapshot(){
  return page.evaluate(()=>['event','buckets','checks','history','values','progress','timing'].map(id=>document.getElementById(id).innerHTML));
 }
 for(const lang of ['en','zh']){
  await page.locator('[data-lang='+lang+']').click();
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  await page.locator('#k1').click();assert.match(await page.locator('#handResult').innerText(),/false/);
  await page.locator('#k2').click();assert.match(await page.locator('#handResult').innerText(),/true/);
  assert(await page.locator('#reveal').isDisabled());
  for(let preset=0;preset<8;preset++){
   await page.locator('#preset').selectOption(String(preset));
   assert.equal(await page.locator('#position').inputValue(),'0');assert(await page.locator('#prev').isDisabled());
   const total=Number(await page.locator('#position').getAttribute('max'));
   for(let step=1;step<=total;step++){
    await page.locator('#next').click();
    const fwd=await snapshot();
    await page.locator('#prev').click();await page.locator('#next').click();
    assert.deepEqual(await snapshot(),fwd);
   }
   assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const expected=[true,false,true,true,false,true,false,false][preset];
   assert.match(await page.locator('#event').innerText(),new RegExp(String(expected)));
   await page.locator('#reset').click();assert.equal(await page.locator('#position').inputValue(),'0');
   await page.locator('#end').click();assert.equal(Number(await page.locator('#position').inputValue()),total);
  }
  for(let answer=0;answer<3;answer++){
   await page.locator('[name=prediction][value="'+answer+'"]').check();
   assert(await page.locator('#feedback').isHidden());
   await page.locator('#reveal').click();assert(await page.locator('#feedback').isVisible());
   const feedback=await page.locator('#feedback').innerText();
   assert(feedback.startsWith(answer===1?(lang==='en'?'Correct':'预测正确'):(lang==='en'?'This prediction':'这个预测')));
   // Preserve trace and answer across locale, with explicit result still visible.
   const position=await page.locator('#position').inputValue();
   await page.locator('[data-lang='+(lang==='en'?'zh':'en')+']').click();
   assert(await page.locator('[name=prediction][value="'+answer+'"]').isChecked());
   assert(await page.locator('#feedback').isVisible());
   assert.equal(await page.locator('#position').inputValue(),position);
   await page.locator('[data-lang='+lang+']').click();
   await page.locator('#reset').click();assert(await page.locator('#feedback').isVisible());
  }
  // Clear selection only for the next locale's initial assertion.
  await page.evaluate(()=>{document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);prediction=null;revealed=false;render();});
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:window.nativeClipboard}));
  await page.locator('#copy').click();
  assert.equal(await page.evaluate(()=>window.nativeClipboard.readText()),source);
  assert(await page.locator('#manualCopy').isHidden());
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('test denied');}}}));
  await page.locator('#copy').click();
  assert(await page.locator('#manualCopy').isVisible());
  assert.equal(await page.locator('#copyText').inputValue(),source);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
  assert.equal(await page.evaluate(()=>{const e=document.querySelector('#copyText');return e.selectionEnd-e.selectionStart;}),source.length);
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);
  const file=await download.path();assert.equal(fs.readFileSync(file,'utf8'),source);
  const links=await page.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
  for(const href of links.filter(x=>!x.startsWith('https:')&&!x.startsWith('#')&&!x.includes('solution.py'))){
   const u=new URL(href,page.url()),r=await context.request.get(u.origin+u.pathname);
   assert.equal(r.status(),200);
   if(u.hash)assert((await r.text()).includes('id="'+u.hash.slice(1)+'"'),href);
  }
  for(const width of [1440,736,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.locator('#preset').selectOption('4');
   await page.locator('#position').fill('17');await page.locator('#position').dispatchEvent('input');
   assert.equal(await page.locator('#position').inputValue(),'17');
   await page.locator('a[href="#step2"]').click();
   await page.waitForFunction(()=>Math.abs(document.querySelector('#step2').getBoundingClientRect().top-100)<2);
   const top=await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top);
   const navBottom=await page.locator('nav').evaluate(e=>e.getBoundingClientRect().bottom);
   assert(top>=navBottom-1,'anchor under sticky nav');
   const geometry=await page.evaluate(()=>{
    const bad=[...document.querySelectorAll('.bucket,.chips li,button,select,.step-nav a')].filter(e=>{
     const b=e.getBoundingClientRect();return b.width&&e.scrollWidth>e.clientWidth+2;
    }).map(e=>e.id||e.className);
    return {pageOverflow:document.documentElement.scrollWidth>innerWidth+1,bad};
   });
   assert(!geometry.pageOverflow,JSON.stringify({width,lang,geometry}));assert.deepEqual(geometry.bad,[]);
   await page.locator('#values').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,'trace-'+lang+'-'+width+'.png')});
   checks.push({lang,width,overflow:false,traceAction:17});
  }
  await page.setViewportSize({width:1280,height:1000});
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  await page.locator('#values').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(out,'zoom200-'+lang+'.png')});
  checks.push({lang,width:1280,zoom:'200% CSS zoom',overflow:false});
  await page.evaluate(()=>document.documentElement.style.zoom='');
  // Keyboard: tab lands at a named native control, Space advances one action.
  await page.locator('#reset').click();
  await page.locator('#next').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('#position').inputValue(),'1');
  const focus=await page.locator('#next').evaluate(e=>({outline:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));
  assert.equal(focus.outline,'solid');assert.equal(focus.width,'3px');
  await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 }
 // Storage denial + offline sources: scripts work with fetch disabled and storage throwing.
 const denied=await context.newPage();
 await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage disabled');}});window.fetch=()=>Promise.reject(new Error('offline'));});
 denied.on('pageerror',e=>errors.push(String(e)));
 await denied.goto(base+'/leetcode/220/');
 await denied.locator('[data-lang=zh]').click();await denied.locator('#next').click();
 assert.equal(await denied.locator('html').getAttribute('lang'),'zh-CN');
 assert.equal(await denied.locator('#pythonCode').textContent(),source);
 await denied.close();
 // Measure actual rendered foreground/background pairs; no opacity allowed on text controls.
 const pairs=await page.evaluate(()=>{
  document.querySelector('#reset').click();
  const samples={body:document.body,muted:document.querySelector('#progress'),disabled:document.querySelector('#prev'),primary:document.querySelector('#next'),panel:document.querySelector('.stage'),selected:document.querySelector('#k2'),mutedChip:document.querySelector('.chips li span'),link:document.querySelector('.official-link')};
  function background(e){for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c!=='rgba(0, 0, 0, 0)')return c;}return 'rgb(13, 17, 23)';}
  return Object.fromEntries(Object.entries(samples).map(([k,e])=>[k,e?{fg:getComputedStyle(e).color,bg:background(e),opacity:getComputedStyle(e).opacity}:null]));
 });
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}
 function lum(s){return rgb(s).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((a,x,i)=>a+x*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const contrastReport={};
 for(const [k,v] of Object.entries(pairs)){if(v){const ratio=contrast(v.fg,v.bg);assert(ratio>=4.5,k+' '+ratio);contrastReport[k]={...v,ratio:+ratio.toFixed(2)};}}
 const focusRatio=contrast('rgb(255,180,84)','rgb(28,35,48)');assert(focusRatio>=3);
 // Forced colors and reduced motion remain usable.
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
 await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.deepEqual(errors,[]);
 assert(requests.every(u=>u.startsWith(base)),requests.join('\n'));
 const cssBytes=fs.statSync(path.join(root,'local.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);
 const report={kind:'author browser self-check',browser:await browser.version(),checks,presets:8,locales:['en','zh'],copy:'native clipboard write/read success and rejected API -> selected manual fallback',sourceDisplayCopyDownloadParity:true,blockedStorage:true,offlineEmbeddedSource:true,keyboardFocus:true,forcedColors:true,reducedMotion:true,errors,externalRuntimeRequests:[],contrast:contrastReport,focusRatio:+focusRatio.toFixed(2),cssBytes};
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
