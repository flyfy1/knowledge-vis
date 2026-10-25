'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let data=Palindrome.trace('123'),k=0,choice=null,revealed=false,copyStatus='';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 const total=data.rows.length;
 $('summary').textContent=t('summary',{n:data.n,d:data.d,p:data.p,k,total,label:t(k===total?'answer':'best'),best:data.frames[k].best===null?t('none'):String(data.frames[k].best)});
 $('prev').disabled=$('reset').disabled=k===0;$('next').disabled=$('end').disabled=k===total;$('position').max=total;$('position').value=k;
 $('candidates').replaceChildren(...data.rows.map((r,i)=>{const tested=i<k,current=i===k-1,c=el('article',undefined,'candidate'+(tested?' tested':'')+(current?' current':''));c.append(el('h3',t('rowTitle',{i:i+1,kind:t(r.kind,{q:r.q})})));c.append(el('p',t(tested?'distance':'waiting',{value:String(r.value),distance:String(r.distance),n:data.n})));c.append(el('p',t(tested?(r.excluded?'excluded':'tested'):'pending')+(current?' '+t('current'):''),'status'));return c;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('quizReason'):'';
 $('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('preset').onchange=e=>{data=Palindrome.trace(e.target.value);k=0;render();};
$('prev').onclick=()=>{k=Math.max(0,k-1);render();};$('next').onclick=()=>{k=Math.min(data.rows.length,k+1);render();};$('reset').onclick=()=>{k=0;render();};$('end').onclick=()=>{k=data.rows.length;render();};$('position').oninput=e=>{k=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
