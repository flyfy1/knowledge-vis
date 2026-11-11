'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let input=QueueCore.presets[0],frames=QueueCore.trace(input),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function operation(f){return f.j===null?t('initial'):t('operation',{before:f.before,j:f.j+1,char:f.before[f.j],after:f.s});}
function cards(id,s){if(s===null){$(id).replaceChildren(el('p',t('noBefore')));return;}const row=el('div');row.className='cards';[...s].forEach((c,i)=>{const cell=el('div');cell.className='card';cell.setAttribute('aria-label',t('cardLabel',{p:i+1,c}));cell.append(el('b',c),el('small',i+1));row.append(cell);});$(id).replaceChildren(row);}
function render(){
 const f=frames[step],n=frames.length-1;
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===n;$('position').max=n;$('position').value=step;
 $('progress').textContent=t('progress',{i:step,n,s:input.s,k:input.k});$('operation').textContent=operation(f);cards('before',f.before);cards('now',f.s);
 const min=frames.slice(0,step+1).map(x=>x.s).sort()[0];$('minimum').textContent=t(step===n?'final':'minSeen',{s:min,now:f.s});
 $('history').replaceChildren(...frames.slice(0,step+1).map((x,i)=>{const li=el('li',i===0?`${input.s} — ${operation(x)}`:operation(x));if(i===step){li.className='current';li.append(el('span',t('current')));}return li;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{input=QueueCore.presets[Number(e.target.value)];frames=QueueCore.trace(input);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
