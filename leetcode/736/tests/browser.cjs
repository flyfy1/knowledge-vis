'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),logs=[],errors=[];
function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){let x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
assert.equal(lum([0,0,0]),0);assert.equal(lum([255,255,255]),1);assert.equal(ratio([0,0,0],[255,255,255]),21);assert(Math.abs(lum([255,0,0])-.2126)<1e-12);assert(Math.abs(lum([0,255,0])-.7152)<1e-12);assert(Math.abs(lum([0,0,255])-.0722)<1e-12);assert(ratio([116,116,116],[0,0,0])<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});page.on('requestfailed',r=>errors.push(r.url()));
 await page.goto('http://127.0.0.1:18770/leetcode/736/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const expected=[7,14,2,5,-12,-14,7];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='en'?'#736 · Parse Lisp Expression':'#736 · Lisp 语法解析');
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   await page.click('#next');const snapshot=await page.locator('.stage').textContent();await page.click('#prev');await page.click('#next');assert.equal(await page.locator('.stage').textContent(),snapshot);
   await page.click('#end');assert((await page.locator('#output').textContent()).endsWith(String(expected[p])));assert(await page.locator('#next').isDisabled());assert.equal(await page.locator('#afterMaps').textContent(),lang==='en'?'No bindings':'无绑定');
   await page.click('#prev');await page.click('#next');assert((await page.locator('#output').textContent()).endsWith(String(expected[p])));await page.click('#reset');assert(await page.locator('#prev').isDisabled());
  }
  assert(await page.locator('#reveal').isDisabled().catch(()=>false) || await page.locator('input[name=prediction]:checked').count()>0);
  for(const answer of ['0','1','2']){
   await page.check(`input[name=prediction][value="${answer}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.includes('5+4=9'));assert(text.startsWith(answer==='2'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Check':'再检查')));
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`input[value="${answer}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);
  }
  await page.click('#sourceDetails summary');assert.equal(await page.locator('#pythonCode').textContent(),source);await page.click('#sourceDetails summary');
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('clipboard-sentinel-736');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('forced manual test'))})});
  await page.click('#copy');await page.waitForFunction(()=>!document.querySelector('#manualCopy').hidden);assert.equal(await page.locator('#copyText').inputValue(),source);
  assert(await page.evaluate(()=>document.activeElement.id==='copyText'&&document.activeElement.selectionStart===0&&document.activeElement.selectionEnd===document.activeElement.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>delete navigator.clipboard.writeText);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.selectOption('#preset','0');for(let i=0;i<7;i++)await page.click('#next');
  const state=await page.locator('#progress').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#progress').textContent(),state);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:950});await page.locator('.stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const selected=await page.locator('#preset').evaluate(el=>{const c=document.createElement('canvas').getContext('2d');c.font=getComputedStyle(el).font;return {text:c.measureText(el.selectedOptions[0].textContent).width,available:el.clientWidth-parseFloat(getComputedStyle(el).paddingLeft)-parseFloat(getComputedStyle(el).paddingRight)-24}});assert(selected.text<=selected.available);
   await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:false});
  }
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('.stage').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.body.style.zoom='');
  await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert(!(await page.locator('#prev').isDisabled()));
  const focus=await page.locator('#next').evaluate(el=>({color:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth}));assert.equal(focus.width,'3px');
  for(const anchor of await page.locator('a[href^="#step"]').all()){await anchor.click();const hash=await anchor.getAttribute('href');assert(await page.locator(hash).count()===1);await page.waitForFunction(id=>document.querySelector(id).getBoundingClientRect().top>=0,hash);assert((await page.locator(hash).boundingBox()).y>=0)}
  logs.push({lang,presets:7,predictionOptions:3,copy:'automatic and native-key manual fallback exact',download:'exact bytes',widths:[320,390,736,1440],zoom:'CSS 200% at 780 viewport (390 effective)',focus});
 }
 // Measure visible text on solid, composited backgrounds. No gradients in lesson panels.
 const pairs=await page.evaluate(()=>{
  const parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);
  function bg(el){let p=el, layers=[];while(p){const a=parse(getComputedStyle(p).backgroundColor);if(a.length>=3){layers.push(a);if(a.length===3||a[3]===1)break;}p=p.parentElement;}let rgb=[13,17,23];for(const l of layers.reverse()){let a=l[3]??1;rgb=l.slice(0,3).map((x,i)=>x*a+rgb[i]*(1-a))}return rgb;}
  return [...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&getComputedStyle(el).visibility!=='hidden').map(el=>({tag:el.tagName,fg:parse(getComputedStyle(el).color).slice(0,3),bg:bg(el),text:el.textContent.slice(0,50)}));
 });const contrast=pairs.map(p=>({...p,ratio:ratio(p.fg,p.bg)}));assert(contrast.every(p=>p.ratio>=4.5),JSON.stringify(contrast.filter(p=>p.ratio<4.5)));
 assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 // Block storage and retain functioning locale in memory.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('blocked')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('blocked')}})});const bp=await blocked.newPage();await bp.goto('http://127.0.0.1:18770/leetcode/736/');await bp.click('[data-lang=zh]');assert((await bp.locator('h1').textContent()).includes('Lisp 语法解析'));await blocked.close();
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({kind:'author self-check',browser:browser.version(),host:process.platform,logs,contrast,minimumContrast:Math.min(...contrast.map(p=>p.ratio)),cssBytes,errors,limits:['Headless Linux Chromium; no physical device or native browser-menu zoom claim','CSS zoom 200% is recorded as CSS zoom','Independent review pending']},null,2));await browser.close();console.log('Browser checks passed; '+contrast.length+' rendered color pairs; CSS '+cssBytes+' bytes.');
})().catch(e=>{console.error(e);process.exit(1)});
