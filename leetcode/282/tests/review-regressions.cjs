const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage(); const failures=[];
 await page.goto('http://127.0.0.1:18770/leetcode/282/');
 for(const lang of ['en','zh']){
 await page.locator(`[data-lang="${lang}"]`).click();
 await page.locator('[data-op="-"]').click();
 if(!(await page.locator('.formula').textContent()).includes('5 − 2 = 3'))failures.push(`${lang}: L282-FORMULA-001 missing active subtraction`);
 if(!await page.locator('#frameState').count())failures.push(`${lang}: L282-STATE-001 missing rendered recursive state`);
 await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('forced'));});
 await page.locator('#copy').click();
 if(!await page.locator('#copyFallback').count())failures.push(`${lang}: L282-COPY-FALLBACK-001 missing exact selectable value`);
 }
 await browser.close(); assert.deepEqual(failures,[]); console.log('required finding smoke passed');
})().catch(e=>{console.error(e);process.exit(1)});
