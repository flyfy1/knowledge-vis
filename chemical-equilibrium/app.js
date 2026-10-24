(function(){
'use strict';
// Model constants. Every readout below is computed from simulate() output; nothing is pre-drawn.
// particles: step-0 particle grid; chartParticles: steps 1-4 (count charts, larger N = less noise; brief cap 240).
// pForward/pReverse: per-frame conversion probability of each A / each B (K share = pF/(pF+pR) = 0.40).
// tempForward/tempReverse: warming multiplies pF by (1+0.6T) and pR by (1+0.2T) — both rise, forward (endothermic) more.
// catalyst: same multiplier on pF and pR. rateWindow: moving window (frames) for rates and the "flat" test.
// settleSlope: |least-squares slope of B| per particle per frame below which the curve counts as flat.
// endWindow: frames (all after frame 150, when every run has settled) averaged for the step-3/4 endpoint shares.
// crossFrac: approach-time readout = first frame the 5-frame mean of B is crossFrac of the way to its final level.
const C={particles:120,chartParticles:240,frames:420,window:90,rateWindow:30,pForward:.02,pReverse:.03,s0Forward:.055,s0Reverse:.055,catalyst:2.5,tempForward:.6,tempReverse:.2,settleSlope:.003,crossFrac:.8,endWindow:270,addAt:150,pushWindow:60,seed0:713,seed1:271,seed2:904,seed3:118,seed4:431};
// Counter-based RNG: each particle gets its own uniform per frame, so runs that share a seed share
// the same random history for the same particle (used for the step-2 no-push control).
function uniform(seed,id,frame){let h=(seed>>>0)^Math.imul(id+1,0x9E3779B1)^Math.imul(frame+1,0x85EBCA77);h=Math.imul(h^(h>>>16),0x85EBCA6B);h=Math.imul(h^(h>>>13),0xC2B2AE35);h^=h>>>16;h=Math.imul(h^(h>>>15),0x2C1B3C6D);h^=h>>>12;return (h>>>0)/4294967296;}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function probabilities({forward=C.pForward,reverse=C.pReverse,multiplier=1,temperature=0}={}){return {pf:clamp(forward*(1+temperature*C.tempForward)*multiplier,0,.95),pr:clamp(reverse*(1+temperature*C.tempReverse)*multiplier,0,.95)};}
// Each particle has an identity (index). Transitions in a frame are decided against the state at the
// start of that frame, so a particle converts at most once per frame (no same-frame A→B→A).
function simulate({seed=C.seed0,particles=C.chartParticles,initialA=particles,forward=C.pForward,reverse=C.pReverse,multiplier=1,addAt=-1,addCount=0,temperature=0}={}){
  const {pf,pr}=probabilities({forward,reverse,multiplier,temperature});
  let state=new Uint8Array(particles);for(let i=clamp(initialA,0,particles);i<particles;i++)state[i]=1;
  const counts=[],rates=[],events=[],states=[],flips=[];
  for(let frame=0;frame<C.frames;frame++){
    if(frame===addAt&&addCount>0){const grown=new Uint8Array(state.length+addCount);grown.set(state);state=grown;}
    const next=state.slice(),flipped=[];let f=0,r=0;
    for(let i=0;i<state.length;i++){const u=uniform(seed,i,frame);if(state[i]===0){if(u<pf){next[i]=1;f++;flipped.push(i);}}else if(u<pr){next[i]=0;r++;flipped.push(i);}}
    state=next;let b=0;for(let i=0;i<state.length;i++)b+=state[i];
    counts.push({a:state.length-b,b,total:state.length});rates.push({f,r});events.push(f+r);states.push(state);flips.push(flipped);
  }
  return {counts,rates,events,states,flips,pf,pr,addAt,addCount};
}
function movingAverage(arr,n){return arr.length?arr.slice(-n).reduce((s,v)=>s+v,0)/Math.min(n,arr.length):0;}
function mean(arr){return arr.length?arr.reduce((s,v)=>s+v,0)/arr.length:0;}
function lsSlope(ys){const n=ys.length;if(n<2)return 0;let sx=0,sy=0,sxx=0,sxy=0;ys.forEach((y,k)=>{sx+=k;sy+=y;sxx+=k*k;sxy+=k*y;});return (n*sxy-sx*sy)/(n*sxx-sx*sx);}
// Statistics over the window [end-window+1, end] — only data up to frame `end` is used.
function summarize(sim,end=sim.counts.length-1,window=C.window){
  end=clamp(end,0,sim.counts.length-1);const from=Math.max(0,end-window+1);
  const tail=sim.counts.slice(from,end+1),rt=sim.rates.slice(from,end+1),c=sim.counts[end];
  const f=mean(rt.map(x=>x.f)),r=mean(rt.map(x=>x.r)),slope=lsSlope(tail.map(x=>x.b));
  return {a:c.a,b:c.b,total:c.total,bShare:mean(tail.map(x=>x.b/x.total)),meanA:mean(tail.map(x=>x.a)),meanB:mean(tail.map(x=>x.b)),forward:f,reverse:r,rateGap:Math.abs(f-r)/Math.max(1,(f+r)/2),slope,balanced:tail.length>=window&&Math.abs(slope)<C.settleSlope*c.total,events:sim.events.slice(0,end+1).reduce((s,v)=>s+v,0),tailEvents:rt.reduce((s,v)=>s+v.f+v.r,0)};
}
// First frame (≥ from) whose rate-window B slope is flat; -1 if none up to `upto`.
function firstFlatFrame(sim,upto=sim.counts.length-1,from=0){for(let i=from+C.rateWindow-1;i<=upto;i++){if(summarize(sim,i,C.rateWindow).balanced)return i;}return -1;}
// Approach time: first frame the 5-frame mean of B covers crossFrac of the way from its start to its final (tail-mean) level.
function balanceFrame(sim,frac=C.crossFrac){const b0=sim.counts[0].b,target=summarize(sim).meanB,span=target-b0;if(Math.abs(span)<1e-9)return 0;for(let i=0;i<sim.counts.length;i++){const m=mean(sim.counts.slice(Math.max(0,i-4),i+1).map(x=>x.b));if((m-b0)/span>=frac)return i;}return sim.counts.length-1;}
// Step-2 evidence: f−r in the frames right after the push, against the same seeded run without the push.
function pushResponse(sim,control,window=C.pushWindow){
  const at=sim.addAt,win=(s,a,b)=>s.rates.slice(a,b),sum=(arr,k)=>arr.reduce((s,v)=>s+v[k],0);
  const after=win(sim,at,at+window),ctl=win(control,at,at+window),pre=sim.counts.slice(Math.max(0,at-C.window),at),end=summarize(sim);
  const net=sum(after,'f')-sum(after,'r'),ctlNet=sum(ctl,'f')-sum(ctl,'r');
  return {window,forward:sum(after,'f'),reverse:sum(after,'r'),net,controlNet:ctlNet,extraNet:net-ctlNet,beforeA:mean(pre.map(x=>x.a)),beforeB:mean(pre.map(x=>x.b)),afterA:end.meanA,afterB:end.meanB,added:sim.addCount};
}
function windowedRates(sim,n=C.rateWindow){const out=[];let sf=0,sr=0;sim.rates.forEach((x,i)=>{sf+=x.f;sr+=x.r;if(i>=n){sf-=sim.rates[i-n].f;sr-=sim.rates[i-n].r;}const k=Math.min(n,i+1);out.push({f:sf/k,r:sr/k});});return out;}
function formatPct(x){return (x*100).toFixed(1)+'%';}
function fitCanvas(canvas){const dpr=Math.min(3,window.devicePixelRatio||1),w=Math.max(1,canvas.clientWidth),h=Number(canvas.getAttribute('height')||300);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}
// Legend laid out by measured text width (works for both languages).
function legend(ctx,items,x,y){ctx.font='12px system-ui';items.forEach(it=>{ctx.fillStyle=it.color;ctx.fillRect(x,y-8,8,8);ctx.fillStyle='#9cabbc';ctx.fillText(it.label,x+12,y);x+=12+ctx.measureText(it.label).width+16;});}
// Line chart. series: [{values,color,dash}], upto: last frame drawn (growing curve), marks: vertical frame markers.
function plot(ctx,{series,max,left,top,width,height,frames,upto=frames-1,marks=[]}){
  ctx.strokeStyle='#2b394b';ctx.lineWidth=1;ctx.setLineDash([]);for(let i=0;i<4;i++){const y=top+i*height/3;ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(left+width,y);ctx.stroke();}
  const X=i=>left+i/(frames-1)*width,Y=v=>top+height-(v/max)*height;
  series.forEach(s=>{ctx.strokeStyle=s.color;ctx.lineWidth=2;ctx.setLineDash(s.dash||[]);ctx.beginPath();for(let i=0;i<=Math.min(upto,s.values.length-1);i++){i?ctx.lineTo(X(i),Y(s.values[i])):ctx.moveTo(X(i),Y(s.values[i]));}ctx.stroke();});
  ctx.setLineDash([4,4]);ctx.lineWidth=1;marks.forEach(m=>{ctx.strokeStyle=m.color;ctx.beginPath();ctx.moveTo(X(m.frame),top);ctx.lineTo(X(m.frame),top+height);ctx.stroke();});ctx.setLineDash([]);
}
function chartFrame(canvas){const {ctx,w,h}=fitCanvas(canvas);ctx.clearRect(0,0,w,h);ctx.fillStyle='#111a25';ctx.fillRect(0,0,w,h);return {ctx,w,h,pad:18};}
function drawCounts(sim,canvas,opts={}){
  const {ctx,w,h,pad}=chartFrame(canvas),plotH=opts.rates?h*.48:h-pad-40,total=Math.max(...sim.counts.map(x=>x.total),1),upto=opts.upto==null?sim.counts.length-1:opts.upto;
  legend(ctx,[{label:t('countA'),color:'#67d7f9'},{label:t('countB'),color:'#ffb454'}],pad,14);
  plot(ctx,{series:[{values:sim.counts.map(x=>x.a),color:'#67d7f9'},{values:sim.counts.map(x=>x.b),color:'#ffb454'}],max:total,left:pad,top:pad+6,width:w-pad*2,height:plotH,frames:sim.counts.length,upto,marks:opts.marks||[]});
  if(opts.rates){const wr=windowedRates(sim),top=pad+plotH+40,max=Math.max(.5,...wr.map(x=>Math.max(x.f,x.r)));legend(ctx,[{label:t('rateForward'),color:'#67d7f9'},{label:t('rateReverse'),color:'#ffb454'}],pad,top-10);plot(ctx,{series:[{values:wr.map(x=>x.f),color:'#67d7f9'},{values:wr.map(x=>x.r),color:'#ffb454'}],max,left:pad,top,width:w-pad*2,height:Math.max(46,h-top-22),frames:sim.counts.length,upto,marks:opts.marks||[]});}
  ctx.fillStyle='#9cabbc';ctx.font='12px system-ui';ctx.fillText(`${t('currentFrame')}: ${upto} / ${sim.counts.length-1}`,pad,h-6);
}
// Particle grid: each dot is one particle at a fixed position; its colour is its current state and a white
// ring marks a particle that converted in this frame.
function drawParticles(sim,canvas,frame){
  const {ctx,w,h}=fitCanvas(canvas);ctx.clearRect(0,0,w,h);ctx.fillStyle='#111a25';ctx.fillRect(0,0,w,h);
  const fi=Math.min(frame,sim.counts.length-1),c=sim.counts[fi],state=sim.states[fi],flipped=new Set(sim.flips[fi]),total=state.length;
  const cols=Math.max(8,Math.floor(Math.sqrt(total*w/Math.max(h,1)))),rows=Math.ceil(total/cols),gap=Math.min(28,(w-30)/cols),gy=Math.min(28,(h-36)/rows),radius=Math.max(4,Math.min(8,gap*.28));
  for(let i=0;i<total;i++){const x=15+(i%cols)*gap,y=24+Math.floor(i/cols)*gy;ctx.fillStyle=state[i]?'#ffb454':'#67d7f9';ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();if(flipped.has(i)){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,radius+3,0,Math.PI*2);ctx.stroke();}}
  ctx.fillStyle='#9cabbc';ctx.font='12px system-ui';ctx.fillText(`${t('countA')}: ${c.a}   ${t('countB')}: ${c.b}   ${t('convertedNow')}: ${flipped.size}   ${t('currentFrame')}: ${fi}`,12,h-10);return c;
}
const TEMPS={cool:-1,normal:0,warm:1};
let s0,s0Frame=0,s0Reveal=false,s0Bet=null,s1,s1Playing=true,s1Rates=false,s1Initial='pure',s1Frame=0,s2,s2Control,s2Injected=false,s3Temp='normal',s3Runs,s4No,s4Yes;
function s1Sim(){return simulate({seed:C.seed1,initialA:s1Initial==='pure'?C.chartParticles:Math.round(C.chartParticles/4)});}
function render0(){
  drawParticles(s0,document.getElementById('s0-canvas'),s0Frame);const el=document.getElementById('s0-ro');
  if(!s0Reveal){el.innerHTML=`<b>${t('guessPrompt')}</b>`;return;}
  const ev=summarize(s0,s0Frame).events,verdict=s0Bet==='moving'?t('trueGuess'):s0Bet==='stopped'?t('falseGuess'):t('dynamic');
  el.innerHTML=`${t('events')} (${t('frames0to',{f:s0Frame})}): <b>${ev}</b>. ${t('actual')}<b>${t('trueDynamic')}</b> — ${verdict}`;
}
function render1(){
  const f=Math.min(s1Frame,s1.counts.length-1),c=s1.counts[f],w=summarize(s1,f,C.rateWindow),flat=firstFlatFrame(s1,f);
  drawCounts(s1,document.getElementById('s1-canvas'),{rates:s1Rates,upto:f});
  document.getElementById('s1-ro').innerHTML=`${t('currentFrame')}: <b>${f}</b> · ${t('countA')}: <b>${c.a}</b> · ${t('countB')}: <b>${c.b}</b> · ${t('rateForward')}: <b>${w.forward.toFixed(2)}</b> · ${t('rateReverse')}: <b>${w.reverse.toFixed(2)}</b> ${t('rateUnit')} (${t('lastFrames',{n:Math.min(C.rateWindow,f+1)})}) · ${t('balance')}: <b>${flat>=0?t('flatSince',{f:flat}):t('settling')}</b>`;
}
function render2(){
  const sum=summarize(s2);drawCounts(s2,document.getElementById('s2-canvas'),{marks:s2Injected?[{frame:C.addAt,color:'#7ee2a8'}]:[]});const el=document.getElementById('s2-ro');
  if(!s2Injected){el.innerHTML=`${t('netDirection')}: <b>${t('noChange')}</b> · ${t('balance')}: <b>${sum.balanced?t('balanced'):t('settling')}</b>`;return;}
  const p=pushResponse(s2,s2Control),dir=p.extraNet>0?t('towardB'):p.extraNet<0?t('towardA'):t('noNet');
  el.innerHTML=`${t('added',{n:p.added,f:C.addAt})}.<br>${t('pushWindow',{w:p.window})}: ${t('netEvents')} <b>${p.net}</b> (${p.forward}−${p.reverse})${t('withoutPush')} <b>${p.controlNet}</b> → ${t('netDirection')}: <b>${dir}</b> (${p.extraNet>0?'+':''}${p.extraNet})<br>${t('levels')}: A <b>${p.beforeA.toFixed(1)}</b> → <b>${p.afterA.toFixed(1)}</b> · B <b>${p.beforeB.toFixed(1)}</b> → <b>${p.afterB.toFixed(1)}</b> · ${t('balance')}: <b>${sum.balanced?t('balanced'):t('settling')}</b>`;
}
function render3(){
  const sim=s3Runs[s3Temp];drawCounts(sim,document.getElementById('s3-canvas'));const sum=summarize(sim,undefined,C.endWindow);
  const table=Object.keys(TEMPS).map(k=>{const v=formatPct(summarize(s3Runs[k],undefined,C.endWindow).bShare);return k===s3Temp?`<b>${t(k)} ${v}</b>`:`${t(k)} ${v}`;}).join(' / ');
  document.getElementById('s3-ro').innerHTML=`${t('temp')}: <b>${t(s3Temp)}</b> · p→ <b>${sim.pf.toFixed(4)}</b> · p← <b>${sim.pr.toFixed(4)}</b> · ${t('equilibriumB')}: <b>${formatPct(sum.bShare)}</b> · ${t('balance')}: <b>${sum.balanced?t('balanced'):t('settling')}</b><br>${t('compare')}: ${table}`;
}
function render4(){
  const a=summarize(s4No,undefined,C.endWindow),b=summarize(s4Yes,undefined,C.endWindow),ta=balanceFrame(s4No),tb=balanceFrame(s4Yes),d=Math.abs(a.bShare-b.bShare)*100;
  const {ctx,w,h,pad}=chartFrame(document.getElementById('s4-canvas')),total=Math.max(a.total,1);
  legend(ctx,[{label:t('noCatalyst')+' · B',color:'#ffb454'},{label:t('withCatalyst')+' · B',color:'#7ee2a8'}],pad,14);
  plot(ctx,{series:[{values:s4No.counts.map(x=>x.b),color:'#ffb454'},{values:s4Yes.counts.map(x=>x.b),color:'#7ee2a8',dash:[6,3]}],max:total,left:pad,top:pad+6,width:w-pad*2,height:h-pad-40,frames:s4No.counts.length,marks:[{frame:ta,color:'#ffb454'},{frame:tb,color:'#7ee2a8'}]});
  ctx.fillStyle='#9cabbc';ctx.font='12px system-ui';ctx.fillText(t('crossMarks',{p:Math.round(C.crossFrac*100)}),pad,h-6);
  const same=d<3,speed=tb<ta?t('faster'):t('notFaster');
  document.getElementById('s4-ro').innerHTML=`${t('noCatalyst')}: <b>${ta}</b> ${t('timeToBalance',{p:Math.round(C.crossFrac*100)})} · ${t('endpoint')}: <b>${formatPct(a.bShare)}</b><br>${t('withCatalyst')}: <b>${tb}</b> ${t('timeToBalance',{p:Math.round(C.crossFrac*100)})} · ${t('endpoint')}: <b>${formatPct(b.bShare)}</b><br><b>${speed}</b> · <b>${same?t('sameEndpoint',{d:d.toFixed(1)}):t('diffEndpoint',{d:d.toFixed(1)})}</b>`;
}
function runs3(){const out={};Object.keys(TEMPS).forEach(k=>{out[k]=simulate({seed:C.seed3,temperature:TEMPS[k]});});return out;}
function reset(){s0=simulate({seed:C.seed0,particles:C.particles,initialA:C.particles/2,forward:C.s0Forward,reverse:C.s0Reverse});s0Frame=0;s0Reveal=false;s0Bet=null;s1=s1Sim();s1Frame=0;s1Playing=true;s2=simulate({seed:C.seed2});s2Control=s2;s2Injected=false;s3Temp='normal';s3Runs=runs3();s4No=simulate({seed:C.seed4});s4Yes=simulate({seed:C.seed4,multiplier:C.catalyst});renderAll();}
function renderAll(){render0();render1();render2();render3();render4();}
function setToggleLabel(id,key){const el=document.getElementById(id);el.dataset.i18n=key;el.textContent=t(key);}
function syncLabels(){setToggleLabel('s1-play',s1Playing?'pause':'play');setToggleLabel('s1-rates',s1Rates?'hideRates':'showRates');document.querySelectorAll('[data-s1-init]').forEach(x=>x.classList.toggle('active',x.dataset.s1Init===s1Initial));document.querySelectorAll('[data-temp]').forEach(x=>x.classList.toggle('active',x.dataset.temp===s3Temp));document.getElementById('s0-moving').classList.toggle('active',s0Bet==='moving');document.getElementById('s0-stopped').classList.toggle('active',s0Bet==='stopped');}
function tick(){if(s1Playing)s1Frame=(s1Frame+1)%s1.counts.length;s0Frame=(s0Frame+1)%s0.counts.length;render0();render1();}
if(typeof onLangRefresh==='function')onLangRefresh(()=>{if(s0){syncLabels();renderAll();}});
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang)));
  document.querySelectorAll('[data-s1-init]').forEach(b=>b.addEventListener('click',()=>{s1Initial=b.dataset.s1Init;s1=s1Sim();s1Frame=0;syncLabels();render1();}));
  const bet=v=>()=>{s0Bet=v;s0Reveal=true;syncLabels();render0();};
  document.getElementById('s0-moving').onclick=bet('moving');document.getElementById('s0-stopped').onclick=bet('stopped');
  document.getElementById('s0-reveal').onclick=()=>{s0Reveal=true;render0();};
  document.getElementById('s0-reset').onclick=()=>{s0Reveal=false;s0Bet=null;s0Frame=0;syncLabels();render0();};
  document.getElementById('s1-play').onclick=()=>{s1Playing=!s1Playing;syncLabels();};
  document.getElementById('s1-rates').onclick=()=>{s1Rates=!s1Rates;syncLabels();render1();};
  document.getElementById('s1-reset').onclick=()=>{s1=s1Sim();s1Frame=0;render1();};
  const add=document.getElementById('s2-add');add.oninput=()=>document.getElementById('s2-add-val').textContent=add.value;
  document.getElementById('s2-inject').onclick=()=>{s2=simulate({seed:C.seed2,addAt:C.addAt,addCount:Number(add.value)});s2Control=simulate({seed:C.seed2});s2Injected=true;render2();};
  document.getElementById('s2-reset').onclick=()=>{s2=simulate({seed:C.seed2});s2Control=s2;s2Injected=false;render2();};
  document.querySelectorAll('[data-temp]').forEach(b=>b.addEventListener('click',()=>{s3Temp=b.dataset.temp;syncLabels();render3();}));
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('.nav-step').forEach((n,i)=>n.classList.toggle('active',i===Number(e.target.dataset.step)));}}),{threshold:.35});
  document.querySelectorAll('.step').forEach(s=>io.observe(s));
  add.value='16';document.getElementById('s2-add-val').textContent='16';
  reset();applyLang(getLang());setInterval(tick,160);window.addEventListener('resize',renderAll);
});
window.CHEMICAL_EQUILIBRIUM={C,clamp,uniform,probabilities,simulate,movingAverage,summarize,firstFlatFrame,balanceFrame,pushResponse,windowedRates};
})();
