'use strict';
// Rendering-pipeline lesson strings. Author: Claude Code (claude-opus-5-5), 2026-11-09.
// Keys are identical in zh and en (tests/core.cjs checks keys and placeholders).

const STRINGS = {
  zh: {
    pageTitle: '从三角形到像素 · 一帧画面怎样算出来',
    back: '← 知识索引',
    compare: '对照另一版本：计算机图形学 · 从坐标到画面 →',
    navLabel: '渲染管线步骤导航',
    tagline: '游戏和动画里的每一帧，都是从一堆三角形的顶点坐标算出来的：先把它们摆进场景，投影到屏幕，决定点亮哪些像素、谁挡住谁，再算每个像素多亮。七步里你会亲手走一遍这条流水线，每一步都只用一个清楚的公式。',
    nav0: '0 变换', nav1: '1 透视', nav2: '2 光栅化', nav3: '3 深度', nav4: '4 着色', nav5: '5 抗锯齿', nav6: '6 收束',

    s0k: '第 0 步 · 把模型摆进场景',
    s0t: '旋转、缩放、平移能不能合成一个矩阵？先后顺序要紧吗？',
    s0e: '这一步要回答：怎样用同一种运算把一个模型转动、放缩，再挪到场景里指定的位置？顺序重要吗？模型（这里是字母 L 的轮廓）在自己的<strong>模型坐标</strong>里定义：每个顶点是一对数 (x, y)。旋转和缩放都能写成 2×2 矩阵乘向量；平移（加上 (tx, ty)）却不行，它不是线性运算。图形学的办法是给每个点添一个恒为 1 的第三个分量，写成 (x, y, 1)，这叫<strong>齐次坐标</strong>。这样平移也变成 3×3 矩阵乘法，三种变换可以先连乘成一个矩阵 M，再一次作用到所有顶点。连乘从右往左读：T·R·S 表示先缩放 S、再旋转 R、最后平移 T。矩阵乘法一般不能交换顺序（<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step4">→ 线性变换页第 4 步：先做 A 再做 B，顺序会改变结果</a>），所以「先转再挪」和「先挪再转」不是一回事。',
    rotSlider: '旋转角 θ（°）', scaleSlider: '缩放 s', txSlider: '平移 tx', tySlider: '平移 ty',
    orderTRS: '先缩放旋转，再平移（T·R·S）', orderRST: '先平移，再缩放旋转（R·S·T）',
    c0: '场景（世界坐标）',
    s0lgModel: '模型坐标里的原始 L', s0lgNow: '当前顺序的结果', s0lgOther: '另一种顺序的结果', s0lgPt: '顶点 (1, 0) 的去向',
    s0readout: '当前 {ord}：M = [[{a}, {b}, {c}], [{d}, {e}, {f}], [0, 0, 1]]。顶点 (1, 0) → ({x}, {y})；换成 {ord2} 会落在 ({ox}, {oy})，两处相距 {dist}。',
    s0hint: '观察顺序：先把 tx、ty 都设为 0，只拖旋转角和缩放：两种顺序的结果完全重合（没有平移时，旋转和缩放谁先谁后都一样）。再给 tx 一个值：T·R·S 下，L 先在原点转好、缩好，再整体挪过去，挪动量正好是 (tx, ty)；R·S·T 下，L 先被挪开，再绕原点转、缩放，连挪动量本身也被转了、缩放了，所以虚线 L 绕着原点甩到了别处。',

    s1k: '第 1 步 · 从三维到屏幕',
    s1t: '离相机远一倍，物体在画面上为什么就小一半？',
    s1e: '这一步要回答：三维空间里的点，落到二维屏幕上的哪里？把相机看成小孔相机：所有光线都穿过同一个点（眼睛，也就是镜头中心），落在它前方距离 f 处的<strong>成像平面</strong>上；f 叫<strong>焦距</strong>。「侧视图」里三根同样高 1.2 m 的柱子立在相机前方，柱子中点与眼睛等高；柱顶到眼睛的连线与成像平面的交点就是柱顶的像。由相似三角形，高度为 y、距离为 z 的点，像的高度是 <strong>y′ = f · y / z</strong>（<a class="xlink" href="../../../physics/optics/pinhole-camera/#step2">→ 小孔成像页第 2 步：像的大小由什么决定</a>）。最后除以 z 这一下叫<strong>透视除法</strong>：GPU 先用一个 4×4 矩阵把 (x, y, z, 1) 变成 (f·x, f·y, …, z)，再把前几个分量都除以最后一个分量 z。',
    fSlider: '焦距 f（m）', dollySlider: '相机前移 c（m）',
    c1a: '侧视图：眼睛、成像平面与三根柱子（m）', c1b: '成像平面上的画面（m）',
    s1lgRay: '柱顶、柱底到眼睛的光线', s1lgPlane: '成像平面', s1lgPost: '三根柱子（由近到远）', s1lgImg: '细线 = 柱子在成像平面上的像，颜色与柱子相同',
    s1readout: 'f = {f} m，相机前移 {c} m：三根柱子离相机 {z1}、{z2}、{z3} m，像高 {h1}、{h2}、{h3} m。像高 × 距离分别是 {k1}、{k2}、{k3}，都等于 f × 1.2 = {k}。',
    s1hint: '观察顺序：先只拖焦距 f：三个像按同一比例一起变大，彼此的比例不变。再只拖「相机前移」：最近的柱子像长得最快，它的距离从 2 m 缩到 1 m 时，像高翻倍；最远的柱子从 6 m 缩到 5 m，像只长两成。这就是近大远小：像高与距离成反比。两个滑杆的范围保证柱子始终在成像平面之外（z ≥ f）。',

    s2k: '第 2 步 · 点亮哪些像素',
    s2t: '一个三角形落到一格一格的屏幕上，点亮哪些格？',
    s2e: '这一步要回答：屏幕由一格一格的<strong>像素</strong>组成，投影后的三角形到底点亮哪些格？最常用的规则是：像素的<strong>中心点</strong>落在三角形内就点亮。判断「在不在内」用三条<strong>边函数</strong>：对一条边 a→b 和点 p，E = (b − a) × (p − a)，即二维叉积 (bₓ − aₓ)(p_y − a_y) − (b_y − a_y)(pₓ − aₓ)；p 在这条边左侧时 E > 0。三个顶点按逆时针排好后，p 在三角形内 ⟺ 三个 E 都 ≥ 0。每个像素只要算三次乘加，彼此独立，所以 GPU 能让成千上万个像素同时算。把几何图形变成像素的这一步叫<strong>光栅化</strong>。屏幕坐标取单位正方形，整屏面积为 1。',
    nSlider: '分辨率 N（每边像素数）', scan2: '逐行扫描',
    c2: '屏幕：N × N 像素',
    s2lgOn: '被点亮的像素', s2lgTri: '三角形真实轮廓', s2lgProbe: '正在查看的像素',
    s2progress: '已扫描 {c}/{N} 行 · ',
    s2readout: '{prog}N = {N}：点亮 {n} 个像素，面积合计 {pa}，三角形真实面积 {ta}，相差 {err}%。查看像素（第 {i} 列、第 {j} 行，从左下数起）：E₁ = {e1}，E₂ = {e2}，E₃ = {e3}，{inout}',
    s2in: '三个都 ≥ 0，点亮。', s2out: '有负值：中心在那条边外侧，不点亮。',
    s2hint: '图上可以拖动橙色顶点改变三角形，点任一像素查看它（粉色框）。观察顺序：先按「逐行扫描」，看像素一行一行被测试、点亮。再拖分辨率 N：N 小时边缘是明显的台阶，点亮面积与真实面积可差好几个百分点；N 越大越贴合轮廓。默认三角形在 N 从 24 到 48 时，误差都在 ±1% 以内（拖动顶点后这个数会变）。最后点任一像素看它的三个边函数：只要有一个是负的，它的中心就在那条边外侧。',

    s3k: '第 3 步 · 谁挡住谁',
    s3t: '两个三角形重叠时，每个像素该显示哪一个？',
    s3e: '这一步要回答：两个三角形在屏幕上重叠，每个像素显示谁？要看谁离相机近，记录这个距离的数叫<strong>深度</strong>（这里越小越近）。深度只在三个顶点上给出，三角形内部靠<strong>重心坐标</strong>插值：像素中心 p 把三角形分成三个小三角形，它们各占总面积的比例 w₁、w₂、w₃（和为 1）就是 p 对三个对面顶点的权重，p 处的深度 = w₁z₁ + w₂z₂ + w₃z₃。颜色、纹理坐标也用同一组权重插值。<strong>深度缓冲</strong>（z-buffer）给每个像素存一个「目前最近的深度」，后来的三角形在这个像素上更近才覆盖它。较早的<strong>画家算法</strong>则按每个三角形的平均深度从远到近整块画，后画的盖住先画的。本例 A 是平放的（三个顶点深度都是 0.5），B 是倾斜的，两块可以互相穿插；穿插时没有哪种整块先后顺序是对的。',
    tiltSlider: 'B 的倾斜', shiftSlider: 'B 整体后移（正 = 更远）', mZ: '深度缓冲（逐像素比较）', mP: '画家算法（整块按平均深度）',
    c3a: '画面：每个像素显示谁', c3b: '深度图：每个像素最终存下的深度',
    s3lgA: '三角形 A', s3lgB: '三角形 B', s3lgWrong: '与深度缓冲结果不同的像素', s3lgNear: '近', s3lgFar: '远',
    s3readout: '当前显示：{m}。B 的顶点深度 {z1}、{z2}、{z3}（A 都是 0.5）。两块共同覆盖 {both} 个像素，逐像素比较时 A 更近的 {an} 个、B 更近的 {bn} 个；画家算法整块排序后，有 {wrong} 个像素显示错了。',
    s3hint: '观察顺序：先用默认参数、选「深度缓冲」：重叠区里 B 一部分在 A 前面、一部分在 A 后面，分界线是两块深度相等的地方。切到「画家算法」：重叠区被同一个三角形整块占据，粉色框标出与深度缓冲不同的像素。再拖「B 整体后移」，直到读数里「A 更近」或「B 更近」变成 0，即 B 完全在 A 后面或前面：两种方法的结果一致，错误像素降为 0。深度图里看得到插值：B 的亮度沿倾斜方向均匀渐变。',

    s4k: '第 4 步 · 每个像素多亮',
    s4t: '同一个白球，为什么一边亮一边暗？亮度怎么算？',
    s4e: '这一步要回答：像素该涂多亮？表面上每一点有一个<strong>法向量</strong> n：垂直于表面、长度为 1 的箭头。光从方向 l 照来（l 是指向光源的单位向量），单位面积接到的光与 n、l 夹角 α 的余弦成正比，这叫<strong>朗伯定律</strong>（漫反射）：<strong>亮度 = kₐ + (1 − kₐ)·max(0, n·l)</strong>。n·l 是点积，对单位向量就等于 cos α（<a class="xlink" href="../../../math/linear-algebra/vectors/#step3">→ 向量页第 3 步：点积与夹角</a>）；背光处 n·l < 0，取 0。kₐ 是<strong>环境光</strong>：一个常数底色，粗略代表四周墙面反射来的光，让背光面不至于纯黑。光滑表面还有<strong>高光</strong>：Blinn–Phong 模型取「光线方向与视线方向的角平分线」h，亮度再加 0.6·(n·h)^p；指数 p 越大，高光越小越尖，p = 0 表示不加高光。相机从 +z 方向看球；方位角 0°、仰角 0° 表示光从相机背后正对着球照。',
    azSlider: '光源方位角（°）', elSlider: '光源仰角（°）', kaSlider: '环境光 kₐ', pSlider: '高光指数 p（0 = 关）',
    c4a: '渲染出的球（64 × 64 像素）', c4b: '每个像素：亮度 vs 法向与光的夹角 α',
    s4lgCurve: '朗伯曲线 kₐ + (1 − kₐ)·max(0, cos α)', s4lgPx: '每个像素', s4lgLight: '光源方向（投影到画面）',
    s4readout: '光线与视线夹角 {g}°：被照亮（n·l > 0）的像素占可见圆盘的 {lit}%，月相公式 (1 + cos {g}°)/2 = {pred}%。最亮像素亮度 {max}，{spec}',
    s4spec0: '没有高光。', s4spec1: '其中 {n} 个像素因高光比朗伯曲线高出 0.02 以上。',
    s4hint: '观察顺序：先保持 kₐ = 0、p = 0，看「亮度 vs 夹角」图：所有像素点都落在橙色余弦曲线上，亮度只取决于法向与光的夹角。把方位角从 0° 慢慢拖到 180°：被照亮的部分像月相一样从满月变成新月，比例按 (1 + cos 夹角)/2 变化。再加大 kₐ：曲线整体抬高，背光面不再全黑。最后把 p 调大：一小撮像素跳到曲线上方，那就是高光，它随光源方向移动。',

    s5k: '第 5 步 · 去掉锯齿',
    s5t: '斜边为什么有锯齿？每个像素多看几个点为什么能治？',
    s5e: '这一步要回答：锯齿从哪来、怎样去掉？第 2 步每个像素只看中心一个点，结果非黑即白：边经过的像素要么全亮要么全暗，斜边就成了台阶，这叫<strong>锯齿</strong>（走样）。更合理的像素值是三角形盖住这个像素面积的比例，叫<strong>覆盖率</strong>，在 0 到 1 之间。<strong>超采样</strong>在每个像素里均匀放 n × n 个采样点，落在三角形内的比例就是覆盖率的估计，采样越多越准，代价是计算量乘 n²。这里用一个又细又斜的三角形和 16 × 16 像素，把估计值与精确覆盖率（把三角形按像素方格裁剪后算面积）比较。<strong>误差</strong> = 三角形碰到的每个像素上 |估计 − 精确| 的平均，单位与覆盖率相同。',
    sppSlider: '每像素采样数', dySlider: '三角形上移（像素）',
    c5a: '16 × 16 像素的画面（白线 = 真实轮廓）', c5b: '平均覆盖率误差 vs 每像素采样数（对数轴）',
    s5lgPx: '像素亮度 = 估计的覆盖率', s5lgEdge: '三角形真实轮廓', s5lgErr: '各采样数的误差（当前上移量）', s5lgNow: '当前采样数',
    s5readout: '每像素 {spp} 个采样，上移 {dy} 像素：三角形碰到 {m} 个像素，平均误差 {mean}，最大误差 {worst}；点亮总量 {sum} 个像素当量，精确值 {ex}。',
    s5hint: '观察顺序：先用每像素 1 个采样，慢慢拖「三角形上移」：整段像素忽亮忽灭，细三角形断成碎块；放在动画里就是闪烁。再把采样数调到 16：边缘出现灰阶过渡，上移时亮度连续变化。看误差图：对本页这个三角形、上移 0 到 1 像素的所有滑杆位置，采样数每乘 4，平均误差至少减半；当前上移量下，1 个采样约 {e1}，256 个采样约 {e256}。',

    s6k: '第 6 步 · 收束', s6t: '一帧画面 = 一条按顺序执行的流水线',
    s6fin: '回顾。<strong>第 0 步</strong>：齐次坐标让平移也成为矩阵，变换连乘成一个 M，顺序从右往左读。<strong>第 1 步</strong>：透视投影 y′ = f·y/z，除以深度造成近大远小。<strong>第 2 步</strong>：光栅化用三个边函数判断像素中心是否在三角形内。<strong>第 3 步</strong>：重心坐标把顶点上的深度插值到每个像素，深度缓冲逐像素留下最近的那个；整块排序的画家算法处理不了互相穿插。<strong>第 4 步</strong>：朗伯定律亮度 ∝ max(0, n·l)，环境光抬高暗部，高光按 (n·h)^p 加亮。<strong>第 5 步</strong>：每像素多采样，用覆盖率代替非黑即白，锯齿变成平滑过渡。',
    formula: 'p′ = M·(x, y, 1)ᵀ,  M = T·R·S\ny′ = f·y / z\nE(p) = (b − a) × (p − a) ≥ 0\nz(p) = w₁z₁ + w₂z₂ + w₃z₃\nI = kₐ + (1 − kₐ)·max(0, n·l)',
    boundary: '适用范围：本页是教学用的简化渲染器，不是 GPU 的完整管线。没有做视锥裁剪、光栅化的「左上规则」（恰好落在边上的像素归哪个三角形）、透视校正插值（三维里插值深度和纹理要考虑透视，本页第 3 步直接在屏幕上插值）、纹理、阴影、间接光和光线追踪。第 1 步只演示 y′ = f·y/z 本身；第 3 步的画家算法错误数、第 5 步的误差数值只对本页的三角形和滑杆范围成立。',
    linksTitle: '接着去哪',
    lk1: '→ 线性变换页第 4 步：先做 A 再做 B，顺序真的会改变结果',
    lk2: '→ 小孔成像页第 2 步：像的大小由什么决定',
    lk3: '→ 向量页第 3 步：点积为什么能告诉你夹角',
    lk4: '→ 采样页第 2 步：同样的采样点也能属于另一条波（时间上的走样）',
    foot: '本页由 Claude Code（claude-opus-5-5）独立编写，是《计算机图形学 · 从坐标到画面》的平行版本。'
  },
  en: {
    pageTitle: 'From Triangles to Pixels · How a Frame Is Computed',
    back: '← Knowledge Index',
    compare: 'Compare with the other edition: Computer Graphics · From Coordinates to Pixels →',
    navLabel: 'Rendering pipeline steps',
    tagline: 'Every frame of a game or an animated film is computed from the vertex coordinates of a pile of triangles: place them in the scene, project them onto the screen, decide which pixels they cover and what hides what, then work out how bright each pixel is. In seven steps you will run that pipeline by hand, one clear formula per step.',
    nav0: '0 Transforms', nav1: '1 Perspective', nav2: '2 Rasterization', nav3: '3 Depth', nav4: '4 Shading', nav5: '5 Anti-aliasing', nav6: '6 Wrap-up',

    s0k: 'Step 0 · Placing a model in the scene',
    s0t: 'Can rotate, scale and move be one matrix? Does the order matter?',
    s0e: 'This step asks: how do you turn, resize and then move a model into place with a single kind of operation, and does the order matter? The model (here, the outline of the letter L) is defined in its own <strong>model coordinates</strong>: each vertex is a pair (x, y). Rotation and scaling are 2×2 matrices times a vector, but a move (adding (tx, ty)) is not: it is not a linear operation. Graphics fixes this by giving every point a third component that is always 1, written (x, y, 1): <strong>homogeneous coordinates</strong>. Now a move is a 3×3 matrix product too, and the three transforms can be multiplied into one matrix M and applied to every vertex at once. Read the product right to left: T·R·S means scale S first, then rotate R, then move T. Matrix products generally do not commute (<a class="xlink" href="../../../math/linear-algebra/linear-transform/#step4">→ Linear transforms, step 4: doing A then B can differ from B then A</a>), so “turn, then move” is not the same as “move, then turn”.',
    rotSlider: 'Rotation θ (°)', scaleSlider: 'Scale s', txSlider: 'Move tx', tySlider: 'Move ty',
    orderTRS: 'Scale and rotate, then move (T·R·S)', orderRST: 'Move, then scale and rotate (R·S·T)',
    c0: 'Scene (world coordinates)',
    s0lgModel: 'the original L in model coordinates', s0lgNow: 'result with the chosen order', s0lgOther: 'result with the other order', s0lgPt: 'where vertex (1, 0) goes',
    s0readout: 'Chosen {ord}: M = [[{a}, {b}, {c}], [{d}, {e}, {f}], [0, 0, 1]]. Vertex (1, 0) → ({x}, {y}); with {ord2} it would land at ({ox}, {oy}), {dist} away.',
    s0hint: 'What to try: set tx and ty to 0 and drag only rotation and scale: both orders give exactly the same L (with no move, it makes no difference whether you rotate or scale first). Now give tx a value. With T·R·S the L is turned and resized at the origin and then carried over, so it moves by exactly (tx, ty). With R·S·T the L is carried away first and then turned and resized about the origin, so the move itself gets turned and resized, and the dashed L swings around the origin to somewhere else.',

    s1k: 'Step 1 · From 3-D to the screen',
    s1t: 'Twice as far from the camera: why does an object look half as big?',
    s1e: 'This step asks: where on a flat screen does a point in 3-D space land? Treat the camera as a pinhole camera: every ray passes through one point (the eye, i.e. the lens centre) and hits the <strong>image plane</strong> a distance f in front of it; f is the <strong>focal length</strong>. In the “Side view” three posts, each 1.2 m tall and centred at eye height, stand in front of the camera; the line from a post’s top to the eye crosses the image plane where the top’s image is. By similar triangles, a point at height y and distance z has an image at height <strong>y′ = f · y / z</strong> (<a class="xlink" href="../../../physics/optics/pinhole-camera/#step2">→ Pinhole camera, step 2: what sets the size of the image</a>). That final division by z is the <strong>perspective divide</strong>: a GPU first uses a 4×4 matrix to turn (x, y, z, 1) into (f·x, f·y, …, z), then divides the leading components by the last one, z.',
    fSlider: 'Focal length f (m)', dollySlider: 'Move the camera forward c (m)',
    c1a: 'Side view: eye, image plane and three posts (m)', c1b: 'The picture on the image plane (m)',
    s1lgRay: 'rays from post tops and bottoms to the eye', s1lgPlane: 'image plane', s1lgPost: 'the three posts (near to far)', s1lgImg: 'thin bars = each post’s image on the image plane, in the post’s colour',
    s1readout: 'f = {f} m, camera moved forward {c} m: the posts are {z1}, {z2} and {z3} m away, their images {h1}, {h2} and {h3} m tall. Image height × distance gives {k1}, {k2}, {k3}, each equal to f × 1.2 = {k}.',
    s1hint: 'What to try: drag only the focal length f first: all three images grow by the same factor and keep their proportions. Then drag only “Move the camera forward”: the nearest post’s image grows fastest; when its distance shrinks from 2 m to 1 m its image doubles, while the farthest post, going from 6 m to 5 m, grows by only a fifth. That is perspective: image height is inversely proportional to distance. The slider ranges keep every post beyond the image plane (z ≥ f).',

    s2k: 'Step 2 · Which pixels light up',
    s2t: 'A triangle lands on a grid of squares: which squares light up?',
    s2e: 'This step asks: the screen is a grid of <strong>pixels</strong>; which of them does a projected triangle cover? The usual rule: light a pixel if its <strong>centre</strong> lies inside the triangle. “Inside” is decided with three <strong>edge functions</strong>. For an edge a→b and a point p, E = (b − a) × (p − a), the 2-D cross product (bₓ − aₓ)(p_y − a_y) − (b_y − a_y)(pₓ − aₓ); E > 0 when p is to the left of the edge. With the vertices in counter-clockwise order, p is inside ⟺ all three E are ≥ 0. Each pixel needs just three multiply-adds and pixels do not depend on each other, which is why a GPU can test thousands at once. Turning shapes into pixels this way is <strong>rasterization</strong>. Screen coordinates span the unit square, so the whole screen has area 1.',
    nSlider: 'Resolution N (pixels per side)', scan2: 'Scan row by row',
    c2: 'Screen: N × N pixels',
    s2lgOn: 'lit pixels', s2lgTri: 'true outline of the triangle', s2lgProbe: 'pixel being inspected',
    s2progress: 'Scanned {c}/{N} rows · ',
    s2readout: '{prog}N = {N}: {n} pixels lit, total area {pa}; the triangle’s true area is {ta}, a difference of {err}%. Inspected pixel (column {i}, row {j}, counted from bottom left): E₁ = {e1}, E₂ = {e2}, E₃ = {e3}, {inout}',
    s2in: 'all three ≥ 0, so it is lit.', s2out: 'one is negative: the centre is outside that edge, so it stays dark.',
    s2hint: 'On the chart you can drag the orange vertices to reshape the triangle and click any pixel to inspect it (pink box). What to try: press “Scan row by row” and watch the pixels get tested and lit one row at a time. Then drag the resolution N: at small N the edges are obvious staircases and the lit area can be several per cent off; the larger N, the closer the lit pixels hug the outline. For the default triangle, every N from 24 to 48 is within ±1% (dragging a vertex changes that figure). Finally click any pixel and read its three edge functions: if any one is negative, its centre is outside that edge.',

    s3k: 'Step 3 · What hides what',
    s3t: 'Where two triangles overlap, which one should each pixel show?',
    s3e: 'This step asks: when two triangles overlap on screen, which one does each pixel show? The nearer one, and the number recording that distance is the <strong>depth</strong> (smaller = nearer here). Depth is only given at the three vertices; inside the triangle it is interpolated with <strong>barycentric coordinates</strong>. The pixel centre p splits the triangle into three smaller triangles, and their shares of the total area, w₁, w₂, w₃ (summing to 1), are p’s weights for the three opposite vertices; the depth at p is w₁z₁ + w₂z₂ + w₃z₃. Colours and texture coordinates are interpolated with the same weights. A <strong>depth buffer</strong> (z-buffer) keeps “the nearest depth so far” for every pixel, and a later triangle overwrites a pixel only if it is nearer there. The older <strong>painter’s algorithm</strong> instead draws whole triangles from far to near by their average depth, later ones covering earlier ones. Here A lies flat (all three vertex depths 0.5) and B is tilted, so the two can pass through each other; when they do, no whole-triangle order is right.',
    tiltSlider: 'Tilt of B', shiftSlider: 'Push B back (positive = farther)', mZ: 'Depth buffer (per pixel)', mP: 'Painter’s algorithm (whole triangles)',
    c3a: 'Picture: which triangle each pixel shows', c3b: 'Depth map: the depth each pixel ends up storing',
    s3lgA: 'triangle A', s3lgB: 'triangle B', s3lgWrong: 'pixels that differ from the depth buffer', s3lgNear: 'near', s3lgFar: 'far',
    s3readout: 'Showing: {m}. B’s vertex depths are {z1}, {z2}, {z3} (A’s are all 0.5). The two overlap on {both} pixels; comparing per pixel, A is nearer on {an} and B on {bn}. Sorting whole triangles, the painter’s algorithm gets {wrong} pixels wrong.',
    s3hint: 'What to try: with the defaults, choose “Depth buffer”: inside the overlap part of B is in front of A and part is behind it, and the dividing line is where their depths are equal. Switch to “Painter’s algorithm”: the whole overlap goes to one triangle, and pink boxes mark the pixels that differ from the depth buffer. Then drag “Push B back” until the readout shows A nearer on 0 pixels or B nearer on 0, meaning B is wholly in front of or behind A: both methods agree and the wrong-pixel count drops to 0. The depth map shows the interpolation at work: B’s shade changes evenly along its tilt.',

    s4k: 'Step 4 · How bright is each pixel',
    s4t: 'Why is one side of the same white ball bright and the other dark, and how is the brightness computed?',
    s4e: 'This step asks: how bright should a pixel be? Every point on a surface has a <strong>normal</strong> n, an arrow of length 1 standing straight out of the surface. When light arrives from direction l (the unit vector pointing to the light), the light received per unit area is proportional to the cosine of the angle α between n and l. This is <strong>Lambert’s law</strong> (diffuse reflection): <strong>brightness = kₐ + (1 − kₐ)·max(0, n·l)</strong>. n·l is the dot product, which for unit vectors equals cos α (<a class="xlink" href="../../../math/linear-algebra/vectors/#step3">→ Vectors, step 3: the dot product and the angle</a>); facing away, n·l < 0 and it is clamped to 0. kₐ is <strong>ambient light</strong>: a constant floor that roughly stands in for light bounced off the surroundings, so the shadowed side is not pitch black. Shiny surfaces also show a <strong>highlight</strong>: the Blinn–Phong model takes h, the direction halfway between the light and the viewer, and adds 0.6·(n·h)^p; the larger the exponent p, the smaller and sharper the highlight, and p = 0 means no highlight. The camera looks at the ball from +z; azimuth 0° with elevation 0° means the light shines from behind the camera, straight at the ball.',
    azSlider: 'Light azimuth (°)', elSlider: 'Light elevation (°)', kaSlider: 'Ambient kₐ', pSlider: 'Highlight exponent p (0 = off)',
    c4a: 'The rendered ball (64 × 64 pixels)', c4b: 'Every pixel: brightness vs the angle α between normal and light',
    s4lgCurve: 'Lambert curve kₐ + (1 − kₐ)·max(0, cos α)', s4lgPx: 'each pixel', s4lgLight: 'light direction (projected onto the picture)',
    s4readout: 'Light-to-view angle {g}°: lit pixels (n·l > 0) cover {lit}% of the visible disc; the moon-phase formula (1 + cos {g}°)/2 gives {pred}%. Brightest pixel {max}; {spec}',
    s4spec0: 'no highlight.', s4spec1: '{n} pixels sit more than 0.02 above the Lambert curve because of the highlight.',
    s4hint: 'What to try: keep kₐ = 0 and p = 0 and look at the “brightness vs angle” chart: every pixel lies on the orange cosine curve, so brightness depends only on the angle between normal and light. Drag the azimuth slowly from 0° to 180°: the lit part shrinks like the phases of the moon, from full to new, in proportion (1 + cos angle)/2. Raise kₐ: the whole curve lifts and the dark side is no longer black. Finally raise p: a small cluster of pixels jumps above the curve; that is the highlight, and it follows the light.',

    s5k: 'Step 5 · Getting rid of jaggies',
    s5t: 'Why do slanted edges look jagged, and why does looking at more points per pixel help?',
    s5e: 'This step asks: where do jagged edges come from, and how do you remove them? In step 2 each pixel looked at one point, its centre, so the answer was all or nothing: a pixel an edge passes through is either fully lit or fully dark, and a slanted edge turns into a staircase. This is <strong>aliasing</strong>. A better pixel value is the fraction of the pixel’s area the triangle covers, its <strong>coverage</strong>, between 0 and 1. <strong>Supersampling</strong> places an n × n grid of sample points evenly inside each pixel; the fraction that falls inside the triangle estimates the coverage, more samples give a better estimate, and the work grows by n². Here a long, thin, slanted triangle is drawn on 16 × 16 pixels, and each estimate is compared with the exact coverage (clip the triangle to each pixel square and take the area). The <strong>error</strong> is the average of |estimate − exact| over the pixels the triangle touches, in coverage units.',
    sppSlider: 'Samples per pixel', dySlider: 'Raise the triangle (pixels)',
    c5a: 'The 16 × 16 picture (white line = true outline)', c5b: 'Mean coverage error vs samples per pixel (log axes)',
    s5lgPx: 'pixel brightness = estimated coverage', s5lgEdge: 'true outline of the triangle', s5lgErr: 'error for each sample count (current raise)', s5lgNow: 'current sample count',
    s5readout: '{spp} samples per pixel, raised {dy} pixels: the triangle touches {m} pixels; mean error {mean}, worst {worst}; total lit {sum} pixel-equivalents against an exact {ex}.',
    s5hint: 'What to try: start at 1 sample per pixel and slowly drag “Raise the triangle”: whole runs of pixels flick on and off and the thin triangle breaks into fragments; in an animation that is flicker. Then set 16 samples: the edges gain grey steps and the brightness changes smoothly as you raise it. Look at the error chart: for this page’s triangle, at every raise from 0 to 1 pixel on the slider, each 4× increase in samples at least halves the mean error; at the current raise, 1 sample gives about {e1} and 256 samples about {e256}.',

    s6k: 'Step 6 · Wrap-up', s6t: 'A frame is a pipeline run in order',
    s6fin: 'Looking back. <strong>Step 0</strong>: homogeneous coordinates make moves into matrices too, so the transforms multiply into one M, read right to left. <strong>Step 1</strong>: perspective projection y′ = f·y/z; dividing by depth makes near things big and far things small. <strong>Step 2</strong>: rasterization lights a pixel when three edge functions say its centre is inside. <strong>Step 3</strong>: barycentric weights carry vertex depths to every pixel, and the depth buffer keeps the nearest one per pixel; sorting whole triangles, as the painter’s algorithm does, fails when they pass through each other. <strong>Step 4</strong>: Lambert’s law, brightness ∝ max(0, n·l); ambient lifts the dark side and highlights add (n·h)^p. <strong>Step 5</strong>: several samples per pixel replace all-or-nothing with coverage, and the staircase becomes a smooth edge.',
    formula: 'p′ = M·(x, y, 1)ᵀ,  M = T·R·S\ny′ = f·y / z\nE(p) = (b − a) × (p − a) ≥ 0\nz(p) = w₁z₁ + w₂z₂ + w₃z₃\nI = kₐ + (1 − kₐ)·max(0, n·l)',
    boundary: 'Scope: this page is a simplified teaching renderer, not a complete GPU pipeline. It leaves out view-frustum clipping, the rasterizer’s “top-left rule” (which triangle owns a pixel lying exactly on a shared edge), perspective-correct interpolation (in 3-D, depth and texture coordinates must be interpolated with perspective in mind; step 3 here interpolates directly in screen space), textures, shadows, indirect light and ray tracing. Step 1 shows y′ = f·y/z on its own; the painter’s error counts in step 3 and the error figures in step 5 hold only for this page’s triangles and slider ranges.',
    linksTitle: 'Where to go next',
    lk1: '→ Linear transforms, step 4: doing A then B really can change the result',
    lk2: '→ Pinhole camera, step 2: what sets the size of the image',
    lk3: '→ Vectors, step 3: why the dot product tells you the angle',
    lk4: '→ Sampling, step 2: the same samples can belong to another wave (aliasing in time)',
    foot: 'Written independently by Claude Code (claude-opus-5-5) as a parallel edition of “Computer Graphics · From Coordinates to Pixels”.'
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
  if (typeof window.refreshGfx === 'function') window.refreshGfx();
}
if (typeof module !== 'undefined' && module.exports) module.exports = { STRINGS };
if (typeof window !== 'undefined') window.GFX_I18N = { t, setLang, getLang: () => lang };
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLang(button.dataset.lang)));
    setLang(lang);
  });
}
