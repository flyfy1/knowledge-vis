'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let input=EggCore.presets[0],rows=EggCore.trace(input.k,input.n),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function render(){
 const {k,n}=input,c=rows[step][k],last=rows.length-1;
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('capacity').setAttribute('aria-label',t('tableLabel'));document.querySelector('.table-wrap').setAttribute('aria-label',t('tableLabel'));
 $('input').textContent=t('stats',{k,n});$('progress').textContent=t('progress',{m:step,k,c});
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===last;$('position').max=last;$('position').value=step;
 $('decision').textContent=t(step===last?'enough':'notEnough',{m:step,before:step?rows[step-1][k]:0,c,n});
 $('partition').replaceChildren();
 if(step===0)$('operation').textContent=t('start');
 else{
  const lower=rows[step-1][k-1],upper=rows[step-1][k];
  $('operation').textContent=t('split',{k,old:step-1,less:k-1,lower,upper,total:c,x:lower+1});
  [['lower',lower],['test',1],['upper',upper]].forEach(([key,v])=>{const box=el('div',t(key,{v}));box.className='part '+key;$('partition').append(box);});
 }
 const hr=el('tr');[t('moves'),...Array.from({length:k+1},(_,e)=>t('eggs',{e}))].forEach(text=>{const th=el('th',text);th.scope='col';hr.append(th);});$('tableHead').replaceChildren(hr);
 $('tableBody').replaceChildren(...rows.slice(0,step+1).map((row,m)=>{const tr=el('tr'),th=el('th',String(m));th.scope='row';tr.append(th,...row.map(v=>el('td',String(v))));if(m===step){tr.className='current-row';th.append(el('span',t('current')));}return tr;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{input=EggCore.presets[Number(e.target.value)];rows=EggCore.trace(input.k,input.n);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(rows.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=rows.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
