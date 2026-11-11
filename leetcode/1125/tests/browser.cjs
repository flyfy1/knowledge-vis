'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1125/';
const src=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'),{presets}=require('../core.js');
function oracle(p){for(let k=0;k<=p.people.length;k++){for(let s=0;s<2**p.people.length;s++){const team=p.people.map((_,i)=>i).filter(i=>s&(1<<i));if(team.length!==k)continue;const got=new Set(team.flatMap(i=>p.people[i]));if(p.skills.every(x=>got.has(x)))return k;}}}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],requests=[],coverage=[],shots=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.locator('#progress').waitFor();await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>4);
 async function snapshot(){return page.locator('#coverageGrid').textContent();}
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#1125 · 最小的必要团队':'#1125 · Smallest Sufficient Team');assert.equal(await page.title(),await page.locator('h1').textContent());
  assert.equal(await page.locator('.official-link').getAttribute('href'),'https://leetcode.com/problems/smallest-sufficient-team/');
  for(let p=0;p<presets.length;p++){
   await page.selectOption('#preset',String(p));assert(await page.isDisabled('#prev'));assert(await page.isDisabled('#reset'));
   const initial=await snapshot();let previous=initial;
   for(let i=1;i<=presets[p].people.length;i++){
    await page.click('#next');const current=await snapshot();
    await page.click('#prev');assert.equal(await snapshot(),previous);
    await page.click('#next');assert.equal(await snapshot(),current);previous=current;
   }
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));
   const output=await page.locator('#output').textContent(),min=oracle(presets[p]);assert(output.includes(lang==='en'?`(${min} people)`:`（${min} 人）`));
   const final=await snapshot();await page.click('#reset');assert.equal(await snapshot(),initial);await page.click('#end');assert.equal(await snapshot(),final);
   coverage.push({lang,preset:p,expectedMinimum:min,observed:output,rewindReplay:'pass'});
  }
  await page.selectOption('#preset','0');await page.click('#end');
  assert((await page.locator('[data-mask="7"]').textContent()).includes('[0,2]'));
  const attempts=await page.locator('#attempts').textContent();assert(attempts.includes('[0,2]'));assert(attempts.includes('[0,1,2]'));
  assert((await page.locator('[data-i18n=formula]').textContent()).includes('len(team)+1 < len(dp[merged])'));
  await page.click('#handNext');await page.click('#handNext');await page.click('#handNext');await page.click('#handNext');assert(await page.isDisabled('#handNext'));assert((await page.locator('#handState').textContent()).includes('[0,2]'));
  for(let i=0;i<4;i++)await page.click('#handPrev');assert(await page.isDisabled('#handPrev'));
  for(const option of ['0','1','2']){
   await page.check(`[name=prediction][value="${option}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();assert(feedback.includes(lang==='en'?'[0]+[2] covers':'[0]+[2] 覆盖'));assert(feedback.startsWith(option==='1'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Reconsider.':'再想一想。')));
  }
  // Locale roundtrip retains trace, chosen radio, feedback and keyboard focus.
  const state=await snapshot(),feedback=await page.locator('#feedback').textContent();await page.focus('[name=prediction][value="2"]');await page.keyboard.press('Space');assert(await page.locator('[name=prediction][value="2"]').evaluate(e=>e===document.activeElement));
  await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await snapshot()===state,false);assert(await page.isChecked('[value="2"][name=prediction]'));assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await snapshot(),state);assert.equal(await page.locator('#feedback').textContent(),feedback);
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#code').textContent(),src);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),src);
  // Each fallback attempt gets a verified new sentinel before automatic writes fail.
  const sentinel=`1125-${lang}-${Date.now()}-sentinel`;await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel failed');window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('intentional test denial'));},sentinel);
  await page.click('#copy');assert(await page.locator('#fallbackSource').evaluate(e=>e===document.activeElement));const selection=await page.locator('#fallbackSource').evaluate(e=>({a:e.selectionStart,b:e.selectionEnd,value:e.value}));assert.deepEqual(selection,{a:0,b:src.length,value:src});
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),src);
  coverage.push({lang,clipboard:'success and denied-write native fallback passed',host:process.platform,sentinelVerified:true});
  await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});
  const download=await Promise.all([page.waitForEvent('download'),page.click('#download')]);const file=await download[0].path();assert.equal(fs.readFileSync(file,'utf8'),src);
  await page.locator('#sourceDetails summary').click();
 }
 // Both languages, responsive widths and actual CSS zoom. Fixed viewport plus 200% zoom
 // is the headless equivalent layout check; physical browser zoom is not claimed.
 for(const lang of ['zh','en'])for(const width of [320,390,736,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','0');await page.click('#end');
  assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#1125 · 最小的必要团队':'#1125 · Smallest Sufficient Team');
  if(width===320){await page.locator('h1').scrollIntoViewIfNeeded();const head=`${lang}-320-zoom${zoom}-heading.png`;await page.screenshot({path:path.join(OUT,head)});shots.push(head);}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${lang} ${width} ${zoom} overflow`);
  const budget=await page.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {text:c.measureText(el.selectedOptions[0].textContent).width,width:el.getBoundingClientRect().width/Number(document.body.style.zoom||1),padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),font:s.fontFamily};});assert(budget.width-budget.padding-24>=budget.text,JSON.stringify(budget));
  for(let pi=0;pi<presets.length;pi++){
   await page.selectOption('#preset',String(pi));await page.click('#end');
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const fit=await page.locator('#preset').evaluate(el=>{const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return c.measureText(el.selectedOptions[0].textContent).width+parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+24<=el.getBoundingClientRect().width/Number(document.body.style.zoom||1);});assert(fit,`${lang} ${width} ${zoom} preset ${pi}`);
  }
  await page.selectOption('#preset','0');await page.click('#end');
  await page.locator('#coverageGrid').scrollIntoViewIfNeeded();const name=`${lang}-${width}-zoom${zoom}-coverage.png`;await page.screenshot({path:path.join(OUT,name)});shots.push(name);
  await page.locator('#reveal').scrollIntoViewIfNeeded();await page.focus('#reveal');assert(await page.locator('#reveal').evaluate(e=>e===document.activeElement));assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  const feedback=await page.locator('#feedback').boundingBox();assert(feedback.width>0);
  if(width===320||width===1440){const exercise=`${lang}-${width}-zoom${zoom}-prediction.png`;await page.screenshot({path:path.join(OUT,exercise)});shots.push(exercise);}
  coverage.push({lang,width,zoom,overflow:false,selectFit:budget});
 }
 await page.setViewportSize({width:390,height:1000});await page.evaluate(()=>document.body.style.zoom=1);
 for(const lang of ['zh','en']){
  await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','5');await page.click('#end');await page.locator('#coverageGrid').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-390-dense.png`)});shots.push(`${lang}-390-dense.png`);
  await page.selectOption('#preset','7');await page.click('#end');assert((await page.locator('[data-mask="3"]').textContent()).includes('[0,1]'));assert((await page.locator('[data-mask="3"]').textContent()).includes('[2]'));
  await page.locator('#next').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-390-endpoint.png`)});shots.push(`${lang}-390-endpoint.png`);
  for(const a of await page.locator('.related a[href^="#"]').all()){
   const href=await a.getAttribute('href');await a.focus();await page.keyboard.press('Enter');await page.waitForTimeout(80);assert.equal(new URL(page.url()).hash,href);const top=await page.locator(href).evaluate(e=>e.getBoundingClientRect().top),nav=await page.locator('nav').evaluate(e=>e.getBoundingClientRect().bottom);assert(top>=nav-1);
   coverage.push({lang,relatedLabel:await a.textContent(),target:href,meaning:href==='#step3'?'exact coverage equivalence and DP proof':'fresh equal-size different-coverage exercise'});
  }
 }
 // Follow cross-lesson links in both locales using the keyboard; read destination sections.
 for(const lang of ['zh','en']){
  await page.click(`[data-lang=${lang}]`);
  for(const [id,anchor,term] of [['691','step2',lang==='en'?'missing counts':'还缺几份'],['1092','step3',lang==='en'?'suffix':'后缀']]){
   const a=page.locator(`.related a[href="../${id}/#${anchor}"]`),label=await a.textContent();await a.focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>document.querySelector('h1').textContent.length>4);
   assert.equal(new URL(page.url()).pathname,`/leetcode/${id}/`);const section=await page.locator('#'+anchor).textContent();assert(section.includes(term),section.slice(0,300));
   coverage.push({lang,relatedLabel:label,target:page.url(),observedExcerpt:section.slice(0,500),meaning:id==='691'?'memoization by exact missing counts, repeatable stickers':'suffix-length DP and reconstruction',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'..',id,'copy.js'))).digest('hex')});
   await page.goBack();await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>4);
  }
 }
 // Native keyboard navigation between prediction radio options.
 await page.check('[name=prediction][value="0"]');await page.focus('[name=prediction][value="0"]');await page.keyboard.press('ArrowRight');assert(await page.isChecked('[name=prediction][value="1"]'));assert(await page.locator('#feedback').isHidden());await page.keyboard.press('Tab');assert(await page.locator('#reveal').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert(await page.locator('#feedback').isVisible());
 await page.selectOption('#preset','7');await page.click('#end');
 // Real rendered color pairs, independent audited helper below uses #000/#fff self tests.
 function luminance(rgb){return rgb.map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
 function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 assert.equal(contrast([0,0,0],[255,255,255]),21);assert.equal(contrast([255,255,255],[255,255,255]),1);assert.equal(contrast([0,0,0],[0,0,0]),1);
 const pairs=[];
 for(const sel of ['body','.explain','.hint','.coverage-card h3','.coverage-card p','#next','#preset','#fallbackSource','#reveal','.lang-toggle .active','.step-nav a.active','a.official-link']){
  const colors=await page.locator(sel).first().evaluate(el=>{const cs=getComputedStyle(el);let p=el,bg;while(p){bg=getComputedStyle(p).backgroundColor;if(bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent')break;p=p.parentElement;}return {fg:cs.color,bg};});const parse=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);const ratio=contrast(parse(colors.fg),parse(colors.bg));assert(ratio>=4.5,sel+' '+ratio);pairs.push({selector:sel,...colors,ratio});
 }
 const focus=contrast([255,180,84],[28,35,48]);assert(focus>=3);pairs.push({selector:'focus outline on panel2',ratio:focus});
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.focus('#reveal');assert.equal(await page.locator('#reveal').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));await page.emulateMedia({forcedColors:'none',reducedMotion:'reduce'});
 // Storage failure must not break in-memory locale. Source works without fetch/network.
 const storage=await browser.newContext();await storage.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('storage blocked')};Storage.prototype.setItem=()=>{throw Error('storage blocked')};});const sp=await storage.newPage();await sp.goto(url);await sp.click('[data-lang=zh]');assert.equal(await sp.locator('h1').textContent(),'#1125 · 最小的必要团队');await storage.setOffline(true);assert.equal(await sp.locator('#code').textContent(),src);await sp.click('[data-lang=en]');assert.equal(await sp.locator('h1').textContent(),'#1125 · Smallest Sufficient Team');await storage.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith(new URL(url).origin)||u.startsWith('data:')));
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({status:'pass',browser:browser.version(),host:process.platform,url,coverage,screenshots:shots,contrast:pairs,errors,localAssetsOnly:true,storageDenied:true,offlineSource:true,sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),zoomMethod:'CSS zoom 1 and 2; physical browser/device zoom unverified'},null,2));
 await browser.close();console.log('PASS browser',coverage.length,'recorded checks',shots.length,'screenshots');
})().catch(e=>{console.error(e);process.exit(1);});
