'use strict';
const locale=LeetCodeLocale(window.LISP_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,step=0,trace=Lisp.trace(Lisp.presets[0]),choice=null,revealed=false,copyState='';
$('baselineCode').textContent=window.BASELINE_SOURCE;
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
function describe(f){return t(f.kind,f);}
function maps(target,env){target.replaceChildren();if(!Object.keys(env).length){target.textContent=t('empty');return;}Object.entries(env).forEach(([name,values])=>{const el=document.createElement('p');el.className='map-card map-values';el.textContent=name+' : ['+values.join(', ')+']';target.append(el);});}
function render(){
 const f=trace.frames[step];
 $('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('nav'));
 [...$('preset').options].forEach((el,i)=>el.textContent=t('p'+i));
 $('input').textContent=Lisp.presets[selected];$('progress').textContent=t('progress',{s:step,n:trace.frames.length-1,i:f.i,len:trace.tokens.length});
 $('prefix').textContent=t('remaining',{text:trace.tokens.slice(f.i).join(' ')||t('none')});$('event').textContent=describe(f);
 maps($('beforeMaps'),trace.frames[Math.max(0,step-1)].env);maps($('afterMaps'),f.env);
 $('calls').replaceChildren();if(!f.calls.length)$('calls').textContent=t('none');else f.calls.forEach(c=>{const li=document.createElement('li');li.textContent=c.op+' · start='+c.start;$('calls').append(li);});
 $('output').textContent=f.kind==='done'?t('result',f):t('pending');
 $('history').replaceChildren();trace.frames.slice(1,step+1).forEach(frame=>{const li=document.createElement('li');li.textContent=describe(frame);$('history').append(li);});
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===trace.frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{selected=Number(e.target.value);trace=Lisp.trace(Lisp.presets[selected]);step=0;render();});
for(const [id,move] of Object.entries({prev:()=>step-1,next:()=>step+1,reset:()=>0,end:()=>trace.frames.length-1}))$(id).addEventListener('click',()=>{step=move();render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=Number(el.value);revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
locale.onChange(render);locale.init();
function updateNav(){let active='step0';document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=120)active=s.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const current=a.hash==='#'+active;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
