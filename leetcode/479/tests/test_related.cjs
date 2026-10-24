'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.LESSON_OUTPUT_DIR||path.join(__dirname,'evidence');
const base=process.env.PREVIEW_ROOT||'http://127.0.0.1:18770';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),checks=[],errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 try {
  for(const lang of ['en','zh']) for(const [key,id] of [['related0',440],['related1',60]]) {
   await page.goto(base+'/leetcode/479/');
   await page.locator(`[data-lang=${lang}]`).click();
   await page.waitForFunction(()=>document.getElementById('progress').textContent.includes('24'));
   const link=page.locator(`a[data-i18n=${key}]`),label=await link.innerText(),href=await link.getAttribute('href');
   await link.scrollIntoViewIfNeeded();
   if(id===440)await page.screenshot({path:path.join(out,lang+'-related-before.png')});
   await link.click();
   await page.waitForLoadState('load');
   await page.waitForFunction(()=>{const y=document.getElementById('step2').getBoundingClientRect().top;return y>=70&&y<140;});
   const actualUrl=page.url(),title=await page.locator('h1').innerText();
   const targetVisible=await page.locator('#step2').isVisible();
   const targetTop=await page.locator('#step2').evaluate(e=>e.getBoundingClientRect().top);
   if(id===440)await page.screenshot({path:path.join(out,lang+'-related-after.png')});
   checks.push({lang,key,label,href,actualUrl,title,targetVisible,targetTop,
    pass:label.startsWith('#'+id)&&href===`../${id}/#step2`&&actualUrl===`${base}/leetcode/${id}/#step2`&&title.includes('#'+id)&&targetVisible});
  }
 } finally {await browser.close();}
 fs.writeFileSync(path.join(out,'related.json'),JSON.stringify({finding:'479-R1-01',authorSelfCheck:true,checks,errors},null,2)+'\n');
 assert.deepEqual(errors,[]);
 assert(checks.every(c=>c.pass),JSON.stringify(checks.filter(c=>!c.pass),null,2));
 console.log('Related-link label, href, click destination, lesson title and target passed in both locales');
})().catch(e=>{console.error(e);process.exitCode=1;});
