'use strict';
const locale=window.LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id);
const {presets,trace}=window.BraceLesson;
let preset=0,frames=trace(presets[0]),at=0,hand=0,choice=null,revealed=false,copyState='';
const setText=a=>a.length?'{'+a.map(x=>JSON.stringify(x)).join(', ')+'}':'∅';
const node=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
function eventText(f){const d={};for(const [key,value] of Object.entries(f.detail))d[key]=Array.isArray(value)?(f.event==='done'?JSON.stringify(value):setText(value)):value;return t(f.event==='return'?'returnEvent':f.event,d);}
function render(){
 const f=frames[at],s=presets[preset];
 $('selectedExpression').textContent=t('selectedExpression',{s});
 $('progress').textContent=t('progress',{k:at,n:frames.length-1,i:f.i,len:s.length});
 $('expression').replaceChildren();
 for(let i=0;i<=s.length;i++){
  if(i===s.length&&f.i!==i)continue;
  const e=node('span','',`token${i<f.i?' read':''}${i===f.i?' current':''}`);e.dataset.index=i;
  e.append(node('b',i===s.length?'∎':s[i]),node('small',i===f.i?`${i} · ${t(i===s.length?'endToken':'nextToken')}`:String(i)));$('expression').append(e);
 }
 $('event').textContent=eventText(f);$('stack').replaceChildren();
 f.stack.forEach((call,j)=>{
  const e=node('div','',`call${j===f.stack.length-1?' active':''}`);e.dataset.depth=j;
  e.append(node('h3',t('callTitle',{d:j,start:call.start,role:t(j===f.stack.length-1?'active':'waiting')})));
  const sets=node('div','','sets');
  for(const [key,label] of [['union','uLabel'],['term','tLabel']]){const v=node('div','');v.append(node('b',t(label)),node('code',setText(call[key])));sets.append(v);}e.append(sets);$('stack').append(e);
 });
 if(!f.stack.length)$('stack').append(node('p',t('emptyStack'),'hint'));
 $('output').textContent=f.event==='done'?t('done',{result:JSON.stringify(f.detail.result)}):t('pending');
 $('prev').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 $('history').replaceChildren(...frames.slice(1,at+1).map((v,j)=>node('li',eventText(v),j===at-1?'current':'')));
 $('handLog').replaceChildren(...(hand?Array.from({length:hand},(_,i)=>node('div',t('hand'+i))):[node('div',t('handInitial'))]));$('handNext').disabled=hand===2;
 $('reveal').disabled=choice===null;$('feedback').textContent=choice===null?'':revealed?t(choice===1?'correct':'incorrect')+' '+t('answer'):t('chosen');
 $('copyStatus').textContent=copyState?t(copyState):'';
 $('langToggle').setAttribute('aria-label',t('language'));document.querySelector('.step-nav').setAttribute('aria-label',t('navigation'));
}
presets.forEach((s,i)=>{const o=node('option',String(i+1));o.value=i;$('preset').append(o);});
$('preset').addEventListener('change',e=>{preset=+e.target.value;frames=trace(presets[preset]);at=0;render();});
for(const [id,fn] of Object.entries({next:()=>Math.min(at+1,frames.length-1),prev:()=>Math.max(at-1,0),end:()=>frames.length-1,reset:()=>0}))$(id).addEventListener('click',()=>{at=fn();render();});
$('handNext').onclick=()=>{hand=Math.min(2,hand+1);render();};$('handReset').onclick=()=>{hand=0;render();};
document.querySelectorAll('[name=prediction]').forEach(e=>e.addEventListener('change',()=>{choice=+e.value;revealed=false;render();}));$('reveal').onclick=()=>{revealed=true;render();};
$('code').textContent=window.PYTHON_SOURCE;
$('baselineCode').textContent=`def baseline(expression):
    words = set()

    def visit(s):
        if "}" not in s:
            words.add(s)
            return
        right = s.index("}")
        left = s.rfind("{", 0, right)
        for part in s[left + 1:right].split(","):
            visit(s[:left] + part + s[right + 1:])

    visit(expression)
    return sorted(words)
`;
$('copy').onclick=async()=>{
 try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}
 catch(_){copyState='manual';$('manualCopy').hidden=false;$('fallbackSource').value=window.PYTHON_SOURCE;$('fallbackSource').focus();$('fallbackSource').select();}
 render();
};
locale.onChange(render);locale.init();
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id));},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));
