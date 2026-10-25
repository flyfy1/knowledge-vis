const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');const O=process.env.EVIDENCE_DIR||path.join(__dirname,'evidence'),URL=process.env.PREVIEW_URL||'http://127.0.0.1:18800/leetcode/1000/';
function lum(rgb){const v=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>(x/=255)<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}
(async()=>{assert.equal(lum('rgb(0,0,0)'),0);assert.equal(lum('rgb(255,255,255)'),1);for(const [s,x]of [['255,0,0',.2126],['0,255,0',.7152],['0,0,255',.0722]])assert.equal(lum('rgb('+s+')'),x);assert((lum('rgb(116,116,116)')+.05)/.05<4.5);
const b=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});const p=await b.newPage(),rows=[];await p.goto(URL);
for(const lang of ['en','zh']){
 await p.locator(`[data-lang=${lang}]`).click();await p.selectOption('#preset','0');
 for(const phase of ['initial','endpoint']){
  if(phase==='endpoint')await p.locator('#end').click();
  for(const sel of ['#prev','#next','#reset','#end','#reveal','#handPrev']){
   const state=await p.locator(sel).evaluate(e=>{const s=getComputedStyle(e);return {disabled:e.disabled,fg:s.color,bg:s.backgroundColor,opacity:s.opacity,text:e.textContent};});const v=[lum(state.fg),lum(state.bg)].sort((a,b)=>a-b),ratio=(v[1]+.05)/(v[0]+.05);assert.equal(state.opacity,'1');assert(ratio>=4.5);rows.push({lang,phase,sel,...state,ratio});
  }
 }
}
fs.writeFileSync(path.join(O,'accessibility.json'),JSON.stringify({kind:'author disabled/endpoint state contrast, calibrated solid sRGB helper',rows,minimumContrast:Math.min(...rows.map(r=>r.ratio))},null,2));await b.close();console.log('Disabled and endpoint contrast passed, min '+Math.min(...rows.map(r=>r.ratio)));})().catch(e=>{console.error(e);process.exit(1)});
