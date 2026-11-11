// Focused author regression for 903-COPY-R1. No service or shared-file writes.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),os=require('os'),vm=require('vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'evidence/copy-r1');
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const copy=fs.readFileSync(path.join(root,'copy.js'),'utf8');
const obj=acorn.parse(copy,{ecmaVersion:'latest'}).body[0].expression.right;
const keys=obj.properties.map(p=>p.key.name);assert.equal(new Set(keys).size,keys.length);assert(!keys.includes('foot'));
const sandbox={window:{}};vm.runInNewContext(copy,sandbox);
const oldCopy=require('child_process').execFileSync('git',['show','26f8fd8ec1e79a233779b82a4c8ee3d63edaee17:leetcode/903/copy.js'],{encoding:'utf8'});
const old={window:{}};vm.runInNewContext(oldCopy,old);
for(const key of keys)assert.deepEqual(Array.from(sandbox.window.COPY[key]),Array.from(old.window.COPY[key]));
const mirror={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),mirror);assert.equal(mirror.window.PYTHON_SOURCE,source);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
 const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1280,height:900}});
 const page=await ctx.newPage(),errors=[],results={host:os.platform(),browser:browser.version(),locales:[],layouts:[]};
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 try {
 await page.goto(process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/903/');await page.waitForFunction(()=>document.querySelector('#progress').textContent);
 await page.click('[data-lang=zh]');await page.selectOption('#preset','DI');
 for(let i=0;i<4;i++)await page.click('#next'); // DI j=1: [0,1,·], old sources {0}.
 assert.equal(await page.locator('td.current').textContent(),'→ 1');
 await page.locator('[name=prediction][value="1"]').check();await page.click('#reveal');
 const snapshot=await page.locator('#counts tbody td').allTextContents();
 for(const lang of ['zh','en','zh']){
  await page.click(`[data-lang=${lang}]`);
  assert.deepEqual(await page.locator('#counts tbody td').allTextContents(),snapshot);
  assert(await page.locator('[name=prediction][value="1"]').isChecked());assert(await page.locator('#feedback').isVisible());
  assert((await page.locator('#feedback').textContent()).includes('0 + 1 = 1'));
  assert.equal(await page.locator('footer,[data-i18n=foot]').count(),0,'903-COPY-R1: orphan workflow footer');
  const body=await page.locator('body').textContent();assert(!/作者候选|独立评审待完成|Author candidate|independent review pending|review complete|independently accepted/i.test(body));
  for(const el of await page.locator('[data-i18n]').all()){
   const key=await el.getAttribute('data-i18n');assert.equal(await el.textContent(),sandbox.window.COPY[key][lang==='zh'?0:1]);
  }
  const formula=await page.locator('[data-i18n=formula]').textContent();assert(formula.includes('0 ≤ k < j')&&formula.includes('j ≤ k < m')&&formula.includes('0 ≤ j ≤ m'));
  assert((await page.locator('#sum').textContent()).includes('nxt[1] = 1 = 1'));
  const progress=await page.locator('#progress').textContent();assert(progress.includes('4/5')&&progress.includes('2/2'));
  for(const key of ['sim','costs','verification'])assert.equal(await page.locator(`[data-i18n=${key}]`).textContent(),old.window.COPY[key][lang==='zh'?0:1]);
  results.locales.push({lang,progress,sum:await page.locator('#sum').textContent(),formula,simulation:await page.locator('[data-i18n=sim]').textContent(),costs:await page.locator('[data-i18n=costs]').textContent()});
 }
 await page.click('#prev');await page.click('#next');assert.deepEqual(await page.locator('#counts tbody td').allTextContents(),snapshot);
 await page.click('#next');assert((await page.locator('#answer').textContent()).includes('2'));assert(await page.locator('#next').isDisabled());
 await page.locator('[name=prediction][value="0"]').check();assert(await page.locator('#feedback').isHidden());
 for(const lang of ['zh','en']){
  await page.click(`[data-lang=${lang}]`);
  for(const layout of [{width:320,zoom:1},{width:1280,zoom:2}]){
   await page.setViewportSize({width:layout.width,height:900});await page.evaluate(z=>document.documentElement.style.zoom=String(z),layout.zoom);
   await page.locator('.related a').last().focus();
   await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})});
   await page.waitForFunction(()=>Math.abs(document.querySelector('main').getBoundingClientRect().bottom-innerHeight)<3);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const geometry=await page.evaluate(()=>({lastLinkBottom:document.querySelector('.related a:last-child').getBoundingClientRect().bottom,mainBottom:document.querySelector('main').getBoundingClientRect().bottom,bodyBottom:document.body.getBoundingClientRect().bottom,viewport:innerHeight}));
   assert(geometry.bodyBottom-geometry.mainBottom<2,'no reserved footer gap');assert(geometry.lastLinkBottom>0&&geometry.lastLinkBottom<=geometry.viewport,'page-end links visible');
   await page.screenshot({path:path.join(out,`${lang}-${layout.width}-zoom${layout.zoom}-page-end.png`)});
   results.layouts.push({lang,...layout,...geometry});
   for(const selector of ['#copy','summary','.related a:first-child','.related a:last-child']){
    await page.locator(selector).focus();assert(await page.locator(selector).evaluate(el=>document.activeElement===el));assert.equal(await page.locator(selector).evaluate(el=>getComputedStyle(el).outlineWidth),'3px');
   }
  }
  await page.evaluate(()=>document.documentElement.style.zoom='1');
  await page.locator('summary').click();assert.equal(await page.locator('#pythonCode').textContent(),source);
  await page.click('#copy');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const sentinel=`903-copy-r1-${lang}-${Date.now()}`;await page.evaluate(s=>navigator.clipboard.writeText(s),sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(Error('forced fallback'))}));
  await page.click('#copy');assert(await page.locator('#copyText').evaluate(el=>document.activeElement===el&&el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press(os.platform()==='darwin'?'Meta+C':'Control+C');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>delete navigator.clipboard.writeText);
  const [download]=await Promise.all([page.waitForEvent('download'),page.click('a[download]')]);await download.saveAs(path.join(out,`download-${lang}.py`));assert.equal(fs.readFileSync(path.join(out,`download-${lang}.py`),'utf8'),source);
  await page.locator('summary').click();
 }
 assert.deepEqual(errors,[]);results.errors=errors;results.sourceTransfers='Exact source, mirror, DOM textContent, automatic clipboard, per-locale sentinel + actual host shortcut fallback, downloads all equal including final newline';
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2)+'\n');console.log('PASS 903-COPY-R1: locale roundtrip, preserved bindings/state, formula/frame/count/prediction, four page-end layouts, keyboard, exact source transfers; no errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
