"""Copy contract: unique keys, [zh, en] nonempty pairs, every key used by index.html/app.js exists, no unused keys.

Usage: python3 -B leetcode/<id>/tests/test_copy.py
"""
import json
import re
from pathlib import Path

LESSON = Path(__file__).resolve().parents[1]
text = (LESSON / 'copy.js').read_text()


def unique(pairs):
    out = {}
    for k, v in pairs:
        assert k not in out, 'Duplicate copy key: ' + k
        out[k] = v
    return out


copy = json.loads(text[text.index('{'):text.rindex('}') + 1], object_pairs_hook=unique)
for key, value in copy.items():
    assert isinstance(value, list) and len(value) == 2 and all(isinstance(x, str) and x for x in value), key
    zh, en = value
    assert re.findall(r'\{(\w+)\}', zh) and sorted(re.findall(r'\{(\w+)\}', zh)) == sorted(re.findall(r'\{(\w+)\}', en)) \
        or not re.findall(r'\{(\w+)\}', zh + en), 'placeholder mismatch: ' + key
html = (LESSON / 'index.html').read_text()
app = (LESSON / 'app.js').read_text()
used = set(re.findall(r'data-i18n="(\w+)"', html)) | set(re.findall(r"(?<![\w.])t\('(\w+)'(?!\s*\+)", app))
missing = sorted(k for k in used if k not in copy)
assert not missing, missing
dynamic = set(re.findall(r"'(\w+)'", app)) | {'docTitle'}  # runtime-chosen keys appear as literals; docTitle is read by ../common.js
prefixes = re.findall(r"t\('(\w+)'\s*\+", app)
unused = sorted(k for k in copy if k not in used and k not in dynamic and not any(k.startswith(p) for p in prefixes))
assert not unused, unused
print(f'{len(copy)} unique bilingual pairs; {len(used)} referenced directly; placeholders consistent')
