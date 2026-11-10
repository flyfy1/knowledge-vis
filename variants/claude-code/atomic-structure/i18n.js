'use strict';
// Atomic structure lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '原子结构 · 质子数定它是谁',
    back: '← 知识索引',
    compare: '对照另一版本：原子结构 · 质子数定它是谁 →',
    navLabel: '原子结构步骤导航',
    tagline: '把一颗原子放大：里面是实心的吗？是什么让它是碳而不是氧，又是什么让钠一碰水就反应、氖却几乎什么都不理？六步里，你会按真实比例推近一颗原子，再亲手加减质子、中子和电子，看每个数字各管什么。',
    nav0: '0 放大', nav1: '1 质子', nav2: '2 电子层', nav3: '3 最外层', nav4: '4 离子', nav5: '5 收束',

    s0k: '第 0 步 · 推近一颗碳原子',
    s0t: '原子是一个实心的小球吗？',
    s0e: '这一步要回答：把一颗碳原子放大到看得见，它里面是实心的吗？<strong>原子</strong>是构成物质的微小粒子，碳、氧、钠等每种元素都有自己的原子（<a class="xlink" href="../../../chemistry/matter/particles-states/#step0">→ 粒子页第 0 步：物质是一群粒子</a>）。原子中心有一个<strong>原子核</strong>（简称核），核外是<strong>电子</strong>活动的区域，下图画成浅色的云。这张图是<strong>真实比例</strong>：拖「视野宽度」，镜头从 600 pm 宽一路推近到 20 fm 宽（1 pm = 1 皮米 = 10⁻¹² 米；1 fm = 1 飞米 = 10⁻¹⁵ 米，是 pm 的千分之一）。碳原子半径取课本值 77 pm；核的半径按经验公式 R ≈ 1.2 fm × A^(1/3) 算（A 是核里粒子的总数，碳是 12，第 1 步细讲）。',
    zoom: '视野宽度（往右拖 = 推近）',
    c0title: '真实比例 · 碳原子 · 视野宽 {view}',
    c0tiny: '十字中心就是核：直径只有 {d} 像素，画不出来',
    c0seen: '橙色圆就是核：直径 {d} 像素',
    c0edge: '浅色云的边 = 原子半径 77 pm',
    c0inside: '整个画面都在原子内部',
    s0readout: '视野宽 {view}：原子直径约 {atom} 像素，核直径约 {nuc} 像素。原子的直径约是核的 {ratio} 倍。',
    shareMass: '质量', shareVol: '体积', shareNuc: '核', shareEl: '核外（电子）',
    s0share: '同一颗碳原子：核的质量占 {mN}，电子只占 {mE}；可核的体积只占原子的 {vN}。原子里几乎全是空的，质量却几乎全挤在核里。',
    s0hint: '观察顺序：滑杆在最左时，原子是一团浅色的云，核小得连 1 个像素都不到，只能用十字标出位置。慢慢往右拖：云胀出画面，要拖过大半程，核才长成一个看得见的橙色圆。整个过程中两者都按真实比例画；要把核画成「看得见的球」，其余各步都只能放大它。',

    s1k: '第 1 步 · 核里的两种粒子',
    s1t: '碳原子和氮原子差在哪？是什么让一颗原子「是」碳？',
    s1e: '这一步要回答：决定元素身份的是哪个数？核里有两种粒子：<strong>质子</strong>带一份正电，<strong>中子</strong>不带电，两者差不多重。核外的电子带一份负电，质量只有质子的 1/{ppe}。核里质子的个数叫<strong>质子数</strong>，记作 Z；核带几份正电（<strong>核电荷数</strong>）也就是 Z。质子数加中子数叫<strong>质量数</strong> A。上图把核画成一团小球——这是示意，比真实的核放大了几万亿倍。下面 20 格是 Z = 1 到 20 的元素，外框亮着的格子是你来过的。',
    pPlus: '+1 质子', pMinus: '−1 质子', nPlus: '+1 中子', nMinus: '−1 中子', nReset: '中子数恢复常见值',
    c1nuc: '示意：核（放大很多倍）',
    c1p: '质子 {Z}', c1n: '中子 {N}',
    c1strip: '元素格：Z = 1 到 20（外框 = 来过）',
    s1lgP: '质子（带一份正电）', s1lgN: '中子（不带电）', s1lgNow: '当前元素', s1lgSeen: '来过的元素',
    s1readout: '质子数 Z = {Z} → 这是{name}（{sym}）。中子 {N} 个，质量数 A = {Z} + {N} = {A}。电子先按中性原子算，和质子一样多：{Z} 个。{iso}',
    isoCommon: '这是最常见的一种{name}原子。',
    isoMore: '比最常见的{name}原子多 {d} 个中子：仍然是{name}（记作{name}-{A}），只是更重。',
    isoLess: '比最常见的{name}原子少 {d} 个中子：仍然是{name}（记作{name}-{A}），只是更轻。',
    zMax: '本页只排到钙（Z = 20）。', zMin: '质子数最少是 1（氢）。',
    s1hint: '观察顺序：先按一次「+1 质子」，看下方亮格从碳跳到氮、核里多一个橙球；再按「+1 中子」，亮格不动，只有质量数 A 加 1。中子数可在常见值的 −1 到 +2 之间试；这些组合在自然界里是否稳定存在，本页不做判断。',

    s2k: '第 2 步 · 电子按层住',
    s2t: '电子在核外是挤成一团，还是有规矩地住？',
    s2e: '这一步要回答：中性原子有 Z 个电子，它们怎样分布？电子按离核远近分成几<strong>层</strong>（电子层），第 1 层离核最近。初中用一条简化规则：第 1 层最多 2 个，第 2 层最多 8 个，第 3 层先住满 8 个，再多的才到第 4 层；内层住满才轮到外层。每层住几个写成一串数，叫<strong>排布</strong>，例如钠是 2, 8, 1。<strong>示意画法</strong>：图里的圈只表示电子大致住在哪一层，电子并不沿着圈跑；圈的大小也不是真比例。这是简化规则，真实排布更细，高中会展开；本页只排到钙（Z = 20）。',
    zSlider: '质子数 Z（中性原子：电子数 = Z）',
    fillBtn: '一个个放进去', fillAll: '全部放好',
    c2atom: '{sym} 的电子层（示意，圈不是轨道）',
    c2table: '每层的座位（实心 = 已住）',
    c2row: '第 {L} 层  {n}/{cap}',
    s2progress: '已放 {c}/{Z} 个。',
    s2readout: '{name}（{sym}，Z = {Z}）：{e} 个电子 → 排布 {arr}。{prog}',
    s2hint: '观察顺序：选钠（Z = 11）按「一个个放进去」：前 2 个进第 1 层，接着 8 个进第 2 层，第 11 个才开第 3 层。再把 Z 拖到 10 和 18，看最外层刚好坐满时的样子。',
    quizPrompt: '小测：氯（Z = 17）的排布是？',
    quizA: '2, 8, 7', quizB: '2, 7, 8', quizC: '8, 8, 1',
    check: '核对',
    correct: '对：先住满第 1 层（2）和第 2 层（8），剩下 7 个在第 3 层。把 Z 拖到 17 可以验证。',
    wrong: '再想想：内层先住满，才轮到外层。第 1 层 2 个、第 2 层 8 个，17 − 10 = ?',
    pick: '先选一个答案。',

    s3k: '第 3 步 · 最外层',
    s3t: '为什么氖几乎不与别的物质反应，钠却一碰水就剧烈反应？',
    s3e: '这一步要回答：排布里哪一位决定原子的「脾气」？排布最外面的那一层叫<strong>最外层</strong>，那里的电子叫最外层电子。最外层最多住 8 个（只有一层时最多 2 个）。住满时原子比较<strong>稳定</strong>：不容易得到也不容易失去电子，所以氦、氖、氩很难与别的物质反应。没住满的原子在反应中倾向于通过得失电子让最外层变满：一般最外层<strong>少于 4 个</strong>的容易<strong>失去</strong>这几个（如钠、镁），<strong>多于 4 个</strong>的容易<strong>得到</strong>缺的几个（如氧、氯）；正好 4 个的（碳、硅）得失都不容易，常与别的原子共用电子。这是经验规律，只描述倾向，不保证一定反应；氢、硼等有例外。上图横轴是质子数 Z，纵轴是最外层电子数；下图是选中原子的电子层。',
    c3chart: '最外层电子数（纵轴）随质子数 Z（横轴）',
    c3atom: '{sym}：最外层（亮圈）{c}/{cap}',
    s3lgStable: '住满：稳定', s3lgLose: '少于 4：易失去', s3lgGain: '多于 4：易得到', s3lgShare: '正好 4：常共用',
    s3readout: '{name}（排布 {arr}）：最外层是第 {L} 层，有 {c} 个电子，上限 {cap}。{verdict}',
    vStable: '已经住满 → 稳定，不容易得失电子。',
    vLose: '还没住满，但少于 4 个 → 一般容易失去这 {n} 个，露出下面已住满的一层。',
    vGain: '多于 4 个，再得到 {n} 个就满 → 一般容易得到 {n} 个电子。',
    vShare: '正好 4 个 → 得失都不容易，常与别的原子共用电子。',
    s3hint: '观察顺序：把 Z 从 1 慢慢拖到 20，看柱子一格格升高、到满之后又落回 1——每落回一次，就是开了新的一层。青色（住满）的柱子恰好在 Z = 2、10、18，也就是氦、氖、氩。',

    s4k: '第 4 步 · 得失电子',
    s4t: '钠失去 1 个电子后，还是钠吗？它带什么电？',
    s4e: '这一步要回答：电子数一变，原子会怎样？得到或失去电子时，质子数 Z 不变，所以仍是同一种元素（第 1 步的结论）；但电子数不再等于质子数，整体就带了电。这样带电的粒子叫<strong>离子</strong>。<strong>净电荷</strong> = 质子数 − 电子数：正的叫阳离子，负的叫阴离子，写在元素符号右上角，如 Na⁺（带 1 份正电）、Mg²⁺、Cl⁻、O²⁻。下面先选元素，再用按钮拿走或添上电子：一次最多变 3 个，而且不越过相邻稀有气体（氦、氖、氩）的排布。',
    takeE: '拿走 1 个电子', addE: '添上 1 个电子', neutral: '恢复中性',
    c4atom: '{label}：质子 {Z}，电子 {e}（示意）',
    c4out: '被拿走的电子',
    c4in: '外来的电子',
    s4lgKept: '原有电子', s4lgAdded: '外来电子', s4lgGone: '被拿走的电子',
    s4readout: '质子 {Z} 个（仍是{name}），电子 {e} 个，净电荷 {Z} − {e} = {q} → {label}。排布 {arr}，最外层 {c}/{cap}{full}',
    fullYes: '，已住满，和{noble}原子的排布相同。',
    fullNo: '，没住满。',
    madeTitle: '你做出的「最外层住满」的粒子：',
    madeNone: '还没有。',
    eLimit: '到头了：本页电子数最多变 3 个，且不越过相邻稀有气体的排布（氦、氖、氩本身就不再变）。',
    s4hint: '观察顺序：选钠（Z = 11），按一次「拿走 1 个电子」：第 3 层那 1 个飞出，第 2 层成了最外层而且已住满。再选氯（Z = 17），按一次「添上 1 个电子」。镁、氧各要按几次、按哪个？按之前先用第 3 步的规律猜。',
    quiz2Prompt: '小测：镁（Z = 12，排布 2, 8, 2）一般形成哪种离子？',
    quiz2A: 'Mg²⁺（失去 2 个电子）', quiz2B: 'Mg²⁻（得到 2 个电子）', quiz2C: 'Mg⁶⁻（得到 6 个电子）',
    correct2: '对：最外层只有 2 个，失去它们后露出已住满的第 2 层；质子 12、电子 10，净电荷 +2。',
    wrong2: '再想想：最外层 2 个，少于 4。失去 2 个和得到 6 个，哪个更容易让最外层变满？',

    s5k: '第 5 步 · 收束',
    s5t: '一条链：质子数 → 电子排布 → 最外层 → 得失电子',
    s5fin: '<strong>质子数 Z</strong> 决定它是哪种元素，中子只改变质量数 A。中性原子的电子数等于 Z，按 2、8、8 的规则从内到外住成几层。<strong>最外层</strong>住没住满，决定它稳定，还是倾向得失电子。得失电子后成为<strong>离子</strong>，带电了，但质子数没变，所以元素没变。',
    formula: 'A = Z + N　　净电荷 = Z − 电子数　　排布：2 → 8 → 8 → …',
    boundary: '这页的模型边界：第 0 步按真实比例画；第 1–4 步的图都把核放大了很多倍，电子层圈的大小也只是示意。圈只表示电子大致住在哪一层，电子并不沿着圈跑。2、8、8 是初中的简化规则，真实排布更细（Z = 20 以后更复杂）。得失电子的倾向是经验规律，有例外，也不代表一定发生反应。',
    linksTitle: '接着看',
    lk1: '→ 粒子页第 0 步：从一群粒子开始，物质的三态怎样来',
    lk2: '→ 元素周期律第 1 步：沿着一个周期走，性质怎样一格格变',
    lk3: '→ 分子与原子第 4 步：分子重组时，原子会多出来或少掉吗',
    lk4: '→ 质量守恒第 1 步：把反应拆开逐个数原子',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《原子结构 · 质子数定它是谁》的平行版本。'
  },
  en: {
    pageTitle: 'Atomic Structure · The Proton Count Decides What It Is',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Atomic Structure · The Proton Count Decides What It Is →',
    navLabel: 'Atomic structure steps',
    tagline: 'Blow up a single atom: is it solid inside? What makes it carbon rather than oxygen — and why does sodium react violently with water while neon ignores almost everything? In six steps you zoom into a real-scale atom, then add and remove protons, neutrons and electrons yourself to see what each number controls.',
    nav0: '0 Zoom in', nav1: '1 Protons', nav2: '2 Shells', nav3: '3 Outer shell', nav4: '4 Ions', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Zoom into a carbon atom',
    s0t: 'Is an atom a solid little ball?',
    s0e: 'The question here: blow a carbon atom up until you can see it — is it solid inside? An <strong>atom</strong> is one of the tiny particles matter is built from; every element — carbon, oxygen, sodium — has its own kind (<a class="xlink" href="../../../chemistry/matter/particles-states/#step0">→ Particles page, step 0: matter as a crowd of particles</a>). At its centre sits the <strong>nucleus</strong>; around it is the region where the <strong>electrons</strong> move, drawn below as a pale cloud. This picture is <strong>to true scale</strong>: drag “field of view” and the camera closes in from 600 pm across to 20 fm across (1 pm = one picometre = 10⁻¹² m; 1 fm = one femtometre = 10⁻¹⁵ m, a thousandth of a pm). The carbon atom’s radius is the textbook 77 pm; the nucleus radius comes from the empirical rule R ≈ 1.2 fm × A^(1/3) (A is the number of particles in the nucleus — 12 for carbon, explained in step 1).',
    zoom: 'Field of view (drag right = zoom in)',
    c0title: 'True scale · carbon atom · view {view} wide',
    c0tiny: 'The nucleus is at the cross: {d} px across, too small to draw',
    c0seen: 'The orange disc is the nucleus: {d} px across',
    c0edge: 'Edge of the pale cloud = atomic radius 77 pm',
    c0inside: 'The whole frame is inside the atom',
    s0readout: 'View {view} wide: the atom is about {atom} px across, the nucleus about {nuc} px. The atom is about {ratio} times wider than its nucleus.',
    shareMass: 'Mass', shareVol: 'Volume', shareNuc: 'Nucleus', shareEl: 'Outside (electrons)',
    s0share: 'Same carbon atom: the nucleus carries {mN} of the mass, the electrons only {mE} — yet the nucleus fills just {vN} of the atom’s volume. An atom is almost entirely empty, with almost all its mass packed into the centre.',
    s0hint: 'What to watch: with the slider far left the atom is a pale cloud and the nucleus is less than one pixel wide, so only a cross marks it. Drag slowly right: the cloud swells off the frame, and only past the halfway mark does the nucleus grow into a visible orange disc. Both are drawn to true scale throughout — which is why every later step has to enlarge the nucleus to show it as a ball.',

    s1k: 'Step 1 · Two kinds of particle in the nucleus',
    s1t: 'What separates a carbon atom from a nitrogen atom? What makes an atom “be” carbon?',
    s1e: 'The question here: which number fixes an element’s identity? The nucleus holds two kinds of particle: <strong>protons</strong> carry one unit of positive charge, <strong>neutrons</strong> carry none, and the two weigh about the same. The electrons outside carry one unit of negative charge each and weigh only 1/{ppe} of a proton. The number of protons is the <strong>atomic number</strong> Z; the nucleus carries Z units of positive charge (the <strong>nuclear charge</strong>). Protons plus neutrons is the <strong>mass number</strong> A. The top picture draws the nucleus as a cluster of balls — a sketch, trillions of times larger than a real nucleus. The 20 tiles below are the elements Z = 1 to 20; tiles with a bright outline are ones you have visited.',
    pPlus: '+1 proton', pMinus: '−1 proton', nPlus: '+1 neutron', nMinus: '−1 neutron', nReset: 'Usual neutron count',
    c1nuc: 'Sketch: the nucleus (hugely enlarged)',
    c1p: '{Z} protons', c1n: '{N} neutrons',
    c1strip: 'Element tiles: Z = 1 to 20 (outline = visited)',
    s1lgP: 'Proton (one + charge)', s1lgN: 'Neutron (no charge)', s1lgNow: 'Current element', s1lgSeen: 'Visited',
    s1readout: 'Z = {Z} protons → this is {name} ({sym}). {N} neutrons, so mass number A = {Z} + {N} = {A}. For a neutral atom the electrons match the protons: {Z}. {iso}',
    isoCommon: 'This is the most common kind of {name} atom.',
    isoMore: '{d} more neutron(s) than the most common {name} atom: still {name} (written {name}-{A}), just heavier.',
    isoLess: '{d} fewer neutron(s) than the most common {name} atom: still {name} (written {name}-{A}), just lighter.',
    zMax: 'This page stops at calcium (Z = 20).', zMin: 'The smallest proton count is 1 (hydrogen).',
    s1hint: 'What to watch: press “+1 proton” once — the lit tile jumps from carbon to nitrogen and the nucleus gains an orange ball. Then press “+1 neutron”: the lit tile stays put and only A goes up by 1. Neutrons can range from one below to two above the usual count; whether each combination is stable in nature is not judged here.',

    s2k: 'Step 2 · Electrons live in shells',
    s2t: 'Do the electrons crowd around the nucleus anyhow, or do they follow a rule?',
    s2e: 'The question here: a neutral atom has Z electrons — how are they arranged? Electrons sit in <strong>shells</strong> by distance from the nucleus, shell 1 being the closest. The school rule is a simplification: shell 1 holds at most 2, shell 2 at most 8, shell 3 takes 8 first, and only then does shell 4 start; an inner shell fills before the next one opens. The count in each shell, listed in order, is the <strong>electron arrangement</strong> — sodium is 2, 8, 1. <strong>Diagram convention</strong>: the rings mark roughly which layer an electron belongs to, not a track it runs on, and their sizes are not to scale. Real arrangements are subtler and come later in chemistry; this page stops at calcium (Z = 20).',
    zSlider: 'Atomic number Z (neutral atom: electrons = Z)',
    fillBtn: 'Add them one by one', fillAll: 'Place them all',
    c2atom: '{sym} electron shells (sketch: rings are not orbits)',
    c2table: 'Seats in each shell (filled = taken)',
    c2row: 'Shell {L}  {n}/{cap}',
    s2progress: '{c}/{Z} placed.',
    s2readout: '{name} ({sym}, Z = {Z}): {e} electrons → arrangement {arr}. {prog}',
    s2hint: 'What to watch: pick sodium (Z = 11) and press “Add them one by one”: the first 2 go into shell 1, the next 8 into shell 2, and only the 11th opens shell 3. Then set Z to 10 and to 18 and look at an outer shell that is exactly full.',
    quizPrompt: 'Quick check: what is chlorine’s (Z = 17) arrangement?',
    quizA: '2, 8, 7', quizB: '2, 7, 8', quizC: '8, 8, 1',
    check: 'Check',
    correct: 'Right: shell 1 (2) and shell 2 (8) fill first, leaving 7 in shell 3. Set Z to 17 to confirm.',
    wrong: 'Not quite: inner shells fill before outer ones. Shell 1 takes 2, shell 2 takes 8 — so 17 − 10 = ?',
    pick: 'Pick an answer first.',

    s3k: 'Step 3 · The outer shell',
    s3t: 'Why does neon barely react with anything, while sodium reacts violently with water?',
    s3e: 'The question here: which part of the arrangement sets an atom’s “temperament”? The last shell in the arrangement is the <strong>outer shell</strong>, and its electrons are the outer electrons. An outer shell holds at most 8 (at most 2 if it is shell 1). A full outer shell makes an atom fairly <strong>stable</strong>: it neither gains nor loses electrons easily, which is why helium, neon and argon hardly react. Atoms with an unfilled outer shell tend to gain or lose electrons in reactions until the outer shell is full: as a rule of thumb, those with <strong>fewer than 4</strong> tend to <strong>lose</strong> them (sodium, magnesium), those with <strong>more than 4</strong> tend to <strong>gain</strong> the missing ones (oxygen, chlorine), and those with exactly 4 (carbon, silicon) do neither easily and usually share electrons instead. It is a rule of thumb about tendencies, not a promise that a reaction happens, and hydrogen and boron are exceptions. Top chart: atomic number Z across, outer-electron count up; bottom: the shells of the chosen atom.',
    c3chart: 'Outer electrons (up) against atomic number Z (across)',
    c3atom: '{sym}: outer shell (bright ring) {c}/{cap}',
    s3lgStable: 'Full: stable', s3lgLose: 'Fewer than 4: tends to lose', s3lgGain: 'More than 4: tends to gain', s3lgShare: 'Exactly 4: usually shares',
    s3readout: '{name} (arrangement {arr}): the outer shell is shell {L}, with {c} of its {cap} places filled. {verdict}',
    vStable: 'Already full → stable; it does not gain or lose electrons easily.',
    vLose: 'Not full, and fewer than 4 → it usually loses its {n} outer electron(s), uncovering the full shell underneath.',
    vGain: 'More than 4, and {n} more would fill it → it usually gains {n} electron(s).',
    vShare: 'Exactly 4 → neither gaining nor losing comes easily; it usually shares electrons.',
    s3hint: 'What to watch: drag Z slowly from 1 to 20. The bars climb one step at a time, hit full, then drop back to 1 — every drop is a new shell opening. The cyan (full) bars sit exactly at Z = 2, 10 and 18: helium, neon, argon.',

    s4k: 'Step 4 · Gaining and losing electrons',
    s4t: 'After sodium loses one electron, is it still sodium? What charge does it carry?',
    s4e: 'The question here: what happens when the electron count changes? Gaining or losing electrons leaves Z unchanged, so it is still the same element (step 1’s result) — but the electrons no longer match the protons, so the particle carries a charge. A charged particle like this is an <strong>ion</strong>. Its <strong>net charge</strong> = protons − electrons: positive ions are cations, negative ones anions, and the charge goes top right of the symbol — Na⁺ (one unit of positive charge), Mg²⁺, Cl⁻, O²⁻. Pick an element, then use the buttons to take electrons away or add them: at most 3 either way, and never past the neighbouring noble-gas arrangement (helium, neon, argon).',
    takeE: 'Take 1 electron away', addE: 'Add 1 electron', neutral: 'Back to neutral',
    c4atom: '{label}: {Z} protons, {e} electrons (sketch)',
    c4out: 'Electrons taken away',
    c4in: 'Electrons from outside',
    s4lgKept: 'Own electron', s4lgAdded: 'Added electron', s4lgGone: 'Removed electron',
    s4readout: '{Z} protons (still {name}), {e} electrons, net charge {Z} − {e} = {q} → {label}. Arrangement {arr}, outer shell {c}/{cap}{full}',
    fullYes: ' — full, the same arrangement as {noble}.',
    fullNo: ' — not full.',
    madeTitle: 'Particles you have made with a full outer shell:',
    madeNone: 'none yet.',
    eLimit: 'That is the limit here: at most 3 electrons either way, never past the neighbouring noble-gas arrangement (helium, neon and argon stay as they are).',
    s4hint: 'What to watch: pick sodium (Z = 11) and press “Take 1 electron away” once — the single shell-3 electron flies off, and shell 2, already full, becomes the outer shell. Then pick chlorine (Z = 17) and press “Add 1 electron” once. How many presses, and which button, for magnesium and for oxygen? Guess from step 3’s rule before pressing.',
    quiz2Prompt: 'Quick check: magnesium (Z = 12, arrangement 2, 8, 2) usually forms which ion?',
    quiz2A: 'Mg²⁺ (loses 2 electrons)', quiz2B: 'Mg²⁻ (gains 2 electrons)', quiz2C: 'Mg⁶⁻ (gains 6 electrons)',
    correct2: 'Right: only 2 outer electrons; losing them uncovers the full shell 2. 12 protons, 10 electrons: net charge +2.',
    wrong2: 'Not quite: 2 outer electrons is fewer than 4. Which fills the outer shell more easily — losing 2 or gaining 6?',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'One chain: proton count → electron arrangement → outer shell → gain or loss',
    s5fin: 'The <strong>atomic number Z</strong> decides which element it is; neutrons change only the mass number A. A neutral atom has Z electrons, filling shells from the inside out by the 2, 8, 8 rule. Whether the <strong>outer shell</strong> is full decides whether the atom is stable or tends to gain or lose electrons. Gaining or losing them makes an <strong>ion</strong> — charged, but with the same protons, so still the same element.',
    formula: 'A = Z + N　　net charge = Z − electrons　　shells: 2 → 8 → 8 → …',
    boundary: 'Where this model stops: step 0 is drawn to true scale; in steps 1–4 the nucleus is enlarged enormously and the ring sizes are only a sketch. The rings mark roughly which layer an electron belongs to, not a track it runs on. The 2, 8, 8 rule is a school simplification; real arrangements are subtler (and get more complicated beyond Z = 20). The gain-or-lose tendencies are a rule of thumb with exceptions, and do not mean a reaction must happen.',
    linksTitle: 'Where to next',
    lk1: '→ Particles, step 0: start from a crowd of particles and see where solid, liquid and gas come from',
    lk2: '→ Periodic trends, step 1: walk along a period and watch properties change tile by tile',
    lk3: '→ Molecules & atoms, step 4: when molecules regroup, can atoms appear or vanish?',
    lk4: '→ Mass conservation, step 1: take a reaction apart and count the atoms',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Atomic Structure · The Proton Count Decides What It Is”.'
  }
};

const LANG_KEY = 'knowledge-lang';
function initialLang() {
  try { const saved = localStorage.getItem(LANG_KEY); if (saved === 'zh' || saved === 'en') return saved; } catch (_) { /* storage blocked */ }
  return typeof navigator !== 'undefined' && /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
}
let lang = typeof window === 'undefined' ? 'zh' : initialLang();
function t(key, params = {}) {
  let text = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  Object.keys(params).forEach(name => { text = text.split(`{${name}}`).join(String(params[name])); });
  return text;
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* storage denied: keep the in-memory value */ }
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
