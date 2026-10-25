/* 630-MAC-002: negative controls distinguish stale data from real manual transfer. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../solution.py'),'utf8');
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{
  const records=[];
  for(const lang of ['en','zh'])for(const mode of ['stale-source-no-action','sentinel-no-action','sentinel-host-copy']){
   const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
   const page=await context.newPage();
   await page.goto((process.env.PREVIEW_ROOT||'http://127.0.0.1:18770')+'/leetcode/630/');
   await page.locator(`[data-lang=${lang}]`).click();
   const hostPlatform=await page.evaluate(()=>navigator.platform);
   const shortcut=/Mac/.test(hostPlatform)?'Meta+C':'Control+C';
   const seed=mode==='stale-source-no-action'?source:'630-MAC-002 distinct clipboard sentinel';
   await page.evaluate(async seed=>{
    await navigator.clipboard.writeText(seed);
    const readText=navigator.clipboard.readText.bind(navigator.clipboard);
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{readText,writeText:async()=>{throw Error('intentional fallback');}}});
   },seed);
   await page.locator('#copyPython').click();
   assert.equal(await page.locator('#manualSource').inputValue(),source);
   const selection=await page.locator('#manualSource').evaluate(e=>[e.selectionStart,e.selectionEnd,document.activeElement===e]);
   assert.deepEqual(selection,[0,source.length,true]);
   if(mode==='sentinel-host-copy')await page.keyboard.press(shortcut);
   const value=await page.evaluate(()=>navigator.clipboard.readText());
   records.push({lang,mode,hostPlatform,shortcut,selection,equalsSource:value===source,unchangedFromSeed:value===seed});
   await context.close();
  }
  for(const start of [0,3]){
  assert(records[start].equalsSource&&records[start].unchangedFromSeed,'reproduce historical false positive');
  assert(!records[start+1].equalsSource&&records[start+1].unchangedFromSeed,'omitting copy must fail source equality');
  assert(records[start+2].equalsSource&&!records[start+2].unchangedFromSeed,'host shortcut must transfer source');
  }
  const report={finding:'630-MAC-002',kind:'author negative-control self-check',platform:process.platform,browser:browser.version(),records,result:'pass'};
  fs.mkdirSync(process.env.OUTPUT_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.OUTPUT_DIR,'clipboard-transfer.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
