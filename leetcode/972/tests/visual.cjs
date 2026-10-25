const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true}),p=await b.newPage();const results=[];await p.emulateMedia({reducedMotion:'reduce'});
for(const lang of ['en','zh'])for(const width of [320,390,1440]){
 await p.setViewportSize({width,height:960});await p.goto('http://127.0.0.1:18792/leetcode/972/');await p.click(`[data-lang=${lang}]`);
 await p.locator('a[href="#step2"]').click();await p.waitForTimeout(300);assert(await p.locator('#step2 h2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('nav').getBoundingClientRect().bottom-2));
 await p.selectOption('#preset','5');for(let i=0;i<4;i++)await p.click('#next');
 await p.evaluate(()=>{const el=document.querySelector('#step2 .stage');scrollTo(0,el.getBoundingClientRect().top+scrollY-document.querySelector('nav').offsetHeight-16);});await p.waitForTimeout(300);
 await p.screenshot({path:path.join(OUT,`${lang}-${width}-settled-viewport.png`)});
 const control=await p.locator('#preset').evaluate(e=>({top:e.getBoundingClientRect().top,navBottom:document.querySelector('nav').getBoundingClientRect().bottom,text:e.selectedOptions[0].textContent}));assert(control.top>control.navBottom);
 await p.locator('a[href="#step0"]').click();await p.waitForTimeout(300);await p.click('#add');await p.click('#add');await p.locator('#handRead').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(OUT,`${lang}-${width}-hand-viewport.png`)});
 results.push({lang,width,control,hand:await p.locator('#handRead').textContent()});
}
// Explicit current-row / focus contrasts with independent calibrated values from browser.cjs.
await p.setViewportSize({width:1440,height:1000});await p.locator('a[href="#step2"]').click();await p.click('#reset');for(let i=0;i<4;i++)await p.click('#next');const pairs=await p.evaluate(()=>['.trace-pair li.current','.hint','.step-nav a.active'].map(s=>{const el=document.querySelector(s),c=getComputedStyle(el);let parent=el,bg=c.backgroundColor;while(bg==='rgba(0, 0, 0, 0)'){parent=parent.parentElement;bg=getComputedStyle(parent).backgroundColor;}return {selector:s,foreground:c.color,background:bg};}));
function lum(c){const a=c.match(/\d+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
for(const x of pairs){const a=lum(x.foreground),d=lum(x.background);x.ratio=(Math.max(a,d)+.05)/(Math.min(a,d)+.05);assert(x.ratio>=7);}
results.push({pairs,focusColor:'#ffb454',focusAgainstPanelRatio:(lum('rgb(255,180,84)')+.05)/(lum('rgb(22,27,34)')+.05)});
fs.writeFileSync(path.join(OUT,'visual.json'),JSON.stringify(results,null,2));await b.close();console.log('Settled viewport / anchor / current contrast checks passed');})().catch(e=>{console.error(e);process.exit(1)});
