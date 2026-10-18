const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{const out=process.env.LESSON_TEST_OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});let b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
for(const [lang,width] of [['en',390],['zh',320],['en',1440]]){
 let p=await b.newPage({viewport:{width,height:1700}});await p.goto(process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18772/leetcode/68/');await p.locator(`[data-lang=${lang}]`).click();await p.locator('#position').fill('8');
 await p.locator('#step2').evaluate(e=>{document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,e.offsetTop-100);});
 await p.screenshot({path:path.join(out,`focused-${lang}-${width}.png`)});await p.close();
}
for(const lang of ['en','zh']){const p=await b.newPage({viewport:{width:780,height:1200}});await p.goto(process.env.LESSON_PREVIEW_URL||'http://127.0.0.1:18772/leetcode/68/');await p.locator(`[data-lang=${lang}]`).click();await p.selectOption('#preset','3');await p.locator('#position').fill('8');await p.evaluate(()=>{document.documentElement.style.zoom='2';document.documentElement.style.scrollBehavior='auto';const e=document.querySelector('#current');window.scrollTo(0,e.getBoundingClientRect().top+scrollY-200);});await p.screenshot({path:path.join(out,`focused-${lang}-zoom200.png`)});await p.close();}
await b.close();})();
