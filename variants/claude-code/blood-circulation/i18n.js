'use strict';
// Blood circulation (Claude Code edition) strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en; every number written here is pinned by tests/core.cjs.

const STRINGS = {
  zh: {
    pageTitle: '血液循环 · 一颗心，两条路',
    back: '← 知识索引',
    compare: '对照另一版本：血液循环 →',
    navLabel: '血液循环步骤导航',
    tagline: '你身上大约有 5 升血，它们一刻不停地在流。血从哪里出发、走哪条路、多久转一圈？心脏怎样保证血只往前走？身体用氧多了，血又怎样跟上？六步里，你跟着一滴血走一遍，再亲手调心跳、血流和用氧量，看数字怎样变化。所有数字都是教科书近似值，只用来理解原理，不能用来判断健康。',
    nav0: '0 一滴血的路线', nav1: '1 四个腔四扇门', nav2: '2 每分钟泵多少', nav3: '3 粗细与快慢', nav4: '4 送氧够不够', nav5: '5 收束',

    s0k: '第 0 步 · 一滴血的路线',
    s0t: '从左心室出发，一滴血要走哪两圈才回到原地？',
    s0e: '这一步要回答：一滴血离开心脏后，走过哪些地方、按什么顺序、多久才回来？心脏分左右两半，各有一个<strong>心房</strong>（接收回来的血）和一个<strong>心室</strong>（把血泵出去）。从左心室出发，血经<strong>动脉</strong>（离开心脏的血管）流到全身，在<strong>毛细血管</strong>（最细、管壁只有一层细胞的血管）里把氧交给身体细胞，再经<strong>静脉</strong>（流回心脏的血管）回到右心房，这一圈叫<strong>体循环</strong>。接着右心室把血送到肺，在肺的毛细血管里重新装上氧，回到左心房、左心室，这一圈叫<strong>肺循环</strong>。图中红色表示含氧多（含氧饱和度约 98%），蓝紫色表示含氧少（约 74%）；颜色只代表含氧多少，真实的血都是红色，只是深浅不同。',
    play: '播放', pause: '暂停', next0: '跳到下一段', reset0: '回到起点', real0: '按真实时间比例走',
    lgRich: '含氧多的血', lgPoor: '含氧少的血', s0lgDrop: '跟踪的那一滴血', s0lgTrail: '这一圈走过的路',
    lungs: '肺', body: '全身', ra: '右心房', rv: '右心室', la: '左心房', lv: '左心室', pa: '肺动脉', ao: '主动脉',
    c0: '血液循环路线示意（上：肺，下：全身）',
    seg_LV: '左心室', seg_artery: '主动脉与动脉', seg_bodyCap: '全身的毛细血管', seg_vein: '静脉与上下腔静脉', seg_RA: '右心房', seg_RV: '右心室', seg_lungArt: '肺动脉', seg_lungCap: '肺里的毛细血管', seg_lungVein: '肺静脉', seg_LA: '左心房',
    segd_LV: '左心室收缩，把血压进主动脉。', segd_artery: '血被送往全身各处。', segd_bodyCap: '氧气透过管壁交给身体细胞，二氧化碳进入血液。', segd_vein: '含氧少的血慢慢流回心脏。', segd_RA: '右心房接收全身流回的血。', segd_RV: '右心室把血压向肺。', segd_lungArt: '血被送往肺，注意它里面是含氧少的血。', segd_lungCap: '血在肺泡旁放出二氧化碳、装上氧气。', segd_lungVein: '含氧多的血流回心脏，注意它是静脉却装着含氧多的血。', segd_LA: '左心房接收从肺回来的血，再送进左心室。',
    s0readout: '第 {n}/10 段：{name}。{desc}现在含氧饱和度约 {sat}%。真实情况下，血在这一段大约停留 {sec} 秒。已走完 {loops} 圈。',
    s0mode: '（动画：{mode}）', modeEqual: '每段等时，便于看清', modeReal: '按真实时间比例，加快 10 倍',
    s0hint: '观察顺序：先按「播放」看一整圈：小白点在全身的毛细血管里由红变蓝紫，在肺的毛细血管里又变回红色，走过的路留下轨迹。再用「跳到下一段」一段一段读：动脉不一定装含氧多的血（肺动脉就装含氧少的），名字只看血流方向。最后打开「按真实时间比例走」：走一整圈约 59.5 秒（约 1 分钟），其中体循环约 50.6 秒、肺循环只要约 5.4 秒；光是在静脉里就要花 38.7 秒，因为全身大约三分之二的血都在静脉里。',

    s1k: '第 1 步 · 四个腔四扇门',
    s1t: '心脏一缩一舒，凭什么血只往前、不倒流？',
    s1e: '这一步要回答：心脏挤压时，血为什么不倒流回去？关键是四扇只朝一个方向开的门，叫<strong>瓣膜</strong>：心房和心室之间各有一扇（右边叫三尖瓣、左边叫二尖瓣），心室出口各有一扇（肺动脉瓣、主动脉瓣）。门两边谁的压力大，就往哪边推，而门只能朝前开，所以血只能往前走。一次心跳分五段：心房收缩 → 心室开始收缩（四扇门全关）→ 心室把血射出 → 心室开始舒张（四扇门又全关）→ 心室充盈。下图是左心室里的血量；每次心跳射出的血叫<strong>每搏输出量</strong>，这里是 120 − 50 = 70 mL。',
    phaseSlider: '一次心跳中的位置', leak1: '让二尖瓣关不严（每次倒流 30%）',
    lgOpen: '门开着', lgShut: '门关着', lgFlow: '血流方向', lgLeak: '倒流（二尖瓣关不严时）',
    c1top: '心脏四个腔与四扇门（示意）', c1bot: '左心室里的血量（mL）与一次心跳中的时间（秒）',
    ph_atrial: '心房收缩', ph_isoContract: '心室开始收缩，四扇门全关', ph_eject: '心室射血', ph_isoRelax: '心室开始舒张，四扇门全关', ph_fill: '心室充盈',
    phd_atrial: '心房把最后一点血挤进心室。', phd_isoContract: '心室压力在升高，但还没超过动脉，出口门还推不开；入口门已被关上。', phd_eject: '心室压力超过动脉，出口门被推开，血射出去。', phd_isoRelax: '心室放松、压力下降，出口门被动脉里的血压回去关上；入口门还没开。', phd_fill: '心室压力低于心房，入口门打开，血从心房流进心室。',
    open: '开着', shut: '关着',
    s1readout: '这次心跳的 {pct}%（第 {ms} 毫秒，心率 72 次/分时一拍约 833 毫秒）：{name}。{desc}心房与心室之间的门{av}，心室出口的门{semi}。左心室里现在有 {vol} mL 血。',
    s1normal: '每次向前射出 70 mL，乘以每分钟 72 拍 = 每分钟 5.04 升。',
    s1leak: '二尖瓣关不严：每次射出的 70 mL 里有 21 mL 倒流回左心房，真正向前送出的只有 49 mL，每分钟只有 3.53 升。',
    s1hint: '观察顺序：按「播放」（放慢约 4 倍），盯住上图四扇门的颜色和下图的白色竖线：两段「四扇门全关」时，左心室血量是平的（门全关，血进不来也出不去）；射血段血量从 120 mL 降到 50 mL。拖动滑杆会暂停播放。再打开「让二尖瓣关不严」：射血时有紫色箭头倒流回左心房，向前送出的血从每次 70 mL 降到 49 mL。',

    s2k: '第 2 步 · 每分钟泵多少',
    s2t: '心脏一分钟泵出多少血？多久能把全身的血泵一遍？',
    s2e: '这一步要回答：心脏每分钟泵出多少血，和全身的血量比起来有多少？每分钟泵出的血叫<strong>心输出量</strong> = 每搏输出量 × 心率（每分钟心跳次数）。上一步的 70 mL × 72 次/分 = 每分钟 5040 mL，约 5 升，差不多就是全身的血量。图里的台阶是一分钟内泵出的血一拍一拍累加起来的总量，灰色虚线是全身血量 5 升。',
    hrSlider: '心率（次/分）', svSlider: '每搏输出量（mL）', rest2: '安静时（72 次/分、70 mL）', run2: '把这一分钟播放一遍',
    c2: '一分钟内累计泵出的血量（升）与时间（秒）',
    s2lgNow: '当前设置的累计泵血量', s2lgOld: '之前试过的设置', s2lgAll: '全身血量 5 升', s2lgHit: '累计达到 5 升的那一拍',
    s2readout: '心率 {hr} 次/分 × 每搏 {sv} mL = 心输出量每分钟 {co} 升。第 {beat} 拍（第 {sec} 秒）时累计泵出的血达到 5 升；平均来说全身的血约 {trip} 秒流过心脏一次。照这样一天泵出约 {day} 升。',
    s2late: '这一拍已在图中一分钟之外：这个设置下一分钟泵不完全身的血。',
    s2progress: '播放中：第 {s} / 60 秒。',
    s2hint: '观察顺序：先按「安静时」：第 72 拍（第 59.2 秒）时累计正好达到 5 升，所以安静时血大约一分钟循环一圈，一天要泵约 7258 升。再把心率拖到 150、每搏拖到 100 mL（像剧烈运动时）：台阶又陡又密，心输出量 15 升，第 50 拍（第 19.6 秒）就达到 5 升。淡色台阶是你试过的设置。',

    s3k: '第 3 步 · 粗细与快慢',
    s3t: '血在哪里流得最慢？为什么这反而是好事？',
    s3e: '这一步要回答：同样多的血流过不同的血管，哪里快、哪里慢？想象一条河：河面窄的地方水流急，河面宽的地方水流缓。血管也一样，但要看的不是一根血管有多粗，而是<strong>总横截面积</strong>：把这一类血管全部并排切开、所有切口面积加起来。每秒流过的血量（流量）处处相同，所以 流速 = 流量 ÷ 总横截面积。一根毛细血管极细，但全身有几十亿根，加起来的总面积是主动脉的几百倍，所以血在这里流得最慢。上图是各类血管的总横截面积，下图是血在其中的平均流速，两图纵轴都是对数刻度（每往上一格乘 10）。',
    pickStation: '选择血管', aorta: '主动脉', arteries: '动脉', capillaries: '毛细血管', veins: '静脉', cavae: '上下腔静脉',
    coSlider: '心输出量（升/分）', sh_aorta: '主动脉', sh_arteries: '动脉', sh_capillaries: '毛细', sh_veins: '静脉', sh_cavae: '腔静脉', rowSent: '送来', rowUse: '要用',
    c3top: '总横截面积（cm²，对数纵轴）', c3bot: '平均流速（cm/s，对数纵轴）',
    s3lgArea: '总横截面积', s3lgSpeed: '平均流速', s3lgRest: '安静时（5 升/分）的流速', s3lgPick: '选中的血管',
    s3readout: '心输出量 {q} 升/分 = 每秒 {flow} cm³。{name}的总横截面积约 {area} cm²，平均流速 = {flow} ÷ {area} = {v} cm/s（每秒 {mm} 毫米）。',
    s3cap: '一根毛细血管约 1 毫米长，血走完它约需 {tt} 秒，这段时间就用来交换氧气和养料。',
    s3hint: '观察顺序：先保持 5 升/分，依次点五类血管：主动脉流速 27.8 cm/s，毛细血管只有 0.033 cm/s，慢了约 833 倍，血走过 1 毫米长的毛细血管约要 3 秒，正好有时间交换物质。再把心输出量拖到 20 升/分（剧烈运动）：所有流速等比例变成 4 倍，毛细血管里只剩约 0.75 秒。灰色框是安静时的流速，用来对照。',

    s4k: '第 4 步 · 送氧够不够',
    s4t: '身体用氧多了 10 倍，血要怎样跟上？',
    s4e: '这一步要回答：身体细胞（尤其是肌肉）用氧多了，血怎样送来足够的氧？细胞在<a class="xlink" href="../../../biology/cells/cell-structure/#step2">线粒体（→ 细胞结构页第 2 步）</a>里用氧释放能量。每升含氧多的血约带 200 mL 氧。每分钟送来的氧 = 心输出量 × 200 mL/L；身体每分钟用掉的氧从流过的血里取走，取走的比例叫<strong>摄氧比例</strong>，剩下的随静脉血流回心脏。按教学模型，身体最多只能从血里取走约 80% 的氧。上图是一段毛细血管：左端流进含氧多的血，右端流出时的颜色由剩下的氧决定；下图比较「送来的氧」和「要用的氧」。',
    pre4a: '安静坐着', pre4b: '快步走', pre4c: '剧烈运动',
    useSlider: '身体每分钟用氧（mL/分）', co4Slider: '心输出量（升/分）',
    c4top: '一段毛细血管：从左流进，向右流出（示意）', c4bot: '每分钟的氧（mL）：送来的、要用的',
    s4lgTube: '血的颜色 = 剩下多少氧', s4lgO2: '交给细胞的氧', s4lgSent: '每分钟送来的氧', s4lgUse: '每分钟要用的氧', s4lgMax: '最多能取走的 80%',
    tissue: '身体细胞', inLabel: '流进', outLabel: '流出',
    s4readout: '心输出量 {co} 升/分 × 200 mL/L = 每分钟送来 {sent} mL 氧；身体每分钟要用 {use} mL，摄氧比例 {ext}%。',
    s4ok: '够用：流出的静脉血还剩约 {ven}% 的含氧饱和度。',
    s4short: '不够用：即使取走 80%，每分钟还差 {gap} mL，静脉血只剩约 {ven}%。至少需要心输出量 {min} 升/分。',
    s4hint: '观察顺序：先按「安静坐着」：每分钟送来 1008 mL 氧、只用 250 mL，摄氧 24.8%，流出的血还剩约 73.7%，毛细血管右端仍偏红。再只把用氧拖到 2000 mL（心输出量不动）：需要的超过送来的 80%，读数提示至少要 12.5 升/分。按「快步走」「剧烈运动」：心输出量变大的同时摄氧比例升高（50%、62.5%），右端颜色变深——身体靠「送得更多」和「取得更多」两招一起跟上。',
    quizPrompt: '小测：剧烈运动时肌肉用氧大增，心输出量为什么必须跟着变大？',
    quizA: '因为运动时每升血里的氧会自动多 10 倍', quizB: '因为每升血最多只能取走约 80% 的氧，只能靠每分钟送来更多升的血', quizC: '因为心跳快了，静脉血就会重新变红',
    check: '检查答案',
    correct: '对。每升血带的氧几乎是固定的（约 200 mL），能取走的比例也有上限，所以用氧再多，只能靠提高心输出量（心跳更快、每搏更多）来送更多升的血。用氧 2000 mL/分时，至少要 12.5 升/分。',
    wrong: '再看一下：每升含氧多的血约带 200 mL 氧，这个数运动时基本不变。把用氧拖到 2000 mL、心输出量留在 5.04 升/分，读数会提示不够用，至少要 12.5 升/分。',

    s5k: '第 5 步 · 收束',
    s5t: '一句话说清血液循环',
    s5fin: '<strong>路线</strong>：一颗心脏接着两条环路——体循环（左心室 → 动脉 → 全身毛细血管 → 静脉 → 右心房）把氧送到全身，肺循环（右心室 → 肺动脉 → 肺毛细血管 → 肺静脉 → 左心房）把氧装回来；红和蓝只代表含氧多少。<strong>动力和方向</strong>：心室收缩提供推力，四扇单向的瓣膜保证血只往前走。<strong>快慢和交换</strong>：心输出量 = 每搏输出量 × 心率，安静时约每分钟 5 升、约一分钟循环一圈；毛细血管总面积最大、流得最慢，正好用来交换；用氧增加时，心脏送得更多，身体也取得更多。',
    formula: '心输出量 = 每搏输出量 × 心率\n流速 = 流量 ÷ 总横截面积\n送来的氧 = 心输出量 × 200 mL/L',
    boundary: '模型边界：路线图、心脏结构和颜色都是示意；各段血量、血管面积、每升血带氧量、最多取走 80% 等都是教科书近似值，真实的人差别很大。心跳各阶段的比例和左心室血量曲线是简化的教学曲线；没有画出冠状动脉、淋巴、血压和心音。这些数字只用来理解原理，不能用来判断自己或别人的健康。',
    linksTitle: '接着去哪',
    lk1: '→ 细胞结构页第 2 步：线粒体用氧释放能量，所以身体需要血不停送氧',
    lk2: '→ 光合作用页第 1 步：我们吸进的氧从哪里来',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《血液循环》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Blood Circulation”.',
  },
  en: {
    pageTitle: 'Blood Circulation · One Heart, Two Loops',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Blood Circulation →',
    navLabel: 'Blood circulation steps',
    tagline: 'There are about 5 litres of blood in your body, and it never stops moving. Where does it start, which way does it go, and how long does one lap take? How does the heart make sure blood only moves forward? And when your body needs more oxygen, how does the blood keep up? In six steps you will follow one drop of blood, then tune heart rate, blood flow and oxygen use yourself and watch the numbers change. All numbers are textbook approximations for understanding the idea, never for judging anyone’s health.',
    nav0: '0 One drop’s route', nav1: '1 Four rooms, four doors', nav2: '2 Litres per minute', nav3: '3 Width and speed', nav4: '4 Enough oxygen?', nav5: '5 Wrap-up',

    s0k: 'STEP 0 · ONE DROP’S ROUTE',
    s0t: 'Starting from the left ventricle, which two loops does a drop travel before it is back?',
    s0e: 'This step answers: after a drop of blood leaves the heart, where does it go, in what order, and how long until it returns? The heart has a left and a right half, each with an <strong>atrium</strong> (which receives returning blood) and a <strong>ventricle</strong> (which pumps blood out). From the left ventricle, blood travels through <strong>arteries</strong> (vessels carrying blood away from the heart) to the whole body, hands oxygen to the body’s cells in the <strong>capillaries</strong> (the thinnest vessels, with walls one cell thick), then returns through <strong>veins</strong> (vessels carrying blood back to the heart) to the right atrium. That loop is the <strong>systemic circulation</strong>. Next the right ventricle sends the blood to the lungs, where lung capillaries load it with oxygen again, and it returns to the left atrium and left ventricle. That loop is the <strong>pulmonary circulation</strong>. In the picture, red means oxygen-rich (about 98% saturated) and blue-violet means oxygen-poor (about 74%). The colours show only oxygen content: real blood is always red, just lighter or darker. In the picture RA and RV are the right atrium and ventricle, LA and LV the left ones.',
    play: 'Play', pause: 'Pause', next0: 'Jump to next stretch', reset0: 'Back to start', real0: 'Move in true time proportions',
    lgRich: 'Oxygen-rich blood', lgPoor: 'Oxygen-poor blood', s0lgDrop: 'The drop we follow', s0lgTrail: 'Path covered this lap',
    lungs: 'Lungs', body: 'Body', ra: 'RA', rv: 'RV', la: 'LA', lv: 'LV', pa: 'Pulm. a.', ao: 'Aorta',
    c0: 'Circulation route, schematic (top: lungs, bottom: body)',
    seg_LV: 'the left ventricle', seg_artery: 'the aorta and arteries', seg_bodyCap: 'the body’s capillaries', seg_vein: 'the veins and venae cavae', seg_RA: 'the right atrium', seg_RV: 'the right ventricle', seg_lungArt: 'the pulmonary artery', seg_lungCap: 'the lung capillaries', seg_lungVein: 'the pulmonary veins', seg_LA: 'the left atrium',
    segd_LV: 'The left ventricle contracts and pushes blood into the aorta. ', segd_artery: 'Blood is carried out to every part of the body. ', segd_bodyCap: 'Oxygen passes through the thin wall to the body’s cells while carbon dioxide enters the blood. ', segd_vein: 'Oxygen-poor blood flows slowly back toward the heart. ', segd_RA: 'The right atrium receives blood returning from the body. ', segd_RV: 'The right ventricle pushes blood toward the lungs. ', segd_lungArt: 'Blood heads for the lungs; note that this artery carries oxygen-poor blood. ', segd_lungCap: 'Beside the air sacs, blood gives off carbon dioxide and picks up oxygen. ', segd_lungVein: 'Oxygen-rich blood returns to the heart; note that this vein carries oxygen-rich blood. ', segd_LA: 'The left atrium receives blood from the lungs and passes it to the left ventricle. ',
    s0readout: 'Stretch {n}/10: {name}. {desc}Oxygen saturation is now about {sat}%. In real life blood spends about {sec} s in this stretch. Laps completed: {loops}.',
    s0mode: '(animation: {mode})', modeEqual: 'equal time per stretch, easier to follow', modeReal: 'true time proportions, 10× faster',
    s0hint: 'What to watch: press “Play” for one full lap. The small white dot turns from red to blue-violet in the body’s capillaries and back to red in the lung capillaries, leaving a trail behind it. Then use “Jump to next stretch” to read the route one stretch at a time: an artery does not always carry oxygen-rich blood (the pulmonary artery carries oxygen-poor blood); the name only describes the direction of flow. Finally switch on “Move in true time proportions”: a full lap takes about 59.5 s (about 1 minute), with about 50.6 s in the systemic loop and only about 5.4 s in the pulmonary loop. The veins alone take 38.7 s, because about two thirds of all the blood sits in the veins.',

    s1k: 'STEP 1 · FOUR ROOMS, FOUR DOORS',
    s1t: 'The heart squeezes and relaxes. Why does blood only go forward and never back?',
    s1e: 'This step answers: when the heart squeezes, why does blood not flow backward? The key is four doors that open only one way, called <strong>valves</strong>: one between each atrium and its ventricle (the tricuspid valve on the right, the mitral valve on the left) and one at each ventricle’s exit (the pulmonary and aortic valves). Blood presses from the side with the higher pressure, and a door can only swing forward, so blood can only move forward. One heartbeat has five parts: atria contract → ventricles start to contract (all four doors shut) → ventricles eject blood → ventricles start to relax (all four doors shut again) → ventricles fill. The lower chart shows the volume of blood in the left ventricle; the amount ejected per beat is the <strong>stroke volume</strong>, here 120 − 50 = 70 mL.',
    phaseSlider: 'Point within one heartbeat', leak1: 'Make the mitral valve leak (30% flows back each beat)',
    lgOpen: 'Door open', lgShut: 'Door shut', lgFlow: 'Direction of flow', lgLeak: 'Backflow (leaky mitral valve)',
    c1top: 'The four chambers and four doors (schematic)', c1bot: 'Blood in the left ventricle (mL) vs time within one beat (s)',
    ph_atrial: 'atria contract', ph_isoContract: 'ventricles start to contract, all four doors shut', ph_eject: 'ventricles eject', ph_isoRelax: 'ventricles start to relax, all four doors shut', ph_fill: 'ventricles fill',
    phd_atrial: 'The atria squeeze the last bit of blood into the ventricles. ', phd_isoContract: 'Pressure in the ventricles is rising but not yet above the arteries, so the exit doors cannot open yet; the entry doors have been pushed shut. ', phd_eject: 'Ventricle pressure now beats the arteries, the exit doors swing open and blood shoots out. ', phd_isoRelax: 'The ventricles relax and their pressure drops, so blood in the arteries pushes the exit doors shut; the entry doors are not open yet. ', phd_fill: 'Ventricle pressure is below the atria, the entry doors open and blood flows from atria into ventricles. ',
    open: 'are open', shut: 'are shut',
    s1readout: '{pct}% of the way through the beat ({ms} ms in; at 72 beats per minute one beat lasts about 833 ms): {name}. {desc}The doors between atria and ventricles {av}; the ventricle exit doors {semi}. The left ventricle now holds {vol} mL of blood.',
    s1normal: 'Each beat sends 70 mL forward; times 72 beats per minute that is 5.04 litres per minute.',
    s1leak: 'Leaky mitral valve: of the 70 mL ejected each beat, 21 mL flows back into the left atrium, so only 49 mL goes forward, just 3.53 litres per minute.',
    s1hint: 'What to watch: press “Play” (slowed about 4×) and follow the door colours in the upper picture and the white vertical line in the lower chart. In both “all four doors shut” parts the left-ventricle volume stays flat (with every door shut, blood can neither enter nor leave); during ejection it drops from 120 mL to 50 mL. Dragging the slider pauses playback. Then switch on “Make the mitral valve leak”: during ejection a violet arrow shows blood flowing back into the left atrium, and the forward amount per beat falls from 70 mL to 49 mL.',

    s2k: 'STEP 2 · LITRES PER MINUTE',
    s2t: 'How much blood does the heart pump in a minute, and how long to pump all of it once?',
    s2e: 'This step answers: how much blood does the heart pump each minute, and how does that compare with all the blood in the body? The volume pumped per minute is the <strong>cardiac output</strong> = stroke volume × heart rate (beats per minute). From the last step, 70 mL × 72 beats per minute = 5040 mL per minute, about 5 litres, roughly the whole body’s blood. The staircase adds up the blood pumped beat by beat over one minute; the grey dashed line marks the body’s 5 litres.',
    hrSlider: 'Heart rate (beats/min)', svSlider: 'Stroke volume (mL)', rest2: 'At rest (72 beats/min, 70 mL)', run2: 'Play this minute through',
    c2: 'Blood pumped so far (litres) vs time (s) within one minute',
    s2lgNow: 'Total pumped at the current setting', s2lgOld: 'Settings tried before', s2lgAll: 'All the body’s blood, 5 litres', s2lgHit: 'The beat that reaches 5 litres',
    s2readout: '{hr} beats/min × {sv} mL per beat = cardiac output of {co} litres per minute. The pumped total reaches 5 litres at beat {beat} ({sec} s); on average the whole blood volume passes through the heart once every {trip} s. At this rate the heart pumps about {day} litres a day.',
    s2late: 'That beat falls beyond the one minute shown: at this setting the heart cannot pump all the blood within a minute.',
    s2progress: 'Playing: second {s} / 60.',
    s2hint: 'What to watch: press “At rest” first. The total reaches exactly 5 litres at beat 72 (59.2 s), so at rest the blood goes round about once a minute, and the heart pumps about 7258 litres a day. Then drag the heart rate to 150 and the stroke volume to 100 mL (as in hard exercise): the staircase becomes steep and dense, cardiac output is 15 litres, and 5 litres is reached by beat 50 (19.6 s). Faint staircases are settings you tried.',

    s3k: 'STEP 3 · WIDTH AND SPEED',
    s3t: 'Where does blood flow slowest, and why is that a good thing?',
    s3e: 'This step answers: the same amount of blood passes through every kind of vessel, so where is it fast and where is it slow? Think of a river: where it is narrow the water rushes, where it is wide the water slows down. Blood vessels work the same way, but what counts is not how wide one vessel is; it is the <strong>total cross-sectional area</strong>: cut every vessel of that kind side by side and add up all the cut faces. The flow (blood volume per second) is the same everywhere, so speed = flow ÷ total cross-sectional area. One capillary is tiny, but there are billions of them, and together their area is hundreds of times the aorta’s, so blood moves slowest there. The upper chart shows each vessel type’s total cross-sectional area and the lower chart the average speed; both vertical axes are logarithmic (each gridline up is ten times more).',
    pickStation: 'Choose a vessel type', aorta: 'Aorta', arteries: 'Arteries', capillaries: 'Capillaries', veins: 'Veins', cavae: 'Venae cavae',
    coSlider: 'Cardiac output (litres/min)', sh_aorta: 'Aorta', sh_arteries: 'Arter.', sh_capillaries: 'Capill.', sh_veins: 'Veins', sh_cavae: 'Cavae', rowSent: 'Sent', rowUse: 'Used',
    c3top: 'Total cross-sectional area (cm², log axis)', c3bot: 'Average speed (cm/s, log axis)',
    s3lgArea: 'Total cross-sectional area', s3lgSpeed: 'Average speed', s3lgRest: 'Speed at rest (5 litres/min)', s3lgPick: 'Selected vessel type',
    s3readout: 'Cardiac output {q} litres/min = {flow} cm³ per second. The total cross-sectional area of the {name} is about {area} cm², so average speed = {flow} ÷ {area} = {v} cm/s ({mm} mm per second).',
    s3cap: 'A capillary is about 1 mm long, so blood takes about {tt} s to pass through one; that is the time available for handing over oxygen and nutrients.',
    s3hint: 'What to watch: keep 5 litres/min and click the five vessel types in turn. Blood moves at 27.8 cm/s in the aorta but only 0.033 cm/s in the capillaries, about 833 times slower, so crossing a 1 mm capillary takes about 3 s, just enough time for exchange. Then drag cardiac output to 20 litres/min (hard exercise): every speed grows 4 times and the capillary crossing shrinks to about 0.75 s. Grey outlines show the resting speeds for comparison.',

    s4k: 'STEP 4 · ENOUGH OXYGEN?',
    s4t: 'Your body uses ten times more oxygen. How does the blood keep up?',
    s4e: 'This step answers: when the body’s cells (muscles above all) use more oxygen, how does the blood deliver enough? Cells release energy using oxygen in their <a class="xlink" href="../../../biology/cells/cell-structure/#step2">mitochondria (→ The Cell, step 2)</a>. Each litre of oxygen-rich blood carries about 200 mL of oxygen. Oxygen delivered per minute = cardiac output × 200 mL per litre. The oxygen the body uses each minute is taken from the passing blood; the share taken is the <strong>oxygen extraction</strong>, and whatever is left returns to the heart in the veins. In this teaching model the body can take at most about 80% of the oxygen out of the blood. The upper picture is a stretch of capillary: oxygen-rich blood enters on the left, and its colour on leaving at the right depends on how much oxygen is left. The lower chart compares oxygen delivered with oxygen needed.',
    pre4a: 'Sitting still', pre4b: 'Brisk walk', pre4c: 'Hard exercise',
    useSlider: 'Oxygen used by the body (mL/min)', co4Slider: 'Cardiac output (litres/min)',
    c4top: 'One capillary (schematic): blood flows left to right', c4bot: 'Oxygen per minute (mL): delivered vs needed',
    s4lgTube: 'Blood colour = oxygen left', s4lgO2: 'Oxygen handed to cells', s4lgSent: 'Oxygen delivered per minute', s4lgUse: 'Oxygen needed per minute', s4lgMax: 'The 80% that can be taken',
    tissue: 'Body cells', inLabel: 'in', outLabel: 'out',
    s4readout: 'Cardiac output {co} litres/min × 200 mL/L = {sent} mL of oxygen delivered per minute; the body needs {use} mL per minute, an extraction of {ext}%.',
    s4ok: 'Enough: the blood leaving in the veins is still about {ven}% saturated.',
    s4short: 'Not enough: even taking 80%, the body is {gap} mL short each minute and venous blood drops to about {ven}%. Cardiac output needs to be at least {min} litres/min.',
    s4hint: 'What to watch: press “Sitting still” first. Each minute 1008 mL of oxygen arrives and only 250 mL is used, an extraction of 24.8%, so blood leaves still about 73.7% saturated and the right end of the capillary stays fairly red. Then drag only oxygen use to 2000 mL (leave cardiac output alone): the need is more than 80% of the supply, and the readout says at least 12.5 litres/min is required. Now press “Brisk walk” and “Hard exercise”: cardiac output rises and extraction rises too (50%, 62.5%), and the right end darkens. The body keeps up with two moves at once: send more blood and take more from each litre.',
    quizPrompt: 'Quick check: during hard exercise the muscles need far more oxygen. Why must cardiac output go up too?',
    quizA: 'Because each litre of blood automatically holds 10 times more oxygen during exercise', quizB: 'Because only about 80% of each litre’s oxygen can be taken, so more litres per minute must be delivered', quizC: 'Because a faster heartbeat turns venous blood red again',
    check: 'Check answer',
    correct: 'Right. Each litre carries an almost fixed amount of oxygen (about 200 mL), and the share that can be taken has a ceiling, so higher oxygen use can only be met by pumping more litres per minute (a faster heartbeat and bigger beats). At 2000 mL per minute you need at least 12.5 litres/min.',
    wrong: 'Look again: a litre of oxygen-rich blood carries about 200 mL of oxygen, and that barely changes with exercise. Drag oxygen use to 2000 mL with cardiac output left at 5.04 litres/min: the readout says it is not enough and at least 12.5 litres/min is needed.',

    s5k: 'STEP 5 · WRAP-UP',
    s5t: 'Blood circulation in one breath',
    s5fin: '<strong>The route</strong>: one heart drives two loops. The systemic loop (left ventricle → arteries → body capillaries → veins → right atrium) carries oxygen to the whole body, and the pulmonary loop (right ventricle → pulmonary artery → lung capillaries → pulmonary veins → left atrium) loads it back on; red and blue only show oxygen content. <strong>Push and direction</strong>: contracting ventricles provide the push, and four one-way valves make sure blood only moves forward. <strong>Speed and exchange</strong>: cardiac output = stroke volume × heart rate, about 5 litres a minute at rest, so the blood goes round about once a minute; capillaries have the largest total area and the slowest flow, which is exactly what exchange needs; when oxygen use rises, the heart sends more and the body takes more.',
    formula: 'cardiac output = stroke volume × heart rate\nspeed = flow ÷ total cross-sectional area\noxygen delivered = cardiac output × 200 mL/L',
    boundary: 'Model limits: the route, the heart and the colours are schematic. The blood volume in each stretch, the vessel areas, the oxygen per litre and the 80% extraction ceiling are textbook approximations, and real people vary a lot. The heartbeat phase lengths and the left-ventricle volume curve are simplified teaching curves; coronary arteries, lymph, blood pressure and heart sounds are not drawn. These numbers are for understanding the idea only, never for judging your own or anyone else’s health.',
    linksTitle: 'Where next',
    lk1: '→ The Cell, step 2: mitochondria use oxygen to release energy, which is why the body needs a constant supply',
    lk2: '→ Photosynthesis, step 1: where the oxygen we breathe comes from',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《血液循环》的平行版本。 · This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Blood Circulation”.',
  },
};

let lang = 'zh';
try { if (typeof window !== 'undefined') lang = localStorage.getItem('knowledge-lang') || ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'); } catch (_) { /* storage unavailable */ }
if (lang !== 'en') lang = 'zh';
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('knowledge-lang', lang); } catch (_) { /* storage denied: keep the in-memory value */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(button => { const on = button.dataset.lang === lang; button.classList.toggle('active', on); button.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  if (typeof window.refreshBlood === 'function') window.refreshBlood();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.BLOOD_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
