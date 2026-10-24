'use strict';
const locale=window.LeetCodeLocale(window.COPY),t=locale.t,C=window.FrogCore,$=id=>document.getElementById(id);
let preset=0,index=0,frames=C.trace(C.presets[0]),revealed=false,copyState='';
const setText=a=>a.length?'{'+a.join(', ')+'}':'∅';
function render(){
 $('langToggle').setAttribute('aria-label',t('languageLabel'));document.querySelector('.step-nav').setAttribute('aria-label',t('stepsLabel'));
 const f=frames[index],last=C.presets[preset].at(-1),set=setText(f.r[last]);
 $('progress').textContent=index?t('progress',{x:f.x,k:f.k,i:index,total:frames.length-1}):t('initial',{total:frames.length-1});
 $('result').textContent=t(index===frames.length-1?'finished':'pending',{set,result:f.r[last].length?'true':'false'});
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
 $('stones').replaceChildren();for(const x of C.presets[preset]){const card=document.createElement('div');card.className='stone'+(x===f.x?' current':'');const label=document.createElement('b');label.textContent=t('position',{x});const caption=document.createElement('span');caption.textContent=t('setLabel');const values=document.createElement('span');values.className='values';values.textContent=setText(f.r[x]);card.append(label,caption,values);$('stones').append(card);}
 $('candidatePanel').hidden=index===0;$('candidates').replaceChildren();for(const c of f.candidates){const row=document.createElement('tr');for(const v of [c.jump,c.target,t(c.reason)]){const cell=document.createElement('td');cell.textContent=v;row.append(cell);}$('candidates').append(row);}
 $('history').replaceChildren();for(const h of frames.slice(1,index+1)){const li=document.createElement('li');li.textContent=t('historyItem',{x:h.x,k:h.k,targets:h.candidates.filter(c=>c.reason==='added').map(c=>c.target).join(', ')||t('none')});$('history').append(li);}
 const choice=document.querySelector('[name=prediction]:checked');$('reveal').disabled=!choice;$('feedback').textContent=revealed?t(choice.value==='1'?'correct':'incorrect')+' '+t('answer'):t(choice?'chosen':'waiting');$('copyStatus').textContent=copyState?t(copyState):'';
}
$('handReveal').onclick=()=>{$('hand').hidden=!$('hand').hidden;$('handReveal').setAttribute('aria-expanded',String(!$('hand').hidden));};
$('preset').onchange=()=>{preset=+$('preset').value;index=0;frames=C.trace(C.presets[preset]);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{revealed=false;render();};$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
function nav(){let active=$('step0');const threshold=document.querySelector('.step-nav').getBoundingClientRect().height+80;for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=threshold)active=s;for(const a of document.querySelectorAll('.step-nav a')){const yes=a.hash==='#'+active.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');}}
locale.onChange(()=>{render();nav();});locale.init();addEventListener('scroll',nav,{passive:true});addEventListener('resize',nav);
