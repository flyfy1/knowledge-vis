const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}),rows=[];try{
 const p=await b.newPage({reducedMotion:'reduce'});await p.goto(process.env.PREVIEW_URL+'/leetcode/675/');
 for(const width of [320,390])for(const zoom of [1,2])for(const lang of ['en','zh']){
  await p.setViewportSize({width,height:1000});await p.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);await p.locator(`[data-lang=${lang}]`).click();
  for(const preset of ['1','2','4']){
   await p.selectOption('#preset',preset);await p.locator(`[data-lang=${lang==='en'?'zh':'en'}]`).click();await p.locator(`[data-lang=${lang}]`).click();assert.equal(await p.locator('#preset').inputValue(),preset);
   const m=await p.locator('#preset').evaluate(e=>{const s=getComputedStyle(e),c=document.createElement('canvas').getContext('2d');c.font=s.font;const label=e.selectedOptions[0].textContent;return {label,font:s.font,fontSize:parseFloat(s.fontSize),width:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),height:e.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom),textWidth:c.measureText(label).width,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,fieldSizing:s.fieldSizing};});
   // Necessary lower bound only: even ignoring the native arrow, this text
   // needs ceil(text width / content width) lines. Screenshot review is still required.
   m.minimumLines=Math.max(1,Math.ceil(m.textWidth/m.width));m.minimumHeight=m.minimumLines*m.fontSize;m.fits=m.height+1>=m.minimumHeight&&m.scrollWidth<=m.clientWidth&&m.scrollHeight<=m.clientHeight;
   rows.push({width,zoom,lang,preset,...m});
  }
 }
 const data={candidate:process.env.CANDIDATE,browser:b.version(),platform:process.platform,method:'Necessary multiline content-height lower bound without arrow reservation; does not replace visual inspection',records:rows,failures:rows.filter(x=>!x.fits)};fs.writeFileSync(path.join(process.env.OUTPUT_DIR,'wrap-height-results.json'),JSON.stringify(data,null,2));console.log(JSON.stringify({checks:rows.length,failures:data.failures.length}));assert.equal(data.failures.length,0);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
