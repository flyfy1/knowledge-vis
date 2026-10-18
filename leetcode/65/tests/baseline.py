def digits(text):
    return bool(text) and all('0' <= c <= '9' for c in text)


def unsigned(text):
    return text[1:] if text[:1] in ('+', '-') else text


def baseline(s):
    parts = s.lower().split('e')
    if len(parts) > 2:
        return False
    if len(parts) == 2 and not digits(unsigned(parts[1])):
        return False
    mantissa = unsigned(parts[0])
    if '.' not in mantissa:
        return digits(mantissa)
    halves = mantissa.split('.')
    return (len(halves) == 2 and any(halves)
            and all(not h or digits(h) for h in halves))
