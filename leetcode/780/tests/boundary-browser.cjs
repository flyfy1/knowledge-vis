'use strict';
const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
(async()=>{
const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
try{
const page=await b.newPage({viewport:{width:320,height:1000}}),report=[];
await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/780/');
const tabs=[];for(let i=0;i<4;i++){await page.keyboard.press('Tab');tabs.push(await page.evaluate(()=>({tag:document.activeElement.tagName,lang:document.activeElement.dataset.lang||'',href:document.activeElement.getAttribute('href'),height:document.activeElement.getBoundingClientRect().height})));}
assert.equal(tabs[0].href,'../');assert.equal(tabs[1].lang,'zh');assert.equal(tabs[2].lang,'en');assert(tabs[3].href.endsWith('/reaching-points/'));assert(tabs.every(t=>t.height>=48));report.push({tabOrder:tabs});
for(const width of [320,390])for(const l of ['en','zh']){
await page.setViewportSize({width,height:1000});await page.locator(`[data-lang=${l}]`).click();
for(const preset of ['3','5','7','8']){
await page.locator('#preset').selectOption(preset);await page.locator('#end').click();
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));report.push({width,locale:l,preset,readout:await page.locator('#frameRead').textContent(),operation:await page.locator('#operation').textContent()});
}
if(width===320){await page.locator('#preset').selectOption('7');await page.locator('#end').click();await page.locator('#step2 .stage').screenshot({path:path.join(OUT,`large-${l}-320.png`),style:'.step-nav{visibility:hidden!important}'});}
await page.locator('#handReset').click();await page.locator('#addY').click();await page.locator('#addX').click();await page.locator('#addY').click();if(width===320)await page.locator('#step0 .stage').screenshot({path:path.join(OUT,`hand-${l}-320.png`),style:'.step-nav{visibility:hidden!important}'});
for(const selector of ['.back-link','.related a','summary','button','.step-nav a'])for(const el of await page.locator(selector).all())assert((await el.boundingBox()).height>=48,selector);
}
fs.writeFileSync(path.join(OUT,'boundary-browser.json'),JSON.stringify(report,null,2)+'\n');console.log('Boundary/Tab/48px checks passed; 16 narrow terminal cases and 4 screenshots.');
}finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1);});
