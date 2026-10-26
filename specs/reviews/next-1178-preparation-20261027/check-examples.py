"""Direct letter-membership oracle; bounded semantic fixtures, not a solver."""
import itertools
import json
from pathlib import Path


def direct_oracle(words, puzzles):
    assert 1 <= len(words) <= 100000 and 1 <= len(puzzles) <= 10000
    assert all(4 <= len(word) <= 50 and all('a' <= c <= 'z' for c in word)
               for word in words)
    rows = []
    for puzzle in puzzles:
        assert len(puzzle) == len(set(puzzle)) == 7
        assert all('a' <= c <= 'z' for c in puzzle)
        valid_indices = [i for i, word in enumerate(words)
                         if puzzle[0] in word and all(letter in puzzle for letter in word)]
        rows.append({'puzzle': puzzle, 'requiredFirstLetter': puzzle[0],
                     'validWordIndices': valid_indices, 'answer': len(valid_indices)})
    return rows


fixtures = [
    ('official_one', ['aaaa', 'asas', 'able', 'ability', 'actt', 'actor', 'access'],
     ['aboveyz', 'abrodyz', 'abslute', 'absoryz', 'actresz', 'gaswxyz'], [1, 1, 3, 2, 4, 0]),
    ('official_two', ['apple', 'pleas', 'please'],
     ['aelwxyz', 'aelpxyz', 'aelpsxy', 'saelpxy', 'xaelpsy'], [0, 1, 3, 2, 0]),
    ('duplicate_words_and_equal_letter_sets', ['aaaa', 'aaaa', 'aaab', 'abba', 'baab', 'bbbb'],
     ['abcdefg', 'bacdefg'], [5, 4]),
    ('same_set_different_first_letter', ['aaaa', 'aaab'],
     ['abcdefg', 'agfedcb', 'bacdefg', 'abcdefg'], [2, 2, 1, 2]),
    ('word_length_not_distinct_letter_count', ['a' * 50, 'abcdefg' * 7, 'abcdefgh', 'zzzz'],
     ['abcdefg'], [2]),
    ('required_letter_can_appear_anywhere', ['baaa', 'bbbb', 'cbbb', 'cccc'],
     ['abcdefg', 'bacdefg', 'cabdefg'], [1, 3, 2]),
    ('unused_puzzle_letters_allowed', ['aaaa', 'aabb'], ['abcdefg'], [2]),
]
results = []
query_count = 0
for name, words, puzzles, expected in fixtures:
    rows = direct_oracle(words, puzzles)
    assert [row['answer'] for row in rows] == expected, (name, rows, expected)
    results.append({'name': name, 'words': words, 'queries': rows})
    query_count += len(puzzles)

# Independent set enumeration: mandatory a plus each subset of six other letters.
letter_sets = [frozenset(('a',) + subset) for size in range(7)
               for subset in itertools.combinations('bcdefg', size)]
assert len(letter_sets) == len(set(letter_sets)) == 64
assert frozenset('a') in letter_sets and frozenset('abcdefg') in letter_sets
words = []
for letters in letter_sets:
    ascending = ''.join(sorted(letters))
    descending = ascending[::-1]
    words.extend([ascending + 'a' * max(0, 4 - len(ascending)),
                  descending + 'a' * max(0, 4 - len(descending))])
words.append('abcdefgh')  # Eight distinct letters cannot fit any legal puzzle.
rows = direct_oracle(words, ['abcdefg', 'bacdefg', 'hbcdefg'])
assert [row['answer'] for row in rows] == [128, 64, 0]
assert len({frozenset(word) for word in words[:-1]}) == 64

output = {
    'scope': 'Official-source and bounded semantic preparation; no optimized implementation or lesson acceptance.',
    'handFixtures': results,
    'handFixtureCount': len(fixtures), 'handQueryCount': query_count,
    'subsetBijectionCheck': {'mandatoryLetter': 'a', 'optionalLetters': 'bcdefg',
                             'distinctSets': 64, 'wordEntries': words,
                             'queries': rows},
}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(fixtures)} hand fixtures / {query_count} puzzle queries; 64-set bijection / 129 word entries / 3 additional queries passed')
