# LTI audio — Codex fallback-continuity iteration (2026-10-28)

## Scope and selection

This iteration selected LTI because the user specifically asked whether the page really plays
sound under browser autoplay policy and whether its fallback is accessible. The existing audio
implementation and tests already proved real user-triggered Web Audio behavior; this iteration
addresses the remaining JavaScript-disabled presentation gap without changing the signal or
audio model.

Repository: `/Users/songyy/Documents/projects/knowledge-vis`, remote remains
`git@github.com:flyfy1/knowledge-vis.git`, branch `main`. The checkout was clean before this
iteration. No unrelated files, credentials, permissions or deployment state were changed.

## Baseline evidence

- `node --check lti/app.js audio.js audio-model.js i18n.js` — pass.
- `node lti/tests/audio-model.cjs` — pass: 2,956,536 recurrence comparisons across 66 parameter
  values and 3 systems; peak, tail, frequency-response and invalid-input checks pass.
- Local `LTI_BASE_URL=http://127.0.0.1:18921 ... node lti/tests/audio-browser.cjs` — pass: no
  context before a gesture, native running context after Play, progress, Stop/disposal,
  same-position output updates, volume bounds, finite end cleanup, navigation/background/reload
  disposal, OfflineAudioContext rendering, denied/late/interrupted/unsupported recovery and
  mobile touch/focus/forced-color checks.
- The same audio-browser suite against `LTI_BASE_URL=https://visual.integ.life` — pass with no
  page errors or failed requests. Human hearing, physical audio hardware and independent learner
  study remain explicitly unverified.
- A JavaScript-disabled local probe showed the concrete gap: the audio status text was empty
  while the playback controls still looked enabled; the existing noscript copy was below the
  panel.

## Change

The audio status now has a static localized idle message in the HTML, so the user sees the
gesture requirement before the first script update. The button row and volume/progress controls
are marked as audio controls. When JavaScript is disabled, an in-place bilingual `noscript`
branch hides those inert controls and explains that enabling JavaScript plus an explicit Play
click is required; the surrounding lesson remains readable. Web Audio construction, scheduling,
gain, model mapping, lifecycle and automatic-play policy are unchanged.

## Verification

- `node --check lti/app.js audio.js audio-model.js i18n.js` — pass.
- `node lti/tests/audio-model.cjs` — pass.
- Updated `tests/audio-browser.cjs` — pass locally and against `https://visual.integ.life`:
  initial idle status, native user-gesture playback, lifecycle/fallback matrix, mobile controls,
  and JavaScript-disabled status/control visibility all pass.
- The scoped LTI provenance check — pass: the static header, inventory entry and implementation
  commit all match. The broader `tests/page-provenance-core.cjs` remains a pre-existing repository
  blocker: it hard-codes 23 pages while `page-provenance.json` already contains 26 (`26 !== 23`)
  before this iteration; unrelated inventory entries were left untouched.
- `git diff --check` — pass.

The browser evidence uses installed desktop Chrome and mobile viewport/touch emulation; it does
not claim a human heard the rendered WAV or validate physical phones, Safari, screen-reader
speech or independent learning outcomes.

## Local handoff

- Implementation commit: `295e8349` (`Clarify LTI audio fallback`).
- Provenance commit: `7000e70c` (`Refresh LTI fallback provenance`); pushed to `origin/main`
  without force-push. The remote `main` tip is `7000e70c` at the time of deployment.
- Deployment target: `songyy-pi:/home/songyy/projects/visual-site/`, served by the active
  `visual-site.service`. An explicit, no-`--delete` rsync transferred only
  `lti/index.html`, `lti/app.js`, `lti/audio.js`, `lti/audio-model.js`, `lti/i18n.js` and
  `lti/style.css`. Local and remote SHA-256 values matched for all six files.
- Online evidence: `https://visual.integ.life/lti/` returned HTTP 200. The full
  `LTI_BASE_URL=https://visual.integ.life node lti/tests/audio-browser.cjs` suite passed with
  no page errors or failed requests, including user-gesture native AudioContext playback,
  stop/disposal, navigation/background cleanup, unsupported/denied/late/interrupted recovery,
  mobile touch/focus checks, and the new JavaScript-disabled idle-status/hidden-controls
  fallback. The deployed page exposes edition `codex-lti-audio-20261028` and source
  revision `295e8349`.
- Remaining limits are unchanged: the global provenance inventory check still has its existing
  `26 !== 23` blocker, which was not changed or included in this release; physical hearing,
  phones, Safari, screen-reader speech and independent learning outcomes remain unverified.
- Built-By attribution follows the repository rule; exact task model identifier is unavailable.
