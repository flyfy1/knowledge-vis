"""Register an independently accepted candidate; the campaign owns acceptance."""
import argparse
import datetime as dt
import hashlib
import json
import re
import sys
from pathlib import Path
# The preflight CLI must not create __pycache__, even without python -B.
if __name__ == '__main__':
    sys.dont_write_bytecode = True

from leetcode_registry import merge_registry


JAVASCRIPT_PROBLEM_IDS = frozenset({2630, 2650, 2675, 2691, 2756, 2759})


# Canonical language, submission file, offline mirror, and its exported constant.
# Keep this small table aligned with real official interfaces encountered by authors.
LANGUAGE_FILES = {
    'Python': ('solution.py', 'python-code.js', 'PYTHON_SOURCE'),
    'TypeScript': ('solution.ts', 'typescript-code.js', 'TYPESCRIPT_SOURCE'),
    'JavaScript': ('solution.js', 'javascript-code.js', 'JAVASCRIPT_SOURCE'),
    'MySQL': ('solution.sql', 'sql-code.js', 'SQL_SOURCE'),
    'PostgreSQL': ('solution.sql', 'sql-code.js', 'SQL_SOURCE'),
    'MS SQL Server': ('solution.sql', 'sql-code.js', 'SQL_SOURCE'),
    'Oracle': ('solution.sql', 'sql-code.js', 'SQL_SOURCE'),
    'Bash': ('solution.sh', 'bash-code.js', 'BASH_SOURCE'),
    'Java': ('solution.java', 'java-code.js', 'JAVA_SOURCE'),
    'C++': ('solution.cpp', 'cpp-code.js', 'CPP_SOURCE'),
    'C': ('solution.c', 'c-code.js', 'C_SOURCE'),
    'C#': ('solution.cs', 'csharp-code.js', 'CSHARP_SOURCE'),
    'Go': ('solution.go', 'go-code.js', 'GO_SOURCE'),
    'Rust': ('solution.rs', 'rust-code.js', 'RUST_SOURCE'),
}


def solution_language(official, folder=None):
    """Resolve the faithful official interface; independent review verifies evidence."""
    javascript = 'javascript' in official.get('categories', [])
    if javascript != (official['id'] in JAVASCRIPT_PROBLEM_IDS):
        raise ValueError('JavaScript category differs from the six approved problem IDs; inspect catalog policy')
    path = Path(folder) / 'language-contract.json' if folder is not None else None
    if path is None or not path.exists():
        return 'JavaScript' if javascript else 'Python'
    contract = json.loads(path.read_text())
    if not isinstance(contract, dict) or contract.get('problemId') != official['id']:
        raise ValueError('Language contract problemId does not match the official problem')
    if contract.get('officialSource') != official['officialUrl']:
        raise ValueError('Language contract must cite this exact official problem URL')
    language, supported = contract.get('language'), contract.get('supportedLanguages')
    if not isinstance(language, str) or language not in LANGUAGE_FILES:
        raise ValueError('Unsupported canonical language; extend the reviewed file table for the actual official interface')
    if (not isinstance(supported, list) or not supported or
            any(not isinstance(item, str) or not item.strip() for item in supported) or
            len(set(supported)) != len(supported) or language not in supported):
        raise ValueError('Language contract needs unique supportedLanguages including its canonical language')
    if 'Python3' in supported or 'Python 3' in supported or 'python' in supported or 'typescript' in supported:
        raise ValueError('Normalize official language labels to Python and TypeScript in supportedLanguages')
    if javascript:
        if language != 'JavaScript':
            raise ValueError('The six explicitly approved JavaScript problems require original JavaScript plus a Python conceptual comparison')
    else:
        preferred = 'Python' if 'Python' in supported else 'TypeScript' if 'TypeScript' in supported else language
        if language != preferred:
            raise ValueError('Canonical language must prefer Python, then TypeScript, before a required native language')
    for field in ('interface', 'rationale', 'verifiedAt', 'verificationEvidence'):
        if not isinstance(contract.get(field), str) or not contract[field].strip():
            raise ValueError(f'Language contract requires {field}')
    try:
        verified = dt.datetime.fromisoformat(contract['verifiedAt'].replace('Z', '+00:00'))
        if verified.tzinfo is None:
            raise ValueError('Timezone required')
    except ValueError as error:
        raise ValueError('Language contract verifiedAt must be an ISO timestamp with timezone') from error
    evidence = Path(contract['verificationEvidence'])
    evidence_path = Path(folder) / evidence
    if (evidence.is_absolute() or not evidence_path.resolve().is_relative_to(Path(folder).resolve()) or
            not evidence_path.is_file() or not evidence_path.read_text().strip()):
        raise ValueError('Language contract verificationEvidence must name a nonempty lesson-local evidence file')
    return language


