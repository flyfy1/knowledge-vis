# Official page access observation

Access date: 2026-10-25 (Asia/Singapore).
Source: https://leetcode.com/problems/shortest-distance-from-all-buildings/
Method: normal web open, no credentials, no bypass.

Visible official page text:

> Subscribe to unlock.

> To view this question you must subscribe to premium.

The browser extraction exposed navigation tabs but no statement, constraints,
worked example outputs, or language selector/interface. The public GraphQL
capture in official-graphql.json independently records content and codeSnippets
as null. Available sample inputs and metaData do not establish the missing contract.

An initial standard-library urllib request returned HTTP 403. A normal requests
POST returned HTTP 200; its actual JSON is retained. No authenticated access was
attempted, and no credentials were inspected.
