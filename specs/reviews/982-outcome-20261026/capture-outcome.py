"""Read-only exact-review archive. Execute on Pi with python3 -B; writes stdout only."""
import base64, datetime, gzip, hashlib, json, pathlib, subprocess
repo = pathlib.Path('/home/songyy/projects/leetcode-hard-lane-982-20261026')
state = pathlib.Path('/home/songyy/projects/leetcode-hard-lane-state-982-20261026')
run_id = '982-review-7c751ff0e6a4'
candidate = '71cac9c38ae78f8ec6a477ca05c7781ab9377fd2'
raw = (state / 'progress.json').read_bytes()
p = json.loads(raw)
r = next(r for r in p['runs'] if r['id'] == run_id)
assert r['candidate'] == candidate and r['status'] == 'completed', r
run = pathlib.Path(r['directory'])
final = json.loads((run / 'final.json').read_bytes())
report = final['report_path']
assert report.startswith('specs/reviews/982-review-')
evidence = repo / 'specs/reviews/982-evidence' / pathlib.Path(report).stem

def git(*args):
    return subprocess.check_output(['git', '-C', str(repo), *args])

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

files = {'progress.json': raw, pathlib.Path(report).name: (repo / report).read_bytes()}
for f in evidence.rglob('*'):
    if f.is_file():
        files['review-evidence/' + str(f.relative_to(evidence))] = f.read_bytes()
for name in ['solution.py', 'lesson-entry.json', 'BRIEF.md']:
    files[name] = git('show', candidate + ':leetcode/982/' + name)
files['review-final.json'] = (run / 'final.json').read_bytes()
files['review-prompt.md'] = (run / 'prompt.md').read_bytes()
events = (run / 'events.jsonl').read_bytes()
files['review-events.jsonl.gz'] = gzip.compress(events, mtime=0)
commands, thread_events = [], []
for line in events.splitlines():
    e = json.loads(line)
    if e['type'] in ['thread.started', 'turn.started', 'turn.completed', 'turn.failed']:
        thread_events.append(e)
    item = e.get('item', {})
    if e['type'] == 'item.completed' and item.get('type') == 'command_execution':
        commands.append(item)
live = []
for proc in pathlib.Path('/proc').iterdir():
    if not proc.name.isdecimal():
        continue
    try:
        args = [x.decode() for x in (proc / 'cmdline').read_bytes().split(b'\0') if x]
        if str(repo / 'scripts/leetcode_campaign.py') in args or (args and '/bin/codex' in args[0] and str(repo) in args):
            live.append({'pid': int(proc.name), 'args': args})
    except OSError:
        pass
assert (state / 'progress.json').read_bytes() == raw
out = {'observedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
       'readOnly': True, 'state': p, 'run': r, 'final': final, 'candidate': candidate,
       'head': git('rev-parse', 'HEAD').decode().strip(),
       'dirty': git('status', '--porcelain', '--untracked-files=all').decode(),
       'candidateLessonTree': git('rev-parse', candidate + ':leetcode/982').decode().strip(),
       'currentLessonTree': git('rev-parse', 'HEAD:leetcode/982').decode().strip(),
       'reportPath': report, 'reportSha256': sha(files[pathlib.Path(report).name]),
       'eventsSha256': sha(events), 'threadEvents': thread_events,
       'commands': commands, 'liveRunnerOrNative': live,
       'manifest': {name: {'sha256': sha(data), 'bytes': len(data)} for name, data in files.items()},
       'filesBase64': {name: base64.b64encode(data).decode() for name, data in files.items()}}
print(json.dumps(out))