def validate_language_sources(official, folder):
    """Check exception evidence and exact offline source parity without executing code."""
    folder = Path(folder)
    language = solution_language(official, folder)
    contract = folder / 'language-contract.json'
    if language != 'Python' and not contract.is_file():
        raise ValueError('Non-Python official solutions require language-contract.json')
    if not contract.is_file():
        return language  # Existing reviewed Python lessons remain compatible.
    pairs = [LANGUAGE_FILES[language]]
    if official['id'] in JAVASCRIPT_PROBLEM_IDS:
        pairs.append(('concept.py', 'python-code.js', 'PYTHON_SOURCE'))
    for source, mirror, export in pairs:
        source_path, mirror_path = folder / source, folder / mirror
        if not source_path.is_file() or not mirror_path.is_file():
            raise ValueError(f'Canonical source pair is missing: {source}, {mirror}')
        match = re.fullmatch(r'\s*window\.' + export + r'\s*=\s*("(?:[^"\\]|\\.)*")\s*;?\s*', mirror_path.read_text())
        if not match or json.loads(match[1]) != source_path.read_bytes().decode('utf-8'):
            raise ValueError(f'Exact offline source parity failed: {source}, {mirror}')
    return language


def validate_metadata(root, problem_id):
    """Read and validate registration metadata/source contracts without writing files.

    Return a fresh entry with normalized registry titles and validated concepts.
    Raise ValueError for invalid metadata; never repair the authored file. Complexity
    is one nonempty string describing time and space (legacy cost strings remain valid).
    """
    root = Path(root)
    folder = root / 'leetcode' / str(problem_id)
    entry = json.loads((folder / 'lesson-entry.json').read_text())
    catalog = json.loads((root / 'leetcode/catalog/hard-problems.json').read_text())
    official = next((p for p in catalog['problems'] if p['id'] == problem_id), None)

    def require(condition, message):
        if not condition:
            raise ValueError(message)

    require(official is not None, 'Problem ID is missing from the official catalog')
    require(isinstance(entry, dict), 'lesson-entry.json must contain an object')
    require(type(entry.get('id')) is int and entry['id'] == problem_id, 'Metadata id differs from problem ID')
    require(entry.get('path') == f'{problem_id}/', 'Metadata path differs from problem ID')
    require(entry.get('leetcodeUrl') == official['officialUrl'], 'Metadata leetcodeUrl differs from official URL')
    require(entry.get('difficulty') == 'hard', 'Metadata difficulty must be hard')
    require(entry.get('language') == solution_language(official, folder), 'Metadata language differs from canonical language')
    validate_language_sources(official, folder)
    for field in ('title', 'desc'):
        require(isinstance(entry.get(field), dict) and all(
            isinstance(entry[field].get(lang), str) and entry[field][lang].strip()
            for lang in ('zh', 'en')), f'Metadata {field} requires nonempty zh/en strings')
    # The collection supplies the ID; preserve the reviewed lesson metadata file.
    for title in entry['title'].values():
        require(isinstance(title, str), 'Metadata title values must be strings')
        prefix = re.match(r'^#(\d+)\s*·\s*', title)
        require(prefix is None or int(prefix[1]) == problem_id, 'Title problem ID differs from metadata')
    entry['title'] = {lang: re.sub(r'^#\d+\s*·\s*', '', title)
                      for lang, title in entry['title'].items()}
    require(all(entry['title'][lang].strip() for lang in ('zh', 'en')), 'Metadata title must remain nonempty without its ID')
    require(isinstance(entry.get('complexity'), str) and entry['complexity'].strip(),
            'Metadata complexity must be one nonempty string covering time and space, not {time,space}')
    require(isinstance(entry.get('topics'), list) and entry['topics'], 'Metadata topics must be a nonempty list')
    for topic in entry['topics']:
        require(isinstance(topic, dict) and all(
            isinstance(topic.get(lang), str) and topic[lang].strip() for lang in ('zh', 'en')),
            'Metadata topics require nonempty zh/en strings')
    concepts = entry.get('concepts')
    require(isinstance(concepts, list) and concepts, 'At least one concept deep link is required')
    html = (folder / 'index.html').read_text()
    for concept in concepts:
        require(isinstance(concept, dict) and type(concept.get('step')) is int and concept['step'] >= 0,
                'Concept step must be a nonnegative integer')
        require(re.search(r'id=[\"\']step' + str(concept['step']) + r'[\"\']', html),
                'Concept step anchor is missing from index.html')
        require(all(isinstance(concept.get(k), str) and concept[k].strip() and
                    '\n' not in concept[k] and '|' not in concept[k] for k in ('name', 'description')),
                'Concept name/description must be nonempty single-line strings without pipes')
    return entry


def register(root, problem_id):
    root = Path(root)
    entry = validate_metadata(root, problem_id)
    concepts = entry.pop('concepts')
    lines = [f"| {c['name']} | `leetcode/{problem_id}/#step{c['step']}` | {c['description']} |"
             for c in concepts]
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


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('problem_id', type=int)
    parser.add_argument('--validate-only', action='store_true',
                        help='Validate metadata and source contracts without writing any files')
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args(argv)
    try:
        if args.validate_only:
            validate_metadata(args.root, args.problem_id)
        else:
            register(args.root, args.problem_id)
    except (ValueError, KeyError, OSError) as error:
        parser.exit(2, f'Metadata validation failed: {error}\n')
    return 0


if __name__ == '__main__':
    sys.exit(main())
