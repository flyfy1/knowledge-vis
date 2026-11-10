'use strict';
// Word-embedding lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).
// Corpus words themselves are glossed in model.js (VOCAB); these are the page's own strings.

const STRINGS = {
  zh: {
    pageTitle: '词向量 · 从「常和谁一起出现」画出词的地图',
    back: '← 知识索引',
    compare: '对照另一版本：词向量 · 把词摆成地图 →',
    navLabel: '词向量步骤导航',
    tagline: '计算机拿到的只是一个个词。怎样把「猫」变成一串数，让「猫」和「狗」的数挨得近、和「王冠」的数离得远？本页只用一个 28 句的小语料，不靠任何人工标注，一步步从「这个词常和谁一起出现」数出词向量，量出相似度，压成一张二维地图，再看「国王 − 男人 + 女人」为什么会落到「女王」附近。',
    nav0: '0 编号不够', nav1: '1 数邻居', nav2: '2 余弦相似', nav3: '3 压低常见词', nav4: '4 压成地图', nav5: '5 类比', nav6: '6 收束',
    wordA: '词 A', wordB: '词 B', target: '要看的词',

    s0k: '第 0 步 · 编号不够',
    s0t: '给每个词一个编号，能不能看出哪些词意思相近？',
    s0e: '这一步要回答：最简单的表示法能不能表达「相近」？本页的词表有 29 个词。最简单的做法是<strong>独热编码</strong>：每个词是一串 29 个数，只有自己那一位是 1，其余都是 0。比较两串数，常用<strong>点积</strong>（对应位置相乘再相加）。图中前两行是 A、B 的独热编码（亮格 = 1），第三行是逐位乘积。',
    c0: '29 位独热编码（亮格 = 1）与逐位乘积',
    rowProd: 'A×B',
    s0readout: 'A = {a}，B = {b}：点积 {d}，余弦相似度 {c}，距离 {e}。{note}',
    s0same: 'A 和 B 是同一个词。',
    s0diff: '任何两个不同的词都是这样：点积 0、距离 1.414。独热编码里，「猫」离「狗」和离「王冠」一样远，编号本身不带任何意思。',
    s0hint: '观察顺序：先让 A = 猫、B = 狗，看第三行全暗、点积为 0；再把 B 换成「王冠」，读数一模一样。下一步换一种表示：不看词本身，看它周围的词。',

    s1k: '第 1 步 · 数邻居',
    s1t: '一个词常和哪些词一起出现，能不能写成一串数？',
    s1e: '这一步要回答：怎样不靠人工，从文本里得到有意义的数？语言学里有一句老话：看一个词和谁做伴，就知道它是什么意思。做法是逐句读一个<strong>语料</strong>（一堆句子；本页是 28 个三词短句，中文界面按原句逐词显示），每遇到目标词，就把<strong>窗口</strong>内（前后各 w 个位置）的词各记一次。读完后，目标词得到一串 29 个计数，叫它的<strong>共现计数向量</strong>：第 j 位 = 第 j 个词在它窗口里出现了几次。',
    window: '窗口 w', readOne: '读下一句', readAll: '读完全部', readReset: '从头再读',
    c1sent: '第 {k} 句（连线 = 窗口内被记一次的一对词）',
    c1none: '还没开始读',
    c1bars: '「{w}」的共现计数（读到第 {k}/{n} 句）',
    s1lgPair: '窗口内的一对词', s1lgHit: '涉及目标词的一对', s1lgBar: '目标词的计数',
    s1readout: '已读 {k}/{n} 句，窗口 {w}。「{t}」的非零计数：{list}。',
    s1empty: '（还没有）',
    s1hint: '观察顺序：选「国王」（第 1 句就有它），按「读下一句」几次，看每句的连线，以及涉及「国王」的那几对（橙色）怎样让下方的柱子长高；再按「读完全部」。把窗口从 2 改成 1：三词句的首尾两词不再算邻居，例如「他 是 国王」里「国王」不再记到「他」。',

    s2k: '第 2 步 · 余弦相似',
    s2t: '两个词的计数向量，怎样比出「像不像」？',
    s2e: '这一步要回答：有了计数向量，用哪个数衡量两个词相似？点积越大，两个词共享的邻居越多；但出现得多的词，计数整体偏大，点积也跟着大。所以把点积除以两个向量的<strong>长度</strong>（各位平方和再开方），得到<strong>余弦相似度</strong> cos = A·B ÷ (|A|·|B|)：只看两串数的「比例模式」是否一致，与词出现多少次无关；1 表示模式完全相同，0 表示没有共同邻居。这里用全部 28 句、窗口 2 的计数。',
    c2: 'A 与 B 的共现计数（只列非零的邻居）',
    s2readout: '点积 {d}，|A| = {na}，|B| = {nb}，余弦 {c}，距离 {e}。「{a}」最像的三个词：{nn}。',
    s2hint: '观察顺序：A = 猫、B = 狗：两组柱子几乎一一对应，余弦 0.83；把 B 换成「王冠」，只有零星重叠。再试 A = 国王，读数里最像的是「女王」。也注意「是」这一行：几乎每对名词都在这里重叠，下一步专门处理它。',

    s3k: '第 3 步 · 压低常见词',
    s3t: '「是」到处都出现，它让不相干的词也显得相似，怎么办？',
    s3e: '这一步要回答：怎样让「到处都有」的邻居少算一点、「只和你一起出现」的邻居多算一点？办法是把计数换成<strong>正点互信息</strong>（PPMI）：先算两个词实际一起出现的频率，是「两者毫不相干时」预期频率的几倍，再取以 2 为底的对数；小于 0 的（比预期还少）记为 0。几乎和谁都一起出现的「是」，倍数接近 1，对数接近 0，被大大压低；只和「国王」「女王」一起出现的「王冠」，倍数大，保留下来。',
    c3vec: '「{w}」的每个邻居：原始计数 vs PPMI',
    c3cos: '「{w}」与其他名词的余弦：原始计数 vs PPMI',
    s3lgRaw: '原始计数', s3lgPpmi: 'PPMI 值',
    s3readout: '「{w}」：邻居「是」的原始计数 {ri}，PPMI {pi}；邻居「{top}」的原始计数 {rt}，PPMI {pt}。全部 6 个名词中，同类的 3 对（国王–女王、男人–女人、猫–狗）平均余弦：原始 {rr} → PPMI {pr}；不同类的 12 对：原始 {ru} → PPMI {pu}。',
    s3hint: '观察顺序：选「国王」，在「国王的每个邻居」图里看「是」那一行：灰色柱（计数 2）是最高的，青色柱（PPMI）却最短；「王冠」「统治」反而变长。再看「国王与其他名词的余弦」图：「国王」与「女王」的余弦仍高，和「猫」「狗」的余弦几乎降到 0。同类词的余弦也降了一些，但同类与不同类之间的差距拉大了。',

    s4k: '第 4 步 · 压成地图',
    s4t: '每个词有 29 个数，能不能只留两个，画成一张地图？',
    s4e: '这一步要回答：29 维没法画，能不能找出最能区分这些词的少数几个<strong>方向</strong>？做法叫<strong>奇异值分解</strong>（SVD）：在 6 个名词的 PPMI 向量里，找一个方向，让各词沿它的位置差异最大，这是方向 1；再在与它垂直的方向里找差异最大的，是方向 2，依此类推。每个方向能解释的差异占总量的比例叫它的<strong>份额</strong>。只保留前 k 个方向，就把每个词压成 k 个数；取其中两个方向当横、纵轴，就是一张地图。',
    pair12: '方向 1 × 方向 2', pair23: '方向 2 × 方向 3', keepK: '保留的方向数 k',
    c4map: '6 个名词的地图（横：方向 {i} · 纵：方向 {j}）',
    c4share: '各方向的份额（亮色 = 保留的前 k 个）',
    s4lgWord: '名词的位置', s4lgKept: '保留的方向', s4lgDrop: '舍去的方向',
    s4readout: '保留 {k} 个方向：份额合计 {s}%。用这 {k} 个数重算 15 对名词的余弦，与完整 PPMI 向量相比最多差 {err}；6 个名词里有 {agree} 个的「最像的名词」保持不变。',
    s4hint: '观察顺序：先看「方向 1 × 方向 2」：猫、狗在一侧，人在另一侧。换到「方向 2 × 方向 3」：国王、女王挤在一角，男人、女人在另一角，猫、狗又在一处，三类各自成团。再把 k 从 1 拖到 6：份额合计升到 100%，余弦误差降到 0。k = 2 时 6 个词「最像的名词」已全部和完整向量一致，但余弦本身仍可能差到 0.89，要保留更多方向才逐渐准确。',

    s5k: '第 5 步 · 类比',
    s5t: '「国王 − 男人 + 女人」为什么会落到「女王」附近？',
    s5e: '这一步要回答：向量的加减法在这里意味着什么？在 PPMI 向量上逐位计算。先看「− 男人 + 女人」：两人共有的邻居（工作、城市、街道、忙碌）大部分互相抵消；剩下的是女人有、男人没有的「她」（为正），以及男人有、女人没有的「帽子」（为负）。把这份差加到「国王」上：国王的「他」被抵掉大半，「王冠、统治、国土、富有」原样保留，又多了「她」。结果的邻居模式，和「女王」最像。用余弦在全部 29 个词里找最像结果的那个（三个输入词除外）。',
    pickAnalogy: '选一个类比',
    c5grid: '逐位计算：每行一个邻居，格子越亮数值越大（粉色 = 负）',
    c5rank: '与结果最像的词（余弦，三个输入词除外）',
    colResult: '= 结果',
    s5readout: '{a} − {b} + {c} → 最像的是「{top}」（余弦 {cos}），第二是「{second}」（{cos2}）。{verdict}',
    s5hit: '与预期的「{exp}」一致。',
    s5miss: '预期是「{exp}」，排在第 {rank} 位：这个类比在本语料里不成立。',
    s5hint: '观察顺序：先看「国王 − 男人 + 女人」：「他」那一行在结果里只剩一点，「帽子」变成负的（粉色），「王冠」「统治」「国土」保留，「她」一行变亮；排名第一是「女王」。再换另几个类比；最后一个「他 − 男人 + 女人」没得到「她」，而是「富有」：本语料里「他」和「男人」的邻居差别，并不对应一个干净的方向。类比是否成立取决于语料，不是向量运算的保证。',

    s6k: '第 6 步 · 收束', s6t: '词的意思，可以从它的邻居数出来',
    s6fin: '回顾。<strong>第 0 步</strong>：独热编码里任何两个词都一样远。<strong>第 1 步</strong>：逐句数窗口内的邻居，得到共现计数向量。<strong>第 2 步</strong>：用余弦比较，只看比例模式、不看出现次数。<strong>第 3 步</strong>：PPMI 压低「到处都有」的邻居，同类与不同类拉开。<strong>第 4 步</strong>：奇异值分解只保留少数方向，画出地图，三类词各自成团。<strong>第 5 步</strong>：向量的加减对应邻居模式的加减，有时能做类比，有时不能。',
    formula: 'cos(A, B) = A·B ÷ (|A|·|B|)\nPPMI(w, c) = max(0, log₂[ P(w, c) ÷ (P(w)·P(c)) ])\n类比：argmax cos(x, A − B + C)，x 不取 A、B、C',
    boundary: '适用范围：本页的语料是手写的 28 个三词短句，词表 29 个，词与词的关系是有意安排的；结果只说明方法怎样运作，不代表真实语言的统计。实际的词向量（word2vec、GloVe 以及大模型里的嵌入）从数十亿词的文本中训练，常有几百到几千维，单个维度通常没有可读的含义；类比常常不成立，也会继承语料里的偏见（例如职业与性别的刻板联系）。本页用计数加 PPMI 再做 SVD，属于较早的「计数法」；word2vec 等是用预测任务训练得到的，但两类方法利用的是同一种「看邻居」的信息。',
    linksTitle: '接着去哪',
    lk1: '→ 注意力机制，第 0 步：词向量怎样变成查询和键，再比相似度',
    lk2: '→ 线性变换，第 1 步：一个矩阵怎样把向量搬到新的坐标',
    lk3: '→ 特征向量，第 1 步：找出矩阵只拉伸、不转向的方向，SVD 的近亲',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《词向量 · 把词摆成地图》的平行版本。'
  },
  en: {
    pageTitle: 'Word Embeddings · Mapping Words by the Company They Keep',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Word Embeddings · Words as a Map →',
    navLabel: 'Word embedding steps',
    tagline: 'A computer only ever sees words. How can “cat” become a list of numbers that sits close to “dog” and far from “crown”? Using nothing but a 28-sentence toy corpus and no hand labelling, this page counts word vectors from “which words does this one keep showing up with”, measures similarity, squeezes them onto a 2-D map, and shows why “king − man + woman” lands near “queen”.',
    nav0: '0 IDs are not enough', nav1: '1 Count neighbours', nav2: '2 Cosine similarity', nav3: '3 Damp common words', nav4: '4 Squeeze into a map', nav5: '5 Analogies', nav6: '6 Wrap-up',
    wordA: 'Word A', wordB: 'Word B', target: 'Word to follow',

    s0k: 'Step 0 · IDs are not enough',
    s0t: 'Give every word a number. Can you then tell which words mean similar things?',
    s0e: 'This step answers: can the simplest representation express “similar”? The vocabulary on this page has 29 words. The simplest scheme is <strong>one-hot encoding</strong>: each word is a list of 29 numbers with a 1 in its own slot and 0 everywhere else. A common way to compare two lists is the <strong>dot product</strong>: multiply slot by slot and add up. The first two rows show the one-hot codes of A and B (bright cell = 1); the third row is the slot-by-slot product.',
    c0: '29-slot one-hot codes (bright = 1) and their slot-by-slot product',
    rowProd: 'A×B',
    s0readout: 'A = {a}, B = {b}: dot product {d}, cosine similarity {c}, distance {e}. {note}',
    s0same: 'A and B are the same word.',
    s0diff: 'Every pair of different words looks like this: dot product 0, distance 1.414. In one-hot codes “cat” is exactly as far from “dog” as from “crown”; the ID itself carries no meaning.',
    s0hint: 'What to try: set A = cat, B = dog; the third row is all dark and the dot product is 0. Switch B to “crown”: the readout does not change at all. The next step tries a different representation: look not at the word itself but at the words around it.',

    s1k: 'Step 1 · Count the neighbours',
    s1t: 'Can “which words does this one show up with” be written as a list of numbers?',
    s1e: 'This step answers: how can meaningful numbers come out of text without any hand labelling? An old line from linguistics: you shall know a word by the company it keeps. Read a <strong>corpus</strong> (a collection of sentences; here 28 three-word sentences) one sentence at a time, and every time the target word appears, add one for each word within its <strong>window</strong> (up to w positions either side). Afterwards the target has a list of 29 counts, its <strong>co-occurrence count vector</strong>: slot j = how often word j turned up in its window.',
    window: 'Window w', readOne: 'Read next sentence', readAll: 'Read them all', readReset: 'Start reading again',
    c1sent: 'Sentence {k} (each arc = one pair counted inside the window)',
    c1none: 'Nothing read yet',
    c1bars: 'Co-occurrence counts of “{w}” (after sentence {k}/{n})',
    s1lgPair: 'a pair inside the window', s1lgHit: 'a pair involving the target', s1lgBar: 'the target’s counts',
    s1readout: 'Read {k}/{n} sentences, window {w}. Non-zero counts for “{t}”: {list}.',
    s1empty: '(none yet)',
    s1hint: 'What to try: pick “king” (it is in sentence 1) and press “Read next sentence” a few times. Watch the arcs in each sentence and how the pairs involving “king” (orange) make the bars below grow; then press “Read them all”. Change the window from 2 to 1: the first and last words of a three-word sentence stop being neighbours, so in “he is king” the word “king” no longer counts “he”.',

    s2k: 'Step 2 · Cosine similarity',
    s2t: 'Given two count vectors, how do you measure “alike”?',
    s2e: 'This step answers: which number says two words are similar? A larger dot product means more shared neighbours, but a word that appears often has bigger counts across the board, and its dot products grow with them. So divide the dot product by both vectors’ <strong>lengths</strong> (square root of the sum of squares) to get the <strong>cosine similarity</strong> cos = A·B ÷ (|A|·|B|). It only asks whether the two lists have the same pattern of proportions, regardless of how often each word occurs: 1 means identical patterns, 0 means no neighbours in common. Counts here use all 28 sentences with window 2.',
    c2: 'Co-occurrence counts of A and B (non-zero rows only)',
    s2readout: 'Dot product {d}, |A| = {na}, |B| = {nb}, cosine {c}, distance {e}. The three words most like “{a}”: {nn}.',
    s2hint: 'What to try: A = cat, B = dog: the two sets of bars line up almost one for one, cosine 0.83. Switch B to “crown”: only scattered overlap. Then try A = king; the readout’s closest word is “queen”. Notice the “is” row too: nearly every pair of nouns overlaps there. The next step deals with it.',

    s3k: 'Step 3 · Damp the common words',
    s3t: '“is” shows up everywhere and makes unrelated words look alike. What can be done?',
    s3e: 'This step answers: how can a neighbour that is “everywhere” count for less, and one that “only shows up with you” count for more? Replace each count by its <strong>positive pointwise mutual information</strong> (PPMI): take how many times more often the two words actually appear together than they would if they had nothing to do with each other, then take log base 2; anything below 0 (rarer than expected) becomes 0. “is”, which appears with almost everything, has a ratio near 1, so its log is near 0 and it is damped hard; “crown”, which only appears with “king” and “queen”, has a large ratio and survives.',
    c3vec: 'Each neighbour of “{w}”: raw count vs PPMI',
    c3cos: 'Cosine of “{w}” with the other nouns: raw counts vs PPMI',
    s3lgRaw: 'raw counts', s3lgPpmi: 'PPMI values',
    s3readout: '“{w}”: neighbour “is” has raw count {ri}, PPMI {pi}; neighbour “{top}” has raw count {rt}, PPMI {pt}. Across the 6 nouns, the 3 same-kind pairs (king–queen, man–woman, cat–dog) average cosine raw {rr} → PPMI {pr}; the 12 mixed pairs raw {ru} → PPMI {pu}.',
    s3hint: 'What to try: pick “king” and in the chart “Each neighbour of king” look at the “is” row: the grey bar (count 2) is the tallest, yet the cyan bar (PPMI) is the shortest, while “crown” and “rules” grow. In “Cosine of king with the other nouns”, “king” stays close to “queen” while its cosine with “cat” and “dog” drops almost to 0. Same-kind pairs lose a little too, but the gap between same-kind and mixed pairs widens.',

    s4k: 'Step 4 · Squeeze into a map',
    s4t: 'Each word has 29 numbers. Can we keep just two and draw a map?',
    s4e: 'This step answers: 29 dimensions cannot be drawn; can we find the few <strong>directions</strong> that best tell these words apart? The method is <strong>singular value decomposition</strong> (SVD): among the PPMI vectors of the 6 nouns, find the direction along which their positions differ the most (direction 1); then, among directions perpendicular to it, the one with the most remaining spread (direction 2); and so on. The fraction of the total spread a direction accounts for is its <strong>share</strong>. Keeping only the first k directions squeezes each word into k numbers; using two of them as the axes gives a map.',
    pair12: 'direction 1 × direction 2', pair23: 'direction 2 × direction 3', keepK: 'Directions kept k',
    c4map: 'Map of the 6 nouns (horizontal: direction {i} · vertical: direction {j})',
    c4share: 'Share of each direction (bright = the first k kept)',
    s4lgWord: 'a noun’s position', s4lgKept: 'kept direction', s4lgDrop: 'dropped direction',
    s4readout: 'Keeping {k} directions: total share {s}%. Recomputing the cosines of the 15 noun pairs from these {k} numbers differs from the full PPMI vectors by at most {err}; for {agree} of the 6 nouns, the “most similar noun” is unchanged.',
    s4hint: 'What to try: start with “direction 1 × direction 2”: cat and dog sit on one side, the people on the other. Switch to “direction 2 × direction 3”: king and queen huddle in one corner, man and woman in another, cat and dog elsewhere, three separate clusters. Then drag k from 1 to 6: the total share climbs to 100% and the cosine error falls to 0. At k = 2 all six “most similar nouns” already match the full vectors, yet the cosines themselves can still be off by 0.89; they only become accurate as more directions are kept.',

    s5k: 'Step 5 · Analogies',
    s5t: 'Why does “king − man + woman” land near “queen”?',
    s5e: 'This step answers: what does adding and subtracting vectors mean here? Work slot by slot on the PPMI vectors. Start with “− man + woman”: the neighbours the two share (works, city, street, busy) mostly cancel, leaving what woman has and man lacks, “she” (positive), and what man has and woman lacks, “hat” (negative). Add that difference to “king”: most of king’s “he” is cancelled, “crown, rules, land, rich” survive untouched, and “she” comes in. The resulting pattern of neighbours looks most like “queen”. The answer is the word, among all 29, whose cosine with the result is highest (the three input words excluded).',
    pickAnalogy: 'Pick an analogy',
    c5grid: 'Slot by slot: one row per neighbour, brighter = larger (pink = negative)',
    c5rank: 'Words most like the result (cosine, three inputs excluded)',
    colResult: '= result',
    s5readout: '{a} − {b} + {c} → closest is “{top}” (cosine {cos}), then “{second}” ({cos2}). {verdict}',
    s5hit: 'Matches the expected “{exp}”.',
    s5miss: 'The expected “{exp}” is only ranked {rank}: this analogy does not hold in this corpus.',
    s5hint: 'What to try: start with “king − man + woman”. In the result the “he” row fades to a trace, “hat” turns negative (pink), the “crown”, “rules”, “land” rows survive, and the “she” row lights up; “queen” ranks first. Then try the others. The last one, “he − man + woman”, gives “rich” rather than “she”: in this corpus the difference between the neighbours of “he” and “man” does not line up with a clean direction. Whether an analogy works depends on the corpus; vector arithmetic does not guarantee it.',

    s6k: 'Step 6 · Wrap-up', s6t: 'A word’s meaning can be counted from its neighbours',
    s6fin: 'The thread. <strong>Step 0</strong>: in one-hot codes every pair of words is equally far apart. <strong>Step 1</strong>: count neighbours inside a window, sentence by sentence, to get co-occurrence vectors. <strong>Step 2</strong>: compare them by cosine, which looks at the pattern, not at how often a word occurs. <strong>Step 3</strong>: PPMI damps neighbours that are everywhere, pulling same-kind and mixed pairs apart. <strong>Step 4</strong>: SVD keeps a few directions and draws a map where the three kinds of word form their own clusters. <strong>Step 5</strong>: adding and subtracting vectors adds and subtracts neighbour patterns; sometimes that solves an analogy, sometimes it does not.',
    formula: 'cos(A, B) = A·B ÷ (|A|·|B|)\nPPMI(w, c) = max(0, log₂[ P(w, c) ÷ (P(w)·P(c)) ])\nanalogy: argmax cos(x, A − B + C), x not A, B or C',
    boundary: 'Scope: the corpus here is 28 hand-written three-word sentences with a 29-word vocabulary, and the relations between words were arranged on purpose; the results show how the method works, not statistics of real language. Real word vectors (word2vec, GloVe, and the embeddings inside large models) are trained on billions of words, usually have hundreds to thousands of dimensions, and single dimensions rarely mean anything readable; analogies often fail, and the vectors inherit biases in the text (for example stereotyped links between jobs and gender). Counting, PPMI and SVD, as used here, is the older “count-based” approach; word2vec and its relatives are trained on a prediction task instead, but both families draw on the same “look at the neighbours” information.',
    linksTitle: 'Where to go next',
    lk1: '→ Attention, step 0: word vectors become queries and keys, then get compared',
    lk2: '→ Linear transforms, step 1: how a matrix moves vectors into new coordinates',
    lk3: '→ Eigenvectors, step 1: finding the directions a matrix only stretches, close kin of SVD',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Word Embeddings · Words as a Map”.'
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
  if (typeof window.refreshLesson === 'function') window.refreshLesson();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.LESSON_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
