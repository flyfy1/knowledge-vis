'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let input=RefuelCore.presets[0],frames=RefuelCore.trace(input),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function operation(f){const s=input.stations[f.id]||[];return t(f.kind,{id:f.id,pos:s[0],fuel:s[1],reach:f.reach,before:f.before,stops:f.selected.length,target:input.target});}
function render(){
 const f=frames[step],n=frames.length-1;
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('stations').setAttribute('aria-label',t('tableLabel'));
 $('input').textContent=t('stats',{target:input.target,fuel:input.startFuel,stations:JSON.stringify(input.stations)});
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===n;$('position').max=n;$('position').value=step;
 $('progress').textContent=t('progress',{k:step,n,stops:f.selected.length});$('reach').textContent=t('reachNow',{reach:f.reach});$('reachFill').style.width=Math.min(100,f.reach/input.target*100)+'%';
 const hr=el('tr');['id','fuel','status'].forEach(k=>{const th=el('th',t(k));th.scope='col';hr.append(th);});$('tableHead').replaceChildren(hr);
 $('tableBody').replaceChildren(...input.stations.map((s,i)=>{const row=el('tr'),th=el('th',`${i} / ${s[0]}`);th.scope='row';row.append(th,el('td',s[1]));const cell=el('td',t(f.selected.includes(i)?'selected':f.pool.includes(i)?'eligible':'pending'));if(f.id===i){cell.className='current-cell';cell.append(el('b',t('mark')));}row.append(cell);return row;}));
 $('operation').textContent=operation(f);$('history').replaceChildren(...frames.slice(0,step+1).map((x,i)=>{const li=el('li',operation(x));if(i===step)li.className='current';return li;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{input=RefuelCore.presets[Number(e.target.value)];frames=RefuelCore.trace(input);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
