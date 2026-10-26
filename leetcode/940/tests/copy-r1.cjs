/* Focused author regression for 940-COPY-R1. Never overwrites historical evidence. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence/copy-r1/green'));
fs.mkdirSync(out,{recursive:true});
const url=(process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/940/';
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const files=['index.html','copy.js','app.js','core.js','solution.py','python-code.js','style.css','lesson-entry.json'];
const hashes=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const report={finding:'940-COPY-R1',type:'author self-check',url,hashes,host:process.platform,states:[],errors:[],violations:[]};
const launch={headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})};
let browser,zoom;
const save=()=>fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');
(async()=>{
 browser=await chromium.launch(launch);report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:320,height:900},permissions:['clipboard-read','clipboard-write'],acceptDownloads:true});
 const page=await context.newPage();
 const watch=p=>{p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});};watch(page);
 await page.goto(url);await page.locator('#pythonSource').waitFor();
 for(const file of files){const response=await context.request.get(new URL(file,url).href);assert.equal(response.status(),200);assert((await response.body()).equals(fs.readFileSync(path.join(root,file))),file+' preview bytes');}
 const lang=async(p,l)=>{await p.locator('#langToggle [data-lang='+l+']').click();assert.equal(await p.locator('html').getAttribute('lang'),l==='zh'?'zh-CN':'en');};
 // Collect the actual bilingual defect before failing, so the red run proves both bindings.
 for(const l of ['zh','en','zh']){
  await lang(page,l);const footer=page.locator('footer,[data-i18n="foot"],.site-foot');
  const text=await page.locator('body').textContent();
  const workflow=/作者自查候选|独立评审待进行|Author self-checked candidate|independent review pending/.test(text);
  const state={phase:'footer regression',locale:l,footerCount:await footer.count(),workflow};report.states.push(state);
  if(state.footerCount||workflow)report.violations.push(state);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.screenshot({path:path.join(out,'end-'+l+'-320.png')});
 }
 assert.deepEqual(report.violations,[],'940-COPY-R1: workflow footer and unused binding must be absent in zh/en/zh');
 assert(!(await page.evaluate(()=>Object.hasOwn(window.COPY,'foot'))));
 // Every retained localized binding resolves, including meaningful nearby boundaries.
 const dict=await page.evaluate(()=>window.COPY);
 for(const key of ['sim','p4','boundaries']){
  const baseline={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'copy.js'),'utf8'),baseline);
  assert.deepEqual(dict[key],Array.from(baseline.window.COPY[key]));
 }
 const mirror={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),mirror);assert.equal(mirror.window.PYTHON_SOURCE,source);
 await page.selectOption('#preset','0');
 assert.equal(await page.locator('#tableBody tr:last-child td:last-child').textContent(),'0');
 for(const expected of [1,3,6]){await page.locator('#next').click();assert.equal(await page.locator('#tableBody tr:last-child td:last-child').textContent(),String(expected));}
 const terminal=await page.locator('#tableBody').textContent();await page.locator('#prev').click();assert.equal(await page.locator('#tableBody tr:last-child td:last-child').textContent(),'3');await page.locator('#next').click();assert.equal(await page.locator('#tableBody').textContent(),terminal);
 await page.locator('input[value="1"]').check();await page.locator('#reveal').click();
 for(const l of ['zh','en','zh']){
  await lang(page,l);assert.equal(await page.locator('h1').textContent(),l==='zh'?'#940 · 不同的子序列 II':'#940 · Distinct Subsequences II');
  assert.equal(await page.title(),await page.locator('h1').textContent());
  assert.equal(await page.locator('.formula').textContent(),'new = total + 1; total′ = total − ending[c] + new; ending[c] = new');
  assert((await page.locator('#calculation').textContent()).includes('3 − 1 + 4 = 6'));
  assert.equal(await page.locator('#tableBody tr:last-child td:last-child').textContent(),'6');
  assert((await page.locator('#result').textContent()).includes('= 6'));
  assert(await page.locator('input[value="1"]').isChecked());assert((await page.locator('#feedback').textContent()).includes('5 − 1 + 6 = 10'));
  for(const key of ['sim','p4','boundaries'])assert.equal(await page.locator('[data-i18n='+key+']').textContent(),dict[key][l==='zh'?0:1]);
  report.states.push({locale:l,phase:'retained trace and quiz',calculation:await page.locator('#calculation').textContent(),feedback:await page.locator('#feedback').textContent(),sim:dict.sim[l==='zh'?0:1],boundaries:dict.boundaries[l==='zh'?0:1]});
 }
 await page.selectOption('#preset','2');assert.equal(await page.locator('#tableBody tr:last-child td:last-child').textContent(),'0');assert((await page.locator('#feedback').textContent()).includes('5 − 1 + 6 = 10'));
 await page.locator('input[value="0"]').check();assert(!(await page.locator('#feedback').textContent()).includes('5 − 1 + 6 = 10'));
 for(const l of ['zh','en']){
  await lang(page,l);assert.equal(await page.locator('#pythonSource').textContent(),source);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  const sentinel='940-COPY-R1-'+l+'-'+crypto.randomUUID();
  await page.evaluate(async s=>{await navigator.clipboard.writeText(s);},sentinel);assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
  await page.evaluate(()=>{window.savedWrite=navigator.clipboard.writeText.bind(navigator.clipboard);navigator.clipboard.writeText=()=>Promise.reject(Error('test automatic write denied'));});
  await page.locator('#copy').click();await page.locator('#manualSource').waitFor({state:'visible'});
  assert(await page.locator('#manualSource').evaluate(e=>document.activeElement===e&&e.selectionStart===0&&e.selectionEnd===e.value.length));
  await page.keyboard.press(process.platform==='darwin'?'Meta+c':'Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
  await page.evaluate(()=>{navigator.clipboard.writeText=window.savedWrite;});await page.locator('#copy').click();
  const pending=page.waitForEvent('download');await page.locator('#download').click();const download=await pending;const target=path.join(out,'download-'+l+'.py');await download.saveAs(target);assert(fs.readFileSync(target).equals(Buffer.from(source)));
  // The changed page end retains its existing controls and keyboard link order.
  await page.locator('#copy').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'download');
  await page.keyboard.press('Tab');assert.equal(await page.locator('.related a').nth(0).evaluate(e=>e===document.activeElement),true);
  await page.keyboard.press('Tab');assert.equal(await page.locator('.related a').nth(1).evaluate(e=>e===document.activeElement),true);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const layout=await page.evaluate(()=>({bodyEnd:document.body.getBoundingClientRect().bottom,mainEnd:document.querySelector('main').getBoundingClientRect().bottom,lastLink:document.querySelector('.related a:last-child').getBoundingClientRect().toJSON(),font:getComputedStyle(document.body).fontFamily}));
  assert(Math.abs(layout.bodyEnd-layout.mainEnd)<1,'No orphan footer gap after main');
  await page.screenshot({path:path.join(out,'end-'+l+'-320.png')});report.states.push({locale:l,phase:'page end, keyboard and exact native source transfer',layout,sentinelVerified:true,sourceExact:true});
 }
 // Native Chromium zoom, using the existing test's tabs.setZoom mechanism.
 const runtime=path.join(out,'zoom-runtime'),extension=path.join(runtime,'extension');fs.mkdirSync(extension,{recursive:true});
 fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'940 local native zoom check',version:'1.0',permissions:['tabs'],background:{service_worker:'zoom.js'}}));
 fs.writeFileSync(path.join(extension,'zoom.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 zoom=await chromium.launchPersistentContext(path.join(runtime,'profile'),{...launch,viewport:null,args:['--window-size=1280,1400','--disable-extensions-except='+extension,'--load-extension='+extension]});
 const worker=zoom.serviceWorkers()[0]||await zoom.waitForEvent('serviceworker');const zp=await zoom.newPage();watch(zp);await zp.goto(url);
 await worker.evaluate(async u=>{for(const tab of await chrome.tabs.query({}))if(tab.url===u)await chrome.tabs.setZoom(tab.id,2);},url);
 await zp.waitForFunction(()=>devicePixelRatio===2&&innerWidth===640);const cdp=await zoom.newCDPSession(zp);
 for(const l of ['zh','en','zh']){
  await lang(zp,l);await zp.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));assert.equal(await zp.locator('footer,.site-foot').count(),0);
  assert(await zp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const metrics=await zp.evaluate(()=>({dpr:devicePixelRatio,innerWidth,outerWidth}));
  const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true});fs.writeFileSync(path.join(out,'end-'+l+'-zoom200.png'),Buffer.from(shot.data,'base64'));
  report.states.push({locale:l,phase:'native 200% page end',metrics});
 }
 await zoom.close();zoom=null;fs.rmSync(runtime,{recursive:true,force:true});
 const offline=await browser.newContext({offline:true});const op=await offline.newPage();watch(op);await op.goto('file://'+path.join(root,'index.html'));assert.equal(await op.locator('#pythonSource').textContent(),source);await offline.close();
 assert.deepEqual(report.errors,[]);report.result='pass';save();await browser.close();browser=null;console.log(JSON.stringify({result:'pass',finding:report.finding,states:report.states.length,errors:report.errors}));
})().catch(async e=>{report.result='fail';report.failure=e.message;save();if(zoom)await zoom.close();if(browser)await browser.close();console.error(e.message);process.exitCode=1;});
