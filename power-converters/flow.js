/* SVG presentation only: currents come from the unchanged PowerModel sample. */
(() => {
'use strict';
const ns='http://www.w3.org/2000/svg';
function branches(kind,q){
 const buck=kind==='buck',x=buck?110:170,source=buck?(q.on?q.il:0):q.il,delivery=buck?q.il:(q.on?0:q.il);
 return [
  ['source',`M25 250V190 M25 140V80${buck?'H110':'H55q10 -28 20 0q10 -28 20 0q10 -28 20 0q10 -28 20 0H170'}`,source],
  ['source-return',`M${x} 250H25`,source],
  ['delivery',buck?'M110 80H130q10 -28 20 0q10 -28 20 0q10 -28 20 0q10 -28 20 0H260':'M170 80H260',delivery],
  ['load','M260 80H330V250H260',1],
  ['return',`M260 250H${x}`,delivery],
  [buck?'diode':'switch',buck?'M110 250V80':'M170 80V250',buck?(q.on?0:q.il):(q.on?q.il:0)],
  ['capacitor-top',q.ic>=0?'M260 80V150':'M260 150V80',Math.abs(q.ic)],
  ['capacitor-bottom',q.ic>=0?'M260 166V250':'M260 250V166',Math.abs(q.ic)]
 ];
}
function mount(host,kind){
 const buck=kind==='buck',coil=buck?130:55;
 host.innerHTML=`<svg viewBox="0 0 360 290" role="img"><title></title><g class="flow-rails"></g><g class="flow-packets" aria-hidden="true"></g>
 <circle class="device" cx="25" cy="165" r="25"/><text x="25" y="160" text-anchor="middle">+</text><text x="25" y="181" text-anchor="middle">−</text>
 <text x="25" y="118" text-anchor="middle">Vin</text><text x="286" y="44">Vout +</text>
 <path class="coil-field" d="M${coil} 76h80"/><path class="device" d="M${coil} 80q10 -28 20 0q10 -28 20 0q10 -28 20 0q10 -28 20 0"/><text x="${coil+40}" y="43" text-anchor="middle">L</text>
 ${buck?'<path class="switch-mask" d="M55 80H100"/><path class="switch-blade wire"/><circle class="device" cx="55" cy="80" r="3"/><circle class="device" cx="100" cy="80" r="3"/><text x="78" y="43">S</text><path class="device" d="M110 152l-13 24h26Z M94 148h32"/><text x="88" y="139">K</text><text x="88" y="199">A</text>':'<path class="device" d="M195 67l22 13-22 13Z M222 64v32"/><text x="193" y="115">A K</text><path class="switch-mask" d="M170 141V190"/><path class="switch-blade wire"/><circle class="device" cx="170" cy="141" r="3"/><circle class="device" cx="170" cy="190" r="3"/><text x="196" y="174">S</text>'}
 <path class="device" d="M242 150h36 M242 166h36"/><text x="282" y="164">C</text><text x="242" y="134">+</text><text x="242" y="200">−</text>
 <circle class="device" cx="330" cy="165" r="20"/><path class="wire" d="M330 153v22l-5 -7m5 7l5 -7"/><text x="330" y="224" text-anchor="middle">1 A</text><text x="180" y="280" text-anchor="middle">0 V</text>
 </svg>`;
 for(const [name,d] of branches(kind,{on:true,il:1,ic:0}))for(const cls of ['flow-rail','flow-packet']){
  const p=document.createElementNS(ns,'path');p.setAttribute('class',cls);p.dataset.branch=name;p.setAttribute('d',d);host.querySelector(cls==='flow-rail'?'.flow-rails':'.flow-packets').appendChild(p);
 }
}
function update(host,kind,q,travel,moving,title){
 if(!host.querySelector('svg'))mount(host,kind);
 host.querySelector('title').textContent=title;
 host.dataset.on=String(q.on);host.dataset.ic=String(q.ic);host.dataset.il=String(q.il);host.dataset.energy=String(q.energy);
 const delta=moving?Math.max(0,Math.min(.2,travel-(host._travel??travel))):0;host._travel=travel;
 const paths=branches(kind,q);
 for(const [name,d,current] of paths){
  const active=current>1e-8;
  for(const p of host.querySelectorAll(`[data-branch="${name}"]`)){
   p.setAttribute('d',d);p.dataset.current=String(current);p.classList.toggle('conducting',active);
   if(p.classList.contains('flow-packet')){p.style.opacity=moving&&active?'1':'0';p._distance=(p._distance||0)+(active?delta*36*current:0);p.style.strokeDashoffset=String(-p._distance);}
   else p.style.strokeWidth=String(active?2+Math.min(4,current):1.5);
  }
 }
 host.querySelector('.switch-blade').setAttribute('d',kind==='buck'?`M55 80L100 ${q.on?80:55}`:`M170 141L${q.on?170:195} 190`);
 host.querySelector('.coil-field').style.strokeWidth=String(6+22*Math.min(1,q.energy/(kind==='buck'?.00065:.01)));
 // Arrows remain meaningful when paused or reduced motion is requested.
 let arrows=host.querySelector('.direction-arrows');if(!arrows){arrows=document.createElementNS(ns,'g');arrows.setAttribute('class','direction-arrows');arrows.setAttribute('aria-hidden','true');host.querySelector('svg').appendChild(arrows);}
 const cap=Math.abs(q.ic)<1e-8?'':q.ic>0?'M260 108v20l-5 -7m5 7l5 -7':'M260 128v-20l-5 7m5 -7l5 7';
 if(!arrows.firstChild)arrows.appendChild(document.createElementNS(ns,'path'));
 arrows.firstChild.setAttribute('d',`M306 80h12l-6 -5m6 5l-6 5 M307 250h-12l6 -5m-6 5l6 5 ${cap} ${kind==='buck'?(q.on?'M35 80h12l-6 -5m6 5l-6 5':'M110 222v-14l-5 6m5 -6l5 6'):`M35 80h12l-6 -5m6 5l-6 5 ${q.on?'M170 110v16l-5 -6m5 6l5 -6':'M235 80h12l-6 -5m6 5l-6 5'}`}`);
}
window.PowerFlow={update,branches};
})();
