# Author self-check corrections

These are author checks, not independent review findings or acceptance.
The first numerical run exposed a mistaken hardcoded expected result in a test:
three repeated increasing alphabets have longest nondecreasing subsequence length
28 (26 letters plus two additional equal letters across the wraps), not 30.
For length 78 the expected deletion count is therefore 50, not 48. The solution
returned 50. Corrected test expectation and reran exhaustive and seeded cases.
No runtime fix was needed for this test-expectation error.
