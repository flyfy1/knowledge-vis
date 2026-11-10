'use strict';
// DNA replication & translation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: 'DNA 复制与翻译 · 拉链、抄写和流水线',
    back: '← 知识索引',
    compare: '对照另一版本：DNA 复制与翻译 · 拉链、抄写和流水线 →',
    navLabel: 'DNA 复制与翻译步骤导航',
    tagline: '细胞每分裂一次，要把几十亿个碱基原样抄一份；平时还要从这份「说明书」里挑出一段，照着造蛋白质。七步里你会亲手配对碱基、用 1958 年的离心实验排除两种错误猜想、看复制叉为什么一条链连续一条链分段，再把一段基因转录、翻译成肽链，最后改一个字母看蛋白质怎么变。',
    nav0: '0 配对', nav1: '1 半保留', nav2: '2 复制叉', nav3: '3 转录', nav4: '4 翻译', nav5: '5 突变', nav6: '6 收束',

    s0k: '第 0 步 · 两条链为什么能对上',
    s0t: '只给你一条链，另一条链能唯一确定吗？',
    s0e: '这一步要回答：DNA 的两条链之间是什么关系，知道一条能不能写出另一条？DNA 是两条长链拧成的双螺旋，每条链由一串<strong>碱基</strong>（A、T、G、C 四种「字母」）排成。两条链上相对的碱基靠<strong>氢键</strong>（一种比化学键弱得多、容易拆开的吸引）连在一起，而且只有两种搭配：<strong>A 对 T</strong>（2 条氢键），<strong>G 对 C</strong>（3 条氢键）。这叫<strong>碱基互补配对</strong>。两条链方向相反（<strong>反向平行</strong>）：上链从左往右读是 5′→3′，下链从左往右读就是 3′→5′；5′、3′ 是链两端的化学记号，下一步之后会用到。',
    s0edit: '你编辑的上链（点一个碱基，按 A→T→G→C 轮换）',
    baseBtn: '第 {i} 个碱基 {b}，点击换成下一种',
    rand0: '换一条随机序列', reset0: '恢复示例序列',
    c0top: '上链由你决定，下链按配对规则补出',
    c0bot: '氢键总数 vs G–C 对数（共 12 对）',
    s0lgTop: '上链碱基', s0lgBot: '补出的下链碱基', s0lgLine: '规律线：氢键 = 2×12 + G–C 对数', s0lgDot: '你试过的序列',
    s0readout: '上链 5′-{top}-3′，下链 3′-{bot}-5′。A–T 对 {at} 个 × 2 条 + G–C 对 {gc} 个 × 3 条 = {hb} 条氢键（G–C 占 {pct}%）。',
    s0hint: '观察顺序：点上链任一个碱基，看下图同一列的下链碱基跟着变（每一列永远只有 A–T 或 G–C 两种组合）；把 A 换成 G 时，这一列的氢键从 2 条变 3 条，下图的点向右上走一格。多试几条，所有点都落在同一条直线上：G–C 越多，两条链粘得越牢、越难拆开。',

    s1k: '第 1 步 · 新旧链怎么分配',
    s1t: '复制以后，原来那两条链去哪儿了？',
    s1e: '这一步要回答：一个 DNA 复制成两个时，旧的两条链是留在一起，还是分开各配一条新链？1950 年代有三种猜想：<strong>半保留</strong>（两条旧链拆开，各自当<strong>模板</strong>——照着配对抄写的底稿——配一条新链）、<strong>全保留</strong>（旧双链原封不动，另造一条全新的双链）、<strong>弥散</strong>（新旧材料打碎混在每条链里）。1958 年 Meselson 和 Stahl 先让大肠杆菌在含重氮（¹⁵N）的培养基里长很多代，DNA 全部变「重」；再换成普通轻氮（¹⁴N），每复制一代取样<strong>离心</strong>：DNA 按密度在管里沉到不同高度，越重越靠下，形成一条条<strong>带</strong>。下面每种猜想都会算出一套带的位置和比例，和实测对一对。',
    hSemi: '半保留', hCons: '全保留', hDisp: '弥散',
    genSlider: '换到轻氮后复制了几代 g',
    c1a: '分子家谱（每根竖条是一条链）',
    c1b: '离心管：带的位置 = 密度',
    tubePred: '猜想预测', tubeObs: '1958 实测',
    tubeLight: '轻', tubeMid: '中', tubeHeavy: '重',
    s1lgHeavy: '重链（¹⁵N，最初那两条）', s1lgLight: '轻链（¹⁴N，新合成）', s1lgMix: '弥散：轻重材料混成一条', s1lgBand: '带越粗越亮 = 那个密度的分子越多',
    bandHeavy: '重带', bandHybrid: '中间带', bandLight: '轻带', bandMixed: '{p}% 重的带',
    bandItem: '{name} {share}%',
    s1readout: '第 {g} 代共 {n} 个分子。「{hyp}」预测：{pred}。实测：{obs}。{verdict}',
    s1match: '到这一代为止都和实测一致。',
    s1fail: '从第 {g0} 代起就和实测对不上，这个猜想被排除。',
    s1failNow: '和实测对不上，这个猜想被排除（最早在第 {g0} 代就能看出来）。',
    s1hint: '观察顺序：先选「全保留」，把 g 拖到 1，看「猜想预测」管里有两条带，而「1958 实测」管只有一条中间带；再选「弥散」，g = 1 时它也只有一条中间带，再拖到 g = 2，看预测的带往上移到「25% 重」而实测分成中间带和轻带两条。最后选「半保留」，从 0 拖到 4：家谱里那两条橙色旧链永远各在一个分子里，所以中间带一直是 2 个分子、占比 2/2ᵍ 越来越小。',

    s2k: '第 2 步 · 复制叉',
    s2t: '两条模板方向相反，新链怎么一起往前长？',
    s2e: '这一步要回答：DNA 一边解开一边复制，解开的位置像一个 Y 字，叫<strong>复制叉</strong>。造新链的酶（<strong>DNA 聚合酶</strong>）有一个硬限制：只能把新碱基接到新链的 3′ 端，也就是新链只能沿 5′→3′ 方向变长，而且起步前要先有一小段 RNA <strong>引物</strong>垫底。两条模板方向相反，于是：照上链抄的新链方向正好朝着复制叉，可以跟着叉一路连续长，叫<strong>前导链</strong>；照下链抄的新链只能背着叉长，叉每打开一段，就得重新放一个引物、往回抄一小段，这些小段叫<strong>冈崎片段</strong>，抄出的这条叫<strong>后随链</strong>，最后再由别的酶把片段连起来（本页不画连接）。',
    p2: '复制叉已打开的长度（核苷酸）', L2: '每个冈崎片段的长度（核苷酸）',
    play2: '从 0 放到 3000（慢放）',
    c2: '复制叉（原点在左，叉往右走）',
    s2lgParent: '模板（旧链）', s2lgLead: '前导链（连续）', s2lgLag: '后随链：冈崎片段', s2lgPrimer: 'RNA 引物', s2lgArrow: '箭头 = 新链变长的方向（5′→3′）',
    s2readout: '已打开 {p} 个核苷酸（按每秒 {v} 个约 {s} 秒）：前导链 {lead} 个、1 个引物；后随链已有 {n} 个冈崎片段、{n} 个引物，叉口还有 {gap} 个核苷酸的模板空着，要等再打开一段才能抄。共 {pr} 个引物。',
    s2hint: '观察顺序：把「冈崎片段长度」固定在 1000，慢慢拖「已打开的长度」，看青色前导链总是紧跟着叉，橙色后随链却一截一截出现，叉口总留一段灰色空当；再把片段长度调到 200，引物个数成倍增加。速度用的是大肠杆菌的典型值（每秒约 1000 个核苷酸）：它的环状染色体约 460 万个碱基对，从一个起点向两边各开一个叉，抄完约 {min} 分钟。',

    s3k: '第 3 步 · 转录',
    s3t: '要造蛋白质时，细胞怎样把一个基因抄出来带走？',
    s3e: '这一步要回答：DNA 留在细胞核里，造蛋白质的<strong>核糖体</strong>在细胞质里，中间靠什么传话？答案是<strong>转录</strong>：<strong>RNA 聚合酶</strong>只拆开一个<strong>基因</strong>（DNA 上编码一个产物的一段）那一小段，以其中一条链为模板，按配对规则造出一条单链 <strong>mRNA</strong>（信使 RNA）。RNA 的字母和 DNA 只有一处不同：用 <strong>U</strong>（尿嘧啶）代替 T，所以模板上的 A 配 U。被当作模板的那条叫<strong>模板链</strong>；另一条叫<strong>编码链</strong>，因为抄出的 mRNA 和它一模一样（只是 T 换成 U）。',
    n3: '已转录的碱基数', all3: '一键转录完', clear3: '清空 mRNA',
    c3: '30 个碱基的基因：DNA 两条链与新生 mRNA',
    s3lgCoding: '编码链 DNA', s3lgTemplate: '模板链 DNA（被读的一条）', s3lgRNA: 'mRNA', s3lgPol: 'RNA 聚合酶的位置',
    s3readout: '已转录 {n}/30 个碱基：mRNA 5′-{m}-3′。编码链同一段是 5′-{c}-3′；把 T 换成 U 后，{same}。',
    sameYes: '两者逐字相同', sameNo: '两者不同',
    s3hint: '观察顺序：拖「已转录的碱基数」，看黄色框（RNA 聚合酶）沿模板链往右走，每走一格，mRNA 就按配对规则添一个字母（模板 A→U、T→A、G→C、C→G）；再把 mRNA 和最上面的编码链逐字对照：除 T/U 外完全一样。',

    s4k: '第 4 步 · 翻译',
    s4t: '核糖体怎样把一串字母读成一条肽链？',
    s4e: '这一步要回答：mRNA 只有 4 种字母，蛋白质却由 20 种<strong>氨基酸</strong>串成，怎么对应？核糖体从<strong>起始密码子</strong> AUG 开始，<strong>每三个字母一组</strong>读，这三个字母叫一个<strong>密码子</strong>；每个密码子按<strong>遗传密码表</strong>（下方表格）对应一种氨基酸，依次连成<strong>肽链</strong>，读到<strong>终止密码子</strong>（UAA、UAG、UGA）就停，肽链脱落。三个一组读，就有一个「从哪个字母开始分组」的问题，叫<strong>读码框</strong>；起始密码子 AUG 定下了正确的读码框。',
    k4: '核糖体已读的密码子数', frame0: '从 AUG 开始分组', frame1: '错开 1 个字母', frame2: '错开 2 个字母',
    c4: '核糖体沿 mRNA 读密码子，下方是肽链',
    s4lgCodon: '当前密码子（核糖体所在处）', s4lgRead: '已读过的密码子', s4lgAA: '肽链上的氨基酸', s4lgStop: '终止密码子',
    tableTitle: '遗传密码表（第 1 个字母选行组，第 2 个选列，第 3 个选组内的行）',
    tableFirst: '↓第 1 个', tableSecond: '第 2 个→', stopName: '终止',
    s4readout: '{frame}：已读 {k} 个密码子，最后一个 {codon} → {aa}。肽链（{len} 个氨基酸）：{chain}。',
    s4readoutStop: '{frame}：第 {k} 个密码子 {codon} 是终止密码子，肽链脱落，共 {len} 个氨基酸：{chain}。',
    s4readout0: '{frame}：核糖体还没开始读；把滑杆往右拖。',
    s4frameOK: '正确读码框', s4frameOff: '错开 {d} 个字母的读码框',
    s4hint: '观察顺序：先用「从 AUG 开始分组」把滑杆拖到底，看每读一个密码子，表格里亮一格、肽链加一颗珠子，读到 UAA 停下。再点「错开 1 个字母」：同一串字母被分成完全不同的三联体，读出的氨基酸几乎全变了，而且没遇到终止密码子。全表 {all} 个密码子里 {sense} 个编码 {aa} 种氨基酸、{stop} 个是终止信号，所以多数氨基酸有不止一个密码子（如 Leu 有 {leu} 个）。',

    s5k: '第 5 步 · 改一个字母',
    s5t: 'DNA 上改动一个碱基，蛋白质会怎样？',
    s5e: '这一步要回答：复制偶尔出错，DNA 序列的这种改变叫<strong>基因突变</strong>。改一个碱基的后果，要顺着「转录 → 翻译」算到蛋白质才知道，常见四类：<strong>同义突变</strong>（换了碱基，但新密码子对应同一种氨基酸，蛋白质不变）、<strong>错义突变</strong>（一个氨基酸被换掉）、<strong>无义突变</strong>（变成终止密码子，肽链提前截断）、<strong>移码突变</strong>（插入或删除的碱基数不是 3 的倍数，后面的读码框整体错开）。下面每次改动都从原基因出发、只改一处，类别由程序比较两条肽链判定。',
    pos5: '要改第几个碱基（编码链，1–30）',
    sub5: '换成 {b}', del5: '删掉这个碱基', ins5: '在它前面插入一个 A', reset5: '复原',
    c5: '改动后的基因与两条肽链',
    c5rowDNA: 'DNA', c5rowOld: '原来', c5rowNew: '改后',
    c5b: '本基因所有单碱基替换（按密码子位）',
    c5pos: '第 {i} 位',
    s5lgSame: '和原来相同', s5lgChanged: '改变的碱基 / 氨基酸', s5lgSilent: '同义', s5lgMiss: '错义', s5lgNon: '无义',
    cls_none: '还没有改动', cls_silent: '同义突变：蛋白质没变', cls_missense: '错义突变：换了一个氨基酸', cls_nonsense: '无义突变：肽链提前截断',
    cls_frameshift: '移码突变：后面的密码子整体错开', cls_stoploss: '终止密码子丢失：肽链一直读到序列末尾也停不下来', cls_inframe: '整码插入/缺失',
    s5readout: '{edit}　→　{cls}。原肽链 {p0}（{n0} 个氨基酸），改后 {p1}（{n1} 个氨基酸）。',
    s5none: '选一个位置，再点上面的按钮做一处改动。原肽链 {p0}（{n0} 个氨基酸）。',
    edSub: '第 {i} 个碱基 {from}→{to}（密码子第 {cp} 位：{c0}→{c1}）', edDel: '删掉第 {i} 个碱基 {from}', edIns: '在第 {i} 个碱基前插入 A',
    s5stat: '「本基因所有单碱基替换」图的统计：本基因 9 个有义密码子、每位各 27 种替换中，同义的在第 1 位有 {s1} 种、第 2 位 {s2} 种、第 3 位 {s3} 种。',
    s5hint: '观察顺序：把位置拖到 6（第 2 个密码子 GCT 的第 3 位），依次点「换成 A / G / C」——都还是 Ala，同义；拖到 7（TGG 的第 1 位）点「换成 C」，变成 Arg，错义；拖到 9 点「换成 A」，TGG→TGA 是终止密码子，肽链只剩 2 个氨基酸。最后在任意位置点「删掉这个碱基」，看后面的氨基酸全变。',

    s6k: '第 6 步 · 收束',
    s6t: '把七步连成一条线',
    s6fin: '<strong>配对</strong>（A–T、G–C）让一条链决定另一条；所以复制时两条旧链拆开、各当模板，每个新分子是一旧一新（<strong>半保留</strong>，离心带的位置和比例证明了它）。聚合酶只会沿 5′→3′ 延伸，于是复制叉的一侧连续（前导链）、一侧分段（冈崎片段）。造蛋白质时，<strong>转录</strong>把一个基因的模板链抄成 mRNA（与编码链相同，T→U），<strong>翻译</strong>从 AUG 起三个一组地读密码子、按密码表接上氨基酸。改一个碱基，后果要沿这条线算到底：可能不变、换一个、截断，或者全线错开。',
    formula: 'DNA ──复制（半保留）──▶ DNA\nDNA ──转录（模板链 → mRNA，T→U）──▶ mRNA\nmRNA ──翻译（三联体密码子 → 氨基酸）──▶ 肽链',
    boundary: '适用范围与简化：本页的序列是为演示编的短序列；只画了一个复制叉，没画解旋酶、连接酶、校对和真核生物的多个复制起点；转录没画启动子、终止子和真核生物的剪接（内含子）；翻译没画 tRNA。复制速度是大肠杆菌的典型值，人类细胞的复制叉慢得多，靠成千上万个起点同时开工。',
    quizPrompt: '自测：一个全「重」的 DNA 分子放到轻氮里复制 3 代，得到 8 个分子。其中还含有最初那两条重链的分子有几个？',
    quizA: '1 个：原来的分子原封不动保留下来', quizB: '2 个：两条重链各在一个分子里', quizC: '8 个：每个分子都分到一点重材料',
    check: '核对', correct: '对。半保留复制中，旧链永远不会被拆碎，也不会重新聚到一起，所以不管复制多少代，都是正好 2 个分子各带一条旧链（第 1 步中间带一直是 2 个分子）。', wrong: '再想想：第 1 步选「半保留」拖到 g = 3，数一数家谱里带橙色竖条的分子。',
    linksTitle: '接着看',
    lk1: '→ 细胞结构 第 1 步：DNA 保存在哪里，谁管进出',
    lk2: '→ 减数分裂 第 0 步：复制好的 DNA 怎样以成对染色体的形式分给配子',
    lk3: '→ 遗传与概率 第 0 步：基因的不同版本（等位基因）怎样一代代传下去',
    lk4: '→ 酶 第 1 步：聚合酶这类「催化剂」为什么只认特定的分子',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《DNA 复制与翻译 · 拉链、抄写和流水线》的平行版本。'
  },
  en: {
    pageTitle: 'DNA Replication and Translation · A Zipper, a Copy and an Assembly Line',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: DNA Replication and Translation · A Zipper, a Copy and an Assembly Line →',
    navLabel: 'DNA replication and translation steps',
    tagline: 'Every time a cell divides it has to copy billions of bases exactly, and in between it keeps pulling single passages out of that manual to build proteins. In seven steps you will pair bases by hand, use the 1958 centrifuge experiment to rule out two wrong ideas, see why one new strand at the fork grows smoothly and the other in pieces, transcribe and translate a gene, and finally change one letter to see what happens to the protein.',
    nav0: '0 Pairing', nav1: '1 Semi-conservative', nav2: '2 The fork', nav3: '3 Transcription', nav4: '4 Translation', nav5: '5 Mutations', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Why the two strands fit',
    s0t: 'Given one strand, is the other one fixed?',
    s0e: 'The question here: how are the two strands of DNA related — can you write one down from the other? DNA is two long chains wound into a double helix, each a string of <strong>bases</strong> (four “letters”: A, T, G, C). Facing bases are held together by <strong>hydrogen bonds</strong> (attractions far weaker than covalent bonds, easy to pull apart), and only two pairings occur: <strong>A with T</strong> (2 hydrogen bonds) and <strong>G with C</strong> (3). This is <strong>complementary base pairing</strong>. The strands also run in opposite directions (<strong>antiparallel</strong>): the top strand reads 5′→3′ from left to right, so the bottom one reads 3′→5′. The labels 5′ and 3′ mark the two chemically different ends of a strand; they matter from step 2 on.',
    s0edit: 'Your top strand (tap a base to cycle A→T→G→C)',
    baseBtn: 'Base {i} is {b}; tap to change it',
    rand0: 'Random new strand', reset0: 'Back to the example',
    c0top: 'You set the top strand; pairing fills the bottom',
    c0bot: 'Hydrogen bonds vs G–C pairs (12 base pairs)',
    s0lgTop: 'Top-strand base', s0lgBot: 'Bottom base filled in by pairing', s0lgLine: 'Rule: bonds = 2×12 + G–C pairs', s0lgDot: 'Strands you tried',
    s0readout: 'Top 5′-{top}-3′, bottom 3′-{bot}-5′. {at} A–T pairs × 2 + {gc} G–C pairs × 3 = {hb} hydrogen bonds ({pct}% G–C).',
    s0hint: 'What to watch: tap any top base and the bottom base in the same column follows (a column is only ever A–T or G–C). Turning an A into a G takes that column from 2 bonds to 3, and the point in the lower plot moves one notch up and right. Try several strands: every point lands on the same line — the more G–C, the tighter the strands stick and the harder they are to pull apart.',

    s1k: 'Step 1 · Who gets the old strands',
    s1t: 'After copying, where do the two original strands end up?',
    s1e: 'The question here: when one DNA molecule becomes two, do the old strands stay together, or split up and each take a new partner? In the 1950s there were three ideas: <strong>semi-conservative</strong> (the old strands separate and each serves as a <strong>template</strong> — the original a new strand is copied against — for one new strand), <strong>conservative</strong> (the old double strand stays intact and a brand-new double strand is built), and <strong>dispersive</strong> (old and new material is chopped up and mixed into every strand). In 1958 Meselson and Stahl grew E. coli on heavy nitrogen (¹⁵N) for many generations so all its DNA was “heavy”, switched it to ordinary light nitrogen (¹⁴N), and after each round of copying spun samples in a <strong>centrifuge</strong>: DNA settles at a height set by its density, heavier lower, forming <strong>bands</strong>. Each idea below predicts where the bands sit and how strong they are; compare that with what was measured.',
    hSemi: 'Semi-conservative', hCons: 'Conservative', hDisp: 'Dispersive',
    genSlider: 'Rounds of copying in light nitrogen, g',
    c1a: 'Family tree (each bar = one strand)',
    c1b: 'Centrifuge: band height = density',
    tubePred: 'Predicted', tubeObs: 'Measured 1958',
    tubeLight: 'light', tubeMid: 'mid', tubeHeavy: 'heavy',
    s1lgHeavy: 'Heavy strand (¹⁵N, the two originals)', s1lgLight: 'Light strand (¹⁴N, newly made)', s1lgMix: 'Dispersive: heavy and light mixed in one strand', s1lgBand: 'Thicker, brighter band = more molecules at that density',
    bandHeavy: 'heavy band', bandHybrid: 'middle band', bandLight: 'light band', bandMixed: '{p}%-heavy band',
    bandItem: '{name} {share}%',
    s1readout: 'Generation {g}: {n} molecules. “{hyp}” predicts {pred}. Measured: {obs}. {verdict}',
    s1match: 'Consistent with the measurement so far.',
    s1fail: 'It stops matching the measurement at generation {g0}, so this idea is ruled out.',
    s1failNow: 'Does not match the measurement, so this idea is ruled out (it already fails at generation {g0}).',
    s1hint: 'What to watch: pick “Conservative” and drag g to 1 — the “Predicted” tube shows two bands, but the “Measured 1958” tube has only one middle band. Pick “Dispersive”: at g = 1 it also gives one middle band, but at g = 2 its single band rises to “25% heavy” while the measurement splits into a middle and a light band. Finally pick “Semi-conservative” and drag from 0 to 4: in the family tree the two orange original strands always sit in two different molecules, so the middle band is always 2 molecules and its share, 2/2ᵍ, keeps shrinking.',

    s2k: 'Step 2 · The replication fork',
    s2t: 'The two templates point opposite ways — how do both new strands keep up?',
    s2e: 'The question here: DNA is unwound and copied at the same time, and the opening looks like a Y — the <strong>replication fork</strong>. The enzyme that builds new strands, <strong>DNA polymerase</strong>, has a hard rule: it can only add bases to the 3′ end of a new strand, so new strands only grow 5′→3′, and it needs a short RNA <strong>primer</strong> to start on. Because the templates run opposite ways, the new strand copied from the top template points toward the fork and can follow it continuously — the <strong>leading strand</strong>. The one copied from the bottom template has to grow away from the fork: each time the fork opens another stretch, a new primer is laid down and a short piece is copied backwards. Those pieces are <strong>Okazaki fragments</strong>, the strand they form is the <strong>lagging strand</strong>, and another enzyme later joins them (not drawn here).',
    p2: 'Length opened by the fork (nucleotides)', L2: 'Length of each Okazaki fragment (nucleotides)',
    play2: 'Play 0 → 3000 (slowed down)',
    c2: 'Replication fork (origin at left, fork moving right)',
    s2lgParent: 'Template (old strand)', s2lgLead: 'Leading strand (continuous)', s2lgLag: 'Lagging strand: Okazaki fragments', s2lgPrimer: 'RNA primer', s2lgArrow: 'Arrow = direction the new strand grows (5′→3′)',
    s2readout: '{p} nucleotides opened (about {s} s at {v} per second): leading strand {lead} long on 1 primer; lagging strand has {n} Okazaki fragments on {n} primers, and {gap} nucleotides of template at the fork are still bare, waiting for the next stretch to open. {pr} primers in total.',
    s2hint: 'What to watch: keep the fragment length at 1000 and drag the opened length slowly. The cyan leading strand stays right behind the fork, while the orange lagging strand appears one block at a time and a grey bare stretch always remains at the fork. Then set the fragment length to 200: the primer count multiplies. The speed is a typical E. coli value (about 1000 nucleotides per second): its circular chromosome of about 4.6 million base pairs is copied by two forks running both ways from one origin, in about {min} minutes.',

    s3k: 'Step 3 · Transcription',
    s3t: 'When a protein is needed, how does the cell copy out one gene to take away?',
    s3e: 'The question here: DNA stays in the nucleus, but the <strong>ribosomes</strong> that build proteins are out in the cytoplasm — what carries the message? <strong>Transcription</strong>: <strong>RNA polymerase</strong> opens just one <strong>gene</strong> (a stretch of DNA that codes for one product), uses one strand as the template, and builds a single strand of <strong>mRNA</strong> (messenger RNA) by base pairing. RNA differs from DNA in one letter: it uses <strong>U</strong> (uracil) instead of T, so an A on the template pairs with U. The strand that is read is the <strong>template strand</strong>; the other is the <strong>coding strand</strong>, because the mRNA comes out identical to it, apart from T becoming U.',
    n3: 'Bases transcribed', all3: 'Transcribe it all', clear3: 'Clear the mRNA',
    c3: 'A 30-base gene: two DNA strands, new mRNA',
    s3lgCoding: 'Coding strand (DNA)', s3lgTemplate: 'Template strand (DNA, the one read)', s3lgRNA: 'mRNA', s3lgPol: 'Where RNA polymerase is',
    s3readout: '{n}/30 bases transcribed: mRNA 5′-{m}-3′. The same stretch of the coding strand is 5′-{c}-3′; with T read as U, {same}.',
    sameYes: 'they match letter for letter', sameNo: 'they differ',
    s3hint: 'What to watch: drag “Bases transcribed” and the yellow box (RNA polymerase) moves right along the template strand; each step adds one mRNA letter by pairing (template A→U, T→A, G→C, C→G). Then compare the mRNA with the coding strand at the top: identical except T/U.',

    s4k: 'Step 4 · Translation',
    s4t: 'How does a ribosome turn a string of letters into a chain of amino acids?',
    s4e: 'The question here: mRNA has only 4 letters, yet proteins are built from 20 kinds of <strong>amino acid</strong> — how do they map? The ribosome starts at the <strong>start codon</strong> AUG and reads <strong>three letters at a time</strong>; each triplet is a <strong>codon</strong>. The <strong>genetic code</strong> (the table below) assigns each codon an amino acid, and these are linked one after another into a <strong>polypeptide chain</strong>. A <strong>stop codon</strong> (UAA, UAG, UGA) ends it and the chain is released. Reading in threes raises the question of where the grouping starts — the <strong>reading frame</strong>; the start codon AUG sets the right one.',
    k4: 'Codons read by the ribosome', frame0: 'Group from AUG', frame1: 'Shift by 1 letter', frame2: 'Shift by 2 letters',
    c4: 'Ribosome reading codons; the chain below',
    s4lgCodon: 'Current codon (under the ribosome)', s4lgRead: 'Codons already read', s4lgAA: 'Amino acid in the chain', s4lgStop: 'Stop codon',
    tableTitle: 'Genetic code (1st letter picks the block, 2nd the column, 3rd the row inside the block)',
    tableFirst: '↓1st', tableSecond: '2nd→', stopName: 'Stop',
    s4readout: '{frame}: {k} codons read, the last is {codon} → {aa}. Chain ({len} amino acids): {chain}.',
    s4readoutStop: '{frame}: codon {k}, {codon}, is a stop codon; the chain is released with {len} amino acids: {chain}.',
    s4readout0: '{frame}: the ribosome has not started; drag the slider right.',
    s4frameOK: 'Correct frame', s4frameOff: 'Frame shifted by {d}',
    s4hint: 'What to watch: with “Group from AUG”, drag the slider to the end — each codon lights one cell of the table and adds one bead to the chain, until UAA stops it. Then press “Shift by 1 letter”: the same letters are cut into completely different triplets, nearly every amino acid changes, and no stop codon turns up. Of all {all} codons, {sense} code for {aa} amino acids and {stop} are stop signals, so most amino acids have more than one codon (Leu has {leu}).',

    s5k: 'Step 5 · Change one letter',
    s5t: 'Change one base in the DNA — what happens to the protein?',
    s5e: 'The question here: copying occasionally goes wrong, and such a change in the DNA sequence is a <strong>gene mutation</strong>. To know what a one-base change does, you have to follow it through transcription and translation to the protein. Four common outcomes: <strong>silent</strong> (the new codon means the same amino acid, protein unchanged), <strong>missense</strong> (one amino acid swapped), <strong>nonsense</strong> (the codon becomes a stop, the chain is cut short) and <strong>frameshift</strong> (an insertion or deletion of a number of bases that is not a multiple of 3 shifts every later codon). Each edit below starts from the original gene and changes one place; the class is decided by the program comparing the two chains.',
    pos5: 'Which base to change (coding strand, 1–30)',
    sub5: 'Make it {b}', del5: 'Delete this base', ins5: 'Insert an A before it', reset5: 'Undo',
    c5: 'The edited gene and both chains',
    c5rowDNA: 'DNA', c5rowOld: 'Before', c5rowNew: 'After',
    c5b: 'Every single-base substitution, by codon position',
    c5pos: 'Position {i}',
    s5lgSame: 'Same as before', s5lgChanged: 'Changed base / amino acid', s5lgSilent: 'Silent', s5lgMiss: 'Missense', s5lgNon: 'Nonsense',
    cls_none: 'No edit yet', cls_silent: 'Silent: protein unchanged', cls_missense: 'Missense: one amino acid swapped', cls_nonsense: 'Nonsense: chain cut short',
    cls_frameshift: 'Frameshift: every later codon is out of step', cls_stoploss: 'Stop codon lost: the ribosome reads to the end of the sequence without stopping', cls_inframe: 'In-frame insertion/deletion',
    s5readout: '{edit}  →  {cls}. Original chain {p0} ({n0} amino acids), now {p1} ({n1} amino acids).',
    s5none: 'Pick a position, then press a button above to make one edit. Original chain {p0} ({n0} amino acids).',
    edSub: 'Base {i} {from}→{to} (codon position {cp}: {c0}→{c1})', edDel: 'Base {i} ({from}) deleted', edIns: 'A inserted before base {i}',
    s5stat: 'From the “every single-base substitution” chart: of the 27 substitutions at each position across this gene’s 9 sense codons, {s1} are silent at position 1, {s2} at position 2 and {s3} at position 3.',
    s5hint: 'What to watch: set the position to 6 (third letter of the second codon, GCT) and try “Make it A / G / C” — still Ala every time, silent. Go to 7 (first letter of TGG) and make it C: Arg, missense. Go to 9 and make it A: TGG→TGA is a stop, and the chain shrinks to 2 amino acids. Finally press “Delete this base” anywhere and watch every later amino acid change.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'Seven steps, one thread',
    s6fin: '<strong>Pairing</strong> (A–T, G–C) lets one strand fix the other, so in copying the old strands separate and each acts as a template: every new molecule is one old strand plus one new (<strong>semi-conservative</strong>, proven by where the bands sit and how strong they are). Polymerase only extends 5′→3′, so one side of the fork is continuous (leading) and the other is made in pieces (Okazaki fragments). To make a protein, <strong>transcription</strong> copies a gene’s template strand into mRNA (same as the coding strand, T→U), and <strong>translation</strong> reads codons in threes from AUG and links amino acids by the code table. Change one base and you have to follow that whole chain to know the result: nothing, one swap, a truncation, or everything out of step.',
    formula: 'DNA ──replication (semi-conservative)──▶ DNA\nDNA ──transcription (template → mRNA, T→U)──▶ mRNA\nmRNA ──translation (codon triplets → amino acids)──▶ chain',
    boundary: 'Scope and simplifications: the sequences are short made-up examples; only one fork is drawn, with no helicase, ligase or proofreading, and not the many origins of a eukaryotic chromosome; transcription leaves out promoters, terminators and eukaryotic splicing (introns); translation does not show tRNA. The copying speed is a typical E. coli value — human forks are much slower and rely on tens of thousands of origins working at once.',
    quizPrompt: 'Check yourself: an all-heavy DNA molecule is copied 3 times in light nitrogen, giving 8 molecules. How many of them still contain one of the two original heavy strands?',
    quizA: '1: the original molecule survives intact', quizB: '2: each heavy strand sits in its own molecule', quizC: '8: every molecule gets a little heavy material',
    check: 'Check', correct: 'Right. In semi-conservative copying an old strand is never chopped up and never rejoins its old partner, so however many rounds pass, exactly 2 molecules carry an old strand (the middle band in step 1 is always 2 molecules).', wrong: 'Think again: in step 1 pick “Semi-conservative”, drag to g = 3 and count the molecules with an orange bar.',
    linksTitle: 'Where next',
    lk1: '→ Cell structure, step 1: where DNA is kept and what controls entry',
    lk2: '→ Meiosis, step 0: how copied DNA is handed to gametes as paired chromosomes',
    lk3: '→ Genetics and probability, step 0: how different versions of a gene (alleles) pass down the generations',
    lk4: '→ Enzymes, step 1: why “catalysts” like polymerase only accept particular molecules',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “DNA Replication and Translation · A Zipper, a Copy and an Assembly Line”.'
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
  if (typeof window.refreshDNA === 'function') window.refreshDNA();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.DNA_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
