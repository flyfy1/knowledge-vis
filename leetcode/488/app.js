'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,index=0,frames=ZumaLesson.trace(ZumaLesson.presets[0]),handOpen=false,revealed=false,copyState='';
function row(el,value){
 el.replaceChildren();
 if(!value){el.textContent=t('empty');return;}
 for(const c of value){const ball=document.createElement('span');ball.className='ball';ball.textContent=c;el.append(ball);}
}
function operation(f){return t(f.kind,{g:f.gap,c:f.color,n:f.count});}
function render(){
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('stepNavigation'));
 $('sourcePanel').setAttribute('aria-label',t('sourceLabel'));
 row($('tinyBoard'),'RRBBRR');$('handReveal').textContent=t(handOpen?'handHide':'handShow');$('handReveal').setAttribute('aria-expanded',String(handOpen));$('handAnswer').hidden=!handOpen;
 $('stateResult').textContent=t($('stateHand').value==='R'?'stateR':'stateB');
 const f=frames[index],p=ZumaLesson.presets[preset];
 $('prev').disabled=index===0;$('reset').disabled=index===0;$('next').disabled=index===frames.length-1;$('end').disabled=index===frames.length-1;
 $('progress').textContent=t('progress',{i:index,n:frames.length-1,u:f.used,phase:t(f.stable?'stable':'unstable')});$('operation').textContent=operation(f);
 row($('beforeBoard'),f.before);row($('afterBoard'),f.row);$('beforeText').textContent=f.before||t('empty');$('afterText').textContent=f.row||t('empty');$('beforeBoard').setAttribute('aria-label',t('before')+': '+(f.before||t('empty')));$('afterBoard').setAttribute('aria-label',t('after')+': '+(f.row||t('empty')));row($('remainingHand'),f.hand);
 $('endpoint').hidden=index!==frames.length-1;$('endpoint').textContent=index===frames.length-1?t('endpoint',{r:p.result,why:t(p.reason)}):'';
 $('ledger').replaceChildren();if(index===0){const li=document.createElement('li');li.textContent=t('historyEmpty');$('ledger').append(li);}
 frames.slice(1,index+1).forEach(f=>{const li=document.createElement('li');li.textContent=operation(f);const code=document.createElement('code');code.textContent=(f.before||'∅')+' → '+(f.row||'∅');li.append(code);$('ledger').append(li);});
 const choice=document.querySelector('[name="prediction"]:checked');$('reveal').disabled=!choice;$('feedback').textContent=revealed?t(choice.value==='2'?'correct':'incorrect')+' '+t('answer'):t(choice?'chosen':'waiting');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('handReveal').onclick=()=>{handOpen=!handOpen;render();};$('stateHand').onchange=render;
$('preset').onchange=()=>{preset=+$('preset').value;index=0;frames=ZumaLesson.trace(ZumaLesson.presets[preset]);render();};
$('prev').onclick=()=>{index=Math.max(0,index-1);render();};$('next').onclick=()=>{index=Math.min(frames.length-1,index+1);render();};$('reset').onclick=()=>{index=0;render();};$('end').onclick=()=>{index=frames.length-1;render();};
for(const el of document.querySelectorAll('[name="prediction"]'))el.onchange=()=>{revealed=false;render();};$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
function updateNav(){const nav=document.querySelector('.step-nav'),limit=nav.getBoundingClientRect().height+32;let active=document.querySelector('.step');document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=limit)active=s;});document.querySelectorAll('.step-nav a').forEach(a=>{const on=a.hash==='#'+active.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
locale.onChange(render);locale.onChange(updateNav);locale.init();addEventListener('scroll',updateNav,{passive:true});addEventListener('resize',updateNav);updateNav();
