'use strict';
(()=>{
 const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),core=Lesson741;
 let preset=0,index=0,frames=core.trace(core.presets[0]),selections=frames.map(f=>f.selected.slice()),rows=selections[0],choice=null,revealed=false,copyState='';
 const val=v=>v===null?'−∞':String(v);
 function board(el,grid,paths,ends){
  const n=grid.length;el.style.setProperty('--n',n);
  el.innerHTML=grid.flatMap((row,r)=>row.map((v,c)=>{
   const visited=paths?paths.map((p,i)=>p.some(([a,b])=>a===r&&b===c)?'AB'[i]:'').join(''):'';
   const current=ends?.some(([a,b])=>a===r&&b===c);
   return `<div class="cell ${visited?'visited':''} ${current?'current':''} ${v===-1?'thorn':''}"><span class="coord">(${r},${c})</span><b>${v===-1?'×':v}</b><span class="visits">${visited}</span></div>`;
  })).join('');
 }
 function hand(){const split=$('handRoute').value==='split';const a=[[0,0],[0,1],[1,1]],b=split?[[0,0],[1,0],[1,1]]:a;board($('handBoard'),core.presets[0],[a,b],[[1,1]]);$('handResult').textContent=t('handResult',{extra:split?1:0,total:split?4:3});}
 function render(){
  hand();$('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navigation'));
  document.querySelectorAll('[data-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.label)));
  const f=frames[index],grid=core.presets[preset],n=grid.length,s=f.states[rows[0]][rows[1]];
  $('progress').textContent=t('progress',{t:index,last:frames.length-1});
  board($('board'),grid,s.paths,s.valid?[[s.r1,s.c1],[s.r2,s.c2]]:null);
  $('selected').textContent=t('selected',{...s,value:val(s.value)});
  $('union').textContent=s.value===null?t('noUnion'):t('union',{value:s.value});
  $('dpHead').innerHTML='<tr><th scope="col">r1 \\ r2</th>'+Array.from({length:n},(_,i)=>`<th scope="col">${i}</th>`).join('')+'</tr>';
  const active=document.activeElement?.dataset?.state;
  $('dpBody').innerHTML=f.states.map((row,r)=>`<tr><th scope="row">${r}</th>${row.map((q,c)=>`<td><button type="button" class="state-btn" data-state="${r},${c}" aria-pressed="${r===rows[0]&&c===rows[1]}" aria-label="${t('stateLabel',{r1:r,r2:c,value:val(q.value)})}">${val(q.value)}</button></td>`).join('')}</tr>`).join('');
  if(active)$('dpBody').querySelector(`[data-state="${active}"]`)?.focus({preventScroll:true});
  $('event').textContent=!s.valid?t('blockedEvent'):index===0?t('startEvent',{value:s.value}):s.value===null?t('unreachableEvent'):t('finiteEvent',{...s.best,best:s.best.value,gain:s.gain,value:s.value});
  $('predBody').innerHTML=s.candidates.length?s.candidates.map(c=>`<tr><td>(${c.p1},${c.p2}) ${s.best&&s.best.p1===c.p1&&s.best.p2===c.p2?t('chosen'):''}</td><td>(${c.p1},${index-1-c.p1}) / (${c.p2},${index-1-c.p2})</td><td>${val(c.value)}</td></tr>`).join(''):`<tr><td colspan="3">${t('noPred')}</td></tr>`;
  $('ledger').innerHTML=frames.slice(0,index+1).map(q=>`<span class="ledger-item ${q.t===index?'current':''}">${t('ledgerValue',{t:q.t,value:val(q.max)})}</span>`).join('');
  $('output').textContent=index===frames.length-1?t('answer',{value:Math.max(0,f.states[n-1][n-1].value??0)}):t('pending');
  $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
  $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+t('quizWhy');
  $('copyStatus').textContent=copyState?t(copyState):'';
 }
 function goto(i){index=i;rows=selections[index];render();}
 $('handRoute').onchange=hand;
 $('preset').onchange=()=>{preset=Number($('preset').value);frames=core.trace(core.presets[preset]);selections=frames.map(f=>f.selected.slice());goto(0);};
 $('prev').onclick=()=>goto(Math.max(0,index-1));$('next').onclick=()=>goto(Math.min(frames.length-1,index+1));$('reset').onclick=()=>{selections=frames.map(f=>f.selected.slice());goto(0);};$('end').onclick=()=>goto(frames.length-1);
 $('dpBody').onclick=e=>{const button=e.target.closest('[data-state]');if(button){rows=button.dataset.state.split(',').map(Number);selections[index]=rows;render();}};
 document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
 $('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 locale.onChange(render);locale.init();
 function updateNav(){
  const sections=[...document.querySelectorAll('.step')];
  const active=sections.filter(s=>s.getBoundingClientRect().top<=innerHeight*.3).at(-1)||sections[0];
  document.querySelectorAll('#stepNav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));
 }
 addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);updateNav();
})();
