(() => {
'use strict';
const M=window.PowerModel,$=id=>document.getElementById(id);
let lang;try{lang=localStorage.getItem('knowledge-lang');}catch(_){}
if(!['en','zh'].includes(lang))lang=navigator.language.startsWith('zh')?'zh':'en';
const state={inductor:[0],capacitor:[0],buck:{vin:12,d:.5,k:0,cycles:0,changed:false},boost:{vin:12,d:.5,k:0,cycles:0,changed:false},voltage:12,duty:.5,reverse:false,eta:90,guess:'',revealed:false};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let playing=null,frame=0,lastFrame=0,paintTime=0,travel=0;
const f=(v,n=2)=>Number(v).toFixed(n);
const read=(label,value)=>`<div><span>${label}</span><b>${value}</b></div>`;
function plot(values,label,unit,end,domain){
 const lo=domain?domain[0]:Math.min(0,...values.map(p=>p[1])),hi=domain?domain[1]:Math.max(.1,...values.map(p=>p[1]));
 const width=Math.min(700,Math.max(180,document.querySelector('.plot').clientWidth-24)),pad=Math.max(.02,(hi-lo)*.12),min=lo-pad,max=hi+pad,x=t=>60+t/end*(width-80),y=v=>135-(v-min)/(max-min)*100;
 return `<svg viewBox="0 0 ${width} 190" role="img" aria-label="${label}"><text x="16" y="22" class="chart-text">${label} (${unit})</text><path class="chart-axis" d="M60 35V135H${width-20} M60 ${y(0)}H${width-20}"/><text x="6" y="46" class="chart-text">${f(max)}</text><text x="6" y="135" class="chart-text">${f(min)}</text><polyline class="chart-line" points="${values.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')}"/><circle cx="${x(values.at(-1)[0])}" cy="${y(values.at(-1)[1])}" r="4" fill="var(--amber)"/><text x="64" y="165" class="chart-text">0</text><text x="${width-20}" text-anchor="end" y="185" class="chart-text">${end} ${t('plotTime')} (µs)</text></svg>`;
}
function render(){
 applyLang(lang);
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
 // The hand-written page rebuilt the step nav on every render; clear it the same way so the spy relights it.
 document.querySelectorAll('.nav-step').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current');});
 updatePower();updateMemory('inductor');updateMemory('capacitor');updateSwitch();updateConverter('buck');updateConverter('boost');updateBudget();observeSteps();
}
function updatePower(){$('power-v-value').textContent=state.voltage+' V';$('power-read').innerHTML=read(t('outPower'),'12 W')+read(t('outCurrent'),f(12/state.voltage)+' A')+read(t('relation'),'I = 12 / V');$('power-feedback').textContent=t(state.voltage>12?'fbHigher':state.voltage<12?'fbLower':'fbEqual');}
function updateMemory(kind){const a=state[kind],v=a.at(-1),storage=kind==='inductor'?.01:100e-6,prev=a.length>1?a.at(-2):0,energy=storage*v*v/2,diff=energy-storage*prev*prev/2;
 $(''+kind+'-read').innerHTML=read(t(kind==='inductor'?'current':'voltage'),f(v)+(kind==='inductor'?' A':' V'))+read(t('stored'),f(energy*1e6)+' µJ')+read(t('dE'),f(diff*1e6)+' µJ');
 $(kind+'-plot').innerHTML=plot(a.map((n,i)=>[i*500,n]),t(kind==='inductor'?'plotI':'plotV'),kind==='inductor'?'A':'V',8000);
 $(kind+'-status').textContent=t(a.length===17?'pulsesFull':'pulsesMore',{n:a.length-1});
 ['plus','zero','minus'].forEach(k=>$(kind+'-'+k).disabled=a.length===17);
 if(kind==='capacitor')updateCapacitorRate(a);
}
function updateCapacitorRate(a){
 const host=$('capacitor-rate'),title=t('rateTitle');
 if(a.length<2){host.innerHTML=`<h3 id="capacitor-rate-title">${title}</h3><p>${t('rateNone')}</p>`;return;}
 const start=a.at(-2),end=a.at(-1),delta=end-start,dt=.0005,slope=delta/dt,current=100e-6*slope;
 const width=Math.min(700,Math.max(180,$('capacitor-plot').clientWidth-24)),x0=24,x1=width-24,y0=82,y1=y0-delta/.12*58;
 const summary=t('rateSummary',{start:f(start),end:f(end),delta:f(delta),slope:f(slope,0),current:f(current*1000,0)});
 host.innerHTML=`<h3 id="capacitor-rate-title">${title}</h3><p>${t('rateLocal')}</p><div class="plot"><svg data-rate-segment="${f(slope,0)}" viewBox="0 0 ${width} 164" role="img" aria-label="${summary}"><path class="chart-axis" d="M${x0} 20V144M${x0} ${y0}H${x1}"/><path class="rate-rise-run" d="M${x0} ${y0}H${x1}${Math.abs(delta)>1e-12?'V'+y1:''}"/><path class="chart-line" d="M${x0} ${y0}L${x1} ${y1}"/><circle cx="${x1}" cy="${y1}" r="4" fill="var(--amber)"/></svg></div><p class="readout" id="capacitor-rate-read">${summary}</p><p class="formula">Δv / Δt = ${f(delta)} V / 0.0005 s = ${f(slope,0)} V/s<br>i = C · dv/dt = 100 µF × ${f(slope,0)} V/s = ${f(current*1000,0)} mA</p><p class="note">${t('rateNote')}</p><p><a href="../../../atlas/?trail=charge&node=capacitor&view=list">${t('rateLink')}</a></p><p class="note"><a href="https://openstax.org/books/university-physics-volume-2/pages/8-1-capacitors-and-capacitance">OpenStax8.1 · q=Cv</a> · <a href="https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current">OpenStax9.1 · i=dq/dt</a></p>`;
}
function updateSwitch(){const d=state.duty;$('pwm-d-value').textContent=f(d*100,0)+'%';$('diode-read').textContent=t(state.reverse?'diodeOff':'diodeOn');$('pwm-read').innerHTML=read(t('onTime'),f(d*50,1)+' µs')+read(t('offTime'),f((1-d)*50,1)+' µs');$('pwm-plot').innerHTML=plot([[0,1],[50*d,1],[50*d,0],[50,0]],t('switchPlot'),'0 / 1',50,[0,1]);}
function updateConverter(kind){const s=state[kind],m=M.converter(kind,s.vin,s.d),at=s.cycles*m.T,q=m.sample(at);$(kind+'-vin-value').textContent=s.vin+' V';$(kind+'-d-value').textContent=f(s.d*100,0)+'%';$(kind+'-next').disabled=s.cycles>=2;
 $(kind+'-play').textContent=t(playing===kind?'pause':s.cycles>=2?'replay':'play');$(kind+'-play').setAttribute('aria-pressed',String(playing===kind));
 $(kind+'-status').setAttribute('aria-live',playing===kind?'off':'polite');
 $(kind+'-seek').value=s.cycles*50;$(kind+'-seek-value').textContent=f(at*1e6)+' µs';
 $(kind+'-status').textContent=(s.changed?t('changed')+' ':'')+`${s.k}/8 · t = ${f(at*1e6,2)} µs · S ${q.on?'ON':'OFF'}${s.k===8?' · '+t('cyclesDone'):''}`;
 window.PowerFlow.update($(kind+'-diagram'),kind,q,travel,playing===kind&&!motion.matches,`${kind}: S ${q.on?'ON':'OFF'}, iL ${f(q.il,3)} A, iC ${f(q.ic,3)} A`);
 const emax=kind==='buck'?.65:10;
 $(kind+'-energy-state').textContent=t(q.vl*q.il>0?'energyUp':'energyDown');
 $(kind+'-energy-fill').style.width=(q.energy*1000/emax*100)+'%';
 $(kind+'-energy-caption').textContent=t('energyCaption',{e:f(q.energy*1000,3),max:emax});
 $(kind+'-capacitor').textContent=t(Math.abs(q.ic)<1e-8?'capZero':q.ic>0?'capCharge':'capDischarge');
 $(kind+'-on-window').style.width=s.d*100+'%';$(kind+'-cursor').style.left=(s.cycles>=2?100:(s.cycles%1)*100)+'%';
 const phaseNote=t(q.on?'phaseOn':'phaseOff');
 let path=phaseNote+' '+t(kind+(q.on?'OnPath':'OffPath'));
 path+=' '+t(Math.abs(q.ic)<1e-8?'branchZero':q.ic>0?'branchCharge':'branchDischarge');
 $(kind+'-path').textContent=path;
 $(kind+'-read').innerHTML=read(t('avgVout'),f(m.vo)+' V')+read(t('avgIin'),f(m.iin)+' A')+read(t('instIL'),f(q.il,3)+' A')+read(t('instVL'),f(q.vl)+' V')+read(t('instIC'),f(q.ic,3)+' A')+read(t('magEnergy'),f(q.energy*1000,3)+' mJ');
 const times=[0];for(let i=1;i<=200;i++){const v=i*2*m.T/200;if(v<at)times.push(v);}for(let c=0;c<2;c++)for(const b of [(c+s.d)*m.T,(c+1)*m.T]){if(b>0&&b<=at){times.push(b-1e-12,b);}}times.push(at);times.sort((a,b)=>a-b);
 $(kind+'-traces').innerHTML=plot(times.map(v=>[v*1e6,m.sample(v).il]),t('traceIL'),'A',100,[m.low,m.low+m.ripple])+plot(times.map(v=>[v*1e6,m.sample(v).vl]),t('traceVL'),'V',100,[m.down,m.up]);
 if(kind==='buck')updateBuckArea(m,at,q.il);
}
function phaseIndex(s){const m=M.converter('buck',s.vin,s.d);let k=0;while(k<8&&m.timeAt(k+1)<=s.cycles*m.T+1e-12)k++;return k;}
function updateBuckArea(m,at,current){
 const af=(v,n=2)=>{const scale=10**n,rounded=Math.sign(v)*Math.round(Math.abs(v)*scale+1e-9)/scale;return f(rounded===0?0:rounded,n);};
 const area=PowerVoltageArea.buck(m,at),full=PowerVoltageArea.buck(m,2*m.T),host=$('buck-area-plot'),w=Math.min(700,Math.max(180,(host.clientWidth||$('buck-traces').clientWidth)-24));
 const x=s=>24+s/(2*m.T)*(w-48),y=v=>88-v/12*64;
 const ref=full.segments.map((s,i)=>`${i?'L':'M'}${x(s.start)} ${y(s.voltage)}L${x(s.end)} ${y(s.voltage)}`).join(' ');
 const fills=area.segments.map(s=>`<path class="area-fill ${s.voltage>0?'area-positive':'area-negative'}" d="M${x(s.start)} 88V${y(s.voltage)}H${x(s.end)}V88Z"/>`).join('');
 const summary=t('areaSummary',{t:af(at*1e6,2),pos:af(area.positive*1e6),neg:af(area.negative*1e6),net:af(area.net*1e6),di:af(area.deltaI,3),i:af(current,3)});
 host.innerHTML=`<svg viewBox="0 0 ${w} 176" role="img" aria-label="${summary}"><path class="chart-axis" d="M24 20V156M24 88H${w-24}"/>${fills}<path class="area-reference" d="${ref}"/><path class="area-cursor" d="M${x(at)} 20V156"/></svg>`;
 const readout=$('buck-area-read');readout.setAttribute('aria-live',playing==='buck'?'off':'polite');readout.dataset.netVs=area.net;readout.dataset.deltaI=area.deltaI;readout.dataset.time=at;
 readout.innerHTML=read(t('areaTime'),af(at*1e6,2)+' µs')+read(t('areaPos'),af(area.positive*1e6)+' Vµs')+read(t('areaNeg'),af(area.negative*1e6)+' Vµs')+read(t('areaNet'),af(area.net*1e6)+' Vµs')+read(t('areaI0'),af(m.low,3)+' A')+read(t('areaDi'),af(area.deltaI,3)+' A')+read(t('areaI'),af(current,3)+' A');
 $('buck-area-formula').textContent=`∫₀ᵗ vL dτ ≈ (${af(area.positive*1e6)} + ${af(area.negative*1e6)}) Vµs
Δi = ∫vL dτ / L ≈ ${af(area.net*1e6)} × 10⁻⁶ V·s / 0.001 H ≈ ${af(area.deltaI,3)} A
iL(t) = iL(0) + Δi ≈ ${af(current,3)} A`;
}
function stopPlayback(){if(!playing)return;const kind=playing;playing=null;cancelAnimationFrame(frame);frame=0;lastFrame=0;updateConverter(kind);}
function tick(now){
 if(!playing)return;
 const kind=playing,box=$(kind+'-diagram').getBoundingClientRect();
 if(document.hidden||box.bottom<80||box.top>innerHeight){stopPlayback();return;}
 if(!lastFrame)lastFrame=now;
 const elapsed=Math.min(.1,(now-lastFrame)/1000);lastFrame=now;
 state[kind].cycles=Math.min(2,state[kind].cycles+elapsed/4);state[kind].k=phaseIndex(state[kind]);travel+=elapsed;
 if(state[kind].cycles>=2){stopPlayback();return;}
 if(now-paintTime>=80){updateConverter(kind);paintTime=now;}
 frame=requestAnimationFrame(tick);
}
function play(kind){if(playing===kind){stopPlayback();return;}stopPlayback();if(state[kind].cycles>=2){state[kind].cycles=0;state[kind].k=0;}$(kind+'-diagram').scrollIntoView({block:'center',behavior:'instant'});playing=kind;lastFrame=0;updateConverter(kind);frame=requestAnimationFrame(tick);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
motion.addEventListener('change',stopPlayback);
function updateBudget(){$('reveal').disabled=!state.guess||state.revealed;$('budget').hidden=!state.revealed;document.querySelectorAll('[name=guess]').forEach(el=>el.disabled=state.revealed);$('eta-value').textContent=state.eta+'%';$('feedback').textContent=t(state.guess==='more'?'correct':'checkAgain')+' '+t('idealIn');const pin=12/(state.eta/100);$('budget-read').innerHTML=read(t('inCurrent'),f(pin/5)+' A')+read(t('inPower'),f(pin)+' W')+read(t('outPower'),'12.00 W')+read(t('loss'),f(pin-12)+' W');}
let observer;
function observeSteps(){if(observer)observer.disconnect();observer=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting)document.querySelectorAll('.nav-step').forEach(a=>{const active=a.dataset.nav===e.target.dataset.step;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});},{rootMargin:'-25% 0px -60% 0px'});document.querySelectorAll('.step').forEach(e=>observer.observe(e));}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.lang){stopPlayback();const top=[...document.querySelectorAll('.step')].find(s=>s.getBoundingClientRect().bottom>90),offset=top?.getBoundingClientRect().top;lang=b.dataset.lang;try{localStorage.setItem('knowledge-lang',lang);}catch(_){}render();if(top)window.scrollBy(0,$(top.id).getBoundingClientRect().top-offset);document.querySelector(`[data-lang=${lang}]`).focus({preventScroll:true});return;}
 if(b.dataset.areaAt){const input=$('buck-seek');input.value=b.dataset.areaAt==='on'?state.buck.d*50:50;input.dispatchEvent(new Event('input',{bubbles:true}));return;}
 const id=b.id;for(const kind of ['inductor','capacitor'])if(id.startsWith(kind+'-')){const act=id.slice(kind.length+1);if(act==='reset')state[kind]=[0];else if(state[kind].length<17){const drive=(kind==='inductor'?2:.02)*(act==='plus'?1:act==='minus'?-1:0);state[kind].push(M.pulse(kind,state[kind].at(-1),drive).value);}updateMemory(kind);return;}
 for(const kind of ['buck','boost']){
 if(id===kind+'-play'){play(kind);return;}
 if(id===kind+'-next'||id===kind+'-reset'){stopPlayback();state[kind].k=id.endsWith('next')?Math.min(8,phaseIndex(state[kind])+1):0;const m=M.converter(kind,state[kind].vin,state[kind].d);state[kind].cycles=m.timeAt(state[kind].k)/m.T;state[kind].changed=false;updateConverter(kind);return;}
 }
 if(id==='diode'){state.reverse=!state.reverse;updateSwitch();}
 if(id==='reveal'){state.revealed=true;updateBudget();}
 if(id==='quiz-reset'){state.guess='';state.revealed=false;state.eta=90;document.querySelectorAll('[name=guess]').forEach(el=>el.checked=false);$('eta').value=90;updateBudget();}
});
document.addEventListener('input',e=>{const id=e.target.id,v=Number(e.target.value);if(id==='power-v'){state.voltage=v;updatePower();}if(id==='pwm-d'){state.duty=v/100;updateSwitch();}if(id==='eta'){state.eta=v;updateBudget();}for(const kind of ['buck','boost'])if(id===kind+'-vin'||id===kind+'-d'){state[kind][id.endsWith('vin')?'vin':'d']=id.endsWith('vin')?v:v/100;state[kind].k=phaseIndex(state[kind]);state[kind].changed=true;updateConverter(kind);}for(const kind of ['buck','boost'])if(id===kind+'-seek'){stopPlayback();state[kind].cycles=v/50;state[kind].k=phaseIndex(state[kind]);updateConverter(kind);}if(e.target.name==='guess'){state.guess=e.target.value;updateBudget();}});
window.addEventListener('resize',()=>{updateMemory('inductor');updateMemory('capacitor');updateSwitch();updateConverter('buck');updateConverter('boost');});
render();
})();
