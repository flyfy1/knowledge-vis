# Author self-check — #124

Candidate is ready for a separate review; it is not independently accepted. No submission, registration, publication, or deployment was performed. Only leetcode/124/ was authored.

Official Python3 interface verified in tests/evidence/official.json: `Solution.maxPathSum(self, root: TreeNode | None) -> int`. The capture records the full observed selector catalog. Canonical code uses an iterative postorder stack, preserves the input tree, and avoids Python recursion-depth limits.

Executed checks:

- Python versus independent all-start route oracle: 11,496 exhaustive shape/value cases, 350 seeded cases, both official examples; positive and negative chains of 30,000 nodes and a 30,000-node balanced tree. Exact offline source parity and unchanged input values/child identities passed.
- Simulator versus the oracle: 11,848 fixtures and 70,198 frames. Checked downward gain, highest-node path candidates, completed-child dependencies, cumulative best, and deterministic snapshots.
- Actual Chromium: both locales; six presets; forward/back/reset/end and slider endpoints; root changes including −10 and 10; all quiz options, reveal, changed choice, and trace/locale independence; real clipboard copy and denial fallback; actual downloads, displayed source and original byte parity; storage denial; offline display; keyboard/focus; table scrolling; internal anchors and existing related targets. No page, console, network asset errors or external runtime requests.
- Responsive captures: English and Chinese at 320, 390, 736 and 1440 widths, and CSS 200% zoom. Inspected focused 320/390/desktop tree captures in both locales plus English/Chinese zoom captures. Inspected narrow full-lesson and lab captures for text wrapping, control sizing and contained table overflow. Tall element screenshots may include a sticky navigation overlay from capture scrolling; separate `*-tree.png` captures deliberately position the entire diagram below it. Gain labels were moved into node boxes after inspection to remove edge/text collisions; preset labels were shortened to fit native mobile selectors.
- Rendered contrast: body 16.09:1, explanatory copy 12.62:1, hint copy 7.74:1, node text 13.40:1, node status and disabled control text 6.45:1, primary action 13.10:1. Focus outline is 3px with 4px offset; its measured contrast against both dark surfaces exceeds 3:1. Controls are at least 48px high; language controls are at least 48px wide. Shared and local CSS total 11,701 bytes. No runtime images, fonts, or external assets.
- JavaScript syntax, metadata shape, concept anchors, and Python mirror checked. Metadata retains the title without an ID prefix; the heading shows #124 and a separate official link.

Evidence: tests/evidence/numerical.json, browser.json, official.json, screenshots and actual source downloads. Reproduction commands and OUTPUT_DIR behavior are documented in tests/README.md. hashes.json identifies the shipped candidate and test sources.

Limits: headless Chromium on this host, CSS zoom rather than browser toolbar zoom, no real phone or assistive-technology session, no novice teach-back, no independent review, and no accepted LeetCode submission. No claimed learning outcome or production validation.
