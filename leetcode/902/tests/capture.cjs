const {chromium}=require('playwright'),path=require('path'),fs=require('fs'),assert=require('assert');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined,headless:true});const p=await b.newPage({viewport:{width:390,height:1100},reducedMotion:'reduce'});await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/902/');const records=[];
for(const lang of ['en','zh']){
 await p.locator(`[data-lang=${lang}]`).click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(out,`${lang}-390-header.png`)});
 await p.selectOption('#preset','0');await p.locator('#next').click();await p.locator('#next').click();
 const branches=await p.locator('#branches').textContent();assert(branches.includes('2^1 = 2'));assert(branches.includes('3 = 3'));
 await p.locator('#operation').evaluate(e=>{scrollTo(0,e.getBoundingClientRect().top+scrollY-100)});await p.screenshot({path:path.join(out,`${lang}-390-first-difference.png`)});
 records.push({lang,input:'D={1,3}, n=31, after first position',branches,accounting:await p.locator('#accounting').textContent()});
 await p.selectOption('#preset','1');await p.locator('#end').click();const stop=await p.locator('#operation').textContent();assert(stop.includes('0'));assert((await p.locator('#result').textContent()).includes('4'));
 await p.locator('#operation').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-100));await p.screenshot({path:path.join(out,`${lang}-390-stop.png`)});records.push({lang,input:'D={1,3}, n=30, terminal',stop,result:await p.locator('#result').textContent()});
 await p.locator('[name=prediction][value="0"]').check();await p.locator('[name=prediction][value="1"]').check();assert(await p.locator('#feedback').isHidden());await p.locator('#reveal').click();await p.locator('#step3').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-90));await p.screenshot({path:path.join(out,`${lang}-390-prediction.png`)});
}
fs.writeFileSync(path.join(out,'semantic-states.json'),JSON.stringify(records,null,2));await b.close();})();
