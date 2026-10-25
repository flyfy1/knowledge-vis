'use strict';
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=process.env.FROZEN_ROOT,out=process.env.COPY_REVIEW_OUTPUT;
assert.equal(process.platform,'darwin');
const source=fs.readFileSync(path.join(root,'leetcode/745/solution.py'),'utf8');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{
 const browser=await chromium.launch({headless:true});const results=[];
 try {
  for(const locale of ['en','zh']){
   const context=await browser.newContext({permissions:['clipboard-read','clipboard-write'],viewport:{width:390,height:1000}});
   try {
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto('http://127.0.0.1:18770/leetcode/745/');
    await page.locator('[data-lang="'+locale+'"]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),locale==='zh'?'zh-CN':'en');
    assert.equal(await page.locator('#pythonCode').textContent(),source);
    const sentinel='745-independent-'+locale+'-'+crypto.randomUUID();assert.notEqual(sentinel,source);
    await page.evaluate(async text=>{
     await navigator.clipboard.writeText(text);
     if(await navigator.clipboard.readText()!==text)throw new Error('Sentinel seeding failed');
     Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new Error('Independent fallback denial'))});
    },sentinel);
    await page.locator('#copy').click();await page.locator('#manualCopy').waitFor({state:'visible'});
    const selection=await page.locator('#copyText').evaluate(e=>({active:document.activeElement===e,start:e.selectionStart,end:e.selectionEnd,text:e.value}));
    assert.deepEqual(selection,{active:true,start:0,end:source.length,text:source});
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),sentinel);
    await page.keyboard.press('Control+c');await page.waitForTimeout(100);
    const wrongKey=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(wrongKey,sentinel);
    await page.keyboard.press('Meta+c');await page.waitForTimeout(100);
    const actual=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(actual,source);assert.notEqual(actual,sentinel);
    assert.equal(Buffer.compare(Buffer.from(actual,'utf8'),Buffer.from(source,'utf8')),0);
    const message=await page.locator('#copyStatus').textContent();assert(message.includes(locale==='en'?'system copy shortcut':'系统复制快捷键'));
    await page.locator('#copyText').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'fallback-'+locale+'.png')});
    assert.deepEqual(errors,[]);
    results.push({locale,sentinel,seedVerified:true,focus:true,selection:[selection.start,selection.end],sourceLength:source.length,sourceSha256:sha(source),wrongShortcut:'Control+c',wrongShortcutRetainedSentinel:true,actualShortcut:'Meta+c',clipboardSha256:sha(actual),exactCanonicalText:true,exactUtf8Bytes:true,newlineNormalized:false,message,errors});
   } finally {await context.close();}
  }
 } finally {fs.writeFileSync(path.join(out,'focused-results.json'),JSON.stringify({host:process.platform,browser:browser.version(),browserLaunch:'local chromium.launch',results},null,2)+'\n');await browser.close();}
 console.log('Independent fresh-sentinel copy checks passed for en and zh.');
})().catch(e=>{console.error(e);process.exitCode=1});
