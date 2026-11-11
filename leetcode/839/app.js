'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=SimilarCore;
let hand=['tars'],swaps=[],preset=0,at=0,frames=C.trace(C.presets[0]),selected=null,revealed=false,copyState='';
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function letters(word,diff){const e=node('span','','letters');[...word].forEach((ch,i)=>e.append(node('span',ch,'letter'+(diff.includes(i)?' diff':''))));return e;}
function renderHand(){const word=hand[hand.length-1],diff=C.differences(word,'arts');$('handWord').replaceChildren(letters(word,diff));$('handRead').textContent=t('handRead',{word,diff:diff.length?diff.join(', '):t('none'),relation:t(diff.length===0||diff.length===2?'direct':'notDirect')});$('handHistory').textContent=t('handHistory',{h:swaps.length?swaps.map(x=>x.join(' ↔ ')).join(' → '):t('noSwaps')});$('undo').disabled=hand.length===1;}
function eventText(e){return t('pair',{...e,diff:e.diff.length?e.diff.join(', '):t('none'),action:t(e.kind)});}
function renderTrace(){const words=C.presets[preset],f=frames[at],event=f.event;
 $('inputRead').textContent=t('input',{words:JSON.stringify(words)});
 $('frameRead').textContent=t('frame',{at,total:frames.length-1,count:f.count,status:t(at===frames.length-1?'done':at===0?'initial':'partial')});
 $('pairRead').hidden=!event;$('pairRead').textContent=event?eventText(event):'';
 $('pairWords').replaceChildren(...(event?[event.i,event.j]:[]).map(i=>{const row=node('div','','word-row');row.append(node('span',t('word',{i,word:words[i]})),letters(words[i],event.diff));return row;}));
 $('groups').replaceChildren(...f.groups.map(g=>node('div',t('group',{root:g.root,size:f.size[g.root],members:g.members.map(i=>i+': '+words[i]).join(' | ')}),'group-row')));
 $('parents').replaceChildren(...f.parent.map((p,i)=>node('span',i+' → '+p)));
 $('ledger').replaceChildren(...f.history.map((e,i)=>node('li',eventText(e),i===f.history.length-1?'current':'')));$('emptyLedger').hidden=!!at;
 $('prev').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
}
function renderQuiz(){$('reveal').disabled=selected===null;$('feedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');$('feedback').classList.toggle('correct',revealed&&selected===1);}
function render(){renderHand();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';}
function swap(a,b){const chars=[...hand[hand.length-1]];[chars[a],chars[b]]=[chars[b],chars[a]];hand.push(chars.join(''));swaps.push([a,b]);renderHand();}
$('swap02').onclick=()=>swap(0,2);$('swap01').onclick=()=>swap(0,1);$('undo').onclick=()=>{if(hand.length>1){hand.pop();swaps.pop();}renderHand();};$('handReset').onclick=()=>{hand=['tars'];swaps=[];renderHand();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{if(at)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name=prediction]'))r.onchange=()=>{selected=Number(r.value);revealed=false;renderQuiz();};$('reveal').onclick=()=>{revealed=true;renderQuiz();};$('quizReset').onclick=()=>{selected=null;revealed=false;document.querySelectorAll('[name=prediction]').forEach(r=>r.checked=false);renderQuiz();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const section of document.querySelectorAll('.step'))if(section.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=section;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
