---
lang: zh
---

::: strings
back: ← 知识索引
category: 地球与太空
stage: 高中
langLabel: 语言
navLabel: 步骤导航
foot: 由 Claude Sonnet（Mini Claude Code）构建 · Built with Claude Sonnet via Mini Claude Code
pageTitle: 大气环流与季风 · 风从哪里来
tagline: 赤道多晒、极地少晒，空气因此转圈；地球自转把圈拧成三圈和信风，陆海温差又让风随季节掉头。
docTitle: 大气环流与季风 · 风从哪里来
:::

## 同一束阳光，为什么越往高纬越“稀”？ {#step0 h2=s0t pre=1}

::: strings
nav0: 0 受热不均
:::

::: html step0-1
s0step: "第 0 步 · "
s0k: 受热不均
:::

<b>这一步回答：纬度怎样决定单位地面得到多少热？</b>同样宽度的阳光斜着打在地面上，会铺开到 1/cos φ 倍的面积里，所以单位面积的受热约按 cos φ 下降。拖动纬度，看光束“摊开”的宽度和橙色曲线上的点一起变化。 {#s0e .explain}

::: html step0-2
s0cv: 年平均受热随纬度变化的曲线与光束铺开示意图
latLbl: 纬度（°，北为正）
:::

## 赤道热、极地冷，空气会怎样转起来？ {#step1 h2=s1t pre=1}

::: strings
nav1: 1 单圈模型
:::

::: html step1-1
s1step: "第 1 步 · "
s1k: 单圈模型
:::

<b>这一步回答：温差本身能推动怎样的流动？</b>赤道空气受热上升，在高空流向两极，冷却后下沉，再沿地面流回赤道，补上空出的位置。温差越大，这个圈转得越快（本页取一个玩具关系，速度随温差的平方根增长）。把温差拉到 0，圈就停了。 {#s1e .explain}

::: html step1-2
s1cv: 赤道上升、高空向极、极地下沉、地面回流的单圈示意图
dtLbl: 赤道−极地温差（K）
play: 播放气团
reset: 重置
:::

::: strings
pause: 暂停
axLat: 纬度
axHeat: 相对受热
beamNote: 同一束光铺开成 {f} 倍面积
s0ro: 纬度 {lat}°：cos φ = {i}，光束铺开 {f} 倍面积，单位面积受热约为赤道的 {pct}%。
eqLabel: 赤道
polN: 北极
polS: 南极
noFlow: 没有温差，就没有推动流动的力
flowOn: 在转
flowOff: 静止
s1ro: 温差 {dT} K：环流速度 {v}（玩具单位），状态：{state}。
north: 北
south: 南
west: 西
east: 东
pushLbl: 气压推动
windLbl: 实际风向
noDeflect: 无偏转
deflR: 向右偏
deflL: 向左偏
easterly: 东风（自东向西吹）
westerly: 西风（自西向东吹）
s2ro: 纬度 {lat}°：f = {f} s⁻¹，{dir}；地面朝赤道或极地流动的空气因此成为 {res}。
:::

## 为什么吹向赤道的风不是正南风？ {#step2 h2=s2t pre=1}

::: strings
nav2: 2 地转偏向
:::

::: html step2-1
s2step: "第 2 步 · "
s2k: 科里奥利偏向
:::

<b>这一步回答：地球自转怎样把风“拧”弯？</b>自转让运动的空气在北半球向右偏、南半球向左偏，偏转强度正比于 f = 2Ω sin φ（Ω 为自转角速度，约 7.292×10⁻⁵ s⁻¹）。赤道上 f = 0，没有偏转。青色是只受气压推动的方向，橙色是偏转后的风向。 {#s2e .explain}

::: html step2-2
s2cv: 在所选纬度上，气压推动方向与偏转后风向的箭头图
:::

## 每个纬度带的地面风吹向哪里？ {#step3 h2=s3t pre=1}

::: strings
nav3: 3 三圈环流
:::

::: html step3-1
s3step: "第 3 步 · "
s3k: 三圈环流
:::

<b>这一步回答：真实的风带怎样由“圈”加“偏转”拼出来？</b>自转使单圈裂成三圈：0–30° 哈得来圈、30–60° 费雷尔圈、60–90° 极地圈。每圈地面的南北向气流（青箭头）经偏转得到东西向分量（橙箭头）：信风、西风带、极地东风。拖动纬度，竖线所在的带会在读数里列出风向和上升/下沉。 {#s3e .explain}

::: html step3-2
s3cv: 三个环流圈、地面风向箭头和上升下沉标记的纬度带图
legend3a: 青：地面南北向气流 · 橙：偏转后的东西向风
legend3b: ↑ 上升气流 · ↓ 下沉气流
:::

::: strings
belt_trade: 信风带（哈得来圈）
belt_westerlies: 西风带（费雷尔圈）
belt_polar: 极地东风带（极地圈）
toNorth: 向北
toSouth: 向南
vert_rise: 此处有上升气流
vert_sink: 此处有下沉气流
vert_none: 此处垂直运动不突出
s3ro: 纬度 {lat}°：{belt}；地面气流{mer}，偏转后成{zon}；{vert}。
sea: 海洋
land: 陆地
aloft: 高空回流
surf: 近地面风
w_onshore: 海风吹向陆地
w_offshore: 风从陆地吹向海
w_calm: 风很弱
summerMon: 夏季风
winterMon: 冬季风
calmMon: 转换季节
s4ro: {m} 月：陆地比海洋 {d} K（玩具值）→ {wind}（{mon}）。
wet: 湿
dry: 干
k_wet: 多雨
k_dry: 干燥
k_mid: 介于之间
s5ro: 纬度 {lat}°，位移 {s}°：湿度指数 {wi}（示意 0–1）→ {kind}。
:::

## 为什么海岸的风随季节掉头？ {#step4 h2=s4t pre=1}

::: strings
nav4: 4 季风
:::

::: html step4-1
s4step: "第 4 步 · "
s4k: 季风
:::

<b>这一步回答：陆地与海洋的温差怎样决定风向？</b>陆地升温降温都比海洋快，夏天陆地更热，热空气上升，近地面气压低，海风吹向陆地（夏季风）；冬天相反。下方小曲线是“陆减海”温差（玩具正弦，七月最大）。拖动月份，箭头方向和长度随温差改变。 {#s4e .explain}

::: html step4-2
s4cv: 海岸剖面：陆地与海洋、近地面与高空的风向箭头及全年温差曲线
monLbl: 月份
:::

## 沙漠和雨林为什么落在特定的纬度？ {#step5 h2=s5t pre=1}

::: strings
nav5: 5 湿区与干区
:::

::: html step5-1
s5step: "第 5 步 · "
s5k: 终章
:::

<b>这一步回答：风带怎样决定雨在哪里下？</b>上升气流冷却成云致雨（赤道、60°），下沉气流变暖变干（30°、极地）。下面的“湿度指数”只是一条示意余弦曲线，不是气候观测。拖动“季节位移”看雨带整体南北挪动，这是对热带辐合带随季节移动的粗略示意。 {#s5e .explain}

::: html step5-2
s5cv: 湿度指数随纬度变化的示意曲线，标出所选纬度
shLbl: 季节位移（°）
recapTitle: 回顾
recap1: 受热不均 → 温差 → 环流：赤道上升、极地下沉。
recap2: 自转的科里奥利偏转把南北向气流拧成信风、西风、极地东风，并把单圈分成三圈。
recap3: 陆海温差让季风随季节反向；上升带多雨、下沉带干燥。
modelTitle: 模型范围与局限
modelText: 这是理想化的无大陆地球：玩具关系只展示方向与趋势，数值不是观测；真实环流还受地形、海陆分布、水汽潜热、急流和涡旋影响，热带辐合带的位移也比示意复杂得多。
link0: → 公转与四季：太阳直射点怎样随季节南北移动
link1: → 气候能量账本：纬度怎样改变受热
link2: → 经纬度：纬度是怎样量出来的
:::

本页完成。 {#done .readout .success i18n=text}
