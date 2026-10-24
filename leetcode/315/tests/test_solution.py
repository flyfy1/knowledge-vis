from solution import Solution

def brute(nums):
    return [sum(y < x for y in nums[i+1:]) for i, x in enumerate(nums)]

def test_examples():
    s=Solution()
    for a in ([5,2,6,1],[-1],[-1,-1],[2,2],[1,3,2,4,1]):
        assert s.countSmaller(a)==brute(a)

def test_boundaries():
    s=Solution(); assert s.countSmaller([])==[]; assert s.countSmaller([10**4,-10**4])==[1,0]

def test_seeded():
    import random
    rng=random.Random(315)
    s=Solution()
    for n in range(1,25):
        for _ in range(20):
            a=[rng.randrange(-4,5) for _ in range(n)]
            assert s.countSmaller(a)==brute(a)
