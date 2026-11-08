'use strict';
const STR = {
  zh: {
    languageLabel: "语言切换",
    back: "← 知识索引",
    navLabel: "步骤导航",
    catBadge: "生物",
    stageBadge: "初中",
    foot: "食物网 · 由 Claude Sonnet 经 Mini Claude Code 构建 · 纯静态双语页",
    docTitle: '食物网 · 拖掉一个物种，看谁跟着崩',
    pageTitle: '食物网',
    tagline: '草、兔、狐连成网——吃与被吃把能量一层层往上送，网里任何一个结点变了，别处也会跟着变。',
    nav0: '0 谁吃谁', nav1: '1 能量金字塔', nav2: '2 少了一个物种', nav3: '3 毒物富集', nav4: '4 网比链稳', nav5: '5 收束',
    sp0: '草', sp1: '蚱蜢', sp2: '兔', sp3: '鼠', sp4: '蛙', sp5: '蛇', sp6: '狐', sp7: '鹰',
    lvl1: '生产者', lvl2: '初级消费者', lvl3: '次级消费者', lvl4: '三级消费者', lvl5: '四级消费者',
    unitKj: 'kJ', unitPct: '%', s0sep: '、',
    modeWeb: '完整的食物网（捕食者有多种食物）', modeChain: '只剩单线食物链（每个捕食者只吃一种）',
    statAlive: '存活', statRemoved: '被你移走', statExtinct: '断了食物而消失',
    s0k: '第 0 步 · 谁吃谁',
    s0t: '这张图里，谁吃谁、能量往哪个方向走？',
    s0e: '这一步要回答：怎样读一张食物网？箭头从<strong>被吃的</strong>指向<strong>吃它的</strong>，也就是能量传递的方向。<strong>生产者</strong>（草）自己用阳光制造养料；<strong>消费者</strong>靠吃别的生物获得能量。<strong>营养级</strong>是它在食物链里的位置：生产者为第 1 级，吃第 1 级的是第 2 级，以此类推；吃多种食物的，取它所吃食物营养级的平均值再加 1。选一个物种（也可点图上的点），看它吃谁、被谁吃。',
    s0stage: '食物网：箭头从食物指向吃它的动物；横向位置只为排版，纵向高度是营养级；青色线 = 它吃的，橙色线 = 吃它的',
    s0canvas: '八种生物组成的食物网：草在底层，蛙、蛇、狐、鹰在上层，箭头表示能量流向',
    s0sp: '选一个物种',
    s0ro: '{name}（营养级 {tl}）：吃 {eats}；被 {eaten} 吃。',
    s0none: '无',
    s0prod: '自己制造养料',
    s0top: '没有天敌（顶级捕食者）',
    s0result: '结论：箭头方向 = 能量流向；营养级越高，离阳光越远。条件：这是一个简化的 8 种生物的虚构草地食物网，真实的网要复杂得多。',
    s1k: '第 1 步 · 能量金字塔',
    s1t: '为什么吃肉的动物总是比吃草的少得多？',
    s1e: '这一步要回答：每往上一个营养级，能量会剩下多少？生物吃进的能量大部分用来呼吸、运动、散热，只有一小部分长成自己的身体，成为下一级能吃到的能量。常用的经验数是<strong>能量传递效率</strong>约 10%（本页可调 5–20%）。从 10000 kJ 的生产者出发，一层层乘以效率；能量不足 5 kJ 的层，养不活一个种群。拖效率，看金字塔能垒几层。',
    s1stage: '能量金字塔（宽度按对数）：从下往上是生产者到顶级消费者；写出每层的能量（kJ）；灰色表示养不活',
    s1canvas: '能量金字塔：每上一层能量乘以传递效率，能量不足 5 kJ 的层变灰',
    s1eff: '能量传递效率',
    s1ro: '效率 {eff}%：各层能量 {list}；能养活的营养级数 = {n}。',
    s1result: '结论：效率越低，金字塔越矮，顶级捕食者越少。条件：10000 kJ 起点、5 kJ 门槛、效率固定为各层相同，都是教学数字；真实生态系统的效率因生物而异。',
    s2k: '第 2 步 · 少了一个物种',
    s2t: '把一个物种拿走，别的物种数量会怎样变？',
    s2e: '这一步要回答：拿走食物网里的一个物种，其他物种的数量会怎么变，会不会连带消失？每个物种的数量随它吃到的食物增加、被吃而减少。本页用一个简化的数学模型（每对「吃—被吃」的关系都按相遇次数计）模拟：先让八种生物处在平衡，再移走一个物种，看各条曲线（占原数量的百分比）。选一个物种，按「移走并运行」。',
    s2stage: '横轴：模拟时间，纵轴：各物种数量占平衡值的百分比（最高显示 250%）；每种生物一条线，低于 2% 视为消失',
    s2canvas: '移走一个物种后各物种数量随时间的变化曲线：有的上升，有的下降，有的消失',
    s2rm: '要移走的物种', s2run: '移走并运行', s2reset: '恢复原来的网',
    s2ro0: '八种生物处在平衡：每种都是 100%。选一个物种移走再运行。',
    s2ro1: '移走「{name}」后第 {t} 个时间单位：{list}',
    s2dead: '（消失）',
    s2result: '结论：移走一个物种会沿着「吃—被吃」的链条间接影响很多别的物种，有些上升、有些下降。条件：本页是一个线性相互作用的玩具模型，参数是为稳定而调的；真实生态系统的反应取决于具体物种。',
    s3k: '第 3 步 · 毒物富集',
    s3t: '水里微量的毒，为什么会在最高层的动物体内浓得吓人？',
    s3e: '这一步要回答：难分解、难排出的毒物进入食物链后，每一级体内的浓度会怎样？这类物质（如某些农药、汞）会在体内积存，每吃一次就积累一次：低一级的生物体内的毒物，几乎全被吃它的生物留住，所以每上一级浓度大约乘以一个倍数。用 <strong>浓度</strong>（单位质量体内含有的毒物量）比较。拖「每级放大倍数」和「生产者体内浓度」，看哪一级越过危险线。',
    s3stage: '沿着草 → 蚱蜢 → 蛙 → 蛇 → 鹰这条食物链，各级体内的毒物浓度（对数刻度）；红色虚线是教学用的危险线 100',
    s3canvas: '毒物沿食物链逐级放大：每一级浓度是前一级的若干倍，到顶级捕食者可超过危险线',
    s3f: '每级放大倍数', s3c0: '生产者体内浓度',
    s3ro: '各级浓度：{list}；超过危险线 100 的级别：{over}。',
    s3over: '第 {n} 级（{name}）',
    s3result: '结论：能积存的毒物沿食物链逐级放大，顶级捕食者受害最重，即使环境里浓度很低。条件：只对难降解、难排出的物质成立；很多毒物会被排出或分解，不会放大；倍数和危险线都是教学数字。',
    s4k: '第 4 步 · 网比链稳',
    s4t: '为什么食物来源越多的生态系统越经得起打击？',
    s4e: '这一步要回答：同样移走一个物种，单线的食物链和交织的食物网，哪个连带消失得更多？规则很简单：一个消费者只要还有<strong>一种</strong>食物活着就能活下去，所有食物都没了就会跟着消失。选「完整的网」或「单线食物链」，选一个物种，按「移走」，数连带消失的物种数。',
    s4stage: '食物网：彩色 = 存活，红色叉 = 被你移走，灰色 = 因为食物断了而消失',
    s4canvas: '移走一个物种后的食物网，灰色的是连带消失的物种',
    s4mode: '食物网的样子', s4rm: '要移走的物种', s4remove: '移走', s4reset: '全部恢复',
    s4ro: '{mode}，移走「{name}」：连带消失 {n} 种（{list}）。同一个物种在另一种结构里连带消失 {other} 种。',
    s4ro0: '{mode}：八种生物都在。选一个物种按「移走」。',
    s4result: '结论：一种食物消失时，吃它的捕食者如果还有别的食物就能撑住；网越交织，连带消失越少。条件：这里只看「有没有食物」这一条结构规则，不含数量变化、竞争和疾病。',
    s5k: '第 5 步 · 收束', s5t: '把食物网说给别人听',
    s5e: '食物网用箭头画出能量从生产者一路传给消费者的路；每一级只传下大约十分之一，所以顶级捕食者少；任何结点的变化都会沿着网传开。',
    f1t: '读图', f1b: '箭头从被吃者指向吃它者，也是能量的方向（第 0 步）。',
    f2t: '能量与毒物', f2b: '能量每级只剩约 10%；能积存的毒物每级放大，顶级最危险（第 1、3 步）。',
    f3t: '牵一发', f3b: '移走一个物种会沿网传到别处；食物来源越多越稳（第 2、4 步）。',
    modelT: '模型实话',
    model1: '这是一个虚构的 8 种生物的草地食物网；真实的网有成百上千个结点，还有分解者和杂食、互相竞争。',
    model2: '第 2 步是线性相互作用的玩具模型，参数调到稳定，曲线只表示趋势，不能预测真实生态系统。',
    model3: '能量传递效率、危险线和放大倍数都是教学数字，不是测量值。',
    nextT: '继续看（站内）',
    l1: '光合作用 · 第 1 步：食物网底层的生产者靠它制造养料',
    l2: '种群增长 · 第 3 步：为什么种群有一条 K 的天花板',
    l3: '种群生态学 · 第 2 步：捕食者怎样让猎物数量起伏'
  },
  en: {
    languageLabel: "Language",
    back: "← Knowledge Index",
    navLabel: "Step navigation",
    catBadge: "Biology",
    stageBadge: "Junior High",
    foot: "Food Webs · Built by Claude Sonnet via Mini Claude Code · static bilingual page",
    docTitle: 'Food Webs · Remove One Species and See Who Follows',
    pageTitle: 'Food Webs',
    tagline: 'Grass, rabbit, fox joined into a web — eating and being eaten passes energy up level by level, and a change at any node ripples to others.',
    nav0: '0 Who eats whom', nav1: '1 Energy pyramid', nav2: '2 One species gone', nav3: '3 Toxin build-up', nav4: '4 Web beats chain', nav5: '5 Recap',
    sp0: 'Grass', sp1: 'Grasshopper', sp2: 'Rabbit', sp3: 'Mouse', sp4: 'Frog', sp5: 'Snake', sp6: 'Fox', sp7: 'Hawk',
    lvl1: 'Producer', lvl2: 'Primary consumer', lvl3: 'Secondary consumer', lvl4: 'Tertiary consumer', lvl5: 'Quaternary consumer',
    unitKj: 'kJ', unitPct: '%', s0sep: ', ',
    modeWeb: 'Full food web (predators have several foods)', modeChain: 'Single-line chains only (each predator eats one thing)',
    statAlive: 'alive', statRemoved: 'removed by you', statExtinct: 'gone because their food is gone',
    s0k: 'Step 0 · Who eats whom',
    s0t: 'In this picture, who eats whom and which way does energy go?',
    s0e: 'This step asks: how do you read a food web? Arrows point from the <strong>eaten</strong> to the <strong>eater</strong>, the direction energy is passed. A <strong>producer</strong> (grass) makes its own food from sunlight; <strong>consumers</strong> get energy by eating other organisms. The <strong>trophic level</strong> is its position in the chain: producers are level 1, what eats them is level 2, and so on; for a mixed diet take the average level of its foods plus 1. Pick a species (or click a dot on the picture) and see what it eats and what eats it.',
    s0stage: 'The food web: arrows go from food to eater; horizontal position is only layout, height is trophic level; cyan lines = what it eats, orange lines = what eats it',
    s0canvas: 'A food web of eight organisms: grass at the bottom, frog, snake, fox and hawk above, arrows showing energy flow',
    s0sp: 'Pick a species',
    s0ro: '{name} (trophic level {tl}): eats {eats}; eaten by {eaten}.',
    s0none: 'nothing',
    s0prod: 'makes its own food',
    s0top: 'no predators (top predator)',
    s0result: 'Takeaway: arrow direction = energy flow; the higher the trophic level, the farther from sunlight. Holds for this simplified fictional eight-species meadow web; real webs are far more complex.',
    s1k: 'Step 1 · Energy pyramid',
    s1t: 'Why are there always far fewer meat-eaters than plant-eaters?',
    s1e: 'This step asks: at each step up a trophic level, how much energy is left? Most of the energy an animal eats goes into breathing, moving and heat; only a small part becomes its own body, the energy available to the next eater. A common rule of thumb is a <strong>transfer efficiency</strong> of about 10% (adjustable 5–20% here). Start from 10000 kJ at the producers and multiply by the efficiency level by level; a level below 5 kJ cannot support a population. Drag the efficiency and see how many levels the pyramid holds.',
    s1stage: 'Energy pyramid (widths on a log scale): producers at the bottom up to top consumers, each level’s energy in kJ; grey means it cannot be supported',
    s1canvas: 'An energy pyramid: each level up multiplies energy by the efficiency, and levels under 5 kJ turn grey',
    s1eff: 'Transfer efficiency',
    s1ro: 'Efficiency {eff}%: energy per level {list}; levels that can be supported = {n}.',
    s1result: 'Takeaway: lower efficiency makes a shorter pyramid and fewer top predators. Holds with the teaching numbers used (10000 kJ start, 5 kJ minimum, the same efficiency at every step); real efficiencies vary between organisms.',
    s2k: 'Step 2 · One species gone',
    s2t: 'Take one species away: how do the others’ numbers change?',
    s2e: 'This step asks: remove one species from the web — how do the others’ numbers change, and do any disappear with it? Each species grows with the food it gets and shrinks when eaten. This page runs a simplified mathematical model (every eat/eaten pair works by encounters): first the eight species sit at balance, then one is removed and you watch every curve (as a percentage of its original number). Pick a species and press “Remove and run”.',
    s2stage: 'x-axis: model time, y-axis: each species’ number as a percentage of its balance value (shown up to 250%); one line per species, under 2% counts as gone',
    s2canvas: 'Curves of each species’ number over time after one is removed: some rise, some fall, some vanish',
    s2rm: 'Species to remove', s2run: 'Remove and run', s2reset: 'Restore the original web',
    s2ro0: 'Eight organisms at balance: every one is at 100%. Pick a species, remove it and run.',
    s2ro1: 'After removing “{name}”, at time {t}: {list}',
    s2dead: ' (gone)',
    s2result: 'Takeaway: removing one species spreads through the chain of eating and being eaten, raising some species and lowering others. Holds in a linear-interaction toy model with parameters tuned for stability; real ecosystems respond according to the actual species involved.',
    s3k: 'Step 3 · Toxin build-up',
    s3t: 'Why does a trace of poison in the environment get alarmingly concentrated in top animals?',
    s3e: 'This step asks: when a hard-to-break-down, hard-to-excrete poison enters a food chain, how does its concentration change at each level? Such substances (certain pesticides, mercury) are stored in the body, so each meal adds to the store: nearly all the poison in the animal below stays with its eater, and each step up multiplies the concentration by some factor. Compare by <strong>concentration</strong> (poison per unit body mass). Drag the “multiplier per level” and the “producer concentration” and see which level crosses the danger line.',
    s3stage: 'Along the chain grass → grasshopper → frog → snake → hawk, the poison concentration at each level (log scale); the red dashed line is a teaching danger level of 100',
    s3canvas: 'A poison magnified level by level along the food chain: each level is a multiple of the one below and top predators can cross the danger line',
    s3f: 'Multiplier per level', s3c0: 'Producer concentration',
    s3ro: 'Concentration per level: {list}; levels over the danger line (100): {over}.',
    s3over: 'level {n} ({name})',
    s3result: 'Takeaway: poisons that accumulate magnify up the food chain, hitting top predators hardest even if the environment holds very little. Holds only for substances that persist and are hard to excrete; many are excreted or broken down and do not magnify; the multiplier and danger line are teaching numbers.',
    s4k: 'Step 4 · Web beats chain',
    s4t: 'Why does an ecosystem with more food sources survive shocks better?',
    s4e: 'This step asks: remove the same species from a single-line chain and from an interwoven web — which loses more species along with it? The rule is simple: a consumer survives as long as <strong>one</strong> of its foods is alive, and disappears once all of them are gone. Choose “full web” or “single-line chains”, pick a species, press “Remove”, and count what goes with it.',
    s4stage: 'The food web: coloured = alive, red cross = removed by you, grey = gone because its food is gone',
    s4canvas: 'The food web after removing a species, with the species lost as a consequence shown in grey',
    s4mode: 'Shape of the web', s4rm: 'Species to remove', s4remove: 'Remove', s4reset: 'Restore everything',
    s4ro: '{mode}, removing “{name}”: {n} more species lost ({list}). The same removal in the other structure loses {other}.',
    s4ro0: '{mode}: all eight organisms are here. Pick a species and press “Remove”.',
    s4result: 'Takeaway: when one food disappears, a predator with other foods can hold on; the more interwoven the web, the fewer species are lost with it. Holds for this one structural rule (“is there any food left”); numbers, competition and disease are not modelled.',
    s5k: 'Step 5 · Recap', s5t: 'Explain food webs to a friend',
    s5e: 'A food web draws, with arrows, the paths energy takes from producers to consumers; only about a tenth is passed on at each step, so top predators are few; and a change at any node spreads along the web.',
    f1t: 'Reading it', f1b: 'Arrows run from eaten to eater, which is also the direction of energy (step 0).',
    f2t: 'Energy and poison', f2b: 'Energy shrinks to about 10% per level; poisons that accumulate grow per level, so the top is most at risk (steps 1 and 3).',
    f3t: 'Ripples', f3b: 'Removing a species spreads through the web; more food sources make it sturdier (steps 2 and 4).',
    modelT: 'Honest model notes',
    model1: 'This is a fictional eight-species meadow web; real webs have hundreds or thousands of nodes, plus decomposers, omnivory and competition.',
    model2: 'Step 2 is a linear-interaction toy model with parameters tuned to be stable; the curves show tendencies and cannot predict a real ecosystem.',
    model3: 'The transfer efficiency, danger line and multiplier are teaching numbers, not measurements.',
    nextT: 'Keep going (on this site)',
    l1: 'Photosynthesis · step 1: how the producers at the base of the web make their food',
    l2: 'Population Growth · step 3: why a population has a ceiling called K',
    l3: 'Population Ecology · step 2: how predators make prey numbers rise and fall'
  }
};
let currentLang = null;
function getLang() {
  if (currentLang) return currentLang;
  try {
    const saved = localStorage.getItem('knowledge-lang');
    if (saved === 'zh' || saved === 'en') return currentLang = saved;
  } catch (e) { /* in-memory fallback */ }
  return currentLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
function t(key, params) {
  const p = params || {};
  return STR[getLang()][key].replace(/\{(\w+)\}/g, (_, n) => String(p[n]));
}
function applyLang(lang) {
  currentLang = lang;
  try { localStorage.setItem('knowledge-lang', lang); } catch (e) { /* keep currentLang */ }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(el => {
    const on = el.dataset.lang === lang;
    el.classList.toggle('active', on);
    el.setAttribute('aria-pressed', String(on));
  });
  if (typeof window.onLang === 'function') window.onLang();
}
getLang();
if (typeof module !== 'undefined') module.exports = { STR };
