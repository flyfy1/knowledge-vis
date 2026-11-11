'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,frames=FreqCore.trace(FreqCore.presets[0]),step=0,choice=null,revealed=false,copyState='';
function node(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
function list(a){return '['+a.join(', ')+']';}
function opText(s){if(!s.op)return t('start');const o=s.op;return t(o.kind,{v:o.v,f:o.f,old:o.f-1,m:s.maxfreq});}
function state(id,s){const box=$(id);box.replaceChildren();box.append(node('p',t('remaining',{v:list(s.remaining)})),node('p',t('counts',{v:Object.entries(s.freq).filter(([,n])=>n).map(([v,n])=>v+': '+n).join('; ')||t('empty')})),node('p',t('highest',{v:s.maxfreq})),node('p',t('groups')));if(!s.maxfreq)box.append(node('p',t('empty')));Object.entries(s.group).forEach(([f,a])=>{const e=node('div',t('group',{f,v:list(a)}));e.className='level';box.append(e);});}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('steps'));
 $('preset').value=String(preset);$('presetSummary').textContent='ABC'[preset]+' · '+t('p'+preset);$('position').max=frames.length-1;$('position').value=step;$('prev').disabled=step===0;$('reset').disabled=step===0;$('next').disabled=step===frames.length-1;$('end').disabled=step===frames.length-1;
 $('progress').textContent=t('progress',{k:step,n:frames.length-1});$('operation').textContent=opText(frames[step]);state('before',frames[Math.max(0,step-1)]);state('after',frames[step]);$('outputs').textContent=t('outputs',{v:list(frames[step].outputs)});
 $('history').replaceChildren(...(step?frames.slice(1,step+1).map(s=>node('li',opText(s))):[node('li',t('pending'))]));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{preset=Number(e.target.value);frames=FreqCore.trace(FreqCore.presets[preset]);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
