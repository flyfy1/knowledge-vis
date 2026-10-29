# 计算机图形学 · build brief

四步双语切片：坐标变换、光栅化、漫反射与渲染管线收束。

- 核心 API：`transformPoint`、`rasterizeLine`、`shade`。
- 页面 scope 为静态 2D 教学模型；不模拟完整 GPU 管线、抗锯齿、阴影、间接光或真实光线追踪。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器验证滑杆、双语和问答。
