'use strict';
/* ============================================================
   凸透镜成像 · 蜡烛远近，像变样 — 双语字典与语言机制（遵守 UI-I18N-SPEC）
   - localStorage 键 knowledge-lang（try/catch 包裹，失败退化为内存变量）
   - 默认：navigator.language 以 zh 开头 → zh，否则 en
   - 静态文本：data-i18n（纯文本）/ data-i18n-html（含 <strong> 等标记）
   - 动态文本与 Canvas 文字：一律经 t(key, params) 取值
   ============================================================ */
const STR = {
  "zh": {
    "docTitle": "凸透镜成像 · 蜡烛远近，像变样 —— 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "凸透镜成像 · 蜡烛远近，像变样",
    "tagline": "一支蜡烛立在凸透镜前：离得远，像小而倒；拖近一点，像大起来；再拖过一个点，像忽然跳到镜子同一侧、正立放大。变的不是魔法，是两条分水岭：一倍焦距分虚实，二倍焦距分大小。这一页所有的像，都由透镜公式 1/f = 1/u + 1/v 当场算出来——图上画的、嘴里说的，必须是同一个像。",
    "nav0": "0 平行光聚成点",
    "nav1": "1 三条特殊光线",
    "nav2": "2 蜡烛远近变像",
    "nav3": "3 光屏与眼睛",
    "nav4": "4 自测",
    "nav5": "5 终章 · 三句话",
    "start": "开始探索 ↓",
    "foot": "visual.integ.life · 凸透镜成像 Convex Lens Imaging —— 一步一交互系列",
    "s0k": "第 0 步 · 光穿过透镜",
    "s0t": "平行光进门，被透镜收拢到一点",
    "s0e": "已知：光在同一种介质里沿直线传播，穿过界面会拐弯（折射）。这一步只回答一个问题：<strong>一束平行于主光轴的光穿过凸透镜，会往哪里走？</strong>先认两个名字：穿过透镜中心、且垂直于镜面的那条直线叫<strong>主光轴</strong>；透镜的中心点叫<strong>光心 O</strong>。拖动焦距滑杆，看右侧的光线交点怎样跟着移动。",
    "s0fLab": "焦距 f（焦点到光心的距离）",
    "s0ro": "平行光被收拢到主光轴上的一点——这就是<strong>焦点 F</strong>：它在光心右侧 <span>{f}</span> 处（这段距离就叫<strong>焦距</strong>）；2F 点在 <span>{f2}</span> 处。现在 f = {f}：{judge}",
    "s0judgeShort": "焦距较短，光线转角较大，在较近处会聚；不是传播时间变短。",
    "s0judgeMid": "焦点在中等距离，图只比较几何方向。",
    "s0judgeLong": "焦距较长，光线转角较小，在较远处会聚；图不计传播时间。",
    "s0hint": "结论：<strong>凸透镜是会聚透镜</strong>——能把平行光会聚到焦点。适用条件：本页画的是<strong>薄透镜、靠近主光轴的光线</strong>这一理想情形；真实透镜靠边缘的光线会略有偏差（叫球差），本页不展开。",
    "cAxis": "主光轴",
    "cFocusTag": "焦点 F",
    "s1k": "第 1 步 · 三条特殊光线",
    "s1t": "定位一个像点，只需要三条光线",
    "s1e": "这一步要回答：如何从物点发出的光确定像点？在本页的薄透镜近轴模型中，两条独立主光线即可定位：实像是出射光线相交，虚像是反向延长线相交；物体恰在焦平面时出射光平行，无有限像点。拖物点或用滑杆，逐条切换主光线。本步固定f=60，距离和高度同用任意长度单位；1/f=1/u+1/v。 本步u>0为实物距离；v>0指右侧实像、v<0指左侧虚像，|v|只表示距离的正尺寸。",
    "s1uLab": "物距 u（蜡烛到光心）",
    "s1hLab": "物高（烛焰顶端到主光轴）",
    "s1r1": "线 1 · 平行→过焦点",
    "s1r2": "线 2 · 过光心→不弯腰",
    "s1r3": "线 3 · 过焦点→变平行",
    "s1rule1": "线 1：平行于主光轴出发，穿过透镜后拐向另一侧的焦点 F。",
    "s1rule2": "线 2：正穿过光心，不偏折、直行到底。",
    "s1rule3": "线 3：出发时先穿过近侧焦点 F，穿过透镜后变得与主光轴平行。",
    "s1roIdle": "先点亮至少一条线，看它穿过透镜后往哪走。",
    "s1ro": "物距 u = {u}，公式给出像距 v = <span>{v}</span>。图上亮起的光线交点正好落在那里：像高的绝对值 <span>{ih}</span>（物高 {oh} 的 {m} 倍，<b>倒立</b>）。任意两条线的交点就能定像，第三条会自动来会合。",
    "s1roVirt": "物距 u = {u}（小于焦距 60）：右侧的光线是散开的、不相交；把它们<strong>反向延长</strong>（虚线），在左侧交出像点：像距 |v| = <span>{v}</span>，像高的绝对值 <span>{ih}</span>（物高 {oh} 的 {m} 倍，<b>正立</b>）——这是虚像，第 3 步细说。",
    "s1roInf": "物距 u = {u}，恰好等于焦距：穿过透镜的光线互相平行、永远不相交——<b>像在无穷远</b>，图上画不出像点。",
    "s1hint": "第三条特殊光线只在存在有限透镜面交点且位于绘图区时显示；u=f时它不成立，可用前两条看平行出射。图中透镜是符号，不模拟口径截光。大角度、边缘光线及真实厚透镜不由本图精确预测。",
    "cObjTip": "烛焰顶端",
    "s2k": "第 2 步 · 蜡烛远近（核心步）",
    "s2t": "蜡烛一路拖近，像连变五副面孔",
    "s2e": "这一步只回答：物距u改变时，像距与像的类型怎样变？本步固定会聚薄透镜f=60、实物高H=26；距离同用任意长度单位。光从左向右，物点在x=−u，u>0；v>0是右侧实像，v<0是左侧虚像。带符号放大率M=−v/u，正号为正立、负号为倒立；像尺寸的倍率是|M|。先点u=f预设，再按物距滑杆←/→一次（0.1单位）观察两侧有限像距。",
    "s2uLab": "物距 u",
    "s2pFar": "远处 3f（u = 180）",
    "s2p2f": "恰在 2f（u = 120）",
    "s2pMid": "f 与 2f 之间（u = 90）",
    "s2pF": "恰在 f（u = 60）",
    "s2pNear": "f 以内（u = 30）",
    "s2roGt": "u = {u}（<b>大于 2f</b>）：像跑到透镜另一侧，像距 v = <span>{v}</span>，尺寸倍率|M|={m}——<b>倒立、缩小、实像</b>。照相机就是把景物放在这一段。",
    "s2roEq2": "u = {u}（<b>恰好 2f</b>）：像距 v = <span>{v}</span>，尺寸倍率|M|={m}——<b>倒立、等大、实像</b>。这里是「大小」的分水岭。",
    "s2roMid": "u = {u}（<b>在 f 与 2f 之间</b>）：像距 v = <span>{v}</span>，尺寸倍率|M|={m}——<b>倒立、放大、实像</b>。投影仪把幻灯片放在这一段。",
    "s2roEqF": "u = {u}（<b>恰好在焦点上</b>）：穿过透镜的光线互相平行、永不相交——<b>像在无穷远</b>，光屏放在哪里都接不到。这里是「虚实」的分水岭。",
    "s2roLt": "u = {u}（<b>小于 f</b>）：右侧光线散开、不相交，反向延长线在左侧交出像：|v| = <span>{v}</span>，尺寸倍率|M|={m}——<b>正立、放大、虚像</b>。放大镜就是把东西放在这一段。",
    "s2hint": "只在未舍入u=f时是无有限像点；u→f⁻时v→−∞，u→f⁺时v→+∞。显示的近似值不能代替状态判断，下行u−f能区分两侧。物距u=2f时M=−1；附近不是精确等大。画布范围有限，像在画外不等于不存在；比例尺不随u自动缩放。本模型与小孔成像不同：透镜须满足焦距关系，不能只套小孔比例。",
    "cBandFar": "u>2f · 缩小实像",
    "cBandMid": "f<u<2f · 放大实像",
    "cBandNear": "u<f · 放大虚像",
    "cFarTag": "像在很远处 →",
    "s3k": "第 3 步 · 光屏与眼睛",
    "s3t": "实像接得住，虚像只能看",
    "s3e": "这一步要回答：屏能直接接到哪一种像？本步另用固定情境：f=60、物高26；实像情境u=150、v=100，虚像情境u=30、v=−60。移动光屏比较p与v；只有p=v的未舍入状态标为恰好合焦。模糊与光斑只是离焦示意，不计算照度、衍射或真实点扩散函数。眼睛图标示观察方向，不求眼内成像。",
    "s3mReal": "情境一 · 光屏接实像",
    "s3mVirt": "情境二 · 放大镜的虚像",
    "s3bridge": "先留在<strong>情境一</strong>，把光屏拖到像距 v 看清实像；再切到<strong>情境二</strong>，观察同一类光屏为什么接不到虚像。",
    "s3scrLab": "光屏位置（到光心的距离）",
    "s3roSharp": "光屏在 {p} 处，<b>正好等于像距 v = {v}</b>：屏上的烛焰<strong>清晰</strong>！实像就是光线真实交汇成的像——交汇点落在哪，屏就要摆在哪。",
    "s3roBlur": "光屏在 {p} 处，像距是 {v}，还差 <span>{d}</span>：屏上的像糊成一团（模糊为示意）。光线还没交汇（或已经交汇过又散开），屏截到的只是一片光斑。把屏拖到 {v} 处试试。",
    "s3roVirt": "本情境u=30，v=−60：虚像在物侧，正立放大。右侧光屏p={p}处不能直接截得这个虚像；图只示意出射方向与反向延长线，不计算屏上照度或真实眼内成像。",
    "s3hint": "实像是出射光线实际会聚的点，可在其位置用屏接到；虚像是反向延长线的交点，不能在该点用屏直接接到。后续光学系统仍可利用这些光线另成像，这里未模拟。",
    "cScreen": "光屏",
    "cEye": "眼睛",
    "cOnScreen": "屏上的像",
    "cNothing": "屏上只有光斑",
    "s4k": "第 4 步 · 自测",
    "s4t": "三道题，验一验两条分水岭",
    "s4e": "不用公式，只用两条分水岭口诀：一倍焦距分虚实、二倍焦距分大小。下面轴图随时可查（f = 60）。",
    "s4q1": "① 照相机的镜头是凸透镜。被拍的人离镜头很远（u > 2f），传感器上成的像是什么样？",
    "s4q1o0": "倒立、缩小、实像",
    "s4q1o1": "正立、放大、虚像",
    "s4q1o2": "倒立、放大、实像",
    "s4q1why": "u > 2f 时成倒立、缩小的实像——相机正是这样把大景物收进小小的传感器，还能被传感器「接住」。",
    "s4q2": "② 蜡烛从 3f 处慢慢拖到 1.5f 处（全程都在 f 以外），像会怎样变？",
    "s4q2o0": "由放大变缩小，仍是倒立实像",
    "s4q2o1": "由缩小变放大，仍是倒立实像",
    "s4q2o2": "越过某个点后变成正立虚像",
    "s4q2why": "3f 处 u > 2f，像缩小；1.5f 处在 f 与 2f 之间，像放大。全程没越过 F，所以始终是倒立实像——只有越过 F 才会翻成虚像。",
    "s4q3a": "③ 投影仪要成倒立、放大的实像，幻灯片应放在哪一段？",
    "s4q3b": "放大镜要看正立、放大的虚像，物体应放在哪一段？",
    "s4zGt": "u > 2f",
    "s4zMid": "f < u < 2f",
    "s4zLt": "u < f",
    "s4q3awhy": "倒立放大的实像只出现在 f < u < 2f 段：幻灯片放这一段，幕布上才是放大的像（放反了片子，幕上才是正的，就是这个理）。",
    "s4q3bwhy": "正立放大的虚像只在 u < f 段出现：物体一旦越过 F，就会改成倒立实像，放大镜就「失灵」了。",
    "s4ok": "✓ 答对了。",
    "s4no": "✗ 不对。",
    "s4idle": "点一个选项作答。",
    "s4hint": "三道题考的是同一件事：先看 u 在哪一段——比 2f 远、夹在 f 与 2f 之间、还是在 f 以内——正倒、大小、实虚就全定了。",
    "s5k": "第 5 步 · 终章",
    "s5t": "把这一页收成三句话",
    "s5e": "蜡烛还是那支蜡烛，透镜还是那块透镜。能预言像的全部本事，就是两条分水岭加三条光线：",
    "c1h": "一倍焦距分虚实",
    "c1": "u > f：光线真实交汇，成<strong>实像</strong>，在透镜另一侧；u < f：只有反向延长线交汇，成<strong>虚像</strong>，和物体同一侧；u = f：光线平行出门，像在<strong>无穷远</strong>。",
    "c2h": "二倍焦距分大小",
    "c2": "u > 2f 像缩小，u = 2f 像等大，f < u < 2f 像放大。外加一条总规律：<strong>实像永远倒立，虚像永远正立</strong>。照相机、投影仪、放大镜，无非是把物体放在不同段。",
    "c3h": "三条光线作图",
    "c3": "平行线穿镜过焦点，过心线直行不弯腰，过焦点线出门变平行。任意两条交出像点，第三条自动来会合——画错了，它当场拆穿你。",
    "s5fin": "从一束平行光开始，你已经能预言任何距离上的像：先用 <strong>1/v = 1/f − 1/u</strong> 算像距，再拿 u 和 f、2f 比一比，正倒大小实虚全落地。照相机、投影仪、放大镜，乃至你眼睛里的晶状体，用的都是这同一条公式。",
    "s5lkRr": "先修课：光线在界面处为什么会拐弯——去看反射与折射的「穿水拐弯」那一步 →",
    "s1rule3Virtual": "线3：u<f时，入射线的反向延长线经过近侧F；光向右到达透镜后平行出射，不是先往左穿过F。",
    "cOutside": "有限像在绘图区外",
    "viewInside": "当前有限像及其完整高度在绘图区内。",
    "viewOutside": "当前像距有限，像仍存在；位置或完整像高超出固定绘图区，不能把裁切当作无穷远或不成像。",
    "viewInfinity": "u=f：本物点的出射光线互相平行，无有限像点；像高和放大率在此不取有限值。",
    "viewRaysOff": "当前未选光线；可重新开启前两条来比较图与像点。",
    "ray3Focus": "u=f时，第3条特殊光线没有有限透镜面交点，图中省略；用前两条观察平行出射。",
    "ray3Outside": "第3条理想作图线的透镜面交点超出绘图区，本图省略这条线；这是显示范围，不是物理口径计算。",
    "formulaFinite": "同一结果：u−f={delta}；带符号v={v}；M=−v/u={M}；像高hᵢ=MH={h}。约定Y向上，长度同单位；M无量纲。",
    "formulaFocus": "u−f=0：像在无穷远（无有限像点）；M与像高不在本状态定义为某个有限数。",
    "modelScope": "模型：理想会聚薄透镜、近轴、实物、透镜两侧相同介质；f>0。忽略色散、像差、有限口径与衍射。各步骤参数独立，本步f不随第0步焦距滑杆改变。图线不是光传播时间或能量比例。",
    "modelSource": "科学依据：OpenStax · 薄透镜、符号与主光线 ↗",
    "navLabel": "步骤导航",
    "canvasLabel": "理想薄透镜光路；数值、范围与键盘操作说明在本图附近",
    "nextLens": "继续现有透镜课：焦距为何区分实像与虚像 →"
  },
  "en": {
    "docTitle": "Convex Lens Imaging · Move the Candle, Change the Image — One Interaction per Step",
    "back": "← Knowledge Index",
    "pageTitle": "Convex Lens Imaging · Move the Candle, Change the Image",
    "tagline": "A candle stands before a convex lens: far away, its image is small and upside-down; drag it closer and the image grows; drag it past one special point and the image suddenly jumps to the same side of the lens, upright and magnified. No magic — just two watershed points: one focal length splits real from virtual, two focal lengths split shrinking from magnifying. Every image on this page is computed live from the lens formula 1/f = 1/u + 1/v — what the picture shows and what the words say are the same image.",
    "nav0": "0 Parallel Light, One Point",
    "nav1": "1 Three Special Rays",
    "nav2": "2 Move the Candle",
    "nav3": "3 Screen & Eye",
    "nav4": "4 Self-Test",
    "nav5": "5 Finale · Three Sentences",
    "start": "Start exploring ↓",
    "foot": "visual.integ.life · Convex Lens Imaging —— One Interaction per Step series",
    "s0k": "Step 0 · Light through a Lens",
    "s0t": "Parallel light goes in — the lens gathers it to one point",
    "s0e": "Known: light travels straight in one medium and bends at an interface (refraction). This step answers one question only: <strong>where does a bundle parallel to the principal axis go after passing through a convex lens?</strong> Two names first: the straight line through the centre of the lens, perpendicular to it, is the <strong>principal axis</strong>; the centre point of the lens is the <strong>optical centre O</strong>. Drag the focal-length slider and watch where the rays on the right meet.",
    "s0fLab": "Focal length f (focus to optical centre)",
    "s0ro": "The parallel light is gathered onto one point of the axis — the <strong>focus F</strong>: it sits <span>{f}</span> to the right of the optical centre (that distance is the <strong>focal length</strong>); the 2F point sits at <span>{f2}</span>. With f = {f}: {judge}",
    "s0judgeShort": "A shorter focal length gives larger ray deflections and a nearer focus; it does not measure travel time.",
    "s0judgeMid": "The focus is at an intermediate distance; this drawing compares geometry only.",
    "s0judgeLong": "A longer focal length gives smaller deflections and a farther focus; travel time is not computed.",
    "s0hint": "Conclusion: <strong>a convex lens is a converging lens</strong> — it gathers parallel light to its focus. Conditions: this page draws the idealised case of a <strong>thin lens and rays near the axis</strong>; rays near the rim of a real lens deviate slightly (spherical aberration), which this page does not develop.",
    "cAxis": "principal axis",
    "cFocusTag": "focus F",
    "s1k": "Step 1 · Three Special Rays",
    "s1t": "Locating one image point takes only three rays",
    "s1e": "Question: how do rays from one object point locate an image point? In this paraxial thin-lens model, two independent principal rays suffice. Real images are intersections of outgoing rays; virtual images are intersections of backward extensions. At the focal plane the outgoing rays are parallel and there is no finite image point. Drag the object or use the sliders and toggle rays. This step fixes f=60; distances and heights use the same arbitrary length unit;1/f=1/u+1/v. Here u>0 is real-object distance; v>0 is a real image on the right and v<0 a virtual image on the left. |v| is the positive distance size.",
    "s1uLab": "Object distance u (candle to centre)",
    "s1hLab": "Object height (flame tip to axis)",
    "s1r1": "Ray 1 · Parallel → through focus",
    "s1r2": "Ray 2 · Through centre → straight",
    "s1r3": "Ray 3 · Through focus → parallel",
    "s1rule1": "Ray 1: leaves parallel to the axis, bends at the lens toward the far focus F.",
    "s1rule2": "Ray 2: passes straight through the optical centre, undeviated.",
    "s1rule3": "Ray 3: leaves through the near focus F, leaves the lens parallel to the axis.",
    "s1roIdle": "Light at least one ray and watch where it goes after the lens.",
    "s1ro": "Object distance u = {u}; the formula gives image distance v = <span>{v}</span>. The lit rays meet exactly there: absolute image height <span>{ih}</span> ({m}× the object height {oh}, <b>inverted</b>). Any two rays fix the point — the third joins on its own.",
    "s1roVirt": "Object distance u = {u} (less than the focal length 60): on the right the rays spread apart and never meet; extend them <strong>backwards</strong> (dashed) and they meet on the left: |v| = <span>{v}</span>, absolute image height <span>{ih}</span> ({m}× the object height {oh}, <b>upright</b>) — a virtual image, more in Step 3.",
    "s1roInf": "Object distance u = {u}, exactly the focal length: after the lens the rays run parallel and never meet — <b>the image is at infinity</b>, no image point can be drawn.",
    "s1hint": "The third special ray is shown only if its lens-plane intercept is finite and inside the drawing. It is unavailable at u=f; use the first two rays to see parallel output. The lens symbol is not an aperture calculation. Large-angle, marginal and thick-lens behaviour is outside this approximation.",
    "cObjTip": "flame tip",
    "s2k": "Step 2 · Moving the Candle (the core step)",
    "s2t": "Drag the candle closer — the image wears five faces",
    "s2e": "Question: how does changing u change image distance and type? This step fixes a converging thin lens at f=60 and a real object of height H=26, in one arbitrary length unit. Light travels left to right; the object is at x=−u with u>0. v>0 is a real image on the right; v<0 is a virtual image on the left. Signed magnification M=−v/u is positive for upright and negative for inverted; size factor is|M|. Select the u=f preset, then press ←/→ once on the object slider (0.1 unit) to compare finite distances on either side.",
    "s2uLab": "Object distance u",
    "s2pFar": "Far, 3f (u = 180)",
    "s2p2f": "Exactly 2f (u = 120)",
    "s2pMid": "Between f and 2f (u = 90)",
    "s2pF": "Exactly f (u = 60)",
    "s2pNear": "Inside f (u = 30)",
    "s2roGt": "u = {u} (<b>beyond 2f</b>): the image sits on the other side, v = <span>{v}</span>, size factor|M|={m} — <b>inverted, shrunk, real</b>. A camera puts its subject in this zone.",
    "s2roEq2": "u = {u} (<b>exactly 2f</b>): v = <span>{v}</span>, size factor|M|={m} — <b>inverted, same size, real</b>. This is the size watershed.",
    "s2roMid": "u = {u} (<b>between f and 2f</b>): v = <span>{v}</span>, size factor|M|={m} — <b>inverted, magnified, real</b>. A projector puts its slide in this zone.",
    "s2roEqF": "u = {u} (<b>exactly at the focus</b>): after the lens the rays run parallel and never meet — <b>the image is at infinity</b>, no screen anywhere can catch it. This is the real/virtual watershed.",
    "s2roLt": "u = {u} (<b>less than f</b>): the rays spread on the right; their backward extensions meet on the left: |v| = <span>{v}</span>, size factor|M|={m} — <b>upright, magnified, virtual</b>. A magnifying glass holds its object in this zone.",
    "s2hint": "Only unrounded u=f has no finite image point. As u→f from below, v→−∞; from above, v→+∞. Rounded labels do not classify states; u−f below distinguishes the sides. At u=2f,M=−1; nearby values are not exactly equal size. A finite image outside the fixed view still exists. The scale does not auto-zoom. This is not the pinhole model: a lens must also satisfy its focal-length relation.",
    "cBandFar": "u>2f · smaller, real",
    "cBandMid": "f<u<2f · bigger, real",
    "cBandNear": "u<f · bigger, virtual",
    "cFarTag": "image far away →",
    "s3k": "Step 3 · Screen and Eye",
    "s3t": "A real image can be caught; a virtual one can only be seen",
    "s3e": "Question: which image can a screen intercept directly? This step uses separate fixed scenes: f=60,H=26; real scene u=150,v=100; virtual scene u=30,v=−60. Move screen p and compare with v. Only the unrounded equality p=v is labelled exactly in focus. Blur and patches are defocus illustrations, not irradiance, diffraction or a physical point-spread calculation. The eye icon indicates viewing direction, not internal-eye imaging.",
    "s3mReal": "Scene 1 · Catch a real image",
    "s3mVirt": "Scene 2 · The magnifier’s virtual image",
    "s3bridge": "Start with <strong>Scene 1</strong>: drag the screen to image distance v and catch the real image. Then switch to <strong>Scene 2</strong> to see why that screen cannot catch a virtual image.",
    "s3scrLab": "Screen position (distance from centre)",
    "s3roSharp": "The screen is at {p}, <b>exactly the image distance v = {v}</b>: the flame on it is <strong>sharp</strong>! A real image is where rays truly converge — the screen must sit exactly at the meeting point.",
    "s3roBlur": "The screen is at {p}; the image distance is {v}, off by <span>{d}</span>: the image blurs into a blob (blur drawn schematically). The rays have not met yet (or have met and spread again) — the screen only slices a patch of light. Drag it to {v} and try.",
    "s3roVirt": "Here u=30,v=−60: the virtual image is upright, enlarged and on the object side. A right-hand screen at p={p} cannot intercept this virtual image directly. Only outgoing directions and backward extensions are illustrated, not screen irradiance or real eye imaging.",
    "s3hint": "A real image is an actual convergence of outgoing rays and can be intercepted there. A virtual image is an intersection of backward extensions and cannot be intercepted directly at that point. Another optical system could form a further image from the rays; that is not simulated here.",
    "cScreen": "screen",
    "cEye": "eye",
    "cOnScreen": "image on screen",
    "cNothing": "only a light patch",
    "s4k": "Step 4 · Self-Test",
    "s4t": "Three questions on the two watersheds",
    "s4e": "No formulas — just the pocket rule: one focal length splits real from virtual, two split small from large. The axis diagram below stays available (f = 60).",
    "s4q1": "Q1. A camera lens is a convex lens. The person stands far away (u > 2f). What is the image on the sensor like?",
    "s4q1o0": "Inverted, smaller, real",
    "s4q1o1": "Upright, magnified, virtual",
    "s4q1o2": "Inverted, magnified, real",
    "s4q1why": "For u > 2f the image is inverted, smaller and real — a camera squeezes a big scene onto a tiny sensor, and the sensor can “catch” it.",
    "s4q2": "Q2. A candle is dragged slowly from 3f to 1.5f (staying outside f the whole way). How does the image change?",
    "s4q2o0": "From magnified to smaller, still a real image",
    "s4q2o1": "From smaller to magnified, still an inverted real image",
    "s4q2o2": "Past some point it flips to an upright virtual image",
    "s4q2why": "At 3f, u > 2f, so the image is smaller; at 1.5f it sits between f and 2f, so magnified. F is never crossed, so it stays an inverted real image — only crossing F flips it to virtual.",
    "s4q3a": "Q3a. A projector needs an inverted, magnified, real image. Which zone should the slide be in?",
    "s4q3b": "Q3b. A magnifying glass needs an upright, magnified, virtual image. Which zone should the object be in?",
    "s4zGt": "u > 2f",
    "s4zMid": "f < u < 2f",
    "s4zLt": "u < f",
    "s4q3awhy": "An inverted, magnified, real image exists only for f < u < 2f: slides live in this zone — and a slide loaded upside down projects upright, for exactly this reason.",
    "s4q3bwhy": "An upright, magnified, virtual image exists only for u < f: once the object crosses F it turns into an inverted real image and the magnifier “stops working”.",
    "s4ok": "✓ Correct. ",
    "s4no": "✗ Not quite. ",
    "s4idle": "Tap an option to answer.",
    "s4hint": "All three questions ask the same thing: first locate u — beyond 2f, between f and 2f, or inside f — and orientation, size and real/virtual are all decided.",
    "s5k": "Step 5 · Finale",
    "s5t": "The whole page in three sentences",
    "s5e": "Same candle, same lens. Everything needed to predict the image is two watersheds plus three rays:",
    "c1h": "One focal length splits real from virtual",
    "c1": "u > f: rays truly meet — a <strong>real image</strong> on the other side. u < f: only the backward extensions meet — a <strong>virtual image</strong> on the same side. u = f: the rays leave parallel, the image is <strong>at infinity</strong>.",
    "c2h": "Two focal lengths split small from large",
    "c2": "u > 2f shrinks, u = 2f matches, f < u < 2f magnifies. Plus one blanket rule: <strong>real images are always inverted, virtual images always upright</strong>. Cameras, projectors and magnifiers merely park the object in different zones.",
    "c3h": "Three rays do the drawing",
    "c3": "The parallel ray bends through the focus, the centre ray walks straight, the through-focus ray leaves parallel. Any two fix the image point; the third arrives on its own — and exposes a wrong drawing on the spot.",
    "s5fin": "Starting from one bundle of parallel light, you can now predict the image at any distance: compute the image distance with <strong>1/v = 1/f − 1/u</strong>, then compare u with f and 2f — orientation, size and real-vs-virtual all fall out. Cameras, projectors, magnifying glasses and the lens inside your own eye all run on this one formula.",
    "s5lkRr": "Prerequisite: why does a ray bend at an interface at all? See the “through water” step of Reflection & Refraction →",
    "s1rule3Virtual": "Ray3: for u<f, the incoming ray’s backward extension passes through the near F. Light travels right to the lens and then exits parallel; it does not first travel left through F.",
    "cOutside": "finite image outside view",
    "viewInside": "The finite image and its full height fit in this drawing.",
    "viewOutside": "Image distance is finite and the image still exists. Its position or full height lies outside the fixed view; clipping is not infinity or absence of an image.",
    "viewInfinity": "u=f: rays from this point leave parallel. No finite image point; image height and magnification have no finite value here.",
    "viewRaysOff": "No rays are selected. Enable the first two again to compare the drawing with the image point.",
    "ray3Focus": "At u=f the third principal ray has no finite lens-plane intercept and is omitted. Use the first two to observe parallel output.",
    "ray3Outside": "The third ideal construction ray meets the lens plane outside this drawing and is omitted. This is a view limit, not a physical aperture calculation.",
    "formulaFinite": "Same result: u−f={delta}; signed v={v}; M=−v/u={M}; image height hᵢ=MH={h}. Y points upward; lengths share one unit and M is dimensionless.",
    "formulaFocus": "u−f=0: image at infinity (no finite image point). M and image height are not assigned a finite value in this state.",
    "modelScope": "Model: ideal converging thin lens, paraxial rays, real object, same surrounding medium on both sides,f>0. Dispersion, aberrations, aperture and diffraction are omitted. Steps use independent parameters; this step’s f does not follow step0’s focal slider. Rays do not encode travel time or energy fractions.",
    "modelSource": "Scientific basis: OpenStax · thin lenses, signs and principal rays ↗",
    "navLabel": "Step navigation",
    "canvasLabel": "Ideal thin-lens rays; nearby text gives values, view limits and keyboard instructions",
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
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.getAttribute('data-i18n-aria'))));
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed',String(b.dataset.lang===lang));
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
