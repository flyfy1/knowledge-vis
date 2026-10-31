# Second #1001/#1012 launch refusal

At 2026-10-26 00:17:13 UTC, the read-only preflight succeeded, but the explicit frozen identity comparison rejected the launch before transfer. Central had naturally advanced from `854-review-dcc68f3629c0` / `b3336f7d` to `882-review-c3e4588f50e6` / `faff333c35e1e553e787762361d5febd048a19c1`.

HEAD, run, session and native PID differed. BASE, runner PID and the prior handoff receipt still matched. No launcher was transferred or executed, no reservation or STOP was created, and zero lane workers were spawned. No retry or repinning occurred. This refusal is separate from the earlier immutable refusal in the parent directory.

`preflight.json.gz` preserves complete read-only stdout; `preflight-summary.json` omits only the repeated full prior handoff receipt. `comparison.json` is the explicit comparison result. The observation is a dated snapshot, not a claim about subsequent central progress.
