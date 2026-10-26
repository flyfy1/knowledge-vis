'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,hand=0,choice=null,revealed=false,copyState='';
let model=TeamCore.trace(TeamCore.presets[0].skills,TeamCore.presets[0].people);
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function binary(m){return m.toString(2).padStart(model.skills.length,'0');}
function team(x){return x===undefined||x===null?t('unreachable'):'['+x.join(',')+']';}
function skills(m){const a=model.skills.filter((_,j)=>m&(1<<j));return a.length?'{'+a.join(', ')+'}':'{}';}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 $('handState').textContent=t('hand'+hand);$('handHistory').replaceChildren();
 for(let k=1;k<=hand;k++)$('handHistory').append(node('li',t('hand'+k)));
 $('handPrev').disabled=hand===0;$('handNext').disabled=hand===4;
 const f=model.frames[index];
 $('presetDescription').textContent=t('preset'+preset);
 $('input').textContent=t('input',{skills:model.skills.join(', ')});$('people').replaceChildren();
 model.people.forEach((p,i)=>$('people').append(node('li',t('personRow',{i,skills:p.length?'{'+p.join(', ')+'}':t('none'),mask:binary(model.masks[i])})+(f.done===i+1?' ★':''),f.done===i+1?'current':'')));
 $('coverageGrid').replaceChildren();
 for(let m=0;m<=model.full;m++){
  const changed=f.after[m]!==undefined&&(f.before[m]===undefined||f.after[m].length<f.before[m].length);
  const card=node('div','','coverage-card'+(changed&&index>0?' changed':''));card.dataset.mask=m;
  card.append(node('h3',t('coverage',{mask:binary(m),skills:skills(m),star:changed&&index>0?' ★':''})),node('p',t('beforeAfter',{before:team(index?f.before[m]:f.after[m]),after:team(f.after[m])})));
  $('coverageGrid').append(card);
 }
 $('event').textContent=index?t('round',{i:index-1,mask:binary(model.masks[index-1]),count:f.events.length}):t('initial');
 $('progress').textContent=t('progress',{done:f.done,n:model.people.length,states:Object.keys(f.after).length,all:model.full+1});
 const result=f.after[model.full];$('output').textContent=result?t('result',{team:team(result),size:result.length,status:t(index===model.people.length?'final':'provisional')}):t('pendingResult');
 $('attempts').replaceChildren();if(!f.events.length)$('attempts').append(node('li',t('noEvents')));
 f.events.forEach(e=>$('attempts').append(node('li',t('event',{from:binary(e.mask),team:team(f.before[e.mask]),i:index-1,to:binary(e.merged),candidate:team(e.candidate),old:team(e.old),decision:t(e.accept?'accept':'reject')}))));
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===model.people.length;$('end').disabled=index===model.people.length;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('explanation'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handPrev').onclick=()=>{if(hand>0)hand--;render();};$('handNext').onclick=()=>{if(hand<4)hand++;render();};
$('preset').onchange=()=>{preset=Number($('preset').value);index=0;const p=TeamCore.presets[preset];model=TeamCore.trace(p.skills,p.people);render();};
$('prev').onclick=()=>{if(index>0)index--;render();};$('next').onclick=()=>{if(index<model.people.length)index++;render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=model.people.length;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});
$('reveal').onclick=()=>{if(choice!==null){revealed=true;render();}};
$('code').textContent=window.PYTHON_SOURCE;$('fallbackSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').focus();$('fallbackSource').select();}render();};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function updateNav(){const threshold=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<=threshold)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const selected=a.hash==='#'+active.id;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
let navScheduled=false;function scheduleNav(){if(navScheduled)return;navScheduled=true;requestAnimationFrame(()=>{navScheduled=false;updateNav();});}
window.addEventListener('scroll',scheduleNav,{passive:true});window.addEventListener('resize',scheduleNav);locale.onChange(scheduleNav);updateNav();
