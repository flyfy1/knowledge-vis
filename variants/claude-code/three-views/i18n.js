'use strict';
// Three views lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '三视图 · 从三个方向把积木压扁',
    back: '← 知识索引',
    compare: '对照另一版本：三视图 · 三张影子拼回立体 →',
    navLabel: '三视图步骤导航',
    tagline: '桌上一堆小正方体积木，从正面、左面、上面各看一眼，就得到三张平面图。七步里你会看到：每张图是怎样把立体「压扁」得来的；三张图为什么按固定位置摆、哪些长度必须对齐；只给两张图时为什么还猜不准是哪堆积木；以及怎样由三张图认出立体、算出它要刷几个面的漆。',
    nav0: '0 搭积木', nav1: '1 压扁成视图', nav2: '2 三图对齐', nav3: '3 两张够吗', nav4: '4 认立体', nav5: '5 刷油漆', nav6: '6 收束',
    lgTop: '朝上的面', lgFront: '朝前的面', lgLeft: '朝左的面',
    vFront: '主视图', vLeft: '左视图', vTop: '俯视图',
    sideFront: '正面', sideLeft: '左面',
    rowB: '后排', rowM: '中排', rowF: '前排',
    pL: 'L 形', pStairs: '阶梯', pMiddle: '中间高', pValley: '凹槽', pTowers: '对角双塔', pClear: '清空',

    s0k: '第 0 步 · 搭一堆积木',
    s0t: '一张平面的表，能记下一堆立体积木吗？',
    s0e: '这一步要回答：怎样把一堆积木准确地记在纸上？桌面上画好 3 × 3 的格子，每格竖着摞 0 到 3 个一样大的小正方体，不允许悬空。左边（窄屏时在上方）的按钮表就是从<strong>正上方</strong>看到的格子：上面一行是离你最远的<strong>后排</strong>，下面一行是离你最近的<strong>前排</strong>，格里的数是这一格摞了几块。点一格，块数按 0 → 1 → 2 → 3 → 0 循环。画布是同一堆积木从<strong>左前上方</strong>看过去的立体图，三种颜色分别是朝上、朝前、朝左的面，后面几步会一直用这三种颜色。',
    editorTitle: '每格摞几块（点一下加一块）',
    cellAria: '{row}从左数第 {x} 格：{v} 块',
    c0a: '积木的立体图',
    s0readout: '一共 {n} 块。各格块数：{rows}（每排从左到右）。',
    rowsFmt: '后排 {b}，中排 {m}，前排 {f}',
    s0hint: '观察顺序：先点几个预设，对照按钮表上的数和立体图里每一摞的高度；再自己点格子增减，看对应的那一摞长高或变矮。立体图下方的箭头标出「正面」和「左面」：后面说的主视图、左视图，就是顺着这两个箭头看过去。按钮表最下沿的青线就是正面。',

    s1k: '第 1 步 · 三个方向看',
    s1t: '从一个方向看过去，立体为什么变成一张平面图？',
    s1e: '这一步要回答：从正面看一堆积木，看到的平面图里每个方格是怎样来的？想象把积木沿着视线一直推到对面的墙上，压成薄薄一层：同一条视线上的几块叠在一起，只留下一个方格。所以从正面看到的图（叫<strong>主视图</strong>）里，每一列的高度等于这一列前、中、后三格里<strong>最高</strong>的那一摞。同理，从左往右看得到<strong>左视图</strong>，每一列的高度等于那一排左、中、右三格里最高的一摞；从上往下看得到<strong>俯视图</strong>，它只记哪些格子上有积木，看不出高低。拖「压扁程度」或按播放，看积木怎样被压到墙上；右图是压完后得到的视图。',
    dirF: '主视图：从前往后看', dirL: '左视图：从左往右看', dirT: '俯视图：从上往下看',
    p1: '压扁程度（0 = 原样，1 = 压平）', play1: '播放压扁',
    c1a: '沿视线把积木压到墙上', c1b: '压平后得到的视图',
    s1readF: '主视图：从左到右各列高 {v}，各是那一列前、中、后三格里最高的一摞。图上共 {cells} 个方格，积木却有 {n} 块：被前面挡住的块在图上看不出来。',
    s1readL: '左视图：从左到右各列高 {v}。从左边看过去，后排在左、前排在右；每列是那一排左、中、右三格里最高的一摞。图上 {cells} 个方格，积木 {n} 块。',
    s1readT: '俯视图：{cells} 个格子上有积木。它只记哪里有，看不出每格摞了几块（积木共 {n} 块）。',
    s1hint: '观察顺序：先选主视图，把压扁程度从 0 拖到 1，看同一列前后几摞怎样叠到后墙上、最后只剩最高那一摞的轮廓；再换左视图（压到右墙上）、俯视图（压到地面上）各做一次。回到第 0 步改积木，这里会跟着变。',

    s2k: '第 2 步 · 三图对齐',
    s2t: '三张图摆在一起，哪些长度一定相等？',
    s2e: '这一步要回答：三张视图为什么要按固定位置摆，摆好以后能检查什么？按我国制图的习惯：<strong>主视图</strong>在左上，<strong>俯视图</strong>放在它正下方，<strong>左视图</strong>放在它正右方。这样摆，每两张图共用一个方向的尺寸：主视图和俯视图都量得到左右方向的长，所以要<strong>长对正</strong>（同一列上下对齐）；主视图和左视图都量得到上下方向的高，所以要<strong>高平齐</strong>（同一层左右对齐）；俯视图和左视图都量得到前后方向的宽，所以要<strong>宽相等</strong>。俯视图和左视图不在一条直线上，画图时借一条 45° 斜线把前后方向的宽转过去。在俯视图和左视图里，<strong>离主视图远的一侧是物体的前面</strong>。',
    rLen: '长对正', rHt: '高平齐', rWd: '宽相等',
    c2a: '按标准位置摆放的三视图',
    lgHl: '选中的列 / 层 / 排', lgGuide: '对齐线（宽相等经 45° 斜线转折）',
    i2Len: '选第几列（从左数）', i2Ht: '选第几层（从下数）', i2Wd: '选第几排（从前数）',
    s2readLen: '长对正：主视图从左数第 {i} 列高 {f} 格；俯视图正下方同一列里，有 {t} 格有积木。两张图左右方向的总长都是 {L} 格。',
    s2readHt: '高平齐：从下数第 {i} 层，主视图里有 {f} 格、左视图里有 {l} 格，它们在同一高度左右对齐。两张图的总高都是 {H} 格。',
    s2readWd: '宽相等：{row}在俯视图里是从下数第 {i} 行，有 {t} 格积木；转过 45° 线后，在左视图里是从右数第 {i} 列，高 {l} 格。两张图前后方向的总宽都是 {D} 格。',
    s2hint: '观察顺序：先选「长对正」，拖滑杆，看高亮的一列在主视图和俯视图里上下对齐；再选「高平齐」，看同一层左右对齐；最后选「宽相等」，看俯视图的一行沿 45° 斜线转成左视图的一列：前排在俯视图最下面，转过去成了左视图最右边的一列。',

    s3k: '第 3 步 · 两张图够吗',
    s3t: '只给主视图和左视图，能确定是哪堆积木吗？',
    s3e: '这一步要回答：知道了主视图和左视图，积木的摆法和块数是不是就定了？页面把 3 × 3 格、每格 0 到 3 块的全部 4⁹ = 262144 种摆法逐一检查，找出主视图、左视图都和第 0 步那堆积木一样的所有摆法（下面的预设按钮会改动第 0 步的积木）。右图是已知的视图，左图是其中一种摆法：<strong>粉色</strong>是比你的积木多出来的块，<strong>虚线框</strong>是你的积木有、这种摆法没有的块。再告诉你俯视图（哪些格子有积木），可能的摆法会少很多，但不一定只剩一种。',
    c3a: '符合已知视图的一种摆法', c3b: '已知的视图',
    lgExtra: '比你的积木多出的块', lgMissing: '你的积木有、这种摆法没有的块',
    top3On: '去掉俯视图，只用两张', top3Off: '再告诉你俯视图',
    min3: '块数最少的一种', max3: '块数最多的一种', next3: '看下一种', mine3: '你的积木',
    given2: '主视图、左视图', given3: '主视图、左视图、俯视图',
    s3readout: '{given}都相同的摆法共 {n} 种，块数最少 {min}、最多 {max}（你的积木 {you} 块）。正在看第 {k} 种：{c} 块{mine}。',
    mineNote: '，就是你的积木',
    s3hint: '观察顺序：先只用两张图，按「最少」「最多」，看粉色块和虚线框在哪里：它们都藏在别的积木身后，主视图和左视图看不出来。再按「再告诉你俯视图」，种数和块数范围立刻缩小。再试「阶梯」：三张图都给了，仍有 5 种摆法、9 到 11 块。',

    s4k: '第 4 步 · 由三视图认立体',
    s4t: '给你三张图，你能挑出是哪一堆吗？',
    s4e: '这一步要回答：拿到三视图，怎样判断它画的是哪一堆积木？把前两步反过来用：对每个候选立体，先想它的主视图（每列取最高），再想左视图（每排取最高，后排在左），最后想俯视图（哪些格有积木），三张都对上才算。下面 A、B、C 三个立体都和第 0 步一样从左前上方看，其中只有一个的三视图和上图完全一致。',
    c4a: '题目给出的三视图', c4b: '候选立体 A、B、C',
    q4: '第 {i}/{N} 题', check4: '核对', next4: '下一题',
    s4ok: '对。{c} 的主视图、左视图、俯视图都和上图一致。',
    s4bad: '不对。{c} 的{views}和上图不一样。',
    s4pick: '先选一个立体。',
    viewJoin: '、',
    s4hint: '观察顺序：先用主视图排除，再用左视图，最后用俯视图。有的题前两张图都对得上，只有俯视图能分辨，这正是第 3 步说的「两张图不够」。',

    s5k: '第 5 步 · 刷油漆',
    s5t: '给这堆积木刷漆（底面也刷），一共要刷几个小方格面？',
    s5e: '这一步要回答：一堆积木露在外面的面一共有几个（每个小正方体的一个面算 1）？有两种数法。一是减法：每块 6 个面，共 6N 个（N 是块数）；两块贴在一起的地方叫一处<strong>贴合</strong>，那里两个面互相挡住，所以表面积 <strong>S = 6N − 2 × 贴合处数</strong>。二是按方向数：朝上和朝下的面各等于俯视图的格数；朝前、朝后的面各至少有主视图那么多；朝左、朝右的面各至少有左视图那么多。所以 <strong>S ≥ 2 ×（主视图 + 左视图 + 俯视图的格数）</strong>。取等号的条件是没有藏起来的面：任何一排、一列的高度都不出现「高、低、高」那样的凹槽或空隙。',
    c5a: '当前的积木', c5b: '实际表面积与三视图给出的下限',
    bar1: '实际表面积 S', bar2: '2 ×（主 + 左 + 俯）',
    lgTB: '朝上、朝下', lgFB: '朝前、朝后', lgLR: '朝左、朝右', lgHidden: '藏起来的面',
    s5readout: '{n} 块、{j} 处贴合：S = 6 × {n} − 2 × {j} = {S}。按方向数：上下 {tb}、前后 {fb}、左右 {lr}，合计也是 {S}。三视图格数：主 {F} + 左 {L} + 俯 {T} = {sum}，2 × {sum} = {bound}。{note}',
    s5eq: '两者相等，没有藏起来的面。',
    s5gap: '比实际少 {h}：有 {h} 个面藏在凹槽或空隙里，从前后左右上下六个方向都看不到。',
    s5hint: '观察顺序：先点「凹槽」，比较右图两根条：上面那根是实际的面，下面那根是 2 × 三视图格数，它比上面那根短出的一截（粉色斜纹框）就是凹槽两侧互相挡住的面。再点「L 形」或「中间高」，两根条一样长。也可以回第 0 步自己搭，这里会跟着更新。',

    s6k: '第 6 步 · 收束',
    s6t: '三张视图记下了什么，又丢掉了什么',
    s6fin: '一张视图就是把立体沿视线压扁到一面墙上：主视图每列取最高，左视图每排取最高，俯视图只记有没有。三张图按「俯视图在下、左视图在右」摆好，就有<strong>长对正、高平齐、宽相等</strong>。视图丢掉了被挡住的块，所以两张图常常定不出立体，三张也未必唯一；反过来，它们给出了表面积的下限。',
    formula: '主视图：每列取前、中、后的最大值\n左视图：每排取左、中、右的最大值，后排在左\n俯视图：有积木的格子\nS = 6N − 2 × 贴合 ≥ 2 ×（主 + 左 + 俯）',
    boundary: '适用范围：本页只用一样大的小正方体，3 × 3 格、每格最多 3 块、不悬空；立体图是等轴测画法（不是透视，远处不变小）；视图按我国常用的摆法（俯视图在主视图下方，左视图在右方）。带斜面、曲面或悬空部分的物体，视图里还会有斜线和虚线（被挡住的轮廓），本页没有涉及。',
    linksTitle: '接着看',
    lk1: '→ 立体几何页第 1 步：长宽高放大，表面积和体积各变几倍',
    lk2: '→ 立体几何页第 5 步：把立体剪开摊平成展开图',
    lk3: '→ 空间对角线页第 0 步：在长方体里认出直角三角形',
    lk4: '→ 坐标平面页第 2 步：用两个数记一个位置（按钮表的格子就是这么定位的）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《三视图 · 三张影子拼回立体》的平行版本。'
  },
  en: {
    pageTitle: 'Three Views · Flattening a Stack From Three Sides',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Three Views · Three Shadows Rebuild a Solid →',
    navLabel: 'Three views steps',
    tagline: 'Look at a pile of small cubes from the front, from the left and from above, and you get three flat pictures. In seven steps you will see how each picture comes from squashing the solid flat, why the three are laid out in fixed places and which lengths must line up, why two pictures still leave you guessing which pile it is, and how to recognise a solid from its three views and count how many faces you would have to paint.',
    nav0: '0 Build', nav1: '1 Squash to a view', nav2: '2 Line them up', nav3: '3 Are two enough?', nav4: '4 Spot the solid', nav5: '5 Paint it', nav6: '6 Wrap-up',
    lgTop: 'faces pointing up', lgFront: 'faces pointing front', lgLeft: 'faces pointing left',
    vFront: 'Front view', vLeft: 'Left view', vTop: 'Top view',
    sideFront: 'Front', sideLeft: 'Left',
    rowB: 'Back', rowM: 'Middle', rowF: 'Front',
    pL: 'L-shape', pStairs: 'Stairs', pMiddle: 'Tall middle', pValley: 'Groove', pTowers: 'Diagonal towers', pClear: 'Clear',

    s0k: 'Step 0 · Build a stack',
    s0t: 'Can a flat table record a solid pile of cubes?',
    s0e: 'This step asks: how do you write a pile of cubes down on paper exactly? Mark a 3 × 3 grid on the table and stack 0 to 3 identical cubes upright in each square, with nothing floating. The button grid on the left (above, on narrow screens) is that grid seen from <strong>directly above</strong>: its top row is the <strong>back</strong> row, furthest from you, its bottom row is the <strong>front</strong> row, nearest you, and each number is how many cubes that square holds. Click a square to cycle 0 → 1 → 2 → 3 → 0. The canvas shows the same pile seen from <strong>above, front-left</strong>; its three colours are the faces pointing up, front and left, and later steps keep those colours.',
    editorTitle: 'Cubes per square (click to add one)',
    cellAria: '{row} row, square {x} from the left: {v} cubes',
    c0a: 'The pile of cubes in 3D',
    s0readout: '{n} cubes in all. Per square: {rows} (each row left to right).',
    rowsFmt: 'back {b}, middle {m}, front {f}',
    s0hint: 'What to watch: try a few presets and match each number in the button grid to the height of a stack in the picture; then click squares yourself and watch that stack grow or shrink. The arrows under the picture mark “Front” and “Left”: the front and left views in the next steps look along those arrows. The cyan line along the bottom of the button grid is the front edge.',

    s1k: 'Step 1 · Look from three sides',
    s1t: 'Why does looking from one direction turn a solid into a flat picture?',
    s1e: 'This step asks: when you look at the pile from the front, where does each square in the picture come from? Imagine pushing the cubes along your line of sight until they are pressed flat against the far wall. Cubes on the same line of sight pile onto one square. So in the picture seen from the front (the <strong>front view</strong>), each column is as tall as the <strong>tallest</strong> stack among the front, middle and back squares of that column. Likewise, looking from the left gives the <strong>left view</strong>, where each column is the tallest stack in that row from left to right; looking down gives the <strong>top view</strong>, which only records which squares hold cubes, not how high. Drag “squash” or press play to watch the cubes pressed onto the wall; the right panel is the view you get.',
    dirF: 'Front view: look front to back', dirL: 'Left view: look left to right', dirT: 'Top view: look down',
    p1: 'Squash (0 = as built, 1 = flat)', play1: 'Play the squash',
    c1a: 'Pressing the cubes onto a wall along the line of sight', c1b: 'The view once flat',
    s1readF: 'Front view: column heights left to right are {v}, each the tallest of that column’s front, middle and back stacks. The picture has {cells} squares, yet there are {n} cubes: cubes hidden behind others leave no trace.',
    s1readL: 'Left view: column heights left to right are {v}. Seen from the left, the back row is on the left and the front row on the right; each column is the tallest stack in that row. The picture has {cells} squares for {n} cubes.',
    s1readT: 'Top view: {cells} squares hold cubes. It only records where there is something, not how many are stacked ({n} cubes in all).',
    s1hint: 'What to watch: pick the front view and drag squash from 0 to 1. The stacks in one column slide onto the back wall until only the outline of the tallest is left. Then do the same for the left view (pressed onto the right-hand wall) and the top view (pressed onto the floor). Change the pile in step 0 and these update.',

    s2k: 'Step 2 · Line the views up',
    s2t: 'With the three views side by side, which lengths must match?',
    s2e: 'This step asks: why are the three views drawn in fixed places, and what can you check once they are? The convention used here (common in Chinese technical drawing) puts the <strong>front view</strong> top-left, the <strong>top view</strong> directly below it and the <strong>left view</strong> directly to its right. Then every pair of views shares one direction. The front and top views both show left-to-right length, so they must <strong>align in length</strong> (each column lines up vertically). The front and left views both show height, so they must <strong>align in height</strong> (each layer lines up horizontally). The top and left views both show front-to-back depth, so they must <strong>match in depth</strong>; since they aren’t in line, a 45° line carries the depth across. In the top and left views, <strong>the side furthest from the front view is the object’s front</strong>.',
    rLen: 'Length aligns', rHt: 'Height aligns', rWd: 'Depth matches',
    c2a: 'The three views in their standard places',
    lgHl: 'chosen column / layer / row', lgGuide: 'alignment lines (depth turns at the 45° line)',
    i2Len: 'Column (from the left)', i2Ht: 'Layer (from the bottom)', i2Wd: 'Row (from the front)',
    s2readLen: 'Length aligns: column {i} from the left is {f} squares tall in the front view; directly below, the same column of the top view has {t} squares with cubes. Both views are {L} squares long left to right.',
    s2readHt: 'Height aligns: layer {i} from the bottom has {f} squares in the front view and {l} in the left view, side by side at the same height. Both views are {H} squares tall.',
    s2readWd: 'Depth matches: the {row} row is line {i} from the bottom of the top view, with {t} squares of cubes; across the 45° line it becomes column {i} from the right of the left view, {l} squares tall. Both views are {D} squares deep front to back.',
    s2hint: 'What to watch: choose “Length aligns” and drag the slider; the highlighted column lines up between the front and top views. Then “Height aligns”: each layer lines up sideways. Finally “Depth matches”: a row of the top view turns at the 45° line into a column of the left view. The front row, at the bottom of the top view, becomes the rightmost column of the left view.',

    s3k: 'Step 3 · Are two views enough?',
    s3t: 'Given only the front and left views, can you tell which pile it is?',
    s3e: 'This step asks: once you know the front and left views, are the arrangement and the number of cubes settled? The page checks every one of the 4⁹ = 262,144 ways to fill a 3 × 3 grid with 0 to 3 cubes per square and keeps all whose front and left views match the pile from step 0 (the preset buttons below change that pile). The right panel shows the known views; the left shows one matching arrangement. <strong>Pink</strong> cubes are extra compared with your pile; <strong>dashed boxes</strong> are cubes your pile has and this arrangement lacks. Add the top view (which squares are occupied) and far fewer arrangements remain, but not always just one.',
    c3a: 'One arrangement that fits the known views', c3b: 'The known views',
    lgExtra: 'cubes beyond your pile', lgMissing: 'cubes your pile has and this one lacks',
    top3On: 'Drop the top view, use two', top3Off: 'Also give the top view',
    min3: 'Fewest cubes', max3: 'Most cubes', next3: 'Next arrangement', mine3: 'Your pile',
    given2: 'the front and left views', given3: 'all three views',
    s3readout: '{n} arrangements share {given}, using {min} to {max} cubes (your pile has {you}). Showing number {k}: {c} cubes{mine}.',
    mineNote: ', which is your pile',
    s3hint: 'What to watch: with two views only, press “Fewest” and “Most” and see where the pink cubes and dashed boxes sit: always hidden behind other cubes, invisible to the front and left views. Then press “Also give the top view” and both the count and the range shrink at once. Now try “Stairs”: even with all three views there are still 5 arrangements, from 9 to 11 cubes.',

    s4k: 'Step 4 · From three views to the solid',
    s4t: 'Given three views, can you pick out the pile?',
    s4e: 'This step asks: handed a set of three views, how do you decide which pile they show? Run the last two steps backwards. For each candidate, picture its front view (tallest per column), then its left view (tallest per row, back row on the left), then its top view (which squares are occupied). Only a candidate that matches all three counts. A, B and C below are all seen from above front-left, as in step 0, and exactly one has the three views shown above.',
    c4a: 'The three views given', c4b: 'Candidate solids A, B and C',
    q4: 'Question {i} of {N}', check4: 'Check', next4: 'Next question',
    s4ok: 'Right. {c} has exactly this front view, left view and top view.',
    s4bad: 'Not this one. {c} has a different {views}.',
    s4pick: 'Pick a solid first.',
    viewJoin: ' and ',
    s4hint: 'What to watch: rule candidates out with the front view first, then the left view, then the top view. In some questions the first two views match for two candidates and only the top view tells them apart, which is step 3’s point: two views are not enough.',

    s5k: 'Step 5 · Paint it',
    s5t: 'Painting the pile, base included, how many unit squares of surface get paint?',
    s5e: 'This step asks: how many faces of the pile are exposed (counting one face of one cube as 1)? There are two ways to count. One subtracts: each cube has 6 faces, 6N in all for N cubes; wherever two cubes touch is a <strong>contact</strong>, which hides two faces, so the surface area is <strong>S = 6N − 2 × contacts</strong>. The other counts by direction: faces pointing up and faces pointing down each equal the number of squares in the top view; faces pointing front and back each number at least the squares in the front view; faces pointing left and right at least the squares in the left view. So <strong>S ≥ 2 × (front + left + top view squares)</strong>, with equality exactly when nothing is hidden: no row or column of heights dips and rises again (high, low, high), leaving a groove or gap.',
    c5a: 'The current pile', c5b: 'Actual surface area versus the bound from the three views',
    bar1: 'Actual surface S', bar2: '2 × (front + left + top)',
    lgTB: 'up and down', lgFB: 'front and back', lgLR: 'left and right', lgHidden: 'hidden faces',
    s5readout: '{n} cubes, {j} contacts: S = 6 × {n} − 2 × {j} = {S}. By direction: up/down {tb}, front/back {fb}, left/right {lr}, also {S} in total. View squares: front {F} + left {L} + top {T} = {sum}, and 2 × {sum} = {bound}. {note}',
    s5eq: 'The two agree: no hidden faces.',
    s5gap: 'That is {h} short: {h} faces sit inside grooves or gaps where none of the six directions can see them.',
    s5hint: 'What to watch: press “Groove” and compare the two bars on the right. The top bar is the real surface, the bottom one is 2 × the view squares, and the pink striped box where it falls short is the faces the groove walls hide from each other. Then press “L-shape” or “Tall middle”: the bars are the same length. You can also build your own pile in step 0; this updates.',

    s6k: 'Step 6 · Wrap-up',
    s6t: 'What three views keep, and what they throw away',
    s6fin: 'A view squashes the solid flat onto a wall along the line of sight: the front view keeps the tallest in each column, the left view the tallest in each row, and the top view only whether a square is occupied. Lay the three out with the top view below and the left view to the right, and <strong>length aligns, height aligns, depth matches</strong>. Views throw away hidden cubes, so two views often cannot pin down the solid and even three may not; in return they give a lower bound on the surface area.',
    formula: 'Front view: per column, max of front, middle, back\nLeft view: per row, max of left, middle, right; back row on the left\nTop view: the occupied squares\nS = 6N − 2 × contacts ≥ 2 × (front + left + top)',
    boundary: 'Scope: this page uses identical unit cubes on a 3 × 3 grid, at most 3 per square, nothing floating. The 3D pictures are isometric (no perspective: far things do not shrink). The views follow the layout common in China (top view below the front view, left view to its right). Objects with slopes, curves or overhangs add slanted lines and dashed hidden outlines to their views, which this page does not cover.',
    linksTitle: 'Where to next',
    lk1: '→ Solid geometry, step 1: scale a box up and see what happens to surface and volume',
    lk2: '→ Solid geometry, step 5: cut a solid open and lay it flat as a net',
    lk3: '→ Space diagonal, step 0: find the right triangle inside a box',
    lk4: '→ Coordinate plane, step 2: two numbers locate a place (that is how the button grid works)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Three Views · Three Shadows Rebuild a Solid”.'
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
  if (typeof window.refreshPage === 'function') window.refreshPage();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.PAGE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
