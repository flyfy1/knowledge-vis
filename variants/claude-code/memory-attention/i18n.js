'use strict';
// Attention & memory lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '注意与记忆 · 五个小模型解释「记不住」',
    back: '← 知识索引',
    compare: '对照另一版本：心理与认知 · 注意、记忆与干扰 →',
    navLabel: '注意与记忆步骤导航',
    tagline: '「记不住」可能是工作台放不下、复述不够、注意被占住、线索没对上，或者被别的记忆挤掉。本页用五个可以亲手调参的小模型，各自解释一种原因，并对照心理学里有名的实验结果。所有数字都是模型算出来的，不是测验分数。',
    nav0: '0 容量与组块', nav1: '1 系列位置', nav2: '2 注意瓶颈', nav3: '3 提取线索', nav4: '4 干扰', nav5: '5 收束',

    s0k: '第 0 步 · 容量与组块',
    s0t: '同样 12 个字符，为什么有人记得住、有人记不住？',
    s0e: '这一步要回答：<strong>工作记忆</strong>——一边做事一边临时记着东西的那块「心理工作台」——到底能放多少？答案不是固定的字符数，而是<strong>组块</strong>数。组块是借助已有知识打包成一个整体的一组东西：FBICIAUSANBA 有 12 个字母，认得 FBI、CIA、USA、NBA 的人只需记 4 个组块，不认得的人要记 12 个零散字母。研究者常把成年人在不复述、不组块时的容量估计为大约 3 到 5 个组块（Cowan 2001 的综述），而且人与人之间有差异。本页的模型很简单：工作台有 K 个槽，组块按出现顺序放进去，放满之后来的就丢了。图的上半部分是要记的字符串，下面的括线标出组块；下半部分是 K 个槽里实际留下的内容。',
    strAcr: '缩写 FBICIAUSANBA', strYears: '年份 149217761984', strRand: '随机字母 QJXRTMWLKPZD', familiar: '我认得其中的含义',
    kSlider: '工作记忆容量 K（组块）',
    lgHeld: '留在工作台的组块', lgLost: '放不下、丢掉的', lgEmptySlot: '空槽',
    cStr: '要记的字符串（括线 = 一个组块）', cSlots: '工作台的 {k} 个槽',
    s0readout: '共 {units} 个组块，容量 K = {k}：留下 {held} 个组块，合计 {rec} / {n} 个字符。{verdict}',
    vAll: '全部记住。', vSome: '丢了 {lost} 个组块。',
    s0hint: '观察顺序：先选「缩写」并打开「我认得其中的含义」：12 个字母被打包成 4 个组块，K = 4 时全部放下。再关掉它：同样的字母变成 12 个组块，只留下前 4 个字母。选「随机字母」时开关不起作用，因为没有可借用的知识。最后拖 K：认得含义时 K = 3 就会丢掉一个缩写；不认得时要 K = 12 才够，而滑杆最大只有 7。',

    s1k: '第 1 步 · 系列位置',
    s1t: '记一串词，为什么开头和结尾记得最牢？',
    s1e: '这一步要回答：念一串词让人马上<strong>自由回忆</strong>（不限顺序，想起什么写什么），为什么各个位置的回忆率不一样？经典实验发现两头高、中间低：开头高叫<strong>首因效应</strong>，结尾高叫<strong>近因效应</strong>。这里用一个<strong>复述缓冲模型</strong>（仿 Atkinson 与 Shiffrin 1968 年的思路）模拟 2000 名虚拟被试。缓冲区相当于工作记忆，最多放 4 个词；新词进来时随机挤掉一个旧词。词留在缓冲区时会被默念复述，每秒的复述时间平分给缓冲区里的词；复述越多，存进<strong>长时记忆</strong>的痕迹越强，从长时记忆想起的概率 = 1 − e^(−0.35 × 复述秒数)。回忆时，还在缓冲区里的词几乎都能直接说出来（0.95）。开头的词在缓冲区没满时独享复述时间，所以首因来自长时记忆；结尾的词还在缓冲区里，所以近因来自缓冲区。图的横轴是词在列表中的位置，纵轴是回忆概率；青色部分来自长时记忆，叠在上面的橙色部分是缓冲区额外贡献的。',
    lenSlider: '列表长度（个词）', rateSlider: '呈现速度（秒 / 词）', delayBtn: '回忆前先倒数 30 秒', clearGhost: '清空灰色旧曲线',
    lgLtm: '来自长时记忆', lgBuf: '来自缓冲区（工作记忆）', lgGhost: '之前试过的设置',
    cSerial: '回忆概率 · 横轴为列表中的位置',
    s1readout: '{len} 个词、每词 {rate} 秒{delay}：第 1 个 {first}，中间最低 {mid}（第 {midPos} 个），最后一个 {last}，全列表平均 {mean}。',
    delayOn: '、回忆前倒数 30 秒', delayOff: '',
    s1hint: '观察顺序：先看默认设置（12 个词、每词 2 秒）的 U 形曲线。把呈现速度调到 4 秒：开头和中间升高，最后几个几乎不变——放慢只帮了长时记忆（与 Glanzer 和 Cunitz 1966 年的发现方向一致）。再打开「倒数 30 秒」：橙色的近因部分整个消失，首因还在；模型里最后几个甚至最低，因为它们得到的复述最少。最后把列表加长到 20：中间那段更长、更平。',

    s2k: '第 2 步 · 注意瓶颈',
    s2t: '两件事几乎同时来，第二件为什么要等？',
    s2e: '这一步要回答：同时做两件事时，慢下来的究竟是哪一段？经典的<strong>心理不应期</strong>（PRP）实验是这样的：先出现刺激 1（比如一个音，要按左键或右键），隔一小段时间再出现刺激 2（比如一个字母，要说出它）。两个刺激出现的时间差叫 <strong>SOA</strong>，单位毫秒。时间差越短，对第二个刺激的反应越慢。Pashler（1994）总结的<strong>中枢瓶颈模型</strong>把每个任务拆成三段：A 感知（看见、听见），B 中枢决策（想好该怎么反应），C 动作执行。两个任务的 A 和 C 可以同时进行，B 一次只能处理一个任务，这就是瓶颈：任务 2 的 B 必须等任务 1 的 B 做完才能开始，这段等待叫<strong>空闲等待</strong>。图的上半部分是两个任务的时间线（横轴为毫秒，从刺激 1 出现算起）；下半部分是任务 2 的反应时 RT2（从刺激 2 出现到动作完成）随 SOA 的变化，白线是模型给出的整条曲线，圆点是你试过的 SOA。各阶段的时长是示意值。',
    soaSlider: '刺激间隔 SOA（ms）', b1Slider: '任务 1 中枢决策 B1 的时长（ms）', hardBtn: '任务 2 的刺激更难看清（A2：100 → 250 ms）', sweepSoa: '把 SOA 从 0 扫到 800 ms',
    lgA: 'A 感知', lgB: 'B 中枢决策（瓶颈）', lgC: 'C 动作', lgWait: '等瓶颈空出来', lgRt2: '模型的 RT2 曲线；圆点 = 试过的 SOA',
    cGantt: '两个任务的时间线（ms，从刺激 1 出现算起）', cRt2: '任务 2 反应时 RT2（ms）· 横轴为 SOA（ms）', task1: '任务 1', task2: '任务 2',
    s2readout: 'SOA = {soa} ms：任务 1 用时 {rt1} ms；任务 2 等待 {wait} ms，RT2 = {rt2} ms。临界 SOA = A1 + B1 − A2 = {crit} ms：SOA 比它短就要等，SOA 每缩短 1 ms，RT2 就多 1 ms；比它长时 RT2 固定为 A2 + B2 + C2 = {flat} ms。',
    s2hint: '观察顺序：先按「把 SOA 从 0 扫到 800 ms」：下半部分的圆点沿斜率 −1 的直线下降，过了临界 SOA 后变平；上半部分粉色的等待段随之缩短到消失。再把 B1 加长：短 SOA 处的 RT2 整体升高，长 SOA 处不变——任务 1 想得越久，任务 2 等得越久。最后打开「刺激更难看清」：长 SOA 时 RT2 多出 150 ms；SOA 很短时却完全不变，因为多出来的感知时间正好填进了原本的等待里。这是实验里用来判断瓶颈位置的经典手法。',

    s3k: '第 3 步 · 提取线索',
    s3t: '明明学过，为什么换个提示就想起来了？',
    s3e: '这一步要回答：想不起来，是记忆痕迹没了，还是线索没对上？<strong>编码</strong>是把经历存成记忆痕迹，<strong>提取</strong>是事后把它找回来。Tulving 提出的<strong>编码特异性原则</strong>说：提取时的线索和编码时存下的特征重叠越多，越容易想起。这里用一个<strong>特征重叠模型</strong>来算。痕迹由三类特征组成：1 个基础特征（「这是那次实验里的词」）；语义特征，即加工时想到的含义——<strong>浅加工</strong>（只判断字母大小写）存 1 个，<strong>深加工</strong>（判断词的意思）存 5 个；2 个环境特征（学习时所在的房间）。回忆时，自己想出的线索最多对上 2 个语义特征，给出类别提示（比如「一种水果」）最多对上 4 个；在同一个房间回忆，还能对上 2 个环境特征。每个对上的特征各有 20% 的机会把整条痕迹唤回，所以回忆概率 = 1 − 0.8^(对上的特征数)。图的上半部分是痕迹与线索的特征，对上的用竖线连起；下半部分是 8 种条件的回忆概率。这是教学模型，数值不是实验数据；它再现的方向与经典研究一致：深加工更好记（Craik 与 Lockhart 1972），有提示比自由回忆好（Tulving 与 Pearlstone 1966），在同一环境回忆更好（Godden 与 Baddeley 1975）。「想得起」之外还有「认得出」，认出时的判断可以用<a class="xlink" href="../../../psychology/cognition/signal-detection/#step1">信号检测论第 1 步（每次判断背后的证据强度）</a>来分析。',
    deepBtn: '深加工（想含义）', roomBtn: '在学习时的房间回忆', cueBtn: '给出类别提示',
    lgBase: '基础特征', lgSem: '语义特征', lgCtx: '环境特征', lgCur: '当前条件', lgOther: '其他条件',
    cFeat: '记忆痕迹与提取线索（对上的特征用竖线连起）', rowTrace: '痕迹', rowCue: '线索', cBars: '8 种条件的回忆概率', gShallow: '浅加工', gDeep: '深加工',
    s3readout: '{depth}、{room}、{cue}：痕迹里有 {enc} 个语义特征；线索对上 基础 1 + 语义 {sem} + 环境 {ctx} = {m} 个特征，回忆概率 1 − 0.8^{m} = {p}。',
    depthS: '浅加工', depthD: '深加工', roomSame: '同一房间', roomDiff: '换了房间', cueFree: '自由回忆', cueCat: '有类别提示',
    s3hint: '观察顺序：先保持浅加工，开关「类别提示」：概率不变，因为痕迹里只有 1 个语义特征，提示再丰富也只能对上 1 个。换成深加工再开关提示：概率明显变化——提示只有在编码时存下了对应特征才有用。最后开关「房间」：两种加工下都相差 2 个特征。下半部分每组 4 根柱子依次是：同房间自由回忆、同房间有提示、换房间自由回忆、换房间有提示。',

    s4k: '第 4 步 · 干扰',
    s4t: '新学的会挤掉旧的，旧的也会挡住新的吗？',
    s4e: '这一步要回答：为什么学了一份相似的材料以后，另一份更难想起？经典做法是让人学「线索 → 答案」的配对（比如 狗 → 椅子），再学一份线索相同、答案不同的配对（狗 → 云）。回忆时同一个线索连着两个答案，它们互相竞争。后学的妨碍先学的，叫<strong>后摄干扰</strong>；先学的妨碍后学的，叫<strong>前摄干扰</strong>。这里用一个<strong>竞争模型</strong>：每组配对有一个强度，随时间按 e^(−小时数 ÷ 24) 衰减。目标配对在第 0 小时学，测验在第 12 + 延迟 小时，三种设计的保持时间相同；前摄组在第 −12 小时先学另一份，后摄组在第 12 小时学另一份，对照组什么也不加。另一份与目标越相似，它在竞争中算得越多（强度乘以相似度）；另有固定的背景噪声 0.3。说出正确答案的概率 = 目标强度 ÷（目标强度 + 相似度 × 竞争者强度 + 0.3）。图的上部是时间线（横轴为小时），中部是测验时的三份强度，下部是三种设计的正确率随延迟的变化。数值来自模型，不是实验数据。',
    dCtl: '对照：只学目标', dPro: '前摄：先学另一份', dRet: '后摄：后学另一份',
    simSlider: '另一份材料的相似度（0 = 完全无关，1 = 线索完全相同）', delaySlider: '第 12 小时之后，再过多久测验（小时）',
    lgTarget: '目标配对的强度', lgComp: '竞争配对（× 相似度）', lgNoise: '背景噪声', lgTest: '测验时刻',
    cTime: '时间线（小时）', cStrength: '测验时的强度', cCurve: '正确率 · 横轴为延迟（小时）',
    s4readout: '{design}，相似度 {sim}，延迟 {delay} 小时：目标强度 {sT}，竞争 {sC}，噪声 0.3 → 正确率 {p}（同延迟的对照组为 {pc}）。',
    s4hint: '观察顺序：延迟 0、相似度 0.8 时依次点三种设计：对照最高，前摄次之，后摄最低——模型里后学的那份离测验最近，强度最高。把相似度拖到 0：三种设计完全一样，干扰消失。再拖延迟：三条曲线都随时间下降，因为两份强度都在衰减，固定的背景噪声占的比重越来越大；三者的差距也随之缩小。',
    quizPrompt: '相似度 0.8、延迟 0 时，后摄设计的正确率为什么比前摄低？',
    quizA: '后摄组的目标学得更晚', quizB: '后摄组的竞争者是最近学的，强度更高，竞争更强', quizC: '后摄组的背景噪声更大',
    check: '检查答案',
    correct: '对。两组目标的强度相同（都在第 0 小时学、在同一时刻测）；区别在竞争者：后摄组的在第 12 小时学，前摄组的在第 −12 小时学，越新越强。',
    wrong: '再看中部的强度柱：两组的青色目标柱一样高，背景噪声也一样，差的是哪一根？',

    s5k: '第 5 步 · 收束',
    s5t: '「记不住」至少有五种不同的原因',
    s5fin: '第 0 步：工作台按<strong>组块</strong>算容量，已有知识能把很多字符打包成少数几块。第 1 步：开头的词靠复述进了长时记忆，结尾的词还在工作记忆里，所以回忆曲线两头高；拖延回忆会抹掉结尾的优势。第 2 步：两件事同时来时，慢在一次只能处理一件的<strong>中枢决策</strong>，感知和动作可以并行。第 3 步：想不起来不一定是忘了，可能是线索没对上编码时存下的特征。第 4 步：相似的记忆会在提取时竞争，新学的和旧学的都可能挡住目标。',
    formula: '长时记忆：P = 1 − e^(−0.35 × 复述秒数)；缓冲区内 P ≈ 0.95\nRT2 = max(SOA + A2, A1 + B1) + B2 + C2 − SOA\n提取：P = 1 − 0.8^(对上的特征数)\n干扰：P = 目标 ÷ (目标 + 相似度 × 竞争者 + 0.3)',
    boundary: '适用范围：五个都是教学模型，参数是为了让现象看得清楚而挑选的，不是从某个实验拟合出来的；它们只再现文中所引研究的定性方向，不给出真实的百分比。真实的记忆和注意还受年龄、动机、睡眠、情绪、材料类型等因素影响，研究者对这些机制也有不同的模型。本页不是智力或记忆测验，不能用来诊断、评估或比较任何人。',
    linksTitle: '继续探索',
    lk1: '信号检测论：「见过 / 没见过」的判断背后的证据强度 →',
    lk2: '信号检测论：判据——同样的记忆强度，愿不愿意说「见过」→',
    lk3: '神经基础：不应期——单个神经元也有「忙不过来」的时间 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《心理与认知 · 注意、记忆与干扰》的平行版本。所有数值来自页面内的教学模型。'
  },
  en: {
    pageTitle: 'Attention & Memory · Five Small Models of Forgetting',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Psychology & Cognition · Attention, Memory & Interference →',
    navLabel: 'Attention and memory steps',
    tagline: '“I can’t remember” can mean the workbench was full, the rehearsal was too short, attention was busy, the cue didn’t match, or another memory got in the way. This page gives each cause its own small model you can tune, and checks it against a well-known result from psychology. Every number is a model output, not a test score.',
    nav0: '0 Capacity & chunks', nav1: '1 Serial position', nav2: '2 Attention bottleneck', nav3: '3 Retrieval cues', nav4: '4 Interference', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Capacity & chunks',
    s0t: 'The same 12 characters — why can some people hold them and others not?',
    s0e: 'The question here: how much fits in <strong>working memory</strong> — the mental workbench where you hold things briefly while doing something else? The answer is not a fixed number of characters but a number of <strong>chunks</strong>. A chunk is a group packed into one unit using what you already know: FBICIAUSANBA is 12 letters, but someone who knows FBI, CIA, USA and NBA holds just 4 chunks, while someone who doesn’t must hold 12 loose letters. Researchers often put adult capacity, without rehearsal or chunking, at roughly 3 to 5 chunks (reviewed by Cowan, 2001), and it varies between people. The model here is simple: the workbench has K slots, chunks go in in the order they appear, and anything arriving after the slots are full is lost. The top of the picture is the string to remember, with brackets marking the chunks; the bottom shows what actually stays in the K slots.',
    strAcr: 'Acronyms FBICIAUSANBA', strYears: 'Years 149217761984', strRand: 'Random letters QJXRTMWLKPZD', familiar: 'I know what these mean',
    kSlider: 'Working-memory capacity K (chunks)',
    lgHeld: 'Chunks kept on the workbench', lgLost: 'Didn’t fit — lost', lgEmptySlot: 'Empty slot',
    cStr: 'The string to remember (bracket = one chunk)', cSlots: 'The workbench’s {k} slots',
    s0readout: '{units} chunks, capacity K = {k}: {held} chunks kept, {rec} of {n} characters in all. {verdict}',
    vAll: 'Everything is held.', vSome: '{lost} chunk(s) lost.',
    s0hint: 'What to watch: choose “Acronyms” and switch on “I know what these mean” — the 12 letters pack into 4 chunks and all fit at K = 4. Switch it off: the same letters become 12 chunks and only the first 4 letters stay. With “Random letters” the switch does nothing, because there is no knowledge to borrow. Finally drag K: knowing the meanings, K = 3 already loses one acronym; not knowing them, you would need K = 12, and the slider stops at 7.',

    s1k: 'Step 1 · Serial position',
    s1t: 'Why are the first and last words of a list remembered best?',
    s1e: 'The question here: read someone a list of words and ask for immediate <strong>free recall</strong> (any order, whatever comes to mind) — why does recall depend on position? Classic experiments find a U shape: the start is high (<strong>primacy effect</strong>) and the end is high (<strong>recency effect</strong>). Here a <strong>rehearsal-buffer model</strong> (in the spirit of Atkinson and Shiffrin, 1968) simulates 2000 virtual participants. The buffer plays the role of working memory and holds at most 4 words; a new word knocks out a random old one. While a word sits in the buffer it gets silently rehearsed, and each second of rehearsal is shared among the words in the buffer; the more rehearsal, the stronger its trace in <strong>long-term memory</strong>, with recall from long-term memory = 1 − e^(−0.35 × seconds rehearsed). At recall, words still in the buffer can almost always be reported directly (0.95). Early words get the rehearsal to themselves while the buffer is still filling, so primacy comes from long-term memory; the last words are still in the buffer, so recency comes from the buffer. The horizontal axis is the word’s position in the list, the vertical axis the recall probability; cyan is the long-term part, and the orange stacked on top is the buffer’s extra contribution.',
    lenSlider: 'List length (words)', rateSlider: 'Presentation rate (seconds per word)', delayBtn: 'Count backwards for 30 s before recall', clearGhost: 'Clear grey curves',
    lgLtm: 'From long-term memory', lgBuf: 'From the buffer (working memory)', lgGhost: 'Settings you tried before',
    cSerial: 'Recall probability · position in the list across',
    s1readout: '{len} words at {rate} s each{delay}: first word {first}, lowest in the middle {mid} (position {midPos}), last word {last}; list average {mean}.',
    delayOn: ', with 30 s of counting before recall', delayOff: '',
    s1hint: 'What to watch: start with the default (12 words, 2 s each) and its U shape. Slow the rate to 4 s: the start and middle rise, the last few barely move — slowing down helps only long-term memory (the same direction Glanzer and Cunitz found in 1966). Switch on “count backwards”: the orange recency part vanishes while primacy stays; in the model the last few even end up lowest, because they got the least rehearsal. Finally lengthen the list to 20: the middle stretch grows longer and flatter.',

    s2k: 'Step 2 · Attention bottleneck',
    s2t: 'Two things arrive almost at once — why does the second one wait?',
    s2e: 'The question here: when you do two things at once, which part actually slows down? The classic <strong>psychological refractory period</strong> (PRP) experiment works like this: stimulus 1 appears (a tone, say — press left or right), then after a short gap stimulus 2 (a letter — name it). The gap between the two onsets is the <strong>SOA</strong>, in milliseconds. The shorter the gap, the slower the response to the second stimulus. The <strong>central bottleneck model</strong> summarised by Pashler (1994) splits each task into three stages: A perception (seeing, hearing), B central decision (working out the response), C movement. The A and C stages of the two tasks can run at the same time, but B handles one task at a time — that is the bottleneck: task 2’s B cannot start until task 1’s B is done, and that wait is called <strong>slack</strong>. The top of the picture shows both tasks on a timeline (milliseconds from stimulus 1); the bottom shows task 2’s response time RT2 (from stimulus 2 to the finished movement) against SOA — the white line is the model’s full curve, the dots are SOAs you tried. Stage durations are illustrative.',
    soaSlider: 'Stimulus onset asynchrony SOA (ms)', b1Slider: 'Duration of task 1’s central stage B1 (ms)', hardBtn: 'Task 2’s stimulus is harder to see (A2: 100 → 250 ms)', sweepSoa: 'Sweep SOA from 0 to 800 ms',
    lgA: 'A perception', lgB: 'B central decision (bottleneck)', lgC: 'C movement', lgWait: 'Waiting for the bottleneck', lgRt2: 'Model RT2 curve; dots = SOAs tried',
    cGantt: 'Both tasks on a timeline (ms from stimulus 1)', cRt2: 'Task 2 response time RT2 (ms) · SOA (ms) across', task1: 'Task 1', task2: 'Task 2',
    s2readout: 'SOA = {soa} ms: task 1 takes {rt1} ms; task 2 waits {wait} ms, RT2 = {rt2} ms. Critical SOA = A1 + B1 − A2 = {crit} ms: below it task 2 must wait, and every 1 ms shorter SOA adds 1 ms to RT2; above it RT2 stays at A2 + B2 + C2 = {flat} ms.',
    s2hint: 'What to watch: press “Sweep SOA from 0 to 800 ms” — in the bottom half the dots fall along a line of slope −1 and level off after the critical SOA, while the pink wait in the top half shrinks to nothing. Lengthen B1: RT2 rises at short SOAs and is unchanged at long ones — the longer task 1 thinks, the longer task 2 waits. Finally switch on “harder to see”: at long SOAs RT2 grows by 150 ms, but at very short SOAs it does not change at all, because the extra perception time simply fills the wait that was there anyway. Experimenters use exactly this trick to locate the bottleneck.',

    s3k: 'Step 3 · Retrieval cues',
    s3t: 'You studied it — why does a different hint suddenly bring it back?',
    s3e: 'The question here: when you can’t recall something, is the trace gone, or did the cue just miss it? <strong>Encoding</strong> stores an experience as a memory trace; <strong>retrieval</strong> finds it again later. Tulving’s <strong>encoding specificity principle</strong> says: the more the cue at retrieval overlaps with the features stored at encoding, the easier recall is. A <strong>feature-overlap model</strong> does the arithmetic here. The trace has three kinds of features: 1 base feature (“a word from that experiment”); semantic features — meanings thought of while studying: <strong>shallow processing</strong> (only judging upper or lower case) stores 1, <strong>deep processing</strong> (judging what the word means) stores 5; and 2 context features (the room you studied in). At recall, cues you generate yourself match at most 2 semantic features, a category hint (“a kind of fruit”) at most 4; recalling in the same room matches the 2 context features as well. Each matched feature independently has a 20% chance of bringing back the whole trace, so recall = 1 − 0.8^(matched features). The top of the picture shows the trace and cue features, with matches joined by vertical lines; the bottom shows recall in 8 conditions. This is a teaching model and its numbers are not data, but it reproduces the direction of classic findings: deep processing is remembered better (Craik and Lockhart, 1972), hints beat free recall (Tulving and Pearlstone, 1966), and recall is better in the same setting (Godden and Baddeley, 1975). Besides recalling there is recognising, and recognition judgements can be analysed with <a class="xlink" href="../../../psychology/cognition/signal-detection/#step1">signal detection, step 1 (the evidence strength behind every judgement)</a>.',
    deepBtn: 'Deep processing (think about meaning)', roomBtn: 'Recall in the study room', cueBtn: 'Give a category hint',
    lgBase: 'Base feature', lgSem: 'Semantic features', lgCtx: 'Context features', lgCur: 'Current condition', lgOther: 'Other conditions',
    cFeat: 'Memory trace and retrieval cue (matched features joined)', rowTrace: 'trace', rowCue: 'cue', cBars: 'Recall probability in 8 conditions', gShallow: 'Shallow', gDeep: 'Deep',
    s3readout: '{depth}, {room}, {cue}: the trace holds {enc} semantic feature(s); the cue matches base 1 + semantic {sem} + context {ctx} = {m} features, recall 1 − 0.8^{m} = {p}.',
    depthS: 'Shallow processing', depthD: 'Deep processing', roomSame: 'same room', roomDiff: 'different room', cueFree: 'free recall', cueCat: 'category hint',
    s3hint: 'What to watch: keep shallow processing and toggle the category hint — nothing changes, because the trace holds only 1 semantic feature, so even a rich hint can match just 1. Switch to deep processing and toggle the hint again — now it matters: a hint only helps if the matching features were stored at encoding. Finally toggle the room: it is worth 2 features under both kinds of processing. In the bottom half, each group of 4 bars is, in order: same room free recall, same room with hint, different room free recall, different room with hint.',

    s4k: 'Step 4 · Interference',
    s4t: 'New learning crowds out old — can old learning block the new too?',
    s4e: 'The question here: why does learning similar material make other material harder to recall? The classic method has people learn cue → answer pairs (dog → chair), then a list with the same cues and different answers (dog → cloud). At recall one cue is linked to two answers, and they compete. When later learning hurts earlier learning it is <strong>retroactive interference</strong>; when earlier learning hurts later learning it is <strong>proactive interference</strong>. A <strong>competition model</strong> is used here: each set of pairs has a strength that decays as e^(−hours ÷ 24). The target pairs are learned at hour 0 and tested at hour 12 + delay, so the retention interval is the same in every design; the proactive group learns the other list first, at hour −12, the retroactive group learns it at hour 12, and the control group learns nothing extra. The more similar the other list is to the target, the more it counts in the competition (its strength is multiplied by the similarity); there is also a fixed background noise of 0.3. The chance of giving the right answer = target ÷ (target + similarity × competitor + 0.3). The top of the picture is the timeline (hours across), the middle shows the three strengths at test, and the bottom shows each design’s accuracy against delay. The numbers come from the model, not from experiments.',
    dCtl: 'Control: target only', dPro: 'Proactive: other list first', dRet: 'Retroactive: other list after',
    simSlider: 'Similarity of the other list (0 = unrelated, 1 = same cues)', delaySlider: 'Extra wait after hour 12 before the test (hours)',
    lgTarget: 'Target pair strength', lgComp: 'Competing pair (× similarity)', lgNoise: 'Background noise', lgTest: 'Time of test',
    cTime: 'Timeline (hours)', cStrength: 'Strengths at test', cCurve: 'Accuracy · delay (hours) across',
    s4readout: '{design}, similarity {sim}, delay {delay} h: target strength {sT}, competitor {sC}, noise 0.3 → accuracy {p} (control at the same delay: {pc}).',
    s4hint: 'What to watch: at delay 0 and similarity 0.8, click the three designs in turn — control is highest, proactive next, retroactive lowest; in the model the list learned last is closest to the test and strongest. Drag similarity to 0: all three designs become identical and the interference disappears. Then drag the delay: all three curves fall, because both strengths decay and the fixed background noise weighs more and more; the gaps between them shrink as well.',
    quizPrompt: 'At similarity 0.8 and delay 0, why is accuracy lower in the retroactive design than in the proactive one?',
    quizA: 'The retroactive group learned the target later', quizB: 'The retroactive group’s competitor was learned most recently, so it is stronger and competes harder', quizC: 'The retroactive group has more background noise',
    check: 'Check answer',
    correct: 'Right. The targets are equally strong in both groups (learned at hour 0, tested at the same time); the difference is the competitor — learned at hour 12 in the retroactive group and at hour −12 in the proactive group, and newer means stronger.',
    wrong: 'Look at the strength bars in the middle again: the cyan target bar is the same height in both groups, and so is the noise — which bar differs?',

    s5k: 'Step 5 · Wrap-up',
    s5t: '“I can’t remember” has at least five different causes',
    s5fin: 'Step 0: the workbench counts <strong>chunks</strong>, and what you already know can pack many characters into a few chunks. Step 1: early words reach long-term memory through rehearsal and the last words are still in working memory, so the recall curve is high at both ends; delaying recall wipes out the advantage at the end. Step 2: when two tasks arrive together, the slowdown sits in the <strong>central decision</strong> stage, which handles one task at a time, while perception and movement run in parallel. Step 3: failing to recall is not necessarily forgetting — the cue may simply miss the features stored at encoding. Step 4: similar memories compete at retrieval, and both newer and older learning can block the target.',
    formula: 'Long-term memory: P = 1 − e^(−0.35 × seconds rehearsed); in the buffer P ≈ 0.95\nRT2 = max(SOA + A2, A1 + B1) + B2 + C2 − SOA\nRetrieval: P = 1 − 0.8^(matched features)\nInterference: P = target ÷ (target + similarity × competitor + 0.3)',
    boundary: 'Scope: all five are teaching models; their parameters were chosen to make the effects easy to see, not fitted to any experiment, and they reproduce only the qualitative direction of the studies cited — not real percentages. Real memory and attention also depend on age, motivation, sleep, emotion, the kind of material and more, and researchers disagree about some of these mechanisms. This page is not an intelligence or memory test and must not be used to diagnose, assess or compare anyone.',
    linksTitle: 'Keep exploring',
    lk1: 'Signal detection: the evidence strength behind “seen it / not seen it” →',
    lk2: 'Signal detection: the criterion — same memory strength, different willingness to say “seen it” →',
    lk3: 'Neuroscience basics: the refractory period — even a single neuron has time when it is too busy →',
    foot: 'This page was written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Psychology & Cognition · Attention, Memory & Interference”. Every number comes from the teaching models in the page.'
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
  if (typeof window.refreshMemory === 'function') window.refreshMemory();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.MEM_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
