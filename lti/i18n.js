'use strict';
/* ============================================================
   冲激与 LTI 讲解页 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '冲激与 LTI · 给系统一巴掌 · 一步一交互',
    back: '← 知识索引',
    pageTitle: '冲激与 LTI · 一巴掌',
    tagline: '想认识一个系统，别一个个试它对每种输入的反应——扇它一巴掌，把它对冲激 δ 的全部回答录下来。这一段录音 h[n] 就是系统的指纹：只要它是线性时不变的（LTI），它对任何输入的回答，都是这份指纹的加权叠加。本页全程离散时间，每句结论都当场算给你看。',
    nav0: '0 扇一巴掌', nav1: '1 δ 与分解', nav2: '2 h 是指纹', nav3: '3 公理检验台',
    nav4: '4 阶跃响应', nav5: '5 由 h 读性格', nav6: '6 终章 · 方程到指纹',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 冲激与 LTI Impulse & LTI —— 一步一交互系列',

    s0k: '第 0 步 · 钩子',
    s0t: '扇一巴掌，听回声',
    s0e: '下面有三个黑箱，里面装的系统各不相同，先不告诉你是什么。认识一个系统最狠的办法，是给它<strong>最短促、最标准的一击</strong>：在 n = 0 送进去一个高度为 1 的尖峰、其余时刻全是 0——这就是<strong>冲激 δ[n]</strong>。箱子被这一击激起的全部动静，就是它的<strong>冲激响应 h[n]</strong>。逐个扇一巴掌，先听回声猜性格，再揭晓它是谁。',
    s0slap: '扇一巴掌（送入 δ[n]）',
    s0slapAll: '三个一起扇',
    s0ro0: '还没有扇任何一个箱子。每个箱子都会收到一模一样的一巴掌——回声长什么样，全看箱子自己的性格。',
    s0roSome: '已扇 <span>{m}</span> / 3 个箱子，回声已录下。想重听，点它自己的按钮再扇一次。',
    s0roDone: '三个箱子都扇过了：同样一记 δ[n]，回声一个振着停、一个就是原样、一个爬上去就不下来。<strong>输入相同、回答全异——差异全在系统本身</strong>，而 h[n] 把这份差异完整录了下来。',
    s0hint: '三段回声形态完全不同：一衰、一平、一存。接下来整整一页，我们只做一件事：<strong>把 h[n] 这份指纹的来历、用法和边界，全部验给你看</strong>。先把口径说清：本页只用离散冲激 δ[n]——它就是「n = 0 时为 1、其余为 0」的一个普通序列，干净严格，没有含糊。',
    s0nameAq: '黑箱 A', s0nameBq: '黑箱 B', s0nameCq: '黑箱 C',
    s0descPre: '身份保密。扇一巴掌，听回声猜性格。',
    s0namePend: '黑箱 {k} · 待揭晓',
    s0descPend: '回声已经录下。先在下面猜中它的性格，身份才会揭晓。',
    s0guessLab: '先猜它的性格：',
    s0gRing: '振着停下来',
    s0gFlat: '原样一根针',
    s0gStep: '跳上去不下来',
    s0roScore: ' · 猜性格：已揭晓 {r} 个，猜对 <span>{c}</span> 个',
    s0nameA: '黑箱 A · 回声弹簧',
    s0descA: '揭晓：二阶谐振系统（弹簧-阻尼的离散模型）。它有自己的固有节奏：一巴掌下去，按这个节奏振着停下来——像敲一下空罐子，声音是罐子自己的。',
    s0nameB: '黑箱 B · 直通线',
    s0descB: '揭晓：y[n] = x[n]，什么都不做的系统。没有记忆、没有加工：回声就是那一巴掌本身，h[n] = δ[n]。',
    s0nameC: '黑箱 C · 蓄水池',
    s0descC: '揭晓：积分器 y[n] = y[n−1] + x[n]。一巴掌的水它全存住：水位跳一格，然后一直保持——h[n] 是一级台阶（n ≥ 0 恒为 1）。',
    cvWait: '还没扇——里面什么样，谁也不知道',
    cvH: '回答 h[n]',

    s1k: '第 1 步 · δ 与分解',
    s1t: '先认识这一巴掌：δ[n]，和万物分解',
    s1e: '先把一巴掌本身看清楚。<strong>筛选</strong>：拿任意信号 x[n] 去乘 δ[n−k]（把冲激挪到第 k 时刻），乘积里其它针全被 0 压掉，只剩第 k 根、高度正是 x[k]——冲激像一把镊子，能从信号里夹出任意一个样本。下面拖 k 逐根夹一遍。再看<strong>分解</strong>：把 x 的每一根针都写成它自己的冲激分量，x[n] = Σ<sub>k</sub> x[k]·δ[n−k]——一排冲激，各自的高度就是信号的样本值。逐根打开开关，看叠加和怎样一根根长成 x 本人。',
    s1formula: 'x[n] = Σₖ x[k] · δ[n − k]',
    s1kLab: 'k · 把 δ 滑到第 k 根针上',
    s1ro: 'k = <span>{k}</span> · 镊子夹到的样本 x[{k}] = <span>{v}</span> · 乘积 x[n]·δ[n−{k}] 只剩 n = {k} 这一根，其余时刻全被 0 压平',
    s1tglLab: '逐根打开冲激分量 x[k]·δ[n−k]：',
    s1all: '全开', s1none: '全关',
    s1ro2: '已打开 <span>{m}</span> / 12 根 · 当前叠加和与目标 x 逐点最大差 = <span>{err}</span>',
    s1ro2full: ' · 12 根全开：叠加和与 x <strong>逐点完全重合，差恒为 0</strong>——不是画得像，是数字本身就是同一排',
    s1hint: '一句题外话，把口径说清：连续时间里也有个 δ(t)，但它不是普通函数——只能以「极限」和筛选性质 ∫x(t)δ(t)dt = x(0) 的方式定义；把它画成一根有限高的窄峰，都是近似示意。本页躲开这摊浑水，只用离散 δ[n]：<strong>n = 0 时为 1、其余为 0 的普通序列</strong>，每个结论都能逐点验算。',
    cvX: '信号 x[n]', cvProd: '乘积（只剩一根）', cvComp: '已打开的分量', cvSum: '叠加和',

    s2k: '第 2 步 · h 是指纹',
    s2t: 'h[n]：认识它，就认识系统对一切输入的回答',
    s2e: '现在给系统录指纹。选一个系统，第一个动作永远一样：<strong>送 δ[n]，把回答记作 h[n]</strong>。然后送进一段真信号 x[n]（灰针）。按第 1 步的分解，x 是若干份冲激分量的和；如果系统是<strong>线性</strong>的，第 k 份分量 x[k]·δ[n−k] 的回答必是 x[k]·h[n−k]（放大 x[k] 倍的那份 h）；如果还是<strong>时不变</strong>的，每份回答都平移 k 步、模样不变。于是输出 = <strong>所有「缩放平移的 h」叠起来</strong>。画里半透明的每一坨就是一份，橙针是总和。图下还有一行对账：同一段输入再按系统定义式直接递推一遍，两条路逐点比——差多少，当场报数。',
    s2sysMa: '3 点滑动平均', s2sysAcc: '指数衰减累加器', s2sysDiff: '差分器',
    s2aLab: 'a · 累加器的衰减（仅累加器用）',
    s2copies: '显示每一份「缩放平移的 h」',
    s2ro: '系统：<b>{sys}</b> · 两条路对账（{N} 个输出点）：直接递推 vs h 叠加，最大差 = <span>{err}</span>——浮点尾数级，两条路算的是同一件事',
    s2hint: '注意三个 h 的长相：差分器只有两根针（1 和 −1）——它「只记一步」的性格全写在这。累加器的 h 是一串 a<sup>n</sup>：一巴掌的回声永不真正归零，只是越来越轻——这种「拖着长尾」的 h 第 5 步还会回来。滑动平均是三根等高针：窗外一概不管，窗内一视同仁。',
    s2linkTxt: '「把 h 翻转、滑动、逐点乘加」的那套计算手艺——卷积——在本站有专门一页细讲，本页只借它的结论：输出等于 h 的加权叠加。想看手艺本身，去这里 →',
    s2lkC: '卷积：翻转、滑动、乘加的手艺在那一页 →',
    cvH2: 'h[n]（扇一巴掌录的）', cvXin: '输入 x[n]', cvCopies: '每份 x[k]·h[n−k]（副本茎只画 |值| ≥ 0.02 的）', cvYout: '输出 y[n]（总和）',

    s3k: '第 3 步 · 公理检验台',
    s3t: '两条公理，当场可证伪',
    s3e: '第 2 步的魔法不是免费的，它押在两条公理上：<strong>线性</strong>（输入的加权组合 → 输出的同样加权组合）和<strong>时不变</strong>（同样的输入晚来几步，输出也只是晚来几步）。这两条不是写在定义里的装饰，是可以当场验、也可以当场垮的契约。下面是检验台：三个受检系统轮流上台，两项检验都给出<strong>具体的偏差数字</strong>——通过的只剩浮点尾数（10<sup>−16</sup> 量级），垮掉的大得明明白白。',
    s3sysAcc: '累加器（自称 LTI）', s3sysSq: '平方器 y[n] = x[n]²', s3sysTv: '时变增益 y[n] = g[n]·x[n]',
    s3supT: '检验一 · 叠加性（线性）',
    s3supE: '取两段输入 x<sub>1</sub>、x<sub>2</sub>，权重 a = 2、b = −1。左路：先把输入组合成 2x<sub>1</sub> − x<sub>2</sub> 再送进系统；右路：两段输入分别过系统，再把输出按 2、−1 组合回来。线性成立 ⟺ 两路逐点相同。',
    s3tiT: '检验二 · 时不变性',
    s3tiE: '同一段输入 x<sub>1</sub>：一路直接过系统；另一路先延迟 D = 3 步再过系统。时不变成立 ⟺ 后一路的输出恰好是前一路输出延迟 3 步的样子，逐点相同。（时变增益台的 g[n] = 0.25 + 0.0625n：增益随时刻爬升——它对输入仍是线性的，变的只是「什么时候送进来」。）',
    s3fakeT: '公理垮了会怎样：平方器的「伪 h」',
    s3fakeE: '不管公理、硬给平方器也录一份「h」：送 δ 得到 δ² = δ，于是这份伪 h 对任何输入的「预测」就是输入本身；可真实输出是 x[n]²。两条线摆在一起——公理不在的地方，预测当场破产。',
    s3supRo: 'a = 2，b = −1 · 两路逐点最大差 = <span>{dev}</span> · {verdict}',
    s3tiRo: '延迟 D = 3 步 · 两路逐点最大差 = <span>{dev}</span> · {verdict}',
    s3fakeRo: '伪 h 的预测 vs 真实输出：逐点最大差 = <span>{dev}</span>——对验不过公理的系统，「录一次 h 打天下」当场破产',
    vPass: '<span class="verdict pass">通过 ✓ · 偏差只剩浮点尾数</span>',
    vFailSup: '<span class="verdict fail">垮了 ✗ · 叠加不成立</span>',
    vFailTi: '<span class="verdict fail">垮了 ✗ · 输出不是原输出的平移</span>',
    s3hint: '看三位受检者的成绩单：累加器两项全过——它是真 LTI，h 的魔法对它全额生效。平方器<strong>过了时不变、垮了叠加</strong>：它没有记忆、不挑时刻，但 (2x<sub>1</sub> − x<sub>2</sub>)<sup>2</sup> ≠ 2x<sub>1</sub><sup>2</sup> − x<sub>2</sub><sup>2</sup>，交叉项就是偏差的来源。时变增益正相反：<strong>过了叠加、垮了时不变</strong>——g[n] 只随时刻变、不碰输入，所以对输入仍是线性的；但早送三步和晚送三步，乘到的增益不是同一个。两条公理各管一摊，缺一不可。',
    cvLhs: '左路：组合输入的输出', cvRhs: '右路：输出的组合', cvTiA: '延迟输入的输出', cvTiB: '原输出延迟 3 步',
    cvPred: '伪 h 的预测', cvTrue: '真实输出 x[n]²',

    s4k: '第 4 步 · 阶跃响应',
    s4t: '阶跃响应 s[n]：h 的亲戚，互为累积与差分',
    s4e: '再送一种最省事的输入：<strong>阶跃 u[n]</strong>（n &lt; 0 为 0，n ≥ 0 恒为 1），回答记作<strong>阶跃响应 s[n]</strong>。它和 h 是近亲：阶跃本身就是冲激的累积和（把 δ 从头攒起来正好是台阶），按线性与时不变，回答也跟着累积：<strong>s[n] = h[0] + h[1] + … + h[n]</strong>；反过来，对 s 差分一次就剥回 h。下面双向都算给你看：左图是 h（上面叠着 diff(s) 的空心点），右图是 s（上面叠着 cumsum(h) 的空心点），两组最大差都写在读数里。',
    s4formula: 's[n] = Σₖ₌₀ⁿ h[k] ， h[n] = s[n] − s[n−1]',
    s4sysAcc: '指数衰减累加器', s4sysMa: '3 点滑动平均',
    s4aLab: 'a · 累加器的衰减（仅累加器用）',
    s4ovH: '把差分 diff(s) 叠到 h 上对照',
    s4ovS: '把累积和 cumsum(h) 叠到 s 上对照',
    s4ro: '双向对账：max|cumsum(h) − s| = <span>{e1}</span> · max|diff(s) − h| = <span>{e2}</span>（都是浮点尾数级）· 现在 s[24] = <span>{sv}</span>',
    s4hint: '工程现场为什么更爱测 s：要直接测 h，得扇一记「无限强、一瞬间」的巴掌，现实里做不出来；测 s 只需<strong>合上开关、看它怎么爬</strong>——通上直流、打开阀门都行。所以数据手册和实验室里常住的是阶跃响应；需要 h 时，差分一次就剥出来（左图叠的那层点就是这么来的）。',
    cvH4: 'h[n]（送 δ[n]）', cvS4: 's[n]（送 u[n]）', cvDiffS: 'diff(s) 叠加', cvCumH: 'cumsum(h) 叠加',

    s5k: '第 5 步 · 由 h 读性格',
    s5t: '不用送任何信号，光看 h 就能宣判三件事',
    s5e: '最后给 h 做体检：三件事不用送任何测试信号，<strong>光看 h 本人</strong>就能宣判——因果看它的左半边、稳定算它的总和、记忆量它的尾巴。',
    s5cauT: '体检一 · 因果：它偷不偷看未来？',
    s5cauE: '因果系统的输出只许用<strong>过去和现在</strong>的输入，于是它的 h 在 n &lt; 0 一侧必须全为 0——巴掌还没落下，不能先有回声。图上 n 从 −4 起画，左边那截就是「巴掌落下之前」。两个受检者：滑动平均只看过去（因果）；居中平均算 y[n] 时要用到 x[n+1]——明天的输入。',
    s5sysMa: '滑动平均（只看过去）', s5sysCe: '居中平均（偷看未来）',
    s5cauRo: 'n &lt; 0 一侧 h 的最大绝对值 = <span>{v}</span> · {verdict}',
    vCausal: '<span class="verdict pass">因果 ✓ · 巴掌落下之前，回声严格为 0</span>',
    vNonCausal: '<span class="verdict fail">非因果 ✗ · 它在用未来的输入</span>',
    s5staT: '体检二 · 稳定：Σ|h[n]| 收不收得住？',
    s5staE: 'BIBO 稳定的判据就一条：<strong>Σ|h[n]| &lt; ∞</strong>——回声的绝对值之和收得住，任何有界输入都造不出无界输出。拿累加器的 h[n] = a<sup>n</sup> 开刀：页面把 |h| 一直加到 n = 4000（剩下的尾巴不是含糊的「很小」：它就是精确余项 a<sup>4001</sup>/(1−a)，读数里逐位给出），与闭式 1/(1−a) 并排对账；再送一段 |x| ≤ 1 的最省事有界输入 x ≡ 1，看输出能爬多高。',
    s5aLab: 'a · 累加器的衰减（h[n] = aⁿ）',
    s5staRo: 'a = <span>{a}</span> · Σ|h|（加到 n = 4000）= <span>{sum}</span> · 剩余尾巴不是约数：它正好等于精确余项 a<sup>4001</sup>/(1−a) = <span>{tail}</span> · 两段相加 = <span>{sumtail}</span>，闭式 1/(1−a) = <span>{closed}</span>，对账差 <span>{diff}</span>（浮点尾数）· 有界输入 x ≡ 1 送进去：输出到第 400 步爬到 <span>{peak}</span>，极限正好是 {closed}——a 越贴近 1，这个数越大、没有上限（a = 1 就是第 0 步的蓄水池：Σ|h| 发散，存多少涨多少）',
    s5memT: '体检三 · 记忆：h 拖多长的尾巴？',
    s5memE: '记忆看的是 h 的<strong>支撑有多长</strong>：滑动平均的 h 一出窗就严格归零——一巴掌的影响只活 3 步，叫有限冲激响应（FIR）；累加器的 h 是 a<sup>n</sup>，理论上永不归零——多少步之后都还剩一丝回声，叫无限冲激响应（IIR）。',
    s5memRo: '滑动平均：h 的支撑 = <span>3</span> 根针（恰好等于窗宽），n ≥ 3 严格为 0 · 累加器（a = 0.9）：h[100] = <span>{h100}</span>，h[200] = <span>{h200}</span>——小到快看不见，但<strong>不是 0</strong>',
    s5hint: '三张体检表连起来看：因果决定 h 的左边界，记忆决定 h 的右边界（有限或无限），稳定决定 h 的绝对值总和。工程上选系统，本质就是在这三张表上做取舍——要实时就必须因果，要不发散就得让 Σ|h| 收住，想要结构简单，就得忍受一条长尾巴（或者反过来）。',
    cvNeg: 'n < 0：巴掌落下之前', cvH5: 'h[n]', cvMa: '滑动平均的 h（FIR）', cvAcc: '累加器的 h（a = 0.9，IIR）',
    cvStaNote: '仅显示前 160 根（n = 0…159）；求和按读数口径算到 n = 4000',

    s6k: '第 6 步 · 终章',
    s6t: '从方程到指纹，再到一切输入',
    s6e: '终章把整页收拢到一台真系统上：一个<strong>弹簧-阻尼</strong>的离散模型——差分方程本身就是它的定义（一个 n 就是一个时间步）：θ 决定它摆动的快慢（刚度），r 决定余韵的长短（r 越贴近 1，阻尼越小、振得越久）。流程还是那一套：<strong>先扇一巴掌把 h 数值录下来（录 120 根针），再送一段任意输入</strong>——左路按方程直接递推；右路什么都不许用，只许拿刚录的 h 做叠加预测。两条线和它们的最大差都在下面，如实报数。',
    s6formula: 'y[n] = x[n] + 2r·cosθ · y[n−1] − r² · y[n−2]',
    s6thLab: 'θ · 摆动快慢（刚度）',
    s6rLab: 'r · 余韵长短（阻尼，越贴近 1 振得越久）',
    s6ro: '直接递推 vs 只用 h 的预测：{N} 个输出点逐点最大差 = <span>{err}</span>——不是 0：两条路的加法顺序不同，浮点尾数就差这么多；也不是含糊的「差不多」：这个数就是全部误差，一分不多',
    s6note: '口径交代：h 不是拿闭式画出来的，是把 δ[n] 送进差分方程数值录下的；预测那一路只用这份录好的 h 与输入做叠加，方程本身在预测时已经被「忘掉」了。它还能分毫不差地复现输出，靠的就是第 2、3 步验过的那套：指纹 + 两条公理。',
    s6card1T: '房间混响',
    s6card1: '录一次房间的 h（在房间里放一记脉冲声、录下回声），就能把任意声音「搬进」这个房间：拿声音与这份 h 做叠加，耳机里就是那个房间的混响。录音软件里的混响插件，装的就是一份份录好的 h。',
    s6card2T: '信道均衡',
    s6card2: '信号穿过电缆、墙壁和空气都会被通道改形——通道也是一个系统。先发一记已知的冲激、把通道的 h 测出来，再设计一个「逆着补」的系统把形变抵消掉，这就是均衡器在做的事：先体检，再开药。',
    s6card3T: '控制系统',
    s6card3: '控制页里给被控对象送的测试信号、看的响应曲线，走的都是这套路：先录下系统对标准一击的回答，再据此设计反馈。从耳机里的混响一路到工业控制，动作都一样——先录指纹。',
    s6fin: '收个尾：卷积页教你「翻转、滑动、乘加」怎么算，本页讲的是<strong>为什么只算这一个就够</strong>——对 LTI 系统，一巴掌里藏着全部答案：输入先拆成一排冲激（第 1 步），每根冲激的回答都是同一份 h 的缩放平移（第 2 步），加起来就是全部输出；而这套魔法成立的契约和失效的边界，都在第 3 步的检验台上当场验过。以后遇到任何黑箱，先想一件事：<strong>扇它一巴掌，录下 h。</strong>',
    s6lkC: '卷积：计算手艺在那一页 →', s6lkZ: 'Z 变换：h 的代数身份证 →', s6lkCtl: '反馈与控制 →',
    cvH6: '刚录下的 h[n]（送 δ 数值录）', cvX6: '任意输入 x[n]', cvDir: '直接递推', cvPred6: '只用 h 的叠加预测'
  },
  en: {
    docTitle: 'Impulse & LTI · Slap the System · One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Impulse & LTI · One Slap',
    tagline: 'To get to know a system, don’t probe it input by input — slap it once, and record everything it answers to an impulse δ. That recording, h[n], is the system’s fingerprint: as long as the system is linear and time-invariant (LTI), its answer to any input is a weighted stacking of this one fingerprint. Everything on this page is discrete-time, and every claim is computed in front of you.',
    nav0: '0 The Slap', nav1: '1 δ & Decomposition', nav2: '2 h the Fingerprint', nav3: '3 The Axiom Bench',
    nav4: '4 Step Response', nav5: '5 Reading h', nav6: '6 Finale · Equation to Fingerprint',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Impulse & LTI —— one interaction per step',

    s0k: 'Step 0 · The Hook',
    s0t: 'Slap it, and listen to the echo',
    s0e: 'Three black boxes, three different systems inside — you don’t get to know which is which yet. The sharpest way to meet a system is to hit it with <strong>the shortest, most standard blow there is</strong>: a single spike of height 1 at n = 0 and zeros everywhere else — the <strong>impulse δ[n]</strong>. Everything the box does in response is its <strong>impulse response h[n]</strong>. Slap each one, guess its character from the echo, then see the reveal.',
    s0slap: 'Slap it (feed δ[n])',
    s0slapAll: 'Slap all three',
    s0ro0: 'No box has been slapped yet. Every box gets exactly the same slap — what the echo looks like is entirely up to the box.',
    s0roSome: '<span>{m}</span> / 3 boxes slapped, echoes recorded. Press a box’s own button to slap it again.',
    s0roDone: 'All three boxes slapped: the same δ[n] went in, and the echoes came back ringing down, copied verbatim, and stepped up to stay. <strong>Same input, three different answers — the difference is the system itself</strong>, and h[n] records that difference in full.',
    s0hint: 'Three completely different echo shapes: one dies away, one is flat, one keeps everything. The rest of this page does exactly one thing: <strong>show you where this fingerprint h[n] comes from, what it can do, and where it stops working — with every claim verified on the spot</strong>. One ground rule: this page uses only the discrete impulse δ[n] — an ordinary sequence that is 1 at n = 0 and 0 elsewhere. Clean, exact, no hand-waving.',
    s0nameAq: 'Black Box A', s0nameBq: 'Black Box B', s0nameCq: 'Black Box C',
    s0descPre: 'Identity classified. Slap it, and guess from the echo.',
    s0namePend: 'Box {k} · not yet revealed',
    s0descPend: 'Echo recorded. Guess its character below — only then is its identity revealed.',
    s0guessLab: 'Guess its character first:',
    s0gRing: 'Rings, then settles',
    s0gFlat: 'One spike, unchanged',
    s0gStep: 'Steps up and stays',
    s0roScore: ' · character guesses: {r} revealed, <span>{c}</span> correct',
    s0nameA: 'Box A · The Echo Spring',
    s0descA: 'Revealed: a second-order resonator (a discrete spring–damper). It has a rhythm of its own: one slap and it rings at that rhythm while settling — like tapping an empty can; the sound belongs to the can.',
    s0nameB: 'Box B · The Straight Wire',
    s0descB: 'Revealed: y[n] = x[n], the system that does nothing at all. No memory, no processing: the echo is the slap itself, h[n] = δ[n].',
    s0nameC: 'Box C · The Reservoir',
    s0descC: 'Revealed: an integrator, y[n] = y[n−1] + x[n]. It keeps every drop of the slap: the level jumps once and then holds — h[n] is a single step (1 for all n ≥ 0).',
    cvWait: 'Not slapped yet — nobody knows what’s inside',
    cvH: 'the answer h[n]',

    s1k: 'Step 1 · δ & Decomposition',
    s1t: 'Meet the slap itself: δ[n], and taking any signal apart',
    s1e: 'First, look at the slap closely. <strong>Sifting</strong>: multiply any signal x[n] by δ[n−k] (the impulse shifted to time k) and every stem is crushed to zero except the k-th, whose height is exactly x[k] — an impulse is a pair of tweezers that plucks any single sample out of a signal. Drag k and pluck them one by one. Then <strong>decomposition</strong>: write every stem of x as its own impulse component, x[n] = Σ<sub>k</sub> x[k]·δ[n−k] — a row of impulses whose heights are the signal’s samples. Flip the components on one at a time and watch their sum grow, stem by stem, into x itself.',
    s1formula: 'x[n] = Σₖ x[k] · δ[n − k]',
    s1kLab: 'k · slide δ onto the k-th stem',
    s1ro: 'k = <span>{k}</span> · the tweezers picked sample x[{k}] = <span>{v}</span> · the product x[n]·δ[n−{k}] keeps only the stem at n = {k}; every other time is flattened by a ×0',
    s1tglLab: 'Switch on the impulse components x[k]·δ[n−k], one by one:',
    s1all: 'All on', s1none: 'All off',
    s1ro2: '<span>{m}</span> / 12 components on · the current sum vs the target x, max pointwise difference = <span>{err}</span>',
    s1ro2full: ' · all 12 on: the sum and x <strong>coincide at every point, difference identically 0</strong> — not drawn to look alike; the numbers are literally the same row',
    s1hint: 'An honest aside on scope: continuous time has a δ(t) too, but it is not an ordinary function — it can only be defined through limits and its sifting property ∫x(t)δ(t)dt = x(0); drawing it as a finite narrow spike is always an approximation sketch. This page stays out of that swamp and uses only the discrete δ[n]: <strong>an ordinary sequence, 1 at n = 0 and 0 elsewhere</strong>, so every claim can be checked point by point.',
    cvX: 'the signal x[n]', cvProd: 'the product (one stem survives)', cvComp: 'components switched on', cvSum: 'the running sum',

    s2k: 'Step 2 · h the Fingerprint',
    s2t: 'h[n]: know it, and you know the answer to every input',
    s2e: 'Now record a fingerprint. Pick a system; the first move is always the same: <strong>feed δ[n] and write the answer down as h[n]</strong>. Then feed a real signal x[n] (gray stems). By step 1, x is a sum of impulse components; if the system is <strong>linear</strong>, the answer to component k, x[k]·δ[n−k], must be x[k]·h[n−k] — that copy of h scaled by x[k]; if it is also <strong>time-invariant</strong>, every copy is shifted by k and otherwise identical. So the output is <strong>all those scaled, shifted copies of h stacked up</strong>. In the picture, each translucent mound is one copy; the orange stems are the total. Underneath is an audit: run the same input through the system’s defining equation directly, and compare the two routes point by point — the difference is reported, not asserted.',
    s2sysMa: '3-point moving average', s2sysAcc: 'Exponential-decay accumulator', s2sysDiff: 'Differencer',
    s2aLab: 'a · the accumulator’s decay (accumulator only)',
    s2copies: 'Show every scaled, shifted copy of h',
    s2ro: 'System: <b>{sys}</b> · audit of the two routes ({N} output points): direct recursion vs stacking h, max difference = <span>{err}</span> — floating-point dust; both routes compute the same thing',
    s2hint: 'Look at the three h shapes. The differencer has just two stems (1 and −1): its “remembers only one step” character is written right there. The accumulator’s h is a run of a<sup>n</sup>: the echo of one slap never truly reaches zero, it only gets lighter — this long-tailed h returns in step 5. The moving average is three equal stems: outside the window, nothing matters; inside, everything counts the same.',
    s2linkTxt: 'The craft of “flip h, slide it, multiply and add” — convolution — has its own page on this site; this page only borrows its conclusion: the output is a weighted stacking of h. For the craft itself, go here →',
    s2lkC: 'Convolution: the flip-slide-multiply-add craft lives on that page →',
    cvH2: 'h[n] (recorded with one slap)', cvXin: 'input x[n]', cvCopies: 'each copy x[k]·h[n−k] (copy stems drawn only where |value| ≥ 0.02)', cvYout: 'output y[n] (the total)',

    s3k: 'Step 3 · The Axiom Bench',
    s3t: 'Two axioms, falsifiable on the spot',
    s3e: 'Step 2’s magic isn’t free — it is mortgaged on two axioms: <strong>linearity</strong> (a weighted mix of inputs → the same weighted mix of outputs) and <strong>time-invariance</strong> (the same input arriving later → the same output, just later). These are not decorative clauses in a definition; they are contracts that can be tested here and can fail here. Welcome to the bench: three systems take the stand in turn, and both tests report <strong>concrete deviation numbers</strong> — passes leave only floating-point dust (around 10<sup>−16</sup>), failures are unmistakably large.',
    s3sysAcc: 'Accumulator (claims to be LTI)', s3sysSq: 'Squarer y[n] = x[n]²', s3sysTv: 'Time-varying gain y[n] = g[n]·x[n]',
    s3supT: 'Test 1 · Superposition (linearity)',
    s3supE: 'Take two inputs x<sub>1</sub> and x<sub>2</sub>, with weights a = 2, b = −1. Left route: mix the inputs into 2x<sub>1</sub> − x<sub>2</sub> first, then run the system. Right route: run each input separately, then mix the outputs with the same 2 and −1. Linearity holds ⟺ the two routes agree at every point.',
    s3tiT: 'Test 2 · Time-invariance',
    s3tiE: 'One input x<sub>1</sub>: run it directly, and also delay it by D = 3 steps before running it. Time-invariance holds ⟺ the second output is exactly the first output delayed by 3 steps, point by point. (On the time-varying bench, g[n] = 0.25 + 0.0625n: the gain climbs with time — it is still linear in the input; what changes is <em>when</em> you feed it.)',
    s3fakeT: 'When an axiom fails: the squarer’s “fake h”',
    s3fakeE: 'Ignore the axioms and record an “h” for the squarer anyway: feeding δ returns δ² = δ, so this fake h “predicts” that every input passes through unchanged. But the true output is x[n]². Put the two curves side by side — where the axioms are absent, the prediction goes bankrupt on the spot.',
    s3supRo: 'a = 2, b = −1 · max pointwise difference between the two routes = <span>{dev}</span> · {verdict}',
    s3tiRo: 'delay D = 3 steps · max pointwise difference between the two routes = <span>{dev}</span> · {verdict}',
    s3fakeRo: 'fake-h prediction vs true output: max pointwise difference = <span>{dev}</span> — for a system that fails the axioms, “record h once, answer everything” goes bankrupt on the spot',
    vPass: '<span class="verdict pass">PASS ✓ · only floating-point dust remains</span>',
    vFailSup: '<span class="verdict fail">FAILS ✗ · superposition does not hold</span>',
    vFailTi: '<span class="verdict fail">FAILS ✗ · the output is not a shift of the original</span>',
    s3hint: 'Read the three report cards. The accumulator passes both — it is genuinely LTI, and the h magic applies to it in full. The squarer <strong>passes time-invariance and fails superposition</strong>: it has no memory and no sense of time, but (2x<sub>1</sub> − x<sub>2</sub>)<sup>2</sup> ≠ 2x<sub>1</sub><sup>2</sup> − x<sub>2</sub><sup>2</sup> — the cross term is exactly where the deviation comes from. The time-varying gain is the mirror image: <strong>passes superposition, fails time-invariance</strong> — g[n] depends on the clock, not the input, so it stays linear in x; but feed the same signal three steps later and it gets multiplied by a different gain. Each axiom guards its own territory; you need both.',
    cvLhs: 'left route: output of the mixed input', cvRhs: 'right route: the mix of the outputs', cvTiA: 'output of the delayed input', cvTiB: 'the original output, delayed 3',
    cvPred: 'the fake h predicts', cvTrue: 'the true output x[n]²',

    s4k: 'Step 4 · Step Response',
    s4t: 'The step response s[n]: h’s close relative, linked by sums and differences',
    s4e: 'Feed one more cheap input: the <strong>step u[n]</strong> (0 for n &lt; 0, then 1 forever), and call the answer the <strong>step response s[n]</strong>. It is a close relative of h: the step itself is the running sum of impulses (stack δ’s from the start and you get a staircase), so by linearity and time-invariance the answer accumulates too: <strong>s[n] = h[0] + h[1] + … + h[n]</strong>; and differencing s once peels h back out. Both directions are computed for you below: the left plot is h (with diff(s) overlaid as hollow dots), the right plot is s (with cumsum(h) overlaid), and both max differences are in the readout.',
    s4formula: 's[n] = Σₖ₌₀ⁿ h[k] ,  h[n] = s[n] − s[n−1]',
    s4sysAcc: 'Exponential-decay accumulator', s4sysMa: '3-point moving average',
    s4aLab: 'a · the accumulator’s decay (accumulator only)',
    s4ovH: 'Overlay diff(s) on h for comparison',
    s4ovS: 'Overlay cumsum(h) on s for comparison',
    s4ro: 'Two-way audit: max|cumsum(h) − s| = <span>{e1}</span> · max|diff(s) − h| = <span>{e2}</span> (both floating-point dust) · currently s[24] = <span>{sv}</span>',
    s4hint: 'Why do engineers prefer measuring s? To measure h directly you would need a slap of “infinite strength in zero time”, which no lab can deliver; measuring s only takes <strong>flipping a switch and watching it climb</strong> — apply DC, open a valve. That is why datasheets and labs are full of step responses; when you need h, one difference peels it out (that is the overlaid layer on the left plot).',
    cvH4: 'h[n] (feed δ[n])', cvS4: 's[n] (feed u[n])', cvDiffS: 'diff(s) overlaid', cvCumH: 'cumsum(h) overlaid',

    s5k: 'Step 5 · Reading h',
    s5t: 'No test signal needed: h alone convicts or acquits on three counts',
    s5e: 'Finally, put h itself on the examination table. Three verdicts need no test signal at all — <strong>h alone is enough</strong>: causality is read off its left half, stability off its total sum, memory off its tail.',
    s5cauT: 'Check 1 · Causality: does it peek at the future?',
    s5cauE: 'A causal system’s output may only use <strong>past and present</strong> inputs, so its h must be exactly zero for all n &lt; 0 — no echo before the slap lands. The plot starts at n = −4: the left stretch is “before the slap”. Two suspects: the moving average only looks backward (causal); the centered average needs x[n+1] to compute y[n] — tomorrow’s input.',
    s5sysMa: 'Moving average (looks back)', s5sysCe: 'Centered average (peeks ahead)',
    s5cauRo: 'max |h| on the n &lt; 0 side = <span>{v}</span> · {verdict}',
    vCausal: '<span class="verdict pass">CAUSAL ✓ · before the slap lands, the echo is exactly zero</span>',
    vNonCausal: '<span class="verdict fail">NON-CAUSAL ✗ · it uses future inputs</span>',
    s5staT: 'Check 2 · Stability: does Σ|h[n]| stay finite?',
    s5staE: 'BIBO stability has exactly one criterion: <strong>Σ|h[n]| &lt; ∞</strong> — if the absolute sum of the echo converges, no bounded input can produce an unbounded output. Take the accumulator’s h[n] = a<sup>n</sup>: the page adds |h| up to n = 4000 (the leftover tail is not hand-waved away as “negligible”: it is the exact remainder a<sup>4001</sup>/(1−a), printed digit for digit in the readout) and audits it against the closed form 1/(1−a); then it feeds the cheapest bounded input of all, x ≡ 1 with |x| ≤ 1, and watches how high the output climbs.',
    s5aLab: 'a · the accumulator’s decay (h[n] = aⁿ)',
    s5staRo: 'a = <span>{a}</span> · Σ|h| (summed to n = 4000) = <span>{sum}</span> · the leftover tail is not an estimate: it equals the exact remainder a<sup>4001</sup>/(1−a) = <span>{tail}</span> · the two parts add to <span>{sumtail}</span> vs the closed form 1/(1−a) = <span>{closed}</span> — audit difference <span>{diff}</span> (floating-point dust) · feed the bounded input x ≡ 1: by step 400 the output has climbed to <span>{peak}</span>, and its limit is exactly {closed} — the closer a gets to 1, the larger this number grows, with no ceiling (a = 1 is step 0’s reservoir: Σ|h| diverges, and it keeps whatever you pour in)',
    s5memT: 'Check 3 · Memory: how long a tail does h drag?',
    s5memE: 'Memory is the <strong>length of h’s support</strong>: the moving average’s h hits exactly zero outside its window — one slap’s influence lives for exactly 3 steps, a finite impulse response (FIR). The accumulator’s h is a<sup>n</sup>, which in theory never reaches zero — some whisper of the echo remains forever, an infinite impulse response (IIR).',
    s5memRo: 'Moving average: h’s support = <span>3</span> stems (exactly the window width), strictly 0 from n ≥ 3 · Accumulator (a = 0.9): h[100] = <span>{h100}</span>, h[200] = <span>{h200}</span> — too small to see, but <strong>not zero</strong>',
    s5hint: 'Read the three checks together: causality fixes h’s left edge, memory fixes its right edge (finite or infinite), stability fixes the total of its absolute values. Choosing a system in engineering is largely making trade-offs on these three tables — real-time forces causality, not blowing up forces Σ|h| to converge, and a simple structure means putting up with a long tail (or the reverse).',
    cvNeg: 'n < 0: before the slap lands', cvH5: 'h[n]', cvMa: 'moving average’s h (FIR)', cvAcc: 'accumulator’s h (a = 0.9, IIR)',
    cvStaNote: 'Only the first 160 stems are drawn (n = 0…159); the sum follows the readout, out to n = 4000',

    s6k: 'Step 6 · Finale',
    s6t: 'From an equation to a fingerprint, and from there to everything',
    s6e: 'The finale gathers the whole page onto one real system: a discrete <strong>spring–damper</strong> model — the difference equation below <em>is</em> its definition (one n is one time step): θ sets how fast it swings (stiffness), r sets how long the ringing lasts (the closer r is to 1, the lighter the damping). The ritual is the same as always: <strong>slap it once and record h numerically (120 stems), then feed an arbitrary input</strong> — the left route recurses the equation directly; the right route is forbidden from touching the equation and may only stack the recorded h. Both curves, and their maximum difference, are below — reported, not rounded away.',
    s6formula: 'y[n] = x[n] + 2r·cosθ · y[n−1] − r² · y[n−2]',
    s6thLab: 'θ · swing speed (stiffness)',
    s6rLab: 'r · ring length (damping — closer to 1 rings longer)',
    s6ro: 'direct recursion vs the h-only prediction: max difference over {N} output points = <span>{err}</span> — not zero: the two routes add in different orders, so their floating-point dust differs by exactly this much; and not a vague “close enough” either: this number is the whole error, not a cent more',
    s6note: 'Method, stated plainly: h is not drawn from a closed form — it is recorded by feeding δ[n] into the difference equation numerically. The prediction route uses only that recorded h and the input (a stacking, i.e. convolution); by prediction time the equation itself has been “forgotten”. That it still reproduces the output to the last bit of dust rests entirely on what steps 2 and 3 verified: the fingerprint, plus the two axioms.',
    s6card1T: 'Room reverb',
    s6card1: 'Record a room’s h once (fire a pulse in the room, capture the echo), and you can move any sound “into” that room: stack the sound with this h and your headphones play that room’s reverb. The reverb plug-ins in audio software ship exactly this: libraries of recorded h’s.',
    s6card2T: 'Channel equalization',
    s6card2: 'A signal passing through cables, walls and air gets reshaped by the channel — and a channel is a system too. Send a known impulse first and measure the channel’s h, then design a system that undoes the reshaping in reverse. That is what an equalizer does: examine first, then prescribe.',
    s6card3T: 'Control systems',
    s6card3: 'The test signals and response curves on the control page follow exactly this pattern: record how the plant answers one standard blow, then design the feedback around that recording. From headphone reverb to industrial control, the move is the same — record the fingerprint first.',
    s6fin: 'To wrap up: the convolution page teaches how the “flip, slide, multiply, add” is computed; this page is about <strong>why computing this one thing is enough</strong> — for an LTI system, everything hides inside a single slap: any input splits into a row of impulses (step 1), each impulse’s answer is the same h scaled and shifted (step 2), and stacking them gives the whole output; the contract that makes the magic legal, and the boundary where it breaks, were both put on the bench in step 3. Next time you meet any black box, think of one thing first: <strong>slap it, and record h.</strong>',
    s6lkC: 'Convolution: the craft lives on that page →', s6lkZ: 'Z-transform: h’s algebraic ID card →', s6lkCtl: 'Feedback & control →',
    cvH6: 'the freshly recorded h[n] (δ fed numerically)', cvX6: 'an arbitrary input x[n]', cvDir: 'direct recursion', cvPred6: 'prediction from h alone'
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
