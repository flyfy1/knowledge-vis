const STR = {
  zh: {
    docTitle: '决策树与信息增益 · 二十个问题的最优问法', back: '← 知识索引', pageTitle: '决策树与信息增益',
    tagline: '每一刀都问一个是非题：怎样挑最能降低混乱度的那一刀，一刀接一刀长成一棵树，又为什么不能长得太深。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 不纯度', nav1: '1 一刀切在哪', nav2: '2 长成一棵树', nav3: '3 长多深', nav4: '4 用树判断', nav5: '5 终章',
    featX: '横坐标 x', featY: '纵坐标 y', cls0: '圆点（青）', cls1: '方块（橙）',
    s0k: '第 0 步 · 不纯度', s0t: '一组数据有多「混」？',
    s0e: '这一步要回答：怎样用一个数衡量一组东西混得有多乱？想象 40 个点，每个点属于两类之一（圆点或方块）。<strong>不纯度</strong>：全是同一类时为 0，两类各占一半时最大。常用两个量：<strong>熵</strong> H = −Σp·log₂p（单位：比特，p 是各类所占的比例，来龙去脉见<a href="../entropy/#step3">熵 · 二元熵与二十问</a>）和<strong>基尼不纯度</strong> G = 1 − Σp²（两类时等于 2p(1−p)）。拖动「方块个数」：点阵怎样变化，两条曲线上的点怎样走；找出哪里最高，以及两端为什么都是 0。',
    s0kL: '方块个数（共 40 个点）', s0reset: '重置', cv0: '点阵与熵、基尼曲线',
    s0Dots: '40 个点：圆点 = 一类，方块 = 另一类', s0Curve: '不纯度随方块比例 p 的变化', s0Ax: '方块比例 p：0 → 1', s0LegE: '青 = 熵（比特）', s0LegG: '绿 = 基尼不纯度',
    s0ro: '方块 <b>{k} / {n}</b>，比例 p = {p}：熵 <b>{h}</b> 比特，基尼 <b>{g}</b>。',
    s0term: '两条曲线都在 p = 0.5 最高（熵 1 比特，基尼 0.5），在 p = 0 或 1（只剩一类）时为 0。',
    s1k: '第 1 步 · 一刀切在哪', s1t: '哪一刀切得最能把两类分开？',
    s1e: '这一步要回答：沿一个特征切一刀（x 或 y 小于某个阈值），怎样算切得好？数据是人造的 80 个点（约 8% 的标签被故意翻错，模拟噪声）。切完后，两边各自的混乱程度（熵）按点数加权平均，叫<strong>切后熵</strong>；<strong>信息增益</strong> = 切前熵 − 切后熵（单位比特，越大越好，0 表示这一刀毫无帮助）。先选特征，再拖动阈值：白线移动时，下方曲线上的橙点怎样走；白点是所有阈值里增益最大的位置。读数里列出两边各类的个数。',
    s1fxL: '用 x 切', s1fyL: '用 y 切', s1tL: '阈值', s1reset: '重置', cv1: '散点、切线与增益曲线',
    s1Scat: '白线 = 切线；圆点与方块 = 两类', s1Gain: '沿「{f}」切：增益 vs 阈值', s1Best: '最佳',
    s1ro: '沿「{f}」，小于 {t} 的一侧：圆点 {l0} / 方块 {l1}；其余一侧：圆点 {r0} / 方块 {r1}。切前熵 {hp}，切后熵 {ha}，信息增益 <b>{g}</b> 比特。这个特征的最佳阈值 {bt}，最大增益 {bg}。',
    s1term: '增益只是在这 80 个点上算出的；数据少，最佳阈值会随样本抖动。',
    s2k: '第 2 步 · 长成一棵树', s2t: '一棵树是怎样一刀接一刀长出来的？',
    s2e: '这一步要回答：对分出来的每个区域继续切，树怎样一步步长大？规则很简单：每一步在所有区域里挑「按区域所占比例加权后信息增益最大」的一刀（<strong>贪心</strong>：只看眼前最好，不回头）。拖动「切的刀数」（或按「自动生长」）：上图是点的分区（白线 = 切线，底色 = 该区域的多数类，红圈 = 被当前这棵树分错的点）；下图是树，每个圆是一个区域，橙色扇形的占比 = 方块所占的比例。观察：前几刀把大块分开，分错的点迅速减少；后面的刀只是在抠个别点。',
    s2nL: '切的刀数', s2play: '▶ 自动生长', s2pause: '⏸ 暂停', s2reset: '重置为 0 刀', cv2: '点的分区与对应的决策树',
    s2Scat: '分区：白线 = 切线，红圈 = 分错的点', s2Tree: '树：圆的橙色扇形 = 方块占比', s2Last: '沿「{f}」在 {t}（增益 {g} 比特，作用于 {m} 个点）', s2None: '还没切：整棵树只有一个区域，全部判为多数类',
    s2ro: '已切 <b>{got}</b> 刀（滑块 {n}），共 {leaves} 个叶子区域；训练集准确率 <b>{acc}</b>，分错 {wrong} 个点。最新一刀：{last}。',
    s2term: '叶子 = 不再继续切的区域，它的预测是区域内的多数类。准确率只在训练集上测得，不代表新数据。',
    s3k: '第 3 步 · 长多深', s3t: '树越深越好吗？',
    s3e: '这一步要回答：把树长得更深，对没见过的新数据也更好吗？这里用<strong>最大深度</strong>（从根到叶子最多切几刀）限制树的大小，并用另外 600 个点（按真实规则生成、没有噪声）当作「新数据」。橙线是训练集准确率，青线是新数据准确率。拖动「最大深度」，噪声不变：看深度增大时橙线逼近 100%，而青线先升后降；再把「标签噪声」调到 0，两条线的关系怎样变化。多项式版本的同一现象见<a href="../overfitting/#step1">过拟合 · 训练误差与测试误差</a>。',
    s3dL: '最大深度', s3zL: '训练标签噪声（被翻错的比例）', s3reset: '重置', cv3: '准确率随最大深度的变化',
    s3Cap: '准确率与最大深度（竖线 = 当前深度）', s3Ax: '最大深度 1 → 10', s3LegTr: '橙 = 训练集', s3LegTe: '青 = 新数据',
    s3ro: '最大深度 <b>{d}</b>，噪声 {z}%：{leaves} 个叶子；训练准确率 <b>{tr}</b>，新数据准确率 <b>{te}</b>。新数据准确率最高的深度是 {bk}（{bt}）。',
    s3term: '准确率 = 判对的点数 / 总点数。「新数据」是同一条真实规则生成的 600 个无噪声点。结论只对这套固定数据成立。',
    s4k: '第 4 步 · 用树判断', s4t: '来了一个新点，树怎么给它分类？',
    s4e: '这一步要回答：训练好的树怎样判断一个新点？拖动查询点的 x、y（十字）：树从根出发回答一连串「是/否」问题，沿着白线走到的叶子，就是它的类别；叶子里各类的比例给出一个粗略的把握度。再调「最大深度」：树越浅，问的问题越少，判断越粗。',
    s4dL: '最大深度', s4xL: '查询点 x', s4yL: '查询点 y', s4reset: '重置', cv4: '查询点、分区与树上的路径',
    s4Scat: '十字 = 查询点；白框 = 它所在的叶子区域', s4Tree: '树：白线 = 查询点走过的路径', s4NoQ: '树只有根，没有问题',
    s4ro: '查询点 ({x}, {y})：回答了 <b>{k}</b> 个问题（{q}）；所在叶子里 圆点 {c0} / 方块 {c1}；预测类别 <b>{cls}</b>，把握度 {conf}。',
    s4term: '把握度 = 叶子里多数类所占的比例，只反映训练点的分布，不是校准过的概率。',
    s5k: '第 5 步 · 终章', s5t: '收束：用最少的问题把两类分开',
    s5e: '决策树把「二十个问题」变成算法：用不纯度衡量混乱，用信息增益挑最好的一问，贪心地一刀接一刀，再用深度控制它别学到噪声。',
    c1t: '不纯度', c1b: '全是一类为 0，对半分最大；熵与基尼都可用（第 0 步）。',
    c2t: '信息增益', c2b: '切前熵减去切后熵（按点数加权），越大越好（第 1 步）。',
    c3t: '贪心长树', c3b: '每步挑加权增益最大的一刀；前几刀见效最大，后面在抠个别点（第 2 步）。',
    c4t: '深度与新数据', c4b: '训练准确率随深度只升不降，新数据准确率在有噪声时先升后降（第 3、4 步）。',
    modelT: '模型与局限',
    modelB: '数据是人造的二维两类点（真实规则是两个矩形，训练标签带噪声）；每一刀只能与坐标轴平行；贪心不保证整棵树最优；本页用熵，基尼不纯度常得到相近的树；没有剪枝，也没有交叉验证。准确率的比较只对这套固定数据成立。',
    linksT: '想从别处继续',
    link1: '熵 · 二元熵与二十问：熵从哪里来、为什么用比特', link2: '二分查找 · 每次砍半：一个是非题把范围缩小一半', link3: '贝叶斯 · 先验是起点：叶子里的类别比例像一个先验',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Decision Trees and Information Gain · The Best Way to Play Twenty Questions', back: '← Knowledge Index', pageTitle: 'Decision Trees and Information Gain',
    tagline: 'Each cut asks a yes/no question: how to pick the cut that reduces disorder the most, grow a tree one cut at a time, and why it should not grow too deep.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Impurity', nav1: '1 Where to cut', nav2: '2 Growing a tree', nav3: '3 How deep', nav4: '4 Using the tree', nav5: '5 Finale',
    featX: 'x coordinate', featY: 'y coordinate', cls0: 'circle (cyan)', cls1: 'square (orange)',
    s0k: 'Step 0 · Impurity', s0t: 'How “mixed” is a group?',
    s0e: 'This step answers: how can one number measure how mixed up a group is? Imagine 40 points, each belonging to one of two classes (circle or square). <strong>Impurity</strong> is 0 when everything is one class and largest when the classes are split half and half. Two common measures: <strong>entropy</strong> H = −Σp·log₂p (unit: bits, p being each class’s share; the background is in <a href="../entropy/#step3">Entropy · binary entropy and twenty questions</a>) and <strong>Gini impurity</strong> G = 1 − Σp² (for two classes this is 2p(1−p)). Drag “number of squares”: how does the dot grid change and how do the points on the two curves move? Find where each curve peaks and why both are 0 at the ends.',
    s0kL: 'Number of squares (out of 40 points)', s0reset: 'Reset', cv0: 'Dot grid with entropy and Gini curves',
    s0Dots: '40 points: circle = one class, square = the other', s0Curve: 'Impurity against the square share p', s0Ax: 'square share p: 0 → 1', s0LegE: 'cyan = entropy (bits)', s0LegG: 'green = Gini impurity',
    s0ro: '<b>{k} / {n}</b> squares, share p = {p}: entropy <b>{h}</b> bits, Gini <b>{g}</b>.',
    s0term: 'Both curves peak at p = 0.5 (entropy 1 bit, Gini 0.5) and are 0 at p = 0 or 1 (only one class left).',
    s1k: 'Step 1 · Where to cut', s1t: 'Which cut separates the two classes best?',
    s1e: 'This step answers: if we cut along one feature (x or y below a threshold), what makes a cut good? The data are 80 artificial points (about 8% of the labels are deliberately flipped to mimic noise). After the cut, the disorder (entropy) of each side is averaged, weighted by the number of points; this is the <strong>entropy after the cut</strong>. <strong>Information gain</strong> = entropy before the cut − entropy after it (unit: bits; bigger is better, and 0 means the cut did not help at all). Pick a feature, then drag the threshold: as the white line moves, how does the orange dot on the curve below move? The white dot marks the threshold with the largest gain. The readout lists the class counts on both sides.',
    s1fxL: 'Cut on x', s1fyL: 'Cut on y', s1tL: 'Threshold', s1reset: 'Reset', cv1: 'Scatter, cut line and gain curve',
    s1Scat: 'white line = the cut; circles and squares = the two classes', s1Gain: '“{f}”: gain vs threshold', s1Best: 'best',
    s1ro: 'On “{f}”, the side below {t}: circles {l0} / squares {l1}; the other side: circles {r0} / squares {r1}. Entropy before {hp}, after {ha}, information gain <b>{g}</b> bits. Best threshold for this feature {bt}, largest gain {bg}.',
    s1term: 'The gain is computed on just these 80 points; with so little data the best threshold wobbles with the sample.',
    s2k: 'Step 2 · Growing a tree', s2t: 'How does a tree grow, one cut after another?',
    s2e: 'This step answers: if we keep cutting every region that was produced, how does the tree grow step by step? The rule is simple: at each step choose, among all regions, the cut with the largest information gain weighted by the region’s share of the points (<strong>greedy</strong>: look only at what is best right now, never go back). Drag “number of cuts” (or press “Auto grow”): the upper picture is the partition of the points (white line = cut, background = the region’s majority class, red ring = a point this tree gets wrong); the lower picture is the tree, each circle a region with the orange wedge showing the share of squares. Watch: the first few cuts separate the big blocks and the misclassified points drop fast; later cuts just pick off individual points.',
    s2nL: 'Number of cuts', s2play: '▶ Auto grow', s2pause: '⏸ Pause', s2reset: 'Reset to 0 cuts', cv2: 'Partition of the points and the matching decision tree',
    s2Scat: 'partition: white line = cut, red ring = misclassified', s2Tree: 'tree: orange wedge = share of squares', s2Last: 'on “{f}” at {t} (gain {g} bits, acting on {m} points)', s2None: 'no cut yet: the whole tree is one region, everything is labelled with the majority class',
    s2ro: '<b>{got}</b> cut(s) made (slider {n}), {leaves} leaf region(s); training accuracy <b>{acc}</b>, {wrong} point(s) wrong. Latest cut: {last}.',
    s2term: 'Leaf = a region that is not cut any further; its prediction is the majority class inside. Accuracy is measured on the training set only and says nothing about new data.',
    s3k: 'Step 3 · How deep', s3t: 'Is a deeper tree always better?',
    s3e: 'This step answers: does growing the tree deeper also help on data it has not seen? The tree size is limited by the <strong>maximum depth</strong> (the most cuts from the root to any leaf), and another 600 points (generated by the true rule with no noise) play the role of “new data”. The orange line is training accuracy, the cyan line is accuracy on new data. Drag “maximum depth” with the noise fixed: as depth grows the orange line approaches 100% while the cyan line rises and then falls; then set “label noise” to 0 and see how the relation between the two lines changes. The same effect with polynomials is in <a href="../overfitting/#step1">Overfitting · training error and test error</a>.',
    s3dL: 'Maximum depth', s3zL: 'Training label noise (share flipped)', s3reset: 'Reset', cv3: 'Accuracy against maximum depth',
    s3Cap: 'Accuracy against maximum depth (vertical line = current)', s3Ax: 'maximum depth 1 → 10', s3LegTr: 'orange = training set', s3LegTe: 'cyan = new data',
    s3ro: 'Maximum depth <b>{d}</b>, noise {z}%: {leaves} leaves; training accuracy <b>{tr}</b>, new-data accuracy <b>{te}</b>. The depth with the highest new-data accuracy is {bk} ({bt}).',
    s3term: 'Accuracy = points classified correctly / all points. “New data” are 600 noise-free points from the same true rule. The conclusion holds only for this fixed data set.',
    s4k: 'Step 4 · Using the tree', s4t: 'A new point arrives: how does the tree classify it?',
    s4e: 'This step answers: how does a trained tree judge a new point? Drag the query point’s x and y (the cross): the tree starts at the root and answers a chain of yes/no questions, and the leaf reached along the white path gives the class; the class shares in the leaf give a rough confidence. Then change “maximum depth”: a shallower tree asks fewer questions and judges more coarsely.',
    s4dL: 'Maximum depth', s4xL: 'Query point x', s4yL: 'Query point y', s4reset: 'Reset', cv4: 'Query point, partition and path through the tree',
    s4Scat: 'cross = query point; white box = its leaf region', s4Tree: 'tree: white line = path of the query point', s4NoQ: 'the tree is just a root: no questions',
    s4ro: 'Query point ({x}, {y}): answered <b>{k}</b> question(s) ({q}); its leaf holds circles {c0} / squares {c1}; predicted class <b>{cls}</b>, confidence {conf}.',
    s4term: 'Confidence = the majority class’s share inside the leaf; it reflects only the training points and is not a calibrated probability.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: separating two classes with the fewest questions',
    s5e: 'A decision tree turns “twenty questions” into an algorithm: measure disorder with impurity, pick the best question by information gain, grow greedily one cut at a time, and use depth to keep it from learning the noise.',
    c1t: 'Impurity', c1b: '0 when all one class, largest at a half-and-half split; entropy and Gini both work (step 0).',
    c2t: 'Information gain', c2b: 'Entropy before minus entropy after the cut (weighted by points); bigger is better (step 1).',
    c3t: 'Greedy growth', c3b: 'Each step takes the cut with the largest weighted gain; the first cuts matter most, later ones pick off single points (step 2).',
    c4t: 'Depth and new data', c4b: 'Training accuracy only rises with depth; with noise, new-data accuracy rises then falls (steps 3 and 4).',
    modelT: 'Model and limits',
    modelB: 'The data are artificial 2-D two-class points (the true rule is two rectangles, the training labels carry noise); every cut must be parallel to an axis; greedy growth does not guarantee the best whole tree; this page uses entropy, and Gini impurity often gives a similar tree; there is no pruning and no cross-validation. Accuracy comparisons hold only for this fixed data set.',
    linksT: 'Continue elsewhere',
    link1: 'Entropy · binary entropy and twenty questions: where entropy comes from and why bits', link2: 'Binary search · halving: one yes/no question halves the range', link3: 'Bayes · the prior is the starting point: the class shares in a leaf behave like a prior',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result'
  }
};
let currentLang = 'en';
function t(key, vars = {}) { let out = (STR[currentLang] && STR[currentLang][key]) || key; return out.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? ''); }
function setLang(lang) {
  currentLang = lang === 'zh' ? 'zh' : 'en';
  try { localStorage.setItem('knowledge-lang', currentLang); } catch (_) {}
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-lang]').forEach(b => { b.classList.toggle('active', b.dataset.lang === currentLang); b.setAttribute('aria-pressed', b.dataset.lang === currentLang ? 'true' : 'false'); });
  window.dispatchEvent(new CustomEvent('langchange'));
}
function initLang() {
  let saved = null;
  try { saved = localStorage.getItem('knowledge-lang'); } catch (_) {}
  setLang(saved === 'zh' || saved === 'en' ? saved : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
}
