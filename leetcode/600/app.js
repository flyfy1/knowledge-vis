'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let n=5,at=0,run=NoConsecutive.trace(n),k=2,choice=null,revealed=false,copyStatus='';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('hand').replaceChildren(...Array.from({length:6},(_,x)=>el('span',x+' → '+x.toString(2).padStart(3,'0')+' · '+t(x===3?'invalid':'valid'),'ledger-item'+(x===3?' excluded':''))));
 const strings=NoConsecutive.strings(k),count=strings.length;
 $('suffixSummary').textContent=t('suffixSummary',{k,count})+(k>=2?' '+t('suffixSplit',{a:NoConsecutive.suffix(k-1),b:NoConsecutive.suffix(k-2),count}):'');
 $('suffixStrings').replaceChildren(...strings.map(s=>el('span',s||t('empty'),'ledger-item'+(s.startsWith('10')?' group10':''))));
 const f=run.frames[at],last=run.frames.length-1;
 $('summary').textContent=t('summary',{n,binary:run.binary,at,last,status:t(f.done?'finished':'pending'),total:f.total});
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===last;
 $('position').max=last;$('position').value=at;
 $('event').textContent=t(f.kind+'Event',f);
 const processed=f.kind==='initial'?0:f.kind==='finish'?run.width:run.width-f.i;
 $('bits').replaceChildren(...Array.from(run.binary,(v,j)=>{const cell=el('div',undefined,'bit'+(j<processed?' completed':''));cell.append(el('span','i='+String(run.width-j-1)),el('b',v),el('span',t(j<processed?'read':'unread')));return cell;}));
 if(!at)$('ledger').replaceChildren(el('p',t('ledgerEmpty')));
 else{
  const table=el('table'),head=el('thead'),row=el('tr');
  [t('colOperation'),t('colBranch'),t('colAdd'),t('colTotal')].forEach(v=>{const th=el('th',v);th.scope='col';row.append(th);});head.append(row);table.append(head);const body=el('tbody');
  run.frames.slice(1,at+1).forEach((f,j)=>{const r=el('tr',undefined,j===at-1?'changed':'');const th=el('th',f.kind==='finish'?t('finishOp'):t('bitOp',f));th.scope='row';r.append(th,el('td',f.branch===null?t('none'):f.branch),el('td',f.bit===1?'f['+f.i+'] = '+f.add:f.add),el('td',f.total));body.append(r);});table.append(body);$('ledger').replaceChildren(table);
 }
 $('ledger').setAttribute('aria-label',t('ledgerTitle'));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('quizReason'):'';
 $('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('suffixK').onchange=e=>{k=Number(e.target.value);render();};
$('preset').onchange=e=>{n=Number(e.target.value);at=0;run=NoConsecutive.trace(n);render();};
$('prev').onclick=()=>{at=Math.max(0,at-1);render();};$('next').onclick=()=>{at=Math.min(run.frames.length-1,at+1);render();};$('reset').onclick=()=>{at=0;render();};$('end').onclick=()=>{at=run.frames.length-1;render();};$('position').oninput=e=>{at=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
