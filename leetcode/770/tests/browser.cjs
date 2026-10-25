'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/770/';
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'),baseline=fs.readFileSync(path.join(ROOT,'baseline.py'),'utf8'),errors=[],requests=[],logs=[];
function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
assert.equal(lum([0,0,0]),0);assert.equal(lum([255,255,255]),1);assert.equal(ratio([0,0,0],[255,255,255]),21);
for(const [rgb,w]of [[[255,0,0],.2126],[[0,255,0],.7152],[[0,0,255],.0722]])assert(Math.abs(lum(rgb)-w)<1e-12);
assert(Math.abs(ratio([116,116,116],[0,0,0])-4.492948)<1e-6);assert(ratio([116,116,116],[0,0,0])<4.5);
// Detect duplicate localization properties before JavaScript could discard one.
const acorn=require('acorn');const tree=acorn.parse(fs.readFileSync(path.join(ROOT,'copy.js'),'utf8'),{ecmaVersion:2022});
function walk(x){if(!x||typeof x!=='object')return;if(x.type==='ObjectExpression'){const keys=x.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate copy key');}for(const v of Object.values(x))if(Array.isArray(v))v.forEach(walk);else walk(v);}walk(tree);
const scope={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'copy.js'),'utf8'),scope);for(const pair of Object.values(scope.window.CALC_COPY))assert(pair.length===2&&pair.every(x=>typeof x==='string'&&x.length));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try{
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});page.on('requestfailed',r=>errors.push(r.url()));page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const expected=[['1*a*a','1*a','-2'],['-1*a','14'],['1*e*e','-64'],['-1*a*a*b','2*a*b'],[],['7'],[],['1*b*b','4*b','4']];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);const title=lang==='en'?'#770 · Basic Calculator IV':'#770 · 基本计算器 IV';assert.equal(await page.locator('h1').textContent(),title);assert.equal(await page.title(),title);assert.equal(await page.locator('html').getAttribute('lang'),lang==='en'?'en':'zh-CN');
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(OUT,`${lang}-header.png`)});
  for(let p=0;p<8;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());assert(await page.locator('#reset').isDisabled());
   await page.click('#next');const snapshot=await page.locator('.stage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('.stage').textContent(),snapshot);
   await page.click('#end');assert((await page.locator('#output').textContent()).endsWith(JSON.stringify(expected[p])));assert(await page.locator('#next').isDisabled());assert(await page.locator('#end').isDisabled());
   const final=await page.locator('.stage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('.stage').textContent(),final);await page.click('#reset');assert(await page.locator('#prev').isDisabled());
  }
  // Prediction is separate from trace reset. Every answer retains its meaning across locale.
  for(const answer of ['0','1','2']){
   await page.check(`[name=prediction][value="${answer}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.includes('x*x'));assert(text.startsWith(answer==='1'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Recheck':'再看')));
   assert(text.includes(lang==='en'?'extra y*x':'最后另加的 y*x'));
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`[name=prediction][value="${answer}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);
  }
  await page.selectOption('#preset','0');await page.click('#next');const progress=await page.locator('#progress').textContent();await page.click('#reset');assert(await page.locator('#feedback').isVisible());
  await page.check('[name=prediction][value="1"]');assert(await page.locator('#feedback').isHidden());await page.click('#reveal');
  await page.screenshot({path:path.join(OUT,`${lang}-prediction.png`)});
  await page.click('#sourceDetails summary');assert.equal(await page.locator('#pythonCode').textContent(),source);await page.click('#sourceDetails summary');assert.equal(await page.locator('#baselineCode').textContent(),baseline);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('sentinel-770-not-source');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('forced fallback'))});});
  await page.click('#copy');await page.waitForFunction(()=>!document.querySelector('#manualCopy').hidden);assert.equal(await page.locator('#copyText').inputValue(),source);
  assert(await page.evaluate(()=>document.activeElement.id==='copyText'&&document.activeElement.selectionStart===0&&document.activeElement.selectionEnd===document.activeElement.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.screenshot({path:path.join(OUT,`${lang}-manual-copy.png`)});await page.evaluate(()=>delete navigator.clipboard.writeText);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.selectOption('#preset','0');await page.click('#end');await page.click('#prev');
  assert.equal(await page.locator('#pairs li').count(),4);const result=await page.locator('#result').textContent();assert(result.includes('(a, a)1'));assert(result.includes('(a)1'));assert(result.includes('constant-2')||result.includes('常数-2'));
  const event=await page.locator('#event').textContent();assert(event.includes('( a + 2 ) * ( a - 1 )'));assert(event.includes('*'));
  const stable=await page.locator('.stage').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('.stage').textContent(),stable);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#preset').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   for(let p=0;p<8;p++){
    await page.selectOption('#preset',String(p));const fit=await page.locator('#preset').evaluate(el=>{const c=document.createElement('canvas').getContext('2d');c.font=getComputedStyle(el).font;return {text:c.measureText(el.selectedOptions[0].textContent).width,available:el.clientWidth-parseFloat(getComputedStyle(el).paddingLeft)-parseFloat(getComputedStyle(el).paddingRight)-24}});assert(fit.text<=fit.available,JSON.stringify({lang,width,p,fit}));
   }
   await page.selectOption('#preset','0');await page.click('#end');await page.click('#prev');
   await page.locator('#preset').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-controls.png`)});
   await page.locator('#pairs').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-products.png`)});
   await page.locator('#result').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-${width}-result.png`)});
  }
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#pairs').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(OUT,`${lang}-zoom200.png`)});await page.evaluate(()=>document.body.style.zoom='');
  await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert(!(await page.locator('#prev').isDisabled()));
  const focus=await page.locator('#next').evaluate(el=>({color:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth}));assert.equal(focus.width,'3px');
  for(const anchor of await page.locator('a[href^="#step"]').all()){
   await anchor.click();const hash=await anchor.getAttribute('href');assert.equal(await page.locator(hash).count(),1);const box=await page.locator(hash).boundingBox(),nav=await page.locator('#stepNav').boundingBox();assert(box.y>=nav.height-2,JSON.stringify({hash,box,nav}));
  }
  logs.push({lang,presets:8,predictions:3,source:'display/embedded/copied/downloaded exact bytes',fallback:'distinct sentinel, full selected source, native host copy shortcut and actual clipboard readback',widths:[320,390,736,1440],zoom:'200% CSS zoom, 780px viewport, 390px effective content width',focus});
 }
 // Walk every transition through actual buttons, snapshot reversal was tested above.
 await page.selectOption('#preset','0');let count=0;while(!(await page.locator('#next').isDisabled())){await page.click('#next');count++;}assert.equal(count,await page.evaluate(()=>CalcIV.trace(CalcIV.presets[0]).frames.length-1));
 // Check core trace outputs against independently generated oracle fixtures in real browser.
 const fixtures=JSON.parse(fs.readFileSync(path.join(OUT,'oracle-fixtures.json'),'utf8'));
 const actual=await page.evaluate(xs=>xs.map(x=>CalcIV.trace(x).output),fixtures);for(let i=0;i<fixtures.length;i++)assert.deepEqual(actual[i],fixtures[i].expected);
 // All local related targets exist and have the advertised anchor.
 for(const href of await page.locator('.related a').evaluateAll(xs=>xs.map(x=>x.href))){const u=new URL(href);const response=await context.request.get(u.href.split('#')[0]);assert.equal(response.status(),200);assert((await response.text()).includes(`id="${u.hash.slice(1)}"`));}
 // Calibrated contrast function above; resolve actual transparent ancestor backgrounds.
 await page.setViewportSize({width:1440,height:1000});await page.click('[data-lang=en]');await page.locator('#sourceDetails').evaluate(x=>x.open=true);await page.locator('details').first().evaluate(x=>x.open=true);
 const colors=await page.evaluate(()=>{
  const parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);
  function bg(el){let p=el,layers=[];while(p){const a=parse(getComputedStyle(p).backgroundColor);if(a.length>=3){layers.push(a);if(a.length===3||a[3]===1)break;}p=p.parentElement;}let rgb=[13,17,23];for(const l of layers.reverse()){const a=l[3]??1;rgb=l.slice(0,3).map((x,i)=>x*a+rgb[i]*(1-a));}return rgb;}
  return [...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&getComputedStyle(el).visibility!=='hidden').map(el=>({tag:el.tagName,text:el.textContent.slice(0,50),fg:parse(getComputedStyle(el).color).slice(0,3),bg:bg(el)}));
 });const contrast=colors.map(x=>({...x,ratio:ratio(x.fg,x.bg)}));assert(contrast.every(x=>x.ratio>=4.5),JSON.stringify(contrast.filter(x=>x.ratio<4.5)));
 assert(ratio([255,180,84],[28,35,48])>=3);assert(ratio([255,180,84],[13,17,23])>=3);
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(x=>getComputedStyle(x).outlineWidth),'3px');await page.screenshot({path:path.join(OUT,'forced-colors.png')});
 await page.emulateMedia({forcedColors:'none'});
 const isolated=await browser.newContext();await isolated.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked storage')}})});const blocked=await isolated.newPage();await blocked.goto(url);await blocked.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);await blocked.click('[data-lang=zh]');await blocked.click('#next');await blocked.click('[data-lang=en]');assert((await blocked.locator('#progress').textContent()).includes('1/'));await isolated.close();
 assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);assert(requests.every(x=>x.startsWith('http://127.0.0.1:18770/')||x.startsWith('data:')),requests.join('\n'));assert.deepEqual(errors,[]);
 const cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(OUT,'contrast.json'),JSON.stringify({calibration:{black:0,white:1,blackWhite:21,nearThreshold:ratio([116,116,116],[0,0,0])},minimum:Math.min(...contrast.map(x=>x.ratio)),pairs:contrast},null,2));
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({kind:'author self-check',result:'pass',host:process.platform,browser:browser.version(),url,logs,errors,requestUrls:[...new Set(requests)],oracleCases:fixtures.length,cssBytes,copyShortcut:process.platform==='darwin'?'Meta+C':'Control+C',limitations:['headless Chromium/Linux only; CSS zoom used for 200% reflow','no actual learner outcomes, independent acceptance, LeetCode submission or public deployment']},null,2));
 console.log(JSON.stringify({result:'pass',browser:browser.version(),logs,cssBytes,minimumContrast:Math.min(...contrast.map(x=>x.ratio))}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(OUT,'browser-failure.txt'),e.stack+'\n');console.error(e);process.exit(1)});
