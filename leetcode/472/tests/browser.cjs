const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');const results={kind:'author browser self-check',locales:[],screenshots:[],semantic:[],errors:[],contrast:[]};
function luminance(rgb){return rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({acceptDownloads:true});await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:'http://127.0.0.1:18770'});const page=await context.newPage();
 const requests=[];page.on('request',r=>requests.push(r.url()));
 page.on('pageerror',e=>results.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)results.errors.push(r.status()+' '+r.url());});
 await page.goto('http://127.0.0.1:18770/leetcode/472/');await page.locator('#event').waitFor();
 assert.equal(await page.locator('#pythonCode').textContent(),source);
 assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);results.nativeClipboard=true;
 // Parse copy.js as syntax and catch duplicate keys before JavaScript can overwrite.
 const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');const keys=[...copy.matchAll(/(?:^|[\n,])\s*(\w+)\s*:\s*\[/g)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size);
 const sandbox={window:{}};vm.runInNewContext(copy,sandbox);Object.values(sandbox.window.LESSON_COPY).forEach(pair=>assert.equal(pair.length,2));
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);results.locales.push(lang);
  for(let p=0;p<6;p++){
   await page.selectOption('#preset',String(p));assert.ok(await page.locator('#prev').isDisabled());
   const first=await page.locator('#ledger').textContent();await page.click('#next');const second=await page.locator('#ledger').textContent();
   await page.click('#prev');assert.equal(await page.locator('#ledger').textContent(),first);await page.click('#next');assert.equal(await page.locator('#ledger').textContent(),second);
   if(await page.locator('#end').isEnabled())await page.click('#end');assert.ok(await page.locator('#next').isDisabled());assert.ok(await page.locator('#end').isDisabled());assert.ok(await page.locator('#final').isVisible());
   assert.match(await page.locator('#final').textContent(),[0,1,3].includes(p)?/T/:/F/);
   await page.click('#reset');assert.equal(await page.locator('#ledger').textContent(),first);assert.equal(await page.locator('#historyBody tr').count(),0);
  }
  // Every attempted transition gets localized algorithm feedback in both languages.
  await page.selectOption('#preset','4');const max=Number(await page.locator('#position').getAttribute('max'));const meanings={};
  for(let i=1;i<=max;i++){
   await page.locator('#position').fill(String(i));const state=await page.evaluate(()=>({reason:frames[index].event.reason,index}));
   const text=await page.locator('#event').textContent();assert.ok(text.includes(lang==='en'?'Target':'目标'));meanings[state.reason]=text;
  }
  assert.deepEqual(Object.keys(meanings).sort(),['absent','self','unreachable','witness']);results.semantic.push({lang,meanings});
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();assert.ok(await page.locator('#feedback').isHidden());await page.click('#reveal');
   assert.ok(await page.locator('#feedback').isVisible());const answer=await page.locator('#feedback').textContent();assert.ok(answer.includes(lang==='en'?'j=1 is valid':'j=1 合法'));
   assert.ok(answer.startsWith(i===1?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'That cut':'这个切点')));
  }
  const position=await page.locator('#position').inputValue();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.equal(await page.locator('#position').inputValue(),position);assert.ok(await page.locator('[name=prediction][value="2"]').isChecked());assert.ok(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);
  await page.locator('[name=prediction][value="1"]').check();assert.ok(await page.locator('#feedback').isHidden());
  // Force a successful clipboard and a rejection separately, checking exact copied bytes.
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async s=>{window.copiedSource=s;}}}));await page.click('#copy');assert.equal(await page.evaluate(()=>window.copiedSource),source);assert.ok(await page.locator('#manualCopy').isHidden());
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('denied');}}}));await page.click('#copy');assert.ok(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);assert.equal(await page.evaluate(()=>document.activeElement.id),'copyText');
  assert.match(await page.locator('#copyStatus').textContent(),lang==='en'?/Clipboard unavailable/:/剪贴板不可用/);
  await page.locator('#sourceDetails').evaluate(e=>e.open=true);await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert.ok(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.click(`[data-lang=${lang}]`);
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});await page.selectOption('#preset','1');await page.click('#end');
   await page.locator('#step2').scrollIntoViewIfNeeded();await page.waitForTimeout(80);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} overflow ${width}`);
   const shot=`trace-${lang}-${width}.png`;await page.locator('#step2').screenshot({path:path.join(out,shot)});results.screenshots.push(shot);
  }
  // 200% browser-equivalent CSS zoom, viewport shrinks to 720 CSS px of content.
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#step2').scrollIntoViewIfNeeded();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`zoom-${lang}.png`)});await page.evaluate(()=>document.body.style.zoom='');
  await page.setViewportSize({width:390,height:900});await page.locator('a[href="#step0"]').click();await page.waitForTimeout(1000);await page.locator('a[href="#step2"]').click();await page.waitForTimeout(1200);
  const rect=await page.locator('#step2 h2').boundingBox(),nav=await page.locator('nav').boundingBox();assert.ok(rect.y>=nav.height,JSON.stringify({rect,nav}));
 }
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 // Keyboard focus, tab and real Enter activation.
 await page.locator('#reset').focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#prev').isDisabled());await page.locator('#next').focus();const initial=await page.locator('#position').inputValue();await page.keyboard.press('Enter');assert.notEqual(await page.locator('#position').inputValue(),initial);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');
 const focus=await page.locator('#reset').evaluate(e=>({style:getComputedStyle(e).outlineStyle,width:getComputedStyle(e).outlineWidth}));assert.equal(focus.style,'solid');assert.equal(focus.width,'3px');
 // Measure actual CSS token and rendered control colors; include disabled and focus.
 const colors=await page.evaluate(()=>{
  const root=getComputedStyle(document.documentElement),keys=['--bg','--panel','--panel2','--text','--muted','--accent','--accent2'];return Object.fromEntries(keys.map(k=>[k,root.getPropertyValue(k).trim()]));
 });const rgb=h=>h.match(/\w\w/g).map(x=>parseInt(x,16));
 for(const [fg,bg,minimum] of [['--text','--panel',7],['--muted','--panel2',4.5],['--accent','--panel2',4.5],['--accent2','--panel2',3],['--bg','--accent',7]]){const ratio=contrast(rgb(colors[fg]),rgb(colors[bg]));assert.ok(ratio>=minimum);results.contrast.push({fg,bg,ratio,minimum});}
 await page.click('#reset');assert.ok(await page.locator('#prev').isDisabled());const disabled=await page.locator('#prev').evaluate(e=>{const s=getComputedStyle(e);return {color:s.color,background:s.backgroundColor,opacity:s.opacity};});assert.equal(disabled.opacity,'1');results.disabled=disabled;
 const sizes=await page.locator('button,select,summary').evaluateAll(es=>es.map(e=>({id:e.id,height:e.getBoundingClientRect().height})));assert.ok(sizes.every(s=>s.height>=48));results.controlHeights=sizes;
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 // Block storage before app initializes; locales and trace must still work.
 const blocked=await context.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});await blocked.goto('http://127.0.0.1:18770/leetcode/472/');await blocked.click('[data-lang=zh]');await blocked.click('#next');assert.match(await blocked.locator('#event').textContent(),/目标/);await blocked.close();
 // Check local anchors and all related target IDs over the actual preview.
 for(const href of await page.locator('a[href*="#"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')))){
  const u=new URL(href,page.url());const response=await context.request.get(u.href.split('#')[0]);assert.ok(response.ok());assert.ok((await response.text()).includes(`id="${u.hash.slice(1)}"`),href);
 }
 results.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert.ok(results.cssBytes<25000);assert.deepEqual(results.errors,[]);assert.ok(requests.every(u=>u.startsWith('http://127.0.0.1:18770/')||u.startsWith('data:')));results.localAssetRequests=requests;
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();console.log(JSON.stringify({passed:true,...results},null,2));
})().catch(e=>{console.error(e);process.exit(1);});
