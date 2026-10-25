const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),os=require('node:os');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const URL=process.env.LESSON_URL||'http://127.0.0.1:18782/leetcode/715/';
const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
const presetOps=[
 [['add',10,20],['remove',14,16],['query',10,14],['query',13,15],['query',16,17]],
 [['add',2,4],['add',6,8],['query',3,7],['add',4,6],['query',3,7]],
 [['add',2,9],['add',3,7],['remove',4,6],['remove',4,6],['add',4,6],['query',2,9]],
 [['query',1,2],['remove',1,8],['add',3,4],['remove',1,8],['query',3,4]],
 [['add',999999995,1000000000],['remove',999999997,999999999],['query',999999999,1000000000],['query',999999996,999999998]]
];
// Expected states derived independently from coverage of elementary coordinate spans.
function oracle(ops){let ranges=[];const coords=[...new Set(ops.flatMap(o=>o.slice(1)))].sort((a,b)=>a-b),flags=Array(coords.length-1).fill(false),states=[{points:[],result:null}];
 for(const[k,l,r]of ops){const ids=flags.map((_,i)=>i).filter(i=>coords[i]>=l&&coords[i+1]<=r);let result=null;if(k==='query')result=ids.every(i=>flags[i]);else ids.forEach(i=>flags[i]=k==='add');
 const points=[];let prior=false;coords.forEach((x,i)=>{const cur=flags[i]||false;if(cur!==prior)points.push(x);prior=cur;});states.push({points,result});}return states;
}
const expected=presetOps.map(oracle),report={scope:'author self-check',platform:os.platform(),screenshots:[],stateChecks:0,semanticBindings:[],requests:[],errors:[],widths:[],source:{}};
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)report.errors.push(r.url()+': '+r.status());});page.on('request',r=>report.requests.push(r.url()));
async function click(id){await page.locator(id).click();}
async function language(lang){await click('#langToggle [data-lang="'+lang+'"]');assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');}
async function shot(name,selector){const file=name+'.png';if(selector)await page.locator(selector).screenshot({path:path.join(OUT,file)});else await page.screenshot({path:path.join(OUT,file),fullPage:false});report.screenshots.push(file);}
async function fit(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 const bad=await page.locator('button,select').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height<47.9).map(e=>e.id));assert.deepEqual(bad,[]);
 const select=await page.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return{label:el.selectedOptions[0].textContent,text:c.measureText(el.selectedOptions[0].textContent).width,available:el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-24,font:s.font};});assert(select.text<select.available,JSON.stringify(select));return select;}
