#!/usr/bin/env python3
"""Build an allowlisted static LeetCode overlay from an exact Git revision.

The caller establishes that registry rows are ready Codex lessons. Source trees
stay numeric; output contains physical version directories and legacy redirects.
Apply only manifest.files to an existing static site. This is not an SPA server.
"""
import argparse
import json
from pathlib import Path
import re
import tempfile

from leetcode_publish import _asset_refs, _git, _lesson, _registry_at, _safe, _sha, _tracked_bytes
from leetcode_static_versions import BUILDER_VERSION, codex_discovery, codex_registry, codex_runtime


def build(repo, revision, output):
    repo, output = Path(repo).resolve(), Path(output).resolve()
    if output.is_relative_to(repo) or (output.exists() and any(output.iterdir())):
        raise ValueError('Use an empty output directory outside the source checkout')
    revision = _git(repo, 'rev-parse', revision + '^{commit}')
    with tempfile.TemporaryDirectory() as temporary:
        rows = _registry_at(repo, revision, Path(temporary))
    derived = codex_registry(rows)
    payload, source_hashes = {}, {}
    for row in rows:
        pid = str(row['id'])
        runtime = _lesson(repo, revision, pid)
        source_hashes[pid] = {path: _sha(data) for path, data in runtime.items()}
        payload.update(codex_runtime(pid, runtime))
    payload['leetcode/problems.config.js'] = _tracked_bytes(repo, revision, 'leetcode/problems.config.js')
    codex_bytes = ('/* Generated Codex routes. Edit the canonical registry and rebuild. */\nwindow.LEETCODE_PROBLEMS = ' + json.dumps(derived, ensure_ascii=False, indent=2) + ';\n').encode()
    payload['leetcode/problems.codex.config.js'] = codex_bytes
    for path in ('index.html', 'leetcode/index.html'):
        data = codex_discovery(_tracked_bytes(repo, revision, path))
        data = re.sub(rb'problems\.codex\.config\.js\?v=[^"\']+',
                      b'problems.codex.config.js?v=' + _sha(codex_bytes)[:12].encode(), data)
        payload[path] = data
    # Keep the narrow dependency graph, not authoring tests or unrelated drafts.
    pending = [p for p in payload if p.startswith('leetcode/')]
    checked = set()
    while pending:
        path = pending.pop()
        if path in checked:
            continue
        checked.add(path)
        for dependency in _asset_refs(payload[path], path):
            if dependency not in payload:
                payload[dependency] = _tracked_bytes(repo, revision, dependency)
                pending.append(dependency)
    output.mkdir(parents=True, exist_ok=True)
    for path, data in payload.items():
        target = _safe(output, path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    manifest = {'version': 1, 'builder': BUILDER_VERSION, 'source_revision': revision,
                'builder_sha256': _sha(_tracked_bytes(repo, revision, 'scripts/leetcode_static_versions.py')),
                'ids': [row['id'] for row in rows], 'entries': derived,
                'source_runtime': source_hashes,
                'files': {path: _sha(data) for path, data in sorted(payload.items())}}
    (output / 'static-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path.cwd())
    parser.add_argument('--revision', default='HEAD')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = build(args.repo, args.revision, args.output)
    print(json.dumps({'revision': result['source_revision'], 'lessons': len(result['ids']),
                      'files': len(result['files']), 'output': str(args.output.resolve())}))
