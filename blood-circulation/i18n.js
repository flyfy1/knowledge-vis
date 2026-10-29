'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "生物",
    stageBadge: "初中",
    foot: "血液循环 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '血液循环 · 一滴血的双环路线',
    pageTitle: '血液循环',
    tagline: '一滴血从左心室出发，先去全身再回心脏，再去肺里换气——两个环路接在同一颗心脏上，红和蓝只代表含氧量多少。',
    nav0: '0 一滴血的路线', nav1: '1 心脏四个腔', nav2: '2 三种血管', nav3: '3 血压从哪来', nav4: '4 运动时去哪了', nav5: '5 收束',
    unitBpm: '次/分', unitMl: 'mL', unitLmin: 'L/min', unitMmHg: 'mmHg', unitS: 's', unitCm2: 'cm²', unitCms: 'cm/s',
    lblArt: '去往动脉', lblVeinIn: '来自静脉', lblHeart: '心脏', lblLungs: '肺', lblBody: '全身', chRA: '右心房', chRV: '右心室', chLA: '左心房', chLV: '左心室',
    s2areaLbl: '总横截面积 A (cm²)', s2velLbl: '流速 v (cm/s)',
    seg0: '左心室 → 主动脉', seg1: '动脉', seg2: '全身毛细血管（交换氧气）', seg3: '静脉', seg4: '上下腔静脉', seg5: '右心房 → 右心室', seg6: '肺动脉', seg7: '去往肺部', seg8: '肺毛细血管（换气）', seg9: '肺静脉', seg10: '左心房 → 左心室',
    vAorta: '主动脉', vArt: '动脉', vArtl: '小动脉', vCap: '毛细血管', vVenl: '小静脉', vVein: '静脉', vVc: '腔静脉',
    organBrain: '脑', organHeart: '心脏', organMuscle: '骨骼肌', organGut: '消化道', organKidney: '肾', organSkin: '皮肤等',
    s0k: '第 0 步 · 一滴血的路线',
    s0t: '一滴血离开左心室后，要走哪两圈才回到原地？',
    s0e: '这一步要回答：血液在体内走的是一条怎样的路线？人的血液循环是<strong>两个环</strong>：<strong>体循环</strong>——左心室把血泵出，经动脉到全身毛细血管送出氧气，再经静脉回到右心房；<strong>肺循环</strong>——右心室把血泵向肺，在肺毛细血管里吸进氧气，再经肺静脉回到左心房。图上颜色表示血液含氧量：红 = 含氧多，蓝紫 = 含氧少，这只是画法，真实血管里的血都是红色。按「播放」，看小圆点走完一圈，颜色在哪里变。',
    s0stage: '循环路线示意（不按真实比例）：顶部的环经过肺，底部的环经过全身；小圆点是一滴血，颜色是它此刻的含氧量',
    s0canvas: '血液循环示意图：一滴血从左心室出发，先经全身再回右心房，再经肺回左心房，颜色在毛细血管处改变',
    s0hr: '心率', s0play: '播放', s0pause: '暂停', s0next: '跳到下一段', s0reset: '回到起点',
    s0ro: '现在：{seg}；血液含氧量约 {sat}%（{col}）；已走完 {loops} 圈（体循环 + 肺循环 = 1 圈）。',
    s0red: '含氧多，画成红色', s0blue: '含氧少，画成蓝紫色', s0mid: '正在交换氧气，颜色渐变',
    s0result: '结论：血液先后经体循环和肺循环，回到左心室才算一圈；颜色在两处毛细血管变——全身变蓝（氧被组织取走）、肺里变红（吸进氧气）。条件：示意图；真实一圈约需 1 分钟，本页加快约 10 倍，且「肺动脉含氧少、肺静脉含氧多」是按血流方向命名的。',
    s1k: '第 1 步 · 心脏四个腔',
    s1t: '心脏为什么要分成四个腔，还要有瓣膜？',
    s1e: '这一步要回答：心脏一个心动周期里，四个腔和瓣膜依次做什么？上面两个是<strong>心房</strong>（收血），下面两个是<strong>心室</strong>（泵血）；心房与心室之间、心室与动脉之间的<strong>瓣膜</strong>像单向门，只让血往前走。拖「周期进度」或按播放：先心房收缩把血挤进心室，再心室收缩把血射入动脉，然后全部放松、血回流进来。心率越快，一分钟泵出的血越多：心输出量 = 每搏输出量 × 心率。',
    s1stage: '心脏示意：左半为右心（接体循环回血），右半为左心（接肺回血）；腔变小表示收缩，绿色瓣膜表示打开，红色表示关闭；播放时动画放慢约 4 倍',
    s1canvas: '心脏四腔示意图：随周期进度，心房和心室先后收缩，瓣膜单向开合',
    s1hr: '心率', s1ph: '周期进度', s1play: '播放', s1pause: '暂停',
    s1ro: '周期 {ph}%：{state}；心率 {hr} 次/分，每个周期约 {T} s；心输出量 = {sv} mL × {hr} = {co} L/min。',
    s1st0: '心房收缩，血被挤进心室（房室瓣开、动脉瓣关）',
    s1st1: '心室收缩，血射入动脉（房室瓣关、动脉瓣开）',
    s1st2: '全部放松，血流回心房和心室（房室瓣开、动脉瓣关）',
    s1result: '结论：瓣膜让血液只能单向流动，心房和心室接力收缩；心输出量 = 每搏输出量 × 心率。条件：每搏输出量取 70 mL；三段时长按约 1/8、3/8、4/8 周期示意，实际随心率会变。',
    s2k: '第 2 步 · 三种血管',
    s2t: '为什么血在毛细血管里流得最慢？',
    s2e: '这一步要回答：同样一股血流，经过不同的血管，流速怎么变？血流量 Q（每分钟流过的血量）在整条回路里各处都相同，血管的<strong>总横截面积</strong> A 越大，流速 v = Q ÷ A 越小。从主动脉到毛细血管，分支越来越多，总面积增大约 1000 倍以上，所以毛细血管里血流最慢，有时间交换物质。选一段血管，拖心输出量，看流速怎么变。',
    s2stage: '上：各段血管的总横截面积（对数刻度）；下：对应的血流速度（对数刻度）；橙色高亮是选中的那段',
    s2canvas: '各段血管的总横截面积与血流速度：面积越大流速越小，毛细血管最慢',
    s2seg: '选一段血管', s2q: '心输出量 Q',
    s2ro: '{name}：总横截面积约 {a} cm²，Q = {q} L/min = {qs} cm³/s，流速 v = Q ÷ A ≈ {v} cm/s。',
    s2result: '结论：流速与总横截面积成反比（连续性方程），毛细血管总面积最大、流速最慢。条件：面积数值是常见教材的近似值；血液当作不可压缩液体，忽略脉动。',
    s3k: '第 3 步 · 血压从哪来',
    s3t: '血压是怎么由心脏和血管共同决定的？',
    s3e: '这一步要回答：血压的高低由哪几样东西决定？<strong>血压</strong>是血液对血管壁的压强（单位 mmHg）。心脏每分钟泵出的血量（心输出量 CO）越大、全身小血管对血流的阻力 R 越大，平均血压越高：平均动脉压 ≈ CO × R。每次心跳时压力上升到<strong>收缩压</strong>、回落到<strong>舒张压</strong>。调心率、每搏输出量、血管阻力，看波形和数字。',
    s3stage: '血压波形（教学示意）：横轴时间（2 s），纵轴压力（mmHg）；上沿是收缩压，下沿是舒张压，虚线是平均动脉压',
    s3canvas: '动脉血压波形：随心率、每搏输出量和血管阻力改变而变化',
    s3hr: '心率', s3sv: '每搏输出量', s3r: '外周阻力 R',
    s3ro: '心输出量 CO = {sv} mL × {hr} = {co} L/min；平均动脉压 MAP = CO × R = {co} × {r} = {map} mmHg；收缩压 / 舒张压 ≈ {sys} / {dia} mmHg。',
    s3result: '结论：CO 或 R 增大，血压升高；每搏输出量大则脉压（收缩压 − 舒张压）大。条件：教学模型，血管弹性常数取 1.5 mL/mmHg、R 的单位为 mmHg·min/L；仅用于理解原理，不能用来判断健康状况。',
    s4k: '第 4 步 · 运动时去哪了',
    s4t: '跑步时，心脏多泵出来的血都去了哪里？',
    s4e: '这一步要回答：运动时增加的心输出量怎样分配到各器官？静息时 5 L/min 的血流大致分给脑、心脏、肌肉、消化道、肾和皮肤；运动时心率加快、每搏输出量增大，总量最高可到约 20 L/min，而且大部分改道流向骨骼肌，消化道和肾的血流反而减少。拖运动强度，看各器官血流（L/min）的变化。',
    s4stage: '各器官的血流量（L/min）：柱子是当前值，竖线是静息时的值；右下读数给出心率与每搏输出量',
    s4canvas: '运动强度改变时，各器官血流量的分配：骨骼肌大幅增加，消化道和肾减少',
    s4e2: '运动强度',
    s4ro: '强度 {e}%：心率 {hr} 次/分，心输出量 {co} L/min（每搏 {sv} mL）；骨骼肌分到 {mu} L/min（占 {pct}%），静息时是 {mu0} L/min。',
    s4result: '结论：运动时总血流量增加，并重新分配到最需要氧气的肌肉。条件：数据为常见生理教材的近似值，强度线性插值；个体差异很大，本页不能用于评估运动能力。',
    s5k: '第 5 步 · 收束', s5t: '把血液循环说给别人听',
    s5e: '心脏是一个泵，左心室推动体循环，右心室推动肺循环，瓣膜让血只往一个方向走。',
    f1t: '路线', f1b: '体循环送氧、肺循环取氧，两个环接在同一颗心上（第 0 步）。',
    f2t: '泵与管', f2b: '瓣膜保证单向；血管总面积决定流速；CO × R 决定血压（第 1–3 步）。',
    f3t: '分配', f3b: '运动时总血流增加，并向肌肉重新分配（第 4 步）。',
    modelT: '模型实话',
    model1: '路线图、心腔和瓣膜都是示意；颜色只表示含氧量，真实血液始终是红色。',
    model2: '数值（面积、血流分配、弹性常数）取自常见教材的近似值，个体差异大。',
    model3: '血压波形是为教学画的近似曲线，本页不是医疗工具，也不能用来判断任何人的健康状况。',
    nextT: '继续看（站内）',
    l1: '压强 · 第 0 步：血压其实就是 p = F ÷ S 在血管壁上的压强',
    l2: '压强 · 第 2 步：液体里的压强随深度增加（p = ρgh）',
    l3: '细胞结构 · 第 0 步：氧气最终送到的地方——细胞'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Biology",
    stageBadge: "Junior High",
    foot: "Blood Circulation · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Blood Circulation · A Drop of Blood and Its Double Loop',
    pageTitle: 'Blood Circulation',
    tagline: 'A drop of blood leaves the left ventricle, visits the whole body, returns to the heart, then goes to the lungs — two loops on one heart, with red and blue showing only oxygen content.',
    nav0: '0 One drop’s route', nav1: '1 Four chambers', nav2: '2 Three vessels', nav3: '3 Where pressure comes from', nav4: '4 During exercise', nav5: '5 Recap',
    unitBpm: 'beats/min', unitMl: 'mL', unitLmin: 'L/min', unitMmHg: 'mmHg', unitS: 's', unitCm2: 'cm²', unitCms: 'cm/s',
    lblArt: 'to artery', lblVeinIn: 'from veins', lblHeart: 'Heart', lblLungs: 'Lungs', lblBody: 'Body', chRA: 'Right atrium', chRV: 'Right ventricle', chLA: 'Left atrium', chLV: 'Left ventricle',
    s2areaLbl: 'Total cross-section A (cm²)', s2velLbl: 'Speed v (cm/s)',
    seg0: 'Left ventricle → aorta', seg1: 'Arteries', seg2: 'Body capillaries (oxygen exchange)', seg3: 'Veins', seg4: 'Venae cavae', seg5: 'Right atrium → right ventricle', seg6: 'Pulmonary artery', seg7: 'On the way to the lungs', seg8: 'Lung capillaries (gas exchange)', seg9: 'Pulmonary veins', seg10: 'Left atrium → left ventricle',
    vAorta: 'Aorta', vArt: 'Arteries', vArtl: 'Arterioles', vCap: 'Capillaries', vVenl: 'Venules', vVein: 'Veins', vVc: 'Venae cavae',
    organBrain: 'Brain', organHeart: 'Heart', organMuscle: 'Skeletal muscle', organGut: 'Gut', organKidney: 'Kidneys', organSkin: 'Skin & other',
    s0k: 'Step 0 · One drop’s route',
    s0t: 'After leaving the left ventricle, which two loops does a drop of blood travel before it is back where it started?',
    s0e: 'This step asks: what route does blood take through the body? Human circulation is <strong>two loops</strong>: the <strong>systemic loop</strong> — the left ventricle pumps blood out through arteries to capillaries all over the body, where it gives up oxygen, and veins return it to the right atrium; and the <strong>pulmonary loop</strong> — the right ventricle pumps blood to the lungs, where capillaries take up oxygen, and pulmonary veins return it to the left atrium. Colour shows oxygen content: red = rich, blue-purple = poor — that is only a drawing convention, real blood is always red. Press “Play” and watch the dot make a full circuit and where its colour changes.',
    s0stage: 'Route diagram (not to scale): the top loop passes through the lungs, the bottom loop through the body; the dot is one drop of blood, its colour its oxygen content right now',
    s0canvas: 'Circulation diagram: a drop leaves the left ventricle, goes through the body to the right atrium, then through the lungs to the left atrium, changing colour in the capillaries',
    s0hr: 'Heart rate', s0play: 'Play', s0pause: 'Pause', s0next: 'Skip to next section', s0reset: 'Back to the start',
    s0ro: 'Now: {seg}; blood oxygen about {sat}% ({col}); {loops} full circuits done (systemic + pulmonary = 1 circuit).',
    s0red: 'oxygen-rich, drawn red', s0blue: 'oxygen-poor, drawn blue-purple', s0mid: 'exchanging oxygen, colour changing',
    s0result: 'Takeaway: blood passes through the systemic and pulmonary loops and a circuit ends back at the left ventricle; the colour changes at two capillary beds — blue in the body (tissues take the oxygen), red in the lungs (oxygen taken up). Holds for this schematic; a real circuit takes about a minute (sped up roughly 10× here), and “pulmonary artery carries oxygen-poor blood” follows from naming by flow direction.',
    s1k: 'Step 1 · Four chambers',
    s1t: 'Why is the heart split into four chambers with valves?',
    s1e: 'This step asks: in one heartbeat cycle, what do the four chambers and the valves do in turn? The top two are <strong>atria</strong> (they receive blood), the bottom two are <strong>ventricles</strong> (they pump); <strong>valves</strong> between atria and ventricles and between ventricles and arteries act like one-way doors. Drag “cycle progress” or press play: first the atria squeeze blood into the ventricles, then the ventricles squeeze it into the arteries, then everything relaxes and refills. A faster rate pumps more per minute: cardiac output = stroke volume × heart rate.',
    s1stage: 'Heart sketch: the left half is the right heart (receives body blood), the right half is the left heart (receives lung blood); a smaller chamber means squeezing, green valves are open, red ones closed; playback is slowed about 4×',
    s1canvas: 'A four-chamber heart sketch: atria then ventricles squeeze in turn and valves open one way as the cycle advances',
    s1hr: 'Heart rate', s1ph: 'Cycle progress', s1play: 'Play', s1pause: 'Pause',
    s1ro: 'Cycle {ph}%: {state}; heart rate {hr} beats/min, about {T} s per cycle; cardiac output = {sv} mL × {hr} = {co} L/min.',
    s1st0: 'atria squeeze, pushing blood into the ventricles (valves between them open, artery valves shut)',
    s1st1: 'ventricles squeeze, shooting blood into the arteries (valves between chambers shut, artery valves open)',
    s1st2: 'everything relaxes and blood refills atria and ventricles (valves between chambers open, artery valves shut)',
    s1result: 'Takeaway: valves force one-way flow and atria and ventricles squeeze in relay; cardiac output = stroke volume × heart rate. Holds with stroke volume 70 mL; the three phases are drawn as about 1/8, 3/8 and 4/8 of the cycle, while real timing shifts with heart rate.',
    s2k: 'Step 2 · Three vessels',
    s2t: 'Why does blood flow slowest in the capillaries?',
    s2e: 'This step asks: for the same stream of blood, how does speed change from vessel to vessel? The flow Q (blood per minute) is the same all around the circuit, and the more <strong>total cross-section</strong> A the vessels add up to, the lower the speed v = Q ÷ A. From aorta to capillaries the vessels branch so much that the total area grows more than a thousand times, so capillary flow is slowest — leaving time to exchange material. Pick a vessel segment, drag the cardiac output, and watch the speeds.',
    s2stage: 'Top: total cross-sectional area of each segment (log scale); bottom: blood speed in each (log scale); the orange highlight is the chosen segment',
    s2canvas: 'Total cross-sectional area and blood speed per segment: the bigger the area, the slower the flow, slowest in capillaries',
    s2seg: 'Pick a vessel type', s2q: 'Cardiac output Q',
    s2ro: '{name}: total cross-section about {a} cm², Q = {q} L/min = {qs} cm³/s, speed v = Q ÷ A ≈ {v} cm/s.',
    s2result: 'Takeaway: speed is inversely proportional to total cross-sectional area (the continuity equation); capillaries have the biggest total area and the slowest flow. Areas are approximate textbook values; blood is treated as an incompressible fluid and the pulsing is ignored.',
    s3k: 'Step 3 · Where pressure comes from',
    s3t: 'How do the heart and the vessels together set blood pressure?',
    s3e: 'This step asks: what decides how high blood pressure is? <strong>Blood pressure</strong> is the pressure of blood on vessel walls (in mmHg). The more blood the heart pumps per minute (cardiac output, CO) and the more the small vessels resist flow (resistance R), the higher the average pressure: mean arterial pressure ≈ CO × R. With each beat the pressure rises to the <strong>systolic</strong> value and falls to the <strong>diastolic</strong> one. Change the heart rate, stroke volume and resistance to see the waveform and the numbers move.',
    s3stage: 'Blood pressure waveform (teaching sketch): x time (2 s), y pressure (mmHg); the top is systolic, the bottom diastolic, the dashed line is mean arterial pressure',
    s3canvas: 'Arterial pressure waveform changing with heart rate, stroke volume and vessel resistance',
    s3hr: 'Heart rate', s3sv: 'Stroke volume', s3r: 'Peripheral resistance R',
    s3ro: 'Cardiac output CO = {sv} mL × {hr} = {co} L/min; mean arterial pressure MAP = CO × R = {co} × {r} = {map} mmHg; systolic / diastolic ≈ {sys} / {dia} mmHg.',
    s3result: 'Takeaway: raise CO or R and pressure rises; a larger stroke volume widens the pulse pressure (systolic − diastolic). Holds in this teaching model with arterial compliance 1.5 mL/mmHg and R in mmHg·min/L; it is for understanding principles, not for judging anyone’s health.',
    s4k: 'Step 4 · During exercise',
    s4t: 'When you run, where does the extra blood from the heart go?',
    s4e: 'This step asks: how is the extra cardiac output shared among organs during exercise? At rest 5 L/min is divided roughly among brain, heart, muscle, gut, kidneys and skin; in exercise the heart rate and stroke volume rise, the total can reach about 20 L/min, and most of it is redirected to skeletal muscle while gut and kidney flow actually drops. Drag the exercise intensity and watch each organ’s flow (L/min).',
    s4stage: 'Blood flow to each organ (L/min): the bar is the current value, the tick is the resting value; the readout gives heart rate and stroke volume',
    s4canvas: 'How exercise intensity changes each organ’s share of blood flow: muscle rises sharply, gut and kidneys fall',
    s4e2: 'Exercise intensity',
    s4ro: 'Intensity {e}%: heart rate {hr} beats/min, cardiac output {co} L/min (stroke volume {sv} mL); skeletal muscle gets {mu} L/min ({pct}%), versus {mu0} L/min at rest.',
    s4result: 'Takeaway: exercise raises total flow and redistributes it to the muscles that need oxygen. Holds with approximate textbook values interpolated linearly with intensity; individuals differ a lot and this page cannot assess anyone’s fitness.',
    s5k: 'Step 5 · Recap', s5t: 'Explain blood circulation to a friend',
    s5e: 'The heart is a pump: the left ventricle drives the systemic loop, the right ventricle the pulmonary loop, and valves keep the blood going one way.',
    f1t: 'The route', f1b: 'The systemic loop delivers oxygen, the pulmonary loop collects it; two loops share one heart (step 0).',
    f2t: 'Pump and pipes', f2b: 'Valves enforce one-way flow; total vessel area sets speed; CO × R sets pressure (steps 1–3).',
    f3t: 'Sharing', f3b: 'In exercise total flow rises and is redirected to muscle (step 4).',
    modelT: 'Honest model notes',
    model1: 'The route map, chambers and valves are sketches; colour shows oxygen content only — real blood is always red.',
    model2: 'Numbers (areas, flow shares, compliance) are approximate textbook values and vary widely between people.',
    model3: 'The pressure waveform is a teaching curve; this page is not a medical tool and cannot judge anyone’s health.',
    nextT: 'Keep going (on this site)',
    l1: 'Pressure · step 0: blood pressure is just p = F ÷ S on the vessel wall',
    l2: 'Pressure · step 2: pressure inside a liquid grows with depth (p = ρgh)',
    l3: 'Cell Structure · step 0: where the oxygen finally goes — the cells'
  }
};
let currentLang = null;
function getLang() {
  if (currentLang) return currentLang;
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'zh' || saved === 'en') return currentLang = saved;
  } catch (e) { /* in-memory fallback */ }
  return currentLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
function t(key, params) {
  const p = params || {};
  return STR[getLang()][key].replace(/\{(\w+)\}/g, (_, n) => String(p[n]));
}
function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('knowledge-lang', lang); } catch (e) { /* keep currentLang */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(el => {
    const on = el.dataset.lang === lang;
    el.classList.toggle('active', on);
    el.setAttribute('aria-pressed', String(on));
  });
  if (typeof window.onLang === 'function') window.onLang();
}
getLang();
if (typeof module !== 'undefined') module.exports = { STR };
