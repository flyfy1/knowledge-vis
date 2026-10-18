# Official LeetCode Hard inventory

`hard-problems.json` is a metadata snapshot of every row marked
`difficulty.level == 3` in LeetCode's public, unpaginated
[all-problems response](https://leetcode.com/api/problems/all/).
`id` is the public frontend problem number, not the internal question ID.
Entries are sorted by that number and retain premium problems via `paidOnly`.
`categories` records membership in individually checked public category
endpoints; it does not infer a category from the title or problem number.

## Snapshot evidence

On 2026-10-18 UTC, the endpoint returned **4,086** rows, exactly matching its
`num_total`. All frontend IDs and slugs were unique. The strict Hard filter
returned **984** problems: **789 free**, **195 premium**, and **0 hidden**.
The JSON records the fetch timestamp, source count, returned count, response
byte length, and SHA-256 of the raw response.

At this snapshot, `leetcode/problems.config.js` registered 11 lessons:
4, 10, 23, 25, 30, 32, 37, 41, 42, 44, and 2916. All match the official Hard
inventory, leaving 973 Hard problems without a registered lesson. The first
10 missing IDs are 51, 52, 60, 65, 68, 76, 84, 85, 87, and 115.
This is a registry comparison, not a claim that those 11 lessons were audited
or that every unregistered problem lacks work elsewhere in the repository.

## Verified category scope

The source explicitly returns `category_slug: "all"`. Separate anonymous fetches
of the following category endpoints confirm that this is not algorithms-only:

| Category | Returned / declared rows | Hard | Hard absent from `all` |
| --- | ---: | ---: | ---: |
| algorithms | 3,668 / 3,668 | 912 | 0 |
| database | 323 / 323 | 66 | 0 |
| shell | 4 / 4 | 0 | 0 |
| concurrency | 9 / 9 | 0 | 0 |
| javascript | 67 / 67 | 6 | 0 |
| pandas | 341 / 341 | 66 | 0 |

The category Hard union is exactly the same 984 IDs as `all`; all shared IDs
agree on difficulty and slug. Pandas and Database share all 66 Hard problems,
so their counts must not be added. Every `all` row occurs in at least one of
these category endpoints. Pandas additionally exposes three non-Hard IDs
(6933, 100046, 100190) absent from `all`; this endpoint discrepancy does not
change the verified Hard union. Category timestamps, totals, hashes, and
membership are included in the JSON to make these claims auditable.

All-Hard scope includes six JavaScript-specific problems (2630, 2650, 2675,
2691, 2756, 2759) and 66 database problems. A future lesson plan must preserve
their actual language/API contracts: runnable Python solutions cannot be
claimed to satisfy JavaScript APIs or SQL tasks simply by translating syntax.

## Refresh

From the repository root, run the following with Python 3 and curl. This uses
an anonymous public request; it does not read account cookies or credentials.
The assertions reject an incomplete response or duplicate identifiers before
writing the catalog. Re-run the registry comparison and update the evidence
paragraph after refreshing; counts and classifications can change.

```sh
curl --fail --silent --show-error --location --max-time 60 \
  'https://leetcode.com/api/problems/all/' \
  -o /tmp/knowledge-vis-leetcode-all.json || exit 1
for category in algorithms database shell concurrency javascript pandas; do
  curl --fail --silent --show-error --location --max-time 60 \
    "https://leetcode.com/api/problems/$category/" \
    -o "/tmp/knowledge-vis-leetcode-$category.json" || exit 1
done
python3 - <<'PY'
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

raw_path = Path("/tmp/knowledge-vis-leetcode-all.json")
raw = raw_path.read_bytes()
source = json.loads(raw)
rows = source["stat_status_pairs"]
assert source["category_slug"] == "all"
assert len(rows) == source["num_total"], "Incomplete source response"
assert len({r["stat"]["frontend_question_id"] for r in rows}) == len(rows)
assert len({r["stat"]["question__title_slug"] for r in rows}) == len(rows)
assert all(r["difficulty"]["level"] in (1, 2, 3) for r in rows)
hard = [r for r in rows if r["difficulty"]["level"] == 3]
category_names = ("algorithms", "database", "shell", "concurrency", "javascript", "pandas")
category_evidence = []
membership = {}
category_hard_ids = set()
source_by_id = {r["stat"]["frontend_question_id"]: r for r in rows}
for category in category_names:
    category_path = Path(f"/tmp/knowledge-vis-leetcode-{category}.json")
    category_raw = category_path.read_bytes()
    category_source = json.loads(category_raw)
    category_rows = category_source["stat_status_pairs"]
    assert category_source["category_slug"] == category
    assert len(category_rows) == category_source["num_total"]
    category_ids = {r["stat"]["frontend_question_id"] for r in category_rows}
    assert len(category_ids) == len(category_rows)
    hard_ids = {r["stat"]["frontend_question_id"] for r in category_rows if r["difficulty"]["level"] == 3}
    category_hard_ids.update(hard_ids)
    for row in category_rows:
        frontend_id = row["stat"]["frontend_question_id"]
        membership.setdefault(frontend_id, []).append(category)
        if frontend_id in source_by_id:
            original = source_by_id[frontend_id]
            assert original["difficulty"] == row["difficulty"]
            assert original["stat"]["question__title_slug"] == row["stat"]["question__title_slug"]
    category_evidence.append({
        "category": category,
        "source": f"https://leetcode.com/api/problems/{category}/",
        "snapshotAt": datetime.fromtimestamp(category_path.stat().st_mtime, timezone.utc).isoformat(),
        "sourceTotalCount": category_source["num_total"],
        "sourceReturnedCount": len(category_rows),
        "hardCount": len(hard_ids),
        "hardIdsAbsentFromAll": sorted(hard_ids - source_by_id.keys()),
        "nonHardIdsAbsentFromAll": sorted(category_ids - hard_ids - source_by_id.keys()),
        "sourceResponseSha256": hashlib.sha256(category_raw).hexdigest(),
    })
assert category_hard_ids == {r["stat"]["frontend_question_id"] for r in hard}, "Reconcile category Hard union before publishing"
assert set(source_by_id) <= set(membership), "Review unclassified source rows"
problems = []
for row in hard:
    stat = row["stat"]
    frontend_id = stat["frontend_question_id"]
    assert isinstance(frontend_id, int), "Review unexpected nonnumeric ID"
    assert isinstance(row["paid_only"], bool)
    slug = stat["question__title_slug"]
    problems.append({
        "id": frontend_id,
        "slug": slug,
        "title": stat["question__title"],
        "paidOnly": row["paid_only"],
        "officialUrl": f"https://leetcode.com/problems/{slug}/",
        "categories": membership[frontend_id],
    })
problems.sort(key=lambda p: p["id"])
catalog = {
    "schemaVersion": 1,
    "snapshotAt": datetime.fromtimestamp(raw_path.stat().st_mtime, timezone.utc).isoformat(),
    "source": "https://leetcode.com/api/problems/all/",
    "sourceScope": {
        "categorySlug": source["category_slug"],
        "verifiedCategoryEndpoints": list(category_names),
        "categoryHardUnionMatchesAll": True,
        "categoryUnionCoversAllRecords": True,
        "categoryMembershipMeaning": "Presence in the named public category endpoint; categories may overlap",
    },
    "categoryEvidence": category_evidence,
    "sourceTotalCount": source["num_total"],
    "sourceReturnedCount": len(rows),
    "sourceResponseSha256": hashlib.sha256(raw).hexdigest(),
    "sourceResponseBytes": len(raw),
    "difficultyFilter": {"field": "difficulty.level", "equals": 3},
    "totalCount": len(problems),
    "freeCount": sum(not p["paidOnly"] for p in problems),
    "paidOnlyCount": sum(p["paidOnly"] for p in problems),
    "hiddenHardCount": sum(bool(r["stat"]["question__hide"]) for r in hard),
    "problems": problems,
}
output = Path("leetcode/catalog/hard-problems.json")
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n")
print({k: v for k, v in catalog.items() if k != "problems"})
PY
```

For a current registry comparison, run:

```sh
node - <<'JS'
const fs = require('fs');
const vm = require('vm');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync('leetcode/problems.config.js', 'utf8'), context);
const registered = context.window.LEETCODE_PROBLEMS.map(p => p.id);
const {problems} = JSON.parse(fs.readFileSync('leetcode/catalog/hard-problems.json', 'utf8'));
const hard = new Set(problems.map(p => p.id));
const invalid = registered.filter(id => !hard.has(id));
if (invalid.length) throw new Error(`Registered IDs absent from Hard inventory: ${invalid}`);
const registeredSet = new Set(registered);
const missing = problems.filter(p => !registeredSet.has(p.id));
console.log({registered, missingCount: missing.length, firstMissing: missing.slice(0, 10)});
JS
```

## Limits

Completeness means complete relative to `all` at fetch time, reconciled with
the Hard union of the six explicitly checked category endpoints. It does not independently prove that the endpoint exposes every
problem across LeetCode regions, private collections, or unreleased contests.
The endpoint is not a versioned API contract; upstream changes require review.
Premium metadata is included, but problem statements and locked content were
not fetched. This inventory is a planning input, not a lesson completion list.
