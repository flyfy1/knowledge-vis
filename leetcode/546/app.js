'use strict';
(() => {
 const $=id=>document.getElementById(id), L=LeetCodeLocale(COPY), t=L.t, C=RemoveBoxes;
 let frames=C.trace(C.presets[0]), position=0, inspected=0, answer=null, revealed=false, copyState='';
 const root=C.solver([1,2,1]);
 function name(row){return row.m===null?t('immediate'):t('merge',{m:row.m});}
 function listLine(el,text){const li=document.createElement('li');li.textContent=text;el.append(li);}
 function renderTrace(){
   const f=frames[position];
   $('inputReadout').textContent='boxes = ['+C.presets[Number($('preset').value)].join(', ')+']';
   $('progress').textContent=t('progress',{i:position,n:frames.length-1,score:f.total});
   $('prev').disabled=position===0;$('next').disabled=position===frames.length-1;
   $('end').disabled=$('next').disabled;$('reset').disabled=position===0;
   $('tiles').replaceChildren();
   if(!f.live.length)$('tiles').textContent=t('empty');
   f.live.forEach(x=>{const tile=document.createElement('span');tile.className='tile';const b=document.createElement('b');b.textContent=x.value;const small=document.createElement('small');small.textContent='#'+x.id;tile.append(b,small);$('tiles').append(tile);});
   $('history').replaceChildren();
   if(position===0)listLine($('history'),t('initial'));
   for(let i=1;i<=position;i++){const x=frames[i];listLine($('history'),t('moveRow',{i,ids:x.removed.map(b=>b.id).join(', '),color:x.removed[0].value,n:x.removed.length,gain:x.gain,total:x.total}));}
 }
 function renderDP(){
   const k=Number($('carry').value),rows=root.candidates(0,2,k),seen=rows.slice(0,inspected);
   $('dpPrev').disabled=inspected===0;$('dpReset').disabled=inspected===0;
   $('dpNext').disabled=inspected===rows.length;$('dpEnd').disabled=$('dpNext').disabled;
   $('dpHistory').replaceChildren();
   if(!inspected)$('dpProgress').textContent=t('dpPending',{k});
   else {const current=seen[seen.length-1],best=seen.reduce((a,b)=>b.value>a.value?b:a,seen[0]);
    $('dpProgress').textContent=t('dpProgress',{k,i:inspected,name:name(current),value:current.value,bestName:name(best),best:best.value,final:inspected===rows.length?t('final'):''});}
   seen.forEach(row=>listLine($('dpHistory'),t('dpRow',{name:name(row),...row})));
 }
 function renderQuiz(){$('reveal').disabled=answer===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(answer===1?'correct':'incorrect')+' '+t('answer');}
 function render(){renderTrace();renderDP();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navigation'));$('sourcePre').setAttribute('aria-label',t('codeRegion'));$('baselineCode').setAttribute('aria-label',t('baselineRegion'));}
 function restart(){frames=C.trace(C.presets[Number($('preset').value)],$('mode').value==='greedy');position=0;renderTrace();}
 $('preset').onchange=restart;$('mode').onchange=restart;
 $('prev').onclick=()=>{position=Math.max(0,position-1);renderTrace();};$('next').onclick=()=>{position=Math.min(frames.length-1,position+1);renderTrace();};
 $('reset').onclick=()=>{position=0;renderTrace();};$('end').onclick=()=>{position=frames.length-1;renderTrace();};
 $('carry').onchange=()=>{inspected=0;renderDP();};
 $('dpPrev').onclick=()=>{inspected=Math.max(0,inspected-1);renderDP();};$('dpNext').onclick=()=>{inspected=Math.min(2,inspected+1);renderDP();};$('dpReset').onclick=()=>{inspected=0;renderDP();};$('dpEnd').onclick=()=>{inspected=2;renderDP();};
 document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{answer=Number(el.value);revealed=false;renderQuiz();});
 $('reveal').onclick=()=>{revealed=true;renderQuiz();};
 $('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 function updateNav(){
  const sections=[...document.querySelectorAll('.step')],threshold=$('stepNav').getBoundingClientRect().height+120;
  let current=sections[0];sections.forEach(section=>{if(section.getBoundingClientRect().top<=threshold)current=section;});
  document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
 }
 let navQueued=false;
 window.addEventListener('scroll',()=>{if(!navQueued){navQueued=true;requestAnimationFrame(()=>{navQueued=false;updateNav();});}},{passive:true});
 window.addEventListener('resize',updateNav);
 L.onChange(updateNav);
 L.onChange(render);L.init();updateNav();
})();
