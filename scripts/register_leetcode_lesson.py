"""Register an independently accepted candidate; the campaign owns acceptance."""
import hashlib
import json
import re
import sys
from pathlib import Path
from leetcode_registry import merge_registry


JAVASCRIPT_PROBLEM_IDS = frozenset({2630, 2650, 2675, 2691, 2756, 2759})


def solution_language(official):
    """Keep the approved native-language exception tied to the verified catalog."""
    javascript = 'javascript' in official.get('categories', [])
    if javascript != (official['id'] in JAVASCRIPT_PROBLEM_IDS):
        raise ValueError('JavaScript category differs from the six approved problem IDs; inspect catalog policy')
    return 'JavaScript' if javascript else 'Python'


def register(root, problem_id):
    root = Path(root)
    folder = root / 'leetcode' / str(problem_id)
    entry = json.loads((folder / 'lesson-entry.json').read_text())
    catalog = json.loads((root/'leetcode/catalog/hard-problems.json').read_text())
    official = next(p for p in catalog['problems'] if p['id'] == problem_id)
    assert entry['id'] == problem_id
    assert entry['path'] == f'{problem_id}/'
    assert entry['leetcodeUrl'] == official['officialUrl']
    assert entry['difficulty'] == 'hard' and entry['language'] == solution_language(official)
    for field in ('title','desc'):
        assert all(isinstance(entry[field][lang],str) and entry[field][lang].strip() for lang in ('zh','en'))
    # The collection supplies the ID; preserve the reviewed lesson metadata file.
    for title in entry['title'].values():
        prefix = re.match(r'^#(\d+)\s*·\s*', title)
        assert prefix is None or int(prefix[1]) == problem_id, 'Title problem ID differs from metadata'
    entry['title'] = {lang: re.sub(r'^#\d+\s*·\s*', '', title)
                      for lang, title in entry['title'].items()}
    assert all(entry['title'][lang].strip() for lang in ('zh', 'en'))
    assert entry['topics'] and entry['complexity'].strip()
    for topic in entry['topics']:
        assert all(isinstance(topic[lang],str) and topic[lang].strip() for lang in ('zh','en'))
    concepts = entry.pop('concepts')
    assert concepts, 'At least one concept deep link is required'
    html = (folder/'index.html').read_text()
    lines=[]
    for c in concepts:
        assert isinstance(c['step'],int) and c['step'] >= 0
        assert re.search(r'id=[\"\']step'+str(c['step'])+r'[\"\']',html)
        assert all(isinstance(c[k],str) and c[k].strip() and '\n' not in c[k] and '|' not in c[k] for k in ('name','description'))
        lines.append(f"| {c['name']} | `leetcode/{problem_id}/#step{c['step']}` | {c['description']} |")
    concept_path = root/'CONCEPT-MAP.md'
    concept_text = concept_path.read_text()
    marker = f'<!-- leetcode-{problem_id}-campaign -->'
    end = f'<!-- /leetcode-{problem_id}-campaign -->'
    block = marker+'\n\n| Concept | Deep link | What the step teaches |\n| --- | --- | --- |\n'+'\n'.join(lines)+'\n\n'+end
    if marker in concept_text:
        concept_text = re.sub(re.escape(marker)+r'.*?'+re.escape(end),lambda _:block,concept_text,flags=re.S)
    else:
        concept_text += '\n\n'+block+'\n'
    registry = root/'leetcode/problems.config.js'
    merge_registry(registry,[entry])
    concept_path.write_text(concept_text)
    version=hashlib.sha256(registry.read_bytes()).hexdigest()[:12]
    index=root/'leetcode/index.html'
    index.write_text(re.sub(r'problems\.config\.js\?v=[^\"\']+', 'problems.config.js?v='+version,index.read_text()))


if __name__ == '__main__':
    register(Path(__file__).resolve().parents[1], int(sys.argv[1]))
