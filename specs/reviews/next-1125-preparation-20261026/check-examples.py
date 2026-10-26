"""Tiny subset oracle and bounded, deliberately incorrect transition probes."""
import itertools
import json
from pathlib import Path


def optimal_teams(required, people):
    """Enumerate actual person subsets; no skill-mask DP or tie preference."""
    assert 1 <= len(required) <= 16 and len(set(required)) == len(required)
    assert 1 <= len(people) <= 60
    needed = set(required)
    for skills in people:
        assert len(skills) == len(set(skills)) and set(skills) <= needed
    for size in range(len(people) + 1):
        teams = []
        for indices in itertools.combinations(range(len(people)), size):
            covered = set().union(*(set(people[i]) for i in indices))
            if covered >= needed:
                teams.append(list(indices))
        if teams:
            return teams
    raise AssertionError('Fixture violates the guaranteed-solution contract')


def accepted(team, people, required, minimum_size):
    return (len(team) == len(set(team)) == minimum_size
            and all(type(i) is int and 0 <= i < len(people) for i in team)
            and set().union(*(set(people[i]) for i in team)) >= set(required))


fixtures = [
    ('official_one', ['java', 'nodejs', 'reactjs'],
     [['java'], ['nodejs'], ['nodejs', 'reactjs']], [[0, 2]]),
    ('official_two', ['algorithms', 'math', 'java', 'reactjs', 'csharp', 'aws'],
     [['algorithms', 'math', 'java'], ['algorithms', 'math', 'reactjs'],
      ['java', 'csharp', 'aws'], ['reactjs', 'csharp'], ['csharp', 'math'],
      ['aws', 'java']], [[1, 2]]),
    ('empty_people_keep_original_indices', ['a', 'b'],
     [[], ['a'], [], ['b']], [[1, 3]]),
    ('multiple_single_person_optima', ['a', 'b'],
     [['a', 'b'], ['a'], ['a', 'b'], []], [[0], [2]]),
    ('multiple_two_person_optima', ['a', 'b'],
     [['a'], ['b'], ['a'], ['b']], [[0, 1], [0, 3], [1, 2], [2, 3]]),
    ('overlap_must_not_cancel', ['a', 'b', 'c'],
     [['a', 'b'], ['b', 'c']], [[0, 1]]),
    ('later_single_person_beats_earlier_pair', ['a', 'b'],
     [['a'], ['b'], ['a', 'b']], [[2]]),
    ('one_skill_with_empty_and_duplicate_people', ['a'],
     [[], ['a'], ['a']], [[1], [2]]),
]
results = []
for name, required, people, expected in fixtures:
    actual = optimal_teams(required, people)
    assert actual == expected, (name, actual, expected)
    for team in actual:
        assert accepted(team, people, required, len(actual[0]))
        assert accepted(list(reversed(team)), people, required, len(actual[0]))
    results.append({'name': name, 'reqSkills': required, 'people': people,
                    'allMinimumTeams': actual, 'minimumSize': len(actual[0])})

# Explicit semantic checks: no lexicographic requirement, no duplicate person.
assert accepted([2], [['a', 'b'], ['a'], ['a', 'b'], []], ['a', 'b'], 1)
assert not accepted([0, 0], [['a']], ['a'], 1)
assert not accepted([0, 1, 2], [['a'], ['b'], ['a', 'b']], ['a', 'b'], 1)

# Deliberately incorrect isolated transitions, not an existing lesson defect.
# Bit 0 is a, bit 1 is b, bit 2 is c. Overlap is retained by union.
left_mask, right_mask = 0b011, 0b110
assert left_mask | right_mask == 0b111
assert left_mask ^ right_mask == 0b101  # Incorrect coverage loses shared b.
assert left_mask | left_mask == left_mask  # Reusing a person adds no coverage.

# A mutable predecessor list used as the new team corrupts the old state.
states = {0: []}
aliased_team = states[0]
aliased_team.append(0)
states[1] = aliased_team
assert states[0] == [0] and states[0] is states[1]

# Filtering empty entries without carrying original indices changes the answer.
original_people = [[], ['a'], [], ['b']]
filtered_people = [skills for skills in original_people if skills]
compact_team = optimal_teams(['a', 'b'], filtered_people)[0]
assert compact_team == [0, 1]
assert not accepted(compact_team, original_people, ['a', 'b'], 2)

output = {
    'scope': 'Source/semantic preparation; not a candidate solver, lesson review or acceptance.',
    'fixtures': results,
    'diagnosticProbes': [
        {'name': 'xor_loses_overlap', 'inputMasks': [3, 6], 'correctUnion': 7, 'incorrectXor': 5},
        {'name': 'mutable_predecessor_alias', 'incorrectStatesAfterAppend': states,
         'expectedPriorEmptyTeam': []},
        {'name': 'compacted_indices', 'incorrectOriginalIndices': compact_team,
         'correctOriginalIndices': [1, 3]},
    ],
    'semanticChecks': {'reversedAnswersAccepted': True, 'nonLexicographicOptimumAccepted': True,
                       'duplicatePersonRejected': True, 'largerSufficientTeamRejected': True,
                       'samePersonCoverageIsIdempotent': True},
}
Path(__file__).with_name('example-checks.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(fixtures)} tiny fixtures, all optimal subsets, 5 semantic checks and 3 diagnostic probes passed')
