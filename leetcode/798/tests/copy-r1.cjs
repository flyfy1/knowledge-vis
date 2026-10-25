// Focused author regression for 798-COPY-R1; no independent acceptance claim.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence/copy-r1');
fs.mkdirSync(out,{recursive:true});
const base='cc3d785f667dd8e20edf6c6f326e8aebc018e888';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const files=['index.html','copy.js','app.js','core.js','solution.py','python-code.js','style.css','lesson-entry.json'];
const hashes=Object.fromEntries(files.map(f=>[f,{base:hash(execFileSync('git',['show',`${base}:leetcode/798/${f}`])),candidate:hash(fs.readFileSync(path.join(root,f)))}]));
for(const f of ['app.js','core.js','solution.py','python-code.js','style.css'])assert.equal(hashes[f].base,hashes[f].candidate,f);
const parse=s=>JSON.parse(s.replace(/^window.LESSON_COPY = /,'').replace(/;\s*$/,''));
const copyRaw=fs.readFileSync(path.join(root,'copy.js'),'utf8'),copy=parse(copyRaw);
const original=parse(execFileSync('git',['show',`${base}:leetcode/798/copy.js`],{encoding:'utf8'}));
const keys=[...copyRaw.matchAll(/^  "([^"]+)": \[/gm)].map(m=>m[1]);
assert.equal(keys.length,new Set(keys).size);
assert.deepEqual(copy.sim,original.sim);
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const report={finding:'798-COPY-R1',authorSelfCheck:true,base,hashes,host:process.platform,states:[],errors:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try{
  report.browser=await browser.version();
  const context=await browser.newContext({viewport:{width:320,height:900},permissions:['clipboard-read','clipboard-write']});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)report.errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:18770/leetcode/798/');
  await page.locator('#handRead').filter({hasText:'k=0'}).waitFor();
  for(const f of files){const response=await context.request.get(new URL(f,page.url()).href);assert(response.ok());assert.equal(hash(await response.body()),hashes[f].candidate,`served ${f}`);}
  await page.selectOption('#preset','1');await page.click('#next');await page.click('#scanNext');await page.click('#scanNext');
  await page.check('[name=prediction][value="1"]');await page.click('#reveal');
  const retained=()=>page.evaluate(()=>({preset:document.querySelector('#preset').value,hand:document.querySelector('#handHistory').textContent,rows:document.querySelector('#scanRows').textContent,selected:document.querySelector('[name=prediction]:checked').value}));
  const before=await retained();
  for(const lang of ['zh','en','zh']){
   await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await retained(),before);
   assert((await page.locator('#feedback').textContent()).includes('l=(0−3+1+5)%5=3'));
   assert.equal(await page.locator('[data-i18n=sim]').textContent(),original.sim[lang==='zh'?0:1]);
   assert.equal(await page.locator('[data-i18n=intervalRule]').textContent(),copy.intervalRule[lang==='zh'?0:1]);
   const rows=await page.locator('#scanRows tr').evaluateAll(rows=>rows.map(r=>[...r.children].map(c=>c.textContent)));
   assert.deepEqual(rows,[['0','3','3','2','0'],['1','-1','2','3','1']]);
   assert((await page.locator('#scanRead').textContent()).includes('2/5'));
   assert.equal(await page.locator('#result').textContent(),'');
   for(const binding of await page.locator('[data-i18n]').evaluateAll(nodes=>nodes.map(e=>({key:e.dataset.i18n,text:e.textContent}))))assert.equal(binding.text,copy[binding.key][lang==='zh'?0:1],binding.key);
   await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
   const state={lang,footerCount:await page.locator('footer,[data-i18n=foot]').count(),sim:await page.locator('[data-i18n=sim]').textContent(),formula:await page.locator('[data-i18n=intervalRule]').textContent(),scanRead:await page.locator('#scanRead').textContent(),rows,feedback:await page.locator('#feedback').textContent(),retained:await retained()};
   report.states.push(state);
   await page.screenshot({path:path.join(out,`roundtrip-${report.states.length}-${lang}-320.png`)});
  }
  // Keep the failed baseline capture before applying the repair.
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
  assert(report.states.every(s=>s.footerCount===0),'798-COPY-R1: workflow footer must be absent');
  assert(!Object.hasOwn(copy,'foot'));
  for(const [key,value] of Object.entries(original))if(key!=='foot')assert.deepEqual(copy[key],value,key);
  assert.equal(Object.keys(copy).length,Object.keys(original).length-1);
  for(const lang of ['zh','en']){
   await page.locator(`[data-lang=${lang}]`).click();
   const text=await page.locator('body').textContent();for(const old of original.foot)assert(!text.includes(old));
   assert.equal(await page.locator('#pythonCode').textContent(),source);
   assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
   await page.click('#copyPython');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('a[download]').click()]);
   assert(fs.readFileSync(await download.path()).equals(Buffer.from(source)));
   const sentinel=`798-COPY-R1-${lang}-${Date.now()}`;
   await page.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel reset failed');},sentinel);
   await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('test denial'));});
   await page.click('#copyPython');assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
   await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
   await page.evaluate(()=>navigator.clipboard.writeText=window.savedWrite);
   await page.click('#copyPython');await page.locator('#sourceFallback').waitFor({state:'hidden'});
   for(const [width,zoom] of [[320,1],[1280,2]]){
    await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
    await page.locator('.related a').last().focus();
    await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('.related a').first().evaluate(e=>document.activeElement===e),true);
    await page.keyboard.press('Tab');assert.equal(await page.locator('.related a').last().evaluate(e=>document.activeElement===e),true);
    await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
    const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,bottomGap:document.documentElement.scrollHeight-document.querySelector('main').getBoundingClientRect().bottom-scrollY}));
    assert(geometry.scrollWidth<=width+1);assert(Math.abs(geometry.bottomGap)<=1,'orphan footer gap');
    await page.screenshot({path:path.join(out,`end-${lang}-${width}-zoom${zoom}.png`)});
    report.states.push({lang,width,zoom,geometry,keyboardRelatedLinks:true,exactSourceTransfer:true});
   }
   await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:320,height:900});
  }
  const offline=await context.newPage();await offline.goto('file://'+path.join(root,'index.html'));
  assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();
  assert.deepEqual(report.errors,[]);report.result='pass';
 }finally{fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));await browser.close();}
 console.log('798-COPY-R1 focused browser checks passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
