'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
const url=process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/770/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try{
 const page=await browser.newPage({viewport:{width:320,height:1000}});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.waitForFunction(()=>document.querySelector('#progress').textContent);
 await page.selectOption('#preset','3');await page.click('#next');await page.locator('#sourceDetails').evaluate(x=>x.open=true);const targets=[];
 for(const lang of ['zh','en','zh']){
  await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('h1').textContent(),lang==='zh'?'#770 · 基本计算器 IV':'#770 · Basic Calculator IV');assert.equal(await page.title(),await page.locator('h1').textContent());assert.equal(await page.locator('#preset').inputValue(),'3');assert((await page.locator('#progress').textContent()).includes('1/'));assert(await page.locator('#sourceDetails').evaluate(x=>x.open));assert.equal(await page.evaluate(()=>document.activeElement.dataset.lang),lang);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(OUT,`${lang}-320-heading.png`)});
 }
 for(const lang of ['en','zh']){
  await page.click(`[data-lang=${lang}]`);
  for(let i=0;i<2;i++){
   const link=page.locator('.related a').nth(i),label=await link.textContent(),href=await link.getAttribute('href');await link.focus();await page.keyboard.press('Enter');await page.waitForURL('**/'+(i===0?'224':'726')+'/#step2');await page.waitForFunction(()=>document.querySelector('#step2 p')?.textContent.length>0);
   const text=await page.locator('#step2').textContent();assert(text.includes(i===0?'total':(lang==='en'?'dictionary':'字典')));assert(text.includes(i===0?'sign':(lang==='en'?'parent':'父')));
   const folder=i===0?'224':'726';const hashes={};for(const file of ['index.html','copy.js'])hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,'..',folder,file))).digest('hex');
   targets.push({locale:lang,label,href,resolved:page.url(),targetHashes:hashes,observedSection:text,observation:i===0?'Tracks nested-parenthesis subtotal and sign, saving/restoring outer contexts.':'Combines per-name child counts into the parent dictionary after a group multiplier.'});
   await page.goBack();await page.waitForFunction(()=>document.querySelector('#progress')?.textContent.length>0);
  }
  await page.selectOption('#preset','4');await page.click('#end');assert((await page.locator('#output').textContent()).endsWith('[]'));assert.equal(await page.locator('#result').textContent(),lang==='en'?'Empty map = zero':'空表 = 零');await page.locator('#result').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-zero.png`)});
  await page.selectOption('#preset','6');await page.click('#end');assert((await page.locator('#output').textContent()).endsWith('[]'));await page.locator('#input').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${lang}-substitution.png`)});
 }
 // file:// opens all source and trace assets without an HTTP code fetch.
 const offline=await browser.newPage();await offline.goto('file://'+path.join(ROOT,'index.html'));await offline.waitForFunction(()=>document.querySelector('#progress').textContent);assert.equal(await offline.locator('#pythonCode').textContent(),fs.readFileSync(path.join(ROOT,'solution.py'),'utf8'));await offline.click('#end');assert((await offline.locator('#output').textContent()).includes('1*a*a'));
 fs.writeFileSync(path.join(OUT,'additional-browser-results.json'),JSON.stringify({result:'pass',host:process.platform,viewport:320,headingRoundtrip:'zh → en → zh, state/disclosure/focus preserved',relatedTargets:targets,offlineSource:'exact and trace operational via file://',boundaries:'zero and negative/zero multi-letter substitutions in both locales'},null,2));
 console.log('Additional browser checks passed: narrow heading, locale/disclosure/focus, keyboard related links, zero/substitution, offline source.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
