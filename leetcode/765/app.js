'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let hand=0,frames=Couples.trace(Couples.presets[0]),at=0,choice=null,revealed=false,copyState='';
function rowView(id,row,done,active=-1){
  const container=$(id);container.replaceChildren();
  for(let k=0;k<row.length/2;k++){
    const block=document.createElement('div');block.className='pair'+(k<done?' fixed':'')+(k===active?' active':'');
    const label=document.createElement('span');label.className='pair-label';label.textContent=t('pairLabel',{k});block.append(label);
    const people=document.createElement('div');people.className='people';
    for(let d=0;d<2;d++){
      const seat=2*k+d,person=document.createElement('div');person.className='person';
      const caption=document.createElement('span');caption.className='seat';caption.textContent=t('seat',{s:seat});
      person.append(caption,document.createTextNode(row[seat]));people.append(person);
    }
    block.append(people);
    const state=document.createElement('div');state.className='pair-state';state.textContent=t(k===active?'current':k<done?'fixed':'pending');block.append(state);container.append(block);
  }
}
function describe(f){return t(f.op,{...f,right:f.i+1});}
function renderHand(){rowView('handRow',hand?[0,1,2,3]:[0,2,1,3],hand?2:0);$('handRead').textContent=t(hand?'handAfter':'handBefore');$('handNext').disabled=!!hand;$('handPrev').disabled=!hand;}
function renderTrace(){
 const f=frames[at],n=f.row.length/2;
 rowView('beforeRow',f.before,Math.max(0,f.done-1));rowView('afterRow',f.row,f.done,f.i<0?-1:f.i/2);
 $('progress').textContent=t('progress',{done:f.done,n,swaps:f.swaps});$('operation').textContent=describe(f);
 $('positions').replaceChildren(...f.pos.map((s,x)=>{const e=document.createElement('span');e.textContent=`${x} → ${s}`;return e;}));
 const ledger=$('history');ledger.replaceChildren();
 if(!at){const li=document.createElement('li');li.textContent=t('noHistory');ledger.append(li);}
 for(let k=1;k<=at;k++){const li=document.createElement('li');li.textContent=describe(frames[k]);ledger.append(li);}
 $('final').textContent=at===frames.length-1?t('final',{n,swaps:f.swaps}):t('notFinal');
 $('graphRead').textContent=t('graphRead',{groups:f.groups.map(g=>'{'+g.join(',')+'}').join(' '),c:f.groups.length,remaining:n-f.groups.length});
 $('prev').disabled=at===0;$('reset').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
}
function renderQuiz(){
 $('reveal').disabled=choice===null||revealed;$('quizReset').disabled=choice===null;
 $('feedback').textContent=revealed?t(choice===2?'correct':'incorrect')+' '+t('answer'):t(choice===null?'wait':'selected');
}
$('handNext').onclick=()=>{hand=1;renderHand();};$('handPrev').onclick=()=>{hand=0;renderHand();};
$('prev').onclick=()=>{at=Math.max(0,at-1);renderTrace();};$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);renderTrace();};
$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
$('preset').onchange=()=>{frames=Couples.trace(Couples.presets[+$('preset').value]);at=0;renderTrace();};
document.querySelectorAll('[name="prediction"]').forEach(r=>r.onchange=()=>{choice=+r.value;revealed=false;renderQuiz();});
$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{choice=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{
 try {await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}
 catch(_){copyState='manual';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}
 $('copyStatus').textContent=t(copyState);
};
locale.onChange(()=>{renderHand();renderTrace();renderQuiz();if(copyState)$('copyStatus').textContent=t(copyState);});locale.init();
function updateNavigation(){
 let current='step0';
 for(const section of document.querySelectorAll('.step'))if(section.getBoundingClientRect().top<=150)current=section.id;
 document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
let scrollQueued=false;
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;updateNavigation();});}},{passive:true});
addEventListener('resize',updateNavigation);updateNavigation();
