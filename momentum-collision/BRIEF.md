# 动量与碰撞 · build brief

五步双语交互切片：动量账本、冲量改账、弹性/粘性碰撞、安全停下与收束。

- 核心 API：`momentum`、`impulse`、`collision`、`stopForce`。
- 所有滑杆都有可见数值、标签和 `aria-live` 读数；模式按钮暴露 `aria-pressed`。
- 一维理想模型；弹性碰撞保留动能，粘性碰撞只保留总动量。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器中切换中英、改变旋钮和碰撞模式。
