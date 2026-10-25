class Solution:
    def findMinMoves(self, machines: list[int]) -> int:
        total = sum(machines)
        n = len(machines)
        if total % n:
            return -1
        target = total // n
        balance = 0
        answer = 0
        for count in machines:
            surplus = count - target
            balance += surplus
            answer = max(answer, abs(balance), surplus)
        return answer
