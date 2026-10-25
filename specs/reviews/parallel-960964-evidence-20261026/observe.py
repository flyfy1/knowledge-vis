"""Read-only census; verifies live process ancestry and fresh author events."""
import datetime, hashlib, json, os, pathlib, subprocess
root = pathlib.Path('/home/songyy/projects')
central_state = root/'leetcode-hard-campaign-state-20261018'
processes = {}
for pr in pathlib.Path('/proc').iterdir():
    if not pr.name.isdigit():
        continue
    try:
        args = [x.decode(errors='replace') for x in (pr/'cmdline').read_bytes().split(b'\0') if x]
        status = dict(line.split(':', 1) for line in (pr/'status').read_text().splitlines())
        processes[int(pr.name)] = dict(argv=args, ppid=int(status['PPid']))
    except (FileNotFoundError, ProcessLookupError):
        pass
campaign_pids = [pid for pid, x in processes.items() if any(a.endswith('/scripts/leetcode_campaign.py') for a in x['argv'])]
assert len(campaign_pids) == 3, campaign_pids
lanes = []
for ident in ['960', '964']:
    reservation = json.loads((central_state/f'lane-{ident}-reservation.json').read_text())
    state = pathlib.Path(reservation['state_dir'])
    p = json.loads((state/'progress.json').read_text())
    current = p['current']
    run = next(r for r in p['runs'] if r['id'] == current['run_id'])
    events_path = pathlib.Path(run['directory'])/'events.jsonl'
    events = []
    for line in events_path.read_text().splitlines():
        try:
            e = json.loads(line)
        except ValueError:
            continue
        if e.get('type') in ['thread.started', 'turn.started']:
            events.append(e)
    runner = reservation['runner_pid']
    children = []
    for pid, info in processes.items():
        ancestor = info['ppid']
        seen = set()
        while ancestor in processes and ancestor not in seen and ancestor != runner:
            seen.add(ancestor)
            ancestor = processes[ancestor]['ppid']
        if ancestor == runner and info['argv'] and info['argv'][0].endswith('/codex') and '/vendor/' in info['argv'][0]:
            children.append(dict(pid=pid, ppid=info['ppid'], executable=info['argv'][0]))
    assert runner in campaign_pids and len(children) == 1, (runner, children)
    assert os.getpriority(os.PRIO_PROCESS, runner) >= 10
    assert p['queue'] == [ident] and current['stage'] == 'author'
    assert any(e.get('type') == 'thread.started' for e in events)
    assert any(e.get('type') == 'turn.started' for e in events)
    assert '--publish-root' not in processes[runner]['argv']
    lanes.append(dict(id=ident, runner_pid=runner, native_codex=children, current=current, events=events, events_bytes=events_path.stat().st_size, events_mtime=events_path.stat().st_mtime, argv=processes[runner]['argv'], nice=os.getpriority(os.PRIO_PROCESS, runner)))
central = json.loads((central_state/'progress.json').read_text())
print(json.dumps(dict(observed_at=datetime.datetime.now(datetime.timezone.utc).isoformat(), campaign_pids=campaign_pids, lanes=lanes, central_current=central['current'], central_head=central['expected_head'], STOP_exists=(central_state/'STOP').exists(), loadavg=pathlib.Path('/proc/loadavg').read_text().strip(), mem_available=next(line for line in pathlib.Path('/proc/meminfo').read_text().splitlines() if line.startswith('MemAvailable:'))), indent=2))
