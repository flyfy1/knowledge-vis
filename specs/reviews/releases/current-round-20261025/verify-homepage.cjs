const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict'),path=require('path');
(async()=>{
 const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),out=process.argv[3];fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const observations=[],errors=[];
 try{
 const page=await browser.newPage({viewport:{width:390,height:1000}});page.on('pageerror',e=>errors.push(String(e)));
 const response=await page.goto('https://visual.integ.life/?category=leetcode',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
 await page.locator('[data-problem-id]').first().waitFor();assert.equal(await page.locator('[data-problem-id]').count(),input.total);
 for(const lang of ['zh','en']){
  await page.locator(`[data-lang=${lang}]`).click();
  for(const item of input.entries){
   await page.locator('#problemSearch').fill('#'+item.id);
   const visible=page.locator('[data-problem-id]:visible');assert.equal(await visible.count(),1);
   const card=page.locator(`[data-problem-id="${item.id}"]`);assert(await card.isVisible());
   assert((await card.locator('h2').innerText()).includes('#'+item.id));
   assert.equal(await card.locator('.official-link').getAttribute('href'),item.leetcodeUrl);
   const link=await card.locator('.lesson-link').getAttribute('href');assert.equal(link,`https://visual.integ.life/leetcode/${item.id}/`);
   observations.push({lang,id:item.id,heading:await card.locator('h2').innerText(),count:await page.locator('#resultCount').innerText(),href:link,official:item.leetcodeUrl});
  }
  await page.locator('#problemSearch').fill('#803');await page.screenshot({path:path.join(out,`homepage-${lang}-390.png`),fullPage:true});
 }
 await page.locator('.lesson-card:not([hidden]) .lesson-link').click();await page.waitForURL('**/leetcode/803/');assert((await page.locator('h1').innerText()).includes('803'));
 await page.goto('https://visual.integ.life/?category=leetcode',{waitUntil:'domcontentloaded'});await page.locator('[data-problem-id]').first().waitFor();await page.locator('[data-lang=zh]').click();assert.equal(await page.locator('[data-problem-id]:visible').count(),input.total);
 assert.equal(errors.length,0);fs.writeFileSync(path.join(out,'homepage.json'),JSON.stringify({status:'passed',url:page.url(),total:input.total,observations,errors,scope:'Ordinary public URLs in Chromium, both locales, 390px, exact ID search and links; no cache-busting query'},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
