'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id),C=window.RetentionCore;
const MAIN=C.presets[0].rows;
let hand=0,marks=false,choice=null,revealed=false,copyState='';
let base=C.presets[0].rows.map(r=>r.slice()),included=base.map(()=>true),join='left',presetKey='main',seed=1;
let rows,map,frames,at=0;
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function tr(values,cls){const r=el('tr',cls||'');for(const v of values){if(v instanceof Node){const td=el('td');td.append(v);r.append(td);}else r.append(el('td','',String(v)));}return r;}
function rebuild(){rows=[];map=[];base.forEach((r,i)=>{if(included[i]){rows.push(r);map.push(i);}});frames=C.trace(rows,join);at=0;}
rebuild();
// Step 1: hand calculation, one player at a time.
const handResult=(()=>{const f=C.trace(MAIN).at(-1);return Object.keys(f.installs).map(Number).sort((a,b)=>a-b).map(p=>({p,d:f.installs[p].install_dt,next:f.looked[p].target,yes:f.looked[p].hit>=0}));})();
function renderHand(){
 $('handTable').replaceChildren(...MAIN.map((r,i)=>tr([i+1,r[0],r[2],r[1],r[3]],hand>0&&handResult[hand-1].p===r[0]?'current-row':'')));
 $('handList').replaceChildren(...handResult.slice(0,hand).map(h=>el('li','',t('handPlayer',{p:h.p,d:h.d,next:h.next,status:t(h.yes?'handYes':'handNo')}))));
 $('handRead').textContent=hand===0?t('handIntro'):hand===handResult.length?t('handDone'):'';$('handRead').hidden=hand>0&&hand<handResult.length;
 $('handNext').disabled=hand===handResult.length;$('handReset').disabled=hand===0;
}
// Step 3: which rows matter.
function renderMarks(){
 const f=C.trace(MAIN).at(-1),installRows=new Set(Object.values(f.installs).map(v=>v.row)),nextRows=new Set(Object.values(f.looked).filter(v=>v.hit>=0).map(v=>v.hit));
 $('markTable').replaceChildren(...MAIN.map((r,i)=>{const role=installRows.has(i)?'roleInstall':nextRows.has(i)?'roleNext':'roleNone';return tr([i+1,r[0],r[2],marks?t(role):'?',r[1],r[3]],marks?(role==='roleNone'?'dim':'useful'):'');}));
 $('markRead').hidden=!marks;$('markRead').textContent=t('markRead',{a:installRows.size,b:nextRows.size,c:MAIN.length-installRows.size-nextRows.size});
 $('insightBlock').hidden=!marks;$('markToggle').textContent=t(marks?'markHide':'markShow');$('markToggle').setAttribute('aria-pressed',String(marks));
}
// Step 5: the walk.
function eventText(f){
 const e=f.event;
 switch(e.type){
  case 'start':return t('evStart',{rows:e.rows});
  case 'scan':return t(e.action==='new'?'evScanNew':e.action==='earlier'?'evScanEarlier':'evScanLater',{i:map[e.idx]+1,p:e.player,d:e.date,old:e.old});
  case 'lookup':return e.hit>=0?t('evLookupHit',{p:e.player,d:e.install_dt,t:e.target,row:map[e.hit]+1}):t(e.kept?'evLookupMiss':'evLookupDrop',{p:e.player,d:e.install_dt,t:e.target});
  case 'group':return t('evGroup',{d:e.install_dt,m:e.installs,k:e.returned,v:e.value});
  default:return f.output.length?t('evFinal',{n:f.output.length}):t('evFinalEmpty');
 }
}
function renderTrace(){
 const f=frames[at],e=f.event;
 $('progress').textContent=t('progress',{i:at,total:frames.length-1});$('event').textContent=eventText(f);
 const scanned=e.type==='start'?-1:e.type==='scan'?e.idx:rows.length-1;
 const installRows=new Set(Object.values(f.installs).map(v=>map[v.row])),nextRows=new Set(Object.values(f.looked).filter(v=>v.hit>=0).map(v=>map[v.hit]));
 const currentBase=e.type==='scan'?map[e.idx]:e.type==='lookup'&&e.hit>=0?map[e.hit]:-1;
 $('activity').replaceChildren(...base.map((r,i)=>{
  const b=el('button','btn row-toggle',(i+1)+' · '+t(included[i]?'rowOn':'rowOff'));b.type='button';b.setAttribute('aria-pressed',String(included[i]));b.setAttribute('aria-label',t('rowToggleLabel',{i:i+1,p:r[0],d:r[2]}));b.onclick=()=>{included[i]=!included[i];rebuild();renderTrace();$('activity').querySelectorAll('.row-toggle')[i].focus();};
  const pos=map.indexOf(i);let role='',cls='';
  if(!included[i]){cls='removed';role='—';}
  else{if(installRows.has(i))role=t('roleInstall');if(nextRows.has(i))role=t('roleNext');if(pos>scanned)cls='pending';if(i===currentBase){cls='current-row';role='▶ '+role;}}
  return tr([b,r[0],r[2],role,r[1],r[3]],cls);
 }));
 const players=Object.keys(f.installs).map(Number).sort((a,b)=>a-b);
 const curP=e.type==='scan'||e.type==='lookup'?e.player:null;
 const instRows=players.map(p=>{const v=f.installs[p],l=f.looked[p];const target=l?l.target:t('notYet');const match=!l?'—':!l.kept?t('dropped'):l.hit>=0?String(p):t('nullCell');return tr([(p===curP?'▶ ':'')+p,v.install_dt,target,match],(p===curP?'current-row':'')+(l&&!l.kept?' removed':''));});
 $('installs').replaceChildren(...(instRows.length?instRows:[tr([t('emptyTable'),'','',''])]));
 const outRows=f.groups.map(g=>tr([(e.type==='group'&&e.install_dt===g.install_dt?'▶ ':'')+g.install_dt,g.installs,g.returned,g.Day1_retention],e.type==='group'&&e.install_dt===g.install_dt?'current-row':''));
 $('output').replaceChildren(...(outRows.length?outRows:[tr([t('emptyTable'),'','',''])]));
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 document.querySelectorAll('#presets [data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(C.presets[Number(b.dataset.preset)].key===presetKey)));
 $('randomTable').setAttribute('aria-pressed',String(presetKey==='random'));
 document.querySelectorAll('#joins button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.join===join)));
}
function renderQuiz(){
 $('quizTable').replaceChildren(...C.quiz.map(r=>tr([r[0],r[2],r[1],r[3]])));
 $('reveal').disabled=choice===null;
 $('feedback').textContent=revealed?(choice===2?t('correct'):t(choice===0?'wrongA':'wrongB'))+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&choice===2);
}
function render(){renderHand();renderMarks();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';$('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('navLabel'));}
$('handNext').onclick=()=>{hand=Math.min(handResult.length,hand+1);renderHand();};$('handReset').onclick=()=>{hand=0;renderHand();};
$('markToggle').onclick=()=>{marks=!marks;renderMarks();};
document.querySelectorAll('#presets [data-preset]').forEach(b=>b.onclick=()=>{const p=C.presets[Number(b.dataset.preset)];presetKey=p.key;base=p.rows.map(r=>r.slice());included=base.map(()=>true);rebuild();renderTrace();});
$('randomTable').onclick=()=>{seed+=1;presetKey='random';base=C.randomRows(seed);included=base.map(()=>true);rebuild();renderTrace();};
document.querySelectorAll('#joins button').forEach(b=>b.onclick=()=>{join=b.dataset.join;rebuild();renderTrace();});
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};
$('reset').onclick=()=>{at=0;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};
document.querySelectorAll('[name=prediction]').forEach(r=>r.onchange=()=>{choice=Number(r.value);revealed=false;renderQuiz();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;renderQuiz();}};
$('code').textContent=window.SQL_SOURCE;$('fallbackSource').value=window.SQL_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.SQL_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const bottom=$('stepNav').getBoundingClientRect().bottom+40;let current=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=bottom)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+current.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navQueued=false;window.addEventListener('scroll',()=>{if(!navQueued){navQueued=true;requestAnimationFrame(()=>{navQueued=false;updateNav();});}},{passive:true});window.addEventListener('resize',updateNav);updateNav();
