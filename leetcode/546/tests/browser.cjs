// Run with NODE_PATH's installed Playwright; OUTPUT_DIR redirects artifacts.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const c=require('../core.js'),base=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18777/leetcode/546/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});page.on('request',r=>requests.push(r.url()));
 await page.goto(url);await page.waitForFunction(()=>document.getElementById('progress').textContent.includes('0/'));
 const source=fs.readFileSync(path.join(base,'solution.py'),'utf8');
 await context.grantPermissions(['clipboard-read','clipboard-write']);await page.click('#copy');await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);const observations=[];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.getAttribute('html','lang'),lang==='zh'?'zh-CN':'en');
  for(let preset=0;preset<c.presets.length;preset++)for(const mode of ['optimal','greedy']){
   await page.selectOption('#preset',String(preset));await page.selectOption('#mode',mode);const frames=c.trace(c.presets[preset],mode==='greedy');
   assert(await page.isDisabled('#prev'));
   for(let i=0;i<frames.length;i++){
    if(i)await page.click('#next');const f=frames[i],txt=await page.textContent('#progress');assert(txt.includes(`${i}/${frames.length-1}`));assert(txt.includes(lang==='en'?`total ${f.total} points`:`总分 ${f.total} 分`));
    const tiles=await page.locator('#tiles .tile').evaluateAll(els=>els.map(el=>[Number(el.querySelector('b').textContent),Number(el.querySelector('small').textContent.slice(1))]));assert.deepEqual(tiles,f.live.map(x=>[x.value,x.id]));
    if(i){const before=await page.textContent('#history');await page.click('#prev');await page.click('#next');assert.equal(await page.textContent('#history'),before);}
   }
   assert(await page.isDisabled('#next'));assert(await page.isDisabled('#end'));await page.click('#reset');assert((await page.textContent('#progress')).includes('0/'));await page.click('#end');assert((await page.textContent('#progress')).includes(`${frames.length-1}/${frames.length-1}`));
   observations.push({lang,preset,mode,final:frames.at(-1).total});
  }
  for(let k=0;k<=2;k++){
   await page.selectOption('#carry',String(k));assert(await page.isDisabled('#dpPrev'));assert((await page.textContent('#dpProgress')).includes('0/2'));
   await page.click('#dpNext');assert((await page.textContent('#dpProgress')).includes(`= ${[3,6,11][k]}`));await page.click('#dpNext');let txt=await page.textContent('#dpProgress');assert(txt.includes(`= ${[5,10,17][k]}`));assert.equal(await page.locator('#dpHistory li').count(),2);assert((await page.textContent('#dpHistory')).includes(`dp(0,0,${k+1})`));
   await page.click('#dpPrev');await page.click('#dpNext');assert.equal(await page.textContent('#dpProgress'),txt);await page.click('#dpReset');await page.click('#dpEnd');assert.equal(await page.textContent('#dpProgress'),txt);
  }
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),await page.evaluate(()=>COPY.formula[document.documentElement.lang==='en'?1:0]));
  for(let answer=0;answer<3;answer++){
   await page.check(`[name=prediction][value="${answer}"]`);assert(await page.isHidden('#feedback'));await page.click('#reveal');const txt=await page.textContent('#feedback');assert(txt.includes('13'));assert(txt.startsWith(lang==='en'?(answer===1?'Correct':'That choice'):(answer===1?'选择正确':'该选择不正确')));
  }
  await page.click('#sourceDetails summary');assert.equal(await page.textContent('#pythonCode'),source);
  // Controlled native clipboard adapter captures exact bytes passed on success.
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedSource=text;}}});});
  await page.click('#copy');await page.waitForFunction(()=>document.getElementById('copyStatus').textContent.length>0);assert.equal(await page.evaluate(()=>window.copiedSource),source);
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}});});await page.click('#copy');await page.waitForSelector('#manualCopy',{state:'visible'});assert.equal(await page.inputValue('#copyText'),source);assert((await page.textContent('#copyStatus')).startsWith(lang==='en'?'Clipboard unavailable':'剪贴板不可用'));
  assert(await page.evaluate(()=>{const e=document.getElementById('copyText');return document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length;}));
  await page.keyboard.press('Control+A');assert.equal(await page.evaluate(()=>{const e=document.getElementById('copyText');return e.value.slice(e.selectionStart,e.selectionEnd);}),source);
  const downloadPromise=page.waitForEvent('download');await page.click('a[download]');const download=await downloadPromise;const dest=path.join(out,`download-${lang}.py`);await download.saveAs(dest);assert.equal(fs.readFileSync(dest,'utf8'),source);
  await page.click('#sourceDetails summary');
 }
 // Locale preserves the entire active experiment, prediction, disclosure, and focus.
 await page.selectOption('#preset','1');await page.selectOption('#mode','optimal');await page.click('#next');await page.selectOption('#carry','2');await page.click('#dpNext');await page.check('[name=prediction][value="1"]');await page.click('#reveal');await page.click('#sourceDetails summary');
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);assert((await page.textContent('#progress')).includes('1/3'));assert((await page.textContent('#dpProgress')).includes('1/2'));assert(await page.isChecked('[name=prediction][value="1"]'));assert(await page.isVisible('#feedback'));assert(await page.getAttribute('#sourceDetails','open')!==null);assert.equal(await page.textContent('#pythonCode'),source);assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang);}
 // Answer changes invalidate feedback; unrelated experiment resets preserve quiz choice.
 await page.check('[name=prediction][value="0"]');assert(await page.isHidden('#feedback'));await page.click('#reset');assert(await page.isChecked('[name=prediction][value="0"]'));
 const screenshots=[];
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:1000});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','2');await page.selectOption('#mode','optimal');await page.click('#end');await page.selectOption('#carry','2');await page.click('#dpEnd');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const section of ['step1','step2']){await page.locator(`#${section} .stage`).evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY-100,behavior:'instant'}));const viewportName=`${lang}-${width}-${section}-viewport.png`;await page.screenshot({path:path.join(out,viewportName)});screenshots.push(viewportName);const name=`${lang}-${width}-${section}.png`;await page.locator(`#${section} .stage`).screenshot({path:path.join(out,name)});screenshots.push(name);}
 }
 await page.setViewportSize({width:320,height:1000});for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);await page.check('[name=prediction][value="1"]');await page.click('#reveal');assert((await page.locator('[data-i18n=option1]').textContent()).includes('dp(0,0,2)=9'));await page.locator('#step3').screenshot({path:path.join(out,`${lang}-quiz-320.png`)});screenshots.push(`${lang}-quiz-320.png`);}
 // Desktop 200% zoom equivalent: half CSS layout viewport on a 1440 physical-pixel surface.
 await page.setViewportSize({width:720,height:1000});await page.evaluate(()=>document.body.style.zoom='2');
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('#step2 .stage').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+window.scrollY-160,behavior:'instant'}));await page.screenshot({path:path.join(out,`${lang}-zoom200-viewport.png`)});screenshots.push(`${lang}-zoom200-viewport.png`);const name=`${lang}-zoom200.png`;await page.locator('#step2 .stage').screenshot({path:path.join(out,name)});screenshots.push(name);}
 await page.evaluate(()=>document.body.style.zoom='1');await page.setViewportSize({width:1440,height:1000});
 // Keyboard focus and deep link geometry; source region supports keyboard scrolling.
 await page.locator('#langToggle [data-lang=en]').focus();await page.keyboard.press('Tab');const active=await page.evaluate(()=>({tag:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outlineWidth}));assert.equal(active.tag,'A');assert.equal(active.outline,'3px');
 await page.locator('a[href="#step2"]').click();await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().y;return y>=60&&y<160;});const bounds=await page.locator('#step2').boundingBox();assert(bounds.y>=60&&bounds.y<160);
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#dpPrev').focus();assert.equal(await page.locator('#dpPrev').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none'});
 // All actual local links resolve, with existing deep anchors.
 for(const href of await page.locator('a').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  if(href.startsWith('http'))continue;const target=new URL(href,url);const response=await context.request.get(target.href);assert(response.ok(),href);if(target.hash){const html=await response.text();assert(html.includes(`id="${target.hash.slice(1)}"`),href);}
 }
 // Measured shared-token contrast and actual disabled/normal text pairs.
 await page.selectOption('#preset','0');await page.selectOption('#mode','optimal');assert(await page.isDisabled('#reset'));await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.textContent('#progress')).includes('1/2'));await page.locator('#prev').focus();await page.keyboard.press('Space');assert((await page.textContent('#progress')).includes('0/2'));
 const colors=await page.evaluate(()=>{const props=['--bg','--panel','--panel2','--text','--muted','--accent','--accent2','--good','--bad'];return Object.fromEntries(props.map(p=>[p,getComputedStyle(document.documentElement).getPropertyValue(p).trim()]));});
 const luminance=hex=>{const s=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return s[0]*.2126+s[1]*.7152+s[2]*.0722;};
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
 const ratios=[];for(const fg of ['--text','--muted','--accent','--accent2'])for(const bg of ['--bg','--panel','--panel2']){const ratio=contrast(colors[fg],colors[bg]);assert(ratio>=4.5);ratios.push({fg,bg,ratio:+ratio.toFixed(2)});}
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('storage blocked');}});});const p=await blocked.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(url);await p.click('[data-lang=zh]');await p.click('#next');await p.click('[data-lang=en]');assert((await p.textContent('#progress')).includes('1/2'));assert.equal(await p.textContent('#pythonCode'),source);await blocked.close();
 assert.deepEqual(errors,[]);assert(requests.every(r=>r.startsWith(new URL(url).origin)||r.startsWith('data:')));
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({passed:true,scope:'author browser self-check',observations,screenshots,contrast:ratios,focus:active,deepLinkY:bounds.y,errors,allRequestsLocal:true,clipboard:'native Chromium clipboard write/read exact; adapter payload exact; rejection fallback selection verified',zoom:'body zoom 2 on 720 CSS px viewport (stricter than half-width desktop layout)'},null,2));await browser.close();console.log('Browser checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
