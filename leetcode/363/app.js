'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,bandTop=0,bandBottom=1,index=0,hand=false,revealed=false,copyState='';
let data=RectLesson.trace(RectLesson.presets[0].matrix,2,bandTop,bandBottom);
const list=a=>'['+a.join(', ')+']',val=v=>v===null?t('none'):String(v);
function render(){
 const input=RectLesson.presets[preset],f=data.frames[index];
 const band=$('band');band.replaceChildren();for(let a=0;a<input.matrix.length;a++)for(let b=a;b<input.matrix.length;b++){const o=document.createElement('option');o.value=a+','+b;o.textContent=t('bandOption',{top:a,bottom:b});o.selected=a===bandTop&&b===bandBottom;band.append(o);}
 $('matrix').style.setProperty('--cols',input.matrix[0].length);$('matrix').replaceChildren();input.matrix.forEach((row,r)=>row.forEach((v,c)=>{const el=document.createElement('span');el.textContent=v;el.setAttribute('aria-label',t('cellLabel',{r,c,v,mark:t(r>=bandTop&&r<=bandBottom?'selectedBand':'outsideBand')}));el.className=r>=bandTop&&r<=bandBottom?'band':'';$('matrix').append(el);}));$('cap').textContent='k = '+input.k;
 $('sums').replaceChildren();data.sums.forEach((v,c)=>{const el=document.createElement('span');el.textContent=t('columnValue',{c,v});el.className=c<index?'done':'';$('sums').append(el);});
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===data.frames.length-1;
 $('progress').textContent=t('progress',{i:index,n:data.sums.length,p:f.prefix,seen:list(f.seen),best:val(f.best),phase:t(index===data.sums.length?'final':'partial')});
 $('ledger').replaceChildren();if(!f.history.length){const el=document.createElement('li');el.textContent=t('logEmpty');$('ledger').append(el);}f.history.forEach(h=>{const el=document.createElement('li');el.textContent=t('log',{col:h.col,v:h.value,p:h.prefix,before:list(h.before),th:h.threshold,eligible:list(h.eligible),q:val(h.q),candidate:val(h.candidate),best:val(h.best)});$('ledger').append(el);});
 $('handReveal').textContent=t(hand?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(hand));$('handAnswer').hidden=!hand;
 const selected=document.querySelector('input[name="prediction"]:checked');$('reveal').disabled=!selected;$('feedback').textContent=revealed?t(selected.value==='1'?'correct':'incorrect')+' '+t('answer'):t(selected?'chosen':'waiting');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
function restart(){index=0;const p=RectLesson.presets[preset];data=RectLesson.trace(p.matrix,p.k,bandTop,bandBottom);render();}
$('preset').onchange=e=>{preset=+e.target.value;bandTop=0;bandBottom=RectLesson.presets[preset].matrix.length-1;restart();};$('band').onchange=e=>{[bandTop,bandBottom]=e.target.value.split(',').map(Number);restart();};
$('prev').onclick=()=>{index--;render();};$('next').onclick=()=>{index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=data.frames.length-1;render();};
$('handReveal').onclick=()=>{hand=!hand;render();};document.querySelectorAll('[name="prediction"]').forEach(el=>el.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(el=>observer.observe(el));