async function checkState(p,n,lang){const state=expected[p][n];assert.equal(await page.locator('#afterPoints').textContent(),(lang==='zh'?'边界数组 points = ':'Endpoint array points = ')+JSON.stringify(state.points));
 assert.equal(await page.locator('#history li').count(),n);
 const text=await page.locator('#progress').textContent();assert(text.includes(`${n}/${presetOps[p].length}`));
 if(n){assert.equal(await page.locator('#beforePoints').textContent(),(lang==='zh'?'边界数组 points = ':'Endpoint array points = ')+JSON.stringify(expected[p][n-1].points));if(state.result!==null)assert((await page.locator('#sliceRead').textContent()).includes(String(state.result)));}
 assert.equal(await page.locator('#tracePrev').isDisabled(),n===0);assert.equal(await page.locator('#traceNext').isDisabled(),n===presetOps[p].length);report.stateChecks++;
}
await page.goto(URL);await page.waitForFunction(()=>document.querySelector('h1').textContent.includes('715'));
assert.equal(await page.locator('#pythonCode').textContent(),source);
assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);report.source.embedded=true;report.source.rendered=true;
// All locales, presets and every frame; viewport checks include selected labels.
for(const width of [320,390,736,1440]){await page.setViewportSize({width,height:1000});for(const lang of ['en','zh']){await language(lang);
 for(let p=0;p<presetOps.length;p++){await page.selectOption('#preset',String(p));await checkState(p,0,lang);for(let n=1;n<=presetOps[p].length;n++){await click('#traceNext');await checkState(p,n,lang);}
 const terminal=await page.locator('#afterPoints').textContent();await click('#tracePrev');await checkState(p,presetOps[p].length-1,lang);await click('#traceNext');assert.equal(await page.locator('#afterPoints').textContent(),terminal);await click('#traceReset');await checkState(p,0,lang);await click('#traceLast');await checkState(p,presetOps[p].length,lang);
 const label=await fit();if(width===320)report.widths.push({width,lang,preset:p,...label});
 }
 await page.selectOption('#preset','0');await click('#traceNext');await click('#traceNext');await page.locator('#operation').scrollIntoViewIfNeeded();await shot(`${lang}-${width}-cut`,'#step2 .stage');
 if(width===390||width===1440){await page.locator('#step0').scrollIntoViewIfNeeded();await shot(`${lang}-${width}-hand`,'#step0 .stage');}
}}
// Meaning bindings after an interaction and a language roundtrip.
await page.setViewportSize({width:390,height:900});
for(const lang of ['en','zh']){await language(lang);for(const probe of ['4','55','6']){await click('#probe'+probe);const s=await page.locator('#handRead').textContent();assert(s.includes(probe==='55'?'5.5':probe));report.semanticBindings.push({lang,probe,observed:s});}
 await page.selectOption('#preset','1');for(let n=0;n<3;n++)await click('#traceNext');const gap=await page.locator('#sliceRead').textContent();assert(gap.includes('false'));report.semanticBindings.push({lang,preset:1,frame:3,expected:'both endpoints covered but interior gap; false',observed:gap});
 await click('#traceNext');const bridge=await page.locator('#sliceRead').textContent();assert(bridge.includes('[4,6]')&&bridge.includes('[]'));assert((await page.locator('#afterPoints').textContent()).includes('[2,8]'));report.semanticBindings.push({lang,preset:1,frame:4,expected:'remove internal [4,6] boundaries, replacement []',observed:bridge});
 const formula=await page.locator('#queryFormula').textContent();assert(formula.includes('bisect_right(points,left)')&&formula.includes('bisect_left(points,right)')&&formula.includes('a % 2 == 1'));report.semanticBindings.push({lang,formula});
 // Every prediction option, explicit reveal, then change must clear feedback.
 await click('#quizReset');assert(await page.locator('#reveal').isDisabled());assert(!(await page.locator('#feedback').textContent()).includes('[3,5,6,11]'));
 for(const answer of ['0','1','2']){await page.check(`[name=prediction][value="${answer}"]`);assert(!(await page.locator('#feedback').textContent()).includes('[3,5,6,11]'));await click('#reveal');const s=await page.locator('#feedback').textContent();assert(s.includes('[3,5,6,11]'));assert.equal(await page.locator('#feedback').evaluate(e=>e.classList.contains('correct')),answer==='2');report.semanticBindings.push({lang,answer,observed:s});}
 await shot(lang+'-390-prediction','#step3 .stage');
 await page.check('[name=prediction][value="0"]');assert(!(await page.locator('#feedback').textContent()).includes('[3,5,6,11]'));
}
await page.check('[name=prediction][value="2"]');await click('#reveal');const snapshot=await page.locator('#afterPoints').textContent();await language('en');await language('zh');assert(await page.isChecked('[name=prediction][value="2"]'));assert((await page.locator('#feedback').textContent()).includes('[3,5,6,11]'));assert.equal(await page.locator('#afterPoints').textContent(),snapshot);assert.equal(await page.locator('#probe6').getAttribute('aria-pressed'),'true');
await click('#traceReset');assert((await page.locator('#feedback').textContent()).includes('[3,5,6,11]'));report.stateIsolation=true;
// Clean focused diagram captures avoid a sticky-nav overlay in tall stage element captures.
await page.setViewportSize({width:320,height:1200});
for(const lang of ['en','zh']){await language(lang);for(const p of [1,4]){await page.selectOption('#preset',String(p));await click('#traceNext');await click('#traceNext');if(p===1){await click('#traceNext');await click('#traceNext');}await page.locator('.comparison').scrollIntoViewIfNeeded();await shot(`${lang}-320-preset${p}-diagram`,'.comparison');}
await page.evaluate(()=>window.scrollTo(0,0));await shot(lang+'-320-header');}
// Source transfer uses actual clipboard, download bytes, and native fallback keyboard copy.
for(const lang of ['en','zh']){await language(lang);await click('#copyPython');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.includes('copied')||document.querySelector('#copyStatus').textContent.includes('已复制'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);}
report.source.nativeCopy=true;
const dlPromise=page.waitForEvent('download');await click('#download');const download=await dlPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);report.source.download=true;
await page.evaluate(async()=>{window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);await window.originalWrite('715 distinct fallback sentinel');navigator.clipboard.writeText=()=>Promise.reject(new Error('forced denial'));});
for(const lang of ['en','zh']){await language(lang);await page.evaluate(()=>window.originalWrite('715 distinct fallback sentinel '+document.documentElement.lang));await click('#copyPython');await page.waitForSelector('#sourceFallback:not([hidden])');assert.equal(await page.locator('#manualSource').inputValue(),source);assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
 const key=os.platform()==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(key);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);report.source['manualNative_'+lang]={shortcut:key,exact:true};await shot(lang+'-fallback','#sourceFallback');
}
await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
// The source disclosure itself is keyboard-operable, not just present in hidden DOM.
await page.locator('#sourceDetails summary').focus();await page.keyboard.press('Enter');assert(await page.locator('#pythonCode').isVisible());assert.equal(await page.locator('#pythonCode').textContent(),source);await shot('source-disclosure','#sourceDetails');await page.keyboard.press('Enter');assert(!(await page.locator('#pythonCode').isVisible()));report.source.disclosureKeyboard=true;
// Keyboard focus, activation and focus preservation on locale changes.
await page.selectOption('#preset','1');await page.locator('#traceNext').focus();await page.keyboard.press('Enter');await checkState(1,1,'zh');await page.locator('#traceNext').focus();await page.keyboard.press('Space');await checkState(1,2,'zh');
await page.locator('#langToggle [data-lang=en]').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');await page.keyboard.press('Tab');report.keyboardFocus=await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent}));assert(report.keyboardFocus.tag==='A');
// Real deep-link click: heading below sticky navigation after settling.
await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(150);const geometry=await page.evaluate(()=>({top:document.querySelector('#step2').getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(geometry.top>=geometry.nav);report.deepLink=geometry;
// 200% CSS zoom reflow (explicitly not physical-device/browser chrome proof).
await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');for(const lang of ['en','zh']){await language(lang);await fit();await page.locator('#operation').scrollIntoViewIfNeeded();await shot(lang+'-zoom200');}await page.evaluate(()=>document.documentElement.style.zoom='1');report.zoom='200% CSS zoom at 1280px, reflow/overflow checked';
// Measure effective solid rendered text/background pairs, borders and focus.
report.contrast=await page.evaluate(()=>{
 function rgb(s){return (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);}function lum(c){return c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}function ratio(a,b){const x=lum(rgb(a)),y=lum(rgb(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 function bg(el){while(el){const s=getComputedStyle(el).backgroundColor;if(!s.endsWith(', 0)')&&s!=='transparent')return s;el=el.parentElement;}return 'rgb(13, 17, 23)';}
 const pairs=new Map();for(const el of document.querySelectorAll('h1,h2,h3,p,li,label,button,select,a,summary,.range-chip')){if(!el.getClientRects().length)continue;const s=getComputedStyle(el),back=bg(el),key=s.color+'/'+back;pairs.set(key,{foreground:s.color,background:back,ratio:ratio(s.color,back),example:el.id||el.tagName});}
 const focus='rgb(255, 180, 84)',surfaces=['rgb(13, 17, 23)','rgb(22, 27, 34)','rgb(28, 35, 48)'];return {text:[...pairs.values()],focus:surfaces.map(background=>({foreground:focus,background,ratio:ratio(focus,background)})),border:ratio('rgb(154, 167, 184)','rgb(28, 35, 48)')};
});assert(report.contrast.text.every(x=>x.ratio>=4.5),JSON.stringify(report.contrast));assert(report.contrast.focus.every(x=>x.ratio>=3));assert(report.contrast.border>=3);
// Focus styles and forced colors remain meaningful.
await page.locator('#traceNext').focus();assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
await page.emulateMedia({forcedColors:'active'});await page.keyboard.press('Tab');await page.locator('#traceNext').focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await page.waitForFunction(()=>document.querySelector('#traceNext').matches(':focus-visible'));assert.equal(await page.locator('#traceNext').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');report.forcedColorFocus=await page.locator('#traceNext').evaluate(e=>({active:document.activeElement.id,style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));await page.emulateMedia({forcedColors:'none'});
// Blocked storage and offline local-file source availability.
const blocked=await context.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage unavailable');}});});await blocked.goto(URL);await blocked.locator('[data-lang=zh]').click();assert.equal(await blocked.locator('html').getAttribute('lang'),'zh-CN');await blocked.close();
const offline=await context.newPage();await offline.goto('file://'+path.resolve(__dirname,'../index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();report.offlineAndBlockedStorage=true;
// Internal anchors must exist, including related lesson targets.
for(const href of await page.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href')))){if(href.startsWith('https:'))continue;const u=new global.URL(href,URL);const r=await context.request.get(u.href.split('#')[0]);assert(r.ok(),u.href);if(u.hash){const html=await r.text();assert(html.includes('id="'+u.hash.slice(1)+'"'),u.href);}}
assert(report.requests.every(u=>u.startsWith('http://127.0.0.1:18782/')),report.requests);assert.deepEqual(report.errors,[]);
report.status='pass';report.browser=await browser.version();report.cssBytes=fs.statSync(path.join(__dirname,'../style.css')).size+fs.statSync(path.join(__dirname,'../../style.css')).size;assert(report.cssBytes<25000);
fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,stateChecks:report.stateChecks,screenshots:report.screenshots.length,cssBytes:report.cssBytes,platform:report.platform}));await browser.close();
})().catch(e=>{fs.writeFileSync(path.join(OUT,'browser-failure.json'),JSON.stringify({message:e.message,stack:e.stack,...report},null,2));console.error(e);process.exit(1);});
