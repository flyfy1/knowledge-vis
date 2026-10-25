const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const root=path.resolve(__dirname,'..'),out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));
fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8'),oracle=JSON.parse(fs.readFileSync(path.join(out,'oracle-rows.json')));
const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
function luminance(c){return c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
assert.strictEqual(ratio([0,0,0],[255,255,255]),21);
assert.strictEqual(luminance([255,0,0]),.2126);assert.strictEqual(luminance([0,255,0]),.7152);assert.strictEqual(luminance([0,0,255]),.0722);
assert(Math.abs(ratio([116,116,116],[0,0,0])-4.492948)<.000001);
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{requests.push(r.url());if(r.status()>=400)errors.push(r.status()+' '+r.url())});
await page.goto('http://127.0.0.1:18785/leetcode/903/');await page.locator('#progress').waitFor();
const results={host:os.platform(),browser:browser.version(),presets:[],layouts:[],clipboard:[],links:[],contrast:[]};
for(const lang of ['zh','en']){
 await page.click(`[data-lang=${lang}]`);
 assert.strictEqual(await page.locator('h1').textContent(),lang==='zh'?'#903 · DI 序列的有效排列':'#903 · Valid Permutations for DI Sequence');
 assert.strictEqual(await page.title(),await page.locator('h1').textContent());
 assert((await page.locator('[data-i18n=formula]').textContent()).includes('j ≤ k < m'));
 for(const s of ['DI','DID','I','D','IIII','DDDD','IDID']){
  await page.selectOption('#preset',s);assert(await page.locator('#prev').isDisabled());
  const count=(s.length*(s.length+3))/2;
  for(let k=0;k<count;k++){
   await page.click('#next');
   let i=1,j=k;while(j>i){j-=i+1;i++;}
   const visible=await page.locator('#counts tbody tr').nth(i).locator('td').nth(j).textContent();
   assert.strictEqual(visible,'→ '+oracle[s.slice(0,i)][j]);
   const expectedSources=oracle[s.slice(0,i-1)].map((_,rank)=>rank).filter(rank=>s[i-1]==='I'?rank<j:rank>=j);
   const sourceLabels=await page.locator('#counts tbody tr').nth(i-1).locator('td').allTextContents();
   assert.deepStrictEqual(sourceLabels.map((value,rank)=>value.startsWith('* ')?rank:-1).filter(rank=>rank>=0),expectedSources);
   const snapshot=await page.locator('#counts').innerHTML();
   await page.click('#prev');await page.click('#next');assert.strictEqual(await page.locator('#counts').innerHTML(),snapshot);
  }
  assert(await page.locator('#next').isDisabled());
  assert.strictEqual(await page.locator('#next').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(28, 35, 48)');
  const sum=oracle[s].reduce((a,b)=>a+b,0);assert((await page.locator('#answer').textContent()).includes(String(sum)));
  results.presets.push({lang,s,count,sum});
  await page.click('#reset');assert(await page.locator('#prev').isDisabled());assert((await page.locator('#sum').textContent()).includes('[0]'));
 }
 await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes('0 + 1 = 1'));
 await page.locator('[name=prediction][value="2"]').check();assert(await page.locator('#feedback').isHidden());await page.click('#reveal');assert((await page.locator('#feedback').textContent()).includes('0 + 1 = 1'));
 await page.locator('[name=prediction][value="1"]').check();assert(await page.locator('#feedback').isHidden());await page.click('#reveal');
 await page.locator('#step3').screenshot({path:path.join(out,`${lang}-prediction.png`)});
 const feedback=await page.locator('#feedback').textContent();assert(feedback.startsWith(lang==='zh'?'正确。':'Correct.'));
 await page.selectOption('#preset','DID');for(let k=0;k<5;k++)await page.click('#next');
 const snapshot=await page.locator('#counts').innerHTML();
 await page.click(`[data-lang=${lang==='zh'?'en':'zh'}]`);await page.click(`[data-lang=${lang}]`);assert.strictEqual(await page.locator('#counts').innerHTML(),snapshot);assert.strictEqual(await page.locator('#feedback').textContent(),feedback);
 for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:900});await page.locator('#step2').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  for(const el of await page.locator('button,select,.prediction-options label').all()){if(await el.isVisible()){const box=await el.boundingBox();assert(box.width>=48&&box.height>=48,'control target '+JSON.stringify(box));}}
  await page.screenshot({path:path.join(out,`${lang}-${width}-trace.png`)});
  await page.locator('#counts').screenshot({path:path.join(out,`${lang}-${width}-table.png`)});
  assert(await page.locator('#counts').evaluate(el=>el.scrollWidth<=el.parentElement.clientWidth+2));
  if(width===320){
   const header=await page.locator('h1').textContent();
   await page.click(`[data-lang=${lang==='zh'?'en':'zh'}]`);await page.click(`[data-lang=${lang}]`);assert.strictEqual(await page.locator('h1').textContent(),header);
  }
  const originalPreset=await page.locator('#preset').inputValue();await page.selectOption('#preset','DDDD');
  const fit=await page.locator('#preset').evaluate(el=>{const cs=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=cs.font;return {width:el.clientWidth,text:c.measureText(el.selectedOptions[0].text).width,padding:parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),font:cs.fontFamily}});
  assert(fit.text+fit.padding+24<=fit.width);
  results.layouts.push({lang,width,overflow:false,select:fit});await page.selectOption('#preset',originalPreset);for(let k=0;k<5;k++)await page.click('#next');
 }
 await page.setViewportSize({width:1280,height:1000});await page.evaluate(()=>document.documentElement.style.zoom='2');await page.locator('#step2').scrollIntoViewIfNeeded();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,`${lang}-zoom200.png`)});await page.locator('#counts').screenshot({path:path.join(out,`${lang}-zoom200-table.png`)});await page.evaluate(()=>document.documentElement.style.zoom='');
 await page.locator('summary').click();assert.strictEqual(await page.locator('#pythonCode').textContent(),source);await page.locator('details').screenshot({path:path.join(out,`${lang}-source.png`)});
 await page.click('#copy');assert.strictEqual(await page.evaluate(()=>navigator.clipboard.readText()),source);
 // Each manual attempt gets a fresh verified non-source sentinel before automatic writes are disabled.
 const sentinel=`903-${lang}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.strictEqual(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
 await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('forced fallback'))}));
 await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());
 assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
 await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.strictEqual(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.screenshot({path:path.join(out,`${lang}-manual-copy.png`)});await page.evaluate(()=>delete navigator.clipboard.writeText);
 results.clipboard.push({lang,success:true,fallbackActualTransfer:true,sentinelVerified:true});
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);const dest=path.join(out,`download-${lang}.py`);await download.saveAs(dest);assert.strictEqual(fs.readFileSync(dest,'utf8'),source);
 await page.locator('summary').click();
}
// Internal deep links land below the sticky navigation and show the right active step.
for(const lang of ['zh','en']){
 await page.click(`[data-lang=${lang}]`);
 for(let i=0;i<5;i++){
  await page.click(`.step-nav a[href="#step${i}"]`);
  await page.waitForFunction(i=>document.querySelector(`.step-nav a[href="#step${i}"]`).classList.contains('active'),i);
  assert(await page.locator('#step'+i).evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom-2));
 }
}
// Keyboard-accessible table and narrow, densest endpoint.
for(const lang of ['zh','en']){
 await page.click(`[data-lang=${lang}]`);await page.setViewportSize({width:320,height:900});await page.selectOption('#preset','IDID');
 for(let k=0;k<14;k++)await page.click('#next');
 await page.locator('.table-wrap').focus();await page.keyboard.press('ArrowRight');assert.strictEqual(await page.locator('.table-wrap').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
 await page.locator('.stage').screenshot({path:path.join(out,`${lang}-320-dense-end.png`)});
 assert(await page.locator('#counts').evaluate(el=>el.scrollWidth<=el.parentElement.clientWidth+2));
}
// Native keyboard activation and focus styling.
await page.setViewportSize({width:390,height:900});await page.locator('#reset').focus();await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());
await page.keyboard.press('Shift+Tab');assert.strictEqual(await page.evaluate(()=>document.activeElement.id),'next');
const focus=await page.locator('#next').evaluate(el=>({outline:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth,style:getComputedStyle(el).outlineStyle}));assert.strictEqual(focus.width,'3px');
await page.screenshot({path:path.join(out,'keyboard-focus.png')});results.keyboard={focus,activation:true};
// Rendered solid color measurements; no opacity/gradient is used by these local states.
for(const selector of ['body','.explain','.hint','#next','#prev','.lang-toggle button.active','td.current']){
 const colors=await page.locator(selector).first().evaluate(el=>{let node=el,bg;while(node){const c=getComputedStyle(node).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'){bg=c;break;}node=node.parentElement;}return {fg:getComputedStyle(el).color,bg,opacity:getComputedStyle(el).opacity}});
 const value=ratio(rgb(colors.fg),rgb(colors.bg));assert(value>=4.5,selector+' '+value);results.contrast.push({selector,...colors,ratio:value});
}
assert(ratio(rgb(focus.outline),[28,35,48])>=3);
await page.emulateMedia({forcedColors:'active'});await page.screenshot({path:path.join(out,'forced-colors.png')});await page.emulateMedia({forcedColors:'none'});
// Follow each related link using keyboard and read the real destination section, both locales.
for(const lang of ['zh','en'])for(const id of ['115','327']){
 await page.goto('http://127.0.0.1:18785/leetcode/903/');await page.click(`[data-lang=${lang}]`);const link=page.locator(`.related a[href="../${id}/#step1"]`),label=await link.textContent();await link.focus();await page.keyboard.press('Enter');await page.waitForURL(`**/${id}/#step1`);await page.locator('#step1').waitFor();const text=await page.locator('#step1').textContent();assert(text.length>100);results.links.push({lang,label,url:page.url(),destinationText:text});
}
// Blocked storage must keep locale functional.
const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}})});const bp=await blocked.newPage();bp.on('pageerror',e=>errors.push(String(e)));await bp.goto('http://127.0.0.1:18785/leetcode/903/');await bp.click('[data-lang=zh]');assert((await bp.locator('h1').textContent()).includes('DI 序列'));await bp.click('[data-lang=en]');assert((await bp.locator('h1').textContent()).includes('Valid Permutations'));await blocked.close();
assert.deepStrictEqual(errors,[]);assert(requests.every(url=>url.startsWith('http://127.0.0.1:18785/')));
results.errors=errors;results.localRequestsOnly=true;results.cssBytes=fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size;assert(results.cssBytes<25000);
fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();console.log('PASS browser',results.layouts.length,'layouts',results.presets.length,'preset runs');
})().catch(e=>{console.error(e);process.exit(1)});
