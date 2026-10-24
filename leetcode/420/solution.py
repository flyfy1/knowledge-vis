class Solution:
    def strongPasswordChecker(self, password: str) -> int:
        n = len(password)
        missing = (int(not any('a' <= c <= 'z' for c in password))
                   + int(not any('A' <= c <= 'Z' for c in password))
                   + int(not any('0' <= c <= '9' for c in password)))
        replacements = mod0 = mod1 = 0
        i = 0
        while i < n:
            j = i + 1
            while j < n and password[j] == password[i]:
                j += 1
            length = j - i
            if length >= 3:
                replacements += length // 3
                mod0 += int(length % 3 == 0)
                mod1 += int(length % 3 == 1)
            i = j
        if n < 6:
            return max(6 - n, missing)
        if n <= 20:
            return max(missing, replacements)
        deletions = n - 20
        remaining = deletions
        use = min(remaining, mod0)
        replacements -= use
        remaining -= use
        use = min(remaining // 2, mod1)
        replacements -= use
        remaining -= 2 * use
        replacements -= min(remaining // 3, replacements)
        return deletions + max(missing, replacements)
