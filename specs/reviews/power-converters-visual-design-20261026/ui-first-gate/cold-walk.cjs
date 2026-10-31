const { chromium } = require('playwright');
const fs = require('fs');
const crypto = require('crypto');
const out = __dirname;
(async () => {
 const browser = await chromium.launch({ headless: true, channel: 'chrome' });
 const log = [];
 try {
 for (const [origin,url] of [['online','https://visual.integ.life/power-converters/'],['local','http://127.0.0.1:18775/power-converters/']]) {
  for (const lang of ['EN','中']) {
   const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
   await page.goto(url,{waitUntil:'networkidle'});
   await page.getByRole('button',{name:lang,exact:true}).click();
   for (const [step,type] of [[4,'buck'],[5,'boost']]) {
    const section=page.locator(`#step${step}`), svg=section.locator('svg').first();
    await page.locator(`a[href="#step${step}"]`).click();
    await page.screenshot({path:`${out}/${origin}-${lang}-${type}-entry.png`});
    const record=async(label)=>{
     const buf=await svg.screenshot({path:`${out}/${origin}-${lang}-${type}-${label}.png`});
     log.push({origin,lang,type,label,hash:crypto.createHash('sha256').update(buf).digest('hex'),values:await section.locator('output').allTextContents(),state:(await section.innerText()).split('\n').filter(s=>/µs|S ON|S OFF|闭合|断开|导通|充电|放电/.test(s))});
    };
    await record('start');
    await page.waitForTimeout(600);await record('idle600ms');
    const duty=section.locator('input[type=range]').nth(1);
    for(const [key,label] of [['Home','duty20'],['End','duty75'],['Home','duty20-again']]){await duty.focus();await duty.press(key);await record(label);}
    for(let i=1;i<=4;i++){await section.locator('button').first().click();await record(`phase${i}`);}
    await section.locator('button').nth(1).click();await record('reset');
   }
   await page.close();
  }
 }
 for (const width of [390,320]) for(const lang of ['EN','中']){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:18775/power-converters/',{waitUntil:'networkidle'});await page.getByRole('button',{name:lang,exact:true}).click();
  for(const [step,type]of [[4,'buck'],[5,'boost']]){
   await page.locator(`a[href="#step${step}"]`).click();await page.screenshot({path:`${out}/mobile${width}-${lang}-${type}-entry.png`});
   const section=page.locator(`#step${step}`);await section.locator('svg').first().screenshot({path:`${out}/mobile${width}-${lang}-${type}-circuit.png`});
   await section.locator('button').first().click();await section.locator('button').first().click();
   await section.locator('svg').first().screenshot({path:`${out}/mobile${width}-${lang}-${type}-off.png`});
   log.push({origin:'local',width,lang,type,horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),svgRendered:await section.locator('svg').first().boundingBox(),phase:await section.locator('svg').first().textContent()});
  }
  await page.close();
 }
 }finally{await browser.close();fs.writeFileSync(`${out}/walk-observations.json`,JSON.stringify(log,null,2));}
 console.log(JSON.stringify({records:log.length,staticIdle:log.filter(x=>x.label==='start').map(x=>({origin:x.origin,lang:x.lang,type:x.type,unchangedAt600ms:x.hash===log.find(y=>y.origin===x.origin&&y.lang===x.lang&&y.type===x.type&&y.label==='idle600ms').hash})),mobile:log.filter(x=>x.width)}));
})();
