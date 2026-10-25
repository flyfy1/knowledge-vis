'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let input=SchemeCore.presets[0],frames=SchemeCore.trace(input),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function renderTable(id,dp,f){const table=$(id);table.querySelector('caption').textContent=t(step===0?'initialTable':id==='oldTable'?'old':'new');const tr=el('tr');['cell','count'].forEach(k=>{const th=el('th',t(k));th.scope='col';tr.append(th);});table.querySelector('thead').replaceChildren(tr);const rows=[];
 for(let u=0;u<=input.n;u++)for(let p=0;p<=input.P;p++)if(f.old[u][p]||f.dp[u][p]){const row=el('tr'),th=el('th',`(${u}, ${p})`);th.scope='row';const td=el('td',dp[u][p]);if(id==='newTable'&&dp[u][p]!==f.old[u][p])td.className='cell-new';row.append(th,td);rows.push(row);}table.querySelector('tbody').replaceChildren(...rows);
}
function render(){const f=frames[step],m=input.group.length;
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('input').textContent=t('stats',{n:input.n,P:input.P,group:JSON.stringify(input.group),profit:JSON.stringify(input.profit)});
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===m;$('position').max=m;$('position').value=step;
 $('progress').textContent=t('progress',{k:step,m,answer:f.answer});$('operation').textContent=step===0?t('start'):t('operation',{i:step-1,g:input.group[step-1],h:input.profit[step-1]});
 renderTable('oldTable',f.old,f);renderTable('newTable',f.dp,f);
 $('moves').replaceChildren(...f.moves.map(x=>el('li',t(x.legal?'move':'reject',x))));
 $('history').replaceChildren(...frames.slice(0,step+1).map((x,i)=>{const li=el('li',t('historyRow',{k:x.k,answer:x.answer}));if(i===step)li.className='current';return li;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('answer');$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{input=SchemeCore.presets[Number(e.target.value)];frames=SchemeCore.trace(input);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
