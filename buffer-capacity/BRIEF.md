# BRIEF：缓冲溶液（buffer-capacity）· 抵抗酸碱扰动

## 定位

- `slug`: `buffer-capacity`, `category`: `chemistry`, `stage`: `senior`。
- 核心直觉：**HA/A⁻ 的库存先接住外来 H⁺/OH⁻；比值决定当前 pH，总量决定能扛多少。**
- 前置：`acid-base-equilibrium` 的 Ka、共同离子；页面通过链接回收。

## 教学链

1. **看见抵抗**：按钮加入固定 0.01 mol/L 的强酸或强碱；读出 HA/A⁻ 库存、pH 和已中和量，误解反馈说明缓冲不是锁死 pH。
2. **比值决定 pH**：调 pKa 与 `[A⁻]/[HA]`，用 `pH = pKa + log([A⁻]/[HA])` 实算当前读数；提醒 pKa 是酸的身份，稀释不必然改变 pH。
3. **滴定曲线**：同初始 pH 的缓冲液与纯水，曲线由每个外加当量重新计算，不使用预绘制目标曲线。
4. **容量**：固定酸剂量下调总浓度，比较 `ΔpH`；库存更大的溶液移动更小。
5. **边界**：说明理想浓度、固定温度、H–H 近似与忽略水自解离/活度/体积变化。

## 模型与接口

- `window.BUFFER_CAPACITY` 暴露 `pHFromRatio`、`bufferState`、`waterPH`、`titrationSamples`、`capacityResponse`。
- `bufferState` 先按化学计量中和，超出 HA 或 A⁻ 库存才把强酸/强碱视为 excess，并把 pH 推到相应端点。
- 可视化图表和读数都由这些纯函数的结果渲染，随机或动画不是定量来源。
