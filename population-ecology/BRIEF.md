# Population ecology · brief

## One-line promise

让学习者把一条 S 曲线读成可追踪的因果链：内禀增长率 `r` 推动数量，承载力 `K` 通过资源反馈降低净增长，捕食者再把两个种群耦合成有延迟的波动。

## Audience and use

- 高中到大学初阶生态学学习者。
- 5–8 分钟自学切片；每一步都能拖动参数并看到同一模型的后果。
- 中英双语，默认中文，顶部可切换英文。

## Required interactions

1. 调整 `N₀`、`r`、`K`、时间 `t`，观察 logistic 曲线和当前净增长。
2. 在 `dN/dt`–`N` 图上读取 K 两侧的正负反馈。
3. 调整捕食压力 `a` 与捕食者死亡率 `m`，比较猎物/捕食者的延迟峰值。
4. 用一道误解检查确认 `N = K` 时 `dN/dt = 0`。

## Verification

`node tests/population-ecology.cjs` 检查 logistic 极限、K 平衡点、单调增长和捕食反馈输出。
