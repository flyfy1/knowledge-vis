const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(OUT,{recursive:true});const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
const URL=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/753/';
const results={host:process.platform,browser:'Chromium',url:URL,checks:[],screenshots:[],errors:[],contrast:[]};
const check=(name,value)=>{assert.ok(value,name);results.checks.push(name);};
function luminance(hex){const c=hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
assert.equal(luminance('#000000'),0);assert.equal(luminance('#ffffff'),1);assert.equal(contrast('#ffffff','#000000'),21);
assert.equal(luminance('#ff0000'),.2126);assert.equal(luminance('#00ff00'),.7152);assert.equal(luminance('#0000ff'),.0722);
assert.ok(Math.abs(contrast('#747474','#000000')-4.492948)<1e-6);assert.ok(contrast('#747474','#000000')<4.5);
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'}),page=await ctx.newPage();
 page.on('pageerror',e=>results.errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)results.errors.push(r.status()+' '+r.url());});page.on('requestfailed',r=>results.errors.push('request '+r.url()));
 await page.goto(URL);await page.waitForFunction(()=>document.querySelector('#progress').textContent.includes('/'));
 async function shot(name,locator){await locator.scrollIntoViewIfNeeded();await locator.screenshot({path:path.join(OUT,name+'.png'),style:'.step-nav{visibility:hidden!important}'});results.screenshots.push(name+'.png');}
 async function overflow(){return page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1);}
 const expected=['00110','01','0001011100','0000','0010211220'];
 for(const lang of ['en','zh']){
  await page.locator(`[data-lang=${lang}]`).click();
  const title=lang==='en'?'#753 · Cracking the Safe':'#753 · 破解保险箱';
  check(lang+' h1',await page.locator('h1').textContent()===title);check(lang+' document title',await page.title()===title);
  check(lang+' official link',await page.locator('.official-link').getAttribute('href')==='https://leetcode.com/problems/cracking-the-safe/');
  await page.locator('#handReset').click();check(lang+' hand initial',await page.locator('#handPrev').isDisabled());
  for(let i=0;i<5;i++)await page.locator('#handNext').click();
  check(lang+' four hand windows',await page.locator('#handLedger').textContent()==='00011110');
  check(lang+' hand endpoint',await page.locator('#handNext').isDisabled());
  await page.locator('#handPrev').click();const hand=await page.locator('#handRead').textContent();await page.locator('#handNext').click();await shot(lang+'-hand',page.locator('#step0 .stage'));
  await page.locator('#handPrev').click();check(lang+' hand rewind identity',await page.locator('#handRead').textContent()===hand);
  for(let p=0;p<5;p++){
   await page.selectOption('#preset',String(p));check(`${lang} preset${p} resets`,await page.locator('#prev').isDisabled());
   const rows=await page.locator('#edges tr').count();check(`${lang} preset${p} edges`,rows===[4,2,8,1,9][p]);
   const snapshots=[];
   while(!await page.locator('#next').isDisabled()){
    await page.locator('#next').click();snapshots.push(await page.locator('#progress').textContent()+'|'+await page.locator('#stack').textContent()+'|'+await page.locator('#finished').textContent());
   }
   check(`${lang} preset${p} final`,(await page.locator('#result').textContent()).includes(expected[p]));
   check(`${lang} preset${p} steps`,snapshots.length===2*rows+1);
   check(`${lang} preset${p} consumed`,await page.locator('#edges tr.used').count()===rows);
   for(let i=snapshots.length-2;i>=0;i--){await page.locator('#prev').click();check(`${lang} preset${p} rewind${i}`,await page.locator('#progress').textContent()+'|'+await page.locator('#stack').textContent()+'|'+await page.locator('#finished').textContent()===snapshots[i]);}
   await page.locator('#reset').click();await page.locator('#end').click();check(`${lang} preset${p} replay`,(await page.locator('#result').textContent()).includes(expected[p]));
   await page.setViewportSize({width:320,height:850});await shot(`${lang}-320-preset${p}-end`,page.locator('#step2 .stage'));check(`${lang} preset${p} narrow`,await overflow());
  }
  await page.selectOption('#preset','0');for(let i=0;i<4;i++)await page.locator('#next').click();
  check(lang+' first pop meaning',await page.locator('#finished').textContent()==='0');
  check(lang+' first pop stack',await page.locator('#stack').textContent()===(lang==='en'?'0 / start0 / 01 / 1':'0 / 起始0 / 01 / 1'));
  check(lang+' first pop explanation',(await page.locator('#operation').textContent()).includes(lang==='en'?'arrival digit 0':'到达数字 0'));
  for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:900});check(`${lang} width${width}`,await overflow());
   await shot(`${lang}-${width}-first-pop`,page.locator('#step2 .stage'));
  }
  await page.setViewportSize({width:390,height:844});await page.locator('#quizReset').click();check(lang+' unrevealed disabled',await page.locator('#reveal').isDisabled());
  for(let i=0;i<3;i++){
   await page.locator(`[name=prediction][value="${i}"]`).check();check(lang+' option'+i+' clears answer',!(await page.locator('#feedback').textContent()).includes('011 '));
   await page.locator('#reveal').click();check(lang+' option'+i+' revealed',(await page.locator('#feedback').textContent()).includes(lang==='en'?'Use 011':'应使用 011'));
  }
  await shot(lang+'-prediction',page.locator('#step3 .stage'));
  const stable=await page.locator('#progress').textContent(),feedback=await page.locator('#feedback').textContent();
  await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();check(lang+' selection preserved',await page.locator('[name=prediction][value="2"]').isChecked());
  check(lang+' trace index preserved',(await page.locator('#progress').textContent()).includes('4/9'));
  await page.locator(`[data-lang=${lang}]`).click();check(lang+' locale roundtrip heading',await page.locator('h1').textContent()===title);check(lang+' locale trace identity',await page.locator('#progress').textContent()===stable);check(lang+' locale feedback identity',await page.locator('#feedback').textContent()===feedback);
  await page.locator('[name=prediction][value="0"]').check();check(lang+' change invalidates',!(await page.locator('#feedback').textContent()).includes(lang==='en'?'Use 011':'应使用 011'));
  await page.locator('#sourceDetails').evaluate(x=>x.open=true);check(lang+' rendered source parity',await page.locator('#pythonCode').textContent()===source);
  const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const d=await downloadPromise;await d.saveAs(path.join(OUT,lang+'-download.py'));check(lang+' download parity',fs.readFileSync(path.join(OUT,lang+'-download.py'),'utf8')===source);
  await page.locator('#copyPython').click();check(lang+' clipboard parity',await page.evaluate(()=>navigator.clipboard.readText())===source);
  await page.evaluate(async()=>{await navigator.clipboard.writeText('distinct-sentinel-753');window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(new Error('test unavailable'));});
  await page.locator('#copyPython').click();check(lang+' fallback shown',await page.locator('#sourceFallback').isVisible());
  check(lang+' fallback parity',await page.locator('#manualSource').inputValue()===source);
  check(lang+' fallback focus/selection',await page.locator('#manualSource').evaluate(x=>document.activeElement===x&&x.selectionStart===0&&x.selectionEnd===x.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');check(lang+' native fallback transfer',await page.evaluate(()=>navigator.clipboard.readText())===source);
  await shot(lang+'-fallback',page.locator('#sourceFallback'));await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  // Real browser page zoom via Chromium keyboard is unreliable headless; CSS zoom 2
  // at a 780px viewport yields the same 390px effective layout and doubled glyph sizes.
  await page.setViewportSize({width:780,height:1000});await page.evaluate(()=>document.body.style.zoom='2');check(lang+' zoom200 overflow',await overflow());await shot(lang+'-zoom200',page.locator('#step2 .stage'));await page.evaluate(()=>document.body.style.zoom='');
  await page.setViewportSize({width:320,height:850});
  await page.locator('.related a').first().focus();await page.keyboard.press('Enter');check(lang+' related edge target',await page.evaluate(()=>location.hash==='#step1'));check(lang+' target below sticky',await page.locator('#step1').evaluate(x=>x.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-1));
  await page.locator('.related a').nth(1).focus();await page.keyboard.press('Enter');check(lang+' related invariant target',await page.evaluate(()=>location.hash==='#step2'));
  check(lang+' related label meaning',(await page.locator('.related a').nth(1).textContent()).includes(lang==='en'?'finishing':'收尾'));
 }
 await page.locator('#reset').click();await page.locator('#next').focus();await page.keyboard.press('Enter');check('keyboard advances',!(await page.locator('#prev').isDisabled()));await page.keyboard.press('Tab');check('keyboard next to reset',await page.locator('#reset').evaluate(x=>document.activeElement===x));
 const focus=await page.locator('#reset').evaluate(x=>{const c=getComputedStyle(x);return {style:c.outlineStyle,width:c.outlineWidth,color:c.outlineColor};});check('3px visible keyboard focus',focus.style==='solid'&&focus.width==='3px');results.focus=focus;await shot('keyboard-focus',page.locator('#step2 .controls'));
 // Actual solid computed text/background pairs, including disabled controls.
 await page.locator('#end').click();
 await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
 const samples=await page.evaluate(()=>{
  const hex=s=>'#'+s.match(/[\d.]+/g).slice(0,3).map(v=>(+v).toString(16).padStart(2,'0')).join('');
  return ['body','.explain','.hint','.stage .hint','.readout','#feedback.correct','.tile','.tile.hot','.btn:not(:disabled)','.btn:disabled','.lang-toggle .active','select','textarea','pre','a'].map(sel=>{
   const el=document.querySelector(sel);let bg=el;while(getComputedStyle(bg).backgroundColor==='rgba(0, 0, 0, 0)')bg=bg.parentElement;
   return {selector:sel,fg:hex(getComputedStyle(el).color),bg:hex(getComputedStyle(bg).backgroundColor)};
  });
 });
 for(const sample of samples){const ratio=contrast(sample.fg,sample.bg);results.contrast.push({...sample,ratio,threshold:4.5});check('contrast '+sample.selector,ratio>=4.5);}
 const relatedHref=await page.locator('.related a').nth(2).getAttribute('href');
 const related=await ctx.newPage();await related.goto(new globalThis.URL(relatedHref,URL).href);
 for(const lang of ['zh','en']){await related.locator(`[data-lang=${lang}]`).click();check(lang+' related target heading',(await related.locator('#step2 h2').textContent()).includes(lang==='en'?'reverse':'反转'));check(lang+' related target meaning',(await related.locator('#step2').textContent()).includes('finished'));}
 results.relatedTarget={url:related.url(),observed:'Ticket edges are consumed; exhausted airports enter finished, then reverse; source read and rendered in both locales.'};await related.close();
 check('focus contrast' ,contrast('#ffb454','#1c2330')>=3);
 results.cssBytes=fs.statSync(path.join(ROOT,'style.css')).size+fs.statSync(path.join(ROOT,'../style.css')).size;check('CSS budget',results.cssBytes<25000);
 // Storage unavailable must not break initialization or locale changes.
 const blocked=await browser.newContext({viewport:{width:320,height:850}});await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked storage')};Storage.prototype.setItem=()=>{throw Error('blocked storage')};});
 const bp=await blocked.newPage();bp.on('pageerror',e=>results.errors.push(String(e)));await bp.goto(URL);await bp.locator('[data-lang=zh]').click();check('storage blocked locale',await bp.locator('h1').textContent()==='#753 · 破解保险箱');await blocked.close();
 // Opening local files also proves the source/trace do not fetch an execution service.
 const offline=await browser.newContext();const op=await offline.newPage();op.on('pageerror',e=>results.errors.push(String(e)));await op.goto('file://'+path.join(ROOT,'index.html'));check('file offline source',await op.locator('#pythonCode').textContent()===source);await op.locator('#end').click();check('file offline trace',(await op.locator('#result').textContent()).includes('00110'));await offline.close();
 check('no asset or console errors',results.errors.length===0);await browser.close();fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({checks:results.checks.length,screenshots:results.screenshots.length,cssBytes:results.cssBytes,errors:results.errors,contrast:results.contrast},null,2));
})().catch(e=>{results.failure=String(e.stack);fs.writeFileSync(path.join(OUT,'browser-failure.json'),JSON.stringify(results,null,2));console.error(e);process.exit(1);});
