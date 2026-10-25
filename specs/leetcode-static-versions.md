# Static LeetCode version routes

Owner-approved scope, 2026-10-25: make Codex authorship visible in the URL through real static pages, suitable for any static host. Do not add attribution badges or an SPA. Keep existing numbered headings, official links, bilingual teaching, search and counts.

## Design adjudication and implementation brief

Independent review: `reviews/leetcode-static-versions-design-review-20261025.md`.
Adopt its deterministic publication builder, unchanged accepted source/runtime bytes, physical generated directories, preserved legacy assets and query/fragment redirects, explicit provenance, independent validation, and paused campaign boundary. No new CSS or design tokens: existing root/collection tokens and layout remain unchanged.

Generate a derived `problems.codex.config.js` with `path` changed from `<id>/` to `<id>-codex/`. Keep `problems.config.js` numeric in source and production. All other fields remain identical. Generated root and collection HTML reference the derived filename, while source previews use the original. This also keeps cached old root HTML working: its strict numeric validator continues to receive the numeric registry. The derived file is build output, not a second authoring manifest; no extra runtime request or variant framework is introduced. Source fingerprints and historical release receipts retain their original meaning; a separate migration receipt records generated hashes without changing the current canonical registry hash. Both migration and ordinary publisher use the same builder interface. Root validation accepts only the exact numeric source path or exact Codex destination for that ID. Canonical source previews keep numeric paths; generated previews have real Codex directories. Ready Claude versions can be registered in a later reviewed change; untracked files are not readiness evidence and must remain untouched.

The user is comparing independently authored explanations. The smallest useful result is that opening and sharing every currently published Codex lesson exposes its creator in the path, without changing its content. This belongs to the existing static collection and publication adapter, not a separate product. The builder earns its locality by owning the path transform and compatibility documents for both migration and future releases.

Build runtime files into real sibling directories, preserving bytes and relative depth. Retain numeric assets; replace only deployed numeric index documents with fixed sibling `location.replace` navigation carrying search/hash. Include bilingual fallback links; without JavaScript the fallback cannot retain arbitrary query/fragment automatically. Preserve every accepted numeric source tree. Do not discover, edit or deploy unrelated Claude files. Keep old pending-release replay compatible. The owner subsequently updated the active goal to continuous work with publication every 20 acceptances; resume only after this routing migration and new publisher adoption pass verification.

Validation: copied-byte parity, rejected unsafe paths, source registry immutability, future publication and old pending compatibility, query/hash and index.html redirects, bilingual pages, official links, downloads, cross-lesson navigation, collection search and narrow viewport. Publish version assets before redirects/discovery. Verify actual ordinary public destinations and generated hashes, and record cache limitations truthfully.

## Static export and hosting

Build from a reviewed, pushed revision into an empty directory outside the checkout:

```sh
python3 scripts/build_leetcode_static.py --repo "$PWD" --revision HEAD --output /tmp/leetcode-static-export
```

The output is an overlay for the existing static site. `static-manifest.json` lists exactly which files belong to it, their hashes, and the original runtime hashes. Overlay those files onto the site's existing static artifact before uploading it to GitHub Pages or copying it to the current Pi static host. Do not upload the manifest, tests, authoring evidence, or arbitrary untracked source directories. The builder does not change the hosting provider or require rewrite rules. Use an existing reviewed site artifact for unrelated homepage assets such as `pages.config.js`; they are intentionally outside this overlay.

The public `*-codex/index.html` files contain the same lesson bytes as their numeric source versions. The numeric public `index.html` files are compatibility navigation documents. Use the same builder module in ordinary campaign publication so later releases cannot silently restore the old layout. Future ready Claude artifacts can occupy their own physical sibling paths without changing this static hosting contract.
