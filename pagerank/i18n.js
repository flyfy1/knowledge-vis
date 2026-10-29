const STR = {
  zh: {
    docTitle: 'PageRank · 随机冲浪者最后停在哪', back: '← 知识索引', pageTitle: 'PageRank · 随机冲浪者最后停在哪',
    tagline: '被链接得最多的网页就最重要吗？用一个随机冲浪者把「重要」变成概率，再用迭代算出来，看阻尼系数和一条新链接怎样改变排名。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 谁更重要', nav1: '1 随机冲浪者', nav2: '2 迭代算出来', nav3: '3 阻尼系数', nav4: '4 改一条链接', nav5: '5 终章',
    s0k: '第 0 步 · 谁更重要', s0t: '被链接得最多的网页，就是最重要的吗？',
    s0e: '这一步要回答：怎样判断一个网页重要？最朴素的办法是数<strong>入链</strong>（别的页面指向它的链接条数）。下图是 8 个页面 A、B、C、X、Y、D、E、F，箭头表示「从这页链接到那页」，节点大小 = 入链数 + 1。先选一个你认为最重要的页面，再点「揭晓 PageRank」：节点大小改为 PageRank（后面几步会解释它；先理解成「随机上网的人最终停在这页的概率」，8 个页面加起来是 100%）。留意 X（入链 3 条，但链接它的页面自己没人链接）和 Y（只有 1 条入链，却来自重要页面）的名次。',
    s0guessL: '你认为最重要的页面', s0Reveal: '揭晓 PageRank', s0Hide: '隐藏 PageRank', s0reset: '重置选择', cv0: '8 个页面的链接图与入链数',
    s0Cap: '8 个页面的链接图（箭头 = 从这页链到那页）', s0In: '入链数（条）', s0Pr: 'PageRank（揭晓后）',
    s0Hid: '点「揭晓 PageRank」查看结果。', s0Res: '揭晓：PageRank 最高的是 {best}（{pbest}）；你选的页面排第 {gr}（{gp}）。',
    s0ro: '入链数最多的页面：<b>{top}</b>（{mx} 条）；你的选择：{g}（入链 {gin}）。{res}',
    s0term: '入链数 = 指向该页的链接条数；PageRank 在后面的步骤里定义。这是一个 8 个页面的玩具网络。',
    s1k: '第 1 步 · 随机冲浪者', s1t: '随机点链接，最后停在哪里？',
    s1e: '这一步要回答：怎样把「重要」变成一个可以计算的数？设想一个随机冲浪者：每一步，他以概率 d（<strong>阻尼系数</strong>）沿当前页面的某条出链随机走一条，以概率 1 − d 厌倦了，随机跳到 8 个页面中的任意一个（<strong>瞬移</strong>）。长期来看他在每个页面停留的时间比例，就是该页的 PageRank。按「走 1 步 / 100 步 / 1000 步」或「自动冲浪」：彩柱是他已访问的频率，白线是精确的 PageRank；走得越多，彩柱越贴近白线。拖动 d 会清空已走的步数（页面会提示）。',
    s1dL: '阻尼系数 d', s1b1: '走 1 步', s1b100: '走 100 步', s1b1000: '走 1000 步', s1Auto: '▶ 自动冲浪', s1reset: '清空并重置', cv1: '冲浪者的访问频率与精确 PageRank',
    s1Cap: '冲浪者当前所在页面（白圈）', s1Bars: '已访问频率（彩柱）· 共 {n} 步', s1Leg: '白线 = 精确 PageRank；彩柱 = 冲浪者的访问频率', s1Notice: '（d 已改变，之前走的步数已清空。）',
    s1ro: '已走 <b>{n}</b> 步，当前在 {cur}，d = {d}；频率与 PageRank 的总变差距离 <b>{dist}</b>（越小越接近）。{note}',
    s1term: '总变差距离 = ½Σ|频率 − PageRank|，0 表示两个分布完全相同；步数越多，随机涨落越小。',
    s2k: '第 2 步 · 迭代算出来', s2t: '不用真去冲浪，怎样直接算出来？',
    s2e: '这一步要回答：能不能不靠模拟，直接算出每页的 PageRank？思路：开始时每页一样（1/8），然后反复更新——每个页面的新得分 = 瞬移带来的 (1 − d)/8，加上所有指向它的页面把自己得分的 d 倍平均分给各条出链。这就是对矩阵反复做乘法的<strong>幂迭代</strong>（原理见<a href="../eigen/#step3">特征向量 · 幂迭代</a>）。拖动「迭代次数 k」或按「逐次迭代」：柱子怎样从平均慢慢移向白线（最终值），读数里「相邻两次变化」和「与最终值的距离」怎样缩小。这里 d = 0.85。',
    s2kL: '迭代次数 k', s2play: '▶ 逐次迭代', s2pause: '⏸ 暂停', s2reset: '重置为 0 次', cv2: '迭代过程中各页得分的变化',
    s2Cap: '第 {k} 次迭代时各页的得分', s2Bars: '各页得分（白线 = 最终值）', s2Leg: '每次迭代：新得分 = 瞬移的 (1−d)/8 + 指向它的页面按出链数均分 d 倍得分',
    s2ro: '迭代 <b>{k}</b> 次：与上一次相比总变化 {ch}，与最终值的距离 <b>{err}</b>；各页得分之和 {sum}；当前名次 {ord}。',
    s2term: '每次迭代后各页得分之和保持为 1；变化越来越小，说明在收敛。',
    s3k: '第 3 步 · 阻尼系数', s3t: '阻尼系数 d 改变了什么？',
    s3e: '这一步要回答：d 取不同的值，PageRank 会怎样变？d 越大，冲浪者越认真沿着链接走，结果越取决于链接结构；d 越小，越多的时间花在随机瞬移上，各页越趋于平均。拖动 d，链接不变：看节点大小、柱子（白线 = d = 0.85 时的值）和名次怎样变化；下方曲线是算到误差小于 10⁻⁸ 所需的迭代次数，橙点是当前 d：d 越接近 1 越慢。常用的 d 是 0.85。',
    s3dL: '阻尼系数 d', s3reset: '重置为 0.85', cv3: '不同阻尼系数下的 PageRank 与收敛所需次数',
    s3Cap: 'd = {d} 时的 PageRank', s3Bars: '各页 PageRank（白线 = d=0.85）', s3It: '收敛所需迭代次数（误差 < 10⁻⁸）', s3Ax: 'd',
    s3ro: 'd = <b>{d}</b>：收敛需要 <b>{it}</b> 次迭代；最高得分 {top}；名次 {ord}。',
    s3term: '收敛所需次数取决于这张小图；真实网页图规模巨大，次数和算法细节都不同。',
    s4k: '第 4 步 · 改一条链接', s4t: '增加一条链接，排名会怎样变？',
    s4e: '这一步要回答：哪条新链接能让一个页面的名次明显上升？勾选下面的新链接（图中的白色粗箭头）：柱子是新的 PageRank，白线是原来的值。观察：来自重要页面（如 A）的链接，比来自无人链接的小页面（D、E、F）的链接影响大得多；同一页面分出的出链越多，每条链接传递的得分越少。读数列出名次变化。',
    s4edgesL: '要添加的链接', s4reset: '取消全部新增', cv4: '新增链接后的 PageRank 与名次变化',
    s4Edge: '新增链接 {a} → {b}', s4Cap: '新增链接（白色粗箭头）后的网络', s4Bars: '各页 PageRank（白线 = 原值）', s4Leg: '节点大小 = 新的 PageRank；白线 = 添加链接前的值', s4NoMove: '名次没有变化',
    s4ro: '新增 <b>{k}</b> 条链接：原名次 {b}；新名次 {a}；名次变化：{mv}；总变化量 {ch}。',
    s4term: '总变化量 = ½Σ|新 − 旧|，表示有多大比例的得分被重新分配。这里的链接只是示例，不涉及真实搜索引擎的反作弊。',
    s5k: '第 5 步 · 终章', s5t: '收束：重要 = 被重要的页面链接',
    s5e: 'PageRank 把「重要」定义成随机冲浪者长期停留的概率：它既可以模拟，也可以迭代算出；入链数多不一定重要，来自重要页面的链接分量更重。',
    c1t: '入链数会误导', c1b: 'X 入链更多，Y 的入链却来自重要页面，名次更高（第 0 步）。',
    c2t: '随机冲浪者', c2b: '沿链接走加偶尔瞬移，长期访问频率就是 PageRank（第 1 步）。',
    c3t: '迭代求解', c3b: '反复把得分沿链接分配，几十次后收敛；d 越大越慢（第 2、3 步）。',
    c4t: '链接的质量', c4b: '来自重要页面的一条链接胜过一群小页面（第 4 步）。',
    modelT: '模型与局限',
    modelB: '这是一个 8 个页面的玩具网络，没有出链为零的页面（代码里对它们均分得分，但图里没有）；真实搜索排序用到许多信号，PageRank 只是早期的一种；真实网页图规模巨大，还要处理反作弊。第 1 步用固定随机种子模拟，其余步骤用精确迭代。',
    linksT: '想从别处继续',
    link1: '特征向量 · 幂迭代：PageRank 的迭代就是幂迭代', link2: '图算法 · 图是地图：节点与边的基本语言', link3: '蒙特卡洛 · 比例即概率：多次随机游走的频率逼近概率',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'PageRank · Where the Random Surfer Ends Up', back: '← Knowledge Index', pageTitle: 'PageRank · Where the Random Surfer Ends Up',
    tagline: 'Is the most linked-to page the most important? Turn “important” into a probability with a random surfer, compute it by iteration, and see how the damping factor and one new link change the ranking.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Who matters', nav1: '1 Random surfer', nav2: '2 Iterating', nav3: '3 Damping', nav4: '4 Add a link', nav5: '5 Finale',
    s0k: 'Step 0 · Who matters', s0t: 'Is the most linked-to page the most important?',
    s0e: 'This step answers: how do we judge that a web page is important? The simplest way is to count <strong>in-links</strong> (the number of links from other pages pointing to it). The graph below has 8 pages A, B, C, X, Y, D, E and F; an arrow means “this page links to that page” and node size = in-links + 1. First pick the page you think is most important, then press “Reveal PageRank”: node size switches to PageRank (explained in later steps; for now think of it as “the probability that a random web surfer ends up on this page”, summing to 100% over the 8 pages). Look at the ranks of X (3 in-links, but the pages linking to it have no in-links themselves) and Y (only 1 in-link, but from an important page).',
    s0guessL: 'The page you think matters most', s0Reveal: 'Reveal PageRank', s0Hide: 'Hide PageRank', s0reset: 'Reset choice', cv0: 'Link graph of 8 pages and in-link counts',
    s0Cap: 'Link graph of 8 pages (arrow = this page links to that page)', s0In: 'in-links (count)', s0Pr: 'PageRank (after reveal)',
    s0Hid: 'Press “Reveal PageRank” to see the result.', s0Res: 'Revealed: the highest PageRank is {best} ({pbest}); your page ranks {gr} ({gp}).',
    s0ro: 'Page(s) with the most in-links: <b>{top}</b> ({mx}); your choice: {g} ({gin} in-links). {res}',
    s0term: 'In-links = the number of links pointing to a page; PageRank is defined in the later steps. This is a toy network of 8 pages.',
    s1k: 'Step 1 · The random surfer', s1t: 'Click links at random: where do you end up?',
    s1e: 'This step answers: how can “important” become a computable number? Imagine a random surfer: at each step they follow a random outgoing link of the current page with probability d (the <strong>damping factor</strong>), and with probability 1 − d they get bored and jump to any of the 8 pages at random (<strong>teleport</strong>). The long-run fraction of time spent on a page is that page’s PageRank. Press “1 step / 100 steps / 1000 steps” or “Auto surf”: the coloured bars are the frequencies of visits so far and the white ticks are the exact PageRank; the more steps, the closer the bars get to the ticks. Dragging d clears the steps taken (the page tells you).',
    s1dL: 'Damping factor d', s1b1: '1 step', s1b100: '100 steps', s1b1000: '1000 steps', s1Auto: '▶ Auto surf', s1reset: 'Clear and reset', cv1: 'The surfer’s visit frequencies and the exact PageRank',
    s1Cap: 'The page the surfer is on now (white ring)', s1Bars: 'visit frequency (bars) · {n} steps', s1Leg: 'white tick = exact PageRank; bar = surfer’s visit frequency', s1Notice: '(d changed, so the earlier steps were cleared.)',
    s1ro: '<b>{n}</b> steps taken, now on {cur}, d = {d}; total variation distance between frequencies and PageRank <b>{dist}</b> (smaller = closer). {note}',
    s1term: 'Total variation distance = ½Σ|frequency − PageRank|; 0 means the two distributions are identical; more steps means less random fluctuation.',
    s2k: 'Step 2 · Iterating', s2t: 'Without actually surfing, how do we compute it directly?',
    s2e: 'This step answers: can we compute each page’s PageRank directly, without simulation? Idea: start with every page equal (1/8), then update repeatedly — each page’s new score = (1 − d)/8 from teleporting, plus d times the score of every page linking to it, split evenly among that page’s outgoing links. This is <strong>power iteration</strong>, repeated multiplication by a matrix (see <a href="../eigen/#step3">Eigenvectors · power iteration</a>). Drag “iterations k” or press “Iterate step by step”: watch the bars drift from equal toward the white ticks (the final values), and the “change since last iteration” and “distance from the final values” in the readout shrink. Here d = 0.85.',
    s2kL: 'Iterations k', s2play: '▶ Iterate step by step', s2pause: '⏸ Pause', s2reset: 'Reset to 0 iterations', cv2: 'How each page’s score changes during iteration',
    s2Cap: 'Scores of the pages after iteration {k}', s2Bars: 'page scores (white tick = final value)', s2Leg: 'each iteration: new score = (1−d)/8 from teleport + d times the scores of pages linking in, split by their outgoing links',
    s2ro: 'After <b>{k}</b> iteration(s): total change since the last one {ch}, distance from the final values <b>{err}</b>; scores sum to {sum}; current order {ord}.',
    s2term: 'The scores always sum to 1 after each iteration; smaller and smaller changes mean it is converging.',
    s3k: 'Step 3 · The damping factor', s3t: 'What does the damping factor d change?',
    s3e: 'This step answers: how does PageRank change with d? The larger d, the more faithfully the surfer follows links and the more the result depends on link structure; the smaller d, the more time goes into random teleports and the more even the pages become. Drag d with the links fixed: see how node sizes, bars (white tick = the value at d = 0.85) and the ranking change; the curve below is the number of iterations needed to get the error below 10⁻⁸ and the orange dot is the current d: the closer d is to 1, the slower. The usual choice is d = 0.85.',
    s3dL: 'Damping factor d', s3reset: 'Reset to 0.85', cv3: 'PageRank at different damping factors and the iterations needed',
    s3Cap: 'PageRank at d = {d}', s3Bars: 'PageRank per page (white tick = d=0.85)', s3It: 'iterations to converge (error < 10⁻⁸)', s3Ax: 'd',
    s3ro: 'd = <b>{d}</b>: <b>{it}</b> iterations to converge; highest score {top}; order {ord}.',
    s3term: 'The iteration count depends on this small graph; real web graphs are huge and differ in count and algorithm details.',
    s4k: 'Step 4 · Add one link', s4t: 'Add a link: how does the ranking change?',
    s4e: 'This step answers: which new link lifts a page’s rank noticeably? Tick the new links below (the thick white arrows in the graph): the bars are the new PageRank and the white ticks the old values. Observe: a link from an important page (such as A) matters far more than links from tiny pages nobody links to (D, E, F); and the more outgoing links a page splits its score among, the less each link passes on. The readout lists the rank changes.',
    s4edgesL: 'Links to add', s4reset: 'Untick all new links', cv4: 'PageRank and rank changes after adding links',
    s4Edge: 'Add link {a} → {b}', s4Cap: 'Network after adding links (thick white arrows)', s4Bars: 'PageRank per page (white tick = original)', s4Leg: 'node size = new PageRank; white tick = value before adding links', s4NoMove: 'no rank changes',
    s4ro: '<b>{k}</b> link(s) added: old order {b}; new order {a}; rank changes: {mv}; total change {ch}.',
    s4term: 'Total change = ½Σ|new − old|, the share of score that has been redistributed. The links here are examples and say nothing about real search-engine spam defences.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: important = linked to by important pages',
    s5e: 'PageRank defines “important” as the long-run probability of a random surfer being on a page: it can be simulated or computed by iteration; many in-links do not guarantee importance, and a link from an important page weighs more.',
    c1t: 'In-link counts can mislead', c1b: 'X has more in-links, but Y’s in-link comes from an important page and ranks higher (step 0).',
    c2t: 'The random surfer', c2b: 'Follow links with the occasional teleport; long-run visit frequency is PageRank (step 1).',
    c3t: 'Solving by iteration', c3b: 'Spread scores along links repeatedly and it converges in tens of rounds; larger d is slower (steps 2 and 3).',
    c4t: 'Link quality', c4b: 'One link from an important page beats a crowd of tiny pages (step 4).',
    modelT: 'Model and limits',
    modelB: 'This is a toy network of 8 pages with no page lacking outgoing links (the code spreads such a page’s score evenly, but none appears in the graph); real search ranking uses many signals and PageRank was only an early one; real web graphs are enormous and need spam defences. Step 1 is a simulation with a fixed random seed; the other steps use exact iteration.',
    linksT: 'Continue elsewhere',
    link1: 'Eigenvectors · power iteration: the PageRank iteration is power iteration', link2: 'Graph algorithms · the graph as a map: the basic language of nodes and edges', link3: 'Monte Carlo · proportion is probability: the frequency of many random walks approaches the probability',
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
