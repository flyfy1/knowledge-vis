'use strict';
const STR = {
  "zh": {
    "docTitle": "小孔成像 · 光走直线，像是倒的 —— 一步一交互",
    "back": "← 知识索引",
    "pageTitle": "小孔成像",
    "tagline": "一支蜡烛、一个小孔、一面屏——没有透镜，像自己就出现了，还是倒着的。这一页的每条光线、每个落点，都按「光沿直线传播」实算出来再画：拖一拖、量一量，看倒像到底是谁说了算。",
    "foot": "小孔成像 · 一步一交互",
    "reset": "重置本步",
    "navLabel": "步骤导航",
    "canvasLabel": "本步交互光路图；操作方法见上方说明",
    "nav0": "0 光走直线",
    "nav1": "1 倒像登场",
    "nav2": "2 像的大小",
    "nav3": "3 孔变大",
    "nav4": "4 自测",
    "nav5": "5 终章",
    "s0k": "第 0 步",
    "s0t": "光走直线，影子作证",
    "s0e": "这一步要回答：光到底是走直线，还是会拐弯？我们画的带箭头的细线叫<strong>光线</strong>——它表示光走的路，是个画法，光本身并不是一根线。看图：一颗小灯泡发光，中间放一块圆片挡板，后面是一面屏。光要是会拐弯，就能绕过挡板把屏整个照亮；可屏上偏偏留下一块没被照到的地方，那就是<strong>影子</strong>——光被挡住、到不了的地方。拖动挡板（或用滑杆），再按「让光飞一遍」，看光点是不是只沿直线走。诚实交代一句：这里用小灯泡，它近似「一个点发的光」（<strong>点光源近似</strong>），所以影子边缘利落；太阳那样的大光源，影子边缘会带一圈渐变，不在本页范围。",
    "s0discLab": "挡板的位置（也可拖图中的挡板）",
    "s0play": "让光飞一遍 ▶",
    "s0ro": "影子落在屏上：把屏从上到下均分成 100 份，影子从离屏顶约 {topPct} 份的地方开始，一直盖到离屏顶约 {botPct} 份的地方。这两个位置都由「灯泡点与挡板边缘连成直线、延长到屏」算出来，不是随手画上去的。",
    "s0roFly": "光正在沿直线飞：已走 {pct}%——注意看，光点只沿直线前进，从不拐弯；被挡板拦下的，就停在挡板上。",
    "s0roDone": "飞完了：每条光线都是直的，影子的两条边缘线正好是挡板边缘的延长线——挡板往哪移，影子就往哪移，分毫不差。",
    "s0hint": "结论：<strong>光在同一种介质（比如空气）里沿直线传播</strong>——影子边缘整齐、位置完全可预测，就是证据。适用条件是「同一种均匀介质」：光碰到镜面会弹回、穿进水里会拐弯，那是后面页面的事。",
    "cLamp": "灯泡",
    "cBlock": "挡板",
    "cScreen": "屏",
    "cShadow": "影子",
    "s1k": "第 1 步",
    "s1t": "小孔登场：像为什么是倒的",
    "s1e": "这一步要回答：把挡板换成带小孔的板，光只能从孔里穿过去，屏上会出现什么？蜡烛的焰顶记作 A、焰底记作 B。按「点亮光线」一条一条看：A 发出的光穿过孔心，会落到屏的哪边？B 的呢？右下角还有一幅<strong>俯视图</strong>（从正上方往下看同一套装置）——侧视图看不见的「左右」，在俯视图里看得见。像这种上下左右都和原物交换的像，叫<strong>倒像</strong>。",
    "s1light": "点亮第一条光线（焰顶 A）",
    "s1light2": "点亮第二条光线（焰底 B）",
    "s1litDone": "两条光线都已点亮",
    "s1ro0": "还没有光线。先想一想：焰顶 A 的光穿过小孔，会落到屏的上方还是下方？",
    "s1ro1": "第一条：A（焰顶）的光穿过孔心，落在屏的下方（画布 {y} 处）——顶部的光只能走到下面去，像的第一笔已经反了。",
    "s1ro2": "第二条：B（焰底）的光穿过孔心，落在屏的上方（画布 {y} 处）。两条线在孔口交叉：屏上像的上端来自 B、下端来自 A，上下颠倒。再看俯视图：左边的光落到右边、右边的光落到左边——左右也交换了。",
    "s1hint": "结论：<strong>倒像</strong>不是小孔把像「翻」了个身，而是光走直线、在孔口交叉的结果——顶部的光只能沿直线走到下面去。",
    "cCandle": "蜡烛",
    "cHole": "小孔",
    "cTopView": "俯视图（从上往下看）",
    "cLeft": "左",
    "cRight": "右",
    "cImage": "倒像",
    "s2k": "第 2 步",
    "s2t": "像的大小，谁说了算",
    "s2e": "这一步要回答：屏上的像比蜡烛大还是小，由什么决定？先把四个量正式命名（就是字面意思）：蜡烛的高度叫<strong>物高 H</strong>，蜡烛到小孔的距离叫<strong>物距 u</strong>，小孔到屏的距离叫<strong>像距 v</strong>，像的高度叫<strong>像高 h</strong>。拖焰尖改 H、拖挡板改 u、拖屏改 v（每个量都有滑杆）。图是按比例缩小的示意，数字按真实比例算（单位 cm）。",
    "s2hLab": "物高 H（也可拖图中的焰尖）",
    "s2uLab": "物距 u（也可拖图中的挡板）",
    "s2vLab": "像距 v（也可拖图中的屏）",
    "s2peq": "物距 = 像距（u = v = 120，像与物等大）",
    "s2pu2": "物距是像距两倍（u = 160，v = 80，像半高）",
    "s2pv2": "像距是物距两倍（u = 80，v = 160，像双倍高）",
    "s2ro": "像高 h = {h} cm；对账：物高 ×（像距 ÷ 物距）= {H} × {ratio} {eq} {h}——图上把物端点与孔心连线、延长到屏量出的像高，也是这个数，两边对得上。",
    "s2hint": "结论：<strong>像高 ÷ 物高 = 像距 ÷ 物距</strong>——像的大小只由两个距离的比决定，和孔的大小没关系（孔的事下一步专问）。（这个『比相等』，初中叫相似三角形对应边成比例——同一件事的正式名字。）适用条件：孔足够小；「足够小」是什么意思，下一步说清。",
    "s3k": "第 3 步",
    "s3t": "孔开大，像为什么糊了",
    "s3e": "这一步要回答：把孔开大，像为什么会变糊？小孔时，蜡烛上一个点发出的光只能从孔心一带穿过，落在屏上还是一个点。孔开大后，同一个点发出的光能从孔的上缘、中心、下缘各处穿过，落到屏上就摊开成一小片亮区——这叫<strong>光斑</strong>。拖孔径滑杆，看焰顶、焰底两点的光斑各摊多宽、又叠了多少。说明一句口径：图上每个物点只画 3 条代表光线（分别穿孔的上缘、中心、下缘）；真实的光有无数条，摊成的是一整片光斑——只画 3 条，是为了看清「摊开」这件事。",
    "s3dLab": "孔径（孔的大小）",
    "s3ro": "本步场景先报数：物距 u = {u} cm、像距 v = {v} cm。每个点的光斑宽 = {w} cm——由「孔径 ×（u + v）÷ u」实算：{d} ×（{u} + {v}）÷ {u}，三个数都在这儿，可以自己代入验算；焰顶与焰底的光斑中心相距 {sep} cm。{overlap}",
    "s3roOverlap": "两个光斑已经叠在一起了——叠得越多，像的细节越分不清，就越糊",
    "s3roNoOverlap": "两个光斑还没叠上，所以像还分得清",
    "s3ro2": "进光量约和孔径的平方成正比：现在约是最小孔（孔径 4）时的 {k} 倍，像变亮了。亮和糊是一对交换——孔大换来亮、赔上糊。",
    "s3hint": "结论：孔越小，像越锐利但越暗；孔越大，像越亮但越糊。针孔相机、看日食的小孔投影盒，用的都是小孔——宁可用亮度换锐利。",
    "cSpot": "光斑",
    "cIdeal": "小孔时的像",
    "s4k": "第 4 步",
    "s4t": "自测：四道题",
    "s4e": "每道题的答案都能在前面的步骤里亲手验证。答错了，反馈会点名错在哪条直觉上；四题全答对，终章提示就会出现。",
    "q1t": "自测 1 · 物高 60 cm、物距 30 cm、像距 15 cm，屏上的像高是多少？",
    "q1o0": "30 cm",
    "q1o1": "60 cm",
    "q1o2": "120 cm",
    "q1why": "h = 物高 × 像距 ÷ 物距 = 60 × 15 ÷ 30 = 30 cm——像距只有物距的一半，像也只有一半高（第 2 步可以亲手拖到这组数对账）。",
    "q1w1": "这是把「物距 = 像距时等大」记成了「像永远和物一样大」。等大只是像距 = 物距时的特例；这里像距只有物距的一半。",
    "q1w2": "比用反了：h = 物高 ×（像距 ÷ 物距），像距 ÷ 物距 = 15 ÷ 30 = 0.5；你算的是物高 ×（物距 ÷ 像距）。",
    "q2t": "自测 2 · 蜡烛不动、也不换屏，想让屏上的像相对蜡烛更大，该怎么做？",
    "q2o0": "把孔开大",
    "q2o1": "把屏拉远（增大像距）",
    "q2o2": "把蜡烛吹得更亮",
    "q2why": "像高 ÷ 物高 = 像距 ÷ 物距：物距不变时，把屏拉远、像距变大，像就按同样的倍数变大（第 2 步）。",
    "q2w0": "孔开大只会让像变糊（第 3 步：每个点摊成更大的光斑）；像的大小由距离的比决定，孔不掺和。",
    "q2w2": "吹亮改变的是像的明暗，不改变像的大小；大小只看像距 ÷ 物距（第 2 步）。",
    "q3t": "自测 3 · 屏上的像和蜡烛比，方向如何？",
    "q3o0": "只有上下反，左右不变",
    "q3o1": "和蜡烛完全一样",
    "q3o2": "上下左右都反",
    "q3why": "光在孔口交叉：上下的光交叉一次，左右的光也交叉一次——第 1 步的俯视图里，左边的光正落在右边。",
    "q3w0": "这是只看了侧视图的结论：侧视图里确实只看得见上下反；第 1 步的俯视图补上了另一半——左右也交换。",
    "q3w1": "像要是和蜡烛完全一样，就不需要光在孔口交叉了——第 1 步里焰顶的光明明落到了屏的下方。",
    "q4t": "自测 4 · 把孔开得很大，像会怎样？",
    "q4o0": "变得更大",
    "q4o1": "消失不见",
    "q4o2": "变得模糊",
    "q4why": "孔越大，每个物点摊成的光斑越宽，相邻点的光斑叠得越多，像就越糊（第 3 步）——是糊，不是不见。",
    "q4w0": "孔的大小不进像高公式（第 2 步：像高只由距离的比决定）；孔变大改变的是清晰度，不是大小。",
    "q4w1": "孔再大，光也照样穿过孔落到屏上——只是每个点摊成大光斑、互相叠到分不清，像糊了，但不会消失。",
    "fbRight": "答对了。",
    "score": "自测进度：答对 {k}/4 题，其中首次答对 {f} 题。",
    "scoreIdle": "自测进度：还没开始答题。",
    "gateDone": "四题全对！三条结论都站得住了——到终章（第 5 步）把它们收成三句话，再顺着链接去看光碰到镜面、换上透镜之后的故事。",
    "finK": "终章",
    "finT": "收束：小孔成像的三句话",
    "fc1t": "光走直线，影子作证",
    "fc1b": "光在同一种介质里沿直线传播：影子边缘整齐、位置完全可预测，就是最日常的证据。",
    "fc2t": "直线在孔口交叉，像就倒了",
    "fc2b": "焰顶的光只能落到屏的下方、焰底的光落到上方，俯视图里左右同样交换。倒像不是被谁翻的，是直线交叉的必然。",
    "fc3t": "像高比 = 像距 ÷ 物距",
    "fc3b": "像的大小只由两个距离的比决定；孔只管清晰与明暗：孔小锐利而暗，孔大明亮而糊。",
    "finLink1": "光一直走直线，直到碰到镜面——镜面会把它按「入射角 = 反射角」弹回去。<a class=\"fourier-link\" href=\"../reflection-refraction/#step0\">去看看弹的规矩 →</a>",
    "finLink2": "把小孔换成凸透镜，像还是靠光线来定位：透镜页用三条有规矩的光线找像点，其中穿过光心的那条走的正是直线，和本页穿孔的这条是同一个道理。<a class=\"fourier-link\" href=\"../lens/#step1\">去透镜页看三条光线 →</a>",
    "finNote": "照相机和眼睛，都是这套「成像」的后代——它们的成像道理，都从这间小暗箱里长出来。"
  },
  "en": {
    "docTitle": "The Pinhole Camera · Light Goes Straight, the Image Lands Upside Down — One Interaction at a Time",
    "back": "← Knowledge Index",
    "pageTitle": "The Pinhole Camera",
    "tagline": "A candle, a tiny hole, a screen — no lens at all, yet an image appears on its own, upside down. Every ray and every landing point on this page is computed from one rule — light travels in straight lines — before it is drawn. Drag, measure, and see who really decides the inverted image.",
    "foot": "The Pinhole Camera · One Interaction at a Time",
    "reset": "Reset this step",
    "navLabel": "Step navigation",
    "canvasLabel": "Interactive ray diagram for this step; instructions appear above",
    "nav0": "0 Light goes straight",
    "nav1": "1 The inverted image",
    "nav2": "2 How big is the image",
    "nav3": "3 A bigger hole",
    "nav4": "4 Self-test",
    "nav5": "5 Finale",
    "s0k": "Step 0",
    "s0t": "Light travels straight — the shadow is the witness",
    "s0e": "Question: does light travel in straight lines, or can it bend its way around things? The thin arrowed lines we draw are called <strong>rays</strong> — they stand for the path light takes; they are a drawing convention, light itself is not a thread. Look at the scene: a small bulb glows, a round disc blocks the middle, and a screen stands behind. If light could bend, it would slip around the disc and light up the whole screen; instead a region the light never reaches is left behind — the <strong>shadow</strong>, where light is blocked and cannot arrive. Drag the disc (or use the slider), then press “Let the light fly” and watch whether the light dots ever travel anything but straight. One honest note: the small bulb here is treated as light coming from a single point (the <strong>point-source approximation</strong>), which is why the shadow's edge is sharp; a big source like the Sun gives shadows a graded fringe, which is beyond this page.",
    "s0discLab": "Position of the disc (or drag the disc in the diagram)",
    "s0play": "Let the light fly ▶",
    "s0ro": "The shadow lands on the screen: divide the screen from top to bottom into 100 equal parts — the shadow starts about {topPct} parts down from the screen's top and reaches about {botPct} parts down. Both positions come from drawing a straight line from the bulb through the disc's edge and extending it to the screen, not from sketching.",
    "s0roFly": "Light is flying, dead straight: {pct}% of the way — notice the dots only ever move along straight lines, and the ones the disc stops stay stopped on the disc.",
    "s0roDone": "Flight complete: every ray is straight, and the shadow's two edges are exactly the extensions of the disc's edges — move the disc anywhere and the shadow follows, to the unit.",
    "s0hint": "Conclusion: <strong>light travels in straight lines within one medium (such as air)</strong> — a tidy shadow edge in a perfectly predictable place is the evidence. The condition is “one uniform medium”: light bounces off mirrors and bends entering water, and those are later pages' stories.",
    "cLamp": "Bulb",
    "cBlock": "Disc",
    "cScreen": "Screen",
    "cShadow": "Shadow",
    "s1k": "Step 1",
    "s1t": "Enter the pinhole: why is the image upside down?",
    "s1e": "Question: replace the disc with a board pierced by a tiny hole, so light can only pass through the hole — what appears on the screen? Call the candle's flame tip A and its base B. Press “Light the rays” and watch one at a time: the light from A passing through the hole's center — which part of the screen can it reach? And B's? The small panel at lower right is the <strong>top view</strong> (the same apparatus seen from directly above) — the left–right direction, invisible in the side view, is visible there. An image swapped top-to-bottom and left-to-right like this is called an <strong>inverted image</strong>.",
    "s1light": "Light the first ray (flame tip A)",
    "s1light2": "Light the second ray (flame base B)",
    "s1litDone": "Both rays are lit",
    "s1ro0": "No rays yet. Think first: light from flame tip A passes through the pinhole — does it land on the upper or the lower part of the screen?",
    "s1ro1": "First ray: light from A (the flame tip) passes through the hole's center and lands on the lower part of the screen (canvas {y}) — the top's light can only travel to the bottom. The image's first stroke is already flipped.",
    "s1ro2": "Second ray: light from B (the flame base) passes through the hole's center and lands on the upper part of the screen (canvas {y}). The two lines cross at the hole: the image's top end comes from B, its bottom end from A — upside down. Now check the top view: light from the left lands on the right, and from the right on the left — left and right swap too.",
    "s1hint": "Conclusion: the <strong>inverted image</strong> is not the hole “flipping” anything — it is what straight lines crossing at the hole must produce: the top's light can only go straight, and straight takes it to the bottom.",
    "cCandle": "Candle",
    "cHole": "Pinhole",
    "cTopView": "Top view (looking down)",
    "cLeft": "Left",
    "cRight": "Right",
    "cImage": "Image",
    "s2k": "Step 2",
    "s2t": "How big is the image — who decides?",
    "s2e": "Question: is the image on the screen bigger or smaller than the candle, and what decides it? First, name the four quantities (they mean exactly what they say): the candle's height is the <strong>object height H</strong>, the candle-to-hole distance is the <strong>object distance u</strong>, the hole-to-screen distance is the <strong>image distance v</strong>, and the image's height is the <strong>image height h</strong>. Drag the flame tip to change H, the board to change u, the screen to change v (every quantity also has a slider). The drawing is scaled down; the numbers use the true proportions (unit: cm).",
    "s2hLab": "Object height H (or drag the flame tip in the diagram)",
    "s2uLab": "Object distance u (or drag the board in the diagram)",
    "s2vLab": "Image distance v (or drag the screen in the diagram)",
    "s2peq": "Object distance = image distance (u = v = 120, image same size)",
    "s2pu2": "Object distance twice image distance (u = 160, v = 80, image half height)",
    "s2pv2": "Image distance twice object distance (u = 80, v = 160, image double height)",
    "s2ro": "Image height h = {h} cm; check the account: object height × (image distance ÷ object distance) = {H} × {ratio} {eq} {h} — and measuring the image on the diagram, by extending the line from each object endpoint through the hole's center to the screen, gives the same number. Both sides agree.",
    "s2hint": "Conclusion: <strong>image height ÷ object height = image distance ÷ object distance</strong> — the image's size is decided by the ratio of the two distances alone, and the hole's size has no say in it (the hole gets its own step next). (This “equal ratios” is what junior-high calls corresponding sides of similar triangles in proportion — the formal name for the same fact.) Condition: the hole must be small enough; what “small enough” means is the next step.",
    "s3k": "Step 3",
    "s3t": "Open the hole wider — why does the image blur?",
    "s3e": "Question: open the hole wider, and why does the image blur? With a tiny hole, light from one point of the candle can only pass near the hole's center, and lands on the screen as one point. With a wide hole, light from that same point can pass through the hole's top edge, center, and bottom edge, and spreads on the screen into a small patch of light — a <strong>blur spot</strong>. Drag the aperture slider and watch how wide each of the two points' spots spreads, and how much they overlap. One statement of method: the diagram draws only 3 representative rays per object point (through the hole's top edge, center, and bottom edge); real light has countless rays and spreads into a whole patch — only 3 are drawn so the “spreading” itself stays visible.",
    "s3dLab": "Aperture (size of the hole)",
    "s3ro": "First, this step's scene numbers: object distance u = {u} cm, image distance v = {v} cm. Each point's blur spot is {w} cm wide — computed as aperture × (u + v) ÷ u, here {d} × ({u} + {v}) ÷ {u}; all three numbers are right here, so you can plug them in and check for yourself. The two spot centers (flame tip and base) are {sep} cm apart. {overlap}",
    "s3roOverlap": "The two spots already overlap — the more they overlap, the less detail the image keeps, and the blurrier it gets",
    "s3roNoOverlap": "The two spots do not overlap yet, so the image is still distinguishable",
    "s3ro2": "The light admitted grows roughly with the square of the aperture: it is now about {k}× that of the smallest hole (aperture 4), and the image is brighter. Brightness and blur are a trade — a bigger hole buys brightness and pays with blur.",
    "s3hint": "Conclusion: the smaller the hole, the sharper but dimmer the image; the bigger the hole, the brighter but blurrier. Pinhole cameras and the pinhole projection boxes used to watch solar eclipses all use tiny holes — trading brightness for sharpness on purpose.",
    "cSpot": "Blur spot",
    "cIdeal": "Image with a tiny hole",
    "s4k": "Step 4",
    "s4t": "Self-test: four questions",
    "s4e": "Every answer can be verified by hand in the earlier steps. A wrong answer's feedback names the intuition that misled you; get all four right and the finale note appears.",
    "q1t": "Self-test 1 · Object height 60 cm, object distance 30 cm, image distance 15 cm — what is the image height on the screen?",
    "q1o0": "30 cm",
    "q1o1": "60 cm",
    "q1o2": "120 cm",
    "q1why": "h = object height × image distance ÷ object distance = 60 × 15 ÷ 30 = 30 cm — the image distance is half the object distance, so the image is half as tall (in Step 2 you can drag to exactly these numbers and check).",
    "q1w1": "This turns “same size when image distance = object distance” into “the image is always the same size as the object”. Same size is only the special case v = u; here v is half of u.",
    "q1w2": "The ratio is upside down: h = object height × (image distance ÷ object distance), and image ÷ object distance = 15 ÷ 30 = 0.5; you computed object height × (object distance ÷ image distance).",
    "q2t": "Self-test 2 · The candle stays put and the screen stays the same screen — how can the image be made bigger relative to the candle?",
    "q2o0": "Open the hole wider",
    "q2o1": "Move the screen farther away (increase the image distance)",
    "q2o2": "Blow the candle brighter",
    "q2why": "Image height ÷ object height = image distance ÷ object distance: with the object distance fixed, moving the screen farther away grows the image distance, and the image grows by the same factor (Step 2).",
    "q2w0": "A wider hole only blurs the image (Step 3: each point spreads into a bigger spot); size is decided by the ratio of the distances, and the hole has no part in it.",
    "q2w2": "Blowing brighter changes the image's brightness, not its size; size depends only on image distance ÷ object distance (Step 2).",
    "q3t": "Self-test 3 · Compared with the candle, which way does the image on the screen face?",
    "q3o0": "Only top and bottom swap; left and right stay",
    "q3o1": "Exactly the same as the candle",
    "q3o2": "Top–bottom and left–right both swap",
    "q3why": "The rays cross at the hole: the top–bottom rays cross once, and the left–right rays cross too — in Step 1's top view, light from the left lands squarely on the right.",
    "q3w0": "That is the side view talking: in the side view you can indeed only see top and bottom swap; Step 1's top view supplies the other half — left and right swap as well.",
    "q3w1": "If the image were exactly the candle, no crossing at the hole would be needed — in Step 1 the flame tip's light plainly landed at the bottom of the screen.",
    "q4t": "Self-test 4 · Open the hole very wide — what happens to the image?",
    "q4o0": "It gets bigger",
    "q4o1": "It disappears",
    "q4o2": "It gets blurry",
    "q4why": "The wider the hole, the wider each point's blur spot, and the more neighbouring spots overlap — so the image blurs (Step 3). Blurred, not gone.",
    "q4w0": "The hole's size never enters the image-height formula (Step 2: size is decided by the distance ratio alone); a wider hole changes sharpness, not size.",
    "q4w1": "However wide the hole, light still passes through it onto the screen — each point just spreads into a large spot and the spots merge until nothing can be told apart. The image blurs; it does not vanish.",
    "fbRight": "Correct.",
    "score": "Quiz progress: {k}/4 correct, {f} of them on the first try.",
    "scoreIdle": "Quiz progress: not started yet.",
    "gateDone": "All four correct! The three conclusions all stand — go to the finale (Step 5) to gather them into three sentences, then follow the links to see what happens when light meets a mirror, and when the hole becomes a lens.",
    "finK": "Finale",
    "finT": "Wrap-up: pinhole imaging in three sentences",
    "fc1t": "Light goes straight — the shadow testifies",
    "fc1b": "Within one medium, light travels in straight lines: a shadow's tidy edge in a perfectly predictable place is the everyday proof.",
    "fc2t": "Straight lines cross at the hole — the image inverts",
    "fc2b": "The flame tip's light can only land at the screen's bottom, the base's at the top, and the top view shows left and right swapping too. Nobody flips the image; crossing straight lines make inversion unavoidable.",
    "fc3t": "Image-height ratio = image distance ÷ object distance",
    "fc3b": "Size is decided by the ratio of the two distances alone; the hole governs only sharpness and brightness: small is sharp but dim, big is bright but blurry.",
    "finLink1": "Light goes straight — until it meets a mirror, which bounces it back by “angle of reflection = angle of incidence”. <a class=\"fourier-link\" href=\"../reflection-refraction/#step0\">See the rules of the bounce →</a>",
    "finLink2": "Swap the pinhole for a convex lens and the image is still located by rays: the lens page finds image points with three well-behaved rays, and the one through the optical center travels straight — the very same principle as this page's ray through the hole. <a class=\"fourier-link\" href=\"../lens/#step1\">See the three rays on the lens page →</a>",
    "finNote": "Cameras and eyes are both descendants of this imaging idea — how they form images grows out of this little dark box."
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
