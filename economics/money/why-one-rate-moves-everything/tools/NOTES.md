# tools/

`build-data.cjs` is the generator for `../data.js`. Its header lists the 21 FRED series ids and the rule that turns
each into a shipped array.

```sh
node tools/build-data.cjs --fetch /tmp/agent-tasks/<task>/fred    # download (curl) from fred.stlouisfed.org/graph/fredgraph.csv?id=<ID>
node tools/build-data.cjs --check /tmp/agent-tasks/<task>/fred    # rebuild and compare with data.js
node tools/build-data.cjs --write /tmp/agent-tasks/<task>/fred    # overwrite data.js
```

Record (2026-11-18): downloads made on 2026-11-18 with the default `--asof 2026-11-06` reproduce the shipped
`data.js` byte for byte (`--check` prints "identical byte for byte"). The first build used downloads of
2026-11-11; `--asof` is the last observation date taken from the daily and weekly series (THREEFYTP10, WALCL,
ECBASSETSW), which is what makes a later download give the same part-month values for 2026-11.

To refresh the data: raise `END_Q`, `END_M`, `CURVE_DATES`, `DEBT_Q` and the `--asof` / `--retrieved` /
`--verified` stamps, run `--write`, then update the dated block in `models.js`, the pins in `tests/models.cjs`
and the "Data" section of BRIEF.md.

`bey.cjs` and `patch_data.cjs` are the two scratch scripts of the 2026-11-18 finishing pass (they read a `./fred`
directory that was never in the repo and rebuilt only `spread.s`). `build-data.cjs` replaces both; they are kept
only because the completing reviewer was not allowed to delete files, and can be removed.
