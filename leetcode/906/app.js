'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,rows=SuperCore.trace(...SuperCore.presets[0]),step=0,choice=null,revealed=false,copyState='';
function el(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 const [left,right]=SuperCore.presets[preset],total=rows.length,count=step?rows[step-1].count:0;
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===total;$('position').max=total;$('position').value=step;
 $('progress').textContent=t('progress',{left,right,step,total});
 const r=rows[step-1];$('operation').textContent=step?t('operation',{...r,delta:Number(r.accept),before:r.count-Number(r.accept)}):t('initial');
 $('cards').replaceChildren(...rows.slice(0,step).map((r,i)=>{const card=document.createElement('article');card.className='root-card'+(i===step-1?' current':'');
  if(i===step-1)card.append(el('b',t('current'),'status'));
  card.append(el('p',t('seedLine',{seed:r.seed,mode:t(r.odd?'odd':'even'),reverse:r.tail.split('').reverse().join('')||t('empty')})));
  card.append(el('p',`${r.root}² = ${r.square}`,'pair'));
  card.append(el('p',t('checks',{range:t(r.inRange?'yes':'no'),pal:t(r.pal?'yes':'no')})));
  card.append(el('p',t(r.accept?'accept':'reject',r),'decision'));return card;
 }));
 $('result').textContent=t(step===total?'final':'pending',{count,remaining:total-step});
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{preset=Number(e.target.value);rows=SuperCore.trace(...SuperCore.presets[preset]);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(rows.length,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=rows.length;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
