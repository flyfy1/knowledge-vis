class Solution:
    def findIntegers(self, n: int) -> int:
        bits = n.bit_length()
        f = [1, 2]
        for k in range(2, bits + 1):
            f.append(f[k - 1] + f[k - 2])

        total = 0
        prev = 0
        for i in range(bits - 1, -1, -1):
            bit = (n >> i) & 1
            if bit == 1:
                total += f[i]
                if prev == 1:
                    return total
            prev = bit
        return total + 1
