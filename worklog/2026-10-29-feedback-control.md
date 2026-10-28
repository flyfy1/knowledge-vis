# 2026-10-29 · feedback-control

## 交付

- 新增双语 `feedback-control/` 页面，六步教学链：setpoint/error → P → I → D → tuning/stability → wrap-up。
- 新增纯函数 `sim-core.js`：固定步长二阶对象、PID、执行器限制、积分防饱和、扰动和指标计算。
- 新增 BRIEF 与 `specs/feedback-control.md`；页面用本地 CSS/Canvas，无外部依赖。
- 新增 `tests/feedback-control.cjs`，覆盖核心指标和翻译/DOM 契约。

## 验证

- `node --check feedback-control/sim-core.js`
- `node --check feedback-control/app.js`
- `node --check feedback-control/i18n.js`
- `node tests/feedback-control.cjs`

## 环境限制

本次运行的 `task-3/knowledge-vis` checkout 可读但不可写，因此页面和测试先落在当前隔离 workspace；待主 checkout 解锁后复制 `feedback-control/`、`specs/feedback-control.md`、`worklog/2026-10-29-feedback-control.md` 与测试文件，并在站点索引注册入口。未 push/deploy。
