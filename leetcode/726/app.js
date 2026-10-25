'use strict';
const locale=LeetCodeLocale(window.ATOM_COPY),t=locale.t,$=id=>document.getElementById(id);
let selected=0,step=0,frames=Atoms.trace(Atoms.presets[0]),choice=null,revealed=false,copyState='';
const baseline=`# Valid formulas only; materializes individual atoms.
from collections import Counter

def expanded_counts(formula):
    i = 0
    def number():
        nonlocal i
        start = i
        while i < len(formula) and formula[i].isdigit():
            i += 1
        return int(formula[start:i]) if i > start else 1
    def group():
        nonlocal i
        atoms = []
        while i < len(formula) and formula[i] != ')':
            if formula[i] == '(':
                i += 1
                unit = group()
                i += 1  # consume ')'
            else:
                start = i
                i += 1
                while i < len(formula) and formula[i].islower():
                    i += 1
                unit = [formula[start:i]]
            atoms.extend(unit * number())
        return atoms
    return dict(Counter(group()))
`;
$('baselineCode').textContent=baseline;$('pythonCode').textContent=window.PYTHON_SOURCE;$('copyText').value=window.PYTHON_SOURCE;
function describe(f){if(f.kind==='atom')return t('atom',f);if(f.kind==='merge')return t('merge',{m:f.multiplier});return t(f.kind);}
function maps(target,stack){target.replaceChildren();stack.forEach((m,d)=>{const el=document.createElement('div');el.className='map-card';const label=document.createElement('p');label.textContent=t('depth',{d});const values=document.createElement('p');values.className='map-values';if(!Object.keys(m).length)values.textContent=t('empty');else Object.entries(m).forEach(([a,c],i)=>{if(i)values.append(document.createTextNode(' · '));const entry=document.createElement('span');entry.className='atom-value';entry.textContent=`${a}: ${c}`;values.append(entry);});el.append(label,values);target.append(el);});}
function render(){
 const f=frames[step],formula=Atoms.presets[selected];
 $('langToggle').setAttribute('aria-label',t('language'));$('stepNav').setAttribute('aria-label',t('nav'));
 $('progress').textContent=t('progress',{s:step,n:frames.length-1,i:f.i,len:formula.length});
 $('prefix').textContent=t('prefix',{text:formula.slice(0,f.i)||t('none')});
 $('event').textContent=describe(f)+(f.terms?' '+f.terms.join('; '):'');
 maps($('beforeMaps'),f.before||[{}]);maps($('afterMaps'),f.stack);
 $('output').textContent=f.kind==='done'?t('result',{value:f.result}):t('pending');
 $('history').replaceChildren();frames.slice(1,step+1).forEach(frame=>{let li=document.createElement('li');li.textContent=describe(frame)+(frame.terms?' '+frame.terms.join('; '):'');$('history').append(li);});
 $('prev').disabled=step===0;$('reset').disabled=step===0;$('next').disabled=step===frames.length-1;$('end').disabled=step===frames.length-1;
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;
 if(revealed)$('feedback').textContent=t(choice===1?'correct':'incorrect')+' '+(choice===1?'':t('why'+choice)+' ')+t('answer');
 $('copyStatus').textContent=copyState?t(copyState):'';
}
$('preset').addEventListener('change',e=>{selected=Number(e.target.value);frames=Atoms.trace(Atoms.presets[selected]);step=0;render();});
for(const [id,move] of Object.entries({prev:()=>step-1,next:()=>step+1,reset:()=>0,end:()=>frames.length-1}))$(id).addEventListener('click',()=>{step=move();render();});
document.querySelectorAll('[name=prediction]').forEach(el=>el.addEventListener('change',()=>{choice=Number(el.value);revealed=false;render();}));
$('reveal').addEventListener('click',()=>{revealed=true;render();});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='fallback';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}render();});
locale.onChange(render);locale.init();
function updateNav(){
 let active='step0';
 document.querySelectorAll('.step').forEach(section=>{if(section.getBoundingClientRect().top<=120)active=section.id;});
 document.querySelectorAll('.step-nav a').forEach(a=>{const current=a.hash==='#'+active;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
