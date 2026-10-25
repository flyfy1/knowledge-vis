const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert');
const base=process.env.REVIEW_BASE, out='/tmp/home-inline-independent-review';
fs.mkdirSync(out,{recursive:true});
const records=[];
const valid={id:51,title:{zh:'N 皇后',en:'N-Queens'},desc:{zh:'测试课程说明。',en:'A lesson description.'},topics:[{zh:'回溯',en:'Backtracking'}],difficulty:'hard',path:'51/',leetcodeUrl:'https://leetcode.com/problems/n-queens/',language:'Python',complexity:'O(n!)'};
const body=x=>'window.LEETCODE_PROBLEMS = '+JSON.stringify(x)+';';
(async()=>{const b=await chromium.launch({headless:true});try{
 const c=await b.newContext({viewport:{width:320,height:900}}),p=await c.newPage();
 const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(base+'/?other=kept#anchor');
 assert.equal(await p.locator('.lesson-card').count(),0);
 await p.locator('[data-cat="leetcode"]').click();await p.locator('.lesson-card').first().waitFor();
 records.push({case:'actual-local-registry',count:await p.locator('.lesson-card').count(),status:await p.locator('#resultCount').innerText(),url:p.url(),overflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 await p.locator('#problemSearch').fill('＃５１');assert.equal(await p.locator('.lesson-card:visible').count(),1);assert.equal(await p.locator('.lesson-card:visible').getAttribute('data-problem-id'),'51');
 const input=await p.locator('#problemSearch').elementHandle();
 await p.locator('#langToggle [data-lang="en"]').click();assert(await input.evaluate(e=>e===document.querySelector('#problemSearch')));assert.equal(await p.locator('.lesson-card:visible').count(),1);
 await p.screenshot({path:out+'/en-320.png',fullPage:true});
 await p.locator('[data-cat="all"]').click();await p.goBack();assert.equal(await p.locator('#problemSearch').inputValue(),'＃５１');assert.equal(await p.locator('.lesson-card:visible').count(),1);
 await p.locator('.lesson-card:visible .lesson-link').click();await p.waitForURL('**/leetcode/51/');await p.goBack();await p.locator('.lesson-card:visible').first().waitFor();assert.equal(await p.locator('#problemSearch').inputValue(),'＃５１');
 await p.locator('#problemSearch').dispatchEvent('compositionstart');
 await p.locator('#problemSearch').evaluate(e=>{e.value='不存在';e.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});
 assert.equal(await p.locator('.lesson-card:visible').count(),1);assert(p.url().includes('q='));
 await p.locator('#problemSearch').dispatchEvent('compositionend');assert.equal(await p.locator('.lesson-card:visible').count(),0);
 await p.locator('#clearSearch').click();assert(await p.locator('#problemSearch').evaluate(e=>document.activeElement===e));
 records.push({case:'search-history-ime-clear',status:'passed',errors});await c.close();

 for(const [name,data] of [['empty',[]],['blank-fields',[{...valid,title:{zh:'',en:''},desc:{zh:' ',en:''},language:'',complexity:'',topics:[{zh:'',en:''}]}]],['bad-url',[{...valid,leetcodeUrl:'javascript:alert(1)'}]],['duplicate',[valid,valid]]]){
  const c=await b.newContext(),p=await c.newPage();await p.route('**/leetcode/problems.config.js?*',r=>r.fulfill({contentType:'text/javascript',body:body(data)}));
  await p.goto(base+'/?category=leetcode');await p.waitForFunction(()=>!document.querySelector('#resultCount').textContent.includes('读取')&&!document.querySelector('#resultCount').textContent.includes('Loading'));
  records.push({case:name,error:await p.locator('#sectionError').isVisible(),cards:await p.locator('.lesson-card').count(),status:await p.locator('#resultCount').innerText(),headings:await p.locator('.lesson-card h2').allTextContents()});
  if(name==='blank-fields')await p.screenshot({path:out+'/blank-fields.png',fullPage:true});await c.close();
 }

 {const c=await b.newContext(),p=await c.newPage();let release,requests=0;const hold=new Promise(r=>release=r);await p.route('**/leetcode/problems.config.js?*',async r=>{requests++;await hold;await r.fulfill({contentType:'text/javascript',body:body([valid])});});await p.goto(base+'/?category=leetcode&q=51');await p.locator('[data-cat="all"]').click();await p.locator('#langToggle [data-lang="en"]').click();release();await p.waitForTimeout(150);assert.equal(await p.locator('.lesson-card').count(),0);await p.locator('[data-cat="leetcode"]').click();await p.locator('.lesson-card').waitFor();records.push({case:'delayed-category-locale',requests,status:await p.locator('#resultCount').innerText(),query:await p.locator('#problemSearch').inputValue(),heading:await p.locator('.lesson-card h2').innerText()});await c.close();}

 {const c=await b.newContext(),p=await c.newPage();let requests=0;await p.route('**/leetcode/problems.config.js?*',r=>{requests++;return r.fulfill(requests===1?{status:503,body:'Unavailable'}:{contentType:'text/javascript',body:body([valid])});});await p.goto(base+'/?category=leetcode&q=51');await p.locator('#sectionError').waitFor({state:'visible'});await p.locator('#retryLessons').click();await p.locator('.lesson-card').waitFor();records.push({case:'retry',requests,focus:await p.locator('#problemSearch').evaluate(e=>document.activeElement===e),query:await p.locator('#problemSearch').inputValue(),error:await p.locator('#sectionError').isVisible()});await c.close();}

 {const c=await b.newContext({viewport:{width:320,height:900}}),p=await c.newPage();await p.goto('file:///Users/songyy/Documents/knowledge-vis/index.html?category=leetcode&q=51');await p.locator('.lesson-card:visible').waitFor();records.push({case:'file',count:await p.locator('.lesson-card:visible').count(),href:await p.locator('.lesson-card:visible .lesson-link').getAttribute('href')});await c.close();}
 }finally{await b.close();fs.writeFileSync(out+'/results.json',JSON.stringify(records,null,2));console.log(JSON.stringify(records,null,2));}})().catch(e=>{console.error(e);process.exitCode=1});
