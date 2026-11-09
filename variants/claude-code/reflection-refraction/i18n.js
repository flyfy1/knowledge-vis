'use strict';
// Reflection & refraction strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '光的反射与折射 · 光在界面上怎样转向',
    back: '← 知识索引',
    compare: '对照另一版本：光的反射与折射 · 拐弯的规矩 →',
    navLabel: '反射与折射步骤导航',
    tagline: '一束光在空气里走直线，碰到镜子、碰到水面、从水里往外钻，方向都会变。变多少不是随口说的：七步里你会量出两条规矩，再用它们解释为什么纸面照不出人影、为什么光能被关在玻璃棒里、为什么水里的鱼看上去比实际浅。',
    nav0: '0 镜面', nav1: '1 粗糙面', nav2: '2 射进水', nav3: '3 射出水', nav4: '4 关住光', nav5: '5 鱼在哪', nav6: '6 自测收束',

    s0k: '第 0 步 · 反射',
    s0t: '光打到平面镜上，会往哪个方向弹回去？',
    s0e: '这一步要回答：入射光的方向一变，反射光的方向按什么规矩跟着变？先认三个词。<strong>法线</strong>：在光碰到镜面的那一点，垂直于镜面画的一条假想线（图中白色虚线）。<strong>入射角</strong>：射来的光线和法线的夹角。<strong>反射角</strong>：弹回的光线和法线的夹角。注意两个角都<strong>从法线量起</strong>，不从镜面量起；从镜面量的那个角（灰色小弧）是 90° 减去它。光在同一种均匀的介质里走直线（<a class="xlink" href="../../../physics/optics/pinhole-camera/#step0">→ 小孔成像第 0 步：影子证明光走直线</a>），所以每段光路都画成直线。',
    s0lgIn: '入射光', s0lgOut: '反射光', s0lgN: '法线', s0lgOld: '之前试过的光路',
    thetaI: '入射角 θᵢ（从法线量）',
    preset0: '垂直射入 0°', preset30: '30°', preset60: '60°',
    c0title: '侧视：平面镜',
    lbIn: '入射 {v}°', lbOut: '反射 {v}°', lbMirror: '与镜面 {v}°', lbMirrorWord: '镜面',
    s0readout: '入射角 {i}°（从法线量）→ 反射角 {r}°。两角相等；从镜面量则都是 {m}°。{extra}',
    s0straight: '垂直射入时入射角为 0°，光沿原路返回。',
    s0hint: '观察顺序：拖滑杆（或直接在图上拖动光源）改变入射角，镜面和法线不动；看两段弧上的度数是否始终相同。之前试过的光路留成淡线，它们左右成对、关于法线对称。再按「垂直射入 0°」看原路返回。',

    s1k: '第 1 步 · 漫反射',
    s1t: '纸面不是镜子，为什么照不出人影，却能从各个方向看见字？',
    s1e: '这一步要回答：表面凹凸不平时，反射规矩还成立吗？图中把一小段表面<strong>放大</strong>（示意尺度，真实纸面纤维的起伏只有几十微米）：表面由许多倾斜不同的小平面拼成，每块小平面都有<strong>自己的法线</strong>（白色短虚线）。一束<strong>平行光</strong>（9 条方向相同的光线）照上去，每条光线都按上一步的规矩，在它碰到的那块小平面上「入射角 = 反射角」。光滑时所有小平面法线相同，反射光仍然平行，于是能成像；粗糙时法线各不相同，反射光朝四面八方散开，这叫<strong>漫反射</strong>。',
    rough: '表面粗糙度（0 = 光滑镜面）', thetaB: '光束入射角（从整体法线量）',
    presetSmooth: '光滑镜面', presetRough: '粗糙纸面',
    c1title: '放大示意：一小段表面上的 9 条平行光',
    lbFacet: '这块小平面：入 {i}° = 反 {r}°',
    s1lgIn: '入射光（平行）', s1lgOut: '反射光', s1lgN: '小平面的法线',
    s1readout: '9 条平行光，反射后的方向从 {a}° 到 {b}°（从竖直方向量，右偏为正），张开 {s}°。每条光在自己碰到的小平面上入射角与反射角之差最大 {e}°。{extra}',
    s1parallel: '张开 0°：反射光仍然平行，像镜子一样成像。',
    s1multi: '有 {k} 次是光在凹坑里连弹了两次。',
    s1hint: '观察顺序：先把粗糙度保持在 0，拖入射角，9 条反射光始终平行；再把粗糙度慢慢拖大，入射角不动，看反射光怎样散开、读数里的「张开」怎样变大；同时看高亮那条光线的标注：它在自己的小平面上照样等角反射。',

    s2k: '第 2 步 · 折射',
    s2t: '光从空气斜着射进水里，在水面上往哪边拐？',
    s2e: '这一步要回答：光穿进另一种介质时，方向怎样变？光从一种透明物质进入另一种时在界面上改变方向，叫<strong>折射</strong>。折射后的光线与法线（垂直于水面的假想线）的夹角叫<strong>折射角</strong> θ₂。每种物质有一个<strong>折射率</strong> n：真空中的光速除以光在这种物质里的速度，没有单位；本页取空气 1.00、水 1.33、玻璃 1.50。规矩是 <strong>n₁·sin θ₁ = n₂·sin θ₂</strong>（斯涅尔定律）。图里有一个以入射点为圆心的虚线圆：光线和圆的交点到法线的水平距离，正好是半径乘 sin（<a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ 三角函数第 1 步：sin 就是圆上点的「身高」</a>），所以橙色和青色两段水平线的长度之比就是 sin θ₁ : sin θ₂ = n₂ : n₁。',
    theta1: '入射角 θ₁（从法线量）', mWater: '水 n = 1.33', mGlass: '玻璃 n = 1.50', sweep2: '从 0° 扫到 85°',
    c2title: '侧视：空气 → {m}', c2btitle: '折射角 θ₂（纵）与入射角 θ₁（横）',
    lbAir: '空气 n = 1.00', lbWater: '水 n = 1.33', lbGlass: '玻璃 n = 1.50', lbTh1: 'θ₁ {v}°', lbTh2: 'θ₂ {v}°', lbNoBend: '不拐弯的线 θ₂ = θ₁',
    s2lgIn: '入射光', s2lgOut: '折射光', s2lgRef: '同时有一小部分反射（线的粗细不代表强弱）', s2lgS1: 'R·sin θ₁', s2lgS2: 'R·sin θ₂', s2lgDot: '试过的角度',
    s2readout: '{prog}入射角 {a}° → 折射角 ≈ {b}°，比入射角小 {d}°，光线偏向法线。sin θ₁ = {s1}，sin θ₂ = {s2}，两者之比 {q} = n₂ ÷ n₁。',
    s2zero: '{prog}入射角 0°：光垂直射入，不拐弯（折射角也是 0°）；不过它在水里走得更慢，速度是空气中的 1/{n}。',
    s2progress: '已扫到 {c}/{N} 个角度。',
    s2hint: '观察顺序：介质选「水」，拖入射角从小到大，看曲线图上留下的点：它们都在对角虚线下方（折射角总比入射角小，偏向法线），而且入射角越大，差得越多。再换「玻璃」，同一个入射角，玻璃里拐得更多，因为折射率更大。读数里 sin θ₁ ÷ sin θ₂ 在一种介质里始终不变。',

    s3k: '第 3 步 · 全反射',
    s3t: '反过来，光从水里往空气里射，入射角越来越大会怎样？',
    s3e: '这一步要回答：光从折射率大的水射向折射率小的空气时，还一定能射出去吗？同一条规矩 1.33·sin θ₁ = 1.00·sin θ₂ 反过来用：这次折射角比入射角<strong>大</strong>，光线偏离法线。入射角增大到某一值时，折射角达到 90°，折射光贴着水面走，这个入射角叫<strong>临界角</strong> θc = arcsin(1.00 ÷ 1.33) ≈ {crit}°。再大，算出来 sin θ₂ 要大于 1，可任何角的 sin 都不超过 1，所以<strong>根本没有折射光</strong>，光全部反射回水里，这叫<strong>全反射</strong>。临界角只在光从折射率大的物质射向折射率小的物质时存在。',
    theta1w: '水中的入射角 θ₁（从法线量）', p30: '30°', pCrit: '恰好临界角', p60: '60°', sweep3: '从 0° 扫到 85°',
    c3title: '侧视：水 → 空气', c3btitle: '空气中 θ₂（纵）与水中 θ₁（横）', lbTIR: '全反射区',
    lbGraze: '贴着水面 90°',
    s3lgIn: '水中的入射光', s3lgOut: '射进空气的折射光', s3lgRef: '反射回水里的光', s3lgTir: '全反射时试过的角度',
    s3refract: '{prog}入射角 {a}° → 空气中折射角 ≈ {b}°，比入射角大 {d}°，光线偏离法线。离临界角 {c}° 还差 {gap}°。',
    s3graze: '{prog}入射角恰好等于临界角 {c}°：折射角是 90°，这是贴着水面走的极限光线；再大一点就没有折射光了。',
    s3tir: '{prog}入射角 {a}° 超过临界角 {c}°：算出 sin θ₂ = {s}，大于 1，不存在这样的角，所以没有折射光，光全部反射回水里（反射角 {a}°）。',
    s3progress: '已扫到 {c}/{N} 个角度。',
    s3hint: '观察顺序：依次按 30°、「恰好临界角」、60° 三个按钮，只看水面上方：先有一条偏离法线的折射光，接着它贴着水面，最后消失，只剩下反射回水里的那条（变亮）。曲线图里，曲线在临界角处走到 90° 就到头了，之后是全反射区。',

    s4k: '第 4 步 · 应用：关在玻璃里的光',
    s4t: '一根玻璃棒，为什么能把光一路关在里面送到另一头？',
    s4e: '这一步要回答：上一步的全反射怎样让光沿弯弯曲曲的细玻璃丝传很远？光从棒的端面（左边竖直的面）射进玻璃（n = 1.50），先折射一次，然后斜着碰到侧壁。在侧壁上，光是从玻璃射向外面，只要撞壁时的入射角（从侧壁的法线量）<strong>大于</strong>玻璃对外面物质的临界角，就发生全反射，光被弹回棒里，一次又一次。外面换成折射率更大的物质，临界角变大，能被关住的入射光就变少。真正的光纤外面包了一层折射率略小的玻璃（本页取 1.46），道理相同。',
    thIn: '光进入端面的角度（从棒的轴线量）', oAir: '外面是空气 1.00', oWater: '外面是水 1.33', oClad: '外面包层 1.46',
    c4title: '侧视：玻璃棒（n = 1.50）', lbWall: '撞壁 {w}°', lbCrit: '临界 {c}°', lbLeak: '漏出',
    s4lgRay: '光路', s4lgLeak: '从侧壁漏出去的光', s4lgN: '侧壁法线',
    s4trapped: '端面入射 {a}° → 玻璃内与轴线成 {b}° → 撞壁入射角 {w}°，大于临界角 {c}°：全反射。在这段 {L} 倍直径长的棒里弹了 {k} 次，光一直留在里面。能被关住的最大入射角：{acc}。',
    s4leak: '端面入射 {a}° → 玻璃内与轴线成 {b}° → 撞壁入射角 {w}°，不大于临界角 {c}°：第一次撞壁就有光折射出去（外面折射角 ≈ {o}°），不再被关住。能被关住的最大入射角：{acc}。',
    acceptAll: '任何角度都行（90°）', acceptDeg: '{v}°',
    s4hint: '观察顺序：先选「外面是空气」，把入射角从 0° 拖到 80°，光在棒里来回弹，始终出不去；再换「外面是水」，同样拖动，过了约 {w}° 光就在第一次撞壁时漏出去（粉色）。换「外面包层」，这个界限更小。读数里比较「撞壁入射角」和「临界角」两个数，就能判断光会不会漏。',

    s5k: '第 5 步 · 被骗的眼睛',
    s5t: '站在岸边看水里的鱼，它看起来在多深的地方？',
    s5e: '这一步要回答：为什么水里的东西看起来比实际浅？鱼身上的一点发出（或反射）的光，从水里斜着射出水面时偏离法线，然后进入眼睛。眼睛不知道光拐过弯，总以为光是沿直线从前方来的，于是顺着进入眼睛的那段光线<strong>反向延长</strong>去找鱼。图里，我们把这条反向延长线一直画到鱼的正上方那条竖直虚线上，交点的深度就是「看上去的深度」。眼睛看到的不是鱼本身，而是光线反向延长线交出的位置，这叫<strong>虚像</strong>：那里其实没有光汇聚。插在水里的筷子看起来在水面处「折断」，也是同一个原因。',
    eyeX: '眼睛离鱼的水平距离', unitM: ' m',
    c5title: '侧视：鱼在水下 {d} m，眼睛在水面上 {h} m',
    lbFish: '真的鱼', lbImage: '看上去的鱼', lbEye: '眼睛',
    s5lgRay: '鱼 → 眼睛的真实光路', s5lgBack: '眼睛的反向延长线', s5lgHist: '试过的位置看到的深度',
    s5readout: '光在水面离鱼正上方 {s} m 处射出：水中与法线成 {w}°，空气中成 {a}°。反向延长线在鱼正上方深 {ap} m 处，真实深度 {d} m，看上去只有真实的 {r}。',
    s5limit: '眼睛正对鱼的上方时（极限情形），看上去的深度 ≈ 真实深度 ÷ 1.33 = {ap} m，是真实的 {r}。',
    s5hint: '观察顺序：先把眼睛拖到最左（正上方），鱼看上去约浅四分之一；再把眼睛慢慢往右挪，鱼的高度不动，看虚线反向延长的交点怎样一路升高，竖线上留下的点记录了每个位置看到的深度：看得越斜，鱼显得越浅。',

    s6k: '第 6 步 · 自测与收束',
    s6t: '三道题，用前面的规矩来判断',
    q1: '① 光以入射角 35°（从法线量）射到平面镜上，反射光线和镜面之间的夹角是多少？',
    q1a: '35°', q1b: '55°', q1c: '70°',
    q2: '② 光从空气以 45° 入射角射进玻璃（n = 1.50），折射角大约是多少？',
    q2a: '约 28°', q2b: '45°', q2c: '约 62°',
    q3: '③ 水里的光以 50° 入射角射向水面，会发生什么？',
    q3a: '射出水面，偏向法线', q3b: '射出水面，偏离法线', q3c: '全部反射回水里',
    check: '检查答案',
    fb1ok: '① 对：反射角也是 35°，和镜面的夹角是 90° − 35° = {v}°。', fb1no: '① 再想想：35° 是从法线量的反射角，题目问的是和镜面的夹角，等于 90° 减去它。',
    fb2ok: '② 对：sin θ₂ = sin 45° ÷ 1.50，θ₂ ≈ {v}°，进入玻璃偏向法线。', fb2no: '② 再想想：进入折射率更大的玻璃，光偏向法线，折射角比 45° 小；算一下 sin 45° ÷ 1.50。',
    fb3ok: '③ 对：50° 大于水的临界角 {c}°，没有折射光，发生全反射。', fb3no: '③ 再想想：水的临界角约 {c}°，50° 比它大吗？',
    fbNone: '先选一个选项。',
    s6fin: '回顾：<strong>第 0 步</strong>，镜面反射时反射角等于入射角，两角都从法线量；<strong>第 1 步</strong>，粗糙表面每一小块仍守这条规矩，只因法线方向各不相同，光才散开；<strong>第 2 步</strong>，光进入折射率更大的物质时偏向法线，n₁·sin θ₁ = n₂·sin θ₂；<strong>第 3 步</strong>，反过来射出时偏离法线，入射角超过临界角就没有折射光，只剩全反射；<strong>第 4 步</strong>，全反射能把光关在玻璃丝里；<strong>第 5 步</strong>，眼睛顺着光线反向延长找物体，所以水里的鱼显得浅。',
    formula: '反射：θ反 = θ入\n折射：n₁·sin θ₁ = n₂·sin θ₂\n临界角：sin θc = n₂ ÷ n₁（n₁ > n₂）',
    boundary: '适用范围：本页的介质都是均匀、透明的，折射率不随颜色变（实际上不同颜色略有不同，这就是彩虹和三棱镜分光的来源）；线的粗细和亮度只是为了看清，不代表光的强弱。真实的界面上，折射时总有一小部分光被反射，这一部分的多少本页没有计算。第 5 步「看上去的深度」取的是鱼正上方那条竖直线上的交点，是常用的简化。',
    linksTitle: '接着去哪',
    lk1: '→ 凸透镜成像（Claude 版）第 0 步：光两次折射后被收拢到焦点',
    lk2: '→ 眼睛与眼镜第 2 步：眼球稍长或稍短，像就落不到视网膜上',
    lk3: '→ 小孔成像第 2 步：只靠直线传播，像有多大',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《光的反射与折射 · 拐弯的规矩》的平行版本。'
  },
  en: {
    pageTitle: 'Reflection & Refraction · Where Light Turns at a Surface',
    back: '← Knowledge Index',
    compare: 'Compare the other edition: Reflection & Refraction · How Light Bends →',
    navLabel: 'Reflection and refraction steps',
    tagline: 'In air, a beam of light travels in a straight line. Hit a mirror, enter water, or try to leave water, and its direction changes — by an amount you can predict. Over seven steps you will measure two rules, then use them to explain why paper shows no reflection of your face, how light can be trapped inside a glass rod, and why a fish looks shallower than it is.',
    nav0: '0 Mirror', nav1: '1 Rough surface', nav2: '2 Into water', nav3: '3 Out of water', nav4: '4 Trapped light', nav5: '5 The fish', nav6: '6 Self-test',

    s0k: 'Step 0 · Reflection',
    s0t: 'Light hits a flat mirror. Which way does it bounce?',
    s0e: 'The question here: when the incoming direction changes, by what rule does the outgoing direction follow? Three words first. The <strong>normal</strong> is an imaginary line drawn perpendicular to the mirror at the point where the light lands (the white dashed line). The <strong>angle of incidence</strong> is the angle between the incoming ray and the normal; the <strong>angle of reflection</strong> is the angle between the outgoing ray and the normal. Both are <strong>measured from the normal</strong>, not from the mirror; the angle to the mirror itself (small grey arc) is 90° minus that. Within one uniform material light travels in straight lines (<a class="xlink" href="../../../physics/optics/pinhole-camera/#step0">→ Pinhole camera, step 0: shadows show light goes straight</a>), so every piece of a light path is drawn straight.',
    s0lgIn: 'Incoming ray', s0lgOut: 'Reflected ray', s0lgN: 'Normal', s0lgOld: 'Paths you tried before',
    thetaI: 'Angle of incidence θᵢ (from the normal)',
    preset0: 'Straight on 0°', preset30: '30°', preset60: '60°',
    c0title: 'Side view: a flat mirror',
    lbIn: 'in {v}°', lbOut: 'out {v}°', lbMirror: 'to mirror {v}°', lbMirrorWord: 'mirror',
    s0readout: 'Incidence {i}° (from the normal) → reflection {r}°. The two are equal; measured from the mirror, both are {m}°. {extra}',
    s0straight: 'At 0° the light arrives straight on and goes straight back.',
    s0hint: 'What to try: move the slider (or drag the light source on the picture) to change the angle of incidence; the mirror and the normal stay put. Check that the two arcs always show the same number. Earlier paths stay as faint lines — they come in mirror-image pairs either side of the normal. Then press “Straight on 0°” and watch the light return along its own path.',

    s1k: 'Step 1 · Diffuse reflection',
    s1t: 'Paper is not a mirror. Why can’t you see your face in it, yet you can read it from any direction?',
    s1e: 'The question here: does the reflection rule still hold on a bumpy surface? The picture is a <strong>magnified</strong> sketch of a short stretch of surface (not to scale — real paper fibres rise and fall by tens of micrometres). It is made of many small flat pieces tilted differently, and each piece has <strong>its own normal</strong> (short white dashes). A <strong>parallel beam</strong> — nine rays all pointing the same way — shines on it, and every ray obeys the rule from step 0 on the piece it hits: angle in = angle out. On a smooth surface every piece shares one normal, so the reflected rays stay parallel and can form an image. On a rough one the normals differ, so the reflected rays fan out in all directions. That is <strong>diffuse reflection</strong>.',
    rough: 'Surface roughness (0 = smooth mirror)', thetaB: 'Beam angle (from the overall normal)',
    presetSmooth: 'Smooth mirror', presetRough: 'Rough paper',
    c1title: 'Magnified sketch: 9 parallel rays on a short stretch of surface',
    lbFacet: 'this piece: in {i}° = out {r}°',
    s1lgIn: 'Incoming rays (parallel)', s1lgOut: 'Reflected rays', s1lgN: 'Normal of each small piece',
    s1readout: 'Nine parallel rays leave in directions from {a}° to {b}° (from the vertical, positive = tilted right), a spread of {s}°. On the piece each ray hits, angle in and angle out differ by at most {e}°. {extra}',
    s1parallel: 'Spread 0°: the reflected rays are still parallel and form an image, just like a mirror.',
    s1multi: '{k} of the hits are second bounces inside a dip.',
    s1hint: 'What to try: keep roughness at 0 and move the beam angle — the nine reflected rays stay parallel. Then hold the beam angle still and raise the roughness slowly: watch the reflected rays fan out and the “spread” in the readout grow. Keep an eye on the highlighted ray’s label: on its own small piece it still reflects at equal angles.',

    s2k: 'Step 2 · Refraction',
    s2t: 'Light enters water at a slant. Which way does it turn at the surface?',
    s2e: 'The question here: how does light change direction when it passes into another material? A change of direction at the boundary between two transparent materials is called <strong>refraction</strong>. The angle between the refracted ray and the normal (the imaginary line perpendicular to the surface) is the <strong>angle of refraction</strong> θ₂. Each material has a <strong>refractive index</strong> n: the speed of light in a vacuum divided by its speed in that material, with no unit. Here air is 1.00, water 1.33 and glass 1.50. The rule is <strong>n₁·sin θ₁ = n₂·sin θ₂</strong> (Snell’s law). The dashed circle is centred where the ray lands; the horizontal distance from where a ray crosses the circle to the normal is the radius times sin (<a class="xlink" href="../../../math/geometry/trigonometry/#step1">→ Trigonometry, step 1: sine is a point’s height on the circle</a>). So the orange and cyan horizontal segments are in the ratio sin θ₁ : sin θ₂ = n₂ : n₁.',
    theta1: 'Angle of incidence θ₁ (from the normal)', mWater: 'Water n = 1.33', mGlass: 'Glass n = 1.50', sweep2: 'Sweep 0° to 85°',
    c2title: 'Side view: air → {m}', c2btitle: 'Refraction θ₂ (up) vs incidence θ₁ (across)',
    lbAir: 'air n = 1.00', lbWater: 'water n = 1.33', lbGlass: 'glass n = 1.50', lbTh1: 'θ₁ {v}°', lbTh2: 'θ₂ {v}°', lbNoBend: 'no bending: θ₂ = θ₁',
    s2lgIn: 'Incoming ray', s2lgOut: 'Refracted ray', s2lgRef: 'A little is reflected too (line weight is not brightness)', s2lgS1: 'R·sin θ₁', s2lgS2: 'R·sin θ₂', s2lgDot: 'Angles you tried',
    s2readout: '{prog}Incidence {a}° → refraction ≈ {b}°, {d}° smaller: the ray bends toward the normal. sin θ₁ = {s1}, sin θ₂ = {s2}, ratio {q} = n₂ ÷ n₁.',
    s2zero: '{prog}Incidence 0°: the light enters straight on and does not bend (refraction is 0° too), though in the water it travels slower, at 1/{n} of its speed in air.',
    s2progress: 'Swept {c}/{N} angles. ',
    s2hint: 'What to try: with “Water” selected, raise the angle of incidence and watch the dots it leaves in the graph. All of them sit below the dashed diagonal (refraction is always smaller: the ray bends toward the normal), and the gap widens as the angle grows. Switch to “Glass”: at the same incidence the ray bends more, because the index is larger. In the readout, sin θ₁ ÷ sin θ₂ stays fixed for a given material.',

    s3k: 'Step 3 · Total internal reflection',
    s3t: 'Now reverse it: light goes from water into air. What happens as the angle grows?',
    s3e: 'The question here: going from water (larger index) into air (smaller index), can light always get out? Use the same rule the other way round, 1.33·sin θ₁ = 1.00·sin θ₂: now the refraction angle is <strong>larger</strong> than the incidence, and the ray bends away from the normal. At one particular incidence the refraction angle reaches 90° and the refracted ray skims along the surface; that incidence is the <strong>critical angle</strong> θc = arcsin(1.00 ÷ 1.33) ≈ {crit}°. Any steeper, and the rule would need sin θ₂ greater than 1 — but no angle has a sine above 1, so <strong>there is no refracted ray at all</strong>. All the light reflects back into the water: <strong>total internal reflection</strong>. A critical angle exists only when light heads from a higher-index material toward a lower-index one.',
    theta1w: 'Angle of incidence in water θ₁ (from the normal)', p30: '30°', pCrit: 'Exactly critical', p60: '60°', sweep3: 'Sweep 0° to 85°',
    c3title: 'Side view: water → air', c3btitle: 'θ₂ in air (up) vs θ₁ in water (across)', lbTIR: 'total reflection',
    lbGraze: 'skims the surface 90°',
    s3lgIn: 'Incoming ray in water', s3lgOut: 'Refracted ray in air', s3lgRef: 'Ray reflected back into water', s3lgTir: 'Angles tried with total reflection',
    s3refract: '{prog}Incidence {a}° → refraction in air ≈ {b}°, {d}° larger: the ray bends away from the normal. Still {gap}° below the critical angle {c}°.',
    s3graze: '{prog}Incidence is exactly the critical angle {c}°: the refraction angle is 90°, the limiting ray that skims the surface. A touch more and the refracted ray is gone.',
    s3tir: '{prog}Incidence {a}° is past the critical angle {c}°: the rule asks for sin θ₂ = {s}, greater than 1, and no angle has that sine. There is no refracted ray; all the light reflects back into the water (reflection angle {a}°).',
    s3progress: 'Swept {c}/{N} angles. ',
    s3hint: 'What to try: press 30°, “Exactly critical” and 60° in turn, and watch only the space above the water. First a refracted ray bends away from the normal; then it lies flat along the surface; then it is gone, leaving only the ray reflected into the water (now drawn bright). In the graph, the curve reaches 90° at the critical angle and stops; past it lies the total-reflection zone.',

    s4k: 'Step 4 · Application: light trapped in glass',
    s4t: 'How can a glass rod keep light inside all the way to the far end?',
    s4e: 'The question here: how does the total reflection from step 3 carry light a long way down a thin, even curving, glass strand? Light enters through the rod’s flat end (the vertical face on the left) into glass (n = 1.50), refracts once, then meets a side wall at a slant. At the wall the light is heading from glass toward whatever is outside. If its angle of incidence there (from the wall’s normal) is <strong>greater</strong> than the critical angle for glass against that outside material, it is totally reflected back into the rod — again and again. Put a higher-index material outside and the critical angle grows, so fewer entry angles stay trapped. Real optical fibres wear a coat of slightly lower-index glass (1.46 here); the idea is the same.',
    thIn: 'Entry angle at the end face (from the rod’s axis)', oAir: 'Air outside 1.00', oWater: 'Water outside 1.33', oClad: 'Cladding outside 1.46',
    c4title: 'Side view: a glass rod (n = 1.50)', lbWall: 'at wall {w}°', lbCrit: 'critical {c}°', lbLeak: 'leaks',
    s4lgRay: 'Light path', s4lgLeak: 'Light escaping through the wall', s4lgN: 'Normal to the wall',
    s4trapped: 'Enters at {a}° → inside the glass {b}° from the axis → hits the wall at {w}°, more than the critical angle {c}°: total reflection. In this rod, {L} diameters long, it bounces {k} times and never gets out. Largest entry angle that stays trapped: {acc}.',
    s4leak: 'Enters at {a}° → inside the glass {b}° from the axis → hits the wall at {w}°, not more than the critical angle {c}°: at the first wall some light refracts out (≈ {o}° outside) and is no longer trapped. Largest entry angle that stays trapped: {acc}.',
    acceptAll: 'any angle (90°)', acceptDeg: '{v}°',
    s4hint: 'What to try: pick “Air outside” and drag the entry angle from 0° to 80° — the light zig-zags along the rod and never gets out. Switch to “Water outside” and drag again: past about {w}° the light leaks at the very first wall (pink). With “Cladding outside” the limit is smaller still. Compare the two numbers in the readout, the angle at the wall and the critical angle, to tell whether light escapes.',

    s5k: 'Step 5 · The fooled eye',
    s5t: 'From the bank, how deep does a fish in the water appear to be?',
    s5e: 'The question here: why do things under water look shallower than they are? Light from a point on the fish leaves the water at a slant, bends away from the normal, and enters your eye. The eye does not know the light turned a corner; it assumes light reached it in a straight line, so it looks for the fish by <strong>extending the incoming ray backwards</strong>. In the picture that backward extension is drawn down to the dashed vertical line straight above the fish; the depth where they meet is the “apparent depth”. What you see is not the fish itself but the place picked out by extended rays; no light actually gathers there, and that is called a <strong>virtual image</strong>. A chopstick dipped in water looks “broken” at the surface for the same reason.',
    eyeX: 'Eye’s horizontal distance from the fish', unitM: ' m',
    c5title: 'Side view: fish {d} m under water, eye {h} m above it',
    lbFish: 'real fish', lbImage: 'fish as seen', lbEye: 'eye',
    s5lgRay: 'Real light path, fish → eye', s5lgBack: 'Eye’s backward extension', s5lgHist: 'Apparent depths from positions tried',
    s5readout: 'The light leaves the water {s} m from the point above the fish: {w}° from the normal in water, {a}° in air. The backward extension meets the vertical line at a depth of {ap} m; the real depth is {d} m, so the fish looks {r} as deep as it is.',
    s5limit: 'With the eye straight above the fish (the limiting case), apparent depth ≈ real depth ÷ 1.33 = {ap} m, {r} of the real depth.',
    s5hint: 'What to try: start with the eye at the far left, straight overhead — the fish looks about a quarter shallower. Then slide the eye slowly to the right. The fish never moves, but the point where the dashed extension meets the vertical line keeps rising, and the dots it leaves record the depth seen from each position: the more slanted your view, the shallower the fish appears.',

    s6k: 'Step 6 · Self-test and wrap-up',
    s6t: 'Three questions, settled by the rules above',
    q1: '① Light hits a flat mirror at 35° from the normal. What angle does the reflected ray make with the mirror surface?',
    q1a: '35°', q1b: '55°', q1c: '70°',
    q2: '② Light goes from air into glass (n = 1.50) at 45° incidence. Roughly what is the angle of refraction?',
    q2a: 'about 28°', q2b: '45°', q2c: 'about 62°',
    q3: '③ Light in water reaches the surface at 50° incidence. What happens?',
    q3a: 'It leaves, bending toward the normal', q3b: 'It leaves, bending away from the normal', q3c: 'It all reflects back into the water',
    check: 'Check answers',
    fb1ok: '① Right: the reflection angle is also 35°, so the angle to the mirror is 90° − 35° = {v}°.', fb1no: '① Not quite: 35° is measured from the normal; the question asks for the angle to the mirror, which is 90° minus that.',
    fb2ok: '② Right: sin θ₂ = sin 45° ÷ 1.50, so θ₂ ≈ {v}°; entering glass, the ray bends toward the normal.', fb2no: '② Not quite: entering higher-index glass, the ray bends toward the normal, so the angle is below 45°. Work out sin 45° ÷ 1.50.',
    fb3ok: '③ Right: 50° is past water’s critical angle of {c}°, so there is no refracted ray — total internal reflection.', fb3no: '③ Not quite: water’s critical angle is about {c}°. Is 50° bigger?',
    fbNone: 'Pick an option first.',
    s6fin: 'The thread. <strong>Step 0</strong>: at a mirror the angle of reflection equals the angle of incidence, both measured from the normal. <strong>Step 1</strong>: each small piece of a rough surface keeps that rule; light spreads only because the normals point different ways. <strong>Step 2</strong>: entering a higher-index material, light bends toward the normal, with n₁·sin θ₁ = n₂·sin θ₂. <strong>Step 3</strong>: leaving it, light bends away, and past the critical angle there is no refracted ray — only total reflection. <strong>Step 4</strong>: total reflection can keep light inside a glass strand. <strong>Step 5</strong>: the eye traces light backwards in a straight line, so a fish looks shallower.',
    formula: 'Reflection: θout = θin\nRefraction: n₁·sin θ₁ = n₂·sin θ₂\nCritical angle: sin θc = n₂ ÷ n₁ (n₁ > n₂)',
    boundary: 'Scope: the materials here are uniform and transparent, with one refractive index for every colour (in reality it differs slightly by colour, which is why prisms and rainbows split white light). Line weight and brightness are only for legibility and never show how much light there is. At a real boundary a little light is always reflected during refraction; this page does not compute how much. In step 5 the “apparent depth” is read on the vertical line above the fish, a common simplification.',
    linksTitle: 'Where to go next',
    lk1: '→ The convex lens (Claude edition), step 0: two refractions gather light to a focus',
    lk2: '→ The eye and glasses, step 2: an eyeball slightly too long or short misses the retina',
    lk3: '→ Pinhole camera, step 2: how big the image is, from straight lines alone',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Reflection & Refraction · How Light Bends”.'
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
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t(node.dataset.i18n, window.PAGE_PARAMS || {}); });
  document.querySelectorAll('[data-i18n-html]').forEach(node => { node.innerHTML = t(node.dataset.i18nHtml, window.PAGE_PARAMS || {}); });
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
