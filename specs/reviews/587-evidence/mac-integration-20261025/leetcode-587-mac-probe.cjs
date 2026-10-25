const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const out=process.env.OUTPUT_DIR||'/tmp/leetcode-587-mac-probe';fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{});const p=await b.newPage();
 await p.goto(process.env.PREVIEW_URL+'/leetcode/587/');
 await p.addStyleTag({content:'html{scroll-behavior:auto!important}'});
 await p.locator('#progress').filter({hasText:'0/'}).waitFor();
 const rows=[];
 for(const width of [1365,320,390]){
  await p.setViewportSize({width,height:950});
  for(const lang of ['en','zh']){
   await p.locator('[data-lang='+lang+']').click();
   for(let i=0;i<6;i++){
    await p.selectOption('#preset',String(i));
    const r=await p.locator('#preset').evaluate(el=>{
     const s=getComputedStyle(el),c=document.createElement('canvas').getContext('2d');c.font=s.font;
     const text=el.selectedOptions[0].textContent;
     return {text,font:s.font,fontFamily:s.fontFamily,fontSize:s.fontSize,clientWidth:el.clientWidth,paddingLeft:s.paddingLeft,paddingRight:s.paddingRight,textWidth:c.measureText(text).width,available:el.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-16};
    });
    rows.push({width,lang,preset:i,...r,pass:r.textWidth<=r.available});
    if(r.textWidth>r.available){await p.locator('#preset').scrollIntoViewIfNeeded();await p.screenshot({path:`${out}/${lang}-${width}-${i}.png`});}
   }
  }
 }
 fs.writeFileSync(out+'/results.json',JSON.stringify(rows,null,2));
 console.log(JSON.stringify({failures:rows.filter(r=>!r.pass),browser:await b.version(),output:out}));
 await b.close();if(rows.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
