'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let run=InversePairs.trace(3,1),at=0,x=0,choice=null,revealed=false,copyStatus='';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function array(a){return '['+a.join(',')+']';}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 const p=$('permutation').value.split(',').map(Number),pairs=InversePairs.pairs(p);
 $('pairSummary').textContent=t('pairSummary',{array:array(p),count:pairs.length});
 $('pairs').replaceChildren(...(pairs.length?pairs.map(v=>el('li',t('pair',v))):[el('li',t('noPairs'))]));
 const ins=InversePairs.insert(x);$('cards').replaceChildren(...ins.a.map(v=>el('div',String(v),'card'+(v===3?' maximum':''))));
 $('insertSummary').textContent=t('insertSummary',{array:array(ins.a),x,total:ins.pairs.length});
 $('insertPairs').replaceChildren(...ins.pairs.map(v=>el('li',t(v.a===3?'newPair':'oldPair')+' · '+t('pair',v))));
 const f=run.frames[at],last=run.frames.length-1;
 $('summary').textContent=t('summary',{n:run.n,k:run.k,at,last,status:at===last?t('finished',{answer:f.table[run.n][run.k]}):t('pending')});
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===last;$('position').max=last;$('position').value=at;
 $('event').textContent=f.kind==='initial'?t('initial'):t('event',{...f,leaving:f.removeIndex===null?t('noLeaving'):t('leaving',{index:f.removeIndex,value:f.remove})});
 $('range').textContent=f.kind==='initial'?t('windowInitial'):t('windowRange',{...f,row:f.i-1});
 $('windowTerms').replaceChildren(...(f.kind==='initial'?[]:f.table[f.i-1].map((v,j)=>{const used=j>=f.lo&&j<=f.hi,e=el('div',undefined,'term'+(used?' used':''));e.append(el('span','('+j+')'),el('b',String(v)),el('span',t(used?'used':'outside')));return e;})));
 const table=el('table'),head=el('thead'),hr=el('tr'),corner=el('th',t('rowAxis'));corner.scope='col';hr.append(corner);
 for(let j=0;j<=run.k;j++){const th=el('th',String(j));th.scope='col';hr.append(th);}head.append(hr);table.append(head);const body=el('tbody');
 f.table.forEach((row,i)=>{const tr=el('tr'),th=el('th',String(i));th.scope='row';tr.append(th);row.forEach((v,j)=>{const current=i===f.i&&j===f.j,source=i===f.i-1&&j>=f.lo&&j<=f.hi,td=el('td',v===null?'?':String(v),current?'current-cell':source?'source-cell':'');if(current)td.append(el('span',t('current')));tr.append(td);});body.append(tr);});table.append(body);table.setAttribute('aria-describedby','tableDescription');$('dpTable').replaceChildren(table);$('dpTable').setAttribute('aria-label',t('tableTitle'));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('quizReason'):'';$('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('permutation').onchange=render;$('insertion').onchange=e=>{x=+e.target.value;render();};
$('preset').onchange=e=>{const [n,k]=e.target.value.split(',').map(Number);run=InversePairs.trace(n,k);at=0;render();};
$('prev').onclick=()=>{at=Math.max(0,at-1);render();};$('next').onclick=()=>{at=Math.min(run.frames.length-1,at+1);render();};$('reset').onclick=()=>{at=0;render();};$('end').onclick=()=>{at=run.frames.length-1;render();};$('position').oninput=e=>{at=+e.target.value;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
