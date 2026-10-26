def baseline(nums):
    from math import gcd
    n = len(nums)
    adj = [[] for _ in nums]
    for i in range(n):
        for j in range(i):
            if gcd(nums[i], nums[j]) > 1:
                adj[i].append(j)
                adj[j].append(i)
    seen = set()
    answer = 0
    for start in range(n):
        if start in seen:
            continue
        seen.add(start)
        stack = [start]
        count = 0
        while stack:
            i = stack.pop()
            count += 1
            for j in adj[i]:
                if j not in seen:
                    seen.add(j)
                    stack.append(j)
        answer = max(answer, count)
    return answer
