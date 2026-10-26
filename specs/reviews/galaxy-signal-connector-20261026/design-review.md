# Galaxy → signal station: bounded independent design gate

**Proceed. P0 none; the state/focus conditions below are required.** Read actual Galaxy detail/save/read/popstate lifecycle and Atlas language/save/render ownership. No browser or product edits. This is a connector, not a new graph or lesson model.

The gap is concrete: Galaxy already selects the four concepts and opens their original sources, but does not expose the newly accepted task route at that same concept. One secondary native link is sufficient. Derive membership from the actual signal trail's nodes **and** stationTasks; show it only for a valid matching station. Retain the existing lesson href and label. Name the new action “Explore this concept on the signal route” (or equivalent), not “completed”, “next required lesson” or a substitute source. No duplicate station data or four-ID whitelist is needed.

Target `./?trail=signal&node=<validated current ID>&view=list&lang=<validated current language>#route-task-title` is appropriate: the current station, not station1, opens in the existing route host. Use URL/URLSearchParams or proper encoding. Keep ordinary concepts and missing task data CTA-free. No arbitrary href, raw query or script is accepted from user input.

## State boundaries that must survive implementation

- Before native navigation, replace the **current** Galaxy entry using existing save/snapshot semantics; merge foreign history fields, preserve node/from/q/group/low and capture the current camera. Do not push an extra origin entry, reset the camera, clear filters, remount the renderer, or preventDefault. Keyboard Enter and ordinary link behavior remain native. Modifiers/new-tab behavior need not become a custom router.
- Valid `lang=zh|en` takes precedence over storage/browser at arrival. Invalid hints must be ignored, never reflected into UI or persisted as a third locale. Existing no-hint URLs retain their former preference behavior. Save helpers preserve only a valid hint when one is present; ordinary actions must not silently drop it.
- A connector activation explicitly adds/refreshes the current Galaxy entry's language hint before leaving, so blocked-storage Back/refresh can recover it. Subsequent explicit-language toggles update that same entry/hint (replace, not another history step). Merely opening a legacy no-hint page must not manufacture a URL hint.
- **Popstate must reread a valid URL language hint**, not only node/filter state. Both current apps keep locale in a closure; initializing it once is insufficient when returning between same-document entries with different explicit hints. Preserve legacy behavior when the restored entry has no hint. bfcache and forced reconstruction should agree for this supported connector path.
- Arrival must make the current route heading visible and keyboard-reachable/focused as appropriate for this explicit deep link. The h3 is created dynamically; do not assume a raw fragment always produces usable focus. Verify actual activeElement and bounding box. Keep unrelated/invalid hashes and legacy Atlas URLs unchanged.
- History/storage rejection should remain nonfatal. If camera/history cannot be written, report/test graceful best effort rather than claiming guaranteed full recovery. Existing lesson language/control/audio recovery is **not** extended to every course: this hint contract connects Galaxy and Atlas; LTI audio still stops on leaving and never autoplays on Back.

## Minimum acceptance

All four current nodes open their exact route task; ordinary nodes have no false CTA; original source links are byte-for-byte unchanged. Exercise actual WebGL and low-power modes, changed camera + from/q/group/low, native Enter/click, course-independent Back and forced reload; compare state and language. Test explicit EN/ZH hints against conflicting/blocked storage, valid-hint same-document Back, invalid hints, and normal no-hint URLs. At320px/200% check target focus visibility,48px action and3px focus, EN/ZH wrapping. No mastery/profile, graph counts/relations, storage key, new service or new model.

Updating the Galaxy spec/provenance around this additive connector is appropriate. Deployment remains outside this review and subject to the parent’s approval boundary. No public403 retry or broader audit is needed.
