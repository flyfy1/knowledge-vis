# Native Mac repair verification — #691

Frozen repair: `c7b80d70cc4c8c4614eb1e3c5ef8d942a2cbe5fc`.
Original: `d567dd00bc05b3a4f86493dc28149d1fe3235660`.
Independent required finding R691-01 matches dispatcher finding 691-MAC-01.
This is supplemental repair verification; independent closure remains pending.

Confirmed cause: the longest English selected label exceeded native text space,
hiding its meaning/result. The only runtime changes shorten it to “15-letter
target · −1” and update the copy-asset query. The input readout still exposes the
full target/stickers and the impossible case; no mathematical case was removed.
Canonical Python, core, application, CSS and shared files remain unchanged.

The unchanged original Mac probe now passes all 28 preset/locale/width records.
English preset 6 at 320/390 measures 155.173583984375px against 217px content
space. Its original 320px label measured 291.44561767578125px against 230px;
original ordinary screenshots show clipping at both 320 and 390. The native
control's intrinsic width changes with the shorter option, without a CSS change.
The zero-arrow measurement is necessary only. Inspected new ordinary control
screenshots at both widths show the complete label, −1 and clear native arrow.

The unchanged focused selected-label test passes 56 observations: every preset,
both locales, 320/390/1440 and 640 at CSS zoom:2, plus event 3, locale roundtrip
and impossible endpoint. Inspected English 320px event-3 roundtrip and Chinese
closed-label captures show full selected text/result and preserved state. The
focused test's 20px reserve is a recorded diagnostic, not a universal arrow
measurement or a substitute for actual screenshot inspection.

The original broad browser suite passes again. The unchanged supplemental
fallback probe separately verifies a distinct non-source sentinel before actual
Mac Meta+C and exact source readback in both languages. The focused rendered
state test also passes: at tiny event 28, sticker a returns child b=1, candidate
2 versus best 1, with 29 history entries including event zero. Rewind/replay,
formula operands and prediction feedback invalidation remain correct.

All 195 exported tracked files match immutable Git bytes before and after five
passing commands. Outputs stayed outside the frozen candidate, with separate
subdirectories to preserve every result. Numeric suites were not repeated since
canonical/core bytes were unchanged from the previously tested candidate.
Original red results remain intact; no assertion was weakened or source edited
during this Mac run. CSS remains 11,725 bytes.

Evidence: `691-evidence/mac-repair-c7b80d7-20261025/`, containing receipts, original
command log, probes, results, inspected screenshots and hashes. Browser tests
use viewport emulation and CSS layout zoom; no physical device, browser-chrome
zoom, judge submission or public-delivery claim follows. A new independent
review must judge the repair and close the required finding.
