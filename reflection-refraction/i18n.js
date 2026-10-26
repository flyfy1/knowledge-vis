'use strict';
const STR = {
  "zh": {
    "docTitle": "光的反射与折射 · 光路怎样拐弯 —— 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "光的反射与折射",
    "tagline": "光在同一种介质里走直线，碰到界面却要转弯：打到镜面按入射角等于反射角弹回，穿进水里在界面处拐个弯，角度太斜还会全部弹回水里。这一页的光线都按真实定律算出来再画——拖一拖，量一量，看光路到底听谁的。",
    "foot": "光的反射与折射 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互光路图；操作方法见上方说明",
    "nav0": "0 镜面弹射",
    "nav1": "1 漫反射",
    "nav2": "2 穿水拐弯",
    "nav3": "3 全反射",
    "nav4": "4 眼睛被骗",
    "s0k": "第 0 步",
    "s0t": "镜面弹射：入射角等于反射角",
    "s0e": "这一步要回答：光打到镜面上，往哪边走？先认识两个词：<strong>法线</strong>是垂直于镜面、立在入射点上的那条假想线（图中的虚线）；<strong>入射角</strong>是入射光线与法线的夹角，<strong>反射角</strong>是反射光线与法线的夹角——两个角都从法线量起，不从镜面量起。拖动图中的光源点（或用滑杆）改变入射角，盯住两条弧边的读数：不管你怎么拖，反射角总等于入射角。适用条件：表面是光滑的镜面。",
    "s0angLab": "入射角（也可拖图中的光源点）",
    "s0p0": "入射 0°（正对镜面）",
    "s0p60": "入射 60°",
    "s0ro": "入射角 = {i}，反射角 = {r}——两者相等。",
    "s0zero": "现在光线正对镜面射入（入射角 0°），沿原路返回。",
    "s0hint": "注意：角度从法线量起。如果从镜面量起，读到的会是 90° 减去这个数——课本里的角度永远以法线为基准。",
    "cNormal": "法线",
    "cMirror": "镜面",
    "cIn": "入射",
    "cRefl": "反射",
    "cRefr": "折射",
    "cAir": "空气",
    "cWater": "水",
    "cTIR": "全反射",
    "s1k": "第 1 步",
    "s1t": "粗糙面：漫反射也守同一条定律",
    "s1e": "这一步要回答：纸面不光滑，为什么还能看见上面的字，却照不出人影？放大看，粗糙面是无数个朝向不同的小斜面，每个小斜面有自己的<strong>法线</strong>（垂直于该小斜面的假想线）。一束平行光打上去，每条光线在自己落点处仍按反射角等于入射角弹出——这叫<strong>漫反射</strong>：不是定律失效，而是法线方向处处不同，反射光被撒向四面八方。切换三种看法对比。",
    "s1bMirror": "看镜面",
    "s1bRough": "看粗糙面",
    "s1bBoth": "并排对比",
    "s1roMirror": "镜面：表面法线方向处处相同，三条平行光反射后仍互相平行——所以镜子能成清晰的像。",
    "s1roRough": "粗糙面：三条光线落在三个不同朝向的小斜面上，各自守定律，却弹向不同方向——光撒开了，成不了像，但从各个方向都能看见这个面。",
    "s1roBoth": "并排看：左边镜面反射光整齐，右边粗糙面反射光散开。差别只在法线方向是否一致，定律本身没变。",
    "s1hint": "我们能看见不发光的物体，靠的就是漫反射把光送进眼睛；各个方向都有反射光，所以站在哪个位置都看得见。",
    "cBeam": "平行光束",
    "s2k": "第 2 步",
    "s2t": "穿水拐弯：折射偏向法线",
    "s2e": "这一步要回答：空气中的斜光进水时，角度怎样变？<strong>法线</strong>是入射点处垂直于水面的参考线；入射角θ₁和折射角θ₂都从各自一侧的法线量起。拖光源或用滑杆，保持介质不变，看折射角随入射角变化。斜入射时折射角较小，光偏向法线；正入射0°时两角都为0°。下方可展开正弦关系，核对同一条光线。",
    "s2angLab": "入射角（空气一侧，也可拖光源点）",
    "s2p0": "入射 0°（垂直入射）",
    "s2ro": "入射角 = {i}，折射角 ≈ {r}（按斯涅尔定律实算）；在界面处拐了 {d}。",
    "s2ro2": "折射角 < 入射角：光一进水就向法线方向偏。",
    "s2zero": "入射角 0° 时不偏折，光直着穿过去；变的是速度——光在水里比在空气里慢（这一页只点到这里）。",
    "s2hint": "折射率n=c/v，是真空光速c与介质中光的相速度v之比，无量纲。本页把空气取n=1.00、水取1.33作为理想、均匀、无吸收介质的固定值；未模拟色散。图只算光线方向，不算传播时间或反射/透射能量比例。",
    "s3k": "第 3 步",
    "s3t": "反过来：水到空气，与全反射",
    "s3e": "这一步要回答：水中的光何时不能再折射进空气？这里两角仍从垂直水面的<strong>法线</strong>量起。斜入射且未到临界时，折射角更大；正入射0°时两角都为0°。折射角达到90°、极限光线沿界面时的入射角叫<strong>临界角</strong>。入射角严格超过它，空气中没有传播折射光线，光在理想界面全反射回水里。依次试30°、精确临界预设、60°，先预测有无折射线，再观察。",
    "s3angLab": "入射角（水的一侧，也可拖光源点）",
    "s3p30": "入射 30°",
    "s3pCrit": "临界预设（未舍入值）≈{crit}",
    "s3p60": "入射 60°",
    "s3roRefr": "入射角 = {i}，折射角 ≈ {r}——比入射角大，光线偏离法线。",
    "s3roCrit": "精确临界预设/边界：入射角≈{crit}，折射角90°；沿界面的极限光线，不是超过临界的全反射分支。",
    "s3roTIR": "全反射：未舍入的入射角超过临界角。显示入射≈{i}、临界≈{crit}（均已舍入）；没有传播折射光线或实折射角，橙色反射线仍守反射定律。",
    "s3ro2": "临界角 ≈ {crit}（由 arcsin(1/1.33) 实算）：拖过它试试。",
    "s3hint": "只有从较高折射率n₁到较低n₂才有本页的全反射临界角θc=arcsin(n₂/n₁)。本例n₁=1.33、n₂=1.00；临界角≈48.8°，显示值已舍入，预设使用未舍入值。方向键每次改0.1°，Home/End到0°/80°；连续拖动也可调。低于临界时淡橙线表示普通反射；线条粗细、颜色不表示能量比例。",
    "s4k": "第 4 步",
    "s4t": "被骗的眼睛：鱼看起来变浅了",
    "s4e": "这一步要回答：沿进入眼睛的光反向找水里的鱼，会看得多深？鱼到眼睛的光在水面折射。图把出水光线<strong>反向延长</strong>，与真鱼所在的竖直参考线相交，标出一个表观深度。左右拖眼睛或用滑杆，看这条参考线上的深度怎样变。它帮助解释鱼看起来较浅，不是多条光线精确汇聚的虚像求解。",
    "s4eyeLab": "眼睛的水平位置（也可拖图中的眼睛）",
    "s4ro": "真实深度 {real} 格；看起来只有 ≈{app} 格——鱼被“抬高”了约 {diff} 格。",
    "s4hint": "本图表观位置固定在真鱼的竖直参考线上，只比较深度，不模拟横向虚像位移。几乎正上方看的近轴极限：表观深度≈真实深度/1.33；大视角不使用这条近轴比例。",
    "cEye": "眼睛",
    "cFish": "真鱼",
    "cFishV": "虚像",
    "q1t": "自测 1 · 一束光以入射角 40° 打在镜面上，反射角是多少？（从法线量起）",
    "q1o0": "40°",
    "q1o1": "50°",
    "q1o2": "80°",
    "q1why": "反射角 = 入射角 = 40°，两角都从法线量。50° 是从镜面量起的数，是最常见的量错基准。",
    "q2t": "自测 2 · 光从空气以 50° 入射进水，折射角比 50°——",
    "q2o0": "更小（向法线偏）",
    "q2o1": "更大（偏离法线）",
    "q2o2": "一样大，不拐弯",
    "q2why": "空气→水时光向法线偏，折射角 ≈ 35.2°，比 50° 小（第 2 步可亲手拖到 50° 验证）。",
    "q3t": "自测 3 · 水下的光源以 60° 入射角射向水面（临界角 ≈{crit}），会发生什么？",
    "q3o0": "折射出去，折射角比入射角大",
    "q3o1": "折射光线沿水面滑出去",
    "q3o2": "全反射，全部反射回水里",
    "q3why": "60° 已超过临界角 ≈{crit}，折射光线不存在，光全部反射回水里——就是第 3 步拖到的状态。",
    "fbRight": "答对了。",
    "fbWrong": "不对，再想一想——可以回前面的步骤亲手验证。",
    "score": "自测进度：答对 {k}/3 题，其中首次答对 {f} 题。",
    "scoreIdle": "自测进度：还没开始答题。",
    "finK": "终章",
    "finT": "收束：光在界面处的三条规矩",
    "fc1t": "反射：等角弹回",
    "fc1b": "反射角 = 入射角，两角都从法线量起；表面越光滑，反射越整齐，粗糙面只是法线方向乱、定律不变。",
    "fc2t": "折射：介质变了，方向可能变",
    "fc2b": "斜光从空气进水偏向法线；水出空气在临界前偏离法线，正入射不偏折。Snell关系n₁sinθ₁=n₂sinθ₂决定方向；n=c/v，无量纲。",
    "fc3t": "虚像：眼睛顺光找错了位置",
    "fc3b": "图用出水光线的反向延长与真鱼竖线相交，比较表观深度；这是一条参考线示意，不是完整虚像成像求解。",
    "finNote": "薄透镜成像已有独立课程；它增加焦距关系，不把这里的平面界面或小孔模型混作同一种模型。",
    "s3zero": "入射角0°，折射角0°：方向不偏折；水到空气也不例外。仍可有普通反射，这不叫全反射。",
    "snellTitle": "数学连接：正弦怎样判断有没有折射角？",
    "snellIntro": "已知两介质折射率n₁、n₂和从法线量的入射角θ₁，想求折射角θ₂。Snell关系：n₁sinθ₁=n₂sinθ₂。先算s=(n₁/n₂)sinθ₁；s在0到1才有0°到90°的实角。arcsin是“由正弦值反求角”，不是1/sin。下面读数与上方光线共用同一状态。",
    "snellValue": "n₁={n1}，n₂={n2}；θ₁≈{i}；sinθ₂=s≈{s} → θ₂≈{out}。",
    "snellNone": "n₁={n1}，n₂={n2}；θ₁≈{i}；s≈{s}（已舍入），未舍入的s>1：不存在实折射角，不计算arcsin，不画传播折射线。",
    "snellCritical": "n₁={n1}，n₂={n2}；θ₁≈{i}；精确临界s=1 → θ₂=90°（极限光线）。",
    "snellPredict": "自检：水→空气保持折射率不变。30°时s=1.33×sin30°=0.665，应有折射；60°时s≈1.152>1，应全反射。用本步原预设核对；临界预设不是把显示的48.8°重新输入。",
    "snellExplain": "sinθ是单位圆上对应的坐标，也等于直角三角形的对边/斜边；在光学图里θ从法线起，故sinθ对应沿界面方向的分量，不是从水面量的角。",
    "snellMathLink": "回看单位圆：sin与cos的坐标定义 →",
    "snellReturn": "返回本步光线和原控件 ↑",
    "snellSource": "模型来源：OpenStax · 折射与Snell定律 ↗",
    "snellCriticalSource": "临界角的条件与极限 · OpenStax ↗",
    "opticsAtlas": "在知识图谱查看：单位圆 → Snell与全反射 →",
    "snellAirPredict": "自检：空气→水正入射0°时不偏折，斜入射30°时sinθ₂=0.5/1.33，应小于30°。用原滑杆核对；再到第3步检验反向传播为何可能没有实角。",
    "s3rounding": "临界值θc≈{detail}（这里多显示小数位仍是近似）。临界预设保留计算值；手动48.8°已超过它，不能用舍入后同为48.8°来判断状态。",
    "nextLens": "继续现有透镜课：焦距为何区分实像与虚像 →"
  },
  "en": {
    "docTitle": "Reflection & Refraction · How Light Turns at a Surface — One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "Reflection & Refraction",
    "tagline": "Light travels straight inside one medium, but at a boundary it turns: it bounces off a mirror with the angle of reflection equal to the angle of incidence, bends as it enters water, and — at too steep an angle — reflects entirely back. Every ray on this page is computed from the real laws before it is drawn. Drag, measure, and see what light actually obeys.",
    "foot": "Reflection & Refraction · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive ray diagram for this step; instructions appear above",
    "nav0": "0 Mirror bounce",
    "nav1": "1 Diffuse reflection",
    "nav2": "2 Bending into water",
    "nav3": "3 Total reflection",
    "nav4": "4 The fooled eye",
    "s0k": "Step 0",
    "s0t": "Mirror bounce: angle in equals angle out",
    "s0e": "Question: when light hits a mirror, which way does it go? Two terms first: the <strong>normal</strong> is the imaginary line perpendicular to the mirror at the point of incidence (the dashed line in the diagram); the <strong>angle of incidence</strong> is measured between the incoming ray and the normal, and the <strong>angle of reflection</strong> between the reflected ray and the normal — both are measured from the normal, never from the mirror surface. Drag the light source in the diagram (or use the slider) and watch the two arc readings: however you drag, the angle of reflection always equals the angle of incidence. This holds for smooth, mirror-like surfaces.",
    "s0angLab": "Angle of incidence (or drag the source in the diagram)",
    "s0p0": "Incidence 0° (head-on)",
    "s0p60": "Incidence 60°",
    "s0ro": "Angle of incidence = {i}, angle of reflection = {r} — equal.",
    "s0zero": "The ray now hits the mirror head-on (incidence 0°) and returns along its own path.",
    "s0hint": "Note: angles are measured from the normal. Measured from the mirror surface you would get 90° minus this value — textbooks always use the normal as the reference.",
    "cNormal": "normal",
    "cMirror": "mirror",
    "cIn": "in",
    "cRefl": "out",
    "cRefr": "bent",
    "cAir": "air",
    "cWater": "water",
    "cTIR": "total internal reflection",
    "s1k": "Step 1",
    "s1t": "Rough surfaces: diffuse reflection obeys the same law",
    "s1e": "Question: paper is not smooth, so why can we read it — yet never see our face in it? Zoomed in, a rough surface is a crowd of tiny facets tilted every which way, each with its own <strong>normal</strong> (the imaginary line perpendicular to that facet). A parallel beam lands on them; each ray still reflects with angle out equal to angle in at its own facet — this is <strong>diffuse reflection</strong>: the law does not fail; the normals point in different directions, so the reflected light scatters. Switch between the three views to compare.",
    "s1bMirror": "Mirror",
    "s1bRough": "Rough surface",
    "s1bBoth": "Side by side",
    "s1roMirror": "Mirror: the normal points the same way everywhere, so parallel incoming rays stay parallel after reflecting — that is why a mirror forms a sharp image.",
    "s1roRough": "Rough surface: the three rays land on three differently tilted facets; each obeys the law but heads off in its own direction — the light spreads out, no image forms, yet the surface is visible from almost anywhere.",
    "s1roBoth": "Side by side: an orderly reflection on the left, a scattered one on the right. Only the directions of the normals differ — the law itself is unchanged.",
    "s1hint": "We can see non-luminous objects at all because diffuse reflection sends some of the light into our eyes from almost any viewing position.",
    "cBeam": "parallel beam",
    "s2k": "Step 2",
    "s2t": "Bending into water: refraction turns toward the normal",
    "s2e": "Question: how does an oblique ray change angle when it enters water from air? The <strong>normal</strong> is perpendicular to the surface at the hit point. Incidence θ₁ and refraction θ₂ are measured from the normal on their respective sides. Drag the source or use the slider with the media fixed. At oblique incidence, the smaller refraction angle turns the ray toward the normal; at normal incidence both angles are0°. Expand the sine relation below to check this same ray.",
    "s2angLab": "Angle of incidence, air side (or drag the source)",
    "s2p0": "Incidence 0° (straight in)",
    "s2ro": "Angle of incidence = {i}, angle of refraction ≈ {r} (computed from Snell's law); the ray bent by {d} at the surface.",
    "s2ro2": "Refraction angle < incidence angle: entering water, the ray leans toward the normal.",
    "s2zero": "At 0° there is no bend — the ray goes straight through. What changes is the speed: light travels slower in water than in air (this page leaves it at that).",
    "s2hint": "The refractive index n=c/v is vacuum light speed c divided by the phase speed v in the medium; it is dimensionless. This ideal model fixes air at1.00 and water at1.33, with homogeneous, non-absorbing media and no dispersion. It computes ray directions, not travel times or reflected/transmitted energy fractions.",
    "s3k": "Step 3",
    "s3t": "The other way: water to air, and total internal reflection",
    "s3e": "Question: when can light in water no longer propagate into air? Both angles are again measured from the <strong>normal</strong>, perpendicular to the surface. Below the critical angle, oblique rays bend away from the normal; at normal incidence both angles are0°. The incidence that gives refraction90°, the limiting ray along the surface, is the <strong>critical angle</strong>. Strictly above it, there is no propagating refracted ray in air: the ideal interface totally reflects the light inside water. Try30°, the exact critical preset and60°; predict whether a refracted ray exists before checking.",
    "s3angLab": "Angle of incidence, water side (or drag the source)",
    "s3p30": "Incidence 30°",
    "s3pCrit": "Critical preset (unrounded)≈{crit}",
    "s3p60": "Incidence 60°",
    "s3roRefr": "Angle of incidence = {i}, angle of refraction ≈ {r} — larger than the incidence angle; the ray leans away from the normal.",
    "s3roCrit": "Exact critical preset/boundary: incidence≈{crit}, refraction90°. This is the limiting ray along the surface, not the strictly supercritical branch.",
    "s3roTIR": "Total internal reflection: unrounded incidence exceeds critical. Displayed incidence≈{i}, critical≈{crit} (both rounded). No propagating refracted ray or real angle; the orange ray still obeys reflection.",
    "s3ro2": "The critical angle is ≈ {crit} (computed from arcsin(1/1.33)) — drag past it and see.",
    "s3hint": "This critical angle requires higher incident index n₁ and lower exit index n₂: θc=arcsin(n₂/n₁). Here n₁=1.33 and n₂=1.00. The displayed48.8° is rounded; the preset uses the unrounded value. Arrow keys change0.1°; Home/End select0°/80°; dragging is continuous. Below critical, the faint orange ray is ordinary reflection. Line thickness and colour do not encode energy fractions.",
    "s4k": "Step 4",
    "s4t": "The fooled eye: the fish is not where it looks",
    "s4e": "Question: how deep does the fish appear if we trace the ray reaching the eye backward? Light from the fish refracts at the water surface. This diagram <strong>extends the outgoing ray backward</strong> to the vertical reference line through the real fish and marks an apparent depth there. Move the eye or its slider to compare depths on that line. This explains a shallower appearance; it is not a full multi-ray virtual-image solution.",
    "s4eyeLab": "Eye position, left–right (or drag the eye in the diagram)",
    "s4ro": "Real depth {real} units; it looks like only ≈{app} units — the fish is lifted by about {diff} units.",
    "s4hint": "The apparent point stays on the vertical reference line through the fish; only depth is compared, not lateral image motion. Near the overhead, paraxial limit, apparent depth≈real depth/1.33. That ratio is not used at large viewing angles.",
    "cEye": "eye",
    "cFish": "real fish",
    "cFishV": "virtual image",
    "q1t": "Quiz 1 · A ray hits a mirror at an incidence angle of 40°. What is the angle of reflection? (Measured from the normal.)",
    "q1o0": "40°",
    "q1o1": "50°",
    "q1o2": "80°",
    "q1why": "Angle of reflection = angle of incidence = 40°, both measured from the normal. 50° is the value measured from the mirror surface — the classic wrong reference.",
    "q2t": "Quiz 2 · Light enters water from air at 50°. The angle of refraction is —",
    "q2o0": "smaller (bent toward the normal)",
    "q2o1": "larger (bent away from the normal)",
    "q2o2": "the same — no bend",
    "q2why": "From air into water the ray bends toward the normal: the refraction angle is ≈ 35.2°, smaller than 50° (drag Step 2 to 50° and check).",
    "q3t": "Quiz 3 · A source under water shines at the surface with an incidence angle of 60° (critical angle ≈{crit}). What happens?",
    "q3o0": "It refracts out, with a larger angle",
    "q3o1": "The refracted ray skims along the surface",
    "q3o2": "Total internal reflection — all of it reflects back",
    "q3why": "60° is beyond the critical angle ≈{crit}, so no refracted ray exists; all the light reflects back into the water — the state you dragged to in Step 3.",
    "fbRight": "Correct.",
    "fbWrong": "Not quite — think again; you can go back and test it in the earlier steps.",
    "score": "Quiz progress: {k}/3 correct, {f} of them on the first try.",
    "scoreIdle": "Quiz progress: not started yet.",
    "finK": "Finale",
    "finT": "Wrap-up: three rules at a boundary",
    "fc1t": "Reflection: equal angles out",
    "fc1b": "Angle of reflection = angle of incidence, both measured from the normal. The smoother the surface, the tidier the reflection; a rough surface only scrambles the normals, not the law.",
    "fc2t": "Refraction: a new medium may change direction",
    "fc2b": "Oblique air-to-water rays bend toward the normal; water-to-air rays bend away below critical. Normal incidence does not bend. Snell’s n₁sinθ₁=n₂sinθ₂ sets direction; n=c/v is dimensionless.",
    "fc3t": "Virtual images: the eye looks back wrongly",
    "fc3b": "The outgoing ray is extended backward to the fish’s vertical line to compare apparent depth. This reference-line illustration is not a full virtual-image solution.",
    "finNote": "The existing thin-lens lesson adds a focal-length relation. It is distinct from this plane-interface model and from pinhole imaging.",
    "s3zero": "Incidence0°, refraction0°: no directional bend, including water to air. Ordinary reflection may still occur; that is not total internal reflection.",
    "snellTitle": "Math connection: can a real refraction angle exist?",
    "snellIntro": "Given indices n₁,n₂ and incidence θ₁ measured from the normal, find refraction θ₂. Snell’s relation is n₁sinθ₁=n₂sinθ₂. First compute s=(n₁/n₂)sinθ₁; only0≤s≤1 gives a real angle from0° to90°. arcsin means the inverse sine function, not1/sin. The values below share the ray diagram’s state.",
    "snellValue": "n₁={n1}, n₂={n2}; θ₁≈{i}; sinθ₂=s≈{s} → θ₂≈{out}.",
    "snellNone": "n₁={n1}, n₂={n2}; θ₁≈{i}; s≈{s} (rounded); unrounded s>1: no real refraction angle. No arcsin or propagating refracted ray is drawn.",
    "snellCritical": "n₁={n1}, n₂={n2}; θ₁≈{i}; exactly critical s=1 → θ₂=90° (limiting ray).",
    "snellPredict": "Check yourself: keep the water-to-air indices fixed. At30°, s=1.33×sin30°=0.665, so a refracted ray exists. At60°, s≈1.152>1, so total internal reflection occurs. Verify with the original presets. The critical preset does not re-enter the rounded48.8° display.",
    "snellExplain": "sinθ is a coordinate on the unit circle, or opposite side divided by hypotenuse in a right triangle. Here θ starts at the normal, so sinθ gives the component along the interface, not an angle measured from the water surface.",
    "snellMathLink": "Review the unit circle: coordinates define sin and cos →",
    "snellReturn": "Return to this ray and its original controls ↑",
    "snellSource": "Model source: OpenStax · refraction and Snell’s law ↗",
    "snellCriticalSource": "Critical-angle conditions and limiting case · OpenStax ↗",
    "opticsAtlas": "See the atlas: unit circle → Snell and total reflection →",
    "snellAirPredict": "Check yourself: air→water at0° does not bend. At30°, sinθ₂=0.5/1.33, so refraction should be below30°. Verify with the original slider, then use step3 to see why the reverse direction may have no real angle.",
    "s3rounding": "θc≈{detail} (extra digits are still approximate). The critical preset keeps the computed value; manual48.8° is above it. Equal rounded48.8° labels do not mean equal states.",
    "nextLens": "Continue the existing lens lesson: why focus separates real and virtual images →"
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
  document.querySelectorAll('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach(el => el.title = t(el.dataset.i18nTitle));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
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
