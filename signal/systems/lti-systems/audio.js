'use strict';
/* One bounded player for S2. No autonomous sound, media requests or persistent state. */
(function(){
 const el=id=>document.getElementById(id),AudioCtor=window.AudioContext||window.webkitAudioContext;
 let plan=null,key='',ctx=null,opening=null,master=null,voices=new Set(),current=null,mode=null,status='idle';
 let generation=0,startAt=0,raf=0,swapTimer=0,swapUntil=0,pending=false,closing=Promise.resolve(),position=0;
 function labels(){
  const playing=!!ctx&&['input','output','updating'].includes(status);
  el('s2-audio-stop').disabled=!ctx&&status!=='opening';
  ['input','output'].forEach(kind=>el('s2-audio-'+kind).setAttribute('aria-pressed',String(playing&&mode===kind)));
  const suffix=mode==='output'&&plan?' · '+t('soundSystem',{sys:t('s2sys'+({ma3:'Ma',acc:'Acc',diff:'Diff'}[plan.sys])),decay:plan.sys==='acc'?t('soundDecay',{a:plan.a.toFixed(2)}):''}):'';
  el('s2-audio-status').textContent=t(status==='input'?'soundPlayingInput':status==='output'?'soundPlayingOutput':'sound'+status[0].toUpperCase()+status.slice(1))+suffix;
  el('s2-audio-volume-value').textContent=el('s2-audio-volume').value+'%';
  el('s2-audio-progress').setAttribute('aria-label',t('soundProgress'));
 }
 function progress(){
  raf=0;if(!ctx||!mode||ctx.state!=='running')return;
  position=Math.min(plan.duration,Math.max(0,ctx.currentTime-startAt));
  el('s2-audio-progress').value=position;
  const text=position.toFixed(1)+' / '+plan.duration.toFixed(2)+' s';
  if(el('s2-audio-time').textContent!==text)el('s2-audio-time').textContent=text;
  raf=requestAnimationFrame(progress);
 }
 function retire(v){if(!v)return;v.source.onended=null;try{v.source.stop()}catch{}v.source.disconnect();v.gain.disconnect();voices.delete(v);}
 function stop(next='stopped'){
  generation++;cancelAnimationFrame(raf);raf=0;clearTimeout(swapTimer);swapTimer=0;pending=false;
  const old=ctx||opening,oldMaster=master,oldVoices=[...voices];ctx=null;opening=null;master=null;current=null;voices=new Set();mode=null;status=next;position=0;
  position=next==='ended'?(plan?.duration||0):0;
  el('s2-audio-progress').value=position;el('s2-audio-time').textContent=position.toFixed(1)+' / '+(plan?.duration||1.8665).toFixed(2)+' s';labels();
  if(old){
   const now=old.currentTime;
   if(old.state==='running'&&oldMaster){oldMaster.gain.cancelScheduledValues(now);oldMaster.gain.setValueAtTime(oldMaster.gain.value,now);oldMaster.gain.linearRampToValueAtTime(0,now+.008);oldVoices.forEach(v=>{try{v.source.stop(now+.009)}catch{}});}
   closing=Promise.allSettled([closing,new Promise(resolve=>setTimeout(()=>{oldVoices.forEach(v=>{v.source.onended=null;try{v.source.stop()}catch{}v.source.disconnect();v.gain.disconnect();});oldMaster?.disconnect();Promise.resolve(old.close()).catch(()=>{}).then(resolve);},old.state==='running'&&oldMaster?14:0))]);
  }
  return closing;
 }
 function voice(kind,offset,attack){
  const data=plan[kind==='input'?'x':'y'],source=ctx.createBufferSource(),gain=ctx.createGain();
  const buffer=ctx.createBuffer(1,data.length,plan.rate);buffer.copyToChannel(Float32Array.from(data),0);source.buffer=buffer;source.loop=false;
  source.connect(gain);gain.connect(master);
  const now=ctx.currentTime;if(offset===0&&voices.size===0)startAt=now;offset=Math.max(0,now-startAt);
  const end=startAt+plan.duration,attackEnd=Math.min(now+attack,end-.008);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(1,Math.max(now,attackEnd));gain.gain.setValueAtTime(1,Math.max(now,end-.008));gain.gain.linearRampToValueAtTime(0,end);
  const v={source,gain,began:now,attack};voices.add(v);current=v;const ownCtx=ctx;
  source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(v);if(ctx===ownCtx&&current===v){current=null;stop('ended');}};
  source.start(now,offset);return v;
 }
 function swap(){
  swapTimer=0;if(!ctx||mode!=='output'||ctx.state!=='running')return;
  const now=ctx.currentTime;
  if(now<swapUntil){swapTimer=setTimeout(swap,Math.ceil((swapUntil-now)*1000)+2);return;}
  if(plan.duration-(now-startAt)<.025){pending=false;return;}
  // Coalesce until the previous fade ends; never hard-cut a nonzero retiring voice.
  for(const v of voices)if(v!==current&&v.ends<=now)retire(v);
  const old=current;
  if(old){const value=Math.min(1,Math.max(0,(now-old.began)/old.attack));old.gain.gain.cancelScheduledValues(now);old.gain.gain.setValueAtTime(value,now);old.gain.gain.linearRampToValueAtTime(0,now+.01);old.ends=now+.01;old.source.stop(now+.01);}
  voice('output',Math.max(0,now-startAt),.01);swapUntil=now+.01;pending=false;status='output';labels();
 }
 async function play(kind){
  if(!AudioCtor){status='unsupported';labels();return;}
  if(!plan){status='error';labels();return;}
  const finished=stop('opening'),ticket=generation;mode=kind;labels();
  // Construct/resume synchronously inside the gesture, before awaiting old disposal (mobile unlock).
  let audio;try{audio=new AudioCtor();opening=audio;}catch{status='error';mode=null;labels();return;}
  let resume;try{resume=audio.resume();}catch(e){resume=Promise.reject(e);}
  let timeout;
  try{
   await Promise.all([finished,Promise.race([resume,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('resume timeout')),1500);})])]);clearTimeout(timeout);
   if(ticket!==generation||document.hidden){await audio.close().catch(()=>{});return;}
   if(audio.state!=='running')throw new Error('not running');
   ctx=audio;opening=null;master=ctx.createGain();master.gain.value=plan.scale*Number(el('s2-audio-volume').value)/100;master.connect(ctx.destination);mode=kind;status=kind;startAt=ctx.currentTime;swapUntil=0;
   ctx.onstatechange=()=>{if(ctx===audio&&audio.state!=='running')stop('interrupted');};
   voice(kind,0,.008);labels();progress();
  }catch{clearTimeout(timeout);await audio.close().catch(()=>{});if(opening===audio)opening=null;if(ticket===generation){status='error';mode=null;labels();}}
 }
 el('s2-audio-input').addEventListener('click',()=>play('input'));
 el('s2-audio-output').addEventListener('click',()=>play('output'));
 el('s2-audio-stop').addEventListener('click',()=>stop());
 el('s2-audio-volume').addEventListener('input',()=>{if(ctx){const now=ctx.currentTime;master.gain.cancelScheduledValues(now);master.gain.setTargetAtTime(plan.scale*Number(el('s2-audio-volume').value)/100,now,.008);}labels();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 window.addEventListener('pagehide',()=>stop());window.addEventListener('popstate',()=>stop());
 window.addEventListener('hashchange',()=>{if(location.hash!=='#step2')stop();});
 new IntersectionObserver(es=>{if(es.some(e=>!e.isIntersecting)&&(ctx||status==='opening'))stop();},{threshold:0}).observe(el('step2'));
 window.LtiSound={
  update(signal,state,run){
   const next=state.sys+':'+state.a;
   if(next!==key){try{plan=LtiAudioModel.build(signal,state.sys,state.a,run);key=next;}catch{plan=null;stop('error');return null;}
    if(ctx&&mode==='output'){pending=true;status='updating';labels();if(!swapTimer)swapTimer=setTimeout(swap,0);}
   }
   if(!AudioCtor){status='unsupported';el('s2-audio-input').disabled=true;el('s2-audio-output').disabled=true;}
   el('s2-audio-progress').max=plan.duration;labels();return plan;
  },
  snapshot(){return {status,mode,playing:!!ctx&&ctx.state==='running',contextState:ctx?.state||'none',voices:voices.size,pending,position,sys:plan?.sys,a:plan?.a,rate:plan?.rate,duration:plan?.duration,peak:plan?.peak,volume:Number(el('s2-audio-volume').value)/100,raf:!!raf,swapTimer:!!swapTimer};}
 };
})();
