'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let ratings=CandyCore.presets[0].slice(),frames=CandyCore.trace(ratings),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;return x;}
function operation(f){
 if(f.phase==='seed')return t('seed');
 const i=f.i;
 if(f.phase==='merge')return t('merge',{i,l:f.L[i],r:f.R[i],value:f.C[i]});
 const left=f.phase==='left',j=left?i-1:i+1,v=left?f.L:f.R;
 return t(ratings[i]>ratings[j]?'grow':'stop',{side:left?'L':'R',i,a:ratings[i],b:ratings[j],old:f.previous,neighbor:v[j],value:v[i]});
}
function render(){
 const f=frames[step],n=frames.length-1,m=Math.floor(ratings.length/2);
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('bounds').setAttribute('aria-label',t('tableLabel'));
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===n;
 $('position').max=n;$('position').value=step;$('editLabel').textContent=t('edit',{i:m});$('middleValue').textContent=ratings[m];
 const done=f.C.filter(x=>x!==null).length,sum=f.C.reduce((a,b)=>a+(b||0),0);
 $('progress').textContent=t('progress',{k:step,n,done,size:ratings.length});
 const hr=el('tr');const first=el('th',t('index'));first.scope='col';hr.append(first);ratings.forEach((_,i)=>{const c=el('th',i);c.scope='col';hr.append(c);});$('tableHead').replaceChildren(hr);
 const rows=[['rating',ratings],['left',f.L],['right',f.R],['allocation',f.C]];
 $('tableBody').replaceChildren(...rows.map(([key,arr])=>{const tr=el('tr'),th=el('th',t(key));th.scope='row';tr.append(th);arr.forEach((v,i)=>{const active=f.i===i&&({left:'left',right:'right',allocation:'merge'}[key]===f.phase);const cell=el('td',(v===null?'?':v)+(active?' ★':''));if(active)cell.className='active-cell';tr.append(cell);});return tr;}));
 $('calculation').textContent=operation(f);$('total').textContent=t(done===ratings.length?'total':'partial',{sum});
 $('history').replaceChildren(...frames.slice(1,step+1).map((fr,i)=>{const li=el('li',operation(fr));if(i===step-1)li.className='current';return li;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
function restart(){frames=CandyCore.trace(ratings);step=0;render();}
$('preset').onchange=e=>{ratings=CandyCore.presets[Number(e.target.value)].slice();$('middle').value=ratings[Math.floor(ratings.length/2)];restart();};
$('middle').oninput=e=>{ratings[Math.floor(ratings.length/2)]=Number(e.target.value);restart();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
