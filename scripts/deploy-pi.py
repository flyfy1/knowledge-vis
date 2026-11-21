#!/usr/bin/env python3
"""Publish a clean, pushed main revision with site-wide GA injection."""
import json
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]

def run(*args, **kwargs):
    return subprocess.run(args, cwd=ROOT, check=True, **kwargs)

def output(*args):
    return subprocess.check_output(args, cwd=ROOT, text=True).strip()

def main():
    if output('git', 'status', '--porcelain', '--untracked-files=no'):
        raise SystemExit('Commit tracked changes before publishing.')
    run('git', 'fetch', 'origin', 'main')
    revision = output('git', 'rev-parse', 'HEAD')
    if revision != output('git', 'rev-parse', 'origin/main'):
        raise SystemExit('Publish only the current pushed origin/main revision.')
    for args in [('scripts/build-pages.cjs', '--all', '--check'),
                 ('scripts/build-registry.cjs', '--check'),
                 ('scripts/build-pagefind-index.cjs', '--check'),
                 ('tests/page-provenance-core.cjs',), ('tests/google-analytics.cjs',)]:
        run('node', *args)
    tasks = pathlib.Path('/tmp/agent-tasks')
    tasks.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='visual-publish-', dir=tasks) as directory:
        # Export only committed files. Uncommitted drafts never enter the release.
        archive = subprocess.Popen(['git', 'archive', 'HEAD'], cwd=ROOT, stdout=subprocess.PIPE)
        excluded = ['.github', 'node_modules', '.agent', '.runs', 'worklog', 'specs', 'docs', 'tests', 'evidence', 'provenance', 'platform-shots', 'platform-review-shots']
        try:
            subprocess.run(['tar', '-x', '-C', directory, *['--exclude=' + item for item in excluded]], stdin=archive.stdout, check=True)
        finally:
            archive.stdout.close()
        if archive.wait() != 0:
            raise SystemExit('Git archive failed; nothing published.')
        run('node', 'scripts/inject-google-analytics.cjs', directory)
        pathlib.Path(directory, 'analytics-release.json').write_text(json.dumps({'revision': revision, 'measurementId': 'G-LPRZ9XLGWX'}) + '\n')
        # Preserve independently managed assets; no deletion or service restart is required.
        run('rsync', '-a', directory + '/', 'songyy-pi:/home/songyy/projects/visual-site/')
    print('Published visual.integ.life at ' + revision)

if __name__ == '__main__':
    main()
