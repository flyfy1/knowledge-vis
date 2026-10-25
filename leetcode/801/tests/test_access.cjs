const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const c=await b.newContext({viewport:{width:390,height:1000}});const p=await c.newPage();await p.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/801/');const records=[];
for(const lang of ['zh','en']){
 await p.locator(`[data-lang=${lang}]`).click();
 for(let i=0;i<4;i++)if((await p.locator('#swap'+i).getAttribute('aria-pressed')==='true')!==(i===1))await p.locator('#swap'+i).click();
 await p.locator('#handRead').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`hand-390-${lang}.png`)});
 await p.selectOption('#preset','0');await p.locator('#preset').screenshot({path:path.join(out,`select-390-${lang}.png`)});await p.setViewportSize({width:320,height:1000});await p.locator('#preset').screenshot({path:path.join(out,`select-320-${lang}.png`)});await p.locator('.formula').evaluate(e=>e.scrollIntoView({block:'center'}));await p.locator('.formula').screenshot({path:path.join(out,`formula-320-${lang}.png`)});assert.ok(await p.locator('.formula').evaluate(e=>e.scrollWidth<=e.clientWidth));await p.setViewportSize({width:390,height:1000});await p.locator('#next').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`controls-390-${lang}.png`)});
 await p.locator('#sourceDetails summary').click();await p.locator('#pythonCode').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,`source-390-${lang}.png`)});
 assert.equal(await p.locator('#pythonCode').textContent(),fs.readFileSync(path.resolve(__dirname,'../solution.py'),'utf8'));
 // Observe source styles, all labels on essential native controls, and actual focus.
 const source=await p.locator('#pythonCode').evaluate(e=>({foreground:getComputedStyle(e).color,background:getComputedStyle(e.closest('pre')).backgroundColor}));assert.deepEqual(source,{foreground:'rgb(232, 237, 244)',background:'rgb(9, 14, 22)'});
 await p.locator('#sourceDetails summary').click();await p.locator('#next').focus();assert.equal(await p.locator('#next').evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 records.push({lang,source,buttons:await p.locator('button').evaluateAll(es=>es.map(e=>({text:e.textContent,disabled:e.disabled,height:e.getBoundingClientRect().height}))) });
 assert.ok(records.at(-1).buttons.every(e=>e.text&&e.height>=48));
}
const lum=h=>{const rgb=h.match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
assert.equal(contrast('000000','ffffff'),21);assert.ok(Math.abs(contrast('ff0000','000000')-5.252)<1e-10);assert.ok(Math.abs(contrast('0000ff','000000')-2.444)<1e-10);assert.ok(Math.abs(contrast('00ff00','000000')-15.304)<1e-10);assert.ok(contrast('747474','000000')<4.5);
const sourceRatio=contrast('e8edf4','090e16');assert.ok(sourceRatio>=4.5);fs.writeFileSync(path.join(out,'source-contrast.json'),JSON.stringify({foreground:'#e8edf4',background:'#090e16',ratio:sourceRatio,threshold:4.5,calibration:'black-white, all primaries and near-threshold pass'},null,2));
fs.writeFileSync(path.join(out,'access.json'),JSON.stringify(records,null,2));await b.close();console.log('Supplemental access and source styles PASS');})().catch(e=>{console.error(e);process.exit(1);});
