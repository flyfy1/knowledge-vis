# Public release 84dfd908 — 2026-10-26

The normal campaign publisher completed release `84dfd908f5c94592918eb4ecb72eb87e` at **2026-10-25 21:51:41.057626 UTC**, from revision `7fd4aa457c318f053d7dc722fd63b3012bccb838`.

The batch contains 20 independently accepted lesson updates: **780, 793, 798, 801, 810, 815, 818, 827, 828, 829, 834, 839, 843, 847, 850, 960, 968, 972, 975, 980**. The frozen receipt binds 311 staged files and 313 public-file hashes. The unchanged publisher saves successful completion only after public byte verification and browser validation. Its browser result records **20 lessons**, zero ignored legacy beacon failures, **60 specifically recognized Cloudflare RUM requests**, and zero retired redirect documents. The RUM count does not excuse unrelated asset failures.

This was observed through the existing runner, not manually triggered: pending was first observed at21:50:57; a child curl process was checking public bytes at21:51:10. The completed ledger then cleared pending and contains **138 released lesson IDs** (20 batch updates are not 20 additional unique IDs;780 already had a release). Every batch acceptance binding matches the final ledger. No release failure, restart, STOP, import, manual publication, or push was performed by this monitor.

At21:52:18, runner1696215 remained alive and had naturally started `854-author-679ce856a357`, session `01a1750c-4a1a-7c02-a106-9269fa0e867f`. Central HEAD/expected_head remained the released revision, STOP was absent, and the temporary release stage had been removed. Both843 and850 were `accepted_local`.

The terminal release ledger SHA256 is `163b32ba940e02a8f17c1ccaf5e9a9f6dfcd606491007d096faa9b971b45eda6`. Runtime publisher SHA256 remains `7292c88e2ae035667a1bc723b076fb3d8d3d8562dc8428f3f66f74dc60f764d8`.

[Archived evidence](leetcode-release-84dfd908-20261026/): exact release receipt, compressed full ledger and campaign state, terminal observation, and artifact hashes. This reports the publisher's actual completed public verification; it does not claim a second independent browser sweep by this monitor. The bounded next-batch monitoring task is complete.

## Additional root public-browser check

After publication, root used a fresh background in-app-browser tab at the normal URL `https://visual.integ.life/?category=leetcode`, without cache-busting parameters. The collection displayed 139 available lessons, including the original #2916. Searching `#843` produced exactly one card whose title and start link both led directly to `/leetcode/843-codex/`, with the corresponding official LeetCode link.

Root followed that link and observed the visible #843 title, official problem link, and the complete adjacent scenario readout. Selecting the 22-word budget-10 control, advancing to its final round, then switching to English preserved the state: ten completed calls, one remaining candidate `bmmmmm`, and “Simulation budget exhausted; not successful.” The complete English scenario description remained present. This is a focused interaction check of the actual public route, not another 20-page sweep, narrow-viewport test, or clipboard check. The old ambient category tab was absent; the existing user-owned #780 tab was left untouched.
