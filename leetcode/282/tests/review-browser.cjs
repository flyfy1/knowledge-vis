const {chromium}=require('playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');const acorn=require('acorn');
const root=path.resolve(__dirname,'..'), out=path.join(__dirname,'evidence/review5');fs.mkdirSync(out,{recursive:true});
const source=fs.readFileSync(path.join(root,'solution.py'),'utf8');
const ast=acorn.parse(fs.readFileSync(path.join(root,'copy.js'),'utf8'),{ecmaVersion:'latest'});
const obj=ast.body[1].expression.right;const keys=obj.properties.map(p=>p.key.name);assert.equal(new Set(keys).size,keys.length);
for(const prop of obj.properties){assert.equal(prop.value.elements.length,2,prop.key.name);assert(prop.value.elements.every(x=>typeof x.value==='string'),prop.key.name)}
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
const ctx=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:1440,height:1000}});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));const results=[];
await page.goto('http://127.0.0.1:18770/leetcode/282/');
assert.equal(await page.evaluate(()=>window.PYTHON_SOURCE),source);
assert.equal(await page.locator('#code').textContent(),source);
assert.equal(await (await page.request.get('http://127.0.0.1:18770/leetcode/282/solution.py')).text(),source);
const expected=[ [1,'1',1,1],[2,'1+0',1,0],[3,'1+0+5',6,5],[2,'1+0',1,0],[3,'1+0-5',-4,-5],[2,'1+0',1,0],[3,'1+0*5',1,0],[1,'1',1,1],[2,'10',10,10],[3,'10-5',5,-5] ];
for(const lang of ['en','zh']){
 await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#reset').click();
 assert(await page.locator('#prev').isDisabled());
 for(let i=0;i<expected.length;i++){
 const [index,expr,value,last]=expected[i];
 const state=await page.locator('#frameState').textContent();assert(state.includes(`dfs(${index}, '${expr}', ${value}, ${last})`),state);
 assert.equal(await page.locator('#frameLedger span').count(),i+1);
 const highlights=await page.locator('.digit.current small').allTextContents();assert.deepEqual(highlights,index===3?[]:[`i=${index}`]);
 if(i===3||i===5)assert.match(await page.locator('#frameText').textContent(),/Return|返回/);
 if(i===7)assert.match(await page.locator('#frameSlice').textContent(),/05.*break/);
 if(i===9)assert.match(await page.locator('#frameText').textContent(),/answer.append\(expression\)/);
 if(i<9)await page.locator('#next').click();
 }
 assert(await page.locator('#next').isDisabled());const end=await page.locator('#frameState').textContent();await page.locator('#prev').click();await page.locator('#next').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#frameState').textContent(),end);
 const trace=await page.locator('#frameState').textContent();await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert.equal(await page.locator('#frameState').textContent(),trace);await page.locator(`[data-lang="${lang}"]`).click();
 for(const [op,number,formula] of [['+',7,'5 + 2 = 7'],['-',3,'5 − 2 = 3'],['*',8,'5 − 3 + 3 × 2 = 8']]){
 await page.locator(`[data-op="${op}"]`).click();assert.equal(await page.locator('#value').textContent(),'5');assert.equal(await page.locator('#last').textContent(),'3');assert.equal(await page.locator('#nextValue').textContent(),String(number));assert((await page.locator('.formula').textContent()).includes(formula));
 await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert((await page.locator('.formula').textContent()).includes(formula));await page.locator(`[data-lang="${lang}"]`).click();
 }
 for(let mask=0;mask<8;mask++){
 for(let i=0;i<3;i++)await page.locator(`.quiz-options input[value="${i}"]`).setChecked(Boolean(mask&(1<<i)));
 assert(await page.locator('#quizExplain').isHidden());await page.locator('#reveal').click();assert.equal(await page.locator('#quizResult').evaluate(x=>x.classList.contains('result')),mask===3);
 }
 await page.locator('.quiz-options input[value="2"]').uncheck();assert(await page.locator('#quizExplain').isHidden());await page.locator('#reveal').click();
 const quiz=await page.locator('#quizResult').textContent();await page.locator(`[data-lang="${lang==='en'?'zh':'en'}"]`).click();assert(await page.locator('.quiz-options input[value="0"]').isChecked());assert(!(await page.locator('#quizExplain').isHidden()));await page.locator(`[data-lang="${lang}"]`).click();assert.equal(await page.locator('#quizResult').textContent(),quiz);
 for(const preset of ['105|5','232|8','00|0']){await page.selectOption('#verifySelect',preset);assert(!(await page.locator('#verifyText').getAttribute('class')).includes('wrong'));}
 await page.evaluate(()=>{delete navigator.clipboard.writeText;});await page.locator('#copy').click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source);
 await page.evaluate(()=>{navigator.clipboard.writeText=()=>Promise.reject(new Error('forced unavailable'));});await page.locator('#copy').click();assert(await page.locator('#fallbackBox').isVisible());assert.equal(await page.locator('#copyFallback').inputValue(),source);
 await page.locator('#copyFallback').focus();await page.keyboard.press('Control+a');await page.keyboard.press('Control+c');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),source,'native fallback clipboard exact including LF');
 await page.screenshot({path:path.join(out,`${lang}-fallback.png`)});
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();const download=await downloadPromise;assert.equal(fs.readFileSync(await download.path(),'utf8'),source);
 assert.deepEqual(await page.locator('thead th').allTextContents(),lang==='en'?['Quantity','Python','Role']:['量','Python','作用']);
 for(const width of [320,390,736,1440]){
 await page.setViewportSize({width,height:1000});await page.locator('#step1').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width,`${lang} ${width} overflow`);
 await page.screenshot({path:path.join(out,`${lang}-${width}-trace.png`)});
 await page.locator('#step2').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${lang}-${width}-formula.png`)});
 }
 results.push({locale:lang,frames:10,formulaOperators:3,quizCombinations:8,copy:'automatic and native textarea Ctrl+C exact 1036 bytes',download:'exact',widths:[320,390,736,1440]});
}
await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.body.style.zoom='2');await page.locator('#step1').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),1440);await page.screenshot({path:path.join(out,'zoom200.png')});await page.evaluate(()=>document.body.style.zoom='');
// Local-file page uses the same offline mirror; no HTTP server/source fetch is needed.
const offline=await ctx.newPage();await offline.goto('file://'+path.join(root,'index.html'));assert.equal(await offline.locator('#code').textContent(),source);await offline.close();
const color=await page.locator('#reveal').evaluate(e=>({ink:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));
function luminance(rgb){return rgb.match(/\d+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
const contrast=(Math.max(luminance(color.ink),luminance(color.background))+.05)/(Math.min(luminance(color.ink),luminance(color.background))+.05);assert(contrast>=7);
// Storage-denial initialization and keyboard reset remain usable.
const denied=await ctx.newPage();await denied.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')}});await denied.goto('http://127.0.0.1:18770/leetcode/282/');await denied.locator('#next').click();await denied.locator('#reset').focus();await denied.keyboard.press('Space');assert.equal(await denied.locator('#progress').textContent(),'1 / 10');
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({results,errors,sourceBytes:Buffer.byteLength(source),zoom:'1440px CSS zoom 200%; native browser zoom unverified',storageDenied:'pass',offlineLocalFile:'exact source rendered',primaryAction:{...color,contrast},cssBytes:fs.readFileSync(path.join(root,'index.html'),'utf8').split('<style>')[1].split('</style>')[0].length},null,2));await browser.close();console.log('282 review browser regressions passed: both locales, formulas, recursive trace, quiz, exact normal/fallback copy/download, responsive and storage checks');
})().catch(e=>{console.error(e);process.exit(1)});
