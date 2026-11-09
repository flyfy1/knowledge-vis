'use strict';
// Polygon angle sums lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '多边形内角和 · 绕一圈转多少度',
    back: '← 知识索引',
    compare: '对照另一版本：多边形内角和 · 撕下来拼一拼 →',
    navLabel: '多边形内角和步骤导航',
    tagline: '一块三角形纸片，三个角加起来是多少度？五边形、十二边形呢？本页先把三角形的三个角撕下来拼一拼，再用三条不同的路——切成三角形、从中间切、沿边走一圈——得到同一个公式，最后看它碰到凹多边形、五角星和铺地砖时还管不管用。',
    nav0: '0 先量一量', nav1: '1 为什么是 180°', nav2: '2 切成三角形', nav3: '3 绕一圈走', nav4: '4 凹进去', nav5: '5 铺地砖', nav6: '6 收束',

    s0k: '第 0 步 · 先量一量',
    s0t: '三角形的三个角，加起来总是同一个数吗？',
    s0e: '这一步要回答：随便画一个三角形，三个角加起来是不是总等于同一个度数？三角形有三个<strong>内角</strong>：每个顶点处夹在两条边之间、朝向图形里面的角，分别记作 α（在 A 处）、β（在 B 处）、γ（在 C 处）。角的大小用<strong>度</strong>来量：转一整圈是 360°，转半圈是 180°；半圈的角两条边正好连成一条直线，叫<strong>平角</strong>（<a class="xlink" href="../../../math/geometry/clock-angles/#step0">→ 时钟页第 0 步：一圈 360° 怎样分给时针和分针</a>）。底边 AB 固定，两个滑杆移动顶点 C；三个角都由三个顶点的坐标算出，不是用量角器估的。',
    cx: '顶点 C 左右位置', cy: '顶点 C 的高度',
    tear: '撕下三个角，拼到一点', untear: '把三个角放回原处',
    lgA: 'α（A 处）', lgB: 'β（B 处）', lgC: 'γ（C 处）',
    c0a: '三角形 ABC', c0b: '试过的三角形：三个角首尾相接',
    straight: '一条直线',
    s0readout: 'α = {a}°，β = {b}°，γ = {c}°，三个角之和 = {s}°。',
    s0hist: '右图记下了 {k} 个三角形，它们的角和最小 {lo}°、最大 {hi}°。',
    s0torn: '三个角已拼到同一点：α、γ、β 并排，最外两条边连成一条直线——合起来是一个平角。',
    s0hint: '观察顺序：先只拖「顶点 C 左右位置」，看三个角此消彼长：一个变大，别的就变小。每次松手，右图多一行记录，三段颜色的总长每次都停在 180° 那条竖线上。再按「撕下三个角」，看三块扇形移到下方一点，拼成一个半圆。换个形状再撕一次。这只是测量，还不是证明；为什么总是 180°，下一步回答。',

    s1k: '第 1 步 · 为什么是 180°',
    s1t: '不靠量角器，能说明三个角之和一定是 180° 吗？',
    s1e: '这一步要回答：上一步量出来都是 180°，怎样说明它对每个三角形都成立，而不是碰巧？办法是过顶点 C 画一条和底边 AB <strong>平行</strong>的直线 ℓ（平行：在同一平面里永不相交的两条直线）。要用一个学过的事实：两条平行线被第三条直线斜着穿过时，形成「Z」字形两端的两个角相等，这一对角叫<strong>内错角</strong>。线段 CA 就是这样一条斜穿的线：它在 C 处和 ℓ 夹出的角，等于它在 A 处和 AB 夹出的 α（三角形在 A 处的内角）。CB 同理给出 β。于是 C 处沿直线 ℓ 并排放着三个角 α、γ、β，拼成 ℓ 上的一个平角，也就是 180°。按「下一笔」一笔一笔画出来。',
    next: '下一笔', restart: '从头画',
    s1st0: '还没动笔：图上只有三角形，α = {a}°，β = {b}°，γ = {c}°。',
    s1st1: '第 1/3 笔：过 C 画出直线 ℓ，它与 AB 平行。',
    s1st2: '第 2/3 笔：ℓ 左边与 CA 的夹角 = {l}°，A 处的 α = {a}°，两者相等（青色 Z 字形两端的内错角）。',
    s1st3: '第 3/3 笔：ℓ 右边与 CB 的夹角 = {r}°，等于 β。C 处并排三个角：{l}° + {c}° + {r}° = {s}°，正好铺满直线 ℓ 的一侧，是一个平角。',
    c1a: '过 C 作 AB 的平行线 ℓ',
    s1hint: '观察顺序：先按三次「下一笔」，每按一次看图上新出现的线或角，再读读数。画完以后拖两个滑杆移动 C：ℓ 跟着 C 平移，ℓ 左右两个角一直分别等于 α 和 β，三个角始终铺满一条直线。这个证明靠的是「平行线的内错角相等」，它只在平面上成立（终章会说到球面上会怎样）。',

    s2k: '第 2 步 · 切成三角形',
    s2t: 'n 条边的多边形，内角和是多少？',
    s2e: '这一步要回答：五边形、八边形……一般地，<strong>n 边形</strong>（n 条边、n 个顶点围成的封闭图形）的内角和怎么算？思路是把它切成三角形，因为三角形的内角和已经知道是 180°。这里的多边形都是<strong>凸</strong>的：每个内角都小于 180°，没有凹进去的地方。切法一：从一个顶点出发画<strong>对角线</strong>（连接两个不相邻顶点的线段）。n 边形从一个顶点能画 n − 3 条，切出 n − 2 个三角形；这些三角形的角拼起来恰好是多边形的全部内角，所以内角和 = (n − 2) × 180°。切法二：从内部一点连向每个顶点，切出 n 个三角形；但这些角里多了中间那一整圈 360°，它不是多边形的内角，要减掉：n × 180° − 360°。两种切法化简后是同一个式子。',
    nSides: 'n（边数）',
    cutVertex: '从一个顶点切', cutCentre: '从内部一点切', cutPlay: '一刀刀切出来', reshape: '换个形状',
    c2a: '{n} 边形', c2b: '内角和随边数 n 变化（点 = 试过的 n）',
    s2prog: '已切 {k}/{K} 刀 · ',
    s2rV: '从顶点 1 画了 {d} 条对角线，切出 {t} 个三角形：{t} × 180° = {f}°。用坐标量出的 {n} 个内角之和 = {m}°。',
    s2rC: '从内部一点切出 {n} 个三角形：{n} × 180° = {big}°；中间一圈 {o}° 不是多边形的内角，减掉后得 {f}°。用坐标量出的 {n} 个内角之和 = {m}°。',
    s2hint: '观察顺序：先保持「从一个顶点切」，按「一刀刀切出来」，数三角形个数，比 n 少 2。再拖 n，右图记下每个试过的 n：所有点落在同一条直线上，n 每多 1，内角和多 180°。按「换个形状」，各个角都变了，和不变。最后换成「从内部一点切」，对比两种算法的读数。',

    s3k: '第 3 步 · 绕一圈走',
    s3t: '沿多边形的边走一圈，一共转了多少度？',
    s3e: '这一步要回答：沿着多边形的边走一圈，回到起点、面朝出发时的方向，一共转过了多少度？走到一个顶点，要从原来的方向转向下一条边，转过的角叫这个顶点的<strong>外角</strong>：一条边的延长线与下一条边的夹角（图中虚线是延长线）。外角和内角拼成一条直线，所以 外角 = 180° − 内角。在凸多边形上，每个拐角都向左转、都不到半圈，走完一圈朝向恰好回到原样，转过的总角度正好是一整圈 360°（<a class="xlink" href="../../../math/geometry/symmetry-rotation/#step2">→ 对称与旋转页第 2 步：转多少度图形会和自己重合</a>）。把 n 个「内角 + 外角 = 180°」加起来：内角和 + 360° = n × 180°，又得到同一个公式。',
    walkOne: '走一条边', walkAll: '连续走一圈', walkReset: '回到起点',
    c3a: '虚线 = 边的延长线，扇形 = 外角', c3b: '每个外角接在上一个后面',
    start: '起点',
    s3readout: '已走 {k}/{n} 条边，在 {k} 个拐角共转了 {s}°。',
    s3done: '回到起点、面朝原方向：{n} 个外角之和 = {s}°，正好一圈。每个顶点 内角 = 180° − 外角，所以 内角和 = {n} × 180° − 360° = {f}°（坐标量出 {m}°）。',
    s3hint: '观察顺序：先按几次「走一条边」：箭头走到下一个顶点后转弯，左图在那个顶点画出外角，右边圆盘上同色的一段接在上一段后面。再按「连续走一圈」，看圆盘被拼满。按「换个形状」或改 n 之后重走：每个外角都不一样，圆盘总是恰好拼满一圈。',

    s4k: '第 4 步 · 凹进去',
    s4t: '多边形凹进去一块，公式还成立吗？',
    s4e: '这一步要回答：前面的多边形都是凸的；如果把一个顶点往里推，变成<strong>凹多边形</strong>（有一个内角大于 180°，图形凹进去一块），(n − 2) × 180° 还对吗？大于 180° 的那个角叫<strong>优角</strong>。用沿边走的看法：外角是走到顶点时转过的角，走到凹进去的顶点要<strong>向右</strong>转，把这次转角记作负数，其余顶点照旧向左转。只要各条边互不穿过（这样的多边形叫<strong>简单多边形</strong>），回到起点时左转和右转相抵，净转角仍是一圈 360°，内角和仍是 (n − 2) × 180°。边互相穿过的图形，比如五角星，就不在这个范围里了。',
    push: '把顶点 1 往里推', sep: '、',
    shapeDent: '凹五边形', shapeStar: '五角星', walkLap: '走一圈',
    c4dent: '五边形：粉色 = 大于 180° 的角', c4star: '五角星：五条边互相穿过', c4b: '转角累加：向右转往回画',
    s4prog: '已走过 {k}/5 个拐角 · ',
    s4rConvex: '五个内角：{list}；和 = {s}°。现在每个角都小于 180°，还是凸五边形，走一圈每个拐角都向左转，净转角 {t}°。',
    s4rDent: '五个内角：{list}；和 = {s}°。顶点 1 的角是 {r}°，大于 180°；走到那里要向右转 {x}°（记作 −{x}°），其余四处向左转，净转角仍是 {t}°。',
    s4rStar: '五角星的边互相穿过，不是简单多边形。沿五条边走一圈，每个尖角处都向左转 {e}°，一共转了 {t}°，是两整圈；五个尖角之和 = {s}°，不是 (5 − 2) × 180° = 540°。公式只管简单多边形。',
    s4hint: '观察顺序：慢慢向右拖「把顶点 1 往里推」：顶点 1 的角越来越大，超过 180° 后变成粉色，而读数里的内角和一直是 540°。按「走一圈」，看右边圆盘在粉色那一处往回退一截，最后仍停在 360°。再按「五角星」走一圈：圆盘绕了两圈。',

    s5k: '第 5 步 · 铺地砖',
    s5t: '只用一种正多边形地砖，能把地面铺满不留缝吗？',
    s5e: '这一步要回答：<strong>正多边形</strong>（所有边一样长、所有内角一样大）的地砖，在一个点周围拼起来，能不能正好围满一圈 360°，不留缝也不重叠？正 n 边形每个内角 = 内角和 ÷ n = (n − 2) × 180° ÷ n。几块砖的角围在同一个点，要恰好合拢，「360° ÷ 每个内角」必须是整数。图中以中间一点为公共顶点一块接一块放砖，放到再放一块就会重叠为止；粉色扇形是剩下的缝，虚线是放不下的下一块。',
    nRegular: '正 n 边形的 n',
    place: '一块块放上去',
    c5a: '以同一点为公共顶点拼正 {n} 边形',
    gapLbl: '缝 {g}°',
    s5prog: '已放 {k}/{K} 块 · ',
    s5readout: '正 {n} 边形每个内角 = ({n} − 2) × 180° ÷ {n} = {a}°。360° ÷ {a}° = {q}，放得下 {fit} 块：',
    s5fit: '正好围满一圈，能铺满地面。',
    s5gap: '还剩 {g}° 的缝，再放一块就会重叠 {o}°，铺不满。',
    s5hint: '观察顺序：从 n = 3 拖到 12，看粉色的缝什么时候消失。只有 n = 3、4、6 恰好合拢：正三角形 6 块、正方形 4 块、正六边形 3 块（蜂巢的格子就是正六边形）。n ≥ 7 时每个内角都大于 120°，两块不到一圈、三块又超过一圈，所以再也不会合拢。',
    quizPrompt: '想一想：一种正多边形地砖每个内角是 150°，它有几条边？',
    quizA: '10 条', quizB: '12 条', quizC: '15 条',
    check: '核对',
    correct: '对。内角 150°，外角就是 180° − 150° = 30°；第 3 步说过，外角加起来正好一圈 360°，所以有 360° ÷ 30° = 12 个顶点、12 条边。把 n 拖到 12 核对：每个内角正是 150°。',
    wrong: '再想想：先算每个外角（180° − 内角），再用第 3 步的结论——走一圈，外角加起来正好 360°。',

    s6k: '第 6 步 · 收束',
    s6t: '三条路，一个公式',
    s6fin: '三角形：过一个顶点作对边的平行线，三个角拼成一个平角，和为 180°。n 边形：切成 n − 2 个三角形；或从内部切成 n 个再减去中间一圈；或沿边走一圈、外角合起来转 360°——三条路得到同一个结果。',
    formula: 'α + β + γ = 180°\n内角和 = (n − 2) × 180°\n外角和 = 360°',
    boundary: '适用范围：平面上的简单多边形（边不互相穿过），凸的、凹的都行；凹多边形的外角按「向右转为负」计。五角星这类边相交的图形不适用。弯曲的面上也不适用：在地球仪上，从北极沿两条经线走到赤道，再沿赤道把两点连起来，经线和赤道处处垂直，底下两个角加起来已经是 180°，再加上北极的角就超过 180°——球面上没有「平行线的内错角相等」。',
    linksTitle: '接着看',
    lk1: '→ 圆周角页第 2 步：用三角形外角和等腰三角形，证明圆周角是圆心角的一半',
    lk2: '→ 对称与旋转页第 2 步：正 n 边形转 360° ÷ n 就和自己重合',
    lk3: '→ 时钟页第 1 步：两根针之间的夹角怎么读',
    lk4: '→ 勾股定理页第 2 步：同样是把图形切开、重新拼起来做证明',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《多边形内角和 · 撕下来拼一拼》的平行版本。'
  },
  en: {
    pageTitle: 'Polygon Angle Sums · How Far Do You Turn on One Lap?',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Polygon Angle Sums · Tear and Rearrange →',
    navLabel: 'Polygon angle sum steps',
    tagline: 'Cut a triangle out of paper: what do its three angles add up to? What about a pentagon, or a 12-gon? We tear the triangle’s corners off and line them up, then reach one formula by three separate routes — cutting into triangles, cutting from the middle, and walking once round the edge — and finally test it on a dented polygon, a star and a tiled floor.',
    nav0: '0 Measure', nav1: '1 Why 180°', nav2: '2 Cut into triangles', nav3: '3 Walk the edge', nav4: '4 Dents', nav5: '5 Tiling', nav6: '6 Wrap-up',

    s0k: 'STEP 0 · MEASURE FIRST',
    s0t: 'Do a triangle’s three angles always add up to the same number?',
    s0e: 'The question here: draw any triangle you like — do its three angles always add up to the same number of degrees? A triangle has three <strong>interior angles</strong>: at each corner, the angle between the two sides that opens towards the inside of the shape. Call them α (at A), β (at B) and γ (at C). Angles are measured in <strong>degrees</strong>: a full turn is 360°, a half turn 180°. A half-turn angle has its two arms pointing in opposite directions along one line; it is called a <strong>straight angle</strong> (<a class="xlink" href="../../../math/geometry/clock-angles/#step0">→ Clock page, step 0: how a 360° turn is shared between the hands</a>). The base AB stays put; two sliders move corner C. All three angles are computed from the corner coordinates, not read off a protractor.',
    cx: 'Corner C, left–right', cy: 'Corner C, height',
    tear: 'Tear off the corners and join them', untear: 'Put the corners back',
    lgA: 'α (at A)', lgB: 'β (at B)', lgC: 'γ (at C)',
    c0a: 'Triangle ABC', c0b: 'Triangles you tried: angles laid end to end',
    straight: 'a straight line',
    s0readout: 'α = {a}°, β = {b}°, γ = {c}°; the three angles add up to {s}°.',
    s0hist: 'The right panel has logged {k} triangles; their angle sums range from {lo}° to {hi}°.',
    s0torn: 'The corners now meet at one point: α, γ and β side by side, and the two outer edges form one straight line — together they make a straight angle.',
    s0hint: 'What to watch: drag only “Corner C, left–right” first and see the angles trade off — when one grows, the others shrink. Each time you let go, the right panel adds a row, and the three coloured pieces end at the 180° line every time. Then press “Tear off the corners”: the three wedges slide down to one point and close up into a half disc. Change the shape and tear again. This is measuring, not proving; why it is always 180° is the next step.',

    s1k: 'STEP 1 · WHY 180°',
    s1t: 'Without a protractor, can we show the sum must be 180°?',
    s1e: 'The question here: every triangle we measured came to 180° — how do we know it holds for all of them and is not luck? Draw the line ℓ through corner C <strong>parallel</strong> to the base AB (parallel: two lines in a plane that never meet). We use one fact you have met before: when a third line cuts across two parallel lines, the two angles at the ends of the “Z” it makes are equal. They are called <strong>alternate angles</strong>. Side CA is such a crossing line, so the angle it makes with ℓ at C equals the angle it makes with AB at A — that is α, the triangle’s angle at A. Side CB gives β the same way. So at C, along the line ℓ, three angles sit side by side: α, γ, β. Together they fill a straight angle on ℓ: 180°. Press “Next stroke” to draw it one stroke at a time.',
    next: 'Next stroke', restart: 'Start over',
    s1st0: 'Nothing drawn yet: just the triangle, with α = {a}°, β = {b}°, γ = {c}°.',
    s1st1: 'Stroke 1/3: line ℓ through C, parallel to AB.',
    s1st2: 'Stroke 2/3: the angle between ℓ (left) and CA is {l}°, and α at A is {a}° — equal, the alternate angles at the two ends of the cyan Z.',
    s1st3: 'Stroke 3/3: the angle between ℓ (right) and CB is {r}°, equal to β. Three angles sit side by side at C: {l}° + {c}° + {r}° = {s}°, exactly filling one side of line ℓ — a straight angle.',
    c1a: 'Line ℓ through C, parallel to AB',
    s1hint: 'What to watch: press “Next stroke” three times and look for the new line or angle each time, then read the line below. Once it is all drawn, move C with the sliders: ℓ slides along with C, its left and right angles stay equal to α and β, and the three angles always fill a straight line. The proof rests on “alternate angles between parallel lines are equal”, which holds only on a flat plane (the wrap-up shows what happens on a sphere).',

    s2k: 'STEP 2 · CUT INTO TRIANGLES',
    s2t: 'What do the interior angles of an n-sided polygon add up to?',
    s2e: 'The question here: pentagon, octagon… in general, what is the angle sum of an <strong>n-gon</strong> (a closed shape with n sides and n corners)? The idea is to cut it into triangles, whose angle sum we already know is 180°. Every polygon in this step is <strong>convex</strong>: every interior angle is below 180°, so nothing is dented inwards. Cut one: from a single corner, draw the <strong>diagonals</strong> (segments joining two corners that are not neighbours). An n-gon has n − 3 of them from one corner, which cut it into n − 2 triangles; together the triangles’ angles make up exactly the polygon’s angles, so the sum is (n − 2) × 180°. Cut two: join one inside point to every corner, giving n triangles. Their angles include the full turn of 360° around that inside point, which is not part of any polygon angle, so subtract it: n × 180° − 360°. Simplify either one and you get the same expression.',
    nSides: 'n (number of sides)',
    cutVertex: 'Cut from one corner', cutCentre: 'Cut from an inside point', cutPlay: 'Make the cuts one by one', reshape: 'New shape',
    c2a: '{n}-gon', c2b: 'Angle sum against n (dots = values you tried)',
    s2prog: '{k}/{K} cuts made · ',
    s2rV: 'Corner 1 has {d} diagonals, cutting the shape into {t} triangles: {t} × 180° = {f}°. The {n} angles measured from the coordinates add up to {m}°.',
    s2rC: 'An inside point cuts it into {n} triangles: {n} × 180° = {big}°. The {o}° turn around the middle is not a polygon angle; take it off and {f}° is left. The {n} angles measured from the coordinates add up to {m}°.',
    s2hint: 'What to watch: keep “Cut from one corner”, press “Make the cuts one by one” and count the triangles — always two fewer than n. Then drag n; the right panel logs every n you try, and the dots all lie on one straight line: each extra side adds 180°. Press “New shape”: every angle changes, the sum does not. Last, switch to “Cut from an inside point” and compare the two calculations.',

    s3k: 'STEP 3 · WALK THE EDGE',
    s3t: 'Walk once round a polygon — how far have you turned?',
    s3e: 'The question here: walk along the sides of a polygon until you are back at the start, facing the way you set off. How many degrees have you turned in total? At each corner you swing from your old heading onto the next side; that swing is the corner’s <strong>exterior angle</strong>: the angle between one side extended (the dashed line) and the next side. The exterior and interior angles together make a straight line, so exterior = 180° − interior. On a convex polygon every turn is to the left and less than a half turn, and after one lap your heading is back where it began, so the turns add up to exactly one full turn, 360° (<a class="xlink" href="../../../math/geometry/symmetry-rotation/#step2">→ Symmetry page, step 2: how far a shape turns before it matches itself</a>). Add up the n equations “interior + exterior = 180°”: angle sum + 360° = n × 180°, the same formula again.',
    walkOne: 'Walk one side', walkAll: 'Walk the whole lap', walkReset: 'Back to the start',
    c3a: 'Dashes: side extended · wedges: exterior angles', c3b: 'Each turn laid after the last',
    start: 'start',
    s3readout: 'Walked {k}/{n} sides; turned {s}° in total at {k} corners.',
    s3done: 'Back at the start, facing the same way: the {n} exterior angles add up to {s}°, one full turn. At every corner interior = 180° − exterior, so the angle sum = {n} × 180° − 360° = {f}° (measured: {m}°).',
    s3hint: 'What to watch: press “Walk one side” a few times. The arrow walks to the next corner and turns; the left panel draws that corner’s exterior angle, and a piece of the same colour joins the disc on the right. Then press “Walk the whole lap” and watch the disc close up. Try “New shape” or another n and walk again: the exterior angles all differ, the disc always closes exactly once.',

    s4k: 'STEP 4 · DENTS',
    s4t: 'If the polygon is dented inwards, does the formula still hold?',
    s4e: 'The question here: so far every polygon was convex. Push one corner inwards to make a <strong>concave polygon</strong> (one interior angle is over 180°, so the shape has a dent). Is (n − 2) × 180° still right? An angle over 180° is called a <strong>reflex angle</strong>. Use the walking view: the exterior angle is the turn you make at a corner. At the dented corner you turn <strong>right</strong>, so count that turn as negative; everywhere else you still turn left. As long as no two sides cross (a <strong>simple polygon</strong>), the left and right turns net out to one full turn, 360°, and the angle sum is still (n − 2) × 180°. Shapes whose sides cross, such as a five-pointed star, are outside that rule.',
    push: 'Push corner 1 inwards', sep: ', ',
    shapeDent: 'Dented pentagon', shapeStar: 'Five-pointed star', walkLap: 'Walk one lap',
    c4dent: 'Pentagon: pink = an angle over 180°', c4star: 'Star: the five sides cross each other', c4b: 'Turns added up; right turns go backwards',
    s4prog: '{k}/5 corners passed · ',
    s4rConvex: 'The five angles: {list}; sum = {s}°. Every angle is still below 180° — a convex pentagon, where each corner is a left turn; net turn {t}°.',
    s4rDent: 'The five angles: {list}; sum = {s}°. Corner 1 is {r}°, over 180°; there you turn right by {x}° (counted as −{x}°), the other four corners are left turns, and the net turn is still {t}°.',
    s4rStar: 'The star’s sides cross, so it is not a simple polygon. Walking its five sides you turn left by {e}° at every point, {t}° in all — two full turns. The five point angles add up to {s}°, not (5 − 2) × 180° = 540°. The formula is only for simple polygons.',
    s4hint: 'What to watch: drag “Push corner 1 inwards” slowly to the right. The angle at corner 1 grows, turns pink once it passes 180°, and the angle sum in the readout stays at 540° throughout. Press “Walk one lap” and watch the disc on the right step backwards at the pink corner, then still stop at 360°. Then pick “Five-pointed star” and walk it: the disc goes round twice.',

    s5k: 'STEP 5 · TILING',
    s5t: 'Can tiles of one regular polygon cover a floor without gaps?',
    s5e: 'The question here: put tiles shaped like a <strong>regular polygon</strong> (all sides equal, all interior angles equal) round one point. Do they close up into exactly 360°, with no gap and no overlap? Each interior angle of a regular n-gon is the angle sum ÷ n = (n − 2) × 180° ÷ n. For tiles meeting at one point to close up, “360° ÷ one interior angle” has to be a whole number. The picture puts tile after tile round the middle point until one more would overlap; the pink wedge is the gap that is left, and the dashed outline is the next tile that does not fit.',
    nRegular: 'n of the regular n-gon',
    place: 'Place the tiles one by one',
    c5a: 'Regular {n}-gons sharing one corner',
    gapLbl: 'gap {g}°',
    s5prog: '{k}/{K} tiles placed · ',
    s5readout: 'Each angle of a regular {n}-gon = ({n} − 2) × 180° ÷ {n} = {a}°. 360° ÷ {a}° = {q}, so {fit} tiles fit: ',
    s5fit: 'they close up exactly — this tile covers a floor.',
    s5gap: 'a {g}° gap is left, and one more tile would overlap by {o}° — no tiling.',
    s5hint: 'What to watch: drag n from 3 to 12 and notice when the pink gap disappears. Only n = 3, 4 and 6 close up: six triangles, four squares or three hexagons (the cells of a honeycomb are hexagons). From n = 7 on, each angle is over 120°, so two tiles fall short of a full turn and three overshoot — it never closes again.',
    quizPrompt: 'Think: a regular-polygon tile has interior angles of 150°. How many sides does it have?',
    quizA: '10', quizB: '12', quizC: '15',
    check: 'Check',
    correct: 'Right. An interior angle of 150° means an exterior angle of 180° − 150° = 30°. From step 3, the exterior angles add up to one full turn, 360°, so there are 360° ÷ 30° = 12 corners and 12 sides. Drag n to 12 to check: each angle is exactly 150°.',
    wrong: 'Not quite. Work out one exterior angle first (180° − interior), then use step 3: walking once round, the exterior angles add up to exactly 360°.',

    s6k: 'STEP 6 · WRAP-UP',
    s6t: 'Three routes, one formula',
    s6fin: 'Triangle: draw the line through one corner parallel to the opposite side, and the three angles fill a straight angle — 180°. n-gon: cut it into n − 2 triangles; or cut it into n from an inside point and remove the turn in the middle; or walk round it, where the exterior angles make one 360° turn. All three routes land on the same result.',
    formula: 'α + β + γ = 180°\nangle sum = (n − 2) × 180°\nexterior sum = 360°',
    boundary: 'Where it applies: simple polygons in a flat plane (no sides crossing), convex or concave, with right turns at dents counted as negative exterior angles. It fails for shapes whose sides cross, like the star. It also fails on curved surfaces: on a globe, walk from the North Pole down two meridians to the equator and join them along the equator. Meridians meet the equator at right angles, so the two bottom angles already make 180°, and the angle at the pole pushes the total past 180° — a sphere has no equal alternate angles between parallel lines.',
    linksTitle: 'Where to next',
    lk1: '→ Circle angles, step 2: a triangle’s exterior angle and an isosceles triangle prove the inscribed angle is half the central one',
    lk2: '→ Symmetry & rotation, step 2: a regular n-gon matches itself after turning 360° ÷ n',
    lk3: '→ Clock angles, step 1: reading the angle between the two hands',
    lk4: '→ Pythagoras, step 2: another proof by cutting a shape up and rearranging it',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Polygon Angle Sums · Tear and Rearrange”.'
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
