'use strict';
const $=id=>document.getElementById(id);const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Model constants. Relative temperature is a speed-scale knob (not kelvin): speedScale = 0.25 + 0.8 × T/100.
// Success: relative speed ≥ threshold/40. Every encounter is counted once, on the frame contact starts.
// Each reacting A and B is consumed, a P particle is made at the meeting point, and a fresh reactant with the
// same speed re-enters at a random spot (solid B sites are refilled in place), so concentration stays constant.
const CONST={W:900,H:300,R:6,CONTACT:14.4,DT:1/30,BASE_COUNT:32,BASE_TEMP:100,BASE_THRESHOLD:90,WINDOW:8,HISTORY_SECONDS:20,MAX_PARTICLES:96,
  MARK_LIFE:0.5,PRODUCT_LIFE:4,SITE:12,SURFACE_A:24,SURFACE_THRESHOLD:40,COMPARE_SEEDS:[31,32,33,34,35,36],COMPARE_FRAMES:600,CAT_THRESHOLD:60};
function seeded(seed){let x=(seed>>>0)||1;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};}
function nextRand(st){st.rng=(1664525*st.rng+1013904223)>>>0;return st.rng/4294967296;}
function speedScale(temp){return 0.25+(temp/100)*0.8;}
function makeParticles(count,temp,seed){const r=seeded(seed);const particles=[];const sc=speedScale(temp);for(let i=0;i<count;i++){const a=r()*Math.PI*2,s=(0.55+r()*0.9)*sc;const type=i%2?'B':'A';particles.push({id:i+1,x:24+r()*(CONST.W-48),y:24+r()*(CONST.H-48),vx:Math.cos(a)*s,vy:Math.sin(a)*s,type,active:true});}return particles;}
// Solid B: 36 fixed lattice sites, either one 6×6 chunk or nine 2×2 grains (same amount of solid).
function surfaceLayout(surface,seed){const r=seeded(seed*7+3),S=CONST.SITE,sites=[],rects=[];const clump=(cx,cy,n,cid)=>{const x0=cx-n*S/2+S/2,y0=cy-n*S/2+S/2;for(let gy=0;gy<n;gy++)for(let gx=0;gx<n;gx++)sites.push({clump:cid,gx,gy,x:x0+gx*S,y:y0+gy*S});rects.push({x0:cx-n*S/2,y0:cy-n*S/2,x1:cx+n*S/2,y1:cy+n*S/2});};
  if(surface==='block')clump(CONST.W/2,CONST.H/2,6,0);else{let cid=0;for(let j=0;j<3;j++)for(let i=0;i<3;i++)clump(150+i*300+(r()-.5)*60,62+j*88+(r()-.5)*20,2,cid++);}return {sites,rects};}
// Pure: a site is contactable (exposed) when at least one of its 4 lattice neighbours is empty.
function exposedSites(sites){const has=new Set(sites.map(s=>s.clump+':'+s.gx+':'+s.gy));return sites.map(s=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>!has.has(s.clump+':'+(s.gx+dx)+':'+(s.gy+dy))));}
function insideRect(x,y,rects,pad){return rects.some(q=>x>q.x0-pad&&x<q.x1+pad&&y>q.y0-pad&&y<q.y1+pad);}
function initialState(opts={}){const surfaceMode=!!opts.surface;const count=surfaceMode?CONST.SURFACE_A:clamp(Math.round(opts.count??CONST.BASE_COUNT),8,CONST.MAX_PARTICLES);
  const temp=clamp(Number(opts.temp??CONST.BASE_TEMP),40,220);const threshold=clamp(Number(opts.threshold??(surfaceMode?CONST.SURFACE_THRESHOLD:CONST.BASE_THRESHOLD)),10,100);const seed=opts.seed??17;
  let particles,rects=[];if(surfaceMode){const lay=surfaceLayout(opts.surface,seed);rects=lay.rects;const exp=exposedSites(lay.sites);const r=seeded(seed);const sc=speedScale(temp);particles=[];
    for(let i=0;i<count;i++){let x,y,k=0;do{x=24+r()*(CONST.W-48);y=24+r()*(CONST.H-48);k++;}while(insideRect(x,y,rects,CONST.R+2)&&k<50);const a=r()*Math.PI*2,s=(0.55+r()*0.9)*sc;particles.push({id:i+1,type:'A',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,active:true});}
    lay.sites.forEach((s,i)=>particles.push({id:count+i+1,type:'B',fixed:true,x:s.x,y:s.y,vx:0,vy:0,gx:s.gx,gy:s.gy,clump:s.clump,active:exp[i]}));}
  else particles=makeParticles(count,temp,seed);
  return {count,temp,threshold,surface:surfaceMode?opts.surface:null,rects,particles,elapsed:0,collisions:0,successes:0,products:0,contacts:{},marks:[],history:[{t:0,collisions:0,successes:0,products:0}],rng:((seed*2654435761)>>>0)||1,nextId:particles.length+1,seed};}
