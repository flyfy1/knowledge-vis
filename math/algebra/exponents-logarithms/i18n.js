'use strict';
/* ============================================================
   指数与对数 · 乘出来是指数，问回去是对数 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '指数与对数 · 乘出来是指数，问回去是对数 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '指数与对数 · 乘出来，问回去',
    tagline: '有些增长不是「每次加一点」，而是「每次乘一个倍数」——起步慢得不起眼，后面快到吓人，这就是指数。对数听起来唬人，其实只是把指数的问句倒过来：已知 2 的几次方等于 8，反过来问「几次方」，这个答案就叫对数。这一页所有的数都用 Math.pow / Math.log 当场实算：写得尽的是精确值，写不尽的一律标 ≈，绝不冒充。',
    nav0: '0 翻倍的世界', nav1: '1 底数说了算', nav2: '2 对数登场', nav3: '3 三把尺子',
    nav4: '4 自测', nav5: '5 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 指数与对数 Exponentials & Logarithms —— 一步一交互系列',

    /* ---------- 第 0 步：翻倍的世界 ---------- */
    s0k: '第 0 步 · 翻倍的世界',
    s0t: '翻倍的世界：差在「乘」，不在「加」',
    s0e: '这一步要回答：<strong>不是每次加一点、而是每次乘一个倍数的增长，长什么样？</strong>一个细菌每小时翻一倍（×2）：1 个变 2 个、2 个变 4 个……图上青线是它，橙线是另一种活法：从 1 开始每小时 +2（1、3、5、7……）。同一张图、同一把尺子，播放或拖动探针，把两列数一路比到 10 小时。先把开头的问题摆明：<strong>从 1 个细菌开始，每小时翻一倍，24 小时后会有多少个？</strong>走完这一步，就能把这个数算完。',
    s0play: '播放 ▶', s0pause: '暂停 ⏸', s0replay: '再播一次 ↻',
    s0prog: '动画进度：已走到第 {n} / 100 小步',
    s0tLab: '时刻探针 t（小时）',
    s0probe: 't = {t} 小时：翻倍列 2<sup>{t}</sup> = <b>{d}</b>；直线列 1 + 2×{t} = <b>{l}</b>。',
    s0thT: '时间 t（小时）', s0thDbl: '翻倍：2^t', s0thLin: '直线：1 + 2t',
    s0conc: '把数表读出声就是规律：<b>翻倍列每过 1 小时，数量 ×2；直线列每过 1 小时，数量 +2</b>。起步时两列咬得很紧，越往后翻倍列甩得越开——因为「乘」会把已经变大的数继续放大，而「加」每次只添同样多。这种「加上同样的时间、乘上同样的倍数」的增长，就叫<strong>指数增长</strong>（「指数」就是右上角那个小小的 t：它数的是乘了几次）。',
    s0hint: '顺带把开头的问题算完：24 小时是 2<sup>24</sup> = 16,777,216 个——从 1 个细菌开始，一天就是一千六百多万。这不是细菌特别能生，是「翻倍」这种增长方式本身就这么猛。',
    s0lkLin: '对照：一次函数里「加等量、涨等量」的直线世界——斜率为什么恒定，去那一页看 →',
    cNum: '数量', cDbl: '翻倍 2^t', cLin: '直线 1 + 2t',

    /* ---------- 第 1 步：指数函数与底数 ---------- */
    s1k: '第 1 步 · 指数函数与底数',
    s1t: '底数说了算：y = aˣ 的全家福',
    s1e: '这一步要回答：<strong>倍数不是 2、时间不是整数时，曲线长什么样？</strong>把翻倍推广：底数（base，就是被反复乘的那个倍数 a）可以换，指数 x 可以是 0.5 这样的小数。拖动底数滑杆从 0.3 拖到 3，特别留意拖过 1 的那一刻；再拖曲线上的探针，读一读任意点的 a<sup>x</sup>——每个数都由 Math.pow 当场算出。',
    s1aLab: '底数 a（被反复乘的倍数）',
    s1xLab: '探针点的 x（可拖曲线上的点）',
    s1roGrow: 'a = <span>{a}</span> &gt; 1：曲线<b>上升</b>——x 每增加 1，y 就乘上一个 {a}；a 越大爬得越陡。这就是第 0 步翻倍的一般形。',
    s1roFlat: 'a = <span>1</span>：y = 1<sup>x</sup> = <b>1</b>，恒为 1——不涨也不跌，是一条平线。所以指数函数的定义要把 a = 1 除外，它不配叫「增长」也不配叫「衰减」。',
    s1roDecay: '0 &lt; a = <span>{a}</span> &lt; 1：曲线<b>下降</b>——x 每增加 1，y 就乘上一个小于 1 的倍数，越乘越小。这正是衰减的样子：一杯药在体内的含量、一块放射性材料的质量，都是每过一段固定时间就乘上一个固定的小于 1 的倍数（减半只是其中 a 随时间标度取到 0.5 的特例，这里不展开）。',
    s1probe: '探针 x = {x}：{a}<sup>{x}</sup> = <b>{v}</b>（Math.pow 实算）。',
    s1conc: '不管 a 取多少，所有 a<sup>x</sup> 都<strong>过 (0, 1)</strong>（a<sup>0</sup> = 1，图上的橙点纹丝不动），而且<strong>永远为正</strong>——曲线贴着 x 轴但碰不到它。结论：形如 <b>y = a<sup>x</sup>（a &gt; 0、a ≠ 1）</b>的函数叫<strong>指数函数</strong>；底数 a 一个数就决定了它涨还是跌、涨得多陡。',
    s1hint: '操作顺序建议：先把 a 停在 2 看探针读数（2<sup>0.5</sup> ≈ 1.414 这种非整数指数也有确定值）；再把 a 缓缓拖过 1——注意结论句会从「上升」翻成「平线」再翻成「下降」，图和话必须同步翻面。',
    cOrigin: '(0, 1)',
    cOff: '↑ 图外',

    /* ---------- 第 2 步：对数登场 ---------- */
    s2k: '第 2 步 · 对数登场',
    s2t: '反过来问：对数就是指数的问句倒装',
    s2e: '这一步要回答：<strong>知道 2<sup>x</sup> = 32，怎么把 x「问」出来？</strong>图上橙色虚线是目标高度 y*：拖动它（或点预设钮），它与曲线交点的横坐标就是答案。先把目标点到 8、32 这些数上，再点到 6——看读数有什么不一样。底数也可以换（2 / 3 / 10），同一套问法换个底数再来一遍。',
    s2baseLab: '底数：',
    s2tgtLab: '目标高度 y*（预设，或直接拖图上的橙线）：',
    s2ro: '目标高度 {tgt}：沿曲线走到这个高度，交点横坐标 <b>x {sol}</b>——即 {base}<sup>x</sup> = {tgt} 的解。换成问句：「{base} 的几次方等于 {tgt}？」答案就是这个 x。',
    s2roApprox: '注意这一档：x 写不尽，{sol} 只是近似值。但它有一个<b>准确的名字</b>：log<sub>{base}</sub>{tgt}。对数存在的理由就在这里——写不尽的答案，也配有一个精确的记号。',
    s2qaT: '把问答排成表：左边是问句，右边就是对数的写法',
    s2qaH1: '问句：底数的几次方等于真数？', s2qaH2: '答案（指数）', s2qaH3: '对数写法',
    s2conc: '揭晓记号：把「a 的几次方等于 b」的答案记作 <b>log<sub>a</sub>b</b>，读作「以 a 为底、b 的对数」——它问的就是「a 的几次方等于 b」。其中 a 是<strong>底数</strong>（还是第 1 步那个倍数），b 叫<strong>真数</strong>，就是被问的那个结果数。成立条件写在明处：<strong>a &gt; 0、a ≠ 1、b &gt; 0</strong>——真数必须为正，因为 a 的任何次幂都大于 0（曲线永远在 x 轴上方），所以 0 和负数根本问不出对数。',
    s2hint: '试一试目标 0.5（底数 2）：交点跑到 y 轴左边，x = −1——真数小于 1 时，对数是负数。自测第 1 题就从这里来。',
    cTarget: '目标 y*',

    /* ---------- 第 3 步：三把尺子 ---------- */
    s3k: '第 3 步 · 对数的运算律',
    s3t: '三把尺子：对数把乘法翻译成加法',
    s3e: '这一步要回答：<strong>对数凭什么能「把大数算小」？</strong>下面是一台实测台，图上是 y = 2<sup>x</sup> 与四个点。逐把尺子点过去，每条运算律都当场用 Math.log 算给你看、三栏对账——律不是背出来的，是量出来的（证明不在这一页展开，这点明说）。',
    s3r1: '尺子一 · 乘变加', s3r2: '尺子二 · 幂变乘', s3r3: '尺子三 · 换把尺子量',
    s3ro1: '乘变加：log₂8 = <b>{l8}</b>，log₂4 = <b>{l4}</b>；真数相乘 8 × 4 = 32，log₂32 = <b>{l32}</b>。对账：{l8} + {l4} = <b>{l32}</b> ✓——<b>真数相乘，对数相加</b>：log<sub>a</sub>(M×N) = log<sub>a</sub>M + log<sub>a</sub>N。',
    s3ro2: '幂变乘：4³ = <b>64</b>，log₂64 = <b>{l64}</b>；另一边 3 × log₂4 = 3 × {l4} = <b>{p}</b>。对账：两边都是 <b>{l64}</b> ✓——<b>真数乘方，对数乘倍数</b>：log<sub>a</sub>(M<sup>k</sup>) = k × log<sub>a</sub>M。',
    s3ro3: '换把尺子：同一个数 32，用底数 2 这把尺子量，log₂32 = <b>{a}</b>；换底数 10 这把尺子量，log₁₀32 = <b>{b}</b>。数还是那个数，尺子不同、读数不同——两把尺子之间可以互相换算（这一页只展示这一例，换算公式不展开）。',
    s3conc: '三条律合起来就是一句话：<strong>对数把乘法世界翻译回加法世界</strong>——乘变加、幂变乘。原来要算的乘法越大，这份翻译越值钱。',
    s3hint: '历史上这份翻译真救过命：没有计算器的年代，天文学家和航海家靠对数表把费劲的大数乘法变成查表加法，这把「计算尺」用了三百年。顺带认识一个记号：底数取 10 的对数叫<strong>常用对数</strong>，记作 lg——第 2 步的 log₁₀1000 = 3，也就是 lg 1000 = 3。',

    /* ---------- 第 4 步：自测 ---------- */
    s4k: '第 4 步 · 自测',
    s4t: '自测：问回去，你会吗？',
    s4e: '三道题都只考一件事：能不能把指数的问句倒过来问。答错了可以再试，判定不会被别的操作冲掉。',
    q1t: '题 1 · 小于 1 的真数',
    q1d: 'log₂(1/8) 等于几？先回想<a href="#step2">第 2 步的图</a>：2 的几次方会等于 1/8——真数小于 1，对应的指数在 y 轴的哪一侧？',
    q1ok: '✓ 对了：2<sup>−3</sup> = 1/2³ = <b>1/8</b>，所以 log₂(1/8) = <b>−3</b>。真数小于 1，对数就是负数——这和第 2 步把目标拖到 0.5 时看到的是同一件事。',
    q1no: '✗ 还不对。提示：2 的正数次幂都大于 1，到不了 1/8；试试负指数：2<sup>−3</sup> = 1/2³，是多少？',
    q2t: '题 2 · 乘了几次',
    q2d: '某种量每小时变成原来的 3 倍。从 1 倍开始，几小时后变成 81 倍？先列式：3<sup>t</sup> = 81，也就是 t = log₃81。',
    q2ok: '✓ 对：3⁴ = 81，所以 t = log₃81 = <b>4</b> 小时。指数问「乘出来是几」，对数问「乘了几次」——同一件事的正问和反问。',
    q2no: '✗ 再数一遍 3 的幂：3¹ = 3，3² = 9，3³ = 27，3⁴ = ……81 是第几个？',
    q3t: '题 3 · 判断',
    q3d: '判断这句话：「log₂8 和 log₂32 的差是 24。」',
    q3true: '对', q3false: '错',
    q3ok: '✓ 判断正确，这句话是<b>错的</b>：log₂8 = 3、log₂32 = 5，两者的差是 5 − 3 = <b>2</b>。24 是真数之差（32 − 8），不是对数之差。对数之差 2 对应的是倍数关系：32 = 8 × 4，而 4 = 2²——差 2 说的正是「多乘了两次 2」。',
    q3no: '✗ 这句话其实是错的。24 是 32 − 8，那是真数相减；对数要先各自算出来再减：log₂8 = 3，log₂32 = 5，3 和 5 的差是多少？',
    s4hint: '三道题的共同点：先把每个对数翻译回「几次方」的问句，再动手。翻译不出来时，回到第 2 步的图上拖一拖，答案就在交点的横坐标里。',

    /* ---------- 第 5 步：终章 ---------- */
    s5k: '第 5 步 · 终章',
    s5t: '乘出来是指数，问回去是对数',
    s5e: '指数和对数不是两个知识点，是同一个问题的正反两面。收口三张卡：',
    c1h: '乘出来，是指数',
    c1: '指数函数 y = a<sup>x</sup> 回答「乘出来是几」：给定底数（每步的倍数）和指数（乘了几次），算出结果。它刻画的是「加上同样的时间、乘上同样的倍数」的增长——起步慢，后程猛。',
    c2h: '问回去，是对数',
    c2: '对数 log<sub>a</sub>b 回答「乘了几次」：给定底数和结果（真数），问回指数。它不是一种新运算，只是把指数的问句倒过来写的一个记号——写不尽的答案（如 log₂6）靠它才有准确的名字。',
    c3h: '对数把乘变加',
    c3: '在对数的世界里：真数相乘 → 对数相加；真数乘方 → 对数乘倍数。这就是它能把大数算小、把乘法变加法的原因，也是它当了三百年计算工具的原因。',
    s5fin: '这套「乘与问」到处都是：<strong>复利</strong>是钱按倍数生长（指数）；<strong>分贝</strong>和<strong>里氏震级</strong>是把跨度极大的量压进小小的刻度（对数）。认出「每次乘同一个倍数」，就认出了指数；要问「乘了多少次才到这么大」，问的正是对数。',
    s5eLine: '还有一位特殊的底数先埋在这里：e ≈ 2.71828……。函数 y = e<sup>x</sup> 有个惊人的性质——它在每一点的导数，恰好等于它在那一点的函数值自身。这条线日后讲导数时再回收。',
    s5lkLin: '回头对照：一次函数的斜率——「加等量、涨等量」的世界，和这一页的「乘倍数」正好是一对 →',
  },
  en: {
    docTitle: 'Exponentials & Logarithms · Multiply It Out, Ask It Back — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Exponentials & Logarithms · Multiply Out, Ask Back',
    tagline: 'Some growth is not “add a bit each time” but “multiply by the same factor each time” — unremarkable at first, explosive later. That is the exponential. And the logarithm, for all its intimidating notation, is just the exponential question turned around: if 2 raised to some power gives 8, the logarithm is that power. Every number on this page is computed on the spot with Math.pow / Math.log: values that come out exact are stated exactly, values that do not are always marked ≈ — never dressed up as exact.',
    nav0: '0 Doubling World', nav1: '1 The Base Decides', nav2: '2 Logarithms Arrive', nav3: '3 Three Rulers',
    nav4: '4 Self-Test', nav5: '5 Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Exponentials & Logarithms —— one interaction at a time',

    s0k: 'Step 0 · The Doubling World',
    s0t: 'The Doubling World: It Is Multiply, Not Add',
    s0e: 'This step answers one question: <strong>what does growth look like when each step multiplies by the same factor instead of adding the same amount?</strong> A bacterium doubles every hour (×2): 1 becomes 2, 2 becomes 4… The cyan curve is the bacterium; the orange line lives differently: starting at 1, it adds +2 every hour (1, 3, 5, 7…). Same axes, same scale — play the animation or drag the probe and compare the two columns of numbers all the way to hour 10. And here is the opening question, stated plainly: <strong>starting from a single bacterium that doubles every hour, how many are there after 24 hours?</strong> By the end of this step you will be able to finish that count.',
    s0play: 'Play ▶', s0pause: 'Pause ⏸', s0replay: 'Play again ↻',
    s0prog: 'Animation progress: sub-step {n} / 100',
    s0tLab: 'Time probe t (hours)',
    s0probe: 'At t = {t} h: doubling column 2<sup>{t}</sup> = <b>{d}</b>; straight-line column 1 + 2×{t} = <b>{l}</b>.',
    s0thT: 'time t (hours)', s0thDbl: 'doubling: 2^t', s0thLin: 'line: 1 + 2t',
    s0conc: 'Read the table aloud and the pattern says itself: <b>each hour, the doubling column multiplies by 2; the line column adds 2</b>. Early on the two stay close; later the doubling column runs away — because multiplication keeps amplifying a number that has already grown, while addition always adds the same small amount. Growth of the form “add the same time, multiply by the same factor” is called <strong>exponential growth</strong> (the “exponent” is the little t in the top-right corner: it counts how many multiplications have happened).',
    s0hint: 'And the opening question, finished: after 24 hours there are 2<sup>24</sup> = 16,777,216 bacteria — from a single cell to over sixteen million in a day. The bacterium is not especially fertile; doubling itself is just that fierce.',
    s0lkLin: 'Contrast: the straight-line world of “add the same, grow the same” — why the slope of a linear function never changes →',
    cNum: 'count', cDbl: 'doubling 2^t', cLin: 'line 1 + 2t',

    s1k: 'Step 1 · The Exponential Function and Its Base',
    s1t: 'The Base Decides: the y = aˣ Family',
    s1e: 'This step answers: <strong>what does the curve look like when the factor is not 2, and time is not a whole number?</strong> Generalise doubling: the base (the factor a that gets multiplied over and over) can change, and the exponent x can be a fraction like 0.5. Drag the base slider from 0.3 to 3 and watch the moment it crosses 1; then drag the probe along the curve and read a<sup>x</sup> at any point — every value is computed live by Math.pow.',
    s1aLab: 'Base a (the factor multiplied over and over)',
    s1xLab: 'Probe point x (or drag the point on the curve)',
    s1roGrow: 'a = <span>{a}</span> &gt; 1: the curve <b>rises</b> — each +1 in x multiplies y by {a}; the larger a is, the steeper the climb. This is Step 0’s doubling in general form.',
    s1roFlat: 'a = <span>1</span>: y = 1<sup>x</sup> = <b>1</b>, always 1 — neither rising nor falling, just a flat line. That is why the definition of an exponential function excludes a = 1: it is neither growth nor decay.',
    s1roDecay: '0 &lt; a = <span>{a}</span> &lt; 1: the curve <b>falls</b> — each +1 in x multiplies y by a factor below 1, so it shrinks and shrinks. This is decay: the amount of a drug left in the body, or the mass of a radioactive sample, each multiplies by one fixed factor below 1 per fixed time interval (halving is just the special case where that factor works out to 0.5 — not expanded here).',
    s1probe: 'Probe at x = {x}: {a}<sup>{x}</sup> = <b>{v}</b> (computed by Math.pow).',
    s1conc: 'Whatever a is, every a<sup>x</sup> passes through <strong>(0, 1)</strong> (a<sup>0</sup> = 1 — the orange point never moves), and every value is <strong>positive</strong>: the curve hugs the x-axis but never touches it. Conclusion: a function of the form <b>y = a<sup>x</sup> (a &gt; 0, a ≠ 1)</b> is an <strong>exponential function</strong>; the single number a decides whether it grows or decays, and how steeply.',
    s1hint: 'Suggested order: park a at 2 and read the probe (non-integer powers like 2<sup>0.5</sup> ≈ 1.414 have definite values too); then drag a slowly across 1 — the conclusion flips from “rises” to “flat” to “falls”, and the picture and the sentence must flip together.',
    cOrigin: '(0, 1)',
    cOff: '↑ off-chart',

    s2k: 'Step 2 · Logarithms Arrive',
    s2t: 'Ask It Backwards: the Logarithm Is the Exponential Question, Inverted',
    s2e: 'This step answers: <strong>given 2<sup>x</sup> = 32, how do you “ask out” the x?</strong> The dashed orange line is a target height y*: drag it (or use the preset buttons) and the x-coordinate of its intersection with the curve is the answer. Park the target on 8 and 32 first, then on 6 — and watch what changes in the readout. The base can be switched too (2 / 3 / 10): same question, different base.',
    s2baseLab: 'Base:',
    s2tgtLab: 'Target height y* (presets, or drag the orange line on the graph):',
    s2ro: 'Target height {tgt}: walk along the curve to that height and the intersection has x-coordinate <b>x {sol}</b> — the solution of {base}<sup>x</sup> = {tgt}. As a question: “{base} raised to what power gives {tgt}?” — this x is the answer.',
    s2roApprox: 'Notice this stop: x cannot be written out fully, so {sol} is only an approximation. But it has an <b>exact name</b>: log<sub>{base}</sub>{tgt}. That is the whole reason logarithms exist — an answer that cannot be written out still deserves exact notation.',
    s2qaT: 'The Q&A, tabulated: questions on the left, logarithm notation on the right',
    s2qaH1: 'Question: base to what power gives the number?', s2qaH2: 'Answer (the power)', s2qaH3: 'Logarithm notation',
    s2conc: 'Notation revealed: the answer to “a raised to what power gives b” is written <b>log<sub>a</sub>b</b>, read “the logarithm of b to base a” — it asks exactly “to what power must a be raised to give b”. Here a is the <strong>base</strong> (the same factor as in Step 1) and b is called the <strong>argument</strong> — the resulting number being asked about. The conditions, stated plainly: <strong>a &gt; 0, a ≠ 1, b &gt; 0</strong> — the argument must be positive, because every power of a is positive (the curve stays above the x-axis), so 0 and negative numbers simply have no logarithm to ask for.',
    s2hint: 'Try target 0.5 with base 2: the intersection jumps to the left of the y-axis and x = −1 — when the argument is below 1, the logarithm is negative. Quiz question 1 comes straight from here.',
    cTarget: 'target y*',

    s3k: 'Step 3 · The Laws of Logarithms',
    s3t: 'Three Rulers: Logarithms Translate Multiplication into Addition',
    s3e: 'This step answers: <strong>why can logarithms “make big numbers small”?</strong> Below is a measuring bench: the graph shows y = 2<sup>x</sup> with four points marked. Click through the three rulers; every law is computed live with Math.log and checked in three columns — the laws are measured, not memorised (proofs are not expanded on this page, and that is said out loud).',
    s3r1: 'Ruler 1 · Product → sum', s3r2: 'Ruler 2 · Power → product', s3r3: 'Ruler 3 · Change the ruler',
    s3ro1: 'Product → sum: log₂8 = <b>{l8}</b>, log₂4 = <b>{l4}</b>; multiply the arguments, 8 × 4 = 32, and log₂32 = <b>{l32}</b>. Check: {l8} + {l4} = <b>{l32}</b> ✓ — <b>arguments multiply, logarithms add</b>: log<sub>a</sub>(M×N) = log<sub>a</sub>M + log<sub>a</sub>N.',
    s3ro2: 'Power → product: 4³ = <b>64</b>, and log₂64 = <b>{l64}</b>; on the other side, 3 × log₂4 = 3 × {l4} = <b>{p}</b>. Check: both sides are <b>{l64}</b> ✓ — <b>an argument raised to a power, the logarithm multiplied by that power</b>: log<sub>a</sub>(M<sup>k</sup>) = k × log<sub>a</sub>M.',
    s3ro3: 'Change the ruler: the same number 32, measured with base 2, gives log₂32 = <b>{a}</b>; measured with base 10, log₁₀32 = <b>{b}</b>. The number did not change — the ruler did, so the reading did. The two rulers can be converted into each other (this page shows this one example; the conversion formula is not expanded).',
    s3conc: 'The three laws together say one thing: <strong>logarithms translate the multiplication world back into the addition world</strong> — products become sums, powers become products. The bigger the multiplication you were facing, the more that translation is worth.',
    s3hint: 'Historically this translation saved real labour: before calculators, astronomers and navigators used logarithm tables to turn painful big multiplications into table lookups and additions — the “slide rule” era lasted three centuries. One more notation to meet: base-10 logarithms are called <strong>common logarithms</strong>, written lg — Step 2’s log₁₀1000 = 3 is the same as lg 1000 = 3.',

    s4k: 'Step 4 · Self-Test',
    s4t: 'Self-Test: Can You Ask It Backwards?',
    s4e: 'All three questions test one skill: turning the exponential question around. Wrong answers can be retried, and your verdicts are not wiped by fiddling elsewhere on the page.',
    q1t: 'Question 1 · An argument below 1',
    q1d: 'What is log₂(1/8)? Recall <a href="#step2">the graph in Step 2</a>: 2 raised to what power gives 1/8 — and on which side of the y-axis does an argument below 1 live?',
    q1ok: '✓ Correct: 2<sup>−3</sup> = 1/2³ = <b>1/8</b>, so log₂(1/8) = <b>−3</b>. An argument below 1 makes the logarithm negative — the same thing you saw dragging the target to 0.5 in Step 2.',
    q1no: '✗ Not yet. Hint: positive powers of 2 are all above 1, so they cannot reach 1/8. Try a negative power: what is 2<sup>−3</sup> = 1/2³?',
    q2t: 'Question 2 · How many multiplications',
    q2d: 'A quantity triples every hour (×3 per hour). Starting from 1×, after how many hours is it 81×? Set it up first: 3<sup>t</sup> = 81, i.e. t = log₃81.',
    q2ok: '✓ Correct: 3⁴ = 81, so t = log₃81 = <b>4</b> hours. Exponentials ask “what does it multiply out to”, logarithms ask “how many times did it multiply” — the same fact, asked forwards and backwards.',
    q2no: '✗ Count the powers of 3 again: 3¹ = 3, 3² = 9, 3³ = 27, 3⁴ = … — which one is 81?',
    q3t: 'Question 3 · True or false',
    q3d: 'Judge this claim: “The difference between log₂8 and log₂32 is 24.”',
    q3true: 'True', q3false: 'False',
    q3ok: '✓ Correct judgment — the claim is <b>false</b>: log₂8 = 3 and log₂32 = 5, so their difference is 5 − 3 = <b>2</b>. 24 is the difference of the arguments (32 − 8), not of the logarithms. A logarithm difference of 2 encodes a ratio: 32 = 8 × 4, and 4 = 2² — the 2 says exactly “two more multiplications by 2”.',
    q3no: '✗ The claim is actually false. 24 is 32 − 8 — the arguments subtracted. Logarithms must be computed first, then subtracted: log₂8 = 3 and log₂32 = 5. What is the difference of 3 and 5?',
    s4hint: 'Common thread: translate every logarithm back into a “to what power” question before computing. If the translation stalls, go back to the graph in Step 2 and drag — the answer lives in the x-coordinate of the intersection.',

    s5k: 'Step 5 · Finale',
    s5t: 'Multiply It Out: Exponential. Ask It Back: Logarithm.',
    s5e: 'Exponentials and logarithms are not two topics — they are the two directions of one question. Three closing cards:',
    c1h: 'Multiply it out: the exponential',
    c1: 'The exponential y = a<sup>x</sup> answers “what does it multiply out to”: given the base (the per-step factor) and the exponent (how many multiplications), it computes the result. It captures growth of the form “add the same time, multiply by the same factor” — slow at the start, fierce later on.',
    c2h: 'Ask it back: the logarithm',
    c2: 'The logarithm log<sub>a</sub>b answers “how many times did it multiply”: given the base and the result (the argument), it asks the exponent back. It is not a new operation — just the exponential question written in reverse, and the notation that gives un-writable answers (like log₂6) an exact name.',
    c3h: 'Logarithms turn products into sums',
    c3: 'In the logarithm world: arguments multiplied → logarithms added; arguments raised to a power → logarithms multiplied by that power. That is why logarithms shrink big numbers and turn multiplication into addition — and why they served as a computing tool for three centuries.',
    s5fin: 'This multiply-and-ask pair is everywhere: <strong>compound interest</strong> is money growing by a factor (exponential); <strong>decibels</strong> and the <strong>Richter scale</strong> squeeze quantities spanning huge ranges onto small scales (logarithms). Spot “multiply by the same factor each step” and you have spotted an exponential; ask “how many multiplications to get this big” and you are asking for a logarithm.',
    s5eLine: 'One special base is planted here for later: e ≈ 2.71828…. The function y = e<sup>x</sup> has an astonishing property — at every point, its derivative is exactly equal to its own value at that point. That thread is picked up when derivatives arrive.',
    s5lkLin: 'Look back and contrast: the slope of a linear function — the “add the same, grow the same” world is the exact counterpart of this page’s multiplication →',
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
    el.textContent = t(el.getAttribute('data-i18n'));
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
