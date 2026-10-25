'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let n=2,day=0,frames=Attendance.trace(n),choice=null,revealed=false,copyStatus='';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 const f=frames[day],old=day?frames[day-1].counts:Array(6).fill(0),total=f.counts.reduce((a,b)=>a+b,0);
 $('summary').textContent=t('summary',{day,n,total,status:t(day===n?'finished':'pending')});
 $('prev').disabled=$('reset').disabled=day===0;$('next').disabled=$('end').disabled=day===n;
 $('position').max=n;$('position').value=day;
 $('states').replaceChildren(...f.counts.map((v,i)=>{
  const a=Math.floor(i/3),l=i%3,c=el('div',undefined,'state-cell');c.append(el('h4',t('stateLabel',{a,l})),el('b',t('counts',{old:old[i],value:v})));
  if(!day)c.append(el('p',t('initial')));
  else{c.append(el('p',t('incoming')));const list=el('ul');f.incoming[i].forEach(x=>list.append(el('li',t('term',{a:Math.floor(x.from/3),l:x.from%3,letter:x.letter,count:x.count}))));c.append(list);c.append(el('p',f.incoming[i].map(x=>x.count).join(' + ')+' = '+v,'formula'));}return c;
 }));
 const table=el('table'),head=el('thead'),row=el('tr');table.append(el('caption',t('ledgerTitle')));
 [t('day'),'(0,0)','(0,1)','(0,2)','(1,0)','(1,1)','(1,2)',t('total')].forEach(v=>{const th=el('th',v);th.scope='col';row.append(th);});head.append(row);table.append(head);
 const body=el('tbody');frames.slice(0,day+1).forEach(f=>{const r=el('tr');const th=el('th',f.day);th.scope='row';r.append(th);[...f.counts,f.counts.reduce((a,b)=>a+b,0)].forEach(v=>r.append(el('td',v)));if(f.day===day)r.className='changed';body.append(r);});table.append(body);$('ledger').replaceChildren(table);$('ledger').setAttribute('aria-label',t('ledgerTitle'));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('quizReason'):'';
 $('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('preset').onchange=e=>{n=Number(e.target.value);day=0;frames=Attendance.trace(n);render();};
$('prev').onclick=()=>{day=Math.max(0,day-1);render();};$('next').onclick=()=>{day=Math.min(n,day+1);render();};$('reset').onclick=()=>{day=0;render();};$('end').onclick=()=>{day=n;render();};$('position').oninput=e=>{day=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
