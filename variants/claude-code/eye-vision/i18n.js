'use strict';
// Eye and glasses lesson strings (Claude Code edition). Author: Claude Code (claude-opus-5-5), 2026-11-10.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '眼睛与眼镜 · 焦点落在哪里',
    back: '← 知识索引',
    compare: '对照另一版本：眼睛与眼镜 · 为什么近视要戴凹透镜 →',
    navLabel: '眼睛与眼镜步骤导航',
    tagline: '看得清，是因为光恰好聚在眼底的视网膜上。六步里你会拖动物体、拉长眼球、换上镜片，亲眼看焦点前后移动：为什么看近处要用力，为什么近视看远处糊，凹透镜怎样把焦点推回去，以及年纪大了为什么要戴凸透镜看书。',
    nav0: '0 眼睛像相机', nav1: '1 调节', nav2: '2 近视', nav3: '3 凹透镜', nav4: '4 老花', nav5: '5 收束',
    distLabel: '物体离眼睛的距离',
    far: '很远', farLong: '很远', atFar: '很远处', atDist: ' {d} 处', cm: '{x} cm', m: '{x} m', inf: '无穷远',
    lblLens: '晶状体', lblRetina: '视网膜', lblGlass: '镜片 {P} D',
    lblSrcFar: '很远处的物体：光几乎平行', lblSrc: '物体在{u}（眼外未按比例）',
    viewCap: '看到的样子（按光斑大小模拟）',
    sharp: '看起来清楚', blurry: '看起来模糊',

    s0k: '第 0 步 · 眼睛像相机',
    s0t: '远近不同的东西，光都聚在视网膜上吗？',
    s0e: '这一步要回答：眼睛不用力时，物体的远近会不会改变光聚在哪里？眼球前部的角膜和<strong>晶状体</strong>合起来像一块凸透镜，眼球后壁的<strong>视网膜</strong>像相机的底片：从物体上一点射进瞳孔的光，要恰好聚在视网膜上，看到的才清楚。本页用一只「简化眼」：一块透镜，后面 17 mm 处是视网膜，瞳孔直径 4 mm。很远处射来的光几乎是平行的，正常的眼睛不用力时，正好把它聚在视网膜上（<a class="xlink" href="../../../physics/optics/lens/#step0">→ 透镜页第 0 步：平行光被凸透镜收拢到一点</a>）。如果光聚成的那一点——<strong>像点</strong>——不在视网膜上，光就在视网膜上铺成一个小圆斑，叫<strong>模糊光斑</strong>，斑越大越糊（<a class="xlink" href="../../../physics/optics/pinhole-camera/#step3">→ 小孔成像页第 3 步：每个点变成一个斑，像就糊了</a>）。本页把直径不超过 0.012 mm 的光斑算作「看起来清楚」，这是教学取值。',
    c0eye: '眼睛剖面：眼睛不用力（眼内按比例放大）',
    c0plot: '像点在视网膜后多少 mm（横轴：物距，越往右越近）',
    s0lgRay: '光线', s0lgImg: '像点（光聚成的点）', s0lgSpot: '视网膜上的光斑', s0lgTrail: '试过的距离',
    s0readout: '物体在{u}：像点离晶状体 {v} mm，{where}；视网膜上的光斑直径 {b} mm，{verdict}。',
    onRetina: '正好落在视网膜上', behind: '落在视网膜后面 {x} mm', ahead: '落在视网膜前面 {x} mm',
    s0hint: '观察顺序：先放在「很远」，再一格一格往近处拖，眼睛始终不用力。看剖面图里白色像点往后退、退出视网膜，橙色光斑越来越宽，「看到的样子」越来越糊；下面的图给每个试过的距离留一个点：物体越近，像点越往后退，这就是凸透镜的「物近像远」。注意 6 m 那一格光斑只有 0.011 mm，仍算清楚，所以验光时把 6 m 外当作「很远」。',

    s1k: '第 1 步 · 调节',
    s1t: '看近处时，眼睛怎样把像点拉回视网膜？',
    s1e: '这一步要回答：眼球的长度变不了，看近处时靠什么重新对准？上一步看到物体越近像点越往后退（<a class="xlink" href="../../../physics/optics/lens/#step2">→ 透镜页第 2 步：物体拖近，像跟着变远</a>）。晶状体有弹性，周围一圈<strong>睫状肌</strong>收紧时它变厚、更凸，<strong>焦距</strong>（平行光经透镜后聚成一点的位置到透镜的距离）变短，收拢光的本领变强，像点就往前拉回视网膜，这个过程叫<strong>调节</strong>。收拢光的本领用<strong>屈光度</strong>表示，单位 D：屈光度 = 1 ÷ 焦距（焦距以米计），焦距越短屈光度越大；配眼镜说的「100 度」就是 1 D。简化眼不用力时焦距 17 mm（约 58.8 D）；这只二十多岁的眼睛最多还能再加 10 D，焦距最短约 14.53 mm。用尽全力能看清的最近位置叫<strong>近点</strong>。',
    accLabel: '睫状肌用力：给晶状体加的屈光度',
    autoFocus: '自动对焦',
    c1eye: '眼睛剖面：拖动滑杆让晶状体变厚',
    c1plot: '要把像点放到视网膜上，焦距需要多少 mm（横轴：物距）',
    s1lgNeed: '试过的距离所需的焦距', s1lgBand: '这只眼调得到的焦距范围', s1lgNow: '现在的焦距', s1lgOut: '调不到（超出近点）',
    s1readout: '物体在{u}：焦距需要 {fneed} mm（比不用力时多加 {need} D）。现在加了 {acc} D，焦距 {f} mm，{state}；光斑 {b} mm，{verdict}。',
    stOn: '像点正好在视网膜上', stBehind: '像点还在视网膜后面 {x} mm', stAhead: '用力过头，像点跑到视网膜前面 {x} mm', stOut: '需要的超过这只眼最多能加的 10 D，用尽全力也对不准',
    s1prog: '正在对焦：{acc} D。',
    s1hint: '观察顺序：先选 25 cm，用力滑杆放在 0，光斑很大；慢慢往右拖，看晶状体变厚、白色像点向前移，到 +4 D 时正好落在视网膜上；拖过头，像点又跑到视网膜前面。按「自动对焦」看眼睛自己调好，再换别的距离：越近需要的焦距越短；7 cm 那一格的点落在绿色带下面，再用力也看不清——这只眼的近点是 10 cm。',

    s2k: '第 2 步 · 近视',
    s2t: '为什么有的眼睛看远处模糊、看近处却清楚？',
    s2e: '这一步要回答：近视的眼睛和正常眼哪里不一样？最常见的原因是眼球前后的长度——<strong>眼轴</strong>——太长。晶状体不用力时仍把平行光聚在 17 mm 处，视网膜却在更后面：光还没到视网膜就聚成一点、又散开，像点落在视网膜<strong>前面</strong>，这就是<strong>近视</strong>。睫状肌用力只会让像点更往前，帮不上忙；只有物体移近，像点才往后退到视网膜上。不用力就能看清的最远位置叫<strong>远点</strong>，正常眼的远点在无穷远。反过来，眼轴太短时像点落在视网膜后面，叫<strong>远视</strong>：年轻人靠调节还能看清远处，但一直在用力。下面这只眼会像真眼睛一样自动对焦（加 0 到 10 D），用屈光度 D（100 度 = 1 D）表示差了多少。',
    lenLabel: '眼轴长度 L（mm）',
    c2eye: '眼睛剖面：自动对焦（加 0–10 D）',
    c2plot: '能精确对准的距离范围（每试一个眼轴留一行；越往右越近）',
    s2lgNow: '当前眼轴的范围', s2lgOld: '试过的其他眼轴', s2lgObj: '物体所在距离',
    s2readout: '眼轴 {L} mm：{kind}（差 {R} D，约 {deg} 度）。远点：{far}；近点：{near}。物体在{u}：{state}，光斑 {b} mm，{verdict}。',
    kindNormal: '正常眼', kindMyopia: '近视', kindHyper: '远视',
    stAcc: '眼睛加了 {acc} D，正好对准', stRelaxAhead: '不用力像点仍在视网膜前面 {x} mm', stMaxBehind: '用尽 10 D 像点仍在视网膜后面 {x} mm',
    s2hint: '观察顺序：物体放在「很远」，把眼轴从 17.0 mm 拖到 18.0 mm：白色像点停在原处，视网膜往后退，像点落到视网膜前面、光斑变大——眼轴只长 1 mm，就是三百多度近视。保持 18.0 mm，把物体一格一格拖近：到远点（约 31 cm）以内又清楚了。下面的图每试一个眼轴就留下一行横条：近视的横条从左端（很远）缩走，远视的横条从右端（很近）缩走。',
    quizPrompt: '眼轴 18 mm 的同学（约 330 度近视）摘下眼镜看 25 cm 外的手机，会怎样？',
    quizA: '看不清：近视的眼睛看什么都糊', quizB: '看得清：25 cm 在他的远点（约 31 cm）以内', quizC: '要换成凸透镜才看得清',
    check: '核对', correct: '对。近视的眼睛远点在近处，比远点更近的东西（直到近点）都能对准。把上面的物体拖到 25 cm 验证一下。', wrong: '再看看：眼轴拖到 18.0 mm、物体拖到 25 cm，读数说的是清楚还是模糊？',

    s3k: '第 3 步 · 凹透镜',
    s3t: '凹透镜怎样把焦点推回视网膜？',
    s3e: '这一步要回答：近视眼看远处，戴什么样的镜片能让像点落到视网膜上？<strong>凹透镜</strong>中间薄、边缘厚，光穿过它两个表面时各拐一次弯（<a class="xlink" href="../../../physics/optics/reflection-refraction/#step2">→ 反射与折射页第 2 步：光进入玻璃会拐弯</a>），出来后向外散开一点。散开的光再被晶状体收拢，要走得更远才能聚成一点，像点就往后挪。凹透镜的屈光度记作负数：−3 D 就是「300 度」的近视镜；中间厚的凸透镜记作正数，作用相反。眼镜戴在晶状体前 12 mm 处；物体在很远处，眼睛照样会自动对焦（加 0 到 10 D）。',
    glassLabel: '镜片屈光度（负 = 凹透镜，正 = 凸透镜）',
    c3eye: '眼睛剖面：看很远处，戴上镜片',
    c3plot: '视网膜上的光斑直径（mm，纵轴刻度不均匀）随镜片变化（改眼轴时清空）',
    s3lgOk: '不用力就清楚', s3lgStrain: '清楚，但睫状肌在用力', s3lgBlur: '模糊', s3lgLine: '清楚的界线 0.012 mm',
    s3readout: '镜片 {P} D（{kind}）：{state}；光斑 {b} mm，{verdict}。这只眼看远处，正好让不用力的眼睛对准的镜片是 {best} D；按 0.25 D 一档，能看清的最弱一片是 {weak} D。',
    lensNone: '不戴镜片', lensConcave: '凹透镜，{deg} 度', lensConvex: '凸透镜，{deg} 度',
    st3Ahead: '眼睛不用力，像点仍在视网膜前面 {x} mm', st3On: '像点落在视网膜上，眼睛不用力', st3Strain: '镜片太强，睫状肌要加 {acc} D 才能对准', st3Behind: '像点在视网膜后面 {x} mm，用尽 10 D 也对不准',
    s3hint: '观察顺序：眼轴保持 18.0 mm，把镜片从 0 往负数拖：剖面图里光线穿过镜片后先散开，白色像点往后移，光斑缩小；到 −3.25 D 光斑进入清楚的界线（青色点）。继续往负数拖仍然清楚，但点变成橙色——镜片太强，眼睛要用力调节把多出的部分抵消，长期这样容易累，所以验光讲「能看清的最弱一片」。往正数拖（凸透镜），像点更往前，越来越糊。再改眼轴：眼轴越长，需要的凹透镜越强。',

    s4k: '第 4 步 · 老花与凸透镜',
    s4t: '年纪大了看书费劲，为什么要戴凸透镜？',
    s4e: '这一步要回答：眼轴正常的人，为什么四五十岁以后看书要拿远、要戴老花镜？晶状体随年龄变硬，睫状肌再用力它也鼓不起来，最多能加的屈光度——<strong>调节幅度</strong>——一年年变小。本页用一条常用的平均经验式：调节幅度 ≈ 18.5 − 0.3 × 年龄（D），最小取 0.5 D；个人差别很大。调节幅度变小，近点就一年年后退，这叫<strong>老花</strong>（老视）。看 33 cm 外的书，眼睛要加约 3 D；不够时，<strong>凸透镜</strong>先替眼睛把光收拢一些，补上差额。远视眼也是同一个道理：像点落在视网膜后面，凸透镜把它往前拉。这一步的眼轴固定为正常的 17 mm，物体是 33 cm 处的书页，镜片戴在眼前 12 mm。',
    ageLabel: '年龄（岁）', readLabel: '老花镜屈光度（凸透镜）',
    c4eye: '眼睛剖面：看 33 cm 处的书',
    c4plot: '近点离眼睛多远（cm，对数刻度）随年龄变化',
    s4lgCurve: '不戴镜的近点（经验式）', s4lgTried: '试过的年龄', s4lgGlass: '戴当前老花镜的近点', s4lgRead: '看书距离 33 cm',
    s4readout: '{age} 岁：调节幅度约 {A} D，不戴镜近点：{near}。看 33 cm 的书需要加 {needR} D。戴上 {P} D 的镜片后需要加 {needG} D，{state}，光斑 {b} mm，{verdict}。这个年龄看清书所需的最弱老花镜：{min}。戴着当前镜片，近点：{nearG}；远点：{farG}。',
    st4Ok: '在调节幅度以内', st4Short: '比调节幅度多 {x} D，不能精确对准',
    noLens: '不用戴', none: '没有（镜片太强）',
    s4hint: '观察顺序：老花镜保持 0，把年龄从 20 岁往右拖：下面的图里留下的点越来越高——近点越来越远，越过绿色的 33 cm 线（52 岁起）就对不准书页，53 岁起光斑超过清楚的界线、书看起来模糊。停在 55 岁，把老花镜加到 +1.00 D，书又清楚了；再看读数里的远点：戴着老花镜，远处反而对不准，所以很多人看书时戴、抬头看远处时摘下。',

    s5k: '第 5 步 · 收束',
    s5t: '把眼睛和眼镜收成三句话',
    s5fin: '<strong>一、看得清 = 光聚在视网膜上。</strong>物体越近，像点越往后退；年轻的眼睛靠睫状肌让晶状体变厚、焦距变短，把像点拉回来，最近能拉到近点。<br><strong>二、近视是像点落在视网膜前面。</strong>本页的简化眼里，眼轴每长 1 mm 大约多 3 D（300 度）近视；凹透镜让光先散开，把像点推回视网膜，配镜选能看清的最弱一片。<br><strong>三、远视和老花是像点落在视网膜后面、或调节不够。</strong>凸透镜先帮眼睛把光收拢，补上差额。',
    formula: '屈光度 = 1 ÷ 焦距（m）　100 度 = 1 D\n近视的远点 = 1 ÷ 近视度数（D）　例：3.27 D → 0.31 m',
    boundary: '适用范围：简化眼（一块薄透镜加一面视网膜），只算靠近中轴的光线；没有考虑散光、像差、光的衍射和瞳孔随亮度变化；0.012 mm 的清楚界线和调节幅度经验式都是教学用的平均值。真实验光还要考虑镜片到眼睛的距离、双眼配合和用眼习惯。本页不是医疗建议，配镜请找验光师。',
    linksTitle: '接着去看',
    lk1: '→ 透镜页第 0 步：平行光进门，被透镜收拢到焦点',
    lk2: '→ 透镜页第 2 步：物体拖近，像的位置和大小怎样变',
    lk3: '→ 小孔成像页第 3 步：孔开大，每个点变成斑，像就糊了',
    lk4: '→ 反射与折射页第 2 步：光进入玻璃和水为什么拐弯',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《眼睛与眼镜 · 为什么近视要戴凹透镜》的平行版本。'
  },
  en: {
    pageTitle: 'The Eye and Glasses · Where Does the Focus Land?',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: The Eye and Glasses · Why Short-Sightedness Needs a Concave Lens →',
    navLabel: 'Eye and glasses steps',
    tagline: 'You see sharply when light comes to a point exactly on the retina at the back of your eye. In six steps you will move objects, stretch the eyeball and try on lenses, watching the focus slide back and forth: why looking at something close takes effort, why short-sighted eyes blur distant things, how a concave lens pushes the focus back, and why reading glasses in later life are convex.',
    nav0: '0 A camera', nav1: '1 Focusing', nav2: '2 Short sight', nav3: '3 Concave lens', nav4: '4 Ageing eyes', nav5: '5 Wrap-up',
    distLabel: 'Distance from the object to the eye',
    far: 'far away', farLong: 'far away', atFar: 'far away', atDist: 'at {d}', cm: '{x} cm', m: '{x} m', inf: 'at infinity',
    lblLens: 'lens', lblRetina: 'retina', lblGlass: 'glasses {P} D',
    lblSrcFar: 'A distant object: the light is almost parallel', lblSrc: 'Object {u} (outside the eye not to scale)',
    viewCap: 'What the eye sees (simulated from the blur spot)',
    sharp: 'looks sharp', blurry: 'looks blurred',

    s0k: 'Step 0 · A camera',
    s0t: 'Does light from near and far objects all land on the retina?',
    s0e: 'This step asks: with the eye relaxed, does the distance of an object change where its light comes to a point? The cornea and the <strong>lens</strong> at the front of the eye act together like one convex lens, and the <strong>retina</strong> lining the back of the eye plays the part of a camera sensor: light entering the pupil from one point on an object has to meet again exactly on the retina for you to see that point sharply. This page uses a “reduced eye”: a single lens with the retina 17 mm behind it and a 4 mm pupil. Light from far away arrives almost parallel, and a normal relaxed eye brings it to a point right on the retina (<a class="xlink" href="../../../physics/optics/lens/#step0">→ Lens, step 0: parallel light gathered to one point</a>). If that meeting point, the <strong>image point</strong>, misses the retina, the light spreads into a small disc on the retina called the <strong>blur spot</strong>; the bigger the disc, the blurrier the view (<a class="xlink" href="../../../physics/optics/pinhole-camera/#step3">→ Pinhole camera, step 3: when every point becomes a disc, the image blurs</a>). Here a blur spot up to 0.012 mm across counts as “looks sharp”, a teaching value.',
    c0eye: 'Cross-section of a relaxed eye (inside the eye enlarged to scale)',
    c0plot: 'How far behind the retina the image point lands, mm (object closer to the right)',
    s0lgRay: 'light rays', s0lgImg: 'image point (where the light meets)', s0lgSpot: 'blur spot on the retina', s0lgTrail: 'distances tried',
    s0readout: 'Object {u}: the image point is {v} mm behind the lens, {where}; the blur spot on the retina is {b} mm across, so it {verdict}.',
    onRetina: 'exactly on the retina', behind: '{x} mm behind the retina', ahead: '{x} mm in front of the retina',
    s0hint: 'What to try: start at “far away”, then drag one notch closer at a time while the eye stays relaxed. In the cross-section the white image point slides back past the retina, the orange blur spot widens and “What the eye sees” gets blurrier; the graph below keeps a dot for every distance you try. The closer the object, the further back the image point: the convex-lens rule “near object, far image”. Notice that at 6 m the spot is only 0.011 mm, still sharp, which is why eye tests treat anything beyond 6 m as “far away”.',

    s1k: 'Step 1 · Focusing',
    s1t: 'Looking at something close, how does the eye pull the image point back onto the retina?',
    s1e: 'This step asks: the eyeball cannot change its length, so how does it refocus on near things? The last step showed the image point moving back as the object comes closer (<a class="xlink" href="../../../physics/optics/lens/#step2">→ Lens, step 2: bring the object closer and the image moves away</a>). The lens is elastic. When the ring of <strong>ciliary muscle</strong> around it tightens, the lens bulges, its <strong>focal length</strong> (the distance behind the lens where parallel light meets) gets shorter, it bends light more strongly, and the image point is pulled forward onto the retina. This is called <strong>accommodation</strong>. Lens strength is measured in <strong>dioptres</strong>, D: strength = 1 ÷ focal length in metres, so a shorter focal length means more dioptres. (A Chinese prescription of “100 degrees” is 1 D.) The relaxed reduced eye has a 17 mm focal length, about 58.8 D; this eye, belonging to someone in their twenties, can add up to 10 D more, bringing the focal length down to about 14.53 mm. The closest point it can see sharply at full effort is its <strong>near point</strong>.',
    accLabel: 'Ciliary effort: dioptres added to the lens',
    autoFocus: 'Focus automatically',
    c1eye: 'Cross-section: drag the slider to thicken the lens',
    c1plot: 'Focal length needed to put the image on the retina, mm (object distance across)',
    s1lgNeed: 'needed focal length for distances tried', s1lgBand: 'focal lengths this eye can reach', s1lgNow: 'current focal length', s1lgOut: 'out of reach (inside the near point)',
    s1readout: 'Object {u}: the focal length must be {fneed} mm ({need} D more than relaxed). You have added {acc} D, so the focal length is {f} mm and {state}; blur spot {b} mm, so it {verdict}.',
    stOn: 'the image point sits on the retina', stBehind: 'the image point is still {x} mm behind the retina', stAhead: 'you overdid it: the image point is {x} mm in front of the retina', stOut: 'the eye would need more than its 10 D maximum, so even full effort cannot focus',
    s1prog: 'Focusing: {acc} D. ',
    s1hint: 'What to try: pick 25 cm and leave the effort slider at 0: the blur spot is large. Drag it slowly right and watch the lens thicken and the white image point move forward until, at +4 D, it lands on the retina; go further and it overshoots in front. Press “Focus automatically” to let the eye do it, then try other distances: the closer the object, the shorter the focal length needed. The 7 cm dot falls below the green band, so no amount of effort helps: this eye’s near point is 10 cm.',

    s2k: 'Step 2 · Short sight',
    s2t: 'Why do some eyes blur distant things but see close ones sharply?',
    s2e: 'This step asks: what is different about a short-sighted eye? The most common cause is an eyeball that is too long from front to back, a long <strong>axial length</strong>. The relaxed lens still brings parallel light to a point 17 mm behind it, but the retina sits further back: the light meets before it reaches the retina and spreads out again, so the image point lands <strong>in front of</strong> the retina. That is <strong>short sight</strong> (myopia). Effort from the ciliary muscle only moves the image point further forward, so it cannot help; only bringing the object closer moves the image point back onto the retina. The furthest distance seen sharply without effort is the <strong>far point</strong>; for a normal eye it is at infinity. The opposite case, an eyeball that is too short, puts the image point behind the retina: <strong>long sight</strong> (hyperopia). A young long-sighted eye can still see far away by accommodating, but it is working the whole time. The eye below focuses itself like a real one (adding 0 to 10 D), and the mismatch is given in dioptres, D (100 “degrees” = 1 D).',
    lenLabel: 'Axial length L (mm)',
    c2eye: 'Cross-section: the eye focuses itself (adds 0–10 D)',
    c2plot: 'Distances this eye can focus exactly (one row per length tried; closer to the right)',
    s2lgNow: 'range for the current length', s2lgOld: 'other lengths tried', s2lgObj: 'where the object is',
    s2readout: 'Axial length {L} mm: {kind} (off by {R} D, about {deg} degrees). Far point {far}, near point {near}. Object {u}: {state}; blur spot {b} mm, so it {verdict}.',
    kindNormal: 'a normal eye', kindMyopia: 'short-sighted', kindHyper: 'long-sighted',
    stAcc: 'the eye adds {acc} D and focuses exactly', stRelaxAhead: 'even relaxed, the image point is {x} mm in front of the retina', stMaxBehind: 'even with all 10 D the image point is {x} mm behind the retina',
    s2hint: 'What to try: put the object “far away” and drag the axial length from 17.0 to 18.0 mm. The white image point stays put while the retina moves back, so the image point ends up in front of it and the blur spot grows: just 1 mm extra is over 3 D of short sight. Keep 18.0 mm and bring the object closer one notch at a time: inside the far point (about 31 cm) it is sharp again. The graph below adds a row for every length you try: short-sighted rows lose their left end (far away), long-sighted rows lose their right end (very close).',
    quizPrompt: 'A student with an 18 mm eye (about 3.3 D short-sighted) takes off their glasses to read a phone 25 cm away. What happens?',
    quizA: 'It is blurred: a short-sighted eye blurs everything', quizB: 'It is sharp: 25 cm is inside their far point of about 31 cm', quizC: 'They would need a convex lens to read it',
    check: 'Check', correct: 'Right. A short-sighted eye has its far point close by, and anything nearer than that (down to the near point) can be focused. Drag the object above to 25 cm to confirm.', wrong: 'Look again: set the axial length to 18.0 mm and the object to 25 cm. Does the readout say sharp or blurred?',

    s3k: 'Step 3 · Concave lens',
    s3t: 'How does a concave lens push the focus back onto the retina?',
    s3e: 'This step asks: for a short-sighted eye looking far away, what kind of lens puts the image point on the retina? A <strong>concave lens</strong> is thin in the middle and thick at the edges. Light bends once at each of its surfaces (<a class="xlink" href="../../../physics/optics/reflection-refraction/#step2">→ Reflection and refraction, step 2: why light bends entering glass</a>) and comes out spreading slightly. When the eye’s lens gathers this spreading light, it needs more distance to bring it to a point, so the image point moves back. Concave lenses carry negative dioptres: −3 D is a “300-degree” pair of glasses for short sight. A convex lens, thick in the middle, carries positive dioptres and does the opposite. The glasses sit 12 mm in front of the eye’s lens; the object is far away, and the eye still focuses itself (adding 0 to 10 D).',
    glassLabel: 'Glasses strength (negative = concave, positive = convex)',
    c3eye: 'Cross-section: looking far away through glasses',
    c3plot: 'Blur spot on the retina, mm (uneven vertical scale), against glasses strength (cleared when the length changes)',
    s3lgOk: 'sharp, eye relaxed', s3lgStrain: 'sharp, but the ciliary muscle is working', s3lgBlur: 'blurred', s3lgLine: 'sharpness limit 0.012 mm',
    s3readout: 'Glasses {P} D ({kind}): {state}; blur spot {b} mm, so it {verdict}. For distance vision this eye is exactly corrected, eye relaxed, by {best} D; in 0.25 D steps the weakest lens that looks sharp is {weak} D.',
    lensNone: 'no glasses', lensConcave: 'concave, {deg} degrees', lensConvex: 'convex, {deg} degrees',
    st3Ahead: 'with the eye relaxed the image point is still {x} mm in front of the retina', st3On: 'the image point is on the retina and the eye is relaxed', st3Strain: 'the lens is too strong, so the ciliary muscle must add {acc} D to focus', st3Behind: 'the image point is {x} mm behind the retina and even 10 D cannot fix it',
    s3hint: 'What to try: keep the axial length at 18.0 mm and drag the glasses from 0 towards negative values. In the cross-section the rays spread out after the glasses, the white image point moves back and the blur spot shrinks; at −3.25 D it drops inside the sharpness limit (a cyan dot). Keep going and it stays sharp, but the dots turn orange: the lens is too strong and the eye has to accommodate to cancel the excess, which is tiring over a day, so an optometrist prescribes the weakest lens that gives sharp vision. Drag to positive values (convex) and the image point moves further forward and blurs more. Then change the length: the longer the eye, the stronger the concave lens it needs.',

    s4k: 'Step 4 · Ageing eyes',
    s4t: 'Reading gets harder with age: why are reading glasses convex?',
    s4e: 'This step asks: why do people with normal eyeballs start holding books further away, and then need reading glasses, in their forties and fifties? The lens stiffens with age, so however hard the ciliary muscle pulls, it bulges less: the most dioptres it can add, the <strong>range of accommodation</strong>, shrinks year by year. This page uses a common average rule of thumb: range ≈ 18.5 − 0.3 × age (in D), never below 0.5 D; individuals vary a lot. As the range shrinks the near point recedes, which is called <strong>presbyopia</strong>. Reading at 33 cm takes about 3 D of extra power; when the eye cannot supply it, a <strong>convex lens</strong> gathers the light a little first and makes up the difference. Long sight works the same way: the image point lands behind the retina and a convex lens pulls it forward. In this step the axial length is a normal 17 mm, the object is a page 33 cm away, and the glasses sit 12 mm in front of the eye.',
    ageLabel: 'Age (years)', readLabel: 'Reading glasses (convex), dioptres',
    c4eye: 'Cross-section: reading a page 33 cm away',
    c4plot: 'Near point distance against age (cm, log scale)',
    s4lgCurve: 'near point without glasses (rule of thumb)', s4lgTried: 'ages tried', s4lgGlass: 'near point with the current glasses', s4lgRead: 'reading distance 33 cm',
    s4readout: 'Age {age}: range of accommodation about {A} D, near point without glasses {near}. Reading at 33 cm needs {needR} D extra. With {P} D glasses it needs {needG} D, which is {state}; blur spot {b} mm, so it {verdict}. The weakest reading glasses that make the page sharp at this age: {min}. With the current glasses the near point is {nearG} and the far point {farG}.',
    st4Ok: 'within the range', st4Short: '{x} D more than the range, so not exactly in focus',
    noLens: 'none needed', none: 'none (the lens is too strong)',
    s4hint: 'What to try: leave the reading glasses at 0 and drag the age right from 20. The dots left on the graph climb: the near point moves further away, once it passes the green 33 cm line (from 52) the eye can no longer focus the page exactly, and from 53 the blur spot exceeds the sharpness limit and the page looks blurred. Stop at 55 and raise the glasses to +1.00 D: the page is sharp again. Now check the far point in the readout: through reading glasses distant things go out of focus, which is why many people put them on to read and take them off to look up.',

    s5k: 'Step 5 · Wrap-up',
    s5t: 'The eye and glasses in three sentences',
    s5fin: '<strong>One: seeing sharply means light meets on the retina.</strong> The closer the object, the further back the image point; a young eye pulls it forward by bulging the lens and shortening its focal length, down to the near point.<br><strong>Two: in short sight the image point lands in front of the retina.</strong> In this reduced eye each extra millimetre of axial length adds roughly 3 D of short sight; a concave lens spreads the light first and pushes the image point back, and the prescription is the weakest lens that looks sharp.<br><strong>Three: in long sight and presbyopia the image point lands behind the retina, or the eye cannot accommodate enough.</strong> A convex lens gathers the light first and makes up the difference.',
    formula: 'strength = 1 ÷ focal length (m)    100 degrees = 1 D\nfar point of a short-sighted eye = 1 ÷ its error in D    e.g. 3.27 D → 0.31 m',
    boundary: 'Scope: a reduced eye (one thin lens and one retina) with rays close to the axis only; no astigmatism, aberrations, diffraction or pupil changes with brightness. The 0.012 mm sharpness limit and the age rule are teaching averages. Real eye tests also account for the gap between glasses and eye, how the two eyes work together, and how the person uses their eyes. This page is not medical advice; see an optometrist for glasses.',
    linksTitle: 'Where to go next',
    lk1: '→ Lens, step 0: parallel light enters and is gathered to the focus',
    lk2: '→ Lens, step 2: how the image moves and changes size as the object approaches',
    lk3: '→ Pinhole camera, step 3: widen the hole, every point becomes a disc, the image blurs',
    lk4: '→ Reflection and refraction, step 2: why light bends entering glass and water',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “The Eye and Glasses · Why Short-Sightedness Needs a Concave Lens”.'
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
  if (typeof window.refreshEyeVision === 'function') window.refreshEyeVision();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.EYE_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
