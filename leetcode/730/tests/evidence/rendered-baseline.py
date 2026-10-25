def oracle(s):
    found = set()
    for mask in range(1, 1 << len(s)):
        word = ''.join(s[k] for k in range(len(s)) if mask & (1 << k))
        if word == word[::-1]:
            found.add(word)
    return len(found)