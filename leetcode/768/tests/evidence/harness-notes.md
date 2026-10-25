# Author harness corrections

Initial numerical run: duplicate-key scanner asserted too few matches because its regex matched only a line's first entry while copy.js also has several entries per line. Changed scanner to inspect every unquoted object-property position; source unchanged. Subsequent numerical test passed.

Initial browser run: assertion at test_browser.cjs line 61 checked fallback hidden immediately after initiating an asynchronous clipboard operation. The preceding actual fallback Control+C readbacks passed in zh and en. Changed assertion to await the hidden state after the write promise resolves. No runtime change. Original failure: `AssertionError [ERR_ASSERTION]: false == true` on `assert.ok(await page.locator('#sourceFallback').isHidden())`.

Browser found an actual UI failure: page overflow at 320px/en, long related-concept anchor boxes ended at x=389.03 and x=348.45 on a 320px page. Retained `overflow-320-en-before.png`. Fixed locally by constraining related links to max-width:100% with word wrapping. Asset revision 768-2. No numerical code change. Full browser rerun required.
