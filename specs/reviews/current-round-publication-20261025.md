# User-requested current-round publication — 2026-10-25

Published successfully at https://visual.integ.life/?category=leetcode. The user explicitly requested one combined publication after this round, overriding the normal 100-lesson threshold for this release only. Existing launcher policy remains unchanged.

## Released content

16 new lessons: **736, 741, 745, 749, 753, 757, 761, 765, 768, 770, 773, 778, 780, 782, 803, 805**. Also refreshed the independently reviewed **239** runtime. The publisher selected 17 entries by reviewed runtime/metadata digest, not by subtracting counts.

The public catalog contains **120 lessons**: 119 campaign-released lessons and the existing #2916 lesson. This is a completed round, not completion of the 984-problem catalog. #782's Mac clipping finding and #803's narrow CSS-zoom clipping finding are closed in their fresh independent reviews. Final scores for #782/#803/#805 are 96.25/96.25/91.25; zero required findings remain. Original failed review evidence is retained.

## Source and verification

- Frozen campaign source: `e64356fbeaa7fb1c8793d1a8febcac4ae8e9e394`, pushed to `codex/all-hard-20261018`.
- Main integration: `0963f311`, pushed. Exact accepted lesson files: #782 183, #803 103, #805 50. Tested runtime/dependency hashes remain identical. Existing unrelated working-tree changes were preserved.
- Release ID: `b045af6e30a64e1fa2557bad275f79a2`. 133 staged files and **135 public files including shared dependencies** passed SHA-256 verification. All **17** ordinary-URL course pages passed the publisher browser gate, both locales, with numbered headings and official links. No ignored beacon failures. Ledger pending is null; all release staging directories were removed after success. No old served-content backups were created.
- Additional ordinary public homepage checks passed for all 17 entries in EN/ZH: exact ID search, clear numbered headings, local course links and official links (34 observed states). Clicking a newly published course reached #803. Screenshots at 390px were saved and the Chinese result inspected.
- Reloaded the actual existing in-app browser tab: `120 / 120` courses, including #782/#803/#805. The approved direct-list root HTML and unrelated pages.config.js hashes are unchanged. Ordinary root URL bytes match the approved source, without cache busting.

## Workflow boundary and limitations

The finite `--run-count 1` runner completed #782's review and registration and exited as `run_limit_reached`, current=null. Both accepted isolated lanes were imported with original author/reviewer ancestry and fingerprints preserved. The owned STOP remains, and the already-paused campaign goal was not automatically resumed for new problems. Publication operated from this frozen boundary under the existing locks and ledger.

The initial import staging whitespace check flagged accepted #805 CSS trailing whitespace and Markdown hard breaks. Those byte-identical accepted files were preserved; the bounded exceptions and passing check on all other staged files are recorded in import-whitespace.json. No runtime assertion or frozen source was weakened.

Mac browser evidence uses actual native Meta+C transfers. #803 required an external test-only host adapter because its original test hardcoded Linux Control+C; its original failure is preserved and not mislabeled as a pass. CSS zoom and desktop browser inspection do not claim physical-phone, native menu-zoom, human comprehension or LeetCode judge validation.

[Release receipt, exact selection, integration and public evidence](releases/current-round-20261025/).

Built-By: gpt-6.1-sol campaign authors; deterministic importer/registry/publisher; Codex dispatcher (exact dispatcher model unavailable).
Verified-By: separate campaign reviewers, independent helper/host-proof reviewers, dispatcher Mac tests and public verification gates.
