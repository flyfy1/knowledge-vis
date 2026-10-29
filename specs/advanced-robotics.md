# Advanced Robotics

## Route
- slug: `advanced-robotics`
- category: `computing`
- stage: `university`

## Causal contract
1. Forward kinematics adds link vectors to locate the end effector.
2. Inverse kinematics maps a reachable target to elbow-up/down joint angles.
3. The Jacobian maps joint velocity to endpoint velocity; `det(J)=l₁l₂sinθ₂`.
4. Nearly collinear links form a singular configuration with collapsed local mobility.

## Scope
A planar two-link teaching model. It omits full dynamics, collision checking, joint limits and controller delay.
