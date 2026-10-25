#!/usr/bin/env python3
"""Publish reviewed lessons in batches, retaining release receipts but no old bytes.

Call only while the campaign owns its checkout lock, at a clean saved HEAD. The
separate release ledger is locked here. A pending release is always replayed and
verified before another batch is selected. Verification failure leaves it pending.
"""
from __future__ import annotations

import argparse
import datetime as dt
import fcntl
import hashlib
import json
import io
import tarfile
import os
from pathlib import Path, PurePosixPath
from html.parser import HTMLParser
import re
import shutil
import subprocess
import tempfile
from urllib.parse import urljoin, urlsplit
import uuid

from leetcode_registry import read_registry
from leetcode_static_versions import (BUILDER_VERSION, EXCLUDED_PARTS, LANGUAGE_FILES, PROVENANCE_NAMES,
                                      SOURCE_SUFFIXES, codex_discovery, codex_registry, codex_runtime)


class PublicationError(RuntimeError):
    pass


WEIGHTS = (15, 20, 20, 20, 15, 10)
COLLECTION_ASSETS = {'leetcode/index.html', 'leetcode/problems.config.js',
                     'leetcode/collection.js', 'leetcode/collection.css'}


def _run(args, cwd=None, timeout=120):
    result = subprocess.run(args, cwd=cwd, capture_output=True, timeout=timeout)
    if result.returncode:
        raise PublicationError(f'{args[0]} failed: {result.stderr.decode(errors="replace")[-1200:]}')
    return result.stdout


def _git(repo, *args):
    return _run(['git', *args], cwd=repo).decode().strip()


def _sha(data):
    return hashlib.sha256(data).hexdigest()


