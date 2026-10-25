const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),os=require('node:os');
const P=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'evidence/copy-r1'),before=require('./evidence/copy-r1/before.json');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),source=fs.readFileSync(path.join(P,'solution.py'),'utf8');
const r={kind:'author focused self-check',finding:'793-COPY-R1',host:os.platform(),states:[],errors:[]};
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});try{
 const ctx=await b.newContext({viewport:{width:320,height:1000},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});const p=await ctx.newPage();p.on('pageerror',e=>r.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')r.errors.push(m.text());});p.on('response',x=>{if(x.status()>=400)r.errors.push(x.status()+' '+x.url());});
 await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/793/');await p.locator('#handRead').filter({hasText:'24'}).waitFor();
 assert.equal(await p.locator('footer,[data-i18n=foot]').count(),0,'workflow footer must be removed');
 assert.equal(await p.evaluate(()=>Object.hasOwn(window.LESSON_COPY,'foot')),false);
 assert.deepEqual(await p.evaluate(()=>window.LESSON_COPY),before.preservedCopy);
 for(const f of ['app.js','core.js','solution.py','python-code.js','style.css','lesson-entry.json'])assert.equal(hash(fs.readFileSync(path.join(P,f))),before.hashes[f],f+' changed');
 await p.locator('#plus').click();await p.locator('#next').click();await p.locator('[name=prediction][value="0"]').check();await p.locator('#reveal').click();
 const snapshot=()=>p.evaluate(()=>({lo:loValue.textContent,hi:hiValue.textContent,history:traceHistory.children.length,preset:document.getElementById("preset").value,quiz:document.getElementById("quiz").value,answer:document.querySelector('[name=prediction]:checked').value}));const state=await snapshot();
 for(const l of ['zh','en','zh']){
  await p.locator(`[data-lang=${l}]`).click();assert.deepEqual(await snapshot(),state);assert((await p.locator('#feedback').textContent()).includes('L(29)=L(30)=125'));assert((await p.locator('#handRead').textContent()).includes('f(25)=6'));
  const i=l==='zh'?0:1;for(const k of ['sim','s4e','countFormula','zeroFormula'])assert.equal(await p.locator(`[data-i18n=${k}]`).textContent(),before.preservedCopy[k][i]);
  const body=await p.locator('body').textContent();for(const old of before.removedCopy)assert(!body.includes(old));
  r.states.push({locale:l,state:await snapshot(),formula:await p.locator('[data-i18n=countFormula]').textContent(),operation:await p.locator('#operation').textContent(),feedback:await p.locator('#feedback').textContent()});
 }
 await p.locator('#prev').click();assert.equal(await p.locator('#traceHistory li').count(),0);await p.locator('#next').click();assert.deepEqual(await snapshot(),state);
 await p.locator('#quiz').selectOption('31');assert(await p.locator('#reveal').isDisabled());assert(!(await p.locator('#feedback').textContent()).includes('125'));
 for(const l of ['zh','en']){
  await p.locator(`[data-lang=${l}]`).click();
  assert.equal(await p.locator('#pythonCode').textContent(),source);assert.equal(await p.evaluate(()=>window.PYTHON_SOURCE),source);
  await p.locator('#copyPython').click();await p.waitForFunction(()=>/copied|已复制/.test(copyStatus.textContent));assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);
  const [d]=await Promise.all([p.waitForEvent('download'),p.locator('[download]').click()]);assert.equal(fs.readFileSync(await d.path(),'utf8'),source);
  const sentinel='793-COPY-R1-'+l+'-'+Date.now();await p.evaluate(async s=>{await navigator.clipboard.writeText(s);if(await navigator.clipboard.readText()!==s)throw Error('sentinel reset failed');},sentinel);
  await p.evaluate(()=>{window.writeOriginal=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=async()=>{throw Error('forced fallback');};});await p.locator('#copyPython').click();await p.locator('#manualSource').waitFor({state:'visible'});
  assert.deepEqual(await p.locator('#manualSource').evaluate(e=>[document.activeElement===e,e.selectionStart,e.selectionEnd,e.value]),[true,0,source.length,source]);await p.keyboard.press(os.platform()==='darwin'?'Meta+c':'Control+c');assert.equal(await p.evaluate(()=>navigator.clipboard.readText()),source);await p.evaluate(()=>navigator.clipboard.writeText=window.writeOriginal);
  await p.locator('#copyPython').click();await p.waitForFunction(()=>sourceFallback.hidden);
  // Tab through the neighboring controls and activate the source disclosure with Enter.
  await p.locator('#copyPython').focus();await p.keyboard.press('Tab');assert(await p.locator('[download]').evaluate(e=>e===document.activeElement));await p.keyboard.press('Tab');assert(await p.locator('#sourceDetails summary').evaluate(e=>e===document.activeElement));await p.keyboard.press('Enter');assert(await p.locator('#sourceDetails').evaluate(e=>e.open));await p.keyboard.press('Enter');
  await p.keyboard.press('Tab');assert(await p.locator('.related a').first().evaluate(e=>e===document.activeElement));await p.keyboard.press('Tab');assert(await p.locator('.related a').nth(1).evaluate(e=>e===document.activeElement));
  for(const zoom of [1,2]){
   await p.setViewportSize({width:zoom===1?320:1440,height:1000});
   await p.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
   const geometry=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,gapAfterMain:document.documentElement.scrollHeight-document.querySelector('main').getBoundingClientRect().bottom-scrollY,footer:document.querySelector('footer')!==null}));assert(geometry.scrollWidth<=geometry.width+1);assert(Math.abs(geometry.gapAfterMain)<=2,JSON.stringify(geometry));
   await p.screenshot({path:path.join(OUT,`${l}-${zoom===1?320:1440}-zoom${zoom}-end.png`)});r.states.push({locale:l,viewport:zoom===1?320:1440,zoom,geometry,keyboard:'copy → download → source summary (Enter) → related1 → related2',sourceTransfer:'display/mirror/native copy/download/manual fallback exact, fresh sentinel verified'});
  }await p.evaluate(()=>document.documentElement.style.zoom='1');await p.setViewportSize({width:320,height:1000});
 }
 const offline=await ctx.newPage();await offline.goto('file://'+path.join(P,'index.html'));assert.equal(await offline.locator('#pythonCode').textContent(),source);await offline.close();assert.deepEqual(r.errors,[]);r.browser=await b.version();r.status='passed';
 fs.writeFileSync(path.join(OUT,'browser.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
}finally{await b.close();}})().catch(e=>{r.failure=String(e.stack);fs.writeFileSync(path.join(OUT,process.env.EXPECT_RED?'red.json':'failure.json'),JSON.stringify(r,null,2)+'\n');console.error(e);process.exitCode=1;});
