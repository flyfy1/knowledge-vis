'use strict';
(()=>{
 const $=id=>document.getElementById(id),L=LeetCodeLocale(COPY),t=L.t,C=Game24;
 let frames=C.trace(0),position=0,hand=0,answer=null,revealed=false,copyState='';
 const handFrames=C.hand();
 function line(el,text){const li=document.createElement('li');li.textContent=text;el.append(li);}
 function groups(id,nodes){$(id).replaceChildren();for(const node of nodes){const box=document.createElement('div');box.className='group';const b=document.createElement('b'),code=document.createElement('code'),small=document.createElement('small');b.textContent=C.format(node.value);code.textContent=node.expr;small.textContent=t('used',{ids:node.ids.map(i=>'ABCD'[i]).join(', ')});box.append(b,code,small);$(id).append(box);}}
 const describe=f=>t(f.kind,{expr:f.expr,value:f.value});
 function renderHand(){groups('handGroups',handFrames[hand]);$('handProgress').textContent=t('handProgress',{p:hand});$('handBack').disabled=hand===0;$('handReset').disabled=hand===0;$('handNext').disabled=hand===3;$('handHistory').replaceChildren();for(let i=1;i<=hand;i++){const n=handFrames[i].at(-1);line($('handHistory'),n.expr+' = '+C.format(n.value));}}
 function renderTrace(){const f=frames[position],last=position===frames.length-1;groups('groups',f.nodes);$('progress').textContent=t('progress',{p:position,n:frames.length-1,result:last?t('final',{v:String(f.result)}):t('pending')});$('event').textContent=describe(f);$('prev').disabled=position===0;$('reset').disabled=position===0;$('next').disabled=last;$('end').disabled=last;$('history').replaceChildren();for(let k=0;k<=position;k++)line($('history'),describe(frames[k]));}
 function renderQuiz(){$('reveal').disabled=answer===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(answer===1?'correct':'incorrect')+' '+t('answer');}
 function render(){renderHand();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';for(const [id,key]of [['langToggle','language'],['stepNav','navigation'],['sourcePre','codeRegion']])$(id).setAttribute('aria-label',t(key));}
 $('handBack').onclick=()=>{hand--;renderHand();};$('handNext').onclick=()=>{hand++;renderHand();};$('handReset').onclick=()=>{hand=0;renderHand();};
 $('preset').onchange=()=>{position=0;frames=C.trace(Number($('preset').value));renderTrace();};
 $('prev').onclick=()=>{position--;renderTrace();};$('next').onclick=()=>{position++;renderTrace();};$('reset').onclick=()=>{position=0;renderTrace();};$('end').onclick=()=>{position=frames.length-1;renderTrace();};
 document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{answer=Number(el.value);revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};
 $('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 function updateNav(){let current=document.querySelector('.step');const threshold=$('stepNav').getBoundingClientRect().height+100;document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=threshold)current=el;});document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);L.onChange(render);L.onChange(updateNav);L.init();updateNav();
})();
