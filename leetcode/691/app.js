'use strict';
(()=>{
 const $=id=>document.getElementById(id), L=LeetCodeLocale(COPY),t=L.t,C=Stickers;
 let model=C.trace(C.presets[0]),position=0,hand=0,answer=null,revealed=false,copyState='';
 const val=v=>v===null?'∞':v;
 const append=(el,text,tag='li',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;el.append(n);return n;};
 function renderHand(){
  $('handProgress').textContent=t('handProgress',{n:hand,r:['aab','a','∅'][hand]});
  $('handBack').disabled=hand===0;$('handReset').disabled=hand===0;$('handNext').disabled=hand===2;
  $('letters').replaceChildren();['a','b'].forEach((c,i)=>{const n=[[2,1],[1,0],[0,0]][hand][i],tile=document.createElement('div');tile.className='count-tile';append(tile,c,'b');append(tile,t('missing',{c,n}),'span');$('letters').append(tile);});
  $('handHistory').replaceChildren();for(let i=0;i<=hand;i++)append($('handHistory'),t('h'+i));
 }
 function describe(f){
  const r=model.word(f.r),v=val(f.value),s=C.presets[Number($('preset').value)].stickers[f.i],pivot=model.letters[f.pivot],child=f.child?model.word(f.child):'';
  return t({return:'returned'}[f.kind]||f.kind,{r,v,s,pivot,child,candidate:val(f.candidate),best:val(f.best)});
 }
 function renderTrace(){
  const f=model.frames[position],p=C.presets[Number($('preset').value)],last=position===model.frames.length-1;
  $('inputInfo').textContent=t('input',{s:JSON.stringify(p.stickers),target:p.target,letters:model.letters.join(', ')});
  $('progress').textContent=t('progress',{p:position,n:model.frames.length-1,result:last?t('final',{v:val(model.result)=== '∞'?-1:model.result}):t('pending')});
  $('prev').disabled=position===0;$('reset').disabled=position===0;$('next').disabled=last;$('end').disabled=last;
  $('calls').replaceChildren();if(!f.stack.length)append($('calls'),t('noCalls'));
  f.stack.forEach(c=>append($('calls'),t('call',{r:model.word(c.r),tuple:c.r.join(', '),best:c.best===null?'·':c.best})));
  $('memo').replaceChildren();const values=Object.values(f.memo);if(!values.length)append($('memo'),t('memoEmpty'),'p');
  values.forEach(v=>append($('memo'),t('memoRow',{r:model.word(v.r),v:val(v.value)}),'span','ledger-item'));
  $('history').replaceChildren();for(let k=0;k<=position;k++)append($('history'),describe(model.frames[k]));
 }
 function renderQuiz(){$('reveal').disabled=answer===null;$('feedback').hidden=!revealed;if(revealed)$('feedback').textContent=t(answer===2?'correct':'incorrect')+' '+t('answer');}
 function render(){renderHand();renderTrace();renderQuiz();$('copyStatus').textContent=copyState?t(copyState):'';for(const [id,key]of [['langToggle','language'],['stepNav','navigation'],['sourcePre','codeRegion'],['baselineCode','baselineRegion']])$(id).setAttribute('aria-label',t(key));}
 $('handBack').onclick=()=>{hand--;renderHand();};$('handNext').onclick=()=>{hand++;renderHand();};$('handReset').onclick=()=>{hand=0;renderHand();};
 $('preset').onchange=()=>{position=0;model=C.trace(C.presets[Number($('preset').value)]);renderTrace();};
 $('prev').onclick=()=>{position--;renderTrace();};$('next').onclick=()=>{position++;renderTrace();};$('reset').onclick=()=>{position=0;renderTrace();};$('end').onclick=()=>{position=model.frames.length-1;renderTrace();};
 document.querySelectorAll('[name=prediction]').forEach(el=>el.onchange=()=>{answer=Number(el.value);revealed=false;renderQuiz();});$('reveal').onclick=()=>{revealed=true;renderQuiz();};
 $('pythonCode').textContent=PYTHON_SOURCE;$('copyText').value=PYTHON_SOURCE;
 $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='manual';$('manualCopy').hidden=false;$('copyText').focus();$('copyText').select();}$('copyStatus').textContent=t(copyState);};
 $('baselineCode').firstElementChild.textContent=`from collections import Counter

def baseline(stickers, target):
    supplies = [Counter(word) for word in stickers]
    def search(remaining):
        if not remaining:
            return 0
        best = float('inf')
        for supply in supplies:
            child = remaining - supply
            if child != remaining:
                best = min(best, 1 + search(child))
        return best
    answer = search(Counter(target))
    return -1 if answer == float('inf') else answer
`;
 function updateNav(){let current=document.querySelector('.step');const threshold=$('stepNav').getBoundingClientRect().height+100;document.querySelectorAll('.step').forEach(el=>{if(el.getBoundingClientRect().top<=threshold)current=el;});document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
 window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);L.onChange(render);L.onChange(updateNav);L.init();updateNav();
})();
