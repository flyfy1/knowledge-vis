const STR = {
  zh: {
    docTitle: '多臂老虎机 · 探索还是利用', back: '← 知识索引', pageTitle: '多臂老虎机 · 探索还是利用',
    tagline: '五台看不出差别的机器，每台的中奖率你看不见：先亲手拉几次，再看贪心、ε-贪心、UCB 和汤普森采样怎样在「多试试」与「拉最好的」之间取舍。',
    navLabel: '步骤导航', languageLabel: '语言', category: '概率与统计 / Probability', stage: '大学 / University',
    nav0: '0 盲拉五台', nav1: '1 探索与利用', nav2: '2 UCB', nav3: '3 汤普森采样', nav4: '4 策略对比', nav5: '5 终章',
    arm: '机器 {a}', pull: '拉 {a}',
    s0k: '第 0 步 · 盲拉五台机器', s0t: '哪台老虎机最值得拉？',
    s0e: '这一步要回答：五台外表一样的老虎机，每台的中奖概率不同且你看不见，怎样在有限次数里多赢？每按一次「拉 X」就拉一次那台机器，中奖得 1 分。柱子是你<strong>目前估计</strong>的中奖率 = 中奖次数 ÷ 拉动次数，白色竖线是大致的误差范围（约 95%，次数少时很宽）。先每台拉几次，再决定把次数投到哪里。点「揭晓真实概率」：红线是各台的真实概率，下方绿色虚线是「一开始就拉最好那台」的期望得分，橙线是你的累计得分，两线之间的差就是你为了「找」而付出的代价（<strong>遗憾</strong>）。「新一局」会换一组机器并清零。',
    s0armsL: '选择要拉的机器', s0Reveal: '揭晓真实概率', s0Hide: '隐藏真实概率', s0new: '新一局（换机器并清零）', s0reset: '重置为第一局', cv0: '五台机器的估计中奖率与累计得分',
    s0Est: '估计中奖率（红线 = 揭晓后的真实值）', s0Cum: '累计得分（橙）', s0Ax: '拉动次数 → {n}', s0Ideal: '绿虚线 = 一开始就拉最好那台的期望得分',
    s0Hidden: '揭晓后显示', s0Truth: '真实概率：{v}',
    s0ro: '共拉 <b>{tot}</b> 次，中奖 {wins} 次（{rate}）；目前估计最高的是 {seen}。期望遗憾：<b>{reg}</b>。{rv}',
    s0term: '遗憾 = 每次拉动时「最好那台的真实概率 − 你拉的那台的真实概率」之和（期望值，不是实际运气）；只有知道真实概率才算得出，所以实战中看不到。',
    s1k: '第 1 步 · 探索与利用', s1t: '只拉当前最好的，为什么会吃亏？',
    s1e: '这一步要回答：是不是一直拉目前看起来最好的那台就行？<strong>贪心</strong>：永远拉估计最高的；开局运气不好时，它可能永远锁在一台次优机器上（不再「探索」其他机器）。<strong>ε-贪心</strong>：以概率 ε 随机拉一台（探索），其余时候拉估计最高的（利用）。图是 500 步内的平均累计遗憾（80 次独立模拟取平均；机器的真实概率是 0.25 / 0.40 / 0.50 / 0.62 / 0.45）。拖动 ε，其余不变：看橙线怎样变化；灰虚线是 ε = 0（纯贪心），青虚线是 ε = 0.10。ε 太小探索不足，太大则一直浪费在差机器上。',
    s1eL: '探索概率 ε', s1reset: '重置', cv1: '不同 ε 的平均累计遗憾曲线',
    s1Cap: '平均累计遗憾（越低越好）', s1Ax: '步数 1 → {T}', s1G: '灰虚线 = 纯贪心 (ε=0)', s1E10: '青虚线 = ε=0.10', s1Cur: '橙线 = 当前 ε={e}',
    s1ro: 'ε = <b>{e}</b>：{T} 步后的平均累计遗憾：纯贪心 {g}，ε = 0.10 为 {t10}，当前 ε 为 <b>{cur}</b>（越小越好；最好机器的概率 {pb}；{runs} 次模拟取平均）。',
    s1term: '平均累计遗憾 = 把每次模拟的遗憾曲线在多次模拟间取平均；曲线越平，说明越早找对了最好的机器。',
    s2k: '第 2 步 · 乐观面对不确定', s2t: '怎样让「拉得少」的机器也有机会？',
    s2e: '这一步要回答：不靠抛硬币，能不能系统地决定探索谁？<strong>UCB</strong>（上置信界）给每台机器的估计加一个「乐观加成」：得分 = 估计 + c·√(2·ln t / n)，t 是已拉的总次数，n 是这台机器已拉的次数。拉得少的机器加成大，所以会被试一试；拉得多的机器加成小，估计更可信。c 是探索权重（c = 1 是教科书的 UCB1）。拖动「已拉步数 t」或按「自动播放」：白色短横线是估计 + 加成，白框是下一步选中的机器；柱子是估计，红线是真实概率。再拖 c：c 越大探索越多，c 小则更接近贪心。（一次固定随机种子的模拟。）',
    s2tL: '已拉步数 t', s2cL: '探索权重 c', s2play: '▶ 自动播放', s2pause: '⏸ 暂停', s2reset: '重置', cv2: '各台的估计、乐观上界与下一步选择',
    s2Cap: '第 {t} 步时的估计与乐观上界', s2Leg: '彩柱 = 估计；白竖线 = 约 95% 误差范围；白横线 = 估计 + 加成；红线 = 真实概率；白框 = 下一步选中的机器',
    s2ro: 'c = {c}，已拉 <b>{t}</b> 步：下一步选 <b>{next}</b>；最高的「估计 + 加成」是 {ub}；各台拉动次数 {n}；累计遗憾 {reg}。',
    s2term: '加成 c·√(2 ln t / n)：n 越小越大，随 t 缓慢增大，因此每台机器最终都会被再试。',
    s3k: '第 3 步 · 汤普森采样', s3t: '用概率分布表达「我有多不确定」',
    s3e: '这一步要回答：能不能直接用「信念」来选择？<strong>汤普森采样</strong>为每台机器维护一条 <strong>Beta 分布</strong>曲线，表示对它中奖概率的信念：起初是平的（什么都不知道，Beta(1,1)），每次中奖 α 加 1，每次没中 β 加 1。选择时从每台的曲线里各抽一个数，拉抽到最大的那台。拖动「已拉步数 t」（或自动播放）：曲线怎样从宽变窄，向真实概率（底部短竖线）靠拢；拉得多的机器曲线更窄。（一次固定随机种子的模拟。）',
    s3tL: '已拉步数 t', s3reset: '重置', cv3: '各台中奖概率的 Beta 分布',
    s3Cap: '第 {t} 步时各台中奖概率的信念（Beta 分布）', s3Ax: '中奖概率 0 → 1', s3Leg: '曲线 = 信念；底部短竖线 = 真实概率；曲线越窄越确定',
    s3ro: '已拉 <b>{t}</b> 步；各台 Beta 参数 α/β：{ab}；各台拉动次数 {n}；累计遗憾 {reg}。',
    s3term: 'Beta(α, β) = 看到 α−1 次中奖、β−1 次没中之后，对中奖概率的信念；均值 α/(α+β)。',
    s4k: '第 4 步 · 策略对比', s4t: '哪种策略的遗憾最少？',
    s4e: '这一步要回答：几种策略谁更省？图是平均累计遗憾（越低越好）。五台机器里一台的中奖概率是 0.5 + Δ，其余四台都是 0.5：Δ 是最好机器的优势。拖动 Δ：优势越小越难分辨，各条曲线怎样变化？拖动「总步数」看曲线增长是否放缓：遗憾曲线变平，说明已经锁定最好的机器。注意：UCB 的 c = 1 是教科书的取值，这里它在较短的时间内探索偏多；c = 0.3 在本页的设置里更省，但这只是本页这组机器上的现象，不构成保证。',
    s4gL: '最好机器的优势 Δ', s4hL: '总步数 T', s4reset: '重置', cv4: '五种策略的平均累计遗憾',
    s4Cap: '平均累计遗憾（Δ = {g}）', s4Ax: '步数 1 → {T}', s4G: '灰 = 贪心', s4E: '青 = ε=0.10', s4U: '绿 = UCB c=1', s4U3: '紫 = UCB c=0.3', s4T: '橙 = 汤普森',
    s4ro: 'Δ = <b>{g}</b>，T = {T}（{runs} 次模拟取平均）：累计遗憾——贪心 {a}，ε=0.10 为 {b}，UCB c=1 为 {u}，UCB c=0.3 为 {u3}，汤普森 {th}。',
    s4term: '所有结论都依赖机器的概率设置和模拟次数；曲线是 60 次模拟的平均，仍有随机涨落。',
    s5k: '第 5 步 · 终章', s5t: '收束：探索和利用之间的取舍',
    s5e: '多臂老虎机把「再试试」与「拉最好的」的矛盾量化成遗憾；几种策略只是用不同方式让不确定性随着次数缩小。',
    c1t: '看不见真实概率', c1b: '只能靠估计，次数少时估计很宽，遗憾衡量为此付出的代价（第 0 步）。',
    c2t: '纯贪心会锁死', c2b: '开局不走运就可能永远不再尝试好机器；ε 提供随机探索（第 1 步）。',
    c3t: '让不确定性指路', c3b: 'UCB 给拉得少的机器加成；汤普森采样从信念里抽样（第 2、3 步）。',
    c4t: '没有通用赢家', c4b: '常数 c、优势 Δ 和时间长度都会改变排名（第 4 步）。',
    modelT: '模型与局限',
    modelB: '每台机器是概率固定不变、相互独立的伯努利事件；真实场景（广告、临床试验）常有概率随时间变化、上下文信息和延迟反馈。遗憾需要知道真实概率，只能在模拟中计算。所有模拟使用固定随机种子，排名只对本页的机器设置成立。',
    linksT: '想从别处继续',
    link1: '蒙特卡洛 · 误差尺度：样本少时估计为什么那么宽', link2: '贝叶斯 · 连续版硬币：Beta 分布怎样随观测更新', link3: '中心极限定理 · 抽样实验室：均值估计的分布',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论'
  },
  en: {
    docTitle: 'Multi-Armed Bandits · Explore or Exploit', back: '← Knowledge Index', pageTitle: 'Multi-Armed Bandits · Explore or Exploit',
    tagline: 'Five machines that look alike, each with a payout rate you cannot see: pull a few by hand, then watch greedy, ε-greedy, UCB and Thompson sampling trade off “try more” against “pull the best”.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Probability & Statistics', stage: 'University',
    nav0: '0 Blind pulls', nav1: '1 Explore vs exploit', nav2: '2 UCB', nav3: '3 Thompson sampling', nav4: '4 Compare strategies', nav5: '5 Finale',
    arm: 'Machine {a}', pull: 'Pull {a}',
    s0k: 'Step 0 · Five machines, blind', s0t: 'Which slot machine is worth pulling?',
    s0e: 'This step answers: five identical-looking slot machines each have a different, hidden win probability; how do you win the most in a limited number of pulls? Each press of “Pull X” pulls that machine once and a win scores 1 point. The bars are your <strong>current estimate</strong> of the win rate = wins ÷ pulls, and the white vertical lines are a rough error range (about 95%, very wide for few pulls). Pull each machine a few times, then decide where to spend the rest. Press “Reveal true probabilities”: the red lines are the true probabilities, the green dashed line below is the expected score of pulling the best machine from the start, the orange line is your cumulative score, and the gap between them is the price you paid for searching (the <strong>regret</strong>). “New game” swaps in a different set of machines and starts over.',
    s0armsL: 'Choose a machine to pull', s0Reveal: 'Reveal true probabilities', s0Hide: 'Hide true probabilities', s0new: 'New game (new machines, clears all)', s0reset: 'Reset to the first game', cv0: 'Estimated win rates of five machines and the cumulative score',
    s0Est: 'Estimated win rate (red = true value)', s0Cum: 'Cumulative score (orange)', s0Ax: 'pulls → {n}', s0Ideal: 'green dashed = expected score of always pulling the best machine',
    s0Hidden: 'shown after reveal', s0Truth: 'True probabilities: {v}',
    s0ro: '<b>{tot}</b> pulls, {wins} wins ({rate}); the machine that looks best so far is {seen}. Expected regret: <b>{reg}</b>. {rv}',
    s0term: 'Regret = the sum over pulls of “the best machine’s true probability − the pulled machine’s true probability” (an expectation, not actual luck); it needs the true probabilities, so it is invisible in real use.',
    s1k: 'Step 1 · Explore versus exploit', s1t: 'Why does always pulling the current best lose out?',
    s1e: 'This step answers: is it enough to keep pulling whichever machine looks best? <strong>Greedy</strong> always pulls the highest estimate; with a bad start it can lock onto a second-best machine forever (it never “explores” the others). <strong>ε-greedy</strong> pulls a random machine with probability ε (exploring) and otherwise the highest estimate (exploiting). The chart shows average cumulative regret over 500 steps (average of 80 independent simulations; the machines’ true probabilities are 0.25 / 0.40 / 0.50 / 0.62 / 0.45). Drag ε with everything else fixed: how does the orange line change? The grey dashed line is ε = 0 (pure greedy) and the cyan dashed line ε = 0.10. Too small an ε explores too little; too large keeps wasting pulls on poor machines.',
    s1eL: 'Exploration probability ε', s1reset: 'Reset', cv1: 'Average cumulative regret for different ε',
    s1Cap: 'Average cumulative regret (lower is better)', s1Ax: 'steps 1 → {T}', s1G: 'grey dashed = pure greedy (ε=0)', s1E10: 'cyan dashed = ε=0.10', s1Cur: 'orange = current ε={e}',
    s1ro: 'ε = <b>{e}</b>: average cumulative regret after {T} steps: pure greedy {g}, ε = 0.10 gives {t10}, the current ε gives <b>{cur}</b> (smaller is better; best machine’s probability {pb}; average of {runs} simulations).',
    s1term: 'Average cumulative regret = the regret curves of many simulations averaged; a flatter curve means the best machine was found sooner.',
    s2k: 'Step 2 · Optimism under uncertainty', s2t: 'How can a rarely pulled machine get a chance?',
    s2e: 'This step answers: instead of coin flips, can we decide systematically whom to explore? <strong>UCB</strong> (upper confidence bound) adds an “optimism bonus” to every machine’s estimate: score = estimate + c·√(2·ln t / n), where t is the total number of pulls so far and n the number of pulls of this machine. A rarely pulled machine gets a large bonus and is tried; a often-pulled one gets a small bonus because its estimate is more trustworthy. c is the exploration weight (c = 1 is textbook UCB1). Drag “pulls so far t” or press “Auto play”: the short white bar is estimate + bonus, the white frame marks the machine chosen next; the bars are estimates and the red lines are the true probabilities. Then drag c: a larger c explores more, a small c is closer to greedy. (One simulation with a fixed random seed.)',
    s2tL: 'Pulls so far t', s2cL: 'Exploration weight c', s2play: '▶ Auto play', s2pause: '⏸ Pause', s2reset: 'Reset', cv2: 'Estimates, optimistic upper bounds and the next choice',
    s2Cap: 'Estimates and optimistic bounds at step {t}', s2Leg: 'coloured bar = estimate; white vertical line = about 95% error range; white bar = estimate + bonus; red line = true probability; white frame = machine chosen next',
    s2ro: 'c = {c}, <b>{t}</b> pulls so far: next choice <b>{next}</b>; highest “estimate + bonus” {ub}; pulls per machine {n}; cumulative regret {reg}.',
    s2term: 'Bonus c·√(2 ln t / n): larger for small n and slowly growing with t, so every machine eventually gets retried.',
    s3k: 'Step 3 · Thompson sampling', s3t: 'Use a distribution to express “how unsure am I”',
    s3e: 'This step answers: can we choose directly from “beliefs”? <strong>Thompson sampling</strong> keeps a <strong>Beta distribution</strong> curve for every machine, expressing the belief about its win probability: at first it is flat (knowing nothing, Beta(1,1)); each win adds 1 to α and each loss adds 1 to β. To choose, draw one number from every curve and pull the machine with the largest draw. Drag “pulls so far t” (or auto play): how do the curves narrow and move toward the true probabilities (short ticks at the bottom)? A machine pulled more has a narrower curve. (One simulation with a fixed random seed.)',
    s3tL: 'Pulls so far t', s3reset: 'Reset', cv3: 'Beta distributions of each machine’s win probability',
    s3Cap: 'Beliefs about each machine’s win probability at step {t}', s3Ax: 'win probability 0 → 1', s3Leg: 'curve = belief; short tick at the bottom = true probability; narrower = more certain',
    s3ro: '<b>{t}</b> pulls so far; Beta parameters α/β per machine: {ab}; pulls per machine {n}; cumulative regret {reg}.',
    s3term: 'Beta(α, β) = the belief about the win probability after seeing α−1 wins and β−1 losses; its mean is α/(α+β).',
    s4k: 'Step 4 · Comparing strategies', s4t: 'Which strategy has the least regret?',
    s4e: 'This step answers: which strategy is cheapest? The chart shows average cumulative regret (lower is better). One of the five machines wins with probability 0.5 + Δ and the other four with 0.5: Δ is the best machine’s advantage. Drag Δ: the smaller the advantage the harder it is to tell, so how do the curves change? Drag “total steps” and see whether the curves’ growth slows: a flattening regret curve means the best machine has been locked in. Note: UCB with c = 1 is the textbook value and over-explores over this shorter time; c = 0.3 is cheaper in this setup, but that is only what happens with this set of machines and is no guarantee.',
    s4gL: 'Best machine’s advantage Δ', s4hL: 'Total steps T', s4reset: 'Reset', cv4: 'Average cumulative regret of five strategies',
    s4Cap: 'Average cumulative regret (Δ = {g})', s4Ax: 'steps 1 → {T}', s4G: 'grey = greedy', s4E: 'cyan = ε=0.10', s4U: 'green = UCB c=1', s4U3: 'purple = UCB c=0.3', s4T: 'orange = Thompson',
    s4ro: 'Δ = <b>{g}</b>, T = {T} (average of {runs} simulations): cumulative regret — greedy {a}, ε=0.10 gives {b}, UCB c=1 gives {u}, UCB c=0.3 gives {u3}, Thompson {th}.',
    s4term: 'Every conclusion depends on the machines’ probabilities and the number of simulations; the curves average 60 simulations and still fluctuate.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: the trade-off between exploring and exploiting',
    s5e: 'The bandit problem quantifies the conflict between “try more” and “pull the best” as regret; the strategies just shrink uncertainty in different ways as pulls accumulate.',
    c1t: 'True probabilities are hidden', c1b: 'Only estimates are available, wide for few pulls; regret measures the price paid for that (step 0).',
    c2t: 'Pure greedy can lock in', c2b: 'A bad start may mean never trying the good machine again; ε adds random exploration (step 1).',
    c3t: 'Let uncertainty point the way', c3b: 'UCB boosts rarely pulled machines; Thompson sampling draws from beliefs (steps 2 and 3).',
    c4t: 'No universal winner', c4b: 'The constant c, the advantage Δ and the horizon all change the ranking (step 4).',
    modelT: 'Model and limits',
    modelB: 'Each machine is an independent Bernoulli event with a fixed probability; real settings (advertising, clinical trials) often have probabilities that drift, context information and delayed feedback. Regret needs the true probabilities and can only be computed in simulation. All simulations use fixed random seeds, and rankings hold only for the machine settings on this page.',
    linksT: 'Continue elsewhere',
    link1: 'Monte Carlo · error scale: why estimates are so wide with few samples', link2: 'Bayes · continuous coin: how a Beta distribution updates with observations', link3: 'Central limit theorem · sampling lab: the distribution of a sample mean',
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
