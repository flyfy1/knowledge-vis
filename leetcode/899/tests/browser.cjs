const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/899/',source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
function linear(v){return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}
function lum(a){return a.map(v=>linear(v/255)).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
// Calibration: black/white = 21, identical = 1, 0x80 grey/white ≈3.95, channels all contribute.
assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(contrast([25,25,25],[25,25,25]),1);assert(Math.abs(contrast([128,128,128],[255,255,255])-3.949439648)<1e-6);assert.equal(lum([255,0,0]),.2126);assert.equal(lum([0,255,0]),.7152);assert.equal(lum([0,0,255]),.0722);assert(Math.abs(contrast([116,116,116],[0,0,0])-4.4929480731)<1e-8);assert(contrast([116,116,116],[0,0,0])<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],badAssets=[],requests=[],semantic=[],fit=[],headings=[],clipboard=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push({text:m.text(),url:m.location().url,page:page.url()});});page.on('response',r=>{if(r.status()>=400)badAssets.push(r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('operation').textContent.length>0);
 const lang=async l=>page.locator(`[data-lang=${l}]`).click();
 assert(await page.locator('#reveal').isDisabled());assert(await page.locator('#feedback').isHidden());
 for(const l of ['en','zh']){
  await lang(l);const expectedTitle=l==='en'?'#899 · Orderly Queue':'#899 · 有序队列';assert.equal(await page.locator('h1').textContent(),expectedTitle);assert.equal(await page.title(),expectedTitle);headings.push({locale:l,title:expectedTitle});
  assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/orderly-queue/');
  assert((await page.locator('[data-i18n=rotationsFormula]').textContent()).includes('s[i:] + s[:i]'));
  assert((await page.locator('[data-i18n=swap]').textContent()).includes('n−1'));
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert.match(await page.locator('#progress').textContent(),/0\//);assert(await page.locator('#prev').isDisabled());
   let i=0;
   while(!await page.locator('#next').isDisabled()){
    const prior=await page.locator('#now').textContent();await page.locator('#next').click();i++;
    assert.notEqual(await page.locator('#before').textContent(),'');
    const state=await page.locator('#step2 .stage').textContent();await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#step2 .stage').textContent(),state);
    assert.equal(await page.locator('#history li').count(),i+1);
   }
   const expected=['acb','abc','aaabc','abc','aaaa','z'][p];assert((await page.locator('#minimum').textContent()).includes(expected));
   if(p===0){assert.equal(await page.locator('#now .card b').allTextContents().then(x=>x.join('')),'cba');assert((await page.locator('#minimum').textContent()).includes('acb'));}
   semantic.push({locale:l,preset:p,progress:await page.locator('#progress').textContent(),endpoint:await page.locator('#minimum').textContent(),operation:await page.locator('#operation').textContent()});
   await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());assert.equal(await page.locator('#history li').count(),1);
   await page.locator('#end').click();assert(await page.locator('#end').isDisabled());assert(await page.locator('#next').isDisabled());
   await page.locator('#position').fill('0');await page.locator('#position').dispatchEvent('input');assert(await page.locator('#prev').isDisabled());
  }
  for(let answer=0;answer<3;answer++){
   await page.locator(`[name=prediction][value="${answer}"]`).check();assert(await page.locator('#feedback').isHidden());await page.locator('#reveal').click();
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('bdac, dacb, acbd, cbda')||feedback.includes('bdac、dacb、acbd、cbda'));assert(feedback.includes('abcd'));assert(feedback.startsWith(answer===1?(l==='en'?'Correct.':'正确。'):(l==='en'?'That choice':'这个选择')));
   semantic.push({locale:l,choice:answer,feedback});
  }
  await page.selectOption('#preset','1');await page.locator('#next').click();
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);
  const index=await page.locator('#position').inputValue();await lang(l==='en'?'zh':'en');assert.equal(await page.locator('#position').inputValue(),index);assert(await page.locator('#feedback').isVisible());assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#sourceDetails').evaluate(e=>e.open));assert.equal(await page.locator('#preset').inputValue(),'1');await lang(l);
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  for(let attempt=0;attempt<2;attempt++){
   const sentinel='automatic-'+l+'-'+attempt+'-'+Date.now();await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert(await page.locator('#manualCopy').isHidden());
   clipboard.push({locale:l,attempt,mode:'automatic',exact:true});
  }
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  for(let attempt=0;attempt<2;attempt++){
   // Browser host is Linux, verified via runner process.platform; new sentinel before EACH attempt.
   const sentinel='manual-'+l+'-'+attempt+'-'+Date.now();await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
   await page.evaluate(()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test denial'));});
   await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());
   assert.deepEqual(await page.locator('#copyText').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);
   assert.equal(process.platform,'linux');await page.keyboard.press('Control+c');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   semantic.push({locale:l,mode:'manual fallback',visible:await page.locator('#copyStatus').textContent()});clipboard.push({locale:l,attempt,mode:'native manual',sentinelVerified:true,host:'linux',shortcut:'Control+c',exact:true});
   await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  }
 }
 for(const width of [320,390,736,1440])for(const l of ['en','zh']){
  await page.setViewportSize({width,height:1000});await lang(l);
  await page.selectOption('#preset','1');await page.locator('#end').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));
   const b=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;const text=c.measureText(e.selectedOptions[0].textContent).width,padding=parseFloat(s.paddingLeft)+parseFloat(s.paddingRight);return{label:e.selectedOptions[0].textContent,width:e.clientWidth,text,padding,arrowReserve:20,available:e.clientWidth-padding-20,font:s.font,fontStack:s.fontFamily};});fit.push({viewport:width,locale:l,preset:p,...b});assert(b.text<=b.available,JSON.stringify(b));
  }
  await page.selectOption('#preset','2');await page.locator('#preset').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`controls-${width}-${l}.png`)});
  await page.selectOption('#preset','1');await page.locator('#end').click();
  await page.locator('#now').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`state-${width}-${l}.png`)});
  // Populated cells retain their width and position labels, no compressed illegible boxes.
  for(const rect of await page.locator('#now .card').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,scroll:e.scrollWidth,client:e.clientWidth})))){assert(rect.width>=48);assert(rect.scroll<=rect.client);}
  await page.locator('#prev').focus();const before=Number(await page.locator('#position').inputValue());await page.keyboard.press('Enter');assert.equal(Number(await page.locator('#position').inputValue()),before-1);
  const focus=await page.locator('#prev').evaluate(e=>({width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
  // Narrow locale identity roundtrip preserves selected frame.
  await lang(l==='en'?'zh':'en');await lang(l);assert.equal(Number(await page.locator('#position').inputValue()),before-1);
 }
 // 200% browser-rendered page magnification; physical browser chrome zoom is not claimed.
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');
 for(const l of ['en','zh']){await lang(l);await page.locator('#now').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom-200-${l}.png`)});}
 await page.evaluate(()=>document.documentElement.style.zoom='');await page.setViewportSize({width:390,height:1000});
 const related=[];
 for(const l of ['en','zh']){
  await lang(l);const link=page.locator('.step-nav a[href="#step2"]');await link.focus();await page.keyboard.press('Enter');await page.waitForTimeout(200);const top=await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top);assert(top>=75&&top<150,top);
  for(const [href,concept] of [['../41/#step1','placement'],['../871/#step2','exchange']]){
   const target=page.locator(`.related a[href="${href}"]`),label=await target.textContent();await target.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+href.slice(3));await page.waitForTimeout(100);
   const fragment=href.split('#')[1],text=await page.locator('#'+fragment).textContent();assert(text.includes(concept==='placement'?'x−1':l==='en'?'largest':'最大'));
   related.push({locale:l,label,url:page.url(),meaning:concept,excerpt:text.slice(0,2500)});await page.goto(url);await lang(l);
  }
 }
 // Actual rendered solid-color text pairs. Composite backgrounds through ancestor layers.
 await page.locator('#end').click();await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#sourceDetails').evaluate(e=>e.open=true);
 const raw=await page.evaluate(()=>{
  const rgb=s=>{const a=s.match(/[\d.]+/g).map(Number);return[a[0],a[1],a[2],a[3]??1];};
  const blend=(fg,bg)=>[0,1,2].map(i=>fg[i]*fg[3]+bg[i]*(1-fg[3]));
  function background(e){let color=[13,17,23];const ancestors=[];for(let p=e;p;p=p.parentElement)ancestors.push(p);for(const p of ancestors.reverse()){const s=getComputedStyle(p);if(s.backgroundImage!=='none')throw Error('unsupported image background');color=blend(rgb(s.backgroundColor),color);}return color;}
  const entries=[];for(const e of document.querySelectorAll('body *')){const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!r.width||!r.height||s.visibility==='hidden')continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const fg=rgb(s.color),bg=background(e);entries.push({tag:e.tagName,id:e.id,text:e.textContent.slice(0,65),fg:blend(fg,bg),bg,opacity:s.opacity,size:s.fontSize,weight:s.fontWeight});}return entries;
 });
 const contrasts=raw.map(e=>({...e,ratio:contrast(e.fg,e.bg)}));for(const e of contrasts){assert.equal(e.opacity,'1');assert(e.ratio>=4.5,JSON.stringify(e));}
 const focusPairs=[[[255,180,84],[28,35,48]],[[255,180,84],[13,17,23]],[[255,180,84],[22,27,34]]].map(([fg,bg])=>({fg,bg,ratio:contrast(fg,bg)}));focusPairs.forEach(p=>assert(p.ratio>=3));
 // Storage denial and system accessibility states.
 const denied=await browser.newContext();await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});const other=await denied.newPage();await other.goto(url);await other.locator('#next').click();await other.locator('[data-lang=zh]').click();assert.equal(await other.locator('#position').inputValue(),'1');await other.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await other.locator('#prev').focus();assert.equal(await other.locator('#prev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await denied.close();
 await context.setOffline(true);const local=await context.newPage();await local.goto('file://'+path.join(root,'index.html'));assert.equal(await local.locator('#pythonCode').textContent(),source);await local.locator('#next').click();assert.equal(await local.locator('#position').inputValue(),'1');await local.close();await context.setOffline(false);
 assert(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')||u.startsWith('data:')));
 fs.writeFileSync(path.join(out,'asset-diagnostics.json'),JSON.stringify({errors,badAssets,requests},null,2));
 // Related legacy pages may request /favicon.ico; retain diagnostics and exempt only that request.
 assert.deepEqual(errors.filter(e=>!(typeof e==='object'&&e.url==='http://127.0.0.1:18770/favicon.ico'&&!e.page.includes('/899/'))),[]);assert.deepEqual(badAssets.filter(u=>u!=='http://127.0.0.1:18770/favicon.ico'),[]);
 fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({kind:'author self-check',result:'pass',browser:await browser.version(),platform:process.platform,headings,semantic,fit,clipboard,related,contrasts,focusPairs,contrastCalibration:'black/white 21; identical 1; #808080/white 3.949439648; primary luminances .2126/.7152/.0722; #747474/black 4.4929480731 fails AA; no rounding',threshold:4.5,focusThreshold:3,errors,badAssets,zoom:'Chromium CSS zoom=2, 1440px; narrow viewports checked separately. Physical devices and native browser-chrome zoom unverified.'},null,2));
 await browser.close();console.log('PASS: Chromium bilingual states, 6 presets, source transfer, keyboard, layouts, offline, storage, links and rendered contrast');
})().catch(e=>{console.error(e);process.exit(1)});