def _save(path, data):
    temporary = path.with_suffix('.tmp')
    with temporary.open('w') as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
        handle.write('\n')
        handle.flush()
        os.fsync(handle.fileno())
    os.replace(temporary, path)
    descriptor = os.open(path.parent, os.O_RDONLY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def _safe(root, relative):
    part = PurePosixPath(relative)
    if part.is_absolute() or '..' in part.parts or '\\' in relative:
        raise PublicationError(f'Unsafe publication path: {relative}')
    target = root.joinpath(*part.parts)
    if not target.resolve().is_relative_to(root.resolve()):
        raise PublicationError(f'Publication path escapes root: {relative}')
    current = target
    while current != root:
        if current.is_symlink():
            raise PublicationError(f'Symlinks are not publishable: {relative}')
        current = current.parent
    return target


def _tracked_bytes(repo, revision, relative):
    mode = _git(repo, 'ls-tree', revision, '--', relative).split(' ', 1)[0]
    if mode != '100644' and mode != '100755':
        raise PublicationError(f'Expected a tracked regular file: {relative}')
    return _run(['git', 'show', f'{revision}:{relative}'], cwd=repo)


def _lesson(repo, revision, pid):
    prefix = f'leetcode/{pid}/'
    archive = _run(['git', 'archive', revision, '--', prefix], cwd=repo)
    files = {}
    with tarfile.open(fileobj=io.BytesIO(archive)) as contents:
        evidence_path = None
        try:
            contract_member = contents.getmember(prefix + 'language-contract.json')
        except KeyError:
            contract_member = None
        if contract_member is not None:
            if not contract_member.isfile():
                raise PublicationError('Language contract must be a regular file')
            contract = json.loads(contents.extractfile(contract_member).read())
            evidence = PurePosixPath(contract.get('verificationEvidence', ''))
            if evidence.is_absolute() or '..' in evidence.parts or '\\' in str(evidence):
                raise PublicationError('Language evidence must remain inside its lesson')
            evidence_path = prefix + str(evidence)
        for member in contents:
            if member.isdir():
                continue
            path = member.name
            tail = PurePosixPath(path[len(prefix):])
            if (path == evidence_path or set(tail.parts) & EXCLUDED_PARTS or tail.name in PROVENANCE_NAMES | {'lesson-entry.json', 'language-contract.json'} or
                    tail.suffix.lower() not in SOURCE_SUFFIXES):
                continue
            if not path.startswith(prefix) or not member.isfile():
                raise PublicationError(f'Expected a tracked regular lesson file: {path}')
            files[path] = contents.extractfile(member).read()
    if prefix + 'index.html' not in files or prefix + 'app.js' not in files:
        raise PublicationError(f'Lesson {pid} has no complete tracked runtime')
    return files


def _fingerprint(files, registry):
    return _sha(json.dumps({'files': {p: _sha(b) for p, b in sorted(files.items())},
                           'registry': registry}, sort_keys=True).encode())


def _registry_at(repo, revision, directory):
    path = directory / 'registry-input.js'
    path.write_bytes(_tracked_bytes(repo, revision, 'leetcode/problems.config.js'))
    return read_registry(path)


def _validate_registration(entry, pid, official):
    if (str(entry.get('id')) != pid or entry.get('path') != f'{pid}/' or
            entry.get('difficulty') != 'hard' or entry.get('leetcodeUrl') != official['officialUrl']):
        raise PublicationError(f'Invalid official registry identity for {pid}')
    for key in ('title', 'desc'):
        if any(not isinstance(entry.get(key, {}).get(lang), str) or not entry[key][lang].strip()
               for lang in ('zh', 'en')):
            raise PublicationError(f'Missing bilingual registry {key} for {pid}')


def _reviewed(repo, state, registry, revision, selected=None):
    catalog = json.loads(_tracked_bytes(repo, revision, 'leetcode/catalog/hard-problems.json'))
    official = {str(p['id']): p for p in catalog['problems']}
    runs = {run['id']: run for run in state.get('runs', [])}
    accepted = {}
    candidate_registries = {}
    for pid, entry in state.get('problems', {}).items():
        if entry.get('status') != 'accepted_local' or (selected is not None and pid not in selected):
            continue
        reviews = entry.get('reviews', [])
        if not reviews:
            raise PublicationError(f'Accepted lesson {pid} has no independent review')
        review = reviews[-1]
        scores = review.get('scores', [])
        score = sum(w * value / 4 for w, value in zip(WEIGHTS, scores)) if len(scores) == 6 else 0
        run_id = review.get('run_id')
        run = runs.get(run_id, {})
        if (review.get('outcome') != 'accepted' or len(scores) != 6 or
                any(type(v) is not int or not 3 <= v <= 4 for v in scores) or score < 85 or
                review.get('required_open') != [] or not review.get('evidence') or
                not run_id or run_id in entry.get('author_runs', []) or
                run.get('role') != 'review' or str(run.get('problem_id')) != pid or
                run.get('status') != 'completed' or not run.get('session_ids') or
                run.get('candidate') != review.get('candidate')):
            raise PublicationError(f'Lesson {pid} fails the independent review gate')
        candidate = review.get('candidate')
        if not candidate or candidate != entry.get('candidate'):
            raise PublicationError(f'Accepted candidate identity mismatch for {pid}')
        _git(repo, 'merge-base', '--is-ancestor', candidate, revision)
        author_sessions = {sid for rid in entry.get('author_runs', []) for sid in runs.get(rid, {}).get('session_ids', [])}
        if author_sessions.intersection(run['session_ids']):
            raise PublicationError(f'Reviewer reused author context for {pid}')
        report = review.get('report_path', '')
        if not report.startswith(f'specs/reviews/{pid}-') or not _tracked_bytes(repo, revision, report).strip():
            raise PublicationError(f'Accepted report missing for {pid}')
        review_commit = review.get('commit')
        if not review_commit:
            raise PublicationError(f'Review commit missing for {pid}')
        _git(repo, 'merge-base', '--is-ancestor', review_commit, revision)
        if _tracked_bytes(repo, review_commit, report) != _tracked_bytes(repo, revision, report):
            raise PublicationError(f'Review evidence changed after acceptance for {pid}')
        # Acceptance freezes the whole lesson, including evidence omitted from the
        # public payload. A narrower runtime filter must never weaken that audit.
        if _git(repo, 'rev-parse', f'{candidate}:leetcode/{pid}') != _git(repo, 'rev-parse', f'{revision}:leetcode/{pid}'):
            raise PublicationError(f'Lesson {pid} changed since its accepted candidate')
        reviewed = _lesson(repo, candidate, pid)
        current = _lesson(repo, revision, pid)
        if reviewed != current:
            raise PublicationError(f'Lesson {pid} changed since its accepted candidate')
        if pid not in official or pid not in registry:
            raise PublicationError(f'Accepted lesson {pid} is not officially registered')
        _validate_registration(registry[pid], pid, official[pid])
        metadata_path = f'leetcode/{pid}/lesson-entry.json'
        if _git(repo, 'ls-tree', candidate, '--', metadata_path):
            expected_row = json.loads(_tracked_bytes(repo, candidate, metadata_path))
            expected_row.pop('concepts', None)
            expected_row['title'] = {lang: re.sub(r'^#\d+\s*·\s*', '', title)
                                     for lang, title in expected_row['title'].items()}
        else:
            if candidate not in candidate_registries:
                with tempfile.TemporaryDirectory() as temporary:
                    rows = _registry_at(repo, candidate, Path(temporary))
                candidate_registries[candidate] = {str(row['id']): row for row in rows}
            expected_row = candidate_registries[candidate].get(pid)
        if registry[pid] != expected_row:
            raise PublicationError(f'Registry metadata changed since review for {pid}')
        accepted[pid] = {'candidate': candidate, 'digest': _fingerprint(current, registry[pid]),
                         'review': report, 'files': current, 'registry': registry[pid]}
    return accepted


def _asset_refs(data, relative):
    """Reject escaping paths; return same-site dependencies from HTML/CSS/JS imports."""
    suffix = PurePosixPath(relative).suffix
    if suffix not in {'.html', '.css', '.js'}:
        return []
    text = data.decode('utf-8')
    refs = []
    if suffix == '.html':
        class References(HTMLParser):
            def handle_starttag(self, tag, attrs):
                for key, value in attrs:
                    if value is None or key not in {'src', 'href'}:
                        continue
                    # HTML anchors are navigation, including generated redirects
                    # and cross-lesson index links; they are not shared assets.
                    if tag == 'a' and key == 'href' and PurePosixPath(urlsplit(value).path).suffix.lower() == '.html':
                        continue
                    refs.append(value)
        References().feed(text)
    if suffix == '.css':
        refs += re.findall(r'url\(\s*["\']?([^"\')]+)', text)
    if suffix == '.js':
        refs += re.findall(r'(?:from\s*|import\s*\(|import\s*)["\']([^"\']+)', text)
    result = []
    for reference in refs:
        parsed = urlsplit(reference)
        if parsed.scheme or parsed.netloc or not parsed.path or reference.startswith('#'):
            continue
        if '\\' in parsed.path or '%2e' in parsed.path.lower() or '%2f' in parsed.path.lower():
            raise PublicationError(f'Malformed asset reference in {relative}: {reference}')
        resolved = urlsplit(urljoin('https://local.invalid/' + relative, parsed.path)).path.lstrip('/')
        # Links to other lessons, anchors and site navigation are not runtime dependencies.
        if PurePosixPath(resolved).suffix.lower() in SOURCE_SUFFIXES:
            if not resolved.startswith('leetcode/'):
                raise PublicationError(f'Asset reference escapes LeetCode: {reference}')
            result.append(resolved)
    return result


BROWSER_CHECK = r'''
const {chromium} = require('playwright');
const input = JSON.parse(process.argv[1]);
(async () => {
 const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})});
 try {
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  let errors=[], ignored=[], localPending=new Map(), retiredRedirectDocuments=0;
  const ignoredCloudflareRum=new Set();
  const origin=new URL(input.base).origin;
  function isCloudflareRum(request) {
   const url=new URL(request.url());
   return url.origin===origin && url.pathname==='/cdn-cgi/rum' && request.method()==='POST' &&
          !request.isNavigationRequest() && ['xhr','fetch'].includes(request.resourceType());
  }
  page.on('request', r=>{if(isCloudflareRum(r)){ignoredCloudflareRum.add(r);return;} if(new URL(r.url()).origin===origin) localPending.set(r, {url:r.url(), method:r.method(), type:r.resourceType(), mainDocument:r.isNavigationRequest() && r.frame()===page.mainFrame(), startedAt:Date.now(), documentAtStart:page.url()});});
  page.on('response', r=>{const pending=localPending.get(r.request()); if(pending) pending.status=r.status();});
  page.on('requestfinished', r=>localPending.delete(r));
  page.on('requestfailed', r=>localPending.delete(r));
  async function settleLocal(verifiedRedirect) {
   const until=Date.now()+10000;
   while(localPending.size && Date.now()<until) {
    // Chromium can omit terminal events for an intermediate document replaced
    // by its client-side redirect. Retire only that HTTP200 main document after
    // the exact fixed destination, query and fragment have been verified.
    if(verifiedRedirect && page.url()===verifiedRedirect) {
     const target=new URL(verifiedRedirect),numeric=target.pathname.replace(/-codex\/$/,'/');
     if(target.origin===origin && /\/leetcode\/[1-9][0-9]*-codex\/$/.test(target.pathname)) {
      for(const [request,record] of localPending) {
       const source=new URL(record.url);
       if(record.mainDocument && record.type==='document' && record.status===200 &&
          source.origin===target.origin && source.search===target.search &&
          (source.pathname===numeric || source.pathname===numeric+'index.html')) {
        localPending.delete(request); retiredRedirectDocuments++;
       }
      }
     }
    }
    if(localPending.size) await page.waitForTimeout(50);
   }
   if(localPending.size) throw new Error('First-party resources did not finish at '+page.url()+': '+JSON.stringify([...localPending.values()].map(r=>({...r, elapsedMs:Date.now()-r.startedAt}))));
  }
  const knownBeacon='https://static.cloudflareinsights.com/beacon.min.js/vce701823e78c4301a35b7e07294d87301792088814092';
  page.on('pageerror', e => errors.push(String(e)));
  page.on('requestfailed', r => {if(isCloudflareRum(r)) ignoredCloudflareRum.add(r); else if(r.url()===knownBeacon) ignored.push(r.url()); else errors.push('Failed request: '+r.url());});
  page.on('response', r => {if(r.status()>=400){if(isCloudflareRum(r.request())) ignoredCloudflareRum.add(r.request()); else errors.push('HTTP '+r.status()+': '+r.url());}});
  await page.goto(input.base+'/leetcode/', {waitUntil:'domcontentloaded'});
  await page.locator('[data-problem-id]').first().waitFor({state:'visible'});
  await settleLocal();
  for (const item of input.entries) {
   const card=page.locator('[data-problem-id="'+item.id+'"]');
   if(await card.count()!==1) throw new Error('Missing collection card '+item.id);
   if(!await card.innerText().then(t=>t.includes('#'+item.id))) throw new Error('Missing collection ID '+item.id);
   if(await card.locator('a').evaluateAll((links,url)=>links.some(a=>a.href===url),item.leetcodeUrl)!==true) throw new Error('Missing official collection link '+item.id);
   const route=item.path || item.id+'/';
   if(route!==item.id+'/' && route!==item.id+'-codex/') throw new Error('Invalid published lesson route '+item.id);
   const target=input.base+'/leetcode/'+route;
   if(!await card.locator('a').evaluateAll((links,url)=>links.some(a=>a.href===url),target)) throw new Error('Missing published destination '+item.id);
  }
  for (const item of input.entries) {
   const route=item.path || item.id+'/';
   await page.goto(input.base+'/leetcode/'+route,{waitUntil:'domcontentloaded'});
   if(new URL(page.url()).pathname!==new URL(input.base+'/leetcode/'+route).pathname) throw new Error('Wrong actual lesson destination '+item.id);
   await page.locator('h1').waitFor({state:'visible'});
   await settleLocal();
   const texts=[], mainTexts=[];
   for(const lang of ['zh','en']) {
    const button=page.locator('[data-lang="'+lang+'"]');
    if(await button.count()!==1) throw new Error('Missing language switch '+item.id+': '+lang);
    await button.click();
    const heading=await page.locator('h1').innerText();
    if(!heading.includes(String(item.id))) throw new Error('Missing lesson ID '+item.id);
    texts.push(heading);
    if(!await page.locator('a').evaluateAll((links,url)=>links.some(a=>a.href===url),item.leetcodeUrl)) throw new Error('Missing official lesson link '+item.id);
    const mainText=await page.locator('main').innerText();
    if(mainText.trim().length<100) throw new Error('Empty lesson '+item.id);
    mainTexts.push(mainText);
   }
   // Reviewed localized names can legitimately be identical (for example IPO).
   if(texts[0]===texts[1] && item.title.zh!==item.title.en) throw new Error('Heading did not translate '+item.id);
   if(mainTexts[0]===mainTexts[1]) throw new Error('Lesson content did not translate '+item.id);
   if(route===item.id+'-codex/') {
    for(const suffix of ['', 'index.html']) {
     const state='?route-check=a%2Fb&value=%E4%B8%AD#step0';
     await page.goto(input.base+'/leetcode/'+item.id+'/'+suffix+state,{waitUntil:'domcontentloaded'});
     await page.waitForURL(input.base+'/leetcode/'+route+state,{waitUntil:'domcontentloaded'});
     await settleLocal(input.base+'/leetcode/'+route+state);
     if(page.url()!==input.base+'/leetcode/'+route+state) throw new Error('Legacy redirect lost URL state '+item.id);
    }
   }
  }
  if(errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({lessons:input.entries.length, ignoredKnownBeaconFailures:ignored.length, ignoredCloudflareRumRequests:ignoredCloudflareRum.size, retiredRedirectDocuments}));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
'''


def _verify_public(base, files, entries):
    for path, digest in files.items():
        url = base.rstrip('/') + '/' + path + '?release=' + digest[:16]
        content = _run(['curl', '--fail', '--silent', '--show-error', '--location',
                        '--max-time', '45', '-H', 'Cache-Control: no-cache', url])
        if _sha(content) != digest:
            raise PublicationError(f'Public bytes differ from staged release: {url}')
    browser = _run(['node', '-e', BROWSER_CHECK,
          json.dumps({'base': base.rstrip('/'), 'entries': entries})], timeout=max(120, 15 * len(entries)))
    return json.loads(browser.decode())


def _apply_pending(root, state_dir, ledger, ledger_path):
    pending = ledger['pending']
    if not re.fullmatch(r'release-stage-[0-9a-f]{32}', pending['stage']):
        raise PublicationError('Invalid pending stage identity')
    stage = _safe(state_dir, pending['stage'])
    # Index and registry are the discovery switch, after every lesson asset.
    def publish_order(path):
        if path == 'leetcode/index.html':
            return (3, path)
        if path in {'leetcode/problems.config.js', 'leetcode/problems.codex.config.js'}:
            return (2, path)
        # Historical pending releases keep their exact staged bytes and ordering.
        if pending.get('route_layout') == BUILDER_VERSION and re.fullmatch(r'leetcode/[1-9][0-9]*/index.html', path):
            return (1, path)
        return (0, path)
    paths = sorted(pending['files'], key=publish_order)
    payload = {}
    for relative in paths:
        payload[relative] = _safe(stage, relative).read_bytes()
        if _sha(payload[relative]) != pending['files'][relative]:
            raise PublicationError(f'Staged release changed: {relative}')
        _safe(root, relative)
    for relative in paths:
        data = payload[relative]
        destination = _safe(root, relative)
        destination.parent.mkdir(parents=True, exist_ok=True)
        for stale in destination.parent.glob('.publish-new-*'):
            if stale.is_file() or stale.is_symlink():
                stale.unlink()
        # This is a temporary copy of NEW bytes, never a copy of previous content.
        descriptor, name = tempfile.mkstemp(prefix='.publish-new-', dir=destination.parent)
        try:
            with os.fdopen(descriptor, 'wb') as handle:
                handle.write(data)
                handle.flush()
                os.fsync(handle.fileno())
            os.chmod(name, 0o644)
            os.replace(name, destination)
            directory_fd = os.open(destination.parent, os.O_RDONLY)
            try:
                os.fsync(directory_fd)
            finally:
                os.close(directory_fd)
        finally:
            if os.path.exists(name):
                os.unlink(name)
    pending['verification'] = _verify_public(ledger['public_base'], pending.get('public_files', pending['files']), pending['entries'])
    pending['published_at'] = dt.datetime.now(dt.timezone.utc).isoformat()
    for pid, receipt in pending['accepted'].items():
        ledger['released'][pid] = receipt
    ledger['releases'].append({key: value for key, value in pending.items() if key != 'stage'})
    ledger['registry_sha256'] = pending['files']['leetcode/problems.config.js']
    ledger['pending'] = None
    _save(ledger_path, ledger)
    shutil.rmtree(stage)
    return {'status': 'published', 'ids': list(pending['accepted']), 'revision': pending['revision']}


def maybe_publish(repo, state, state_dir, publish_root, public_base, batch_size=20,
                  flush=False, baseline_revision='8bfc3f4'):
    """Return waiting/published. Raise on failed gates; campaign state is untouched.

    First use verifies the production registry against baseline_revision. Only
    51/52 are seeded as accepted-and-released; the eleven historical lessons
    remain eligible after their own independent review. flush requires the full
    catalog to be accepted. Public verification is mandatory, including Chromium.
    """
    repo, state_dir, root = (Path(p).resolve() for p in (repo, state_dir, publish_root))
    if batch_size < 1 or state_dir.is_relative_to(repo) or root.is_relative_to(repo):
        raise PublicationError('Invalid batch size or publication/state directory inside checkout')
    if not root.is_dir() or not public_base.startswith(('http://', 'https://')):
        raise PublicationError('Publication root and public HTTP URL are required')
    revision = _git(repo, 'rev-parse', 'HEAD')
    if revision != state.get('expected_head') or _git(repo, 'status', '--porcelain', '--untracked-files=all'):
        raise PublicationError('Publication requires the clean saved campaign HEAD')
    state_dir.mkdir(parents=True, exist_ok=True)
    ledger_path = state_dir / 'releases.json'
    with (state_dir / 'release.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if ledger_path.exists():
            ledger = json.loads(ledger_path.read_text())
            if (ledger.get('version') != 1 or ledger.get('repo') != str(repo) or
                    ledger.get('publish_root') != str(root) or ledger.get('public_base') != public_base.rstrip('/')):
                raise PublicationError('Release ledger belongs to another publication target')
        else:
            with tempfile.TemporaryDirectory(dir=state_dir) as temporary:
                baseline = _registry_at(repo, baseline_revision, Path(temporary))
            actual = read_registry(_safe(root, 'leetcode/problems.config.js'))
            if actual != baseline:
                raise PublicationError('Production registry differs from the verified baseline; inspect before seeding')
            _git(repo, 'merge-base', '--is-ancestor', baseline_revision, revision)
            released = {}
            baseline_rows = {str(row['id']): row for row in baseline}
            for pid in ('51', '52'):
                files = _lesson(repo, baseline_revision, pid)
                baseline_public = (codex_runtime(pid, files)
                                   if _safe(root, f'leetcode/{pid}-codex/index.html').is_file() else files)
                if any(_safe(root, path).read_bytes() != data for path, data in baseline_public.items()):
                    raise PublicationError(f'Production lesson {pid} differs from baseline')
                released[pid] = {'candidate': baseline_revision, 'digest': _fingerprint(files, baseline_rows[pid]), 'baseline': True}
            ledger = {'version': 1, 'repo': str(repo), 'publish_root': str(root),
                      'public_base': public_base.rstrip('/'), 'baseline_revision': baseline_revision,
                      'released': released, 'releases': [], 'pending': None,
                      'registry_sha256': _sha(_safe(root, 'leetcode/problems.config.js').read_bytes())}
            _save(ledger_path, ledger)
        # A crash before recording a stage or after recording completion must not
        # turn staging bytes into an old-content archive. Never remove pending.
        keep_stage = (ledger.get('pending') or {}).get('stage')
        for stale in state_dir.glob('release-stage-*'):
            if stale.name != keep_stage and re.fullmatch(r'release-stage-[0-9a-f]{32}', stale.name):
                if stale.is_symlink():
                    raise PublicationError('Unexpected symlink in release staging')
                shutil.rmtree(stale)
        if ledger['pending']:
            return _apply_pending(root, state_dir, ledger, ledger_path)
        registry_list = read_registry(repo / 'leetcode/problems.config.js')
        registry = {str(entry['id']): entry for entry in registry_list}
        prospective = {pid for pid, item in state.get('problems', {}).items()
                       if item.get('status') == 'accepted_local' and
                       ledger['released'].get(pid, {}).get('candidate') != item.get('candidate')}
        # Validate newly observed acceptances only. Previous receipts remain bound
        # to their immutable Git candidate; this avoids quadratic Git scans.
        accepted = _reviewed(repo, state, registry, revision, prospective)
        refreshed = False
        for pid, item in accepted.items():
            if ledger['released'].get(pid, {}).get('digest') == item['digest']:
                ledger['released'][pid]['candidate'] = item['candidate']
                refreshed = True
        if refreshed:
            _save(ledger_path, ledger)
        eligible = [pid for pid in state.get('queue', []) if pid in accepted and
                    ledger['released'].get(pid, {}).get('digest') != accepted[pid]['digest']]
        if len(set(eligible)) != len(eligible):
            raise PublicationError('Duplicate IDs in publication queue')
        if flush:
            catalog = json.loads(_tracked_bytes(repo, revision, 'leetcode/catalog/hard-problems.json'))
            if {pid for pid, item in state.get('problems', {}).items() if item.get('status') == 'accepted_local'} != {str(p['id']) for p in catalog['problems']}:
                raise PublicationError('Final remainder cannot publish until every catalog lesson is accepted')
        if len(eligible) < batch_size and not (flush and eligible):
            return {'status': 'waiting', 'accepted_unreleased': len(eligible), 'batch_size': batch_size}
        selected = eligible[:batch_size]
        if _sha(_safe(root, 'leetcode/problems.config.js').read_bytes()) != ledger['registry_sha256']:
            raise PublicationError('Production registry changed outside the release ledger')
        current_registry = read_registry(_safe(root, 'leetcode/problems.config.js'))
        merged = {str(entry['id']): entry for entry in current_registry}
        public_selected = codex_registry([accepted[pid]['registry'] for pid in selected])
        merged.update({pid: accepted[pid]['registry'] for pid in selected})
        entries = [merged[pid] for pid in sorted(merged, key=int)]
        registry_bytes = ('/* Registered lessons, sorted by official frontend ID. */\nwindow.LEETCODE_PROBLEMS = ' +
                          json.dumps(entries, ensure_ascii=False, indent=2) + ';\n').encode()
        public_entries = codex_registry(entries)
        for row in public_entries:
            if str(row['id']) not in selected and not _safe(root, 'leetcode/' + row['path'] + 'index.html').is_file():
                raise PublicationError(f"Static route migration must precede publication: {row['path']}")
        codex_registry_bytes = ('/* Static Codex lesson destinations. */\nwindow.LEETCODE_PROBLEMS = ' +
                                json.dumps(public_entries, ensure_ascii=False, indent=2) + ';\n').encode()
        files = {path: data for pid in selected
                 for path, data in codex_runtime(pid, accepted[pid]['files']).items()}
        files['leetcode/problems.config.js'] = registry_bytes
        files['leetcode/problems.codex.config.js'] = codex_registry_bytes
        source_index = _tracked_bytes(repo, revision, 'leetcode/index.html').decode()
        if not re.search(r'problems\.config\.js\?v=[^"\']+', source_index):
            raise PublicationError('Collection registry must have an explicit cache version')
        files['leetcode/index.html'] = re.sub(r'problems\.codex\.config\.js\?v=[^"\']+',
                    'problems.codex.config.js?v=' + _sha(codex_registry_bytes)[:12],
                    codex_discovery(source_index.encode()).decode()).encode()
        # New reviewed collection assets are allowed; shared legacy assets must
        # already match production so a lesson batch cannot mutate their contract.
        for asset in ('leetcode/collection.js', 'leetcode/collection.css'):
            if _git(repo, 'ls-tree', revision, '--', asset):
                files[asset] = _tracked_bytes(repo, revision, asset)
        shared_hashes = {}
        for path, data in list(files.items()):
            for dependency in _asset_refs(data, path):
                if dependency in files:
                    continue
                dependency_path = PurePosixPath(dependency)
                if (dependency_path.name in PROVENANCE_NAMES or
                        set(dependency_path.parts) & EXCLUDED_PARTS or
                        any(dependency.startswith(prefix) for pid in selected
                            for prefix in (f'leetcode/{pid}/', f'leetcode/{pid}-codex/'))):
                    raise PublicationError(f'Runtime dependency references excluded evidence or authoring metadata: {dependency}')
                source_dependency = re.sub(r'^leetcode/([1-9][0-9]*)-codex/', r'leetcode/\1/', dependency)
                source = _tracked_bytes(repo, revision, source_dependency)
                if _safe(root, dependency).read_bytes() != source:
                    raise PublicationError(f'Unreviewed shared asset differs in production: {dependency}')
                shared_hashes[dependency] = _sha(source)
        release_id = uuid.uuid4().hex
        stage = state_dir / ('release-stage-' + release_id)
        stage.mkdir()
        for path, data in files.items():
            target = _safe(stage, path)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('wb') as handle:
                handle.write(data)
                handle.flush()
                os.fsync(handle.fileno())
        for directory in [stage, *(path for path in stage.rglob('*') if path.is_dir())]:
            descriptor = os.open(directory, os.O_RDONLY)
            try:
                os.fsync(descriptor)
            finally:
                os.close(descriptor)
        ledger['pending'] = {'id': release_id, 'revision': revision, 'stage': stage.name,
                             'files': {path: _sha(data) for path, data in files.items()},
                             'public_files': {**shared_hashes, **{path: _sha(data) for path, data in files.items()}},
                             'entries': public_selected, 'route_layout': BUILDER_VERSION,
                             'accepted': {pid: {key: accepted[pid][key] for key in ('candidate', 'digest', 'review')}
                                          for pid in selected}}
        _save(ledger_path, ledger)
        return _apply_pending(root, state_dir, ledger, ledger_path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('repo', 'state-dir', 'publish-root'):
        parser.add_argument('--' + name, type=Path, required=True)
    parser.add_argument('--public-base', required=True)
    parser.add_argument('--batch-size', type=int, default=20)
    parser.add_argument('--baseline-revision', default='8bfc3f4')
    parser.add_argument('--flush', action='store_true')
    args = parser.parse_args()
    repo = args.repo.resolve()
    lock_path = Path(_git(repo, 'rev-parse', '--git-path', 'leetcode-campaign.lock'))
    if not lock_path.is_absolute():
        lock_path = repo / lock_path
    args.state_dir.mkdir(parents=True, exist_ok=True)
    with lock_path.open('a') as checkout_lock, (args.state_dir / 'runner.lock').open('a') as runner_lock:
        fcntl.flock(checkout_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        fcntl.flock(runner_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        state = json.loads((args.state_dir / 'progress.json').read_text())
        print(json.dumps(maybe_publish(repo, state, args.state_dir, args.publish_root,
                                      args.public_base, args.batch_size, args.flush, args.baseline_revision)))


if __name__ == '__main__':
    main()
