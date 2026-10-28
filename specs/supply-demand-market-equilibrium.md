# 供需与市场均衡 / Supply & Demand · Market Equilibrium

## Slice intent

让学习者沿一条可操作的因果链走完：**曲线 → 交点 → 价格楔子 → 数量反应 → 剩余**。页面不把税、补贴、弹性和消费者剩余拆成孤立定义，而是让同一张图在每次拖动后重新计算。

## Five-step teaching chain

1. **交点 / Crossing** — read a horizontal price line and verify `Qd = Qs` at the highlighted equilibrium.
2. **政策楔子 / Policy wedge** — drag tax and subsidy independently; show buyer price, seller price, quantity, and deadweight loss.
3. **弹性 / Elasticity** — flatten/steepen demand and move its intercept; pair point elasticity with buyer share of a tax wedge.
4. **剩余 / Surplus** — shade consumer and producer surplus areas and vary reservation-price spaces; report their sum.
5. **误解检查 / Misconception check** — distinguish movement along a curve from an external factor shifting the curve; the feedback explicitly points back to the wedge geometry.

## Render and state contract

- Canvas has visible axes, grid, demand/supply labels, equilibrium guides, and policy price guides.
- Metric cards mirror the current state in text for keyboard and screen-reader access.
- Language toggle updates visible copy, canvas labels, and quiz feedback without changing model state.
- `prefers-reduced-motion` is honored; there is no auto-running animation.

## Review gates

- `node tests/core.cjs` passes.
- `node --check app.js` passes.
- Dragging tax from 0 to a positive value lowers Q, separates buyer/seller prices, and produces positive DWL.
- Dragging subsidy from 0 to a positive value raises Q and reverses the wedge.
- Quiz answer C returns a correct message; A/B return a misconception hint.
