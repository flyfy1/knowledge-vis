const STR = {
  zh: {
    docTitle: '大语言模型如何逐词生成 · 概率、温度与采样', back: '← 知识索引', pageTitle: '大语言模型如何逐词生成',
    tagline: '每一步都是一张概率条：温度把它捏尖或摊平，top-k / top-p 砍掉长尾，再随机抽一个词，一个接一个写下去。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 下一词概率', nav1: '1 温度', nav2: '2 截断长尾', nav3: '3 抽样', nav4: '4 逐词生成', nav5: '5 终章',
    ctxL: '提示',
    s0k: '第 0 步 · 下一个词的概率', s0t: '模型每一步到底输出什么？',
    s0e: '这一步要回答：大语言模型写下一个词之前，手里拿着什么？它先给每个候选词一个分数（<strong>logit</strong>，可正可负），再用 softmax 把分数变成加起来等于 1 的<strong>概率</strong>。本页为每个提示手工设定了 10 个候选词的分数（不是真实模型的输出）。切换提示：看分数（淡色柱）怎样变成概率（亮柱）；「法国的首都是」里一个词占绝大多数，「今天的天气是」则有好几个词势均力敌。读数里的<strong>熵</strong>衡量分布有多分散，「等效选项数」= 2^熵，约等于有几个词在认真竞争。',
    s0reset: '重置提示', cv0: '候选词的分数与概率',
    s0Prompt: '提示：{p}', s0Log: '分数 logit（淡色）', s0P: '概率 softmax（亮色，单位 %）',
    s0ro: '概率最大的是「<b>{top}</b>」，<b>{p}</b>；熵 <b>{h}</b> 比特，等效选项数约 <b>{n}</b>；10 个概率之和 {s}。',
    s0term: 'softmax：p_i = e^(z_i) / Σ e^(z_j)；熵 H = −Σ p·log₂p（比特），分布越平越大。',
    s1k: '第 1 步 · 温度', s1t: '温度怎样把分布捏尖或摊平？',
    s1e: '这一步要回答：同一组分数，怎样让模型更保守或更大胆？<strong>温度</strong> T 先把每个分数除以 T 再做 softmax：p_i ∝ e^(z_i/T)。拖动 T，提示不变：看亮柱相对虚线框（T = 1 的分布）怎样变化。T 小，概率向第一名集中，T → 0 就是每次选最高分（贪心）；T 大，分布趋于平均。读数给出第一名的概率、熵和等效选项数。',
    s1TL: '温度 T', s1reset: '重置温度', cv1: '不同温度下的概率分布',
    s1Cap: '温度 T = {T} 下的概率', s1Leg: '亮柱 = 当前温度；白色虚线框 = T = 1；数字单位 %',
    s1ro: 'T = {T}：最可能的是「<b>{top}</b>」，<b>{p}</b>；熵 <b>{h}</b> 比特，等效选项数约 <b>{n}</b>。',
    s1term: 'T < 1 让分布更尖，T > 1 让分布更平，T = 1 是模型原样。温度只改变分布形状，不增加模型的知识。',
    s2k: '第 2 步 · 截断长尾', s2t: '怎样砍掉不靠谱的长尾？',
    s2e: '这一步要回答：除了温度，还有什么办法避免偶尔抽到离谱的词？<strong>Top-k</strong> 只保留概率最高的 k 个词；<strong>Top-p</strong>（核采样）保留累计概率刚好达到 p 的最少几个词。被砍掉的词概率设为 0，剩下的重新归一，使总和仍为 1。本页顺序：先温度，再 top-k，再 top-p。拖动 k 或 p：灰柱是被砍掉的词，彩柱是重新归一后的概率，虚线框是砍之前的概率；留意读数里「覆盖的原始概率」。先把 T 调高，再收紧 p，看尾部怎样被截掉。',
    s2TL: '温度 T', s2kL: 'top-k 的 k', s2pL: 'top-p 的 p', s2reset: '重置截断', cv2: '截断并重新归一后的概率',
    s2Cap: '截断并归一后（灰 = 被砍掉）', s2Leg: '彩柱 = 截断后；白色虚线框 = 截断前；数字单位 %',
    s2ro: 'T = {T}，k = {k}，p = {p}：保留 <b>{kept}</b> 个词，覆盖原始概率 <b>{mass}</b>；截断后熵 <b>{h}</b> 比特。',
    s2term: '覆盖的原始概率 = 被保留词在截断前的概率之和；越小说明砍得越狠。',
    s3k: '第 3 步 · 抽样', s3t: '抽多少次，频率才像概率？',
    s3e: '这一步要回答：模型每次只抽一个词，抽很多次后会怎样？按钮按当前分布（温度 T 与 top-p 处理后的概率，白色横线）随机抽样，彩柱是已抽到的频率。随机种子固定，同样的按钮序列会得到同样的结果。抽 1 次几乎看不出规律，抽 1000 次频率就贴近概率。读数里的<strong>总变差距离</strong> TV = ½Σ|频率 − 概率|，衡量两个分布还差多少（0 = 完全相同，越小越好）。注意：改动 T、p 或提示会清空已抽的次数，页面会提示。',
    s3TL: '温度 T', s3pL: 'top-p 的 p', s3d1: '抽 1 次', s3d100: '抽 100 次', s3d1000: '抽 1000 次', s3reset: '清空抽样并重置设置', cv3: '抽样频率与目标概率',
    s3Cap: '已抽 {n} 次的频率', s3Leg: '彩柱 = 频率；白线 = 当前设置下的概率；白框 = 最后一次抽到的词；纵轴按当前最高的一根缩放（最高 {m}）',
    s3Notice: '（设置已改变，之前抽的次数已清空。）',
    s3ro: '已抽 <b>{n}</b> 次；最后抽到「{last}」；TV 距离 <b>{tv}</b>。{note}',
    s3term: '频率 = 该词被抽到的次数 / 总次数；TV 大致随抽样次数增大按 1/√N 下降（来自随机涨落）。',
    s4k: '第 4 步 · 逐词生成', s4t: '一个词接一个词，句子怎么长出来？',
    s4e: '这一步要回答：把「每次抽一个词」重复下去，会写出什么？下面是手工设定的迷你模型，只看上一个词来决定下一个词的概率（真实模型会看整段上文）。按「下一个词」或「连抽 12 个词」，序列从「这」开始往后长；柱图是当前这一步的下一词概率，白框是刚抽到的词。试试 T = 0.1：几乎每次选最高分，句子很快陷入循环，重复率升高；T = 3：句子散成乱序。读数里的<strong>重复率</strong> = 序列中重复出现的三词组占全部三词组的比例。「换随机种子」会清空当前句子，从另一条随机路径重新开始。',
    s4TL: '温度 T', s4next: '下一个词', s4gen: '连抽 12 个词', s4seed: '换随机种子（清空句子）', s4reset: '重置温度与句子', cv4: '当前一步的下一词概率与已生成的序列',
    s4Cap: '在「{w}」之后的下一个词概率（T = {T}）',
    s4ro: '序列长 <b>{len}</b>，用到 {d} 种词，重复率 <b>{rep}</b>；下一步最可能是「{top}」（{tp}）；随机种子 {seed}。',
    s4term: '这个迷你模型只看上一个词；序列少于 3 个词时重复率没有意义（按 0 显示）。',
    s5k: '第 5 步 · 终章', s5t: '收束：分数 → 概率 → 截断 → 抽一个',
    s5e: '语言模型每一步都做同样的事：给候选词打分，用温度和截断整形，再抽一个词接上去。',
    c1t: '分数变概率', c1b: 'softmax 把任意分数变成和为 1 的概率；熵告诉你有几个词在竞争（第 0 步）。',
    c2t: '温度整形', c2b: 'T 小更保守，T 大更随机；只改变形状，不增加知识（第 1 步）。',
    c3t: '截断长尾', c3b: 'top-k 和 top-p 砍掉低概率词再归一，代价是多样性变少（第 2 步）。',
    c4t: '抽样与累积', c4b: '一次抽样是随机的，很多次后频率贴近概率；一个词接一个词，低温会循环（第 3、4 步）。',
    modelT: '模型与局限',
    modelB: '所有分数都是手工设定的，不是真实模型的输出；第 4 步的迷你模型只看上一个词。真实模型的词表有数万个词，会看整段上文，还常使用重复惩罚等其他手段。温度和截断只改变分布的形状，不会让答案更「真实」。抽样用固定的伪随机种子。',
    linksT: '想从别处继续',
    link1: '熵 · 熵工坊：读数里的「熵」与等效选项数', link2: '注意力机制 · 分数变权重：softmax 与锐度（温度的倒数）', link3: '蒙特卡洛 · 比例即概率：抽很多次，频率逼近概率',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论',
c0p: '今天的天气是___', c1p: '她倒了一杯___', c2p: '法国的首都是___', c0w0: '晴朗', c0w1: '下雨', c0w2: '多云', c0w3: '炎热', c0w4: '寒冷', c0w5: '不错', c0w6: '有风', c0w7: '有雾', c0w8: '下雪', c0w9: '奇怪', c1w0: '茶', c1w1: '咖啡', c1w2: '水', c1w3: '牛奶', c1w4: '果汁', c1w5: '汤', c1w6: '葡萄酒', c1w7: '米饭', c1w8: '沙子', c1w9: '雷声', c2w0: '巴黎', c2w1: '里昂', c2w2: '伦敦', c2w3: '罗马', c2w4: '柏林', c2w5: '法国', c2w6: '一个', c2w7: '大', c2w8: '美丽', c2w9: '奶酪', w_the: '这', w_cat: '猫', w_dog: '狗', w_sat: '坐', w_ran: '跑', w_on: '在', w_to: '到', w_mat: '垫', w_park: '公园', w_dot: '。'
  },
  en: {
    docTitle: 'How an LLM Writes Word by Word · Probability, Temperature and Sampling', back: '← Knowledge Index', pageTitle: 'How an LLM Writes Word by Word',
    tagline: 'Every step is a probability bar chart: temperature sharpens or flattens it, top-k and top-p trim the tail, then one word is drawn at random and appended, again and again.',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Next-word odds', nav1: '1 Temperature', nav2: '2 Trimming the tail', nav3: '3 Sampling', nav4: '4 Word by word', nav5: '5 Finale',
    ctxL: 'Prompt',
    s0k: 'Step 0 · The next-word probabilities', s0t: 'What does the model actually output at each step?',
    s0e: 'This step answers: what does a language model hold in its hands before writing the next word? It first gives every candidate word a score (a <strong>logit</strong>, positive or negative) and then uses softmax to turn the scores into <strong>probabilities</strong> that add up to 1. This page hand-sets the scores of 10 candidate words for each prompt (they are not real model outputs). Switch the prompt and watch the scores (pale bars) turn into probabilities (bright bars): after “The capital of France is” one word takes almost everything, while after “The weather today is” several words are neck and neck. The <strong>entropy</strong> in the readout measures how spread out the distribution is, and the “effective number of options” = 2^entropy is roughly how many words are seriously competing.',
    s0reset: 'Reset prompt', cv0: 'Scores and probabilities of the candidate words',
    s0Prompt: 'Prompt: {p}', s0Log: 'scores (logits, pale)', s0P: 'probabilities (softmax, bright, unit %)',
    s0ro: 'The most probable word is “<b>{top}</b>” at <b>{p}</b>; entropy <b>{h}</b> bits, effective number of options about <b>{n}</b>; the 10 probabilities sum to {s}.',
    s0term: 'Softmax: p_i = e^(z_i) / Σ e^(z_j); entropy H = −Σ p·log₂p (bits), larger the flatter the distribution.',
    s1k: 'Step 1 · Temperature', s1t: 'How does temperature sharpen or flatten the distribution?',
    s1e: 'This step answers: given the same scores, how do we make the model more cautious or more adventurous? The <strong>temperature</strong> T divides every score by T before softmax: p_i ∝ e^(z_i/T). Drag T with the prompt fixed: see how the bright bars change against the dashed outline (the T = 1 distribution). A small T concentrates probability on the top word, and T → 0 means always picking the highest score (greedy); a large T flattens the distribution. The readout gives the top word’s probability, the entropy and the effective number of options.',
    s1TL: 'Temperature T', s1reset: 'Reset temperature', cv1: 'The probability distribution at different temperatures',
    s1Cap: 'Probabilities at temperature T = {T}', s1Leg: 'bright bars = current temperature; white dashed outline = T = 1; numbers in %',
    s1ro: 'T = {T}: the most likely word is “<b>{top}</b>” at <b>{p}</b>; entropy <b>{h}</b> bits, effective number of options about <b>{n}</b>.',
    s1term: 'T < 1 sharpens the distribution, T > 1 flattens it, T = 1 is the model as it is. Temperature changes only the shape; it adds no knowledge.',
    s2k: 'Step 2 · Trimming the tail', s2t: 'How do we cut off the unreliable long tail?',
    s2e: 'This step answers: besides temperature, how do we avoid occasionally drawing an absurd word? <strong>Top-k</strong> keeps only the k most probable words; <strong>top-p</strong> (nucleus sampling) keeps the fewest words whose cumulative probability just reaches p. Removed words get probability 0 and the rest are renormalised so the total is 1 again. The order on this page: temperature first, then top-k, then top-p. Drag k or p: grey bars are removed words, coloured bars are the renormalised probabilities, and the dashed outline is the probability before trimming; watch “original probability covered” in the readout. Raise T first, then tighten p, to see the tail being cut.',
    s2TL: 'Temperature T', s2kL: 'k for top-k', s2pL: 'p for top-p', s2reset: 'Reset trimming', cv2: 'Probabilities after trimming and renormalising',
    s2Cap: 'After trimming (grey = removed)', s2Leg: 'coloured = after trimming; white dashed outline = before trimming; numbers in %',
    s2ro: 'T = {T}, k = {k}, p = {p}: <b>{kept}</b> word(s) kept, covering <b>{mass}</b> of the original probability; entropy after trimming <b>{h}</b> bits.',
    s2term: 'Original probability covered = the sum of the kept words’ probabilities before trimming; the smaller, the harsher the cut.',
    s3k: 'Step 3 · Sampling', s3t: 'How many draws until frequencies look like probabilities?',
    s3e: 'This step answers: the model draws just one word at a time, so what happens after many draws? The buttons draw at random from the current distribution (the probabilities after temperature T and top-p, the white ticks) and the coloured bars show the frequencies drawn so far. The random seed is fixed, so the same sequence of button presses gives the same result. One draw shows almost no pattern; after 1000 draws the frequencies hug the probabilities. The <strong>total variation distance</strong> TV = ½Σ|frequency − probability| in the readout measures how far apart the two distributions still are (0 = identical, smaller is better). Note: changing T, p or the prompt clears the draws so far, and the page tells you so.',
    s3TL: 'Temperature T', s3pL: 'p for top-p', s3d1: 'Draw 1', s3d100: 'Draw 100', s3d1000: 'Draw 1000', s3reset: 'Clear draws and reset settings', cv3: 'Sampled frequencies against the target probabilities',
    s3Cap: 'Frequencies after {n} draws', s3Leg: 'coloured = frequency; white tick = probability under current settings; white frame = last word drawn; vertical axis scaled to the tallest bar (top value {m})',
    s3Notice: '(Settings changed, so the earlier draws were cleared.)',
    s3ro: '<b>{n}</b> draws so far; last word drawn: “{last}”; TV distance <b>{tv}</b>. {note}',
    s3term: 'Frequency = times a word was drawn / total draws; TV falls roughly like 1/√N as draws grow (random fluctuation).',
    s4k: 'Step 4 · Word by word', s4t: 'One word after another: how does a sentence grow?',
    s4e: 'This step answers: what gets written when “draw one word” is repeated? Below is a hand-set mini model that looks only at the previous word to decide the next word’s probabilities (real models look at the whole preceding text). Press “Next word” or “Draw 12 words”; the sequence grows from “the”, the bars show the next-word probabilities for the current step, and the white frame marks the word just drawn. Try T = 0.1: it nearly always takes the top score and the sentence soon falls into a loop, so the repeat rate rises; at T = 3 the sentence scatters into disorder. The <strong>repeat rate</strong> in the readout = repeated three-word groups as a fraction of all three-word groups in the sequence. “New random seed” clears the current sentence and starts another random path.',
    s4TL: 'Temperature T', s4next: 'Next word', s4gen: 'Draw 12 words', s4seed: 'New random seed (clears the sentence)', s4reset: 'Reset temperature and sentence', cv4: 'Next-word probabilities at the current step and the generated sequence',
    s4Cap: 'Next-word probabilities after “{w}” (T = {T})',
    s4ro: 'Sequence length <b>{len}</b>, {d} distinct words, repeat rate <b>{rep}</b>; most likely next: “{top}” ({tp}); random seed {seed}.',
    s4term: 'This mini model looks only at the previous word; the repeat rate is meaningless below 3 words (shown as 0).',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: score → probability → trim → draw one',
    s5e: 'A language model does the same thing at every step: score the candidate words, shape the scores with temperature and trimming, then draw one word and append it.',
    c1t: 'Scores to probabilities', c1b: 'Softmax turns any scores into probabilities that sum to 1; entropy says how many words compete (step 0).',
    c2t: 'Temperature shapes', c2b: 'Small T is more cautious, large T more random; it changes the shape and adds no knowledge (step 1).',
    c3t: 'Trim the tail', c3b: 'Top-k and top-p remove low-probability words and renormalise, at the cost of less variety (step 2).',
    c4t: 'Draws accumulate', c4b: 'One draw is random, many draws approach the probabilities; word by word, low temperature loops (steps 3 and 4).',
    modelT: 'Model and limits',
    modelB: 'All scores are hand-set and are not outputs of a real model; the mini model in step 4 looks only at the previous word. Real models have vocabularies of tens of thousands of words, read the whole preceding text, and often use other tricks such as repetition penalties. Temperature and trimming only reshape the distribution and do not make an answer more “true”. Sampling uses fixed pseudo-random seeds.',
    linksT: 'Continue elsewhere',
    link1: 'Entropy · entropy workshop: the “entropy” and effective number of options in the readouts', link2: 'Attention · scores to weights: softmax and sharpness (the inverse of temperature)', link3: 'Monte Carlo · proportion is probability: draw many times and frequency approaches probability',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result',
c0p: 'The weather today is ___', c1p: 'She poured a cup of ___', c2p: 'The capital of France is ___', c0w0: 'sunny', c0w1: 'rainy', c0w2: 'cloudy', c0w3: 'hot', c0w4: 'cold', c0w5: 'nice', c0w6: 'windy', c0w7: 'foggy', c0w8: 'snowy', c0w9: 'strange', c1w0: 'tea', c1w1: 'coffee', c1w2: 'water', c1w3: 'milk', c1w4: 'juice', c1w5: 'soup', c1w6: 'wine', c1w7: 'rice', c1w8: 'sand', c1w9: 'thunder', c2w0: 'Paris', c2w1: 'Lyon', c2w2: 'London', c2w3: 'Rome', c2w4: 'Berlin', c2w5: 'France', c2w6: 'a', c2w7: 'big', c2w8: 'beautiful', c2w9: 'cheese', w_the: 'the', w_cat: 'cat', w_dog: 'dog', w_sat: 'sat', w_ran: 'ran', w_on: 'on', w_to: 'to', w_mat: 'mat', w_park: 'park', w_dot: '.'
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
