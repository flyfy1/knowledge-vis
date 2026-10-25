'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let run=DecodeWays.trace('1*'),at=0,choice=null,revealed=false,copyStatus='';
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function tokenList(id,values){$(id).replaceChildren(...(values.length?values.map(v=>el('span',v+' → '+String.fromCharCode(64+Number(v)),'token')):[el('span',t('none'),'token')]));}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('nav').setAttribute('aria-label',t('navigation'));
 const d=+$('digit').value;$('splitPath').textContent=t('splitPath',{d,letter:String.fromCharCode(64+d)});$('joinedPath').textContent=t('joinedPath',{d,letter:String.fromCharCode(74+d)});
 const pair=$('pairInput').value,single=DecodeWays.singles(pair[1]),pairs=DecodeWays.pairs(...pair);
 $('singleCount').textContent=t('singleCount',{c:pair[1],n:single.length});$('pairCount').textContent=t('pairCount',{p:pair,n:pairs.length});tokenList('singleTokens',single);tokenList('pairTokens',pairs);
 const f=run.frames[at],s=run.s,last=s.length,dp=run.frames.map(frame=>frame.value);
 $('summary').textContent=t('summary',{i:at,n:last,prefix:s.slice(0,at)||t('empty'),status:at===last?t('finished',{value:f.value}):t('pending')});
 $('prev').disabled=$('reset').disabled=at===0;$('next').disabled=$('end').disabled=at===last;$('position').max=last;$('position').value=at;
 $('event').textContent=at===0?t('initial'):t('event',{index:at-1,c:s[at-1],i:at,a:f.a,b:f.b,old1:dp[at-1],old2:at>1?dp[at-2]:0,value:f.value});
 $('oneLabel').textContent=at?t('oneBranch',{c:s[at-1],p:at-1}):t('noStep');$('oneValue').textContent=at?`${f.a} × ${dp[at-1]} = ${f.one}`:'—';
 $('twoLabel').textContent=at>1?t('twoBranch',{pair:s.slice(at-2,at),p:at-2}):t(at?'noPair':'noStep');$('twoValue').textContent=at>1?`${f.b} × ${dp[at-2]} = ${f.two}`:at?'0':'—';
 $('ledger').replaceChildren(...Array.from({length:last+1},(_,i)=>{const e=el('div',undefined,'prefix'+(i===at?' current':i>at?' future':''));e.append(el('span',t('prefixCell',{prefix:s.slice(0,i)||t('empty')})),el('b',`D[${i}] = ${i<=at?dp[i]:'?'}`),el('span',t(i===at?'current':i>at?'future':'completed')));return e;}));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice==='2'?'correct':'incorrect')+' '+t('quizReason'):'';$('copyStatus').textContent=copyStatus?t(copyStatus):'';syncNav();
}
$('digit').onchange=$('pairInput').onchange=render;
$('preset').onchange=e=>{run=DecodeWays.trace(e.target.value);at=0;render();};
$('prev').onclick=()=>{at=Math.max(0,at-1);render();};$('next').onclick=()=>{at=Math.min(run.s.length,at+1);render();};$('reset').onclick=()=>{at=0;render();};$('end').onclick=()=>{at=run.s.length;render();};$('position').oninput=e=>{at=+e.target.value;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=e.value;revealed=false;render();});$('reveal').onclick=()=>{if(choice!==null)revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyStatus='copyOk';$('manualCopy').hidden=true;}catch(_){copyStatus='copyFallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();};
function syncNav(){let active='step0';document.querySelectorAll('.step').forEach(e=>{if(e.getBoundingClientRect().top<=innerHeight*.35)active=e.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.init();window.addEventListener('scroll',syncNav,{passive:true});window.addEventListener('resize',syncNav);
