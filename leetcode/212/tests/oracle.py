"""Independent per-word search; no trie or shared terminal state."""
def baseline(board, words):
    rows, cols = len(board), len(board[0])
    def exists(word):
        def walk(r, c, i, used):
            if (r, c) in used or board[r][c] != word[i]:
                return False
            if i + 1 == len(word):
                return True
            seen = used | {(r, c)}
            return any(walk(nr, nc, i + 1, seen)
                       for nr, nc in ((r-1,c),(r+1,c),(r,c-1),(r,c+1))
                       if 0 <= nr < rows and 0 <= nc < cols)
        return any(walk(r, c, 0, set()) for r in range(rows) for c in range(cols))
    return sorted(word for word in words if exists(word))
