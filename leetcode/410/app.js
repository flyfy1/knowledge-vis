'use strict';
const locale=LeetCodeLocale(window.COPY),t=locale.t,$=id=>document.getElementById(id);
let preset=0,scanIndex=0,searchIndex=0,cap=5,scanFrames,searchFrames,revealed=false,copyState='';
const array=a=>'['+a.join(', ')+']';
function groupsInto(el,groups){
 el.replaceChildren();
 if(!groups.length){el.textContent=t('empty');return;}
 groups.forEach((g,i)=>{const box=document.createElement('div');box.className='group';const b=document.createElement('b'),small=document.createElement('small');b.textContent=t('group',{i:i+1,values:array(g)});small.textContent=t('sum',{sum:g.reduce((a,b)=>a+b,0)});box.append(b,small);el.append(box);});
}
function endpoints(prefix,index,last){$(prefix+'Prev').disabled=index===0;$(prefix+'Reset').disabled=index===0;$(prefix+'Next').disabled=index===last;$(prefix+'End').disabled=index===last;}
function render(){
 const {nums,k}=SplitArray.presets[preset],f=scanFrames[scanIndex],sf=searchFrames[searchIndex];
 const cut=Number(document.querySelector('input[name="cut"]:checked').value),a=[2,3,4],hand=[a.slice(0,cut),a.slice(cut)],sums=hand.map(g=>g.reduce((a,b)=>a+b,0));groupsInto($('handGroups'),hand);$('handResult').textContent=t('handRead',{sums:sums.join(', '),largest:Math.max(...sums)});
 $('input').textContent=$('searchInput').textContent=t('input',{nums:array(nums),k});$('capValue').textContent='B = '+cap;
 groupsInto($('scanGroups'),f.groups);endpoints('scan',scanIndex,nums.length);
 const g=f.groups.length;
 $('scanProgress').textContent=t('scanProgress',{i:scanIndex,n:nums.length,g,result:scanIndex<nums.length?t('partial'):t(g<=k?'scanPass':'scanFail',{g,k})});
 $('scanHistory').replaceChildren();scanFrames.slice(1,scanIndex+1).forEach(frame=>{const e=frame.event,li=document.createElement('li');li.textContent=t(e.cut?'cut':'append',{...e,i:e.i+1,total:e.before+e.x,cap});$('scanHistory').append(li);});
 endpoints('search',searchIndex,searchFrames.length-1);
 $('interval').textContent=t('interval',{lo:sf.lo,hi:sf.hi,count:sf.hi-sf.lo+1});$('searchProgress').textContent=t('searchProgress',{i:searchIndex,n:searchFrames.length-1,result:sf.lo===sf.hi?t('done',{answer:sf.lo}):t('pending')});
 $('searchHistory').replaceChildren();searchFrames.slice(1,searchIndex+1).forEach((frame,i)=>{const e=frame.event,li=document.createElement('li'),p=document.createElement('p'),boxes=document.createElement('div');boxes.className='groups';p.textContent=t('round',{i:i+1,lo:e.oldLo,hi:e.oldHi,mid:e.mid,g:e.groups.length,k,decision:t(e.pass?'pass':'fail'),nextLo:frame.lo,nextHi:frame.hi});groupsInto(boxes,e.groups);li.append(p,boxes);$('searchHistory').append(li);});
 const choice=document.querySelector('input[name="prediction"]:checked');$('reveal').disabled=!choice;$('feedback').textContent=revealed?t(choice.value==='1'?'correct':'incorrect')+'\n'+t('answer'):t(choice?'chosen':'waiting');$('copyStatus').textContent=copyState?t(copyState):'';
}
function rebuild(){const {nums,k}=SplitArray.presets[preset];cap=Math.max(Math.max(...nums),Math.floor(nums.reduce((a,b)=>a+b,0)/2));$('cap').min=Math.max(...nums);$('cap').max=nums.reduce((a,b)=>a+b,0);$('cap').value=cap;scanFrames=SplitArray.scan(nums,cap);searchFrames=SplitArray.search(nums,k);scanIndex=searchIndex=0;}
$('preset').onchange=e=>{preset=Number(e.target.value);rebuild();render();};
$('cap').oninput=e=>{cap=Number(e.target.value);scanIndex=0;scanFrames=SplitArray.scan(SplitArray.presets[preset].nums,cap);render();};
for(const prefix of ['scan','search'])for(const action of ['Prev','Next','Reset','End'])$(prefix+action).onclick=()=>{let index=prefix==='scan'?scanIndex:searchIndex,last=(prefix==='scan'?scanFrames:searchFrames).length-1;index=action==='Prev'?Math.max(0,index-1):action==='Next'?Math.min(last,index+1):action==='Reset'?0:last;if(prefix==='scan')scanIndex=index;else searchIndex=index;render();};
document.querySelectorAll('input[name="cut"]').forEach(el=>el.onchange=render);document.querySelectorAll('input[name="prediction"]').forEach(el=>el.onchange=()=>{revealed=false;render();});$('reveal').onclick=()=>{revealed=true;render();};
$('pythonSource').textContent=window.PYTHON_SOURCE;
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(window.PYTHON_SOURCE);copyState='copied';$('manualCopy').hidden=true;}catch(_){copyState='copyFail';$('manualCopy').hidden=false;$('manualSource').value=window.PYTHON_SOURCE;$('manualSource').focus();$('manualSource').select();}render();};
rebuild();cap=5;$('cap').value=cap;scanFrames=SplitArray.scan(SplitArray.presets[0].nums,cap);locale.onChange(render);locale.init();
function updateNav(){
 const sections=[...document.querySelectorAll('.step')],nav=document.querySelector('.step-nav');
 let active=sections[0];for(const section of sections)if(section.getBoundingClientRect().top<=nav.getBoundingClientRect().height+24)active=section;
 document.querySelectorAll('.step-nav a').forEach(a=>a.classList.toggle('active',a.hash==='#'+active.id));
}
window.addEventListener('scroll',updateNav,{passive:true});window.addEventListener('resize',updateNav);locale.onChange(updateNav);updateNav();
