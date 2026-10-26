# Browser harness corrections

First run stopped because Playwright Locator has no isFocused method. Replaced only that assertion with document.activeElement equality. This was a test harness failure, not evidence of a runtime defect. Offline source is verified through file:// with local scripts, rather than assuming HTTP browser cache.
