# Exact repaired #782 Mac regression

Candidate: `efa6a0356f63e851c594c346dd2ec07b644655e7`. This supplemental dispatcher verification is separate from independent review. All 189 exported files stayed byte-identical; no added candidate files. The original check.py, core.cjs, browser.cjs and focused.cjs are unchanged from the failing candidate `0e53a2131353accc11a5ef746c5eba164efb14e4`; no assertion was weakened.

All six commands passed: metadata preflight, canonical Python (704 boards), core (3291 frames), complete original browser suite, focused geometry, and new selected-label regression. The browser suite now reaches its later layout, contrast, network, offline and blocked-storage assertions as well as bilingual interactions, exact source transfers and native Meta+C fallback with fresh verified non-source sentinels. Actual host is Darwin. See results/782/browser.json for bounded evidence.

The targeted selector check covers all seven presets in EN→ZH→EN at 320px with the original 20px arrow allowance. Inspected the closed English and Chinese failure-label screenshots: full labels and the impossible-result −1 are visible. English repaired text is `Four-corner failure: −1`, with approximately 34.65px spare in the unchanged 210px text budget. Original red evidence remains retained. CSS zoom checks are not native browser-menu zoom or physical-device claims.

Evidence: [receipt and screenshots](782-evidence/mac-repaired-candidate-20261025/). The latest independent review `782-review-2-4f9587dd.md` completed before this evidence was available and therefore kept 782-MAC-FIT-01 open. Preserve its historical outcome. Supply this actual repaired-candidate Mac proof to the normal fix and fresh review sequence; do not overwrite review results or infer publication from local checks.

Built-By: Codex dispatcher (exact model identity unavailable), evidence only.
Verified-By: dispatcher execution of unchanged tests and selected-control screenshot inspection; independent closure reported separately.
