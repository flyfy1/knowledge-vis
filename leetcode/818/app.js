'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=RaceCore;
let searchTarget=6,searchAt=0,searchFrames=C.searchTrace(6);
let commands=[],target=6,at=0,frames=C.trace(target),selected=null,revealed=false,copyState='';
function node(tag,text,cls){const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;}
function hand(){let p=0,s=1;const rows=[node('li',t('start')+' (0,1)')];for(const c of commands){[p,s]=C.move(p,s,c);rows.push(node('li',c+' → ('+p+','+s+')'));}$('handHistory').replaceChildren(...rows);$('handRead').textContent=t('handRead',{n:commands.length,p,s});$('undo').disabled=!commands.length;$('a').disabled=$('r').disabled=commands.length===12;}
function trace(){const f=frames[at];$('frameRead').textContent=t('frame',{target,d:f.d,last:frames.length-1,n:f.rows.reduce((n,r)=>n+r.states.length,0),status:f.done?t('found',{d:f.d}):t('searching')});$('layers').replaceChildren(...f.rows.map(row=>{const box=node('div','','layer'+(row.d===f.d?' current':''));box.append(node('h3',t('layer',{d:row.d,n:row.states.length})));const pairs=node('div','','pairs');pairs.append(...row.states.map(([p,s,path])=>node('span',t('pair',{p,s,path:path||t('empty'),flag:p===target?t('targetFlag'):''}),'pair'+(p===target?' goal':''))));box.append(pairs);return box;}));$('prev').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;}
function predict(){$('reveal').disabled=selected===null;$('feedback').textContent=revealed?t(selected===1?'correct':'incorrect')+' '+t('answer'):t('await');$('feedback').classList.toggle('correct',revealed&&selected===1);}
$('a').onclick=()=>{commands.push('A');hand();};$('r').onclick=()=>{commands.push('R');hand();};$('undo').onclick=()=>{commands.pop();hand();};$('reset').onclick=()=>{commands=[];hand();};
$('preset').onchange=e=>{target=Number(e.target.value);frames=C.trace(target);at=0;trace();};$('prev').onclick=()=>{if(at)at--;trace();};$('next').onclick=()=>{if(at<frames.length-1)at++;trace();};$('end').onclick=()=>{at=frames.length-1;trace();};$('traceReset').onclick=()=>{at=0;trace();};
for(const radio of document.querySelectorAll('[name=prediction]'))radio.onchange=()=>{selected=Number(radio.value);revealed=false;predict();};$('reveal').onclick=()=>{revealed=true;predict();};
function search(){
 const f=searchFrames[searchAt],state=x=>t('searchState',x);
 $('searchRead').textContent=t('searchFrame',{target:searchTarget,at:searchAt,last:searchFrames.length-1,kind:t(f.kind),expanded:f.expanded,generated:f.generated,discovered:f.discovered});
 $('searchCurrent').textContent=f.current?state(f.current):t('initial');
 $('searchChildren').replaceChildren(...(f.children.length?f.children.map(x=>node('li',x.command+' → '+state(x)+' · '+t(x.status)+(x.previous===undefined?'':' · '+t('previousG',{g:x.previous})))):[node('li',t('noChildren'))]));
 $('searchFrontier').replaceChildren(...f.frontier.map(x=>node('li',state(x)+' · '+t(x.outdated?'pendingStale':'queued'))));
 $('searchHistory').replaceChildren(...searchFrames.slice(1,searchAt+1).map(x=>node('li',t(x.kind)+' · '+state(x.current))));
 $('searchPrev').disabled=$('searchReset').disabled=searchAt===0;
 $('searchNext').disabled=$('searchEnd').disabled=searchAt===searchFrames.length-1;
}
$('searchPreset').onchange=e=>{searchTarget=Number(e.target.value);searchFrames=C.searchTrace(searchTarget);searchAt=0;search();};
$('searchPrev').onclick=()=>{if(searchAt)searchAt--;search();};
$('searchNext').onclick=()=>{if(searchAt<searchFrames.length-1)searchAt++;search();};
$('searchEnd').onclick=()=>{searchAt=searchFrames.length-1;search();};
$('searchReset').onclick=()=>{searchAt=0;search();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceDetails').open=true;$('sourceFallback').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(()=>{hand();trace();predict();search();$('copyStatus').textContent=copyState?t(copyState):'';});locale.init();
function nav(){const sections=[...document.querySelectorAll('.step')],bottom=document.querySelector('.step-nav').getBoundingClientRect().bottom;let id=sections[0].id;for(const s of sections)if(s.getBoundingClientRect().top<=bottom+40)id=s.id;for(const a of document.querySelectorAll('.step-nav a')){const active=a.hash==='#'+id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');}}
window.addEventListener('scroll',nav,{passive:true});window.addEventListener('resize',nav);nav();
