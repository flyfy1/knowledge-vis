'use strict';
const locale=LeetCodeLocale(window.LESSON_COPY),t=locale.t,$=id=>document.getElementById(id),C=ReachCore,NS='http://www.w3.org/2000/svg';
const FWD_SOURCE=[1,1],FWD_TARGET=[3,5],BACK_SOURCE=[1,1];
let fwd=[FWD_SOURCE],backTarget=[3,5],backShown=1,preset=0,at=0,frames=C.trace(...C.presets[0]),selection=null,revealed=false,copyState='';
const fmt=v=>typeof v==='number'?v.toLocaleString('en-US'):v;
const pt=p=>'('+p.map(fmt).join(', ')+')';
function el(name,attrs={},text){const e=document.createElementNS(NS,name);for(const k in attrs)e.setAttribute(k,attrs[k]);if(text!==undefined)e.textContent=text;return e;}
// Integer lattice with y pointing up. path is drawn in the given order with arrowheads.
function plane(id,{n,source,target,path=[],diag=false}){
 const svg=$(id),L=30,B=26,T=12,R=12,W=360,s=(W-L-R)/n,H=T+n*s+B;
 const X=x=>L+x*s,Y=y=>T+(n-y)*s;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.replaceChildren();
 const defs=el('defs'),marker=el('marker',{id:id+'Arrow',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'});
 marker.appendChild(el('path',{d:'M0 0L10 5L0 10z',class:'arrow-head'}));defs.appendChild(marker);svg.appendChild(defs);
 const every=n<=12?1:n<=24?2:5;
 for(let i=0;i<=n;i++){
  svg.appendChild(el('line',{x1:X(i),y1:Y(0),x2:X(i),y2:Y(n),class:i?'grid':'axis'}));
  svg.appendChild(el('line',{x1:X(0),y1:Y(i),x2:X(n),y2:Y(i),class:i?'grid':'axis'}));
  if(i%every===0){svg.appendChild(el('text',{x:X(i),y:Y(0)+18,class:'tick','text-anchor':'middle'},i));svg.appendChild(el('text',{x:X(0)-8,y:Y(i)+4,class:'tick','text-anchor':'end'},i));}
 }
 svg.appendChild(el('text',{x:X(n),y:Y(0)-6,class:'tick axis-name','text-anchor':'end'},'x'));svg.appendChild(el('text',{x:X(0)+6,y:Y(n)+10,class:'tick axis-name'},'y'));
 if(diag)svg.appendChild(el('line',{x1:X(0),y1:Y(0),x2:X(n),y2:Y(n),class:'diag'}));
 for(let i=1;i<path.length;i++){const [a,b]=[path[i-1],path[i]];svg.appendChild(el('line',{x1:X(a[0]),y1:Y(a[1]),x2:X(b[0]),y2:Y(b[1]),class:'step-line','marker-end':`url(#${id}Arrow)`}));}
 path.forEach((p,i)=>svg.appendChild(el('circle',{cx:X(p[0]),cy:Y(p[1]),r:i===path.length-1?6:4,class:i===path.length-1?'pt current':'pt'})));
 if(target){const q=Math.max(7,s*.32);svg.appendChild(el('rect',{x:X(target[0])-q,y:Y(target[1])-q,width:2*q,height:2*q,class:'target'}));}
 if(source)svg.appendChild(el('circle',{cx:X(source[0]),cy:Y(source[1]),r:Math.max(8,s*.36),class:'source'}));
 svg.setAttribute('aria-label',t(diag?'planeCaptionDiag':'planeCaption')+' · '+path.map(pt).join(' → '));
}
function fwdStatus(){const [x,y]=fwd[fwd.length-1];if(x===FWD_TARGET[0]&&y===FWD_TARGET[1])return 'stReached';if(x>FWD_TARGET[0]||y>FWD_TARGET[1])return 'stPassed';return 'stGoing';}
function renderFwd(){
 const cur=fwd[fwd.length-1],status=fwdStatus();
 plane('fwdPlane',{n:8,source:FWD_SOURCE,target:FWD_TARGET,path:fwd});
 $('fwdRead').textContent=t('fwdRead',{n:fwd.length-1,x:cur[0],y:cur[1],status:t(status)});
 $('moveX').disabled=$('moveY').disabled=status!=='stGoing';$('fwdUndo').disabled=fwd.length===1;
 $('levels').replaceChildren(...C.levels(FWD_SOURCE,4).map((row,d)=>{const div=document.createElement('div');div.className='level';
  const h=document.createElement('span');h.className='level-head';h.textContent=t('levelRow',{d,n:row.length});div.appendChild(h);
  row.forEach(p=>{const c=document.createElement('span');c.className='chip'+(p[0]===FWD_TARGET[0]&&p[1]===FWD_TARGET[1]?' hit':'');c.textContent=pt(p);div.appendChild(c);});return div;}));
}
function renderBack(){
 const chain=C.chain(backTarget),shown=chain.slice(0,backShown),cur=shown[shown.length-1].point,done=backShown===chain.length;
 const n=Math.max(...backTarget)+1;
 plane('backPlane',{n,source:BACK_SOURCE,target:backTarget,path:shown.map(c=>c.point),diag:true});
 let status;
 if(!done)status=t('backMore',{rule:t(chain[backShown].axis==='x'?'ruleX':'ruleY')});
 else status=cur[0]===BACK_SOURCE[0]&&cur[1]===BACK_SOURCE[1]?t('backHit'):t('backMiss',{x:cur[0],y:cur[1]});
 $('backRead').textContent=t('backRead',{n:shown.length,x:cur[0],y:cur[1],status});
 $('stepBack').disabled=$('showAll').disabled=done;$('backReset').disabled=backShown===1;
 $('backChain').replaceChildren(...shown.map((c,i)=>{const li=document.createElement('li');const [x,y]=c.point;
  li.textContent=i?t('chainItemRule',{x,y,rule:t(c.axis==='x'?'ruleX':'ruleY')}):t('chainItem',{x,y});return li;}));
}
const SYM={gt:'>',eq:'=',lt:'<'};
function eventText(e){
 const p={};for(const k in e)p[k]=fmt(e[k]);if(e.xs){p.xs=SYM[e.xs];p.ys=SYM[e.ys];}
 let text=t(e.kind,p);
 if(e.kind==='tailYOk'&&e.k>0&&e.naive<e.sy)text+=' '+t('naiveNote',{naive:fmt(e.naive),s:fmt(e.sy)});
 if(e.kind==='tailXOk'&&e.k>0&&e.naive<e.sx)text+=' '+t('naiveNote',{naive:fmt(e.naive),s:fmt(e.sx)});
 return text;
}
function tracePath(upTo){
 const [sx,sy,tx,ty]=C.presets[preset],path=[[tx,ty]];
 for(const f of frames.slice(1,upTo+1)){const e=f.event;if(e.kind.startsWith('fold'))path.push([e.ax,e.ay]);if(e.kind==='tailYOk'||e.kind==='tailXOk')path.push([sx,sy]);}
 return path;
}
function renderTrace(){
 const f=frames[at],[sx,sy,tx,ty]=C.presets[preset],small=Math.max(sx,sy,tx,ty)<=40;
 $('frameRead').textContent=t('frame',{i:at,n:frames.length-1,tx:fmt(f.tx),ty:fmt(f.ty),result:f.result===null?t('pending'):t(f.result?'yes':'no')});
 $('mLoops').textContent=fmt(f.loops);$('mSubs').textContent=fmt(f.subs);
 $('tracePlaneBox').hidden=!small;$('bigNote').hidden=small;
 if(small)plane('tracePlane',{n:Math.max(sx,sy,tx,ty)+1,source:[sx,sy],target:[tx,ty],path:tracePath(at),diag:true});
 $('operation').textContent=eventText(f.event);
 $('prev').disabled=$('traceReset').disabled=at===0;$('next').disabled=$('end').disabled=at===frames.length-1;
 $('traceHistory').replaceChildren(...f.history.map(e=>{const li=document.createElement('li');li.textContent=eventText(e);return li;}));
}
function renderPrediction(){
 $('reveal').disabled=selection===null;$('predictionReset').disabled=selection===null;
 $('feedback').textContent=revealed?t(selection===1?'correct':'incorrect')+' '+t('why'+selection)+' '+t('answer'):t('await');
 $('feedback').classList.toggle('correct',revealed&&selection===1);
 $('predictPlaneBox').hidden=!revealed;
 if(revealed){const [sx,sy,tx,ty]=C.prediction;plane('predictPlane',{n:18,source:[sx,sy],target:[tx,ty],path:C.chain([tx,ty]).map(c=>c.point).filter(p=>p[0]>=sx&&p[1]>=sy),diag:true});}
}
function render(){renderFwd();renderBack();renderTrace();renderPrediction();$('copyStatus').textContent=copyState?t(copyState):'';}
$('moveX').onclick=()=>{const [x,y]=fwd[fwd.length-1];fwd.push([x+y,y]);renderFwd();};
$('moveY').onclick=()=>{const [x,y]=fwd[fwd.length-1];fwd.push([x,x+y]);renderFwd();};
$('fwdUndo').onclick=()=>{if(fwd.length>1)fwd.pop();renderFwd();};$('fwdReset').onclick=()=>{fwd=[FWD_SOURCE];renderFwd();};
$('backTarget').onchange=e=>{backTarget=e.target.value.split(',').map(Number);backShown=1;renderBack();};
$('stepBack').onclick=()=>{if(backShown<C.chain(backTarget).length)backShown++;renderBack();};
$('showAll').onclick=()=>{backShown=C.chain(backTarget).length;renderBack();};$('backReset').onclick=()=>{backShown=1;renderBack();};
$('preset').onchange=e=>{preset=Number(e.target.value);at=0;frames=C.trace(...C.presets[preset]);renderTrace();};
$('prev').onclick=()=>{if(at>0)at--;renderTrace();};$('next').onclick=()=>{if(at<frames.length-1)at++;renderTrace();};$('end').onclick=()=>{at=frames.length-1;renderTrace();};$('traceReset').onclick=()=>{at=0;renderTrace();};
for(const r of document.querySelectorAll('[name="prediction"]'))r.onchange=()=>{selection=Number(r.value);revealed=false;renderPrediction();};
$('reveal').onclick=()=>{revealed=true;renderPrediction();};$('predictionReset').onclick=()=>{selection=null;revealed=false;document.querySelectorAll('[name="prediction"]').forEach(r=>r.checked=false);renderPrediction();};
$('pythonCode').textContent=window.PYTHON_SOURCE;$('manualSource').value=window.PYTHON_SOURCE;
$('copyPython').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('sourceFallback').hidden=true;}catch(_){copyState='fallback';$('sourceFallback').hidden=false;$('sourceDetails').open=true;$('manualSource').focus();$('manualSource').select();}$('copyStatus').textContent=t(copyState);};
locale.onChange(render);locale.init();
function updateNav(){const nav=document.querySelector('.step-nav');let current=document.querySelector('.step');for(const s of document.querySelectorAll('.step'))if(s.getBoundingClientRect().top<=nav.getBoundingClientRect().bottom+40)current=s;document.querySelectorAll('.step-nav a').forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);updateNav();
