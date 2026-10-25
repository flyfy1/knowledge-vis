// Focused supplements: all closed select labels, narrow learning diagrams,
// repeated localized identity, and localized links on the narrow target.
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),out=process.env.OUTPUT_DIR||path.join(__dirname,'evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),p=await b.newPage({viewport:{width:320,height:1000},reducedMotion:'reduce'}),url=process.env.LESSON_URL||'http://127.0.0.1:18770/leetcode/878/';
 const fit=[],headings=[],links=[];await p.goto(url);assert((await p.locator('.official-link').boundingBox()).height>=48);await p.locator('pre').first().focus();assert.equal(await p.locator('pre').first().evaluate(e=>getComputedStyle(e).outlineWidth),'3px');
 for(const l of ['zh','en','zh']){
  await p.locator('[data-lang='+l+']').click();const h=await p.locator('h1').textContent();assert.equal(h,l==='zh'?'#878 · 第 N 个神奇数字':'#878 · Nth Magical Number');assert.equal(await p.title(),h);headings.push({locale:l,h1:h,title:await p.title()});
  for(let i=0;i<6;i++){await p.selectOption('#preset',String(i));const budget=await p.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;const text=c.measureText(e.selectedOptions[0].textContent).width;return{label:e.selectedOptions[0].textContent,text,width:e.clientWidth,available:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-20,font:s.font};});assert(budget.text<=budget.available);fit.push({locale:l,preset:i,...budget});}
 }
 for(const l of ['en','zh']){
  await p.locator('[data-lang='+l+']').click();
  await p.locator('#countX').fill('6');await p.locator('#countX').dispatchEvent('input');await p.locator('#countResult').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'count-320-'+l+'.png')});
  await p.selectOption('#preset','0');await p.locator('#next').click();await p.locator('#next').click();
  assert((await p.locator('#tested').textContent()).includes('C(mid)=3+2−1=4'));assert.equal(await p.locator('#afterInterval').textContent(),'[5, 6]');
  await p.locator('#tested').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'trace-320-'+l+'.png')});
  await p.locator('[name=prediction][value="1"]').check();await p.locator('#reveal').click();await p.locator('#feedback').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(out,'prediction-320-'+l+'.png')});
  for(const href of ['../668/#step2','../793/#step2']){const a=p.locator('.related a[href="'+href+'"]'),label=await a.textContent();await a.focus();await p.keyboard.press('Enter');await p.waitForURL('**/'+href.slice(3));const text=await p.locator('#step2').textContent();assert(l==='en'?text.includes('first'):text.includes('第一个'));links.push({locale:l,label,resolved:p.url()});await p.goto(url);await p.locator('[data-lang='+l+']').click();}
 }
 fs.writeFileSync(path.join(out,'access-result.json'),JSON.stringify({result:'pass',browser:await b.version(),platform:process.platform,headings,fit,links},null,2));await b.close();console.log('Narrow access supplements passed');
})().catch(e=>{console.error(e);process.exit(1)});
