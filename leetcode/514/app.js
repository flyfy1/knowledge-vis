'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,choice=null,revealed=false,copyStatus='',model;
function rebuild(){model=Trail.trace(...Trail.presets[preset]);index=0;}
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function table(headers,rows,caption){
 const wrap=el('div',undefined,'table-wrap');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',caption);
 const table=el('table'),head=el('thead'),tr=el('tr');table.append(el('caption',caption));
 headers.forEach(h=>{const th=el('th',h);th.scope='col';tr.append(th);});head.append(tr);table.append(head);
 const body=el('tbody');for(const row of rows){const r=el('tr');row.forEach((v,i)=>{const c=el(i===0?'th':'td',v);if(i===0)c.scope='row';r.append(c);});body.append(r);}table.append(body);wrap.append(table);return wrap;
}
function render(){
 const f=model.frames[index],cost=Math.min(...Object.values(f.costs));
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('summary').textContent=t('summary',{ring:model.ring,key:model.key,i:index,m:model.key.length});
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===model.key.length;
 $('position').max=model.key.length;$('position').value=index;
 $('progress').textContent=t('progress',{cost,status:t(index===model.key.length?'finished':'pending')});
 $('ring').replaceChildren(...Array.from(model.ring,(c,i)=>{const live=Object.hasOwn(f.costs,i),n=el('div',undefined,'ring-cell'+(live?' live':''));n.append(el('b',`${c} (${i})`),el('span',t(live?'reachable':'inactive')),el('span',live?String(f.costs[i]):'—'));return n;}));
 const rows=model.frames.slice(0,index+1).map((frame,i)=>[i?model.key.slice(0,i):t('initial'),...Array.from(model.ring,(_,j)=>Object.hasOwn(frame.costs,j)?String(frame.costs[j]):'—')]);
 $('ledger').replaceWith(Object.assign(table([t('layer'),...Array.from(model.ring,(c,i)=>`${c} (${i})`)],rows,t('ledgerTitle')),{id:'ledger'}));
 $('candidates').replaceChildren();
 if(!f.candidates.length)$('candidates').append(el('p',t('candidateEmpty')));
 else $('candidates').append(table(['from','to','old','distance','press','total','result'].map(k=>t(k)),f.candidates.map(c=>[`${model.ring[c.source]} (${c.source})`,`${model.ring[c.target]} (${c.target})`,c.cost,c.distance,1,c.total,t(c.total===f.costs[c.target]?'winner':'loser')]),t('candidatesTitle')));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('quizReason'):'';
 $('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('preset').onchange=e=>{preset=Number(e.target.value);rebuild();render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.key.length)index++;render();};
$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.key.length;render();};$('position').oninput=e=>{index=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});
$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
rebuild();locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
