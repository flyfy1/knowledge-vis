'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,hasB=true,choice=null,revealed=false,copyState='';
let frames=Rect850.trace(Rect850.presets[0]);
function diagram(rects,frame,label){
 const maxX=Math.max(...rects.map(r=>r[2])),maxY=Math.max(...rects.map(r=>r[3]));
 const cell=64,pad=36,w=pad*2+maxX*cell,h=pad*2+maxY*cell;
 let s=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">`;
 for(let y=0;y<maxY;y++)for(let x=0;x<maxX;x++){
  const names=rects.map((r,i)=>r[0]<=x&&x<r[2]&&r[1]<=y&&y<r[3]?String.fromCharCode(65+i):'').join('');
  const px=pad+x*cell,py=pad+(maxY-y-1)*cell;
  s+=`<rect class="cell ${names?'covered':''}" x="${px}" y="${py}" width="${cell}" height="${cell}"/>`;
  if(names)s+=`<text class="cell-label" x="${px+cell/2}" y="${py+cell/2+6}" text-anchor="middle">${names}</text>`;
 }
 if(frame&&frame.left!==undefined)s+=`<rect class="current" x="${pad+frame.left*cell}" y="${pad-4}" width="${(frame.right-frame.left)*cell}" height="${maxY*cell+8}"/>`;
 for(let x=0;x<=maxX;x++)s+=`<text x="${pad+x*cell}" y="${h-10}" text-anchor="middle">${x}</text>`;
 for(let y=0;y<=maxY;y++)s+=`<text x="${pad-12}" y="${pad+(maxY-y)*cell+6}" text-anchor="end">${y}</text>`;
 s+=`<text x="${w-14}" y="${h-10}">x</text><text x="8" y="18">y</text></svg>`;return s;
}
function render(){
 const rects=Rect850.presets[preset],f=frames[index],n=frames.length-1;
 $('handChart').innerHTML=diagram(hasB?Rect850.presets[0]:[Rect850.presets[0][0]],null,t('handLabel',{a:hasB?5:4}));
 $('toggleB').setAttribute('aria-pressed',String(hasB));$('handResult').textContent=t('handResult',{b:t(hasB?'on':'off'),a:hasB?5:4});
 $('input').textContent=t('input',{r:JSON.stringify(rects)});
 $('chart').innerHTML=diagram(rects,index?f:null,t('diagram',{k:index,n}));
 $('position').max=n;$('position').value=index;$('prev').disabled=index===0;$('next').disabled=index===n;
 $('progress').textContent=t('progress',{k:index,n,phase:t(index===0?'initial':index===n?'done':'middle',{l:f.left,r:f.right})});
 const fmt=a=>a.length?a.map(([a,b])=>`[${a},${b})`).join(', '):t('none');
 $('ranges').textContent=index?t('ranges',{raw:fmt(f.raw),merged:fmt(f.merged)}):t('before');
 $('metric').textContent=index?t('metric',{w:f.right-f.left,h:f.height,d:f.delta,b:f.before,a:f.area}):t('before');
 $('empty').hidden=index!==0;$('rows').innerHTML=f.rows.map(r=>`<tr><td>[${r.left},${r.right})</td><td>${r.height}</td><td>${r.delta}</td><td>${r.area}</td></tr>`).join('');
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 $('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('answer'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('toggleB').onclick=()=>{hasB=!hasB;render();};
$('preset').onchange=e=>{preset=Number(e.target.value);frames=Rect850.trace(Rect850.presets[preset]);index=0;render();};
$('next').onclick=()=>{if(index<frames.length-1)index++;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};
$('reset').onclick=()=>{index=0;render();};
$('position').oninput=e=>{index=Number(e.target.value);render();};
for(const el of document.querySelectorAll('[name="prediction"]'))el.onchange=()=>{choice=el.value;revealed=false;render();};
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
 catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}
 $('copyStatus').textContent=t(copyState);
};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)for(const a of document.querySelectorAll('.step-nav a'))a.classList.toggle('active',a.hash==='#'+e.target.id);},{rootMargin:'-10% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(s=>observer.observe(s));
