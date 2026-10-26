class Solution:
    def smallestSufficientTeam(self, req_skills: list[str], people: list[list[str]]) -> list[int]:
        bit = {skill: j for j, skill in enumerate(req_skills)}
        full = (1 << len(req_skills)) - 1
        dp = {0: []}
        for i, skills in enumerate(people):
            person = 0
            for skill in skills:
                person |= 1 << bit[skill]
            before = list(dp.items())
            for mask, team in before:
                merged = mask | person
                if merged not in dp or len(team) + 1 < len(dp[merged]):
                    dp[merged] = team + [i]
        return dp[full]
