"""Tiny all-substrings oracle and explicit suffix-comparison witnesses."""
import itertools
import json
from pathlib import Path


def substring_oracle(text):
    assert 1 <= len(text) <= 8, 'Bound the independent exhaustive reference'
    substrings = [text[start:end] for start in range(len(text))
                  for end in range(start + 1, len(text) + 1)]
    return max(substrings), len(substrings)


def comparison_witness(text, i, j):
    """Compare two actual suffixes; this is not a candidate-selection algorithm."""
    assert 0 <= i < j < len(text)
    offset = 0
    equal_positions = []
    while j + offset < len(text) and text[i + offset] == text[j + offset]:
        equal_positions.append([i + offset, j + offset, text[i + offset]])
        offset += 1
    result = {'text': text, 'i': i, 'j': j, 'equalPositions': equal_positions,
              'equalPrefixLength': offset}
    if j + offset == len(text):
        assert text[j:] < text[i:]
        result.update({'reason': 'later suffix is a proper prefix', 'winnerStart': i})
        return result
    a, b = text[i + offset], text[j + offset]
    loser, winner = (i, j) if a < b else (j, i)
    witnesses = []
    for shift in range(offset + 1):
        losing_start, winning_start = loser + shift, winner + shift
        assert text[losing_start:] < text[winning_start:]
        witnesses.append({'losingStart': losing_start, 'winningStart': winning_start,
                          'remainingEqualPrefixLength': offset - shift,
                          'losingMismatchIndex': loser + offset,
                          'winningMismatchIndex': winner + offset})
    result.update({'mismatch': {'indices': [i + offset, j + offset], 'characters': [a, b]},
                   'winnerStart': winner, 'shiftedDominanceWitnesses': witnesses})
    return result


hand_cases = [
    ('abab', 'bab'),
    ('leetcode', 'tcode'),
    ('a', 'a'),
    ('aaaa', 'aaaa'),
    ('az', 'z'),
    ('zab', 'zab'),
    ('banana', 'nana'),
    ('ababa', 'baba'),
    ('zzazzz', 'zzz'),
    ('aaaaab', 'b'),
    ('ababac', 'c'),
    ('bba', 'bba'),
]
results = []
for text, expected in hand_cases:
    actual, examined = substring_oracle(text)
    assert actual == expected
    suffixes = [text[start:] for start in range(len(text))]
    assert max(suffixes) == actual
    results.append({'text': text, 'expected': expected, 'winningStart': suffixes.index(actual),
                    'suffixes': suffixes, 'substringsExamined': examined})

strings_checked = substrings_checked = comparisons_checked = shifted_checks = 0
for length in range(1, 7):
    for letters in itertools.product('abc', repeat=length):
        text = ''.join(letters)
        best, examined = substring_oracle(text)
        assert best == max(text[start:] for start in range(length))
        for start in range(length):
            for end in range(start + 1, length):
                assert text[start:end] < text[start:]  # Proper prefix vs extension.
        for i in range(length):
            for j in range(i + 1, length):
                witness = comparison_witness(text, i, j)
                comparisons_checked += 1
                shifted_checks += len(witness.get('shiftedDominanceWitnesses', []))
        strings_checked += 1
        substrings_checked += examined

traces = [comparison_witness(text, i, j) for text, i, j in [
    ('aaaaab', 0, 1), ('ababac', 0, 2), ('zzazzz', 0, 3), ('aaaa', 0, 1),
]]
output = {
    'scope': 'Source/semantic evidence only; no production suffix-selection algorithm or lesson acceptance.',
    'handCases': results,
    'finiteEvidence': {'alphabet': 'abc', 'lengths': [1, 6], 'strings': strings_checked,
                       'substrings': substrings_checked, 'suffixComparisons': comparisons_checked,
                       'shiftedDominanceChecks': shifted_checks},
    'explicitComparisonTraces': traces,
}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(hand_cases)} hand cases; {strings_checked} strings / {substrings_checked} substrings; {comparisons_checked} suffix comparisons / {shifted_checks} shifted checks passed')
