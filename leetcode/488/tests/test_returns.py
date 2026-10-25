"""488-R1: verify the rendered worked branches against actual Python returns."""
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
copy = json.loads((ROOT / 'copy.js').read_text().removeprefix('window.COPY = ').strip().removesuffix(';'))
keys = ['returnTitle', 'returnFailure', 'returnSibling', 'returnMinimum']
html = (ROOT / 'index.html').read_text()
for key in keys:
    assert key in copy and f'data-i18n="{key}"' in html, ('missing rendered return bridge', key)

scope = {}
exec(compile((ROOT / 'solution.py').read_text(), str(ROOT / 'solution.py'), 'exec'), scope)
events = []
def trace(frame, event, arg):
    if frame.f_code.co_name == 'solve' and frame.f_code.co_filename == str(ROOT / 'solution.py'):
        state = (frame.f_locals['row'], frame.f_locals['remaining'])
        if event == 'return':
            events.append({'event': 'return', 'state': state, 'value': arg})
        if event == 'line' and state == ('RBBR', 'BR') and 'after' in frame.f_locals:
            events.append({'event': 'parent', 'state': state, **{k: frame.f_locals[k] for k in ['gap', 'after', 'rest', 'best']}})
    return trace
sys.settrace(trace)
try:
    answer = scope['Solution']().findMinStep('RBBR', 'BR')
finally:
    sys.settrace(None)
assert answer == 2
returns = [(tuple(e['state']), e['value']) for e in events if e['event'] == 'return']
for expected in [(('BRBBR', 'R'), 6), (('', ''), 0), (('RR', 'R'), 1), (('RBBR', 'BR'), 2)]:
    assert expected in returns, expected
for gap, after, best in [(0, 'BRBBR', 6), (1, 'RR', 2)]:
    assert any(e['event'] == 'parent' and e['gap'] == gap and e['after'] == after and e['best'] == best and e['rest'] == 'R' for e in events)
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'return-results.json').write_text(json.dumps({'finding': '488-R1', 'status': 'pass', 'answer': answer, 'returns': [e for e in events if e['event'] == 'return'], 'parentUpdatesVerified': True}, indent=2) + '\n')
print('488-R1 actual recursive returns and parent updates passed.')
