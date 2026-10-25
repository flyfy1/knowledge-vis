// OUTPUT_DIR changes evidence destination without editing the candidate.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const vm=require('vm'),sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),sandbox);for(const pair of Object.values(sandbox.window.ATOM_COPY))assert(Array.isArray(pair)&&pair.length===2&&pair.every(v=>typeof v==='string'&&v.length));
const pairs=[];const ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
for(const stmt of ast.body){const expr=stmt.expression;if(expr?.right?.type==='ObjectExpression'){const keys=expr.right.properties.map(p=>p.key.name||p.key.value);assert.equal(new Set(keys).size,keys.length,'duplicate localization key');pairs.push(...keys);}}
function contrast(a,b){function L(h){let x=h.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return x[0]*.2126+x[1]*.7152+x[2]*.0722;}let x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const page=await context.newPage();let errors=[],bad=[],external=[];let evidence=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('response',r=>{if(r.status()>=400)bad.push([r.url(),r.status()]);});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:18784/')&&!r.url().startsWith('data:'))external.push(r.url());});
 await page.goto('http://127.0.0.1:18784/leetcode/726/');await page.locator('#progress').filter({hasText:'0/'}).waitFor();
 const expected=['H2MgO2','H2O','K4N2O14S4','He','H7O5','Be12H2','H7O3'];
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  for(let p=0;p<7;p++){
   await page.selectOption('#preset',String(p));assert(await page.locator('#prev').isDisabled());
   let states=[];
   while(!(await page.locator('#next').isDisabled())){
    const old=await page.locator('#afterMaps').textContent();await page.click('#next');let next=await page.locator('#afterMaps').textContent();states.push(next);
    await page.click('#prev');assert.equal(await page.locator('#afterMaps').textContent(),old);await page.click('#next');assert.equal(await page.locator('#afterMaps').textContent(),next);
   }
   assert((await page.locator('#output').textContent()).endsWith(expected[p]));assert(await page.locator('#end').isDisabled());
   await page.click('#reset');assert(await page.locator('#prev').isDisabled());assert.equal(await page.locator('#history li').count(),0);await page.click('#end');
   evidence.push({locale:lang,preset:p,expected:expected[p],observed:await page.locator('#output').textContent(),operations:states.length});
  }
  assert(await page.locator('#reveal').isDisabled() || await page.locator('[name=prediction]:checked').count());
  for(let answer=0;answer<3;answer++){
   await page.check(`[name=prediction][value="${answer}"]`);assert(await page.locator('#feedback').isHidden());await page.click('#reveal');
   const feedback=await page.locator('#feedback').textContent();assert(feedback.includes('HHe6NaO3'));assert(feedback.includes(answer===1?(lang==='en'?'Correct.':'正确。'):(lang==='en'?'Not quite.':'尚不正确。')));
   evidence.push({locale:lang,prediction:answer,observed:feedback});
   const saved=await page.locator('#progress').textContent();await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);assert(await page.locator(`[name=prediction][value="${answer}"]`).isChecked());assert(await page.locator('#feedback').isVisible());await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#progress').textContent(),saved);
  }
  await page.locator('#sourceDetails').evaluate(el=>el.open=true);assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);assert.equal(await page.locator('#copyStatus').textContent(),lang==='en'?'Full source copied.':'已复制完整源代码。');
  await page.evaluate(async()=>{await navigator.clipboard.writeText('not-source-sentinel-726');window.originalWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('forced unavailable');};});
  await page.click('#copy');assert(await page.locator('#manualCopy').isVisible());assert.equal(await page.locator('#copyText').inputValue(),source);
  assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source,'native fallback copy must replace sentinel');
  evidence.push({locale:lang,source:'rendered/copied/manual-native-copy/download parity',fallback:await page.locator('#copyStatus').textContent(),host:process.platform});
  await page.evaluate(()=>navigator.clipboard.writeText=window.originalWrite);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);const data=fs.readFileSync(await download.path(),'utf8');assert.equal(data,source);
 }
 // Browser numerical model already checked independently in check.py; inspect rendered state and layout.
 for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
  await page.setViewportSize({width,height:950});await page.click(`[data-lang=${lang}]`);await page.selectOption('#preset','2');
  for(let i=0;i<9;i++)await page.click('#next'); // nested-group merge, O:7 S:2 N:1
  await page.locator('#afterMaps').scrollIntoViewIfNeeded();
  assert((await page.locator('#event').textContent()).includes('O: 0 + 7 × 2 = 14'));
  assert((await page.locator('#event').textContent()).includes(lang==='en'?'pop the child':'取出子表'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const measure=await page.locator('#preset').evaluate(el=>{let s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;return {font:s.fontFamily,width:el.clientWidth,textWidth:c.measureText(el.selectedOptions[0].text).width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)};});
  assert(measure.textWidth+measure.padding+24<measure.width,JSON.stringify(measure));
  const geometry=await page.locator('.map-card').evaluateAll(els=>els.map(el=>({width:el.clientWidth,scroll:el.scrollWidth})));assert(geometry.every(g=>g.scroll<=g.width));
  await page.screenshot({path:path.join(out,`trace-${lang}-${width}.png`),fullPage:false});
  evidence.push({locale:lang,width,preset:2,step:9,select:measure,cardGeometry:geometry});
 }
 // 200% zoom using CSS zoom (layout zoom), 1440px desktop viewport and 390px stress.
 for(const lang of ['en','zh'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:1100});await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#afterMaps').scrollIntoViewIfNeeded();
  assert((await page.locator('#event').textContent()).includes('O: 0 + 7 × 2 = 14'));
  assert((await page.locator('#event').textContent()).includes(lang==='en'?'pop the child':'取出子表'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`zoom-${lang}-${width}.png`)});await page.evaluate(()=>document.body.style.zoom='');
 }
 // Focus and real keyboard operation, including a deep-link navigation.
 await page.setViewportSize({width:1440,height:1000});await page.click('[data-lang=en]');await page.selectOption('#preset','0');await page.locator('#next').focus();await page.keyboard.press('Enter');assert((await page.locator('#progress').textContent()).startsWith('Operation 1/'));
 const focus=await page.locator('#next').evaluate(el=>({active:document.activeElement===el,outline:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));assert(focus.active&&focus.outline==='solid'&&focus.width==='3px');
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'reset');await page.keyboard.press('Enter');assert(await page.locator('#prev').isDisabled());
 await page.click('a[href="#step2"]');await page.waitForTimeout(400);assert(await page.locator('#step2').evaluate(el=>el.getBoundingClientRect().top>=60));
 const related=await page.locator('.related a').evaluateAll(els=>els.map(e=>e.getAttribute('href')));for(const link of related){const [file,hash]=link.split('#');let dest=path.resolve(root,file,'index.html');assert(fs.existsSync(dest));assert(fs.readFileSync(dest,'utf8').includes(`id="${hash}"`));}
 for(const lang of ['en','zh']){await page.click(`[data-lang=${lang}]`);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`page-${lang}-desktop.png`),fullPage:true});await page.screenshot({path:path.join(out,`header-${lang}.png`)});await page.locator('#step3').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`prediction-${lang}.png`)});}
 await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await page.locator('#next').focus();assert.equal(await page.locator('#next').evaluate(el=>getComputedStyle(el).outlineWidth),'3px');await page.emulateMedia({forcedColors:'none',reducedMotion:'no-preference'});
 const sizes=await page.locator('button').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));assert(sizes.every(h=>h>=48));
 const colors=await page.evaluate(()=>{let s=getComputedStyle(document.documentElement);return Object.fromEntries(['bg','panel','panel2','text','muted','accent','accent2'].map(k=>[k,s.getPropertyValue('--'+k).trim()]));});let ratios={};for(const fg of ['text','muted','accent','accent2'])for(const bg of ['bg','panel','panel2']){let r=contrast(colors[fg],colors[bg]);ratios[`${fg}/${bg}`]=r;assert(r>=4.5);}assert(contrast(colors.accent2,colors.panel2)>=3);
 // Blocked storage and offline file opening both retain usable source and trace.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked storage');}});});const bp=await blocked.newPage();await bp.goto('http://127.0.0.1:18784/leetcode/726/');await bp.click('[data-lang=zh]');await bp.click('#next');assert((await bp.locator('#progress').textContent()).includes('1/'));await blocked.close();
 const offline=await browser.newPage();await offline.goto('file://'+path.join(root,'index.html'));await offline.locator('#pythonCode').waitFor({state:'attached'});assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.click('#end');assert((await offline.locator('#output').textContent()).includes('H2MgO2'));await offline.close();
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);assert.deepEqual(external,[]);
 const report={result:'pass',browser:await browser.version(),host:process.platform,clipboardShortcut:process.platform==='darwin'?'Meta+C':'Control+C',zoom:'CSS layout zoom: 200%; not native-device evidence',copyKeys:pairs.length,evidence,contrast:ratios,focus,errors,bad,external,cssBytes:fs.statSync(path.join(root,'style.css')).size+fs.statSync(path.join(root,'../style.css')).size};assert(report.cssBytes<25000);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({result:report.result,states:evidence.length,cssBytes:report.cssBytes,contrast:ratios}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