function relativeSpeed(a,b){return Math.hypot(a.vx-b.vx,a.vy-b.vy);}
function respawn(next,p){const opp=p.type==='A'?'B':'A';let x,y,k=0;do{x=24+nextRand(next)*(CONST.W-48);y=24+nextRand(next)*(CONST.H-48);k++;}
  while(k<12&&(insideRect(x,y,next.rects,CONST.R+2)||next.particles.some(q=>q.type===opp&&q.active&&(q.x-x)**2+(q.y-y)**2<CONST.CONTACT**2)));
  const s=Math.hypot(p.vx,p.vy),a=nextRand(next)*Math.PI*2;p.x=x;p.y=y;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;p.id=next.nextId++;}
function bounceRects(p,rects){const pad=CONST.R;for(const q of rects){const x0=q.x0-pad,x1=q.x1+pad,y0=q.y0-pad,y1=q.y1+pad;if(p.x<=x0||p.x>=x1||p.y<=y0||p.y>=y1)continue;
  const d=[p.x-x0,x1-p.x,p.y-y0,y1-p.y],m=Math.min(...d),i=d.indexOf(m);if(i===0){p.x=x0;if(p.vx>0)p.vx*=-1;}else if(i===1){p.x=x1;if(p.vx<0)p.vx*=-1;}else if(i===2){p.y=y0;if(p.vy>0)p.vy*=-1;}else{p.y=y1;if(p.vy<0)p.vy*=-1;}}}
function advanceState(state,dt=CONST.DT){const next={...state,particles:state.particles.map(p=>({...p})),contacts:{},elapsed:state.elapsed+dt,history:state.history.slice(),
  marks:state.marks.map(m=>({...m,age:m.age+dt})).filter(m=>m.age<CONST.MARK_LIFE)};
  next.particles.forEach(p=>{if(p.fixed)return;if(p.type==='P')p.age+=dt;p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;if(p.x<CONST.R||p.x>CONST.W-CONST.R){p.vx*=-1;p.x=clamp(p.x,CONST.R,CONST.W-CONST.R);}if(p.y<CONST.R||p.y>CONST.H-CONST.R){p.vy*=-1;p.y=clamp(p.y,CONST.R,CONST.H-CONST.R);}if(p.type==='A'&&next.rects.length)bounceRects(p,next.rects);});
  next.particles=next.particles.filter(p=>p.type!=='P'||p.age<CONST.PRODUCT_LIFE);
  const As=next.particles.filter(p=>p.type==='A'),Bs=next.particles.filter(p=>p.type==='B'&&p.active),used=new Set(),born=[];
  for(const a of As){for(const b of Bs){if(used.has(a)||used.has(b))continue;const dx=a.x-b.x,dy=a.y-b.y;if(dx*dx+dy*dy>CONST.CONTACT**2)continue;const key=a.id+':'+b.id;next.contacts[key]=1;if(state.contacts[key])continue;
    next.collisions++;const success=relativeSpeed(a,b)>=state.threshold/40;next.marks.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,success,age:0});
    if(success){next.successes++;next.products++;used.add(a);if(!b.fixed)used.add(b);born.push({id:next.nextId++,type:'P',x:(a.x+b.x)/2,y:(a.y+b.y)/2,vx:(a.vx+b.vx)/2,vy:(a.vy+b.vy)/2,age:0,active:false});}}}
  used.forEach(p=>respawn(next,p));next.particles=next.particles.concat(born);
  next.history.push({t:next.elapsed,collisions:next.collisions,successes:next.successes,products:next.products});const maxH=Math.round(CONST.HISTORY_SECONDS/CONST.DT)+1;if(next.history.length>maxH)next.history.splice(0,next.history.length-maxH);return next;}
