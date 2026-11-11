const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{
const out=path.resolve(process.env.OUTPUT_DIR||path.join(__dirname,'evidence'));fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined});
const p=await b.newPage({viewport:{width:320,height:1200},reducedMotion:'reduce'});
await p.goto('http://127.0.0.1:18785/leetcode/903/');
for(const lang of ['zh','en']){
 await p.click(`[data-lang=${lang}]`);await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`${lang}-320-heading.png`)});
 await p.selectOption('#preset','IDID');for(let i=0;i<14;i++)await p.click('#next');
 await p.locator('.stage').evaluate(el=>el.scrollIntoView({block:'start'}));await p.evaluate(()=>scrollBy(0,-90));
 await p.locator('.stage').screenshot({path:path.join(out,`${lang}-320-end-clean.png`)});
}
await b.close();console.log('PASS final captures');
})().catch(e=>{console.error(e);process.exit(1)});
