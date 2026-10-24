'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,index=0,frames=RepetitionCore.trace(...RepetitionCore.presets[0]),choice=null,revealed=false,copyState='';
function explain(f,input){
 const [s1,n1,s2,n2]=input;
 if(f.kind==='char')return t(f.match?'charMatch':'charSkip',{...f,b:f.block+1,need:s2[f.before]});
 return t(f.kind,{...f,n2,skip:f.q*f.L});
}
function action(f){return f.kind==='char'?t(f.match?'take':'skip')+` ${f.ch} [${f.pos}]`:t({start:'initial',boundary:'blockEvent',jump:'jumpEvent',done:'doneEvent'}[f.kind]);}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));$('historyWrap').setAttribute('aria-label',t('scroll'));
 const input=RepetitionCore.presets[selected],[s1,n1,s2,n2]=input,f=frames[index];
 $('progress').textContent=t('progress',{s1,n1,s2,n2,i:index,total:frames.length-1});
 $('prev').disabled=$('reset').disabled=index===0;$('next').disabled=$('end').disabled=index===frames.length-1;
 $('position').max=frames.length-1;$('position').value=index;
 for(const [key,val] of [['block',f.block],['j',f.j],['count',f.count]])$(key+'Value').textContent=val;
 $('needed').textContent=t('needed',{j:f.j,ch:s2[f.j]});$('decision').textContent=explain(f,input);
 $('history').replaceChildren(...frames.slice(0,index+1).map((f,i)=>{const tr=document.createElement('tr');[i,action(f)+(f.kind==='jump'?` · ${f.q}×${f.L} → +${f.q*f.G}`:''),`(${f.block}, ${f.j}, ${f.count})`].forEach((value,k)=>{const c=document.createElement(k===0?'th':'td');c.textContent=value;if(k===0)c.scope='row';tr.append(c);});return tr;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('preset').onchange=e=>{selected=+e.target.value;index=0;frames=RepetitionCore.trace(...RepetitionCore.presets[selected]);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};$('position').oninput=e=>{index=+e.target.value;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=+e.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
