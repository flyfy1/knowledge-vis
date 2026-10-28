# Orbital Motion · implementation spec

## Learning contract
A learner should predict which control changes radius, speed, or alignment before moving it. The page models a two-body ellipse in normalised units and makes the causal chain visible in one canvas.

## State and pure functions
- `orbit(e, phaseDeg, inclination)` returns `r=(1-e²)/(1+e cos θ)`, a normalised orbital speed proportional to `sqrt((1+e cos θ)/(1-e²))`, and a transit flag when alignment is near the line of sight.
- `phaseLabel` names the four orbital quadrants.
- `transitChance` exposes the inclination window as a meter, while phase still controls instantaneous alignment.

## Interaction acceptance
1. Increasing `e` visibly elongates the orbit and increases periapsis/apoapsis distance contrast.
2. Moving phase moves the planet and changes the readout; periapsis is faster than apoapsis.
3. Moving inclination changes transit-window width without changing the orbit ellipse.
4. Chinese/English toggle updates labels, explanatory copy, readouts and canvas annotations.
5. Canvas remains legible on a narrow viewport; no external assets or network calls.

## Scope boundary
This is a teaching model, not an ephemeris: fixed star mass, semi-major axis 1 AU, no multi-body perturbations, finite-star ingress/egress, or measurement noise.
