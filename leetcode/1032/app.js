'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t;
const $=id=>document.getElementById(id);
let preset=0,index=0,hand=0,choice=null,revealed=false,copyState='';
let model=StreamCore.trace(StreamCore.presets[preset]);
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function history(target,rows){
  target.replaceChildren();
  if(!rows.length){target.append(node('li',t('noHistory')));return;}
  rows.forEach(r=>target.append(node('li',t('historyRow',{q:r.query,prefix:r.prefix,result:String(r.result),reason:r.result?t('matchReason',{match:r.match}):t('noMatchReason')}),r.result?'yes':'')));
}
function render(){
  $('langToggle').setAttribute('aria-label',t('language'));
  document.querySelector('nav').setAttribute('aria-label',t('navigation'));
  $('handState').textContent=hand?t('handState',{n:hand,stream:'abx'.slice(0,hand)}):t('handInitial');
  const handRows=[];for(let i=1;i<=hand;i++){const prefix='abx'.slice(0,i);handRows.push({query:i,prefix,result:i===2,match:i===2?'ab':''});}
  history($('handHistory'),handRows);$('handPrev').disabled=hand===0;$('handNext').disabled=hand===3;
  const input=StreamCore.presets[preset],f=model.frames[index];
  $('presetDescription').textContent=t('preset'+preset);
  $('experimentInput').textContent=t('experimentInput',{words:input.words.join(', '),stream:input.stream,limit:model.limit});
  $('buffer').replaceChildren();
  if(f.buffer)for(const ch of f.buffer)$('buffer').append(node('span',ch,'letter'));
  else $('buffer').append(node('span',t('emptyBuffer')));
  $('state').textContent=t('state',{count:f.received.length,done:f.history.length,query:f.query||'—'});
  $('pathState').textContent=t('pathState',{path:f.path||t('emptyPath'),k:f.path.length});
  $('trie').replaceChildren();
  model.nodes.forEach((n,id)=>{
    const visited=f.path.startsWith(n.path),current=id===f.node;
    const card=node('div','',`trie-node${visited?' visited':''}${current?' current':''}`);
    card.append(node('b',t('nodePath',{path:n.path||t('emptyPath')})));
    card.append(node('span',n.terminal?t('completeWord',{word:[...n.path].reverse().join('')}):t('notTerminal')));
    card.append(node('span',t('nextEdges',{edges:Object.keys(n.children).join(', ')||t('noEdges')})));
    if(visited)card.append(node('span',t('visited'),'node-flags'));
    if(current)card.append(node('span',t('current'),'node-flags'));
    $('trie').append(card);
  });
  const eventKeys={initial:'initialEvent',append:'appendEvent',edge:'edgeEvent',terminal:'terminalEvent',missing:'missingEvent',exhausted:'exhaustedEvent'};
  $('event').textContent=t(eventKeys[f.kind],{...f,limit:model.limit});
  $('progress').textContent=t('progress',{index,total:model.frames.length-1,status:t(index===model.frames.length-1?'ended':'active')});
  $('prev').disabled=index===0;$('reset').disabled=index===0;
  $('next').disabled=index===model.frames.length-1;$('end').disabled=index===model.frames.length-1;
  history($('history'),f.history);
  $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
  $('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('explanation'):'';
  $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<3)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);model=StreamCore.trace(StreamCore.presets[preset]);index=0;render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.frames.length-1)index++;render();};
$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{choice=Number(el.value);revealed=false;render();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const selected=a.hash==='#'+active.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
