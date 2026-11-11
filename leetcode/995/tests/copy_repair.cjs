const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'evidence/copy-r1');
const base=JSON.parse(fs.readFileSync(path.join(out,'baseline.json')));
const load=text=>{const s={window:{}};vm.runInNewContext(text,s);return s.window.COPY;};
const old=load(base.copy),copy=load(fs.readFileSync(path.join(root,'copy.js'),'utf8'));
const opening='Could another order use fewer flips? Changing the order of these window flips does not change the result. Using one start twice cancels, so a minimum solution uses each start at most once.';
const expectedProof=old.proof[1].replace(/^.*?Inductively,/,opening+' Inductively,');
const expectedLinks=['#330：逐步观察覆盖范围如何扩展','#330: trace how the covered range grows'];
assert.equal(copy.proof[1],expectedProof,'995-A02 plain English opening');
assert.equal(copy.proof[0],old.proof[0]);assert.deepEqual(copy.link2,expectedLinks,'995-A01 truthful continuation');
for(const k of Object.keys(old))if(!['proof','link2'].includes(k))assert.deepEqual(copy[k],old[k],k);
const acorn=require('acorn'),tree=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const props=tree.body[0].expression.right.properties.map(p=>p.key.name||p.key.value);assert.equal(props.length,new Set(props).size,'duplicate localization keys');
for(const [key,pair] of Object.entries(copy)){assert(Array.isArray(pair)&&pair.length===2&&pair.every(s=>typeof s==='string'&&s.length),key);assert.deepEqual((pair[0].match(/\{\w+\}/g)||[]).sort(),(pair[1].match(/\{\w+\}/g)||[]).sort());}
for(const f of ['core.js','solution.py','python-code.js','app.js','style.css','lesson-entry.json'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex'),base.sha256[f],f);
const mirror={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'python-code.js'),'utf8'),mirror);assert.equal(mirror.window.PYTHON_SOURCE,fs.readFileSync(path.join(root,'solution.py'),'utf8'));
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/995/';await page.goto(url);await page.locator('#progress').filter({hasText:'0/3'}).waitFor();
const report={kind:'author focused self-check; findings fixed awaiting independent review',browser:await browser.version(),platform:process.platform,findings:['995-A01','995-A02'],layouts:[],destination:[],state:[]};
for(const lang of ['en','zh']){
 await page.locator(`[data-lang=${lang}]`).click();const li=lang==='en'?1:0;
 assert.equal(await page.locator('[data-i18n=proof]').textContent(),li?expectedProof:old.proof[0]);
 assert.equal(await page.locator('[data-i18n=link2]').textContent(),expectedLinks[li]);
 await page.selectOption('#preset','0');await page.locator('#next').click();await page.locator('#next').click();await page.locator('[name=prediction][value="2"]').check();await page.locator('#reveal').click();
 const snap=async()=>({trace:await page.locator('#bits,#ledger,#event,#progress').allTextContents(),feedback:await page.locator('#feedback').textContent()});const before=await snap();
 await page.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();assert((await page.locator('#progress').textContent()).includes('2/3'));assert(await page.locator('[name=prediction][value="2"]').isChecked());assert(await page.locator('#feedback').isVisible());assert((await page.locator('.formula').textContent()).includes('nums[i] ^ parity'));await page.locator(`[data-lang=${lang}]`).click();assert.deepEqual(await snap(),before);report.state.push({lang,...before});
 for(const width of [320,390,1440])for(const zoom of [1,2]){
  await page.setViewportSize({width,height:1000});await page.evaluate(z=>document.body.style.zoom=z,zoom);
  for(const key of ['proof','link2']){const el=page.locator(`[data-i18n=${key}]`);await el.scrollIntoViewIfNeeded();if(key==='proof')await el.evaluate(e=>window.scrollBy(0,e.getBoundingClientRect().top-document.querySelector('.step-nav').getBoundingClientRect().height-12));await page.waitForTimeout(80);const box=await el.evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth,height:e.clientHeight,scrollHeight:e.scrollHeight,text:e.textContent}));assert(box.scroll<=box.width+1);assert(box.scrollHeight<=box.height+1);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(out,`${lang}-${width}-z${zoom}-${key}.png`)});report.layouts.push({lang,width,zoom,key,...box});}
 }
 await page.evaluate(()=>document.body.style.zoom=1);await page.setViewportSize({width:1440,height:1000});const link=page.locator('[data-i18n=link2]');assert.equal(await link.getAttribute('href'),'../330/#step2');await link.focus();assert.equal(await link.evaluate(e=>getComputedStyle(e).outlineWidth),'3px');await page.keyboard.press('Enter');await page.waitForURL('**/330/#step2');
 // Destination owns separate locale storage: explicitly inspect each language.
 await page.locator(`[data-lang=${lang}]`).click();const heading=await page.locator('#step2 h2').textContent();assert.equal(heading,lang==='en'?'What changes after each consume or patch?':'每次消费或补数后，边界如何改变？');
 await page.locator('#traceReset').click();assert.equal(await page.locator('#afterCoverage').textContent(),'[0, 0]');await page.locator('#traceNext').click();assert.equal(await page.locator('#beforeCoverage').textContent(),'[0, 0]');assert.equal(await page.locator('#afterCoverage').textContent(),'[0, 1]');assert.equal(await page.locator('#ledgerRows tr').count(),1);await page.locator('#traceNext').click();assert.equal(await page.locator('#afterCoverage').textContent(),'[0, 3]');assert.equal(await page.locator('#ledgerRows tr').count(),2);
 report.destination.push({lang,url:page.url(),heading,before:await page.locator('#beforeCoverage').textContent(),after:await page.locator('#afterCoverage').textContent(),operation:await page.locator('#operationRead').textContent(),ledger:await page.locator('#ledgerRows').textContent()});await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-destination.png`)});await page.goto(url);await page.locator('#progress').filter({hasText:'0/3'}).waitFor();
}
assert.deepEqual(errors,[]);report.errors=errors;fs.writeFileSync(path.join(out,'focused.json'),JSON.stringify(report,null,2)+'\n');console.log('995-A01/995-A02 focused checks passed');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
