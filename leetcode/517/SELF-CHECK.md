# Author self-check — candidate 517-author-v1

Recorded 2026-10-25T00:35:44.341833+00:00. This is an author check, not independent acceptance, novice testing, a LeetCode submission result, or public delivery.

Official statement/interface: public GraphQL HTTP 200; exact response and Python3 stub retained in provenance/. Direct page HTTP 403 capture is also retained. The web reader independently exposed the official statement. The faithful preferred Python3 interface was observed, so no non-Python language exception applies.

Checks run from the repository root:

- `python3 -B leetcode/517/tests/test_solution.py`: PASS, 415 independent BFS comparisons (exhaustive count values 0..3 for lengths 1..4, plus 75 seeded cases), 415 checks of the visible baseline, 3 legal hand-schedule transitions, and 11 official/large-boundary cases. Input mutation checked.
- `node leetcode/517/tests/test_core.cjs`: PASS, 415 oracle comparisons and 856 intermediate frame checks; 92 bilingual string pairs; no duplicate copy keys; exact offline Python source parity.
- `node leetcode/517/tests/browser.cjs`: PASS, actual Chromium; both locales, all six presets, all endpoints, rewind/replay, range, prediction/reveal/change, locale preservation, actual clipboard readback, full manual fallback selection, downloaded-source equality, denied storage, source available after going offline, keyboard focus, internal/deep links and local requests. No page or asset errors.
- `node leetcode/517/tests/accessibility.cjs`: PASS, visible interactive targets at least 48px in both locales; reduced-motion scrolling is auto; keyboard-triggered forced-colors focus retains a solid 3px outline. The inherited official-link 44px specificity was corrected locally.
- `python3 -B scripts/register_leetcode_lesson.py 517 --validate-only`: PASS, exit 0, stdout/stderr empty. Exact command, cwd and timestamp are in tests/evidence/metadata-preflight.json. No registration was run.

Shared + local CSS: 11,496 bytes (<25,000). Measured rendered palette pairs:

| Role | Contrast |
| --- | --- |
| body | 16.09:1 |
| muted panel | 7.08:1 |
| muted stage | 6.45:1 |
| accent panel | 11.97:1 |
| selected | 13.10:1 |
| focus stage | 8.94:1 |
| disabled text | 7.08:1 |

Visual inspection: English/Chinese scan screenshots at 320/390/736/1440, both 200% layout zoom screenshots, hand-transfer histories, and both phone headers and the forced-colors screenshot were opened and inspected. Machine cards reflow without shrinking their labels; current/processed/pending have text as well as borders. Formula renders the full max and prefix sum in both locales. The [0,3,0] trace ends with cut balance 0 and final answer 2 while retaining the earlier sender bottleneck. A phone navigation-label overlap found during self-check was fixed with nonshrinking scrollable links; the browser regression checks link geometry. Preset labels were shortened to fit native phone selects. Table columns scroll within a labeled region; the numeric readout gives the full current transition without requiring table scrolling. Element screenshots hide sticky navigation only during capture to avoid a capture-position overlay; ordinary header screenshots retain navigation.

Evidence boundary: 200% uses real Chromium CSS layout zoom, not an OS or physical-device measurement. Clipboard denial is deliberately injected. Offline evidence verifies the embedded source after loading; no service-worker/PWA is claimed. No real-device, screen-reader-user, actual novice, independent teaching-review, deployment, or LeetCode-acceptance evidence exists. Independent review is the next stage. The approved shared lesson design is reused; no shared asset/registry/campaign file was changed.

Candidate identity: tests/evidence/candidate-manifest.json hashes all lesson files present at freeze except itself. Tests accept LESSON_OUTPUT_DIR so reviewers can rerun without overwriting these frozen artifacts. Metadata fixes, if later requested, must produce a new candidate for review; no historical review was changed.
