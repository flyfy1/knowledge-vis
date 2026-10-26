'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
const {presets,trace}=BooleanLesson;
let preset=0,at=0,frames=trace(presets[0]),hand=0,choice=null,revealed=false,copyState='';
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function params(d){return {...d,values:d.values.join(',')};}
function stackView(id,values){
 const box=$(id);box.replaceChildren(node('p',t('stackOrder'),'hint'));
 if(!values.length){box.append(node('p',t('empty')));return;}
 const row=node('div',undefined,'stack-tokens');values.forEach(v=>row.append(node('code',v)));box.append(row);
}
function render(){
 const f=frames[at],expression=presets[preset];
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
 $('handLedger').replaceChildren(...Array.from({length:hand},(_,i)=>node('li',t('hand'+(i+1)))));$('handState').textContent=t('hand'+hand);$('handNext').disabled=hand===2;$('handReset').disabled=hand===0;
 $('selected').textContent=t('selected',{expression});
 [...$('preset').options].forEach((o,i)=>o.textContent=t('case',{number:i+1}));
 $('expression').replaceChildren(...Array.from(expression,(c,i)=>{const e=node('span',undefined,'token'+(i<=f.i?' read':'')+(i===f.i?' current':''));e.append(node('b',c),node('small',String(i)));return e;}));
 $('progress').textContent=t('progress',{count:at,total:expression.length,index:f.i<0?t('none'):f.i});
 $('event').textContent=f.kind==='initial'?t('initial'):f.kind==='reduce'?t('reduce',params(f.detail)):t(f.kind,{char:f.char});
 stackView('before',f.before);stackView('after',f.after);
 $('prev').disabled=at===0;$('reset').disabled=at===0;$('next').disabled=at===frames.length-1;$('end').disabled=at===frames.length-1;
 $('output').textContent=at===frames.length-1?t('result',{value:f.after[0],result:f.after[0]==='t'?'true':'false'}):t('waiting');
 $('history').replaceChildren(...(f.reductions.length?f.reductions.map((d,i)=>node('li',t('ledger',params(d)),i===f.reductions.length-1?'current':'')):[node('li',t('noReductions'))]));
 $('reveal').disabled=choice===null;$('feedback').hidden=!revealed;$('feedback').textContent=revealed?t(choice===1?'correct':'incorrect')+' '+t('answer'):'';
 $('copyStatus').textContent=copyState?t(copyState):'';
}
presets.forEach((expression,i)=>{const o=node('option',expression);o.value=i;$('preset').append(o);});
$('preset').onchange=e=>{preset=+e.target.value;at=0;frames=trace(presets[preset]);render();};
for(const [id,fn]of Object.entries({next:()=>Math.min(at+1,frames.length-1),prev:()=>Math.max(at-1,0),reset:()=>0,end:()=>frames.length-1}))$(id).onclick=()=>{at=fn();render();};
$('handNext').onclick=()=>{hand=Math.min(hand+1,2);render();};$('handReset').onclick=()=>{hand=0;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.onchange=()=>{choice=+e.value;revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonCode').textContent=window.PYTHON_SOURCE;
$('baselineCode').textContent=`def baseline(expression):
    s = expression
    while ')' in s:
        right = s.index(')')
        left = s.rfind('(', 0, right)
        operator = s[left - 1]
        values = s[left + 1:right].split(',')
        if operator == '!':
            value = values[0] == 'f'
        elif operator == '&':
            value = all(x == 't' for x in values)
        else:
            value = any(x == 't' for x in values)
        s = s[:left - 1] + ('t' if value else 'f') + s[right + 1:]
    return s == 't'
`;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').value=window.PYTHON_SOURCE;$('copyText').focus();$('copyText').select();}render();};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));
