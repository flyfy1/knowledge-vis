# 强化学习：智能体怎么在试错里学会长远打算 / Reinforcement Learning

- Built-By: Antigravity (gemini-4-hydrogen)
- Verified-By: self-check (tests/models.cjs; browser pending coordinator lock)
- Slug: `reinforcement-learning`
- Path: `computing/ml/reinforcement-learning/`
- Stage: `university` (deep track)
- Frontier snapshot date: `2026-11-11`

## One Question

**How does an agent learn far-sighted decisions solely from sparse, delayed rewards through trial and error?**
（智能体怎么只靠延迟的奖惩信号，在试错里学会长远打算？）

## Chapter Ladder, Interactive Models & Pinned Numbers

Every number quoted in `copy.zh.js` and `copy.en.js` is computed by `models.js` (`RLModels.facts()`) and verified inside `tests/models.cjs`:

1. **`#ch1` Exploration vs Exploitation (`banditSim`):**
   - 5 arms (`BANDIT_MEANS = [0.25, 0.45, 0.85, 0.58, 0.35]`, std `0.55`, horizon `300`, `120` seeded trials).
   - Pure greedy (`ε = 0`): cumulative regret `94.8`, optimal-arm rate `23%`.
   - `ε-greedy (ε = 0.12)`: cumulative regret `32.4`.
   - `UCB1 (c = 0.75)`: cumulative regret `20.0`, optimal-arm rate `93%`.
2. **`#ch2` MDPs & Bellman Equations (`mdpEvaluate`):**
   - `5 × 5` gridworld (`Start (4,0)`, `Goal (0,4) +10`, `Trap (0,2) -10`, walls `(1,1),(2,1),(3,3)`, step cost `-0.1`, default `γ = 0.90`, `p_slip = 0.15`).
   - Optimal policy start value `V*(S) = +3.52` vs naive Manhattan policy `-5.68`; slip-free 8-step exact value `+4.21`; myopic `γ = 0.50` start value `-0.16`.
3. **`#ch3` Dynamic Programming (`dpIterate`):**
   - Contraction rate `γ`: Value Iteration reaches `< 1e-4` max residual in `26` sweeps; Policy Iteration locks optimal policy in `2` policy-improvement rounds.
4. **`#ch4` Model-Free TD Control (`cliffWalkCompare`):**
   - Sutton & Barto `4 × 12` Cliff Walking (`220` episodes, `α = 0.40`, `ε = 0.10`, `20` seeds, cliff `-100` + reset).
   - Q-Learning greedy path return `-13` (cliff-edge) vs SARSA greedy path `-17` (safe upper route).
   - Online exploration mean over last 50 episodes: Q-Learning `-43.7` vs SARSA `-25.4`.
5. **`#ch5` Policy Gradient & Baselines (`policyGradientLab`):**
   - 4 stochastic actions (`means = [11.0, 12.2, 14.5, 11.8]`, `N = 10` per batch): subtracting batch-mean baseline keeps gradient unbiased while lowering gradient norm std from `3.54` to `0.38` (`85.3×` variance reduction).
6. **`#ch6` Actor–Critic, PPO & GRPO (`ppoObjectiveLab`, `grpoCompare`):**
   - Clipped ratio band `[0.80, 1.20]` at `ε = 0.20`, k3 KL estimator `r - 1 - log r`.
   - Simplified BF16+AdamW training memory on a `7B` model: `224 GB` (PPO: trainable Actor + Critic + frozen Ref + Reward) vs `112 GB` (GRPO with rule/verifier rewards: `50%` reduction).
7. **`#ch7` Planning & Self-Play (`mctsSearch`, `minimaxOracle`):**
   - Live 3×3 Tic-Tac-Toe (`DEFAULT_TTT_BOARD = [1, -1, 0, 0, -1, 0, 0, 0, 1]`): at `budget = 15` (`16` nodes) MCTS picks suboptimal `#6`; at `budget = 250` (`106` nodes) MCTS locks onto Minimax-optimal `#8`.
8. **`#ch8` Reward Hacking & Goodhart's Law (`rewardHackingGrid`):**
   - 6-state track (`Goal +10` true, farmable proxy coin at `#2`, step `-0.2`, `γ = 0.92`): critical coin threshold `0.83`.
   - At `coin = 1.20`: agent farms `28` coins in an infinite loop (`proxyReturn = +27.6`), collapsing true objective return from `+9.0` to `-6.0`; `klReg = 0.60` raises threshold and restores true return `+9.0`.
9. **`#ch9` Frontier (as of `2026-11-11`):**
   - Interactive regime selector (`llmMath`, `robotics`, `boardGame`, `openChat`) + dated research status cards separating Established / Debated / Demonstrated / Open + 5 verification questions.

## Primary Sources (Verified 2026-11-13)

- DeepSeek-R1 (2025-01-22): `arXiv:2501.12948` — https://arxiv.org/abs/2501.12948
- DeepSeekMath / GRPO (2024-02-05): `arXiv:2402.03300` — https://arxiv.org/abs/2402.03300
- PPO (2017-07-20): `arXiv:1707.06347` — https://arxiv.org/abs/1707.06347
- AlphaZero (2017-12-05): `arXiv:1712.01815` — https://arxiv.org/abs/1712.01815
- RLVR Implicit Reasoning / CoT-Pass@K (2025-06-17): `arXiv:2506.14245` — https://arxiv.org/abs/2506.14245
- Sim-to-Real Humanoid Locomotion in 15 Minutes (2025-12-01): `arXiv:2512.01996` — https://arxiv.org/abs/2512.01996
- Sim-to-Real Vision-Based Dexterous Manipulation (2025-02-27): `arXiv:2502.20396` — https://arxiv.org/abs/2502.20396
- Monitoring Reasoning Models & CoT Obfuscation (2025-03-14): `arXiv:2503.11926` — https://arxiv.org/abs/2503.11926
- Reward Hacking in the Era of Large Models (2026-04-15): `arXiv:2604.13602` — https://arxiv.org/abs/2604.13602
- Sutton & Barto, *Reinforcement Learning: An Introduction* (2nd ed., Cliff Walking Example 6.6).

## Facts That Will Go Stale

- Chapter 9 frontier cards and regime tags reflect benchmarks and papers verified as of `2026-11-11`. Re-check `RLVR` capability boundaries (`CoT-Pass@K` debate), sim-to-real training wall-clock records, and CoT monitorability mitigations on future updates.

## Checked / Not Checked

- Checked: `models.js` numeric consistency against all prose figures; key/placeholder/HTML-tag/cross-link parity between `copy.zh.js` and `copy.en.js`; zero CJK outside `copy.zh.js` and `<title>`/`<meta description>`/`#langZh`.
- Pending coordinator Playwright lock (port `19021`): browser smoke tests across `1280/390/320`, zh/en switching, reduced motion, hit target `>= 48px`, WCAG contrast, and `tests/canvas-text-overlap.cjs --sweep`.

## Missing Prerequisites in Repo

- None required to read the essay: links cleanly to `markov-chains`, `expected-value`, `gradient-descent`, `game-theory`, `numbers-lie/#c9`, and `what-a-frontier-model-takes/#ch6`.
