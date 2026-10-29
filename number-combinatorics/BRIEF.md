# 数论与组合 · build brief

四步双语切片：质因数分解、欧几里得算法、组合计数与迁移检查。

- 核心 API：`factorize`、`divisorCount`、`gcd`、`lcm`、`combination`。
- 所有数字由当前滑杆实时计算；因数、余数链和 Pascal 行均可见。
- 验证：`node tests/core.cjs`、`node --check app.js`，浏览器中切换中英并改变所有控件。
