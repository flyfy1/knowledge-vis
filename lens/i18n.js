'use strict';
/* ============================================================
   凸透镜成像 · 蜡烛远近，像变样 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  zh: {
    docTitle: '凸透镜成像 · 蜡烛远近，像变样 —— 一步一交互',
    back: '← 知识索引',
    pageTitle: '凸透镜成像 · 蜡烛远近，像变样',
    tagline: '一支蜡烛立在凸透镜前：离得远，像小而倒；拖近一点，像大起来；再拖过一个点，像忽然跳到镜子同一侧、正立放大。变的不是魔法，是两条分水岭：一倍焦距分虚实，二倍焦距分大小。这一页所有的像，都由透镜公式 1/f = 1/u + 1/v 当场算出来——图上画的、嘴里说的，必须是同一个像。',
    nav0: '0 平行光聚成点', nav1: '1 三条特殊光线', nav2: '2 蜡烛远近变像',
    nav3: '3 光屏与眼睛', nav4: '4 自测', nav5: '5 终章 · 三句话',
    start: '开始探索 ↓',
    foot: 'visual.integ.life · 凸透镜成像 Convex Lens Imaging —— 一步一交互系列',

    s0k: '第 0 步 · 光穿过透镜',
    s0t: '平行光进门，被透镜收拢到一点',
    s0e: '已知：光在同一种介质里沿直线传播，穿过界面会拐弯（折射）。这一步只回答一个问题：<strong>一束互相平行的光穿过凸透镜，会往哪里走？</strong>先认两个名字：穿过透镜中心、且垂直于镜面的那条直线叫<strong>主光轴</strong>；透镜的中心点叫<strong>光心 O</strong>。拖动焦距滑杆，看右侧的光线交点怎样跟着移动。',
    s0fLab: '焦距 f（焦点到光心的距离）',
    s0ro: '平行光被收拢到主光轴上的一点——这就是<strong>焦点 F</strong>：它在光心右侧 <span>{f}</span> 处（这段距离就叫<strong>焦距</strong>）；2F 点在 <span>{f2}</span> 处。现在 f = {f}：{judge}',
    s0judgeShort: '焦距短，光线转弯急、收拢快。',
    s0judgeMid: '焦距中等，光线不慌不忙地收拢。',
    s0judgeLong: '焦距长，光线转弯缓、收拢慢。',
    s0hint: '结论：<strong>凸透镜是会聚透镜</strong>——能把平行光会聚到焦点。适用条件：本页画的是<strong>薄透镜、靠近主光轴的光线</strong>这一理想情形；真实透镜靠边缘的光线会略有偏差（叫球差），本页不展开。',
    cAxis: '主光轴', cFocusTag: '焦点 F',

    s1k: '第 1 步 · 三条特殊光线',
    s1t: '定位一个像点，只需要三条光线',
    s1e: '这一步要回答：烛焰顶端这一点发出<strong>无数条</strong>光，怎么知道它的像落在哪里？办法是只画三条有规矩的光线——它们穿过透镜后必然在像点重新相会。烛焰顶端可以拖动（上下改物高、左右改物距），也可以用下面的滑杆。逐条点亮三条线，看它们在哪里相交。这里焦距 f = 60，像距不靠尺量、靠公式算：<strong>1/f = 1/u + 1/v</strong>。',
    s1uLab: '物距 u（蜡烛到光心）', s1hLab: '物高（烛焰顶端到主光轴）',
    s1r1: '线 1 · 平行→过焦点', s1r2: '线 2 · 过光心→不弯腰', s1r3: '线 3 · 过焦点→变平行',
    s1rule1: '线 1：平行于主光轴出发，穿过透镜后拐向另一侧的焦点 F。',
    s1rule2: '线 2：正穿过光心，不偏折、直行到底。',
    s1rule3: '线 3：出发时先穿过近侧焦点 F，穿过透镜后变得与主光轴平行。',
    s1roIdle: '先点亮至少一条线，看它穿过透镜后往哪走。',
    s1ro: '物距 u = {u}，公式给出像距 v = <span>{v}</span>。图上亮起的光线交点正好落在那里：像高 <span>{ih}</span>（物高 {oh} 的 {m} 倍，<b>倒立</b>）。任意两条线的交点就能定像，第三条会自动来会合。',
    s1roVirt: '物距 u = {u}（小于焦距 60）：右侧的光线是散开的、不相交；把它们<strong>反向延长</strong>（虚线），在左侧交出像点：像距 |v| = <span>{v}</span>，像高 <span>{ih}</span>（物高 {oh} 的 {m} 倍，<b>正立</b>）——这是虚像，第 3 步细说。',
    s1roInf: '物距 u = {u}，恰好等于焦距：穿过透镜的光线互相平行、永远不相交——<b>像在无穷远</b>，图上画不出像点。',
    s1hint: '结论：作图定位像点就靠这三条线。检验自己画得对不对有个土办法：<strong>任意两条定交点，第三条必须自动穿过它</strong>——穿不过，就是画错了。',
    cObjTip: '烛焰顶端',

    s2k: '第 2 步 · 蜡烛远近（核心步）',
    s2t: '蜡烛一路拖近，像连变五副面孔',
    s2e: '这一步只回答一个问题：<strong>物距 u 从大到小一路变，像怎样跟着变？</strong>拖动蜡烛（或用滑杆、预设按钮），盯住下面的读数：像的正倒、大小、实虚、像距 v，全部由透镜公式当场算出。先认清单位与两个点：距离都以「单位」计，f = 60；<strong>物距 u</strong> 是蜡烛到光心的距离，<strong>像距 v</strong> 是像到光心的距离；轴上的 <strong>F</strong> 在一倍焦距处、<strong>2F</strong> 在二倍焦距处，是两个分水岭点。',
    s2uLab: '物距 u',
    s2pFar: '远处 3f（u = 180）', s2p2f: '恰在 2f（u = 120）', s2pMid: 'f 与 2f 之间（u = 90）',
    s2pF: '恰在 f（u = 60）', s2pNear: 'f 以内（u = 30）',
    s2roGt: 'u = {u}（<b>大于 2f</b>）：像跑到透镜另一侧，像距 v = <span>{v}</span>，放大率 {m} 倍——<b>倒立、缩小、实像</b>。照相机就是把景物放在这一段。',
    s2roEq2: 'u = {u}（<b>恰好 2f</b>）：像距 v = <span>{v}</span>，放大率 {m} 倍——<b>倒立、等大、实像</b>。这里是「大小」的分水岭。',
    s2roMid: 'u = {u}（<b>在 f 与 2f 之间</b>）：像距 v = <span>{v}</span>，放大率 {m} 倍——<b>倒立、放大、实像</b>。投影仪把幻灯片放在这一段。',
    s2roEqF: 'u = {u}（<b>恰好在焦点上</b>）：穿过透镜的光线互相平行、永不相交——<b>像在无穷远</b>，光屏放在哪里都接不到。这里是「虚实」的分水岭。',
    s2roLt: 'u = {u}（<b>小于 f</b>）：右侧光线散开、不相交，反向延长线在左侧交出像：|v| = <span>{v}</span>，放大率 {m} 倍——<b>正立、放大、虚像</b>。放大镜就是把东西放在这一段。',
    s2hint: '结论收成一句口诀：<strong>一倍焦距分虚实，二倍焦距分大小</strong>。蜡烛从远处拖近：像先由小变大（始终倒立实像），一越过 F 就跳到同一侧、变成正立放大的虚像。适用条件：凸透镜、实物。',
    cBandFar: 'u>2f · 缩小实像', cBandMid: 'f<u<2f · 放大实像', cBandNear: 'u<f · 放大虚像',
    cFarTag: '像在很远处 →',

    s3k: '第 3 步 · 光屏与眼睛',
    s3t: '实像接得住，虚像只能看',
    s3e: '这一步要回答：<strong>实像和虚像到底差在哪？</strong>情境一：蜡烛固定在 u = 150（f = 60），公式给出像距 v = 100。拖动光屏去「接」它——只有屏正好停在像距处，屏上的烛焰才清晰；偏开就糊（这里模糊的程度是按离焦距离画的<strong>示意</strong>，不是真实光学模拟）。情境二：把蜡烛挪进 f 以内，看看屏还能不能接到像，再换眼睛来瞧。',
    s3mReal: '情境一 · 光屏接实像', s3mVirt: '情境二 · 放大镜的虚像',
    s3scrLab: '光屏位置（到光心的距离）',
    s3roSharp: '光屏在 {p} 处，<b>正好等于像距 v = {v}</b>：屏上的烛焰<strong>清晰</strong>！实像就是光线真实交汇成的像——交汇点落在哪，屏就要摆在哪。',
    s3roBlur: '光屏在 {p} 处，像距是 {v}，还差 <span>{d}</span>：屏上的像糊成一团（模糊为示意）。光线还没交汇（或已经交汇过又散开），屏截到的只是一片光斑。把屏拖到 {v} 处试试。',
    s3roVirt: '蜡烛在 f 以内（u = 30）：虚像在左侧 |v| = 60 处。光屏现在在右侧 {p} 处——<b>怎么拖都接不到像</b>，因为右侧的光线一路散开、没有交汇点，屏上只有一片均匀的光。把眼睛放到右侧往左看：眼睛顺着射入眼中的光线<strong>反向延长</strong>，就在左侧「看」到一个正立、放大的虚像。',
    s3hint: '结论：<strong>实像 = 光线真实交汇，能落到光屏上；虚像 = 反向延长线的交点，只能用眼睛看，屏永远接不到。</strong>放大镜用的正是虚像——所以放大镜里的字没法「投」到纸上。',
    cScreen: '光屏', cEye: '眼睛', cOnScreen: '屏上的像', cNothing: '屏上只有光斑',

    s4k: '第 4 步 · 自测',
    s4t: '三道题，验一验两条分水岭',
    s4e: '不用公式，只用两条分水岭口诀：一倍焦距分虚实、二倍焦距分大小。下面轴图随时可查（f = 60）。',
    s4q1: '① 照相机的镜头是凸透镜。被拍的人离镜头很远（u > 2f），传感器上成的像是什么样？',
    s4q1o0: '倒立、缩小、实像', s4q1o1: '正立、放大、虚像', s4q1o2: '倒立、放大、实像',
    s4q1why: 'u > 2f 时成倒立、缩小的实像——相机正是这样把大景物收进小小的传感器，还能被传感器「接住」。',
    s4q2: '② 蜡烛从 3f 处慢慢拖到 1.5f 处（全程都在 f 以外），像会怎样变？',
    s4q2o0: '由放大变缩小，仍是倒立实像', s4q2o1: '由缩小变放大，仍是倒立实像', s4q2o2: '越过某个点后变成正立虚像',
    s4q2why: '3f 处 u > 2f，像缩小；1.5f 处在 f 与 2f 之间，像放大。全程没越过 F，所以始终是倒立实像——只有越过 F 才会翻成虚像。',
    s4q3a: '③ 投影仪要成倒立、放大的实像，幻灯片应放在哪一段？',
    s4q3b: '放大镜要看正立、放大的虚像，物体应放在哪一段？',
    s4zGt: 'u > 2f', s4zMid: 'f < u < 2f', s4zLt: 'u < f',
    s4q3awhy: '倒立放大的实像只出现在 f < u < 2f 段：幻灯片放这一段，幕布上才是放大的像（放反了片子，幕上才是正的，就是这个理）。',
    s4q3bwhy: '正立放大的虚像只在 u < f 段出现：物体一旦越过 F，就会改成倒立实像，放大镜就「失灵」了。',
    s4ok: '✓ 答对了。',
    s4no: '✗ 不对。',
    s4idle: '点一个选项作答。',
    s4hint: '三道题考的是同一件事：先看 u 在哪一段——比 2f 远、夹在 f 与 2f 之间、还是在 f 以内——正倒、大小、实虚就全定了。',

    s5k: '第 5 步 · 终章',
    s5t: '把这一页收成三句话',
    s5e: '蜡烛还是那支蜡烛，透镜还是那块透镜。能预言像的全部本事，就是两条分水岭加三条光线：',
    c1h: '一倍焦距分虚实',
    c1: 'u > f：光线真实交汇，成<strong>实像</strong>，在透镜另一侧；u < f：只有反向延长线交汇，成<strong>虚像</strong>，和物体同一侧；u = f：光线平行出门，像在<strong>无穷远</strong>。',
    c2h: '二倍焦距分大小',
    c2: 'u > 2f 像缩小，u = 2f 像等大，f < u < 2f 像放大。外加一条总规律：<strong>实像永远倒立，虚像永远正立</strong>。照相机、投影仪、放大镜，无非是把物体放在不同段。',
    c3h: '三条光线作图',
    c3: '平行线穿镜过焦点，过心线直行不弯腰，过焦点线出门变平行。任意两条交出像点，第三条自动来会合——画错了，它当场拆穿你。',
    s5fin: '从一束平行光开始，你已经能预言任何距离上的像：先用 <strong>1/v = 1/f − 1/u</strong> 算像距，再拿 u 和 f、2f 比一比，正倒大小实虚全落地。照相机、投影仪、放大镜，乃至你眼睛里的晶状体，用的都是这同一条公式。',
    s5lkRr: '先修课：光线在界面处为什么会拐弯——去看反射与折射的「穿水拐弯」那一步 →',
  },
  en: {
    docTitle: 'Convex Lens Imaging · Move the Candle, Change the Image — One Interaction per Step',
    back: '← Knowledge Index',
    pageTitle: 'Convex Lens Imaging · Move the Candle, Change the Image',
    tagline: 'A candle stands before a convex lens: far away, its image is small and upside-down; drag it closer and the image grows; drag it past one special point and the image suddenly jumps to the same side of the lens, upright and magnified. No magic — just two watershed points: one focal length splits real from virtual, two focal lengths split shrinking from magnifying. Every image on this page is computed live from the lens formula 1/f = 1/u + 1/v — what the picture shows and what the words say are the same image.',
    nav0: '0 Parallel Light, One Point', nav1: '1 Three Special Rays', nav2: '2 Move the Candle',
    nav3: '3 Screen & Eye', nav4: '4 Self-Test', nav5: '5 Finale · Three Sentences',
    start: 'Start exploring ↓',
    foot: 'visual.integ.life · Convex Lens Imaging —— One Interaction per Step series',

    s0k: 'Step 0 · Light through a Lens',
    s0t: 'Parallel light goes in — the lens gathers it to one point',
    s0e: 'Known: light travels straight in one medium and bends at an interface (refraction). This step answers one question only: <strong>where does a bundle of parallel light go after passing through a convex lens?</strong> Two names first: the straight line through the centre of the lens, perpendicular to it, is the <strong>principal axis</strong>; the centre point of the lens is the <strong>optical centre O</strong>. Drag the focal-length slider and watch where the rays on the right meet.',
    s0fLab: 'Focal length f (focus to optical centre)',
    s0ro: 'The parallel light is gathered onto one point of the axis — the <strong>focus F</strong>: it sits <span>{f}</span> to the right of the optical centre (that distance is the <strong>focal length</strong>); the 2F point sits at <span>{f2}</span>. With f = {f}: {judge}',
    s0judgeShort: 'a short focal length bends the rays sharply and gathers them fast.',
    s0judgeMid: 'a middling focal length gathers them unhurriedly.',
    s0judgeLong: 'a long focal length bends the rays gently and gathers them slowly.',
    s0hint: 'Conclusion: <strong>a convex lens is a converging lens</strong> — it gathers parallel light to its focus. Conditions: this page draws the idealised case of a <strong>thin lens and rays near the axis</strong>; rays near the rim of a real lens deviate slightly (spherical aberration), which this page does not develop.',
    cAxis: 'principal axis', cFocusTag: 'focus F',

    s1k: 'Step 1 · Three Special Rays',
    s1t: 'Locating one image point takes only three rays',
    s1e: 'This step answers: the flame tip emits <strong>countless</strong> rays — how do we know where its image lands? Trick: draw only three rays with rules — after the lens they are bound to meet again at the image point. You can drag the flame tip (up/down changes the height, left/right the object distance) or use the sliders below. Light the three rays one by one and watch where they meet. Here f = 60, and the image distance is not measured with a ruler — the formula computes it: <strong>1/f = 1/u + 1/v</strong>.',
    s1uLab: 'Object distance u (candle to centre)', s1hLab: 'Object height (flame tip to axis)',
    s1r1: 'Ray 1 · Parallel → through focus', s1r2: 'Ray 2 · Through centre → straight', s1r3: 'Ray 3 · Through focus → parallel',
    s1rule1: 'Ray 1: leaves parallel to the axis, bends at the lens toward the far focus F.',
    s1rule2: 'Ray 2: passes straight through the optical centre, undeviated.',
    s1rule3: 'Ray 3: leaves through the near focus F, leaves the lens parallel to the axis.',
    s1roIdle: 'Light at least one ray and watch where it goes after the lens.',
    s1ro: 'Object distance u = {u}; the formula gives image distance v = <span>{v}</span>. The lit rays meet exactly there: image height <span>{ih}</span> ({m}× the object height {oh}, <b>inverted</b>). Any two rays fix the point — the third joins on its own.',
    s1roVirt: 'Object distance u = {u} (less than the focal length 60): on the right the rays spread apart and never meet; extend them <strong>backwards</strong> (dashed) and they meet on the left: |v| = <span>{v}</span>, image height <span>{ih}</span> ({m}× the object height {oh}, <b>upright</b>) — a virtual image, more in Step 3.',
    s1roInf: 'Object distance u = {u}, exactly the focal length: after the lens the rays run parallel and never meet — <b>the image is at infinity</b>, no image point can be drawn.',
    s1hint: 'Conclusion: these three rays are the whole drawing method. A handy self-check: <strong>pick any two rays to fix the meeting point — the third must pass through it automatically</strong>. If it misses, the drawing is wrong.',
    cObjTip: 'flame tip',

    s2k: 'Step 2 · Moving the Candle (the core step)',
    s2t: 'Drag the candle closer — the image wears five faces',
    s2e: 'This step answers one question: <strong>as the object distance u shrinks from large to small, how does the image change?</strong> Drag the candle (or use the slider and preset buttons) and watch the readout: orientation, size, real-or-virtual and image distance v are all computed live from the lens formula. Units first: distances are in “units”, f = 60; <strong>u</strong> is candle-to-centre, <strong>v</strong> is image-to-centre; <strong>F</strong> marks one focal length and <strong>2F</strong> two focal lengths — the two watershed points.',
    s2uLab: 'Object distance u',
    s2pFar: 'Far, 3f (u = 180)', s2p2f: 'Exactly 2f (u = 120)', s2pMid: 'Between f and 2f (u = 90)',
    s2pF: 'Exactly f (u = 60)', s2pNear: 'Inside f (u = 30)',
    s2roGt: 'u = {u} (<b>beyond 2f</b>): the image sits on the other side, v = <span>{v}</span>, magnification {m}× — <b>inverted, shrunk, real</b>. A camera puts its subject in this zone.',
    s2roEq2: 'u = {u} (<b>exactly 2f</b>): v = <span>{v}</span>, magnification {m}× — <b>inverted, same size, real</b>. This is the size watershed.',
    s2roMid: 'u = {u} (<b>between f and 2f</b>): v = <span>{v}</span>, magnification {m}× — <b>inverted, magnified, real</b>. A projector puts its slide in this zone.',
    s2roEqF: 'u = {u} (<b>exactly at the focus</b>): after the lens the rays run parallel and never meet — <b>the image is at infinity</b>, no screen anywhere can catch it. This is the real/virtual watershed.',
    s2roLt: 'u = {u} (<b>less than f</b>): the rays spread on the right; their backward extensions meet on the left: |v| = <span>{v}</span>, magnification {m}× — <b>upright, magnified, virtual</b>. A magnifying glass holds its object in this zone.',
    s2hint: 'Pocket rule: <strong>one focal length splits real from virtual; two focal lengths split small from large</strong>. Dragging in from far away, the image first grows (always inverted and real), and the moment it crosses F it jumps to the same side, upright and magnified. Conditions: convex lens, real object.',
    cBandFar: 'u>2f · smaller, real', cBandMid: 'f<u<2f · bigger, real', cBandNear: 'u<f · bigger, virtual',
    cFarTag: 'image far away →',

    s3k: 'Step 3 · Screen and Eye',
    s3t: 'A real image can be caught; a virtual one can only be seen',
    s3e: 'This step answers: <strong>what really differs between a real and a virtual image?</strong> Scene one: the candle is fixed at u = 150 (f = 60), so the formula gives v = 100. Drag the screen to “catch” it — the flame on the screen is sharp only when the screen sits exactly at the image distance; move away and it blurs (the amount of blur here is drawn <strong>schematically</strong> from the defocus distance, not a true optical simulation). Scene two: move the candle inside f and see whether the screen can still catch anything — then use an eye instead.',
    s3mReal: 'Scene 1 · Catch a real image', s3mVirt: 'Scene 2 · The magnifier’s virtual image',
    s3scrLab: 'Screen position (distance from centre)',
    s3roSharp: 'The screen is at {p}, <b>exactly the image distance v = {v}</b>: the flame on it is <strong>sharp</strong>! A real image is where rays truly converge — the screen must sit exactly at the meeting point.',
    s3roBlur: 'The screen is at {p}; the image distance is {v}, off by <span>{d}</span>: the image blurs into a blob (blur drawn schematically). The rays have not met yet (or have met and spread again) — the screen only slices a patch of light. Drag it to {v} and try.',
    s3roVirt: 'Candle inside f (u = 30): the virtual image is on the left at |v| = 60. The screen is now on the right at {p} — <b>no position can catch the image</b>, because the rays on the right keep spreading and never meet; the screen only shows an even patch of light. Put your eye on the right and look left: following the incoming rays <strong>backwards</strong>, your eye “sees” an upright, magnified virtual image on the left.',
    s3hint: 'Conclusion: <strong>a real image is a true meeting of rays and can land on a screen; a virtual image is a meeting of backward extensions — eyes can see it, no screen ever catches it.</strong> A magnifying glass uses exactly a virtual image, which is why its letters cannot be projected onto paper.',
    cScreen: 'screen', cEye: 'eye', cOnScreen: 'image on screen', cNothing: 'only a light patch',

    s4k: 'Step 4 · Self-Test',
    s4t: 'Three questions on the two watersheds',
    s4e: 'No formulas — just the pocket rule: one focal length splits real from virtual, two split small from large. The axis diagram below stays available (f = 60).',
    s4q1: 'Q1. A camera lens is a convex lens. The person stands far away (u > 2f). What is the image on the sensor like?',
    s4q1o0: 'Inverted, smaller, real', s4q1o1: 'Upright, magnified, virtual', s4q1o2: 'Inverted, magnified, real',
    s4q1why: 'For u > 2f the image is inverted, smaller and real — a camera squeezes a big scene onto a tiny sensor, and the sensor can “catch” it.',
    s4q2: 'Q2. A candle is dragged slowly from 3f to 1.5f (staying outside f the whole way). How does the image change?',
    s4q2o0: 'From magnified to smaller, still a real image', s4q2o1: 'From smaller to magnified, still an inverted real image', s4q2o2: 'Past some point it flips to an upright virtual image',
    s4q2why: 'At 3f, u > 2f, so the image is smaller; at 1.5f it sits between f and 2f, so magnified. F is never crossed, so it stays an inverted real image — only crossing F flips it to virtual.',
    s4q3a: 'Q3a. A projector needs an inverted, magnified, real image. Which zone should the slide be in?',
    s4q3b: 'Q3b. A magnifying glass needs an upright, magnified, virtual image. Which zone should the object be in?',
    s4zGt: 'u > 2f', s4zMid: 'f < u < 2f', s4zLt: 'u < f',
    s4q3awhy: 'An inverted, magnified, real image exists only for f < u < 2f: slides live in this zone — and a slide loaded upside down projects upright, for exactly this reason.',
    s4q3bwhy: 'An upright, magnified, virtual image exists only for u < f: once the object crosses F it turns into an inverted real image and the magnifier “stops working”.',
    s4ok: '✓ Correct. ',
    s4no: '✗ Not quite. ',
    s4idle: 'Tap an option to answer.',
    s4hint: 'All three questions ask the same thing: first locate u — beyond 2f, between f and 2f, or inside f — and orientation, size and real/virtual are all decided.',

    s5k: 'Step 5 · Finale',
    s5t: 'The whole page in three sentences',
    s5e: 'Same candle, same lens. Everything needed to predict the image is two watersheds plus three rays:',
    c1h: 'One focal length splits real from virtual',
    c1: 'u > f: rays truly meet — a <strong>real image</strong> on the other side. u < f: only the backward extensions meet — a <strong>virtual image</strong> on the same side. u = f: the rays leave parallel, the image is <strong>at infinity</strong>.',
    c2h: 'Two focal lengths split small from large',
    c2: 'u > 2f shrinks, u = 2f matches, f < u < 2f magnifies. Plus one blanket rule: <strong>real images are always inverted, virtual images always upright</strong>. Cameras, projectors and magnifiers merely park the object in different zones.',
    c3h: 'Three rays do the drawing',
    c3: 'The parallel ray bends through the focus, the centre ray walks straight, the through-focus ray leaves parallel. Any two fix the image point; the third arrives on its own — and exposes a wrong drawing on the spot.',
    s5fin: 'Starting from one bundle of parallel light, you can now predict the image at any distance: compute the image distance with <strong>1/v = 1/f − 1/u</strong>, then compare u with f and 2f — orientation, size and real-vs-virtual all fall out. Cameras, projectors, magnifying glasses and the lens inside your own eye all run on this one formula.',
    s5lkRr: 'Prerequisite: why does a ray bend at an interface at all? See the “through water” step of Reflection & Refraction →',
  }
};

let _lang = null;
let _langMem = 'zh'; // localStorage 不可用时的内存退化
function storedLang() {
  try {
    const v = window.localStorage.getItem('knowledge-lang');
    if (v === 'zh' || v === 'en') return v;
  } catch (e) { /* 退化为内存变量 */ }
  return null;
}
function saveLang(v) {
  _langMem = v;
  try { window.localStorage.setItem('knowledge-lang', v); } catch (e) { /* 忽略 */ }
}
function getLang() {
  if (_lang) return _lang;
  const s = storedLang();
  if (s) { _lang = s; return s; }
  const nav = (navigator.language || 'en').toLowerCase();
  _lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  return _lang;
}
function t(key, params) {
  let s = (STR[getLang()] && STR[getLang()][key]) || STR.zh[key] || key;
  if (params) for (const k in params) s = s.split('{' + k + '}').join(String(params[k]));
  return s;
}
/* 语言变更时需要重绘/刷新的回调（各步骤在 app.js 里注册） */
const langRefreshers = [];
function onLangRefresh(fn) { langRefreshers.push(fn); }

function applyLang(lang) {
  _lang = lang;
  saveLang(lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  langRefreshers.forEach(fn => { try { fn(lang); } catch (e) { console.error(e); } });
}
function initLangToggle() {
  const box = document.getElementById('langToggle');
  if (!box) return;
  box.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      if (b.dataset.lang !== getLang()) applyLang(b.dataset.lang);
    });
  });
  applyLang(getLang());
}
/* 先定语言，再渲染：DOMContentLoaded 的第一批监听里先应用语言 */
document.addEventListener('DOMContentLoaded', initLangToggle);
