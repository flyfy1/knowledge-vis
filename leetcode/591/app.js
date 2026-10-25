'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,at=0,frames=TagValidator.trace(TagValidator.presets[0]),choice=null,revealed=false,copyStatus='';
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const stackText=s=>s.length?'['+s.join(', ')+']':t('empty')+' []';
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 const f=frames[at],code=TagValidator.presets[preset];
 $('summary').textContent=t('summary',{frame:at,total:frames.length-1,i:f.i,n:code.length,status:t(f.result===null?'pending':f.result?'valid':'invalid')});
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 $('position').max=frames.length-1;$('position').value=at;
 $('inputView').replaceChildren(...Array.from(code,(ch,i)=>node('span',ch,(i<f.i?'consumed ':'')+(i>=f.a&&i<f.b?'current':''))));
 $('stackView').textContent=t('beforeAfter',{before:stackText(f.before),after:stackText(f.stack)});
 $('action').textContent=t(f.kind,f);
 const table=node('table'),head=node('thead'),row=node('tr');table.append(node('caption',t('history')));
 [t('span'),t('operation'),t('stackCol')].forEach(v=>{const th=node('th',v);th.scope='col';row.append(th);});head.append(row);table.append(head);
 const body=node('tbody');frames.slice(0,at+1).forEach((frame,index)=>{const r=node('tr');if(index===at)r.className='changed';const th=node('th',`[${frame.a},${frame.b})`);th.scope='row';const action=node('td');action.append(node('code',frame.token),node('p',t(frame.kind,frame)));r.append(th,action,node('td',stackText(frame.stack)));body.append(r);});table.append(body);$('ledger').replaceChildren(table);$('ledger').setAttribute('aria-label',t('history'));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='1'?'correct':'incorrect')+' '+t('quizReason'):'';
 $('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=TagValidator.trace(TagValidator.presets[preset]);render();};
$('prev').onclick=()=>{at=Math.max(0,at-1);render();};$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);render();};$('reset').onclick=()=>{at=0;render();};$('end').onclick=()=>{at=frames.length-1;render();};$('position').oninput=e=>{at=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
