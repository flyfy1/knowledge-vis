'use strict';
/* ============================================================
   负数 · 0 以下的世界 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '负数 · 0 以下的世界 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '负数 · 0 以下的世界',
    tagline: '数轴到了 0 就结束了吗？当然不。把数轴向左补完、立起来当温度计、装进楼里当电梯——你会发现 0 的另一边住着一整套数：负数。它们记的不是「欠了多少」，而是方向与位置。',
    nav0: '0 数轴向左长', nav1: '1 温度计比大小', nav2: '2 电梯与楼层',
    nav3: '3 沿数轴走', nav4: '4 自测', nav5: '5 终章',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 负数 Negative Numbers —— 一步一交互系列',

    s0k: '第 0 步 · 补完数轴',
    s0t: '数轴向左长：0 的另一边',
    s0e: '这一步要回答：<strong>0 的左边一个数也没有吗？往左的格子该写什么？</strong>你已经认识数轴：一个数是轴上的一个点（0 是<strong>原点</strong>，两边的分界）。0 的右边住着<strong>正数</strong>——平时写的数都是正数，前面的「+」可以省略。点「向左延伸」，看轴一格一格往左长：左边新长出的数就是<strong>负数</strong>，写出来前面带一个「−」。点任意一个刻度，还能看清它和对面的关系。',
    s0extLab: '向左延伸几格',
    s0play: '向左延伸 ▶', s0pause: '暂停', s0reset: '收回重来',
    s0prog: '进度：已向左长出 {k} / 10 格。',
    s0roIdle: '现在轴上只有 0–10。点「向左延伸 ▶」一格一格往左长，或拖动滑杆。长出来的格子点一点，看读数。',
    s0roGrown: '左边已经长到 <b>{fk}</b> 了。点任意一个刻度，看它和对面的关系。',
    s0roSelNeg: '<b>{fv}</b> 在 0 的左边 {d} 格，它和 <b>{fp}</b> 离 0 一样远，方向相反。{opp}',
    s0roSelPosPair: '<b>{fv}</b> 在 0 的右边 {d} 格；它在左边的搭档 <b>{fm}</b> 已经长出来了——两个数离 0 一样远，方向相反。{opp}',
    s0roSelPosWait: '<b>{fv}</b> 在 0 的右边 {d} 格；它在左边的搭档应该是 <b>{fm}</b>，不过轴还没长到那儿——再往左延伸 {need} 格就能见到它。',
    s0roSelZero: '<b>0</b> 就是原点：两边的分界。它既不是正数，也不是负数。',
    s0oppNote: '（初中会把 {fa} 和 {fb} 叫作一对「相反数」。）',
    s0hint: '看出来了吗：左边不是空的，是右边的<strong>镜像</strong>——每往左长一格，对面那格就有一个和它离 0 一样远的数。所以「−」记的不是「少了」，而是<strong>方向：在 0 的哪一边</strong>。这一页只标整数刻度；小数和分数的负数住在格子与格子之间，道理相同，以后会遇到。',
    cOrigin: '原点',

    s1k: '第 1 步 · 负数比大小',
    s1t: '温度计：负数能比大小',
    s1e: '这一步要回答：<strong>−5 和 −1，哪个更冷？</strong>先认清工具：温度计就是<strong>立起来的数轴</strong>，液柱顶端对齐的刻度就是读数，单位是<strong>摄氏度（℃）</strong>；比 0℃ 还低的温度叫<strong>零下</strong>，「零下 5 度」写的就是 −5℃。拖动液柱（或用滑杆、预置钮）设定温度甲和温度乙，再点「比一比」——页面会把两个温度投影回横着的数轴上，用位置判大小。注意那个常见误会：「5 比 1 大，所以 −5 比 −1 暖和」——等下用落点亲自拆穿它。',
    s1aLab: '温度甲（℃）', s1bLab: '温度乙（℃）',
    s1tuneLab: '预置钮给谁：', s1tuneA: '甲', s1tuneB: '乙',
    s1p5: '零上 5℃', s1pM1: '零下 1℃', s1pM5: '零下 5℃',
    s1cmp: '比一比',
    s1ro: '温度甲 <b>{fa}</b>，温度乙 <b>{fb}</b>。',
    s1roAsk: '点「比一比」，把它们投影回数轴判大小。',
    s1vAltB: '投影到数轴上，甲（{fa}）落在乙（{fb}）的<b>左边</b>——越左越小，所以<b>甲更小、更冷</b>。两处相差 {d} 度。',
    s1vAgtB: '投影到数轴上，乙（{fb}）落在甲（{fa}）的<b>左边</b>——越左越小，所以<b>乙更小、更冷</b>。两处相差 {d} 度。',
    s1vEq: '两个温度落在数轴上的同一点——<b>一样高，也一样冷</b>。',
    s1hint: '拆穿误会：−5 里的「5」只说明它离 0 有 5 格，个头大不代表数大。负数比大小只看一件事：<strong>在数轴上谁更靠左，谁就更小</strong>。−5 在 −1 的左边，所以 −5 更小、更冷。这一招在整页通用：越往左越小，越往右越大。',
    cZero: '0℃ 界线', cSmaller: '更小 · 更冷', cProj: '投影回横数轴：越左越小',
    cA: '甲', cB: '乙',

    s2k: '第 2 步 · 位置也带符号',
    s2t: '电梯：地面之上与之下',
    s2e: '这一步要回答：<strong>楼层能不能也是一根轴？地下的层用什么数记？</strong>这栋楼把地面层定为 0（就像数轴的原点、温度计的 0℃），往上是 +1、+2、+3，往下是 −1、−2。商场里写的 <strong>B1、B2</strong> 就是地下层：B 是 basement（地下室），B1 就是 −1 层、B2 就是 −2 层。按上下行按钮，或直接点想去的楼层，看电梯穿过地面时层数怎么变。',
    s2nLab: '每次走几层',
    s2up: '▲ 上行', s2down: '▼ 下行', s2reset: '回到地面并清轨迹',
    s2ro: '现在在 <b>{f}</b>：{desc}',
    s2descGround: '地面层——这栋楼的 0。',
    s2descUp: '地上 {d} 层。',
    s2descDown: '地下 {d} 层，也就是 {b}。',
    s2roMoving: '电梯正在从 {ff} 层去 {ft} 层……',
    s2roTop: '已经在最顶层（+3）了，不能再往上。',
    s2roBottom: '已经在最底层（−2，就是 B2）了，不能再往下。',
    s2hint: '地面就是楼里的 0。电梯下行穿过 0 之后，层数变负——和温度跌破 0℃、数轴走到原点左边是<strong>同一件事</strong>：先定一个 0，一个方向记正、反方向记负，位置就能用带符号的数记下来。这一页只记位置和升降的结果，加减算式到第 3 步正式上轴。',
    cGround: '地面',

    s3k: '第 3 步 · 加减就是走路',
    s3t: '沿数轴走：加减就是走路',
    s3e: '这一步要回答：<strong>带负数的加减，答案落在哪？能不能不背规则，看着走出来？</strong>规矩只有一条：<strong>加法 = 向右走，减法 = 向左走</strong>。设好起点、方向和步数，点「走 →」：小人逐格走完全程，走过的路线留下<strong>轨迹</strong>，最后停下的那一格叫<strong>落点</strong>。注意图上的原点（0 的位置）——走路时心里数着它，就不会迷路。',
    s3startLab: '起点', s3stepsLab: '走几步',
    s3dirL: '← 向左走', s3dirR: '向右走 →',
    s3walk: '走 →', s3reset: '清轨迹',
    s3tryLab: '试几个经典的：',
    s3roIdle: '设好起点、方向和步数，点「走 →」。算式会在走完后自己补全——先猜猜落点，再看小人走给你看。',
    s3roQ: '算式：<b>{eq} = ?</b> 小人正在走……',
    s3roDoneR: '算式：<b>{eq} = {fr}</b>。从 {fs} 向右走 {n} 步，落在 <b>{fr}</b>。',
    s3roDoneL: '算式：<b>{eq} = {fr}</b>。从 {fs} 向左走 {n} 步，落在 <b>{fr}</b>。',
    s3uTitle: '小演示：把「向左走」撤回',
    s3uStart: '先演示：从 2 向左走 3 步', s3uUndo: '撤回这 3 步左走', s3uRedo: '再来一次',
    s3uro0: '小人站在 2。点「先演示」，让他向左走 3 步。',
    s3uroWalk: '小人正在向左走……',
    s3uroBack: '小人正沿原路往回走……',
    s3uro1: '<b>2 − 3 = −1</b>：小人向左走了 3 步，停在 −1。现在点「撤回这 3 步左走」，看他怎么回去。',
    s3uro2: '撤回完成：小人沿原路向右走回了 <b>2</b>。看清这件事就够了：<b>把一次向左走撤回，等于向右走同样多步。</b>',
    s3hint: '同样的事换到温度上：预报说今晚降温 −2 度（先当成一句口语：要往下掉 2 度的意思），后来取消降温——「取消一次下降」就是回升。撤回一次反方向的动作，等于顺着正方向做同样多。至于把它写成算式法则，是初中才立的规矩，这一页只看现象、不背法则。',
    cLand: '落点', cStart: '起点',

    s4k: '第 4 步 · 自测',
    s4t: '自测：读数、比大小、走路',
    s4e: '最后自己上手，三道题回扣前面三步：读数（第 1 步）、比大小（第 1 步）、带符号的走路（第 2、3 步）。每道题<b>答对才揭晓解析</b>；答错了只给回哪一步想的提示，不给答案。答对的题会锁定，之后回前面改参数，也不会冲掉这里的判定。',
    s4q1: '① 读数题：上面那支温度计的液柱停住了——它表示多少度？',
    s4q1ok: '答对了！液柱在 0 以下 4 格：零下要带负号，读数是 <b>−4℃</b>。（回扣第 1 步）',
    s4q1bad: '还没对。回第 1 步想两步：先看液柱在 0 的上边还是下边（定符号），再数它离 0 有几格（定数字）。',
    s4q2: '② 大小题：−7℃ 和 −3℃，哪个更冷？',
    s4q2a: '−7℃ 更冷', s4q2b: '−3℃ 更冷',
    s4q2ok: '答对了！在数轴上 −7 落在 −3 的左边，越左越小——所以 <b>−7℃ 更冷</b>。（回扣第 1 步）',
    s4q2bad: '还没对。别看数字部分的个头——回第 1 步把两个温度投影到数轴上：谁落在更左边，谁就更小、更冷。',
    s4q3: '③ 走路题：电梯从 B2（−2 层）上行 5 层，停在哪一层？',
    s4q3a: '3 层', s4q3b: '−3 层', s4q3c: '7 层', s4q3d: '0 层（地面）',
    s4q3ok: '答对了！从 −2 向右走 5 步：−2 + 5 = <b>3</b>，停在 3 层。上面的图里已经画出这条轨迹。（回扣第 2、3 步）',
    s4q3bad: '还没对。回第 3 步用走路想：B2 是 −2 层，上行就是向右走——从 −2 出发向右数 5 格，落在哪一格？',
    s4allDone: '三题都答对了——读温度、比大小、带符号地走路，你都拿下了。',
    cQ1: '题①的温度计', cQ3wait: '答对题③后，这里画出它的轨迹', cQ3: '题③：从 −2 向右走 5 步',

    s5k: '第 5 步 · 终章',
    s5t: '负数是为「反方向」发明的',
    s5e: '这一步要回答：<strong>这一整页到底在讲一件事，还是三件事？</strong>看下面三张小图：横着的数轴、立起来的温度计、装进楼里的电梯——同一根轴，穿了三件衣服。每一次，都是先定一个 0，再让一个方向记正、反方向记负。',
    s5fin: '一句话收束：<strong>量有方向：先定一个 0，一个方向记正、反方向记负。</strong>温度、楼层是这样记的，海拔（以海平面为 0）、收支（以不赚不赔为 0）也是这样记的。负数不是「欠着的数」，而是为「反方向」发明的记号——0 的另一边，一直都有数。',
    lkFrac: '分数也是数轴上的一个数 →（本页这条轴的右半边：分数住在整数刻度之间）',
    lkDiv: '除法是沿数轴跳格 →（同样沿轴走：除法数的是能跳几格、剩几格）',
    cAxis: '数轴', cTherm2: '温度计', cLift: '电梯'
  },
  en: {
    docTitle: 'Negative Numbers · The World Below Zero — One Interaction at a Time',
    back: '← Knowledge Index',
    pageTitle: 'Negative Numbers · The World Below Zero',
    tagline: 'Does the number line end at 0? Of course not. Complete it to the left, stand it up as a thermometer, fit it into a building as an elevator — and you will find a whole family of numbers living on the other side of 0: the negative numbers. They do not record “how much you owe”; they record direction and position.',
    nav0: '0 Growing Left', nav1: '1 Thermometer Sizes', nav2: '2 Elevator Floors',
    nav3: '3 Walking the Line', nav4: '4 Quiz', nav5: '5 Finale',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Negative Numbers —— one interaction at a time',

    s0k: 'Step 0 · Completing the Line',
    s0t: 'Growing Left: The Other Side of 0',
    s0e: 'The question for this step: <strong>is there really nothing to the left of 0? What should the ticks over there say?</strong> You already know the number line: a number is a point on the line, and 0 is the <strong>origin</strong>, the border between the two sides. To the right of 0 live the <strong>positive numbers</strong> — the ordinary numbers you write every day, whose “+” sign can be left out. Press “Grow left” and watch the line grow one tick at a time: the new numbers on the left are the <strong>negative numbers</strong>, written with a “−” in front. Click any tick to see exactly how it relates to the tick opposite it.',
    s0extLab: 'Grow this many ticks left',
    s0play: 'Grow left ▶', s0pause: 'Pause', s0reset: 'Take it back',
    s0prog: 'Progress: {k} / 10 ticks grown to the left.',
    s0roIdle: 'Right now the line holds only 0–10. Press “Grow left ▶” to grow it tick by tick, or drag the slider. Click any grown tick to read about it.',
    s0roGrown: 'The left side has grown to <b>{fk}</b>. Click any tick to see how it relates to the other side.',
    s0roSelNeg: '<b>{fv}</b> sits {d} ticks to the left of 0, exactly as far from 0 as <b>{fp}</b>, in the opposite direction. {opp}',
    s0roSelPosPair: '<b>{fv}</b> sits {d} ticks to the right of 0; its partner on the left, <b>{fm}</b>, has already grown — the two are equally far from 0, in opposite directions. {opp}',
    s0roSelPosWait: '<b>{fv}</b> sits {d} ticks to the right of 0; its partner on the left should be <b>{fm}</b>, but the line has not grown that far yet — grow {need} more tick(s) to meet it.',
    s0roSelZero: '<b>0</b> is the origin: the border between the two sides. It is neither positive nor negative.',
    s0oppNote: '(In middle school, {fa} and {fb} will be called a pair of “opposites”.)',
    s0hint: 'See it? The left side is not empty — it is the <strong>mirror image</strong> of the right: every tick that grows on the left has a partner opposite it, equally far from 0. So “−” does not mean “less of something”; it records <strong>direction: which side of 0 you are on</strong>. This page labels whole-number ticks only; negative decimals and fractions live between the ticks, by the same logic, and you will meet them later.',
    cOrigin: 'origin',

    s1k: 'Step 1 · Comparing Negatives',
    s1t: 'The Thermometer: Negatives Can Be Compared',
    s1e: 'The question for this step: <strong>−5 or −1 — which is colder?</strong> First, know your tool: a thermometer is a <strong>number line stood upright</strong>. The scale mark level with the top of the liquid is the reading, and the unit is <strong>degrees Celsius (℃)</strong>. Temperatures below 0℃ are called <strong>below zero</strong>: “5 below zero” is written −5℃. Drag the liquid column (or use the sliders and preset buttons) to set Temperature A and Temperature B, then press “Compare” — the page projects both temperatures back onto a horizontal number line and judges by position. Watch out for the classic trap: “5 is bigger than 1, so −5 must be warmer than −1.” The landing points are about to dismantle it.',
    s1aLab: 'Temperature A (℃)', s1bLab: 'Temperature B (℃)',
    s1tuneLab: 'Presets apply to:', s1tuneA: 'A', s1tuneB: 'B',
    s1p5: '5℃ above zero', s1pM1: '1℃ below zero', s1pM5: '5℃ below zero',
    s1cmp: 'Compare',
    s1ro: 'Temperature A is <b>{fa}</b>, Temperature B is <b>{fb}</b>.',
    s1roAsk: 'Press “Compare” to project them onto the line and judge.',
    s1vAltB: 'Projected onto the line, A ({fa}) lands to the <b>left</b> of B ({fb}) — further left means smaller, so <b>A is smaller, and colder</b>. The two differ by {d} degrees.',
    s1vAgtB: 'Projected onto the line, B ({fb}) lands to the <b>left</b> of A ({fa}) — further left means smaller, so <b>B is smaller, and colder</b>. The two differ by {d} degrees.',
    s1vEq: 'Both temperatures land on the very same point of the line — <b>equally high, equally cold</b>.',
    s1hint: 'Dismantling the trap: the “5” inside −5 only says it is 5 ticks away from 0; a bigger digit part does not mean a bigger number. Comparing negatives takes exactly one look: <strong>whoever sits further left on the number line is smaller</strong>. −5 is left of −1, so −5 is smaller and colder. This works everywhere on this page: further left is smaller, further right is bigger.',
    cZero: 'the 0℃ line', cSmaller: 'smaller · colder', cProj: 'Projected back onto the line: left = smaller',
    cA: 'A', cB: 'B',

    s2k: 'Step 2 · Positions Carry Signs',
    s2t: 'The Elevator: Above and Below Ground',
    s2e: 'The question for this step: <strong>can floors be a number line too? What number records a floor underground?</strong> This building sets its ground floor as 0 (like the origin of the line, like 0℃ on the thermometer), with +1, +2, +3 above and −1, −2 below. Shops write <strong>B1, B2</strong> for the basement floors: B stands for basement, so B1 is floor −1 and B2 is floor −2. Press the up/down buttons, or click the floor you want, and watch what happens to the floor number as the elevator crosses the ground.',
    s2nLab: 'Floors per ride',
    s2up: '▲ Go up', s2down: '▼ Go down', s2reset: 'Back to ground, clear trail',
    s2ro: 'Now at <b>{f}</b>: {desc}',
    s2descGround: 'the ground floor — this building’s 0.',
    s2descUp: '{d} floor(s) above ground.',
    s2descDown: '{d} floor(s) underground, that is, {b}.',
    s2roMoving: 'The elevator is travelling from floor {ff} to floor {ft}…',
    s2roTop: 'Already at the top floor (+3) — no further up.',
    s2roBottom: 'Already at the lowest floor (−2, that is B2) — no further down.',
    s2hint: 'The ground is this building’s 0. When the elevator rides down through 0, the floor numbers turn negative — exactly the same event as a temperature dropping through 0℃ or a point walking left of the origin: fix a 0 first, call one direction positive and the other negative, and any position can be recorded with a signed number. This step only records positions and ride results; addition and subtraction formulas get on the line properly in Step 3.',
    cGround: 'ground',

    s3k: 'Step 3 · Adding Is Walking',
    s3t: 'Walking the Line: Addition and Subtraction Are Footsteps',
    s3e: 'The question for this step: <strong>where does an addition or subtraction with negative numbers land? Can you walk it out instead of memorising rules?</strong> There is just one rule: <strong>addition = walk right, subtraction = walk left</strong>. Set the start, the direction and the number of steps, then press “Walk →”: the walker crosses the line one tick at a time, the route leaves a <strong>trail</strong>, and the tick it stops on is the <strong>landing point</strong>. Keep an eye on the origin (the position of 0) in the picture — count from it as you walk and you will not get lost.',
    s3startLab: 'Start', s3stepsLab: 'How many steps',
    s3dirL: '← Walk left', s3dirR: 'Walk right →',
    s3walk: 'Walk →', s3reset: 'Clear trail',
    s3tryLab: 'Try the classics:',
    s3roIdle: 'Set the start, direction and steps, then press “Walk →”. The equation completes itself after the walk — guess the landing point first, then let the walker show you.',
    s3roQ: 'Equation: <b>{eq} = ?</b> The walker is on the way…',
    s3roDoneR: 'Equation: <b>{eq} = {fr}</b>. From {fs}, walking {n} steps right lands on <b>{fr}</b>.',
    s3roDoneL: 'Equation: <b>{eq} = {fr}</b>. From {fs}, walking {n} steps left lands on <b>{fr}</b>.',
    s3uTitle: 'Mini-demo: Taking Back a Walk to the Left',
    s3uStart: 'First: walk 3 steps left from 2', s3uUndo: 'Take back those 3 leftward steps', s3uRedo: 'Once more',
    s3uro0: 'The walker stands at 2. Press “First” and let it walk 3 steps to the left.',
    s3uroWalk: 'The walker is walking left…',
    s3uroBack: 'The walker is retracing its path…',
    s3uro1: '<b>2 − 3 = −1</b>: the walker went 3 steps left and stopped at −1. Now press “Take back those 3 leftward steps” and watch how it returns.',
    s3uro2: 'Taken back: the walker retraced its path, walking right back to <b>2</b>. This is all you need to see: <b>taking back a walk to the left is the same as walking the same number of steps to the right.</b>',
    s3hint: 'The same story in weather language: the forecast says tonight will drop by −2 degrees (say it loosely for now: it means the temperature is to fall 2 degrees); later the drop is cancelled — and “cancelling a drop” is a rise. Taking back a move in the opposite direction is doing the same amount in the forward direction. Turning this into a written rule for equations is a middle-school matter; this page shows the phenomenon only, no rules to memorise.',
    cLand: 'landing', cStart: 'start',

    s4k: 'Step 4 · The Quiz',
    s4t: 'Quiz: Reading, Comparing, Walking',
    s4e: 'Your turn — three questions reaching back to the first three steps: reading a thermometer (Step 1), comparing sizes (Step 1), and walking with signs (Steps 2–3). Each explanation is <b>revealed only when you answer correctly</b>; a wrong answer earns only a hint about which step to revisit, never the answer itself. A solved question locks in, and changing parameters in earlier steps afterwards will not disturb the verdicts here.',
    s4q1: 'Q1 (reading). The thermometer above has stopped — what temperature does it show?',
    s4q1ok: 'Correct! The liquid stands 4 ticks below 0: below zero takes a minus sign, so the reading is <b>−4℃</b>. (Back to Step 1.)',
    s4q1bad: 'Not yet. Go back to Step 1 and think in two moves: first check whether the liquid is above or below 0 (that fixes the sign), then count how many ticks it is from 0 (that fixes the digit).',
    s4q2: 'Q2 (comparing). −7℃ and −3℃ — which is colder?',
    s4q2a: '−7℃ is colder', s4q2b: '−3℃ is colder',
    s4q2ok: 'Correct! On the number line −7 lands to the left of −3, and further left means smaller — so <b>−7℃ is colder</b>. (Back to Step 1.)',
    s4q2bad: 'Not yet. Do not be fooled by the size of the digit part — project both temperatures onto the number line, as in Step 1: whoever lands further left is smaller, and colder.',
    s4q3: 'Q3 (walking). An elevator starts at B2 (floor −2) and rides up 5 floors. Which floor does it stop at?',
    s4q3a: 'Floor 3', s4q3b: 'Floor −3', s4q3c: 'Floor 7', s4q3d: 'Floor 0 (ground)',
    s4q3ok: 'Correct! From −2, walking 5 steps right: −2 + 5 = <b>3</b> — it stops at floor 3. The picture above now draws that very trail. (Back to Steps 2–3.)',
    s4q3bad: 'Not yet. Think of it as walking, like Step 3: B2 is floor −2, riding up means walking right — starting at −2, count 5 ticks to the right. Which tick do you land on?',
    s4allDone: 'All three correct — reading temperatures, comparing sizes, and walking with signs are all yours.',
    cQ1: 'The Q1 thermometer', cQ3wait: 'Solve Q3 and its trail is drawn here', cQ3: 'Q3: from −2, 5 steps right',

    s5k: 'Step 5 · The Finale',
    s5t: 'Negative Numbers Were Invented for “The Other Direction”',
    s5e: 'The question for this step: <strong>was this page about one thing, or three?</strong> Look at the three little pictures below: the horizontal number line, the upright thermometer, the elevator inside its building — one and the same line wearing three outfits. Every time, we first fix a 0, then record one direction as positive and the opposite direction as negative.',
    s5fin: 'The one-sentence summary: <strong>quantities have directions — fix a 0 first, record one direction as positive and the opposite as negative.</strong> Temperatures and floors are recorded this way; so are altitude (with sea level as 0) and income versus spending (with breaking even as 0). Negative numbers are not “numbers you owe” — they are the notation invented for the other direction, and there were always numbers on the other side of 0.',
    lkFrac: 'A fraction is also a point on the number line → (the right half of this page’s line: fractions live between the whole-number ticks)',
    lkDiv: 'Division is jumping along the number line → (walking the same line: division counts how many jumps fit, and what is left)',
    cAxis: 'number line', cTherm2: 'thermometer', cLift: 'elevator'
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
