"""Verify ordinary static URLs and actual bilingual version/legacy navigation."""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / 'scripts'))
from leetcode_publish import BROWSER_CHECK

parser = argparse.ArgumentParser()
parser.add_argument('--base', required=True)
parser.add_argument('--manifest', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
manifest = json.loads(args.manifest.read_text())
base = args.base.rstrip('/')
args.output.mkdir(parents=True, exist_ok=True)
started = time.time()


def verify(pair):
    path, expected = pair
    result = subprocess.run(['curl', '--fail', '--silent', '--show-error', '--location',
                             '--max-time', '45', '--retry', '2', base + '/' + path],
                            capture_output=True, timeout=150)
    digest = hashlib.sha256(result.stdout).hexdigest()
    return path, {'sha256': digest, 'expected': expected,
                  'ok': result.returncode == 0 and digest == expected,
                  'error': result.stderr.decode(errors='replace')[:500] if result.returncode else None}

results = {}
with ThreadPoolExecutor(max_workers=12) as pool:
    futures = [pool.submit(verify, pair) for pair in manifest['files'].items()]
    for future in as_completed(futures):
        path, result = future.result()
        results[path] = result
        if len(results) % 200 == 0:
            print(json.dumps({'hashes_checked': len(results), 'total': len(futures)}), flush=True)
report = {'base': base, 'ordinary_urls': True, 'source_revision': manifest['source_revision'],
          'results': dict(sorted(results.items())), 'seconds': time.time() - started}
(args.output / 'http.json').write_text(json.dumps(report, indent=2) + '\n')
failures = [p for p, item in results.items() if not item['ok']]
if failures:
    raise SystemExit('HTTP verification failed: ' + ', '.join(failures[:15]))
print(json.dumps({'hashes_passed': len(results), 'browser': 'starting'}), flush=True)
result = subprocess.run(['node', '-e', BROWSER_CHECK,
                         json.dumps({'base': base, 'entries': manifest['entries']})],
                        capture_output=True, text=True, timeout=2400)
(args.output / 'browser.json').write_text(json.dumps({'exit_code': result.returncode,
    'stdout': result.stdout, 'stderr': result.stderr, 'lessons': len(manifest['ids']),
    'ordinary_version_urls': True, 'encoded_query_fragment_legacy_routes': True}, indent=2) + '\n')
if result.returncode:
    raise SystemExit(result.stderr)
print(result.stdout.strip(), flush=True)
