'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let input=MagicalCore.presets[0],frames=MagicalCore.trace(input),step=0,choice=null,revealed=false,copyState='';
function el(tag,text){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;}
function numbers(target,x,a,b,ranked){let r=0;target.replaceChildren(...Array.from({length:x},(_,i)=>{const v=i+1,aa=v%a===0,bb=v%b===0,e=el('div');e.className='number'+(aa||bb?' yes':'')+(aa&&bb?' both':'');e.append(el('b',v),el('span',t(aa&&bb?'both':aa?'aOnly':bb?'bOnly':'neither')));if(aa||bb){r++;if(ranked)e.append(el('span',t('rank',{r})));}return e;}));}
function operation(f){return t(f.kind,f);}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 numbers($('handNumbers'),6,2,3,true);const x=Number($('countX').value),ca=Math.floor(x/2),cb=Math.floor(x/3),both=Math.floor(x/6);
 $('ca').textContent=ca;$('cb').textContent=cb;$('cboth').textContent='−'+both;$('countResult').textContent=t('countResult',{x,ca,cb,both,c:ca+cb-both});numbers($('countNumbers'),x,2,3,false);
 const f=frames[step],n=frames.length-1;
 $('input').textContent=t('stats',{...input,lcm:(input.a/MagicalCore.gcd(input.a,input.b))*input.b,u:input.n*Math.min(input.a,input.b)});
 $('prev').disabled=$('reset').disabled=step===0;$('next').disabled=$('end').disabled=step===n;$('position').max=n;$('position').value=step;
 $('progress').textContent=t('progress',{k:step,n});$('beforeInterval').textContent=`[${f.beforeLo??f.lo}, ${f.beforeHi??f.hi}]`;$('afterInterval').textContent=`[${f.lo}, ${f.hi}]`;
 $('tested').hidden=step===0;$('tested').textContent=step?t('tested',{...f,n:input.n}):'';$('operation').textContent=operation(f);
 $('result').hidden=f.lo!==f.hi;$('result').textContent=f.lo===f.hi?t('finished',{n:input.n,answer:f.lo,residue:f.lo%1000000007}):'';
 $('history').replaceChildren(...frames.slice(0,step+1).map((x,i)=>{const li=el('li',operation(x));if(i===step){li.className='current';li.append(el('b',t('current')));}return li;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('answer'):'';$('copyStatus').textContent=copyState?t(copyState):'';syncNav();
}
$('countX').oninput=render;
$('preset').onchange=e=>{input=MagicalCore.presets[Number(e.target.value)];frames=MagicalCore.trace(input);step=0;render();};
$('prev').onclick=()=>{step=Math.max(0,step-1);render();};$('next').onclick=()=>{step=Math.min(frames.length-1,step+1);render();};$('reset').onclick=()=>{step=0;render();};$('end').onclick=()=>{step=frames.length-1;render();};$('position').oninput=e=>{step=Number(e.target.value);render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=Number(e.value);revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
