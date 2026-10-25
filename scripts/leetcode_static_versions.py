"""Pure static Codex route builder; source acceptance and deployment stay external.

Callers establish Codex provenance and supply only the reviewed runtime mapping
(e.g. publisher._lesson). This module does not discover directories or infer an
artifact's author. Numeric source trees and registry objects are never mutated.
"""
from copy import deepcopy
from pathlib import Path, PurePosixPath
import re

from register_leetcode_lesson import LANGUAGE_FILES

BUILDER_VERSION = 'codex-static-v1'
SOURCE_SUFFIXES = {'.html', '.js', '.css', '.py', '.ts', '.json', '.svg', '.png',
                   '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.woff', '.woff2'}
SOURCE_SUFFIXES.update(Path(files[0]).suffix for files in LANGUAGE_FILES.values())
EXCLUDED_PARTS = {'tests', 'test', 'evidence', 'provenance', 'screenshots', '__pycache__', 'node_modules'}
PROVENANCE_NAMES = {'official-evidence.json', 'official-interface.json',
                    'official-contract.json', 'official-graphql.json', 'official.json'}


def _problem_id(value):
    if isinstance(value, bool) or not isinstance(value, (str, int)) or not re.fullmatch(r'[1-9][0-9]*', str(value)):
        raise ValueError('A canonical positive numeric problem ID is required')
    return str(value)


def _redirect(pid):
    # No dynamic destination, base tag or meta refresh: preserve URL state and
    # replace the legacy history entry. The static fallback also works via file:.
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LeetCode #{pid}</title>
<script>
location.replace("../{pid}-codex/" + (location.protocol === "file:" ? "index.html" : "") + location.search + location.hash);
</script>
</head>
<body><main>
<h1>LeetCode #{pid}</h1>
<p><a href="../{pid}-codex/index.html"><span lang="zh-CN">打开题目讲解</span> / Open the lesson</a></p>
<noscript><p><span lang="zh-CN">自动跳转需要 JavaScript。使用上方链接打开讲解；查询参数和页面位置不会自动保留。</span><br>Automatic navigation needs JavaScript. Use the link above; query parameters and the page fragment are not retained automatically.</p></noscript>
</main></body>
</html>
'''.encode('utf-8')


def codex_runtime(pid, files):
    """Return real version files plus compatible numeric assets and redirect.

    files maps exact ``leetcode/<id>/<runtime-name>`` paths to bytes. The caller
    must already remove contract-declared evidence with nonstandard filenames;
    reserved evidence paths, unsafe paths and unexpected file kinds are rejected
    here. Output bytes in the version directory are identical to the inputs.
    """
    pid = _problem_id(pid)
    if not isinstance(files, dict):
        raise ValueError('Runtime files must be a path-to-bytes dictionary')
    prefix, version = f'leetcode/{pid}/', f'leetcode/{pid}-codex/'
    result, seen = {}, set()
    for path, data in files.items():
        if not isinstance(path, str) or not path.startswith(prefix) or not isinstance(data, bytes):
            raise ValueError('Runtime files must be numeric lesson paths containing bytes')
        tail = path[len(prefix):]
        parsed = PurePosixPath(tail)
        if (not tail or parsed.is_absolute() or parsed.as_posix() != tail or
                any(part in {'.', '..'} for part in tail.split('/')) or
                any(char in path for char in ('\\', '?', '#', '%')) or
                any(ord(char) < 32 for char in path) or path.casefold() in seen):
            raise ValueError(f'Unsafe or colliding runtime path: {path}')
        if (set(parsed.parts) & EXCLUDED_PARTS or parsed.name in PROVENANCE_NAMES |
                {'lesson-entry.json', 'language-contract.json'} or parsed.suffix.lower() not in SOURCE_SUFFIXES):
            raise ValueError(f'Not a runtime asset: {path}')
        seen.add(path.casefold())
        result[path] = data
        result[version + tail] = data
    if prefix + 'index.html' not in files or prefix + 'app.js' not in files:
        raise ValueError('A complete lesson index.html and app.js are required')
    result[prefix + 'index.html'] = _redirect(pid)
    return result


def codex_registry(entries):
    """Deep-copy ready Codex rows, changing only their exact route for that ID."""
    if not isinstance(entries, list):
        raise ValueError('Registry entries must be a list')
    result, seen = deepcopy(entries), set()
    for entry in result:
        if not isinstance(entry, dict):
            raise ValueError('Registry rows must be objects')
        pid = _problem_id(entry.get('id'))
        if pid in seen or entry.get('path') not in (f'{pid}/', f'{pid}-codex/'):
            raise ValueError(f'Duplicate or mismatched registry route for {pid}')
        seen.add(pid)
        entry['path'] = f'{pid}-codex/'
    return result


def codex_discovery(data):
    """Retarget generated HTML to the version registry; source bytes stay intact."""
    if not isinstance(data, bytes):
        raise ValueError('Discovery input must be bytes')
    return re.sub(rb'(?<![\w.-])problems\.config\.js(?![\w.-])', b'problems.codex.config.js', data)
