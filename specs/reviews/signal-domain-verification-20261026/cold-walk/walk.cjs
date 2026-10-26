const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = __dirname;
(async () => {
 const browser = await chromium.launch({headless:true,channel:'chrome'});
 const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:18775/sampling/',{waitUntil:'networkidle'});
 await page.screenshot({path:path.join(out,'01-sampling-initial.png'),fullPage:true});
 fs.writeFileSync(path.join(out,'01-sampling-initial.txt'),await page.locator('body').innerText());
 console.log(await page.locator('body').innerText());
 console.log('CONTROLS',await page.locator('button,input,select,a').evaluateAll(nodes=>nodes.map(n=>({tag:n.tagName,text:n.innerText,aria:n.getAttribute('aria-label'),type:n.type,value:n.value,href:n.getAttribute('href')}))));
 await browser.close();
})();
