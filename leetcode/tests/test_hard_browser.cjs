'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const fixtures=require('../hard-first-ten/fixtures.json'),ids=Object.keys(fixtures),base=process.env.LESSON_BASE_URL||'http://127.0.0.1:18768';
const shots=process.env.LESSON_SCREENSHOTS;let checks=0;
function ok(value,message){assert.ok(value,message);checks++;}
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400&&!r.url().includes('favicon'))errors.push(r.status()+' '+r.url());});
 const registry={window:{}};require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname,'../problems.config.js'),'utf8'),registry);
 await page.goto(base+'/leetcode/');assert.equal(await page.locator('.problem-card').count(),registry.window.LEETCODE_PROBLEMS.length);
 for(const id of ids){
  await page.goto(base+'/leetcode/'+id+'/');await page.waitForFunction(()=>window.lessonSnapshot&&document.getElementById('message').textContent.length);
  for(const lang of ['en','zh']){
   await page.locator('[data-lang="'+lang+'"]').click();
   for(let preset=0;preset<fixtures[id].length;preset++){
    await page.locator('#preset').selectOption(String(preset));ok(await page.locator('#prev').isDisabled(),'initial endpoint');
    const initial=await page.evaluate(()=>lessonSnapshot().frame);
    if(!(await page.locator('#next').isDisabled())){
     await page.locator('#next').click();const first=await page.evaluate(()=>lessonSnapshot().frame);
     await page.locator('#prev').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),initial);
     await page.locator('#next').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),first);
    }
    const max=await page.locator('#position').getAttribute('max');await page.locator('#position').fill(max);
    ok(await page.locator('#next').isDisabled(),'terminal endpoint');ok(await page.locator('#result').isVisible(),'final result');
    const terminal=await page.evaluate(()=>lessonSnapshot().frame);
    if(!(await page.locator('#prev').isDisabled())){await page.locator('#prev').click();await page.locator('#next').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),terminal);}
    await page.locator('#reset').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot().frame),initial);
   }
   for(const answer of ['0','1','2']){
    await page.locator('[name="prediction"][value="'+answer+'"]').check();ok(!(await page.evaluate(()=>lessonSnapshot().revealed)),'choice hides stale feedback');
    await page.locator('#reveal').click();ok(await page.evaluate(()=>lessonSnapshot().revealed),'explicit reveal');
    ok((await page.locator('#feedback').innerText()).length>15,'causal feedback');
   }
  }
  // Keep both the trace and quiz state while changing language; focus stays on toggle.
  await page.locator('#preset').selectOption('0');await page.locator('#next').click();const old=await page.evaluate(()=>lessonSnapshot());
  await page.locator('[data-lang="en"]').click();assert.deepEqual(await page.evaluate(()=>lessonSnapshot()),old);
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),'en');
  const source=fs.readFileSync(path.join(__dirname,'..',id,'solution.py'),'utf8');
  assert.equal(await page.locator('#pythonCode').textContent(),source);
  const response=await page.request.get(base+'/leetcode/'+id+'/solution.py');assert.equal(await response.text(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  for(const lang of ['en','zh'])for(const width of [320,390,736,1440]){
   await page.setViewportSize({width,height:1000});await page.locator('[data-lang="'+lang+'"]').click();
   await page.locator('#preset').selectOption('0');await page.locator('#next').click();
   await page.locator('#beforeDetails').evaluate(e=>e.open=true);await page.locator('#sourceDetails').evaluate(e=>e.open=true);
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${id} ${lang} ${width} page overflow`);
   ok(await page.locator('#next').isVisible(),'next visible');
   const blank=await page.locator('[data-i18n]').evaluateAll(nodes=>nodes.filter(n=>!n.textContent.trim()).map(n=>n.dataset.i18n));assert.deepEqual(blank,[]);
   if(shots&&(width===390||width===1440)&&lang==='en'){
    fs.mkdirSync(shots,{recursive:true});await page.locator('#step2').screenshot({path:path.join(shots,`${id}-${width}.png`)});
   }
  }
  // Actual keyboard operations and deep-link position, including sticky navigation.
  await page.locator('#preset').selectOption('0');await page.locator('#position').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>lessonSnapshot().index),1);
  await page.locator('#prev').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>lessonSnapshot().index),0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.step-nav a[href="#step2"]').click();
  ok(await page.evaluate(()=>document.querySelector('#step2 h2').getBoundingClientRect().top>=document.querySelector('.step-nav').getBoundingClientRect().bottom),'sticky nav does not cover target heading');
  if(id==='42'){await page.locator('#next').click();assert.equal(await page.locator('.water-column.hot').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');assert.equal(await page.locator('.water-column.hot .water-block').count(),0);}
  // Verify every internal anchor has a real target, including cross-lesson deep links.
  const hrefs=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('https:')));
  for(const href of hrefs){const url=new URL(href,page.url()),res=await page.request.get(url.href.split('#')[0]);ok(res.ok(),'link '+url);if(url.hash)ok((await res.text()).includes('id="'+url.hash.slice(1)+'"'),'anchor '+url);}
  console.log('browser lesson '+id+' passed');
 }
 // Clipboard denial and storage denial are tested per lesson, not only on a sample.
 const blocked=await browser.newContext({viewport:{width:390,height:850},locale:'zh-CN'});
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage denied');}});Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('clipboard denied');}}});});
 for(const id of ids){const p=await blocked.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto(base+'/leetcode/'+id+'/');await p.waitForFunction(()=>window.lessonSnapshot);await p.locator('#copy').click();ok(await p.locator('#manualCopy').isVisible(),'copy fallback');assert.equal(await p.locator('#copyText').inputValue(),fs.readFileSync(path.join(__dirname,'..',id,'solution.py'),'utf8'));await p.locator('[data-lang="en"]').click();ok((await p.locator('#copyStatus').innerText()).includes('Automatic copy'),'localized fallback');await p.close();}
 // Offline files still display Python and compute the experiment, with no fetch dependency.
 const offline=await browser.newContext();for(const id of ids){const p=await offline.newPage();p.on('pageerror',e=>errors.push(String(e)));await p.goto('file://'+path.join(__dirname,'..',id,'index.html'));await p.waitForFunction(()=>window.lessonSnapshot);ok((await p.locator('#pythonCode').textContent()).includes('class Solution'),'offline Python');await p.close();}
 assert.deepEqual(errors,[]);console.log(`Browser: ${checks} checks passed; 10 lessons, two locales, 320/390/736/1440px, storage/clipboard denial, offline pages; no browser errors.`);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