function metricWindow(state){const cutoff=state.elapsed-CONST.WINDOW+1e-9;let base=state.history[0];for(const h of state.history){if(h.t<=cutoff)base=h;else break;}
  const span=Math.max(CONST.DT,state.elapsed-base.t);const collisions=state.collisions-base.collisions,successes=state.successes-base.successes;
  const movers=state.particles.filter(p=>p.type!=='P'&&!p.fixed);const avgSpeed=movers.reduce((s,p)=>s+Math.hypot(p.vx,p.vy),0)/Math.max(1,movers.length);
  const share=collisions?successes/collisions*100:0;return {collisions,successes,span,rate:successes/span,collisionRate:collisions/span,avgSpeed,share,ready:share,products:state.products,liveProducts:state.particles.filter(p=>p.type==='P').length};}
function surfaceCounts(state){const Bs=state.particles.filter(p=>p.type==='B');return {active:Bs.filter(p=>p.active).length,total:Bs.length};}
function simulateWindow(opts={},frames=900,seed=19){let s=initialState({...opts,seed});for(let i=0;i<frames;i++)s=advanceState(s);const m=metricWindow(s);return {state:s,metrics:m};}
function statsFor(opts){return simulateWindow(opts,900,opts.seed??19).metrics;}
// Whole-run means over several seeds: used for the comparison lines (cached by the page per setting).
function longRunStats(opts,seeds=CONST.COMPARE_SEEDS,frames=CONST.COMPARE_FRAMES){let rate=0,coll=0,succ=0,speed=0;seeds.forEach(sd=>{let s=initialState({...opts,seed:sd});for(let i=0;i<frames;i++)s=advanceState(s);rate+=s.successes/s.elapsed;coll+=s.collisions/s.elapsed;succ+=s.successes;speed+=metricWindow(s).avgSpeed;});
  const n=seeds.length,cr=coll/n;return {rate:rate/n,collisionRate:cr,share:cr?rate/n/cr*100:0,avgSpeed:speed/n,seeds:n,seconds:frames*CONST.DT};}
function ratio(a,b){return b?((a-b)/b*100):0;}
// A compact reaction-coordinate model for the catalyst bridge. The curve is a
// teaching aid (not a second rate calculation): the current threshold and a
// lower catalysed threshold are shown against the same energy coordinate.
function energyProfileData(threshold,base=CONST.BASE_THRESHOLD){const gate=clamp(Number(threshold),10,100),uncat=clamp(Number(base),10,100),cat=clamp(Math.min(gate,CONST.CAT_THRESHOLD),10,100);
  const profile=barrier=>{const peak=barrier/100,points=[];for(let i=0;i<=40;i++){const x=i/40;const shoulder=0.22+0.03*Math.sin(x*Math.PI);const crest=Math.exp(-((x-.5)**2)/.018);const product=x>.68?-.08:0;points.push({x,y:shoulder+(peak-shoulder)*crest+product});}return points;};
  return {points:profile(gate),catalystPoints:profile(cat),gate,uncat,cat};}
const API={CONST,seeded,speedScale,makeParticles,surfaceLayout,exposedSites,initialState,advanceState,metricWindow,surfaceCounts,simulateWindow,statsFor,longRunStats,relativeSpeed,ratio,energyProfileData};
if(typeof window!=='undefined')window.REACTION_RATES=API;if(typeof module!=='undefined')module.exports=API;

