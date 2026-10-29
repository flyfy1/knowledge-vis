# 音乐理论 · build brief

四步双语切片：音程、音阶级数、和弦功能与终止。

- 核心 API：`intervalName`、`frequencyRatio`、`scaleDegree`、`chordFunction`、`cadence`。
- 无音频依赖，用可计算的距离、频率比、级数和功能关系建立听觉理论直觉。
- Scope：十二平均律、七声音阶和常见 2–3 和弦进行；不替代完整和声学或听觉训练。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器中切换根音、调式、和弦与终止。
