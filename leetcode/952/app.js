'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,C=FactorCore;
const $=id=>document.getElementById(id);
let nums=C.presets[0],frames=C.trace(nums),at=0,choice=null,revealed=false,copyState='';
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
function eventText(e){return t(e.kind,{...e,v:nums[e.i],w:nums[e.j]});}
function render(){
 const f=frames[at];$('inputRead').textContent='nums = ['+nums.join(', ')+']';
 $('groups').replaceChildren(...f.groups.map((g,k)=>{const div=document.createElement('div');div.className='group';const label=document.createElement('p'),values=document.createElement('p');label.textContent=t('group',{k:k+1,n:g.length});values.className='values';values.textContent='{'+g.join(', ')+'}';div.append(label,values);return div;}));
 $('round').textContent=t('progress',{k:at,total:frames.length-1,largest:f.largest,final:t(at===frames.length-1?'final':'pending')});
 $('owners').innerHTML='<thead><tr><th>'+t('prime')+'</th><th>'+t('owner')+'</th></tr></thead><tbody>'+Object.entries(f.owner).map(([p,i])=>`<tr><td>${p}</td><td>${i} (${nums[i]})</td></tr>`).join('')+(!Object.keys(f.owner).length?'<tr><td colspan="2">'+t('empty')+'</td></tr>':'')+'</tbody>';
 $('history').replaceChildren(...f.events.map((e,i)=>{const li=document.createElement('li');li.textContent=(i===at-1?'→ ':'')+eventText(e);if(i===at-1)li.className='current';return li;}));
 $('prev').disabled=at===0;$('reset').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
 const a=C.presets[0];let rows='';for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const d=gcd(a[i],a[j]);rows+=`<tr><td>${a[i]}, ${a[j]}</td><td>${d}</td><td>${t(d>1?'yes':'no')}</td></tr>`;}
 $('baselineTable').innerHTML='<thead><tr><th>'+t('pair')+'</th><th>'+t('gcd')+'</th><th>'+t('edge')+'</th></tr></thead><tbody>'+rows+'</tbody>';
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice==='3'?'correct':'retry')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',()=>{nums=C.presets[Number($('preset').value)];frames=C.trace(nums);at=0;render();});
$('prev').onclick=()=>{at=Math.max(0,at-1);render();};$('next').onclick=()=>{at=Math.min(frames.length-1,at+1);render();};$('reset').onclick=()=>{at=0;render();};$('end').onclick=()=>{at=frames.length-1;render();};
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=el.value;revealed=false;render();}));$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').value=window.PYTHON_SOURCE;$('copyText').focus();$('copyText').select();} $('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
const sections=[...document.querySelectorAll('.step')];
function nav(){let active=sections[0];for(const s of sections)if(s.getBoundingClientRect().top<150)active=s;document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
addEventListener('scroll',nav,{passive:true});nav();
