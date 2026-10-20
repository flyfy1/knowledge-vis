'use strict';
const STR = {
  "zh": {
    "docTitle": "圆周角定理 · 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "圆周角定理",
    "tagline": "站在圆周上看同一段弧，张角只有站在圆心看的一半——而且你站在圆周的哪个位置都一样。拖着 P 满圆跑，亲眼撞见这个角纹丝不动，再用一根辅助线把「一半」拆开看。",
    "foot": "圆周角定理 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互几何图；操作方法见上方说明",
    "posLab": "P 的位置角（键盘可调）",
    "centralLab": "圆心角 ∠AOB（40°–160°）",
    "recordBtn": "记一笔",
    "lbCentral": "圆心角",
    "lbInscribed": "圆周角",
    "lbChord": "弦",
    "lbMinor": "劣弧",
    "lbMajor": "优弧",
    "lbRadius": "半径",
    "lbDiameter": "直径",
    "s0ro": "圆心角 ∠AOB = {aob}°（坐标实算）；圆周角 ∠APB = {apb}°（坐标实算）。两个角对着同一段弧 AB：一个顶点在圆心，一个顶点在圆周上。",
    "s1ro": "圆心角 ∠AOB = {aob}°；圆周角 ∠APB = {apb}°（几何实算，不是拿圆心角除以 2）；圆心角的一半 = {half}°；两者之差 = {diff}°。",
    "s1ledgerT": "账本：P 在优弧上换位置（至少记 3 笔不同位置）",
    "s1ledgerIdle": "还没有记录。拖动 P 换个位置，点「记一笔」。",
    "s1entry": "第 {i} 笔：P 位置角 {pos}°，∠AOB = {aob}°，∠APB = {apb}°，与一半之差 {diff}°。",
    "s1hint": "提示：圆周角是页面按 P、A、B 三点坐标现算的——「纹丝不动」是算出来的事实，不是写好的台词。切到第 4 步会看到：P 一旦换到另一段弧上，这个角立刻变样。",
    "proofNext": "作辅助线：下一步",
    "s2stage0": "作图进度 0/4。先看清：P 在优弧上，∠APB 与 ∠AOB 对着同一段弧 AB。点「作辅助线：下一步」，一刀一刀拆。",
    "s2stage1": "作图进度 1/4。①连 OP 并延长，交圆于 D：PD 是一条过圆心的直径。OA、OB、OP 都是半径，一样长（图上同有刻痕）。",
    "s2stage2": "作图进度 2/4。②图被分成两个等腰三角形：△OAP 中 OA = OP，底角 ∠OAP = ∠OPA = {opa}°（青）；△OBP 中 OB = OP，底角 ∠OBP = ∠OPB = {opb}°（粉）。度数全部坐标实算。",
    "s2stage3": "作图进度 3/4。③外角登场：∠AOD 是 △OAP 的外角，∠AOD = ∠OAP + ∠OPA = {opa} + {opa} = {aod}°；同理 ∠BOD = ∠OBP + ∠OPB = {opb} + {opb} = {bod}°。两边都是实算，对得上。",
    "s2stage4": "作图进度 4/4。④合并收口（点下面等式里的角，图上对应的角会高亮）：",
    "centralLab2": "圆心角 ∠AOB（60°–160°）",
    "s2fixNote": "小提示：这一步里 P 是特意钉住不动的，只许改圆心角——证明盯着同一种情形看：圆心角换一个数，整套等式怎么跟着重算。P 一动就换了情形（P 挪到别的弧上是减法版，第 4 步回收）。圆心角也不许小于 60°：再小，B 就贴到直径端点 D 上，粉色那个等腰三角形会被压成一条线，图上就「无三角形可拆」了。",
    "offsetLab": "弦 AB 离圆心的距离 d（0 = 正好过圆心）",
    "s3ro": "∠APB = {apb}°（坐标实算）；弦 AB 离圆心 d = {d}。",
    "s3right": "AB 过圆心、是直径：P 在圆上哪儿（除 A、B 本身），算出来都是 90°。",
    "s3not": "AB 没过圆心、不是直径：角立刻不是 90° 了——「很长的弦」冒充不了直径。",
    "s3ledgerT": "账本：直径情形下 P 的位置",
    "s3ledgerIdle": "还没有记录。把 d 调回 0，拖动 P 换个位置，点「记一笔」。",
    "s3entry": "P 位置角 {pos}°：∠APB = {apb}°。",
    "s4ro1": "P 现在在{arc}上：∠APB = {apb}°（实算）；影子点 P′ 在另一段弧上，∠AP′B = {apb2}°（实算）；两角之和 = {sum}°。",
    "s4ro2": "圆心角两副面孔：对劣弧的 ∠AOB = {minor}°，对优弧的优角 = {reflex}°。核对：劣弧上的圆周角 {onMinor}° = 优角的一半 {halfReflex}°。",
    "arcNameMajor": "优弧",
    "arcNameMinor": "劣弧",
    "q1t": "①圆心角 ∠AOB = 80°，P 在优弧上。圆周角 ∠APB 是多少？",
    "q2t": "②判断对错：AB 是直径，P 在圆上任意位置（P ≠ A、B），∠APB 一定是 90°。",
    "q3t": "③一条弦 AB，优弧上的圆周角是 65°。同一条弦、劣弧上的圆周角是多少？",
    "q4t": "④操作题：下图圆心角预设 90°，P 先被放在劣弧上（那里的角是 135°）。拖动 P（或用位置角滑杆），把 P 放到使 ∠APB = 45° 的位置。",
    "optTrue": "对",
    "optFalse": "错",
    "correct": "答对了，已锁定。",
    "incorrect": "不对，再想想——回到对应步骤的结论核对一遍。",
    "scoreQ": "自测进度：已答对 {k}/4 题。",
    "q4ro": "当前 ∠APB = {apb}°（坐标实算），P 在{arc}上。达标条件：实算角落在 45° ± 1° 内，且 P 在优弧上。{state}",
    "q4done": "已达标，本题锁定。",
    "q4todo": "还没达标。",
    "s5hint": "四题全对，通关。带走三句话：同弧所对的圆周角等于圆心角的一半、且处处相等；直径所对的圆周角是 90°（泰勒斯）；同一条弦、两段弧上的圆周角互补，和为 180°。",
    "card1t": "同弧：一半且相等",
    "card1b": "P 在同一段弧上任意站，∠APB 都等于 ∠AOB 的一半——位置随便挑，角不挑位置。",
    "card2t": "直径：90°（泰勒斯定理）",
    "card2b": "AB 是直径时，圆心角是 180° 的平角，它的一半就是 90°：半圆所对的圆周角恒为直角。",
    "card3t": "换弧：互补 180°",
    "card3b": "同一条弦 AB，两段弧上的圆周角互补；劣弧上的角等于圆心优角（>180°）的一半。",
    "linkPyth": "勾股定理第 4 步「反过来判」：三边满足 a²+b²=c² 的三角形是直角三角形，它的斜边恰好是外接圆的直径——那里的直角和本页第 3 步的 90° 是同一件事 →",
    "linkSym": "对称与旋转第 2 步「转一转」：圆绕圆心转任意角度都与自己重合——P 在圆周上「站哪都一样」，正是圆的旋转对称的另一面 →",
    "nav0": "0 先认部件",
    "s0k": "第 0 步",
    "s0t": "先认部件：两个角，顶点站得不一样",
    "s0e": "这一步要回答：圆心角和圆周角到底差在哪？圆 O 上有弦 AB 和圆周上一点 P。<strong>圆心角</strong> ∠AOB 的顶点在圆心、两边是半径 OA、OB；<strong>圆周角</strong> ∠APB 的顶点在圆周上、两边是弦 PA、PB。<strong>弦</strong>是连圆上两点的线段，过圆心的弦叫直径；圆上 A 与 B 之间的曲线叫<strong>弧</strong>，小于半圆的这段叫<strong>劣弧</strong>。拖动 P（或用位置角滑杆）沿圆周走，看名牌跟到哪；读数只报两个角的坐标实测值，先不下结论。P 不能与 A、B 重合（两弦退化、角无定义），拖近时会被停在至少 2° 之外。本页只谈平面上的圆；真实量角有误差，这里的读数是几何实算、没有测量误差。",
    "nav1": "1 拖点实验",
    "s1k": "第 1 步",
    "s1t": "拖点实验：P 乱跑，角纹丝不动",
    "s1e": "这一步要回答：P 在同一段弧上乱跑，∠APB 变不变？它和 ∠AOB 是什么关系？A、B 先固定（圆心角 80°）。大于半圆的那段弧叫<strong>优弧</strong>，拖 P 在优弧上满处跑，或用位置角滑杆；读数并排三项——圆心角、圆周角实测值、圆心角的一半。点「记一笔」把当前位置记进账本，至少记 3 笔不同位置，看每笔的差是不是都约等于 0。再用「圆心角」滑杆（40°–160°）改 ∠AOB 重做：P 的角立刻跟着变。先把结论说清一半：本步的结论只对 P 留在同一段弧上成立，换到另一段弧会怎样，第 4 步专门处理。",
    "nav2": "2 为什么：一刀拆开",
    "s2k": "第 2 步",
    "s2t": "为什么：一根辅助线，把大角拆成两份",
    "s2e": "这一步要回答：「一半」这个倍数是从哪儿来的，能不能画出来看？先回收两个工具：<strong>等腰三角形</strong>两腰相等时，两个底角相等；<strong>外角</strong>是三角形一个内角的补角，等于不相邻的两个内角之和（本步图上会标出）。点「作辅助线」一步一画，不许一次全出：①连 OP 并延长成直径；②认出两个等腰三角形；③外角登场；④合并收口。每个等式旁的度数都是坐标实算，拖「圆心角」滑杆换个数，全部等式跟着重算。本证法覆盖圆心 O 落在圆周角内部的主情形；O 落在角外（P 换到另一段弧）时是减法版，第 4 步点名回收，这里先留个悬念。",
    "nav3": "3 直径特例",
    "s3k": "第 3 步",
    "s3t": "直径特例：半圆上的角恒为直角（泰勒斯）",
    "s3e": "这一步要回答：当 AB 本身就是直径（圆心角 = 180° 的平角）时，圆周角是多少？拖 P 在圆上任意跑——两个半圆都试——读数由坐标实算。180° 的一半就是 90°，所以这不需要新定理，是第 1 步结论的直接特例；它有个专名：<strong>泰勒斯定理</strong>，就是「直径（半圆）所对的圆周角是直角」。再给一个反例位：用下面的滑杆把弦 AB 拖离圆心（d > 0），AB 成了一条不过圆心的长弦，角立刻不是 90°——只有过圆心的弦才算直径。",
    "nav4": "4 换一段弧",
    "s4k": "第 4 步",
    "s4t": "换一段弧：角跳成它的补角",
    "s4e": "这一步要回答：P 跑到另一段弧（劣弧）上去，还是同一个角吗？A、B 不动，拖 P 跨过 A 或 B。跨界一瞬间，P「对着」的弧换成了另一段，图上高亮随之互换；影子点 P′ 停在对面那段弧上同步显示。先把名词补齐：大于半圆的那段弧叫<strong>优弧</strong>；大于 180° 的角叫<strong>优角</strong>（reflex angle）；两个角的和是 180°，就说它们<strong>互补</strong>。预期：角会从 40° 跳成 140°，但两角之和恒为 180°。第 2 步留的减法版证明在这里回收一句：P 在劣弧上时辅助线拆出的是差，作图法换成相减，∠AOB（优角）= 2∠APB 仍然成立。",
    "nav5": "5 自测",
    "s5k": "第 5 步",
    "s5t": "自测：四道题，全对才算过关",
    "s5e": "这一步要回答：前四步的结论，你能自己用出来吗？①②③点选项作答，答对锁定、答错可以再想；④是操作题，判定口径写在图下读数里：实算角落在 45° ± 1° 内、且 P 在优弧上才算达标——圆心角 90° 的一半是 45°，而优弧上处处都是这个数，所以这题真正考的是你有没有把 P 放对弧。四题全对后，本步末尾会亮出通关文案。",
    "nav6": "6 终章",
    "s6k": "第 6 步",
    "s6t": "终章：一个定理，三张脸",
    "s6e": "这一步要回答：圆周角定理到底说了什么？同一段弧把圆心角和圆周角锁死成 2:1——圆心视角永远是圆周视角的两倍，而圆周视角不挑站位。真实世界里量角总有误差，但本页的「恒定」不是测量巧合，是几何定理本身：只要 P、A、B 的坐标定了，角就由坐标唯一算出。下面三张卡收束全页，两个链接分别接上勾股定理的直角与圆的旋转对称。"
  },
  "en": {
    "docTitle": "The Inscribed Angle Theorem · One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "The Inscribed Angle Theorem",
    "tagline": "Stand on the circumference and look at the same arc: the angle you see is exactly half the angle at the centre — and it does not matter where on the arc you stand. Drag P around the circle, watch the angle refuse to move, then split the 'half' open with one auxiliary line.",
    "foot": "The Inscribed Angle Theorem · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive geometry for this step; instructions appear above",
    "posLab": "Position angle of P (keyboard alternative)",
    "centralLab": "Central angle ∠AOB (40°–160°)",
    "recordBtn": "Record it",
    "lbCentral": "central angle",
    "lbInscribed": "inscribed angle",
    "lbChord": "chord",
    "lbMinor": "minor arc",
    "lbMajor": "major arc",
    "lbRadius": "radius",
    "lbDiameter": "diameter",
    "s0ro": "Central angle ∠AOB = {aob}° (computed from coordinates); inscribed angle ∠APB = {apb}° (computed from coordinates). Both angles face the same arc AB: one vertex sits at the centre, the other on the circumference.",
    "s1ro": "Central angle ∠AOB = {aob}°; inscribed angle ∠APB = {apb}° (computed geometrically, never by halving the central angle); half of the central angle = {half}°; difference = {diff}°.",
    "s1ledgerT": "Ledger: move P along the major arc (record at least 3 different positions)",
    "s1ledgerIdle": "Nothing recorded yet. Drag P somewhere new and press “Record it”.",
    "s1entry": "Entry {i}: P at position angle {pos}°, ∠AOB = {aob}°, ∠APB = {apb}°, difference from the half = {diff}°.",
    "s1hint": "Note: the inscribed angle is computed live from the coordinates of P, A and B — 'it never moves' is a computed fact you run into, not a scripted line. In step 4 you will see the angle change the moment P switches to the other arc.",
    "proofNext": "Auxiliary line: next move",
    "s2stage0": "Construction 0/4. Look first: P is on the major arc, and ∠APB and ∠AOB face the same arc AB. Press “Auxiliary line: next move” and split the angle one cut at a time.",
    "s2stage1": "Construction 1/4. ①Join OP and extend it to meet the circle at D: PD is a diameter through the centre. OA, OB and OP are all radii, hence equally long (tick marks on the drawing).",
    "s2stage2": "Construction 2/4. ②The figure splits into two isosceles triangles: in △OAP, OA = OP, so the base angles ∠OAP = ∠OPA = {opa}° (cyan); in △OBP, OB = OP, so ∠OBP = ∠OPB = {opb}° (pink). All values computed from coordinates.",
    "s2stage3": "Construction 3/4. ③Enter the exterior angle: ∠AOD is an exterior angle of △OAP, and ∠AOD = ∠OAP + ∠OPA = {opa} + {opa} = {aod}°; likewise ∠BOD = ∠OBP + ∠OPB = {opb} + {opb} = {bod}°. Both sides are computed, and they match.",
    "s2stage4": "Construction 4/4. ④Combine (click an angle in the equation below and the matching angle lights up in the figure):",
    "centralLab2": "Central angle ∠AOB (60°–160°)",
    "s2fixNote": "Note: P is deliberately pinned in this step — only the central angle moves. The proof watches one fixed configuration: change the central angle and watch the whole chain of equalities recompute. Moving P would switch to a different configuration (P on the other arc gives the subtraction version, reclaimed in step 4). The central angle also stops at 60°: any smaller and B slides onto D, the end of the diameter, squashing the pink isosceles triangle into a line segment — there would be no second triangle left to split.",
    "offsetLab": "Distance d of chord AB from the centre (0 = through the centre)",
    "s3ro": "∠APB = {apb}° (computed from coordinates); chord AB sits at distance d = {d} from the centre.",
    "s3right": "AB passes through the centre — it is a diameter: wherever P stands on the circle (other than A or B), the computed angle is 90°.",
    "s3not": "AB misses the centre — it is not a diameter: the angle is immediately no longer 90°. A merely 'long' chord cannot impersonate a diameter.",
    "s3ledgerT": "Ledger: positions of P in the diameter case",
    "s3ledgerIdle": "Nothing recorded yet. Set d back to 0, drag P somewhere new and press “Record it”.",
    "s3entry": "P at position angle {pos}°: ∠APB = {apb}°.",
    "s4ro1": "P is now on the {arc}: ∠APB = {apb}° (computed); the shadow point P′ sits on the other arc, ∠AP′B = {apb2}° (computed); the two angles sum to {sum}°.",
    "s4ro2": "The central angle has two faces: facing the minor arc, ∠AOB = {minor}°; the reflex angle facing the major arc = {reflex}°. Check: the inscribed angle on the minor arc, {onMinor}°, is half the reflex angle, {halfReflex}°.",
    "arcNameMajor": "major arc",
    "arcNameMinor": "minor arc",
    "q1t": "①The central angle ∠AOB = 80°, and P is on the major arc. What is the inscribed angle ∠APB?",
    "q2t": "②True or false: AB is a diameter and P is anywhere on the circle (P ≠ A, B). Then ∠APB is always 90°.",
    "q3t": "③For chord AB, the inscribed angle on the major arc is 65°. What is the inscribed angle on the minor arc, for the same chord?",
    "q4t": "④Hands-on: below, the central angle is preset to 90° and P starts on the minor arc (where the angle is 135°). Drag P (or use the position-angle slider) to a position where ∠APB = 45°.",
    "optTrue": "True",
    "optFalse": "False",
    "correct": "Correct — locked in.",
    "incorrect": "Not quite. Think again — check it against the matching step's conclusion.",
    "scoreQ": "Self-test progress: {k}/4 correct.",
    "q4ro": "Currently ∠APB = {apb}° (computed from coordinates), with P on the {arc}. To pass: the computed angle must fall within 45° ± 1° and P must be on the major arc. {state}",
    "q4done": "Passed — this question is locked.",
    "q4todo": "Not yet.",
    "s5hint": "All four correct — cleared. Take away three sentences: inscribed angles on the same arc equal half the central angle, and are the same everywhere on the arc; an angle in a semicircle is 90° (Thales); on the two arcs of one chord, the inscribed angles are supplementary and sum to 180°.",
    "card1t": "Same arc: half, and equal",
    "card1b": "Wherever P stands on the same arc, ∠APB equals half of ∠AOB — pick any position you like; the angle does not care.",
    "card2t": "Diameter: 90° (Thales' theorem)",
    "card2b": "When AB is a diameter, the central angle is a straight 180°, and half of it is 90°: an angle in a semicircle is always a right angle.",
    "card3t": "Other arc: supplementary 180°",
    "card3b": "For one chord AB, the inscribed angles on its two arcs are supplementary; the one on the minor arc equals half the reflex central angle (>180°).",
    "linkPyth": "Pythagoras, step 4 'Reverse the rule': a triangle whose sides satisfy a²+b²=c² is right-angled, and its hypotenuse is exactly the diameter of its circumcircle — the right angle there is the same 90° as step 3 here →",
    "linkSym": "Symmetry & rotation, step 2 'Turn it': a circle rotated about its centre by any angle coincides with itself — P's 'anywhere is the same' is the other face of the circle's rotational symmetry →",
    "nav0": "0 Meet the parts",
    "s0k": "Step 0",
    "s0t": "Meet the parts: two angles, two different vertices",
    "s0e": "Question: what exactly separates a central angle from an inscribed angle? Circle O carries chord AB and a point P on the circumference. The <strong>central angle</strong> ∠AOB has its vertex at the centre and its sides are the radii OA and OB; the <strong>inscribed angle</strong> ∠APB has its vertex on the circumference and its sides are the chords PA and PB. A <strong>chord</strong> joins two points of the circle, and a chord through the centre is a diameter; the curve between A and B is an <strong>arc</strong>, and the one shorter than a semicircle is the <strong>minor arc</strong>. Drag P around the circle (or use the position-angle slider) and watch the name tags follow; the readout only reports the two angles as computed from coordinates — no conclusion yet. P may not coincide with A or B (the two chords degenerate and the angle is undefined), so near them it is stopped at least 2° away. This page treats plane circles only; real protractors have error, but these readings are exact geometry, not measurements.",
    "nav1": "1 Drag experiment",
    "s1k": "Step 1",
    "s1t": "Drag experiment: P runs around, the angle will not move",
    "s1e": "Question: if P wanders over the same arc, does ∠APB change — and how does it relate to ∠AOB? Fix A and B first (central angle 80°). The arc longer than a semicircle is the <strong>major arc</strong>; drag P all over it, or use the position-angle slider. The readout lines up three numbers: the central angle, the measured inscribed angle, and half the central angle. Press “Record it” to log the current position in the ledger — record at least 3 different positions and check whether every difference is about 0. Then change ∠AOB with the central-angle slider (40°–160°) and repeat: P's angle follows at once. One boundary to state honestly now: this holds only while P stays on the same arc; what happens on the other arc is step 4's business.",
    "nav2": "2 Why: one cut",
    "s2k": "Step 2",
    "s2t": "Why: one auxiliary line splits the big angle in two",
    "s2e": "Question: where does the factor 'one half' come from — can we draw it? First, recall two tools: in an <strong>isosceles triangle</strong>, equal sides face equal base angles; an <strong>exterior angle</strong> of a triangle is the supplement of one interior angle and equals the sum of the two non-adjacent interior angles (it will be marked on the figure). Press “Auxiliary line” one move at a time — never all at once: ①join OP and extend it into a diameter; ②spot the two isosceles triangles; ③the exterior angles enter; ④combine. Every number beside an equation is computed from coordinates, and dragging the central-angle slider recomputes all of them. This proof covers the main case, with the centre O inside the inscribed angle; when O falls outside (P on the other arc) the same cut gives a subtraction — reclaimed by name in step 4, and left as a cliffhanger here.",
    "nav3": "3 Diameter case",
    "s3k": "Step 3",
    "s3t": "The diameter case: a semicircle always gives a right angle (Thales)",
    "s3e": "Question: when AB itself is a diameter (central angle = a straight 180°), what is the inscribed angle? Drag P anywhere on the circle — try both semicircles — and the readout is computed from coordinates. Half of 180° is 90°, so this needs no new theorem: it is step 1's conclusion applied directly. It has a name of its own, <strong>Thales' theorem</strong>: the angle in a semicircle is a right angle. Now the counterexample slot: use the slider below to pull chord AB away from the centre (d > 0). AB becomes a long chord that misses the centre, and the angle immediately stops being 90° — only a chord through the centre counts as a diameter.",
    "nav4": "4 The other arc",
    "s4k": "Step 4",
    "s4t": "Switch arcs: the angle jumps to its supplement",
    "s4e": "Question: if P moves onto the other arc (the minor arc), is it still the same angle? Keep A and B fixed and drag P across A or B. At the crossing instant, the arc P 'faces' switches to the other one, and the highlight in the figure swaps with it; a shadow point P′ stays on the opposite arc and shows its angle at the same time. Terms, where they first appear: the arc longer than a semicircle is the <strong>major arc</strong>; an angle greater than 180° is a <strong>reflex angle</strong>; two angles summing to 180° are <strong>supplementary</strong>. Expect the angle to jump from 40° to 140° — while the two angles always sum to 180°. The subtraction version of step 2's proof is reclaimed here in one line: with P on the minor arc the auxiliary line splits out a difference instead of a sum, and ∠AOB (the reflex angle) = 2∠APB still holds.",
    "nav5": "5 Self-test",
    "s5k": "Step 5",
    "s5t": "Self-test: four questions, all four to pass",
    "s5e": "Question: can you use the last four steps' conclusions yourself? For ①②③, click an option — a correct answer locks the question, a wrong one lets you think again. ④ is hands-on; the pass rule is written under the figure: the computed angle must lie within 45° ± 1° and P must be on the major arc — half of the preset 90° central angle is 45°, and it is 45° everywhere on the major arc, so the real test is whether you put P on the right arc. Get all four right and a cleared message lights up at the end of this step.",
    "nav6": "6 Finale",
    "s6k": "Step 6",
    "s6t": "Finale: one theorem, three faces",
    "s6e": "Question: what does the inscribed angle theorem actually say? One arc locks the central and inscribed angles into a 2:1 ratio — the view from the centre is always twice the view from the circumference, and the view from the circumference does not depend on where you stand. Real-world angle measurements always carry error, but the constancy on this page is not a measurement coincidence; it is the theorem itself: once the coordinates of P, A and B are fixed, the angle is determined by them. The three cards below wrap the page up, and the two links connect to the right angle in Pythagoras and to the circle's rotational symmetry."
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
