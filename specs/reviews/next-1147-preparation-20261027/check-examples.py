"""Small exhaustive cut-set oracle; no production solver or performance claim."""
import itertools
import json
from functools import lru_cache
from pathlib import Path


def valid_partition(text, chunks):
    return bool(chunks) and all(chunks) and ''.join(chunks) == text and chunks == chunks[::-1]


@lru_cache(None)
def partition_oracle(text):
    """Try every subset of inter-character cuts, independent of outer matching."""
    if text == '':
        return 0, ((),), 1  # Internal remainder, not a valid original input.
    assert len(text) <= 9, 'Keep exhaustive preparation bounded'
    best = 0
    witnesses = []
    for cut_bits in range(1 << (len(text) - 1)):
        chunks = []
        start = 0
        for boundary in range(1, len(text)):
            if cut_bits & (1 << (boundary - 1)):
                chunks.append(text[start:boundary])
                start = boundary
        chunks.append(text[start:])
        if valid_partition(text, chunks):
            if len(chunks) > best:
                best, witnesses = len(chunks), [tuple(chunks)]
            elif len(chunks) == best:
                witnesses.append(tuple(chunks))
    return best, tuple(witnesses), 1 << (len(text) - 1)


hand_cases = [
    ('a', ['a']),
    ('aa', ['a', 'a']),
    ('aaaa', ['a', 'a', 'a', 'a']),
    ('abc', ['abc']),
    ('aba', ['a', 'b', 'a']),
    ('abba', ['a', 'b', 'b', 'a']),
    ('abca', ['a', 'bc', 'a']),
    ('abcab', ['ab', 'c', 'ab']),
    ('abcabc', ['abc', 'abc']),
    ('abcxabc', ['abc', 'x', 'abc']),
    ('volvo', ['vo', 'l', 'vo']),
    ('merchant', ['merchant']),
]
results = []
for text, expected_chunks in hand_cases:
    best, witnesses, examined = partition_oracle(text)
    assert valid_partition(text, expected_chunks)
    assert best == len(expected_chunks), (text, best, expected_chunks)
    results.append({'text': text, 'handWorkedChunks': expected_chunks,
                    'maximumChunks': best, 'allOptimalPartitions': witnesses,
                    'partitionsExamined': examined})

# Long official witnesses are checked for validity, not exhaustively maximized.
official_witnesses = [
    ('ghiabcdefhelloadamhelloabcdefghi',
     ['ghi', 'abcdef', 'hello', 'adam', 'hello', 'abcdef', 'ghi'], 7),
    ('merchant', ['merchant'], 1),
    ('antaprezatepzapreanta',
     ['a', 'nt', 'a', 'pre', 'za', 'tep', 'za', 'pre', 'a', 'nt', 'a'], 11),
]
for text, chunks, expected in official_witnesses:
    assert valid_partition(text, chunks) and len(chunks) == expected

# Finite evidence for the recurrence; the oracle itself never uses this rule.
checked_strings = 0
examined_partitions = 0
for length in range(1, 8):
    for letters in itertools.product('ab', repeat=length):
        text = ''.join(letters)
        best, witnesses, examined = partition_oracle(text)
        examined_partitions += examined
        matches = [size for size in range(1, length // 2 + 1)
                   if text[:size] == text[-size:]]
        if matches:
            shortest = matches[0]
            inner_best = partition_oracle(text[shortest:-shortest])[0]
            assert best == 2 + inner_best
            assert all(len(witness[0]) == shortest for witness in witnesses)
        else:
            assert best == 1
        checked_strings += 1

# Concrete contrast: a longer matching pair can sacrifice achievable chunk count.
assert valid_partition('aaaa', ['aa', 'aa'])
assert len(['aa', 'aa']) < partition_oracle('aaaa')[0]
assert not valid_partition('abca', ['a', '', 'bc', 'a'])

output = {
    'scope': 'Source/semantic preparation only; not a candidate implementation or lesson acceptance.',
    'handCases': results,
    'officialWitnesses': [{'text': text, 'chunks': chunks, 'officialExpectedCount': count,
                           'independentMaximumChecked': len(text) <= 9}
                          for text, chunks, count in official_witnesses],
    'finiteRecurrenceEvidence': {'alphabet': 'ab', 'lengths': [1, 7],
                                 'stringsChecked': checked_strings,
                                 'partitionsExamined': examined_partitions,
                                 'allOptimalOuterChunksShortest': True},
    'longerFirstMatchCounterexample': {'text': 'aaaa', 'longerChunks': ['aa', 'aa'],
                                      'maximumChunks': 4},
    'emptyChunksRejected': True,
}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(hand_cases)} hand cases; 3 official witnesses; {checked_strings} binary strings / {examined_partitions} partitions passed')
