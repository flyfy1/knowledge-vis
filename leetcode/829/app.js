'use strict';
const L=LeetCodeLocale(window.COPY),t=L.t,C=SumCore,$=id=>document.getElementById(id);
let n=5,index=0,frames=C.trace(n),hand=1,choice=null,revealed=false,copyState=null;
function renderHand(){
 for(let k=1;k<=3;k++)$('hand'+k).setAttribute('aria-pressed',String(k===hand));
 $('tiles').replaceChildren();
 const a=hand===1?5:2;
 for(let i=0;i<hand;i++){
   const e=document.createElement('div');e.className='tile';
   const b=document.createElement('b'),s=document.createElement('span');
   b.textContent=t('term',{i:i+1});s.textContent=hand===3?t('minTile',{i:i+1,v:i+1}):t('baseOffset',{a,d:i,v:a+i});
   e.append(b,s);$('tiles').append(e);
 }
 $('handRead').textContent=t('hand'+hand);
}
function renderTrace(){
 const f=frames[index],m=frames.length-1;
 $('frameRead').textContent=t('frame',{n,i:index,m,count:f.count,final:f.phase==='stop'?t('final'):''});
 $('event').textContent=f.phase==='initial'?t('initial'):f.phase==='stop'?t('stop',{...f.current,n,count:f.count}):t('tested',{...f.current,n});
 $('ledger').replaceChildren();let count=0;
 if(!f.done.length){const e=document.createElement('li');e.textContent=t('empty');$('ledger').append(e);}
 for(const c of f.done){
   if(c.accepted)count++;
   const li=document.createElement('li');li.className='candidate-row'+(f.phase==='tested'&&c.k===f.k?' current':'');li.dataset.k=c.k;
   const b=document.createElement('b');b.textContent=t('rowTitle',{k:c.k,decision:t(c.accepted?'yes':'no')});
   const math=document.createElement('p');math.textContent=t('rowMath',c);
   const result=document.createElement('p');result.textContent=t(c.accepted?'rowYes':'rowNo',{...c,n,count,sequence:c.accepted?Array.from({length:c.k},(_,i)=>c.a+i).join(' + '):''});
   li.append(b,math,result);$('ledger').append(li);
 }
 const k=f.phase==='initial'?1:f.k+1;
 $('guard').hidden=f.phase==='stop';$('guard').textContent=t('guard',{k,minimum:k*(k+1)/2});
 $('prev').disabled=index===0;$('next').disabled=index===m;$('end').disabled=index===m;
}
function renderQuiz(){
 $('reveal').disabled=choice===null;
 $('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('answer'):t('quizPending');
 $('feedback').classList.toggle('correct',revealed&&choice==='1');
}
for(let k=1;k<=3;k++)$('hand'+k).onclick=()=>{hand=k;renderHand();};
$('handReset').onclick=()=>{hand=1;renderHand();};
$('preset').onchange=e=>{n=Number(e.target.value);frames=C.trace(n);index=0;renderTrace();};
$('prev').onclick=()=>{if(index)index--;renderTrace();};
$('next').onclick=()=>{if(index<frames.length-1)index++;renderTrace();};
$('traceReset').onclick=()=>{index=0;renderTrace();};
$('end').onclick=()=>{index=frames.length-1;renderTrace();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;renderQuiz();});
$('reveal').onclick=()=>{revealed=true;renderQuiz();};
$('quizReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
L.onChange(()=>{renderHand();renderTrace();renderQuiz();if(copyState)$('copyStatus').textContent=t(copyState);});L.init();
let navScheduled=false;
function updateNav(){
 navScheduled=false;
 const boundary=document.querySelector('.step-nav').getBoundingClientRect().bottom+24;
 let active='step0';
 document.querySelectorAll('.step').forEach(section=>{if(section.getBoundingClientRect().top<=boundary)active=section.id;});
 document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active));
}
function scheduleNav(){if(!navScheduled){navScheduled=true;requestAnimationFrame(updateNav);}}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);L.onChange(scheduleNav);scheduleNav();
