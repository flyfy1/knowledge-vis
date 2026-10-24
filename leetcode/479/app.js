'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,frames=PalindromeCore.trace(0),choice=null,revealed=false,copyState='';
function node(tag,value,cls){const e=document.createElement(tag);if(value!==undefined)e.textContent=value;if(cls)e.className=cls;return e;}
function row(values){const tr=node('tr');values.forEach((v,i)=>{const c=node(i===0?'th':'td',v);if(i===0)c.scope='row';tr.append(c);});return tr;}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('historyWrap').setAttribute('aria-label',t('scrollHistory'));
 const f=frames[index];
 $('progress').textContent=t('progress',{i:index,total:frames.length-1});
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('position').max=frames.length-1;$('position').value=index;
 $('candidateValue').textContent=f.p??'—';$('factorValue').textContent=f.x??'—';$('boundValue').textContent=f.square??'—';
 $('decision').textContent=f.kind==='start'?t('start',{p:frames[1].p}):t(f.kind,{...f,mod:f.p%1337});
 const history=frames.slice(1,index+1);
 const candidates=new Map();history.forEach(f=>candidates.set(f.p,f.kind==='cutoff'?'rejected':f.kind==='found'?'accepted':'testing'));
 $('candidates').replaceChildren(...[...candidates].map(([p,status])=>node('div',p+' · '+t(status),'ledger-item')));
 const rows=history.map((f,i)=>{const tr=row([i+1,f.p,f.x,f.kind==='cutoff'?`${f.x}² = ${f.square} < ${f.p}`:`${f.p} = ${f.x} × ${f.q} + ${f.r}`,t(f.kind==='found'?'success':f.kind==='cutoff'?'stop':'fail')]);if(i===history.length-1)tr.className='active-row';return tr;});
 if(!rows.length){const tr=node('tr'),td=node('td',t('initial'));td.colSpan=5;tr.append(td);rows.push(tr);}
 $('history').replaceChildren(...rows);
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{selected=Number(e.target.value);index=0;frames=PalindromeCore.trace(selected);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});const strip=document.querySelector('.step-nav-inner');document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','step');const r=a.getBoundingClientRect(),s=strip.getBoundingClientRect();if(r.left<s.left)strip.scrollLeft-=s.left-r.left+12;else if(r.right>s.right)strip.scrollLeft+=r.right-s.right+12;}else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
