'use strict';
(()=>{
 const $=id=>document.getElementById(id),L=LeetCodeLocale(COPY),t=L.t,C=Printer;
 let frames=C.trace(C.presets[0]),position=0,stroke=0,answer=null,revealed=false,copyState='';
 const line=(el,text)=>{const li=document.createElement('li');li.textContent=text;el.append(li);};
 function renderStroke(){
  $('strokeProgress').textContent=t('strokeProgress',{p:stroke});$('strokeBack').disabled=stroke===0;$('strokeNext').disabled=stroke===2;$('strokeReset').disabled=stroke===0;
  $('strip').replaceChildren();const board=['□□□','aaa','aba'][stroke];
  [...board].forEach((v,i)=>{const span=document.createElement('span');span.className='cell';const b=document.createElement('b'),small=document.createElement('small');b.textContent=v;small.textContent=i;span.append(b,small);$('strip').append(span);});
  $('strokeHistory').replaceChildren();for(let i=0;i<=stroke;i++)line($('strokeHistory'),t(['blank','stroke1','stroke2'][i]));
 }
 function describe(f){
  if(f.kind==='start')return t('start');if(f.kind==='base')return t('base',f);
  if(f.kind==='solo')return t('solo',{...f,prev:f.j-1});
  const winner=f.bestName==='solo'?t('soloName'):t('mergeName',{k:f.bestName});return t('merge',{...f,winner});
 }
 function renderTrace(){
  const s=C.presets[Number($('preset').value)],f=frames[position],last=position===frames.length-1;
  $('progress').textContent=t('progress',{p:position,n:frames.length-1,result:last?t('final',{v:f.dp[0][s.length-1]}):t('pending')});
  $('prev').disabled=position===0;$('reset').disabled=position===0;$('next').disabled=last;$('end').disabled=last;
  $('dpTable').replaceChildren();
  const tr=document.createElement('tr');let th=document.createElement('th');th.textContent='i \\ j';th.scope='col';tr.append(th);
  [...s].forEach((c,j)=>{const h=document.createElement('th');h.scope='col';h.textContent=j+' · '+c;tr.append(h);});$('dpTable').append(tr);
  [...s].forEach((c,i)=>{const row=document.createElement('tr'),h=document.createElement('th');h.scope='row';h.textContent=i+' · '+c;row.append(h);
   [...s].forEach((_,j)=>{const td=document.createElement('td');td.textContent=j<i?'—':f.dp[i][j]===null?'·':f.dp[i][j];if(f.i===i&&f.j===j)td.className='current';row.append(td);});$('dpTable').append(row);
  });
  $('history').replaceChildren();for(let k=0;k<=position;k++)line($('history'),describe(frames[k]));
 }
 function renderQuiz(){$('reveal').disabled=answer===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(answer===2?'correct':'incorrect')+' '+t('answer');}
 function render(){renderStroke();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';for(const [id,key] of [['langToggle','language'],['stepNav','navigation'],['tableRegion','tableName'],['sourcePre','codeRegion'],['baselineCode','baselineRegion']])$(id).setAttribute('aria-label',t(key));}
 $('strokeBack').onclick=()=>{stroke--;renderStroke();};$('strokeNext').onclick=()=>{stroke++;renderStroke();};$('strokeReset').onclick=()=>{stroke=0;renderStroke();};
 $('preset').onchange=()=>{position=0;frames=C.trace(C.presets[Number($('preset').value)]);renderTrace();};
 $('prev').onclick=()=>{position--;renderTrace();};$('next').onclick=()=>{position++;renderTrace();};$('reset').onclick=()=>{position=0;renderTrace();};$('end').onclick=()=>{position=frames.length-1;renderTrace();};
 document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{answer=Number(el.value);revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};
 $('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 $('baselineCode').firstElementChild.textContent=`from collections import deque

def baseline(s):
    start = '_' * len(s)
    queue, seen = deque([(start, 0)]), {start}
    while queue:
        board, turns = queue.popleft()
        if board == s:
            return turns
        for i in range(len(s)):
            for j in range(i, len(s)):
                for c in set(s):
                    nxt = board[:i] + c * (j-i+1) + board[j+1:]
                    if nxt not in seen:
                        seen.add(nxt)
                        queue.append((nxt, turns+1))
`;
 function updateNav(){let current=document.querySelector('.step');const threshold=$('stepNav').getBoundingClientRect().height+100;document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=threshold)current=el;});document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);L.onChange(render);L.onChange(updateNav);L.init();updateNav();
})();