// ---------- page ----------
const KEYS=['s0','s1','s2','s3','s4'];const sims={};const paused={};const visible={};const cache={};const pending={};const canvasW={};let s1Ghost=null;
function fitCanvas(canvas,LW=CONST.W,LH=CONST.H){const dpr=Math.min(3,window.devicePixelRatio||1),w=Math.max(260,canvas.clientWidth||600),h=w*LH/LW;const k=w/LW;
  if(canvasW[canvas.id]!==w*dpr){canvasW[canvas.id]=w*dpr;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const ctx=canvas.getContext('2d');ctx.setTransform(dpr*k,0,0,dpr*k,0,0);return {ctx,k};}
function draw(ctx,k,state){const px=v=>v/k;ctx.clearRect(0,0,CONST.W,CONST.H);ctx.fillStyle='#0d1621';ctx.fillRect(0,0,CONST.W,CONST.H);ctx.strokeStyle='#2c3b50';ctx.lineWidth=px(1);ctx.strokeRect(2,2,CONST.W-4,CONST.H-4);
  const rr=Math.max(4.5,px(2.6));
  if(state.rects.length){ctx.setLineDash([px(4),px(4)]);ctx.strokeStyle='#8a6a45';ctx.lineWidth=px(1);const pad=CONST.CONTACT-CONST.SITE/2;state.rects.forEach(q=>ctx.strokeRect(q.x0-pad,q.y0-pad,q.x1-q.x0+2*pad,q.y1-q.y0+2*pad));ctx.setLineDash([]);}
  state.particles.forEach(p=>{if(p.fixed){const h=CONST.SITE/2-1;ctx.fillStyle=p.active?'#ffb454':'#4e3925';ctx.fillRect(p.x-h,p.y-h,2*h,2*h);if(p.active){ctx.strokeStyle='#ffe0b0';ctx.lineWidth=px(1);ctx.strokeRect(p.x-h,p.y-h,2*h,2*h);}return;}
    ctx.beginPath();ctx.fillStyle=p.type==='A'?'#67d7f9':(p.type==='B'?'#ffb454':'#7ee2a8');if(p.type==='P'){ctx.globalAlpha=Math.max(.25,1-p.age/CONST.PRODUCT_LIFE);const s=rr*.9;ctx.moveTo(p.x,p.y-s);ctx.lineTo(p.x+s,p.y);ctx.lineTo(p.x,p.y+s);ctx.lineTo(p.x-s,p.y);ctx.closePath();}else ctx.arc(p.x,p.y,rr,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;});
  state.marks.forEach(e=>{const a=1-e.age/CONST.MARK_LIFE;ctx.globalAlpha=Math.max(0,a);const col=e.success?'#7ee2a8':'#ff7a93';ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=px(2);ctx.arc(e.x,e.y,px(e.success?10:8)+rr,0,Math.PI*2);ctx.stroke();ctx.fillStyle=col;ctx.font='bold '+px(14)+'px system-ui';ctx.fillText(e.success?'✓':'✗',e.x+px(8)+rr,e.y-px(8)-rr);});ctx.globalAlpha=1;
  ctx.font=px(12)+'px system-ui';const leg=t(state.rects.length?'surfaceLegend':'canvasLegend');const lines=ctx.measureText(leg).width>CONST.W-px(16)?leg.split('　'):[leg];
  ctx.fillStyle='rgba(13,22,33,.8)';ctx.fillRect(px(4),px(3),Math.max(...lines.map(l=>ctx.measureText(l).width))+px(8),px(16)*lines.length+px(2));ctx.fillStyle='#9aaabd';lines.forEach((l,i)=>ctx.fillText(l,px(8),px(16)*(i+1)));}
function render(id,state){const c=$(id);if(!c)return;const {ctx,k}=fitCanvas(c);draw(ctx,k,state);}
function drawTrace(){const c=$('s1-trace');if(!c)return;const LW=900,LH=200;const {ctx,k}=fitCanvas(c,LW,LH);const px=v=>v/k;ctx.clearRect(0,0,LW,LH);ctx.fillStyle='#0d1621';ctx.fillRect(0,0,LW,LH);
  const L=px(44),B=LH-px(26),T=px(24),Rr=LW-px(10),span=CONST.HISTORY_SECONDS;const s=sims.s1,h=s.history,t0=Math.max(0,s.elapsed-span);
  const series=[{pts:h.filter(p=>p.t>=t0).map(p=>[p.t-t0,p.products-h.find(q=>q.t>=t0).products]),col:'#7ee2a8',dash:[]}];if(s1Ghost)series.push({pts:s1Ghost.pts,col:'#9aaabd',dash:[px(5),px(4)]});
  const ymax=Math.max(5,...series.flatMap(x=>x.pts.map(p=>p[1])));const nice=Math.ceil(ymax/5)*5;const X=v=>L+(Rr-L)*v/span,Y=v=>B-(B-T)*v/nice;
  ctx.strokeStyle='#2c3b50';ctx.lineWidth=px(1);ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.lineTo(Rr,B);ctx.stroke();ctx.fillStyle='#9aaabd';ctx.font=px(11)+'px system-ui';
  ctx.fillText('0',L-px(14),B+px(4));ctx.fillText(String(nice),L-px(40),T+px(4));ctx.fillText(span+t('seconds'),Rr-px(30),B+px(18));ctx.fillText(t('traceX'),L+px(4),B+px(18));ctx.fillText(t('traceY'),L+px(6),T-px(8));
  series.forEach(sr=>{if(sr.pts.length<2)return;ctx.setLineDash(sr.dash);ctx.strokeStyle=sr.col;ctx.lineWidth=px(2);ctx.beginPath();sr.pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke();});ctx.setLineDash([]);
  ctx.font=px(11)+'px system-ui';ctx.fillStyle='#7ee2a8';ctx.fillText(t('traceNow',{n:s.count}),Rr-px(200),T-px(8));if(s1Ghost){ctx.fillStyle='#9aaabd';ctx.fillText(t('traceGhost',{n:s1Ghost.count}),Rr-px(200),T+px(8));}}
function drawEnergy(){const c=$('s4-energy');if(!c||!sims.s4)return;const LW=900,LH=220;const {ctx,k}=fitCanvas(c,LW,LH);const px=v=>v/k;ctx.clearRect(0,0,LW,LH);ctx.fillStyle='#0d1621';ctx.fillRect(0,0,LW,LH);
  const L=px(56),R=LW-px(18),T=px(22),B=LH-px(38),w=R-L,h=B-T;const d=energyProfileData(sims.s4.threshold);const X=x=>L+x*w;const Y=e=>B-(e+0.16)/(1.08)*h;
  ctx.strokeStyle='#2c3b50';ctx.lineWidth=px(1);ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();ctx.fillStyle='#9aaabd';ctx.font=px(12)+'px system-ui';ctx.fillText(t('energyAxisX'),R-px(110),B+px(24));ctx.save();ctx.translate(px(14),(T+B)/2);ctx.rotate(-Math.PI/2);ctx.fillText(t('energyAxisY'),0,0);ctx.restore();
  const drawProfile=(color,dash,barrier,label,offset,points)=>{ctx.setLineDash(dash.map(px));ctx.strokeStyle=color;ctx.lineWidth=px(3);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(X(p.x),Y(p.y)):ctx.moveTo(X(p.x),Y(p.y)));ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=color;ctx.lineWidth=px(1.5);ctx.setLineDash([px(6),px(5)]);ctx.beginPath();ctx.moveTo(L,Y(barrier/100));ctx.lineTo(R,Y(barrier/100));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=color;ctx.font='bold '+px(12)+'px system-ui';ctx.fillText(label,R-px(150),T+px(offset));};
  drawProfile('#ff7a93',[],d.gate,t('energyUncat'),12,d.points);drawProfile('#7ee2a8',[5,4],d.cat,t('energyCat'),30,d.catalystPoints);
  ctx.fillStyle='#9aaabd';ctx.font=px(11)+'px system-ui';ctx.fillText(t('energyReactants'),L+px(4),B-px(8));ctx.fillText(t('energyProducts'),R-px(64),B-px(8));
}
// Comparison values depend only on constants and slider values: computed off the frame loop, then cached.
function compareFor(key,opts){if(cache[key])return cache[key];if(!pending[key]){pending[key]=1;setTimeout(()=>{cache[key]=longRunStats(opts);delete pending[key];refresh();},30);}return null;}
// Rates over less than 1 s of simulated time are too noisy to print.
function fmtRate(m,v){return m.span<1?'—':v.toFixed(2);}
function runBtn(k){$(k+'-run').textContent=t(paused[k]?'run':'pause');}
function updateStep0(){const m=metricWindow(sims.s0);render('s0-canvas',sims.s0);runBtn('s0');$('s0-ro').textContent=t('s0ro',{v:sims.s0.threshold,sec:Math.min(CONST.WINDOW,m.span).toFixed(1),collisions:m.collisions,successes:m.successes,rate:m.share.toFixed(1),products:m.products});}
function updateStep1(){const s=sims.s1,m=metricWindow(s);render('s1-canvas',s);drawTrace();runBtn('s1');$('s1-count-val').textContent=t('countVal',{n:s.count});$('s1-ro').textContent=t('s1ro',{n:s.count,rate:fmtRate(m,m.rate),products:m.products});
  const a=compareFor('c32',{count:CONST.BASE_COUNT}),b=compareFor('c'+s.count,{count:s.count});$('s1-compare').textContent=a&&b?t('s1compare',{base:CONST.BASE_COUNT,n:s.count,a:a.rate.toFixed(2),b:b.rate.toFixed(2),seeds:a.seeds,sec:a.seconds}):t('computing');}
function updateStep2(){const s=sims.s2,m=metricWindow(s);render('s2-canvas',s);runBtn('s2');$('s2-temp-val').textContent=t('tempVal',{t:s.temp});$('s2-ro').textContent=t('s2ro',{t:s.temp,speed:m.avgSpeed.toFixed(2),coll:fmtRate(m,m.collisionRate),ready:m.share.toFixed(0),rate:fmtRate(m,m.rate)});
  const c0=compareFor('c32',{count:32}),c1=compareFor('c48',{count:48}),t1=compareFor('t150',{count:32,temp:150});
  $('s2-compare').textContent=c0&&c1&&t1?t('s2compare',{thr:CONST.BASE_THRESHOLD,seeds:c0.seeds,sec:c0.seconds,conc:ratio(c1.rate,c0.rate).toFixed(0),temp:ratio(t1.rate,c0.rate).toFixed(0),sp:(t1.avgSpeed/c0.avgSpeed).toFixed(2),cf:ratio(t1.collisionRate,c0.collisionRate).toFixed(0),sh0:c0.share.toFixed(0),sh1:t1.share.toFixed(0),verdict:t(ratio(t1.rate,c0.rate)>ratio(c1.rate,c0.rate)?'steeper':'notSteeper')}):t('computing');}
function updateStep3(){const s=sims.s3,m=metricWindow(s),sc=surfaceCounts(s);render('s3-canvas',s);runBtn('s3');$('s3-ro').textContent=t('s3ro',{shape:t(s.surface),active:sc.active,total:sc.total,v:s.threshold,rate:fmtRate(m,m.rate)});
  const ex=sf=>exposedSites(surfaceLayout(sf,1).sites).filter(Boolean).length;const b=compareFor('block',{surface:'block'}),p=compareFor('powder',{surface:'powder'});
  $('s3-compare').textContent=b&&p?t('s3compare',{a:ex('block'),b:ex('powder'),total:sc.total,r1:b.rate.toFixed(2),r2:p.rate.toFixed(2),seeds:b.seeds,sec:b.seconds}):t('computing');document.querySelectorAll('[data-surface]').forEach(x=>x.classList.toggle('active',x.dataset.surface===s.surface));}
function updateStep4(){const s=sims.s4,m=metricWindow(s);render('s4-canvas',s);drawEnergy();runBtn('s4');$('s4-threshold-val').textContent=t('thresholdVal',{v:s.threshold});$('s4-ro').textContent=t('s4ro',{v:s.threshold,speed:m.avgSpeed.toFixed(2),ready:m.share.toFixed(0),rate:fmtRate(m,m.rate)});
  const hi=compareFor('c32',{count:32}),lo=compareFor('thr35',{count:32,threshold:CONST.CAT_THRESHOLD});$('s4-compare').textContent=hi&&lo?t('s4compare',{a:CONST.BASE_THRESHOLD,b:CONST.CAT_THRESHOLD,r1:hi.rate.toFixed(2),r2:lo.rate.toFixed(2),speed:hi.avgSpeed.toFixed(2),speed2:lo.avgSpeed.toFixed(2),seeds:hi.seeds}):t('computing');
  $('s4-cat').textContent=s.threshold===CONST.CAT_THRESHOLD?t('catOff'):t('catOn');}
const UPDATERS={s0:updateStep0,s1:updateStep1,s2:updateStep2,s3:updateStep3,s4:updateStep4};
function refresh(){if(!sims.s0)return;KEYS.forEach(k=>UPDATERS[k]());}
function makeSim(k){if(k==='s0')return initialState({count:16,temp:80,threshold:60,seed:11});if(k==='s1')return initialState({count:+$('s1-count').value,seed:12});if(k==='s2')return initialState({temp:+$('s2-temp').value,seed:13});
  if(k==='s3')return initialState({surface:(sims.s3&&sims.s3.surface)||'block',seed:14});return initialState({threshold:+$('s4-threshold').value,seed:15});}
function resetStep(k){if(k==='s1')s1Ghost=null;sims[k]=makeSim(k);UPDATERS[k]();}
function tick(){KEYS.forEach(k=>{if(visible[k]&&!paused[k]){sims[k]=advanceState(sims[k]);UPDATERS[k]();}});requestAnimationFrame(tick);}
function bind(){const set=(id,fn)=>$(id).addEventListener('input',fn);
  set('s1-count',()=>{const s=sims.s1;if(s.elapsed>2){const t0=Math.max(0,s.elapsed-CONST.HISTORY_SECONDS),h=s.history.filter(p=>p.t>=t0);s1Ghost={count:s.count,pts:h.map(p=>[p.t-t0,p.products-h[0].products])};}resetStep('s1');});
  set('s2-temp',()=>resetStep('s2'));set('s4-threshold',()=>resetStep('s4'));
  KEYS.forEach(k=>{$(k+'-reset').addEventListener('click',()=>resetStep(k));$(k+'-run').addEventListener('click',()=>{paused[k]=!paused[k];runBtn(k);});});
  $('s4-cat').addEventListener('click',()=>{const v=sims.s4.threshold===CONST.CAT_THRESHOLD?CONST.BASE_THRESHOLD:CONST.CAT_THRESHOLD;$('s4-threshold').value=v;resetStep('s4');});
  document.querySelectorAll('[data-surface]').forEach(b=>b.addEventListener('click',()=>{sims.s3=initialState({surface:b.dataset.surface,seed:14});updateStep3();}));
  window.addEventListener('resize',refresh);
  const nav=[...document.querySelectorAll('.nav-step')],steps=[...document.querySelectorAll('.step')];
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=steps.indexOf(e.target);nav.forEach((n,j)=>n.classList.toggle('active',i===j));}}),{rootMargin:'-25% 0px -60% 0px'});steps.forEach(x=>io.observe(x));
  // Each step's simulation runs only while its canvas is on screen (and its own Pause is not pressed).
  const vio=new IntersectionObserver(es=>es.forEach(e=>{visible[e.target.id.replace('-canvas','')]=e.isIntersecting;}),{threshold:0.15});KEYS.forEach(k=>vio.observe($(k+'-canvas')));}
if(typeof onLangRefresh==='function')onLangRefresh(refresh);
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;KEYS.forEach(k=>{paused[k]=!!reduce;visible[k]=false;sims[k]=makeSim(k);});bind();refresh();requestAnimationFrame(tick);});
