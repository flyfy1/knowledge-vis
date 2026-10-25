"""Static translation, official-interface, source and baseline checks."""
from pathlib import Path
from html.parser import HTMLParser
import importlib.util
import json
import os
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get('OUTPUT_DIR', ROOT / 'tests/evidence'))
OUT.mkdir(parents=True, exist_ok=True)


def unique_pairs(pairs):
    result = {}
    for key, value in pairs:
        assert key not in result, ('duplicate translation key', key)
        result[key] = value
    return result


class SourceParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.capture = False
        self.source = ''
        self.keys = []
        self.ids = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'data-i18n' in attrs:
            self.keys.append(attrs['data-i18n'])
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'code' and attrs.get('id') == 'baselineSource':
            self.capture = True
    def handle_data(self, data):
        if self.capture:
            self.source += data
    def handle_endtag(self, tag):
        if tag == 'code':
            self.capture = False


copy = (ROOT/'copy.js').read_text().removeprefix('window.COPY = ').strip().removesuffix(';')
pairs = json.loads(copy, object_pairs_hook=unique_pairs)
assert all(isinstance(v, list) and len(v) == 2 and all(isinstance(s, str) and s for s in v) for v in pairs.values())
parser = SourceParser()
parser.feed((ROOT/'index.html').read_text())
assert len(parser.ids) == len(set(parser.ids))
assert all(key in pairs for key in parser.keys)
assert parser.source == (ROOT/'tests/baseline.py').read_text()
scope = {}
exec(compile(parser.source, 'visible-baseline', 'exec'), scope)
for board, hand, expected in [('RRBBRR','B',1), ('RBBR','RB',2), ('G','GG',2), ('RR','B',-1), ('WRRBBW','RB',-1)]:
    assert scope['baseline'](board, hand) == expected
source = (ROOT/'solution.py').read_text()
mirror = (ROOT/'python-code.js').read_text()
assert json.loads(re.fullmatch(r'window\.PYTHON_SOURCE = (.*);\n', mirror)[1]) == source
capture = json.loads((ROOT/'provenance/official.json').read_text())
question = capture['response']['data']['question']
assert question['questionFrontendId'] == '488'
assert question['isPaidOnly'] is False and question['difficulty'] == 'Hard'
python = next(s for s in question['codeSnippets'] if s['langSlug'] == 'python3')
assert 'def findMinStep(self, board: str, hand: str) -> int:' in python['code']
assert capture['officialUrl'] == 'https://leetcode.com/problems/zuma-game/'
assert sum((ROOT.parent/'style.css').stat().st_size for _ in [0]) + (ROOT/'style.css').stat().st_size < 25000
result = {'status':'pass','translationKeys':len(pairs),'duplicateKeysChecked':True,'allPairsValid':True,'visibleBaselineExecuted':5,'exactSourceParity':True,'officialPythonSelector':python,'totalShippedCSSBytes':(ROOT.parent/'style.css').stat().st_size+(ROOT/'style.css').stat().st_size}
(OUT/'contract-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
