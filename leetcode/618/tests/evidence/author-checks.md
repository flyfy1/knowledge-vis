# #618 author access checks

Date: 2026-10-25. Author self-check only; no independent acceptance.

- Official URL opened using the web tool: premium subscription gate; extraction
  saved in `../../provenance/official-page-access.txt`.
- First ordinary public GraphQL POST using Python requests: HTTP 200,
  `content: null`, `codeSnippets: null`; metadata identifies paid Hard #618.
- Initial capture-script run using Python urllib: HTTP 403, no usable capture.
  Switched to the same ordinary requests client used for the first successful
  public check; no credentials, challenge solving or alternate content source.
- `OUTPUT_DIR=leetcode/618/tests/evidence python3 -B leetcode/618/tests/check_official_access.py`:
  exit 0; HTTP 200; fresh exact response and UTC timestamp saved alongside this
  file. Both official statement and submission interfaces remain unavailable.
- From repository root:
  `python3 -B scripts/register_leetcode_lesson.py 618 --validate-only`:
  exit 2, `Metadata validation failed: [Errno 2] No such file or directory:
  '/home/songyy/projects/leetcode-hard-campaign-20261018/leetcode/618/lesson-entry.json'`.
  This is expected for an access-blocked, unimplemented lesson; preflight does
  not pass. No metadata is fabricated to clear it.

Not performed: algorithm/runtime tests, browser interaction/layout/contrast
checks, source parity, independent review or publication. There is no runnable
lesson candidate because its official contract cannot be verified.

Next required input: an authorized official statement capture and complete
official language-selector/submission-interface capture. Retain #618 in scope.
