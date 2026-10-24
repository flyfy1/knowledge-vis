(()=>{'use strict';
const ui=LeetCodeLocale(window.LESSON_COPY),t=ui.t,$=id=>document.getElementById(id),C=window.MaxNumber;
const pickCases=[{nums:[3,5,4],take:2},{nums:[3,4,6,5],take:2},{nums:[9,7,4,2],take:2},{nums:[5,5,4],take:2},{nums:[6,2],take:0},{nums:[6,0,4],take:3}];
const mergeCases=[[[6,7],[6,0,4]],[[6,6,8],[6,6,3]],[[6],[6,0]],[[5,2],[5,2]],[[],[6,2]]];
let pickAt=0,mergeAt=0,choice=null,revealed=false,copyMsg='';
const fmt=a=>'['+a.join(', ')+']';
const tiles=(id,a)=>{$(id).replaceChildren();if(!a.length){$(id).textContent=t('empty');return;}a.forEach(d=>{const span=document.createElement('span');span.className='digit';span.textContent=d;$(id).append(span);});};
function controls(prefix,at,last){$(prefix+'Prev').disabled=at===0;$(prefix+'Next').disabled=at===last;$(prefix+'Next').textContent=t(at===last?'end':'next');}
function splitRender(){
 const all=C.splits([3,5,4],[6,2],3),take=+$('take').value,current=all.find(r=>r.take===take);
 $('splitLedger').innerHTML=all.map(r=>`<div class="split-record ${r.take===take?'current':''}"><b>${t('allocation')}: take=${r.take}${r.take===take?' · '+t('selected'):''}</b><div>${t('subsequences')}: A=${fmt(r.left)}, B=${fmt(r.right)}</div><div>${t('candidate')}: ${fmt(r.candidate)}</div></div>`).join('');
 $('splitRead').textContent=t('splitRead',{take,a:fmt(current.left),b:fmt(current.right),out:fmt(current.candidate)});
}
function pickReason(f){return t(f.type,{...f,out:fmt(f.stack)});}
function pickRender(){
 const {nums,take}=pickCases[+$('pickPreset').value],frames=C.pickTrace(nums,take),f=frames[pickAt];
 $('pickInput').textContent=t('sourceInput',{nums:fmt(nums),take,budget:nums.length-take});tiles('pickBefore',f.before);tiles('pickAfter',f.stack);
 $('pickProgress').textContent=t('progress',{at:pickAt,total:frames.length-1,processed:f.processed,length:nums.length,drop:f.drop});$('pickReason').textContent=pickReason(f);
 $('pickHistory').innerHTML=frames.slice(1,pickAt+1).map(x=>`<li>${pickReason(x)} → ${fmt(x.stack)}; drop=${x.drop}</li>`).join('');$('pickHistory').setAttribute('aria-label',t('history'));controls('pick',pickAt,frames.length-1);
}
function mergeReason(f){return f.type==='start'?t('mergeStart'):t('mergeReason',{...f,left:fmt(f.left),right:fmt(f.right),sign:f.comparison>0?'>':f.comparison<0?'<':'='});}
function mergeRender(){
 const [a,b]=mergeCases[+$('mergePreset').value],frames=C.mergeTrace(a,b),f=frames[mergeAt];
 $('mergeInput').textContent=t('mergeInput',{a:fmt(a),b:fmt(b)});tiles('leftSuffix',f.left);tiles('rightSuffix',f.right);tiles('mergeOutput',f.out);
 $('mergeProgress').textContent=t('mergeProgress',{at:mergeAt,total:a.length+b.length});$('mergeReason').textContent=mergeReason(f);
 $('mergeHistory').innerHTML=frames.slice(1,mergeAt+1).map(x=>`<li>${mergeReason(x)} → ${fmt(x.out)}</li>`).join('');$('mergeHistory').setAttribute('aria-label',t('history'));controls('merge',mergeAt,frames.length-1);
}
function prediction(){ $('reveal').disabled=choice===null;$('feedback').textContent=revealed?t(choice===1?'right':'wrong')+' '+t('answer'):t(choice===null?'choose':'pending');}
$('take').addEventListener('change',splitRender);
$('pickPreset').addEventListener('change',()=>{pickAt=0;pickRender();});$('mergePreset').addEventListener('change',()=>{mergeAt=0;mergeRender();});
for(const prefix of ['pick','merge']){
 const render=prefix==='pick'?pickRender:mergeRender;
 $(prefix+'Prev').onclick=()=>{if(prefix==='pick')pickAt=Math.max(0,pickAt-1);else mergeAt=Math.max(0,mergeAt-1);render();};
 $(prefix+'Next').onclick=()=>{if(prefix==='pick'){const p=pickCases[+$('pickPreset').value];pickAt=Math.min(pickAt+1,C.pickTrace(p.nums,p.take).length-1);}else{const [a,b]=mergeCases[+$('mergePreset').value];mergeAt=Math.min(mergeAt+1,a.length+b.length);}render();};
 $(prefix+'Reset').onclick=()=>{if(prefix==='pick')pickAt=0;else mergeAt=0;render();};
}
document.querySelectorAll('[name=prediction]').forEach(r=>r.onchange=()=>{choice=+r.value;revealed=false;prediction();});$('reveal').onclick=()=>{if(choice!==null){revealed=true;prediction();}};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copySource').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyMsg='copied';$('manualWrap').hidden=true;}catch(_){copyMsg='fallback';$('manualWrap').hidden=false;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyMsg);};
function render(){splitRender();pickRender();mergeRender();prediction();if(copyMsg)$('copyStatus').textContent=t(copyMsg);$('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navLabel'));}
ui.onChange(render);ui.init();
const nav=[...document.querySelectorAll('.step-nav a')],sections=[...document.querySelectorAll('.step')];
let scheduled=false;
function updateNav(){
 scheduled=false;
 const boundary=document.querySelector('.step-nav').getBoundingClientRect().bottom+64;
 let current=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=boundary)current=section;
 nav.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
function scheduleNav(){if(!scheduled){scheduled=true;requestAnimationFrame(updateNav);}}
addEventListener('scroll',scheduleNav,{passive:true});addEventListener('resize',scheduleNav);ui.onChange(scheduleNav);updateNav();
})();
