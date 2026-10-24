class Solution:
    def numberToWords(self, num: int) -> str:
        below_20 = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
        tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]
        scales = ["", "Thousand", "Million", "Billion"]

        def under_1000(value: int) -> str:
            parts = []
            if value >= 100:
                parts += [below_20[value // 100], "Hundred"]
                value %= 100
            if value >= 20:
                parts.append(tens[value // 10])
                value %= 10
            if value:
                parts.append(below_20[value])
            return " ".join(parts)

        if num == 0:
            return "Zero"
        groups = []
        scale = 0
        while num:
            chunk = num % 1000
            if chunk:
                words = under_1000(chunk)
                if scales[scale]:
                    words += " " + scales[scale]
                groups.append(words)
            num //= 1000
            scale += 1
        return " ".join(reversed(groups))
