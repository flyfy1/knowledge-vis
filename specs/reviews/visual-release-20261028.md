# Visual release handoff — 2026-10-28

## Published scope

The local `main` checkout was clean before publishing and contained the accepted Codex
iterations for Knowledge Galaxy, power converters, photosynthesis and frozen bubbles. The
push advanced `origin/main` from `92c17050` to `54bad475` without force-push. The published
runtime changes are represented by these implementation commits:

- `a55f5635`, `9e13e1a4`: Galaxy fallback/list connection behavior and its verified handoff.
- `69635b28`: converter power-feedback explanation and responsive reservation.
- `4365b674`: photosynthesis observation-to-ledger bridge.
- `9dc17374`: frozen-bubble paper-condition-to-A/B observation bridge.

The intervening commits are page specs, tests, worklogs and handoff metadata for those same
iterations. No unrelated working-tree changes, credentials, paid services or security settings
were included.

## Deployment

Target: Pi host `songyy-pi`, `/home/songyy/projects/visual-site/`, served by the active
`visual-site.service` (`python3 -m http.server 18513 --bind 127.0.0.1`). The Cloudflare tunnel
already routes `visual.integ.life` to that service. Deployment used an explicit rsync file list
for the four page runtime assets, without `--delete`; tests, specs, evidence and local secrets
were not copied, and the service did not require a restart.

Post-sync SHA-256 checks matched the local files for the deployed markers:

```text
atlas/galaxy.html          6d19c049baa205be8e4aac663f4c84857973f58c5077ae27f7ed9b1d513cff54
atlas/galaxy/app.mjs       d5f2928a7841fbc35736d8090d6c0322db11ba8d9632101f87ca3d932c083658
power-converters/app.js    a6d3fc05cc762f5b3750f12d7e9738e0a92b7213ae8b097a17629da06c025128
photosynthesis/index.html  6bffc3f3a48eff59cbf401f0c0d8370ddb651add8154e68b7f3e8dae956a3655
photosynthesis/i18n.js     52e57ac4af49a02403475793c229dfd281b85e42d207c8be46060ec93e8f3534
frozen-bubble/index.html   171f7e756900ad3edfec94f1e46c2e58fb895d3ae29d200534d507c84bba7b1f
frozen-bubble/i18n.js      c8a4d59206341ba1f4b99e8f65034c7fd8323e4212a7db3c086e16864eb44eaa
```

## Online smoke

At `https://visual.integ.life` a Playwright Chrome smoke opened all four routes with HTTP 200,
no page errors and no failed requests:

- `/atlas/galaxy.html`: concept list rendered and the Knowledge Galaxy title was present.
- `/power-converters/`: 6 V feedback said current rises; 24 V feedback said current falls.
- `/photosynthesis/`: six sections and `#s1-bridge` rendered; the oxygen bet became correct.
- `/frozen-bubble/`: `#research-bridge` rendered in English and switched to the Chinese copy.

The smoke is a production-edge check from this Mac and is not a physical-phone, Safari,
screen-reader or independent learner study. Those remain the only material manual validations
outstanding. The deployed static service is active; no service restart, credential creation,
permission change or paid resource was used.
