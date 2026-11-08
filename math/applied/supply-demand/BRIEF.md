# Supply & Demand · Brief

## Teaching contract

- Start from one causal picture: a horizontal price line meets demand and supply; the crossing is where `Qd = Qs`.
- Make policy causal: a per-unit tax or subsidy creates a wedge between the buyer price and seller price, which changes the crossing quantity and the total surplus.
- Use the same canvas for elasticity: changing demand slope changes quantity response and which side absorbs a wedge.
- Finish with measurable areas: consumer surplus, producer surplus, and deadweight loss.
- Every learner-facing string is available in Chinese and English through the shared language toggle.

## Interaction contract

- `window.SUPPLY_DEMAND.marketState(options)` returns equilibrium prices, quantity, wedge, tax revenue, subsidy cost, and surplus values.
- `window.SUPPLY_DEMAND.elasticityAt(state)` reports point elasticity at the current crossing.
- `window.SUPPLY_DEMAND.deadweightLoss(base, policy)` compares total surplus with and without a policy wedge.
- Sliders redraw curves and derived readouts together; quiz feedback names the curve-shift misconception.

## Scope and limits

The simulation uses linear demand and supply with fixed outside conditions and a competitive market. It does not model income effects, market power, rationing, expectations, or time-dependent supply response. Areas are teaching quantities, not a forecast for a real market.
