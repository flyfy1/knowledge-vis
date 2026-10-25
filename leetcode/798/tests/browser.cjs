const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const pairs=JSON.parse(fs.readFileSync(path.join(ROOT,'copy.js'),'utf8').replace(/^window.LESSON_COPY = /,'').replace(/;\s*$/,''));
// Detect duplicate keys before JSON.parse can discard them (all dictionary values are pairs).
const raw=fs.readFileSync(path.join(ROOT,'copy.js'),'utf8'),keys=[...raw.matchAll(/^  "([^"]+)": \[/gm)].map(m=>m[1]);assert.equal(new Set(keys).size,keys.length);Object.values(pairs).forEach(v=>assert(v.length===2&&v.every(x=>typeof x==='string')));
const presets=[[1,0,2],[2,3,1,4,0],[1,3,0,2,4],[0],[0,0,0],[2,2,2]];
function scores(a){return a.map((_,k)=>a.slice(k).concat(a.slice(0,k)).reduce((s,v,j)=>s+(v<=j),0));}
function luminance(c){let v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
function contrast(a,b){let x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(luminance('rgb(0,0,0)'),0);assert.equal(luminance('rgb(255,255,255)'),1);assert.equal(contrast('rgb(0,0,0)','rgb(255,255,255)'),21);assert.equal(luminance('rgb(0,255,0)'),.7152);assert.equal(luminance('rgb(255,0,0)'),.2126);assert.equal(luminance('rgb(0,0,255)'),.0722);assert(Math.abs(contrast('rgb(116,116,116)','rgb(0,0,0)')-4.492948)<.000001);assert(contrast('rgb(116,116,116)','rgb(0,0,0)')<4.5);
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[],requests=[],checks=[],related=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
await page.goto('http://127.0.0.1:18770/leetcode/798/');await page.locator('#handRead').filter({hasText:'k=0'}).waitFor();
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();assert((await page.locator('h1').textContent()).includes('#798'));assert((await page.locator('h1').textContent()).includes(lang==='en'?'Smallest Rotation':'得分最高'));
 assert.equal(await page.locator('[data-i18n=intervalRule]').textContent(),pairs.intervalRule[lang==='zh'?0:1]);
 for(let pi=0;pi<presets.length;pi++){
  await page.selectOption('#preset',String(pi));let a=presets[pi],s=scores(a);assert(await page.locator('#prev').isDisabled());assert(await page.locator('#scanPrev').isDisabled());
  for(let k=0;k<a.length;k++){
   const vals=await page.locator('#handRows tr').evaluateAll(rows=>rows.map(r=>r.children[1].textContent));assert.deepEqual(vals,a.slice(k).concat(a.slice(0,k)).map(String));assert((await page.locator('#handRead').textContent()).includes(String(s[k])));if(k<a.length-1)await page.click('#next');
  }
  assert(await page.locator('#next').isDisabled());if(a.length>1){await page.click('#prev');await page.click('#next');}await page.click('#reset');if(a.length>1)await page.click('#end');
  for(let i=0;i<a.length;i++){
   await page.selectOption('#item',String(i));const mask=await page.locator('#mask>div').allTextContents();for(let k=0;k<a.length;k++){const j=(i-k+a.length)%a.length;assert(mask[k].includes(`j=${j}`));assert(mask[k].includes(a[i]>j?(lang==='en'?'loses':'失分'):(lang==='en'?'scores':'得分')));}
  }
  for(let k=0;k<a.length;k++){
   await page.click('#scanNext');const row=await page.locator('#scanRows tr').last().locator('td').allTextContents();assert.equal(+row[0],k);assert.equal(+row[2],a.length-s[k]);assert.equal(+row[3],s[k]);assert.equal(+row[4],s.slice(0,k+1).indexOf(Math.max(...s.slice(0,k+1))));
  }
  assert(await page.locator('#scanNext').isDisabled());if(a.length>1){await page.click('#scanPrev');await page.click('#scanNext');}await page.click('#scanReset');assert.equal(await page.locator('#scanRows tr').count(),0);await page.click('#scanEnd');assert.equal(await page.locator('#scanRows tr').count(),a.length);
 }
 for(let option=0;option<3;option++){
  await page.check(`[name=prediction][value="${option}"]`);assert(!(await page.locator('#feedback').textContent()).includes('l='));await page.click('#reveal');const f=await page.locator('#feedback').textContent();assert(f.includes('l=(0−3+1+5)%5=3'));assert(f.startsWith(pairs[option===1?'correct':'incorrect'][lang==='zh'?0:1]));
 }
 const before=await page.locator('#feedback').textContent();await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert(await page.locator('[value="2"][name=prediction]').isChecked());assert((await page.locator('#feedback').textContent()).includes('l='));await page.locator(`[data-lang=${lang}]`).click();assert.equal(await page.locator('#feedback').textContent(),before);await page.click('#quizReset');assert(await page.locator('#reveal').isDisabled());
 await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
 await page.click('#copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Each fallback attempt resets and verifies a distinct sentinel before disabling writes.
 const sentinel=`sentinel-${lang}-${Date.now()}`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel');},sentinel);
 await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('test-denied'));});await page.click('#copyPython');assert(await page.locator('#sourceFallback').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});await page.locator('#sourceDetails summary').click();checks.push({lang,allPresets:true,allOptions:true,sourceParity:true,fallbackNativeCopy:true});
}
const colors=[];await page.selectOption('#preset','1');await page.click('#scanEnd');
for(const [name,width,zoom] of [['desktop',1440,1],['phone390',390,1],['phone320',320,1],['tablet',736,1],['zoom200',1280,2]]){
 await page.setViewportSize({width,height:1000});await page.evaluate(z=>{document.body.style.zoom=z;},zoom);
 for(const lang of ['zh','en']){
  await page.locator(`[data-lang=${lang}]`).click();await page.locator('#step2').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:path.join(OUT,`${name}-${lang}-interval.png`),fullPage:true});
  await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`${name}-${lang}-detail.png`)});
  await page.locator('#step3 .stage').screenshot({path:path.join(OUT,`${name}-${lang}-scan.png`)});
  const budget=await page.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),span=document.createElement('span');span.style.font=s.font;span.style.whiteSpace='pre';span.textContent=e.options[e.selectedIndex].text;document.body.append(span);const textWidth=span.getBoundingClientRect().width/Number(document.body.style.zoom||1);span.remove();return {width:e.clientWidth,textWidth,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.font};});assert(budget.width>=budget.textWidth+budget.padding+24);checks.push({name,lang,zoom,selectBudget:budget});
 }
}
await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});await page.locator('[data-lang=en]').click();await page.locator('#scanReset').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#scanRows tr').count(),0);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'scanEnd');const focus=await page.locator('#scanEnd').evaluate(e=>{const s=getComputedStyle(e);return {width:s.outlineWidth,color:s.outlineColor,style:s.outlineStyle};});assert.equal(focus.width,'3px');assert.equal(focus.style,'solid');await page.keyboard.press('Enter');assert.equal(await page.locator('#scanRows tr').count(),5);
for(const selector of ['body','.explain','.hint','.btn','#scanEnd:disabled','.mask>div','.step-nav a','textarea']){
 const color=await page.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);let p=e,bg=s.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}return {fg:s.color,bg};});if(color.bg.startsWith('rgb(')){const ratio=contrast(color.fg,color.bg);assert(ratio>=4.5,selector+' '+ratio);colors.push({selector,...color,ratio});}
}
assert(contrast(focus.color,'rgb(28,35,48)')>=3);
// Internal and cross-lesson anchors actually exist.
for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')).filter(h=>h.includes('#')))){const u=new URL(href,page.url()),res=await context.request.get(u.href.split('#')[0]);assert(res.ok());assert((await res.text()).includes(`id="${u.hash.slice(1)}"`));}
for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();for(const id of [689,732]){const link=page.locator(`.related a[href="../${id}/#step2"]`),label=await link.textContent();const target=await context.newPage();await target.goto(page.url());await target.locator(`[data-lang=${lang}]`).click();await target.locator(`.related a[href="../${id}/#step2"]`).focus();await target.keyboard.press('Enter');await target.waitForURL(`**/${id}/#step2`);const text=await target.locator('#step2').textContent();assert(text.includes(id===689?(lang==='en'?'earliest maximum':'最早'):(lang==='en'?'net count changes':'变化')));related.push({lang,label,url:target.url(),excerpt:text.slice(0,1500)});await target.close();}}
assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);assert.equal(errors.length,0,errors.join('\n'));assert(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')));
// Offline file source and real deep-link navigation.
const offline=await context.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
for(const lang of ['zh','en','zh']){await page.locator(`[data-lang=${lang}]`).click();await page.locator('a[href="#step2"]').click();await page.waitForTimeout(400);const geometry=await page.locator('#step2 h2').evaluate(e=>({top:e.getBoundingClientRect().top,nav:document.querySelector('.step-nav').getBoundingClientRect().bottom}));assert(geometry.top>=geometry.nav);}
// Capture settled 200% stage views with room below the sticky navigation.
await page.setViewportSize({width:1280,height:1800});await page.evaluate(()=>document.body.style.zoom=2);
for(const lang of ['en','zh']){await page.locator(`[data-lang=${lang}]`).click();for(const id of ['step2','step3']){await page.locator('#'+id+' .stage').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(400);await page.screenshot({path:path.join(OUT,`settled200-${lang}-${id}.png`)});}}
await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.keyboard.press('Tab');await page.locator('#scanReset').focus();assert.equal(await page.locator('#scanReset').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
// Blocked storage must not stop initialization or locale switching.
const blocked=await context.newPage();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('blocked');}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('blocked');}});});await blocked.goto(page.url());await blocked.locator('#handRead').filter({hasText:'k=0'}).waitFor();await blocked.locator('[data-lang=zh]').click();assert((await blocked.locator('h1').textContent()).includes('#798'));await blocked.close();
fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify({authorSelfCheck:true,browser:await browser.version(),host:process.platform,checks,related,colors,focus,errors,requests:[...new Set(requests)],cssBytes:fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size},null,2));await browser.close();console.log('browser checks passed');})().catch(e=>{console.error(e);process.exit(1);});
