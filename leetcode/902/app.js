'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let input=DigitCore.presets[0],frames=DigitCore.trace(input),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function operation(f){
 if(f.kind==='position')return t('atPosition',{p:f.i+1,prefix:f.prefix||t('empty'),current:f.current,r:f.remaining});
 return t(f.kind,f);
}
function render(){
 const f=frames[step],last=frames.length-1;
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===last;$('position').max=last;$('position').value=step;
 $('progress').textContent=t('progress',{digits:input.digits.join(','),n:input.n,i:step,last});
 $('operation').textContent=operation(f);
 $('branches').replaceChildren(...(f.rows||[]).map(row=>{const e=el('div',`${row.digit} ${row.relation==='less'?'<':row.relation==='equal'?'=':'>'} ${f.current} · `+t(row.relation,{...row,r:f.remaining,m:f.m}));e.className='branch '+row.relation;return e;}));
 $('continuation').textContent=f.kind==='position'?t(f.matched?'continue':'cannotContinue'):'';
 $('accounting').textContent=t('accounting',f);$('result').textContent=t(step===last?'final':'pending',f);
 $('history').replaceChildren(...frames.slice(0,step+1).map((x,i)=>{const li=el('li',operation(x)+' '+t('accounting',x));if(i===step){li.className='current';li.append(el('b',t('current')));}return li;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{input=DigitCore.presets[Number(e.target.value)];frames=DigitCore.trace(input);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
