# Browser harness corrections (author self-check)

First run reached fallback EN copy/readback, then failed seeding the Chinese test sentinel because the test itself had replaced writeText with a rejecting stub. Corrected the harness to retain and call the original native writer for sentinel setup. No product change was needed for copying.

Second run passed source transfer in both locales then asserted anchor geometry 180ms after a smooth-scroll click, before the scroll settled. Captured geometry top=-4693, nav=74 is retained in harness-anchor-timing-failure.txt. Replaced the fixed delay with a wait for target geometry, preserving the actual geometry assertion.

Source inspection during testing also found the planned #305 related link has no built lesson in this checkout. Product link changed to the existing #675 BFS step2 with equivalent bilingual label; all final browser tests are rerun on this revised candidate.

Third run passed native source transfer and settled anchors, then the test’s PREVIEW URL constant (originally named URL) shadowed the built-in URL constructor during related-link checks. Renamed that test constant; recorded the original exception in harness-url-shadowing-failure.txt.
