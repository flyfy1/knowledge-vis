# Author browser harness corrections

Initial run stopped at browser.cjs line 12 on the second locale: it expected
Reveal disabled despite having deliberately preserved a selected answer from English.
Runtime correctly preserved prediction state. Harness now asserts disabled only
on the fresh first locale and enabled on the second. No runtime change for this result.

Second run passed layout/copy paths then stopped at sticky-anchor geometry
(top 521.94 after 300ms): smooth scrolling was still in progress. The harness now
uses the supported reduced-motion media state for stable anchor geometry; runtime
styles remain unchanged. Initial CDP scale captures did not demonstrate layout
magnification reliably, so they are replaced by real CSS zoom=2 screenshots,
explicitly labeled as page magnification rather than native browser chrome zoom.

Third run reached the offline check: reloading the HTTP preview while disconnected
failed with ERR_INTERNET_DISCONNECTED because the static server does not provide
an offline HTTP cache. No service worker is part of this lesson. Corrected the
check to the actual supported offline-opening contract: file://index.html with
network disabled, exact source text and working local simulation. This does not
claim offline HTTP navigation or a PWA.

One console 404 was localized to the pre-existing /favicon.ico request after
navigating to #23. Lesson #871 declares a data favicon and has no asset failures.
The harness retains the exact diagnostic and excludes only that unrelated
favicon on a non-871 page; all own lesson errors still fail the check.
A later transient browser closure interrupted one attempt before layout checks;
no pass was claimed for that attempt. Final complete run is browser-result.json.

Final local refinement: mobile scenario select fills available stage width,
adding margin beyond the conservative arrow/text budget. The fit record now
separates viewport width from control width (previous spread overwrote width).
No previously independently reviewed candidate was modified by these author fixes.
