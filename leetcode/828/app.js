'use strict';
const L=LeetCodeLocale(window.COPY),t=L.t,C=UniqueCore,$=id=>document.getElementById(id);
let preset=0,index=0,frames=C.trace(C.presets[0]),hand=0,choice=null,revealed=false,copyState=null;
const pieces=[[0,0],[0,1],[0,2],[1,1],[1,2],[2,2]];
function handData(l,r){const s='ABA'.slice(l,r+1),counts={};for(const ch of s)counts[ch]=(counts[ch]||0)+1;const letters=Object.keys(counts).filter(ch=>counts[ch]===1);return {l,r,s,counts:Object.entries(counts).map(([ch,v])=>`${ch}:${v}`).join(', '),letters:letters.join(', ')||t('none'),v:letters.length};}
function renderHand(){
 $('handGrid').replaceChildren();pieces.forEach(([l,r],i)=>{const d=handData(l,r),b=document.createElement('button');b.type='button';b.className='btn';b.dataset.step='0';b.textContent=`${d.s} [${l},${r}]`;b.setAttribute('aria-label',t('handLabel',d));b.setAttribute('aria-pressed',String(hand===i));b.onclick=()=>{hand=i;renderHand();$('handGrid').children[i].focus();};$('handGrid').append(b);});$('handRead').textContent=t('handRead',handData(...pieces[hand]));
}
function renderTrace(){
 const s=C.presets[preset],f=frames[index];$('frameRead').textContent=t('frame',{k:index,n:s.length,total:f.total,final:index===s.length?t('final'):''});
 $('positions').setAttribute('aria-label',t('arrayLabel'));$('positions').replaceChildren();Array.from(s,(ch,i)=>{const e=document.createElement('div');e.className='position'+(i===index-1?' current':'');const b=document.createElement('b');b.textContent=t('position',{i,ch});const small=document.createElement('small');small.textContent=t(i===index-1?'current':i<index?'settled':'pending');e.append(b,small);$('positions').append(e);});
 const e=f.current;$('event').textContent=e?t('event',{...e,l0:e.p+1,r1:e.q-1}):t('start');$('pairs').replaceChildren();if(e)for(const [l,r] of e.pairs){const item=document.createElement('span');item.className='ledger-item';item.textContent=`[${l},${r}] ${s.slice(l,r+1)}`;$('pairs').append(item);}
 $('ledger').replaceChildren();let total=0;for(const e of f.done){total+=e.value;const li=document.createElement('li');li.textContent=t('ledgerLine',{...e,total});$('ledger').append(li);}
 $('prev').disabled=index===0;$('next').disabled=index===s.length;$('end').disabled=index===s.length;
}
function renderQuiz(){$('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('answer'):t('quizPending');$('feedback').classList.toggle('correct',revealed&&choice==='2');}
$('preset').onchange=e=>{preset=Number(e.target.value);index=0;frames=C.trace(C.presets[preset]);renderTrace();};$('prev').onclick=()=>{if(index)index--;renderTrace();};$('next').onclick=()=>{if(index<C.presets[preset].length)index++;renderTrace();};$('end').onclick=()=>{index=C.presets[preset].length;renderTrace();};$('traceReset').onclick=()=>{index=0;renderTrace();};$('handReset').onclick=()=>{hand=0;renderHand();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(e=>e.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
L.onChange(()=>{renderHand();renderTrace();renderQuiz();if(copyState)$('copyStatus').textContent=t(copyState);});L.init();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));}),{rootMargin:'-10% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));
