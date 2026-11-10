'use strict';
// Fire-triangle lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '燃烧三要素 · 一笔热量账',
    back: '← 知识索引',
    compare: '对照另一版本：燃烧三要素 →',
    navLabel: '燃烧三要素步骤导航',
    tagline: '蜡烛、火柴、灶里的火看起来各不相同，却都要同时满足三个条件：有可燃物、有氧气、温度达到着火点。六步里你会先用经典的白磷实验把三个条件一个个分出来，再记一笔「热量账」，看清火为什么一点着就能自己烧下去，又为什么拿掉任何一个条件就会灭。',
    nav0: '0 白磷实验', nav1: '1 点火', nav2: '2 罩住蜡烛', nav3: '3 灭火', nav4: '4 切碎', nav5: '5 收束',

    s0k: '第 0 步 · 白磷实验',
    s0t: '同一块热铜片上，为什么白磷着火、红磷不着？',
    s0e: '这一步要回答：燃烧到底需要哪几个条件？用课本上的经典实验：烧杯里装热水，杯口盖一块铜片，铜片上放一小块<strong>白磷</strong>和一小块<strong>红磷</strong>，水底再放一小块白磷。磷是<strong>可燃物</strong>（能燃烧的物质）。铜片导热好，温度和水温差不多。每种可燃物都有一个<strong>着火点</strong>：温度达到它，才能开始燃烧——白磷约 40 °C，红磷约 240 °C。实验里每两块之间只差一个条件，比一比哪块烧、哪块不烧，就能把条件一个个分出来。（白磷有毒，在空气中容易自燃，只能在老师指导下做。）',
    waterSlider: '热水温度（°C）', o2btn: '向水中的白磷通入氧气',
    c0: '热水上盖铜片：铜片上两块磷，水底一块磷',
    lblWhite: '白磷（着火点 40 °C）', lblRed: '红磷（着火点 240 °C）', lblUnder: '水中的白磷',
    s0lgFlame: '火焰：正在燃烧', s0lgBubble: '氧气气泡', s0lgCopper: '铜片（温度≈水温）',
    nmWhite: '铜片上的白磷', nmRed: '铜片上的红磷', nmUnder: '水中的白磷', nmCopper: '铜片本身',
    burnLine: '{name}：燃烧。',
    noHeat: '{name}：不燃烧——{T} °C 没达到着火点 {ign} °C。',
    noO2: '{name}：不燃烧——被水隔开，接触不到氧气。',
    noFuel: '{name}：不燃烧——温度够、也接触空气，但铜不是可燃物。',
    s0hint: '观察顺序：先保持 80 °C、不通氧气，比较铜片上的白磷和红磷（只差着火点）；再比较铜片上的白磷和水中的白磷（只差有没有氧气）；然后按「通入氧气」，水中的白磷也烧起来了。最后把水温降到 40 °C 以下，连铜片上的白磷也不烧了。',

    s1k: '第 1 步 · 点火',
    s1t: '火柴为什么要烤一会儿，木条才会自己烧起来？',
    s1e: '这一步要回答：温度达到着火点以后，为什么拿开火柴，火也不会灭？给木条记一笔<strong>热量账</strong>：火柴的火焰给它加热；木条比周围热，就不断向空气散热，越热散得越快；一旦温度达到着火点，木条自己燃烧起来，燃烧放出的热也在加热它。温度往哪边走，看每秒的「进账」（火柴供热 + 燃烧放热）多，还是「出账」（散热）多。本页模型取室温 20 °C、木条着火点 300 °C（教学取值）；在空气中，燃烧放出的热能把木条维持在约 {steady} °C，高于着火点，所以火能自己烧下去。下图横轴是时间（秒），纵轴是木条温度（°C），粉色底色是火柴在烤的那段时间。',
    holdSlider: '火柴烤的时间（秒）', tcSlider: '查看第几秒的热量账（秒）', light1: '点火并计时', clearHist: '清除记录',
    c1top: '此刻的热量账（每秒让温度升或降多少 °C）', barMatch: '火柴供热', barBurn: '燃烧放热', barLoss: '向空气散热',
    c1bot: '木条温度（°C）随时间（秒）', ignLabel: '着火点 {T} °C',
    s1lgNow: '这一次的温度', s1lgOld: '之前几次', s1lgMatch: '火柴在烤', lgIgn: '着火点',
    s1progress: '计时 {t}/20 秒。',
    s1yes: '{prog}火柴烤了 {h} 秒：木条在第 {ti} 秒达到着火点，自己烧了起来；拿开火柴后，温度逐渐稳定在约 {Ts} °C（只靠燃烧放热维持）。',
    s1no: '{prog}火柴烤了 {h} 秒：木条最高只到 {Tm} °C，没达到着火点 {Ti} °C；拿开火柴后散热占上风，温度一路降回室温。',
    s1hint: '观察顺序：先烤 2 秒，按「点火并计时」，看温度爬到一半又落回去；拖「查看第几秒」到火柴刚拿开的时刻，热量账里只剩散热。每次加 0.5 秒再试。烤够 {hold} 秒（模型算出的最短时间）后，曲线越过着火点就不再回落——拿开火柴后，进账只剩燃烧放热，它正好抵得上散热。灰线留着之前每一次的结果。',

    s2k: '第 2 步 · 罩住蜡烛',
    s2t: '罩住的蜡烛为什么会熄灭？氧气用光了吗？',
    s2e: '这一步要回答：用玻璃罩罩住燃着的蜡烛，它为什么过一会儿就灭，罩子大小有什么影响？空气里<strong>氧气约占 21%</strong>（按体积）。蜡烛燃烧不断消耗罩内的氧气，氧气所占的比例越来越低；燃烧放出的热与氧气比例成正比，比例低了，放出的热就不够把温度维持在着火点以上（第 1 步的热量账）。本页模型把这条<strong>熄灭线</strong>取在 16%（教学取值），并假设蜡烛在新鲜空气里每秒消耗 4 mL 氧气、消耗速度与氧气比例成正比。上图是罩子和蜡烛，火焰大小示意燃烧放热比「维持着火点所需」多出的部分；下图横轴是盖上罩子后的时间（秒），纵轴是罩内氧气比例。',
    volSlider: '罩子容积（mL）', cover2: '盖上罩子',
    c2top: '玻璃罩里的蜡烛', c2bot: '罩内氧气比例（%）随时间（秒）', minLabel: '熄灭线 {p}%',
    s2lgNow: '这一次', s2lgOld: '其他容积', s2lgMin: '熄灭线', s2lgFlame: '火焰',
    s2progress: '第 {t} 秒：氧气 {phi}%。',
    s2idle: '罩子 {V} mL：按「盖上罩子」开始。模型预计约 {tout} 秒后熄灭。',
    s2readout: '{prog}罩子 {V} mL：盖上后约 {tout} 秒熄灭。熄灭时罩内氧气还有 {pmin}%，是原来的 {left}%——只用掉 {used} mL 氧气，远没有用光。火灭是因为氧气比例太低，放出的热不够了。',
    s2hint: '观察顺序：先用 1000 mL 的罩子按「盖上罩子」，看火焰随氧气比例下降而变小，曲线碰到 16% 线时熄灭；再换 250 mL 和 2000 mL 各试一次：罩子容积翻倍，熄灭时间也翻倍。动画按 2 倍速播放。',

    s3k: '第 3 步 · 灭火',
    s3t: '灭火要做到什么程度，火才算真的灭了？',
    s3e: '这一步要回答：三种灭火办法各拆掉了三角形的哪一条边？每种要做到什么程度才有效？上图是燃烧三角形：可燃物、氧气、热量（温度达到着火点）三条边都在，火才烧得起来。木条原本在空气中稳定燃烧（约 {steady} °C），第 {at} 秒采取行动：<br>• <strong>移走可燃物</strong>（如砍出隔离带、关掉燃气阀门）——没有东西可烧；<br>• <strong>盖上盖子</strong>（如盖锅盖、撒沙土）——隔绝氧气；<br>• <strong>浇水</strong>——水受热、蒸发会吸走大量的热，让温度降到着火点以下。本页模型取每克水在 1 秒内让木条降温 {wk} °C（教学取值）。<br>下图是木条温度（°C）随时间（秒），灰色虚线是什么都不做时的温度。',
    actFuel: '移走可燃物', actLid: '盖上盖子', actWater: '浇水', waterAmt: '浇水量（克）',
    c3top: '燃烧三角形（此刻）', sideFuel: '可燃物', sideO2: '氧气', sideHeat: '热量',
    c3bot: '木条温度（°C）随时间（秒）',
    s3lgOn: '这条边还在', s3lgOff: '这条边被拆掉', s3lgCurve: '采取行动后的温度', s3lgBase: '什么都不做',
    s3progress: '第 {t} 秒。',
    s3fuel: '{prog}移走可燃物：第 {at} 秒起没有东西可烧，燃烧立刻停止，温度降回室温。拆掉的是「可燃物」这条边。',
    s3lid: '{prog}盖上盖子：罩内氧气很快耗尽，燃烧放热跟着变少，第 {to} 秒温度跌破着火点，火灭。拆掉的是「氧气」这条边。',
    s3waterOut: '{prog}浇水 {w} 克：温度最低降到 {Tm} °C，低于着火点 {Ti} °C，燃烧停止；之后没有燃烧放热，温度不会再回升——火灭了。拆掉的是「热量」这条边。',
    s3waterNo: '{prog}浇水 {w} 克：温度只降到 {Tm} °C，仍高于着火点 {Ti} °C，燃烧没停，水蒸发完温度又升回去——火没灭。按这个模型至少要约 {wmin} 克。',
    s3hint: '观察顺序：先看默认的「浇水 0.5 克」：温度往下一沉，又回升了。把水量一格格加大，找出火刚好灭掉的那一格。再分别按「移走可燃物」「盖上盖子」，看三角形里哪条边变暗。三种办法的共同点：都让燃烧放热跟不上散热，温度一旦跌破着火点，火就不会自己复燃。',
    quizPrompt: '小测：炒菜时油锅着了火，最好的做法是？',
    quizA: '赶紧浇一大盆冷水', quizB: '盖上锅盖，再关火', quizC: '用扇子使劲扇', check: '核对',
    correct: '对。锅盖隔绝氧气，关火不再加热。油比水轻，冷水会沉到热油下面瞬间沸腾，把燃着的油溅出来，火反而更大。',
    wrong: '再想想：冷水会沉到热油下面瞬间变成水蒸气，把燃着的油溅出来；扇风会送进更多氧气。哪种做法拆掉了一条边，又不制造新的危险？',

    s4k: '第 4 步 · 切碎',
    s4t: '同一块木头，切碎了为什么烧得这么猛？',
    s4e: '这一步要回答：木头的质量不变，切得越碎，烧完要多久、放热有多猛？燃烧发生在可燃物与氧气接触的<strong>表面</strong>。把一块边长 4 cm 的木块每条边切成 n 段，得到 n³ 小块；每块的表面积缩成原来的 1/n²，块数却多了 n³ 倍，所以总<strong>表面积</strong>变成原来的 n 倍。本页模型假设烧完的时间与表面积、氧气比例都成反比，整块木头在空气中烧 600 秒（教学取值）。木头总共能放出的热不变，烧得越快，每秒放出的热（<strong>放热功率</strong>）越大。细到粉末时，热量在一瞬间放完，如果在有限的空间里，气体急剧膨胀，就是<strong>粉尘爆炸</strong>——面粉厂、煤矿严禁明火正是为此。下图横轴是每条边切的段数 n，纵轴是烧完所需时间（秒），两轴都是对数刻度（<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step3">→ 反应速率第 3 步：整块还是粉末</a>）。',
    cutSlider: '每条边切成 n 段（n = 1, 2, 4 … 4096）',
    gasAirBtn: '空气（21% 氧气）', gasPureBtn: '纯氧（100% 氧气）',
    c4top: '切成 {n}×{n}×{n} 块，每块边长 {s}', c4bot: '烧完所需时间（秒）随每条边的段数 n', ref1s: '1 秒',
    s4lgAir: '在空气中', s4lgPure: '在纯氧中', s4lgHist: '你试过的 n', s4lgRef: '1 秒参照线',
    gasAir: '空气', gasPure: '纯氧', uSec: '秒', uMin: '分钟',
    s4readout: '每条边切成 {n} 段：共 {pieces} 块，每块边长 {size}，表面积是整块的 {n} 倍。在{gas}中烧完约需 {time}，放热功率是整块木头在空气中的 {pw} 倍。{note}',
    noteDust: '不到 1 秒就把热量放完——这就是粉尘遇明火会爆炸的原因。',
    s4hint: '观察顺序：从 n = 1 开始一格格向右拖，每拖一格段数翻倍、烧完时间减半，图上是一条斜直线；再切到「纯氧」，整条线下移：同一块木头快 {pure} 倍——带火星的木条在纯氧里会复燃，也是这个道理。',

    s5k: '第 5 步 · 收束',
    s5t: '把三角形带走',
    s5fin: '燃烧要同时有<strong>可燃物、氧气、达到着火点的温度</strong>。三者连成一个循环：燃烧放热 → 维持温度 → 继续燃烧。所以：<br>• 点火只要把温度推过着火点一次，之后火靠自己放的热维持；<br>• 灭火只要拆掉任一条边，让放热跟不上散热，火灭了就不会自己复燃；<br>• 氧气比例、接触面积决定烧得多快：同样的木头，切成粉末、放进纯氧，会烧得更猛，甚至爆炸。',
    formula: '燃烧 = 可燃物 + 氧气 + 温度达到着火点\n能自己烧下去：燃烧放热 ≥ 散热\n灭火：拆掉任意一个条件',
    boundary: '适用范围：本页的热量账是教学模型。着火点 300 °C、熄灭线 16%、每秒 4 mL 氧气、每克水降温 130 °C、600 秒烧完都是取整的教学值，不是实测数据；真实燃烧还和可燃物形状、气流、生成的二氧化碳与水蒸气有关。白磷约 40 °C、红磷约 240 °C 是课本给出的着火点。用火、灭火请遵守安全规定，不要模仿危险实验。',
    linksTitle: '接着看',
    lk1: '活化能 · 第 0 步：反应为什么要先爬一座能量山（着火点背后的原因）→',
    lk2: '反应速率 · 第 3 步：整块还是粉末——接触面决定机会 →',
    lk3: '质量守恒 · 第 4 步：镁燃烧后为什么变重 →',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《燃烧三要素》的平行版本。'
  },
  en: {
    pageTitle: 'The Fire Triangle · Keeping a Heat Budget',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: The Fire Triangle →',
    navLabel: 'Fire triangle steps',
    tagline: 'A candle, a match and a stove fire look nothing alike, yet each needs the same three things at once: fuel, oxygen, and a temperature at or above the ignition point. In six steps you will first pull the three conditions apart with the classic phosphorus experiment, then keep a “heat budget” that shows why a fire, once lit, keeps itself going — and why taking away any one condition puts it out.',
    nav0: '0 Phosphorus test', nav1: '1 Lighting', nav2: '2 Candle in a jar', nav3: '3 Putting it out', nav4: '4 Chopping', nav5: '5 Wrap-up',

    s0k: 'Step 0 · The phosphorus experiment',
    s0t: 'On the same hot copper plate, why does white phosphorus catch fire and red phosphorus not?',
    s0e: 'The question here: exactly which conditions does burning need? This is the classic textbook experiment. A beaker of hot water is covered with a copper plate; a small piece of <strong>white phosphorus</strong> and one of <strong>red phosphorus</strong> sit on the plate, and another piece of white phosphorus lies at the bottom of the water. Phosphorus is a <strong>fuel</strong> (a substance that can burn). Copper conducts heat well, so the plate is at about the water’s temperature. Every fuel has an <strong>ignition point</strong>, the lowest temperature at which it starts to burn: about 40 °C for white phosphorus and about 240 °C for red. Any two pieces differ in just one condition, so comparing which ones burn separates the conditions one at a time. (White phosphorus is toxic and can ignite by itself in air; this experiment is for teacher demonstration only.)',
    waterSlider: 'Water temperature (°C)', o2btn: 'Bubble oxygen onto the white phosphorus in the water',
    c0: 'Copper plate on hot water: 2 pieces on top, 1 below',
    lblWhite: 'White P (ignites at 40 °C)', lblRed: 'Red P (ignites at 240 °C)', lblUnder: 'White P under water',
    s0lgFlame: 'Flame: burning', s0lgBubble: 'Oxygen bubbles', s0lgCopper: 'Copper plate (≈ water temperature)',
    nmWhite: 'White phosphorus on the plate', nmRed: 'Red phosphorus on the plate', nmUnder: 'White phosphorus under water', nmCopper: 'The copper plate itself',
    burnLine: '{name}: burns.',
    noHeat: '{name}: does not burn — {T} °C is below its ignition point of {ign} °C.',
    noO2: '{name}: does not burn — the water keeps oxygen away.',
    noFuel: '{name}: does not burn — it is hot and in air, but copper is not a fuel.',
    s0hint: 'What to watch: at 80 °C with no oxygen bubbling, compare the white and red phosphorus on the plate (they differ only in ignition point). Then compare the white phosphorus on the plate with the piece under water (they differ only in oxygen). Press the oxygen button and the piece under water bursts into flame too. Finally cool the water below 40 °C: now even the white phosphorus on the plate stops burning.',

    s1k: 'Step 1 · Lighting',
    s1t: 'Why do you have to hold the match there a while before the stick burns on its own?',
    s1e: 'The question here: once the ignition point is reached, why doesn’t the fire go out when you take the match away? Keep a <strong>heat budget</strong> for the stick. The match flame heats it. The stick is hotter than its surroundings, so it keeps losing heat to the air, and the hotter it is, the faster it loses heat. Once it reaches its ignition point it starts burning, and the heat from burning warms it as well. Whether the temperature goes up or down depends on which is bigger each second: heat coming in (match + burning) or heat going out (loss to the air). This model uses a room temperature of 20 °C and an ignition point of 300 °C for the stick (teaching values). Burning in air releases enough heat to hold the stick at about {steady} °C — above the ignition point, so the fire keeps itself going. Below, time (s) runs across and the stick’s temperature (°C) runs up; the pink band marks the time the match is held to it.',
    holdSlider: 'How long the match is held (s)', tcSlider: 'Show the heat budget at time (s)', light1: 'Light it and start the clock', clearHist: 'Clear history',
    c1top: 'Heat budget right now (°C per second up or down)', barMatch: 'Heat from the match', barBurn: 'Heat from burning', barLoss: 'Heat lost to the air',
    c1bot: 'Stick temperature (°C) over time (s)', ignLabel: 'Ignition point {T} °C',
    s1lgNow: 'This attempt', s1lgOld: 'Earlier attempts', s1lgMatch: 'Match held to the stick', lgIgn: 'Ignition point',
    s1progress: 'Clock {t}/20 s. ',
    s1yes: '{prog}Match held for {h} s: the stick reached its ignition point at {ti} s and caught fire; once the match was taken away the temperature settles toward about {Ts} °C, held there by the heat of burning alone.',
    s1no: '{prog}Match held for {h} s: the stick peaked at only {Tm} °C, short of its {Ti} °C ignition point; once the match was gone, heat loss won and the temperature slid back to room temperature.',
    s1hint: 'What to watch: hold for 2 s, press “Light it”, and see the temperature climb part way and fall back. Drag the time slider to the moment the match comes away: only heat loss is left in the budget. Add 0.5 s each time and try again. From {hold} s (the shortest time the model allows) the curve crosses the ignition point and never comes back down — once the match is gone, heat from burning alone is just enough to cover the loss. Grey lines keep your earlier attempts.',

    s2k: 'Step 2 · Candle in a jar',
    s2t: 'Why does a candle under a jar go out? Has the oxygen run out?',
    s2e: 'The question here: cover a burning candle with a glass jar — why does it go out after a while, and what does the size of the jar change? Air is <strong>about 21% oxygen</strong> by volume. The candle keeps using up oxygen inside the jar, so the oxygen share keeps falling. The heat released by burning is proportional to that share; once it is too low, there is not enough heat to hold the temperature above the ignition point (step 1’s heat budget). This model puts that <strong>extinction line</strong> at 16% (a teaching value) and assumes the candle uses 4 mL of oxygen per second in fresh air, in proportion to the oxygen share. The top panel shows the jar and candle; the flame’s size stands for how much the heat released exceeds what is needed to stay at the ignition point. The bottom panel plots the oxygen share in the jar against the time since the jar went on (s).',
    volSlider: 'Jar volume (mL)', cover2: 'Put the jar on',
    c2top: 'Candle under a glass jar', c2bot: 'Oxygen share in the jar (%) over time (s)', minLabel: 'Extinction line {p}%',
    s2lgNow: 'This run', s2lgOld: 'Other volumes', s2lgMin: 'Extinction line', s2lgFlame: 'Flame',
    s2progress: '{t} s: oxygen {phi}%. ',
    s2idle: 'Jar of {V} mL: press “Put the jar on” to start. The model expects the flame to die after about {tout} s.',
    s2readout: '{prog}Jar of {V} mL: the flame dies about {tout} s after the jar goes on. At that moment the jar still holds {pmin}% oxygen, {left}% of what it started with — only {used} mL of oxygen was used, nowhere near all of it. The flame died because the oxygen share got too low to release enough heat.',
    s2hint: 'What to watch: with the 1000 mL jar, press “Put the jar on” and see the flame shrink as the oxygen share falls, dying where the curve meets the 16% line. Then try 250 mL and 2000 mL: double the volume and the flame lasts twice as long. The animation runs at double speed.',

    s3k: 'Step 3 · Putting it out',
    s3t: 'How far do you have to go before a fire is really out?',
    s3e: 'The question here: which side of the triangle does each way of fighting a fire remove, and how much is enough? The top panel is the fire triangle: fuel, oxygen and heat (a temperature at or above the ignition point). Only with all three sides in place can there be a fire. The stick starts out burning steadily in air (about {steady} °C), and at {at} s you act:<br>• <strong>remove the fuel</strong> (cut a firebreak, turn off the gas) — nothing left to burn;<br>• <strong>cover it</strong> (a pan lid, sand) — oxygen is shut out;<br>• <strong>pour water</strong> — water soaks up a lot of heat as it warms and boils away, pulling the temperature below the ignition point. Here each gram of water cools the stick by {wk} °C over one second (a teaching value).<br>The bottom panel plots the stick’s temperature (°C) over time (s); the grey dashed line is what happens if you do nothing.',
    actFuel: 'Remove the fuel', actLid: 'Cover it', actWater: 'Pour water', waterAmt: 'Amount of water (g)',
    c3top: 'The fire triangle right now', sideFuel: 'Fuel', sideO2: 'Oxygen', sideHeat: 'Heat',
    c3bot: 'Stick temperature (°C) over time (s)',
    s3lgOn: 'Side still in place', s3lgOff: 'Side removed', s3lgCurve: 'Temperature after acting', s3lgBase: 'Doing nothing',
    s3progress: '{t} s. ',
    s3fuel: '{prog}Removing the fuel: from {at} s there is nothing to burn, burning stops at once and the stick cools to room temperature. The side removed is fuel.',
    s3lid: '{prog}Covering it: the oxygen under the lid is used up quickly, the heat from burning shrinks with it, and at {to} s the temperature drops below the ignition point — the fire is out. The side removed is oxygen.',
    s3waterOut: '{prog}{w} g of water: the temperature bottoms out at {Tm} °C, below the {Ti} °C ignition point, so burning stops; with no heat from burning the temperature never climbs back — the fire is out. The side removed is heat.',
    s3waterNo: '{prog}{w} g of water: the temperature only dips to {Tm} °C, still above the {Ti} °C ignition point, so burning never stops and the temperature climbs back once the water has boiled off — the fire is still going. This model needs at least about {wmin} g.',
    s3hint: 'What to watch: start with the default, 0.5 g of water — the temperature dips and recovers. Raise the amount one notch at a time and find the first one that puts the fire out. Then press “Remove the fuel” and “Cover it” and see which side of the triangle goes dark. What all three have in common: heat from burning can no longer keep up with heat loss, and once the temperature falls below the ignition point the fire cannot relight itself.',
    quizPrompt: 'Quick check: a pan of oil catches fire while you are cooking. What is the best thing to do?',
    quizA: 'Throw a big bowl of cold water on it', quizB: 'Put the lid on, then turn off the heat', quizC: 'Fan it hard', check: 'Check',
    correct: 'Right. The lid shuts out oxygen and turning off the heat stops the heating. Oil is lighter than water: cold water sinks under the hot oil, flashes into steam and throws burning oil out of the pan, making the fire bigger.',
    wrong: 'Think again: cold water sinks under hot oil, flashes into steam and throws burning oil about; fanning blows in more oxygen. Which choice removes a side without creating a new danger?',

    s4k: 'Step 4 · Chopping',
    s4t: 'Same piece of wood — why does it burn so fiercely once it is chopped up?',
    s4e: 'The question here: with the same mass of wood, how does chopping it finer change how long it takes to burn and how violently heat comes out? Burning happens at the <strong>surface</strong>, where fuel meets oxygen. Cut a 4 cm wooden cube into n slices along each edge and you get n³ small cubes. Each small cube has 1/n² of the original surface, but there are n³ of them, so the total <strong>surface area</strong> grows n times. This model assumes the burn-out time is inversely proportional to both the surface area and the oxygen share, with the whole cube taking 600 s in air (a teaching value). The total heat the wood can release does not change, so the faster it burns, the more heat comes out each second (the <strong>heat output</strong>). Ground to dust, it releases everything in an instant; in a confined space the gas expands violently — a <strong>dust explosion</strong>. That is why flour mills and coal mines ban open flames. Below, the number of slices per edge n runs across and the burn-out time (s) runs up, both on log scales (<a class="xlink" href="../../../chemistry/reactions/reaction-rates/#step3">→ reaction rates, step 3: a lump or a powder</a>).',
    cutSlider: 'Slices per edge n (n = 1, 2, 4 … 4096)',
    gasAirBtn: 'Air (21% oxygen)', gasPureBtn: 'Pure oxygen (100%)',
    c4top: 'Cut into {n}×{n}×{n} pieces, each {s} across', c4bot: 'Burn-out time (s) vs slices per edge n', ref1s: '1 second',
    s4lgAir: 'In air', s4lgPure: 'In pure oxygen', s4lgHist: 'Values of n you tried', s4lgRef: '1-second line',
    gasAir: 'air', gasPure: 'pure oxygen', uSec: 's', uMin: 'min',
    s4readout: '{n} slices per edge: {pieces} pieces, each {size} across, with {n} times the surface of the whole cube. In {gas} it burns out in about {time}, with a heat output {pw} times that of the whole cube in air. {note}',
    noteDust: 'All the heat comes out in under a second — this is why dust can explode when it meets a flame.',
    s4hint: 'What to watch: start at n = 1 and drag right one notch at a time. Each notch doubles the slices and halves the burn-out time, so the plot is a straight sloping line. Then switch to pure oxygen: the whole line drops, and the same wood burns {pure} times faster — which is also why a glowing splint bursts back into flame in pure oxygen.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'What to take away',
    s5fin: 'Burning needs <strong>fuel, oxygen and a temperature at or above the ignition point</strong>, all at once. Together they form a loop: burning releases heat → the heat keeps the temperature up → burning continues. So:<br>• to light a fire you only need to push the temperature past the ignition point once; after that the fire feeds itself;<br>• to put it out you only need to remove one side so that heat released falls behind heat lost; once out, it will not relight on its own;<br>• the oxygen share and the contact surface set how fast it burns: the same wood, ground to dust or put in pure oxygen, burns far more fiercely, even explosively.',
    formula: 'Fire = fuel + oxygen + temperature ≥ ignition point\nSelf-sustaining: heat released ≥ heat lost\nPut it out: remove any one condition',
    boundary: 'Where this holds: the heat budget on this page is a teaching model. The 300 °C ignition point, the 16% extinction line, 4 mL of oxygen per second, 130 °C of cooling per gram of water and the 600 s burn are rounded teaching values, not measurements; real fires also depend on the fuel’s shape, air flow, and the carbon dioxide and steam they produce. About 40 °C for white phosphorus and about 240 °C for red are the textbook ignition points. Follow fire-safety rules and do not copy dangerous experiments.',
    linksTitle: 'Where to next',
    lk1: 'Activation energy · step 0: why a reaction must first climb an energy hill (the reason behind ignition points) →',
    lk2: 'Reaction rates · step 3: a lump or a powder — contact surface decides the chances →',
    lk3: 'Conservation of mass · step 4: why magnesium gets heavier when it burns →',
    foot: 'Written independently with Claude Code (claude-opus-5-5) as a parallel edition of “The Fire Triangle”.'
  }
};

let lang = 'zh';
if (typeof window !== 'undefined') try { lang = window.localStorage.getItem('knowledge-lang') || ((navigator.language || '').startsWith('zh') ? 'zh' : 'en'); } catch (_) { try { lang = (navigator.language || '').startsWith('zh') ? 'zh' : 'en'; } catch (__) { lang = 'zh'; } }
if (lang !== 'en') lang = 'zh';
// Values computed by the model that appear inside static paragraphs (filled by app.js before the first render).
const STATIC_PARAMS = {};
function t(key, params = {}) {
  let text = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  const all = Object.assign({}, STATIC_PARAMS, params);
  Object.keys(all).forEach(name => { if (text.indexOf(`{${name}}`) < 0) return; const v = typeof all[name] === 'function' ? all[name]() : all[name]; text = text.split(`{${name}}`).join(String(v)); });
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
  if (typeof window.refreshFire === 'function') window.refreshFire();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.FIRE_I18N = { t, setLang, getLang: () => lang, STATIC_PARAMS };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
