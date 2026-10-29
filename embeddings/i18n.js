const STR = {
  zh: {
    docTitle: '词向量 · 把词摆成地图', back: '← 知识索引', pageTitle: '词向量 · 把词摆成地图',
    tagline: '一个词怎样变成一串数字？数字怎样衡量相似、做类比，机器又怎样不靠手工特征，从「常和谁在一起」里学出它们。',
    navLabel: '步骤导航', languageLabel: '语言', category: '计算与智能 / Computing & AI', stage: '大学 / University',
    nav0: '0 词变成数', nav1: '1 衡量相似', nav2: '2 类比算术', nav3: '3 最近的词', nav4: '4 看它的邻居', nav5: '5 终章',
    dim0: '性别（男 −1 … 女 +1）', dim1: '王室（0 否 … 1 是）', dim2: '年龄（儿童 0 … 成人 1）', dim3: '人类（0 否 1 是）', dim4: '生物（0 否 1 是）',
    dimS0: '性别', dimS1: '王室', dimS2: '年龄', dimS3: '人类', dimS4: '生物',
    s0k: '第 0 步 · 词变成数', s0t: '一串数字怎样代表一个词？',
    s0e: '这一步要回答：为什么说「词可以变成一串数字，而且数字的位置有意义」？<strong>词向量（embedding）</strong>就是给每个词配一个固定长度的数字列表。本页先用手工设定的玩具特征：每个词 5 个数——性别、王室、年龄、是否人类、是否生物。选两个特征当横轴和纵轴，词就变成平面上的点：把横轴设为「性别」、纵轴设为「王室」，看 king 与 queen、man 与 woman 怎样对称；再换别的轴，看哪些词重合。选一个词，读出它的完整向量。真实的词向量由机器从大量文本里学出来，维度没有这样清楚的名字；这里的手工特征只是为了看清思路。',
    s0xL: '横轴', s0yL: '纵轴', s0wL: '查看的词', s0reset: '重置选择', cv0: '词在所选两个特征平面上的位置',
    s0Same: '白圈 = 所选词；重叠的词错开标注',
    s0ro: '「{w}」的向量 = <b>{v}</b>；横轴「{x}」、纵轴「{y}」；这个位置上共有 <b>{n}</b> 个词（重叠说明这两个特征分不开它们）。',
    s0term: '向量 = 一列有顺序的数；每个位置称为一个维度。',
    s1k: '第 1 步 · 衡量相似', s1t: '怎样衡量两个词有多相似？',
    s1e: '这一步要回答：两个词向量「像不像」，用什么量来比？<strong>点积</strong> A·B 是各维乘积之和（下图第三行的柱子相加）；<strong>余弦相似度</strong> cos = A·B / (|A||B|) 只看两个向量的夹角，范围 −1 到 1，与长度无关；<strong>欧氏距离</strong>是两个向量端点之间的直线距离，受长度影响。选词 A、词 B，再拖动「放大 B」：保持 A 不变，看 B 的柱子整体变高，余弦相似度纹丝不动，而距离在变。最下方是 A 与所有词的余弦相似度（橙色 = 你选的 B）。',
    s1aL: '词 A', s1bL: '词 B', s1kL: '放大 B（倍）', s1reset: '重置', cv1: '词 A、词 B 的维度柱、逐维乘积与相似度排名',
    s1A: '词 A：{w}（5 个维度）', s1B: '词 B：{w} ×{k}', s1P: '逐维乘积 A·B（柱子相加 = 点积）', s1Nn: '与「{w}」最相似的词（余弦，橙 = 词 B）',
    s1ro: '「{a}」与「{b}」×{k}：点积 {dot}；|A| = {na}，|B| = {nb}；余弦 <b>{cos}</b>；欧氏距离 <b>{d}</b>。',
    s1term: '|A| = 向量长度 = √(各维平方和)。余弦为 1 表示方向相同，0 表示垂直，−1 表示相反。',
    s2k: '第 2 步 · 类比算术', s2t: 'king − man + woman 为什么会得到 queen？',
    s2e: '这一步要回答：向量做加减，为什么能做类比？每个词在图上是一个点。king 与 man 的差（橙色实线箭头）表示「从普通人变成王室」这个方向；把这个箭头平移到 woman（橙色虚线），终点就是 woman 加上同样的「王室」变化，正好落在 queen。公式：结果 = A − λ·B + λ·C（λ = 1 是完整类比）。选三个词，再拖 λ：白点沿着从 A 到答案的路走，读数里是离它最近（余弦最大）的词；注意走得不够远时最近的词可能是 prince，走完整个箭头才是 queen。输入的三个词不参与候选（常见做法，否则答案常常就是输入词本身）。图只画前两个维度，最近的词按全部 5 个维度计算。',
    s2aL: 'A（起点）', s2bL: 'B（减去）', s2cL: 'C（加上）', s2lL: '走多远 λ', s2reset: '重置', cv2: '类比箭头与结果点',
    s2Res: '结果', s2ResOff: '结果（超出图范围）', s2Cap: '实线 = A−B；虚线 = 平移到 C；横轴性别，纵轴王室',
    s2ro: '结果 = {a} − {l}×{b} + {l}×{c} = <b>{v}</b>；最近的词是「<b>{top}</b>」（余弦 {cs}），第二名「{second}」。',
    s2term: 'λ 是页面为了让你看清过程加的「走多远」系数，不属于模型；标准类比取 λ = 1。',
    s3k: '第 3 步 · 最近的词', s3t: '如果「正确答案」不在词表里呢？',
    s3e: '这一步要回答：类比算术给出的究竟是什么？它先给出一个<strong>点</strong>，再由页面在词表里找离它最近的词。用勾选框决定词表里有哪些词，固定算 king − man + woman：先取消 queen，看答案变成谁、余弦有多高；再取消 princess、girl，继续观察。柱高是各候选词与结果点的余弦。结论：答案取决于词表，并不等于「真相」；余弦再高也只说明方向接近。（king、man、woman 三个输入词不参与候选。）',
    s3vL: '词表（勾选 = 在词表里）', s3reset: '恢复全部词', cv3: 'king − man + woman 在当前词表下的候选词',
    s3Cap: 'king − man + woman 的候选词（余弦）', s3In: '输入词', s3Out: '不在词表', s3Ans: '答案：{w}', s3None: '词表里没有候选词', s3Has: '词表里有 queen，答案就是完整类比的结果。', s3Miss: 'queen 不在词表里，答案只是最近的替代词。',
    s3ro: '词表共 {n} 个词；答案「<b>{top}</b>」，余弦 <b>{cs}</b>。{miss}',
    s3term: '候选词 = 词表中除三个输入词以外的词；余弦只比较方向，不衡量「对不对」。',
    s4k: '第 4 步 · 看它的邻居', s4t: '没有人手工写特征，向量从哪来？',
    s4e: '这一步要回答：机器怎样自己得到词向量？核心想法是「看一个词常和谁出现在一起」。下面是只有 14 句话的迷你语料。拖动「读到第几句」（或按「逐句阅读」）：每读一句，就在表里给相邻的词对加 1。<strong>窗口</strong> = 一个词左右各多远算「相邻」（句子只有 3 个词，所以窗口大于 2 不再有变化）。每一行是一个目标词的<strong>共现计数向量</strong>（列是各个邻居词），用第 1 步的余弦比较两行：邻居最像的就是最相似的词。选目标词、改窗口，观察下方柱子。这里直接用原始计数，不是真正的训练；真实的 word2vec、GloVe 等方法在海量语料上把这类统计压成几百维的稠密向量。',
    s4tL: '目标词', s4kL: '读到第几句', s4winL: '窗口大小', s4play: '▶ 逐句阅读', s4pause: '⏸ 暂停', s4reset: '重置', cv4: '共现计数表与相似度排名',
    s4Cap: '共现计数：行 = 目标词，列 = 邻居词', s4Sim: '与「{w}」邻居计数的余弦',
    s4ro: '读到第 <b>{k} / {n}</b> 句，窗口 {win}：与「{w}」邻居最相似的词是「<b>{top}</b>」（余弦 {cs}）。读 0 句时没有计数，显示 —。',
    s4term: '共现计数 = 两个词在窗口内一起出现的次数；邻居分布完全相同的两个词余弦为 1。语料很小，这只是演示。',
    s5k: '第 5 步 · 终章', s5t: '收束：把词摆成可计算的地图',
    s5e: '词向量把词变成可以量距离、做加减的数字；本页从手工特征走到「看邻居」，说明这些数字既可以设计，也可以从文本里学出来。',
    c1t: '词 = 一列数', c1b: '每个维度一个数，词成为空间里的点（第 0 步；本页是手工特征）。',
    c2t: '余弦看方向', c2b: '余弦只比较方向，与长度无关；欧氏距离同时受长度影响（第 1 步）。',
    c3t: '类比 = 加减 + 找最近', c3b: '向量加减给出一个点，答案是词表里最近的词，取决于词表（第 2、3 步）。',
    c4t: '向量可以学出来', c4b: '统计「谁和谁常一起出现」，邻居相似的词向量就相似（第 4 步）。',
    modelT: '模型与局限',
    modelB: '第 0–3 步是手工设定的 5 维玩具特征，每个轴都有名字；真实词向量有几百维，轴没有清楚的含义，类比也并不总是成立，并且会学到语料里的偏见。第 4 步只是原始共现计数加余弦，不是 word2vec 或 GloVe 的训练过程；迷你语料只有 14 句，结论仅作演示。',
    linksT: '想从别处继续',
    link1: '注意力机制 · 查询与键：词向量进入模型之后怎样彼此打分', link2: '线性变换 · 基向量记账：向量怎样被矩阵变成新向量', link3: '特征向量 · 主成分：把高维向量压到二维来看',
    foot: '首版由 Claude Sonnet（经 Mini Claude Code）生成 · 未经独立评审 · 教学示意，不是研究结论',
w_man: '男人', w_woman: '女人', w_boy: '男孩', w_girl: '女孩', w_king: '国王', w_queen: '王后', w_apple: '苹果', w_cat: '猫', w_prince: '王子', w_princess: '公主', w_dog: '狗', w_bread: '面包', w_eats: '吃', w_runs: '跑', w_home: '家', w_tastes: '尝起来', w_sweet: '甜', w_fresh: '新鲜', w_rules: '统治', w_land: '土地', w_wears: '戴', w_crown: '王冠', w_purrs: '呼噜', w_softly: '轻轻地', w_barks: '汪汪叫', w_loudly: '大声地'
  },
  en: {
    docTitle: 'Word Embeddings · Words as a Map', back: '← Knowledge Index', pageTitle: 'Word Embeddings · Words as a Map',
    tagline: 'How does a word become a list of numbers? How do the numbers measure similarity and solve analogies, and how can a machine learn them from “who a word keeps company with” instead of hand-made features?',
    navLabel: 'Step navigation', languageLabel: 'Language', category: 'Computing & AI', stage: 'University',
    nav0: '0 Words as numbers', nav1: '1 Measuring similarity', nav2: '2 Analogy arithmetic', nav3: '3 Nearest word', nav4: '4 Look at neighbours', nav5: '5 Finale',
    dim0: 'gender (male −1 … female +1)', dim1: 'royalty (0 no … 1 yes)', dim2: 'age (child 0 … adult 1)', dim3: 'human (0 no, 1 yes)', dim4: 'alive (0 no, 1 yes)',
    dimS0: 'gender', dimS1: 'royalty', dimS2: 'age', dimS3: 'human', dimS4: 'alive',
    s0k: 'Step 0 · Words as numbers', s0t: 'How can a list of numbers stand for a word?',
    s0e: 'This step answers: why can a word be turned into a list of numbers whose positions carry meaning? A <strong>word embedding</strong> gives every word a fixed-length list of numbers. This page starts with hand-set toy features: five numbers per word for gender, royalty, age, human and alive. Pick two features as the horizontal and vertical axes and the words become points on a plane: set the horizontal axis to “gender” and the vertical axis to “royalty” and see how king/queen and man/woman mirror each other; then change axes and see which words land on top of each other. Pick a word to read its full vector. Real embeddings are learned by machines from large amounts of text and their dimensions have no such tidy names; the hand-set features are only here to make the idea visible.',
    s0xL: 'Horizontal axis', s0yL: 'Vertical axis', s0wL: 'Word to inspect', s0reset: 'Reset choices', cv0: 'Positions of the words on the plane of the two chosen features',
    s0Same: 'white ring = selected word; overlapping words are offset',
    s0ro: 'The vector of “{w}” = <b>{v}</b>; horizontal “{x}”, vertical “{y}”; <b>{n}</b> word(s) sit at this position (overlap means these two features cannot tell them apart).',
    s0term: 'Vector = an ordered list of numbers; each position is called a dimension.',
    s1k: 'Step 1 · Measuring similarity', s1t: 'How do we measure how similar two words are?',
    s1e: 'This step answers: which quantity tells us whether two word vectors are alike? The <strong>dot product</strong> A·B is the sum of the per-dimension products (the bars in the third row below added up). The <strong>cosine similarity</strong> cos = A·B / (|A||B|) looks only at the angle between the vectors, runs from −1 to 1 and ignores length. The <strong>Euclidean distance</strong> is the straight-line distance between the vectors’ endpoints and does depend on length. Pick word A and word B, then drag “scale B” with A fixed: B’s bars grow, the cosine does not move at all, and the distance changes. At the bottom is the cosine of A with every word (orange = the B you picked).',
    s1aL: 'Word A', s1bL: 'Word B', s1kL: 'Scale B (times)', s1reset: 'Reset', cv1: 'Dimension bars of words A and B, per-dimension products and the similarity ranking',
    s1A: 'Word A: {w} (5 dimensions)', s1B: 'Word B: {w} ×{k}', s1P: 'Per-dimension product A·B (bars added up = dot product)', s1Nn: 'Words most similar to “{w}” (cosine; orange = word B)',
    s1ro: '“{a}” and “{b}” ×{k}: dot product {dot}; |A| = {na}, |B| = {nb}; cosine <b>{cos}</b>; Euclidean distance <b>{d}</b>.',
    s1term: '|A| = vector length = √(sum of squares of all dimensions). A cosine of 1 means the same direction, 0 means perpendicular, −1 means opposite.',
    s2k: 'Step 2 · Analogy arithmetic', s2t: 'Why does king − man + woman land on queen?',
    s2e: 'This step answers: why can adding and subtracting vectors solve analogies? Every word is a point on the plot. The difference between king and man (solid orange arrow) is the direction “from ordinary person to royalty”; slide that arrow over to woman (dashed orange) and its tip is woman plus the same “royalty” change, which lands exactly on queen. Formula: result = A − λ·B + λ·C (λ = 1 is the full analogy). Pick three words and drag λ: the white dot walks from A toward the answer, and the readout names the closest word (highest cosine); note that when you have not gone far enough the nearest word may be prince, and only the full arrow ends at queen. The three input words are not allowed as candidates (the usual convention; otherwise the answer is often an input itself). The plot shows only the first two dimensions, while the nearest word is computed over all five.',
    s2aL: 'A (start)', s2bL: 'B (subtract)', s2cL: 'C (add)', s2lL: 'How far, λ', s2reset: 'Reset', cv2: 'Analogy arrows and the result point',
    s2Res: 'result', s2ResOff: 'result (off the plot)', s2Cap: 'solid = A−B; dashed = shifted to C; x gender, y royalty',
    s2ro: 'result = {a} − {l}×{b} + {l}×{c} = <b>{v}</b>; the nearest word is “<b>{top}</b>” (cosine {cs}), runner-up “{second}”.',
    s2term: 'λ is a “how far” factor added by this page so you can see the process; it is not part of a model. The standard analogy uses λ = 1.',
    s3k: 'Step 3 · The nearest word', s3t: 'What if the “right answer” is not in the vocabulary?',
    s3e: 'This step answers: what does analogy arithmetic actually return? First a <strong>point</strong>, and then the page looks up the word closest to it in the vocabulary. Use the checkboxes to choose which words are in the vocabulary, with king − man + woman fixed: untick queen first and see who becomes the answer and how high its cosine is; then untick princess and girl and keep watching. Bar height is the cosine of each candidate with the result point. Take-away: the answer depends on the vocabulary and is not “the truth”; even a high cosine only says the directions are close. (The three input words king, man and woman are not candidates.)',
    s3vL: 'Vocabulary (ticked = in the vocabulary)', s3reset: 'Restore all words', cv3: 'Candidates for king − man + woman under the current vocabulary',
    s3Cap: 'Candidates for king − man + woman (cosine)', s3In: 'input', s3Out: 'not in vocab', s3Ans: 'answer: {w}', s3None: 'no candidate word in the vocabulary', s3Has: 'queen is in the vocabulary, so the answer is the full analogy result.', s3Miss: 'queen is missing from the vocabulary, so the answer is only the nearest substitute.',
    s3ro: 'The vocabulary has {n} words; answer “<b>{top}</b>”, cosine <b>{cs}</b>. {miss}',
    s3term: 'Candidates = the words in the vocabulary other than the three inputs; cosine compares only direction and does not measure “correct”.',
    s4k: 'Step 4 · Look at the neighbours', s4t: 'If nobody writes features by hand, where do vectors come from?',
    s4e: 'This step answers: how can a machine get word vectors on its own? The core idea is “look at who a word appears with”. Below is a mini corpus of only 14 sentences. Drag “sentences read” (or press “Read sentence by sentence”): each sentence read adds 1 to the table for every pair of neighbouring words. The <strong>window</strong> is how far to the left and right counts as “neighbouring” (sentences have only 3 words, so a window above 2 changes nothing). Each row is a target word’s <strong>co-occurrence count vector</strong> (columns are neighbour words); compare two rows with the cosine from step 1: the words with the most similar neighbours are the most similar words. Pick a target word, change the window and watch the bars below. This uses raw counts and is not real training; methods such as word2vec and GloVe compress this kind of statistic into dense vectors of a few hundred dimensions on huge corpora.',
    s4tL: 'Target word', s4kL: 'Sentences read', s4winL: 'Window size', s4play: '▶ Read sentence by sentence', s4pause: '⏸ Pause', s4reset: 'Reset', cv4: 'Co-occurrence table and similarity ranking',
    s4Cap: 'Counts: row = target, column = neighbour', s4Sim: 'Cosine with the neighbours of “{w}”',
    s4ro: 'Read <b>{k} / {n}</b> sentences, window {win}: the word whose neighbours are most similar to those of “{w}” is “<b>{top}</b>” (cosine {cs}). With 0 sentences read there are no counts and — is shown.',
    s4term: 'Co-occurrence count = how often two words appear together within the window; two words with identical neighbour distributions have cosine 1. The corpus is tiny, so this is only a demonstration.',
    s5k: 'Step 5 · Finale', s5t: 'Wrap-up: words as a computable map',
    s5e: 'Word embeddings turn words into numbers we can measure distances between and add and subtract; this page goes from hand-set features to “look at the neighbours”, showing that such numbers can be designed or learned from text.',
    c1t: 'A word = a list of numbers', c1b: 'One number per dimension, so a word becomes a point in space (step 0; the features here are hand-set).',
    c2t: 'Cosine looks at direction', c2b: 'Cosine compares only direction and ignores length; Euclidean distance depends on length too (step 1).',
    c3t: 'Analogy = arithmetic + nearest', c3b: 'Vector arithmetic gives a point and the answer is the nearest word in the vocabulary, which depends on the vocabulary (steps 2 and 3).',
    c4t: 'Vectors can be learned', c4b: 'Count who appears with whom and words with similar neighbours get similar vectors (step 4).',
    modelT: 'Model and limits',
    modelB: 'Steps 0–3 use hand-set 5-dimensional toy features whose axes all have names; real embeddings have hundreds of dimensions with no clear meaning on any axis, analogies do not always work, and they absorb biases from the text. Step 4 is raw co-occurrence counting plus cosine, not the training procedure of word2vec or GloVe; the mini corpus has only 14 sentences, so the result is a demonstration.',
    linksT: 'Continue elsewhere',
    link1: 'Attention · query and key: how words score each other once they are vectors in a model', link2: 'Linear transform · basis ledger: how a matrix turns a vector into a new vector', link3: 'Eigenvectors · principal components: squeeze high-dimensional vectors into two dimensions to look at them',
    foot: 'First edition generated by Claude Sonnet (via Mini Claude Code) · not independently reviewed · a teaching illustration, not a research result',
w_man: 'man', w_woman: 'woman', w_boy: 'boy', w_girl: 'girl', w_king: 'king', w_queen: 'queen', w_apple: 'apple', w_cat: 'cat', w_prince: 'prince', w_princess: 'princess', w_dog: 'dog', w_bread: 'bread', w_eats: 'eats', w_runs: 'runs', w_home: 'home', w_tastes: 'tastes', w_sweet: 'sweet', w_fresh: 'fresh', w_rules: 'rules', w_land: 'land', w_wears: 'wears', w_crown: 'crown', w_purrs: 'purrs', w_softly: 'softly', w_barks: 'barks', w_loudly: 'loudly'
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
