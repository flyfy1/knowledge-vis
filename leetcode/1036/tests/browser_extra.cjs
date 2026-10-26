const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const OUT=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});try{
const p=await b.newPage();await p.goto(process.env.PREVIEW_URL||'http://127.0.0.1:18770/leetcode/1036/');const rows=[];
for(const lang of ['zh','en'])for(const zoom of [1,2]){
await p.setViewportSize({width:320,height:1000});await p.evaluate(z=>document.body.style.zoom=z,zoom);await p.locator(`[data-lang=${lang}]`).click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(OUT,`header-${lang}-zoom${zoom}.png`)});
await p.selectOption('#preset','5');await p.locator('#next').click();await p.locator('#board').scrollIntoViewIfNeeded();
await p.screenshot({path:path.join(OUT,`far-${lang}-zoom${zoom}.png`)});
const g=await p.evaluate(()=>{const s=document.getElementById('preset'),style=getComputedStyle(s),canvas=document.createElement('canvas'),c=canvas.getContext('2d');c.font=style.font;return {overflow:document.documentElement.scrollWidth>innerWidth,cells:[...document.querySelectorAll('.cell')].map(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight})),selected:s.selectedOptions[0].text,textWidth:c.measureText(s.selectedOptions[0].text).width,available:s.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-20,font:style.font};});assert(!g.overflow);assert(g.cells.every(e=>e.sw<=e.w+1&&e.sh<=e.h+1));assert(g.textWidth<=g.available);rows.push({lang,zoom,...g});
// Keyboard scroll reaches the far column without changing the search state.
const before=await p.locator('#state').textContent();await p.locator('.board-wrap').focus();for(let k=0;k<20;k++)await p.keyboard.press('ArrowRight');await p.waitForTimeout(100);const scrolled=await p.locator('.board-wrap').evaluate(e=>e.scrollLeft);assert(scrolled>0);await p.evaluate(()=>{const r=document.getElementById('board').getBoundingClientRect();scrollBy(0,r.top-document.querySelector('.step-nav').getBoundingClientRect().bottom-100);});await p.screenshot({path:path.join(OUT,`far-scrolled-${lang}-zoom${zoom}.png`)});assert.equal(await p.locator('#state').textContent(),before);
}
await p.evaluate(()=>document.body.style.zoom=1);await p.setViewportSize({width:1440,height:1000});await p.locator('[data-lang=en]').click();await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(OUT,'desktop-overview.png')});
fs.writeFileSync(path.join(OUT,'browser-extra.json'),JSON.stringify({kind:'author self-check',status:'passed',checks:rows},null,2));console.log('Extra layout, selected-value fit and keyboard scrolling checks passed.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
