'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,frames=PairCore.trace([1,3,1],2),threshold=2,scanned=4,choice=null,revealed=false,copyState='';
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function renderCount(){const s=PairCore.scan([1,1,3,6],threshold);
$('array').replaceChildren(...s.a.map((v,i)=>el('div',`${i} : ${v}`,'array-cell'+(i===scanned-1?' current':''))));
const pairs=[];for(let r=1;r<4;r++)for(let l=0;l<r;l++){const d=s.a[r]-s.a[l],yes=r<scanned&&d<=threshold;pairs.push(el('span',`${yes?'✓':'·'} (${l},${r}) → ${d}`,yes?'included':''));}$('pairs').replaceChildren(...pairs);
const rows=s.rows.slice(0,scanned).map(x=>{const tr=el('tr');[x.r,x.l,x.add,x.total].forEach(v=>tr.append(el('td',v)));return tr;});if(!rows.length){const tr=el('tr'),td=el('td',t('noneRows'));td.colSpan=4;tr.append(td);rows.push(tr);}$('counts').replaceChildren(...rows);
$('countReadout').textContent=t('countRead',{d:threshold,s:scanned,count:scanned?s.rows[scanned-1].total:0,tail:t(scanned===4?'fullCount':'partialCount')});}
function render(){
$('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('historyWrap').setAttribute('aria-label',t('history'));renderCount();
const p=PairCore.presets[selected],f=frames[index],q=f.test;
$('progress').textContent=t('progress',{a:p.a.join(', '),k:p.k,i:index,total:frames.length-1});$('position').max=frames.length-1;$('position').value=index;
$('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;$('position').disabled=frames.length===1;
$('interval').textContent=`[${f.lo}, ${f.hi}]`;$('tested').textContent=q?`${q.mid} → ${q.count}`:t('noTest');$('decision').textContent=q?t('decision',{...f,...q,before:q.before.join(', '),reason:t(q.enough?'enough':'few')}):t('initial');$('terminal').hidden=f.lo!==f.hi;if(f.lo===f.hi)$('terminal').textContent=t('terminal',f);
const rows=frames.slice(1,index+1).map((v,i)=>{const q=v.test,tr=el('tr',undefined,i===index-1?'changed':'');[i+1,`[${q.before.join(', ')}]`,`${q.mid} → ${q.count}`,`[${v.lo}, ${v.hi}]`,t(q.enough?'enough':'few')].forEach(x=>tr.append(el('td',x)));return tr;});if(!rows.length){const tr=el('tr'),td=el('td',t('empty'));td.colSpan=5;tr.append(td);rows.push(tr);}$('history').replaceChildren(...rows);
$('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===0?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();}
$('threshold').oninput=e=>{threshold=+e.target.value;renderCount();};$('scanned').oninput=e=>{scanned=+e.target.value;renderCount();};
$('preset').onchange=e=>{selected=+e.target.value;index=0;const p=PairCore.presets[selected];frames=PairCore.trace(p.a,p.k);render();};
$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=+e.target.value;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=+e.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
