'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,frames=Special.trace(Special.presets[0]),step=0,choice=null,revealed=false,copyState='';
$('baselineCode').textContent="def special(s):\n    balance = 0\n    for bit in s:\n        balance += 1 if bit == '1' else -1\n        if balance < 0:\n            return False\n    return balance == 0\n\n\ndef reachable(s):\n    seen = {s}\n    queue = [s]\n    for current in queue:\n        n = len(current)\n        for a in range(n):\n            for b in range(a + 1, n):\n                if not special(current[a:b]):\n                    continue\n                for c in range(b + 1, n + 1):\n                    if special(current[b:c]):\n                        candidate = current[:a] + current[b:c] + current[a:b] + current[c:]\n                        if candidate not in seen:\n                            seen.add(candidate)\n                            queue.append(candidate)\n    return seen\n\n\ndef baseline(s):\n    return max(reachable(s))\n";
$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
const word=s=>s||t('empty');
const list=a=>a.length?'['+a.join(' | ')+']':t('none');
function describe(f){return t(f.kind,{...f,s:word(f.s),inside:word(f.inside),inner:word(f.inner),result:word(f.result),before:list(f.before||[]),after:list(f.parts)});}
function render(){
 const f=frames[step];
 $('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('nav'));
 $('progress').textContent=t('progress',{k:step,n:frames.length-1,d:f.depth});$('event').textContent=describe(f);
 $('call').textContent=word(f.s);$('parts').textContent=list(f.parts);
 $('state').textContent=t('state',{i:f.prefix.length,n:f.s.length,b:f.balance,s:f.start});
 $('ledger').replaceChildren();
 if(!f.prefix.length)$('ledger').textContent=t('pending');
 f.prefix.forEach((b,i)=>{const cell=document.createElement('div');cell.className='balance-cell'+(b===0?' cut':'');const bit=document.createElement('b'),val=document.createElement('span');bit.textContent=f.s[i];val.textContent=b;cell.append(bit,val);$('ledger').append(cell);});
 $('history').replaceChildren();frames.slice(0,step+1).forEach(frame=>{const li=document.createElement('li');li.textContent=t('progress',{k:frames.indexOf(frame),n:frames.length-1,d:frame.depth})+' — '+describe(frame);$('history').append(li);});
 $('prev').disabled=step===0;$('reset').disabled=step===0;$('next').disabled=step===frames.length-1;$('end').disabled=step===frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(choice===2?'correct':'incorrect')+' '+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{selected=Number(e.target.value);frames=Special.trace(Special.presets[selected]);step=0;render();});
for(const [id,move] of Object.entries({prev:()=>step-1,next:()=>step+1,reset:()=>0,end:()=>frames.length-1}))$(id).addEventListener('click',()=>{step=move();render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=Number(el.value);revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('copy').addEventListener('click',async()=>{copyState='copying';render();try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
locale.onChange(render);locale.init();
function updateNav(){let active='step0';document.querySelectorAll('.step').forEach(s=>{if(s.getBoundingClientRect().top<=120)active=s.id;});document.querySelectorAll('.step-nav a').forEach(a=>{const current=a.hash==='#'+active;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
