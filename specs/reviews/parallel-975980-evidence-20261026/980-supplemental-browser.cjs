// Supplemental verification only: never write lesson, report, or acceptance state.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const assert=require('assert/strict'),{execFileSync}=require('child_process');
const {pathToFileURL}=require('url'),{chromium}=require('playwright');
const repo='/home/songyy/projects/leetcode-hard-lane-980-20261026';
const candidate='a440fe53769a1831f8e2f8f4f4bbd0195ff0906c';
const registration='d95031d1b9d90fa9e1cc578c000caef0c6756510';
const git=(...a)=>execFileSync('git',['-C',repo,...a],{encoding:'utf8'}).trim();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const canonical=fs.readFileSync(path.join(repo,'leetcode/980/solution.py'),'utf8');
const canonicalSha=sha(canonical);
assert.equal(canonicalSha,'abe291bca8cc7c644450e598ab5128269691de7dbf2410e3ac9603ea9de9921f');
assert.equal(git('rev-parse','HEAD'),registration);assert.equal(git('status','--porcelain'),'');
const tree=git('rev-parse',candidate+':leetcode/980');assert.equal(tree,git('rev-parse','HEAD:leetcode/980'));
const assets=['index.html','app.js','copy.js','core.js','style.css','solution.py','python-code.js'];
const assetHashes=Object.fromEntries(assets.map(n=>[n,sha(fs.readFileSync(path.join(repo,'leetcode/980',n)))]));
const server=http.createServer((req,res)=>{
 try {let name=path.resolve(repo,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(name!==repo&&!name.startsWith(repo+path.sep)){res.writeHead(403);return res.end();}
  if(fs.statSync(name).isDirectory())name=path.join(name,'index.html');
  const bytes=fs.readFileSync(name);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.py':'text/plain'})[path.extname(name)]||'application/octet-stream'});res.end(bytes);
 } catch(e){res.writeHead(404);res.end('Not found');}
});
(async()=>{
 let browser;
 try {
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
  const rows=[];
  for(const mode of ['storage-unavailable-http','file-source-offline']){
   const context=await browser.newContext();const requests=[],pageErrors=[],badResponses=[],failedRequests=[],externalAttempts=[];
   context.on('request',r=>requests.push(r.url()));context.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
   context.on('requestfailed',r=>failedRequests.push({url:r.url(),failure:r.failure()}));
   await context.route('**/*',async route=>{const u=route.request().url();const allowed=mode==='storage-unavailable-http'?u.startsWith(origin+'/')||u.startsWith('data:'):u.startsWith(pathToFileURL(repo+'/').href)||u.startsWith('data:');if(!allowed){externalAttempts.push(u);await route.abort();}else await route.continue();});
   if(mode==='storage-unavailable-http')await context.addInitScript(()=>{window.__storageThrows=0;Object.defineProperty(window,'localStorage',{get(){window.__storageThrows++;throw new Error('supplemental unavailable storage');}});});
   const page=await context.newPage();page.on('pageerror',e=>pageErrors.push(e.message));
   await page.goto(mode==='storage-unavailable-http'?origin+'/leetcode/980/':pathToFileURL(path.join(repo,'leetcode/980/index.html')).href);
   await page.waitForFunction(()=>document.querySelector('#readout').textContent.length>0);
   const locales=[];
   for(const lang of ['zh','en']){
    await page.locator('[data-lang='+lang+']').click();assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-CN':'en');
    assert.equal(await page.locator('#pythonCode').textContent(),canonical);
    await page.selectOption('#preset','0');await page.locator('#next').click();assert(await page.locator('#prev').isEnabled());
    await page.locator('#reset').click();assert(await page.locator('#prev').isDisabled());
    locales.push({language:lang,identity:await page.locator('h1').innerText(),exactSource:true,nextResetWorked:true});
   }
   const storageThrows=mode==='storage-unavailable-http'?await page.evaluate(()=>window.__storageThrows):null;
   if(storageThrows!==null)assert(storageThrows>0,'Denied getter must actually be exercised');
   assert.deepEqual(pageErrors,[]);assert.deepEqual(badResponses,[]);assert.deepEqual(failedRequests,[]);assert.deepEqual(externalAttempts,[]);
   if(mode==='file-source-offline')assert(requests.every(u=>!/^https?:/.test(u)),'file mode must not request HTTP');
   rows.push({mode,locales,storageThrows,requests:[...new Set(requests)],pageErrors,badResponses,failedRequests,externalAttempts});await context.close();
  }
  assert.equal(git('rev-parse','HEAD'),registration);assert.equal(git('status','--porcelain'),'');assert.equal(git('rev-parse','HEAD:leetcode/980'),tree);
  for(const [n,h]of Object.entries(assetHashes))assert.equal(sha(fs.readFileSync(path.join(repo,'leetcode/980',n))),h);
  console.log(JSON.stringify({observedAt:new Date().toISOString(),kind:'independent supplemental verification after completed review; not a rewrite of prior review',candidate,registration,lessonTree:tree,canonicalSha256:canonicalSha,assetHashes,host:process.platform,node:process.version,chromium:browser.version(),executable:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,temporaryLoopbackOrigin:origin,checks:rows,clipboardUsed:false,checkoutUnchanged:true,passed:true},null,2));
 } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
