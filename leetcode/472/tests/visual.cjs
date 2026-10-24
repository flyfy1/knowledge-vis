const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const p=await b.newPage({viewport:{width:390,height:900}});await p.goto('http://127.0.0.1:18770/leetcode/472/');
 for(const lang of ['en','zh']){await p.click(`[data-lang=${lang}]`);await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.screenshot({path:path.join(out,`header-${lang}.png`)});
 await p.locator('[name=prediction][value="1"]').check();await p.click('#reveal');await p.locator('#step3').screenshot({path:path.join(out,`prediction-${lang}.png`)});
 await p.selectOption('#preset','4');await p.locator('#position').fill('7');await p.locator('#ledger').screenshot({path:path.join(out,`partial-${lang}.png`)});
 const text=await p.locator('#ledger').textContent();assert.ok(text.includes(lang==='en'?'partial':'检验中'));assert.ok(text.includes('?'));
 }
 await b.close();console.log('Visual captures: headers, fresh predictions, partial/unknown prefix states in both locales.');})().catch(e=>{console.error(e);process.exit(1);});
