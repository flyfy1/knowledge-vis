# Read-only publication preflight — 2026-10-25

Scope: the already-public collection and already-released #60 only. No release
was staged, no production file changed, and no acceptance/release count advanced.
This is preparation for the next batch, not evidence that unreleased lessons
are public or that a future release has passed.

Mac curl retrieved normal `/leetcode/` and `/leetcode/60/` URLs with HTTP200.
The #60 HTML equals the current accepted source; the collection remains the
older served release, as expected before the new collection ships.

An initial Pi Python urllib request to `/leetcode/` returned HTTP403. That is
preserved as a diagnostic failure, not proof of publisher failure or of public
unavailability. No root cause for this request difference was established.
The actual publisher uses curl plus Chromium, so those exact boundaries were
then exercised instead of changing the application or weakening verification.

On Pi, the publisher's curl flags (`--fail --silent --show-error --location`,
no-cache header) returned exact production bytes for both HTML index paths,
with and without the publisher's `?release=<digest-prefix>` query. The four
SHA-256 comparisons all pass. This curl preflight used index-file paths; the
original urllib diagnostic used the collection directory URL.

Finally invoked the existing read-only `leetcode_publish._verify_public` with
those two production HTML hashes and the existing #60 entry. Its unmodified
Chromium check passed: collection card and official link, real lesson navigation,
both heading translations and official links, populated content, and resource
completion/error checks. It navigates the normal collection and lesson directory
URLs. Result: `lessons=1`, `ignoredKnownBeaconFailures=0`.

Evidence: `leetcode-publication-preflight-20261025/` contains Mac page metadata,
Pi curl hash comparisons and the exact public-verifier result. No old served
page copies are committed. This sample establishes that the existing publisher
verification path is currently usable for these released pages. The complete
next payload must still pass its own hashes and browser checks at publication.
