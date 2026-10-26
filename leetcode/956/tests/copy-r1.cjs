// Focused author regression for 956-COPY-R1. Does not grant review acceptance.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/copy-r1');
const URL=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/956/';
const BASE='61c1660d36c3e2b77aa2249c0daeeb60133cb0ae';
const expected={zh:'本地模拟，无上传、无在线提交。',en:'Local simulation, no upload or online submission.'};
const source=fs.readFileSync(path.join(ROOT,'solution.py'),'utf8');
function copyObject(code){const context={window:{}};vm.runInNewContext(code,context);return JSON.parse(JSON.stringify(context.window.COPY));}
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try {
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],acceptDownloads:true,viewport:{width:320,height:900}});
 const page=await context.newPage(),errors=[],failed=[],observed=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto(URL);await page.waitForFunction(()=>document.querySelector('#progress').textContent.length>0);
 // The first assertion is deliberately red on the old candidate's rendered footer.
 await page.click('[data-lang=zh]');assert.equal(await page.locator('footer[data-i18n=foot]').textContent(),expected.zh);
 const old=copyObject(cp.execFileSync('git',['show',`${BASE}:leetcode/956/copy.js`],{encoding:'utf8'}));
 const current=copyObject(fs.readFileSync(path.join(ROOT,'copy.js'),'utf8'));
 assert.deepEqual(current.foot,[expected.zh,expected.en]);delete current.foot;delete old.foot;assert.deepEqual(current,old);
 for(const file of ['app.js','core.js','index.html','solution.py','python-code.js','style.css']){
  assert.deepEqual(fs.readFileSync(path.join(ROOT,file)),cp.execFileSync('git',['show',`${BASE}:leetcode/956/${file}`]));
  const response=await context.request.get(new global.URL(file,URL).href);assert(response.ok());assert.deepEqual(await response.body(),fs.readFileSync(path.join(ROOT,file)));
 }
 const servedCopy=await context.request.get(new global.URL('copy.js',URL).href);assert.deepEqual(await servedCopy.body(),fs.readFileSync(path.join(ROOT,'copy.js')));
 const mirror={window:{}};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'python-code.js'),'utf8'),mirror);assert.equal(mirror.window.PYTHON_SOURCE,source);
 await page.click('#next');await page.click('#next');await page.selectOption('#gap','1');
 await page.check('[name=prediction][value="1"]');await page.click('#reveal');
 const snapshots={};
 for(const lang of ['zh','en','zh']){
  await page.click(`[data-lang=${lang}]`);
  const footer=page.locator('footer[data-i18n=foot]');assert.equal(await footer.count(),1);assert.equal(await footer.textContent(),expected[lang]);
  assert(!/作者自查候选|独立评审待进行|Author self-checked candidate|Independent review pending/.test(await page.locator('body').textContent()));
  assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#956 · 最高的广告牌':'#956 · Tallest Billboard');assert.equal(await page.title(),await page.locator('h1').textContent());
  assert.equal(await page.locator('#preset').inputValue(),'0');assert.equal(await page.locator('#gap').inputValue(),'1');assert((await page.locator('#progress').textContent()).includes('2/3'));
  assert(await page.locator('[name=prediction][value="1"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('✓'));assert((await page.locator('#feedback').textContent()).includes('(1,8)'));
  const trace=await page.locator('#traceStage').textContent();if(snapshots[lang])assert.equal(trace,snapshots[lang]);snapshots[lang]=trace;
  assert.equal(await page.locator('[data-i18n=formula]').textContent(),current.formula[lang==='zh'?0:1]);
  assert.equal(await page.locator('#compare').textContent(),lang==='zh'?'差值 d=1：旧表矮高 0 → 新表最佳矮高 1。':'Gap d=1: old shorter height 0 → new best shorter height 1.');
  for(const key of ['sim','p4','boundaries'])assert.equal(await page.locator(`[data-i18n=${key}]`).textContent(),current[key][lang==='zh'?0:1]);
  await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#traceStage').textContent(),trace);
  observed.push({lang,footer:await footer.textContent(),progress:await page.locator('#progress').textContent(),compare:await page.locator('#compare').textContent(),candidates:await page.locator('#candidates').textContent(),formula:await page.locator('[data-i18n=formula]').textContent(),limitations:await page.locator('[data-i18n=sim]').textContent()});
 }
 for(const lang of ['zh','en']){
  await page.click(`[data-lang=${lang}]`);
  assert.equal(await page.locator('#pythonSource').textContent(),source);
  await page.evaluate(()=>{window.nativeWrite=navigator.clipboard.writeText.bind(navigator.clipboard);});
  const autoSentinel=`956-auto-${lang}`;await page.evaluate(s=>window.nativeWrite(s),autoSentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),autoSentinel);
  await page.click('#copy');await page.waitForFunction(()=>document.querySelector('#copyStatus').textContent.includes(document.documentElement.lang==='en'?'copied':'已复制'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const sentinel=`956-fallback-${lang}-${Date.now()}`;await page.evaluate(s=>window.nativeWrite(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('test denial'));});await page.click('#copy');await page.locator('#manualSource').waitFor({state:'visible'});
  assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  const shortcut=process.platform==='darwin'?'Meta+C':'Control+C';await page.keyboard.press(shortcut);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>{navigator.clipboard.writeText=window.nativeWrite;});
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('#download')]);const dest=path.join(OUT,`download-${lang}.py`);await download.saveAs(dest);assert.deepEqual(fs.readFileSync(dest),Buffer.from(source));
  // Neighbouring controls remain keyboard reachable, including the last link.
  await page.locator('#copy').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'download');
  await page.locator('[data-i18n=rel1]').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.dataset.i18n),'rel2');
  assert.equal(await page.locator('[data-i18n=rel2]').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
  for(const zoom of [1,2]){
   await page.setViewportSize({width:zoom===1?320:640,height:900});await page.evaluate(z=>document.body.style.zoom=String(z),zoom);
   await page.locator('footer').scrollIntoViewIfNeeded();
   await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
   const geometry=await page.locator('footer').evaluate(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight};});
   await page.screenshot({path:path.join(OUT,`${lang}-footer-${zoom===1?'320':'zoom200'}.png`)});observed.push({lang,zoom,geometry,clipboard:{automaticExact:true,fallbackExact:true,sentinelVerified:true,host:process.platform,shortcut},downloadExact:true});
   assert(geometry.left>=0&&geometry.right<=geometry.width&&geometry.bottom<=geometry.height+1&&geometry.top>=0,JSON.stringify(geometry));assert(geometry.scrollWidth<=geometry.width);
  }
  await page.evaluate(()=>document.body.style.zoom='1');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({status:'pass',finding:'956-COPY-R1',browser:browser.version(),host:process.platform,observed,errors,failed},null,2)+'\n');
 console.log('PASS 956-COPY-R1: bilingual footer, retained state/limitations, source transfers, keyboard and page-end layout');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
