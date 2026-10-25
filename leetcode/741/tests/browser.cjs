'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const core=require('../core.js'),source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),logs=[],errors=[];
function oracle(g,t,r1,r2){const paths=[];function walk(r,c,p){if(r>=g.length||c>=g.length||g[r][c]===-1)return;p=p.concat([[r,c]]);if(r+c===t){paths.push(p);return;}walk(r+1,c,p);walk(r,c+1,p);}walk(0,0,[]);let best=null;for(const a of paths.filter(p=>p.at(-1)[0]===r1))for(const b of paths.filter(p=>p.at(-1)[0]===r2)){const u=new Set([...a,...b].map(x=>x.join(',')));const v=[...u].reduce((s,x)=>{const [r,c]=x.split(',').map(Number);return s+g[r][c]},0);best=best===null?v:Math.max(best,v);}return best;}
function lum(rgb){return rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
assert.equal(ratio([0,0,0],[255,255,255]),21);
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();await page.emulateMedia({reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});page.on('requestfailed',r=>errors.push(r.url()));
 const external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18770/'))external.push(r.url())});
 await page.goto('http://127.0.0.1:18770/leetcode/741/');await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 const expected=[4,5,0,5,1,0,9];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='en'?'#741 · Cherry Pickup':'#741 · 摘樱桃');
  for(const route of ['same','split']){await page.selectOption('#handRoute',route);assert((await page.locator('#handResult').textContent()).includes(route==='same'?'3':'4'));const cells=await page.locator('#handBoard .visited').count();assert.equal(cells,route==='same'?3:4);}
  assert((await page.locator('[data-i18n=formula]').textContent()).includes('Dₜ₋₁[p1,p2] + gain'));
  let stateCount=0;
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());const g=core.presets[p],n=g.length;
   for(let t=0;t<2*n-1;t++){
    for(let r1=0;r1<n;r1++)for(let r2=0;r2<n;r2++){
     const button=page.locator(`[data-state="${r1},${r2}"]`);await button.click();const v=oracle(g,t,r1,r2),value=v===null?'−∞':String(v);
     assert.equal(await button.textContent(),value);assert.equal(await button.getAttribute('aria-pressed'),'true');
     assert((await page.locator('#selected').textContent()).includes(`D=${value}`));
     const union=await page.locator('#board .visited b').allTextContents();assert.equal(union.reduce((s,x)=>s+Number(x),0),v??0);
     if(v!==null&&t>0)assert((await page.locator('#event').textContent()).includes(`=${v}`));
     stateCount++;
    }
    if(t<2*n-2){const snapshot=await page.locator('#step2 .stage').textContent();await page.click('#next');await page.click('#prev');assert.equal(await page.locator('#step2 .stage').textContent(),snapshot);await page.click('#next');}
   }
   assert((await page.locator('#output').textContent()).includes(String(expected[p])));assert(await page.locator('#next').isDisabled());
   if(n>1)await page.click('#reset');else assert(await page.locator('#reset').isDisabled());
   assert(await page.locator('#prev').isDisabled());if(n>1)await page.click('#end');else assert(await page.locator('#end').isDisabled());assert((await page.locator('#output').textContent()).includes(String(expected[p])));
  }
  for(const answer of ['0','1','2']){
   await page.check(`input[name=prediction][value="${answer}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');const text=await page.locator('#feedback').textContent();assert(text.includes(lang==='en'?'obtain 4':'得到 4'));assert(text.startsWith(answer==='1'?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Recheck':'再检查')));
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`input[value="${answer}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);
  }
  await page.locator('#sourceDetails summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);await page.locator('#sourceDetails summary').click();
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('clipboard-sentinel-741');Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(Error('forced manual test'))})});
  await page.click('#copy');await page.waitForFunction(()=>!document.querySelector('#manualCopy').hidden);assert.equal(await page.locator('#copyText').inputValue(),source);
  assert(await page.evaluate(()=>document.activeElement.id==='copyText'&&document.activeElement.selectionStart===0&&document.activeElement.selectionEnd===document.activeElement.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);await page.evaluate(()=>delete navigator.clipboard.writeText);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
  await page.selectOption('#preset','6');for(let i=0;i<3;i++)await page.click('#next');await page.locator('[data-state="1,2"]').click();
  const before=await page.locator('#step2 .stage').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang==='en'?'zh':'en');
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#step2 .stage').textContent(),before);assert.equal(await page.locator('[data-state="1,2"]').getAttribute('aria-pressed'),'true');
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('#board').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const geometry=await page.locator('#board .cell').evaluateAll(els=>els.map(e=>({w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(Math.max(...geometry.map(e=>e.w))-Math.min(...geometry.map(e=>e.w))<1);assert(geometry.every(e=>e.w>=46));
   await page.screenshot({path:path.join(out,`${lang}-${width}-board.png`)});await page.locator('#predBody').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-dependencies.png`)});
  }
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#board').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.waitForTimeout(100);assert.equal(await page.locator('#stepNav a.active').getAttribute('href'),'#step2');await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.evaluate(()=>document.body.style.zoom='');
  await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).includes('4 / 6'));
  const focus=await page.locator('#next').evaluate(el=>({color:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth}));assert.equal(focus.width,'3px');
  await page.locator('[data-state="1,2"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-state="1,2"]').getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>document.activeElement.dataset.state),'1,2');
  for(const anchor of await page.locator('a[href^="#step"]').all()){await anchor.click();const hash=await anchor.getAttribute('href');assert.equal(await page.locator(hash).count(),1);assert((await page.locator(hash).boundingBox()).y>=0);}
  logs.push({lang,stateCount,presets:7,predictionOptions:3,copy:'automatic and native-key manual fallback exact',download:'exact bytes',widths:[320,390,736,1440],zoom:'CSS 200% at 780 viewport (390 effective)',focus});
 }
 await page.selectOption('#preset','4');
 const pairs=await page.evaluate(()=>{
  const parse=s=>(s.match(/[\d.]+/g)||[]).map(Number);
  function bg(el){let p=el,layers=[];while(p){const a=parse(getComputedStyle(p).backgroundColor);if(a.length>=3){layers.push(a);if(a.length===3||a[3]===1)break;}p=p.parentElement;}let rgb=[13,17,23];for(const l of layers.reverse()){const a=l[3]??1;rgb=l.slice(0,3).map((x,i)=>x*a+rgb[i]*(1-a))}return rgb;}
  return [...document.querySelectorAll('body *')].filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&getComputedStyle(el).visibility!=='hidden').map(el=>({tag:el.tagName,fg:parse(getComputedStyle(el).color).slice(0,3),bg:bg(el),text:el.textContent.slice(0,70)}));
 });const contrast=pairs.map(p=>({...p,ratio:ratio(p.fg,p.bg)}));assert(contrast.every(p=>p.ratio>=4.5),JSON.stringify(contrast.filter(p=>p.ratio<4.5)));
 assert(ratio([255,180,84],[28,35,48])>=3);assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
 // Confirm same-origin related deep links exist, without navigating the lesson away.
 for(const href of await page.locator('.related a, a[data-i18n=dpLink]').evaluateAll(els=>els.map(e=>e.href))){const [url,hash]=href.split('#');const response=await context.request.get(url);assert.equal(response.status(),200);assert((await response.text()).includes(`id="${hash}"`));}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('blocked')}});Object.defineProperty(Storage.prototype,'setItem',{value(){throw Error('blocked')}})});const bp=await blocked.newPage();await bp.goto('http://127.0.0.1:18770/leetcode/741/');await bp.click('[data-lang=zh]');assert((await bp.locator('h1').textContent()).includes('摘樱桃'));await blocked.close();
 // Offline local opening still has source, copy dictionary and data.
 const offline=await browser.newContext();const op=await offline.newPage();await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonCode').textContent(),source);await op.click('[data-lang=en]');assert((await op.locator('#progress').textContent()).includes('0 / 2'));await offline.close();
 await page.emulateMedia({forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 const cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(cssBytes<25000);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({kind:'author self-check',browser:browser.version(),host:process.platform,logs,contrast,minimumContrast:Math.min(...contrast.map(p=>p.ratio)),focusContrast:ratio([255,180,84],[28,35,48]),cssBytes,errors,external,limits:['Headless Linux Chromium; no physical device claim','200% is CSS zoom, not native browser-menu zoom','Independent review and novice teach-back pending']},null,2));await browser.close();console.log('Browser checks passed; '+contrast.length+' rendered color pairs; CSS '+cssBytes+' bytes.');
})().catch(e=>{console.error(e);process.exit(1)});
