'use strict';
// Music theory lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '音乐理论 · 从半音计数到终止式',
    back: '← 知识索引',
    compare: '对照另一版本：音乐理论 · 从音程到终止 →',
    navLabel: '音乐理论步骤导航',
    tagline: '音乐里的很多「感觉」其实可以数出来：两个音隔几个半音、频率是几比几、泛音有几对重合、换和弦时每个声部走了几步。七步里从钢琴键盘上的一个音出发，一路数到音程、音阶、和弦，最后看清 V → I 为什么听起来像「说完了」。本页不放声音，所有数字由当前设置当场算出。',
    nav0: '0 频率阶梯', nav1: '1 数音程', nav2: '2 泛音重合', nav3: '3 音阶步伐', nav4: '4 和弦与功能', nav5: '5 终止', nav6: '6 收束与自测',
    iv0: '纯一度（同音）', iv1: '小二度', iv2: '大二度', iv3: '小三度', iv4: '大三度', iv5: '纯四度', iv6: '三全音（增四度 / 减五度）', iv7: '纯五度', iv8: '小六度', iv9: '大六度', iv10: '小七度', iv11: '大七度', iv12: '纯八度',
    maj: '大三和弦', min: '小三和弦', dim: '减三和弦',
    fT: '主功能（T）', fS: '下属功能（S）', fD: '属功能（D）',
    major: '大调', minor: '自然小调',
    whole: '全', half: '半', sep: '、',

    s0k: '第 0 步 · 频率阶梯',
    s0t: '音一级一级往上爬，频率是加上去的，还是乘上去的？',
    s0e: '这一步要回答：钢琴上每往右一个键，声音的频率怎样变？音高主要由<strong>频率</strong>决定：声源每秒振动的次数，单位赫兹（Hz），次数越多音越高。钢琴上相邻两个键（黑键也算）相差一个<strong>半音</strong>，12 个半音叫一个<strong>八度</strong>，名字相同的两个键（例如 A4 和 A5）正好隔一个八度。标准音 A4 定为 440 Hz。现在通用的<strong>十二平均律</strong>规定：每升一个半音，频率都乘同一个数 2^(1/12) ≈ 1.0595，于是升 12 个半音正好乘 2（<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ 指数与对数第 2 步：半音数 = 12 × log₂(频率比)</a>）。上图是键盘，下图横轴是离 A4 的半音数 n、纵轴是频率，点是你拖到过的位置。',
    nSlider: '离 A4 的半音数 n',
    s0lgKey: '当前的键', s0lgDot: '拖到过的位置', s0lgCurve: 'f = 440 × 2^(n/12)',
    s0readout: '{name}：比 A4 {dir} {an} 个半音，频率 = 440 × 2^({n}/12) = {f} Hz。比左边相邻的键高 {dHz} Hz，是它的 {r} 倍。{oct}',
    up: '高', down: '低',
    octNote: '正好一个八度：频率是 A4 的 {x} 倍。',
    s0hint: '观察顺序：把 n 从 −12 一格格拖到 12，读数里「高多少 Hz」越来越大（从约 12 Hz 涨到约 49 Hz），「是几倍」却一直是 1.0595；下图的点越往右越陡，正是乘法的样子。拖到 n = 12，频率从 440 变成 880。',

    s1k: '第 1 步 · 数音程',
    s1t: '从一个音到另一个音隔了多远，该怎么数？',
    s1e: '这一步要回答：两个音之间的距离（<strong>音程</strong>）怎么量、怎么称呼？量法：从低音的键往右数，每过一个键（黑白都算）加 1，得到半音数 k。常用音程都有名字：名字里的「几度」是数字母（C 到 E 跨 C、D、E 三个字母，是三度），「大、小、纯」再区分同一度数里半音的多少，例如大三度 4 个半音、小三度 3 个。两音的频率比是 2^(k/12)，只由 k 决定，和从哪个音出发无关——所以同一个音程放在任何音上都是同样的「距离」。',
    rootSlider: '起点（低音）', kSlider: '往上的半音数 k',
    s1lgLow: '起点', s1lgHigh: '终点', s1lgStep: '经过的半音',
    s1readout: '从 {a} 往上 {k} 个半音到 {b}：{iname}。频率 {fa} Hz → {fb} Hz，比值 {r}（= 2^({k}/12)）。',
    s1hint: '观察顺序：先固定 k = 7，拖动起点：两个高亮的键一起平移，比值一直是 1.4983；再固定起点，把 k 从 0 拖到 12，看名字怎么变，注意 k = 6 正好是八度的一半。',

    s2k: '第 2 步 · 泛音重合',
    s2t: '为什么有的音程听起来融合，有的听起来「发毛」？',
    s2e: '这一步要回答：两个音一起响时，什么决定它们听起来是否融合？弦或空气柱振动时，不只发出基频 f，还同时发出 2f、3f、4f……，这些叫<strong>泛音</strong>（<a class="xlink" href="../../../physics/waves/standing-wave/#step3">→ 驻波第 3 步：同一根弦的整数倍台阶</a>）。设低音频率 f₁、高音 f₂ = f₁ × p/q（p/q 是化简后的整数比）：低音的第 m 个泛音 m·f₁ 与高音的第 n 个泛音 n·f₂ 相等，当且仅当 m·q = n·p。p、q 越小，前 10 个泛音里重合的对数越多。完全重合的泛音互不干扰；差一点点的两个泛音会产生<strong>拍</strong>：响度每秒忽强忽弱 |频率差| 次，听起来发「毛」（<a class="xlink" href="../../../physics/waves/sound-waves/#step2">→ 声波第 2 步：拍从哪里来</a>）。<strong>纯律</strong>直接用整数比；十二平均律用 2^(k/12)，只是接近整数比，所以该重合的泛音会错开一点。这是亥姆霍兹对协和感的物理解释，并不是全部：听觉习惯和音乐风格同样起作用。',
    tuneJust: '纯律（精确整数比）', tuneET: '十二平均律',
    s2lgLow: '低音 A3 的泛音', s2lgHigh: '高音的泛音', s2lgMeet: '该重合的一对',
    s2readout: '{iname}（{k} 个半音），最接近的整数比 {p}:{q}：前 10 个泛音里有 {sh} 对重合。十二平均律的比值 {et} 比 {p}/{q} {wide} {c} 音分（1 音分 = 1/100 个半音）。{beat}',
    wider: '宽', narrower: '窄',
    beatJust: '当前是纯律：这些泛音完全重合，没有拍。',
    beatET: '当前是十二平均律：最低那对本该重合的泛音（低音第 {m} 个、高音第 {n} 个）差 {b} Hz，每秒拍 {b} 次。',
    beatNone: '前 10 个泛音里没有重合的一对，拍来自别处，这里不计算。',
    s2hint: '观察顺序：先选「纯律」，把 k 从 0 拖到 12，数绿色连线：纯八度 5 对、纯五度 3 对、纯四度和大三度各 2 对、小二度和三全音 0 对。再切到「十二平均律」：纯五度的连线几乎不动（只差 2 音分，在 A3 上每秒拍约 0.7 次），大三度却明显错开（差约 14 音分）。',

    s3k: '第 3 步 · 音阶步伐',
    s3t: '大调音阶为什么是这七个音？',
    s3e: '这一步要回答：一个调用哪七个音，由什么决定？<strong>音阶</strong>是从<strong>主音</strong>（这个调的起点和「家」）出发、按固定步伐往上走的一串音。大调的步伐是 全 全 半 全 全 全 半（全 = 全音 = 2 个半音，半 = 半音），七步共 12 个半音，回到高八度的主音；自然小调的步伐是 全 半 全 全 半 全 全。从 C 出发的大调正好全是白键；换个主音，同样的步伐就要用到黑键，需要的升号或降号合起来叫<strong>调号</strong>。音阶里的第几个音叫第几<strong>级</strong>：1 级是主音，7 级叫<strong>导音</strong>，它离上方主音只差一个半音。拼写规则：七个字母每个用一次，所以 F 大调写 B♭ 而不是 A♯。',
    tonicSlider: '主音', modeMajor: '大调', modeMinor: '自然小调',
    s3lgNote: '音阶里的音（数字 = 级数）', s3lgW: '全音步', s3lgH: '半音步',
    s3readout: '{tonic} {mode}：{notes}。步伐 {pattern}。调号：{sig}。',
    sigSharp: '{n} 个升号', sigFlat: '{n} 个降号', sigNone: '没有升降号',
    s3hint: '观察顺序：保持大调，主音从 C 依次拖到 G、D、A，每次升五度（7 个半音），调号就多一个升号；从 C 拖到 F，得到一个降号。再切换「自然小调」，比较 A 小调和 C 大调：用的是同一组白键，只是从不同的音出发。',

    s4k: '第 4 步 · 和弦与功能',
    s4t: '在一个调里，每一级上叠出的和弦是什么性质、起什么作用？',
    s4e: '这一步要回答：大调七个音能叠出哪些和弦，它们各扮演什么角色？<strong>三和弦</strong>：从某一级开始，隔一个音取一个，共取三个（1-3-5 级、2-4-6 级……）。下层和上层各是一个三度：大三度（4 个半音）在下、小三度（3 个）在上，是<strong>大三和弦</strong>；反过来是<strong>小三和弦</strong>；两个小三度是<strong>减三和弦</strong>。罗马数字记级数，大写表示大三和弦、小写表示小三和弦，° 表示减。<strong>和声功能</strong>把七个和弦分成三组：主功能 T（I、iii、vi：与主和弦 I 共用两个或三个音，听起来稳定）；下属功能 S（ii、IV：含第 4 级，常用来离开主和弦）；属功能 D（V、vii°：都含导音 7 级，它离主音只差一个半音；vii° 还含第 4 级，与导音相距 6 个半音，是三全音。这一组听起来紧张，倾向回到主和弦）。',
    degSlider: '级数（1–7）',
    s4lgChord: '和弦里的三个音', s4lgI: '键底绿点 = 主和弦 I 的音', s4lgT: '主功能 T', s4lgS: '下属功能 S', s4lgD: '属功能 D',
    s4readout: '{key} 大调第 {d} 级：{roman}（{notes}），下层 {lo} 个半音、上层 {up} 个半音 → {quality}。{func}；与主和弦 I 共用 {common} 个音；{lt}{tt}',
    ltYes: '含导音 {x}；', ltNo: '不含导音；', ttYes: '含三全音 {a}–{b}。', ttNo: '不含三全音。',
    s4hint: '观察顺序：把级数从 1 拖到 7，看下方七个格子：大三和弦落在 I、IV、V，减三和弦只有 vii°，颜色标出 T、S、D 三组；再拖主音换调，音名全变了，性质与功能的排列却一格不变。',

    s5k: '第 5 步 · 终止',
    s5t: '为什么 V → I 听起来像「说完了」？',
    s5e: '这一步要回答：乐句收尾时，两个和弦之间到底发生了什么？乐句结尾的和弦进行叫<strong>终止</strong>。本页数四种：<strong>正格终止</strong> V → I（属到主）；<strong>变格终止</strong> IV → I；<strong>半终止</strong>：停在 V 上，像句中的逗号；<strong>阻碍终止</strong> V → vi：该回主和弦时拐去了 vi。下图左列是第一个和弦的三个上方声部，右列是第二个和弦；每个声部走向下一个和弦里最近的音，使三个声部合计移动的半音最少（这叫<strong>声部进行</strong>）。连线旁的数字是各声部移动的半音数（+ 上行、− 下行，0 = 保持）。',
    c1Slider: '第一个和弦（级数）', c2Slider: '第二个和弦（级数）',
    preAuth: '正格 V→I', prePlag: '变格 IV→I', preHalf: '半终止 ii→V', preDec: '阻碍 V→vi',
    s5lgV: '声部（左 = 第一个和弦，右 = 第二个）', s5lgLt: '导音的走向', s5lgFa: '第 4 级的走向',
    s5readout: '{key} 大调：{r1}（{n1}）→ {r2}（{n2}）。{type}三个声部共移动 {total} 个半音，{common} 个音保持不动。{lt}{fa}',
    tAuthentic: '正格终止。', tLeading: '导和弦 vii° 到主和弦：和正格终止一样含导音解决。', tPlagal: '变格终止。', tHalf: '半终止：停在 V 上，句子还没说完。', tDeceptive: '阻碍终止：V 之后没有回到 I，而是到了 vi。', tNone: '这不是本页列出的四种终止。',
    ltRes: '导音 {x} 上行半音到主音 {y}。', faRes: '第 4 级 {x} 下行半音到第 3 级 {y}。',
    s5hint: '观察顺序：先按「正格 V→I」：一个声部保持、导音只上行 1 个半音就到了主音。再按「阻碍 V→vi」：导音照样上行到主音，但另外两个声部去了 vi 的音，没有落到完整的主和弦上——所以「说完了」的感觉来自导音解决和到达主和弦两件事一起发生。最后自己拖两个级数，看总移动量。',

    s6k: '第 6 步 · 收束',
    s6t: '收束：一路数过来——再做几道自测题',
    s6fin: '回头看：<strong>音乐里的这些「感觉」都对应着可以数出来的量</strong>。半音是频率乘 2^(1/12)，音程就是数半音；简单整数比让泛音成对重合，十二平均律只是接近这些比；音阶是固定的全半步伐，换主音只是整体平移；三和弦由两层三度叠成，功能取决于它和主和弦共用几个音、有没有导音；终止时导音上行半音、各声部只走很小的步子，到达主和弦。',
    formula: 'f(n) = 440 × 2^(n/12) Hz，n = 离 A4 的半音数\n大调：全 全 半 全 全 全 半；大三和弦 = 4 + 3，小三和弦 = 3 + 4，减三和弦 = 3 + 3\n前 10 个泛音里重合的对数 = ⌊10 ÷ max(p, q)⌋（音程比 p:q 化简后）',
    boundary: '适用范围：十二平均律与 5 限纯律、西方调性音乐的大调与自然小调、三个上方声部的简化声部进行（低音声部通常走根音跳进，本页没画）。泛音重合只是协和感的一种物理解释；本页没有放声音，「听起来」的描述来自常见的听觉经验，不是这里测得的数据。',
    quizTitle: '自测：题目由页面随机出，答案用同一套计算核对',
    checkQ: '核对', newQ: '换一道', showQ: '看答案',
    qInt: '从 {a} 往上到 {b} 是几个半音？',
    qTri: '{key} 大调第 {d} 级上的三和弦是什么性质？',
    qCad: '在 {key} 大调里，和弦 {n1} 之后接 {n2}，是哪种终止？',
    optSemis: '{k} 个半音',
    oAuthentic: '正格终止', oPlagal: '变格终止', oHalf: '半终止', oDeceptive: '阻碍终止',
    whyInt: '{k} 个半音：{iname}。', whyTri: '{notes}：下层 {lo}、上层 {up} 个半音 → {q}（{roman}）。', whyCad: '{r1} → {r2}：{t}',
    qRight: '答对了。{why}', qWrong: '还不对，再试一次；需要时按「看答案」。', qShown: '答案：{why}', qEmpty: '先选一个选项。',
    linksTitle: '接着去哪里',
    lk1: '→ 指数与对数第 2 步：半音数就是频率比取对数',
    lk2: '→ 声波第 2 步：差一点的两个频率为什么会拍',
    lk3: '→ 驻波第 3 步：泛音为什么是基频的整数倍',
    lk4: '→ 声波第 3 步：音色就是泛音的配方',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《音乐理论 · 从音程到终止》的平行版本。'
  },
  en: {
    pageTitle: 'Music Theory · From Counting Semitones to the Cadence',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Music Theory · From Intervals to Cadence →',
    navLabel: 'Music theory steps',
    tagline: 'A lot of what music “feels like” can be counted: how many semitones lie between two notes, what ratio their frequencies form, how many overtones coincide, how far each voice moves when the chord changes. Over seven steps you start from a single key on the piano and count your way through intervals, scales and chords, until you can see why V → I sounds like the end of a sentence. The page plays no sound; every number is computed live from the current settings.',
    nav0: '0 Frequency ladder', nav1: '1 Counting intervals', nav2: '2 Shared overtones', nav3: '3 Scale steps', nav4: '4 Chords & function', nav5: '5 Cadences', nav6: '6 Wrap-up & check',
    iv0: 'perfect unison', iv1: 'minor second', iv2: 'major second', iv3: 'minor third', iv4: 'major third', iv5: 'perfect fourth', iv6: 'tritone (augmented fourth / diminished fifth)', iv7: 'perfect fifth', iv8: 'minor sixth', iv9: 'major sixth', iv10: 'minor seventh', iv11: 'major seventh', iv12: 'perfect octave',
    maj: 'major triad', min: 'minor triad', dim: 'diminished triad',
    fT: 'tonic function (T)', fS: 'subdominant function (S)', fD: 'dominant function (D)',
    major: 'major', minor: 'natural minor',
    whole: 'W', half: 'H', sep: ', ',

    s0k: 'Step 0 · The frequency ladder',
    s0t: 'As notes climb key by key, does the frequency go up by adding or by multiplying?',
    s0e: 'This step asks: each time you move one key to the right on a piano, what happens to the frequency? Pitch is set mainly by <strong>frequency</strong> — how many times per second the source vibrates, in hertz (Hz); more vibrations, higher note. Neighbouring keys (black ones included) are a <strong>semitone</strong> apart, and 12 semitones make an <strong>octave</strong>: two keys with the same letter, such as A4 and A5, are exactly an octave apart. Concert A, A4, is fixed at 440 Hz. In <strong>twelve-tone equal temperament</strong>, the tuning in everyday use, every semitone multiplies the frequency by the same number, 2^(1/12) ≈ 1.0595, so 12 semitones multiply it by exactly 2 (<a class="xlink" href="../../../math/algebra/exponents-logarithms/#step2">→ Exponents & logarithms, step 2: semitones = 12 × log₂(frequency ratio)</a>). The top picture is the keyboard; below, n (semitones from A4) runs across and frequency runs up, with a dot wherever you have been.',
    nSlider: 'Semitones from A4, n',
    s0lgKey: 'current key', s0lgDot: 'positions visited', s0lgCurve: 'f = 440 × 2^(n/12)',
    s0readout: '{name}: {an} semitones {dir} A4, frequency = 440 × 2^({n}/12) = {f} Hz. That is {dHz} Hz above the key to its left, or {r} times its frequency. {oct}',
    up: 'above', down: 'below',
    octNote: 'Exactly an octave: {x} times the frequency of A4.',
    s0hint: 'What to watch: drag n from −12 to 12 one step at a time. The “Hz above” figure keeps growing (from about 12 Hz to about 49 Hz), but the “times” figure stays at 1.0595; the dots get steeper towards the right — that is what multiplying looks like. At n = 12 the frequency has gone from 440 to 880.',

    s1k: 'Step 1 · Counting intervals',
    s1t: 'How far apart are two notes, and how do you count it?',
    s1e: 'This step asks: how do you measure the distance between two notes — the <strong>interval</strong> — and what is it called? To measure it, count keys to the right from the lower note, every key (black or white) adding 1; that gives k semitones. Common intervals have names. The number in the name counts letters (C to E spans C, D, E: a third), and “major”, “minor” or “perfect” then tells sizes within that number apart — a major third is 4 semitones, a minor third 3. The frequency ratio is 2^(k/12): it depends only on k, not on the starting note, which is why the same interval is the same “distance” wherever you play it.',
    rootSlider: 'Starting (lower) note', kSlider: 'Semitones up, k',
    s1lgLow: 'start', s1lgHigh: 'end', s1lgStep: 'semitones passed',
    s1readout: 'From {a} up {k} semitones to {b}: {iname}. Frequency {fa} Hz → {fb} Hz, ratio {r} (= 2^({k}/12)).',
    s1hint: 'What to watch: hold k = 7 and drag the starting note — both highlighted keys slide together and the ratio stays 1.4983. Then hold the start and take k from 0 to 12, watching the names change; note that k = 6 is exactly half an octave.',

    s2k: 'Step 2 · Shared overtones',
    s2t: 'Why do some intervals blend smoothly while others sound rough?',
    s2e: 'This step asks: when two notes sound together, what decides whether they blend? A vibrating string or air column gives off not only its fundamental f but also 2f, 3f, 4f, … at the same time — its <strong>overtones</strong> (<a class="xlink" href="../../../physics/waves/standing-wave/#step3">→ Standing waves, step 3: one string’s whole-number ladder</a>). Take a lower note f₁ and an upper note f₂ = f₁ × p/q, with p/q a whole-number ratio in lowest terms. Overtone m of the lower note, m·f₁, equals overtone n of the upper, n·f₂, exactly when m·q = n·p. The smaller p and q are, the more pairs coincide among the first 10 overtones. Overtones that coincide exactly leave each other alone; two that miss by a little produce <strong>beats</strong> — the loudness swells and fades |frequency difference| times a second, which sounds rough (<a class="xlink" href="../../../physics/waves/sound-waves/#step2">→ Sound waves, step 2: where beats come from</a>). <strong>Just intonation</strong> uses the whole-number ratios themselves; equal temperament uses 2^(k/12), which only comes close, so overtones that ought to coincide miss slightly. This is Helmholtz’s physical account of consonance, not the whole story: listening habits and musical style matter too.',
    tuneJust: 'Just (exact ratios)', tuneET: 'Equal temperament',
    s2lgLow: 'overtones of the lower note, A3', s2lgHigh: 'overtones of the upper note', s2lgMeet: 'a pair meant to coincide',
    s2readout: '{iname} ({k} semitones), nearest whole-number ratio {p}:{q}: {sh} coinciding pairs among the first 10 overtones. The equal-tempered ratio {et} is {c} cents {wide} than {p}/{q} (1 cent = 1/100 of a semitone). {beat}',
    wider: 'wider', narrower: 'narrower',
    beatJust: 'Just tuning is on: these overtones coincide exactly, so there are no beats.',
    beatET: 'Equal temperament is on: the lowest pair that ought to coincide (overtone {m} of the lower note, {n} of the upper) misses by {b} Hz — {b} beats per second.',
    beatNone: 'No pair coincides among the first 10 overtones; any beats come from elsewhere and are not computed here.',
    s2hint: 'What to watch: with “Just” selected, take k from 0 to 12 and count the green links — octave 5, fifth 3, fourth and major third 2 each, minor second and tritone 0. Then switch to “Equal temperament”: the fifth’s links barely move (only 2 cents off, about 0.7 beats a second on A3), while the major third visibly misses (about 14 cents off).',

    s3k: 'Step 3 · Scale steps',
    s3t: 'Why does a major scale use these seven notes?',
    s3e: 'This step asks: what decides which seven notes a key uses? A <strong>scale</strong> is a run of notes climbing from the <strong>tonic</strong> — the key’s starting point and “home” — by a fixed pattern of steps. The major pattern is W W H W W W H (W = whole step = 2 semitones, H = half step = 1 semitone): seven steps adding up to 12 semitones, landing on the tonic an octave higher. The natural minor pattern is W H W W H W W. Starting a major scale on C uses only white keys; start anywhere else and the same pattern needs black keys, and the sharps or flats it needs make up the <strong>key signature</strong>. The notes are numbered as scale <strong>degrees</strong>: degree 1 is the tonic, and degree 7 is the <strong>leading tone</strong>, just one semitone below the tonic above it. Spelling rule: each of the seven letters is used once, which is why F major has B♭ rather than A♯.',
    tonicSlider: 'Tonic', modeMajor: 'Major', modeMinor: 'Natural minor',
    s3lgNote: 'scale notes (number = degree)', s3lgW: 'whole step', s3lgH: 'half step',
    s3readout: '{tonic} {mode}: {notes}. Steps {pattern}. Key signature: {sig}.',
    sigSharp: '{n} sharp(s)', sigFlat: '{n} flat(s)', sigNone: 'no sharps or flats',
    s3hint: 'What to watch: stay in major and move the tonic from C to G, D, A — each move goes up a fifth (7 semitones) and adds one sharp to the signature; move from C to F instead and you get one flat. Then switch to natural minor and compare A minor with C major: the same white keys, just starting from a different note.',

    s4k: 'Step 4 · Chords & function',
    s4t: 'In a key, what kind of chord sits on each degree, and what job does it do?',
    s4e: 'This step asks: which chords can a major key’s seven notes build, and what role does each play? A <strong>triad</strong> starts on a degree and takes every other note, three in all (degrees 1-3-5, 2-4-6, …). Its lower and upper layers are each a third. Major third (4 semitones) below and minor third (3) above makes a <strong>major triad</strong>; the other way round, a <strong>minor triad</strong>; two minor thirds, a <strong>diminished triad</strong>. Roman numerals give the degree: upper case for major, lower case for minor, ° for diminished. <strong>Harmonic function</strong> sorts the seven chords into three groups. Tonic, T (I, iii, vi): they share two or three notes with the tonic chord I and sound settled. Subdominant, S (ii, IV): they contain degree 4 and tend to lead away from the tonic. Dominant, D (V, vii°): both contain the leading tone (degree 7), one semitone below the tonic; vii° also contains degree 4, 6 semitones from the leading tone — a tritone. This group sounds tense and tends to resolve to the tonic chord.',
    degSlider: 'Degree (1–7)',
    s4lgChord: 'the three chord notes', s4lgI: 'green dot at a key’s foot = a note of the tonic chord I', s4lgT: 'tonic function T', s4lgS: 'subdominant function S', s4lgD: 'dominant function D',
    s4readout: '{key} major, degree {d}: {roman} ({notes}), lower layer {lo} semitones, upper {up} → {quality}. {func}; shares {common} note(s) with the tonic chord I; {lt}{tt}',
    ltYes: 'contains the leading tone {x}; ', ltNo: 'no leading tone; ', ttYes: 'contains the tritone {a}–{b}.', ttNo: 'no tritone.',
    s4hint: 'What to watch: drag the degree from 1 to 7 and follow the seven boxes below: the major triads land on I, IV and V, the only diminished one is vii°, and the colours mark the T, S and D groups. Then change the tonic: every note name changes, yet the pattern of qualities and functions doesn’t move a single box.',

    s5k: 'Step 5 · Cadences',
    s5t: 'Why does V → I sound like the end of a sentence?',
    s5e: 'This step asks: when a phrase comes to rest, what actually happens between the two chords? A chord progression that closes a phrase is a <strong>cadence</strong>. This page counts four: the <strong>authentic cadence</strong> V → I (dominant to tonic); the <strong>plagal cadence</strong> IV → I; the <strong>half cadence</strong>, which stops on V like a comma; and the <strong>deceptive cadence</strong> V → vi, which turns aside to vi just when the tonic is expected. In the picture the left column holds the three upper voices of the first chord and the right column the second chord; each voice moves to the nearest note of the next chord so that the three voices move as few semitones as possible in total — this is <strong>voice leading</strong>. The number by each link is how far that voice moves (+ up, − down, 0 = held).',
    c1Slider: 'First chord (degree)', c2Slider: 'Second chord (degree)',
    preAuth: 'Authentic V→I', prePlag: 'Plagal IV→I', preHalf: 'Half ii→V', preDec: 'Deceptive V→vi',
    s5lgV: 'voices (left = first chord, right = second)', s5lgLt: 'path of the leading tone', s5lgFa: 'path of degree 4',
    s5readout: '{key} major: {r1} ({n1}) → {r2} ({n2}). {type}The three voices move {total} semitones in all, and {common} note(s) are held. {lt}{fa}',
    tAuthentic: 'Authentic cadence. ', tLeading: 'Leading-tone chord vii° to the tonic: like the authentic cadence, it resolves the leading tone. ', tPlagal: 'Plagal cadence. ', tHalf: 'Half cadence: it stops on V and the sentence isn’t finished. ', tDeceptive: 'Deceptive cadence: after V it goes to vi instead of I. ', tNone: 'Not one of the four cadences on this page. ',
    ltRes: 'The leading tone {x} rises a semitone to the tonic {y}. ', faRes: 'Degree 4, {x}, falls a semitone to degree 3, {y}. ',
    s5hint: 'What to watch: press “Authentic V→I” first — one voice holds, and the leading tone rises just one semitone onto the tonic. Then “Deceptive V→vi”: the leading tone still rises to the tonic, but the other two voices go to vi’s notes, so you never land on a full tonic chord. The sense of “finished” needs both at once: the leading tone resolving and the tonic chord arriving. Finally drag the two degrees yourself and watch the total motion.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Wrap-up: counted all the way — now a few self-check questions',
    s6fin: 'Looking back: <strong>each of these musical “feelings” has a countable quantity behind it</strong>. A semitone multiplies frequency by 2^(1/12), so an interval is a count of semitones. Simple whole-number ratios make overtones coincide in pairs, and equal temperament only approximates those ratios. A scale is a fixed pattern of whole and half steps, and changing the tonic just shifts it. A triad is two stacked thirds, and its function depends on how many notes it shares with the tonic chord and whether it holds the leading tone. At a cadence the leading tone rises a semitone, every voice takes a small step, and the tonic chord arrives.',
    formula: 'f(n) = 440 × 2^(n/12) Hz, n = semitones from A4\nMajor scale: W W H W W W H; major triad = 4 + 3, minor = 3 + 4, diminished = 3 + 3\nCoinciding pairs in the first 10 overtones = ⌊10 ÷ max(p, q)⌋ (interval ratio p:q in lowest terms)',
    boundary: 'Where this applies: twelve-tone equal temperament and 5-limit just intonation; major and natural-minor keys of Western tonal music; simplified voice leading in three upper voices (the bass usually leaps between roots, which is not drawn here). Shared overtones are one physical account of consonance, not the whole of it. The page plays no sound, so “sounds like” descriptions come from common listening experience, not from anything measured here.',
    quizTitle: 'Self-check: the page draws a random question and checks it with the same calculations',
    checkQ: 'Check', newQ: 'Another question', showQ: 'Show answer',
    qInt: 'How many semitones is it from {a} up to {b}?',
    qTri: 'In {key} major, what kind of triad is built on degree {d}?',
    qCad: 'In {key} major, chord {n1} followed by {n2} — which cadence is it?',
    optSemis: '{k} semitones',
    oAuthentic: 'authentic cadence', oPlagal: 'plagal cadence', oHalf: 'half cadence', oDeceptive: 'deceptive cadence',
    whyInt: '{k} semitones: {iname}.', whyTri: '{notes}: lower layer {lo}, upper {up} semitones → {q} ({roman}).', whyCad: '{r1} → {r2}: {t}',
    qRight: 'Correct. {why}', qWrong: 'Not yet — try again, or press “Show answer”.', qShown: 'Answer: {why}', qEmpty: 'Pick an option first.',
    linksTitle: 'Where to go next',
    lk1: '→ Exponents & logarithms, step 2: semitones are the logarithm of a frequency ratio',
    lk2: '→ Sound waves, step 2: why two nearly equal frequencies beat',
    lk3: '→ Standing waves, step 3: why overtones are whole multiples of the fundamental',
    lk4: '→ Sound waves, step 3: timbre is a recipe of overtones',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Music Theory · From Intervals to Cadence”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
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
  if (typeof window.refreshMT === 'function') window.refreshMT();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MT_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
