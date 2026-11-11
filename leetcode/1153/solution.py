class Solution:
    def canConvert(self, str1: str, str2: str) -> bool:
        # Zero conversions are allowed: equal strings always work.
        if str1 == str2:
            return True
        # Every copy of a letter moves together, so each letter of str1
        # must have exactly one destination letter in str2.
        target = {}
        for a, b in zip(str1, str2):
            if a in target and target[a] != b:
                return False
            target[a] = b
        # Cycles such as a->b, b->a need a spare letter that is not in use.
        # If str2 already uses all 26 letters, no spare can ever exist.
        return len(set(str2)) < 26
