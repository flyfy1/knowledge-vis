'use strict';
const locale=LeetCodeLocale(COPY),t=locale.t,C=Stamping,$=id=>document.getElementById(id);
let hand=0,preset=0,frame=0,choice=null,revealed=false,copyState='';
const handBoards=['???','ab?','aab'];
function cells(board,i,m){return [...board].map((c,p)=>'<div class="letter'+(c==='?'?' erased':'')+(i!==null&&p>=i&&p<i+m?' current':'')+'">'+c+'<small>'+p+'</small></div>').join('');}
function desc(f){return t(f.kind,{...f,fresh:f.fresh.join(','),answer:f.answer.join(','),result:(f.result||[]).join(',')});}
function handRows(stamp,initial,moves){let b=[...initial];return [t('handInitial').replace('???',initial),...moves.map(i=>{const before=b.join('');for(let j=0;j<stamp.length;j++)b[i+j]=stamp[j];return t('handRow',{i,before,after:b.join('')});})].map(s=>'<li>'+s+'</li>').join('');}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('nav'));$('labTable').setAttribute('aria-label',t('tableAria'));$('sourcePre').setAttribute('aria-label',t('sourceAria'));$('baselinePre').setAttribute('aria-label',t('baselineTitle'));
 $('handBoard').innerHTML=cells(handBoards[hand],hand?hand-1:null,2);$('handProgress').textContent=t('handProgress',{k:hand,s:handBoards[hand]});$('handHistory').innerHTML=handRows('ab','???',[0,1].slice(0,hand));$('handPrev').disabled=hand===0;$('handNext').disabled=hand===2;
 const lab=['aab','a??','???'][+$('labState').value],i=+$('labWindow').value,r=C.inspect('ab',lab,i);
 $('labTable').innerHTML='<table><thead><tr>'+['position','visible','stampLetter','comparison'].map(k=>'<th scope="col">'+t(k)+'</th>').join('')+'</tr></thead><tbody>'+[0,1].map(j=>'<tr><td>'+(i+j)+'</td><td>'+lab[i+j]+'</td><td>'+'ab'[j]+'</td><td>'+t(lab[i+j]==='?'?'wild':lab[i+j]==='ab'[j]?'match':'mismatch')+'</td></tr>').join('')+'</tbody></table>';
 $('labResult').textContent=t('labResult',{i,bad:r.bad.length,fresh:r.fresh.length,status:t(r.legal?'useful':r.bad.length?'blocked':'noop')});
 const [stamp,target]=C.presets[preset],model=C.trace(stamp,target),f=model.frames[frame];
 $('input').textContent='stamp="'+stamp+'"; target="'+target+'"';$('board').innerHTML=cells(f.board,f.i,stamp.length);$('currentWindow').textContent=f.i===null?'':t('window')+' '+f.i+' '+t('current');
 $('progress').textContent=t('progress',{at:frame,last:model.frames.length-1,erased:f.erased,n:target.length,message:desc(f)});$('queue').textContent=t('queue',{queue:f.queue.join(','),answer:f.answer.join(',')});
 $('blockers').innerHTML='<p>'+t('blockers')+'</p><div class="counts">'+f.todo.map((v,w)=>'<div class="count'+(w===f.i?' current':'')+'">i='+w+'<b>'+v+'</b></div>').join('')+'</div>';
 $('waiting').innerHTML=model.waiting.map((ws,p)=>'<div>p='+p+': ['+ws.join(',')+']</div>').join('');
 $('history').innerHTML=model.frames.slice(0,frame+1).map((s,k)=>'<li'+(k===frame?' class="current-row"':'')+'>'+desc(s)+' <code>'+s.board+'</code>'+(k===frame?' '+t('currentEvent'):'')+(s.kind==='erase'||s.kind==='skip'?'<ul>'+(s.updates.length?s.updates.map(u=>'<li>'+t('update',u)+'</li>').join(''):'<li>'+t('none')+'</li>')+'</ul>':'')+'</li>').join('');
 $('forward').hidden=f.kind!=='success';$('forwardHistory').innerHTML=f.kind==='success'?handRows(stamp,'?'.repeat(target.length),f.result):'';
 $('prev').disabled=frame===0;$('next').disabled=$('end').disabled=frame===model.frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('quizExplain'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
for(const [id,fn] of Object.entries({handPrev:()=>hand--,handNext:()=>hand++,handReset:()=>hand=0,prev:()=>frame--,next:()=>frame++,reset:()=>frame=0,end:()=>frame=C.trace(...C.presets[preset]).frames.length-1}))$(id).addEventListener('click',()=>{fn();render();});
for(const id of ['labState','labWindow'])$(id).addEventListener('change',render);
$('preset').addEventListener('change',e=>{preset=+e.target.value;frame=0;render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;render();}));$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;$('baselineCode').textContent=window.BASELINE_SOURCE;
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
function nav(){const boundary=document.querySelector('.step-nav').getBoundingClientRect().bottom+32;let active='step0';document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=boundary)active=s.id;});document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active));}
window.addEventListener('scroll',nav,{passive:true});window.addEventListener('resize',nav);locale.onChange(render);locale.onChange(nav);locale.init();
