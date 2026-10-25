const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence/r1-fix'));
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:950}}),records=[];
  await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:18783')+'/leetcode/679/');
  for(const lang of ['en','zh']){
   await page.click(`[data-lang=${lang}]`);
   for(let step=0;step<=3;step++){
    assert.match(await page.locator('#handProgress').textContent(),new RegExp(`${step}/3`));
    assert.equal(await page.locator('#handHistory li').count(),step);
    assert.deepEqual(await page.locator('#handGroups b').allTextContents(),[['4','1','8','7'],['1','7','4'],['4','6'],['24']][step]);
    if(step<3)await page.click('#handNext');
   }
   await page.click('#handBack');assert.equal(await page.locator('#handHistory li').count(),2);await page.click('#handNext');await page.click('#handReset');
   await page.selectOption('#preset','1');
   for(let k=0;k<5;k++)await page.click('#next');
   const groups=await page.locator('#groups').innerText(),event=await page.locator('#event').textContent();
   assert.deepEqual(await page.locator('#groups b').allTextContents(),['8','1/3']);
   assert.deepEqual(await page.locator('#groups code').allTextContents(),['8','(3 − (8 ÷ 3))']);
   assert.deepEqual(await page.locator('#groups small').allTextContents(),lang==='en'?['Original cards D','Original cards A, B, C']:['原始牌 D','原始牌 A, B, C']);
   assert(event.includes('(3 − (8 ÷ 3)) = 1/3'));assert.match(await page.locator('#progress').textContent(),/5\/7/);
   await page.click('#prev');await page.click('#next');assert.equal(await page.locator('#event').textContent(),event);
   await page.click(`[data-lang=${lang==='en'?'zh':'en'}]`);await page.click(`[data-lang=${lang}]`);assert.equal(await page.locator('#groups').innerText(),groups);
   await page.check('[name=prediction][value="1"]');await page.click('#reveal');const feedback=await page.locator('#feedback').textContent();
   assert(feedback.includes('(7+8−3)×2=24'));assert.match(feedback,lang==='en'?/−2, 0, or 1/:/−2、0、1/);
   await page.selectOption('#preset','4');assert(await page.locator('#feedback').isVisible());assert.equal(await page.locator('#feedback').textContent(),feedback);
   await page.check('[name=prediction][value="0"]');assert(await page.locator('#feedback').isHidden());
   records.push({lang,fractionFrame:5,groups,event,feedback,handCounts:'0/3 to 3/3; history 0..3; rewind/replay',predictionScope:'independent [2,3,7,8] child; preset keeps feedback; changing answer hides it'});
  }
  fs.writeFileSync(path.join(out,'rendered-contract-results.json'),JSON.stringify({result:'PASS',kind:'author self-check',records},null,2)+'\n');
  console.log('PASS rendered formula, identity/value, operation counts, rewind/replay, prediction scope in both locales');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
