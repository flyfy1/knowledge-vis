const STR = {
  zh: {
    docTitle:'反应速率 · 数一数成功碰撞', back:'← 知识索引', pageTitle:'反应速率 · 数一数成功碰撞',
    tagline:'反应快慢取决于成功碰撞：碰得更勤，能量达标的比例更大，反应就更快。',
    foot:'反应速率 · 一个碰撞一个碰撞地看', navLabel:'步骤导航', canvasLabel:'粒子碰撞模拟画布',
    nav0:'0 成功碰撞',nav1:'1 浓度',nav2:'2 温度',nav3:'3 表面积',nav4:'4 催化剂',nav5:'5 终章',
    reset:'重置本步', run:'运行', pause:'暂停',
    s0k:'第 0 步 · 成功碰撞',s0t:'碰上也不一定成',
    s0e:'反应物粒子在盒子里运动。A 与 B 碰到时，只有相对速率达到活化能阈值，才记作一次<strong>成功碰撞</strong>并生成产物；碰到了但能量不足的，仍是碰撞，却不会反应。先数清成功碰撞，才谈反应快慢。',
    s0ro:'最近 {sec} 秒：碰撞 {collisions} 次，其中成功 {successes} 次；成功率 {rate}%。',s0note:'✓ 成功碰撞　✗ 能量不足（闪烁标记来自刚刚发生的事件）',
    s1k:'第 1 步 · 浓度',s1t:'人多，碰得多',
    s1e:'把同一个盒子里的 A、B 粒子加多，单位时间里相遇的机会就变多。拖动粒子数，观察滑窗内的成功碰撞/秒和产物曲线；曲线的每个点都来自模拟计数。',
    countLab:'粒子总数',countVal:'{n} 个',s1ro:'粒子 {n} 个 · 成功碰撞率 {rate}/秒 · 产物累计 {products} 个。',
    s1compare:'把粒子数从 {base} 加到 {n}，成功碰撞率从 {a} 升到 {b}/秒。',
    s2k:'第 2 步 · 温度',s2t:'跑得快，达标的也多',
    s2e:'升温会同时做两件事：提高粒子速率，让碰撞更勤；也让更多碰撞越过活化能阈值。把温度效应和第 1 步同幅度加人对照，数据会显示前者更陡。',
    tempLab:'相对温度',tempVal:'{t}%',s2ro:'温度 {t}% · 平均速率 {speed} · 达标比例 {ready}% · 成功碰撞率 {rate}/秒。',
    s2compare:'同样把强度提高 50%：加人带来的成功率增幅 {conc}%，升温带来的增幅 {temp}%。',
    s3k:'第 3 步 · 表面积',s3t:'整块还是粉末：接触面决定机会',
    s3e:'固体总量相同，但整块材料只有外层粒子能接触溶液；磨成粉后，可碰粒子名单变长。这里用可碰比例控制 B 粒子能否进入表面区域，比较有效碰撞基数。',
    surfaceLab:'固体形态',block:'整块',powder:'粉末',s3ro:'{shape} · 可碰粒子 {active}/{total} · 成功碰撞率 {rate}/秒。',
    s3compare:'同样的固体总量：粉末把可碰名单从 {a} 扩到 {b}，成功率从 {r1} 升到 {r2}/秒。',
    s4k:'第 4 步 · 催化剂',s4t:'把门槛降下来',
    s4e:'催化剂降低活化能阈值，因而更多已有速率的碰撞能达标；它不把粒子突然加速。拖动阈值，观察达标比例和平均速率：成功率升了，速率分布仍保持原样。',
    thresholdLab:'活化能阈值',thresholdVal:'{v}',catOn:'加入催化剂',catOff:'移除催化剂',s4ro:'阈值 {v} · 平均速率 {speed} · 达标比例 {ready}% · 成功碰撞率 {rate}/秒。',
    s4compare:'阈值从 {a} 降到 {b}：成功率从 {r1} 升到 {r2}/秒，平均速率保持 {speed}。',
    s5k:'第 5 步 · 终章',s5t:'四个旋钮，改的是两件事',
    s5e:'浓度↑让碰撞更勤；温度↑让碰撞更勤且达标比例更高；表面积↑扩大可碰粒子名单；催化剂↓活化能门槛。它们都在增加成功碰撞次数，但路径不同。',
    modelTitle:'模型假设与失配',modelBody:'本页把粒子简化为在盒内匀速直线运动、弹性反弹；A、B 相碰且相对速率超过阈值才算成功并生成产物。真实体系的速率分布服从麦克斯韦分布，温度与速率常用阿伦尼乌斯方程联系；这里用阈值和离散粒子只表达定性图景。催化剂按本页口径只降低阈值，不改变粒子速率分布。',
    linkEq:'→ 去化学平衡第 0 步：平衡是正逆反应速率相等',linkParticles:'→ 去粒子与状态：热运动的底图',
    seconds:'秒', collisions:'碰撞', products:'产物', success:'成功', failed:'失败', avgSpeed:'平均速率', ready:'达标比例',
    A:'A',B:'B',P:'P',
    canvasLegend:'A / B 反应物　P 产物', statusRunning:'运行中',statusPaused:'已暂停'
  },
  en: {
    docTitle:'Reaction Rates · Counting Successful Collisions', back:'← Knowledge Index', pageTitle:'Reaction Rates · Counting Successful Collisions',
    tagline:'Reaction speed comes from successful collisions: collide more often, and make a larger share energetic enough.',
    foot:'Reaction Rates · One collision at a time', navLabel:'Step navigation', canvasLabel:'Particle collision simulation canvas',
    nav0:'0 Successful collisions',nav1:'1 Concentration',nav2:'2 Temperature',nav3:'3 Surface area',nav4:'4 Catalyst',nav5:'5 Wrap-up',
    reset:'Reset this step', run:'Run', pause:'Pause',
    s0k:'STEP 0 · SUCCESSFUL COLLISIONS',s0t:'A collision does not always make a reaction',
    s0e:'Reactant particles move inside the box. When A meets B, it counts as a <strong>successful collision</strong> only if their relative speed clears the activation-energy threshold; a low-energy meeting is still a collision, but it does not react. Count successful collisions before talking about reaction speed.',
    s0ro:'Last {sec} s: {collisions} collisions, {successes} successful; success share {rate}%.',s0note:'✓ successful　✗ too little energy (the flash marks just-fired events)',
    s1k:'STEP 1 · CONCENTRATION',s1t:'More particles, more collisions',
    s1e:'Add A and B particles to the same box and meetings become more frequent. Move the particle-count slider and watch successful collisions per second and the product trace; every point on the trace comes from simulation counts.',
    countLab:'Total particles',countVal:'{n} particles',s1ro:'{n} particles · {rate} successful collisions/s · {products} products so far.',
    s1compare:'Raise particle count from {base} to {n}: successful rate rises from {a} to {b}/s.',
    s2k:'STEP 2 · TEMPERATURE',s2t:'Move faster, clear the threshold more often',
    s2e:'Heating does two things at once: it raises particle speed, making meetings more frequent; and it lets a larger share clear the activation-energy threshold. Compare the temperature effect with adding the same relative amount of people in Step 1; the data make the steeper effect visible.',
    tempLab:'Relative temperature',tempVal:'{t}%',s2ro:'Temperature {t}% · mean speed {speed} · above threshold {ready}% · {rate} successful collisions/s.',
    s2compare:'For the same 50% increase in intensity: adding particles raises success rate by {conc}%; heating raises it by {temp}%.',
    surfaceLab:'Solid form',block:'Chunk',powder:'Powder',s3ro:'{shape} · contactable particles {active}/{total} · {rate} successful collisions/s.',
    s3k:'STEP 3 · SURFACE AREA',s3t:'Chunk or powder: contact area sets the opportunities',
    s3e:'The solid amount stays the same, but a chunk exposes only its outer particles to the solution; powder exposes many more. Here the contactable list controls which B particles can enter the surface zone, so you can compare the effective collision base.',
    s3compare:'With the same solid amount, powder expands the contactable list from {a} to {b}; the successful rate rises from {r1} to {r2}/s.',
    s4k:'STEP 4 · CATALYST',s4t:'Lower the gate',
    s4e:'A catalyst lowers the activation-energy threshold, so more collisions at the existing speeds qualify; it does not suddenly speed up the particles. Move the threshold and watch readiness and mean speed: success rises while the speed distribution stays put.',
    thresholdLab:'Activation threshold',thresholdVal:'{v}',catOn:'Add catalyst',catOff:'Remove catalyst',s4ro:'Threshold {v} · mean speed {speed} · above threshold {ready}% · {rate} successful collisions/s.',
    s4compare:'Lower threshold from {a} to {b}: successful rate rises from {r1} to {r2}/s; mean speed stays {speed}.',
    s5k:'STEP 5 · WRAP-UP',s5t:'Four controls change two things',
    s5e:'Concentration↑ makes collisions more frequent; temperature↑ makes them more frequent and raises the above-threshold share; surface area↑ expands the contactable list; catalyst↓ lowers the activation gate. They all increase successful collisions, but by different routes.',
    modelTitle:'Model assumptions and mismatch',modelBody:'This page simplifies particles as moving in straight lines at constant speed with elastic rebounds; an A–B meeting is successful only when relative speed exceeds the threshold, then a product particle is made. Real systems have Maxwell–Boltzmann speed distributions, and temperature/rate are related with the Arrhenius equation; this discrete threshold model is only a qualitative picture. The catalyst here lowers the threshold without changing the particle-speed distribution.',
    linkEq:'→ Chemical Equilibrium, Step 0: equilibrium means equal forward and reverse rates',linkParticles:'→ Particles & States: the heat-motion foundation',
    seconds:'s',collisions:'collisions',products:'products',success:'successful',failed:'failed',avgSpeed:'mean speed',ready:'above threshold',
    A:'A',B:'B',P:'P',canvasLegend:'A / B reactants　P products',statusRunning:'running',statusPaused:'paused'
  }
};
let _lang = null, _langMem = 'zh';
function storedLang(){try{const v=localStorage.getItem('knowledge-lang');return v==='zh'||v==='en'?v:null;}catch(e){return null;}}
function saveLang(v){_langMem=v;try{localStorage.setItem('knowledge-lang',v);}catch(e){}}
function getLang(){if(_lang)return _lang;const s=storedLang();if(s){_lang=s;return s;}const n=(navigator.language||'en').toLowerCase();_lang=n.startsWith('zh')?'zh':'en';return _lang;}
function t(key,params){let s=(STR[getLang()]&&STR[getLang()][key])||STR.zh[key]||key;if(params)Object.keys(params).forEach(k=>{s=s.split('{'+k+'}').join(String(params[k]));});return s;}
const langRefreshers=[];
function onLangRefresh(fn){langRefreshers.push(fn);}
function applyLang(lang){_lang=lang;saveLang(lang);document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('docTitle');document.querySelectorAll('[data-i18n-aria]').forEach(e=>e.setAttribute('aria-label',t(e.dataset.i18nAria)));document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=t(e.dataset.i18n));document.querySelectorAll('[data-i18n-html]').forEach(e=>e.innerHTML=t(e.dataset.i18nHtml));document.querySelectorAll('#langToggle button').forEach(b=>{b.classList.toggle('active',b.dataset.lang===lang);b.setAttribute('aria-pressed',String(b.dataset.lang===lang));});langRefreshers.forEach(fn=>{try{fn(lang);}catch(e){console.error(e);}});}
function initLangToggle(){const box=document.getElementById('langToggle');if(!box)return;box.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.lang!==getLang())applyLang(b.dataset.lang);}));applyLang(getLang());}
document.addEventListener('DOMContentLoaded',initLangToggle);
