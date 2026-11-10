'use strict';
// Regression & correlation lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '回归与相关 · 一个数、一条线、几个陷阱',
    back: '← 知识索引',
    compare: '对照另一版本：回归与相关 · 散点云里拉一条最贴的线 →',
    navLabel: '回归与相关步骤导航',
    tagline: '学校小卖部记下了 30 天的最高气温和冰饮销量。画在纸上是一团散开的点：热的日子卖得多，但并不排成一条直线。怎样用一个数说清「一起变得有多整齐」？怎样画出一条「最贴」的线，拿它预测？这个数和这条线又会在哪里骗人？八步里逐个回答。',
    nav0: '0 相关系数', nav1: '1 最贴的线', nav2: '2 预测', nav3: '3 只看直线', nav4: '4 一个点的分量', nav5: '5 不等于因果', nav6: '6 回归到平均', nav7: '7 收束',

    s0k: '第 0 步 · 相关系数 r',
    s0t: '气温和销量「一起变」得有多整齐，能用一个数说清吗？',
    s0e: '这一步要回答：怎样把散点图上「一起变」的程度变成一个数？图中每个点是一天：横坐标是当天最高气温 x（°C），纵坐标是销量 y（杯），数据是模拟的。先算两个平均 x̄、ȳ，画成两条虚线，把图分成四块。再把每天的偏离换成<strong>标准分</strong> z =（值 − 平均）÷ 标准差，意思是「比平均高出几个标准差」；标准差是各值偏离平均的典型大小，本页按除以 n 计算（<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ 概率分布页第 2 步：方差和标准差衡量散布</a>）。每个点和中心 (x̄, ȳ) 围成一个矩形，面积是 z<sub>x</sub> × z<sub>y</sub>：点在右上或左下（两个量同时偏高或同时偏低）时为正，涂绿色；在左上或右下时为负，涂红色。<strong>相关系数</strong> r 就是所有矩形带符号面积的平均。r 总在 −1 到 1 之间：接近 1 表示点紧贴一条上升的直线，接近 −1 表示紧贴下降的直线，接近 0 表示看不出直线趋势。',
    prodIce: '冰饮（越热卖得越多）', prodSoup: '热汤（越热卖得越少）', prodPens: '文具（与气温无关）',
    noise0: '随机波动大小（杯）', unitF: '横轴换成华氏度 °F', unitC: '横轴换回摄氏度 °C',
    c0a: '每天一个点：矩形 = 标准分的乘积 z_x × z_y', axTempC: '气温 °C', axTempF: '气温 °F', axSales: '销量（杯）',
    axesFmt: '{c}：横轴 {x}，纵轴 {y}。',
    s0lgPos: '同向的点（面积为正）', s0lgNeg: '反向的点（面积为负）', s0lgMean: '平均 x̄、ȳ',
    prodNameIce: '冰饮', prodNameSoup: '热汤', prodNamePens: '文具',
    s0readout: '{prod} · 波动 {s} 杯：同向的点 {np} 个，正面积合计 {pos}；反向的点 {nn} 个，负面积合计 {neg}；r =（{pos} + {neg}）÷ {n} = {r}',
    s0undef: '{prod} · 波动 0 杯：30 天销量完全相同，标准差为 0，标准分和 r 都没有定义。',
    s0hint: '观察顺序：先选冰饮，把随机波动从 0 拖到 40：波动为 0 时点排成一条直线，r = 1；波动越大，红色矩形越多，r 越小。再选热汤，绿红反过来，r 变成负数。再选文具：模拟设定里销量与气温毫无关系，可这 30 天算出 r = −0.21，并不是 0，只有 30 个点时，凑巧出现这么大的 r 并不稀奇。最后点「横轴换成华氏度」：点的横坐标数字全变了，r 一点不变，因为标准分与单位无关。',

    s1k: '第 1 步 · 最贴的直线',
    s1t: '在这团点里画一条直线，怎样才算「最贴」？',
    s1e: '这一步要回答：用一条直线 ŷ = a + b·x 根据气温预测销量，哪一条最好？数据固定为第 0 步冰饮、波动 15 杯的那 30 天（r ≈ 0.75）。一个点的<strong>残差</strong> = 实际销量 − 直线给出的预测，在图上是一条竖直的线段；只量竖直方向，因为我们要预测的是 y。把每个残差平方后加起来，叫<strong>残差平方和</strong> SSE，SSE 越小，直线越贴。平方有两个作用：正负残差不会互相抵消，大的偏离被罚得更重。SSE 最小的那条直线叫<strong>最小二乘回归线</strong>。这里把直线写成「先过中心点 (x̄, ȳ)，再整体上下平移 d」：ŷ = ȳ + d + b·(x − x̄)，两个滑杆分别管转动和平移。',
    slope1: '斜率 b（每升 1 °C 多卖几杯）', shift1: '整条线上下平移 d（杯）', best1: '跳到最优斜率、不平移', clear1: '清除记录',
    c1a: '30 天的数据、你的直线与残差', c1b: 'SSE 随斜率 b 的变化（曲线为 d = 0）', axSlope: '斜率 b', axSSE: 'SSE',
    s1lgLine: '你的直线', s1lgRes: '残差（竖线）', s1lgBest: '最小二乘线', s1lgTried: '试过的 (b, d)',
    s1readout: '你的线：b = {b}，d = {d} → SSE = {sse}　｜　最小：b = {bh}，d = 0 → SSE = {min}　｜　你多出 {extra}，其中平移贡献 n·d² = {shiftPart}',
    s1hint: '观察顺序：先保持 d = 0，只拖斜率：「SSE 随斜率」图描出一条 U 形曲线，最低点就是最小二乘斜率。再把斜率放在最低点附近，只拖 d：不管往哪边平移，SSE 都恰好增加 30 × d²。所以最小二乘线一定经过中心点 (x̄, ȳ)，斜率 b = r × s_y ÷ s_x（s_x、s_y 是气温、销量的标准差），截距 a = ȳ − b·x̄。「试过的 (b, d)」点只要 d ≠ 0 就会高出曲线。',

    s2k: '第 2 步 · 用直线预测',
    s2t: '最高气温 30 °C 的那天，大约能卖多少杯？能有多准？',
    s2e: '这一步要回答：有了回归线，怎样预测、能准到什么程度？回归线给出的 ŷ 是「这个气温下销量的平均水平」，实际销量会在它上下散开。典型偏离用<strong>均方根误差</strong>衡量：RMSE = √(SSE ÷ n)，单位和销量相同（杯）；图中的浅色带是回归线上下各 1 个 RMSE。还可以问：销量的高低起伏，有多少能用气温解释？<strong>决定系数</strong> R² = 1 − SSE ÷ SST，SST 是各点到平均 ȳ 的偏离平方和，也就是不看气温、一律猜平均时的误差。R² 越接近 1，直线解释得越多；对最小二乘直线，R² 正好等于 r²。最后，按钮可以把两条轴都换成标准分：这时回归线经过原点，斜率恰好是 r。',
    x2: '预测哪天：最高气温 x₀（°C）', std2: '两轴换成标准分', raw2: '两轴换回原单位',
    c2a: '回归线、± 1 RMSE 带与预测点', c2aStd: '标准分下：回归线 z_ŷ = r·z_x 与 45° 线', axZx: '气温的标准分 z_x', axZy: '销量的标准分 z_y',
    s2lgLine: '回归线', s2lgBand: '± 1 RMSE', s2lgPred: '预测点', s2lgDiag: '45° 线（斜率 1）',
    s2readout: 'x₀ = {x} °C：预测 ŷ = {a} + {b} × {x} = {y} 杯，典型偏离 ± {e} 杯（RMSE）；30 天里有 {k} 天落在带内。R² = 1 − {sse} ÷ {sst} = {r2}，等于 r² = {r}² 。',
    s2extrap: '注意：这 30 天的气温只在 {lo}–{hi} °C 之间，x₀ 在范围之外，这是外推，直线关系在那里不一定成立。',
    s2std: '标准分下回归线斜率 = r = {r}，比 45° 线平。',
    s2hint: '观察顺序：拖 x₀，看橙点沿回归线滑动，读数给出预测和典型偏离；30 天里有 17 天（约六成）落在浅色带里。把 x₀ 拖到 18 °C 以下或 33 °C 以上，读数会提示外推。最后点「两轴换成标准分」：点云形状不变，回归线变成过原点、斜率为 r ≈ 0.75 的直线，比 45° 线平。',

    s3k: '第 3 步 · r 只看直线',
    s3t: 'r 接近 0，就说明两个量没关系吗？',
    s3e: '这一步要回答：r 和回归直线能不能描述一切关系？三组模拟数据：A 是气温与冰饮销量，趋势是直的；B 是车速（km/h）与百公里油耗（L），太慢、太快都费油，呈 U 形；C 是施肥量（kg）与增产（%），起初增得快、后来趋平。上面的图画出数据和最小二乘直线，下面的图是<strong>残差图</strong>：横轴不变，纵轴是残差（实际 − 直线预测）。直线描述得好时，残差在 0 上下随机散开、看不出规律；残差排成弧形，说明真实关系是弯的，直线漏掉了它。r 只衡量<strong>直线</strong>关系有多强。',
    shapeLine: 'A 气温与销量', shapeU: 'B 车速与油耗', shapeSat: 'C 施肥与增产',
    c3a: '数据与最小二乘直线', c3b: '残差图：残差 = 实际 − 直线预测',
    shapeNameLine: 'A 气温与销量', shapeNameU: 'B 车速与油耗', shapeNameSat: 'C 施肥与增产',
    axSpeed: '车速 km/h', axFuel: '油耗 L', axFert: '施肥 kg', axGain: '增产 %', axRes: '残差',
    s3lgPts: '数据', s3lgLine: '最小二乘直线', s3lgRes: '残差',
    s3readout: '{name}：r = {r}，R² = {r2}。{verdict}',
    vLine: '残差在 0 上下随机散开，直线描述得不错。',
    vU: 'r 几乎为 0，关系却一点也不弱：油耗完全由车速决定，只是先降后升；残差两头为正、中间为负，呈 U 形。',
    vSat: 'r 不小，但残差两头为负、中间为正，呈拱形：直线在两端高估、在中间低估，真实关系是弯的。',
    s3hint: '观察顺序：依次点 A、B、C，先看上面的点和直线，再看下面的残差有没有规律。B 的 r ≈ 0.01，只看这个数会以为车速和油耗无关；C 的 r ≈ 0.77，只看这个数会以为直线就够了。所以算 r 之前先画散点图，拟合之后再看残差图。',

    s4k: '第 4 步 · 一个点的分量',
    s4t: '去掉一个点，回归线会变多少？',
    s4e: '这一步要回答：回归线是不是对每个点都同样「公平」？模拟数据：16 名学生每周刷题的时间（小时）和数学测验成绩（分）。前 15 人刷题 1–8 小时，第 16 人刷了 20 小时，横坐标离其他人很远。用滑杆一次去掉一个点再重新拟合，看斜率变了多少，这个变化量就是这个点的<strong>影响力</strong>。「每个点的影响力」图记下了全部 16 个点的影响力。为什么远点影响大？第 1 步说过，最小二乘线总经过中心点 (x̄, ȳ)；横坐标离 x̄ 越远的点，像跷跷板上离支点越远的人，只要偏离直线一点，就能把直线转动很多，这叫<strong>高杠杆</strong>。远点的成绩可以用第二个滑杆调。',
    drop4: '去掉第几个点（0 = 都保留）', far4: '第 16 人（20 小时）的成绩',
    c4a: '虚线：全部 16 点 · 实线：去掉选中点后', c4b: '每个点的影响力：去掉它后斜率的变化', axHours: '每周刷题（小时）', axScore: '成绩（分）', axPoint: '第几个点', axDb: '斜率变化',
    s4lgAll: '全部 16 点的回归线', s4lgDrop: '去掉选中点后的回归线', s4lgOut: '被去掉的点', s4lgFar: '第 16 人（远点）',
    s4readout: '全部 16 点：斜率 {b} 分/小时，r = {r}。其余 15 人的回归线在 20 小时处预测 {p} 分。{drop}',
    s4drop: '去掉第 {k} 个点（{x} 小时，{y} 分）后：斜率 {b2}，r = {r2}，斜率变化 {db}。',
    s4none: '拖第一个滑杆，选一个点去掉。',
    s4hint: '观察顺序：先让远点的成绩保持 50 分，把「去掉第几个点」从 1 拖到 16：去掉前 15 个点中的任何一个，斜率只变 0.2 以内；去掉第 16 个，斜率从 −0.11 跳到 3.26。「每个点的影响力」图里柱子的高度就是这些变化。再拖远点的成绩：调到读数里「其余 15 人在 20 小时处的预测」（约 119 分）附近时，它的影响力几乎为 0；离那个值越远，影响力越大。所以横坐标远只是让一个点有能力撬动直线，实际撬动多少，看它偏离其余点的趋势有多远。',

    s5k: '第 5 步 · 相关不等于因果',
    s5t: '脚越长的小学生阅读分越高，是脚长让人会读书吗？',
    s5e: '这一步要回答：两个量高度相关，能不能说一个导致了另一个？模拟数据：一所小学 6–12 岁的 210 名学生（每个年龄 30 人）的脚长（cm）和阅读测验分。全部放在一起，r 很高。但两者都随<strong>年龄</strong>增长：年龄是一个<strong>混杂变量</strong>，即同时影响两个量的第三个量。在这份模拟数据里，同一年龄的学生，脚长和阅读分是分别独立生成的，彼此毫无联系。用滑杆只看某一个年龄，就相当于把年龄固定住。',
    age5: '只看哪个年龄', ageAll: '全部', ageN: '{a} 岁',
    c5a: '脚长与阅读分（颜色 = 年龄）', axFoot: '脚长 cm', axRead: '阅读分',
    s5lgAll: '全体的回归线', s5lgGrp: '所选年龄的回归线', s5lgAge: '颜色从浅到深：6 → 12 岁',
    s5readout: '全体 210 人：r = {rall}，回归斜率 {ball} 分/cm。{grp}',
    s5grp: '只看 {age} 岁的 30 人：r = {r}，回归斜率 {b} 分/cm。',
    s5hint: '观察顺序：先看全体，点从左下斜向右上，r ≈ 0.84。再把滑杆拖到 6、7……12 岁，每次只剩一种颜色的 30 个点：点云几乎是圆的，组内 r 在 −0.28 到 0.43 之间（7 组平均约 0.06），和第 0 步文具那 30 天的 r = −0.21 一样，都是小样本里的偶然起伏。全体的高相关几乎全部来自年龄。要判断因果，得控制混杂变量（像这里按年龄分组）；最可靠的办法是随机对照实验。',

    s6k: '第 6 步 · 回归到平均',
    s6t: '第一次考得最好的那批人，第二次为什么平均退步了？',
    s6e: '这一步要回答：没有任何干预，极端的成绩为什么下一次会往平均靠？模拟 500 名学生考两次难度相同的试。每次成绩 = 70 + 10 ×（√ρ × 真实水平 + √(1 − ρ) × 当天运气），真实水平两次相同，运气每次重新抽，两者都是平均 0、标准差 1 的随机数。ρ 是成绩差异中来自真实水平的比例，两次成绩的相关系数约等于 ρ。第一次的前 10% 能排在前面，一部分靠水平、一部分靠好运气；第二次好运气不一定再来，于是这批人的平均往 70 分回落。这叫<strong>回归到平均</strong>，「回归」这个名字就出自这个现象。回归线斜率 = r × s_y ÷ s_x，两次成绩的标准差差不多，所以斜率约等于 r，比 y = x 线平。',
    rho6: '真实水平所占比例 ρ',
    c6a: '第一次 vs 第二次成绩', c6b: '前 10% 与后 10%：两次的平均', axT1: '第一次（分）', axT2: '第二次（分）', axTest: '考试', tick1: '第一次', tick2: '第二次',
    s6lgTop: '第一次前 10%', s6lgBot: '第一次后 10%', s6lgAll: '全体 500 人的平均', s6lgDiag: 'y = x（两次一样）', s6lgLine: '回归线',
    s6readout: 'ρ = {rho}：两次成绩 r = {r}，回归线斜率 {b}。第一次前 10%：{t1} → {t2} 分；后 10%：{b1} → {b2} 分；全体平均 {m1} → {m2} 分。',
    s6hint: '观察顺序：先把 ρ 拖到 1（成绩完全由水平决定）：点落在 y = x 线上，前 10% 第二次分数不变。再慢慢调小 ρ：点云变胖，回归线比 y = x 平；前 10% 第二次平均下降，后 10% 平均上升，全体平均几乎不变，没有谁真的变强或变弱。ρ = 0.5 时，前 10% 从约 86 分回落到约 78 分。所以「表扬之后退步、批评之后进步」可能只是回归到平均，不能当作表扬或批评的效果。',

    s7k: '第 7 步 · 收束', s7t: '一个数、一条线，以及什么时候别信它们',
    s7fin: '回头看：<strong>第 0 步</strong>，r 是标准分乘积的平均，在 −1 到 1 之间，与单位无关；<strong>第 1 步</strong>，最小二乘线让残差平方和最小，经过中心点 (x̄, ȳ)，斜率 b = r·s_y/s_x；<strong>第 2 步</strong>，回归线给出平均水平的预测，典型误差是 RMSE，R² = r² 是直线能解释的起伏比例，超出数据范围就是外推；<strong>第 3 步</strong>，r 只量直线关系，要画散点图、看残差图；<strong>第 4 步</strong>，横坐标远的点杠杆大，偏离趋势时能把直线撬动很多；<strong>第 5 步</strong>，相关可能来自混杂变量，不等于因果；<strong>第 6 步</strong>，|r| < 1 时，极端值的下一次平均会往平均靠。',
    formula: 'r = 平均(z_x · z_y)\nŷ = ȳ + b(x − x̄)，b = r · s_y / s_x\nR² = 1 − SSE / SST = r²',
    boundary: '适用范围：本页的标准差按除以 n 计算（换成除以 n − 1，r 和回归线都不变）；最小二乘只量竖直方向的残差，用 x 预测 y 和用 y 预测 x 是两条不同的线。所有数据都是种子化的模拟，不是实测；第 5 步的混杂和第 6 步的成绩模型是为了讲清机制而构造的，现实中的混杂变量常常未知或量不准。只有 30 个左右的点时，r 本身也会随抽样上下波动。',
    linksTitle: '接着去哪儿',
    lk1: '→ 平均数、中位数、众数页第 1 步：一个极端值能把平均拉多远',
    lk2: '→ 概率分布页第 2 步：方差和标准差怎样衡量散布',
    lk3: '→ 梯度下降页第 6 步：不用公式，一步步把损失降到最小',
    lk4: '→ 假设检验页第 0 步：一个结果有多大可能只是巧合',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《回归与相关 · 散点云里拉一条最贴的线》的平行版本。'
  },
  en: {
    pageTitle: 'Regression & Correlation · One Number, One Line, a Few Traps',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Regression & Correlation · The Best Line Through a Cloud →',
    navLabel: 'Regression and correlation steps',
    tagline: 'A school tuck shop logged the day’s high temperature and its iced-drink sales for 30 days. On paper it is a loose cloud of points: hot days sell more, but the points are nowhere near a straight line. How can one number say how tightly the two move together? How do we draw the line that fits best and predict with it? And where do that number and that line mislead us? Eight steps, one question at a time.',
    nav0: '0 Correlation', nav1: '1 Best line', nav2: '2 Prediction', nav3: '3 Lines only', nav4: '4 One point’s pull', nav5: '5 Not causation', nav6: '6 Back to average', nav7: '7 Wrap-up',

    s0k: 'Step 0 · The correlation r',
    s0t: 'How neatly do temperature and sales move together? Can one number say?',
    s0e: 'This step asks: how do we turn “moving together” on a scatter plot into a number? Each point is one day: across is the high temperature x (°C), up is cups sold y; the data is simulated. First find the two averages x̄ and ȳ, drawn as dashed lines that split the plot into four quarters. Then turn every day’s deviation into a <strong>standard score</strong>, z = (value − mean) ÷ standard deviation, meaning “how many standard deviations above average”; the standard deviation is the typical distance of the values from their mean, computed here by dividing by n (<a class="xlink" href="../../../probability/basics/probability-distribution/#step2">→ Probability Distributions, step 2: variance and standard deviation as spread</a>). Each point and the centre (x̄, ȳ) span a rectangle of area z<sub>x</sub> × z<sub>y</sub>: positive, in green, when the point is top-right or bottom-left (both above or both below average); negative, in red, when it is top-left or bottom-right. The <strong>correlation coefficient</strong> r is simply the average signed area of all the rectangles. It always lies between −1 and 1: near 1 means the points hug a rising line, near −1 a falling line, near 0 no straight-line trend at all.',
    prodIce: 'Iced drinks (hotter, more sold)', prodSoup: 'Hot soup (hotter, fewer sold)', prodPens: 'Stationery (unrelated to weather)',
    noise0: 'Size of random wobble (cups)', unitF: 'Show temperature in °F', unitC: 'Back to °C',
    c0a: 'One point per day: rectangle = product of standard scores z_x × z_y', axTempC: 'Temperature °C', axTempF: 'Temperature °F', axSales: 'Cups sold',
    axesFmt: '{c}: across {x}, up {y}.',
    s0lgPos: 'Same-direction point (positive area)', s0lgNeg: 'Opposite-direction point (negative area)', s0lgMean: 'Means x̄, ȳ',
    prodNameIce: 'Iced drinks', prodNameSoup: 'Hot soup', prodNamePens: 'Stationery',
    s0readout: '{prod} · wobble {s} cups: {np} same-direction points, positive area {pos}; {nn} opposite-direction points, negative area {neg}; r = ({pos} + {neg}) ÷ {n} = {r}',
    s0undef: '{prod} · wobble 0 cups: sales are identical on all 30 days, the standard deviation is 0, so standard scores and r are undefined.',
    s0hint: 'What to try: pick iced drinks and drag the wobble from 0 to 40. With no wobble the points form a perfect line and r = 1; the more wobble, the more red rectangles and the smaller r. Pick hot soup: green and red swap and r turns negative. Pick stationery: in the simulation sales have nothing to do with temperature, yet these 30 days give r = −0.21, not 0; with only 30 points an r that size turns up by chance easily. Finally press “Show temperature in °F”: every x value changes and r does not move at all, because standard scores ignore units.',

    s1k: 'Step 1 · The best line',
    s1t: 'Draw a straight line through this cloud. What makes one line “the best”?',
    s1e: 'This step asks: if we predict sales from temperature with a line ŷ = a + b·x, which line is best? The data is now fixed: the 30 days of iced drinks with a 15-cup wobble from step 0 (r ≈ 0.75). A point’s <strong>residual</strong> is actual sales minus the line’s prediction, drawn as a vertical segment; we measure only vertically because y is what we are trying to predict. Square each residual and add them up to get the <strong>sum of squared errors</strong>, SSE; the smaller the SSE, the closer the fit. Squaring does two jobs: positive and negative residuals cannot cancel, and big misses cost much more. The line with the smallest SSE is the <strong>least-squares regression line</strong>. Here the line is written as “pass through the centre (x̄, ȳ), then shift the whole thing up or down by d”: ŷ = ȳ + d + b·(x − x̄). One slider turns it, the other shifts it.',
    slope1: 'Slope b (extra cups per 1 °C)', shift1: 'Shift the whole line by d (cups)', best1: 'Jump to the best slope, no shift', clear1: 'Clear history',
    c1a: 'The 30 days, your line and its residuals', c1b: 'SSE against slope b (curve: d = 0)', axSlope: 'Slope b', axSSE: 'SSE',
    s1lgLine: 'Your line', s1lgRes: 'Residuals (vertical)', s1lgBest: 'Least-squares line', s1lgTried: 'Settings (b, d) you tried',
    s1readout: 'Your line: b = {b}, d = {d} → SSE = {sse} | minimum: b = {bh}, d = 0 → SSE = {min} | you are {extra} above it, of which the shift contributes n·d² = {shiftPart}',
    s1hint: 'What to try: keep d = 0 and move only the slope. The “SSE against slope” chart traces a U-shaped curve whose lowest point is the least-squares slope. Then park the slope near the bottom and move only d: whichever way you shift, SSE rises by exactly 30 × d². So the least-squares line always passes through the centre (x̄, ȳ), its slope is b = r × s_y ÷ s_x (s_x and s_y being the standard deviations of temperature and sales), and its intercept is a = ȳ − b·x̄. Any tried setting with d ≠ 0 sits above the curve.',

    s2k: 'Step 2 · Predicting with the line',
    s2t: 'On a 30 °C day, roughly how many cups will sell, and how sure can we be?',
    s2e: 'This step asks: once we have the regression line, how do we predict, and how good is the prediction? The line’s ŷ is “the typical sales at this temperature”; actual sales scatter above and below it. The typical miss is the <strong>root-mean-square error</strong>, RMSE = √(SSE ÷ n), in the same unit as sales (cups); the pale band is the line plus or minus one RMSE. We can also ask how much of the ups and downs in sales temperature accounts for. The <strong>coefficient of determination</strong> is R² = 1 − SSE ÷ SST, where SST is the sum of squared distances from the mean ȳ, the error you would make by ignoring temperature and always guessing the average. The closer R² is to 1, the more the line explains; for a least-squares line R² equals r² exactly. Finally, a button switches both axes to standard scores: the regression line then passes through the origin with slope exactly r.',
    x2: 'Day to predict: high temperature x₀ (°C)', std2: 'Switch both axes to standard scores', raw2: 'Back to original units',
    c2a: 'Regression line, ±1 RMSE band and the prediction', c2aStd: 'In standard scores: regression line z_ŷ = r·z_x and the 45° line', axZx: 'Temperature standard score z_x', axZy: 'Sales standard score z_y',
    s2lgLine: 'Regression line', s2lgBand: '±1 RMSE', s2lgPred: 'Prediction', s2lgDiag: '45° line (slope 1)',
    s2readout: 'x₀ = {x} °C: prediction ŷ = {a} + {b} × {x} = {y} cups, typical miss ±{e} cups (RMSE); {k} of the 30 days fall inside the band. R² = 1 − {sse} ÷ {sst} = {r2}, which equals r² = {r}².',
    s2extrap: 'Careful: these 30 days only cover {lo}–{hi} °C, and x₀ lies outside that range. This is extrapolation, and the straight-line pattern may not hold out there.',
    s2std: 'In standard scores the regression slope is r = {r}, shallower than the 45° line.',
    s2hint: 'What to try: drag x₀ and watch the orange point slide along the line while the readout gives the prediction and its typical miss; 17 of the 30 days (about six in ten) sit inside the pale band. Drag x₀ below 18 °C or above 33 °C and the readout warns about extrapolation. Finally press “Switch both axes to standard scores”: the cloud keeps its shape, and the regression line becomes a line through the origin with slope r ≈ 0.75, shallower than the 45° line.',

    s3k: 'Step 3 · r only sees straight lines',
    s3t: 'If r is close to 0, are the two quantities unrelated?',
    s3e: 'This step asks: can r and a regression line describe every kind of relationship? Three simulated data sets. A: temperature and iced-drink sales, a straight trend. B: driving speed (km/h) and fuel use per 100 km (L), where very slow and very fast both burn more, a U shape. C: fertiliser (kg) and yield gain (%), rising fast at first and then levelling off. The upper chart shows the data with its least-squares line; the lower one is a <strong>residual plot</strong>: same horizontal axis, residuals (actual − line’s prediction) going up. When a line describes the data well, residuals scatter randomly around 0 with no pattern; if they form an arc, the real relationship is curved and the line has missed it. r measures only how strong the <strong>straight-line</strong> relationship is.',
    shapeLine: 'A Temperature & sales', shapeU: 'B Speed & fuel', shapeSat: 'C Fertiliser & yield',
    c3a: 'Data and least-squares line', c3b: 'Residual plot: residual = actual − line’s prediction',
    shapeNameLine: 'A Temperature & sales', shapeNameU: 'B Speed & fuel', shapeNameSat: 'C Fertiliser & yield',
    axSpeed: 'Speed km/h', axFuel: 'Fuel L', axFert: 'Fertiliser kg', axGain: 'Yield gain %', axRes: 'Residual',
    s3lgPts: 'Data', s3lgLine: 'Least-squares line', s3lgRes: 'Residual',
    s3readout: '{name}: r = {r}, R² = {r2}. {verdict}',
    vLine: 'Residuals scatter randomly around 0; the line does a fair job.',
    vU: 'r is almost 0, yet the relationship is anything but weak: fuel use is set entirely by speed, first falling and then rising. The residuals are positive at both ends and negative in the middle, a U.',
    vSat: 'r is sizeable, but the residuals are negative at both ends and positive in the middle, an arch: the line overestimates at the ends and underestimates in between, because the real relationship bends.',
    s3hint: 'What to try: click A, B and C in turn. Look at the points and line on top first, then check the residuals underneath for a pattern. B has r ≈ 0.01, so the number alone suggests speed and fuel are unrelated; C has r ≈ 0.77, so the number alone suggests a line is good enough. That is why you plot the scatter before computing r, and look at the residuals after fitting.',

    s4k: 'Step 4 · How much one point weighs',
    s4t: 'Remove one point. How much does the regression line move?',
    s4e: 'This step asks: does the regression line treat every point equally? Simulated data: weekly practice time (hours) and maths test score (points) for 16 students. The first 15 practised 1–8 hours; student 16 practised 20 hours, far to the right of everyone else. The slider removes one point at a time and refits; the change in slope is that point’s <strong>influence</strong>, and the “Each point’s influence” chart records it for all 16 points. Why does the far point matter so much? Step 1 showed that the least-squares line always passes through the centre (x̄, ȳ). A point far from x̄ is like someone sitting far from the pivot of a seesaw: a small departure from the line turns the line a lot. This is called <strong>high leverage</strong>. The second slider sets the far student’s score.',
    drop4: 'Which point to remove (0 = keep all)', far4: 'Score of student 16 (20 hours)',
    c4a: 'Dashed: all 16 points · solid: chosen point removed', c4b: 'Each point’s influence: change in slope when it is removed', axHours: 'Practice per week (hours)', axScore: 'Score (points)', axPoint: 'Point number', axDb: 'Change in slope',
    s4lgAll: 'Line through all 16 points', s4lgDrop: 'Line without the chosen point', s4lgOut: 'Removed point', s4lgFar: 'Student 16 (the far point)',
    s4readout: 'All 16 points: slope {b} points per hour, r = {r}. The other 15 students’ line predicts {p} points at 20 hours. {drop}',
    s4drop: 'Without point {k} ({x} h, {y} points): slope {b2}, r = {r2}, change in slope {db}.',
    s4none: 'Move the first slider to pick a point to remove.',
    s4hint: 'What to try: leave the far student at 50 points and drag “which point to remove” from 1 to 16. Removing any of the first 15 changes the slope by less than 0.2; removing number 16 makes it jump from −0.11 to 3.26. The bars in the “Each point’s influence” chart are exactly those changes. Then move the far student’s score: near the readout’s “other 15 students’ prediction at 20 hours” (about 119 points) its influence almost vanishes, and the further from that value, the larger it gets. So being far out on the x-axis only gives a point the power to swing the line; how much it actually swings depends on how far it strays from the trend of the rest.',

    s5k: 'Step 5 · Correlation is not causation',
    s5t: 'Primary pupils with longer feet read better. Do long feet make good readers?',
    s5e: 'This step asks: if two quantities are strongly correlated, does one cause the other? Simulated data: foot length (cm) and reading-test score for 210 pupils aged 6–12 at one primary school, 30 of each age. Taken together, r is high. But both grow with <strong>age</strong>: age is a <strong>confounding variable</strong>, a third quantity that drives both. In this simulation, among pupils of the same age, foot length and reading score were generated separately and have no link whatsoever. Restricting the slider to one age holds age fixed.',
    age5: 'Which age to show', ageAll: 'All', ageN: 'Age {a}',
    c5a: 'Foot length and reading score (colour = age)', axFoot: 'Foot cm', axRead: 'Reading score',
    s5lgAll: 'Regression line, all pupils', s5lgGrp: 'Regression line, chosen age', s5lgAge: 'Colour from light to dark: age 6 → 12',
    s5readout: 'All 210 pupils: r = {rall}, regression slope {ball} points per cm. {grp}',
    s5grp: 'Only the 30 pupils aged {age}: r = {r}, regression slope {b} points per cm.',
    s5hint: 'What to try: start with everyone. The points rise from bottom-left to top-right and r ≈ 0.84. Then drag the slider through ages 6, 7 … 12, leaving 30 points of a single colour each time: the cloud is nearly round, and the within-age r runs from −0.28 to 0.43 (about 0.06 on average over the seven ages). Like the r = −0.21 of the stationery days in step 0, that is chance wobble in a small sample. The high overall correlation comes almost entirely from age. Judging cause needs the confounder controlled (as grouping by age does here); the most reliable way is a randomised controlled trial.',

    s6k: 'Step 6 · Regression to the mean',
    s6t: 'Why do the top scorers on one test do worse, on average, the next time?',
    s6e: 'This step asks: with no intervention at all, why do extreme scores drift towards the average next time? We simulate 500 students sitting two tests of equal difficulty. Each score = 70 + 10 × (√ρ × true ability + √(1 − ρ) × luck on the day); ability is the same both times, luck is drawn afresh, and both are random numbers with mean 0 and standard deviation 1. ρ is the share of the spread in scores that comes from ability, and the correlation between the two tests is about ρ. The top 10% on the first test got there partly through ability and partly through good luck; the luck need not repeat, so on the second test that group’s average falls back towards 70. This is <strong>regression to the mean</strong>, and the word “regression” comes from exactly this effect. The regression slope is r × s_y ÷ s_x; the two tests have about the same spread, so the slope is about r, shallower than the line y = x.',
    rho6: 'Share of the spread due to ability, ρ',
    c6a: 'First test vs second test', c6b: 'Top and bottom 10%: average on each test', axT1: 'First test (points)', axT2: 'Second test (points)', axTest: 'Test', tick1: 'First', tick2: 'Second',
    s6lgTop: 'Top 10% on the first test', s6lgBot: 'Bottom 10% on the first test', s6lgAll: 'Average of all 500', s6lgDiag: 'y = x (same score twice)', s6lgLine: 'Regression line',
    s6readout: 'ρ = {rho}: correlation between tests r = {r}, regression slope {b}. Top 10% on test 1: {t1} → {t2} points; bottom 10%: {b1} → {b2}; everyone: {m1} → {m2}.',
    s6hint: 'What to try: push ρ to 1 (scores set entirely by ability). The points sit on the line y = x and the top 10% score the same again. Then lower ρ slowly: the cloud fattens, the regression line becomes shallower than y = x, the top 10% drop on the second test and the bottom 10% rise, while the overall average hardly moves; nobody actually got better or worse. At ρ = 0.5 the top 10% fall from about 86 to about 78. So “they slipped after praise and improved after a telling-off” may be nothing but regression to the mean, not an effect of the praise or the telling-off.',

    s7k: 'Step 7 · Wrap-up', s7t: 'One number, one line, and when not to trust them',
    s7fin: 'Looking back: <strong>step 0</strong>, r is the average product of standard scores, lies between −1 and 1 and ignores units. <strong>Step 1</strong>, the least-squares line minimises the sum of squared residuals, passes through the centre (x̄, ȳ) and has slope b = r·s_y/s_x. <strong>Step 2</strong>, the line predicts the typical value, the typical miss is the RMSE, R² = r² is the share of the ups and downs the line explains, and going beyond the data is extrapolation. <strong>Step 3</strong>, r only measures straight-line relationships, so plot the scatter and check the residuals. <strong>Step 4</strong>, points far out on the x-axis have high leverage and can swing the line a long way when they stray from the trend. <strong>Step 5</strong>, a correlation may come from a confounder and is not proof of cause. <strong>Step 6</strong>, whenever |r| < 1, extreme values are followed on average by values closer to the mean.',
    formula: 'r = mean(z_x · z_y)\nŷ = ȳ + b(x − x̄), b = r · s_y / s_x\nR² = 1 − SSE / SST = r²',
    boundary: 'Where this holds: standard deviations on this page divide by n (dividing by n − 1 leaves r and the regression line unchanged). Least squares measures only vertical residuals, so predicting y from x and x from y give two different lines. All data here is seeded simulation, not measurement; the confounding in step 5 and the test model in step 6 were built to make the mechanism visible, and real confounders are often unknown or hard to measure. With only about 30 points, r itself wobbles from sample to sample.',
    linksTitle: 'Where to next',
    lk1: '→ Mean, Median, Mode, step 1: how far one extreme value drags the mean',
    lk2: '→ Probability Distributions, step 2: how variance and standard deviation measure spread',
    lk3: '→ Gradient Descent, step 6: minimising a loss step by step instead of by formula',
    lk4: '→ Hypothesis Testing, step 0: how likely a result is to be mere coincidence',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Regression & Correlation · The Best Line Through a Cloud”.'
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
