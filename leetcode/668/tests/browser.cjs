// OUTPUT_DIR redirects every generated receipt/screenshot and temporary profile.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18783/leetcode/668/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),presets=[[3,3,5],[2,3,6],[3,3,4],[1,7,4],[1,1,1],[4,5,1]];
const launch={headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})};
const report={kind:'author browser self-check',errors:[],requests:[],states:[],layouts:[],screenshots:[],checks:[]};
const oracle=(m,n,k)=>{const a=[];for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)a.push(i*j);a.sort((a,b)=>a-b);return a[k-1];};
function watch(p){p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});p.on('requestfailed',r=>report.errors.push(r.url()+': '+r.failure().errorText));p.on('response',r=>{if(r.status()>=400)report.errors.push(r.status()+' '+r.url());});p.on('request',r=>report.requests.push(r.url()));}
async function state(p){return p.evaluate(()=>Object.fromEntries(['progress','intervalValue','testValue','decision','terminal','labRows','history'].map(id=>[id,document.getElementById(id).textContent])));}
async function screenshot(p,name,target){
 if(target)await p.locator(target).scrollIntoViewIfNeeded();
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 // Native screen capture also avoids stale scrolled text layers after a resize.
 const session=await p.context().newCDPSession(p);
 const result=await session.send('Page.captureScreenshot',{format:'png',fromSurface:false,captureBeyondViewport:false});
 fs.writeFileSync(path.join(out,name),Buffer.from(result.data,'base64'));await session.detach();report.screenshots.push(name);
}
async function layout(p,locale,width,zoom=1){
 const geometry=await p.evaluate(()=>{const s=document.querySelector('#preset'),style=getComputedStyle(s),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=style.font;return {innerWidth,outerWidth,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,selectWidth:s.getBoundingClientRect().width,textWidth:ctx.measureText(s.selectedOptions[0].text).width,selectPadding:parseFloat(style.paddingLeft)+parseFloat(style.paddingRight),font:style.font,table:document.querySelector('#labTable table').getBoundingClientRect().toJSON(),bodyFont:getComputedStyle(document.body).fontFamily};});
 assert.ok(geometry.scrollWidth<=geometry.innerWidth+1,JSON.stringify(geometry));assert.ok(geometry.textWidth+geometry.selectPadding+16<geometry.selectWidth,JSON.stringify(geometry));
 report.layouts.push({locale,width,zoom,...geometry});
}
(async()=>{
 const browser=await chromium.launch(launch),context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();watch(page);
 await page.goto(base);await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('0/'));
 report.browser=await browser.version();
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),'C(x) = Σᵢ₌₁ᵐ min(n, ⌊x/i⌋)');
  for(let x=1;x<=9;x++){
   await page.locator('#threshold').evaluate((e,x)=>{e.value=x;e.dispatchEvent(new Event('input'));},x);
   let count=0;for(let i=1;i<=3;i++)for(let j=1;j<=3;j++)if(i*j<=x)count++;
   assert.equal(await page.locator('#countTable td.included').count(),count);
   assert.ok((await page.locator('#countReadout').textContent()).includes('='+count));
  }
  for(let s=0;s<presets.length;s++){
   await page.selectOption('#preset',String(s));const [m,n,k]=presets[s];const total=Number(await page.locator('#position').getAttribute('max'));let lo=1,hi=m*n;
   assert.ok(await page.locator('#prev').isDisabled());assert.ok(await page.locator('#reset').isDisabled());
   for(let i=0;i<=total;i++){
    let expectedTest=null;if(i){const mid=Math.floor((lo+hi)/2);let count=0;for(let r=1;r<=m;r++)for(let c=1;c<=n;c++)if(r*c<=mid)count++;expectedTest=`${mid} → ${count}`;if(count>=k)hi=mid;else lo=mid+1;await page.click('#next');assert.equal(await page.locator('#testValue').textContent(),expectedTest);assert.equal(await page.locator('#labTable td.included').count(),count);}
    assert.equal(await page.locator('#intervalValue').textContent(),`[${lo}, ${hi}]`);
    assert.equal(await page.locator('#history tr').count(),Math.max(1,i));
    report.states.push({lang,preset:s,round:i,...await state(page)});
    if(i){const snap=await state(page);await page.click('#prev');await page.click('#next');assert.deepEqual(await state(page),snap);}
   }
   assert.equal(lo,oracle(m,n,k));assert.equal(hi,lo);assert.ok(await page.locator('#next').isDisabled());assert.ok(await page.locator('#end').isDisabled());assert.ok((await page.locator('#terminal').textContent()).includes(String(lo)));
   if(total){await page.click('#reset');assert.equal(await page.locator('#position').inputValue(),'0');await page.click('#end');assert.equal(await page.locator('#position').inputValue(),String(total));}
  }
  if(lang==='en')assert.ok(await page.locator('#feedback').isHidden());
  for(let option=0;option<3;option++){
   await page.check(`[name=prediction][value="${option}"]`);assert.ok(await page.locator('#feedback').isHidden());await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();assert.ok(feedback.includes('4+3+2=9'));assert.ok(feedback.includes('[1,6]'));report.checks.push({lang,option,feedback});
  }
  const position=await page.locator('#position').inputValue();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.ok(await page.locator('#feedback').isVisible());assert.ok(await page.locator('[value="2"][name=prediction]').isChecked());assert.equal(await page.locator('#position').inputValue(),position);await page.click(`[data-lang=${lang}]`);
  await page.selectOption('#preset','0');assert.ok(await page.locator('#feedback').isVisible());await page.locator('#position').evaluate(e=>{e.value=2;e.dispatchEvent(new Event('input'));});
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.evaluate(()=>navigator.clipboard.writeText('success-copy-sentinel'));await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);report.checks.push({lang,copy:await page.locator('#copyStatus').textContent()});
  const dl=page.waitForEvent('download');await page.click('#download');const download=await dl;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw new Error('simulated clipboard denial');};});
  await page.evaluate(()=>window.originalWrite('manual-copy-sentinel'));await page.click('#copy');assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.deepEqual(await page.locator('#copyText').evaluate(e=>[e.selectionStart,e.selectionEnd]),[0,source.length]);await page.keyboard.press('Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);report.checks.push({lang,fallback:await page.locator('#copyStatus').textContent(),selectedCharacters:source.length,clipboardReplacedSentinel:true});await screenshot(page,`${lang}-copy-fallback.png`,'#manualCopy');await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.ok(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.click(`[data-lang=${lang}]`);
  await page.click('#copy');await page.locator('#manualCopy').waitFor({state:'hidden'});
  // A changed answer invalidates old feedback; no stale correctness survives.
  await page.check('[name=prediction][value="0"]');assert.ok(await page.locator('#feedback').isHidden());
  // Real keyboard operation and retained focus during locale change.
  await page.click('#reset');await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#position').inputValue(),'1');
  await page.locator('#position').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#position').inputValue(),'2');
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang==='en'?'zh':'en');await page.click(`[data-lang=${lang}]`);
  await page.locator('a[href="#step2"]').click();const top=await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top);assert.ok(top>=70&&top<110,top);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await layout(page,lang,width);await screenshot(page,`${lang}-${width}-lab.png`,'#labTable');
   if(width===320){await screenshot(page,`${lang}-320-controls.png`,'#preset');await screenshot(page,`${lang}-320-hand.png`,'#handTable');await screenshot(page,`${lang}-320-header.png`,'.site-head');assert.ok((await page.locator('h1').textContent()).startsWith('#668'));await page.check('[name=prediction][value="2"]');await page.click('#reveal');await screenshot(page,`${lang}-320-prediction.png`,'#feedback');}
  }
 }
 // Local link targets include real concept anchors, not placeholders.
 const links=await page.locator('a[href]').evaluateAll(a=>a.map(e=>e.href));for(const link of new Set(links)){const u=new URL(link);if(u.origin!==new URL(base).origin)continue;const r=await context.request.get(u.href.split('#')[0]);assert.ok(r.ok(),link);if(u.hash)assert.ok((await r.text()).includes(`id="${u.hash.slice(1)}"`),link);}
 // Rendered foreground/background pairs; rgba surfaces are composited.
 await page.click('#reset');
 report.contrast=await page.evaluate(()=>{
  const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number),mix=(a,b)=>{const t=a.length>3?a[3]:1;return a.slice(0,3).map((x,i)=>x*t+b[i]*(1-t));};
  function bg(e){if(!e)return[255,255,255];return mix(rgb(getComputedStyle(e).backgroundColor),bg(e.parentElement));}
  const lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
  return ['.explain','.hint','.formula','#next','#prev:disabled','#langToggle .active','#countTable td.included','#labTable th','#feedback','#copy'].map(s=>{const e=document.querySelector(s);if(!e)return {selector:s,absent:true};const cs=getComputedStyle(e),back=bg(e),front=mix(rgb(cs.color),back);return {selector:s,foreground:front,background:back,ratio:ratio(front,back),opacity:cs.opacity};}).concat(['#next','.table-wrap'].map(s=>{const e=document.querySelector(s),back=bg(e.parentElement);return {selector:s+' focus (4px offset, adjacent parent surface)',ratio:ratio([255,180,84],back),foreground:[255,180,84],background:back};}));
 });
 for(const c of report.contrast)if(!c.absent)assert.ok(c.ratio>= (c.selector.includes('focus')?3:4.5),JSON.stringify(c));
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#preset').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await screenshot(page,'forced-colors.png','#preset');
 // No runtime source fetch: loaded code remains exact after network is blocked.
 await page.route('**/*',r=>r.abort());await page.locator('#sourceDetails').evaluate(e=>e.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);await page.unroute('**/*');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});});const bp=await blocked.newPage();watch(bp);await bp.goto(base);await bp.click('[data-lang=zh]');await bp.click('#next');assert.equal(await bp.locator('#position').inputValue(),'1');await bp.click('[data-lang=en]');assert.equal(await bp.locator('#position').inputValue(),'1');await blocked.close();
 const offline=await browser.newPage();watch(offline);await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.click('#next');assert.equal(await offline.locator('#position').inputValue(),'1');await offline.close();
 await context.close();await browser.close();
 // Set TRUE Chromium tab zoom using a local, temporary extension; CSS zoom and
 // device-scale emulation alone do not exercise browser zoom. Removed on exit.
 const temp=path.join(out,'zoom-temporary'),ext=path.join(temp,'extension');fs.mkdirSync(ext,{recursive:true});fs.writeFileSync(path.join(ext,'manifest.json'),JSON.stringify({manifest_version:3,name:'Local zoom verification',version:'1.0',permissions:['tabs'],background:{service_worker:'background.js'}}));fs.writeFileSync(path.join(ext,'background.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 const zc=await chromium.launchPersistentContext(path.join(temp,'profile'),{...launch,viewport:{width:1440,height:1000},reducedMotion:'reduce',ignoreDefaultArgs:['--disable-extensions'],args:['--disable-extensions-except='+ext,'--load-extension='+ext]});
 const worker=zc.serviceWorkers()[0]||await zc.waitForEvent('serviceworker');const zp=zc.pages()[0];watch(zp);await zp.goto(base);const zoom=await worker.evaluate(async()=>{const tabs=await chrome.tabs.query({});await chrome.tabs.setZoom(tabs[0].id,2);return chrome.tabs.getZoom(tabs[0].id);});assert.equal(zoom,2);assert.equal(await zp.evaluate(()=>devicePixelRatio),2);
 for(const lang of ['en','zh']){await zp.click(`[data-lang=${lang}]`);await zp.selectOption('#preset','0');await zp.click('#next');await zp.click('#next');await layout(zp,lang,1440,2);await screenshot(zp,`${lang}-zoom200.png`,'#labTable');await screenshot(zp,`${lang}-zoom200-controls.png`,'#preset');}
 await zc.close();fs.rmSync(temp,{recursive:true,force:true});
 assert.deepEqual(report.errors,[]);assert.ok(report.requests.every(u=>u.startsWith(new URL(base).origin)||u.startsWith('file:')));report.cssBytes=fs.statSync(path.join(root,'../style.css')).size+fs.statSync(path.join(root,'style.css')).size;assert.ok(report.cssBytes<25000);
 report.checks.push('all presets and trace frames in both languages; replay; endpoints; reset; threshold values; all quiz choices; locale state; actual keyboard; focus; real clipboard/manual Ctrl+C/download parity; local anchors; denied storage; file offline; forced colors; reduced motion; native tab zoom 200%');
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({states:report.states.length,layouts:report.layouts.length,errors:report.errors,cssBytes:report.cssBytes,screenshots:report.screenshots}));
})().catch(e=>{fs.writeFileSync(path.join(out,'browser-failure.json'),JSON.stringify({error:e.stack,report},null,2));console.error(e);process.exit(1);});
