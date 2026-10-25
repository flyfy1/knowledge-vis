'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence/copy-r1'),before=require('./evidence/copy-r1/before.json');
fs.mkdirSync(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
 const page=await browser.newPage({viewport:{width:320,height:1000}}),errors=[],records=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:18770')+'/leetcode/815/');
 await page.waitForFunction(()=>document.querySelector('#frameRead').textContent.length>0);
 assert.equal(await page.locator('footer,[data-i18n=foot]').count(),0,'815-COPY-R1: transient workflow footer must be removed');
 const copy=JSON.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8').split('=').slice(1).join('=').trim().replace(/;$/,''));
 const expected={...before.copy};delete expected.foot;assert.deepEqual(copy,expected,'all other localization entries must be unchanged');
 for(const [n,h] of Object.entries(before.protected))assert.equal(hash(fs.readFileSync(path.join(root,n))),h,n+' must remain byte-identical');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.equal(html,before.index.replace('<footer class="site-foot" data-i18n="foot"></footer>','').replace('copy.js?v=815-r1','copy.js?v=815-copy-r1'),'only footer and changed-copy cache version may change');
 await page.locator('#preset').selectOption('0');await page.locator('#traceNext').click();
 await page.locator('[name=prediction][value="1"]').check();await page.locator('#reveal').click();
 for(const zoom of [1,2]){
  await page.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
  for(const locale of ['zh','en','zh']){
   await page.locator(`[data-lang=${locale}]`).click();const i=locale==='zh'?0:1;
   assert.equal(await page.locator('h1').textContent(),copy.title[i]);assert.equal(await page.title(),copy.docTitle[i]);
   for(const key of ['sim','s4e'])assert.equal(await page.locator(`[data-i18n=${key}]`).textContent(),before.copy[key][i]);
   const frame=await page.locator('#frameRead').textContent();assert(frame.includes('1/2'));assert(frame.includes(before.copy.pending[i]));
   assert(await page.locator('[name=prediction][value="1"]').isChecked());
   assert((await page.locator('#predictionFeedback').textContent()).includes(locale==='en'?'answer is 1':'答案是 1'));
   const bindings=await page.locator('[data-i18n]').evaluateAll(es=>es.map(e=>({key:e.dataset.i18n,text:e.textContent})));for(const b of bindings){assert(copy[b.key],b.key);assert(b.text.length,b.key);}
   await page.locator('#copyPython').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('download')),'');
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.parentElement.id),'sourceDetails');
   await page.keyboard.press('Enter');assert(await page.locator('#sourceDetails').evaluate(e=>e.open));await page.keyboard.press('Enter');
   await page.locator('.related a').last().focus();await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
   const geometry=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,end:document.querySelector('main').getBoundingClientRect().bottom,viewport:innerHeight,footer:!!document.querySelector('.site-foot'),focus:document.activeElement.textContent,font:getComputedStyle(document.body).fontFamily}));
   assert(geometry.scrollWidth<=geometry.width+1);assert(!geometry.footer);assert(Math.abs(geometry.end-geometry.viewport)<3,JSON.stringify(geometry));
   const name=`${locale}-320-zoom${zoom}-${records.length}-end.png`;await page.screenshot({path:path.join(out,name)});
   records.push({locale,zoom,frame,sim:copy.sim[i],s4e:copy.s4e[i],geometry,screenshot:name});
  }
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({kind:'author self-check; separate re-review pending',finding:'815-COPY-R1',result:'pass',browser:browser.version(),platform:process.platform,protectedHashes:before.protected,records,errors},null,2)+'\n');
 console.log('815-COPY-R1: bilingual removal, unchanged body/runtime, pending state, retained trace/quiz, keyboard and page-end layout pass');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
