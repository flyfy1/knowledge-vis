'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.TEST_OUTPUT_DIR||path.join(__dirname,'evidence')),root=path.resolve(__dirname,'..');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const page=await browser.newPage({viewport:{width:320,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18793')+'/leetcode/220/');
 let states=0;
 for(const lang of ['en','zh']){
  await page.locator('[data-lang='+lang+']').click();
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:path.join(out,'header-'+lang+'-320.png')});
  for(const width of [320,390]){
   await page.setViewportSize({width,height:1000});
   for(let p=0;p<8;p++){
    await page.locator('#preset').selectOption(String(p));await page.locator('#end').click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.deepEqual(await page.locator('.bucket,.chips li').evaluateAll(es=>es.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent)),[]);
    states++;
   }
  }
  await page.setViewportSize({width:320,height:1000});
  await page.locator('#preset').selectOption('7');await page.locator('#end').click();
  await page.locator('#values').scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(out,'extremes-'+lang+'-320.png')});
 }
 const smallControls=await page.locator('button,select,.step-nav a').evaluateAll(es=>es.filter(e=>{let b=e.getBoundingClientRect();return b.width<48||b.height<48;}).map(e=>e.id||e.textContent));
 assert.deepEqual(smallControls,[]);
 await page.locator('#position').focus();
 await page.keyboard.press('Home');assert.equal(await page.locator('#position').inputValue(),'0');
 await page.keyboard.press('End');assert.equal(await page.locator('#position').inputValue(),await page.locator('#position').getAttribute('max'));
 // True offline opening: local scripts/styles and embedded source, no HTTP.
 await page.goto('file://'+path.join(root,'index.html'));
 await page.waitForFunction(()=>document.querySelector('#event').textContent.length>10);
 assert.equal(await page.locator('#pythonCode').textContent(),fs.readFileSync(path.join(root,'solution.py'),'utf8'));
 await page.locator('#next').click();assert.equal(await page.locator('#position').inputValue(),'1');
 await page.locator('[data-lang=zh]').click();
 assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
 assert.deepEqual(errors,[]);
 const result={kind:'author browser self-check',narrowPresetFinalStates:states,minimumControl48px:true,rangeKeyboardEndpoints:true,fileProtocolOfflineSourceAndInteraction:true,errors};
 fs.writeFileSync(path.join(out,'browser-extra-results.json'),JSON.stringify(result,null,2)+'\n');
 console.log(result);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
