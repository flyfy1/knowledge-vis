'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY), t=locale.t;
const $=id=>document.getElementById(id);
let preset=0,index=0,model=Squareful.trace(Squareful.presets[0]),revealed=false,choice=null,copyState='';
function render(){
 const f=model.frames[index];
 $('presetDescription').textContent=t('preset'+preset);
 $('progress').textContent=t('progress',{i:index,n:model.frames.length-1,count:f.accepted.length});
 let reason=f.sum===null?t('first'):t('pair',{sum:f.sum});
 $('operation').textContent=t(f.kind,{x:f.x,sum:f.sum,count:f.accepted.length,reason});
 $('path').replaceChildren();
 if(!f.path.length)$('path').textContent=t('empty');
 f.path.forEach(x=>{const el=document.createElement('span');el.className='tile';el.textContent=x;$('path').append(el);});
 $('counts').replaceChildren();model.values.forEach((v,j)=>{const el=document.createElement('span');el.textContent=v+' → '+f.counts[j];$('counts').append(el);});
 $('ledger').replaceChildren();f.accepted.forEach(p=>{const el=document.createElement('li');el.textContent='['+p.join(', ')+']';$('ledger').append(el);});
 $('noOrders').textContent=f.accepted.length?'':t('none');
 $('prev').disabled=index===0;$('next').disabled=index===model.frames.length-1;
 $('feedback').hidden=!revealed;
 $('feedback').textContent=revealed?t(choice===2?'correct':'incorrect')+' '+t('answer'):'';
 $('reveal').disabled=choice===null;
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',()=>{preset=Number($('preset').value);model=Squareful.trace(Squareful.presets[preset]);index=0;render();});
$('next').onclick=()=>{if(index<model.frames.length-1)index++;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};
$('reset').onclick=()=>{index=0;render();};
$('end').onclick=()=>{index=model.frames.length-1;render();};
$('handReveal').onclick=()=>{const open=$('hand').hidden;$('hand').hidden=!open;$('handReveal').setAttribute('aria-expanded',String(open));};
document.querySelectorAll('input[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=Number(el.value);revealed=false;render();}));
$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('manualSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
 catch(_){copyState='fallback';$('manualCopy').hidden=false;$('manualSource').focus();$('manualSource').select();}
 render();
};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));});},{rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('.step').forEach(s=>observer.observe(s));
