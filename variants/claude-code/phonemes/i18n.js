'use strict';
// Speech sounds & phonemes lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '语音与音位 · 三个开关、一条界线、一组规则',
    back: '← 知识索引',
    compare: '对照另一版本：语音与音位 · 从口腔到对立 →',
    navLabel: '语音与音位步骤导航',
    tagline: 'pie 和 buy、cats 和 dogs、英语的 p 和泰语的 p，差别到底在哪里？本页从发音器官的三个动作出发，看哪些差别能区分词义（音位），同一段声音在不同语言里怎样被归类，音怎样排进音节，以及后缀的读音怎样由规则算出来。',
    nav0: '0 三个特征', nav1: '1 最小对立', nav2: '2 VOT 与语言', nav3: '3 音节开头', nav4: '4 后缀同化', nav5: '5 收束',

    plBilabial: '双唇', plLabiodental: '唇齿', plDental: '齿间', plAlveolar: '齿龈', plPostalveolar: '龈后', plVelar: '软腭',
    mnStop: '塞音', mnAffricate: '塞擦音', mnFricative: '擦音', mnNasal: '鼻音',
    vcOff: '清：声带不振动', vcOn: '浊：声带振动', vcShortOff: '清', vcShortOn: '浊',
    ftPlace: '部位', ftManner: '方式', ftVoicing: '清浊',
    mNose: '鼻腔', mTongue: '舌', mVelum: '软腭', mFolds: '声带',
    cMouth: '口腔侧视图（面朝右）', cChart: '英语辅音表 · 每格左清右浊',
    c0a: '口腔侧视图：当前辅音的发音动作', c0b: '英语辅音表',

    s0k: '第 0 步 · 三个特征',
    s0t: '要说清一个辅音，需要报出几样东西？',
    s0e: '这一步要回答：英语 pie 和 buy、tie 和 sigh 开头的辅音到底差在哪里？一个辅音可以用三样东西描述，都是发音时身体在做的事。<strong>发音部位</strong>：气流在哪里被挡住或挤窄，比如双唇、齿龈（上门牙后面那道硬棱）、软腭（上腭后部的软肉）。<strong>发音方式</strong>：怎样挡——<strong>塞音</strong>完全堵住再突然放开；<strong>擦音</strong>留一条窄缝，气流挤过去发出嘶嘶的噪声；<strong>塞擦音</strong>先堵住，再从窄缝慢慢放开；<strong>鼻音</strong>嘴里堵住、软腭放下，气流改从鼻腔出去。<strong>清浊</strong>：声带振不振动。手指按在喉咙上说「sss」和「zzz」，后者能摸到振动；振动的快慢就是音高（<a class="xlink" href="../../../language/phonology/vowel-space/#step0">→ 元音空间页第 0 步：声带振动给出基频</a>）。本页用国际音标记音，写在斜线里，如 /p/；音标记的是声音，不是拼写，所以 thin 开头是 /θ/，then 开头是 /ð/。辅音表里 6 个部位 × 4 种方式 × 清浊共 48 格，英语只用了其中 19 格。',
    gPlace: '发音部位', gManner: '发音方式', gVoice: '清浊',
    lgRing: '气流受阻的位置', lgAir: '气流', lgNoise: '擦音噪声', lgVoice: '声带振动', lgEmpty: '英语不用的组合',
    s0readout: '{place} · {manner} · {voice} → {result}',
    resYes: '英语辅音 /{ipa}/，例如 {ex}。',
    resNo: '英语不用这个组合（表中暗格）。{note}',
    nX: '它并非发不出来：德语 Bach 结尾的 [x]、西班牙语 lago 中间的 [ɣ] 就是软腭擦音。',
    nPhi: '它并非发不出来：日语「ふ」开头的 [ɸ]、西班牙语 lobo 中间的 [β] 就是双唇擦音。',
    nNasal: '英语的鼻音都是浊音；缅甸语等语言有清鼻音。',
    nGeneric: '本表只收英语用到的组合。',
    s0hint: '观察顺序：先只换「清浊」：/p/ ↔ /b/、/s/ ↔ /z/，口腔侧视图里只有喉部的紫色振动波出现或消失，口腔动作不变。再只换「方式」：同在齿龈，塞音 /t/ 的气流先被堵住再一下冲出，擦音 /s/ 一直从窄缝挤出、带橙色噪声，鼻音 /n/ 改从鼻腔流出。最后只换「部位」，看橙圈从双唇移到软腭。也可以直接点辅音表的格子。开启「减弱动态」时侧视图显示静止的一帧。',

    s1k: '第 1 步 · 最小对立',
    s1t: '换掉一个音，词义会不会跟着变？',
    s1e: '这一步要回答：上一步的那些差别，哪些在英语里真能区分词义？把词的后半截固定，只换开头的辅音，比如 _ie（/aɪ/，读如 eye）：pie、by、tie、my 都是不同的词。两个词只差一个音、意思却不同，叫<strong>最小对立</strong>（minimal pair）。能造成最小对立的两个音，在这门语言里就是两个不同的<strong>音位</strong>：音位是说话人心里「算作同一个音」的一类声音，写在斜线里，如 /p/。图中绿色格子表示这个辅音放进框架能组成常用英语词；橙框是当前选的辅音；青色描边是和它只差一个特征（部位、方式或清浊之一）的辅音。',
    gFrame: '框架', frAt: '_at（/æt/）', frIp: '_ip（/ɪp/）', frIe: '_ie（/aɪ/）',
    pickCons: '开头的辅音（也可以点表格）',
    lgWord: '能组成常用英语词', lgNoWord: '组不成常用词', lgSel: '当前选择', lgNb: '只差一个特征的辅音',
    s1readout: '{cur} 只差一个特征的辅音：{nbs}。{count}',
    curWord: '/{ipa}/ + {rest} → {w}。', curNone: '/{ipa}/ + {rest} 组不成常用英语词。',
    nbItem: '/{ipa}/（换{feat}）→ {w}', nbNone: '无', noWord: '不成词', listSep: '；',
    s1count: '这个框架里共 {n} 个词，两两之间有 {all} 对最小对立，其中只差一个特征的 {one} 对：差部位 {pl} 对、差方式 {mn} 对、差清浊 {vc} 对。',
    s1hint: '观察顺序：先选 _ie，点 /θ/：邻居 /ð/ 也是绿的，thigh 和 thy 只差清浊，说明清浊在英语里能区分词义。再点 /p/：邻居 /b/（by）、/t/（tie）是绿的，/k/ 不成词；这只是这个框架里恰好缺词，不说明 /p/ 和 /k/ 是同一个音位，换到 _at 就有 pat 和 cat。最后比较三个框架末尾的计数：最小对立不一定只差一个特征（pie 和 my 差了方式和清浊两个），但只差一个特征的那些最能看出每个特征各自的作用。',

    s2k: '第 2 步 · VOT 与语言',
    s2t: '同一段声音，在不同语言里算不算同一个音位？',
    s2e: '这一步要回答：/p/ 和 /b/ 在英语里是两个音位，它们之间的界线画在哪里，每种语言都一样吗？清浊有一把常用的尺子：<strong>嗓音起始时间</strong>（VOT）。以双唇张开、憋住的气流爆出的时刻为 0，量声带开始振动的时刻，单位毫秒。VOT 为负：嘴还闭着，声带已经在振动（<strong>先浊</strong>）；接近 0：一张嘴就振动；明显为正：张嘴后先有一段只有气流的噪声，叫<strong>送气</strong>，标作 [ʰ]，过一会儿声带才振动。方括号 [ ] 写实际发出的音，斜线 / / 写音位。下方三条带子上的橙圈，是英语、西班牙语、泰语说话人词首双唇塞音的平均 VOT（Lisker 与 Abramson 1964 年的测量，约值）；带子按「离哪个平均值近就归哪类」分色。这是简化模型：真实听者的分界还受语速、口音影响，分界线该放在哪里，可以对照<a class="xlink" href="../../../psychology/cognition/signal-detection/#step2">信号检测论第 2 步：判据只决定往哪边归</a>。英语 pin 里的 p 送气，spin 里的 p 几乎不送气，可英语从不靠这点区分词义，所以它们是同一个音位 /p/ 的两个<strong>音位变体</strong>（allophone）：实际发音不同，说话人却当作同一个音。',
    votSlider: '嗓音起始时间 VOT（ms）', sweepVot: '从 −150 扫到 +110 ms',
    cWave: '示意波形：横轴为时间（ms），0 = 双唇张开', langEn: '英语', langEs: '西班牙语', langTh: '泰语',
    lgPrevoice: '先浊（嘴闭着声带已振动）', lgBurst: '除阻爆破', lgAsp: '送气噪声', lgVowel: '元音（声带振动）', lgMean: '该语言的平均 VOT',
    s2readout: 'VOT = {v} ms：{kind} 按模型，英语归为 /{en}/，西班牙语归为 /{es}/，泰语归为 /{th}/。',
    kPre: '嘴张开前 {a} ms 声带已在振动。', kZero: '嘴一张开声带就振动。', kLag: '嘴张开后先有 {a} ms 的送气噪声，然后声带才振动。',
    s2hint: '观察顺序：把 VOT 拖到 60 ms 左右（英语 pie 的平均值附近）：英语、西班牙语归为 /p/，泰语归为送气的 /pʰ/。再拖到 5 ms：英语听者归为 /b/，西班牙语和泰语都归为 /p/——同一段声音，两种语言的人归到不同的音位。最后拖到 −100 ms：三种语言都归为 /b/。泰语沿这条轴分三类，英语和西班牙语只分两类，分界还落在不同位置。',

    s3k: '第 3 步 · 音节开头',
    s3t: '哪些辅音串能放在英语词的开头？',
    s3e: '这一步要回答：blip 是英语词，bnip 和 lbip 都不是；可它们都没人用过，为什么英语母语者觉得 bnip、lbip「不像英语」，而像 plip 这样的生词却「可以有」？一个<strong>音节</strong>有三个槽位：<strong>核</strong>（通常是元音，必须有）、核前的<strong>首音</strong>、核后的<strong>尾音</strong>。这里固定核与尾音 -ip（/ɪp/），只改首音的两个辅音。语言学家常用<strong>响度</strong>给音排序，大致是嘴张得越开、气流越通畅越响：塞音 1、擦音 2、鼻音 3、流音 l r 4、滑音 w 5、元音 6。许多语言倾向于让响度从首音一路升到核、再降到尾音，叫<strong>响度顺序原则</strong>。「首音组合」表列出 15 × 9 个组合，颜色是判断结果，白点表示加上 -ip 正好是常用英语词；「响度曲线」图画出选中组合各个音的响度。颜色里的「英语用」来自英语词首辅音丛的清单，不是由原则推出来的。',
    pickC1: '首音第 1 个辅音', pickC2: '首音第 2 个辅音（— 表示没有）',
    cMatrix: '首音组合：行为第 1 个辅音，列为第 2 个', cSon: '响度曲线 /{syl}/', c3a: '首音组合判断表', c3b: '选中组合的响度曲线',
    sStop: '塞 1', sFric: '擦 2', sNasal: '鼻 3', sLiq: '流 4', sGlide: '滑 5', sVowel: '元 6',
    slotO: '首', slotN: '核', slotC: '尾',
    lgEng: '响度上升，英语用', lgSExc: 's + 塞音：响度下降，英语照用', lgGap: '响度上升，英语不用', lgFalls: '响度不升，英语不用', lgSingle: '单个辅音', lgIpWord: '加 -ip 是常用词',
    s3readout: '/{syl}/：{verdict}{word} {count}',
    vSingle: '单个辅音作首音，响度 {son}，一路上升，英语允许。', vEnglish: '响度 {son}，一路上升，英语也确实用这个组合。', vSExc: '响度 {son}，在首音里先降，但英语照样用：s 加塞音是响度原则著名的例外。', vGap: '响度 {son}，一路上升，原则不反对，但英语恰好不用这个组合，所以听着「不像英语」。', vFalls: '响度 {son}，在首音里就下降或持平，违反响度顺序原则，英语不用。',
    wordYes: '加上 -ip 正好是英语词 {w}。',
    s3count: '全表 {n} 个两辅音组合：英语用 {eng} 个（其中 s 加塞音 {sx} 个），响度上升但英语不用 {gap} 个，响度不升 {falls} 个。',
    s3hint: '观察顺序：先选 b + l（blip），再选 b + n：两者响度都上升，但英语只用 bl。再选 l + b：响度先降后升，原则就不满足。然后试 s + t、s + p、s + k：响度先降（擦 2 → 塞 1），却是 stop、spin、skip 的开头，可见原则只是倾向，不是铁律。最后扫一眼首音组合表：橙色格子（原则允许但英语不用）比绿色还多，英语只用了原则允许的一部分。',

    s4k: '第 4 步 · 后缀同化',
    s4t: '同一个 -s，为什么在 cats、dogs、buses 里读音不同？',
    s4e: '这一步要回答：复数 -s 写法都一样，读出来却是 [s]（cats）、[z]（dogs）、[ɪz]（buses），由什么决定？只看词干的最后一个音，用到的正是第 0 步的特征。很多教材把这个后缀在说话人心里的形式（<strong>底层形式</strong>）写成 /z/，再用两条规则得出实际读音（<strong>表层形式</strong>，写在方括号里）。① 词干末音是<strong>咝音</strong>（s z ʃ ʒ tʃ dʒ，带嘶嘶声的一类）时，中间插入元音 [ɪ]，否则两个咝音挤在一起听不清。② 否则后缀的清浊跟着末音走：末音清，后缀读清音 [s]；末音浊（所有元音都是浊的），读 [z]。相邻的音在某个特征上变得一致，叫<strong>同化</strong>。第三人称单数 -s（walks、runs）、所有格 \'s 用同一套规则。过去时 -ed 是平行的模式：末音是 t、d 时插 [ɪ] 读 [ɪd]，否则清对清读 [t]，浊对浊读 [d]。',
    sufPl: '复数 -s', sufPa: '过去时 -ed', gStem: '词干',
    cRule: '按词干末音给后缀上色：{suf}', rowVowel: '元音、l、r、w（都是浊音）',
    lgIz: '[ɪz]：咝音之后', lgS: '[s]：其他清音之后', lgZ: '[z]：其他浊音、元音之后', lgId: '[ɪd]：t、d 之后', lgT: '[t]：其他清音之后', lgD: '[d]：其他浊音、元音之后',
    d1: '词干 {stem} /{ipa}/，末音 {last}：{feat}', d1cell: '以 {last} 结尾的词干：{feat}', d2: '底层形式：/{ipa}/ + /{u}/', d3: '{rule}', d4: '表层形式：[{surface}]',
    fSib: '咝音', fVl: '清音，不是咝音', fVd: '浊音，不是咝音', fVowel: '元音（浊）', fAlv: '齿龈塞音 t 或 d', fVlP: '清音，不是 t、d', fVdP: '浊音，不是 t、d',
    rIns: '末音和后缀太像 → 中间插入 [ɪ]', rVl: '末音是清音 → 后缀同化为清音', rVd: '末音是浊音 → 后缀保持浊音',
    dNonce: '{w} 是一个假词。Berko 在 1958 年用 wug 这类假词测试儿童：没听过这个词的孩子也会说出 two [wʌgz]，说明规则存在于说话人心里，而不是逐词背下来的。',
    s4hint: '观察顺序：先在「复数」下依次点 cat、dog、bus：表中对应格子的颜色就是答案，下方列出推导。再看整张表的分布：粉色只占咝音那几格，其余格子按清浊左右分成两色，规则用的正是第 0 步的清浊开关。然后切到「过去时」：左右分色还在，只是插 [ɪ] 的格子换成了 t、d。最后点 wug、plip 这两个假词。',
    quizPrompt: '假词 blick 的复数怎么读？（末音是 /k/）',
    quizA: '[blɪkz]', quizB: '[blɪks]', quizC: '[blɪkɪz]',
    check: '检查答案',
    correct: '对。/k/ 是清音，又不是咝音，后缀同化为清音，读 [s]。',
    wrong: '再查表：/k/ 在软腭行「塞音」列的左半格（清音），看它是哪种颜色。',

    s5k: '第 5 步 · 收束',
    s5t: '三层：身体动作、心里的类别、类别之间的规则',
    s5fin: '第 0 步：一个辅音可以拆成部位、方式、清浊三个特征，都是发音器官的动作。第 1 步：只有能造成最小对立的差别，才在这门语言里区分<strong>音位</strong>。第 2 步：同一段物理声音（同一个 VOT），英语、西班牙语、泰语会归到不同的类；音位是每门语言自己的划分，送气与不送气的 p 在英语里是同一音位的变体，在泰语里是两个音位。第 3 步：音位排进音节有规律，响度顺序是普遍倾向，每门语言再有自己的清单。第 4 步：后缀的实际读音可以从特征算出来，同化让相邻音的清浊一致。',
    formula: '复数 /z/ → 咝音后 [ɪz]；其他清音后 [s]；其他浊音、元音后 [z]\n过去时 /d/ → t、d 后 [ɪd]；其他清音后 [t]；其他浊音、元音后 [d]',
    boundary: '适用范围：辅音表只收英语里由部位、方式、清浊组合出的 19 个辅音，不含 h、l、r、w、j 和元音；音标用宽式，没有建模方言差异（如英式与美式）、重音和语调。VOT 平均值是 Lisker 与 Abramson（1964）对词首双唇塞音的测量约值，按最近平均值分类是简化模型，不是真实听者的分界。第 3 步的「英语用」来自英语词首辅音丛的常见清单；词表只收常用词，罕见词和外来词（如 Gwen、Vlad）不计入。',
    linksTitle: '继续探索',
    lk1: '元音空间：声带振动给出基频，声道共鸣给出共振峰 →',
    lk2: '元音空间：把元音画成 F1–F2 平面上的点 →',
    lk3: '信号检测论：判据放在哪里，决定一次刺激被归到哪类 →',
    lk4: '声波：声音在空气里传播时，动的是什么 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《语音与音位 · 从口腔到对立》的平行版本。'
  },
  en: {
    pageTitle: 'Speech Sounds & Phonemes · Three Switches, One Boundary, One Rule',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Speech Sounds & Phonemes · From Mouth to Contrast →',
    navLabel: 'Speech sounds and phonemes steps',
    tagline: 'What exactly separates pie from buy, cats from dogs, an English p from a Thai p? Starting from three things the vocal tract does, this page asks which differences change meaning (phonemes), how one stretch of sound is sorted differently by different languages, how sounds line up inside a syllable, and how a suffix’s pronunciation is computed by rule.',
    nav0: '0 Three features', nav1: '1 Minimal pairs', nav2: '2 VOT & language', nav3: '3 Syllable onsets', nav4: '4 Suffix assimilation', nav5: '5 Wrap-up',

    plBilabial: 'Bilabial', plLabiodental: 'Labiodental', plDental: 'Dental', plAlveolar: 'Alveolar', plPostalveolar: 'Postalveolar', plVelar: 'Velar',
    mnStop: 'Stop', mnAffricate: 'Affricate', mnFricative: 'Fricative', mnNasal: 'Nasal',
    vcOff: 'Voiceless: vocal folds still', vcOn: 'Voiced: vocal folds vibrating', vcShortOff: 'voiceless', vcShortOn: 'voiced',
    ftPlace: 'place', ftManner: 'manner', ftVoicing: 'voicing',
    mNose: 'nasal cavity', mTongue: 'tongue', mVelum: 'velum', mFolds: 'vocal folds',
    cMouth: 'Side view of the vocal tract (facing right)', cChart: 'English consonants · voiceless left, voiced right',
    c0a: 'Side view of the vocal tract making the current consonant', c0b: 'English consonant chart',

    s0k: 'Step 0 · Three features',
    s0t: 'How many things do you need to say to pin down a consonant?',
    s0e: 'The question here: what actually separates the first sounds of pie and buy, or tie and sigh? A consonant can be described by three things, all of them actions of the body. <strong>Place of articulation</strong>: where the airflow is blocked or squeezed — both lips, the alveolar ridge (the hard bump just behind the upper front teeth), the velum (the soft back part of the roof of the mouth). <strong>Manner of articulation</strong>: how it is blocked — a <strong>stop</strong> closes completely, then lets go all at once; a <strong>fricative</strong> leaves a narrow gap the air hisses through; an <strong>affricate</strong> closes, then releases slowly through a gap; a <strong>nasal</strong> closes the mouth but lowers the velum so the air leaves through the nose. <strong>Voicing</strong>: whether the vocal folds vibrate. Put a finger on your throat and say “sss”, then “zzz” — you can feel the buzz in the second; how fast they buzz sets the pitch (<a class="xlink" href="../../../language/phonology/vowel-space/#step0">→ vowel space, step 0: vocal-fold vibration gives the fundamental</a>). Sounds here are written in the International Phonetic Alphabet between slashes, like /p/; the symbols record sound, not spelling, so thin starts with /θ/ and then starts with /ð/. The chart has 6 places × 4 manners × 2 voicings = 48 slots; English uses 19 of them.',
    gPlace: 'Place', gManner: 'Manner', gVoice: 'Voicing',
    lgRing: 'Where the air is blocked', lgAir: 'Airflow', lgNoise: 'Fricative noise', lgVoice: 'Vocal-fold vibration', lgEmpty: 'Combination English doesn’t use',
    s0readout: '{place} · {manner} · {voice} → {result}',
    resYes: 'the English consonant /{ipa}/, as in {ex}.',
    resNo: 'English doesn’t use this combination (a dark slot). {note}',
    nX: 'It is perfectly pronounceable: the [x] at the end of German Bach and the [ɣ] in the middle of Spanish lago are velar fricatives.',
    nPhi: 'It is perfectly pronounceable: the [ɸ] at the start of Japanese “fu” and the [β] in the middle of Spanish lobo are bilabial fricatives.',
    nNasal: 'English nasals are all voiced; languages such as Burmese have voiceless nasals.',
    nGeneric: 'The chart lists only combinations English uses.',
    s0hint: 'What to watch: first change only voicing — /p/ ↔ /b/, /s/ ↔ /z/: in the side view only the violet buzz at the larynx appears or disappears; the mouth does the same thing. Then change only manner, staying alveolar: for the stop /t/ the air is held back, then bursts out; for the fricative /s/ it squeezes through a gap with orange noise; for the nasal /n/ it flows out through the nose. Finally change only place and watch the orange ring move from the lips back to the velum. You can also click a slot in the chart. With reduced motion on, the side view shows a still frame.',

    s1k: 'Step 1 · Minimal pairs',
    s1t: 'Swap one sound — does the meaning change?',
    s1e: 'The question here: which of those differences actually tell English words apart? Hold the end of a word fixed and swap only the first consonant, say _ie (/aɪ/, as in eye): pie, by, tie, my are all different words. Two words that differ in exactly one sound and mean different things form a <strong>minimal pair</strong>. Two sounds that can make a minimal pair are different <strong>phonemes</strong> of that language: a phoneme is a class of sounds that speakers treat as “the same sound”, written between slashes like /p/. In the chart, green slots make an everyday English word in the frame; the orange box is the consonant you picked; cyan outlines mark consonants that differ from it in exactly one feature (place, manner or voicing).',
    gFrame: 'Frame', frAt: '_at (/æt/)', frIp: '_ip (/ɪp/)', frIe: '_ie (/aɪ/)',
    pickCons: 'First consonant (or click the chart)',
    lgWord: 'Makes an everyday English word', lgNoWord: 'Makes no everyday word', lgSel: 'Current choice', lgNb: 'Differs in exactly one feature',
    s1readout: '{cur} Consonants one feature away: {nbs}. {count}',
    curWord: '/{ipa}/ + {rest} → {w}.', curNone: '/{ipa}/ + {rest} is not an everyday English word.',
    nbItem: '/{ipa}/ (change {feat}) → {w}', nbNone: 'none', noWord: 'no word', listSep: '; ',
    s1count: 'This frame has {n} words, giving {all} minimal pairs; {one} of them differ in a single feature: {pl} by place, {mn} by manner, {vc} by voicing.',
    s1hint: 'What to watch: pick _ie and click /θ/ — its neighbour /ð/ is green too: thigh and thy differ only in voicing, so voicing distinguishes English words. Click /p/: neighbours /b/ (by) and /t/ (tie) are green, /k/ makes no word — that is just a gap in this frame, not evidence that /p/ and /k/ are one phoneme; switch to _at and you get pat and cat. Then compare the counts at the end for the three frames: a minimal pair can differ in more than one feature (pie and my differ in manner and voicing), but the single-feature pairs show what each feature does on its own.',

    s2k: 'Step 2 · VOT & language',
    s2t: 'Is the same stretch of sound the same phoneme in every language?',
    s2e: 'The question here: /p/ and /b/ are two phonemes in English — where is the boundary between them, and is it the same in every language? Voicing has a standard ruler: <strong>voice onset time</strong> (VOT). Take the moment the lips open and the held-back air bursts out as 0, and measure when the vocal folds start vibrating, in milliseconds. Negative VOT: the folds are already buzzing while the lips are still shut (<strong>prevoicing</strong>). Near 0: they start as the lips open. Clearly positive: after the lips open there is first a stretch of plain breath noise — <strong>aspiration</strong>, marked [ʰ] — and only then does voicing begin. Square brackets [ ] write the sound actually produced; slashes / / write the phoneme. The orange circles on the three strips below are average VOTs of word-initial bilabial stops for English, Spanish and Thai speakers (Lisker and Abramson’s 1964 measurements, approximate); each strip is coloured by “belongs to whichever average is nearest”. That is a simplified model: real listeners’ boundaries also shift with speaking rate and accent — where to put a boundary is the subject of <a class="xlink" href="../../../psychology/cognition/signal-detection/#step2">signal detection, step 2: the criterion only decides which way you sort</a>. The p in English pin is aspirated and the p in spin is barely aspirated, yet English never uses that difference to tell words apart, so they are two <strong>allophones</strong> of the one phoneme /p/: different sounds that speakers treat as the same.',
    votSlider: 'Voice onset time VOT (ms)', sweepVot: 'Sweep from −150 to +110 ms',
    cWave: 'Schematic waveform: time in ms across, 0 = lips open', langEn: 'English', langEs: 'Spanish', langTh: 'Thai',
    lgPrevoice: 'Prevoicing (folds buzz, lips shut)', lgBurst: 'Release burst', lgAsp: 'Aspiration noise', lgVowel: 'Vowel (voicing)', lgMean: 'Average VOT in that language',
    s2readout: 'VOT = {v} ms: {kind} By the model, English sorts it as /{en}/, Spanish as /{es}/, Thai as /{th}/.',
    kPre: 'the vocal folds start buzzing {a} ms before the lips open.', kZero: 'voicing starts as the lips open.', kLag: 'after the lips open there are {a} ms of breath noise before voicing starts.',
    s2hint: 'What to watch: drag VOT to about 60 ms (near the English average for pie): English and Spanish sort it as /p/, Thai as aspirated /pʰ/. Now drag to 5 ms: an English listener sorts it as /b/, while Spanish and Thai both sort it as /p/ — the same sound, two different phonemes depending on who hears it. Finally drag to −100 ms: all three sort it as /b/. Thai splits this axis into three categories, English and Spanish into two — and at different places.',

    s3k: 'Step 3 · Syllable onsets',
    s3t: 'Which consonant strings can start an English word?',
    s3e: 'The question here: blip is an English word, bnip and lbip are not — but nobody has used any of them, so why do English speakers feel bnip and lbip are “not English” while a new word like plip “could be”? A <strong>syllable</strong> has three slots: the <strong>nucleus</strong> (usually a vowel, and required), the <strong>onset</strong> before it and the <strong>coda</strong> after it. Here the nucleus and coda are fixed as -ip (/ɪp/) and only the two onset consonants change. Linguists often rank sounds by <strong>sonority</strong> — roughly, the more open the mouth and the freer the airflow, the more sonorous: stop 1, fricative 2, nasal 3, liquid l r 4, glide w 5, vowel 6. Many languages prefer sonority to rise through the onset to the nucleus and fall through the coda — the <strong>sonority sequencing principle</strong>. The onset-combination chart shows 15 × 9 onset combinations coloured by verdict; a white dot means that adding -ip gives an everyday English word. The sonority-profile chart plots each sound of the selected combination. The “English uses it” colour comes from a list of English word-initial clusters, not from the principle.',
    pickC1: 'First onset consonant', pickC2: 'Second onset consonant (— means none)',
    cMatrix: 'Onset combinations: row = first consonant, column = second', cSon: 'Sonority profile /{syl}/', c3a: 'Verdicts for onset combinations', c3b: 'Sonority profile of the selected combination',
    sStop: 'stop 1', sFric: 'fric. 2', sNasal: 'nasal 3', sLiq: 'liquid 4', sGlide: 'glide 5', sVowel: 'vowel 6',
    slotO: 'onset', slotN: 'nucleus', slotC: 'coda',
    lgEng: 'Rises, English uses it', lgSExc: 's + stop: falls, English uses it anyway', lgGap: 'Rises, English doesn’t use it', lgFalls: 'Doesn’t rise, English doesn’t use it', lgSingle: 'Single consonant', lgIpWord: 'Plus -ip is an everyday word',
    s3readout: '/{syl}/: {verdict}{word} {count}',
    vSingle: 'a single onset consonant; sonority {son} rises all the way, and English allows it.', vEnglish: 'sonority {son} rises all the way, and English does use this cluster.', vSExc: 'sonority {son} dips inside the onset, yet English uses it: s + stop is the famous exception to the sonority principle.', vGap: 'sonority {son} rises all the way, so the principle has no objection — English just happens not to use this cluster, which is why it sounds “un-English”.', vFalls: 'sonority {son} falls or stays level inside the onset, breaking the sonority sequencing principle; English doesn’t use it.',
    wordYes: ' Adding -ip gives the English word {w}.',
    s3count: 'Of the {n} two-consonant combinations in the chart, English uses {eng} ({sx} of them s + stop), {gap} rise but go unused, and {falls} don’t rise.',
    s3hint: 'What to watch: pick b + l (blip), then b + n: sonority rises in both, but English only uses bl. Then l + b: sonority falls first, so the principle is broken. Try s + t, s + p, s + k: sonority dips (fricative 2 → stop 1), yet these begin stop, spin and skip — the principle is a tendency, not a law. Finally scan the onset-combination chart: there are more orange slots (allowed by the principle, unused by English) than green ones; English uses only part of what the principle allows.',

    s4k: 'Step 4 · Suffix assimilation',
    s4t: 'Why does the same -s sound different in cats, dogs and buses?',
    s4e: 'The question here: the plural -s is always spelled the same, yet it is pronounced [s] in cats, [z] in dogs and [ɪz] in buses — what decides? Only the last sound of the stem, and the deciding facts are step 0’s features. Many textbooks write the suffix as it is stored in the speaker’s mind — its <strong>underlying form</strong> — as /z/, then derive the pronunciation actually heard — the <strong>surface form</strong>, in square brackets — with two rules. ① If the stem ends in a <strong>sibilant</strong> (s z ʃ ʒ tʃ dʒ, the hissing kind), insert the vowel [ɪ]; two sibilants jammed together would be hard to hear apart. ② Otherwise the suffix copies the voicing of the last sound: after a voiceless sound it is voiceless [s]; after a voiced one (every vowel is voiced) it is [z]. Neighbouring sounds becoming alike in a feature is called <strong>assimilation</strong>. The third-person -s (walks, runs) and possessive ’s follow the same rules. The past tense -ed runs in parallel: after t or d insert [ɪ] for [ɪd]; otherwise voiceless after voiceless [t], voiced after voiced [d].',
    sufPl: 'Plural -s', sufPa: 'Past tense -ed', gStem: 'Stem',
    cRule: 'Suffix colour by the stem’s last sound: {suf}', rowVowel: 'Vowels, l, r, w (all voiced)',
    lgIz: '[ɪz]: after sibilants', lgS: '[s]: after other voiceless sounds', lgZ: '[z]: after other voiced sounds and vowels', lgId: '[ɪd]: after t, d', lgT: '[t]: after other voiceless sounds', lgD: '[d]: after other voiced sounds and vowels',
    d1: 'Stem {stem} /{ipa}/, last sound {last}: {feat}', d1cell: 'A stem ending in {last}: {feat}', d2: 'Underlying form: /{ipa}/ + /{u}/', d3: '{rule}', d4: 'Surface form: [{surface}]',
    fSib: 'a sibilant', fVl: 'voiceless, not a sibilant', fVd: 'voiced, not a sibilant', fVowel: 'a vowel (voiced)', fAlv: 'the alveolar stop t or d', fVlP: 'voiceless, not t or d', fVdP: 'voiced, not t or d',
    rIns: 'last sound too like the suffix → insert [ɪ] between them', rVl: 'last sound voiceless → suffix assimilates to voiceless', rVd: 'last sound voiced → suffix stays voiced',
    dNonce: '{w} is a made-up word. In 1958 Berko tested children with invented words like wug: children who had never heard the word still said two [wʌgz], showing that the rule lives in the speaker’s mind rather than being memorised word by word.',
    s4hint: 'What to watch: under “Plural”, click cat, dog, bus in turn — the colour of the matching slot is the answer, and the derivation is listed below. Then look at the whole chart: pink covers only the sibilant slots, and everything else splits left/right into two colours by voicing — the rule uses exactly step 0’s voicing switch. Switch to “Past tense”: the left/right split remains; only the [ɪ]-inserting slots move to t and d. Finally click the invented words wug and plip.',
    quizPrompt: 'How is the plural of the made-up word blick pronounced? (It ends in /k/.)',
    quizA: '[blɪkz]', quizB: '[blɪks]', quizC: '[blɪkɪz]',
    check: 'Check answer',
    correct: 'Right. /k/ is voiceless and not a sibilant, so the suffix assimilates to voiceless: [s].',
    wrong: 'Check the chart again: /k/ is the left (voiceless) half of the velar row, stop column — which colour is it?',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'Three layers: what the body does, the categories in the mind, the rules between them',
    s5fin: 'Step 0: a consonant splits into three features — place, manner, voicing — all actions of the vocal tract. Step 1: only differences that can make a minimal pair separate <strong>phonemes</strong> in a language. Step 2: one physical sound (one VOT value) is sorted into different categories by English, Spanish and Thai; phonemes are each language’s own division, and aspirated and plain p are allophones of one phoneme in English but two phonemes in Thai. Step 3: how phonemes line up inside a syllable follows patterns — sonority sequencing is a general tendency, and each language keeps its own list. Step 4: the pronunciation of a suffix can be computed from features; assimilation makes neighbouring sounds agree in voicing.',
    formula: 'Plural /z/ → [ɪz] after sibilants; [s] after other voiceless sounds; [z] after other voiced sounds and vowels\nPast /d/ → [ɪd] after t, d; [t] after other voiceless sounds; [d] after other voiced sounds and vowels',
    boundary: 'Scope: the chart holds only the 19 English consonants built from place, manner and voicing — no h, l, r, w, j and no vowels; transcription is broad, and dialect differences (British vs American, say), stress and intonation are not modelled. The VOT averages are approximate values from Lisker and Abramson’s (1964) measurements of word-initial bilabial stops; sorting by the nearest average is a simplified model, not real listeners’ boundaries. Step 3’s “English uses it” comes from the usual list of English word-initial clusters; the word lists hold everyday words only, and rare words and loans (Gwen, Vlad) are not counted.',
    linksTitle: 'Keep exploring',
    lk1: 'Vowel space: the vocal folds give the fundamental, the tract’s resonances give formants →',
    lk2: 'Vowel space: drawing vowels as points on the F1–F2 plane →',
    lk3: 'Signal detection: where you put the criterion decides how a stimulus is sorted →',
    lk4: 'Sound waves: what actually moves when sound travels through air →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Speech Sounds & Phonemes · From Mouth to Contrast”.'
  }
};

let lang = 'zh';
try { const saved = localStorage.getItem('knowledge-lang'); lang = saved === 'en' || saved === 'zh' ? saved : ((typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '')) ? 'zh' : 'en'); } catch (_) { lang = (typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '')) ? 'zh' : 'en'; }

function t(key, params = {}) {
  let text = STRINGS[lang][key];
  if (text === undefined) text = STRINGS.en[key] !== undefined ? STRINGS.en[key] : key;
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
  if (typeof window.refreshPhonemes === 'function') window.refreshPhonemes();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PHON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
