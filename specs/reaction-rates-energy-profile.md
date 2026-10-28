# Reaction rates: energy profile bridge

The catalyst step now pairs the measured collision simulation with a reaction-coordinate sketch. The pink line follows the current activation threshold; the green dashed line is the lower catalysed gate. The sketch keeps the conceptual distinction explicit: the particle-speed distribution stays fixed while the barrier changes. All rate numbers remain simulation counts from `advanceState`.

The pure `energyProfileData(threshold)` helper is exposed through `window.REACTION_RATES`/CommonJS so the threshold relationship can be tested without a browser. The profile is deliberately labelled as a sketch; it does not feed the rate calculation.
