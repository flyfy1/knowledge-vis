'use strict';
// Float & sink lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '浮与沉 · 和同样大的水比一比',
    back: '← 知识索引',
    compare: '对照另一版本：浮与沉 · 排开的水托住了谁 →',
    navLabel: '浮与沉步骤导航',
    tagline: '一大根木头能浮在水上，一颗小小的铁钉却沉了下去。东西浮还是沉，看的不是它有多重。六步里你会先猜一猜、放进水里看一看，再亲手把木块按进水里、把橡皮泥捏成船、给小潜水艇灌水，最后换成海水。每一次都在比同一件事：它自己的重量，和它排开的水的重量。',
    nav0: '0 猜一猜', nav1: '1 按下去', nav2: '2 球和船', nav3: '3 潜水艇', nav4: '4 海水', nav5: '5 收束',

    s0k: '第 0 步 · 猜一猜',
    s0t: '是不是重的东西就沉，轻的东西就浮？',
    s0e: '这一步要回答：东西浮还是沉，是由它有多重决定的吗？下面有六样东西，每样都写着它有多重（克），和它有多大（<strong>体积</strong>，单位 cm³：1 cm³ 就是边长 1 cm 的小方块那么大）。先猜一猜，再按「放进水里」看看。窍门是：拿一份<strong>和它同样大的水</strong>来比。水有个好记的特点：1 cm³ 的水正好重 1 克，所以它有几 cm³，同样大的水就重几克。比同样大的水轻，就浮；比同样大的水重，就沉。每 1 cm³ 有多重，叫做<strong>密度</strong>（<a class="xlink" href="../../../physics/matter/density/#step0">→ 密度页第 0 步：同样大小，比一比谁重</a>）。图里东西的大小是示意，没有按比例画。',
    pickObj: '选一样：', guessLabel: '我猜它会：', guessFloat: '浮', guessSink: '沉', drop: '放进水里',
    obj_log: '大圆木', obj_apple: '苹果', obj_ice: '冰块', obj_nail: '铁钉', obj_eraser: '橡皮擦', obj_stone: '小石子',
    lgWater: '水', s0lgSame: '天平右盘：和它同样大的水',
    c0a: '先比一比：它和同样大的水谁重', c0b: '再放进水里看看',
    panLeft: '它', panRight: '同样大的水',
    s0readout: '{name}：重 {m} 克，大小 {v} cm³，同样大的水重 {w} 克。它比同样大的水{cmp}。{res}',
    cmpLighter: '轻', cmpHeavier: '重',
    resFloat: '放进水里：浮在水面，有 {pct}% 泡在水下。', resSink: '放进水里：沉到了底。', resWait: '按「放进水里」看看。',
    guessRight: '你猜对了！', guessWrong: '和你猜的不一样。',
    th0Obj: '东西', th0M: '重（克）', th0V: '大小（cm³）', th0W: '同样大的水（克）', th0Guess: '我猜', th0Res: '结果', resFloatS: '浮', resSinkS: '沉', noGuess: '—',
    s0hint: '观察顺序：先选「大圆木」：它重 10000 克，比别的都重得多。猜一猜，再放进水里。再选「铁钉」：它只有 7.9 克，最轻，也放进去看看。每次都看「先比一比」图里的天平：右盘总是和它同样大的水。天平往哪边歪，就能说出它会浮还是沉，和它本身多重没有关系。下面的表记下你试过的每一样。',

    s1k: '第 1 步 · 把木块按下去',
    s1t: '把木块往水里按，水往上托的力会怎么变？',
    s1e: '这一步要回答：把一块浮着的木块往水里按，水往上托它的力会变大还是变小？木块底面 10 cm × 10 cm，高 5 cm（大小 500 cm³），重 300 克。木块泡进水里的部分，会把同样多的水挤开，这些被挤开的水叫<strong>排开的水</strong>，所以水面会升高。水往上托东西的力叫<strong>浮力</strong>，它的大小正好等于排开的水的重量：排开 100 cm³ 水，就是 100 克水，水就往上托住 100 克。拖动滑杆，用手把木块按下去，或者提起来（手的力是粉色箭头）。',
    depthLabel: '木块泡进水里的深度（cm）', letGo: '松手，让它自己漂',
    lgUp: '水往上托（= 排开的水重）', lgWeight: '木块的重量 300 克', lgHand: '手的力', s1lgLevel: '放木块之前的水面',
    c1a: '水槽侧面（按比例画）', c1b: '向上托的力（克），随泡进水里的体积（cm³）',
    s1readDown: '泡进水里 {d} cm，排开 {v} cm³ 水，也就是 {v} 克，水往上托 {v} 克；水面升高 {rise} cm。托力比木块的 300 克多 {h} 克：手要往下按住 {h} 克，它才不会浮上来。',
    s1readUp: '泡进水里 {d} cm，排开 {v} cm³ 水，也就是 {v} 克，水往上托 {v} 克；水面升高 {rise} cm。托力比木块的 300 克少 {h} 克：手要往上提着 {h} 克，它才不会往下沉。',
    s1readFree: '泡进水里 {d} cm，排开 {v} cm³ 水，也就是 {v} 克，水往上托 {v} 克；水面升高 {rise} cm。托力正好等于木块的 300 克：不用手，它自己就漂在这里。',
    s1hint: '观察顺序：从 0 慢慢往右拖：粉色的手先是往上提，箭头越来越短，到 3 cm 时消失；再往右，手变成往下按，箭头越来越长。「向上托的力」图里，绿线是托力，橙线是木块的重量，两条线在 300 cm³ 处相交：这里木块正好自己漂着。按「松手」，木块会自己回到这个位置。',

    s2k: '第 2 步 · 球和船',
    s2t: '同一块橡皮泥，为什么捏成球会沉，捏成船就能浮？',
    s2e: '这一步要回答：橡皮泥还是那一块，形状一变，为什么浮沉就变了？橡皮泥重 90 克，它本身的大小是 60 cm³。捏成实心球，整个泡进水里也只能排开 60 cm³ 水，就是 60 克，水最多托住 60 克，不够 90 克，所以沉。把它捏成薄薄的船，橡皮泥还是那么多，可船的<strong>外形大小</strong>（连同船里的空气一起算）变大了：船往下沉的时候，能排开的水也多了。只要整只船压进水里能排开的水比 90 克多，它不用全沉下去就能被托住。',
    outerLabel: '船的外形大小（cm³，连同里面的空气）',
    lgMaxUp: '最多能托起多少（整个泡进水里时排开的水重）', lgClay: '橡皮泥的重量 90 克',
    c2a: '水槽侧面（形状为示意）', c2b: '比一比（克）', ballTag: '实心球',
    s2readBall: '实心球，60 cm³：最多排开 60 克水，托不住 90 克的橡皮泥，沉到了底。',
    s2readSink: '船的外形 {v} cm³：最多排开 {v} 克水，比橡皮泥的 90 克少，水从船沿漫进去，沉到了底。',
    s2readEdge: '船的外形 {v} cm³：最多正好排开 90 克水，水线刚好到船沿。再重一点点，水就会漫进去。',
    s2readFloat: '船的外形 {v} cm³：最多能排开 {v} 克水，比 90 克多，所以浮住了。它只需要排开 90 克水，所以只沉下去船高的 {pct}%。',
    s2hint: '观察顺序：从 60（实心球）开始往右拖。「比一比」图里，绿色柱是「最多能托起多少」，橙色柱是橡皮泥的重量 90 克。绿色柱比橙色矮的时候，船沉在底；拖到 90，两根柱一样高，水正好到船沿；再往右，船浮起来，船越大，水线越低。橡皮泥的重量一直没变，变的是它能排开多少水。',

    s3k: '第 3 步 · 小潜水艇',
    s3t: '潜水艇的外形不变，它怎么一会儿浮、一会儿沉？',
    s3e: '这一步要回答：外形大小不能变的时候，还有什么办法让东西从浮变成沉？做一只小「潜水艇」：一只封好的小瓶，外形大小 100 cm³，空瓶重 80 克，里面有一个能装 0 到 40 克水的<strong>水舱</strong>。整只瓶泡进水里，最多排开 100 克水，水最多托住 100 克。往水舱里灌水，瓶的总重量变大；把水排出去，总重量变小。外形不变，变的是它自己的重量。',
    fillLabel: '水舱里的水（克）',
    lgTank: '水舱里的水', lgSubW: '空瓶的重量 80 克（叠上青色的水，就是总重量）',
    c3a: '水槽侧面（形状为示意）', c3b: '比一比（克）',
    s3readFloat: '水舱里 {w} 克水，总重 {tot} 克，比最多能托起的 100 克轻：浮在水面，{pct}% 在水下。',
    s3readHover: '水舱里 {w} 克水，总重正好 100 克，和最多能托起的 100 克一样：它停在水里，不上也不下（叫悬浮）。',
    s3readSink: '水舱里 {w} 克水，总重 {tot} 克，比最多能托起的 100 克重：一直沉到底。',
    s3hint: '观察顺序：从 0 克开始往右拖：每多 2 克水，潜水艇露出水面的部分就少一点。拖到 20 克，总重正好 100 克，它停在水里不上也不下。再多加一点，它就沉到底。再往左拖回 18 克，它又浮上来。真正的潜水艇也是用水舱灌水、排水来下潜和上浮的。',

    s4k: '第 4 步 · 换成海水',
    s4t: '船从河里开到海里，会浮得高一点还是低一点？',
    s4e: '这一步要回答：换一种水，同一只船浮的深浅会变吗？鸡蛋在淡水里会沉，在很咸的盐水里呢？海水和盐水里溶着盐。同样一杯（100 cm³），淡水重 100 克，海水重约 102.5 克，很咸的盐水重 115 克。水「更重」，排开同样多的水就能托起更多，东西就用不着沉那么深。小船是一个底面 10 cm × 10 cm 的盒子，重 600 克；鸡蛋重 60 克，大小 56 cm³。',
    liquidLabel: '换成：', lqFresh: '淡水', lqSea: '海水', lqBrine: '很咸的盐水',
    lgNow: '这次的水线', lgMarks: '试过的水线（船身上的刻线）',
    c4: '同一只船和同一个鸡蛋（船按比例，鸡蛋为示意）', c4b: '船身放大：离船底的高度（cm）',
    s4readout: '{liquid}：100 cm³ 重 {cup} 克。小船要排开 600 克水，只需要泡下去 {draft} cm。鸡蛋：同样大的这种水重 {egg} 克，{eggRes}',
    eggSink: '比鸡蛋的 60 克轻，鸡蛋沉到底。', eggFloat: '比鸡蛋的 60 克重，鸡蛋浮起来，露出一小点。',
    s4hint: '观察顺序：先点「淡水」，看船身上的水线（「船身放大」图把船底以上 4.5–6.5 cm 这一段放大了，纵轴是离船底的高度）；再点「海水」「很咸的盐水」：水越咸，船泡下去越浅（6 cm → 5.85 cm → 5.22 cm），船身上留下的刻线一条比一条低。再看鸡蛋：淡水和海水里它都沉在底，只有很咸的盐水能把它托起来。真实的大船船身上也画着几条吃水线，就是因为它在淡水和海水里浮的深浅不一样。',

    s5k: '第 5 步 · 收束', s5t: '浮还是沉：和同样大的水比一比',
    s5fin: '回头看：<strong>第 0 步</strong>，东西浮还是沉，不看它本身有多重，而是和同样大的水比：比同样大的水轻就浮，重就沉。<strong>第 1 步</strong>，泡进水里的部分把水排开，水往上托的力等于排开的水的重量；浮着的东西，正好排开和自己一样重的水。<strong>第 2 步</strong>，把橡皮泥捏成船，外形变大，能排开的水变多，就浮起来了。<strong>第 3 步</strong>，潜水艇外形不变，靠水舱改变自己的重量来浮和沉。<strong>第 4 步</strong>，水越咸越「重」，托力越大，船浮得越高，鸡蛋也能被托起来。',
    formula: '浮力 = 排开的水的重量\n浮着时：排开的水重 = 自己的重量\n比同样大的水轻 → 浮；比同样大的水重 → 沉',
    boundary: '说明：本页把淡水当作 1 cm³ 重 1 克；「水托住多少克」是说水往上托的力，和多少克东西的重量一样大。东西都当作不吸水、不会翻；船和潜水艇不漏水。第 0 步各种东西的重量和大小是常见的典型值，真实的苹果、石子各不相同；海水和盐水的轻重也是典型值。',
    quiz: '一个玩具重 30 克，大小 50 cm³。把它放进淡水里，会怎样？',
    quizA: '沉到底', quizB: '浮着，排开 50 克水', quizC: '浮着，排开 30 克水',
    check: '核对',
    correct: '对！同样大的水重 50 克，玩具只有 30 克，比水轻，所以浮。浮着的时候，它只要排开和自己一样重的水：{d} 克，也就是 {d} cm³，有 {pct}% 泡在水下。',
    wrong: '再想想：先和同样大的水比（50 cm³ 的水重 50 克），判断浮还是沉；浮着的时候，排开的水和它自己一样重。',
    linksTitle: '接着去哪',
    lk1: '→ 密度页第 0 步：同样大小，比一比谁更重',
    lk2: '→ 浮力页第 1 步：浮力等于排开的水的重量（初中，用弹簧秤来量）',
    lk3: '→ 浮力页第 4 步：钢做的大船为什么能浮',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《浮与沉 · 排开的水托住了谁》的平行版本。'
  },
  en: {
    pageTitle: 'Float or Sink · Weigh It Against the Same Amount of Water',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Float & Sink · What the Displaced Water Holds Up →',
    navLabel: 'Float and sink step navigation',
    tagline: 'A huge log floats, yet a tiny iron nail sinks. Whether something floats has nothing to do with how heavy it is. In six steps you will guess and test, push a block of wood under water, shape clay into a boat, fill a little submarine with water, and finally switch to sea water. Every time you compare the same two things: how heavy the object is, and how heavy the water it pushes aside is.',
    nav0: '0 Guess', nav1: '1 Push down', nav2: '2 Ball & boat', nav3: '3 Submarine', nav4: '4 Sea water', nav5: '5 Wrap-up',

    s0k: 'Step 0 · Make a guess',
    s0t: 'Do heavy things sink and light things float?',
    s0e: 'This step asks: does how heavy something is decide whether it floats? Below are six objects. Each one shows how heavy it is (in grams) and how big it is (its <strong>volume</strong>, in cm³: 1 cm³ is a little cube 1 cm on each side). Guess first, then press “Put it in the water”. The trick is to compare it with <strong>the same amount of water</strong>. Water has a handy property: 1 cm³ of water weighs exactly 1 gram, so however many cm³ the object is, that same amount of water weighs that many grams. Lighter than the same amount of water: it floats. Heavier: it sinks. How heavy each 1 cm³ is has a name, <strong>density</strong> (<a class="xlink" href="../../../physics/matter/density/#step0">→ Density, step 0: same size, which is heavier?</a>). The objects in the picture are not drawn to scale.',
    pickObj: 'Pick one:', guessLabel: 'I think it will:', guessFloat: 'float', guessSink: 'sink', drop: 'Put it in the water',
    obj_log: 'Big log', obj_apple: 'Apple', obj_ice: 'Ice cube', obj_nail: 'Iron nail', obj_eraser: 'Eraser', obj_stone: 'Pebble',
    lgWater: 'water', s0lgSame: 'right pan: the same amount of water',
    c0a: 'First weigh it against the same amount of water', c0b: 'Then put it in the water',
    panLeft: 'object', panRight: 'same-size water',
    s0readout: '{name}: weighs {m} g and is {v} cm³; the same amount of water weighs {w} g. It is {cmp} than the same amount of water. {res}',
    cmpLighter: 'lighter', cmpHeavier: 'heavier',
    resFloat: 'In the water: it floats, with {pct}% under the surface.', resSink: 'In the water: it sinks to the bottom.', resWait: 'Press “Put it in the water” to see.',
    guessRight: 'You guessed right!', guessWrong: 'Not what you guessed.',
    th0Obj: 'Object', th0M: 'Weight (g)', th0V: 'Size (cm³)', th0W: 'Same-size water (g)', th0Guess: 'My guess', th0Res: 'Result', resFloatS: 'floats', resSinkS: 'sinks', noGuess: '—',
    s0hint: 'What to try: pick “Big log” first. It weighs 10,000 g, far more than anything else. Guess, then put it in. Then pick “Iron nail”: only 7.9 g, the lightest, and put that in too. Each time, look at the balance in the “First weigh it” panel: the right pan always holds the same amount of water. Which way the balance tips tells you whether it floats or sinks, whatever the object itself weighs. The table below keeps every object you have tried.',

    s1k: 'Step 1 · Push the block down',
    s1t: 'Push a block of wood into the water. How does the water’s upward push change?',
    s1e: 'This step asks: as you push a floating block deeper, does the water push up on it harder or more gently? The block has a 10 cm × 10 cm base and is 5 cm tall (500 cm³), and it weighs 300 g. The part of the block under water shoves the same amount of water out of the way; that water is the <strong>displaced water</strong>, which is why the water level rises. The water’s upward push on the block is the <strong>buoyant force</strong>, and it is exactly as big as the weight of the displaced water: push aside 100 cm³ of water, which is 100 g of water, and the water holds up 100 g. Drag the slider to push the block down or lift it up by hand (the hand’s force is the pink arrow).',
    depthLabel: 'How deep the block is in the water (cm)', letGo: 'Let go and let it float',
    lgUp: 'water pushing up (= weight of displaced water)', lgWeight: 'block’s weight, 300 g', lgHand: 'your hand', s1lgLevel: 'water level before the block went in',
    c1a: 'Tank, side view (to scale)', c1b: 'Upward push (g) vs volume under water (cm³)',
    s1readDown: '{d} cm under water: it pushes aside {v} cm³ of water, which is {v} g, so the water holds up {v} g; the level rises {rise} cm. That is {h} g more than the block’s 300 g, so your hand has to hold it down with {h} g or it will bob up.',
    s1readUp: '{d} cm under water: it pushes aside {v} cm³ of water, which is {v} g, so the water holds up {v} g; the level rises {rise} cm. That is {h} g less than the block’s 300 g, so your hand has to hold it up with {h} g or it will sink further.',
    s1readFree: '{d} cm under water: it pushes aside {v} cm³ of water, which is {v} g, so the water holds up {v} g; the level rises {rise} cm. That exactly matches the block’s 300 g: no hand needed, it floats right here on its own.',
    s1hint: 'What to try: drag slowly from 0 to the right. At first the pink hand pulls up, with a shorter and shorter arrow, until it vanishes at 3 cm; further right the hand presses down, harder and harder. In the “Upward push” chart, the green line is the upward push and the orange line is the block’s weight; they cross at 300 cm³, where the block floats by itself. Press “Let go” and the block returns to that spot on its own.',

    s2k: 'Step 2 · Ball or boat',
    s2t: 'Why does the same lump of clay sink as a ball but float as a boat?',
    s2e: 'This step asks: it is still the same clay, so why does changing its shape change whether it floats? The clay weighs 90 g and takes up 60 cm³ by itself. Rolled into a solid ball, even fully under water it can only push aside 60 cm³ of water, which is 60 g, so the water can hold up at most 60 g. That is less than 90 g, so it sinks. Press it into a thin boat: the clay is the same, but the boat’s <strong>outside size</strong> (counting the air inside it) is bigger, so as it settles it can push aside more water. As long as the whole boat, pressed under, would push aside more than 90 g of water, it gets held up before it goes all the way under.',
    outerLabel: 'Outside size of the boat (cm³, air inside included)',
    lgMaxUp: 'most the water can hold up (water pushed aside when fully under)', lgClay: 'clay’s weight, 90 g',
    c2a: 'Tank, side view (shapes are a sketch)', c2b: 'Compare (g)', ballTag: 'solid ball',
    s2readBall: 'Solid ball, 60 cm³: it can push aside at most 60 g of water, not enough to hold up 90 g of clay, so it sinks to the bottom.',
    s2readSink: 'Boat of {v} cm³: it can push aside at most {v} g of water, less than the clay’s 90 g; water spills over the side and it sinks to the bottom.',
    s2readEdge: 'Boat of {v} cm³: at most it pushes aside exactly 90 g of water, so the water comes right up to the rim. Any heavier and water would spill in.',
    s2readFloat: 'Boat of {v} cm³: it could push aside up to {v} g of water, more than 90 g, so it floats. It only needs to push aside 90 g, so just {pct}% of its height sits under water.',
    s2hint: 'What to try: start at 60 (the solid ball) and drag right. In the “Compare” chart, the green bar is “the most the water can hold up”, the orange bar is the clay’s 90 g. While green is shorter than orange the boat lies on the bottom; at 90 the bars are level and the water reaches the rim; further right the boat floats, and the bigger it is, the lower its waterline. The clay never got heavier or lighter; what changed is how much water it can push aside.',

    s3k: 'Step 3 · A little submarine',
    s3t: 'A submarine can’t change its shape. How does it float one moment and sink the next?',
    s3e: 'This step asks: if the outside size can’t change, how else can you make something go from floating to sinking? Make a little “submarine”: a sealed bottle with an outside size of 100 cm³. The empty bottle weighs 80 g, and inside it has a <strong>ballast tank</strong> that can hold 0 to 40 g of water. Fully under water the bottle pushes aside 100 g of water, so the water can hold up at most 100 g. Let water into the tank and the bottle gets heavier; push water out and it gets lighter. The outside stays the same; what changes is its own weight.',
    fillLabel: 'Water in the ballast tank (g)',
    lgTank: 'water in the tank', lgSubW: 'empty bottle, 80 g (stack the cyan water on top for the total weight)',
    c3a: 'Tank, side view (shapes are a sketch)', c3b: 'Compare (g)',
    s3readFloat: '{w} g of water in the tank, {tot} g in total, lighter than the 100 g the water can hold up: it floats at the surface with {pct}% under water.',
    s3readHover: '{w} g of water in the tank, exactly 100 g in total, the same as the 100 g the water can hold up: it stays put under water, neither rising nor sinking (this is called hovering).',
    s3readSink: '{w} g of water in the tank, {tot} g in total, heavier than the 100 g the water can hold up: it sinks all the way to the bottom.',
    s3hint: 'What to try: start at 0 g and drag right. Every extra 2 g of water and a little less of the submarine shows above the surface. At 20 g the total is exactly 100 g and it stays where it is under water. Add a little more and it sinks to the bottom. Drag back to 18 g and up it comes again. Real submarines dive and surface the same way, by letting water into their ballast tanks and blowing it out again.',

    s4k: 'Step 4 · Into the sea',
    s4t: 'Sail a boat from a river into the sea. Does it float higher or lower?',
    s4e: 'This step asks: in a different kind of water, does the same boat float deeper or shallower? An egg sinks in fresh water; what about very salty water? Sea water and salt water have salt dissolved in them. A cup of 100 cm³ weighs 100 g if it is fresh water, about 102.5 g if it is sea water, and 115 g if it is very salty water. When the water is “heavier”, pushing aside the same amount holds up more, so things don’t need to sit as deep. The boat is a box with a 10 cm × 10 cm bottom weighing 600 g; the egg weighs 60 g and is 56 cm³.',
    liquidLabel: 'Switch to:', lqFresh: 'Fresh water', lqSea: 'Sea water', lqBrine: 'Very salty water',
    lgNow: 'this waterline', lgMarks: 'waterlines you’ve tried (marks on the hull)',
    c4: 'Same boat, same egg (boat to scale, egg a sketch)', c4b: 'Hull close-up: height above the bottom (cm)',
    s4readout: '{liquid}: 100 cm³ weighs {cup} g. The boat must push aside 600 g of water and only needs to sit {draft} cm deep. The egg: the same amount of this water weighs {egg} g, {eggRes}',
    eggSink: 'less than the egg’s 60 g, so the egg sinks to the bottom.', eggFloat: 'more than the egg’s 60 g, so the egg floats up with a little bit showing.',
    s4hint: 'What to try: click “Fresh water” and note the waterline on the hull (the “Hull close-up” chart magnifies the stretch 4.5–6.5 cm above the hull bottom; its vertical axis is height above the bottom); then click “Sea water” and “Very salty water”. The saltier the water, the shallower the boat sits (6 cm → 5.85 cm → 5.22 cm), and each mark it leaves on the hull is lower than the last. Now watch the egg: in fresh and sea water it stays on the bottom, and only very salty water lifts it. Real ships have several load lines painted on their hulls for exactly this reason: they float at different depths in fresh water and in the sea.',

    s5k: 'Step 5 · Wrap-up', s5t: 'Float or sink: weigh it against the same amount of water',
    s5fin: 'Looking back. <strong>Step 0</strong>: whether something floats doesn’t depend on how heavy it is, but on how it compares with the same amount of water: lighter floats, heavier sinks. <strong>Step 1</strong>: the part under water pushes water aside, and the water pushes up with a force equal to the weight of that displaced water; a floating object pushes aside exactly its own weight of water. <strong>Step 2</strong>: shaping clay into a boat makes its outside bigger, so it can push aside more water and floats. <strong>Step 3</strong>: a submarine keeps its shape and floats or sinks by changing its own weight with its ballast tank. <strong>Step 4</strong>: saltier water is “heavier”, pushes up harder, lifts the boat higher, and can even hold up an egg.',
    formula: 'buoyant force = weight of the water pushed aside\nwhen floating: water pushed aside weighs the same as the object\nlighter than the same amount of water → floats; heavier → sinks',
    boundary: 'Notes: this page treats 1 cm³ of fresh water as weighing 1 g; “the water holds up so many grams” means it pushes up as hard as that many grams weigh. Objects are taken not to soak up water or tip over, and the boat and submarine don’t leak. The weights and sizes in step 0 are typical values; real apples and pebbles all differ. The weights of sea water and salt water are typical values too.',
    quiz: 'A toy weighs 30 g and is 50 cm³. What happens when you put it in fresh water?',
    quizA: 'It sinks to the bottom', quizB: 'It floats, pushing aside 50 g of water', quizC: 'It floats, pushing aside 30 g of water',
    check: 'Check',
    correct: 'Right! The same amount of water weighs 50 g and the toy only 30 g, so it is lighter and floats. While floating it only needs to push aside its own weight of water: {d} g, which is {d} cm³, so {pct}% of it is under water.',
    wrong: 'Think again: first compare it with the same amount of water (50 cm³ of water weighs 50 g) to decide float or sink; when something floats, the water it pushes aside weighs the same as it does.',
    linksTitle: 'Where to go next',
    lk1: '→ Density, step 0: same size, which is heavier?',
    lk2: '→ Buoyancy, step 1: the buoyant force equals the weight of the water pushed aside (middle school, measured with a spring scale)',
    lk3: '→ Buoyancy, step 4: why a big steel ship floats',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Float & Sink · What the Displaced Water Holds Up”.'
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
