"""Capture public official access only. Override evidence output with OUTPUT_DIR."""
import datetime
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

out = Path(os.environ.get('OUTPUT_DIR', Path(__file__).parent / 'evidence'))
out.mkdir(parents=True, exist_ok=True)
query = '''query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug difficulty isPaidOnly content exampleTestcases sampleTestCase metaData codeSnippets { lang langSlug code } } }'''
body = {'query': query, 'variables': {'titleSlug': 'game-play-analysis-v'}}
(out / 'graphql-request.json').write_text(json.dumps(body, indent=2) + '\n')
requests = [
    ('official-page', 'https://leetcode.com/problems/game-play-analysis-v/', None),
    ('official-graphql', 'https://leetcode.com/graphql/', json.dumps(body).encode()),
]
records = []
for label, url, data in requests:
    req = urllib.request.Request(url, data=data, headers={
        'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json',
    })
    record = {
        'url': url, 'method': req.get_method(),
        'accessedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'credentials': 'none; public unauthenticated request',
    }
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            raw = response.read()
            record.update(status=response.status, headers={k: v for k, v in response.headers.items() if k.lower() not in ('set-cookie', 'cookie', 'authorization')})
    except urllib.error.HTTPError as error:
        raw = error.read()
        record.update(status=error.code, headers={k: v for k, v in error.headers.items() if k.lower() not in ('set-cookie', 'cookie', 'authorization')})
    except Exception as error:
        raw = b''
        record['error'] = str(error)
    (out / (label + '.response')).write_bytes(raw)
    record['responseFile'] = label + '.response'
    records.append(record)
    print(label, record.get('status'), record.get('error'), len(raw))
(out / 'official-access.json').write_text(json.dumps(records, indent=2) + '\n')
