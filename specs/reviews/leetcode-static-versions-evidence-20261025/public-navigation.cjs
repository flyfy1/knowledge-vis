const {chromium}=require('playwright');
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 try {
  const page=await browser.newPage({acceptDownloads:true});
  await page.goto('https://visual.integ.life/leetcode/780-codex/',{waitUntil:'domcontentloaded'});
  await page.locator('#addY').click();await page.locator('#addX').click();await page.locator('#addY').click();
  const pathText=await page.locator('#handPath').innerText();assert.match(pathText,/3,\s*5/);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('a[download]').click();
  const file=await (await downloadPromise).path();
  const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
  const downloaded=digest(fs.readFileSync(file)),expected=digest(fs.readFileSync('leetcode/780/solution.py'));
  assert.equal(downloaded,expected);
  await page.goto('https://visual.integ.life/leetcode/632-codex/',{waitUntil:'domcontentloaded'});
  await page.locator('.heap-link').click();
  await page.waitForURL('https://visual.integ.life/leetcode/23-codex/#step2',{waitUntil:'domcontentloaded'});
  const crossLink=page.url();
  await page.goBack({waitUntil:'domcontentloaded'});
  assert.equal(page.url(),'https://visual.integ.life/leetcode/632-codex/');
  await page.goto('https://visual.integ.life/leetcode/780-codex/index.html',{waitUntil:'domcontentloaded'});
  assert.match(await page.locator('h1').innerText(),/780/);
  console.log(JSON.stringify({status:'pass',interactive_addition_path:pathText,download_sha256:downloaded,cross_link:crossLink,back_preserved:true,explicit_index:page.url()},null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
