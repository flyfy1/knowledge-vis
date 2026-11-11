# Demos（演示区）

`/demos/<slug>/` 放不讲知识点、只展示效果的独立页面。首页分类 id 为 `demos`，`demos/index.html` 跳转到 `/?category=demos`。

## 约定

- 每个演示是一个自包含的 `index.html`，不引用 `lesson-shell.*`，不贴页头「开发版本」标签，也不进 `page-provenance.json`（那套契约只管知识页）。作者归属照常由提交 trailer 记录。
- 允许从 CDN 加载运行库，必须写死版本号；其余素材（模型、贴图、音频）一律由代码生成，不加载外部文件。
- 在 `pages.config.js` 里登记一条，`category: "demos"`，`path: "demos/<slug>/"`，不填 `subtopic`。

## fable-flight（寓言乘风，梦在舞动）

100 秒循环的 Three.js 实时短片：深夜图书馆，24,000 页纸从一本书里飞出，汇成河，再聚成一只鸟飞向月亮。

- 依赖：`three@0.170.0` 及同版本 `examples/jsm`（EffectComposer、UnrealBloomPass、OutputPass、Reflector），经 jsdelivr importmap 引入。
- 纸页是一个 `InstancedBufferGeometry`，全部运动在顶点着色器里按时间解析求出，CPU 每帧只更新几个 uniform。
- 窗户形状写成一个 GLSL 函数 `windowMask`，纸页受光、尘埃和体积光三处共用；改窗棂几何时要同步改这个函数。
- 光线方向 `L` 的仰角比画面里的月亮高，是有意的：仰角压低后光柱会横穿整个中殿，画面发灰。
- `EffectComposer` 克隆渲染目标时两个缓冲共用同一张深度图，会形成反馈回路；第二个缓冲要单独建 `DepthTexture`。
- 声音用 WebAudio 合成（钢琴、纸声、翼声、混响），时间轴以 `AudioContext.currentTime` 为准，所以需要点击「开始放映」。
- 调试：`?t=<秒>` 把时间轴冻结在该时刻并跳过开场页，用来截图检查。
- 帧时间持续超过 30 ms 时逐级降低像素比（下限 0.75），页数不减。

### 已检查

1280×720 下 `?t=` 取 6/16/26/30/48/54/60/66/71/78/80/83/86/94 秒截图逐张看过；点击开始后带声音连续播放 24 秒，控制台无报错；390×844 竖屏能播放。声音没有人耳听过，只确认了调度不报错。
