# Root integration: independently repaired 239

Accepted candidate: `e0f51bb5f022702e7eea2ff108ee1fe99077a7fe`.
Central accepted history: `8e2d9fffcf6dd48385c6dd7d4907806a5efe012b`.
Independent review: [239-review-3-d9c54776.md](239-review-3-d9c54776.md),
95/100, no required open findings. The earlier rejected review and evidence remain
unchanged. Its required highlight finding 239-R2-01 and original public title
finding 239-PUB-R1 are explicitly closed against the new candidate.

Confirmed causes: localized title copy omitted the ID; separately, renderTrace
passed the processed right endpoint to a helper expecting a window's left edge.
The repair gives the actual H1 a number, derives left=max(0,i-k+1), and represents
empty, partial and full processed intervals explicitly. Dynamic reasons and the
baseline boundary explanation were also clarified and independently rechecked.

After merging accepted history, all 91 tracked lesson files matched the exact
candidate before and after Mac checks. Non-mutating registration preflight passed.
The unchanged Python test, core test, rendered-membership test, title/source test
and trace-copy test all passed. Browser coverage includes 242 frame checks,
320/390/736/1280 membership layouts, 320/390/736/1440 title layouts, both locales,
rewind/reset, and source transfer including the host-appropriate Meta+C fallback.
The tests used a disposable localhost server and Chromium on macOS; outputs were
outside the frozen lesson. The initial sandbox denied local socket binding before
any check ran; the same script then ran with authorized local network access.

Inspected the saved English 320px title and Chinese 390px middle-state images:
the numbered heading wraps completely and the visible processed interval agrees
with its readout. CSS layout zoom in the test is not browser-toolbar zoom. These
are integration checks, not another scored review or public release receipt.

Evidence: [mac-repair-e0f51bb-20261025](239-evidence/mac-repair-e0f51bb-20261025/).
The 100-lesson release still awaits 262's repair and full public verification.
