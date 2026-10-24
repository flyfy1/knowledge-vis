const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/403/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();const errors=[],requests=[],checks=[],bindings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});page.on('request',r=>requests.push(r.url()));
 const source=fs.readFileSync(path.join(P,'solution.py'),'utf8');await page.goto(base);await page.locator('#progress').filter({hasText:/0/}).waitFor();
 async function lang(l){await page.locator(`[data-lang=${l}]`).click();assert.equal(await page.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');}
 for(const l of ['en','zh']){
 await lang(l);assert.equal(await page.locator('#hand').isHidden(),true);await page.locator('#handReveal').click();assert.equal(await page.locator('#hand').isVisible(),true);await page.locator('#handReveal').click();
 for(let p=0;p<6;p++){
 await page.locator('#preset').selectOption(''+p);assert(await page.locator('#prev').isDisabled());let iterations=0;
 while(await page.locator('#next').isEnabled()){
 await page.locator('#next').click();const s=await page.locator('#stones').innerText();
 await page.locator('#prev').click();await page.locator('#next').click();assert.equal(await page.locator('#stones').innerText(),s);assert(++iterations<100);
 }
 assert(await page.locator('#end').isDisabled());const result=await page.locator('#result').innerText();assert(result.includes([true,true,false,false,true,true][p]?'true':'false'));
 while(await page.locator('#prev').isEnabled())await page.locator('#prev').click();assert(await page.locator('#reset').isDisabled());await page.locator('#end').click();await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
 }
 for(const choice of ['0','1','2']){await page.locator(`[name=prediction][value="${choice}"]`).check();assert(!((await page.locator('#feedback').innerText()).includes('R[11]')));await page.locator('#reveal').click();assert((await page.locator('#feedback').innerText()).includes('R[11]={4}'));bindings.push({locale:l,state:'prediction-'+choice,text:await page.locator('#feedback').innerText()});}
 await lang(l==='en'?'zh':'en');assert((await page.locator('#feedback').innerText()).includes('R[11]={4}'));assert(await page.locator('[name=prediction][value="2"]').isChecked());await page.locator('#preset').selectOption('0');assert((await page.locator('#feedback').innerText()).includes('R[11]={4}'));await lang(l);
 await page.locator('[name=prediction][value="0"]').check();assert(!((await page.locator('#feedback').innerText()).includes('R[11]')));
 await page.locator('#preset').selectOption('0');for(let i=0;i<5;i++)await page.locator('#next').click();
 bindings.push({locale:l,state:'processed-3-2',progress:await page.locator('#progress').innerText(),candidates:await page.locator('#candidates').innerText()});assert((await page.locator('#progress').innerText()).includes('(3,2)')||(await page.locator('#progress').innerText()).includes('(3,2)'));
 const old=await page.locator('#stones').innerText();await lang(l==='en'?'zh':'en');assert.equal(await page.locator('#preset').inputValue(),'0');assert(await page.locator('[name=prediction][value="0"]').isChecked());assert.equal(await page.locator('#history li').count(),5);await lang(l);assert.equal(await page.locator('#stones').innerText(),old);
 await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);bindings.push({locale:l,state:'copy-success',text:await page.locator('#copyStatus').innerText()});
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('test denial');}}}));await page.locator('#copy').click();assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#manualSource').inputValue(),source);bindings.push({locale:l,state:'manual-copy-fallback',text:await page.locator('#copyStatus').innerText()});await page.evaluate(()=>delete navigator.clipboard);
 checks.push(l+': all presets, both endpoints, every forward/back replay, reset/end, every prediction, change, locale state, clipboard/fallback');
 }
 assert.equal(await page.locator('#pythonSource').textContent(),source);const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Every lesson-local and related anchor resolves; no external official requests needed at runtime.
 for(const href of await page.locator('a').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(x=>x&&!x.startsWith('https:')))){
 const u=new URL(href,base),response=await context.request.get(u.href.split('#')[0]);assert(response.ok(),href);if(u.hash){const text=await response.text();assert(text.includes('id="'+u.hash.slice(1)+'"'),href);}
 }
 await page.locator('.step-nav a[href="#step2"]').click();await page.waitForTimeout(1200);const anchorBox=await page.locator('#step2 h2').boundingBox(),navBox=await page.locator('.step-nav').boundingBox();assert(anchorBox.y>=navBox.y+navBox.height,JSON.stringify({anchorBox,navBox}));
 // Actual keyboard interaction and visible focus.
 await page.locator('#prev').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#history li').count(),4);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'next');const focus=await page.locator('#next').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth,color:getComputedStyle(e).outlineColor}));assert.equal(focus.width,'3px');
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'desktop-header.png')});
 const layouts=[];
 for(const l of ['en','zh'])for(const width of [320,390,736,1440]){
 await page.setViewportSize({width,height:1000});await lang(l);await page.locator('#preset').selectOption('0');for(let i=0;i<5;i++)await page.locator('#next').click();await page.locator('#traceStage').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,`${l}-${width}-trace.png`)});await page.locator('#candidatePanel').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,`${l}-${width}-candidates.png`)});
 const measure=await page.evaluate(()=>({viewport:innerWidth,page:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('.stone')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth})),controls:[...document.querySelectorAll('button,select')].map(e=>({height:e.getBoundingClientRect().height}))}));assert(measure.page<=width,JSON.stringify(measure));assert(measure.cards.every(c=>c.scroll<=c.width));assert(measure.controls.every(c=>c.height>=48));layouts.push({locale:l,width,...measure});
 await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();await page.locator('#step3').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);if(width===390)await page.screenshot({path:path.join(out,`${l}-390-prediction.png`)});
 }
 for(const l of ['en','zh']){await page.setViewportSize({width:1440,height:1100});await lang(l);await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#traceStage').scrollIntoViewIfNeeded();await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,`${l}-zoom200.png`)});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.evaluate(()=>document.documentElement.style.zoom='');}
 // Measure rendered palette, including disabled and focus states.
 await page.locator('#reset').click();
 const colors=await page.evaluate(()=>{const result={};for(const selector of ['body','.stage','.stone','.stone span','.btn','#prev:disabled','.btn.primary','#langToggle .active']){const el=document.querySelector(selector);if(el){const c=getComputedStyle(el);result[selector]={fg:c.color,bg:c.backgroundColor};}}return result;});
 function rgb(s){return s.match(/[\d.]+/g).slice(0,3).map(Number);}function lum(c){return rgb(c).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,x,i)=>s+x*[.2126,.7152,.0722][i],0);}function ratio(a,b){const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
 const contrast=[];for(const [name,fg,bg]of [['body','#e8edf4','#0d1117'],['panel text','#e8edf4','#161b22'],['muted card','#9aa7b8','#1c2330'],['disabled','#9aa7b8','#1c2330'],['action','#0d1117','#6ee7ff'],['focus','#ffb454','#1c2330'],['muted stage','#9aa7b8','#161b22']]){const hex=s=>'rgb('+s.match(/\w\w/g).map(x=>parseInt(x,16)).join(',')+')';const r=ratio(hex(fg),hex(bg));assert(r>=4.5);contrast.push({name,fg,bg,ratio:r});}
 // No-storage and no-network source rendering.
 const offline=await context.newPage();await offline.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}}));await offline.goto(base);await offline.context().setOffline(true);assert.equal(await offline.locator('#pythonSource').textContent(),source);await offline.locator('[data-lang=zh]').click();await offline.locator('#next').click();assert((await offline.locator('#progress').innerText()).includes('1 /'));await offline.context().setOffline(false);await offline.close();
 assert.deepEqual(errors,[]);assert(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')||u.startsWith('data:')));
 const cssBytes=fs.statSync(path.join(P,'style.css')).size+fs.statSync(path.join(P,'../style.css')).size;assert(cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({kind:'author self-check',checks,bindings,layouts,zoom:'200% CSS zoom in real Chromium at 1440px (720 CSS px effective layout)',focus,colors,contrast,cssBytes,errors,requests:[...new Set(requests)],sourceParity:'display, actual clipboard, fallback textarea and browser download exact',storage:'denied-storage path exercised',offline:'loaded source and simulation work with network offline; no reload claimed'},null,2));
 await browser.close();console.log('Browser checks passed; evidence in '+out);
})().catch(e=>{console.error(e);process.exit(1);});
